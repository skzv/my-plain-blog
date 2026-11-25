---
layout: post
lang_code: pt-br
locale: pt_BR
ref: gradient-descent
date: 2021-11-15 00:00:00 -0700
last_modified_at: 2021-11-15 00:00
permalink: /pt-br/gradient-descent
title: "Demonstração interativa de gradiente descendente"
imgpath: /assets/img/gradient-descent
previewurl: /gradient-descent-preview.png
description: "Uma demonstração interativa de gradiente descendente explicando gradientes, taxas de aprendizado e mínimos locais. Ajuste os parâmetros e veja o algoritmo encontrar um mínimo."
image: /assets/img/gradient-descent/gradient-descent-preview.png
image_width: 1564
image_height: 808
image_alt: "Visualização interativa de gradiente descendente"
mathjax: true
tags: [machine-learning, optimization]
---

_O que é esse algoritmo tão especial?_

O gradiente descendente é um algoritmo de otimização usado para encontrar o mínimo (local) de uma função.

## Por que isso é útil?

Suponha que você tenha uma função $$f(x,y)$$. Essa função pode representar um custo para você, e $$x$$ e $$y$$ são entradas que alteram esse custo. Naturalmente, você vai querer encontrar os valores de $$x$$ e $$y$$ que minimizam o custo. Esse é o problema de encontrar o mínimo de $$f(x,y)$$. Por exemplo, podemos querer encontrar o mínimo desta função, representada no gráfico abaixo:

{%include math.html content=
"
\begin{align}
f(x,y)=3(1 - x)^2 e^{- x^2 - (y + 1)^2} - 10(\frac{x}{5} - x^3 - y^5) e^{-x^2 - y^2} - \frac{1}{3} e^{-(x+1)^2 - y^2} \tag{0}  \label{eq:cost_func}
\end{align}
" 
%}

<div id='plot-0'></div>

É aí que o gradiente descendente entra em ação.

## Por que usar gradiente descendente?

Do cálculo elementar, você talvez se lembre de um procedimento para encontrar o mínimo de uma função: calcular a primeira derivada, igualá-la a zero e resolver essa equação:

{%include math.html content=
"
\begin{align}
f'(x,y)=0 \tag{1}  \label{eq:first_deriv}
\end{align}
" 
%}

Isso revela as posições dos extremos (máximos e mínimos) da função. O sinal da segunda derivada $$f''(x,y)$$ indica se esses extremos são máximos ou mínimos locais. No entanto, resolver a equação da primeira derivada $$\eqref{eq:first_deriv}$$ pode ser nada trivial e frequentemente exige métodos numéricos. E conforme sua função de custo envolve mais e mais dimensões — por exemplo, $$f(x,y,z,w,q,u,v,...)$$ —, o problema pode se tornar intratável. O gradiente descendente oferece um procedimento eficiente para localizar mínimos usando a primeira derivada de maneira inteligente.

## O algoritmo de gradiente descendente

A motivação por trás do gradiente descendente é intuitiva, e aposto que você chegaria ao mesmo procedimento em uma situação física análoga. Imagine que você está em meio a uma neblina densa, conseguindo enxergar apenas alguns passos à frente e sentir a inclinação do terreno sob seus pés. Seu objetivo é chegar ao fundo de um vale o mais rápido possível. Certamente, você não vai perder tempo caminhando por um trecho plano — ou, pior ainda, subindo o morro. Para descer rápido, você avalia a inclinação onde está e segue na direção em que a descida é mais íngreme. Gradiente é sinônimo de inclinação; logo, você estaria realizando uma descida pelo gradiente. Por outro lado, se quisesse chegar ao topo da colina, seguiria a direção de subida mais íngreme a partir de cada ponto. Isso é o gradiente *ascendente*.

## Gradiente

Gradiente é, essencialmente, outra palavra para inclinação. A maioria das pessoas conhece a ideia de inclinação em um cenário unidimensional. Em 1D, como só é possível ir para frente ou para trás, a inclinação é bem definida. Porém, em dimensões mais altas — imagine que você está fazendo uma trilha —, a inclinação pode assumir valores diferentes dependendo da direção escolhida. Como definir a inclinação nesse ponto?

No cálculo vetorial, usa-se o operador gradiente $$\nabla$$, que é um vetor formado pelas inclinações (ou primeiras derivadas parciais) ao longo de cada dimensão.

{%include math.html content=
"
\begin{align}
\nabla f(x,y)= \begin{bmatrix}
           \frac{\partial f}{dx} (x,y) \\
           \frac{\partial f}{dy} (x,y)
         \end{bmatrix} \tag{2}  \label{eq:gradient}
\end{align}
" 
%}

Em uma superfície 2D definida por $$f(x,y)$$, isso corresponde à inclinação ao longo do eixo x e à inclinação ao longo do eixo y. A inclinação em qualquer direção específica (o que é importante, já que não somos obrigados a andar apenas na direção do eixo x ou do eixo y) pode ser encontrada somando as componentes x e y correspondentes da inclinação nessa direção. Em outras palavras, o produto escalar entre um vetor de direção e o gradiente fornece a inclinação naquela direção.

Outra propriedade interessante do gradiente é que ele aponta na direção da maior inclinação. Podemos enxergar isso matematicamente: como a inclinação em qualquer direção é dada pelo produto escalar entre o vetor direção e o gradiente, o produto escalar é maximizado quando fazemos o produto escalar do gradiente com ele mesmo!

Abaixo, plotei o negativo do gradiente de $$f(x,y)$$ no Mathematica. Isso nos dá a direção de descida mais íngreme em cada ponto de $$f$$.

