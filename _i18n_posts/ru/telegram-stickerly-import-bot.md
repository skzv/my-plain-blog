---
layout: post
lang_code: ru
locale: ru_RU
ref: telegram-stickerly-import-bot
date: 2023-04-05 00:00:00 -0700
last_modified_at: 2023-04-05 00:00
permalink: /ru/telegram-stickerly-import-bot
title: "Telegram-бот для импорта стикерпаков из Sticker.ly"
imgpath: /assets/img/telegram-stickerly-import-bot
previewurl: /telegram-stickerly-import-bot.png
description: "Telegram-бот для импорта анимированных стикерпаков из Sticker.ly. Отправьте ссылку на набор — бот сконвертирует стикеры и добавит их в вашу библиотеку Telegram."
image: /assets/img/telegram-stickerly-import-bot/og-preview.png
image_width: 1200
image_height: 630
image_alt: "Бот для импорта стикерпаков Sticker.ly в Telegram"
mathjax: false
tags: [ai-tools, systems]
---
{% include description.html content="Импортируйте анимированные стикерпаки из Sticker.ly в Telegram без лишних хлопот" %}

<style>
video {
    display: block;
    margin-left: auto;
    margin-right: auto;
    max-width: 100%;
}
</style>

[Sticker.ly](https://sticker.ly) — популярное приложение для создания и управления стикерпаками на Android и iPhone, набравшее более 100 миллионов загрузок только в [Google Play](https://play.google.com/store/apps/details?id=com.snowcorp.stickerly.android&hl=en_US&gl=US). Оно поддерживает импорт стикерпаков в iMessage, WhatsApp и Telegram. Однако импорт *анимированных* стикерпаков доступен только для WhatsApp.

<p>
    <video autoplay loop muted playsinline disableRemotePlayback preload="metadata" width="498" height="1034" poster="/assets/video/telegram-stickerly-import-bot/stickerly-animated-import-cropped-poster.webp" style="max-height:600px;width:auto">
        <source src="/assets/video/telegram-stickerly-import-bot/stickerly-animated-import-cropped.mp4" type="video/mp4">
        Ваш браузер не поддерживает тег video.
    </video>
</p>

Как давний пользователь и энтузиаст Telegram, я часто уговариваю друзей перейти на эту платформу, чтобы общаться со мной. Многих из них расстраивает отсутствие доступа к богатой библиотеке стикеров, к которой они привыкли в других мессенджерах вроде WhatsApp. Я пообещал это исправить — и наконец сделал. Встречайте: [Sticker.ly Sticker Pack Import Bot](https://t.me/StickerlyImportBot).

<p>
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="470" height="496" poster="/assets/video/telegram-stickerly-import-bot/stickerly-bot-screen-poster.webp" style="max-height:400px;width:auto">
        <source src="/assets/video/telegram-stickerly-import-bot/stickerly-bot-screen.mp4" type="video/mp4">
        Ваш браузер не поддерживает тег video.
    </video>
</p>

Чтобы воспользоваться ботом, просто отправьте ему ссылку на набор Sticker.ly, например [https://sticker.ly/s/HBBCR8](https://sticker.ly/s/HBBCR8). Бот сконвертирует стикеры в анимированный формат, совместимый с Telegram, и пришлёт ссылку, по которой вы сможете добавить готовый стикерпак к себе.

<p>
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="446" height="524" poster="/assets/video/telegram-stickerly-import-bot/stickerly-import-poster.webp" style="max-height:500px;width:auto">
        <source src="/assets/video/telegram-stickerly-import-bot/stickerly-import.mp4" type="video/mp4">
        Ваш браузер не поддерживает тег video.
    </video>
</p>

Хотя бот поддерживает и статичные стикерпаки, для них я не советую его использовать: Sticker.ly и Telegram умеют импортировать статичные наборы напрямую «из коробки».

Обратите внимание, что бот сейчас находится в бета-версии, поэтому иногда возможны сбои. Если при создании стикерпака возникла ошибка, просто попробуйте ещё раз и при необходимости следуйте инструкциям бота, чтобы удалить частично созданный набор.
