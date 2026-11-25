---
layout: post
lang_code: pt-br
locale: pt_BR
ref: ccmux-tmux-manager-for-ai-coding-agents
date: 2026-06-05 00:00:00 -0700
last_modified_at: 2026-11-25 00:00
permalink: /pt-br/ccmux-tmux-manager-for-ai-coding-agents
title: "ccmux: Gerenciando agentes de programação de IA entre dispositivos"
imgpath: /assets/img/ccmux
previewurl: /preview.png
description: "Criando o ccmux com amigos para gerenciar agentes de programação de IA entre máquinas usando tmux, Tailscale, Mosh, um painel de terminal em Go e um app nativo para iOS."
image: /assets/img/ccmux/preview.png
image_width: 1200
image_height: 630
image_alt: "Painel do ccmux para gerenciar sessões de agentes de programação"
mathjax: false
tags: [ai-tools, systems]
---

{% include description.html content="Um gerenciador de sessões tmux que criei com amigos para acompanhar agentes de programação em várias máquinas e usá-los pelo celular." %}

Normalmente eu tenho cerca de dez agentes de programação rodando ao mesmo tempo entre meu Mac mini e meu notebook. Manter as sessões ativas em segundo plano com o tmux é simples o bastante, então o incômodo de verdade é acompanhar todas elas — lembrar em qual máquina iniciei uma tarefa, conectar por SSH para checar se o Claude ainda está trabalhando ou se ficou preso em uma pergunta de sim/não há uma hora, e não ter uma boa maneira de responder quando estou longe da mesa.

O que eu queria era iniciar uma sessão no Mac mini, sair da frente do computador, receber uma notificação no celular quando o agente precisasse de resposta, responder por lá mesmo e depois retomar a mesma sessão no notebook sem precisar digitar um monte de comandos de SSH e tmux no meio do caminho.

