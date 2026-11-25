---
layout: post
lang_code: de
locale: de_DE
ref: predicting-how-the-market-will-open-tomorrow
date: 2025-03-23 00:00:00 -0700
last_modified_at: 2025-03-23 00:00
permalink: /de/predicting-how-the-market-will-open-tomorrow
title: "Vorhersagen, wie die Börse morgen eröffnet"
imgpath: /assets/img/predicting-market-open
previewurl: /preview.png
description: "Wie sich mit Index-Futures, risikofreiem Zins und Dividendenrendite der nächste Börsenstart abschätzen lässt – inklusive Cost-of-Carry-Rechnung und meinem Dashboard impliedopen.com."
image: /assets/img/predicting-market-open/og-preview.png
image_width: 1200
image_height: 630
image_alt: "Dashboard für den impliziten Börseneröffnungskurs"
mathjax: true
tags: [quant-finance]
---

_Die Zukunft vorhersagen_

An einem Wochenende gab es schlechte Wirtschaftsnachrichten, und ich fragte mich, wie sich das am Montag zur Börseneröffnung auswirken würde. Ich ging der Frage nach und lernte: Während der reguläre Aktienmarkt geschlossen ist, läuft der Futures-Handel auf die zugrunde liegenden Indizes weiter – und ein Blick auf den Futures-Markt zeigt uns, wie Händler bereits auf neue Informationen reagieren und sie einpreisen, fast wie eine Kristallkugel 🔮.

Da Futures-Preise und aktuelle Kassakurse direkt zusammenhängen, können wir berechnen, welchen aktuellen Fair Value die Futures-Märkte für jeden Index ansetzen, indem wir den künftigen Wert zeitlich zurückdiskontieren. Das liefert uns den impliziten Eröffnungskurs jedes Index noch vor Handelsbeginn – so lässt sich schon am Sonntagabend abschätzen, ob der Markt am nächsten Tag voraussichtlich <span style="color: #66ff66;">höher</span> oder <span style="color: #ff6666;">tiefer</span> eröffnet.

