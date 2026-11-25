---
layout: post
lang_code: es
locale: es_ES
ref: gradient-descent
date: 2021-11-15 00:00:00 -0700
last_modified_at: 2021-11-15 00:00
permalink: /es/gradient-descent
title: "Demostración interactiva de descenso de gradiente"
imgpath: /assets/img/gradient-descent
previewurl: /gradient-descent-preview.png
description: "Una demostración interactiva de descenso de gradiente que explica los gradientes, las tasas de aprendizaje y los mínimos locales. Ajusta los parámetros y observa cómo el algoritmo encuentra un mínimo."
image: /assets/img/gradient-descent/gradient-descent-preview.png
image_width: 1564
image_height: 808
image_alt: "Visualización interactiva del descenso de gradiente"
mathjax: true
tags: [machine-learning, optimization]
---

_¿Qué es este algoritmo tan especial?_

El descenso de gradiente es un algoritmo de optimización para encontrar el mínimo (local) de una función.

## ¿Por qué resulta útil?

Supón que tienes una función $$f(x,y)$$. Esta función puede representar un coste para ti, y $$x$$ e $$y$$ son unas entradas que hacen variar ese coste. Naturalmente, querrás encontrar los valores de $$x$$ e $$y$$ que minimicen el coste. Ese es el problema de encontrar el mínimo de $$f(x,y)$$. Por ejemplo, podríamos querer encontrar el mínimo de la siguiente función, representada a continuación:

{%include math.html content=
"
\begin{align}
f(x,y)=3(1 - x)^2 e^{- x^2 - (y + 1)^2} - 10(\frac{x}{5} - x^3 - y^5) e^{-x^2 - y^2} - \frac{1}{3} e^{-(x+1)^2 - y^2} \tag{0}  \label{eq:cost_func}
\end{align}
" 
%}

<div id='plot-0'></div>

Aquí es donde el descenso de gradiente puede ayudar.

## ¿Por qué usar descenso de gradiente?

Del cálculo elemental quizá recuerdes un procedimiento para encontrar el mínimo de una función. Podías calcular la primera derivada, igualarla a cero y resolver esa ecuación:

{%include math.html content=
"
\begin{align}
f'(x,y)=0 \tag{1}  \label{eq:first_deriv}
\end{align}
" 
%}

Esto revela la ubicación de los extremos (máximos y mínimos) de la función. El signo de la segunda derivada $$f''(x,y)$$ puede indicar si esos extremos son máximos o mínimos locales. Sin embargo, resolver la ecuación de la primera derivada $$\eqref{eq:first_deriv}$$ puede no ser nada trivial y a menudo requiere métodos numéricos. Y a medida que tu función de coste involucra cada vez más dimensiones, por ejemplo $$f(x,y,z,w,q,u,v,...)$$, el problema puede volverse inmanejable. El descenso de gradiente ofrece un procedimiento eficiente para localizar mínimos aprovechando la primera derivada de una manera ingeniosa.

## El algoritmo de descenso de gradiente

La motivación detrás del descenso de gradiente es muy intuitiva, y apuesto a que llegarías al mismo procedimiento en una situación física análoga. Imagina que te encuentras en medio de una niebla espesa, donde solo puedes ver unos pocos metros delante de ti y sentir la inclinación del terreno bajo tus pies. Quieres llegar al fondo de un valle lo más rápido posible. Seguro que no perderías el tiempo caminando en llano, ni mucho menos subiendo cuesta arriba. Para bajar rápido, evaluarías la pendiente en tu posición actual y avanzarías en la dirección en la que el terreno baja con mayor inclinación. Gradiente es sinónimo de pendiente; por lo tanto, estarías haciendo descenso de gradiente. A la inversa, si quisieras llegar a la cima de la colina, seguirías siempre la parte más empinada hacia arriba allá donde estés. Eso sería *ascenso* de gradiente.

## El gradiente
Gradiente es, en esencia, otra palabra para pendiente. La mayoría de la gente está familiarizada con calcular una pendiente en una dimensión. En 1D, como solo se puede avanzar hacia delante o hacia atrás, la pendiente está claramente definida. Sin embargo, en dimensiones superiores —imagina que estás haciendo una ruta por la montaña— la pendiente puede tener un valor distinto según la dirección que tomes. ¿Cómo se define entonces la pendiente en ese punto?

En cálculo vectorial se utiliza el operador gradiente $$\nabla$$, que es un vector formado por las pendientes (o primeras derivadas parciales) a lo largo de cada dimensión.

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

En una superficie 2D definida por $$f(x,y)$$, esto sería la pendiente a lo largo del eje $$x$$ y la pendiente a lo largo del eje $$y$$. La pendiente en cualquier dirección concreta (lo cual es importante, ya que no estamos limitados a movernos solo a lo largo del eje $$x$$ o del eje $$y$$) puede hallarse sumando las componentes $$x$$ e $$y$$ correspondientes de la pendiente en esa dirección. Dicho de otro modo, el producto escalar de un vector de dirección con el gradiente da la pendiente en esa dirección.

Otra propiedad interesante del gradiente es que indica la dirección de máxima pendiente. Se puede ver matemáticamente: puesto que la pendiente en cualquier dirección dada se obtiene mediante el producto escalar de ese vector de dirección con el gradiente, el producto escalar alcanza su valor máximo cuando se calcula del gradiente consigo mismo.

