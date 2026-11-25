---
layout: post
lang_code: de
locale: de_DE
ref: ccmux-tmux-manager-for-ai-coding-agents
date: 2026-06-05 00:00:00 -0700
last_modified_at: 2026-11-25 00:00
permalink: /de/ccmux-tmux-manager-for-ai-coding-agents
title: "ccmux: KI-Programmieragenten geräteübergreifend verwalten"
imgpath: /assets/img/ccmux
previewurl: /preview.png
description: "Wie ich zusammen mit Freunden ccmux gebaut habe, um KI-Programmieragenten geräteübergreifend mit tmux, Tailscale, Mosh, einem Go-Terminal-Dashboard und einer nativen iOS-App zu verwalten."
image: /assets/img/ccmux/preview.png
image_width: 1200
image_height: 630
image_alt: "ccmux-Dashboard zur Verwaltung von Coding-Agent-Sitzungen"
mathjax: false
tags: [ai-tools, systems]
---

{% include description.html content="Ein tmux-Sitzungsmanager, den ich mit Freunden gebaut habe, um Programmieragenten auf mehreren Rechnern im Blick zu behalten und vom Smartphone aus zu steuern." %}

Normalerweise laufen bei mir rund zehn Programmieragenten gleichzeitig, verteilt auf meinen Mac mini und meinen Laptop. Die Sitzungen mit tmux im Hintergrund am Laufen zu halten, ist an sich einfach genug – das eigentlich Nervige ist, den Überblick über alle zu behalten: sich zu merken, auf welchem Rechner man welche Aufgabe gestartet hat, sich per SSH einzuloggen, um nachzusehen, ob Claude noch arbeitet oder seit einer Stunde bei einer Ja/Nein-Abfrage hängt, und unterwegs keine vernünftige Möglichkeit zum Antworten zu haben.

Was ich mir gewünscht habe, war Folgendes: eine Sitzung auf dem Mac mini starten, weggehen, eine Benachrichtigung aufs Smartphone bekommen, sobald der Agent eine Eingabe braucht, dort kurz antworten und dieselbe Sitzung später am Laptop nahtlos fortsetzen – ohne zwischendurch einen Haufen SSH- und tmux-Befehle eintippen zu müssen.

