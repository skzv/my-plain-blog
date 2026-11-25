---
layout: post
lang_code: zh
locale: zh_CN
ref: telegram-stickerly-import-bot
date: 2023-04-05 00:00:00 -0700
last_modified_at: 2023-04-05 00:00
permalink: /zh/telegram-stickerly-import-bot
title: "用于导入 Sticker.ly 贴纸包的 Telegram 机器人"
imgpath: /assets/img/telegram-stickerly-import-bot
previewurl: /telegram-stickerly-import-bot.png
description: "我开发了一款用于导入 Sticker.ly 动态贴纸包的 Telegram 机器人。只需发送贴纸包链接，即可自动转换格式并添加到你的 Telegram 贴纸库。"
image: /assets/img/telegram-stickerly-import-bot/og-preview.png
image_width: 1200
image_height: 630
image_alt: "用于 Telegram 的 Sticker.ly 贴纸包导入机器人"
mathjax: false
tags: [ai-tools, systems]
---
{% include description.html content="轻松将 Sticker.ly 动态贴纸包导入 Telegram" %}

<style>
video {
    display: block;
    margin-left: auto;
    margin-right: auto;
    max-width: 100%;
}
</style>

[Sticker.ly](https://sticker.ly) 是一款面向 Android 和 iPhone 设备的热门贴纸包制作与管理应用，仅在 [Google Play 商店](https://play.google.com/store/apps/details?id=com.snowcorp.stickerly.android&hl=en_US&gl=US)的下载量就超过了 1 亿次。它支持将贴纸包导入 iMessage、WhatsApp 和 Telegram，不过，导入动态贴纸包的功能却只支持 WhatsApp。

<p>
    <video autoplay loop muted playsinline disableRemotePlayback preload="metadata" width="498" height="1034" poster="/assets/video/telegram-stickerly-import-bot/stickerly-animated-import-cropped-poster.webp" style="max-height:600px;width:auto">
        <source src="/assets/video/telegram-stickerly-import-bot/stickerly-animated-import-cropped.mp4" type="video/mp4">
        您的浏览器不支持 video 标签。
    </video>
</p>

作为 Telegram 的忠实用户和「布道者」，我经常安利朋友来 Telegram 和我聊天。但不少人吐槽 Telegram 缺少像 WhatsApp 那样丰富的贴纸生态。我答应过他们要解决这个问题，现在终于做出来了。隆重推出：[Sticker.ly 贴纸包导入机器人（Sticker.ly Sticker Pack Import Bot）](https://t.me/StickerlyImportBot)！

<p>
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="470" height="496" poster="/assets/video/telegram-stickerly-import-bot/stickerly-bot-screen-poster.webp" style="max-height:400px;width:auto">
        <source src="/assets/video/telegram-stickerly-import-bot/stickerly-bot-screen.mp4" type="video/mp4">
        您的浏览器不支持 video 标签。
    </video>
</p>

使用方法非常简单：只需给机器人发送一个 Sticker.ly 贴纸包链接，例如 [https://sticker.ly/s/HBBCR8](https://sticker.ly/s/HBBCR8)。机器人就会把里面的贴纸转换成 Telegram 兼容的动态格式，并返回一个链接，让你一键将整个动态贴纸包添加到自己的贴纸库中。

<p>
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="446" height="524" poster="/assets/video/telegram-stickerly-import-bot/stickerly-import-poster.webp" style="max-height:500px;width:auto">
        <source src="/assets/video/telegram-stickerly-import-bot/stickerly-import.mp4" type="video/mp4">
        您的浏览器不支持 video 标签。
    </video>
</p>

虽然这款机器人也支持导入静态贴纸包，但我并不建议用它来处理静态贴纸——因为 Sticker.ly 和 Telegram 本身就已经原生支持静态贴纸包导入了。

请注意，该机器人目前仍处于测试（Beta）阶段，偶尔可能会出错。如果在创建贴纸包时遇到问题，请重试一次，并在必要时按照机器人内的提示删除尚未创建完整的贴纸包。
