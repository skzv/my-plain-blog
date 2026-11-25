---
layout: post
lang_code: pt-br
locale: pt_BR
ref: arbitrage-as-a-shortest-path-problem
date: 2021-04-25 00:00:00 -0700
last_modified_at: 2021-04-25 00:00
permalink: /pt-br/arbitrage-as-a-shortest-path-problem
title: "Arbitragem como um problema de caminho mais curto"
imgpath: /assets/img/arbitrage-as-a-shortest-path-problem
previewurl: /currency-graph-on-black.png
description: "Como a arbitragem cambial se torna um problema de grafos, usando logaritmos e o algoritmo de Bellman-Ford para encontrar ciclos lucrativos de negociação."
image: /assets/img/arbitrage-as-a-shortest-path-problem/og-preview.png
image_width: 1200
image_height: 630
image_alt: "Grafo de taxas de câmbio usado para explicar arbitragem"
mathjax: true
tags: [quant-finance, algorithms]
toc: true
---
{% include description.html content="Uma explicação sobre arbitragem e uma análise de um algoritmo eficiente para encontrar oportunidades instantâneas e sem risco de arbitragem." %}

_Quem não gosta de ganhar dinheiro?_

E se você pudesse transformar o problema de ganhar dinheiro no problema de encontrar o caminho mais curto? Podemos fazer isso de pelo menos uma maneira específica: explorando oportunidades de arbitragem.

## O que é arbitragem?

_Arbitragem_ é o ato de comprar ou vender ativos em mercados diferentes, ou sob formas diferentes, para lucrar com discrepâncias de preço. E as pessoas que praticam isso? São conhecidas como _arbitradores_ — um título e tanto, sem dúvida.

Vamos começar com um exemplo. Digamos que Paul, Peter e Bob vivem em uma vila onde fazem escambo de cenouras, batatas e alfaces. Bob troca batatas por cenouras, Peter troca alfaces por batatas e Paul troca alfaces por cenouras.

Além disso, Bob troca 2 batatas por 1 cenoura, Peter troca 1 alface por 2 batatas e Paul troca 2 cenouras por 1 alface. Se tratarmos cada pessoa como um mercado para seus respectivos produtos, como ficariam as taxas de troca?

| Mercado                         | Taxa de troca                             |
|:-------------------------------:|:-----------------------------------------:|
| Bob (batatas por cenouras)      | 2 batatas/cenoura                         |
| Peter (alfaces por batatas)     | 1 alface/2 batatas = 0,5 alface/batata    |
| Paul (cenouras por alfaces)     | 2 cenouras/alface                         |
{% include caption.html content="Taxas de troca dos produtos na nossa vila." %}

Você está farejando uma oportunidade?

Sendo uma pessoa empreendedora, você pode tentar aproveitá-la. Começando com 5 cenouras, você vai até Bob e troca suas 5 cenouras por 10 batatas, na taxa em que ele está disposto a negociar.

{%include math.html content=
"
\begin{align}
5 \text{ carrots} \times 2 \space \frac{\text{potatoes}}{\text{carrots}} = 10 \text{ potatoes} \tag{1} \label{eq:arb_example}
\end{align}
" 
%}

Em seguida, você procura Peter com suas batatas, sabendo que ele lhe dará 5 alfaces por elas. Depois, você vai até Paul com suas 5 alfaces, e ele troca suas alfaces por 10 cenouras.

Depois de algumas trocas inteligentes, você dobrou sua riqueza em cenouras. Transformou 5 cenouras em 10, explorando uma oportunidade de arbitragem.

Mais adiante, os moradores da vila podem desenvolver mercados mais sofisticados, onde Bob, Peter e Paul não são os únicos negociantes. Em vez disso, essa pequena vila pode criar um mercado de cenoura/alface, um mercado de alface/batata e um mercado de batata/cenoura, nos quais a taxa vigente para cada troca varia conforme o que as pessoas estão dispostas a pagar.