Então, junto com Daniel Mandragona e Mike Choi, construí o [ccmux](https://ccmux.ai/), um gerenciador de sessões tmux multidispositivo para agentes de programação de IA. Abaixo, explico como ele funciona, como as peças se encaixam e o que construímos para celular.

<div style="text-align:center">
  <video autoplay loop muted playsinline disableRemotePlayback preload="metadata" width="1280" height="640" poster="/assets/video/ccmux/hero-poster.webp" style="width:100%;height:auto">
    <source src="/assets/video/ccmux/hero.mp4" type="video/mp4">
    Interface de terminal do ccmux mostrando sessões de agentes de programação em diferentes projetos
  </video>
</div>
{% include caption.html content="Um tour rápido pelo ccmux, com cinco sessões de agentes rodando em quatro projetos." %}

## O painel

Quando você abre o `ccmux`, vê uma lista unificada de todas as sessões de agentes de programação rodando em suas máquinas, identificadas por cores de acordo com o que cada agente está fazendo — ativo (gerando saída), ocioso ou aguardando sua resposta. Do lado direito, há um painel de Dispositivos (_Devices_) listando as outras máquinas da sua rede, junto com um painel de uso que acompanha a cota de 5 horas do Claude para você ver quando está chegando perto do limite.

<div style="text-align:center">
  <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1280" height="640" poster="/assets/video/ccmux/dashboard-poster.webp" style="width:100%;height:auto">
    <source src="/assets/video/ccmux/dashboard.mp4" type="video/mp4">
    Painel do ccmux com status das sessões, dispositivos conectados e uso do Claude
  </video>
</div>
{% include caption.html content="O painel principal. As linhas de sessão são codificadas por cor conforme o estado, com dispositivos conectados e uso do Claude à direita." %}

Para entrar em qualquer sessão, basta selecioná-la e pressionar `Enter`, o que conecta você diretamente à sessão tmux do agente. Quando terminar, `Ctrl-b d` desconecta você e volta para o painel, enquanto o agente continua rodando na máquina onde foi iniciado.

<div style="text-align:center">
  <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1280" height="640" poster="/assets/video/ccmux/attach-detach-poster.webp" style="width:100%;height:auto">
    <source src="/assets/video/ccmux/attach-detach.mp4" type="video/mp4">
    Conectando a uma sessão tmux e retornando ao painel do ccmux
  </video>
</div>
{% include caption.html content="Pressionando Enter para conectar a uma sessão e depois Ctrl-b d para desconectar e voltar ao painel." %}

<div class="divider"></div>

## Como funciona por baixo dos panos

Queríamos que o tmux continuasse sendo a verdadeira fonte da verdade, em vez de prender as sessões dentro de um wrapper proprietário. Se você parar de usar o ccmux um dia, cada agente em execução continua sendo apenas uma sessão tmux normal à qual você pode se conectar manualmente.

Cada máquina executa dois binários em Go:

- `ccmux` é a interface de terminal com a qual você interage, construída com a stack Bubble Tea da [Charm](https://charm.sh/).
- `ccmuxd` é um pequeno daemon em segundo plano que consulta o tmux a cada poucos segundos, identifica em qual estado cada sessão está e expõe esse estado por meio de um socket Unix local e de uma API HTTP opcional.

A detecção de estado é uma das partes mais delicadas. Enquanto um agente está transmitindo saída ativamente, o daemon o marca como ativo. Assim que um prompt de entrada aparece e o painel fica silencioso por alguns segundos, o daemon muda a sessão para `needs_input`. Sempre que há sessões ativas, o `ccmuxd` também mantém um bloqueio via `caffeinate` no macOS (ou `systemd-inhibit` no Linux) para que um Mac mini ou notebook não entre em repouso no meio de uma tarefa longa — com uma opção de corte por nível de bateria em notebooks para que uma máquina esquecida não descarregue completamente.

Para descoberta entre múltiplas máquinas, usamos o [Tailscale](https://tailscale.com/). A cada atualização, o ccmux executa `tailscale status --json`, testa as máquinas acessíveis na porta `7474` (`/v1/health`) e junta automaticamente no painel todos os daemons que responderem. Assim, você não precisa manter uma lista manual de hosts nem expor portas para a internet pública. Como a camada WireGuard do Tailscale já cuida da criptografia e da identidade dos dispositivos, o daemon conversa em HTTP simples no IP da tailnet e rejeita requisições que tragam cabeçalhos de navegador como `Origin` ou `Sec-Fetch-*`, impedindo que páginas web aleatórias se comuniquem com ele.

Quando você pressiona `Enter` em uma sessão remota, o ccmux executa um `tmux attach` de verdade via SSH ou Mosh diretamente no host onde o agente está rodando, em vez de fazer proxy do terminal por outra camada. O Claude Code é o padrão, mas o ccmux também suporta Codex, Cursor, Antigravity, Gemini CLI e outros, salvando a escolha de agente por projeto e usando as flags de inicialização e retomada de cada ferramenta.

<div class="divider"></div>

## Usando pelo celular

Usar os agentes pelo celular foi o principal motivo que me levou a criar isso. O problema do SSH comum no celular é que a conexão cai o tempo todo — sempre que você alterna entre Wi-Fi e dados móveis, bloqueia a tela ou passa por um ponto sem sinal. O [Mosh](https://mosh.org/) lida muito melhor com isso porque sobrevive a trocas de rede e ao bloqueio de tela, retomando a sessão imediatamente assim que o sinal volta.

Quando o ccmux detecta um terminal estreito (com menos de 120 colunas), ele recolhe automaticamente o painel em uma única coluna rolável para que a mesma interface funcione bem na tela do celular:

<div style="text-align:center">
  <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="430" height="900" poster="/assets/video/ccmux/phone-poster.webp" style="max-height:420px;width:auto">
    <source src="/assets/video/ccmux/phone.mp4" type="video/mp4">
    Painel do ccmux em um terminal móvel estreito
  </video>
</div>
{% include caption.html content="A interface TUI adaptando-se para um layout na largura do celular sobre Mosh." %}

As notificações acabaram sendo bem simples de implementar. Sempre que uma sessão muda para `needs_input`, o daemon dispara o sinal sonoro padrão do terminal (`BEL`). Aplicativos de terminal para iOS que monitoram esse sinal transformam-no diretamente em uma notificação push, sem nenhum servidor intermediário na nuvem. No [Moshi](https://getmoshi.app/) — um cliente Mosh para iOS —, o ccmux também consegue conectar o `moshi-hook` aos hooks do Claude Code para enviar notificações categorizadas (como aprovação necessária vs. tarefa concluída) e permitir tocar diretamente na notificação para abrir a sessão.

![ccmux rodando no aplicativo de terminal Moshi em um iPhone]({{ "/moshi.webp" | prepend: page.imgpath }}){: width="610" height="1323" loading="lazy" decoding="async" style="max-height:520px;width:auto"}
{% include caption.html content="ccmux rodando dentro do Moshi em um iPhone." %}

Ainda assim, operar uma interface de terminal na tela do celular pode parecer apertado, especialmente quando você só quer dar uma olhada rápida nas sessões ou escrever um prompt mais longo. Por isso, também criamos um aplicativo nativo para iOS que conversa diretamente com o `ccmuxd` pelo Tailscale. Você pareia o celular rodando `ccmux pair` no Mac e escaneando o QR code no terminal. A partir daí, o aplicativo recebe o estado das sessões em tempo real via SSE e se conecta a painéis interativos do tmux por meio de uma ponte PTY via WebSocket renderizada com SwiftTerm.

<div style="text-align:center">
<img src="{{ "/ios-dashboard.webp" | prepend: page.imgpath }}" alt="Aplicativo iOS do ccmux listando sessões de agentes de programação" width="1206" height="2622" loading="lazy" decoding="async" style="display:inline-block;margin:0 6px;max-height:460px;width:auto" //>
<img src="{{ "/ios-terminal.webp" | prepend: page.imgpath }}" alt="Terminal tmux interativo no aplicativo iOS do ccmux" width="1206" height="2622" loading="lazy" decoding="async" style="display:inline-block;margin:0 6px;max-height:460px;width:auto" //>
</div>
{% include caption.html content="O aplicativo nativo para iOS: painel de sessões à esquerda, terminal ao vivo à direita." %}

Uma coisa que percebemos rápido no iOS é que a entrada de terminal e a escrita de prompts precisam de teclados completamente opostos. Controlar um terminal exige teclas brutas, setas direcionais e backspace rápido sem o corretor automático atrapalhando; já escrever um parágrafo de instruções para um agente sem corretor nem seleção de texto é bem sofrido. Por isso, adicionamos um botão na própria tela do terminal para alternar entre o modo Raw (cada tecla vai direto para o PTY) e o modo Chat (uma caixa de texto normal, no estilo iMessage, para redigir prompts).

<div style="text-align:center">
  <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="400" height="870" poster="/assets/video/ccmux/ios-mode-toggle-poster.webp" style="max-height:460px;width:auto">
    <source src="/assets/video/ccmux/ios-mode-toggle.mp4" type="video/mp4">
    Alternando entre os modos de entrada Raw e Chat no aplicativo iOS do ccmux
  </video>
</div>
{% include caption.html content="Alternando entre entrada direta de terminal (Raw) e modo Chat para redigir prompts." %}

<div class="divider"></div>

## Considerações finais

Usei o ccmux todos os dias por meses, e algumas outras pessoas também começaram a usá-lo. Durante esses mesmos meses, surgiram várias outras ferramentas para gerenciar agentes de programação, incluindo projetos financiados com equipes dedicadas em tempo integral. Como um projeto paralelo de três pessoas, não fazia muito sentido tentar competir com eles como produto, então decidimos não continuar investindo nele nessa direção. Mesmo assim, ainda mexo no repositório de vez em quando e quis escrever este post para documentar o que construímos.

Tudo continua no ar em [ccmux.ai](https://ccmux.ai/), e o código-fonte está no [GitHub](https://github.com/skzv/ccmux) sob a licença FSL-1.1-MIT. Se você quiser experimentar no macOS ou Linux, pode instalar e rodar o assistente de configuração com:

```bash
curl -fsSL https://raw.githubusercontent.com/skzv/ccmux/main/scripts/install.sh | sh
ccmux setup
```

A [documentação de configuração](https://ccmux.ai/docs/) explica como conectar múltiplas máquinas via Tailscale e configurar o acesso pelo celular.
