---
layout: post
lang_code: pt-br
locale: pt_BR
ref: intuitivepapers-ai-interactive-paper-explainers
date: 2026-06-05 00:00:00 -0700
last_modified_at: 2026-11-25 00:00
permalink: /pt-br/intuitivepapers-ai-interactive-paper-explainers
title: "Explicações interativas de artigos de IA com o intuitivepapers.ai"
imgpath: /assets/img/intuitivepapers
previewurl: /home.png
description: "Como construí o intuitivepapers.ai, um pipeline automatizado que transforma artigos de machine learning em explicações interativas verificadas com figuras customizadas em canvas."
image: /assets/img/intuitivepapers/home.png
image_width: 1280
image_height: 820
image_alt: "intuitivepapers.ai explicações interativas de artigos de IA"
mathjax: false
tags: [machine-learning, ai-tools]
---

{% include description.html content="Podemos automatizar a transformação de artigos densos de machine learning em explicações verificadas e interativas?" %}

Ler artigos científicos de machine learning pode ser frustrantemente lento. Um artigo normalmente dedica suas páginas ao que é novo e presume que você já tem cinco ideias pré-requisito frescas na cabeça, então metade do tempo acabo pulando por uma cadeia de referências mais antigas antes que o artigo em si faça sentido.

O atalho fácil hoje em dia é jogar o PDF em um LLM e pedir uma explicação. Faço muito isso e ajuda em uma primeira passada rápida, mas o modelo erra detalhes sutis com uma frequência surpreendente. Um sinal trocado em uma equação, confundir se uma derivação é exata ou aproximada, ou errar qual variável está realmente sendo atualizada pode mudar completamente o que o algoritmo faz. E se você ainda não conhece bem o artigo, é muito difícil perceber esses erros quando o resto da explicação soa perfeitamente plausível.

O que eu queria eram explicações que construíssem a intuição e a matemática juntas, com figuras com as quais você pudesse realmente brincar. Eu já tinha visto a diferença que isso faz quando montei minha [demonstração interativa de gradiente descendente](/pt-br/gradient-descent) alguns anos atrás — arrastar um controle deslizante e observar um algoritmo passar do ponto ou convergir ensina coisas que uma equação estática nunca consegue transmitir de verdade.

## Começando pelo DiffusionBlocks