Ainda assim, o princípio da arbitragem continua o mesmo. E a oportunidade pode ser explorada até que os negociantes dispostos a trocar naquelas taxas fiquem sem cenouras, alfaces ou batatas para negociar. A oportunidade de arbitragem é aproveitada até o mercado atingir o equilíbrio.

<div class="divider"></div>

## Arbitragem nos tempos modernos

Quando você pensa em mercados modernos, provavelmente não pensa em trocar cenouras, batatas e alfaces. Se você acompanha o mercado de câmbio (forex), é bem mais provável que pense em negociar dólares, libras e ienes. Nesse caso, estaríamos lidando com um mercado dólar/libra, um mercado libra/iene e um mercado iene/dólar, com muitos operadores atuando em cada um deles. A partir de agora, vamos usar essas moedas como exemplos de bens negociáveis, mas tenha em mente que os mesmos princípios valem para todo tipo de ativo.

Suponha que, em um dado momento, as taxas de câmbio sejam as seguintes:

| Mercado                 | Taxa de câmbio       |
|:-----------------------:|:--------------------:|
| libra (£) / dólar ($)   | 0,8 libras/dólar     |
| iene (¥) / libra (£)    | 100 ienes/libra      |
| dólar ($) / iene (¥)    | 0,013 dólares/iene   |
{% include caption.html content="Um exemplo de taxas de câmbio no mercado de moedas." %}

Se você aprendeu algo com Bob, Peter e Paul trocando cenouras, alfaces e batatas, já percebeu que há uma oportunidade aqui.

Se você trocar $1 por libras, ficará com £0,8. Trocando isso por ienes, você termina com ¥80. Levando seus ienes ao mercado iene/dólar, você os converte de volta para dólares… mas agora você tem $1,04!

Porém, você precisa agir rápido, antes que outro arbitrador passe na sua frente. Essas oportunidades só existem temporariamente, até que a liquidez se esgote e as taxas se equalizem.

Os leitores mais atentos devem ter notado que não consideramos taxas de corretagem no nosso exemplo. É claro que você precisaria levá-las em conta para calcular se realmente existe uma oportunidade lucrativa de arbitragem.

<div class="divider"></div>

## Agindo rápido

Espero que você já tenha alguma intuição de por que agir rápido é fundamental. As taxas de câmbio flutuam rapidamente, e existe apenas uma quantidade limitada de “mercadoria” disponível naquela taxa.

Embora tenhamos trabalhado com exemplos relativamente simples aqui, oportunidades de arbitragem podem envolver muitas trocas e se tornar incrivelmente complexas. Nossos exemplos usaram 3 trocas, mas e se fossem necessárias 10? E em uma rede de 20 moedas com um mercado para cada par, com que rapidez você conseguiria encontrar uma oportunidade?

Usar um computador é a resposta óbvia. Mas precisamos de um algoritmo eficiente, caso contrário outra pessoa vai agarrar a oportunidade antes de nós.

Para conseguir isso, podemos aproveitar algumas sacadas engenhosas da matemática e da ciência da computação.

<div class="divider"></div>

## Mercados como um grafo

Grafos são uma estrutura extremamente importante, presente em inúmeras aplicações. Muitas estruturas sociais e naturais podem ser modeladas com grafos, e os mercados não são exceção.

No nosso caso, vamos tratar cada moeda como um vértice (ou nó). Mover-se de um nó para outro corresponde a trocar uma moeda por outra.

![Grafo simplificado de moedas]({{ "/currency-graph-white.png" | prepend: page.imgpath }}){: width="448" height="283" loading="lazy" decoding="async"}
{% include caption.html content="Grafo simplificado — deveria haver uma aresta distinta em cada direção." %}

Portanto, percorrer uma aresta entre dois nós deve transformar a quantidade de moeda multiplicando-a pela taxa de câmbio.

Isso significa que ir do nó do dólar para o nó da libra corresponde a multiplicar por 0,8 libras/dólar. Vamos atribuir a taxa de câmbio como o peso de cada aresta.

