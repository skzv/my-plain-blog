---
layout: post
lang_code: es
locale: es_ES
ref: arbitrage-as-a-shortest-path-problem
date: 2021-04-25 00:00:00 -0700
last_modified_at: 2021-04-25 00:00
permalink: /es/arbitrage-as-a-shortest-path-problem
title: "El arbitraje como un problema de camino más corto"
imgpath: /assets/img/arbitrage-as-a-shortest-path-problem
previewurl: /currency-graph-on-black.png
description: "Cómo el arbitraje de divisas se convierte en un problema de grafos usando logaritmos y el algoritmo de Bellman-Ford para encontrar ciclos rentables."
image: /assets/img/arbitrage-as-a-shortest-path-problem/og-preview.png
image_width: 1200
image_height: 630
image_alt: "Grafo de tipos de cambio de divisas utilizado para explicar el arbitraje"
mathjax: true
tags: [quant-finance, algorithms]
toc: true
---
{% include description.html content="Una explicación del arbitraje y un vistazo a un algoritmo eficiente para encontrar oportunidades de arbitraje instantáneas y sin riesgo." %}

_¿A quién no le gusta ganar dinero?_

¿Y si pudieras convertir el problema de ganar dinero en el problema de encontrar el camino más corto? Podemos hacerlo de al menos una manera concreta: aprovechando oportunidades de arbitraje.

## ¿Qué es el arbitraje?

El _arbitraje_ consiste en comprar o vender bienes en distintos mercados, o bajo distintas formas, para beneficiarse de las diferencias de precio. ¿Y cómo se llama a quienes lo practican? Se les conoce como _arbitrajistas_ — un título sin duda elegante.

Empecemos con un ejemplo. Supongamos que Paul, Peter y Bob viven en un pueblo donde intercambian zanahorias, patatas y lechugas. Bob cambia patatas por zanahorias, Peter cambia lechugas por patatas y Paul cambia lechugas por zanahorias.

Además, Bob ofrece 2 patatas por una zanahoria, Peter ofrece 1 lechuga por 2 patatas y Paul ofrece 2 zanahorias por 1 lechuga. Si tratáramos a cada persona como un mercado para sus respectivos bienes, ¿cómo quedarían los tipos de cambio?

| Mercado                        | Tipo de cambio                            |
|:------------------------------:|:-----------------------------------------:|
| Bob (patatas por zanahorias)   | 2 patatas/zanahoria                       |
| Peter (lechugas por patatas)   | 1 lechuga/2 patatas = 0.5 lechugas/patata |
| Paul (zanahorias por lechugas) | 2 zanahorias/lechuga                      |
{% include caption.html content="Tipos de cambio de bienes en nuestro pueblo." %}

¿Percibes una oportunidad?

Siendo una persona emprendedora, podrías intentar aprovecharla. Empezando con 5 zanahorias, te acercas a Bob y cambias tus 5 zanahorias por 10 patatas, al tipo de cambio al que él está dispuesto a operar.

{%include math.html content=
"
\begin{align}
5 \text{ carrots} \times 2 \space \frac{\text{potatoes}}{\text{carrots}} = 10 \text{ potatoes} \tag{1} \label{eq:arb_example}
\end{align}
" 
%}

A continuación, vas a ver a Peter con tus patatas, sabiendo que te dará 5 lechugas a cambio. Luego te acercas a Paul con tus 5 lechugas, y él te entrega 10 zanahorias por tus lechugas.

Tras unos pocos intercambios astutos, has duplicado tu riqueza en zanahorias. Convertiste 5 zanahorias en 10 aprovechando una oportunidad de arbitraje.

Más adelante, los habitantes del pueblo podrían desarrollar mercados más sofisticados donde Bob, Peter y Paul no sean los únicos comerciantes. En su lugar, este pequeño pueblo podría tener un mercado de zanahorias/lechugas, un mercado de lechugas/patatas y un mercado de patatas/zanahorias, en los que el tipo de cambio vigente fluctúe según lo que la gente esté dispuesta a intercambiar.

