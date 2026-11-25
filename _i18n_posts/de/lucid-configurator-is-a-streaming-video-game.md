---
layout: post
lang_code: de
locale: de_DE
ref: lucid-configurator-is-a-streaming-video-game
date: 2021-07-28 00:00:00 -0700
last_modified_at: 2021-07-28 00:00
permalink: /de/lucid-configurator-is-a-streaming-video-game
title: "Der Lucid-Motors-Konfigurator ist ein Videospiel im Browser-Stream"
imgpath: /assets/img/lucid-configurator-is-a-streaming-video-game
previewurl: /lucid-configurator.png
description: "Wie der Fahrzeugkonfigurator von Lucid Motors mit Unity, Cloud-Rendering und WebRTC einen interaktiven 3D-Showroom direkt in deinen Browser streamt."
image: /assets/img/lucid-configurator-is-a-streaming-video-game/lucid-configurator.png
image_width: 1958
image_height: 845
image_alt: "Interaktiver 3D-Fahrzeugkonfigurator von Lucid Motors"
mathjax: false
tags: [computer-vision, 3d-graphics, systems]
---

{% include description.html content="Ergibt völlig Sinn, sobald man bedenkt, dass Videospiel-Engines die besten Simulatoren sind, die es gibt." %}

## Eine clevere Lösung