Note que as taxas de câmbio em cada direção serão _aproximadamente_ o inverso uma da outra. Ou seja, se a taxa para converter dólares em libras é 0,8 libras/dólar, a taxa na direção contrária será 1/(0,8 libras/dólar) = 1,25 dólares/libra. A consequência para nós é que precisamos ter o cuidado de tratar a compra e a venda em cada mercado como arestas distintas e direcionadas, com pesos diferentes.

O motivo de as taxas de câmbio nos dois sentidos serem apenas _aproximadamente_ inversas está nas pequenas diferenças entre o preço de compra e o preço de venda das moedas, conhecidas como _spread_ de compra e venda. Por exemplo, se em um dado momento você consegue comprar libras a 0,8 libras/dólar (o preço atual pelo qual alguém vende para você), mas consegue vender dólares por libras a 0,82 libras/dólar (ou 1,22 dólares/libra, o preço atual pelo qual alguém compra de você), seu modelo de grafo ficará parecido com isto (omitindo as demais taxas de câmbio por simplicidade):

![Grafo de moedas com taxas de câmbio]({{ "/currency-graph-w-exchange-rates-white.png" | prepend: page.imgpath }}){: width="451" height="378" loading="lazy" decoding="async"}

Uma sequência de trocas pode ser modelada percorrendo arestas nesse grafo, e o resultado dessas trocas é calculado **_multiplicando_** os pesos das arestas conforme você avança por elas.

<div class="divider"></div>

## Enxergando a oportunidade

Agora que temos um modelo funcional, o que estamos procurando no nosso grafo que corresponde a uma oportunidade de arbitragem?

Para saber se uma sequência de trocas é lucrativa, precisamos de uma métrica consistente de lucratividade. Em outras palavras, se começamos nossas trocas em dólares, também precisamos terminá-las em dólares. Assim, comparando a quantidade de dólares que temos no final com a quantidade inicial, saberemos se houve lucro ou não.

No nosso grafo, isso significa que a sequência de trocas precisa terminar no mesmo nó em que começou. No nosso exemplo, começamos no nó do dólar e terminamos no nó do dólar. Na terminologia de grafos, chamamos isso de ciclo. Já sabemos que estamos procurando algum tipo de ciclo — mas que tipo de ciclo o torna lucrativo?

Observe que, ao multiplicar ao longo das arestas de um caminho, transformamos as unidades da taxa de câmbio efetiva.

{%include math.html content=
"
\begin{align}
a \space \frac{\cancel{£}}{$} \times b \space \frac{¥}{\cancel{£}} = ab \space \frac{¥}{$}  \tag{2} \label{eq:units_of_exchange_rate}
\end{align}
" 
%}

No entanto, quando retornamos ao nó inicial, a grandeza perde sua unidade. Ela deixa de ser uma taxa de câmbio e passa a ser uma razão de retorno! Percorrer um ciclo no nosso grafo e calcular o produto das taxas de câmbio ao longo do caminho corresponde a calcular o fator de retorno obtido após concluir a sequência de operações.

{%include math.html content=
"
\begin{align}
a \space \frac{\cancel{£}}{\cancel{$}} \times b \space \frac{\cancel{¥}}{\cancel{£}} \times c \space \frac{\cancel{$}}{\cancel{¥}} = abc \space \text{[dimensionless]}  \tag{3} \label{eq:unitless_exchange}
\end{align}
" 
%}

Se o mercado for perfeitamente eficiente, nossa razão de retorno, $$abc$$, será 1, porque as taxas de câmbio se equalizaram. Se o produto dos pesos for maior que 1 — digamos, 1,02 —, então nossa oportunidade de arbitragem teria nos rendido um retorno de 2%.

Logo, generalizando para um número arbitrário de trocas, uma oportunidade de arbitragem corresponde à seguinte desigualdade:

{%include math.html content=
"
\begin{align}
\prod_i^n{e_i} = e_ie_2...e_n > 1  \tag{4} \label{eq:arbitrage_return}
\end{align}
" 
%}

em que $$e_i$$ corresponde à $$i$$-ésima taxa de câmbio, para cada troca $$i$$, ao longo de $$n$$ trocas.

