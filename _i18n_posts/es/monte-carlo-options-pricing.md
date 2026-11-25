---
layout: post
lang_code: es
locale: es_ES
ref: monte-carlo-options-pricing
date: 2021-12-17 00:00:00 -0700
last_modified_at: 2021-12-17 00:00
permalink: /es/monte-carlo-options-pricing
title: "Valoración de opciones mediante Monte Carlo"
imgpath: /assets/img/monte-carlo-stocks
previewurl: /gbm-example.png
description: "Explora la valoración de opciones mediante Monte Carlo con simulaciones interactivas de movimiento browniano geométrico, rendimientos bursátiles, volatilidad y pagos esperados."
image: /assets/img/monte-carlo-stocks/gbm-example.png
image_width: 1810
image_height: 990
image_alt: "Trayectorias simuladas de precios de acciones mediante movimiento browniano geométrico"
mathjax: true
tags: [quant-finance, simulation]
toc: true
---

_El casino de las opciones_

Predecir el movimiento del precio de las acciones es un reto tentador con la promesa de grandes riquezas. Por desgracia, predecir los precios futuros de forma constante y fiable se considera en general imposible. Sin embargo, podemos usar modelos para hacer predicciones útiles, gestionar el riesgo y obtener beneficios de forma *probabilística*.

