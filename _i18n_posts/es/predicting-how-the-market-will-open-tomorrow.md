---
layout: post
lang_code: es
locale: es_ES
ref: predicting-how-the-market-will-open-tomorrow
date: 2025-03-23 00:00:00 -0700
last_modified_at: 2025-03-23 00:00
permalink: /es/predicting-how-the-market-will-open-tomorrow
title: "Prediciendo cómo abrirá el mercado mañana"
imgpath: /assets/img/predicting-market-open
previewurl: /preview.png
description: "Cómo los futuros sobre índices, los tipos de interés y la rentabilidad por dividendo permiten estimar la próxima apertura del mercado, con el cálculo del coste de mantenimiento y mi panel impliedopen.com."
image: /assets/img/predicting-market-open/og-preview.png
image_width: 1200
image_height: 630
image_alt: "Panel de apertura implícita del mercado"
mathjax: true
tags: [quant-finance]
---

_Prediciendo el futuro_

Un fin de semana salieron malas noticias económicas y me preguntaba cómo afectarían al mercado en la apertura del lunes. Investigué esta cuestión y descubrí que,
mientras la bolsa está cerrada, la negociación de futuros sobre los índices subyacentes continúa, y podemos observar el mercado de futuros para entender cómo los operadores ya están reaccionando y descontando la nueva información, como si fuera una bola de cristal 🔮.

Como los precios futuros y
los precios actuales están relacionados, podemos calcular qué valor razonable actual están descontando los mercados de futuros para cada índice descontando el valor futuro hacia atrás en el tiempo. Esto nos da el precio de apertura implícito de cada índice incluso antes de que abra el mercado, de modo que el domingo por la noche podemos ver si el mercado probablemente abrirá <span style="color: #66ff66;">al alza</span> o <span style="color: #ff6666;">a la baja</span> al día siguiente.

