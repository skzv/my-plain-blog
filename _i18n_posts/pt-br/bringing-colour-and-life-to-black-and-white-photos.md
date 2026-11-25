---
layout: post
lang_code: pt-br
locale: pt_BR
ref: bringing-colour-and-life-to-black-and-white-photos
date: 2021-06-12 00:00:00 -0700
last_modified_at: 2021-06-12 00:00
permalink: /pt-br/bringing-colour-and-life-to-black-and-white-photos
title: "Trazendo cor e vida a fotos em preto e branco"
imgpath: /assets/img/colourising-black-and-white-photos
previewurl: /mama-and-vova-colorized.jpg
description: "Colorizando fotos de família com IA e a API da DeepAI, com exemplos, um script de processamento em lote e uma reflexão sobre os limites da restauração de cores."
image: /assets/img/colourising-black-and-white-photos/og-preview.png
image_width: 1200
image_height: 630
image_alt: "Uma fotografia de família restaurada em cores com IA"
mathjax: false
tags: [computer-vision, machine-learning]
toc: true
---

{% include description.html content="O aprendizado de máquina permite colorizar fotos em preto e branco com facilidade, mas a que custo?" %}

## Um universo diferente

Embora fotos coloridas existam tecnicamente há um século ou mais ([Sergey Prokudin-Gorsky e Piotr Vedenisov, pioneiros da fotografia em cores, viajaram pela Rússia Imperial documentando-a em cores vivas](https://www.loc.gov/pictures/related/?fi=name&q=Prokudin-Gorski%20%2C%20Serge%20%20Mikha%20lovich%2C%201863-1944)), a maior parte do século XX foi registrada em preto e branco. Mesmo mais tarde no século, grande parte do mundo não tinha o luxo do filme colorido — meu pai ainda revelava suas próprias fotos em preto e branco entre os anos 1980 e 1990 na Ucrânia Soviética, e enquanto os americanos registraram a Guerra do Vietnã em cores, a perspectiva do Vietnã do Norte parece ter ficado restrita à fotografia em preto e branco.

![Menino perto do rio Sim]({{ "/boy-sim-river.jpeg" | prepend: page.imgpath }}){: width="900" height="648" fetchpriority="high" decoding="async"}
{% include caption.html content="Menino perto do rio Sim, uma das primeiras fotografias coloridas da Rússia Imperial. Isso foi obtido tirando múltiplas fotos da mesma cena com filtros de cores diferentes. Cortesia da Biblioteca do Congresso dos EUA." %}

Alguns dirão que imagens em preto e branco têm um charme especial, e isso pode até ser verdade. Mas, para mim, o preto e branco me desconecta da cena. Ele parece claramente distante no tempo. Todos nós associamos imagens em preto e branco ao passado, como mostra o clichê cinematográfico de usar preto e branco para retratar uma lembrança. E, como alguém que vivencia a realidade totalmente em cores, tenho dificuldade para mergulhar em imagens em preto e branco. Custa-me imaginar a mim mesmo na cena ou no lugar daquelas pessoas, porque na minha mente tudo aquilo existe em um universo paralelo em preto e branco. No entanto, quando essas imagens são colorizadas, de repente tudo parece mais real, mais verossímil, mais tangível. Fica claro que o que está ali pertence à mesma Terra e às mesmas pessoas — pessoas como você ou eu.

Por isso, quando meu pai começou recentemente a digitalizar nossa coleção de fotos de família — já que fotos físicas se deterioram ou correm o risco de se perder para sempre, junto com as histórias, memórias e legados que preservam —, senti vontade de colorizá-las também, para que eu pudesse vivenciá-las de forma mais plena, e para que meus familiares pudessem relembrar entes queridos que já partiram ou reviver as lembranças de seu passado e de sua juventude.

<div class="divider"></div>

## Colorizando fotos com IA

A restauração de cores pode ser feita de forma manual e trabalhosa. Modelos de aprendizado de máquina oferecem uma maneira rápida e barata de colorizar fotos, mas têm suas limitações, como vamos discutir mais adiante neste texto. Eu não treinei meu próprio modelo para isso. Outras pessoas já investiram milhares de horas desenvolvendo e treinando modelos exatamente com esse objetivo, e encontrei um modelo pronto que faz um trabalho excelente.

Usei a [API de Colorização de Imagens da DeepAI](https://deepai.org/machine-learning-model/colorizer). O modelo em produção implantado pela DeepAI parece ser uma variação do modelo DeOldify, disponível [neste repositório do GitHub](https://github.com/jantic/DeOldify).

Acredito que a API da DeepAI não permita ajustar os parâmetros do modelo, mas você consegue fazer isso rodando o código por conta própria a partir do repositório acima ou em [uma instância no Google Colab](https://colab.research.google.com/github/jantic/DeOldify/blob/master/ImageColorizerColabStable.ipynb). O [MyHeritage](https://www.myheritage.com/incolor) também oferece essa tecnologia como serviço com parâmetros ajustáveis.

O que eu fiz foi criar um script rápido que permite colorizar diretórios inteiros em lote. Ele percorre todas as fotos de uma pasta, envia cada uma para a API de Colorização de Imagens da DeepAI e baixa o resultado em outra pasta (ignorando imagens que já foram colorizadas). Se isso for útil para você, basta definir sua própria chave de API da DeepAI como variável de ambiente e rodar [este script](https://github.com/skzv/colorize-photos):

```bash
export DL_API_KEY=<your-deep-ai-key>
python3 main.py /path/to/images
```

<div class="divider"></div>

## Minhas fotos de família

Aqui estão alguns exemplos dos resultados nas fotos da nossa família.

![Mamãe com Vova]({{ "/mama-and-vova.webp" | prepend: page.imgpath }}){: width="1600" height="1232" loading="lazy" decoding="async"}
{% include caption.html content="Minha mãe segurando meu irmão no início dos anos 90 em Kherson, Ucrânia. Cortesia da família Kuznetsov." %}

![Mamãe com Vova em cores]({{ "/mama-and-vova-colorized.webp" | prepend: page.imgpath }}){: width="800" height="616" loading="lazy" decoding="async"}
{% include caption.html content="Agora em cores." %}

![Avó Allarkadina]({{ "/my-grandmother-allarkadina.jpg" | prepend: page.imgpath }}){: width="523" height="801" loading="lazy" decoding="async"}
{% include caption.html content="Minha avó, Allarkadina, provavelmente em algum momento dos anos 50, a caminho da universidade. Ela se formou em diversos institutos, especializando-se em engenharia elétrica, e teve uma carreira bem-sucedida como engenheira elétrica naval." %}

![Avó Allarkadina em cores]({{ "/my-grandmother-alla-colourised.webp" | prepend: page.imgpath }}){: width="522" height="800" loading="lazy" decoding="async"}
{% include caption.html content="Em cores." %}

> Ficou tão bonito e cheio de vida.

Essas palavras do meu pai ao ver as fotos recém-coloridas fizeram tudo valer a pena.

<div class="divider"></div>

## Fotos da Guerra do Vietnã

Algumas semanas depois de preparar o script de colorização em lote para as minhas fotos de família, uma postagem intitulada ["The Vietnam War from the North Vietnamese Side"](https://news.ycombinator.com/item?id=27283624) (A Guerra do Vietnã pelo lado norte-vietnamita) chegou ao topo do Hacker News. Pareceu a oportunidade perfeita para aplicar o script e oferecer uma nova perspectiva sobre registros históricos. Assim como ["Eles Não Envelhecerão" ("They Shall Not Grow Old")](https://www.imdb.com/title/tt7905466/) tornou vivos e reais os horrores da Primeira Guerra Mundial, meu objetivo era dar vida aos personagens e cenários vistos pela ótica do Vietnã do Norte.

![Destruição da selva causada pelo Agente Laranja]({{ "/vietnam-agent-orange.jpeg" | prepend: page.imgpath }}){: width="1600" height="1179" loading="lazy" decoding="async"}
{% include caption.html content="Destruição da selva causada pelo Agente Laranja." %}

![Destruição da selva causada pelo Agente Laranja em cores]({{ "/vietnam-agent-orange-colourised.webp" | prepend: page.imgpath }}){: width="800" height="590" loading="lazy" decoding="async"}
{% include caption.html content="Em cores." %}

![Moradores locais inspecionando uma aeronave americana abatida]({{ "/vietnam-downed-aircraft.jpeg" | prepend: page.imgpath }}){: width="1600" height="1111" loading="lazy" decoding="async"}
{% include caption.html content="Moradores locais inspecionando uma aeronave americana abatida pilotada pelo tenente Stephen Owen Musselman. O piloto não sobreviveu — a guerra é o inferno." %}

![Moradores locais inspecionando uma aeronave americana abatida em cores]({{ "/vietnam-downed-aircraft-colourised.webp" | prepend: page.imgpath }}){: width="800" height="556" loading="lazy" decoding="async"}
{% include caption.html content="Em cores." %}

Todas as imagens originais em preto e branco podem ser encontradas [aqui](https://rarehistoricalphotos.com/vietnam-war-images-from-vietnamese-photographers/), e as versões colorizadas estão [aqui](https://imgur.com/a/aJbpMjf).

<div class="divider"></div>

## Repercussão no Hacker News

Meus esforços foram recebidos tanto com elogios

![Elogios]({{ "/praise.webp" | prepend: page.imgpath }}){: width="624" height="934" loading="lazy" decoding="async"}

quanto com desprezo

![Desprezo]({{ "/contempt.png" | prepend: page.imgpath }}){: width="546" height="286" loading="lazy" decoding="async"} {% include caption.html content="Uma pena o comentário ter sido [sinalizado], porque levantava um ponto interessante. O comentário dizia algo como 'Por favor, não faça isso.'" %}

mas, acima de tudo, geraram discussões muito interessantes.

![Discussão]({{ "/discussion.webp" | prepend: page.imgpath }}){: width="654" height="946" loading="lazy" decoding="async"}

A discussão completa gerada pelas fotos colorizadas pode ser conferida [aqui](https://news.ycombinator.com/item?id=27284795).

<div class="divider"></div>

## Limitações

Dois aspectos da discussão me chamaram muito a atenção. O primeiro foi o lembrete das limitações da IA.

Por exemplo, quando aplicado a uma foto antiga da ponte Golden Gate em construção, o modelo gera uma ponte branca. Para ser justo, não chega a ser totalmente absurdo — a ponte de fato foi branca bem no início da obra, mas na época em que aquela foto foi tirada ela já estava coberta com primer vermelho (segundo a fonte no [repositório do DeOldify](https://github.com/jantic/DeOldify)). Assim, embora os dados de treinamento provavelmente contivessem fotos da Golden Gate em construção e o modelo conseguisse reconhecer a ponte, ele não tinha como inferir a data e saber que, naquele estágio, ela já havia recebido a pintura vermelha.

![Uma Golden Gate branca?]({{ "/golden-gate.webp" | prepend: page.imgpath }}){: width="1200" height="472" loading="lazy" decoding="async"} {% include caption.html content="Uma Golden Gate branca? Ela chegou a ser branca — mas não quando esta foto foi tirada." %}

Algumas cenas são ambíguas. Por exemplo, com base apenas nas características da imagem a seguir, o modelo não consegue diferenciar se o chão é grama ou asfalto e acaba pintando o asfalto de verde por engano, algo que um colorizador humano provavelmente acertaria.

![Uma celebração]({{ "/a-celebration-colourised.webp" | prepend: page.imgpath }}){: width="800" height="522" loading="lazy" decoding="async"} {% include caption.html content="O modelo não consegue perceber que o chão é asfalto, e não grama." %}

Outra observação curiosa é que roupas frequentemente pareciam carecer de tons, texturas, características ou contexto suficientemente distintos para serem colorizadas com precisão. O modelo tendia a pintar as roupas de roxo — a menos que houvesse pistas ou contexto bem claros. Isso provavelmente acontece porque, quando o modelo não consegue fazer uma boa inferência sobre a cor da roupa, o roxo funciona como uma aposta conservadora, em algum lugar no meio do espaço de cores ambíguo, que minimiza a função de perda durante o treinamento.

![Mergulhadores vietnamitas — todos de roxo?]({{ "/vietnam-divers-colourised.webp" | prepend: page.imgpath }}){: width="796" height="800" loading="lazy" decoding="async"} {% include caption.html content="Não acho que roupas no passado fossem roxas com tanta frequência quanto este modelo faz parecer." %}

Inclusive, meu pai me pediu para corrigir a cor de algumas peças nas fotos. Infelizmente, não dei sequência a esse pedido, nem era imediatamente óbvio para mim como fazer isso. Mas, como observou um comentarista, mesmo quando as cores estão erradas, elas ainda trazem as imagens de volta à vida.

<div class="divider"></div>

## Considerações éticas

Agora que algumas limitações ficaram claras, estamos em uma boa posição para refletir sobre as implicações éticas de uma IA colorizadora. Esse foi o segundo aspecto da discussão que mais me marcou. A questão ética nem passou pela minha cabeça quando comecei o projeto, mas parte do retorno que recebi me levou a refletir, e sou grato por isso.

A principal preocupação ética diz respeito à verdade. De forma semelhante à controvérsia em torno dos deepfakes, que confundem nossa percepção do que é real, a colorização artificial pode alterar nossa experiência da história. A IA faz escolhas sobre as cores do passado que não são necessariamente fiéis. Por exemplo, se guardarmos e divulgarmos a versão branca da ponte Golden Gate produzida por essa IA, a versão da ponte que as pessoas verão não será historicamente precisa. Claro, a versão em preto e branco também não é. Talvez o problema seja que quem olha para uma foto em preto e branco sabe que o passado não era daquele jeito, enquanto quem vê uma foto colorizada pode facilmente acreditar que está vendo a história exatamente como ela foi.

Alguns chegam a dizer que esse tipo de retoque equivale a reescrever a história — e, de fato, às vezes parece mesmo. Veja este exemplo recente:

> O Camboja pediu ao grupo de mídia americano Vice que retirasse do ar uma matéria que apresentava fotografias recém-colorizadas de vítimas do Khmer Vermelho, afirmando que as imagens são um insulto aos mortos porque algumas foram alteradas para adicionar sorrisos.

<p class="caption" style="margin-top:-25px;"><a href="https://www.aljazeera.com/news/2021/4/11/cambodia-condemns-vice-for-altered-khmer-rouge-images">Fonte</a></p>

Uma reclamação totalmente válida. Tudo indica que o modelo sofreu _overfitting_, provavelmente treinado em sua maioria com rostos sorridentes. Assim, ele alterou os rostos das vítimas para que ficassem mais parecidos com os dados de treinamento — adicionando sorrisos. É um ótimo exemplo das armadilhas da IA, especialmente quando aplicada sem cuidado.

O [MyHeritage](https://www.myheritage.com/incolor), que oferece um serviço de restauração de cores baseado no mesmo modelo DeOldify que eu utilizei, tenta encontrar um meio-termo colocando uma marca d'água em todas as imagens retocadas. Acho que o argumento deles faz muito sentido:

> Diferenciamos fotos colorizadas daquelas fotografadas originalmente em cores usando um símbolo especial de paleta em relevo no canto inferior esquerdo das fotos colorizadas. Embora altamente realistas, as fotos colorizadas possuem cores simuladas por algoritmos automáticos e essas cores podem não ser idênticas às cores reais da imagem original. O ícone da paleta aparece em todas as fotos colorizadas para que os usuários possam distingui-las de fotos com cores reais. Esperamos que essa prática responsável seja adotada por outros que utilizam tecnologia de colorização de fotos. Fotos que passaram por restauração de cor não recebem o ícone porque essas cores são autênticas.

No meu caso, minha família sabia que eu havia colorizado nossas fotos artificialmente e conseguia perceber que as cores não eram totalmente fiéis. Mas, mesmo com cores imprecisas, as fotos — e as pessoas e cenas dentro delas — ganharam vida novamente. Assim como quando eu era voluntário no ensino médio em uma casa de repouso e consegui levar um morador idoso de volta à casa de sua infância em Dresden pelo Google Street View, um lugar que ele não visitava havia 50 anos, consegui usar IA para teletransportar minha família para bons tempos de décadas atrás. A tecnologia é uma ferramenta, e sou grato por viver em uma época em que esse tipo de magia é possível.
