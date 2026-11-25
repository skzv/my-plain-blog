---
layout: post
lang_code: de
locale: de_DE
ref: arbitrage-as-a-shortest-path-problem
date: 2021-04-25 00:00:00 -0700
last_modified_at: 2021-04-25 00:00
permalink: /de/arbitrage-as-a-shortest-path-problem
title: "Arbitrage als Kürzeste-Wege-Problem"
imgpath: /assets/img/arbitrage-as-a-shortest-path-problem
previewurl: /currency-graph-on-black.png
description: "Wie Währungsarbitrage zu einem Graphenproblem wird: mit Logarithmen und dem Bellman-Ford-Algorithmus profitable Handelszyklen finden."
image: /assets/img/arbitrage-as-a-shortest-path-problem/og-preview.png
image_width: 1200
image_height: 630
image_alt: "Währungswechselkurs-Graph zur Erklärung von Arbitrage"
mathjax: true
tags: [quant-finance, algorithms]
toc: true
---
{% include description.html content="Eine Erklärung von Arbitrage und ein Blick auf einen effizienten Algorithmus zum Finden risikoloser, unmittelbarer Arbitragemöglichkeiten." %}

_Wer verdient nicht gerne Geld?_

Und was wäre, wenn man das Problem, Geld zu verdienen, in ein Kürzeste-Wege-Problem verwandeln könnte? Auf mindestens eine konkrete Art geht das tatsächlich: indem man Arbitragemöglichkeiten ausnutzt.

## Was ist Arbitrage?

_Arbitrage_ ist das Kaufen oder Verkaufen von Gütern über verschiedene Märkte hinweg – oder in verschiedenen Formen –, um von Preisunterschieden zu profitieren. Und die Leute, die das betreiben? Sie nennt man _Arbitrageure_ – ein durchaus schicker Titel.

Beginnen wir mit einem Beispiel. Nehmen wir an, Paul, Peter und Bob leben in einem Dorf, in dem sie Karotten, Kartoffeln und Salat gegeneinander tauschen. Bob tauscht Kartoffeln gegen Karotten, Peter tauscht Salat gegen Kartoffeln und Paul tauscht Salat gegen Karotten.

Genauer gesagt tauscht Bob 2 Kartoffeln gegen 1 Karotte, Peter tauscht 1 Salat gegen 2 Kartoffeln und Paul tauscht 2 Karotten gegen 1 Salat. Wenn wir jede Person als eigenen Markt für die jeweiligen Güter betrachten, wie sähen dann die Wechselkurse aus?

| Markt                           | Wechselkurs                                 |
|:-------------------------------:|:-------------------------------------------:|
| Bob (Kartoffeln gegen Karotten) | 2 Kartoffeln/Karotte                        |
| Peter (Salat gegen Kartoffeln)  | 1 Salat/2 Kartoffeln = 0,5 Salat/Kartoffel  |
| Paul (Karotten gegen Salat)     | 2 Karotten/Salat                            |
{% include caption.html content="Wechselkurse für Güter in unserem Dorf." %}

Witterst du schon eine Gelegenheit?

Geschäftstüchtig wie du bist, versuchst du sie natürlich auszunutzen. Du startest mit 5 Karotten, gehst zu Bob und tauschst deine 5 Karotten zu seinem Kurs gegen 10 Kartoffeln.

{%include math.html content=
"
\begin{align}
5 \text{ carrots} \times 2 \space \frac{\text{potatoes}}{\text{carrots}} = 10 \text{ potatoes} \tag{1} \label{eq:arb_example}
\end{align}
" 
%}

Als Nächstes gehst du mit deinen Kartoffeln zu Peter, denn du weißt, dass er dir dafür 5 Salate gibt. Dann gehst du mit deinen 5 Salaten zu Paul, und er tauscht sie gegen 10 Karotten.

