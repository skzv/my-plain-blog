---
layout: post
lang_code: de
locale: de_DE
ref: blackbox-optimization-with-vizier
date: 2023-02-23 00:00:00 -0700
last_modified_at: 2023-02-23 00:00
permalink: /de/blackbox-optimization-with-vizier
title: "Blackbox-Optimierung und Hyperparameter-Tuning mit Googles Vizier"
imgpath: /assets/img/blackbox-optimization-with-vizier
previewurl: /black-box-optimization.png
description: "Ein Praxisbeispiel für Blackbox-Optimierung mit Google Vizier: bedingte Parameter definieren, Durchläufe bewerten und ein Modell an ein verrauschtes Signal anpassen."
image: /assets/img/blackbox-optimization-with-vizier/og-preview.png
image_width: 1200
image_height: 630
image_alt: "Ein- und Ausgaben bei der Blackbox-Optimierung"
mathjax: true
tags: [machine-learning, optimization]
toc: true
---
{% include description.html content="Beliebige Systeme automatisch und intelligent optimieren" %}

<style>
img {
  max-height: 350px;
}
</style>

Wenn du ein Machine-Learning-Modell – oder ein beliebiges anderes algorithmisches System – baust, musst du Entscheidungen über die Architektur deines Systems treffen. Bei einer Machine-Learning-Anwendung musst du zum Beispiel festlegen, wie viele Neuronen eine Schicht im neuronalen Netz haben soll oder wie groß die Lernrate beim Gradientenabstieg sein soll. Wenn du einen [Partikelfilter](https://en.wikipedia.org/wiki/Particle_filter) baust, um den Zustand eines Roboters zu verfolgen, musst du vielleicht die Form einer Likelihood-Funktion wählen. Oder du suchst eine Puffergröße und Thread-Anzahl, die deinen Ressourcenverbrauch minimieren. Wie findest du die optimale Architektur für dein System?

Du könntest versuchen, sie von Hand zu finden. Du probierst verschiedene Neuronenzahlen aus. Du probierst verschiedene Lernraten aus. Doch dieser Prozess ist langsam, mühsam und fehleranfällig. Zum Glück gibt es Dienste, die dein System für dich auf intelligente und effiziente Weise optimieren können.

<div class="divider"></div>

## Vorhang auf für Vizier

[Vizier](https://github.com/google/vizier) ist ein bei Google entwickelter Optimierungsdienst für Blackbox- und Hyperparameter-Optimierung. Er lässt sich zum Optimieren nahezu jedes beliebigen Systems einsetzen, solange du Eingaben – vorgeschlagen von Vizier – an das System übergeben und Ausgaben – also Metriken, die Vizier maximieren oder minimieren soll – zurückbekommen kannst. Das System selbst wird dabei als Blackbox behandelt.

![Blackbox-Optimierung]({{ "/black-box-optimization.png" | prepend: page.imgpath }}){: width="629" height="319" loading="lazy" decoding="async"}
{% include caption.html content="Blackbox-Optimierung erfordert keinerlei Verständnis des Systems selbst, solange man Eingaben übergeben und Ausgaben ablesen kann. Quelle: Per Instance Algorithm Configuration for Continuous Black Box Optimization – Scientific Figure auf ResearchGate. Verfügbar unter: https://www.researchgate.net/figure/black-box-Optimization_fig1_322035981 [abgerufen am 23. Feb. 2023]" %}

Anders als Nicht-Blackbox-Verfahren wie der [Gradientenabstieg](/de/gradient-descent), die ein Verständnis des Zusammenhangs zwischen den Systemparametern und der zu minimierenden oder maximierenden Metrik voraussetzen, benötigt ein Blackbox-System wie Vizier keinerlei Einblick in das Innenleben des Systems. Dennoch kann es den Parameterraum effizient durchsuchen und die Werte finden, die dein System optimieren. Das macht es zugleich deutlich robuster gegenüber komplexen, unstetigen und nicht-konvexen Zielfunktionen.

<div class="divider"></div>

## Parameter vs. Hyperparameter

Am Rande: Diese Unterscheidung stammt aus dem Machine Learning, wo unter „Parametern“ die Werte innerhalb des Modells verstanden werden, die für die Inferenz genutzt und durch das Training auf einem Datensatz gelernt werden, während Hyperparameter die Architektur des Modells oder den Trainingsablauf beschreiben. Ein Blackbox-Optimierungsdienst wie Vizier lässt sich zwar für jede Art von System nutzen, wäre aber kein effizienter Weg, ein Machine-Learning-Modell direkt zu trainieren. Zum Optimieren der Modellarchitektur hingegen eignet er sich hervorragend.

<div class="divider"></div>

## Ein Beispiel

Ich nehme hier ein Beispiel, das nichts mit Machine Learning zu tun hat, aber dennoch sehr schön zeigt, wie mächtig und einfach ein Blackbox-Optimierer wie Vizier ist. Angenommen, wir haben ein verrauschtes Signal wie das folgende:

![Ein verrauschtes Signal]({{ "/some-noisy-signal.png" | prepend: page.imgpath }}){: width="368" height="246" loading="lazy" decoding="async"}
{% include caption.html content="Ein verrauschtes Signal." %}

Versuchen wir, eine analytische Funktion zu finden, die zu diesem Signal passt. Wir sind uns nicht sicher, ob wir eine [Gauß-Funktion](https://en.wikipedia.org/wiki/Normal_distribution) oder eine [Laplace-Funktion](https://en.wikipedia.org/wiki/Laplace_distribution) an das Signal anpassen sollen, und beide Funktionen bringen ihre eigenen Parameter mit – wie Mittelwert und Streuung –, die wir ebenfalls schätzen wollen.

Solange wir Vizier eine Metrik vorgeben können, die optimiert werden soll, findet es die optimale Funktion für uns.

<div class="divider"></div>

## Das Problem definieren
Der erste Parameter, den wir durchsuchen möchten, ist der Modelltyp – Gauß oder Laplace:

```
{
    'parameter_id': 'model',
    'categorical_value_spec' : {
        'values': [
            'gaussian',
            'laplace',
        ]
}
```

Jedes Modell hat jedoch seinen eigenen Satz an Parametern, die seine Form bestimmen. Nennen wir diese die „Kindparameter“ (*Child Parameters*) des jeweiligen Modells.

Bei der Gaußverteilung sind das der Mittelwert `mu` ($$\mu$$) und die Standardabweichung `sigma` ($$\sigma$$).

![Gaußverteilung mit den Parametern mu und sigma]({{ "/normal-distribution.png" | prepend: page.imgpath }}){: width="720" height="460" loading="lazy" decoding="async"}
{% include caption.html content="Gaußverteilung mit den Parametern mu und sigma. Entnommen aus: https://commons.wikimedia.org/wiki/File:Normal_Distribution_PDF.svg" %}

Bei der Laplace-Verteilung – die Notation schwankt je nach Literatur – gibt es in der Regel den Lageparameter bzw. Mittelwert `mu` ($$\mu$$) und den Skalenparameter `b` ($$b$$).

![Laplace-Verteilung mit den Parametern mu und b]({{ "/laplace-distribution.png" | prepend: page.imgpath }}){: width="800" height="600" loading="lazy" decoding="async"}
{% include caption.html content="Laplace-Verteilung mit den Parametern mu und b. Entnommen aus: https://commons.wikimedia.org/wiki/File:Laplace_pdf_mod.svg" %}

Zur eindeutigen Abgrenzung vom Mittelwert der Gaußverteilung nennen wir den Lageparameter der Laplace-Verteilung `a` statt `mu`.

Wenn wir die Gaußverteilung anpassen, soll Vizier natürlich nicht versuchen, die Parameter der Laplace-Verteilung zu schätzen – und umgekehrt. Praktischerweise können wir die Parameter jeder Verteilung als untergeordnete bzw. bedingte Parameter des übergeordneten Modellparameters definieren:

```
'conditional_parameter_specs': [
{
    "parameter_spec": {
        "parameter_id": "mu",
        "scale_type": 'UNIT_LINEAR_SCALE',
        "double_value_spec": {
        "min_value": 0,
        "max_value": 10.0,
        },
    },
    "parent_categorical_values": {
        "values": ['gaussian']
    }
},
{
    "parameter_spec": {
        "parameter_id": "sigma",
        "scale_type": 'UNIT_LINEAR_SCALE',
        "double_value_spec": {
        "min_value": 1e-1,
        "max_value": 5.0,
        },
    },
    "parent_categorical_values": {
        "values": ['gaussian']
    }
},
    {
    "parameter_spec": {
        "parameter_id": "a",
        "scale_type": 'UNIT_LINEAR_SCALE',
        "double_value_spec": {
        "min_value": 0,
        "max_value": 10.0,
        },
    },
    "parent_categorical_values": {
        "values": ['laplace']
    }
},
{
    "parameter_spec": {
        "parameter_id": "b",
        "scale_type": 'UNIT_LINEAR_SCALE',
        "double_value_spec": {
        "min_value": 1e-1,
        "max_value": 5.0,
        },
    },
    "parent_categorical_values": {
        "values": ['laplace']
    }
}]
```

Schließlich müssen wir die Metrik definieren, die Vizier optimieren soll. Ich möchte eine Funktion möglichst genau an das Signal anpassen und bewerte die Güte der Anpassung über die Summe der quadrierten Residuen zwischen der analytischen Funktion und den Datenpunkten. Je kleiner dieser Wert, desto besser passt die Kurve. Wir müssen Vizier lediglich mitteilen, dass diese Metrik minimiert werden soll:

```
metric_ssr = {
    'metric_id': 'sum_of_squared_residuals',
    'goal': 'MINIMIZE',
}
```

Alles zusammen ergibt unsere Problemdefinition:

```
study = {
    'display_name': 'vizier_experiment',
    'study_spec' :
    {
        'parameters': [param_model],
        'metrics': [metric_ssr]
    }
}
```

Beachte, dass Vizier selbst keinerlei Verständnis von den Parametern hat. `Gaussian` und `Laplace` sind schlicht Werte eines kategorischen Parameters und haben für Vizier darüber hinaus keine Bedeutung. Ihre Bedeutung erhalten sie erst durch meinen Code, der sie verarbeitet – aber für Vizier lebt dieser Code in einer Blackbox. Der Kürze halber lasse ich den Code hier weg; über den Link am Ende des Artikels kannst du dir alles im Detail anschauen.


<div class="divider"></div>

## Die Suche

Für jeden Versuch (Trial) schlägt Vizier einen Satz Parameter vor, den wir ausprobieren sollen. Wir bewerten selbst, wie gut diese Parameter funktionieren, berechnen die Metrik (die Summe der quadrierten Residuen) und melden das Ergebnis an Vizier zurück. Auf Basis dieses Ergebnisses generiert Vizier den nächsten Parametervorschlag.

![Vizier schlägt Parameter für Versuche vor]({{ "/vizier-trials.png" | prepend: page.imgpath }}){: width="1280" height="281" loading="lazy" decoding="async"}
{% include caption.html content="Vizier schlägt Parameter für die einzelnen Versuche vor." %}

Man erkennt, dass Vizier nur dann Gauß-Parameter vorschlägt, wenn das Modell `gaussian` ist, und entsprechend beim Laplace-Modell.

Wie sucht Vizier nach optimalen Parametern? Es beherrscht zwar auch Grid Search oder Random Search, doch die eigentliche Stärke liegt in einer Kombination ausgefeilterer Algorithmen: Gaussian Process Bandits, Linear Combination Search und deren Varianten.

Über die Google Cloud Platform (GCP) lassen sich diese schicken Diagramme zum Fortschritt von Vizier betrachten:

![Studientabelle mit dem Verlauf der optimierten Metrik und den Parametern jedes Versuchs]({{ "/study-progress-table.webp" | prepend: page.imgpath }}){: width="1600" height="1071" loading="lazy" decoding="async"}
{% include caption.html content="Eine Studientabelle, die den Verlauf der optimierten Metrik und die Parameter jedes Versuchs zeigt." %}

![Paralleles Koordinatendiagramm mit getesteten Parameterkombinationen und resultierendem Metrikwert]({{ "/parallel-chart.webp" | prepend: page.imgpath }}){: width="1600" height="726" loading="lazy" decoding="async"}
{% include caption.html content="Ein paralleles Koordinatendiagramm der getesteten Parameterkombinationen und des resultierenden Metrikwerts." %}

<div class="divider"></div>

## Optimale Anpassung

Wir sehen, dass die Laplace-Verteilung knapp vor der Gaußverteilung liegt:

![Herangezoomtes paralleles Koordinatendiagramm der besten Versuche, die die Residuenquadratsumme minimieren]({{ "/optimal-parallel-chart.webp" | prepend: page.imgpath }}){: width="1600" height="550" loading="lazy" decoding="async"}
{% include caption.html content="Herangezoomtes paralleles Koordinatendiagramm der besten Versuche mit minimaler Summe der quadrierten Residuen. Eine Laplace-Verteilung passt besser als eine Gaußverteilung." %}

Wir fragen bei Vizier die Parameter des besten Versuchs ab und plotten die zugehörige Kurve:

![Optimierte Anpassung an das verrauschte Signal]({{ "/noisy-signal-fit.png" | prepend: page.imgpath }}){: width="543" height="289" loading="lazy" decoding="async"}
{% include caption.html content="Optimierte Parameter, angepasst an das verrauschte Signal." %}

Das passt nahezu perfekt! Die von Vizier gefundenen Parameter liegen ganz nah an den Werten, mit denen ich das Signal vor dem Hinzufügen von Rauschen erzeugt habe: eine Laplace-Verteilung mit $$a=5$$ und $$b=2$$.

![Ursprüngliches Laplace-Signal]({{ "/original-laplace-signal.png" | prepend: page.imgpath }}){: width="862" height="728" loading="lazy" decoding="async"}
{% include caption.html content="Ursprüngliches Laplace-Signal." %}

Zum Vergleich: Eine Gaußverteilung hätte eine rundere Spitze und schmalere Ränder.

![Gaußverteilung zum Vergleich]({{ "/gaussian-signal.png" | prepend: page.imgpath }}){: width="878" height="726" loading="lazy" decoding="async"}
{% include caption.html content="Eine Gaußverteilung zum Vergleich." %}

<div class="divider"></div>

## Wie kann ich das selbst ausprobieren?

Das Colab-Notebook, mit dem ich diesen Artikel erstellt habe, findest du [hier](https://github.com/skzv/vizier-blog-post/blob/main/vizier_blog_post.ipynb). Ich habe die Vertex-AI-Vizier-API von GCP verwendet, weil sie so praktische Diagramme wie die in diesem Beitrag erzeugt – allerdings kann das schnell teuer werden (1 $/Trial). Vizier ist aber auch als Open Source [hier](https://github.com/google/vizier) verfügbar.
