---
layout: post
lang_code: es
locale: es_ES
ref: intuitivepapers-ai-interactive-paper-explainers
date: 2026-06-05 00:00:00 -0700
last_modified_at: 2026-11-25 00:00
permalink: /es/intuitivepapers-ai-interactive-paper-explainers
title: "Explicaciones interactivas de artículos de IA con intuitivepapers.ai"
imgpath: /assets/img/intuitivepapers
previewurl: /home.png
description: "Cómo construí intuitivepapers.ai, un flujo automatizado que convierte artículos de aprendizaje automático en explicaciones interactivas verificadas con figuras personalizadas en canvas."
image: /assets/img/intuitivepapers/home.png
image_width: 1280
image_height: 820
image_alt: "Explicaciones interactivas de artículos de IA en intuitivepapers.ai"
mathjax: false
tags: [machine-learning, ai-tools]
---

{% include description.html content="¿Podemos automatizar la transformación de artículos densos de aprendizaje automático en explicaciones interactivas verificadas?" %}

Leer artículos de aprendizaje automático puede resultar frustrantemente lento. Un artículo suele dedicar sus páginas únicamente a lo que es nuevo y da por hecho que ya tienes frescas en la cabeza cinco ideas previas, así que la mitad del tiempo acabo saltando por una cadena de referencias más antiguas antes de que el artículo en sí cobre sentido.

El atajo fácil hoy en día es soltar el PDF en un LLM y pedirle una explicación. Yo lo hago bastante y sirve para una primera aproximación, pero también comete errores sutiles con sorprendente frecuencia. Un signo invertido en una ecuación, si una derivación es exacta o una aproximación, o qué variable se está actualizando realmente puede cambiar por completo lo que hace un algoritmo. Y si todavía no conoces bien el artículo, es muy difícil detectar esos fallos cuando la explicación por lo demás suena totalmente convincente.

Lo que yo quería eran explicaciones que construyeran la intuición y las matemáticas juntas, con figuras con las que realmente pudieras jugar. Vi la enorme diferencia que eso marca cuando preparé mi [demostración interactiva de descenso de gradiente](/es/gradient-descent) hace unos años: arrastrar un control deslizante y ver cómo un algoritmo se pasa de largo o converge te enseña cosas que una ecuación estática nunca termina de transmitir.

## Empezando con DiffusionBlocks