[Lucid Motors ist am Montag an die Börse gegangen](https://www.barrons.com/articles/lucid-churchill-merger-ipo-ev-51627308359), und auch wenn ich mir in nächster Zeit keinen Lucid kaufen werde, habe ich mir aus Neugier [ihren Fahrzeugkonfigurator](https://www.lucidmotors.com/air/configure/) angesehen. Er ist ein echtes Kunstwerk. Man kann das Fahrzeug aus nahezu jedem Winkel betrachten und damit interagieren, von innen wie von außen:

{% include video.html content="https://streamable.com/e/cudr66" %}
<p class="caption video-caption">Lucids Konfigurator für ihr Spitzenmodell, den Lucid Air Dream.</p>

Man kann verschiedene Farben und Ausstattungsvarianten ausprobieren, die Türen öffnen und schließen und sogar das Display der Mittelkonsole einfahren. Die Kulisse der Golden Gate Bridge spiegelt sich in glatten Pfützen auf dem Boden. Der Konfigurator bildet unzählige Details des Fahrzeugs nach, einschließlich der Lichter unter den Türgriffen, die aufleuchten, sobald man sie benutzt. Ich habe das Gefühl, einen so genauen Eindruck vom Auto bekommen zu haben, dass ich es gar nicht mehr persönlich sehen müsste.

Wie hat Lucid das überhaupt hinbekommen? Kann man vom Webbrowser eines Durchschnittsnutzers wirklich erwarten, eine solche Szene inklusive Reflexionen in Echtzeit zu rendern? Wohl kaum. Es funktioniert deshalb, weil die Szene, die du siehst, mit Unity – einer Videospiel-Engine – in der Cloud gerendert wird, sodass die hohe Rechenlast auf einen Amazon-Server ausgelagert ist, und dann über WebRTC – ein Peer-to-Peer-Videostreaming-Protokoll – zurück an deinen Browser gestreamt wird.

<div class="divider"></div>

## Das Modell

Anfangs ging ich naiv davon aus, dass das Modell lokal in meinem Browser über die neueste [WebGL-Bibliothek](https://en.wikipedia.org/wiki/WebGL) gerendert wird (eine API zum hardwarebeschleunigten Rendern von 2D- und 3D-Grafiken im Webbrowser). Und wenn das Modell lokal gerendert wird, müsste es ja irgendwo in meinem Arbeitsspeicher liegen – also müsste ich es extrahieren und in einem 3D-Editor öffnen können. Konkret wollte ich ausprobieren, ob ich die Sonnenblenden entfernen kann, die das fast nahtlose Glasdach unterbrechen – einen Effekt, den Teslas Model X so schön hinbekommt; keine Ahnung, warum Lucid dem nicht gefolgt ist.

![Sonnenblenden des Lucid Air, die das Glasdach unterbrechen]({{ "/lucid-air-sun-visors.webp" | prepend: page.imgpath }}){: width="1600" height="994" loading="lazy" decoding="async"}
{% include caption.html content="Die Sonnenblenden des Lucid Air unterbrechen das Glasdach." %}

Also tauchte ich in den Code ein. Nach einiger Zeit in den Entwicklertools des Browsers, nachdem ich tausende Zeilen minifiziertes JavaScript überflogen und die Netzwerkanfragen zwischen meinem Laptop und Lucids Servern aufgezeichnet und analysiert hatte, merkte ich, dass die Antwort die ganze Zeit über buchstäblich in der Konsole ausgegeben wurde:

![Der Konfigurator ist ein Videostream]({{ "/zlbolt-webrtc.png" | prepend: page.imgpath }}){: width="691" height="156" loading="lazy" decoding="async"}
{% include caption.html content="Der Konfigurator ist ein WebRTC-Stream." %}

Es wird gar kein lokales Modell gerendert. Was ich sehe, ist ein Video.

Was passiert hier also genau? Der Konfigurator startet zunächst mit einer 2D-Ansicht – also einer etwas ruckeligen Bilderreihe, die die Illusion einer 3D-Interaktion erzeugt. So sind die meisten interaktiven 3D-Ansichten im Web aufgebaut. Unten siehst du eine Demo davon:

{% include video.html content="https://streamable.com/e/ptjitc" %}
<p class="caption video-caption">Eine ruckelige 3D-Ansicht, zusammengesetzt aus einer Reihe von 2D-Bildern.</p>

Anschließend testet der Client meine Bandbreite und Latenz, und wenn die Verbindung schnell genug für einen Echtzeit-Videostream ist, wird die Sitzung auf 3D hochgestuft:

![Latenztest]({{ "/latency-test.png" | prepend: page.imgpath }}){: width="755" height="25" loading="lazy" decoding="async"}
![Bandbreitentest]({{ "/bandwidth-test.png" | prepend: page.imgpath }}){: width="706" height="21" loading="lazy" decoding="async"}
{% include caption.html content="Bei ausreichender Bandbreite wird auf eine 3D-Sitzung umgeschaltet." %}

Dadurch wird eine WebRTC-Verbindung aufgebaut. [WebRTC](https://en.wikipedia.org/wiki/WebRTC) ist ein Peer-to-Peer-Streaming-Protokoll. Die Szene wird anderswo gerendert und über WebRTC an meinen Browser gestreamt.

Ein Blick in den Inhalt der `get_token`-Anfrage verrät noch mehr Details über die Funktionsweise.

![Inhalt der get_token-Anfrage]({{ "/get-token-request.png" | prepend: page.imgpath }}){: width="829" height="402" loading="lazy" decoding="async"}
{% include caption.html content="Inhalt der get_token-Anfrage." %}

Der erste Block zeigt, dass sie zum Messen deiner Bandbreite einen Teil [eines 25 MB großen Testbildes](https://libzl.zlthunder.net/bandwidth-test-img.png) auf dein Gerät herunterladen und stoppen, wie lange das dauert. Falls du neugierig bist, hier ist das Bild (keine Sorge, ich habe es um das Zehnfache komprimiert).

![Bandbreiten-Testbild]({{ "/bandwidth-test-image.webp" | prepend: page.imgpath }}){: width="895" height="1263" loading="lazy" decoding="async"}
{% include caption.html content="Hat nicht viel mit Autos zu tun, testet aber deine Bandbreite einwandfrei." %}

Übrigens [scheint dieses Bild ein Effekt aus dem Plasma-Plugin von GIMP zu sein](https://www.gimp.org/tutorials/Floating_Logo/Plasma.jpg). Es lädt ziemlich langsam; da es Rauschen ähnelt, lässt es sich kaum komprimieren.

Wenn man [chrome://webrtc-internals/](chrome://webrtc-internals/) öffnet, erhält man noch weitere Details zur WebRTC-Verbindung, über die die 3D-Szene in meinen Browser gestreamt wird.

![WebRTC-Informationen]({{ "/lucid-webrtc.png" | prepend: page.imgpath }}){: width="851" height="399" loading="lazy" decoding="async"}
{% include caption.html content="Die Entwicklertools von Chrome liefern weitere Informationen über die WebRTC-Verbindung." %}

Spätestens jetzt fällt dir vielleicht auf, dass keine dieser URLs auf einer Lucid-Domain liegt, sondern unter `zlthunder`. Wer steckt dahinter?

<div class="divider"></div>

## ZeroLight

Eine Websuche nach `zlthunder` führt zu einem Unternehmen namens [ZeroLight](https://zerolight.com/). Laut eigener Beschreibung bieten sie cloudbasierte 3D-Visualisierung mit Fokus auf die Automobilbranche an. Jetzt ergibt alles einen Sinn!

![ZeroLight]({{ "/zero-light.webp" | prepend: page.imgpath }}){: width="1600" height="640" loading="lazy" decoding="async"}
{% include caption.html content="Spezialisten für cloudbasierte 3D-Visualisierung." %}

Es dauerte nicht lange, bis ich [diesen Blogbeitrag von Unity](https://unity3d.com/showcase/case-stories/zerolight) (der bekannten Videospiel-Engine) fand, der erklärt, wie ZeroLight die Engine nutzt, um einen realistischen virtuellen Showroom samt optimierter Physik, Reflexionen und allem Drum und Dran zu erschaffen.

![ZeroLight mit Unity]({{ "/unity-zero-light.webp" | prepend: page.imgpath }}){: width="1203" height="658" loading="lazy" decoding="async"}
{% include caption.html content="Videospiele haben uns weit gebracht." %}

Jetzt fügen sich alle Puzzleteile zusammen. Wenn ich die Website öffne, wird zunächst ein 2D-Konfigurator geladen. Wenn meine Internetverbindung ausreicht, verbindet mich die Seite mit einer Instanz von Unity – einer 3D-Videospiel-Engine –, die auf einem AWS-Server läuft. Der Server empfängt meine Mauseingaben, dreht und zoomt das Sichtfeld, rendert das Ergebnis in der Cloud und streamt es an mich zurück.

<div class="divider"></div>

## Klingt teuer

Stell dir vor, es sind 1.000 Nutzer gleichzeitig auf der Seite: Dann brauchst du 1.000 hardwarebeschleunigte Instanzen einer Videospiel-Engine, die Eingaben entgegennehmen und riesige Mengen an Echtzeitvideo zurückstreamen – genau wie bei Cloud-Gaming-Diensten wie Stadia oder GeForce Now. Aber offensichtlich ist man sich dessen sehr bewusst: Um Kosten zu sparen, wird die Verbindung nach 60 Sekunden Inaktivität wieder getrennt:

![Herabstufung bei Inaktivität]({{ "/inactivity-downgrade.png" | prepend: page.imgpath }}){: width="524" height="60" loading="lazy" decoding="async"}
{% include caption.html content="Das Herabstufen im Leerlauf spart sicher eine Menge Geld." %}

<div class="divider"></div>

## Was ist eine Videospiel-Engine überhaupt?

Auch wenn es auf den ersten Blick nach einem überraschenden Einsatzzweck für eine Spiel-Engine klingt, ist eine Videospiel-Engine im Grunde einfach ein hochoptimierter Simulator. Etablierte Engines wie Unity bündeln Jahrzehnte an Forschung zur Simulation von Lichtstrahlen und anderen physikalischen Phänomenen. Wenn du also die Realität simulieren willst – selbst wenn diese Realität ein Autoshowroom ist –, ist eine Spiel-Engine ein perfektes, sofort einsatzbereites Werkzeug, das sich für viele Anwendungen erweitern lässt.

Im Nachhinein hätte ich wahrscheinlich mit etwas Googeln und dem Unity-Artikel viel schneller herausfinden können, wie Lucids Konfigurator funktioniert. Doch das Reverse-Engineering gab mir einen viel genaueren Einblick in die Herausforderungen, Lösungen und Mechanismen hinter dem Produkt – und ich fühlte mich dabei ein bisschen wie ein Detektiv, der sich von Grund auf vorarbeitet. Am faszinierendsten fand ich jedoch die unglaubliche Komplexität, die wir in der heutigen Technik erreicht haben: Ein extrem realistischer Physiksimulator läuft auf einem entfernten Server in einem Amazon-Rechenzentrum, empfängt Befehle von meinem Computer und streamt das Video nahezu mit Lichtgeschwindigkeit zurück – nur damit ich an einem Autokonfigurator herumspielen kann. Und um zum Mond zu fliegen, reichte uns damals ein Taschenrechner!