![Gradiente de f]({{ "/gradient.png" | prepend: page.imgpath }}){: width="360" height="361" loading="lazy" decoding="async"}
{% include caption.html content="Gradiente de f plotado como um campo vetorial." %}

## Siga a descida mais íngreme

Concordamos antes que, se você estivesse descendo um vale às cegas, seguiria a direção de descida mais íngreme do terreno para chegar ao fundo o quanto antes. Matematicamente, você percorre o vale seguindo o gradiente negativo em cada ponto, pois ele aponta na direção da descida mais acentuada. Olhando a imagem acima, vemos que seguir as setas nos leva a um mínimo (mas atenção: cada mínimo tem sua própria bacia de atração! Falaremos mais sobre isso adiante).

Assim, podemos definir um procedimento. Ele pode funcionar mais ou menos assim:

1. Avalie a inclinação na sua posição atual e determine a direção de descida mais íngreme

2. Dê 5 passos nessa direção

3. Se ainda estiver descendo, volte ao passo 1. Caso contrário, você chegou ao fundo!

Você deve estar se perguntando de onde tirei esses 5 passos. Bem, foi totalmente arbitrário. Mas podemos transformar isso em um parâmetro do nosso procedimento. Vamos chamá-lo de taxa de descida e atribuir-lhe o símbolo $$\alpha$$. Quanto maior a taxa de descida, menos vezes precisaremos avaliar a inclinação ao nosso redor. Computacionalmente, isso é mais eficiente — mas, como você verá, pode levar a armadilhas.

Além disso, podemos fazer outra melhoria. Quando a inclinação local ainda é muito forte, provavelmente estamos longe do fundo do vale. À medida que a inclinação fica mais suave, podemos supor que estamos nos aproximando do fundo. Portanto, faz sentido descer a um ritmo proporcional ao gradiente. Vamos representar o gradiente por $$\bar{g}$$ e redefinir o nosso procedimento de gradiente descendente:

1. Avalie a inclinação na sua posição atual e determine a direção de descida mais íngreme

2. Dê $$\alpha \times \|\bar{g}\|$$ passos nessa direção

3. Se ainda estiver descendo, volte ao passo 1. Caso contrário, você chegou ao fundo!

Em seguida, como saber se ainda estamos descendo? Uma abordagem é verificar o quanto descemos a cada iteração. Se nossa altitude mal estiver mudando, então provavelmente já estamos praticamente no fundo.

Matematicamente, nosso procedimento fica assim:

{%include math.html content=
"
\begin{align}
\bar{p}_{n+1} = \bar{p}_n - \alpha \nabla f(x,y) \tag{3}  \label{eq:grad_descent}
\end{align}
" 
%}

em que $$p_n$$ é a nossa posição na $$n$$-ésima iteração da descida. Experimente na demonstração abaixo. Alterar a taxa $$\alpha$$ muda a velocidade da descida, enquanto alterar $$X$$ e $$Y$$ muda o ponto inicial sobre a superfície. O que você observa?

<div id='plot-1'></div>

<span class="slider-container">
    <span class="slider-label" class="slider-label">X</span>
    <span>
        <input class="slider" id="x-slider" type="range" min="-3" max="3" value="0" step="0.05">
    </span>
    <span class="slider-value" id="x-slider-value">0</span>
</span>

<span class="slider-container">
    <span class="slider-label" >Y</span>
    <input class="slider" id="y-slider" type="range" min="-3" max="3" value="0" step="0.05">
    <span class="slider-value" id="y-slider-value">0</span>
</span>

<span class="slider-container">
    <span class="slider-label" >&#945;</span>
    <input class="slider" id="alpha-slider" type="range" min="0" max="0.2" value="0" step="0.001">
    <span class="slider-value" id="alpha-slider-value">0</span>
</span>

## Observações

Você provavelmente vai notar que o gradiente descendente é sensível à posição inicial. Ele puxa você na direção de um mínimo local, que pode não ser o mínimo global. A região do domínio que faz o gradiente descendente convergir para um determinado mínimo é conhecida como a bacia de atração daquele mínimo.

Você também deve notar que aumentar a taxa de descida $$\alpha$$ reduz o número de iterações necessárias para chegar ao mínimo. Porém, deixá-la grande demais faz o algoritmo passar do ponto (_overshoot_) e possivelmente divergir.

## Aprendizado de máquina

Você provavelmente já ouviu falar de gradiente descendente no contexto de aprendizado de máquina (machine learning). Nesse cenário, a função de custo representa o erro do nosso modelo de aprendizado de máquina. Por exemplo, pode ser o erro ao classificar imagens, e as entradas da função de custo são os pesos do modelo que estamos ajustando. Assim, podemos usar o gradiente descendente para encontrar a configuração ótima de pesos que minimiza o erro de classificação da rede neural! Nessa área, a taxa de descida $$\alpha$$ recebe um nome especial: é conhecida como *taxa de aprendizado* (*learning rate*). Talvez seja isso que nossos cérebros vêm fazendo desde sempre.

<script defer fetchpriority="low" src="https://cdn.plot.ly/plotly-2.4.2.min.js"></script>
<script defer fetchpriority="low" src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/9.5.1/math.js" integrity="sha512-AfRcJIj922x/jSJpQLnry0DYIBg6EGCtwk/MiQ6QvDlzb7kNFxH8EdqXLkaXXY3YHQS9FrSb8H7LzuLn0CZQ1A==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script defer src="/assets/js/gradient-descent.js"></script>