Empecé construyendo una única [explicación para el artículo DiffusionBlocks de Sakana AI](https://intuitivepapers.ai/diffusionblocks/) junto con Claude. Llevó alrededor de una semana de idas y venidas dejarla en buena forma. Gran parte de ese tiempo se fue en contrastar cada ecuación con las fuentes primarias (como el artículo EDM) y con el repositorio oficial en GitHub de los autores.

Mientras hacía eso, la verificación detectó un error de signo real impreso en el propio artículo. El artículo define `Δσ = σ_prev - σ_next > 0` y escribe su actualización de Euler en la Ec. (4) con `(z - D)`, lo que en realidad avanza *alejándose* de la predicción del eliminador de ruido (*denoiser*). Al discretizar su Ec. (1) se obtiene `(D - z)`, y, efectivamente, al comprobar el código de los autores (`model.py`) confirmé que la implementación usa el signo corregido. Un resumen normal hecho con un LLM se habría limitado a repetir la errata impresa, y yo probablemente nunca me habría dado cuenta.

Eso me llevó a preguntarme cuánto de toda aquella semana de trabajo podría automatizar. ¿Podría construir un flujo (*pipeline*) que obtuviera la fuente real del artículo, verificara las matemáticas previas frente a la literatura primaria y el código, construyera figuras interactivas y revisara su propio borrador antes de publicar?

El resultado es [intuitivepapers.ai](https://intuitivepapers.ai/). Empezó con veinte explicaciones —cubriendo clásicos y artículos más recientes como Attention, BERT, GANs, VAEs, CLIP, PPO, Mamba y Adam— y desde entonces ha superado las 150 explicaciones mientras el flujo sigue ejecutándose de forma programada.

![Página principal de intuitivepapers.ai con explicaciones interactivas de artículos de aprendizaje automático]({{ "/home.webp" | prepend: page.imgpath }}){: width="1280" height="820" fetchpriority="high" decoding="async"}
{% include caption.html content="La página principal de intuitivepapers.ai." %}

![Biblioteca de veinte explicaciones de artículos de IA con vistas previas de figuras]({{ "/library.webp" | prepend: page.imgpath }}){: width="1280" height="2621" loading="lazy" decoding="async"}
{% include caption.html content="La biblioteca original de veinte artículos. Cada tarjeta renderiza una vista previa en vivo de una figura de su explicación." %}

<div class="divider"></div>

## Cómo es una explicación

Cada página comienza por los prerrequisitos y avanza hasta la idea principal del artículo en orden de dependencia. En escritorio, una barra lateral que llamo la torre de conceptos (*concept tower*) traza esa cadena de dependencias para que veas cómo se apilan las piezas, y breves bloques de código conectan la notación con lo que realmente se ejecuta.

Mi parte favorita son las figuras interactivas. Por ejemplo, PPO utiliza un objetivo recortado (*clipped objective*) para evitar que las actualizaciones de la política se desplacen demasiado en un solo paso. En la figura de abajo puedes arrastrar la razón de probabilidades e invertir el signo de la ventaja para ver exactamente dónde se aplana el objetivo y deja de producir gradiente. Jugar con ella diez segundos hace que la lógica del recorte encaje mucho más rápido que quedarse mirando la expresión `min` por sí sola.

![Objetivo recortado interactivo de PPO mostrando la razón de probabilidades y la ventaja]({{ "/ppo-figure.png" | prepend: page.imgpath }}){: width="1280" height="820" loading="lazy" decoding="async"}
{% include caption.html content="Explorando el objetivo recortado de PPO arrastrando la razón de probabilidades e invirtiendo el signo de la ventaja." %}

Todo también se adapta para funcionar en el móvil, que es donde al final acabo haciendo gran parte de mi lectura:

![Explicación del artículo PPO con una figura integrada en un teléfono]({{ "/mobile-ppo.png" | prepend: page.imgpath }}){: width="400" height="840" loading="lazy" decoding="async" style="max-height:520px;width:auto"}
{% include caption.html content="La explicación de PPO en un teléfono, con la misma figura interactiva integrada." %}

Otro ejemplo es CLIP, que entrena codificadores de imagen y texto para alinear pares coincidentes. La cuadrícula interactiva de abajo puntúa cada imagen frente a cada descripción de un lote: la diagonal brillante contiene los pares reales que se atraen entre sí, mientras que todo lo que queda fuera de la diagonal son desajustes que se repelen.

![Cuadrícula de similitud de CLIP comparando imágenes con descripciones coincidentes y no coincidentes]({{ "/clip-grid.png" | prepend: page.imgpath }}){: width="664" height="593" loading="lazy" decoding="async"}
{% include caption.html content="Cuadrícula de similitud imagen-descripción de CLIP. Los pares coincidentes se sitúan a lo largo de la diagonal." %}

<div class="divider"></div>

## Cómo funciona el pipeline

Un único prompt de «explica este artículo» produce exactamente los resúmenes superficiales de los que intentaba huir. Para conseguir resultados más fiables, dividí la generación en un pipeline de varias etapas con distintas comprobaciones automáticas entre el borrador y el despliegue.

Primero, en lugar de dejar que un modelo parafrasee ecuaciones de memoria, el pipeline descarga la versión HTML de arXiv (`arxiv.org/html/<id>`) y convierte MathML a LaTeX con `pandoc` para extraer al pie de la letra las ecuaciones y los números del artículo.

Después, verifica los conceptos previos frente a fuentes primarias —comprobando definiciones, signos y convenciones— y, cuando el texto del artículo deja algún detalle ambiguo, lee el código oficial de los autores y cita el archivo y los números de línea exactos en un panel de procedencia al pie de la página. Todo eso se consolida en una ficha de referencia verificada sobre la que trabaja el redactor, en lugar de redactar directamente a partir del artículo en bruto.

A partir de ahí, el pipeline construye figuras interactivas a medida directamente sobre HTML5 canvas (sin librerías de gráficos) y redacta la explicación en orden de dependencia, combinando ecuaciones con ejemplos numéricos concretos y pseudocódigo breve.

Antes de publicar nada, el borrador pasa por una combinación de comprobaciones deterministas y críticos basados en modelos:

1. Una pasada determinista gratuita revisa la prosa en busca de tics habituales de IA, valida la sintaxis de KaTeX, verifica que las versiones estrechas para móvil de las ecuaciones sean matemáticamente equivalentes a las de escritorio sin desbordar la pantalla del teléfono, y recorre cada figura interactiva en todos los estados de sus deslizadores y botones tanto en escritorio como en móvil para detectar etiquetas solapadas o recortadas.
2. Luego, críticos independientes revisan la exactitud frente al artículo, la claridad, la voz, las figuras y las capturas renderizadas.
3. Los hallazgos confirmados pasan a una fase de corrección, el sitio se vuelve a compilar y solo se reejecutan las comprobaciones fallidas durante unas cuantas rondas como máximo. Si algo sigue fallando al final, el pipeline falla de forma segura (*fails closed*) y abre un PR en borrador en lugar de publicar automáticamente.

Todo el pipeline se ejecuta con una programación diaria de `launchd` en el Mac mini que tengo debajo del escritorio. Cada mañana toma el artículo con más votos de la cola (combinando una lista curada con propuestas de lectores), espera a que se reinicien los límites de sesión del modelo y se reanuda automáticamente si una ejecución alcanza el límite de cuota, y despliega la página terminada una vez que la compilación y el filtro de revisión pasan limpiamente.

Abajo hay uno de los diagramas personalizados en canvas de la explicación de Mamba, que desglosa las piezas de un bloque Mamba.

![Diagrama que muestra los componentes de un bloque Mamba]({{ "/mamba-block-fig.jpeg" | prepend: page.imgpath }}){: width="1280" height="900" loading="lazy" decoding="async"}
{% include caption.html content="Desglose de un bloque Mamba, dibujado sobre canvas para la explicación de Mamba." %}

<div class="divider"></div>

## Notas finales

Esto empezó porque quería entender bien un solo artículo y se convirtió en un experimento para ver hasta dónde puede llegar la verificación automatizada. Contrastar fuentes primarias, leer el código de los autores y barrer todos los estados de las figuras atrapa muchos errores sutiles, aunque desde luego no hace que el resultado sea infalible. Las figuras interactivas complejas siguen siendo lo más difícil de clavar de forma fiable sin ojos humanos, y de vez en cuando se cuela alguna explicación algo torpe o un fallo en un caso extremo.

Para ayudar con eso, cada página tiene un cuadro de comentarios al final. Los avisos de los lectores sirven para corregir errores en la página y endurecer las reglas del pipeline para que las futuras explicaciones eviten los mismos fallos.

Si hay algún artículo de ML que llevas tiempo queriendo estudiar a fondo, pásate por [intuitivepapers.ai](https://intuitivepapers.ai/). Puedes solicitar un artículo o votar por uno en la cola, y si encuentras algún error en cualquiera de las explicaciones, por favor envíalo a través del cuadro de comentarios para que pueda corregirlo.
