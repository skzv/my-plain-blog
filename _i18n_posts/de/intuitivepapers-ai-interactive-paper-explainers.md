---
layout: post
lang_code: de
locale: de_DE
ref: intuitivepapers-ai-interactive-paper-explainers
date: 2026-06-05 00:00:00 -0700
last_modified_at: 2026-11-25 00:00
permalink: /de/intuitivepapers-ai-interactive-paper-explainers
title: "Interaktive KI-Paper-Erklärungen mit intuitivepapers.ai"
imgpath: /assets/img/intuitivepapers
previewurl: /home.png
description: "Wie ich intuitivepapers.ai gebaut habe: eine automatisierte Pipeline, die Machine-Learning-Paper in verifizierte, interaktive Erklärungen mit eigenen Canvas-Grafiken verwandelt."
image: /assets/img/intuitivepapers/home.png
image_width: 1280
image_height: 820
image_alt: "intuitivepapers.ai interaktive Erklärungen für KI-Paper"
mathjax: false
tags: [machine-learning, ai-tools]
---

{% include description.html content="Lässt sich das Umwandeln dichter Machine-Learning-Paper in verifizierte, interaktive Erklärungen automatisieren?" %}

Machine-Learning-Paper zu lesen kann frustrierend langsam sein. Ein Paper widmet seine Seiten meist dem Neuen und setzt stillschweigend voraus, dass man die fünf zugrunde liegenden Konzepte alle noch frisch im Kopf hat – sodass ich die Hälfte der Zeit erst einmal einer Kette älterer Referenzen nachjagen muss, bevor das eigentliche Paper Sinn ergibt.

Die bequeme Abkürzung heute besteht darin, das PDF in ein LLM zu werfen und um eine Erklärung zu bitten. Das mache ich selbst oft, und für einen groben ersten Überblick ist es hilfreich – aber erstaunlich oft liegen Modelle bei feinen Details daneben. Ein verdrehtes Vorzeichen in einer Gleichung, ob eine Herleitung exakt oder nur eine Näherung ist oder welche Variable tatsächlich aktualisiert wird, kann komplett verändern, was ein Algorithmus tut. Und wenn man das Paper noch nicht gut kennt, bemerkt man solche Fehler kaum, weil die Erklärung ansonsten vollkommen plausibel klingt.

Was ich mir gewünscht habe, sind Erklärungen, die Intuition und Mathematik gemeinsam aufbauen – mit Grafiken, mit denen man tatsächlich herumspielen kann. Wie groß der Unterschied ist, habe ich vor ein paar Jahren gemerkt, als ich meine [interaktive Demo zum Gradientenabstieg](/de/gradient-descent) gebaut habe: Einen Regler zu verschieben und zuzusehen, wie ein Algorithmus überschießt oder konvergiert, vermittelt Dinge, die eine statische Gleichung allein nie wirklich rüberbringt.

## Der Anfang mit DiffusionBlocks