Pero el principio del arbitraje sigue siendo el mismo. Y la oportunidad puede aprovecharse hasta que los comerciantes que ofrecen intercambiar a esos tipos se queden sin zanahorias, lechugas o patatas. La oportunidad de arbitraje se explota hasta que el mercado alcanza un equilibrio.

<div class="divider"></div>

## El arbitraje en los tiempos modernos

Cuando piensas en los mercados modernos, probablemente no piensas en intercambiar zanahorias, patatas y lechugas. Si te interesa el mercado de divisas (forex), es más probable que pienses en operar con dólares, libras y yenes. En ese caso, estaríamos tratando con un mercado dólar/libra, un mercado libra/yen y un mercado yen/dólar, con muchos operadores actuando en cada uno. A partir de ahora usaremos estas divisas como ejemplo de bienes negociables, pero ten en cuenta que los mismos principios se aplican a todo tipo de activos intercambiables.

Supongamos que, en un momento dado, los tipos de cambio son los siguientes:

| Mercado                | Tipo de cambio      |
|:----------------------:|:-------------------:|
| libra (£) / dólar ($)  | 0.8 libras/dólar    |
| yen (¥) / libra (£)    | 100 yenes/libra     |
| dólares ($) / yen (¥)  | 0.013 dólares/yen   |
{% include caption.html content="Ejemplo de tipos de cambio en el mercado de divisas." %}

Si aprendiste algo de Bob, Peter y Paul intercambiando zanahorias, lechugas y patatas, detectarás una oportunidad aquí.

Si cambias $1 por libras, obtendrás £0.8. Al cambiarlas por yenes, acabarás con ¥80. Llevas tus yenes al mercado yen/dólar para volver a cambiarlos por dólares… ¡y ahora tienes $1.04!

Pero tienes que actuar rápido, antes de que otro arbitrajista se te adelante. Estas oportunidades solo existen temporalmente, hasta que se agota la liquidez y los tipos de cambio se igualan.

Los más observadores habrán notado que en nuestro ejemplo no hemos tenido en cuenta las comisiones de cambio. Por supuesto, habría que incluirlas para calcular si realmente existe una oportunidad de arbitraje rentable.

<div class="divider"></div>

## Actuar con rapidez

Con suerte, ya tienes cierta intuición de por qué actuar rápido es fundamental. Los tipos de cambio fluctúan con rapidez y solo hay una cantidad limitada de «bienes» disponibles a ese tipo de cambio.

Aunque aquí hemos trabajado con ejemplos relativamente sencillos, las oportunidades de arbitraje pueden abarcar muchas operaciones y volverse increíblemente complejas. Nuestros ejemplos usaban 3 operaciones, pero ¿qué pasaría si necesitases 10? Y en una red de 20 divisas con un mercado para cada par, ¿con qué rapidez podrías encontrar una oportunidad?

Usar un ordenador es la respuesta obvia. Pero necesitamos un algoritmo eficiente para que nadie nos gane de mano.

Para lograrlo, podemos aprovechar un par de ideas ingeniosas de las matemáticas y la informática.

<div class="divider"></div>

## Los mercados como un grafo

Los grafos son una estructura sumamente importante que ha encontrado utilidad en multitud de aplicaciones. Muchas estructuras sociales y naturales pueden modelarse mediante grafos, y resulta que los mercados son una de ellas.

En nuestro caso, tratemos cada divisa como un nodo. Pasar de un nodo a otro corresponde a cambiar una divisa por otra.

![Grafo simplificado de divisas]({{ "/currency-graph-white.png" | prepend: page.imgpath }}){: width="448" height="283" loading="lazy" decoding="async"}
{% include caption.html content="Grafo simplificado: debería haber una arista distinta en cada dirección." %}

Así, desplazarse a lo largo de una arista entre dos nodos transforma la cantidad de divisa según el tipo de cambio.

Eso significa que pasar del nodo dólar al nodo libra corresponde a multiplicar por 0.8 libras/dólar. Asignemos el tipo de cambio como peso de cada arista.

