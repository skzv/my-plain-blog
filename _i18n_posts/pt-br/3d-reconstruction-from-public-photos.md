---
layout: post
lang_code: pt-br
locale: pt_BR
ref: 3d-reconstruction-from-public-photos
date: 2025-08-21 00:00:00 -0700
last_modified_at: 2025-08-21 00:00
permalink: /pt-br/3d-reconstruction-from-public-photos
title: "Reconstrução 3D a partir de fotos públicas com Machine Learning"
imgpath: /assets/img/3d-reconstruction
previewurl: /3d-reconstruction-preview.png
description: "Reconstruindo fotos públicas em 3D com o Apple Depth Pro, projeção de câmera e Open3D. Os exemplos mostram estimativas de profundidade, nuvens de pontos e limitações do modelo."
image: /assets/img/3d-reconstruction/3d-reconstruction-preview.png
image_width: 1200
image_height: 630
image_alt: "Reconstrução 3D de uma foto pública usando estimativa de profundidade"
mathjax: true
tags: [computer-vision, 3d-graphics, machine-learning]
toc: true
---

{% include description.html content="Podemos reconstruir o mundo a partir de fotos públicas?" %}

## Mapeando o mundo

A internet oferece uma abundância de fotos públicas vindas de diversas fontes: Reddit, YouTube, fotos enviadas ao Google Maps e por aí vai.

![Exemplo de fotos do Google Maps]({{ "/google-maps-photos.webp" | prepend: page.imgpath }}){: width="1600" height="1232" fetchpriority="high" decoding="async" style="max-height:400px;width:auto"}
{% include caption.html content="Fotos públicas disponíveis no Google Maps" %}

Fiquei me perguntando: será que é possível criar um mapa 3D do mundo a partir de todos esses dados? Câmeras eliminam toda a informação tridimensional quando a foto é tirada — mas, usando aprendizado de máquina de ponta, podemos recuperá-la e transformar uma foto como esta:

![Imagem pública de entrada do Safeway 0]({{ "/safeway-1.webp" | prepend: page.imgpath }}){: width="680" height="510" loading="lazy" decoding="async"}
{% include caption.html content="Imagem pública de entrada do Safeway 0." %}

Em um modelo 3D como este:

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1360" height="810" poster="/assets/video/3d-reconstruction/safeway-1-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/safeway-1-recording.mp4" type="video/mp4">
        Seu navegador não suporta a tag de vídeo.
    </video>
</div>

Outro exemplo, do famoso Aeroporto de Singapura:

![Imagem de entrada do Aeroporto de Singapura]({{ "/sg-airport-0.jpeg" | prepend: page.imgpath }}){: width="960" height="1280" loading="lazy" decoding="async" style="max-height:600px;width:auto"}
{% include caption.html content="Imagem pública de entrada do Aeroporto de Singapura." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1012" height="1008" poster="/assets/video/3d-reconstruction/sg-airport-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/sg-airport-recording.mp4" type="video/mp4">
        Seu navegador não suporta a tag de vídeo.
    </video>
</div>

E até mesmo uma imagem de uma floresta:

![Imagem de entrada de uma floresta]({{ "/forest-0.jpg" | prepend: page.imgpath }}){: width="1500" height="900" loading="lazy" decoding="async"}
{% include caption.html content="Imagem pública de entrada de uma floresta." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1358" height="714" poster="/assets/video/3d-reconstruction/forest-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/forest-recording.mp4" type="video/mp4">
        Seu navegador não suporta a tag de vídeo.
    </video>
</div>

Para conseguir isso, usei um modelo de profundidade de ML e um pouco de álgebra linear.

## Projeção de câmera

Podemos pensar em uma câmera como algo que realiza uma projeção do 3D para o 2D, como na imagem abaixo. Isso remove a informação da terceira dimensão: a profundidade.

![Visualização da projeção de câmera]({{ "/camera-projection.png" | prepend: page.imgpath }}){: width="850" height="356" loading="lazy" decoding="async"}
{% include caption.html content="Projeção de câmera de 3D para 2D. Fonte: [1]" %}

Nossa tarefa é recuperar essa terceira dimensão e, depois, descobrir como desfazer essa projeção.

## Parâmetros intrínsecos da câmera

Saber a profundidade de cada pixel na imagem não é suficiente para reconstruí-la em 3D. Isso porque as propriedades da câmera — principalmente a distância focal — determinam como pontos em 3D são mapeados em pixels no plano 2D; portanto, para reverter esse mapeamento, precisamos conhecer essas propriedades da câmera. Veja a demonstração abaixo, na qual diferentes distâncias focais produzem imagens bem distintas:

<div style="text-align:center">
  <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="600" height="600" poster="/assets/video/3d-reconstruction/face-focal-length-poster.webp" style="max-height:400px;width:auto">
    <source src="/assets/video/3d-reconstruction/face-focal-length.mp4" type="video/mp4">
    Demonstração de rosto vs. distância focal
  </video>
</div>
{% include caption.html content="Uma demonstração do efeito da distância focal sobre a imagem. Fonte: [2]" %}

Logicamente, se quisermos reconstruir o rosto em 3D a partir de qualquer uma dessas imagens, precisamos saber as propriedades da câmera.

Usando as propriedades de triângulos semelhantes mostradas abaixo, vemos que a relação entre os pontos na imagem e os pontos em 3D é simples:

{%include math.html content=
"
\begin{align}
x = f \frac{X}{Z} \space\space\space\space\space y = f \frac{Y}{Z} \tag{1} \label{eq:camera perspective projection}
\end{align}
" 
%}

![Projeção em perspectiva da câmera]({{ "/camera-perspective-focal.png" | prepend: page.imgpath }}){: width="1073" height="834" loading="lazy" decoding="async"}
{% include caption.html content="Projeção em perspectiva da câmera" %}

Invertendo essa transformação para mapear os pontos da imagem de volta ao 3D, obtemos:

{%include math.html content=
"
\begin{align}
X = \frac{x \cdot Z}{f} \space\space\space\space\space Y = \frac{y \cdot Z}{f} \space\space\space\space\space Z = Z \tag{2} \label{eq:inverse camera perspective projection}
\end{align}
" 
%}

Portanto, as duas peças que nos faltam são a profundidade em cada pixel, $$Z$$, e a distância focal da câmera, $$f$$. Nenhuma delas está imediatamente disponível em fotos públicas. Os metadados EXIF, que poderiam conter informações da câmera, costumam ser removidos.

Vale notar que também é possível descrever a transformação completa entre os sistemas de coordenadas 3D e 2D levando em conta a pose da câmera, como mostrado abaixo. Mas, para o propósito deste artigo, consideramos apenas o sistema de coordenadas local da câmera.

![Modelo completo de câmera]({{ "/complete-camera-model.jpg" | prepend: page.imgpath }}){: width="1280" height="720" loading="lazy" decoding="async"}
{% include caption.html content="Modelo completo de câmera. Fonte: [3]" %}

## Mapas de profundidade

O modelo [DepthPro](https://github.com/apple/ml-depth-pro), lançado recentemente pela Apple, tornou este projeto possível. Embora modelos de estimativa de profundidade existam há bastante tempo, notei que este modelo se destaca por dois motivos:
    1. Ele fornece profundidade em escala métrica absoluta, o que significa que as reconstruções 3D mantêm proporções métricas reais, mesmo geradas a partir de uma única imagem monocular
    2. Ele estima a distância focal da câmera para mim

![Teaser do Depth Pro]({{ "/depth-pro-teaser.webp" | prepend: page.imgpath }}){: width="1242" height="535" loading="lazy" decoding="async"}
{% include caption.html content="Teaser do Depth Pro. Fonte: [4]" %}

Rodei esse modelo em várias fotos públicas, estimando os mapas de profundidade e as distâncias focais, como mostrado abaixo. Por exemplo, para esta imagem:

![Imagem pública de entrada do Safeway 1]({{ "/safeway-1.webp" | prepend: page.imgpath }}){: width="680" height="510" loading="lazy" decoding="async"}
{% include caption.html content="Imagem pública de entrada do Safeway 1." %}

O mapa de profundidade e a distância focal estimados correspondentes são:

![Mapa de profundidade 1 do Safeway]({{ "/safeway-1-depth-black.png" | prepend: page.imgpath }}){: width="507" height="396" loading="lazy" decoding="async"}
{% include caption.html content="Mapa de profundidade 1 do Safeway e distância focal previstos pelo modelo DepthPro." %}

Em seguida, usei as equações $$(2)$$ para mapear cada pixel de volta ao espaço 3D, criei uma nuvem de pontos (_point cloud_) e a visualizei com o Open3D:

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1360" height="810" poster="/assets/video/3d-reconstruction/safeway-1-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/safeway-1-recording.mp4" type="video/mp4">
        Seu navegador não suporta a tag de vídeo.
    </video>
</div>

## Reconstrução 3D

Confira todos os meus exemplos abaixo. Em especial, dê uma olhada no exemplo do horizonte de Nova York (NYC Skyline). Fiquei curioso para ver como o modelo se sairia em uma cena gigantesca como o skyline de Nova York. Como esperado, o DepthPro não produziu um bom mapa de profundidade. O conjunto de dados de treinamento quase certamente focou em escalas menores.

### COEX Mall

![Imagem de entrada do COEX Mall]({{ "/coex-0.jpg" | prepend: page.imgpath }}){: width="924" height="483" loading="lazy" decoding="async"}
{% include caption.html content="Imagem pública de entrada do COEX Mall." %}

![Mapa de profundidade do COEX Mall]({{ "/coex-0-depth-black.png" | prepend: page.imgpath }}){: width="506" height="389" loading="lazy" decoding="async"}
{% include caption.html content="Mapa de profundidade do COEX Mall e distância focal previstos pelo modelo DepthPro." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1398" height="848" poster="/assets/video/3d-reconstruction/coex-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/coex-recording.mp4" type="video/mp4">
        Seu navegador não suporta a tag de vídeo.
    </video>
</div>

<div class="divider"></div>

### Floresta

![Imagem de entrada da floresta]({{ "/forest-0.jpg" | prepend: page.imgpath }}){: width="1500" height="900" loading="lazy" decoding="async"}
{% include caption.html content="Imagem pública de entrada de uma floresta." %}

![Mapa de profundidade da floresta]({{ "/forest-0-depth-black.png" | prepend: page.imgpath }}){: width="506" height="389" loading="lazy" decoding="async"}
{% include caption.html content="Mapa de profundidade da floresta e distância focal previstos pelo modelo DepthPro." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1358" height="714" poster="/assets/video/3d-reconstruction/forest-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/forest-recording.mp4" type="video/mp4">
        Seu navegador não suporta a tag de vídeo.
    </video>
</div>

<div class="divider"></div>

### Horizonte de Nova York

![Imagem de entrada de Nova York]({{ "/nyc-0.webp" | prepend: page.imgpath }}){: width="1000" height="560" loading="lazy" decoding="async"}
{% include caption.html content="Imagem pública de entrada de Nova York." %}

![Mapa de profundidade de Nova York]({{ "/nyc-depth-black.png" | prepend: page.imgpath }}){: width="498" height="389" loading="lazy" decoding="async"}
{% include caption.html content="Mapa de profundidade de Nova York e distância focal previstos pelo modelo DepthPro." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1382" height="714" poster="/assets/video/3d-reconstruction/nyc-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/nyc-recording.mp4" type="video/mp4">
        Seu navegador não suporta a tag de vídeo.
    </video>
</div>

<div class="divider"></div>

### Safeway 1

![Imagem pública de entrada do Safeway 0]({{ "/safeway-0.webp" | prepend: page.imgpath }}){: width="680" height="510" loading="lazy" decoding="async"}
{% include caption.html content="Imagem pública de entrada do Safeway 0." %}

![Mapa de profundidade 0 do Safeway]({{ "/safeway-0-depth-black.png" | prepend: page.imgpath }}){: width="506" height="396" loading="lazy" decoding="async"}
{% include caption.html content="Mapa de profundidade 0 do Safeway e distância focal previstos pelo modelo DepthPro." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1066" height="776" poster="/assets/video/3d-reconstruction/safeway-0-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/safeway-0-recording.mp4" type="video/mp4">
        Seu navegador não suporta a tag de vídeo.
    </video>
</div>

<div class="divider"></div>

### Safeway 2

![Imagem pública de entrada do Safeway 1]({{ "/safeway-1.webp" | prepend: page.imgpath }}){: width="680" height="510" loading="lazy" decoding="async"}
{% include caption.html content="Imagem pública de entrada do Safeway 1." %}

![Mapa de profundidade 1 do Safeway]({{ "/safeway-1-depth-black.png" | prepend: page.imgpath }}){: width="507" height="396" loading="lazy" decoding="async"}
{% include caption.html content="Mapa de profundidade 1 do Safeway e distância focal previstos pelo modelo DepthPro." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1360" height="810" poster="/assets/video/3d-reconstruction/safeway-1-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/safeway-1-recording.mp4" type="video/mp4">
        Seu navegador não suporta a tag de vídeo.
    </video>
</div>

<div class="divider"></div>

### Aeroporto de Singapura

![Imagem de entrada do Aeroporto de Singapura]({{ "/sg-airport-0.jpeg" | prepend: page.imgpath }}){: width="960" height="1280" loading="lazy" decoding="async" style="max-height:600px;width:auto"}
{% include caption.html content="Imagem pública de entrada do Aeroporto de Singapura." %}

![Mapa de profundidade do Aeroporto de Singapura]({{ "/sg-airport-0-depth-black.png" | prepend: page.imgpath }}){: width="387" height="432" loading="lazy" decoding="async"}
{% include caption.html content="Mapa de profundidade do Aeroporto de Singapura e distância focal previstos pelo modelo DepthPro." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1012" height="1008" poster="/assets/video/3d-reconstruction/sg-airport-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/sg-airport-recording.mp4" type="video/mp4">
        Seu navegador não suporta a tag de vídeo.
    </video>
</div>

<div class="divider"></div> 

## Notas de rodapé

1. Projeção de câmera de 3D para 2D. Fonte: [ResearchGate](https://www.researchgate.net/figure/The-perspective-projection-of-a-camera-model_fig2_324584663)
2. Demonstração do efeito da distância focal sobre a imagem. Fonte: [DIY Photography](https://www.diyphotography.net/gif-explains-changing-focal-length-impacts-portrait)
3. Modelo completo de câmera. Fonte: [Robot Academy](https://robotacademy.net.au/lesson/summary-of-image-geometry/)
4. Teaser do Depth Pro. Fonte: [Apple](https://github.com/apple/ml-depth-pro)