Begonnen habe ich damit, zusammen mit Claude eine einzelne [Erklärung für das DiffusionBlocks-Paper von Sakana AI](https://intuitivepapers.ai/diffusionblocks/) zu bauen. Es dauerte etwa eine Woche hin und her, bis sie in gutem Zustand war. Ein großer Teil dieser Zeit floss darin, jede Gleichung gegen die Primärquellen (wie das EDM-Paper) und das offizielle GitHub-Repository der Autoren gegenzuprüfen.

Dabei deckte die Verifizierung sogar einen echten Vorzeichenfehler auf, der im Paper selbst abgedruckt war. Das Paper definiert `Δσ = σ_prev - σ_next > 0` und schreibt das Euler-Update in Gleichung (4) mit `(z - D)`, was tatsächlich *weg* von der Vorhersage des Denoisers geht. Diskretisiert man Gleichung (1), erhält man `(D - z)` – und tatsächlich bestätigte ein Blick in den Code der Autoren (`model.py`), dass die Implementierung das korrigierte Vorzeichen verwendet. Eine gewöhnliche LLM-Zusammenfassung hätte den Tippfehler aus dem Paper einfach wiederholt, und mir wäre er wohl nie aufgefallen.

Das brachte mich auf die Frage, wie viel von dieser ganzen Woche Arbeit sich automatisieren ließe. Könnte ich eine Pipeline bauen, die den tatsächlichen Quelltext eines Papers lädt, die vorausgesetzte Mathematik gegen Primärliteratur und Code prüft, interaktive Grafiken erstellt und ihren eigenen Entwurf vor der Veröffentlichung überprüft?

Das Ergebnis ist [intuitivepapers.ai](https://intuitivepapers.ai/). Gestartet ist die Seite mit zwanzig Erklärungen – darunter Klassiker und neuere Paper wie Attention, BERT, GANs, VAEs, CLIP, PPO, Mamba und Adam – und inzwischen ist sie auf über 150 Erklärungen gewachsen, da die Pipeline regelmäßig nach Zeitplan weiterläuft.

![Startseite von intuitivepapers.ai mit interaktiven Erklärungen zu Machine-Learning-Papern]({{ "/home.webp" | prepend: page.imgpath }}){: width="1280" height="820" fetchpriority="high" decoding="async"}
{% include caption.html content="Die Startseite von intuitivepapers.ai." %}

![Bibliothek mit zwanzig KI-Paper-Erklärungen samt Live-Vorschau der Grafiken]({{ "/library.webp" | prepend: page.imgpath }}){: width="1280" height="2621" loading="lazy" decoding="async"}
{% include caption.html content="Die ursprüngliche Bibliothek mit zwanzig Papern. Jede Karte rendert eine Live-Vorschau einer Grafik aus der jeweiligen Erklärung." %}

<div class="divider"></div>

## Wie eine Erklärung aufgebaut ist

Jede Seite beginnt mit den Grundlagen und arbeitet sich in Abhängigkeitsreihenfolge bis zur Kernidee des Papers vor. Auf dem Desktop bildet eine Seitenleiste, die ich den *Concept Tower* nenne, diese Abhängigkeitskette ab, sodass man sofort sieht, wie die Bausteine aufeinander aufbauen – und kurze Codeblöcke verknüpfen die mathematische Notation direkt mit dem, was tatsächlich ausgeführt wird.

Mein Lieblingsteil sind die interaktiven Grafiken. PPO verwendet zum Beispiel eine geclippte Zielfunktion, damit sich Policy-Updates in einem einzelnen Schritt nicht zu weit bewegen. In der Grafik unten kannst du das Wahrscheinlichkeitsverhältnis verschieben und das Vorzeichen des Advantage umkehren, um genau zu beobachten, wo die Zielfunktion flach wird und keinen Gradienten mehr erzeugt. Zehn Sekunden damit herumzuspielen lässt die Clipping-Logik deutlich schneller einrasten, als nur auf den `min`-Ausdruck zu starren.

![Interaktive Darstellung der geclippten PPO-Zielfunktion mit Wahrscheinlichkeitsverhältnis und Advantage]({{ "/ppo-figure.png" | prepend: page.imgpath }}){: width="1280" height="820" loading="lazy" decoding="async"}
{% include caption.html content="Die geclippte Zielfunktion von PPO interaktiv erkunden, indem man das Wahrscheinlichkeitsverhältnis verschiebt und das Vorzeichen des Advantage umschaltet." %}

Das Ganze skaliert auch sauber auf Smartphones herunter – denn dort lese ich selbst einen Großteil der Paper:

![PPO-Paper-Erklärung mit eingebetteter interaktiver Grafik auf einem Smartphone]({{ "/mobile-ppo.png" | prepend: page.imgpath }}){: width="400" height="840" loading="lazy" decoding="async" style="max-height:520px;width:auto"}
{% include caption.html content="Die PPO-Erklärung auf dem Smartphone, mit derselben interaktiven Grafik direkt im Text." %}

Ein weiteres Beispiel ist CLIP, das Bild- und Text-Encoder so trainiert, dass zusammengehörige Paare einander zugeordnet werden. Das interaktive Raster unten bewertet jedes Bild gegen jede Bildunterschrift in einem Batch – auf der hellen Diagonale liegen die echten Paare, die zusammengezogen werden, während alles außerhalb der Diagonale Fehlpaarungen sind, die auseinandergedrückt werden.

![CLIP-Ähnlichkeitsmatrix zum Vergleich von Bildern mit passenden und unpassenden Bildunterschriften]({{ "/clip-grid.png" | prepend: page.imgpath }}){: width="664" height="593" loading="lazy" decoding="async"}
{% include caption.html content="Die Bild-Text-Ähnlichkeitsmatrix von CLIP. Zusammengehörige Paare liegen entlang der Diagonale." %}

<div class="divider"></div>

## Wie die Pipeline funktioniert

Ein einzelner Prompt wie „Erkläre dieses Paper“ liefert genau die oberflächlichen Zusammenfassungen, von denen ich wegwollte. Um verlässlichere Ergebnisse zu bekommen, habe ich die Erzeugung in eine mehrstufige Pipeline aufgeteilt, bei der zwischen Entwurf und Veröffentlichung mehrere automatisierte Prüfungen sitzen.

Zuerst holt sich die Pipeline – statt ein Modell Gleichungen aus dem Gedächtnis paraphrasieren zu lassen – die arXiv-HTML-Version (`arxiv.org/html/<id>`) und konvertiert MathML mit `pandoc` in LaTeX, sodass die Gleichungen und Zahlen des Papers wortgetreu extrahiert werden.

Als Nächstes überprüft sie die vorausgesetzten Konzepte gegen Primärquellen – also Definitionen, Vorzeichen und Konventionen – und liest bei mehrdeutigen Stellen im Text den offiziellen Code der Autoren, inklusive exakter Datei- und Zeilenangaben in einem Quellen-Panel am Ende der Seite. All das wird in einer verifizierten Referenzkarte gebündelt, auf deren Basis der Text geschrieben wird, statt direkt aus dem rohen Paper loszuschreiben.

Darauf aufbauend erstellt die Pipeline maßgeschneiderte interaktive Grafiken direkt auf HTML5-Canvas (ohne Charting-Bibliothek) und schreibt die Erklärung in Abhängigkeitsreihenfolge, wobei Gleichungen mit konkreten durchgerechneten Zahlenbeispielen und kurzem Pseudocode kombiniert werden.

Bevor irgendetwas online geht, durchläuft der Entwurf eine Mischung aus deterministischen Prüfungen und Modell-Kritikern:

1. Ein kostenloser deterministischer Durchlauf prüft den Text auf typische KI-Floskeln, validiert die KaTeX-Syntax, stellt sicher, dass schmale mobile Versionen von Gleichungen mathematisch äquivalent zu den Desktop-Versionen sind und nicht über den Smartphone-Bildschirm hinausragen, und fährt jede interaktive Grafik über alle Desktop- und Mobil-Zustände von Reglern und Buttons ab, um überlappende oder abgeschnittene Beschriftungen aufzuspüren.
2. Separate Kritiker prüfen anschließend die fachliche Korrektheit anhand des Papers, Verständlichkeit, Tonfall, Grafiken und gerenderte Screenshots.
3. Bestätigte Befunde gehen in einen Korrekturdurchlauf, die Seite wird neu gebaut und nur die fehlgeschlagenen Prüfungen laufen für einige weitere Runden erneut. Schlägt am Ende immer noch etwas fehl, bricht die Pipeline sicher ab (*fail closed*) und öffnet einen Draft-PR statt automatisch zu veröffentlichen.

Die gesamte Pipeline läuft täglich per `launchd`-Zeitplan auf dem Mac mini unter meinem Schreibtisch. Jeden Morgen schnappt sie sich das am höchsten bewertete Paper aus der Warteschlange (eine Mischung aus kuratiertem Backlog und Leserwünschen), wartet bei Modell-Session-Limits automatisch auf das Zurücksetzen des Kontingents und macht weiter, bis Build und Review-Gate sauber durchlaufen – erst dann wird die fertige Seite deployed.

Unten siehst du eines der eigenen Canvas-Diagramme aus der Mamba-Erklärung, das die Bausteine eines Mamba-Blocks aufschlüsselt.

![Diagramm mit den Komponenten eines Mamba-Blocks]({{ "/mamba-block-fig.jpeg" | prepend: page.imgpath }}){: width="1280" height="900" loading="lazy" decoding="async"}
{% include caption.html content="Aufschlüsselung eines Mamba-Blocks, direkt auf Canvas gezeichnet für die Mamba-Erklärung." %}

<div class="divider"></div>

## Schlussbemerkungen

Begonnen hat das Ganze, weil ich ein einziges Paper wirklich gründlich verstehen wollte – und daraus wurde ein Experiment, wie weit automatisierte Verifizierung gehen kann. Primärquellen zu prüfen, den Code der Autoren zu lesen und alle Grafikzustände systematisch abzutasten fängt eine Menge subtiler Fehler ab, macht das Ergebnis aber natürlich nicht unfehlbar. Komplexe interaktive Grafiken zuverlässig ohne menschliche Augen hinzubekommen bleibt der schwierigste Teil, und gelegentlich rutscht doch mal eine holprige Erklärung oder ein Randfall-Bug durch.

Um dem entgegenzuwirken, gibt es am Ende jeder Seite ein Feedback-Feld. Hinweise von Lesern fließen sowohl in Korrekturen auf der jeweiligen Seite ein als auch in strengere Regeln für die Pipeline, damit künftige Erklärungen dieselben Fehler vermeiden.

Wenn es ein ML-Paper gibt, das du schon lange einmal richtig durcharbeiten wolltest, schau bei [intuitivepapers.ai](https://intuitivepapers.ai/) vorbei. Du kannst ein Paper vorschlagen oder in der Warteschlange hochvoten – und wenn du in einer Erklärung einen Fehler entdeckst, schick ihn mir gerne über das Feedback-Feld, damit ich ihn beheben kann.