Portanto, o que precisamos é de um algoritmo capaz de encontrar um ciclo no grafo de mercados em que o produto dos pesos das arestas seja maior que 1. Você até poderia inventar um algoritmo novo para isso — mas na ciência da computação, assim como na vida em geral, é muito útil reduzir problemas a outros que você já sabe como resolver.

<div class="divider"></div>

## O algoritmo de Bellman-Ford

O problema de encontrar caminhos mais curtos é um problema clássico e fundamental da ciência da computação, aplicável a muitos cenários distintos. Um exemplo óbvio, associando um grafo a um mapa, é encontrar a rota mais curta entre dois pontos. Mas, com um pouco de criatividade, vários outros tipos de problemas também podem ser transformados em problemas de caminho mais curto. O que vou mostrar para você é que encontrar oportunidades de arbitragem é um desses problemas.

Primeiro, vamos definir o que é o problema do caminho mais curto. Dados dois nós em um grafo, $$s$$ e $$t$$, o caminho mais curto é aquele que minimiza a _soma_ dos pesos das arestas. Em outras palavras, avançamos pelo caminho de $$s$$ até $$t$$ somando os pesos das arestas ao longo do trajeto; o caminho com a menor soma é o caminho mais curto — o caminho de menor custo.

Em seguida, ajuda entender que existem diferentes classes de problemas de caminho mais curto. No exemplo óbvio — como a rota mais curta em um mapa —, os pesos das arestas precisam ser positivos. Não existe nenhuma forma, salvo uma máquina do tempo, de dirigir por uma estrada reduzir o seu tempo de viagem. Em um grafo com pesos apenas positivos, o famoso algoritmo de Dijkstra calcula o caminho mais curto para todos os nós do grafo.

Porém, não há nenhum motivo pelo qual um grafo não possa ter arestas com pesos negativos. Nesse caso, percorrer essa aresta reduz o custo total do caminho. Mas, se você tiver um _ciclo_ com peso total negativo, poderá ficar percorrendo esse _ciclo_ para sempre — reduzindo cada vez mais o custo total do caminho — e o caminho mais curto terá um custo tendendo a $$-\infty$$. Nesse cenário, é muito útil que o nosso algoritmo de caminho mais curto tenha um mecanismo para identificar ciclos de peso negativo. Caso contrário, ele ficaria preso dando voltas infinitamente nesse ciclo.

O algoritmo de Bellman-Ford é exatamente esse algoritmo. Sendo uma versão mais geral do algoritmo de caminho mais curto de Dijkstra, ele consegue lidar com pesos negativos. Para isso, ele detecta _ciclos de peso negativo_ — ciclos em um grafo nos quais _somar_ os pesos das arestas produz um valor negativo.

Mas como um algoritmo capaz de encontrar ciclos cuja **_soma_** das arestas é menor que 0 nos ajuda, se o que precisamos é de um algoritmo que detecte ciclos cujo **_produto_** das arestas é maior que 1?

<div class="divider"></div>

## O logaritmo entra em cena

A próxima sacada é que um produto pode ser transformado em uma soma aplicando a função logarítmica, graças à identidade:

{%include math.html content=
"
\begin{align}
\log{ab} = \log{a} + \log{b}  \tag{5} \label{eq:log_product_identity}
\end{align}
" 
%}

Com isso, podemos transformar o nosso problema de encontrar um ciclo com _produto_ maior que 1 no problema de encontrar um ciclo com _soma_ maior que 0! Fazemos isso calculando o logaritmo de cada taxa de câmbio e usando esse valor como o peso de cada aresta.

Vamos demonstrar isso aplicando o logaritmo aos dois lados da nossa desigualdade. Primeiro, aplicar o logaritmo ao lado esquerdo transforma o cálculo de um produto no cálculo de uma soma:

{%include math.html content=
"
\begin{align}
\log{\prod_i^n{e_i}} = \log{e_ie_2...e_n} = \log{e_1} + ... + \log{e_n} = \sum_i^n{\log{e_i}} \tag{6} 
\end{align}
" 
%}

