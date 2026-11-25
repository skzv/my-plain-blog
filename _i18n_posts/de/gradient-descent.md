---
layout: post
lang_code: de
locale: de_DE
ref: gradient-descent
date: 2021-11-15 00:00:00 -0700
last_modified_at: 2021-11-15 00:00
permalink: /de/gradient-descent
title: "Interaktive Demo zum Gradientenabstieg"
imgpath: /assets/img/gradient-descent
previewurl: /gradient-descent-preview.png
description: "Eine interaktive Demo zum Gradientenabstieg, die Gradienten, Lernraten und lokale Minima erklärt. Passe die Parameter an und beobachte, wie der Algorithmus ein Minimum findet."
image: /assets/img/gradient-descent/gradient-descent-preview.png
image_width: 1564
image_height: 808
image_alt: "Interaktive Visualisierung des Gradientenabstiegs"
mathjax: true
tags: [machine-learning, optimization]
---

_Was ist dieser besondere Algorithmus?_

Der Gradientenabstieg (englisch *Gradient Descent*) ist ein Optimierungsalgorithmus zum Finden des (lokalen) Minimums einer Funktion.

## Wozu ist das nützlich?

Nehmen wir an, du hast eine Funktion $$f(x,y)$$. Diese Funktion könnte für Kosten stehen, und $$x$$ sowie $$y$$ sind Eingaben, die diese Kosten beeinflussen. Natürlich möchtest du die Werte von $$x$$ und $$y$$ finden, die die Kosten minimieren. Das ist genau das Problem, das Minimum von $$f(x,y)$$ zu bestimmen. Zum Beispiel möchten wir vielleicht das Minimum der folgenden Funktion finden, die unten dargestellt ist:

{%include math.html content=
"
\begin{align}
f(x,y)=3(1 - x)^2 e^{- x^2 - (y + 1)^2} - 10(\frac{x}{5} - x^3 - y^5) e^{-x^2 - y^2} - \frac{1}{3} e^{-(x+1)^2 - y^2} \tag{0}  \label{eq:cost_func}
\end{align}
" 
%}

<div id='plot-0'></div>

Genau hier kann der Gradientenabstieg helfen.

## Warum Gradientenabstieg?

Aus der grundlegenden Analysis erinnerst du dich vielleicht an ein Verfahren, um das Minimum einer Funktion zu finden: Man bildet die erste Ableitung, setzt sie gleich null und löst die Gleichung:

{%include math.html content=
"
\begin{align}
f'(x,y)=0 \tag{1}  \label{eq:first_deriv}
\end{align}
" 
%}

Das liefert die Stellen der Extrema (Maxima und Minima) der Funktion. Das Vorzeichen der zweiten Ableitung $$f''(x,y)$$ verrät dann, ob es sich um lokale Maxima oder Minima handelt. Allerdings kann das Lösen der Gleichung für die erste Ableitung $$\eqref{eq:first_deriv}$$ alles andere als trivial sein und erfordert oft numerische Verfahren. Und sobald deine Kostenfunktion immer mehr Dimensionen hat – etwa $$f(x,y,z,w,q,u,v,...)$$ –, wird das Problem schnell unhandhabbar. Der Gradientenabstieg liefert ein effizientes Verfahren, um Minima zu finden, indem er die erste Ableitung auf clevere Weise nutzt.

## Der Gradientenabstiegs-Algorithmus

Die Idee hinter dem Gradientenabstieg ist sehr intuitiv, und ich wette, du würdest in einer analogen realen Situation ganz von selbst auf dasselbe Verfahren kommen. Stell dir vor, du stehst in dichtem Nebel, kannst nur ein paar Meter weit sehen und spürst lediglich die Neigung des Bodens unter deinen Füßen. Du möchtest so schnell wie möglich ins Tal hinabsteigen. Sicherlich wirst du keine Zeit damit verschwenden, auf einer flachen Strecke entlangzulaufen – oder schlimmer noch, bergauf zu gehen. Um schnell abzusteigen, prüfst du an deiner aktuellen Position die Neigung und gehst in die Richtung, in der es am steilsten bergab geht. Gradient ist ein anderes Wort für Steigung – du führst also buchstäblich einen Gradientenabstieg durch. Umgekehrt würdest du, wenn du den Gipfel eines Hügels suchst, immer der steilsten Richtung bergauf folgen. Das nennt man Gradienten*aufstieg*.

