---
layout: post
lang_code: de
locale: de_DE
ref: bringing-colour-and-life-to-black-and-white-photos
date: 2021-06-12 00:00:00 -0700
last_modified_at: 2021-06-12 00:00
permalink: /de/bringing-colour-and-life-to-black-and-white-photos
title: "Farbe und Leben für Schwarz-Weiß-Fotos"
imgpath: /assets/img/colourising-black-and-white-photos
previewurl: /mama-and-vova-colorized.jpg
description: "Familienfotos mit KI und der DeepAI-API kolorieren – inklusive Beispielen, Batch-Skript und einem Blick auf Grenzen und Ethik der Farbrestaurierung."
image: /assets/img/colourising-black-and-white-photos/og-preview.png
image_width: 1200
image_height: 630
image_alt: "Ein mit KI in Farbe restauriertes Familienfoto"
mathjax: false
tags: [computer-vision, machine-learning]
toc: true
---

{% include description.html content="Mit Machine Learning lassen sich Schwarz-Weiß-Fotos mühelos kolorieren – aber zu welchem Preis?" %}

## Ein anderes Universum

Obwohl Farbfotos technisch gesehen schon seit über einem Jahrhundert existieren ([Sergey Prokudin-Gorsky und Piotr Vedenisov, Pioniere der Farbfotografie, reisten durch das Russische Kaiserreich und dokumentierten es in voller Farbe](https://www.loc.gov/pictures/related/?fi=name&q=Prokudin-Gorski%20%2C%20Serge%20%20Mikha%20lovich%2C%201863-1944)), wurde der Großteil des 20. Jahrhunderts in Schwarz-Weiß festgehalten. Selbst später im Jahrhundert hatte ein großer Teil der Welt nicht den Luxus von Farbfilm – mein Vater entwickelte noch in den 1980er- und 90er-Jahren in der Sowjetukraine seine eigenen Schwarz-Weiß-Fotos, und während Amerikaner den Vietnamkrieg in voller Farbe filmten, scheint die nordvietnamesische Perspektive fast ausschließlich in Schwarz-Weiß-Aufnahmen überliefert zu sein.

![Kleiner Junge am Fluss Sim]({{ "/boy-sim-river.jpeg" | prepend: page.imgpath }}){: width="900" height="648" fetchpriority="high" decoding="async"}
{% include caption.html content="Kleiner Junge am Fluss Sim, eine sehr frühe Farbfotografie aus dem Russischen Kaiserreich. Sie entstand durch mehrere Aufnahmen derselben Szene mit verschiedenen Farbfiltern. Mit freundlicher Genehmigung der Library of Congress." %}

Manche argumentieren, dass Schwarz-Weiß-Aufnahmen ihren ganz eigenen Reiz haben, und das mag durchaus stimmen. Mich persönlich trennt Schwarz-Weiß-Material jedoch von der Szene. Es wirkt eindeutig zeitlich fern. Wir alle verbinden Schwarz-Weiß-Bilder mit der Vergangenheit, wie auch der filmische Kunstgriff zeigt, Erinnerungen in Schwarz-Weiß darzustellen. Und als jemand, der die Realität in voller Farbe erlebt, fällt es mir schwer, Schwarz-Weiß-Aufnahmen wirklich nachzuempfinden. Ich tue mich schwer damit, mich in die Szene oder in die Menschen hineinzuversetzen, weil sie in meinem Kopf in einem anderen, schwarz-weißen Universum existieren. Sobald dasselbe Bild jedoch koloriert wird, wirkt plötzlich alles realer, glaubwürdiger und greifbarer. Dann wird klar, dass das, was da gezeigt wird, auf derselben Erde stattfand und dieselben Menschen zeigt – Menschen wie du und ich.

Als mein Vater kürzlich anfing, unsere Sammlung an Familienfotos zu digitalisieren – denn physische Fotos altern oder drohen mitsamt den Geschichten, Erinnerungen und Vermächtnissen, die sie bewahren, für immer verloren zu gehen –, spürte ich den Drang, sie auch zu kolorieren. Damit ich sie intensiver erleben kann und damit meine Familie in Erinnerungen an verstorbene Angehörige oder an ihre eigene Vergangenheit und Jugend schwelgen kann.

<div class="divider"></div>

## Fotos mit KI kolorieren

Farbrestaurierung lässt sich manuell und mit viel Fleißarbeit erledigen. Machine-Learning-Modelle bieten eine schnelle und günstige Möglichkeit, Fotos zu kolorieren – allerdings mit eigenen Grenzen, auf die wir später in diesem Beitrag noch eingehen. Ich habe für diesen Zweck kein eigenes Modell trainiert. Andere haben bereits tausende Stunden in die Entwicklung und das Training genau solcher Modelle investiert. Ich habe ein bestehendes Modell gefunden, das sehr gute Arbeit leistet.

Ich habe die [Image Colorization API von DeepAI](https://deepai.org/machine-learning-model/colorizer) verwendet. Das von DeepAI produktiv eingesetzte Modell scheint eine Variante von DeOldify zu sein, das in [diesem GitHub-Repository](https://github.com/jantic/DeOldify) zu finden ist.

Soweit ich weiß, erlaubt es die DeepAI-API nicht, die Modellparameter anzupassen – das geht aber, wenn du das Modell selbst aus dem obigen Repository oder über [eine Colab-Instanz](https://colab.research.google.com/github/jantic/DeOldify/blob/master/ImageColorizerColabStable.ipynb) ausführst. Auch [MyHeritage](https://www.myheritage.com/incolor) bietet diese API als Dienst mit einstellbaren Parametern an.

Ich habe mir kurzerhand ein kleines Skript geschrieben, um ganze Verzeichnisse im Stapel zu kolorieren. Es durchläuft alle Fotos in einem Ordner, schickt sie an die Image Colorization API von DeepAI und lädt das Ergebnis in einen separaten Ordner herunter (bereits kolorierte Bilder werden übersprungen). Falls dir das nützlich ist, setze einfach deinen eigenen DeepAI-API-Schlüssel als Umgebungsvariable und führe [dieses Skript](https://github.com/skzv/colorize-photos) aus:

```bash
export DL_API_KEY=<your-deep-ai-key>
python3 main.py /path/to/images
```

<div class="divider"></div>

## Meine Familienfotos
Hier sind einige Beispiele der Ergebnisse anhand unserer Familienfotos.

![Mama mit Vova]({{ "/mama-and-vova.webp" | prepend: page.imgpath }}){: width="1600" height="1232" loading="lazy" decoding="async"}
{% include caption.html content="Meine Mutter mit meinem Bruder auf dem Arm, Anfang der 90er-Jahre in Cherson, Ukraine. Mit freundlicher Genehmigung der Familie Kuznetsov." %}

![Mama mit Vova in Farbe]({{ "/mama-and-vova-colorized.webp" | prepend: page.imgpath }}){: width="800" height="616" loading="lazy" decoding="async"}
{% include caption.html content="Jetzt in Farbe." %}

![Babuschka Allarkadina]({{ "/my-grandmother-allarkadina.jpg" | prepend: page.imgpath }}){: width="523" height="801" loading="lazy" decoding="async"}
{% include caption.html content="Meine Großmutter Allarkadina, vermutlich irgendwann in den 50er-Jahren, auf dem Weg zur Universität. Sie absolvierte mehrere Hochschulen mit Schwerpunkt Elektrotechnik und hatte eine erfolgreiche Karriere als Schiffselektroingenieurin." %}

![Babuschka Allarkadina in Farbe]({{ "/my-grandmother-alla-colourised.webp" | prepend: page.imgpath }}){: width="522" height="800" loading="lazy" decoding="async"}
{% include caption.html content="In Farbe." %}

> Sieht so schön und lebendig aus.

Diese Worte meines Vaters, als er die neu kolorierten Fotos sah, haben die ganze Mühe sofort wert gemacht.

<div class="divider"></div>

## Fotos aus dem Vietnamkrieg
Ein paar Wochen nachdem ich das Batch-Skript für unsere Familienfotos fertiggestellt hatte, landete ein Beitrag mit dem Titel [„The Vietnam War from the North Vietnamese Side“](https://news.ycombinator.com/item?id=27283624) ganz oben auf Hacker News. Das schien die perfekte Gelegenheit zu sein, das Skript anzuwenden und eine neue Perspektive auf historisches Bildmaterial zu eröffnen. So wie [„They Shall Not Grow Old“](https://www.imdb.com/title/tt7905466/) die Schrecken des Ersten Weltkriegs lebendig und real machte, wollte auch ich die Menschen und Szenen aus Sicht Nordvietnams greifbarer machen.

![Zerstörung des Dschungels durch Agent Orange]({{ "/vietnam-agent-orange.jpeg" | prepend: page.imgpath }}){: width="1600" height="1179" loading="lazy" decoding="async"}
{% include caption.html content="Zerstörung des Dschungels durch Agent Orange." %}

![Zerstörung des Dschungels durch Agent Orange in Farbe]({{ "/vietnam-agent-orange-colourised.webp" | prepend: page.imgpath }}){: width="800" height="590" loading="lazy" decoding="async"}
{% include caption.html content="In Farbe." %}

![Einheimische inspizieren ein abgeschossenes amerikanisches Flugzeug]({{ "/vietnam-downed-aircraft.jpeg" | prepend: page.imgpath }}){: width="1600" height="1111" loading="lazy" decoding="async"}
{% include caption.html content="Einheimische inspizieren ein abgeschossenes amerikanisches Flugzeug, gesteuert von Lt. Stephen Owen Musselman. Der Pilot überlebte nicht – Krieg ist die Hölle." %}

![Abgeschossenes amerikanisches Flugzeug in Farbe]({{ "/vietnam-downed-aircraft-colourised.webp" | prepend: page.imgpath }}){: width="800" height="556" loading="lazy" decoding="async"}
{% include caption.html content="In Farbe." %}

Alle ursprünglichen Schwarz-Weiß-Bilder findest du [hier](https://rarehistoricalphotos.com/vietnam-war-images-from-vietnamese-photographers/), die kolorierten Versionen [hier](https://imgur.com/a/aJbpMjf).

<div class="divider"></div>

## Reaktionen auf Hacker News

Meine Arbeit stieß sowohl auf Lob

![Lob]({{ "/praise.webp" | prepend: page.imgpath }}){: width="624" height="934" loading="lazy" decoding="async"}

als auch auf Ablehnung

![Ablehnung]({{ "/contempt.png" | prepend: page.imgpath }}){: width="546" height="286" loading="lazy" decoding="async"} {% include caption.html content="Schade um den [flagged]-Kommentar, denn er brachte einen interessanten Punkt ein. Der Kommentar lautete sinngemäß: ‚Bitte mach das nicht.‘" %}

aber am wichtigsten: Sie löste viele sehr interessante Diskussionen aus.

![Diskussion]({{ "/discussion.webp" | prepend: page.imgpath }}){: width="654" height="946" loading="lazy" decoding="async"}

Den vollständigen Thread zu den kolorierten Fotos findest du [hier](https://news.ycombinator.com/item?id=27284795).

<div class="divider"></div>

## Grenzen

Zwei Aspekte der Diskussion blieben mir besonders im Gedächtnis. Der erste war eine deutliche Erinnerung an die Grenzen von KI.

Wendet man das Modell zum Beispiel auf ein altes Foto der Golden Gate Bridge während ihres Baus an, erzeugt es eine weiße Brücke. Fairerweise ist das nicht völlig falsch – früh in der Bauphase war die Brücke tatsächlich weiß, doch zu dem Zeitpunkt, als dieses Foto entstand, war sie bereits mit roter Grundierung gestrichen (laut der Quelle im [DeOldify-Repository](https://github.com/jantic/DeOldify)). Die Trainingsdaten enthielten die Golden Gate Bridge im Bau vermutlich durchaus, und das Modell erkannte die Baustelle wieder, konnte aber das Datum nicht erschließen und somit nicht wissen, dass die Brücke zu diesem Zeitpunkt bereits rot grundiert war.

![Eine weiße Golden Gate Bridge?]({{ "/golden-gate.webp" | prepend: page.imgpath }}){: width="1200" height="472" loading="lazy" decoding="async"} {% include caption.html content="Eine weiße Golden Gate Bridge? Sie war zwar mal weiß – aber nicht, als dieses Bild aufgenommen wurde." %}

Manche Szenen sind schlicht mehrdeutig. Anhand der Bildmerkmale im nächsten Beispiel kann das Modell etwa nicht unterscheiden, ob der Boden eine Wiese oder Asphalt ist, und färbt den Asphalt fälschlicherweise grün – etwas, das ein menschlicher Kolorist vermutlich richtig getroffen hätte.

![Eine Feierlichkeit]({{ "/a-celebration-colourised.webp" | prepend: page.imgpath }}){: width="800" height="522" loading="lazy" decoding="async"} {% include caption.html content="Das Modell erkennt nicht, dass der Boden Asphalt und kein Gras ist." %}

Eine weitere interessante Beobachtung war, dass Kleidung oft nicht genügend charakteristische Töne, Texturen, Merkmale oder Kontext besitzt, um sie zuverlässig einzufärben. Das Modell neigte dazu, Kleidung lila zu färben – es sei denn, es gab eindeutige Merkmale oder Hinweise im Kontext. Das liegt wahrscheinlich daran, dass Lila, wenn das Modell keine gute Schätzung für die Kleidungsfarbe treffen kann, eine konservative Wahl irgendwo in der Mitte des mehrdeutigen Farbraums darstellt, die den Trainingsfehler minimiert.

![Vietnamesische Taucher – alle in Lila?]({{ "/vietnam-divers-colourised.webp" | prepend: page.imgpath }}){: width="796" height="800" loading="lazy" decoding="async"} {% include caption.html content="Ich glaube kaum, dass Kleidung früher so oft lila war, wie dieses Modell es darstellt." %}

Tatsächlich bat mich mein Vater, die Farben einiger Gegenstände auf unseren Fotos zu korrigieren. Leider bin ich dem nicht weiter nachgegangen, und es ist für mich auch nicht unmittelbar offensichtlich, wie ich das umsetzen könnte. Doch wie ein Kommentator anmerkte: Selbst wenn die Farben nicht stimmen, erwecken sie die Bilder dennoch zum Leben.

<div class="divider"></div>

## Ethische Überlegungen

Nachdem einige der technischen Grenzen klar sind, können wir gut über die ethischen Konsequenzen einer Kolorierungs-KI nachdenken. Das war der zweite Aspekt der Diskussion, der mich besonders beschäftigt hat. Über Ethik hatte ich mir zu Beginn des Projekts gar keine Gedanken gemacht, aber einiges vom Feedback hat mich zum Nachdenken gebracht – und dafür bin ich dankbar.

Die zentrale ethische Frage ist die nach der Wahrheit. Ähnlich wie bei der Debatte um Deepfakes, die unser Gefühl dafür verwirren, was wahr ist, kann künstliche Kolorierung unsere Wahrnehmung von Geschichte verändern. Die KI trifft Entscheidungen über die Farben der Vergangenheit, die nicht unbedingt zutreffen. Wenn wir etwa die von einer KI erzeugte weiße Version der Golden Gate Bridge aufbewahren und verbreiten, ist das Bild, das Betrachter von der Brücke bekommen, historisch nicht korrekt. Natürlich ist es die Schwarz-Weiß-Version ebenso wenig. Der Unterschied ist vielleicht: Wer ein Schwarz-Weiß-Foto betrachtet, weiß sofort, dass die Vergangenheit nicht wirklich so aussah – bei einem Farbbild hingegen lässt man sich leicht dazu verleiten zu glauben, genau so sei die Geschichte gewesen.

Manche gehen sogar so weit, solche Retuschen als Umschreiben von Geschichte zu bezeichnen – und manchmal wirkt es tatsächlich so. Ein aktuelles Beispiel:

> Kambodscha hat die US-Mediengruppe Vice aufgefordert, einen Artikel mit neu kolorierten Fotografien von Opfern der Roten Khmer zurückzuziehen, da die Bilder eine Beleidigung der Toten seien, weil einigen von ihnen nachträglich ein Lächeln hinzugefügt wurde.

<p class="caption" style="margin-top:-25px;"><a href="https://www.aljazeera.com/news/2021/4/11/cambodia-condemns-vice-for-altered-khmer-rouge-images">Quelle</a></p>

Eine absolut berechtigte Kritik. Offenbar war das Modell überangepasst und wohl größtenteils auf lächelnden Gesichtern trainiert worden. Entsprechend veränderte es die Gesichter der Opfer so, dass sie den Trainingsdaten ähnlicher wurden – indem es ihnen ein Lächeln aufsetzte. Ein eindrückliches Beispiel für die Fallstricke von KI, besonders wenn sie unbedacht eingesetzt wird.

[MyHeritage](https://www.myheritage.com/incolor), das einen Farbrestaurierungsdienst auf Basis desselben DeOldify-Modells anbietet, versucht einen Kompromiss zu finden, indem alle retuschierten Bilder mit einem Wasserzeichen versehen werden. Ich finde das Argument sehr überzeugend:

> Wir unterscheiden kolorierte Fotos von solchen, die ursprünglich in Farbe fotografiert wurden, mithilfe eines speziellen geprägten Paletten-Symbols in der unteren linken Ecke kolorierter Fotos. Auch wenn sie sehr realistisch wirken, enthalten kolorierte Fotos Farben, die von automatischen Algorithmen simuliert wurden und nicht unbedingt mit den echten Farben der ursprünglichen Aufnahme übereinstimmen. Das Paletten-Symbol erscheint auf allen kolorierten Fotos, damit Nutzer sie von Fotos mit echten Farben unterscheiden können. Wir hoffen, dass diese verantwortungsbewusste Praxis von anderen übernommen wird, die Fotokolorierungstechnologie einsetzen. Fotos, die lediglich einer Farbrestaurierung unterzogen wurden, tragen kein Symbol, da diese Farben authentisch sind.

In meinem Fall wusste meine Familie, dass ich unsere Fotos künstlich koloriert hatte, und sie erkannten, dass die Farben nicht ganz exakt waren. Doch selbst mit ungenauen Farben wurden die Fotos – und die Menschen und Momente darin – wieder zum Leben erweckt. Genau wie damals, als ich als Schüler ehrenamtlich in einem Seniorenheim half und einem Bewohner über Google Street View sein Elternhaus in Dresden zeigen konnte, das er 50 Jahre lang nicht mehr gesehen hatte, konnte ich mithilfe von KI unsere Familie in schöne Zeiten vor Jahrzehnten zurückversetzen. Technologie ist ein Werkzeug, und ich bin dankbar, in einer Zeit zu leben, in der solche Magie möglich ist.
