---
layout: post
lang_code: de
locale: de_DE
ref: monte-carlo-options-pricing
date: 2021-12-17 00:00:00 -0700
last_modified_at: 2021-12-17 00:00
permalink: /de/monte-carlo-options-pricing
title: "Monte-Carlo-Optionsbewertung"
imgpath: /assets/img/monte-carlo-stocks
previewurl: /gbm-example.png
description: "Entdecke die Monte-Carlo-Optionsbewertung mit interaktiven Simulationen der geometrischen Brownschen Bewegung, Aktienrenditen, Volatilität und Optionsauszahlungen."
image: /assets/img/monte-carlo-stocks/gbm-example.png
image_width: 1810
image_height: 990
image_alt: "Simulierte Aktienkurspfade mittels geometrischer Brownscher Bewegung"
mathjax: true
tags: [quant-finance, simulation]
toc: true
---

_Das Options-Casino_

Die Bewegung von Aktienkursen vorherzusagen ist eine verlockende Herausforderung, die großen Reichtum verspricht. Leider gilt es allgemein als unmöglich, künftige Aktienkurse dauerhaft und zuverlässig vorherzusagen. Dennoch können wir Modelle einsetzen, um nützliche Prognosen zu treffen, Risiken zu steuern und *probabilistisch* Gewinne zu erzielen.

