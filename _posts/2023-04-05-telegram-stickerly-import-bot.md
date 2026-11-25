---
title: A Telegram Bot for Importing Sticker.ly Packs
last_modified_at: 2026-11-25 00:00
imgpath: /assets/img/telegram-stickerly-import-bot
previewurl: /telegram-stickerly-import-bot.png
description: "A Telegram bot I built to import animated Sticker.ly packs. Send a pack URL to convert its stickers and add them to your Telegram library."
image: /assets/img/telegram-stickerly-import-bot/og-preview.png
image_width: 1200
image_height: 630
image_alt: "Sticker.ly sticker pack import bot for Telegram"
tags: [ai-tools, systems]
mathjax: false
---
{% include description.html content="Import animated Sticker.ly packs into Telegram with ease" %}

<style>
video {
    display: block;
    margin-left: auto;
    margin-right: auto;
    max-width: 100%;
    height: auto;
}
</style>

[Sticker.ly](https://sticker.ly) is a popular sticker pack creation and management app for Android and iPhone devices with over 100 million downloads on [the Google Play store](https://play.google.com/store/apps/details?id=com.snowcorp.stickerly.android&hl=en_US&gl=US) alone. It supports importing sticker packs into iMessage, WhatsApp, and Telegram. However, the ability to import animated sticker packs is limited to WhatsApp only.

<p>
    <video autoplay loop muted playsinline disableRemotePlayback preload="metadata" width="498" height="1034" poster="/assets/video/telegram-stickerly-import-bot/stickerly-animated-import-cropped-poster.webp" style="max-height:600px;width:auto">
        <source src="/assets/video/telegram-stickerly-import-bot/stickerly-animated-import-cropped.mp4" type="video/mp4">
        Your browser does not support the video tag.
    </video>
</p>

As an avid Telegram user and evangelist, I often encourage my friends to join the platform to communicate with me. Many of them are frustrated by the lack of access to the rich sticker library available on other platforms like WhatsApp. I promised to fix this, and I finally did. Introducing: the [Sticker.ly Sticker Pack Import Bot](https://t.me/StickerlyImportBot) (also listed with quick instructions at [stickers.skz.dev](https://stickers.skz.dev/)).

<p>
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="470" height="496" poster="/assets/video/telegram-stickerly-import-bot/stickerly-bot-screen-poster.webp" style="max-height:400px;width:auto">
        <source src="/assets/video/telegram-stickerly-import-bot/stickerly-bot-screen.mp4" type="video/mp4">
        Your browser does not support the video tag.
    </video>
</p>

## How It Works

To use the bot, open [@StickerlyImportBot](https://t.me/StickerlyImportBot) in Telegram and send a Sticker.ly pack URL, such as [https://sticker.ly/s/HBBCR8](https://sticker.ly/s/HBBCR8). The bot fetches the pack, converts the animated stickers into a video-sticker format compatible with Telegram's Bot API requirements, registers the pack, and replies with a direct link to add the animated sticker pack to your Telegram library.

<p>
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="446" height="524" poster="/assets/video/telegram-stickerly-import-bot/stickerly-import-poster.webp" style="max-height:500px;width:auto">
        <source src="/assets/video/telegram-stickerly-import-bot/stickerly-import.mp4" type="video/mp4">
        Your browser does not support the video tag.
    </video>
</p>

## Animated vs. Static Packs

Although the bot also supports importing static sticker packs, I recommend against using it for static packs, since Sticker.ly and Telegram already support exporting static packs natively out of the box. The bot is most useful for animated packs that Sticker.ly restricts to WhatsApp.

## Troubleshooting and Limits

The bot is free to use at [t.me/StickerlyImportBot](https://t.me/StickerlyImportBot) and [stickers.skz.dev](https://stickers.skz.dev/). Because conversion depends on upstream pack links and Telegram's sticker rate limits, occasional failures can occur on very large packs. If a sticker pack only partially uploads, follow the in-bot instructions to remove the incomplete pack and send the Sticker.ly URL again.