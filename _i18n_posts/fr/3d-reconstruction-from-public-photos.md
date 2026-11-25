---
layout: post
lang_code: fr
locale: fr_FR
ref: 3d-reconstruction-from-public-photos
date: 2025-08-21 00:00:00 -0700
last_modified_at: 2025-08-21 00:00
permalink: /fr/3d-reconstruction-from-public-photos
title: "Reconstruction 3D à partir de photos publiques par apprentissage automatique"
imgpath: /assets/img/3d-reconstruction
previewurl: /3d-reconstruction-preview.png
description: "Reconstruire des photos publiques en 3D avec Apple Depth Pro, la projection de caméra et Open3D. Exemples de cartes de profondeur, de nuages de points et des limites du modèle."
image: /assets/img/3d-reconstruction/3d-reconstruction-preview.png
image_width: 1200
image_height: 630
image_alt: "Reconstruction 3D d'une photo publique à partir d'une profondeur estimée"
mathjax: true
tags: [computer-vision, 3d-graphics, machine-learning]
toc: true
---

{% include description.html content="Peut-on reconstruire le monde à partir de photos publiques ?" %}

## Cartographier le monde

Internet regorge de photos publiques provenant de sources variées : Reddit, YouTube, photos publiées sur Google Maps, etc.

![Exemple de photos Google Maps]({{ "/google-maps-photos.webp" | prepend: page.imgpath }}){: width="1600" height="1232" fetchpriority="high" decoding="async" style="max-height:400px;width:auto"}
{% include caption.html content="Photos publiques disponibles sur Google Maps" %}

Je me suis demandé : serait-il possible de créer une carte 3D du monde à partir de toutes ces données ? Un appareil photo supprime toute l'information 3D au moment de la prise de vue — mais grâce à l'apprentissage automatique de pointe, nous pouvons la retrouver et transformer une photo comme celle-ci :