Abajo he representado el gradiente negativo de $$f(x,y)$$ con Mathematica. Esto nos da la dirección de descenso más pronunciado en cada punto de $$f$$.

![Gradiente de f]({{ "/gradient.png" | prepend: page.imgpath }}){: width="360" height="361" loading="lazy" decoding="async"}
{% include caption.html content="Gradiente de f representado como un campo vectorial." %}

## Seguir la pendiente más pronunciada hacia abajo
Antes estuvimos de acuerdo en que, si descendieras a ciegas por un valle, seguirías la dirección de mayor bajada del terreno para llegar al fondo lo más rápido posible. Matemáticamente, estás bajando por el valle siguiendo el gradiente en cada punto, ya que el vector gradiente (en sentido negativo) en cada punto señala la dirección de descenso más pronunciado. Mirando la imagen anterior, vemos que seguir las flechas nos llevará a un mínimo (pero cuidado: ¡cada mínimo tiene su propia cuenca de atracción! Hablaremos de eso más adelante).

Así podemos definir un procedimiento. Podría ser algo parecido a esto:

1. Inspecciona la pendiente en tu posición y determina la dirección de descenso más pronunciado.

2. Da 5 pasos en esa dirección.

3. Si sigues descendiendo, vuelve al paso 1. De lo contrario, ¡has llegado al fondo!

Quizá te preguntes cómo llegué a elegir 5 pasos. Bueno, fue totalmente arbitrario. Pero podemos convertirlo en un parámetro de nuestro procedimiento. Llamémoslo tasa de descenso y asignémosle el símbolo $$\alpha$$. Cuanto mayor sea la tasa de descenso, con menos frecuencia tendremos que inspeccionar la pendiente a nuestro alrededor. Computacionalmente esto es más eficiente, pero, como verás, puede llevar a problemas.

Además, podemos introducir otra mejora. Cuando la pendiente local sigue siendo pronunciada, probablemente estamos lejos del fondo del valle. Pero a medida que la pendiente se vuelve más plana, podemos deducir que probablemente nos estamos acercando al fondo. Por tanto, conviene descender a una velocidad proporcional al gradiente. Denotemos el gradiente con el símbolo $$\bar{g}$$ y redefinamos nuestro procedimiento de descenso de gradiente:

1. Inspecciona la pendiente en tu posición y determina la dirección de descenso más pronunciado.

2. Da $$\alpha \times \|\bar{g}\|$$ pasos en esa dirección.

3. Si sigues descendiendo, vuelve al paso 1. De lo contrario, ¡has llegado al fondo!

A continuación, ¿cómo determinamos si seguimos descendiendo? Una forma consiste en comprobar cuánto hemos bajado en cada iteración. Si apenas estamos cambiando de altitud, entonces probablemente ya estemos prácticamente en el fondo.

Matemáticamente, nuestro procedimiento se expresa así:

{%include math.html content=
"
\begin{align}
\bar{p}_{n+1} = \bar{p}_n - \alpha \nabla f(x,y) \tag{3}  \label{eq:grad_descent}
\end{align}
" 
%}

donde $$p_n$$ es nuestra posición en la $$n$$-ésima iteración del descenso. Pruébalo en la demostración de abajo. Al variar la tasa $$\alpha$$ cambia la velocidad del descenso, mientras que al variar $$X$$ e $$Y$$ cambia el punto inicial sobre la superficie. ¿Qué observas?

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

## Observaciones

Puede que notes que el descenso de gradiente es sensible a la posición inicial. Te arrastrará hacia un mínimo local, que puede no ser el mínimo global. La región del dominio que hace que el descenso de gradiente converja hacia un mínimo concreto se conoce como la cuenca de atracción de ese mínimo.

También notarás que aumentar la tasa de descenso $$\alpha$$ reduce el número de iteraciones necesarias para llegar al mínimo. Pero hacerla demasiado grande provoca que el algoritmo se pase de largo y, posiblemente, diverja.

## Aprendizaje automático

Probablemente hayas oído hablar del descenso de gradiente en el contexto del aprendizaje automático. En ese ámbito, la función de coste representa el error de nuestro modelo de aprendizaje automático. Por ejemplo, puede ser el error al clasificar imágenes, y las entradas de la función de coste son los pesos del modelo que vamos ajustando. Por lo tanto, podemos usar el descenso de gradiente para encontrar la configuración óptima de pesos que minimice el error de clasificación de la red neuronal. En este campo, la tasa de descenso $$\alpha$$ recibe un nombre especial: se conoce como la *tasa de aprendizaje* (*learning rate*). Quién sabe si no es lo que nuestros cerebros han estado haciendo desde siempre.

<script defer fetchpriority="low" src="https://cdn.plot.ly/plotly-2.4.2.min.js"></script>
<script defer fetchpriority="low" src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/9.5.1/math.js" integrity="sha512-AfRcJIj922x/jSJpQLnry0DYIBg6EGCtwk/MiQ6QvDlzb7kNFxH8EdqXLkaXXY3YHQS9FrSb8H7LzuLn0CZQ1A==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script defer src="/assets/js/gradient-descent.js"></script>