Nach ein paar geschickten Tauschgeschäften hast du dein Karottenvermögen verdoppelt. Durch das Ausnutzen einer Arbitragemöglichkeit hast du aus 5 Karotten 10 gemacht.

Später entwickeln die Dorfbewohner vielleicht ausgefeiltere Märkte, auf denen nicht nur Bob, Peter und Paul handeln. Stattdessen entsteht in diesem kleinen Dorf ein Karotten/Salat-Markt, ein Salat/Kartoffel-Markt und ein Kartoffel/Karotten-Markt, auf denen der jeweilige Kurs je nach Tauschbereitschaft der Leute schwankt.

Das Prinzip der Arbitrage bleibt jedoch dasselbe. Und die Gelegenheit lässt sich so lange ausnutzen, bis den Händlern, die zu diesen Kursen tauschen, die Karotten, der Salat und die Kartoffeln ausgehen. Die Arbitragemöglichkeit wird ausgeschöpft, bis der Markt ein Gleichgewicht erreicht.

<div class="divider"></div>

## Arbitrage in der modernen Welt

Wenn du an moderne Märkte denkst, kommen dir vermutlich nicht gerade Karotten, Kartoffeln und Salat in den Sinn. Wenn du dich für den Devisenhandel interessierst, denkst du eher an Dollar, Pfund und Yen. In diesem Fall hätten wir es mit einem Dollar/Pfund-Markt, einem Pfund/Yen-Markt und einem Yen/Dollar-Markt zu tun, mit vielen Händlern auf jedem Markt. Ab jetzt nutzen wir diese Währungen als Beispiel für handelbare Güter – behalte aber im Hinterkopf, dass die Prinzipien für alle möglichen handelbaren Dinge gelten.

Angenommen, zu einem bestimmten Zeitpunkt gelten folgende Wechselkurse:

| Markt                  | Wechselkurs      |
|:----------------------:|:----------------:|
| Pfund (£) / Dollar ($) | 0,8 Pfund/Dollar |
| Yen (¥) / Pfund (£)    | 100 Yen/Pfund    |
| Dollar ($) / Yen (¥)   | 0,013 Dollar/Yen |
{% include caption.html content="Ein Beispiel für Wechselkurse am Devisenmarkt." %}

Wenn du aus dem Karotten-, Salat- und Kartoffelhandel von Bob, Peter und Paul etwas gelernt hast, erkennst du auch hier sofort die Gelegenheit.

Wenn du 1 $ in Pfund tauschst, erhältst du 0,8 £. Tauschst du diese in Yen, landest du bei 80 ¥. Mit deinen Yen gehst du zum Yen/Dollar-Markt und tauschst sie zurück in Dollar … und plötzlich hast du 1,04 $!

Aber du musst schnell handeln, bevor dir ein anderer Arbitrageur zuvorkommt. Solche Gelegenheiten bestehen nur vorübergehend, bis die Liquidität aufgebraucht ist und sich die Kurse angeglichen haben.

Aufmerksamen Lesern dürfte aufgefallen sein, dass wir in unserem Beispiel keine Handelsgebühren berücksichtigt haben. Natürlich müsstest du diese einbeziehen, um zu berechnen, ob tatsächlich eine profitable Arbitragemöglichkeit existiert.

<div class="divider"></div>

## Schnell handeln

Hoffentlich hast du inzwischen ein Gefühl dafür, warum Geschwindigkeit entscheidend ist. Wechselkurse schwanken rasant, und zu einem bestimmten Kurs steht immer nur eine begrenzte Menge des jeweiligen „Guts“ zur Verfügung.

Während wir hier mit vergleichsweise einfachen Beispielen gearbeitet haben, können sich Arbitragemöglichkeiten über viele Handelsschritte erstrecken und enorm komplex werden. Unsere Beispiele kamen mit 3 Trades aus – aber was, wenn du 10 bräuchtest? Und wie schnell könntest du in einem Netzwerk aus 20 Währungen mit einem Markt für jedes Paar eine Gelegenheit finden?