Ten en cuenta que el tipo de cambio en cada dirección será _aproximadamente_ el recíproco del otro. Es decir, si el tipo para convertir dólares en libras es de 0.8 libras/dólar, el tipo en sentido contrario será 1/(0.8 libras/dólar) = 1.25 dólares/libra. La consecuencia para nosotros es que debemos tener cuidado de tratar la compra y la venta en cada mercado como aristas dirigidas distintas, con pesos diferentes.

El motivo por el que los tipos de cambio en ambas direcciones son solo _aproximadamente_ recíprocos se debe a las pequeñas diferencias entre los precios de compra y venta de divisas, lo que se conoce como el diferencial compra-venta (spread). Por ejemplo, si en un momento dado puedes comprar libras a 0.8 libras/dólar (el precio actual al que alguien te vende), pero puedes vender libras por dólares a 0.82 libras/dólar (o 1.22 dólares/libra, el precio actual al que alguien te compra), tu modelo en grafo tendrá este aspecto (excluyendo los demás tipos de cambio por simplicidad):

![Grafo de divisas con tipos de cambio]({{ "/currency-graph-w-exchange-rates-white.png" | prepend: page.imgpath }}){: width="451" height="378" loading="lazy" decoding="async"}

Una serie de operaciones puede modelarse recorriendo aristas en este grafo, y el resultado de las operaciones se calcula **_multiplicando_** los pesos de las aristas a medida que avanzamos por ellas.

<div class="divider"></div>

## Ver la oportunidad

Ahora que tenemos un modelo funcional, ¿qué estamos buscando en nuestro grafo que corresponda a una oportunidad de arbitraje?

Para determinar si una serie de operaciones es rentable, necesitamos una métrica coherente de rentabilidad. En otras palabras, si comenzamos nuestra serie de operaciones en dólares, tendremos que terminarla también en dólares. Y comparando la cantidad de dólares con la que terminamos frente a la cantidad con la que empezamos, sabremos si fue rentable o no.

En nuestro grafo, eso significa que nuestra serie de operaciones debe terminar en el mismo nodo en el que comenzó. En nuestro caso, empezamos en el nodo dólar y terminamos en el nodo dólar. En terminología de grafos, a esto se le llama un ciclo. Así que sabemos que buscamos algún tipo de ciclo, pero ¿qué tipo de ciclo hace que sea rentable?

Observa que, al multiplicar a lo largo de las aristas de un ciclo, transformamos las unidades del tipo de cambio efectivo.

{%include math.html content=
"
\begin{align}
a \space \frac{\cancel{£}}{$} \times b \space \frac{¥}{\cancel{£}} = ab \space \frac{¥}{$}  \tag{2} \label{eq:units_of_exchange_rate}
\end{align}
" 
%}

Sin embargo, cuando volvemos a nuestro nodo inicial, la magnitud pasa a ser adimensional. ¡Deja de ser un tipo de cambio y se convierte en una razón de retorno! Recorrer un ciclo en nuestro grafo y calcular el producto de los tipos de cambio a lo largo del camino equivale a calcular la razón de retorno que obtendríamos tras completar la serie de operaciones.

{%include math.html content=
"
\begin{align}
a \space \frac{\cancel{£}}{\cancel{$}} \times b \space \frac{\cancel{¥}}{\cancel{£}} \times c \space \frac{\cancel{$}}{\cancel{¥}} = abc \space \text{[dimensionless]}  \tag{3} \label{eq:unitless_exchange}
\end{align}
" 
%}

Si el mercado es perfectamente eficiente, nuestra razón de retorno, $$abc$$, será 1, porque los tipos de cambio se habrán igualado. Si el producto de los pesos es mayor que 1, digamos 1.02, entonces nuestra oportunidad de arbitraje nos habría generado un retorno del 2%.

Por lo tanto, generalizando a un número arbitrario de operaciones, una oportunidad de arbitraje corresponde a la siguiente desigualdad:

{%include math.html content=
"
\begin{align}
\prod_i^n{e_i} = e_ie_2...e_n > 1  \tag{4} \label{eq:arbitrage_return}
\end{align}
" 
%}