Also habe ich zusammen mit Daniel Mandragona und Mike Choi [ccmux](https://ccmux.ai/) gebaut, einen geräteübergreifenden tmux-Sitzungsmanager für KI-Programmieragenten. Im Folgenden erkläre ich, wie er funktioniert, wie die einzelnen Teile ineinandergreifen und was wir für mobile Geräte entwickelt haben.

<div style="text-align:center">
  <video autoplay loop muted playsinline disableRemotePlayback preload="metadata" width="1280" height="640" poster="/assets/video/ccmux/hero-poster.webp" style="width:100%;height:auto">
    <source src="/assets/video/ccmux/hero.mp4" type="video/mp4">
    ccmux-Terminaloberfläche mit Coding-Agent-Sitzungen über mehrere Projekte hinweg
  </video>
</div>
{% include caption.html content="Ein kurzer Rundgang durch ccmux mit fünf Agenten-Sitzungen in vier Projekten." %}

## Das Dashboard

Wenn du `ccmux` öffnest, bekommst du eine einzige übersichtliche Liste aller Coding-Agent-Sitzungen, die auf deinen Rechnern laufen – farblich markiert nach dem jeweiligen Status: aktiv (erzeugt gerade Ausgabe), im Leerlauf oder wartet auf deine Eingabe. Auf der rechten Seite gibt es ein Devices-Panel mit den anderen Rechnern in deinem Netzwerk sowie ein Nutzungs-Panel, das Claudes 5-Stunden-Kontingent im Blick behält, damit du siehst, wann du dich dem Limit näherst.

<div style="text-align:center">
  <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1280" height="640" poster="/assets/video/ccmux/dashboard-poster.webp" style="width:100%;height:auto">
    <source src="/assets/video/ccmux/dashboard.mp4" type="video/mp4">
    ccmux-Dashboard mit Sitzungsstatus, verbundenen Geräten und Claude-Nutzung
  </video>
</div>
{% include caption.html content="Das Dashboard. Die Sitzungszeilen sind nach Status farblich kodiert; rechts stehen verbundene Geräte und die Claude-Nutzung." %}

Um in eine beliebige Sitzung einzusteigen, wählst du sie aus und drückst `Enter` – schon bist du direkt an der tmux-Sitzung des Agenten angedockt. Wenn du fertig bist, löst `Ctrl-b d` die Verbindung wieder und bringt dich zurück ins Dashboard, während der Agent auf dem Rechner weiterläuft, auf dem er gestartet wurde.

<div style="text-align:center">
  <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1280" height="640" poster="/assets/video/ccmux/attach-detach-poster.webp" style="width:100%;height:auto">
    <source src="/assets/video/ccmux/attach-detach.mp4" type="video/mp4">
    Andocken an eine tmux-Sitzung und Rückkehr zum ccmux-Dashboard
  </video>
</div>
{% include caption.html content="Mit Enter an eine Sitzung andocken und mit Ctrl-b d wieder zurück ins Dashboard wechseln." %}

<div class="divider"></div>

## Wie es unter der Haube funktioniert

Wir wollten, dass tmux die echte *Source of Truth* bleibt, statt Sitzungen in einem eigenen Wrapper einzusperren. Falls du ccmux irgendwann nicht mehr nutzt, ist jeder laufende Agent weiterhin einfach eine ganz normale tmux-Sitzung, an die du dich von Hand anhängen kannst.

Auf jedem Rechner laufen zwei Go-Binaries:

- `ccmux` ist die Terminal-Oberfläche, mit der du interagierst, gebaut mit dem Bubble-Tea-Stack von [Charm](https://charm.sh/).
- `ccmuxd` ist ein kleiner Hintergrund-Daemon, der alle paar Sekunden tmux abfragt, den Zustand jeder Sitzung ermittelt und diesen über einen lokalen Unix-Socket sowie eine optionale HTTP-API bereitstellt.

Die Zustandserkennung gehört zu den kniffligeren Teilen. Solange ein Agent aktiv Ausgaben streamt, markiert der Daemon ihn als aktiv. Sobald eine Eingabeaufforderung erscheint und das Pane einige Sekunden lang ruhig bleibt, setzt der Daemon die Sitzung auf `needs_input`. Solange Sitzungen aktiv sind, hält `ccmuxd` außerdem einen `caffeinate`-Lock unter macOS (bzw. `systemd-inhibit` unter Linux), damit ein Mac mini oder Laptop nicht mitten in einer längeren Aufgabe in den Ruhezustand geht – auf Laptops inklusive optionaler Akkugrenze, damit sich ein vergessener Rechner nicht komplett entlädt.

Für die Erkennung mehrerer Rechner haben wir [Tailscale](https://tailscale.com/) genutzt. Bei jeder Aktualisierung führt ccmux `tailscale status --json` aus, prüft erreichbare Rechner auf Port `7474` (`/v1/health`) und führt alle antwortenden Daemons automatisch im Dashboard zusammen. So musst du weder eine Host-Liste pflegen noch Ports ins öffentliche Internet freigeben. Da Tailscales WireGuard-Schicht Verschlüsselung und Geräteidentität bereits übernimmt, spricht der Daemon auf der Tailnet-IP einfaches HTTP und weist Anfragen mit Browser-Headern wie `Origin` oder `Sec-Fetch-*` ab, sodass fremde Webseiten nicht mit ihm kommunizieren können.

Wenn du bei einer Remote-Sitzung `Enter` drückst, startet ccmux ein echtes `tmux attach` über SSH oder Mosh direkt auf dem Host, auf dem der Agent läuft, statt das Terminal durch eine weitere Proxy-Schicht zu schleusen. Standardmäßig ist Claude Code voreingestellt, ccmux unterstützt aber auch Codex, Cursor, Antigravity, Gemini CLI und weitere Tools, indem es die Agentenwahl pro Projekt speichert und die jeweiligen Start- und Resume-Flags der Tools nutzt.

<div class="divider"></div>

## Nutzung vom Smartphone aus

Agenten vom Smartphone aus bedienen zu können war überhaupt der Hauptgrund, dieses Projekt zu bauen. Das Problem mit normalem SSH auf dem Handy ist, dass Verbindungen ständig abbrechen – jedes Mal, wenn du zwischen WLAN und Mobilfunk wechselst, den Bildschirm sperrst oder in ein Funkloch läufst. [Mosh](https://mosh.org/) kommt damit viel besser zurecht, weil es Netzwerkwechsel und Ruhezustand übersteht und die Sitzung nahtlos fortsetzt, sobald wieder Empfang da ist.

Erkennt ccmux ein schmales Terminal (unter 120 Spalten), klappt es das Dashboard automatisch zu einer einzigen scrollbaren Spalte zusammen, sodass dieselbe Oberfläche auch auf einem Smartphone-Bildschirm funktioniert:

<div style="text-align:center">
  <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="430" height="900" poster="/assets/video/ccmux/phone-poster.webp" style="max-height:420px;width:auto">
    <source src="/assets/video/ccmux/phone.mp4" type="video/mp4">
    ccmux-Dashboard in einem schmalen mobilen Terminal
  </video>
</div>
{% include caption.html content="Die TUI klappt über Mosh automatisch auf ein Smartphone-Layout zusammen." %}

Benachrichtigungen ließen sich erstaunlich simpel umsetzen. Immer wenn eine Sitzung in den Zustand `needs_input` wechselt, löst der Daemon die Standard-Terminalglocke (`BEL`) aus. iOS-Terminal-Apps, die auf die Glocke achten, machen daraus direkt eine Push-Benachrichtigung – ganz ohne Cloud-Relay dazwischen. In [Moshi](https://getmoshi.app/) – einem Mosh-Client für iOS – kann ccmux zudem `moshi-hook` mit den Hooks von Claude Code verknüpfen, um kategorisierte Benachrichtigungen zu senden (etwa Freigabe erforderlich vs. Aufgabe erledigt), mit denen du per Tipp direkt in die Sitzung springst.

![ccmux in der Moshi-Terminal-App auf einem iPhone]({{ "/moshi.webp" | prepend: page.imgpath }}){: width="610" height="1323" loading="lazy" decoding="async" style="max-height:520px;width:auto"}
{% include caption.html content="ccmux in Moshi auf einem iPhone." %}

Dennoch kann sich die Bedienung einer Terminal-Oberfläche auf einem Smartphone-Display eng anfühlen – besonders, wenn man nur kurz einen Blick auf seine Sitzungen werfen oder einen längeren Prompt tippen möchte. Deshalb haben wir zusätzlich eine native iOS-App gebaut, die direkt über Tailscale mit `ccmuxd` spricht. Ein Smartphone koppelst du, indem du auf deinem Mac `ccmux pair` ausführst und den QR-Code im Terminal scannst. Ab dann streamt die App Live-Sitzungszustände über SSE und verbindet sich mit interaktiven tmux-Panes über eine WebSocket-PTY-Brücke, gerendert mit SwiftTerm.

<div style="text-align:center">
<img src="{{ "/ios-dashboard.webp" | prepend: page.imgpath }}" alt="ccmux-iOS-App mit Übersicht der Coding-Agent-Sitzungen" width="1206" height="2622" loading="lazy" decoding="async" style="display:inline-block;margin:0 6px;max-height:460px;width:auto" //>
<img src="{{ "/ios-terminal.webp" | prepend: page.imgpath }}" alt="Interaktives tmux-Terminal in der ccmux-iOS-App" width="1206" height="2622" loading="lazy" decoding="async" style="display:inline-block;margin:0 6px;max-height:460px;width:auto" //>
</div>
{% include caption.html content="Die native iOS-App: links das Sitzungs-Dashboard, rechts das Live-Terminal." %}

Auf iOS stießen wir schnell auf ein spannendes Detail: Terminal-Bedienung und Prompt-Schreiben verlangen völlig gegensätzliche Tastaturen. Für ein Terminal braucht man rohe Tastenanschläge, Pfeiltasten und schnelles Löschen, ohne dass die Autokorrektur dazwischenfunkt; einen ganzen Absatz an Anweisungen für einen Agenten ohne Autokorrektur oder Textauswahl zu schreiben ist dagegen eine Qual. Deshalb haben wir direkt in der Terminalansicht einen Umschalter eingebaut – zwischen dem Raw-Modus (jeder Tastendruck geht direkt ans PTY) und dem Chat-Modus (ein normales Textfeld im iMessage-Stil zum Verfassen von Prompts).

<div style="text-align:center">
  <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="400" height="870" poster="/assets/video/ccmux/ios-mode-toggle-poster.webp" style="max-height:460px;width:auto">
    <source src="/assets/video/ccmux/ios-mode-toggle.mp4" type="video/mp4">
    Umschalten zwischen Raw- und Chat-Eingabemodus in der ccmux-iOS-App
  </video>
</div>
{% include caption.html content="Umschalten zwischen Raw-Terminaleingabe und Chat-Modus zum Schreiben von Prompts." %}

<div class="divider"></div>

## Schlussbemerkungen

Ich habe ccmux monatelang täglich genutzt, und auch eine Handvoll anderer Leute fing an, es einzusetzen. In denselben Monaten kamen allerdings viele weitere Tools zur Verwaltung von Coding-Agenten auf den Markt, darunter finanzierte Projekte mit Vollzeitteams. Als dreiköpfiges Nebenprojekt ergab es wenig Sinn, damit als Produkt mithalten zu wollen, sodass wir entschieden haben, es nicht weiter in diese Richtung zu treiben. Ich bastele trotzdem gelegentlich noch am Repository und wollte hier festhalten, was wir gebaut haben.

Alles ist weiterhin unter [ccmux.ai](https://ccmux.ai/) erreichbar, und der Quellcode liegt unter FSL-1.1-MIT auf [GitHub](https://github.com/skzv/ccmux). Wenn du es unter macOS oder Linux ausprobieren möchtest, kannst du es mit folgenden Befehlen installieren und den Einrichtungsassistenten starten:

```bash
curl -fsSL https://raw.githubusercontent.com/skzv/ccmux/main/scripts/install.sh | sh
ccmux setup
```

In der [Setup-Dokumentation](https://ccmux.ai/docs/) ist beschrieben, wie du mehrere Rechner über Tailscale verbindest und den mobilen Zugriff einrichtest.