Ein Computer ist die naheliegende Antwort. Doch wir brauchen einen effizienten Algorithmus, damit uns niemand sonst bei der Gelegenheit zuvorkommt.

Um das zu erreichen, können wir ein paar clevere Einsichten aus der Mathematik und Informatik nutzen.

<div class="divider"></div>

## Märkte als Graph

Graphen sind eine unglaublich wichtige Struktur, die in unzähligen Anwendungen zum Einsatz kommt. Viele soziale und natürliche Strukturen lassen sich als Graphen modellieren – und wie sich zeigt, gehören auch Märkte dazu.

In unserem Fall betrachten wir jede Währung als Knoten. Die Bewegung von einem Knoten zum anderen entspricht dem Tausch einer Währung gegen eine andere.

![Vereinfachter Währungsgraph]({{ "/currency-graph-white.png" | prepend: page.imgpath }}){: width="448" height="283" loading="lazy" decoding="async"}
{% include caption.html content="Vereinfachter Graph – in jede Richtung sollte es eine eigene Kante geben." %}

Das Entlanggehen an einer Kante zwischen zwei Knoten sollte den Währungsbetrag also entsprechend dem Wechselkurs umrechnen.

Vom Dollar-Knoten zum Pfund-Knoten zu wechseln entspricht somit einer Multiplikation mit 0,8 Pfund/Dollar. Ordnen wir also jeder Kante den jeweiligen Wechselkurs als Gewicht zu.

Beachte dabei, dass die Wechselkurse in beide Richtungen _näherungsweise_ der Kehrwert voneinander sind. Wenn der Kurs für die Umrechnung von Dollar in Pfund 0,8 Pfund/Dollar beträgt, liegt der Kurs in der Gegenrichtung bei 1/(0,8 Pfund/Dollar) = 1,25 Dollar/Pfund. Für uns bedeutet das: Wir müssen Kauf und Verkauf auf jedem Markt sorgfältig als separate, gerichtete Kanten mit unterschiedlichen Gewichten behandeln.

Der Grund dafür, dass die Wechselkurse in beiden Richtungen nur _näherungsweise_ reziprok sind, liegt in den kleinen Preisunterschieden zwischen Kauf- und Verkaufskurs, der sogenannten Geld-Brief-Spanne (Buy-Sell-Spread). Wenn du zum Beispiel in einem bestimmten Moment Pfund zu 0,8 Pfund/Dollar kaufen kannst (der aktuelle Preis, zu dem dir jemand verkauft), Dollar aber nur zu 0,82 Pfund/Dollar (bzw. 1,22 Dollar/Pfund, dem aktuellen Preis, zu dem jemand von dir kauft) zurücktauschen kannst, sieht dein Graphmodell so aus (die übrigen Wechselkurse sind der Einfachheit halber weggelassen):

![Währungsgraph mit Wechselkursen]({{ "/currency-graph-w-exchange-rates-white.png" | prepend: page.imgpath }}){: width="451" height="378" loading="lazy" decoding="async"}

Eine Abfolge von Trades lässt sich als Bewegung entlang von Kanten in diesem Graphen modellieren, und das Ergebnis der Trades berechnet sich, indem man die Kantengewichte beim Durchlaufen **_multipliziert_**.

<div class="divider"></div>

## Die Gelegenheit erkennen

Nun, da wir ein funktionierendes Modell haben: Wonach suchen wir in unserem Graphen, das einer Arbitragemöglichkeit entspricht?

Um festzustellen, ob eine Serie von Trades profitabel ist, brauchen wir ein konsistentes Maß für Profitabilität. Mit anderen Worten: Wenn wir unsere Handelskette in Dollar beginnen, müssen wir sie auch wieder in Dollar beenden. Indem wir vergleichen, wie viele Dollar wir am Ende haben und mit wie vielen wir gestartet sind, wissen wir, ob sich das Geschäft gelohnt hat.