Im Folgenden gehe ich alle Bausteine dieser Berechnung durch – bis hin zu einem Dashboard, das ich gebaut habe und das unter [impliedopen.com](https://impliedopen.com) eine Vorschau auf die Eröffnungsbewegungen des nächsten Handelstags liefert.


![Vorschau auf das von mir gebaute Dashboard für die voraussichtlichen Marktbewegungen am nächsten Tag]({{ "/save-game.webp" | prepend: page.imgpath }}){: width="1168" height="1312" fetchpriority="high" decoding="async"}
{% include caption.html content="Eine Vorschau auf das von mir gebaute Dashboard, das einen Ausblick auf die Marktbewegungen des nächsten Tages gibt." %}

## Futures

Futures (Terminkontrakte) sind Finanzinstrumente, mit denen Händler auf den *künftigen* Preis eines Basiswerts zum Verfallsdatum des Kontrakts setzen können. Schau dir unten den Kurs und das Verfallsdatum des S&P-500-Futures an. Er notiert aktuell höher als der S&P-500-Index selbst – aber was sagt uns das über den derzeitigen Wert des S&P 500?

Um den Futures-Preis mit dem aktuellen Fair Value zu verknüpfen, den der Futures-Markt einpreist, müssen wir die Zeitspanne zwischen heute und dem Verfallsdatum des Futures berücksichtigen.

![S&P-500-Futures-Kontrakt]({{ "/futures-price.webp" | prepend: page.imgpath }}){: width="943" height="826" loading="lazy" decoding="async"}
{% include caption.html content="S&P-500-Futures-Kontrakt" %}

Dazu nutzen wir das Cost-of-Carry-Modell, das den risikofreien Zinssatz, die Dividendenrendite und die Restlaufzeit einbezieht. Es geht davon aus, dass der Wert des Index mit dem aktuellen risikofreien Zinssatz wächst (im Kern eine No-Arbitrage-Annahme), abzüglich der Kursabschläge durch ausgeschüttete Dividenden.

Wir können diesen Zusammenhang so ausdrücken:

{% include math.html content=
"
\begin{align}
    F = S \times e^{(r - q) \times t} \tag{0}  \label{eq:coc}
\end{align}
"
 %}

wobei $$F$$ der Futures-Preis, $$S$$ der aktuelle Kassakurs des Index, $$r$$ der risikofreie Zinssatz, $$q$$ die Dividendenrendite und $$t$$ die Restlaufzeit ist.

## Zurück in der Zeit

Um aus dem Futures-Preis den aktuellen Fair Value des Index zu berechnen, diskontieren wir den Futures-Preis einfach zeitlich zurück, indem wir die obige Formel umstellen:

{% include math.html content=
"
\begin{align}
    S = F \times e^{-(r - q) \times t} \tag{1}  \label{eq:discount}
\end{align}
"
 %}

Vor Börseneröffnung ist dieser Fair Value unsere beste Schätzung für den Eröffnungskurs des Index.

## Risikofreier Zinssatz

Gibt es überhaupt eine risikofreie Anlage? Nun, US-Treasury-Bills (kurzlaufende US-Staatsanleihen) gelten als (nahezu) risikolos, und zwar aus folgenden Gründen:
- Die US-Regierung hat ein sehr geringes Ausfallrisiko; sie kann ihre eigene Währung drucken und blickt auf eine verlässliche Zahlungshistorie zurück.
- Die kurze Laufzeit begrenzt die Anfälligkeit gegenüber Zinsänderungen und langfristigen Unsicherheiten.
- Der Markt ist extrem liquide.
- Es gibt praktisch kein Kreditrisiko, da die US-Regierung nicht wie ein Unternehmen oder eine Kommune insolvent geht.

Als risikofreien Zinssatz für diese Berechnungen verwende ich die Rendite der 3-monatigen US-Treasury-Bill.

![Rendite der 3-monatigen US-Staatsanleihe]({{ "/3m-bond-yield-1.png" | prepend: page.imgpath }}){: width="993" height="633" loading="lazy" decoding="async"}
{% include caption.html content="Rendite der 3-monatigen US-Staatsanleihe (3 Month US Treasury Yield)" %}

Wir nehmen an, dass die zugrunde liegenden Anlagen mindestens mit dem risikofreien Zinssatz wachsen, da Anleger ihr Geld sonst gar nicht erst in diese Instrumente investieren würden.

## Dividendenrendite

Während wir davon ausgehen, dass die Basiswerte mindestens mit dem risikofreien Zinssatz zulegen, müssen wir berücksichtigen, dass die zugrunde liegenden Indizes bei Dividendenzahlungen um einen entsprechenden Betrag fallen. Dafür verwende ich die jeweils aktuellste Dividendenrendite des Index – ein noch genaueres Modell würde wohl versuchen, die künftig erwartete Dividendenrendite zu schätzen.

Unten siehst du die aktuelle Dividendenrendite des S&P 500, die ich für meine Berechnungen nutze.

![Aktuelle Dividendenrendite des S&P 500]({{ "/sp500-dividend-yield.png" | prepend: page.imgpath }}){: width="873" height="641" loading="lazy" decoding="async"}
{% include caption.html content="Aktuelle Dividendenrendite des S&P 500" %}

## Alles zusammenführen

Ich sammle den letzten Indexkurs, den aktuell gehandelten Futures-Preis, meine beste Schätzung für die Dividendenrendite, den risikofreien Zinssatz sowie die Restlaufzeit und berechne daraus den aktuellen Fair Value für jeden wichtigen Index. Alle Bausteine zusammen findest du auf [impliedopen.com](https://impliedopen.com), direkt hier eingebettet:

<iframe src="https://impliedopen.com" title="Implied-Open-Marktdashboard" width="100%" height="1200px"></iframe>

Am nützlichsten ist dieses Dashboard dann, wenn der Futures-Markt geöffnet, die reguläre Börse aber geschlossen ist – so können wir anhand der Futures ablesen, was Händler noch vor dem regulären Handelsstart einpreisen. Sobald der reguläre Markt geöffnet hat, liefert er selbst den „wahren“ aktuellen Wert jedes Index – direkt vom Markt gepreist.

![Marktstatus-Ansicht]({{ "/market-status.png" | prepend: page.imgpath }}){: width="751" height="159" loading="lazy" decoding="async"}
{% include caption.html content="Marktstatus-Ansicht" %}

## Schlussbemerkungen

Ich habe dieses Dashboard ziemlich schnell zusammengebaut und dabei schlicht viele Werte gescrapt, die ich einmal pro Minute über meine eigene API zwischenspeichere :) Entschuldigung im Voraus, falls etwas kaputtgeht oder ausfällt – irgendwann werde ich das durch richtige APIs ersetzen, oder das Dashboard erledigt sich von selbst, sobald die Börsen auf 24/7-Handel umstellen. So oder so wollte ich das Ganze in diesem Blogbeitrag festhalten.

![Es ist, wie es ist.]({{ "/it-is-what-it-is.png" | prepend: page.imgpath }}){: width="690" height="365" loading="lazy" decoding="async"}
{% include caption.html content="Es ist, wie es ist." %}

Wenn dir Fehler in meinen Berechnungen auffallen oder du Verbesserungsvorschläge oder sonstiges Feedback hast, melde dich gerne bei mir!