## Movimiento browniano geométrico
Uno de los modelos más utilizados es el movimiento browniano geométrico ([1](https://stats.libretexts.org/Bookshelves/Probability_Theory/Probability_Mathematical_Statistics_and_Stochastic_Processes_(Siegrist)/18%3A_Brownian_Motion/18.04%3A_Geometric_Brownian_Motion), [2](http://www.columbia.edu/~ks20/FE-Notes/4700-07-Notes-GBM.pdf)); de hecho, la famosa [fórmula de valoración de opciones de Black-Scholes](https://en.wikipedia.org/wiki/Black%E2%80%93Scholes_model) también parte de este supuesto. Tiene la siguiente forma:

{%include math.html content=
"
\begin{align}
 S(t) = S(0)\exp{((\mu-\frac{\sigma^2}{2})t + \sigma B(t))} \tag{0}  \label{eq:gbm}
\end{align}
" 
%}

donde $$B(t)$$ es un movimiento browniano estándar. Si tomamos $$S(0)$$ como el precio inicial de la acción, $$\mu$$ como la media del [rendimiento compuesto](https://en.wikipedia.org/wiki/Rate_of_return#Logarithmic_or_continuously_compounded_return) y $$\sigma$$ como la [volatilidad](https://en.wikipedia.org/wiki/Volatility_(finance)) de una acción, podemos generar trayectorias de precios muy realistas.

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

Entonces, ¿qué significa todo esto y por qué es un buen modelo para los precios de los valores financieros?

### Rendimientos logarítmicos
En finanzas cuantitativas es habitual trabajar con rendimientos compuestos de forma continua en lugar de rendimientos simples. Esto significa que, en vez de analizar el rendimiento simple entre periodos de negociación $$1 + R_t = \frac{S(t)}{S(t-1)}$$, analizamos el rendimiento compuesto $$r_t = \ln{(1 + R_t)} = \ln{\frac{S(t)}{S(t-1))}}$$. Esto tiene la propiedad muy práctica de que podemos recuperar el precio de una acción simplemente sumando los rendimientos logarítmicos así:

{%include math.html content=
"
\begin{align}
 S(t) = S(0)\exp{(r_1 + r_2 + ... + r_{t-1})} \tag{1}  \label{eq:rr}
\end{align}
" 
%}

También resulta conveniente porque una suposición habitual en finanzas es que los rendimientos logarítmicos de una acción son independientes y siguen una distribución normal con media $$\mu$$ y varianza $$\sigma^2$$. Observa que, para rendimientos pequeños, los rendimientos simples $$R_t$$ se aproximan a los rendimientos logarítmicos $$r_t$$, ya que $$r_t = \ln{(1 + R_t)} \approx R_t$$, de modo que la diferencia entre ambos no es sustancial y puede asumirse que tanto los rendimientos simples como los logarítmicos siguen una distribución normal. A continuación, si los rendimientos logarítmicos se distribuyen normalmente, eso implica a su vez que el precio de la acción sigue una distribución *lognormal*. Esto se ha observado empíricamente hasta cierto punto, aunque en la realidad los precios de las acciones tienden a tener «colas más pesadas» (*fat tails*), lo que significa que los eventos extremos ocurren con más frecuencia de lo que predeciría una distribución normal. Aquí puedes ver los rendimientos mensuales de las acciones de IBM mostrando este comportamiento.

![Rendimientos mensuales de IBM]({{ "/IBM-returns.webp" | prepend: page.imgpath }}){: width="1282" height="1008" loading="lazy" decoding="async"}
{% include caption.html content="Rendimientos mensuales simples y logarítmicos de las acciones de IBM con distribuciones normales ajustadas. Observamos más rendimientos en los extremos de las distribuciones de los que predeciría una distribución normal. A esto lo llamamos 'colas pesadas' o 'exceso de curtosis'. Imagen tomada de 'Analysis of Financial Time Series, 3rd Ed.' de Ruey S. Tsay." %}

Este modelo también funciona bien porque solo admite precios positivos para los valores. Los valores financieros suelen tener únicamente precios positivos (aunque en algunos casos pueden volverse negativos; véase el [desplome del petróleo de 2020](https://assets.weforum.org/editor/kE8TpkO7bzo3dLFWEh9UDvgqRuZPOmURhnh0FfwOVYc.png)).

Así que queremos un proceso que genere una serie de rendimientos $$r_t$$ distribuidos normalmente, lo que convierte al movimiento browniano en la elección natural.


## Movimiento browniano
El [movimiento browniano](https://stats.libretexts.org/Bookshelves/Probability_Theory/Probability_Mathematical_Statistics_and_Stochastic_Processes_(Siegrist)/18%3A_Brownian_Motion/18.01%3A_Standard_Brownian_Motion) describe el movimiento de una partícula en un fluido o gas. Esa partícula rebota de forma «aleatoria» dentro del fluido que la rodea, trazando una trayectoria muy ruidosa y errática. En esencia, puede considerarse el caso límite de un paseo aleatorio en el que tanto el tiempo entre pasos como la longitud del paso tienden a cero (con un matiz importante: si el intervalo de tiempo es $$t$$, la longitud del paso debe ser $$\sqrt{t}$$, lo que produce un proceso cuya varianza escala exactamente con el tiempo). Imagina lanzar una moneda para decidir si das un paso hacia delante o hacia atrás. Ahora haz que el tiempo entre pasos tienda a cero. Trazarías una trayectoria parecida a esta:

![Movimiento browniano unidimensional]({{ "/wiener-process-zoom.png" | prepend: page.imgpath }}){: width="800" height="600" loading="lazy" decoding="async"}
{% include caption.html content="Movimiento browniano [aritmético] unidimensional. El movimiento browniano geométrico es la exponencial de este proceso. <a target='_blank' href='http://creativecommons.org/licenses/by-sa/3.0/' title='Creative Commons Attribution-Share Alike 3.0'>CC BY-SA 3.0</a>, <a target='_blank' href='https://commons.wikimedia.org/w/index.php?curid=1426987'>Fuente</a>" %}

El movimiento browniano tiene la excelente propiedad de que sus trayectorias se distribuyen normalmente, justo lo que buscamos. Podemos simular un proceso browniano con pasos discretos muestreando de una distribución normal (aunque si solo te interesara el valor final de una serie temporal, podrías muestrear de cualquier distribución con varianza unitaria; gracias al teorema del límite central, la suma de variables aleatorias se aproximaría de todos modos a una distribución gaussiana a largo plazo).

Por consiguiente, el movimiento browniano nos proporciona la serie de rendimientos logarítmicos normalmente distribuidos $$r_t$$ que necesitamos en $$\eqref{eq:rr}$$:

{%include math.html content=
"
\begin{align}
 r(t) = (\mu-\frac{\sigma^2}{2})t + \sigma B(t) \tag{2}  \label{eq:bm}
\end{align}
" 
%}

Al tomar la exponencial de este proceso, recuperamos una ecuación para modelar el movimiento del precio de una acción.

Resulta especialmente interesante aquí la tasa de deriva $$\mu - \frac{\sigma^2}{2}$$, que hace que el proceso derive linealmente, tal como sugiere su nombre. $$\mu$$ es evidente: es el rendimiento compuesto continuo medio de la acción, y en ausencia de ruido (o volatilidad), el precio de la acción solo crecería (o caería) a ese ritmo compuesto. Pero ¿qué pasa con $$\frac{\sigma^2}{2}$$? Resulta que el valor esperado de una variable con distribución lognormal es $$\exp(\mu + \sigma^2/2)$$. Como el precio de la acción sigue una distribución *lognormal* (mientras que los rendimientos siguen una distribución *normal*), y exigimos que el valor esperado del precio de la acción tras la capitalización continua sea $$S(0)\exp(\mu t)$$, debemos aplicar el término de corrección $$-\frac{\sigma^2}{2}$$ al proceso.

También existe un argumento filosófico para elegir el movimiento browniano como base de este modelo. Una suposición habitual en finanzas es que los mercados son eficientes, de modo que no debería haber oportunidades de arbitraje. Por lo tanto, el mercado debería ser impredecible: si algún participante pudiera predecirlo, eso constituiría una oportunidad de arbitraje que acabaría desapareciendo al explotarse. De ahí que el ruido aleatorio (que es, en esencia, lo que representa el movimiento browniano) sea una buena elección para modelar los mercados.

## Valoración de opciones

La simulación de Monte Carlo es una técnica estadística inspirada en los casinos de Mónaco. Igual que los jugadores encomiendan su suerte a la probabilidad, nosotros confiamos los resultados del análisis estadístico al azar. Ejecutando suficientes ensayos, podemos extraer conclusiones con significación estadística.

Consideremos la valoración de una opción de compra (*call*) con un precio de ejercicio (*strike*) de $105 para esta acción. ¿Cuál sería el valor esperado de la opción al vencimiento, suponiendo un movimiento browniano geométrico para la evolución de la acción? Podemos estimarlo generando una serie de trayectorias de precios, cada una de las cuales constituye un ensayo. El valor final de cada ensayo se relaciona con el valor intrínseco de la opción mediante $$V = \max(0, S - K)$$, donde $$S$$ es el precio de la acción y $$K$$ es el precio de ejercicio. La media de los valores finales nos da una estimación del valor de la opción al vencimiento, mientras que la desviación estándar de dichos valores nos indica cuánta certeza tenemos de que la opción venza cerca de ese valor.

<div id='plot-1'></div>
<button class="regenerate-button" onclick="regenerate1()">Regenerar</button>
<div id='mean-1'>0</div>
<div id='sigma-1'>0</div>
<div id='option-mean-1'>0</div>

Podemos aumentar el número de ensayos para incrementar la certeza estadística de la estimación. Volver a ejecutar la simulación (haciendo clic en «Regenerar») con un gran número de ensayos (abajo) produce mucha menos discrepancia entre experimentos que con un número pequeño de ensayos (arriba).

<div id='plot-2'></div>
<button class="regenerate-button" onclick="regenerate2()">Regenerar</button>
<div id='mean-2'>0</div>
<div id='sigma-2'>0</div>
<div id='option-mean-2'>0</div>

## Escenarios más avanzados
La simulación de Monte Carlo de valores al vencimiento es un ejercicio relativamente sencillo y no demasiado útil por sí solo, ya que este análisis puede resolverse analíticamente. El verdadero poder de la simulación de Monte Carlo aparece al analizar escenarios que resultan mucho más difíciles, si no imposibles, de resolver de forma analítica. Por ejemplo, si quisiéramos analizar una opción de estilo americano, que puede ejercerse en cualquier momento, podríamos querer calcular la probabilidad de que el precio de la acción supere el precio de ejercicio en cualquier instante durante la vida de la opción. Podríamos hacerlo contando cuántos ensayos cruzan el umbral del precio de ejercicio, algo muy sencillo mediante una simulación de Monte Carlo.

<script defer fetchpriority="low" src="https://cdn.plot.ly/plotly-2.4.2.min.js"></script>
<script defer fetchpriority="low" src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/9.5.1/math.js" integrity="sha512-AfRcJIj922x/jSJpQLnry0DYIBg6EGCtwk/MiQ6QvDlzb7kNFxH8EdqXLkaXXY3YHQS9FrSb8H7LzuLn0CZQ1A==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script defer src="/assets/js/monte-carlo-options.js"></script>