In unserem Graphen bedeutet das, dass unsere Handelskette an demselben Knoten enden muss, an dem sie begonnen hat. In unserem Fall starteten wir beim Dollar-Knoten und endeten beim Dollar-Knoten. In der Graphentheorie nennt man so etwas einen Zyklus. Wir wissen also, dass wir nach einer Art Zyklus suchen – aber welche Art von Zyklus ist profitabel?

Man sieht, dass sich beim Multiplizieren entlang der Kanten eines Zyklus die Einheiten des effektiven Wechselkurses umwandeln.

{%include math.html content=
"
\begin{align}
a \space \frac{\cancel{£}}{$} \times b \space \frac{¥}{\cancel{£}} = ab \space \frac{¥}{$}  \tag{2} \label{eq:units_of_exchange_rate}
\end{align}
" 
%}

Sobald wir jedoch zu unserem Startknoten zurückkehren, wird die Größe einheitenlos. Sie verwandelt sich von einem Wechselkurs in ein Renditeverhältnis! Einen Zyklus in unserem Graphen zu durchlaufen und dabei das Produkt der Wechselkurse zu berechnen entspricht genau der Berechnung des Renditeverhältnisses nach Abschluss der Handelskette.

{%include math.html content=
"
\begin{align}
a \space \frac{\cancel{£}}{\cancel{$}} \times b \space \frac{\cancel{¥}}{\cancel{£}} \times c \space \frac{\cancel{$}}{\cancel{¥}} = abc \space \text{[dimensionless]}  \tag{3} \label{eq:unitless_exchange}
\end{align}
" 
%}

Wenn der Markt vollkommen effizient ist, beträgt unser Renditeverhältnis $$abc$$ genau 1, weil sich die Wechselkurse angeglichen haben. Ist das Produkt der Gewichte größer als 1, sagen wir 1,02, dann hätte uns diese Arbitragemöglichkeit eine Rendite von 2 % eingebracht.

Verallgemeinert auf eine beliebige Anzahl von Trades entspricht eine Arbitragemöglichkeit also der folgenden Ungleichung:

{%include math.html content=
"
\begin{align}
\prod_i^n{e_i} = e_ie_2...e_n > 1  \tag{4} \label{eq:arbitrage_return}
\end{align}
" 
%}

wobei $$e_i$$ dem $$i$$-ten Wechselkurs für jeden Trade $$i$$ über $$n$$ Trades hinweg entspricht.

Wir brauchen also einen Algorithmus, der im Marktgraphen einen Zyklus findet, dessen Kantengewichte ein Produkt größer als 1 ergeben. Man könnte dafür sicher einen eigenen Algorithmus erfinden – aber in der Informatik wie im Leben ist es meist hilfreicher, Probleme auf solche zurückzuführen, die man bereits zu lösen weiß.

<div class="divider"></div>

## Der Bellman-Ford-Algorithmus

Das Finden kürzester Wege ist ein bekanntes und fundamentales Problem der Informatik mit unzähligen Anwendungsfällen. Der offensichtlichste ergibt sich aus der Entsprechung zwischen Graph und Landkarte: die kürzeste Route auf einer Karte zu finden. Mit ein wenig Einfallsreichtum lassen sich aber auch viele andere Probleme in ein Kürzeste-Wege-Problem überführen. Ich werde dir zeigen, dass das Aufspüren von Arbitragemöglichkeiten genau ein solches Problem ist.

Legen wir zunächst fest, worin das Kürzeste-Wege-Problem besteht. Gegeben zwei Knoten $$s$$ und $$t$$ in einem Graphen, ist der kürzeste Weg derjenige Pfad, der die _Summe_ der Kantengewichte minimiert. Anders gesagt: Wir bewegen uns entlang des Pfades von $$s$$ nach $$t$$ und addieren unterwegs die Kantengewichte; der Pfad mit der kleinsten Summe ist der kürzeste Weg – also der Weg mit den geringsten Kosten.

