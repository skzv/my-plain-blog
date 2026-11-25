---
layout: post
lang_code: es
locale: es_ES
ref: telegram-stickerly-import-bot
date: 2023-04-05 00:00:00 -0700
last_modified_at: 2023-04-05 00:00
permalink: /es/telegram-stickerly-import-bot
title: "Un bot de Telegram para importar paquetes de Sticker.ly"
imgpath: /assets/img/telegram-stickerly-import-bot
previewurl: /telegram-stickerly-import-bot.png
description: "Un bot de Telegram que creé para importar paquetes animados de Sticker.ly. Envía el enlace de un paquete para convertir sus stickers y añadirlos a tu biblioteca de Telegram."
image: /assets/img/telegram-stickerly-import-bot/og-preview.png
image_width: 1200
image_height: 630
image_alt: "Bot de importación de paquetes de stickers de Sticker.ly para Telegram"
mathjax: false
tags: [ai-tools, systems]
---
{% include description.html content="Importa paquetes animados de Sticker.ly a Telegram con facilidad" %}

<style>
video {
    display: block;
    margin-left: auto;
    margin-right: auto;
    max-width: 100%;
}
</style>

[Sticker.ly](https://sticker.ly) es una popular aplicación para crear y gestionar paquetes de stickers en dispositivos Android y iPhone, con más de 100 millones de descargas solo en [Google Play Store](https://play.google.com/store/apps/details?id=com.snowcorp.stickerly.android&hl=en_US&gl=US). Permite importar paquetes de stickers en iMessage, WhatsApp y Telegram. Sin embargo, la posibilidad de importar paquetes de stickers animados está limitada únicamente a WhatsApp.

<p>
    <video autoplay loop muted playsinline disableRemotePlayback preload="metadata" width="498" height="1034" poster="/assets/video/telegram-stickerly-import-bot/stickerly-animated-import-cropped-poster.webp" style="max-height:600px;width:auto">
        <source src="/assets/video/telegram-stickerly-import-bot/stickerly-animated-import-cropped.mp4" type="video/mp4">
        Tu navegador no admite la etiqueta de vídeo.
    </video>
</p>

Como usuario entusiasta y defensor de Telegram, suelo animar a mis amigos a unirse a la plataforma para comunicarse conmigo. A muchos de ellos les frustra no tener acceso a la enorme biblioteca de stickers disponible en otras plataformas como WhatsApp. Prometí solucionarlo y por fin lo hice. Presento el [Sticker.ly Sticker Pack Import Bot](https://t.me/StickerlyImportBot).

<p>
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="470" height="496" poster="/assets/video/telegram-stickerly-import-bot/stickerly-bot-screen-poster.webp" style="max-height:400px;width:auto">
        <source src="/assets/video/telegram-stickerly-import-bot/stickerly-bot-screen.mp4" type="video/mp4">
        Tu navegador no admite la etiqueta de vídeo.
    </video>
</p>

Para usar el bot, solo tienes que enviarle la URL de un paquete de Sticker.ly, como [https://sticker.ly/s/HBBCR8](https://sticker.ly/s/HBBCR8). El bot convertirá los stickers a un formato animado compatible con Telegram y te devolverá un enlace para añadir el paquete animado a tu biblioteca.

<p>
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="446" height="524" poster="/assets/video/telegram-stickerly-import-bot/stickerly-import-poster.webp" style="max-height:500px;width:auto">
        <source src="/assets/video/telegram-stickerly-import-bot/stickerly-import.mp4" type="video/mp4">
        Tu navegador no admite la etiqueta de vídeo.
    </video>
</p>

Aunque el bot también permite importar paquetes de stickers estáticos, recomiendo no usarlo para eso, ya que Sticker.ly y Telegram admiten de forma nativa la importación de paquetes estáticos sin necesidad de herramientas externas.

Ten en cuenta que el bot está actualmente en fase beta, por lo que pueden producirse algunos fallos. Si tienes problemas al crear un paquete de stickers, vuelve a intentarlo y sigue las instrucciones del propio bot para eliminar un paquete creado parcialmente si fuera necesario.