## Der Gradient
Gradient ist im Grunde einfach ein anderes Wort für Steigung. Die meisten kennen das Berechnen einer Steigung im eindimensionalen Fall. In 1D kann man sich nur vorwärts oder rückwärts bewegen, daher ist die Steigung eindeutig definiert. In höheren Dimensionen – stell dir vor, du bist auf einer Wanderung – kann die Steigung jedoch je nach Gehrichtung ganz unterschiedlich ausfallen. Wie definiert man also die Steigung an einem solchen Punkt?

In der Vektoranalysis verwendet man den Gradientenoperator $$\nabla$$, der einen Vektor aus den Steigungen (also den ersten partiellen Ableitungen) entlang jeder Dimension bildet.

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

Auf einer durch $$f(x,y)$$ definierten 2D-Oberfläche sind das die Steigung entlang der x-Achse und die Steigung entlang der y-Achse. Die Steigung in jede beliebige Richtung (was wichtig ist, da wir ja nicht darauf beschränkt sind, uns nur entlang der x- oder y-Achse zu bewegen) ergibt sich, indem man die entsprechenden x- und y-Anteile der Steigung in dieser Richtung kombiniert. Anders ausgedrückt: Das Skalarprodukt eines Richtungsvektors mit dem Gradienten liefert die Steigung in genau dieser Richtung.

Eine weitere interessante Eigenschaft des Gradienten ist, dass er in die Richtung des steilsten Anstiegs zeigt. Mathematisch sieht man das leicht ein: Da die Steigung in einer Richtung dem Skalarprodukt dieses Richtungsvektors mit dem Gradienten entspricht, wird das Skalarprodukt genau dann maximal, wenn der Gradient mit sich selbst multipliziert wird!

Unten habe ich den negativen Gradienten von $$f(x,y)$$ mit Mathematica geplottet. Das zeigt uns an jedem Punkt von $$f$$ die Richtung des steilsten Abstiegs.

![Gradient von f]({{ "/gradient.png" | prepend: page.imgpath }}){: width="360" height="361" loading="lazy" decoding="async"}
{% include caption.html content="Der Gradient von f als Vektorfeld dargestellt." %}

## Dem steilsten Abstieg folgen
Weiter oben haben wir uns darauf geeinigt: Wenn du dich blind den Weg hinunter ins Tal suchen müsstest, würdest du immer der steilsten Richtung bergab folgen, um so schnell wie möglich unten anzukommen. Mathematisch bewegst du dich entlang des negativen Gradienten an jedem Punkt das Tal hinunter, weil dieser Vektor stets die Richtung des steilsten Abstiegs angibt. Schauen wir auf das Bild oben, sehen wir, dass uns das Folgen der Pfeile zu einem Minimum führt (doch Vorsicht – jedes Minimum hat sein eigenes Einzugsgebiet! Dazu gleich mehr).

Damit können wir ein konkretes Verfahren formulieren. Es könnte etwa so aussehen:

1. Prüfe die Steigung an deiner aktuellen Position und bestimme die Richtung des steilsten Abstiegs.

2. Geh 5 Schritte in diese Richtung.

3. Wenn du noch weiter absteigst, gehe zurück zu 1. Andernfalls bist du unten angekommen!

Vielleicht fragst du dich, wie ich auf 5 Schritte gekommen bin. Nun, das war völlig willkürlich. Aber wir können daraus einen Parameter unseres Verfahrens machen. Nennen wir ihn die Abstiegsrate und geben ihm das Symbol $$\alpha$$. Je größer die Abstiegsrate ist, desto seltener müssen wir die Steigung um uns herum überprüfen. Rechnerisch ist das effizienter – aber wie du gleich sehen wirst, birgt es auch Tücken.