Als Nächstes ist es hilfreich zu wissen, dass es verschiedene Klassen von Kürzeste-Wege-Problemen gibt. Im offensichtlichen Beispiel – der kürzesten Route auf einer Karte – müssen die Kantengewichte positiv sein. Ohne Zeitmaschine gibt es keine Straße, deren Befahren deine Reisezeit verkürzt. In einem Graphen mit ausschließlich positiven Kantengewichten berechnet Dijkstras berühmter Algorithmus die kürzesten Wege zu allen Knoten des Graphen.

Es spricht jedoch nichts dagegen, dass ein Graph auch negative Kantengewichte besitzt. In diesem Fall verringert das Durchlaufen einer solchen Kante die Gesamtkosten des Pfades. Wenn es aber einen _Zyklus_ mit negativem Gesamtgewicht gibt, kannst du diesen _Zyklus_ endlos oft durchlaufen – jedes Mal sinken deine Gesamtkosten weiter – und die Kosten deines kürzesten Weges streben gegen $$-\infty$$. In diesem Fall ist es äußerst nützlich, wenn unser Kürzeste-Wege-Algorithmus über einen Mechanismus verfügt, um negative Zyklen zu erkennen. Andernfalls würde die Suche nach dem kürzesten Weg für immer in diesem negativen Zyklus feststecken.

Der Bellman-Ford-Algorithmus ist genau dieser Algorithmus. Als allgemeinere Variante von Dijkstras Kürzeste-Wege-Algorithmus kommt er auch mit negativen Gewichten zurecht. Dazu erkennt er _negative Zyklen_ – also Zyklen in einem Graphen, entlang derer die _Summe_ der Kantengewichte einen negativen Wert ergibt.

Aber wie hilft uns ein Algorithmus, der Zyklen findet, bei denen die **_Summe_** der Kanten kleiner als 0 ist, wenn wir doch einen Algorithmus brauchen, der Zyklen erkennt, bei denen das **_Produkt_** der Kanten größer als 1 ist?

<div class="divider"></div>

## Der Logarithmus zur Rettung

Die nächste Einsicht ist, dass sich ein Produkt mithilfe des Logarithmus in eine Summe verwandeln lässt – dank dieser Identität:

{%include math.html content=
"
\begin{align}
\log{ab} = \log{a} + \log{b}  \tag{5} \label{eq:log_product_identity}
\end{align}
" 
%}

Damit können wir unser Problem, einen Zyklus mit einem _Produkt_ größer als 1 zu finden, in das Problem umwandeln, einen Zyklus mit einer _Summe_ größer als 0 zu finden! Dazu nehmen wir den Logarithmus jedes Wechselkurses und verwenden diesen als Gewicht der jeweiligen Kante.

Zeigen wir das, indem wir den Logarithmus auf beide Seiten unserer Ungleichung anwenden. Zuerst verwandelt der Logarithmus auf der linken Seite das Berechnen eines Produkts in das Berechnen einer Summe:

{%include math.html content=
"
\begin{align}
\log{\prod_i^n{e_i}} = \log{e_ie_2...e_n} = \log{e_1} + ... + \log{e_n} = \sum_i^n{\log{e_i}} \tag{6} 
\end{align}
" 
%}

Der Logarithmus auf der rechten Seite macht aus der 1 einfach eine 0:

{%include math.html content=
"
\begin{align}
\sum_i^n{\log{e_i}} > \log{1} \rightarrow \sum_i^n{\log{e_i}} > 0 \tag{7}
\end{align}
" 
%}