O logaritmo do lado direito simplesmente transforma o 1 em 0:

{%include math.html content=
"
\begin{align}
\sum_i^n{\log{e_i}} > \log{1} \rightarrow \sum_i^n{\log{e_i}} > 0 \tag{7}
\end{align}
" 
%}

Estamos quase lá, mas ainda falta um detalhe. O passo final, para reduzir nosso problema a um que conseguimos resolver com esse algoritmo conhecido, é multiplicar o peso de cada aresta por -1. Isso transforma o problema de encontrar um ciclo de peso positivo em encontrar um ciclo de peso negativo:

{%include math.html content=
"
\begin{align}
\sum_i^n{-\log{e_i}} < 0 \tag{8}
\end{align}
" 
%}

E sabemos exatamente que o algoritmo de Bellman-Ford faz isso! Construir um grafo dessa forma e executar o algoritmo de Bellman-Ford sobre ele vai encontrar oportunidades de arbitragem de maneira rápida e eficiente, porque transformamos o problema de arbitragem no problema de encontrar o caminho mais curto — _o caminho infinitamente mais curto_.

![Grafo de moedas com logaritmo negativo]({{ "/neg-log-currency-graph-white.png" | prepend: page.imgpath }}){: width="448" height="283" loading="lazy" decoding="async"}
{% include caption.html content="Precisamos encontrar um ciclo de peso negativo, em que os pesos são o logaritmo negativo das taxas de câmbio." %}

Olhando em retrospecto, parece óbvio que deve existir uma correspondência entre um ciclo de peso negativo — que reduz o custo do caminho toda vez que você o percorre — e uma oportunidade de arbitragem, que gera lucro toda vez que você a executa. A sacada-chave é transformar o problema de encontrar um produto maior que 1 em encontrar uma soma menor que 0, aplicando $$-\log$$ aos pesos das arestas.

<div class="divider"></div>

## Prove

Vamos rodar esse algoritmo nas nossas taxas de câmbio para ver se ele identifica corretamente a oportunidade de arbitragem. Transformando as taxas de câmbio com $$-\log$$ (logaritmo natural), obtemos:

| Mercado                 | -log(Taxa de câmbio) |
|:-----------------------:|:--------------------:|
| libra (£) / dólar ($)   | 0,223                |
| iene (¥) / libra (£)    | -4,605               |
| dólar ($) / iene (¥)    | 4,343                |

Somando ao longo das trocas, nossa desigualdade se confirma — _encontramos um ciclo de peso negativo_!

{%include math.html content=
"
\begin{align}
\sum_i^n{-\log{e_i}} = 0.223 - 4.605 + 4.343 = -0.039 \label{eq:neg_log_exchange_rate_example} \tag{9}
\end{align}
" 
%}

Podemos desfazer a operação logarítmica para recuperar o produto e calcular o retorno:

{%include math.html content=
"
\begin{align}
\prod_i^n{e_i} &= \exp{\sum_i^n{-\log{e_i}}} \\
\prod_i^n{e_i} &= \exp(0.039) = 1.04 \tag{10}
\end{align}
" 
%}

Que é exatamente o retorno de 4% que calculamos anteriormente.

<div class="divider"></div>

## No mundo real

Como uma oportunidade de arbitragem corresponde a um ciclo de peso negativo, pode parecer que bastaria percorrer o ciclo para sempre para ganhar dinheiro infinito. Obviamente, não é assim que funciona.

A liquidez — o volume disponível antes que o preço mude significativamente — em qualquer oportunidade de arbitragem é limitada, e ela é explorada rapidamente por operadores algorítmicos que levam ao limite a tecnologia da computação e as leis da física para vencer uns aos outros.

Dito isso, espero que você tenha achado este exercício de aplicar teoria dos grafos e um algoritmo consagrado de caminho mais curto para resolver um problema no mundo das finanças — e ganhar dinheiro — tão interessante quanto eu sempre achei.