![Image d'entrée Safeway 0]({{ "/safeway-1.webp" | prepend: page.imgpath }}){: width="680" height="510" loading="lazy" decoding="async"}
{% include caption.html content="Image publique d'entrée Safeway 0." %}

en un modèle 3D comme celui-là :

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1360" height="810" poster="/assets/video/3d-reconstruction/safeway-1-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/safeway-1-recording.mp4" type="video/mp4">
        Votre navigateur ne prend pas en charge la balise vidéo.
    </video>
</div>

Un autre exemple, pris au célèbre aéroport de Singapour :

![Image d'entrée de l'aéroport de Singapour]({{ "/sg-airport-0.jpeg" | prepend: page.imgpath }}){: width="960" height="1280" loading="lazy" decoding="async" style="max-height:600px;width:auto"}
{% include caption.html content="Image publique d'entrée de l'aéroport de Singapour." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1012" height="1008" poster="/assets/video/3d-reconstruction/sg-airport-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/sg-airport-recording.mp4" type="video/mp4">
        Votre navigateur ne prend pas en charge la balise vidéo.
    </video>
</div>

Et même une photo de forêt :

![Image d'entrée d'une forêt]({{ "/forest-0.jpg" | prepend: page.imgpath }}){: width="1500" height="900" loading="lazy" decoding="async"}
{% include caption.html content="Image publique d'entrée d'une forêt." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1358" height="714" poster="/assets/video/3d-reconstruction/forest-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/forest-recording.mp4" type="video/mp4">
        Votre navigateur ne prend pas en charge la balise vidéo.
    </video>
</div>

Pour obtenir ce résultat, j'ai combiné un modèle de profondeur basé sur l'apprentissage automatique et un peu d'algèbre linéaire.

## Projection de caméra

On peut voir un appareil photo comme réalisant une projection de la 3D vers la 2D, comme sur le schéma ci-dessous. Cette opération fait disparaître l'information liée à la 3e dimension : la profondeur.

![Visualisation de la projection de caméra]({{ "/camera-projection.png" | prepend: page.imgpath }}){: width="850" height="356" loading="lazy" decoding="async"}
{% include caption.html content="Projection de caméra de la 3D vers la 2D. Source : [1]" %}

Notre objectif consiste à retrouver cette 3e dimension, puis à déterminer comment inverser cette projection.

## Paramètres intrinsèques de la caméra

Connaître la profondeur de chaque pixel de l'image ne suffit pas pour la reconstruire en 3D. En effet, les caractéristiques de l'appareil photo — et au premier chef sa distance focale — déterminent la manière dont les points de l'espace 3D sont projetés sur les pixels 2D ; pour inverser cette transformation, nous avons donc besoin de ces propriétés optiques. Voyez la démonstration ci-dessous, où différentes distances focales produisent des images sensiblement différentes :

<div style="text-align:center">
  <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="600" height="600" poster="/assets/video/3d-reconstruction/face-focal-length-poster.webp" style="max-height:400px;width:auto">
    <source src="/assets/video/3d-reconstruction/face-focal-length.mp4" type="video/mp4">
    Démonstration de l'effet de la distance focale sur un visage
  </video>
</div>
{% include caption.html content="Démonstration de l'effet de la distance focale sur l'image. Source : [2]" %}

Il s'ensuit logiquement que si l'on veut reconstruire le visage en 3D à partir de l'une quelconque de ces images, il faut connaître les paramètres de la caméra.

En utilisant les propriétés des triangles semblables illustrées ci-dessous, on voit que la relation entre les coordonnées image et les points 3D est simple :

{%include math.html content=
"
\begin{align}
x = f \frac{X}{Z} \space\space\space\space\space y = f \frac{Y}{Z} \tag{1} \label{eq:camera perspective projection}
\end{align}
" 
%}

![Projection perspective de la caméra]({{ "/camera-perspective-focal.png" | prepend: page.imgpath }}){: width="1073" height="834" loading="lazy" decoding="async"}
{% include caption.html content="Projection perspective de la caméra" %}

En inversant cette transformation pour reprojeter les points de l'image en 3D, on obtient :

{%include math.html content=
"
\begin{align}
X = \frac{x \cdot Z}{f} \space\space\space\space\space Y = \frac{y \cdot Z}{f} \space\space\space\space\space Z = Z \tag{2} \label{eq:inverse camera perspective projection}
\end{align}
" 
%}

Les deux pièces manquantes dont nous avons besoin sont donc la profondeur en chaque pixel, $$Z$$, et la distance focale de la caméra, $$f$$. Or aucune des deux n'est directement disponible dans les photos publiques : les métadonnées EXIF, qui pourraient contenir des informations sur l'appareil photo, sont généralement supprimées.

Notons qu'il est également possible de décrire la transformation complète entre les repères 3D et 2D en tenant compte de la pose de la caméra, comme illustré ci-dessous. Mais dans le cadre de cet article, nous nous limitons au repère local de la caméra.

![Modèle complet de caméra]({{ "/complete-camera-model.jpg" | prepend: page.imgpath }}){: width="1280" height="720" loading="lazy" decoding="async"}
{% include caption.html content="Modèle complet de caméra. Source : [3]" %}

## Cartes de profondeur

C'est la sortie récente du [modèle DepthPro d'Apple](https://github.com/apple/ml-depth-pro) qui a rendu ce projet possible. Des modèles d'estimation de profondeur existent depuis longtemps, mais celui-ci se distingue sur deux points essentiels :
    1. Il fournit la profondeur à une échelle métrique absolue, ce qui signifie que les reconstructions 3D conservent de vraies proportions métriques, même à partir d'une seule image monoculaire.
    2. Il estime directement la distance focale de la caméra.

![Aperçu de Depth Pro]({{ "/depth-pro-teaser.webp" | prepend: page.imgpath }}){: width="1242" height="535" loading="lazy" decoding="async"}
{% include caption.html content="Aperçu de Depth Pro. Source : [4]" %}

J'ai fait tourner ce modèle sur toute une série de photos publiques pour estimer leurs cartes de profondeur et leurs focales, comme ci-dessous. Par exemple, pour cette image :

![Image d'entrée Safeway 1]({{ "/safeway-1.webp" | prepend: page.imgpath }}){: width="680" height="510" loading="lazy" decoding="async"}
{% include caption.html content="Image publique d'entrée Safeway 1." %}

La carte de profondeur et la focale estimées correspondantes sont :

![Carte de profondeur Safeway 1]({{ "/safeway-1-depth-black.png" | prepend: page.imgpath }}){: width="507" height="396" loading="lazy" decoding="async"}
{% include caption.html content="Carte de profondeur Safeway 1 et distance focale prédites par le modèle DepthPro." %}

J'ai ensuite appliqué les équations $$(2)$$ pour reprojeter chaque pixel en 3D, créé un nuage de points et visualisé le résultat avec Open3D :

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1360" height="810" poster="/assets/video/3d-reconstruction/safeway-1-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/safeway-1-recording.mp4" type="video/mp4">
        Votre navigateur ne prend pas en charge la balise vidéo.
    </video>
</div>

## Reconstructions 3D

Découvrez tous mes exemples ci-dessous. Regardez en particulier l'exemple de la skyline de New York : j'étais curieux de voir comment le modèle s'en sortirait sur une scène immense comme l'horizon de Manhattan. Comme on pouvait s'y attendre, DepthPro n'a pas produit une bonne carte de profondeur. Le jeu de données d'entraînement s'est très certainement concentré sur des échelles plus modestes.

### COEX Mall

![Image d'entrée COEX Mall]({{ "/coex-0.jpg" | prepend: page.imgpath }}){: width="924" height="483" loading="lazy" decoding="async"}
{% include caption.html content="Image publique d'entrée COEX Mall." %}

![Carte de profondeur COEX Mall]({{ "/coex-0-depth-black.png" | prepend: page.imgpath }}){: width="506" height="389" loading="lazy" decoding="async"}
{% include caption.html content="Carte de profondeur COEX Mall et distance focale prédites par le modèle DepthPro." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1398" height="848" poster="/assets/video/3d-reconstruction/coex-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/coex-recording.mp4" type="video/mp4">
        Votre navigateur ne prend pas en charge la balise vidéo.
    </video>
</div>

<div class="divider"></div>

### Forêt

![Image d'entrée forêt]({{ "/forest-0.jpg" | prepend: page.imgpath }}){: width="1500" height="900" loading="lazy" decoding="async"}
{% include caption.html content="Image publique d'entrée d'une forêt." %}

![Carte de profondeur forêt]({{ "/forest-0-depth-black.png" | prepend: page.imgpath }}){: width="506" height="389" loading="lazy" decoding="async"}
{% include caption.html content="Carte de profondeur de la forêt et distance focale prédites par le modèle DepthPro." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1358" height="714" poster="/assets/video/3d-reconstruction/forest-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/forest-recording.mp4" type="video/mp4">
        Votre navigateur ne prend pas en charge la balise vidéo.
    </video>
</div>

<div class="divider"></div>

### Skyline de New York

![Image d'entrée New York]({{ "/nyc-0.webp" | prepend: page.imgpath }}){: width="1000" height="560" loading="lazy" decoding="async"}
{% include caption.html content="Image publique d'entrée de New York." %}

![Carte de profondeur New York]({{ "/nyc-depth-black.png" | prepend: page.imgpath }}){: width="498" height="389" loading="lazy" decoding="async"}
{% include caption.html content="Carte de profondeur de New York et distance focale prédites par le modèle DepthPro." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1382" height="714" poster="/assets/video/3d-reconstruction/nyc-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/nyc-recording.mp4" type="video/mp4">
        Votre navigateur ne prend pas en charge la balise vidéo.
    </video>
</div>

<div class="divider"></div>

### Safeway 1

![Image d'entrée Safeway 0]({{ "/safeway-0.webp" | prepend: page.imgpath }}){: width="680" height="510" loading="lazy" decoding="async"}
{% include caption.html content="Image publique d'entrée Safeway 0." %}

![Carte de profondeur Safeway 0]({{ "/safeway-0-depth-black.png" | prepend: page.imgpath }}){: width="506" height="396" loading="lazy" decoding="async"}
{% include caption.html content="Carte de profondeur Safeway 0 et distance focale prédites par le modèle DepthPro." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1066" height="776" poster="/assets/video/3d-reconstruction/safeway-0-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/safeway-0-recording.mp4" type="video/mp4">
        Votre navigateur ne prend pas en charge la balise vidéo.
    </video>
</div>

<div class="divider"></div>

### Safeway 2

![Image d'entrée Safeway 1]({{ "/safeway-1.webp" | prepend: page.imgpath }}){: width="680" height="510" loading="lazy" decoding="async"}
{% include caption.html content="Image publique d'entrée Safeway 1." %}

![Carte de profondeur Safeway 1]({{ "/safeway-1-depth-black.png" | prepend: page.imgpath }}){: width="507" height="396" loading="lazy" decoding="async"}
{% include caption.html content="Carte de profondeur Safeway 1 et distance focale prédites par le modèle DepthPro." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1360" height="810" poster="/assets/video/3d-reconstruction/safeway-1-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/safeway-1-recording.mp4" type="video/mp4">
        Votre navigateur ne prend pas en charge la balise vidéo.
    </video>
</div>

<div class="divider"></div>

### Aéroport de Singapour

![Image d'entrée aéroport de Singapour]({{ "/sg-airport-0.jpeg" | prepend: page.imgpath }}){: width="960" height="1280" loading="lazy" decoding="async" style="max-height:600px;width:auto"}
{% include caption.html content="Image publique d'entrée de l'aéroport de Singapour." %}

![Carte de profondeur aéroport de Singapour]({{ "/sg-airport-0-depth-black.png" | prepend: page.imgpath }}){: width="387" height="432" loading="lazy" decoding="async"}
{% include caption.html content="Carte de profondeur de l'aéroport de Singapour et distance focale prédites par le modèle DepthPro." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1012" height="1008" poster="/assets/video/3d-reconstruction/sg-airport-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/sg-airport-recording.mp4" type="video/mp4">
        Votre navigateur ne prend pas en charge la balise vidéo.
    </video>
</div>

<div class="divider"></div>

## Notes

1. Projection de caméra de la 3D vers la 2D. Source : [ResearchGate](https://www.researchgate.net/figure/The-perspective-projection-of-a-camera-model_fig2_324584663)
2. Démonstration de l'effet de la distance focale sur l'image. Source : [DIY Photography](https://www.diyphotography.net/gif-explains-changing-focal-length-impacts-portrait)
3. Modèle complet de caméra. Source : [Robot Academy](https://robotacademy.net.au/lesson/summary-of-image-geometry/)
4. Aperçu de Depth Pro. Source : [Apple](https://github.com/apple/ml-depth-pro)