Wir sind fast am Ziel, aber noch nicht ganz. Der letzte Schritt, um unser Problem auf eines zurückzuführen, das wir mit diesem bekannten Algorithmus lösen können, besteht darin, jedes Kantengewicht mit -1 zu multiplizieren. Dadurch wird aus der Suche nach einem positiven Zyklus die Suche nach einem negativen Zyklus:

{%include math.html content=
"
\begin{align}
\sum_i^n{-\log{e_i}} < 0 \tag{8}
\end{align}
" 
%}

Und genau das kann der Bellman-Ford-Algorithmus! Wenn wir den Graphen wie beschrieben aufbauen und Bellman-Ford darauf ausführen, finden wir Arbitragemöglichkeiten schnell und effizient – denn wir haben das Arbitrageproblem in das Problem des kürzesten Weges verwandelt: _des unendlich kurzen Weges_.

![Währungsgraph mit negativem Logarithmus der Wechselkurse]({{ "/neg-log-currency-graph-white.png" | prepend: page.imgpath }}){: width="448" height="283" loading="lazy" decoding="async"}
{% include caption.html content="Wir suchen einen Zyklus mit negativem Gewicht, wobei die Gewichte dem negativen Logarithmus der Wechselkurse entsprechen." %}

Im Nachhinein wirkt es fast offensichtlich, dass es eine Entsprechung geben sollte zwischen einem negativen Zyklus – der die Kosten des Pfades bei jedem Durchlauf senkt – und einer Arbitragemöglichkeit, die bei jedem Durchlauf Gewinn abwirft. Der entscheidende Trick ist, das Problem „Produkt größer als 1“ durch Anwenden von -log auf die Kantengewichte in „Summe kleiner als 0“ zu überführen.

<div class="divider"></div>

## Der Beweis

Lassen wir diesen Algorithmus auf unsere Wechselkurse los, um zu sehen, ob er die Arbitragemöglichkeit korrekt erkennt. Transformieren wir die Wechselkurse mit -log, erhalten wir:

| Markt                  | -log(Wechselkurs) |
|:----------------------:|:-----------------:|
| Pfund (£) / Dollar ($) | 0,223             |
| Yen (¥) / Pfund (£)    | -4,605            |
| Dollar ($) / Yen (¥)   | 4,343             |

Summieren wir über die Trades, ist unsere Ungleichung erfüllt – _wir haben einen negativen Zyklus gefunden_!

{%include math.html content=
"
\begin{align}
\sum_i^n{-\log{e_i}} = 0.223 - 4.605 + 4.343 = -0.039 \label{eq:neg_log_exchange_rate_example} \tag{9}
\end{align}
" 
%}

Wir können den Logarithmus wieder rückgängig machen, um das Produkt wiederherzustellen und die Rendite zu berechnen:

{%include math.html content=
"
\begin{align}
\prod_i^n{e_i} &= \exp{\sum_i^n{-\log{e_i}}} \\
\prod_i^n{e_i} &= \exp(0.039) = 1.04 \tag{10}
\end{align}
" 
%}

Das sind genau die 4 % Rendite, die wir weiter oben berechnet haben.

<div class="divider"></div>

## In der realen Welt

Da eine Arbitragemöglichkeit einem negativen Zyklus entspricht, könnte man meinen, wir könnten den Zyklus endlos durchlaufen und unendlich viel Geld verdienen. So läuft es natürlich nicht.

Die Liquidität – also das verfügbare Handelsvolumen, bevor sich der Preis merklich verändert – ist bei jeder Arbitragemöglichkeit begrenzt und wird blitzschnell von algorithmischen Händlern abgeschöpft, die die Grenzen von Rechentechnik und Physik ausreizen, um sich gegenseitig zu überholen.

Trotzdem hoffe ich, dass dir diese kleine Übung, Graphentheorie und einen bekannten Kürzeste-Wege-Algorithmus auf ein Problem aus der Finanzwelt – und das Geldverdienen – anzuwenden, genauso viel Spaß gemacht hat wie mir.
