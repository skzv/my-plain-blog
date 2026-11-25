---
layout: post
lang_code: pt-br
locale: pt_BR
ref: monte-carlo-options-pricing
date: 2021-12-17 00:00:00 -0700
last_modified_at: 2021-12-17 00:00
permalink: /pt-br/monte-carlo-options-pricing
title: "Precificação de opções com Monte Carlo"
imgpath: /assets/img/monte-carlo-stocks
previewurl: /gbm-example.png
description: "Explore a precificação de opções com Monte Carlo por meio de simulações interativas de movimento browniano geométrico, retornos de ações, volatilidade e payoffs descontados."
image: /assets/img/monte-carlo-stocks/gbm-example.png
image_width: 1810
image_height: 990
image_alt: "Trajetórias simuladas de preços de ações usando movimento browniano geométrico"
mathjax: true
tags: [quant-finance, simulation]
toc: true
---

_O cassino das opções_

Prever o movimento dos preços das ações é um desafio sedutor, com a promessa de grandes riquezas. Infelizmente, prever preços futuros de ações de maneira consistente e confiável é, em geral, considerado impossível. Ainda assim, podemos usar modelos para fazer previsões úteis, gerenciar riscos e lucrar *probabilisticamente*.

## Movimento browniano geométrico

Um desses modelos muito utilizados é o movimento browniano geométrico ([1](https://stats.libretexts.org/Bookshelves/Probability_Theory/Probability_Mathematical_Statistics_and_Stochastic_Processes_(Siegrist)/18%3A_Brownian_Motion/18.04%3A_Geometric_Brownian_Motion), [2](http://www.columbia.edu/~ks20/FE-Notes/4700-07-Notes-GBM.pdf)) — aliás, a famosa [fórmula de precificação de opções de Black-Scholes](https://en.wikipedia.org/wiki/Black%E2%80%93Scholes_model) também parte dessa premissa. Ele tem a seguinte forma:

{%include math.html content=
"
\begin{align}
 S(t) = S(0)\exp{((\mu-\frac{\sigma^2}{2})t + \sigma B(t))} \tag{0}  \label{eq:gbm}
\end{align}
" 
%}

em que $$B(t)$$ é o movimento browniano padrão. Se definirmos $$S(0)$$ como o preço inicial da ação, $$\mu$$ como o [retorno médio capitalizado continuamente](https://en.wikipedia.org/wiki/Rate_of_return#Logarithmic_or_continuously_compounded_return) e $$\sigma$$ como a [volatilidade](https://en.wikipedia.org/wiki/Volatility_(finance)) da ação, conseguimos gerar trajetórias de preço bastante realistas.

<div id='plot-0'></div>
<span class="slider-container">
    <span class="slider-label" class="slider-label">$$\mu$$</span>
    <span>
        <input class="slider" id="mean-slider" type="range" min="-2.5" max="1" value="0" step="0.01">
    </span>
    <span class="slider-value" id="mean-slider-value">0</span>
</span>

<span class="slider-container">
    <span class="slider-label" class="slider-label">$$\sigma$$</span>
    <span>
        <input class="slider" id="sigma-slider" type="range" min="0" max="1" value="0" step="0.01">
    </span>
    <span class="slider-value" id="sigma-slider-value">0</span>
</span>

<button class="regenerate-button" onclick="regenerate0()">Regenerar</button>

<div style="display:none" id='mean-0'>0</div>
<div style="display:none" id='sigma-0'>0</div>
<div style="display:none" id='option-mean-0'>0</div>

Afinal, o que isso significa e por que esse é um bom modelo para preços de ativos financeiros?

### Retornos logarítmicos

Em finanças quantitativas, é comum trabalhar com retornos capitalizados continuamente em vez de retornos simples. Isso significa que, em vez de analisar o retorno simples entre períodos de negociação $$1 + R_t = \frac{S(t)}{S(t-1)}$$, analisamos o retorno composto continuamente $$r_t = \ln{(1 + R_t)} = \ln{\frac{S(t)}{S(t-1))}}$$. Isso tem a ótima propriedade de permitir recuperar o preço de uma ação simplesmente somando os retornos logarítmicos:

{%include math.html content=
"
\begin{align}
 S(t) = S(0)\exp{(r_1 + r_2 + ... + r_{t-1})} \tag{1}  \label{eq:rr}
\end{align}
" 
%}

Isso também é conveniente porque uma premissa comum em finanças é que os retornos logarítmicos de uma ação são independentes e normalmente distribuídos, com média $$\mu$$ e variância $$\sigma^2$$. Note que, para retornos pequenos, os retornos simples $$R_t$$ se aproximam dos retornos logarítmicos $$r_t$$, pois $$r_t = \ln{(1 + R_t)} \approx R_t$$; logo, a diferença entre os dois não é substancial, permitindo assumir que tanto os retornos simples quanto os logarítmicos seguem uma distribuição normal. Além disso, se os retornos logarítmicos são normalmente distribuídos, isso implica que o preço da ação segue uma distribuição *log-normal*. Isso é observado empiricamente até certo ponto, embora na vida real os preços de ações tendam a apresentar "caudas mais pesadas" — isto é, eventos raros acontecem com mais frequência do que uma distribuição normal preveria. Veja abaixo os retornos mensais das ações da IBM ilustrando esse comportamento.

![Retornos mensais da IBM]({{ "/IBM-returns.webp" | prepend: page.imgpath }}){: width="1282" height="1008" loading="lazy" decoding="async"}
{% include caption.html content="Retornos mensais simples e logarítmicos das ações da IBM com distribuições normais ajustadas. Observamos mais retornos nas extremidades do que a distribuição normal preveria. Chamamos isso de 'caudas pesadas' ou 'excesso de curtose'. Imagem extraída de 'Analysis of Financial Time Series, 3rd Ed.' de Ruey S. Tsay." %}

Esse modelo também funciona bem porque só permite preços positivos para os ativos. Ativos financeiros normalmente têm apenas preços positivos (embora em casos extremos possam ficar negativos — veja o [colapso do petróleo em 2020](https://assets.weforum.org/editor/kE8TpkO7bzo3dLFWEh9UDvgqRuZPOmURhnh0FfwOVYc.png)).

Queremos, portanto, um processo que gere uma sequência de retornos $$r_t$$ normalmente distribuídos — o que faz do movimento browniano uma escolha natural.

## Movimento browniano

O [movimento browniano](https://stats.libretexts.org/Bookshelves/Probability_Theory/Probability_Mathematical_Statistics_and_Stochastic_Processes_(Siegrist)/18%3A_Brownian_Motion/18.01%3A_Standard_Brownian_Motion) descreve o movimento de uma partícula suspensa em um fluido ou gás. Essa partícula ricocheteia "aleatoriamente" no meio que a cerca, criando uma trajetória bastante ruidosa e errática. Ele pode ser encarado, em essência, como o limite de um passeio aleatório em que tanto o intervalo de tempo entre passos quanto o tamanho do passo tendem a zero (com algumas ressalvas: se o passo de tempo for $$t$$, o tamanho do passo precisa ser $$\sqrt{t}$$ — o que produz um processo cuja variância cresce exatamente de forma proporcional ao tempo). Imagine jogar uma moeda para decidir se dá um passo para frente ou para trás e depois fazer o intervalo entre passos tender a zero. Você traçaria uma curva parecida com esta:

![Movimento browniano 1D]({{ "/wiener-process-zoom.png" | prepend: page.imgpath }}){: width="800" height="600" loading="lazy" decoding="async"}
{% include caption.html content="Movimento browniano [aritmético] unidimensional. O movimento browniano geométrico é a exponencial desse processo. <a target='_blank' href='http://creativecommons.org/licenses/by-sa/3.0/' title='Creative Commons Attribution-Share Alike 3.0'>CC BY-SA 3.0</a>, <a target='_blank' href='https://commons.wikimedia.org/w/index.php?curid=1426987'>Fonte</a>" %}

O movimento browniano tem a excelente propriedade de que suas trajetórias seguem uma distribuição normal, exatamente o que procuramos. Podemos simular um processo browniano em passos discretos amostrando de uma distribuição normal (embora, se você se importasse apenas com o valor final de uma série temporal, pudesse amostrar de qualquer distribuição com variância unitária; pelo teorema central do limite, a soma de variáveis aleatórias tenderia a uma distribuição gaussiana no longo prazo de qualquer maneira).

Logo, o movimento browniano nos fornece a sequência de retornos logarítmicos normalmente distribuídos $$r_t$$ necessária em $$\eqref{eq:rr}$$:

{%include math.html content=
"
\begin{align}
 r(t) = (\mu-\frac{\sigma^2}{2})t + \sigma B(t) \tag{2}  \label{eq:bm}
\end{align}
" 
%}

Tomando a exponencial desse processo, recuperamos nossa equação para modelar a evolução do preço de uma ação.

Vale notar especialmente a taxa de tendência (_drift_) $$\mu - \frac{\sigma^2}{2}$$, que faz o processo derivar linearmente, como o nome sugere. O termo $$\mu$$ é óbvio — é o retorno médio continuamente composto da ação e, na ausência de ruído (ou volatilidade), o preço da ação apenas cresceria (ou cairia) a essa taxa composta. Mas e quanto a $$\frac{\sigma^2}{2}$$? Acontece que o valor esperado de uma variável com distribuição log-normal é $$\exp(\mu + \sigma^2/2)$$. Como o preço da ação segue uma *distribuição log-normal* (enquanto os retornos seguem uma *distribuição normal*), e queremos que o valor esperado do preço da ação após capitalização contínua seja $$S(0)\exp(\mu t)$$, precisamos aplicar o termo de correção $$-\frac{\sigma^2}{2}$$ ao processo.

Há também um argumento filosófico para escolher o movimento browniano como base desse modelo. Uma hipótese frequente em finanças é que os mercados são eficientes, de modo que não deveriam existir oportunidades de arbitragem. Logo, o mercado deveria ser imprevisível — se algum agente conseguisse prevê-lo, surgiria uma oportunidade de arbitragem que rapidamente seria explorada até desaparecer. Assim, ruído aleatório (que é, essencialmente, o que o movimento browniano representa) é uma boa escolha para modelar mercados.

## Precificação de opções

A simulação de Monte Carlo é uma técnica estatística inspirada nos cassinos de Mônaco. Assim como apostadores entregam seu destino à probabilidade, confiamos ao acaso o resultado de uma análise estatística. Executando um número suficiente de tentativas, conseguimos tirar conclusões com significância estatística.

Considere avaliar uma opção de compra (_call_) com preço de exercício (_strike_) de $105 sobre esta ação. Qual seria o valor esperado da opção no vencimento, assumindo um modelo de movimento browniano geométrico para o preço da ação? Podemos estimar isso gerando várias trajetórias de preço, cada uma funcionando como uma tentativa (ou simulação). O valor final de cada trajetória se relaciona ao valor intrínseco da opção pela fórmula $$V = \max(0, S - K)$$, em que $$S$$ é o preço da ação e $$K$$ é o preço de exercício. A média dos valores finais nos dá uma estimativa do valor da opção no vencimento, enquanto o desvio padrão desses valores finais indica o quão seguros estamos de que a opção expirará perto desse valor.

<div id='plot-1'></div>
<button class="regenerate-button" onclick="regenerate1()">Regenerar</button>
<div id='mean-1'>0</div>
<div id='sigma-1'>0</div>
<div id='option-mean-1'>0</div>

Podemos aumentar o número de simulações para elevar a certeza estatística da estimativa. Rodar a simulação novamente (clicando em "Regenerar") com um grande número de tentativas (abaixo) produz uma discrepância muito menor entre experimentos do que com poucas tentativas (acima).

<div id='plot-2'></div>
<button class="regenerate-button" onclick="regenerate2()">Regenerar</button>
<div id='mean-2'>0</div>
<div id='sigma-2'>0</div>
<div id='option-mean-2'>0</div>

## Cenários mais avançados

A simulação de Monte Carlo para valores finais é relativamente simples e nem tão indispensável, já que essa análise provavelmente pode ser feita de forma analítica. O verdadeiro poder da simulação de Monte Carlo aparece quando analisamos cenários difíceis — ou mesmo impossíveis — de resolver analiticamente. Por exemplo, se quiséssemos analisar uma opção do tipo americana, que pode ser exercida a qualquer momento, poderíamos querer calcular a probabilidade de o preço da ação ultrapassar o preço de exercício em algum instante ao longo da vida da opção. Para isso, bastaria contar quantas trajetórias cruzam a barreira do preço de exercício, algo muito simples de fazer com uma simulação de Monte Carlo.

<script defer fetchpriority="low" src="https://cdn.plot.ly/plotly-2.4.2.min.js"></script>
<script defer fetchpriority="low" src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/9.5.1/math.js" integrity="sha512-AfRcJIj922x/jSJpQLnry0DYIBg6EGCtwk/MiQ6QvDlzb7kNFxH8EdqXLkaXXY3YHQS9FrSb8H7LzuLn0CZQ1A==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script defer src="/assets/js/monte-carlo-options.js"></script>