donde $$e_i$$ corresponde al $$i$$-ésimo tipo de cambio, para cada operación $$i$$, a lo largo de $$n$$ operaciones.

Así que lo que necesitamos es un algoritmo que encuentre un ciclo en el grafo de mercados en el que el producto de los pesos de las aristas sea mayor que 1. Podrías inventar un algoritmo propio para hacerlo, pero en informática —como en la vida en general— resulta muy útil reducir los problemas a otros que ya sabemos resolver.

<div class="divider"></div>

## El algoritmo de Bellman-Ford

El problema de encontrar caminos más cortos es un problema común y fundamental en informática, aplicable a muchísimos escenarios. Uno evidente, estableciendo una correspondencia entre un grafo y un mapa, es encontrar la ruta más corta en un mapa. Pero con un poco de ingenio, muchos otros tipos de problemas también pueden transformarse en un problema de camino más corto. Lo que voy a demostrarte es que encontrar oportunidades de arbitraje es uno de esos problemas.

Primero, definamos qué es el problema del camino más corto. Dados dos nodos en un grafo, $$s$$ y $$t$$, el camino más corto es aquel que minimiza la _suma_ de los pesos de las aristas. En otras palabras, avanzamos por el camino de $$s$$ a $$t$$ sumando los pesos de las aristas por el trayecto; el camino con la suma mínima es el camino más corto, es decir, el camino de menor coste.

A continuación, conviene entender que existen distintas clases de problemas de camino más corto. En el ejemplo más obvio —como la ruta más corta en un mapa— los pesos de las aristas deben ser positivos. No hay manera, salvo con una máquina del tiempo, de que recorrer una carretera reduzca tu tiempo de viaje. En un grafo que solo tiene pesos positivos, el famoso algoritmo de Dijkstra calculará el camino más corto hacia todos los nodos del grafo.

Sin embargo, no hay ninguna razón por la cual un grafo no pueda tener pesos negativos en sus aristas. En ese caso, recorrer una arista así reduce el coste total del camino. Pero si existe un _ciclo_ cuyo peso total es negativo, entonces puedes seguir recorriendo ese _ciclo_ indefinidamente —reduciendo cada vez más el coste total del camino— y tu camino más corto tenderá a un coste de $$-\infty$$. En esa situación, sería muy útil que nuestro algoritmo de camino más corto tuviera un mecanismo para identificar ciclos de peso negativo. De lo contrario, el algoritmo se quedaría dando vueltas en el ciclo negativo para siempre.

El algoritmo de Bellman-Ford es exactamente ese algoritmo. Al ser una versión más general del algoritmo de camino más corto de Dijkstra, puede manejar pesos negativos. Para ello, detecta _ciclos de peso negativo_: ciclos en un grafo en los que _sumar_ los pesos da un valor negativo.

Pero ¿cómo nos ayuda un algoritmo capaz de encontrar ciclos donde la **_suma_** de las aristas es menor que 0, cuando nosotros necesitamos uno que detecte ciclos donde el **_producto_** de las aristas es mayor que 1?

<div class="divider"></div>

## El logaritmo al rescate

La siguiente idea clave es que un producto puede transformarse en una suma aplicando la función logarítmica, gracias a la identidad:

{%include math.html content=
"
\begin{align}
\log{ab} = \log{a} + \log{b}  \tag{5} \label{eq:log_product_identity}
\end{align}
" 
%}

De este modo podemos transformar nuestro problema de encontrar un ciclo con un _producto_ mayor que 1 en el problema de encontrar un ciclo con una _suma_ mayor que 0. Lo conseguimos tomando el logaritmo de cada tipo de cambio y usándolo como peso de cada arista.

Veámoslo aplicando el logaritmo a ambos lados de nuestra desigualdad. Primero, tomar el logaritmo del lado izquierdo transforma el cálculo de un producto en el cálculo de una suma:

{%include math.html content=
"
\begin{align}
\log{\prod_i^n{e_i}} = \log{e_ie_2...e_n} = \log{e_1} + ... + \log{e_n} = \sum_i^n{\log{e_i}} \tag{6} 
\end{align}
" 
%}

