---
title: A Telegram Bot for Importing Sticker.ly Packs
updated: 2023-04-05 00:00
imgpath: /assets/img/telegram-stickerly-import-bot
previewurl: /telegram-stickerly-import-bot.png
---
{% include description.html content="Import animated Sticker.ly packs into Telegram with ease" %}

<style>
video {
    display: block;
    margin-left: auto;
    margin-right: auto;
    max-width: 100%;
}
</style>

[Sticker.ly](https://sticker.ly) is a popular sticker pack creation and management app for Android and iPhone devices with over 100 million downloads on [the Google Play store](https://play.google.com/store/apps/details?id=com.snowcorp.stickerly.android&hl=en_US&gl=US) alone. It supports importing sticker packs into iMessage, WhatsApp, and Telegram. However, the ability to import animated sticker packs is limited to WhatsApp only.

<p>
    <video autoplay loop muted playsinline height="600">
        <source src="assets/video/telegram-stickerly-import-bot/stickerly-animated-import-cropped.mp4" type="video/mp4">
        Your browser does not support the video tag.
    </video>
</p>

As an avid Telegram user and evangelist, I often encourage my friends to join the platform to communicate with me. Many of them are frustrated by the lack of access to the rich sticker library available on other platforms like WhatsApp.  I promised to fix this, and I finally did. Introducing: the [Sticker.ly Sticker Pack Import Bot](https://t.me/StickerlyImportBot)

<p>
    <video autoplay loop muted playsinline height="400">
        <source src="assets/video/telegram-stickerly-import-bot/stickerly-bot-screen.mp4" type="video/mp4">
        Your browser does not support the video tag.
    </video>
</p>

To use the bot, simply provide a Sticker.ly pack URL, such as [https://sticker.ly/s/HBBCR8](https://sticker.ly/s/HBBCR8). The bot will then convert the stickers into an animated format compatible with Telegram and provide a link for you to add the animated sticker pack to your library.

<p>
    <video autoplay loop muted playsinline height="500">
        <source src="assets/video/telegram-stickerly-import-bot/stickerly-import.mp4" type="video/mp4">
        Your browser does not support the video tag.
    </video>
</p>

Although the bot also supports importing static sticker packs, I recommend against using it for this purpose, since Sticker.ly and Telegram natively support the import of static packs out of the box.

Please note that the bot is currently in beta, so some failures may occur. If you encounter issues with creating a sticker pack, try again and follow the in-bot instructions to delete a partially created sticker pack if necessary.