Außerdem können wir noch eine weitere Verbesserung vornehmen. Solange der Boden steil abfällt, sind wir wahrscheinlich noch weit vom Talboden entfernt. Wird der Hang jedoch flacher, können wir annehmen, dass wir uns dem Tiefpunkt nähern. Daher ist es sinnvoll, proportional zur Größe des Gradienten abzusteigen. Bezeichnen wir den Gradienten mit $$\bar{g}$$ und formulieren unseren Gradientenabstieg neu:

1. Prüfe die Steigung an deiner aktuellen Position und bestimme die Richtung des steilsten Abstiegs.

2. Geh $$\alpha \times \|\bar{g}\|$$ Schritte in diese Richtung.

3. Wenn du noch weiter absteigst, gehe zurück zu 1. Andernfalls bist du unten angekommen!

Und wie stellen wir fest, ob wir noch absteigen? Ein Ansatz besteht darin, in jeder Iteration zu prüfen, wie viel Höhe wir verloren haben. Ändert sich unsere Höhe kaum noch, sind wir im Wesentlichen bereits unten angekommen.

Mathematisch sieht unser Verfahren so aus:

{%include math.html content=
"
\begin{align}
\bar{p}_{n+1} = \bar{p}_n - \alpha \nabla f(x,y) \tag{3}  \label{eq:grad_descent}
\end{align}
" 
%}

wobei $$p_n$$ unsere Position in der $$n$$-ten Iteration des Abstiegs ist. Probier es direkt in der Demo unten aus. Über $$\alpha$$ änderst du die Schrittweite des Abstiegs, während du mit $$X$$ und $$Y$$ den Startpunkt auf der Oberfläche verschiebst. Was fällt dir auf?

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

## Beobachtungen

Dir fällt sicher auf, dass der Gradientenabstieg empfindlich auf die Startposition reagiert. Er zieht dich zu einem lokalen Minimum, das nicht unbedingt das globale Minimum sein muss. Der Bereich des Definitionsgebiets, von dem aus der Gradientenabstieg zu einem bestimmten Minimum konvergiert, heißt Einzugsgebiet (englisch *Basin of Attraction*) dieses Minimums.

Außerdem siehst du, dass eine größere Abstiegsrate $$\alpha$$ die Zahl der benötigten Iterationen bis zum Minimum verringert. Wählst du sie jedoch zu groß, schießt der Algorithmus über das Ziel hinaus und divergiert unter Umständen sogar.

## Machine Learning

Du hast vom Gradientenabstieg wahrscheinlich schon im Zusammenhang mit Machine Learning gehört. Dort steht die Kostenfunktion für den Fehler unseres Machine-Learning-Modells. Das kann zum Beispiel der Fehler bei der Bildklassifizierung sein, und die Eingaben der Kostenfunktion sind die Gewichte des Modells, die wir anpassen. Mit dem Gradientenabstieg finden wir also die optimale Konfiguration der Gewichte, die den Klassifizierungsfehler des neuronalen Netzes minimiert! In diesem Bereich trägt die Abstiegsrate $$\alpha$$ einen eigenen Namen: Man nennt sie *Lernrate* (*Learning Rate*). Vielleicht machen unsere Gehirne schon die ganze Zeit genau dasselbe.

<script defer fetchpriority="low" src="https://cdn.plot.ly/plotly-2.4.2.min.js"></script>
<script defer fetchpriority="low" src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/9.5.1/math.js" integrity="sha512-AfRcJIj922x/jSJpQLnry0DYIBg6EGCtwk/MiQ6QvDlzb7kNFxH8EdqXLkaXXY3YHQS9FrSb8H7LzuLn0CZQ1A==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script defer src="/assets/js/gradient-descent.js"></script>