El logaritmo del lado derecho simplemente transforma el 1 en un 0:

{%include math.html content=
"
\begin{align}
\sum_i^n{\log{e_i}} > \log{1} \rightarrow \sum_i^n{\log{e_i}} > 0 \tag{7}
\end{align}
" 
%}

Estamos cerca, pero todavía no hemos llegado. El último paso, para reducir nuestro problema a uno que podamos resolver con este algoritmo conocido, consiste en multiplicar el peso de cada arista por -1. Esto convierte el problema de encontrar un ciclo de peso positivo en encontrar uno de peso negativo:

{%include math.html content=
"
\begin{align}
\sum_i^n{-\log{e_i}} < 0 \tag{8}
\end{align}
" 
%}

¡Y sabemos que el algoritmo de Bellman-Ford puede hacer exactamente eso! Construir un grafo tal como hemos especificado y ejecutar el algoritmo de Bellman-Ford sobre él nos permitirá encontrar oportunidades de arbitraje de forma rápida y eficiente, porque hemos convertido el problema del arbitraje en el problema de encontrar el camino más corto: _el camino infinitamente más corto_.

![Grafo de divisas con logaritmo negativo]({{ "/neg-log-currency-graph-white.png" | prepend: page.imgpath }}){: width="448" height="283" loading="lazy" decoding="async"}
{% include caption.html content="Necesitamos encontrar un ciclo de peso negativo, donde los pesos son el logaritmo negativo de los tipos de cambio." %}

En retrospectiva, resulta evidente que debe existir una correspondencia entre un ciclo de peso negativo —que reduce el coste del camino cada vez que lo recorres— y una oportunidad de arbitraje, que te genera un beneficio cada vez que la recorres. La clave está en transformar el problema de encontrar un producto mayor que 1 en encontrar una suma menor que 0, aplicando $$-\log$$ a los pesos de las aristas.

<div class="divider"></div>

## Demuéstralo

Ejecutemos este algoritmo sobre nuestros tipos de cambio para comprobar si identifica correctamente la oportunidad de arbitraje. Al transformar los tipos de cambio mediante $$-\log$$, obtenemos:

| Mercado                | -log(Tipo de cambio) |
|:----------------------:|:--------------------:|
| libra (£) / dólar ($)  | 0.223                |
| yen (¥) / libra (£)    | -4.605               |
| dólares ($) / yen (¥)  | 4.343                |

Al sumar a lo largo de las operaciones, la desigualdad se cumple: _¡hemos encontrado un ciclo de peso negativo!_

{%include math.html content=
"
\begin{align}
\sum_i^n{-\log{e_i}} = 0.223 - 4.605 + 4.343 = -0.039 \label{eq:neg_log_exchange_rate_example} \tag{9}
\end{align}
" 
%}

Podemos deshacer la operación logarítmica para recuperar el producto y calcular el retorno:

{%include math.html content=
"
\begin{align}
\prod_i^n{e_i} &= \exp{\sum_i^n{-\log{e_i}}} \\
\prod_i^n{e_i} &= \exp(0.039) = 1.04 \tag{10}
\end{align}
" 
%}

Que es exactamente el retorno del 4% que calculamos antes.

<div class="divider"></div>

## En el mundo real

Dado que una oportunidad de arbitraje corresponde a un ciclo de peso negativo, parecería que podríamos recorrer el ciclo eternamente para ganar dinero infinito. Por supuesto, no es así.

La liquidez —el volumen disponible antes de que el precio cambie de forma significativa— disponible para cualquier oportunidad de arbitraje es limitada, y la aprovechan de inmediato operadores algorítmicos que llevan al límite la tecnología informática y las leyes de la física para ganarse unos a otros.

Dicho esto, espero que este ejercicio de aplicar la teoría de grafos y un conocido algoritmo de camino más corto para resolver un problema del ámbito financiero —y ganar dinero— te haya resultado tan interesante como siempre me ha parecido a mí.
