---
layout: post
lang_code: es
locale: es_ES
ref: 3d-reconstruction-from-public-photos
date: 2025-08-21 00:00:00 -0700
last_modified_at: 2025-08-21 00:00
permalink: /es/3d-reconstruction-from-public-photos
title: "Reconstrucción 3D a partir de fotos públicas con aprendizaje automático"
imgpath: /assets/img/3d-reconstruction
previewurl: /3d-reconstruction-preview.png
description: "Reconstruyendo fotos públicas en 3D con Apple Depth Pro, proyección de cámara y Open3D. Los ejemplos muestran estimaciones de profundidad, nubes de puntos y limitaciones del modelo."
image: /assets/img/3d-reconstruction/3d-reconstruction-preview.png
image_width: 1200
image_height: 630
image_alt: "Reconstrucción 3D de una foto pública mediante profundidad estimada"
mathjax: true
tags: [computer-vision, 3d-graphics, machine-learning]
toc: true
---

{% include description.html content="¿Podemos reconstruir el mundo a partir de fotos públicas?" %}

## Cartografiando el mundo

Internet ofrece una abundancia de fotografías públicas procedentes de distintas fuentes: Reddit, YouTube, fotos subidas a Google Maps y muchas más.

![Ejemplo de fotos en Google Maps]({{ "/google-maps-photos.webp" | prepend: page.imgpath }}){: width="1600" height="1232" fetchpriority="high" decoding="async" style="max-height:400px;width:auto"}
{% include caption.html content="Fotos públicas disponibles en Google Maps" %}

Me pregunté: ¿es posible crear un mapa 3D del mundo a partir de todos estos datos? Las cámaras eliminan toda la información 3D en el momento en que se toma la foto, pero usando aprendizaje automático de última generación podemos recuperarla y transformar una foto como esta:

![Imagen pública de entrada de Safeway 0]({{ "/safeway-1.webp" | prepend: page.imgpath }}){: width="680" height="510" loading="lazy" decoding="async"}
{% include caption.html content="Imagen pública de entrada de Safeway 0." %}

En un modelo 3D como este:

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1360" height="810" poster="/assets/video/3d-reconstruction/safeway-1-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/safeway-1-recording.mp4" type="video/mp4">
        Tu navegador no admite la etiqueta de vídeo.
    </video>
</div>

Otro ejemplo, del famoso aeropuerto de Singapur:

![Imagen pública de entrada del aeropuerto de Singapur]({{ "/sg-airport-0.jpeg" | prepend: page.imgpath }}){: width="960" height="1280" loading="lazy" decoding="async" style="max-height:600px;width:auto"}
{% include caption.html content="Imagen pública de entrada del aeropuerto de Singapur." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1012" height="1008" poster="/assets/video/3d-reconstruction/sg-airport-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/sg-airport-recording.mp4" type="video/mp4">
        Tu navegador no admite la etiqueta de vídeo.
    </video>
</div>

E incluso la imagen de un bosque:

![Imagen pública de entrada de un bosque]({{ "/forest-0.jpg" | prepend: page.imgpath }}){: width="1500" height="900" loading="lazy" decoding="async"}
{% include caption.html content="Imagen pública de entrada de un bosque." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1358" height="714" poster="/assets/video/3d-reconstruction/forest-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/forest-recording.mp4" type="video/mp4">
        Tu navegador no admite la etiqueta de vídeo.
    </video>
</div>

Para lograrlo, utilicé un modelo de profundidad basado en aprendizaje automático y algo de álgebra lineal.

## Proyección de cámara

Podemos pensar en una cámara como algo que realiza una proyección de 3D a 2D, tal como se muestra en la imagen de abajo. Esto elimina la información sobre la tercera dimensión: la profundidad.

![Visualización de la proyección de cámara]({{ "/camera-projection.png" | prepend: page.imgpath }}){: width="850" height="356" loading="lazy" decoding="async"}
{% include caption.html content="Proyección de cámara de 3D a 2D. Fuente: [1]" %}

Nuestra tarea consiste en recuperar esta tercera dimensión y luego averiguar cómo deshacer dicha proyección.

## Parámetros intrínsecos de la cámara

Para reconstruir una imagen en 3D no basta con conocer la profundidad de cada píxel. Esto se debe a que las propiedades de la cámara —sobre todo la distancia focal— determinan cómo se proyectan los puntos del espacio 3D sobre píxeles en 2D, así que para invertir esa proyección necesitamos conocer dichas propiedades. Observa la demostración de abajo, donde diferentes distancias focales producen imágenes notablemente distintas:

<div style="text-align:center">
  <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="600" height="600" poster="/assets/video/3d-reconstruction/face-focal-length-poster.webp" style="max-height:400px;width:auto">
    <source src="/assets/video/3d-reconstruction/face-focal-length.mp4" type="video/mp4">
    Demostración de rostro frente a distancia focal
  </video>
</div>
{% include caption.html content="Demostración del efecto de la distancia focal sobre una imagen. Fuente: [2]" %}

Lógicamente, se deduce que si queremos reconstruir el rostro en 3D a partir de cualquiera de esas imágenes, necesitamos conocer las propiedades de la cámara.

Usando las propiedades de los triángulos semejantes que se muestran abajo, se puede ver que la relación entre los puntos de la imagen y los puntos en 3D es muy sencilla:

{%include math.html content=
"
\begin{align}
x = f \frac{X}{Z} \space\space\space\space\space y = f \frac{Y}{Z} \tag{1} \label{eq:camera perspective projection}
\end{align}
" 
%}

![Proyección en perspectiva de la cámara]({{ "/camera-perspective-focal.png" | prepend: page.imgpath }}){: width="1073" height="834" loading="lazy" decoding="async"}
{% include caption.html content="Proyección en perspectiva de la cámara" %}

Al invertir esta transformación para llevar los puntos de la imagen de vuelta al espacio 3D, obtenemos:

{%include math.html content=
"
\begin{align}
X = \frac{x \cdot Z}{f} \space\space\space\space\space Y = \frac{y \cdot Z}{f} \space\space\space\space\space Z = Z \tag{2} \label{eq:inverse camera perspective projection}
\end{align}
" 
%}

Así pues, las dos piezas que nos faltan son la profundidad en cada píxel, $$Z$$, y la distancia focal de la cámara, $$f$$. Ninguna de las dos está disponible directamente en las fotos públicas. Los datos EXIF, que podrían contener información de la cámara, suelen eliminarse.

Cabe señalar que también es posible describir la transformación completa entre los sistemas de coordenadas 3D y 2D teniendo en cuenta la pose de la cámara, como se muestra abajo. Sin embargo, para el propósito de este artículo, solo consideramos el sistema de coordenadas local de la cámara.

![Modelo completo de cámara]({{ "/complete-camera-model.jpg" | prepend: page.imgpath }}){: width="1280" height="720" loading="lazy" decoding="async"}
{% include caption.html content="Modelo completo de cámara. Fuente: [3]" %}

## Mapas de profundidad

El modelo [DepthPro](https://github.com/apple/ml-depth-pro), publicado recientemente por Apple, hizo posible este proyecto. Aunque los modelos de profundidad existen desde hace mucho tiempo, observé que este destacaba en dos aspectos:
    1. Proporcionaba la profundidad en una escala métrica absoluta, lo que significaba que las reconstrucciones 3D tendrían proporciones métricas reales incluso a partir de una sola imagen monocular.
    2. Estimaba por mí la distancia focal de la cámara.

![Presentación de Depth Pro]({{ "/depth-pro-teaser.webp" | prepend: page.imgpath }}){: width="1242" height="535" loading="lazy" decoding="async"}
{% include caption.html content="Presentación de Depth Pro. Fuente: [4]" %}

Ejecuté este modelo sobre un montón de fotos públicas para estimar sus mapas de profundidad y distancias focales, tal como se muestra a continuación. Por ejemplo, para esta imagen:

![Imagen pública de entrada de Safeway 1]({{ "/safeway-1.webp" | prepend: page.imgpath }}){: width="680" height="510" loading="lazy" decoding="async"}
{% include caption.html content="Imagen pública de entrada de Safeway 1." %}

El mapa de profundidad y la distancia focal estimados correspondientes son:

![Mapa de profundidad 1 de Safeway]({{ "/safeway-1-depth-black.png" | prepend: page.imgpath }}){: width="507" height="396" loading="lazy" decoding="async"}
{% include caption.html content="Mapa de profundidad 1 de Safeway y distancia focal predichos por el modelo DepthPro." %}

Luego utilicé las ecuaciones $$(2)$$ para proyectar cada píxel de vuelta al espacio 3D, creé una nube de puntos y la visualicé con Open3D:

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1360" height="810" poster="/assets/video/3d-reconstruction/safeway-1-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/safeway-1-recording.mp4" type="video/mp4">
        Tu navegador no admite la etiqueta de vídeo.
    </video>
</div>

## Reconstrucción 3D

Echa un vistazo a todos mis ejemplos a continuación. Fíjate especialmente en el ejemplo del horizonte de Nueva York (NYC Skyline). Tenía curiosidad por ver qué tal funcionaría en una escena enorme como el perfil urbano de Nueva York. Como era de esperar, el modelo DepthPro no produjo un buen mapa de profundidad: es casi seguro que su conjunto de datos de entrenamiento se centró en escalas más pequeñas.

### COEX Mall

![Imagen pública de entrada de COEX Mall]({{ "/coex-0.jpg" | prepend: page.imgpath }}){: width="924" height="483" loading="lazy" decoding="async"}
{% include caption.html content="Imagen pública de entrada de COEX Mall." %}

![Mapa de profundidad de COEX Mall]({{ "/coex-0-depth-black.png" | prepend: page.imgpath }}){: width="506" height="389" loading="lazy" decoding="async"}
{% include caption.html content="Mapa de profundidad de COEX Mall y distancia focal predichos por el modelo DepthPro." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1398" height="848" poster="/assets/video/3d-reconstruction/coex-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/coex-recording.mp4" type="video/mp4">
        Tu navegador no admite la etiqueta de vídeo.
    </video>
</div>

<div class="divider"></div>

### Bosque

![Imagen pública de entrada de un bosque]({{ "/forest-0.jpg" | prepend: page.imgpath }}){: width="1500" height="900" loading="lazy" decoding="async"}
{% include caption.html content="Imagen pública de entrada de un bosque." %}

![Mapa de profundidad del bosque]({{ "/forest-0-depth-black.png" | prepend: page.imgpath }}){: width="506" height="389" loading="lazy" decoding="async"}
{% include caption.html content="Mapa de profundidad del bosque y distancia focal predichos por el modelo DepthPro." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1358" height="714" poster="/assets/video/3d-reconstruction/forest-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/forest-recording.mp4" type="video/mp4">
        Tu navegador no admite la etiqueta de vídeo.
    </video>
</div>

<div class="divider"></div>

### Horizonte de Nueva York

![Imagen pública de entrada de Nueva York]({{ "/nyc-0.webp" | prepend: page.imgpath }}){: width="1000" height="560" loading="lazy" decoding="async"}
{% include caption.html content="Imagen pública de entrada de Nueva York." %}

![Mapa de profundidad de Nueva York]({{ "/nyc-depth-black.png" | prepend: page.imgpath }}){: width="498" height="389" loading="lazy" decoding="async"}
{% include caption.html content="Mapa de profundidad de Nueva York y distancia focal predichos por el modelo DepthPro." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1382" height="714" poster="/assets/video/3d-reconstruction/nyc-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/nyc-recording.mp4" type="video/mp4">
        Tu navegador no admite la etiqueta de vídeo.
    </video>
</div>

<div class="divider"></div>

### Safeway 1

![Imagen pública de entrada de Safeway 0]({{ "/safeway-0.webp" | prepend: page.imgpath }}){: width="680" height="510" loading="lazy" decoding="async"}
{% include caption.html content="Imagen pública de entrada de Safeway 0." %}

![Mapa de profundidad 0 de Safeway]({{ "/safeway-0-depth-black.png" | prepend: page.imgpath }}){: width="506" height="396" loading="lazy" decoding="async"}
{% include caption.html content="Mapa de profundidad 0 de Safeway y distancia focal predichos por el modelo DepthPro." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1066" height="776" poster="/assets/video/3d-reconstruction/safeway-0-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/safeway-0-recording.mp4" type="video/mp4">
        Tu navegador no admite la etiqueta de vídeo.
    </video>
</div>

<div class="divider"></div>

### Safeway 2

![Imagen pública de entrada de Safeway 1]({{ "/safeway-1.webp" | prepend: page.imgpath }}){: width="680" height="510" loading="lazy" decoding="async"}
{% include caption.html content="Imagen pública de entrada de Safeway 1." %}

![Mapa de profundidad 1 de Safeway]({{ "/safeway-1-depth-black.png" | prepend: page.imgpath }}){: width="507" height="396" loading="lazy" decoding="async"}
{% include caption.html content="Mapa de profundidad 1 de Safeway y distancia focal predichos por el modelo DepthPro." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1360" height="810" poster="/assets/video/3d-reconstruction/safeway-1-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/safeway-1-recording.mp4" type="video/mp4">
        Tu navegador no admite la etiqueta de vídeo.
    </video>
</div>

<div class="divider"></div>

### Aeropuerto de Singapur

![Imagen pública de entrada del aeropuerto de Singapur]({{ "/sg-airport-0.jpeg" | prepend: page.imgpath }}){: width="960" height="1280" loading="lazy" decoding="async" style="max-height:600px;width:auto"}
{% include caption.html content="Imagen pública de entrada del aeropuerto de Singapur." %}

![Mapa de profundidad del aeropuerto de Singapur]({{ "/sg-airport-0-depth-black.png" | prepend: page.imgpath }}){: width="387" height="432" loading="lazy" decoding="async"}
{% include caption.html content="Mapa de profundidad del aeropuerto de Singapur y distancia focal predichos por el modelo DepthPro." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1012" height="1008" poster="/assets/video/3d-reconstruction/sg-airport-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/sg-airport-recording.mp4" type="video/mp4">
        Tu navegador no admite la etiqueta de vídeo.
    </video>
</div>

<div class="divider"></div> 

## Notas al pie

1. Proyección de cámara de 3D a 2D. Fuente: [ResearchGate](https://www.researchgate.net/figure/The-perspective-projection-of-a-camera-model_fig2_324584663)
2. Demostración del efecto de la distancia focal sobre una imagen. Fuente: [DIY Photography](https://www.diyphotography.net/gif-explains-changing-focal-length-impacts-portrait)
3. Modelo completo de cámara. Fuente: [Robot Academy](https://robotacademy.net.au/lesson/summary-of-image-geometry/)
4. Presentación de Depth Pro. Fuente: [Apple](https://github.com/apple/ml-depth-pro)