## Geometrische Brownsche Bewegung
Ein häufig verwendetes Modell dieser Art ist die geometrische Brownsche Bewegung ([1](https://stats.libretexts.org/Bookshelves/Probability_Theory/Probability_Mathematical_Statistics_and_Stochastic_Processes_(Siegrist)/18%3A_Brownian_Motion/18.04%3A_Geometric_Brownian_Motion), [2](http://www.columbia.edu/~ks20/FE-Notes/4700-07-Notes-GBM.pdf)) – tatsächlich liegt genau dieses Modell auch der berühmten [Black-Scholes-Formel zur Optionsbewertung](https://en.wikipedia.org/wiki/Black%E2%80%93Scholes_model) zugrunde. Es hat die Form

{%include math.html content=
"
\begin{align}
 S(t) = S(0)\exp{((\mu-\frac{\sigma^2}{2})t + \sigma B(t))} \tag{0}  \label{eq:gbm}
\end{align}
" 
%}

wobei $$B(t)$$ eine Standard-Brownsche Bewegung ist. Setzen wir $$S(0)$$ als anfänglichen Aktienkurs, $$\mu$$ als mittlere [stetige Rendite](https://en.wikipedia.org/wiki/Rate_of_return#Logarithmic_or_continuously_compounded_return) und $$\sigma$$ als [Volatilität](https://en.wikipedia.org/wiki/Volatility_(finance)) einer Aktie, lassen sich damit sehr realistische Kurspfade erzeugen.

<div id='plot-0'></div>
<span class="slider-container">
    <span class="slider-label" class="slider-label">$$\mu$$</span>
    <span>
        <input class="slider" id="mean-slider" type="range" min="-2.5" max="1" value="0" step="0.01">
    </span>
    <span class="slider-value" id="mean-slider-value">0</span>
</span>

<span class="slider-container">
    <span class="slider-label" class="slider-label">$$\sigma$$</span>
    <span>
        <input class="slider" id="sigma-slider" type="range" min="0" max="1" value="0" step="0.01">
    </span>
    <span class="slider-value" id="sigma-slider-value">0</span>
</span>

<button class="regenerate-button" onclick="regenerate0()">Neu generieren</button>

<div style="display:none" id='mean-0'>0</div>
<div style="display:none" id='sigma-0'>0</div>
<div style="display:none" id='option-mean-0'>0</div>

Was bedeutet das genau, und warum eignet sich dieses Modell so gut für Wertpapierkurse?

### Logarithmische Renditen
In der quantitativen Finanzmathematik arbeitet man üblicherweise mit stetigen (logarithmischen) statt mit einfachen Renditen. Das bedeutet: Statt die einfache Rendite zwischen zwei Handelsperioden $$1 + R_t = \frac{S(t)}{S(t-1)}$$ zu betrachten, verwenden wir die stetige Rendite $$r_t = \ln{(1 + R_t)} = \ln{\frac{S(t)}{S(t-1))}}$$. Das hat die äußerst angenehme Eigenschaft, dass man den Kurs einer Aktie einfach durch Aufsummieren der logarithmischen Renditen zurückgewinnen kann:

{%include math.html content=
"
\begin{align}
 S(t) = S(0)\exp{(r_1 + r_2 + ... + r_{t-1})} \tag{1}  \label{eq:rr}
\end{align}
" 
%}

Das ist auch deshalb praktisch, weil in der Finanzwelt häufig angenommen wird, dass die logarithmischen Renditen einer Aktie unabhängig und normalverteilt mit Mittelwert $$\mu$$ und Varianz $$\sigma^2$$ sind. Für kleine Renditen liegen einfache Renditen $$R_t$$ ohnehin sehr nahe an logarithmischen Renditen $$r_t$$, da $$r_t = \ln{(1 + R_t)} \approx R_t$$ gilt; der Unterschied zwischen beiden ist also gering, weshalb oft sowohl einfache als auch logarithmische Renditen als normalverteilt angenommen werden. Sind die logarithmischen Renditen normalverteilt, folgt daraus wiederum, dass der Aktienkurs *lognormalverteilt* ist. Empirisch lässt sich das bis zu einem gewissen Grad tatsächlich beobachten, auch wenn reale Aktienkurse zu „dickeren Rändern“ (*Fat Tails*) neigen – seltene Extremereignisse treten also häufiger auf, als eine Normalverteilung vorhersagen würde. Die monatlichen Renditen der IBM-Aktie unten zeigen genau dieses Verhalten.

![Monatliche Renditen von IBM]({{ "/IBM-returns.webp" | prepend: page.imgpath }}){: width="1282" height="1008" loading="lazy" decoding="async"}
{% include caption.html content="Monatliche einfache und logarithmische Renditen der IBM-Aktie mit angepassten Normalverteilungen. An den Rändern der Verteilungen beobachten wir mehr Renditen, als die Normalverteilung erwarten ließe. Man nennt dies ‚Fat Tails‘ oder ‚Exzess-Kurtosis‘. Quelle: ‚Analysis of Financial Time Series, 3rd Ed.‘ von Ruey S. Tsay." %}

Das Modell passt auch deshalb gut, weil es ausschließlich positive Wertpapierkurse zulässt. Wertpapiere haben im Regelfall nur positive Preise (auch wenn es in Ausnahmefällen negative Preise geben kann – siehe den [Ölpreis-Crash von 2020](https://assets.weforum.org/editor/kE8TpkO7bzo3dLFWEh9UDvgqRuZPOmURhnh0FfwOVYc.png)).

Wir brauchen also einen Prozess, der eine Folge normalverteilter Renditen $$r_t$$ erzeugt – womit die Brownsche Bewegung eine naheliegende Wahl ist.


## Brownsche Bewegung
Die [Brownsche Bewegung](https://stats.libretexts.org/Bookshelves/Probability_Theory/Probability_Mathematical_Statistics_and_Stochastic_Processes_(Siegrist)/18%3A_Brownian_Motion/18.01%3A_Standard_Brownian_Motion) beschreibt die Bewegung eines Teilchens in einer Flüssigkeit oder einem Gas. Ein solches Teilchen prallt „zufällig“ in dem umgebenden Medium hin und her. Die dabei entstehende Bahn wirkt stark verrauscht und zufällig. Im Wesentlichen lässt sie sich als Grenzfall eines Random Walk auffassen, bei dem sowohl die Zeit zwischen den Schritten als auch die Schrittlänge gegen null gehen (mit einer wichtigen Bedingung: Bei einem Zeitschritt $$t$$ muss die Schrittlänge $$\sqrt{t}$$ betragen – dadurch entsteht ein Prozess, dessen Varianz exakt linear mit der Zeit wächst). Stell dir vor, du wirfst eine Münze, um zu entscheiden, ob du einen Schritt vorwärts oder rückwärts gehst, und lässt nun die Zeit zwischen den Würfen gegen null schrumpfen. Die resultierende Bahn sieht in etwa so aus:

![1D-Brownsche Bewegung]({{ "/wiener-process-zoom.png" | prepend: page.imgpath }}){: width="800" height="600" loading="lazy" decoding="async"}
{% include caption.html content="Eindimensionale [arithmetische] Brownsche Bewegung. Die geometrische Brownsche Bewegung ist die Exponentialfunktion dieses Prozesses. <a target='_blank' href='http://creativecommons.org/licenses/by-sa/3.0/' title='Creative Commons Attribution-Share Alike 3.0'>CC BY-SA 3.0</a>, <a target='_blank' href='https://commons.wikimedia.org/w/index.php?curid=1426987'>Quelle</a>" %}

Die Brownsche Bewegung hat die sehr praktische Eigenschaft, dass ihre Trajektorien normalverteilt sind – genau das, wonach wir suchen. Wir können einen Brownschen Prozess in diskreten Schritten simulieren, indem wir Stichproben aus einer Normalverteilung ziehen (wobei du, wenn dich nur der Endwert einer Zeitreihe interessiert, auch aus jeder anderen Verteilung mit Varianz eins ziehen könntest; dank des zentralen Grenzwertsatzes nähert sich die Summe der Zufallsvariablen langfristig ohnehin einer Gaußverteilung an).

Somit liefert uns die Brownsche Bewegung genau die Folge normalverteilter logarithmischer Renditen $$r_t$$, wie sie in $$\eqref{eq:rr}$$ benötigt wird:

{%include math.html content=
"
\begin{align}
 r(t) = (\mu-\frac{\sigma^2}{2})t + \sigma B(t) \tag{2}  \label{eq:bm}
\end{align}
" 
%}

Wenden wir auf diesen Prozess die Exponentialfunktion an, erhalten wir wieder unsere Gleichung zur Modellierung von Aktienkursbewegungen.

Besonders interessant ist hier die Driftrate $$\mu - \frac{\sigma^2}{2}$$, die den Prozess – wie der Name sagt – linear driften lässt. $$\mu$$ leuchtet unmittelbar ein: Es ist die mittlere stetige Rendite der Aktie, und ohne Rauschen (also ohne Volatilität) würde der Aktienkurs einfach mit dieser stetigen Rate wachsen (oder fallen). Doch was hat es mit $$\frac{\sigma^2}{2}$$ auf sich? Es zeigt sich, dass der Erwartungswert einer lognormalverteilten Zufallsvariablen gleich $$\exp(\mu + \sigma^2/2)$$ ist. Da der Aktienkurs *lognormalverteilt* ist (während die Renditen *normalverteilt* sind) und wir verlangen, dass der erwartete Aktienkurs bei stetiger Verzinsung genau $$S(0)\exp(\mu t)$$ beträgt, müssen wir den Korrekturterm $$- \frac{\sigma^2}{2}$$ in den Prozess einbauen.

Es gibt auch ein philosophisches Argument dafür, die Brownsche Bewegung als Grundlage dieses Modells zu wählen. Eine gängige Annahme in der Finanztheorie ist, dass Märkte effizient sind und es daher keine Arbitragemöglichkeiten geben sollte. Folglich muss der Markt unvorhersehbar sein – könnte ein Akteur ihn vorhersagen, entstünde eine Arbitragemöglichkeit, die sofort wegarbitriert würde. Zufälliges Rauschen (und im Kern ist die Brownsche Bewegung genau das) ist daher eine naheliegende Grundlage für die Modellierung von Märkten.

## Optionsbewertung

Die Monte-Carlo-Simulation ist eine statistische Methode, inspiriert von den Casinos in Monaco. Ähnlich wie Glücksspieler ihr Schicksal der Wahrscheinlichkeit überlassen, übergeben wir das Ergebnis einer statistischen Analyse dem Zufall. Wenn wir genügend Durchläufe simulieren, können wir statistisch belastbare Aussagen treffen.

Betrachten wir die Bewertung einer Call-Option mit einem Ausübungspreis (Strike) von 105 $ auf diese Aktie. Wie hoch wäre der erwartete Wert der Option am Verfallstag unter der Annahme einer geometrischen Brownschen Bewegung für den Aktienkurs? Wir können das abschätzen, indem wir eine Reihe von Kurspfaden erzeugen, von denen jeder als ein einzelner Versuch zählt. Der Endwert jedes Pfades bestimmt den inneren Wert der Option über die Beziehung $$V = \max(0, S - K)$$, wobei $$S$$ der Aktienkurs und $$K$$ der Ausübungspreis ist. Der Mittelwert dieser Endwerte liefert uns eine Schätzung für den Wert der Option bei Fälligkeit, während die Standardabweichung der Endwerte angibt, wie sicher wir sein können, dass die Option nahe bei diesem Wert ausläuft.

<div id='plot-1'></div>
<button class="regenerate-button" onclick="regenerate1()">Neu generieren</button>
<div id='mean-1'>0</div>
<div id='sigma-1'>0</div>
<div id='option-mean-1'>0</div>

Indem wir die Anzahl der Durchläufe erhöhen, steigern wir die statistische Sicherheit unserer Schätzung. Führt man die Simulation (durch Klick auf „Neu generieren“) mit einer großen Zahl von Durchläufen (unten) erneut aus, fallen die Abweichungen zwischen einzelnen Läufen deutlich geringer aus als bei wenigen Durchläufen (oben).

<div id='plot-2'></div>
<button class="regenerate-button" onclick="regenerate2()">Neu generieren</button>
<div id='mean-2'>0</div>
<div id='sigma-2'>0</div>
<div id='option-mean-2'>0</div>

## Komplexere Szenarien
Die Monte-Carlo-Simulation reiner Endwerte ist eine recht einfache Simulation – und in der Praxis nur bedingt nötig, da sich dieser Fall meist auch analytisch lösen lässt. Die wahre Stärke der Monte-Carlo-Simulation zeigt sich erst bei Szenarien, die analytisch schwer oder gar unmöglich zu lösen sind. Wenn wir zum Beispiel eine Option amerikanischen Typs bewerten möchten, die jederzeit während der Laufzeit ausgeübt werden kann, interessiert uns möglicherweise die Wahrscheinlichkeit, dass der Aktienkurs den Ausübungspreis irgendwann vor Fälligkeit überschreitet. Dazu müssen wir schlicht zählen, wie viele simulierte Pfade die Strike-Schwelle kreuzen – mit einer Monte-Carlo-Simulation ein Kinderspiel.

<script defer fetchpriority="low" src="https://cdn.plot.ly/plotly-2.4.2.min.js"></script>
<script defer fetchpriority="low" src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/9.5.1/math.js" integrity="sha512-AfRcJIj922x/jSJpQLnry0DYIBg6EGCtwk/MiQ6QvDlzb7kNFxH8EdqXLkaXXY3YHQS9FrSb8H7LzuLn0CZQ1A==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script defer src="/assets/js/monte-carlo-options.js"></script>
