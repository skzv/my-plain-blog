---
layout: post
lang_code: de
locale: de_DE
ref: 3d-reconstruction-from-public-photos
date: 2025-08-21 00:00:00 -0700
last_modified_at: 2025-08-21 00:00
permalink: /de/3d-reconstruction-from-public-photos
title: "3D-Rekonstruktion aus öffentlichen Fotos mit Machine Learning"
imgpath: /assets/img/3d-reconstruction
previewurl: /3d-reconstruction-preview.png
description: "Öffentliche Fotos mit Apple Depth Pro, Kameraprojektion und Open3D in 3D rekonstruieren. Beispiele zeigen Tiefenkarten, Punktwolken und Grenzen des Modells."
image: /assets/img/3d-reconstruction/3d-reconstruction-preview.png
image_width: 1200
image_height: 630
image_alt: "3D-Rekonstruktion eines öffentlichen Fotos mithilfe geschätzter Tiefe"
mathjax: true
tags: [computer-vision, 3d-graphics, machine-learning]
toc: true
---

{% include description.html content="Können wir die Welt aus öffentlichen Fotos rekonstruieren?" %}

## Die Welt kartieren

Das Internet bietet eine Fülle öffentlicher Fotos aus den verschiedensten Quellen: Reddit, YouTube, Foto-Uploads bei Google Maps und so weiter.

![Beispiel für Fotos auf Google Maps]({{ "/google-maps-photos.webp" | prepend: page.imgpath }}){: width="1600" height="1232" fetchpriority="high" decoding="async" style="max-height:400px;width:auto"}
{% include caption.html content="Öffentliche Fotos auf Google Maps" %}

Ich fragte mich: Ist es möglich, aus all diesen Daten eine 3D-Karte der Welt zu erstellen? Beim Fotografieren entfernen Kameras sämtliche 3D-Informationen – doch mit modernem Machine Learning können wir sie zurückholen und aus einem Foto wie diesem:

![Öffentliches Safeway-Eingabebild 0]({{ "/safeway-1.webp" | prepend: page.imgpath }}){: width="680" height="510" loading="lazy" decoding="async"}
{% include caption.html content="Öffentliches Safeway-Eingabebild 0." %}

ein 3D-Modell wie dieses machen:

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1360" height="810" poster="/assets/video/3d-reconstruction/safeway-1-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/safeway-1-recording.mp4" type="video/mp4">
        Dein Browser unterstützt das Video-Tag nicht.
    </video>
</div>

Ein weiteres Beispiel, vom berühmten Flughafen Singapur:

![Öffentliches Eingabebild vom Flughafen Singapur]({{ "/sg-airport-0.jpeg" | prepend: page.imgpath }}){: width="960" height="1280" loading="lazy" decoding="async" style="max-height:600px;width:auto"}
{% include caption.html content="Öffentliches Eingabebild vom Flughafen Singapur." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1012" height="1008" poster="/assets/video/3d-reconstruction/sg-airport-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/sg-airport-recording.mp4" type="video/mp4">
        Dein Browser unterstützt das Video-Tag nicht.
    </video>
</div>

Und sogar ein Foto eines Waldes:

![Öffentliches Eingabebild eines Waldes]({{ "/forest-0.jpg" | prepend: page.imgpath }}){: width="1500" height="900" loading="lazy" decoding="async"}
{% include caption.html content="Öffentliches Eingabebild eines Waldes." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1358" height="714" poster="/assets/video/3d-reconstruction/forest-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/forest-recording.mp4" type="video/mp4">
        Dein Browser unterstützt das Video-Tag nicht.
    </video>
</div>

Um das zu erreichen, habe ich ein ML-Tiefenmodell und ein wenig lineare Algebra eingesetzt.

## Kameraprojektion

Man kann eine Kamera als Projektion von 3D nach 2D betrachten, wie im Bild unten dargestellt. Dabei geht die Information über die dritte Dimension – die Tiefe – verloren.

![Visualisierung der Kameraprojektion]({{ "/camera-projection.png" | prepend: page.imgpath }}){: width="850" height="356" loading="lazy" decoding="async"}
{% include caption.html content="Kameraprojektion von 3D nach 2D. Quelle: [1]" %}

Unsere Aufgabe besteht darin, diese dritte Dimension zurückzugewinnen und anschließend herauszufinden, wie sich die Projektion umkehren lässt.

## Intrinsische Kameraparameter

Um ein Bild in 3D zu rekonstruieren, reicht es nicht aus, die Tiefe jedes einzelnen Pixels zu kennen. Denn die Eigenschaften der Kamera – vor allem die Brennweite – bestimmen, wie Punkte im 3D-Raum auf 2D-Pixel abgebildet werden. Um diese Abbildung rückgängig zu machen, brauchen wir also genau diese Kameraeigenschaften. Sieh dir die Demonstration unten an, in der verschiedene Brennweiten völlig unterschiedliche Bilder erzeugen:

<div style="text-align:center">
  <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="600" height="600" poster="/assets/video/3d-reconstruction/face-focal-length-poster.webp" style="max-height:400px;width:auto">
    <source src="/assets/video/3d-reconstruction/face-focal-length.mp4" type="video/mp4">
    Demonstration des Einflusses der Brennweite auf ein Porträt
  </video>
</div>
{% include caption.html content="Demonstration des Einflusses der Brennweite auf ein Bild. Quelle: [2]" %}

Logischerweise folgt daraus: Wenn wir das Gesicht aus einem dieser Bilder in 3D rekonstruieren wollen, müssen wir die Eigenschaften der Kamera kennen.

Über die Gesetze ähnlicher Dreiecke, wie unten gezeigt, ergibt sich ein ganz einfacher Zusammenhang zwischen den Bildpunkten und den 3D-Punkten:

{%include math.html content=
"
\begin{align}
x = f \frac{X}{Z} \space\space\space\space\space y = f \frac{Y}{Z} \tag{1} \label{eq:camera perspective projection}
\end{align}
" 
%}

![Perspektivische Kameraprojektion]({{ "/camera-perspective-focal.png" | prepend: page.imgpath }}){: width="1073" height="834" loading="lazy" decoding="async"}
{% include caption.html content="Perspektivische Kameraprojektion" %}

Kehren wir diese Transformation um, um Bildpunkte zurück in den 3D-Raum abzubilden, erhalten wir:

{%include math.html content=
"
\begin{align}
X = \frac{x \cdot Z}{f} \space\space\space\space\space Y = \frac{y \cdot Z}{f} \space\space\space\space\space Z = Z \tag{2} \label{eq:inverse camera perspective projection}
\end{align}
" 
%}

Die beiden fehlenden Bausteine, die wir brauchen, sind also die Tiefe an jedem Pixel, $$Z$$, und die Brennweite der Kamera, $$f$$. Keiner dieser beiden Werte ist bei öffentlichen Fotos direkt verfügbar – EXIF-Daten, die Kamerainformationen enthalten könnten, werden üblicherweise entfernt.

Übrigens lässt sich auch die vollständige Transformation zwischen 3D- und 2D-Koordinatensystemen unter Berücksichtigung der Kamerapose beschreiben, wie unten dargestellt. Für diesen Artikel betrachten wir aber einfach das lokale Koordinatensystem der Kamera.

![Vollständiges Kameramodell]({{ "/complete-camera-model.jpg" | prepend: page.imgpath }}){: width="1280" height="720" loading="lazy" decoding="async"}
{% include caption.html content="Vollständiges Kameramodell. Quelle: [3]" %}

## Tiefenkarten

Das kürzlich von Apple veröffentlichte [DepthPro-Modell](https://github.com/apple/ml-depth-pro) hat dieses Projekt erst möglich gemacht. Tiefenschätzungsmodelle gibt es zwar schon lange, aber mir fiel auf, dass dieses Modell in zwei Punkten besonders ist:
    1. Es liefert Tiefe auf einer absoluten, metrischen Skala – sodass 3D-Rekonstruktionen tatsächlich metrische Proportionen besitzen, selbst aus einem einzigen Monobild.
    2. Es schätzt gleichzeitig die Brennweite der Kamera mit.

![Depth-Pro-Teaser]({{ "/depth-pro-teaser.webp" | prepend: page.imgpath }}){: width="1242" height="535" loading="lazy" decoding="async"}
{% include caption.html content="Depth-Pro-Teaser. Quelle: [4]" %}

Ich habe das Modell auf eine Reihe öffentlicher Fotos angewendet, um jeweils Tiefenkarten und Brennweiten zu schätzen, wie unten zu sehen. Für dieses Bild zum Beispiel:

![Öffentliches Safeway-Eingabebild 1]({{ "/safeway-1.webp" | prepend: page.imgpath }}){: width="680" height="510" loading="lazy" decoding="async"}
{% include caption.html content="Öffentliches Safeway-Eingabebild 1." %}

sind die zugehörige geschätzte Tiefenkarte und Brennweite:

![Safeway-Tiefenkarte 1]({{ "/safeway-1-depth-black.png" | prepend: page.imgpath }}){: width="507" height="396" loading="lazy" decoding="async"}
{% include caption.html content="Safeway-Tiefenkarte 1 und Brennweite, vorhergesagt vom DepthPro-Modell." %}

Anschließend habe ich mithilfe von Gleichung $$(2)$$ jedes Pixel zurück in den 3D-Raum projiziert, daraus eine Punktwolke erzeugt und sie mit Open3D visualisiert:

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1360" height="810" poster="/assets/video/3d-reconstruction/safeway-1-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/safeway-1-recording.mp4" type="video/mp4">
        Dein Browser unterstützt das Video-Tag nicht.
    </video>
</div>

## 3D-Rekonstruktion

Schau dir alle meine Beispiele unten an. Besonders spannend ist das Beispiel der Skyline von New York City. Ich war neugierig, wie gut das Verfahren bei einer riesigen Szene wie der NYC-Skyline funktioniert. Wie erwartet lieferte DepthPro hier keine gute Tiefenkarte – der Trainingsdatensatz war ziemlich sicher auf kleinere Maßstäbe ausgerichtet.

### COEX Mall

![Öffentliches Eingabebild der COEX Mall]({{ "/coex-0.jpg" | prepend: page.imgpath }}){: width="924" height="483" loading="lazy" decoding="async"}
{% include caption.html content="Öffentliches Eingabebild der COEX Mall." %}

![Tiefenkarte der COEX Mall]({{ "/coex-0-depth-black.png" | prepend: page.imgpath }}){: width="506" height="389" loading="lazy" decoding="async"}
{% include caption.html content="Tiefenkarte der COEX Mall und Brennweite, vorhergesagt vom DepthPro-Modell." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1398" height="848" poster="/assets/video/3d-reconstruction/coex-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/coex-recording.mp4" type="video/mp4">
        Dein Browser unterstützt das Video-Tag nicht.
    </video>
</div>

<div class="divider"></div>

### Wald

![Öffentliches Eingabebild eines Waldes]({{ "/forest-0.jpg" | prepend: page.imgpath }}){: width="1500" height="900" loading="lazy" decoding="async"}
{% include caption.html content="Öffentliches Eingabebild eines Waldes." %}

![Tiefenkarte des Waldes]({{ "/forest-0-depth-black.png" | prepend: page.imgpath }}){: width="506" height="389" loading="lazy" decoding="async"}
{% include caption.html content="Tiefenkarte des Waldes und Brennweite, vorhergesagt vom DepthPro-Modell." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1358" height="714" poster="/assets/video/3d-reconstruction/forest-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/forest-recording.mp4" type="video/mp4">
        Dein Browser unterstützt das Video-Tag nicht.
    </video>
</div>

<div class="divider"></div>

### NYC-Skyline

![Öffentliches Eingabebild von NYC]({{ "/nyc-0.webp" | prepend: page.imgpath }}){: width="1000" height="560" loading="lazy" decoding="async"}
{% include caption.html content="Öffentliches Eingabebild von NYC." %}

![Tiefenkarte von NYC]({{ "/nyc-depth-black.png" | prepend: page.imgpath }}){: width="498" height="389" loading="lazy" decoding="async"}
{% include caption.html content="Tiefenkarte von NYC und Brennweite, vorhergesagt vom DepthPro-Modell." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1382" height="714" poster="/assets/video/3d-reconstruction/nyc-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/nyc-recording.mp4" type="video/mp4">
        Dein Browser unterstützt das Video-Tag nicht.
    </video>
</div>

<div class="divider"></div>

### Safeway 1

![Öffentliches Safeway-Eingabebild 0]({{ "/safeway-0.webp" | prepend: page.imgpath }}){: width="680" height="510" loading="lazy" decoding="async"}
{% include caption.html content="Öffentliches Safeway-Eingabebild 0." %}

![Safeway-Tiefenkarte 0]({{ "/safeway-0-depth-black.png" | prepend: page.imgpath }}){: width="506" height="396" loading="lazy" decoding="async"}
{% include caption.html content="Safeway-Tiefenkarte 0 und Brennweite, vorhergesagt vom DepthPro-Modell." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1066" height="776" poster="/assets/video/3d-reconstruction/safeway-0-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/safeway-0-recording.mp4" type="video/mp4">
        Dein Browser unterstützt das Video-Tag nicht.
    </video>
</div>

<div class="divider"></div>

### Safeway 2

![Öffentliches Safeway-Eingabebild 1]({{ "/safeway-1.webp" | prepend: page.imgpath }}){: width="680" height="510" loading="lazy" decoding="async"}
{% include caption.html content="Öffentliches Safeway-Eingabebild 1." %}

![Safeway-Tiefenkarte 1]({{ "/safeway-1-depth-black.png" | prepend: page.imgpath }}){: width="507" height="396" loading="lazy" decoding="async"}
{% include caption.html content="Safeway-Tiefenkarte 1 und Brennweite, vorhergesagt vom DepthPro-Modell." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1360" height="810" poster="/assets/video/3d-reconstruction/safeway-1-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/safeway-1-recording.mp4" type="video/mp4">
        Dein Browser unterstützt das Video-Tag nicht.
    </video>
</div>

<div class="divider"></div>

### Flughafen Singapur

![Öffentliches Eingabebild vom Flughafen Singapur]({{ "/sg-airport-0.jpeg" | prepend: page.imgpath }}){: width="960" height="1280" loading="lazy" decoding="async" style="max-height:600px;width:auto"}
{% include caption.html content="Öffentliches Eingabebild vom Flughafen Singapur." %}

![Tiefenkarte vom Flughafen Singapur]({{ "/sg-airport-0-depth-black.png" | prepend: page.imgpath }}){: width="387" height="432" loading="lazy" decoding="async"}
{% include caption.html content="Tiefenkarte vom Flughafen Singapur und Brennweite, vorhergesagt vom DepthPro-Modell." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1012" height="1008" poster="/assets/video/3d-reconstruction/sg-airport-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/sg-airport-recording.mp4" type="video/mp4">
        Dein Browser unterstützt das Video-Tag nicht.
    </video>
</div>

<div class="divider"></div> 

## Fußnoten

1. Kameraprojektion von 3D nach 2D. Quelle: [ResearchGate](https://www.researchgate.net/figure/The-perspective-projection-of-a-camera-model_fig2_324584663)
2. Demonstration des Einflusses der Brennweite auf ein Bild. Quelle: [DIY Photography](https://www.diyphotography.net/gif-explains-changing-focal-length-impacts-portrait)
3. Vollständiges Kameramodell. Quelle: [Robot Academy](https://robotacademy.net.au/lesson/summary-of-image-geometry/)
4. Depth-Pro-Teaser. Quelle: [Apple](https://github.com/apple/ml-depth-pro)
