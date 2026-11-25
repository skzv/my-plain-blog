---
layout: post
lang_code: es
locale: es_ES
ref: lucid-configurator-is-a-streaming-video-game
date: 2021-07-28 00:00:00 -0700
last_modified_at: 2021-07-28 00:00
permalink: /es/lucid-configurator-is-a-streaming-video-game
title: "El configurador de Lucid Motors es un videojuego transmitido en directo a tu navegador"
imgpath: /assets/img/lucid-configurator-is-a-streaming-video-game
previewurl: /lucid-configurator.png
description: "Cómo el configurador de coches de Lucid Motors utiliza Unity, renderizado en la nube y WebRTC para transmitir un concesionario 3D interactivo a tu navegador."
image: /assets/img/lucid-configurator-is-a-streaming-video-game/lucid-configurator.png
image_width: 1958
image_height: 845
image_alt: "Configurador de coches 3D interactivo de Lucid Motors"
mathjax: false
tags: [computer-vision, 3d-graphics, systems]
---

{% include description.html content="Tiene todo el sentido cuando te das cuenta de que los motores de videojuegos son los mejores simuladores que existen." %}

## Una solución ingeniosa

[Lucid Motors salió a bolsa el lunes](https://www.barrons.com/articles/lucid-churchill-merger-ipo-ev-51627308359) y, aunque no voy a comprarme un Lucid a corto plazo, me encontré echando un vistazo a [su configurador de vehículos](https://www.lucidmotors.com/air/configure/) por pura curiosidad. Es una obra de arte. Te permite observar e interactuar con el vehículo desde casi cualquier ángulo, por dentro y por fuera:

{% include video.html content="https://streamable.com/e/cudr66" %}
<p class="caption video-caption">El configurador de Lucid para su vehículo insignia de gama alta, el Lucid Air Dream.</p>

Puedes probar distintos colores y acabados, abrir y cerrar las puertas e incluso retraer la pantalla de la consola central. El fondo del puente Golden Gate se refleja en los charcos cristalinos. El configurador conserva todo tipo de detalles del coche, incluidas las luces bajo las manillas de las puertas que se encienden al utilizarlas. Siento que me he hecho una idea tan precisa del vehículo que ya ni necesito verlo en persona.

¿Cómo logró Lucid hacer esto? ¿Se puede esperar que el navegador web de un usuario medio renderice una escena así en tiempo real, con reflejos y todo? La respuesta es que probablemente no. Funciona porque la escena que estás viendo se renderiza con Unity, un motor de videojuegos, ejecutándose en la nube —delegando la intensa carga computacional a un servidor de Amazon— y transmitiéndose de vuelta a tu navegador mediante WebRTC, un protocolo de transmisión de vídeo punto a punto.

<div class="divider"></div>

## El modelo

Al principio asumí ingenuamente que el modelo se estaba renderizando en mi navegador mediante la última [biblioteca WebGL](https://en.wikipedia.org/wiki/WebGL) (una API para renderizar gráficos 2D y 3D en navegadores web con aceleración por hardware). Y dado que el modelo debía estar renderizándose localmente, tenía que existir en algún lugar de mi memoria RAM, de modo que podría extraerlo y abrirlo en un editor de modelos 3D. En concreto, quería ver si podía quitar los parasoles que interrumpen el techo acristalado casi continuo —un efecto que sí logra el Model X de Tesla y que no sé por qué Lucid no imitó.

![Los parasoles del Lucid Air interrumpiendo el techo acristalado]({{ "/lucid-air-sun-visors.webp" | prepend: page.imgpath }}){: width="1600" height="994" loading="lazy" decoding="async"}
{% include caption.html content="Los parasoles del Lucid Air interrumpiendo el techo acristalado." %}

Así que me sumergí en el código. Después de un rato con las herramientas de depuración del navegador, hojeando miles de líneas de JavaScript minificado y registrando y analizando las peticiones de red entre mi portátil y los servidores de Lucid, me di cuenta de que la respuesta llevaba todo el tiempo imprimiéndose literalmente en la consola:

![El configurador es una transmisión de vídeo]({{ "/zlbolt-webrtc.png" | prepend: page.imgpath }}){: width="691" height="156" loading="lazy" decoding="async"}
{% include caption.html content="El configurador es una transmisión WebRTC." %}

No se está renderizando ningún modelo localmente. Lo que estoy viendo es un vídeo.

Entonces, ¿qué está pasando aquí? El configurador arranca con una vista en 2D: es decir, una panorámica a saltos compuesta por imágenes que crea la ilusión de una interacción 3D. Así es como están construidas la mayoría de las vistas 3D interactivas en la web. Puedes ver una demostración de eso abajo:

{% include video.html content="https://streamable.com/e/ptjitc" %}
<p class="caption video-caption">Una vista 3D a saltos, creada mediante una serie de imágenes 2D.</p>

Después, el cliente comprueba mi ancho de banda y mi latencia y, si la conexión es lo bastante rápida como para soportar una señal de vídeo en tiempo real, actualiza la sesión a 3D:

![Prueba de latencia]({{ "/latency-test.png" | prepend: page.imgpath }}){: width="755" height="25" loading="lazy" decoding="async"}
![Prueba de ancho de banda]({{ "/bandwidth-test.png" | prepend: page.imgpath }}){: width="706" height="21" loading="lazy" decoding="async"}
{% include caption.html content="Pasas a una sesión 3D si dispones de suficiente ancho de banda." %}

Esto inicia una conexión WebRTC. [WebRTC](https://en.wikipedia.org/wiki/WebRTC) es un protocolo de transmisión punto a punto. La escena se renderiza en otro lugar y se transmite mediante WebRTC a mi navegador.

Inspeccionar el contenido de su petición `get_token` revela algunos detalles más sobre cómo funciona el mecanismo.

![Contenido de la petición get_token]({{ "/get-token-request.png" | prepend: page.imgpath }}){: width="829" height="402" loading="lazy" decoding="async"}
{% include caption.html content="Contenido de la petición get_token." %}

El primer recuadro revela que, para medir tu ancho de banda, descargan parcialmente [una imagen de prueba de 25 MB](https://libzl.zlthunder.net/bandwidth-test-img.png) a tu dispositivo y cronometran cuánto tarda. Esta es la imagen, por si tienes curiosidad (tranquilo, la he comprimido 10 veces).

![Imagen de prueba de ancho de banda]({{ "/bandwidth-test-image.webp" | prepend: page.imgpath }}){: width="895" height="1263" loading="lazy" decoding="async"}
{% include caption.html content="No tiene mucho que ver con automóviles, pero sirve perfectamente para medir tu ancho de banda." %}

Por cierto, [esta imagen parece ser un efecto generado con el complemento plasma de GIMP](https://www.gimp.org/tutorials/Floating_Logo/Plasma.jpg). Carga bastante lento; al parecerse a ruido puro, debe de ser prácticamente incompresible.

Al abrir [chrome://webrtc-internals/](chrome://webrtc-internals/) aparecen algunos detalles sobre la conexión WebRTC que está transmitiendo la escena 3D a mi navegador.

![Información de WebRTC]({{ "/lucid-webrtc.png" | prepend: page.imgpath }}){: width="851" height="399" loading="lazy" decoding="async"}
{% include caption.html content="Las herramientas de depuración de Chrome ofrecen más información sobre la conexión WebRTC." %}

Llegados a este punto, quizá hayas notado que ninguna de las URL pertenece a un dominio de Lucid, sino a `zlthunder`. ¿Quiénes son?

<div class="divider"></div>

## ZeroLight

Buscar `zlthunder` en internet te lleva a una empresa llamada [ZeroLight](https://zerolight.com/). Indican que ofrecen visualización 3D basada en la nube, especializada en el sector de la automoción. ¡Ahora todo encaja!

![ZeroLight]({{ "/zero-light.webp" | prepend: page.imgpath }}){: width="1600" height="640" loading="lazy" decoding="async"}
{% include caption.html content="Especialistas en visualización 3D basada en la nube." %}

No tardé mucho en encontrar [esta entrada del blog de Unity](https://unity3d.com/showcase/case-stories/zerolight) (el destacado motor de videojuegos) que explica cómo ZeroLight aprovechó el motor para crear un concesionario virtual realista, con física optimizada, reflejos y demás.

![Unity y ZeroLight]({{ "/unity-zero-light.webp" | prepend: page.imgpath }}){: width="1203" height="658" loading="lazy" decoding="async"}
{% include caption.html content="Los videojuegos nos han traído muy lejos." %}

Por fin uní todas las piezas. Cuando entro en la web, cargan un configurador 2D. Si mi conexión a internet da la talla, me conectan a una instancia de Unity —un motor de videojuegos 3D— ejecutándose en un servidor de AWS. El servidor recibe los movimientos de mi ratón, gira y hace zoom en la cámara, renderiza el resultado en la nube y me lo transmite de vuelta en vídeo.

<div class="divider"></div>

## Suena caro

Imagina que tienes 1,000 usuarios conectados al sitio: necesitas 1,000 instancias con aceleración por hardware de un motor de videojuegos recibiendo entradas y transmitiendo grandes volúmenes de vídeo en tiempo real, igual que los servicios de videojuegos en la nube como Stadia o GeForce Now, entre otros. Pero parece que son muy conscientes de ello: para ahorrar costes, te desconectan tras 60 segundos de inactividad:

![Degradación por inactividad]({{ "/inactivity-downgrade.png" | prepend: page.imgpath }}){: width="524" height="60" loading="lazy" decoding="async"}
{% include caption.html content="Bajar de nivel cuando el usuario queda inactivo debe de ahorrar muchísimo dinero." %}

<div class="divider"></div>

## ¿Qué es un motor de videojuegos, al fin y al cabo?

Aunque al principio pueda parecer un uso sorprendente para un motor de videojuegos, un motor de videojuegos no es más que un simulador optimizado. Motores consolidados como Unity incorporan décadas de investigación en la simulación de rayos de luz y otros fenómenos físicos. Así que si quieres simular la realidad, aunque esa realidad sea un concesionario de coches, un motor de videojuegos es una herramienta perfecta y lista para usar que puede extenderse a multitud de aplicaciones.

En retrospectiva, probablemente podría haber averiguado cómo funcionaba el configurador de Lucid buscando un poco y dando con el artículo de Unity. Pero hacer ingeniería inversa del configurador me permitió ver mucho más de cerca los retos, soluciones y mecanismos internos de su producto, y me sentí como un detective reconstruyendo el caso desde cero. Lo que más gracia me hizo, sin embargo, fue el increíble nivel de complejidad tecnológica al que hemos llegado hoy en día. Un simulador de física ultrarrealista, ejecutándose en un servidor remoto en un centro de datos de Amazon, recibiendo órdenes desde mi ordenador y devolviendo la señal de vídeo a la velocidad de la luz, solo para que yo pueda jugar con un configurador de coches. ¡Y para llegar a la Luna nos bastó con una calculadora!