A continuación, repaso todas las piezas de este cálculo, que culminan en un panel que construí y que nos ofrece un adelanto de los movimientos de apertura del día siguiente en [impliedopen.com](https://impliedopen.com).


![Vista previa del panel que construí y que nos ofrece un adelanto de los movimientos del mercado al día siguiente.]({{ "/save-game.webp" | prepend: page.imgpath }}){: width="1168" height="1312" fetchpriority="high" decoding="async"}
{% include caption.html content="Vista previa del panel que construí y que nos ofrece un adelanto de los movimientos del mercado al día siguiente." %}

## Futuros

Los futuros (contratos de futuros) son instrumentos que permiten a los operadores apostar por el precio *futuro* de un activo subyacente en la fecha de vencimiento del contrato. Fíjate en el precio y la fecha de vencimiento del futuro del SP500 de abajo. Cotiza por encima del precio actual del SP500, pero ¿qué nos dice eso sobre cuál es el valor actual del SP500?

Para relacionar el precio de los futuros con el valor razonable actual que descuenta el mercado de futuros, debemos tener en cuenta el tiempo que queda desde hoy hasta la fecha de vencimiento del futuro.

![Contrato de futuros del SP500]({{ "/futures-price.webp" | prepend: page.imgpath }}){: width="943" height="826" loading="lazy" decoding="async"}
{% include caption.html content="Contrato de futuros del SP500" %}

Lo hacemos usando el modelo de coste de mantenimiento (*cost of carry*), que tiene en cuenta el tipo de interés libre de riesgo,
la rentabilidad por dividendo y el tiempo hasta el vencimiento. Asume que el precio del índice debería crecer al tipo
libre de riesgo actual (esencialmente un supuesto de ausencia de arbitraje) menos las caídas de precio provocadas por el pago de dividendos.

Podemos expresar esta relación como:

{% include math.html content=
"
\begin{align}
    F = S \times e^{(r - q) \times t} \tag{0}  \label{eq:coc}
\end{align}
"
 %}

donde $$F$$ es el precio del futuro, $$S$$ es el precio actual de la acción o índice, $$r$$ es el tipo de interés libre de riesgo,
$$q$$ es la rentabilidad por dividendo y $$t$$ es el tiempo hasta el vencimiento.

## Volver atrás en el tiempo

Para calcular el valor razonable actual del índice a partir del precio del futuro, podemos descontar el precio del futuro hacia atrás en el tiempo invirtiendo la fórmula anterior:

{% include math.html content=
"
\begin{align}
    S = F \times e^{-(r - q) \times t} \tag{1}  \label{eq:discount}
\end{align}
"
 %}

Antes de que abra el mercado, este valor razonable es nuestra mejor estimación del precio de apertura del índice.

## Tipo de interés libre de riesgo

¿Existe siquiera una inversión libre de riesgo? Bueno, las letras del Tesoro (*Treasury bills*) —deuda emitida por el Tesoro de Estados Unidos— se consideran (casi) libres de riesgo porque:
- el Gobierno de Estados Unidos tiene una probabilidad muy baja de impago; puede emitir su propia moneda y tiene un sólido historial pagando sus deudas
- el vencimiento a corto plazo reduce la exposición a cambios en los tipos de interés y a incertidumbres a largo plazo
- es un mercado muy líquido
- no existe riesgo crediticio, ya que el Gobierno estadounidense no quebrará como ocurre en el caso de bonos corporativos o municipales

Para el tipo libre de riesgo en estos cálculos elijo la letra del Tesoro a 3 meses.

![Rendimiento del bono del Tesoro de EE. UU. a 3 meses]({{ "/3m-bond-yield-1.png" | prepend: page.imgpath }}){: width="993" height="633" loading="lazy" decoding="async"}
{% include caption.html content="Rendimiento de la letra del Tesoro de EE. UU. a 3 meses" %}

Asumimos que los activos subyacentes crecerán al menos al tipo libre de riesgo, porque de lo contrario los inversores no se molestarían en poner su dinero en estos instrumentos.

## Rentabilidad por dividendo

Aunque asumimos que los instrumentos subyacentes crecerán al menos al tipo libre de riesgo, debemos tener en cuenta que los índices subyacentes bajan en una cuantía equivalente cuando se reparten dividendos. Para ello, utilizo la rentabilidad por dividendo más reciente de cada índice, aunque un modelo más preciso probablemente intentaría anticipar cuál será la rentabilidad por dividendo futura.

A continuación se muestra la última rentabilidad por dividendo del SP500 que uso para mis cálculos.

![Última rentabilidad por dividendo del SP500]({{ "/sp500-dividend-yield.png" | prepend: page.imgpath }}){: width="873" height="641" loading="lazy" decoding="async"}
{% include caption.html content="Última rentabilidad por dividendo del SP500" %}

## Juntando todas las piezas

Recopilo el último precio del índice, el precio actual de cotización del futuro, mi mejor estimación de la rentabilidad por dividendo, el tipo libre de riesgo y el tiempo hasta el vencimiento, y calculo mi mejor estimación actual del valor razonable de cada índice principal. He reunido todas las piezas en [impliedopen.com](https://impliedopen.com), que he incrustado aquí abajo:

<iframe src="https://impliedopen.com" title="Panel de apertura implícita del mercado Implied Open" width="100%" height="1200px"></iframe>

Este panel resulta más útil cuando el mercado de futuros está abierto pero el mercado regular está cerrado, ya que nos permite usar los futuros para saber qué están descontando los operadores antes de la apertura regular. Cuando el mercado regular está abierto, muestra el valor actual «real» de cada índice, tal como cotiza en el mercado.

![Vista del estado del mercado]({{ "/market-status.png" | prepend: page.imgpath }}){: width="751" height="159" loading="lazy" decoding="async"}
{% include caption.html content="Vista del estado del mercado" %}

## Notas finales

Monté este panel bastante rápido y acabé haciendo scraping de muchos de los valores, que guardo en caché una vez por minuto en mi propia API :) Pido disculpas si algo se rompe o se cae; en algún momento lo sustituiré por APIs oficiales, o bien este panel dejará de tener sentido a medida que los mercados avancen hacia la negociación 24/7. En cualquier caso, quería dejar constancia en este artículo del blog para que quedara documentado.

![Es lo que hay.]({{ "/it-is-what-it-is.png" | prepend: page.imgpath }}){: width="690" height="365" loading="lazy" decoding="async"}
{% include caption.html content="Es lo que hay." %}

Si detectas errores en mis cálculos o tienes sugerencias o comentarios, ¡no dudes en ponerte en contacto conmigo y hacérmelo saber!
