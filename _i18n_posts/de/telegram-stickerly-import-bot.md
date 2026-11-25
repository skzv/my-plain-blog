---
layout: post
lang_code: de
locale: de_DE
ref: telegram-stickerly-import-bot
date: 2023-04-05 00:00:00 -0700
last_modified_at: 2023-04-05 00:00
permalink: /de/telegram-stickerly-import-bot
title: "Ein Telegram-Bot zum Importieren von Sticker.ly-Paketen"
imgpath: /assets/img/telegram-stickerly-import-bot
previewurl: /telegram-stickerly-import-bot.png
description: "Ein Telegram-Bot, den ich zum Importieren animierter Sticker.ly-Pakete gebaut habe. Sende einfach eine Paket-URL, um die Sticker umzuwandeln und zu Telegram hinzuzufügen."
image: /assets/img/telegram-stickerly-import-bot/og-preview.png
image_width: 1200
image_height: 630
image_alt: "Sticker.ly-Stickerpaket-Import-Bot für Telegram"
mathjax: false
tags: [ai-tools, systems]
---
{% include description.html content="Animierte Sticker.ly-Pakete mühelos in Telegram importieren" %}

<style>
video {
    display: block;
    margin-left: auto;
    margin-right: auto;
    max-width: 100%;
}
</style>

[Sticker.ly](https://sticker.ly) ist eine beliebte App zum Erstellen und Verwalten von Sticker-Paketen für Android und iPhone mit allein im [Google Play Store](https://play.google.com/store/apps/details?id=com.snowcorp.stickerly.android&hl=en_US&gl=US) über 100 Millionen Downloads. Sie unterstützt den Import von Sticker-Paketen in iMessage, WhatsApp und Telegram. Animierte Sticker-Pakete lassen sich damit allerdings ausschließlich in WhatsApp importieren.

<p>
    <video autoplay loop muted playsinline disableRemotePlayback preload="metadata" width="498" height="1034" poster="/assets/video/telegram-stickerly-import-bot/stickerly-animated-import-cropped-poster.webp" style="max-height:600px;width:auto">
        <source src="/assets/video/telegram-stickerly-import-bot/stickerly-animated-import-cropped.mp4" type="video/mp4">
        Dein Browser unterstützt das Video-Tag nicht.
    </video>
</p>

Als begeisterter Telegram-Nutzer und Fürsprecher versuche ich oft, meine Freunde dazu zu bewegen, für unsere Chats zu Telegram zu wechseln. Viele von ihnen sind jedoch frustriert, weil ihnen dort die riesige Sticker-Bibliothek fehlt, die es auf anderen Plattformen wie WhatsApp gibt. Ich habe versprochen, das zu lösen – und es endlich getan. Vorhang auf für den [Sticker.ly Sticker Pack Import Bot](https://t.me/StickerlyImportBot)!

<p>
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="470" height="496" poster="/assets/video/telegram-stickerly-import-bot/stickerly-bot-screen-poster.webp" style="max-height:400px;width:auto">
        <source src="/assets/video/telegram-stickerly-import-bot/stickerly-bot-screen.mp4" type="video/mp4">
        Dein Browser unterstützt das Video-Tag nicht.
    </video>
</p>

Um den Bot zu nutzen, schickst du ihm einfach die URL eines Sticker.ly-Pakets, zum Beispiel [https://sticker.ly/s/HBBCR8](https://sticker.ly/s/HBBCR8). Der Bot wandelt die Sticker anschließend in ein mit Telegram kompatibles animiertes Format um und schickt dir einen Link, über den du das animierte Sticker-Paket direkt zu deiner Sammlung hinzufügen kannst.

<p>
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="446" height="524" poster="/assets/video/telegram-stickerly-import-bot/stickerly-import-poster.webp" style="max-height:500px;width:auto">
        <source src="/assets/video/telegram-stickerly-import-bot/stickerly-import.mp4" type="video/mp4">
        Dein Browser unterstützt das Video-Tag nicht.
    </video>
</p>

Zwar unterstützt der Bot auch den Import statischer Sticker-Pakete, ich rate davon aber ab, da Sticker.ly und Telegram den Import statischer Pakete bereits von Haus aus unterstützen.

Bitte beachte, dass sich der Bot derzeit noch in der Beta-Phase befindet und es daher gelegentlich zu Fehlern kommen kann. Falls beim Erstellen eines Sticker-Pakets ein Problem auftritt, probiere es einfach erneut und folge bei Bedarf den Anweisungen im Bot, um ein nur teilweise erstelltes Sticker-Paket wieder zu löschen.
