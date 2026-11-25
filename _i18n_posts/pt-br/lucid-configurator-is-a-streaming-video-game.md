---
layout: post
lang_code: pt-br
locale: pt_BR
ref: lucid-configurator-is-a-streaming-video-game
date: 2021-07-28 00:00:00 -0700
last_modified_at: 2021-07-28 00:00
permalink: /pt-br/lucid-configurator-is-a-streaming-video-game
title: "O configurador da Lucid Motors é um videogame transmitido por streaming para o seu navegador"
imgpath: /assets/img/lucid-configurator-is-a-streaming-video-game
previewurl: /lucid-configurator.png
description: "Como o configurador de carros da Lucid Motors usa Unity, renderização na nuvem e WebRTC para transmitir um showroom 3D interativo para o seu navegador."
image: /assets/img/lucid-configurator-is-a-streaming-video-game/lucid-configurator.png
image_width: 1958
image_height: 845
image_alt: "Configurador 3D interativo de carros da Lucid Motors"
mathjax: false
tags: [computer-vision, 3d-graphics, systems]
---

{% include description.html content="Tudo faz sentido quando você percebe que motores de jogos são os melhores simuladores que existem." %}

## Uma solução inteligente

A [Lucid Motors abriu capital na segunda-feira](https://www.barrons.com/articles/lucid-churchill-merger-ipo-ev-51627308359) e, embora eu não vá comprar um Lucid tão cedo, acabei entrando no [configurador de veículos deles](https://www.lucidmotors.com/air/configure/) por curiosidade. É uma verdadeira obra de arte. Ele permite observar e interagir com o veículo de praticamente qualquer ângulo, por dentro e por fora:

{% include video.html content="https://streamable.com/e/cudr66" %}
<p class="caption video-caption">Configurador da Lucid para o seu carro-chefe de luxo, o Lucid Air Dream.</p>

Você pode simular várias cores e acabamentos, abrir e fechar as portas e até recolher a tela do console central. O cenário da ponte Golden Gate ao fundo reflete nas poças d'água brilhantes. O configurador preserva todo tipo de detalhe do veículo, incluindo as luzes sob as maçanetas que acendem quando você interage com elas. Senti que tive uma noção tão precisa do carro que nem preciso mais vê-lo pessoalmente.

Mas como a Lucid conseguiu fazer isso? Dá para esperar que o navegador de um usuário comum renderize uma cena dessas em tempo real, com reflexos e tudo? A resposta provavelmente é não. Isso funciona porque a cena que você está vendo é renderizada com o Unity, um motor de jogos (game engine), rodando na nuvem — delegando a carga computacional pesada a um servidor da Amazon — e transmitida de volta para o seu navegador via WebRTC, um protocolo de streaming de vídeo ponto a ponto.

<div class="divider"></div>

## O modelo

No começo, presumi ingenuamente que o modelo estava sendo renderizado no meu navegador usando a versão mais recente da [biblioteca WebGL](https://en.wikipedia.org/wiki/WebGL) (uma API para renderizar gráficos 2D e 3D em navegadores com aceleração de hardware). E, já que o modelo estaria sendo renderizado localmente, ele precisaria existir em algum lugar da minha memória RAM, o que me permitiria extraí-lo e carregá-lo em um editor 3D. Especificamente, eu queria ver se conseguia remover os quebra-sóis que interrompem o teto de vidro quase contínuo — um efeito que a Tesla conseguiu no Model X e que eu não entendo por que a Lucid não seguiu.

![Quebra-sóis do Lucid Air interrompendo o teto panorâmico de vidro]({{ "/lucid-air-sun-visors.webp" | prepend: page.imgpath }}){: width="1600" height="994" loading="lazy" decoding="async"}
{% include caption.html content="Quebra-sóis do Lucid Air interrompendo o teto panorâmico de vidro." %}

Então mergulhei no código. Depois de passar um tempo nas ferramentas de depuração do navegador, folheando milhares de linhas de JavaScript minificado e gravando e analisando as requisições de rede entre meu notebook e os servidores da Lucid, percebi que a resposta estava literalmente sendo impressa no console o tempo todo:

![O configurador é um stream de vídeo]({{ "/zlbolt-webrtc.png" | prepend: page.imgpath }}){: width="691" height="156" loading="lazy" decoding="async"}
{% include caption.html content="O configurador é um stream via WebRTC." %}

Não existe nenhum modelo local sendo renderizado. O que estou vendo é um vídeo.

Então, o que está acontecendo aqui? O configurador começa com uma exibição em 2D — isto é, um panorama entrecortado de imagens que dá a ilusão de uma interação em 3D. É assim que a maioria dos visualizadores 3D interativos na web é construída. Você pode ver uma demonstração disso abaixo:

{% include video.html content="https://streamable.com/e/ptjitc" %}
<p class="caption video-caption">Uma visualização 3D entrecortada, criada a partir de uma sequência de imagens 2D.</p>

Em seguida, o cliente testa minha largura de banda e latência e, se a conexão for rápida o suficiente para sustentar um fluxo de vídeo em tempo real, faz o upgrade da sessão para 3D:

![Teste de latência]({{ "/latency-test.png" | prepend: page.imgpath }}){: width="755" height="25" loading="lazy" decoding="async"}
![Teste de largura de banda]({{ "/bandwidth-test.png" | prepend: page.imgpath }}){: width="706" height="21" loading="lazy" decoding="async"}
{% include caption.html content="A sessão é promovida para 3D se você tiver largura de banda suficiente." %}

Isso inicia uma conexão WebRTC. O [WebRTC](https://en.wikipedia.org/wiki/WebRTC) é um protocolo de streaming ponto a ponto. A cena é renderizada em outro lugar e transmitida via WebRTC para o meu navegador.

Inspecionar o conteúdo da requisição `get_token` revela mais alguns detalhes de como tudo funciona.

![Conteúdo da requisição get_token]({{ "/get-token-request.png" | prepend: page.imgpath }}){: width="829" height="402" loading="lazy" decoding="async"}
{% include caption.html content="Conteúdo da requisição get_token." %}

A primeira caixa mostra que, para testar sua largura de banda, eles baixam parcialmente [uma imagem de teste de 25 MB](https://libzl.zlthunder.net/bandwidth-test-img.png) para o seu dispositivo e cronometram quanto tempo isso leva. Esta é a imagem, caso você tenha curiosidade (não se preocupe, comprimi o arquivo em 10x).

![Imagem de teste de largura de banda]({{ "/bandwidth-test-image.webp" | prepend: page.imgpath }}){: width="895" height="1263" loading="lazy" decoding="async"}
{% include caption.html content="Não tem muito a ver com automóveis, mas testa sua largura de banda perfeitamente." %}

Aliás, [essa imagem parece ser um efeito produzido pelo plugin plasma do GIMP](https://www.gimp.org/tutorials/Floating_Logo/Plasma.jpg). Ela demora bastante para carregar; como lembra ruído, deve ser praticamente incompressível.

Abrir [chrome://webrtc-internals/](chrome://webrtc-internals/) revela mais detalhes sobre a conexão WebRTC que transmite a cena 3D para o meu navegador.

![Informações do WebRTC]({{ "/lucid-webrtc.png" | prepend: page.imgpath }}){: width="851" height="399" loading="lazy" decoding="async"}
{% include caption.html content="As ferramentas de depuração do Chrome fornecem mais informações sobre a conexão WebRTC." %}

A essa altura, você talvez tenha notado que nenhuma dessas URLs está em um domínio da Lucid, mas sim sob `zlthunder`. Quem são eles?

<div class="divider"></div>

## ZeroLight

Pesquisar por `zlthunder` na web leva a uma empresa chamada [ZeroLight](https://zerolight.com/). Eles informam que oferecem visualização 3D baseada na nuvem, com foco no setor automotivo. Agora tudo faz sentido!

![ZeroLight]({{ "/zero-light.webp" | prepend: page.imgpath }}){: width="1600" height="640" loading="lazy" decoding="async"}
{% include caption.html content="Especialistas em visualização 3D baseada na nuvem." %}

Não demorou muito até eu encontrar [este artigo no blog da Unity](https://unity3d.com/showcase/case-stories/zerolight) (o famoso motor de jogos) explicando como a ZeroLight usou o motor para criar um showroom virtual realista, com física otimizada, reflexos e tudo mais.

![Unity e ZeroLight]({{ "/unity-zero-light.webp" | prepend: page.imgpath }}){: width="1203" height="658" loading="lazy" decoding="async"}
{% include caption.html content="Os videogames nos trouxeram bem longe." %}

Agora todas as peças se encaixaram. Quando me conecto ao site, eles carregam um configurador 2D. Se a minha conexão de internet der conta, eles me conectam a uma instância do Unity — um motor de jogos 3D — rodando em um servidor da AWS. O servidor recebe os comandos do meu mouse, gira e aproxima o campo de visão, renderiza o resultado na nuvem e transmite o vídeo de volta para mim.

<div class="divider"></div>

## Parece caro

Imagine ter 1.000 usuários conectados ao site ao mesmo tempo: você precisa de 1.000 instâncias com aceleração de hardware de um motor de jogos recebendo comandos e transmitindo grandes volumes de vídeo em tempo real — exatamente como os serviços de jogos na nuvem Stadia e GeForce Now, entre outros. Mas parece que eles têm plena consciência disso: para economizar custos, desconectam você após 60 segundos de inatividade:

![Downgrade por inatividade]({{ "/inactivity-downgrade.png" | prepend: page.imgpath }}){: width="524" height="60" loading="lazy" decoding="async"}
{% include caption.html content="Fazer downgrade quando o usuário fica ocioso deve economizar muito dinheiro." %}

<div class="divider"></div>

## Afinal, o que é um motor de jogos?

Embora possa parecer um uso surpreendente à primeira vista, um motor de jogos é, no fundo, apenas um simulador otimizado. Motores consagrados como o Unity incorporam décadas de pesquisa em simulação de raios de luz e outros fenômenos físicos. Então, se você quer simular a realidade — mesmo que essa realidade seja um showroom —, um motor de jogos é uma ferramenta perfeita, pronta para uso e extensível para inúmeras aplicações.

Olhando para trás, eu provavelmente poderia ter descoberto como o configurador da Lucid funciona apenas fazendo uma busca e encontrando o artigo da Unity. Mas fazer a engenharia reversa do configurador me deu um olhar muito mais próximo sobre os desafios, soluções e mecanismos do produto, e me fez sentir como um detetive investigando tudo do zero. O que achei mais divertido, no entanto, foi a complexidade absurda que alcançamos na tecnologia hoje em dia: um simulador de física hiper-realista rodando em um servidor remoto dentro de um data center da Amazon, recebendo comandos do meu computador e devolvendo um vídeo na velocidade da luz, só para eu brincar com um configurador de carros. E tudo o que precisamos para chegar à Lua foi uma calculadora!
