---
layout: post
lang_code: es
locale: es_ES
ref: bringing-colour-and-life-to-black-and-white-photos
date: 2021-06-12 00:00:00 -0700
last_modified_at: 2021-06-12 00:00
permalink: /es/bringing-colour-and-life-to-black-and-white-photos
title: "Devolviendo color y vida a las fotos en blanco y negro"
imgpath: /assets/img/colourising-black-and-white-photos
previewurl: /mama-and-vova-colorized.jpg
description: "Coloreando fotos familiares con IA y la API de DeepAI: ejemplos, un script de procesamiento por lotes y un análisis de las limitaciones de la restauración del color."
image: /assets/img/colourising-black-and-white-photos/og-preview.png
image_width: 1200
image_height: 630
image_alt: "Una fotografía familiar restaurada a color con IA"
mathjax: false
tags: [computer-vision, machine-learning]
toc: true
---

{% include description.html content="El aprendizaje automático nos permite colorear fotos en blanco y negro con facilidad, pero ¿a qué riesgo?" %}

## Un universo diferente

Aunque las fotos a color existen técnicamente desde hace un siglo o más ([Serguéi Prokudin-Gorski y Piotr Vedenisov, pioneros de la fotografía en color, viajaron por la Rusia Imperial documentándola a todo color](https://www.loc.gov/pictures/related/?fi=name&q=Prokudin-Gorski%20%2C%20Serge%20%20Mikha%20lovich%2C%201863-1944)), la mayor parte del siglo XX se documentó en blanco y negro. Incluso hacia finales del siglo, gran parte del mundo no contaba con el lujo de la película en color: mi padre revelaba sus propias fotos en blanco y negro todavía en los años 80 y 90 en la Ucrania soviética, y mientras los estadounidenses grababan material a todo color de la guerra de Vietnam, la perspectiva del Norte parece haber quedado relegada a la fotografía en blanco y negro.

![Niño pequeño cerca del río Sim]({{ "/boy-sim-river.jpeg" | prepend: page.imgpath }}){: width="900" height="648" fetchpriority="high" decoding="async"}
{% include caption.html content="Niño pequeño cerca del río Sim, una de las primeras fotografías en color de la Rusia Imperial. Se logró tomando varias fotografías de la misma escena con distintos filtros de color. Cortesía de la Biblioteca del Congreso." %}

Algunos dirán que las imágenes en blanco y negro tienen un encanto especial, y puede que sea cierto. Pero a mí el blanco y negro me desconecta de la escena. Se siente claramente lejano en el tiempo. Todos asociamos las imágenes en blanco y negro con el pasado, como demuestra el recurso cinematográfico de usar blanco y negro para representar un recuerdo. Y para alguien que experimenta la realidad a todo color, el material en blanco y negro resulta difícil de sentir como propio. Me cuesta situarme en la escena o ponerme en la piel de los protagonistas, porque en mi mente pertenecen a un universo distinto, en blanco y negro. Sin embargo, cuando ese material se colorea, de repente todo parece más real, más creíble, más tangible. Queda claro entonces que lo que aparece en la imagen pertenece a la misma Tierra y a las mismas personas, gente como tú o como yo.

Así que cuando mi padre empezó hace poco a digitalizar nuestra colección de fotos familiares —ya que las fotografías físicas se deterioran o corren el riesgo de perderse para siempre, junto con las historias, recuerdos y legados que conservan—, sentí también el impulso de colorearlas, para poder vivirlas con mayor plenitud y para que mis familiares pudieran rememorar a sus seres queridos que ya no están o revivir recuerdos de su pasado y su juventud.

<div class="divider"></div>

## Coloreando fotos con IA

La restauración del color puede hacerse de forma manual y laboriosa. Los modelos de aprendizaje automático ofrecen una forma rápida y económica de colorear fotos, aunque tienen sus limitaciones, como comentaremos más adelante en este artículo. No entrené mi propio modelo para este propósito. Otros ya han invertido miles de horas en desarrollar y entrenar modelos precisamente para eso, y encontré un modelo existente que hace un trabajo excelente.

Utilicé la [API Image Colorization de DeepAi](https://deepai.org/machine-learning-model/colorizer). El modelo en producción desplegado por DeepAi parece ser una variante del modelo DeOldify, que puede encontrarse en [este repositorio de GitHub](https://github.com/jantic/DeOldify).

Creo que la API de DeepAi no permite ajustar los parámetros del modelo, pero puedes hacerlo si lo ejecutas tú mismo desde el repositorio anterior o en [una instancia de Colab](https://colab.research.google.com/github/jantic/DeOldify/blob/master/ImageColorizerColabStable.ipynb). [MyHeritage](https://www.myheritage.com/incolor) también ofrece esta API como servicio con parámetros ajustables.

Lo que hice fue crear un script rápido que permite colorear directorios enteros por lotes. Recorre todas las fotos de una carpeta, las envía a la API Image Colorization de DeepAi y descarga el resultado en una carpeta separada (ignorando las imágenes que ya fueron coloreadas). Si te resulta útil, solo tienes que configurar tu propia clave de API de DeepAi como variable de entorno y ejecutar [este script](https://github.com/skzv/colorize-photos):

```bash
export DL_API_KEY=<your-deep-ai-key>
python3 main.py /path/to/images
```

<div class="divider"></div>

## Mis fotos familiares
Aquí tienes algunos ejemplos de los resultados con nuestras fotos familiares.

![Mamá con Vova]({{ "/mama-and-vova.webp" | prepend: page.imgpath }}){: width="1600" height="1232" loading="lazy" decoding="async"}
{% include caption.html content="Mi madre sosteniendo a mi hermano a principios de los años 90 en Jersón, Ucrania. Cortesía de la familia Kuznetsov." %}

![Mamá con Vova a color]({{ "/mama-and-vova-colorized.webp" | prepend: page.imgpath }}){: width="800" height="616" loading="lazy" decoding="async"}
{% include caption.html content="Ahora a color." %}

![Abuela Allarkadina]({{ "/my-grandmother-allarkadina.jpg" | prepend: page.imgpath }}){: width="523" height="801" loading="lazy" decoding="async"}
{% include caption.html content="Mi abuela, Allarkadina, probablemente en algún momento de los años 50, de camino a la universidad. Se graduó en varios institutos, especializándose en ingeniería eléctrica, y tuvo una exitosa carrera como ingeniera eléctrica naval." %}

![Abuela Allarkadina a color]({{ "/my-grandmother-alla-colourised.webp" | prepend: page.imgpath }}){: width="522" height="800" loading="lazy" decoding="async"}
{% include caption.html content="A color." %}

> Se ven tan bonitas y llenas de vida.

Esas palabras de mi padre al ver las fotos recién coloreadas hicieron que todo mereciera la pena.

<div class="divider"></div>

## Fotos de la guerra de Vietnam
Un par de semanas después de preparar el script de coloreado por lotes para mis fotos familiares, una publicación titulada [«The Vietnam War from the North Vietnamese Side»](https://news.ycombinator.com/item?id=27283624) llegó a lo más alto de Hacker News. Me pareció una oportunidad perfecta para aplicar el script y ofrecer una nueva perspectiva de material histórico. Del mismo modo que [«They Shall Not Grow Old»](https://www.imdb.com/title/tt7905466/) hizo que los horrores de la Primera Guerra Mundial se sintieran vivos y reales, yo también quise acercar a las personas y escenas desde la perspectiva de Vietnam del Norte.

![Destrucción de la selva por el Agente Naranja]({{ "/vietnam-agent-orange.jpeg" | prepend: page.imgpath }}){: width="1600" height="1179" loading="lazy" decoding="async"}
{% include caption.html content="Destrucción de la selva causada por el Agente Naranja." %}

![Destrucción de la selva por el Agente Naranja a color]({{ "/vietnam-agent-orange-colourised.webp" | prepend: page.imgpath }}){: width="800" height="590" loading="lazy" decoding="async"}
{% include caption.html content="A color." %}

![Habitantes inspeccionando un avión estadounidense derribado]({{ "/vietnam-downed-aircraft.jpeg" | prepend: page.imgpath }}){: width="1600" height="1111" loading="lazy" decoding="async"}
{% include caption.html content="Habitantes locales inspeccionando un avión estadounidense derribado pilotado por el teniente Stephen Owen Musselman. El piloto no sobrevivió; la guerra es un infierno." %}

![Habitantes inspeccionando un avión estadounidense derribado a color]({{ "/vietnam-downed-aircraft-colourised.webp" | prepend: page.imgpath }}){: width="800" height="556" loading="lazy" decoding="async"}
{% include caption.html content="A color." %}

Todas las imágenes originales en blanco y negro se pueden encontrar [aquí](https://rarehistoricalphotos.com/vietnam-war-images-from-vietnamese-photographers/), y las versiones coloreadas [aquí](https://imgur.com/a/aJbpMjf).

<div class="divider"></div>

## Respuesta en Hacker News

Mi trabajo recibió tanto elogios

![Elogios]({{ "/praise.webp" | prepend: page.imgpath }}){: width="624" height="934" loading="lazy" decoding="async"}

como críticas

![Críticas]({{ "/contempt.png" | prepend: page.imgpath }}){: width="546" height="286" loading="lazy" decoding="async"} {% include caption.html content="Lástima lo del comentario [flagged], porque planteaba un punto interesante. El comentario venía a decir algo como 'Por favor, no hagas esto'." %}

pero, sobre todo, generó un montón de debates muy interesantes.

![Debate]({{ "/discussion.webp" | prepend: page.imgpath }}){: width="654" height="946" loading="lazy" decoding="async"}

El hilo completo que surgió a raíz de las fotos coloreadas se puede leer [aquí](https://news.ycombinator.com/item?id=27284795).

<div class="divider"></div>

## Limitaciones

Hubo dos aspectos del debate que me llamaron especialmente la atención. El primero fue el recordatorio de las limitaciones de la IA.

Por ejemplo, cuando se aplica el modelo a una antigua foto del puente Golden Gate en construcción, produce un puente blanco. Para ser justos, no es del todo inexacto: el puente efectivamente fue blanco al comienzo de su construcción, pero para cuando se tomó esa fotografía ya había sido cubierto con imprimación roja (según la fuente en el [repositorio de DeOldify](https://github.com/jantic/DeOldify)). Así que, aunque los datos de entrenamiento probablemente contenían fotos del Golden Gate en construcción y el modelo pudo reconocer el mismo puente en obras, no podía deducir la fecha ni saber que en ese momento ya tenía la imprimación roja.

![¿Un Golden Gate blanco?]({{ "/golden-gate.webp" | prepend: page.imgpath }}){: width="1200" height="472" loading="lazy" decoding="async"} {% include caption.html content="¿Un Golden Gate blanco? Lo fue, pero no cuando se tomó esta fotografía." %}

Algunas escenas son ambiguas. Por ejemplo, a partir de las características de la siguiente imagen, el modelo no distingue si el suelo es un campo o asfalto, y colorea incorrectamente el asfalto de verde, donde una persona que coloreara manualmente probablemente acertaría.

![Una celebración]({{ "/a-celebration-colourised.webp" | prepend: page.imgpath }}){: width="800" height="522" loading="lazy" decoding="async"} {% include caption.html content="El modelo no logra distinguir que el suelo es asfalto y no hierba." %}

Otra observación interesante fue que la ropa a menudo carecía de tonos, texturas, rasgos o contexto distintivos que permitieran colorearla con precisión. El modelo tendía a pintar la ropa de color morado, salvo cuando había rasgos o contexto claros. Probablemente esto ocurre porque, cuando el modelo no puede inferir bien el color de una prenda, el morado es una apuesta conservadora, en algún punto intermedio del espacio de color ambiguo, que minimiza la pérdida durante el entrenamiento.

![Buzos vietnamitas: ¿todos de morado?]({{ "/vietnam-divers-colourised.webp" | prepend: page.imgpath }}){: width="796" height="800" loading="lazy" decoding="async"} {% include caption.html content="No creo que la ropa en el pasado fuera morada tan a menudo como hace pensar este modelo." %}

De hecho, mi padre me pidió corregir el color de algunos elementos en las fotos. Por desgracia no llegué a hacerlo, ni me resulta inmediatamente obvio cómo lograrlo. Pero como señaló un comentarista, incluso cuando los colores están equivocados, siguen devolviendo la vida a las imágenes.

<div class="divider"></div>

## Consideraciones éticas

Ahora que algunas de las limitaciones están claras, estamos en buena posición para analizar las implicaciones éticas de una IA que colorea fotos. Este fue el segundo aspecto del debate que más me hizo pensar. La cuestión ética no se me había pasado por la cabeza cuando emprendí el proyecto, pero algunos de los comentarios que recibí me llevaron a reflexionar, y estoy agradecido por ello.

La principal consideración ética es la verdad. De manera similar a la controversia en torno a los deepfakes que nos hacen dudar de lo que es real, la coloración artificial puede alterar nuestra percepción de la historia. La IA toma decisiones sobre los colores del pasado que no son necesariamente exactas. Por ejemplo, si conservamos y difundimos la versión blanca del Golden Gate generada por una IA así, la versión del puente que perciben los espectadores no es históricamente precisa. Por supuesto, tampoco lo es la versión en blanco y negro. Quizá el problema sea que quienes ven una imagen en blanco y negro saben que el pasado no tenía ese aspecto, mientras que quienes ven una imagen coloreada pueden caer fácilmente en la ilusión de creer que la historia fue exactamente así.

Algunos llegan a afirmar que estos retoques reescriben la historia, y en ocasiones realmente lo parece. Tomemos este ejemplo reciente:

> Camboya ha pedido al grupo mediático estadounidense Vice que retire un artículo que incluía fotografías recién coloreadas de víctimas de los Jemeres Rojos, afirmando que las imágenes son un insulto para los fallecidos porque algunas habían sido alteradas para añadir sonrisas.

<p class="caption" style="margin-top:-25px;"><a href="https://www.aljazeera.com/news/2021/4/11/cambodia-condemns-vice-for-altered-khmer-rouge-images">Fuente</a></p>

Es una queja completamente legítima. Al parecer el modelo estaba sobreajustado, probablemente entrenado en su mayoría con rostros sonrientes. Así que alteró los rostros de las víctimas para que se parecieran más a los datos de entrenamiento, haciéndolos sonreír. Es un claro ejemplo de los peligros de la IA, sobre todo cuando se aplica sin cuidado.

[MyHeritage](https://www.myheritage.com/incolor), que ofrece un servicio de restauración del color basado en el mismo modelo DeOldify que yo utilicé, busca un punto intermedio añadiendo una marca de agua a todas sus imágenes retocadas. Creo que su argumento es muy convincente:

> Diferenciamos las fotos coloreadas de las fotografiadas originalmente en color mediante un símbolo especial de paleta en relieve en la esquina inferior izquierda de las fotos coloreadas. Aunque son muy realistas, las fotos coloreadas tienen colores simulados por algoritmos automáticos y estos colores pueden no ser idénticos a los colores reales de la imagen original. El icono de la paleta aparece en todas las fotos coloreadas para que los usuarios puedan distinguirlas de las fotos con colores reales. Esperamos que esta práctica responsable sea adoptada por otros que utilicen tecnología de coloración fotográfica. Las fotos sometidas a restauración de color no llevan icono porque esos colores son auténticos.

En mi caso, mi familia sabía que yo había coloreado nuestras fotos de forma artificial, y notaban que los colores no eran del todo exactos. Aun así, incluso con colores equivocados, las fotografías —y las personas y escenas dentro de ellas— volvieron a cobrar vida. Igual que cuando fui voluntario de instituto en una residencia de ancianos y pude transportar a un residente a su hogar de infancia en Dresde mediante Google Street View, un lugar que no visitaba desde hacía 50 años, pude usar la IA para teletransportar a nuestra familia a buenos momentos de hace décadas. La tecnología es una herramienta, y me siento agradecido de vivir en una época en la que es posible hacer magia así.