Comecei construindo uma única [explicação para o artigo DiffusionBlocks da Sakana AI](https://intuitivepapers.ai/diffusionblocks/) junto com o Claude. Levou cerca de uma semana de idas e vindas até deixá-la em boa forma. Grande parte desse tempo foi gasta conferindo cada equação contra as fontes primárias (como o artigo EDM) e contra o repositório oficial dos autores no GitHub.

Enquanto fazia isso, a verificação pegou um erro de sinal real impresso no próprio artigo. O artigo define `Δσ = σ_prev - σ_next > 0` e escreve a atualização de Euler na Eq. (4) com `(z - D)`, o que na prática dá um passo *para longe* da previsão do denoiser. Discretizar a Eq. (1) deles resulta em `(D - z)`, e de fato, conferindo o código dos autores (`model.py`), confirmamos que a implementação usa o sinal corrigido. Um resumo comum feito por LLM teria apenas repetido o erro de digitação impresso, e eu provavelmente nunca teria percebido.

Isso me fez pensar em quanto daquela semana inteira de trabalho eu conseguiria automatizar. Será que dava para criar um pipeline que baixasse a fonte real de um artigo, verificasse a matemática de pré-requisito contra a literatura primária e o código, construísse figuras interativas e revisasse o próprio rascunho antes de publicar?

O resultado é o [intuitivepapers.ai](https://intuitivepapers.ai/). Ele começou com vinte explicações — cobrindo clássicos e artigos mais recentes como Attention, BERT, GANs, VAEs, CLIP, PPO, Mamba e Adam — e desde então já passou de 150 explicações conforme o pipeline continua rodando de forma agendada.

![Página inicial do intuitivepapers.ai com explicações interativas de artigos de machine learning]({{ "/home.webp" | prepend: page.imgpath }}){: width="1280" height="820" fetchpriority="high" decoding="async"}
{% include caption.html content="A página inicial do intuitivepapers.ai." %}

![Biblioteca com vinte explicações de artigos de IA com prévias das figuras]({{ "/library.webp" | prepend: page.imgpath }}){: width="1280" height="2621" loading="lazy" decoding="async"}
{% include caption.html content="A biblioteca original de vinte artigos. Cada cartão renderiza uma prévia ao vivo de uma figura de sua explicação." %}

<div class="divider"></div>

## Como é uma explicação

Cada página começa pelos pré-requisitos e avança até a ideia principal do artigo em ordem de dependência. No desktop, uma barra lateral que chamo de torre de conceitos (_concept tower_) mapeia essa cadeia de dependências para que você veja como as peças se empilham, e pequenos blocos de código conectam a notação matemática ao que realmente roda na prática.

Minha parte favorita são as figuras interativas. Por exemplo, o PPO usa uma função objetivo recortada (_clipped objective_) para impedir que atualizações de política se movam demais em um único passo. Na figura abaixo, você pode arrastar a razão de probabilidade e inverter o sinal da vantagem para ver exatamente onde o objetivo fica plano e para de gerar gradiente. Brincar com isso por dez segundos faz a lógica do recorte fazer sentido muito mais rápido do que ficar encarando a expressão `min` sozinha.

![Função objetivo recortada interativa do PPO mostrando a razão de probabilidade e a vantagem]({{ "/ppo-figure.png" | prepend: page.imgpath }}){: width="1280" height="820" loading="lazy" decoding="async"}
{% include caption.html content="Explorando a função objetivo recortada do PPO arrastando a razão de probabilidade e invertendo o sinal da vantagem." %}

Tudo também se adapta para funcionar no celular, que é onde eu mesmo acabo fazendo boa parte das minhas leituras:

![Explicação do artigo PPO com figura interativa integrada no celular]({{ "/mobile-ppo.png" | prepend: page.imgpath }}){: width="400" height="840" loading="lazy" decoding="async" style="max-height:520px;width:auto"}
{% include caption.html content="A explicação do PPO no celular, com a mesma figura interativa integrada ao texto." %}

Outro exemplo é o CLIP, que treina codificadores de imagem e texto para alinhar pares correspondentes. A grade interativa abaixo pontua cada imagem contra cada legenda em um lote — a diagonal brilhante guarda os pares reais que estão sendo aproximados, enquanto tudo fora da diagonal representa combinações incorretas que estão sendo afastadas.

![Grade de similaridade do CLIP comparando imagens com legendas correspondentes e incorretas]({{ "/clip-grid.png" | prepend: page.imgpath }}){: width="664" height="593" loading="lazy" decoding="async"}
{% include caption.html content="Grade de similaridade imagem-legenda do CLIP. Os pares correspondentes ficam ao longo da diagonal." %}

<div class="divider"></div>

## Como o pipeline funciona

Um único prompt do tipo "explique este artigo" gera exatamente os resumos rasos dos quais eu estava tentando fugir. Para obter resultados mais confiáveis, dividi a geração em um pipeline de múltiplos estágios, com várias verificações automatizadas entre o rascunho e a publicação.

Primeiro, em vez de deixar um modelo parafrasear equações de memória, o pipeline busca a versão HTML renderizada do arXiv (`arxiv.org/html/<id>`) e converte o MathML em LaTeX com `pandoc`, de modo que as equações e números do artigo sejam extraídos literalmente.

Em seguida, ele verifica os conceitos pré-requisito contra fontes primárias — conferindo definições, sinais e convenções — e, quando o texto do artigo deixa algum detalhe ambíguo, lê o código oficial dos autores e cita exatamente o arquivo e os números de linha em um painel de procedência no rodapé da página. Tudo isso é consolidado em um cartão de referência verificado a partir do qual o redator trabalha, em vez de escrever diretamente a partir do artigo bruto.

A partir daí, o pipeline constrói figuras interativas sob medida diretamente em HTML5 canvas (sem bibliotecas de gráficos) e escreve a explicação em ordem de dependência, combinando equações com exemplos numéricos concretos e pseudocódigos curtos.

Antes de qualquer coisa ir ao ar, o rascunho passa por uma mistura de checagens determinísticas e modelos críticos:

1. Uma etapa determinística gratuita verifica o texto em busca de vícios comuns de escrita de IA, valida a sintaxe KaTeX, confirma que versões estreitas das equações para celular são matematicamente equivalentes às de desktop sem vazar da tela e varre todos os estados de controles deslizantes e botões de cada figura interativa (em desktop e mobile) para detectar rótulos sobrepostos ou cortados.
2. Críticos separados revisam então a precisão em relação ao artigo, a clareza, o tom de voz, as figuras e as capturas de tela renderizadas.
3. Os problemas confirmados seguem para uma etapa de correção, o site é recompilado e apenas as verificações que falharam são executadas novamente por até algumas rodadas. Se algo ainda falhar ao final, o pipeline falha de forma segura (_fail closed_) e abre um PR em rascunho em vez de publicar automaticamente.

Todo o pipeline roda em um agendamento diário via `launchd` no Mac mini debaixo da minha mesa. Todas as manhãs ele pega o artigo mais votado da fila (combinando um backlog curado com sugestões de leitores), aguarda eventuais limites de sessão do modelo e retoma automaticamente quando a cota é reiniciada, publicando a página finalizada assim que o build e a etapa de revisão passam sem pendências.

Abaixo está um dos diagramas customizados em canvas da explicação do Mamba, detalhando as partes de um bloco Mamba.

![Diagrama mostrando os componentes de um bloco Mamba]({{ "/mamba-block-fig.jpeg" | prepend: page.imgpath }}){: width="1280" height="900" loading="lazy" decoding="async"}
{% include caption.html content="Um detalhamento de um bloco Mamba, desenhado em canvas para a explicação do Mamba." %}

<div class="divider"></div>

## Considerações finais

Isso começou porque eu queria entender um único artigo direito, e acabou virando um experimento para ver até onde a verificação automatizada consegue ir. Conferir fontes primárias, ler o código dos autores e varrer os estados das figuras pega muitos erros sutis, embora certamente não torne o resultado infalível. Figuras interativas complexas ainda são a parte mais difícil de acertar de forma confiável sem olhos humanos, e ocasionalmente passa alguma explicação truncada ou bug de caso de borda.

Para ajudar com isso, toda página tem uma caixa de feedback no rodapé. Os relatos dos leitores são usados para corrigir erros na página e refinar as regras do pipeline para que futuras explicações evitem os mesmos deslizes.

Se existe algum artigo de ML que você vem querendo estudar a fundo, dê uma olhada em [intuitivepapers.ai](https://intuitivepapers.ai/). Você pode solicitar um artigo ou votar em algum da fila, e se encontrar um erro em qualquer uma das explicações, mande pela caixa de feedback para que eu possa corrigir.
