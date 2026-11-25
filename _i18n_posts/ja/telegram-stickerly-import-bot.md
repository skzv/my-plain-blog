---
layout: post
lang_code: ja
locale: ja_JP
ref: telegram-stickerly-import-bot
date: 2023-04-05 00:00:00 -0700
last_modified_at: 2023-04-05 00:00
permalink: /ja/telegram-stickerly-import-bot
title: "Sticker.ly のスタンプパックをインポートする Telegram Bot"
imgpath: /assets/img/telegram-stickerly-import-bot
previewurl: /telegram-stickerly-import-bot.png
description: "アニメーション付き Sticker.ly スタンプパックを Telegram に取り込む自作 Bot の紹介。パックの URL を送るだけで変換し、自分の Telegram ライブラリに追加できます。"
image: /assets/img/telegram-stickerly-import-bot/og-preview.png
image_width: 1200
image_height: 630
image_alt: "Telegram 向けの Sticker.ly スタンプパックインポート Bot"
mathjax: false
tags: [ai-tools, systems]
---
{% include description.html content="アニメーション付き Sticker.ly パックを簡単に Telegram へインポート" %}

<style>
video {
    display: block;
    margin-left: auto;
    margin-right: auto;
    max-width: 100%;
}
</style>

[Sticker.ly](https://sticker.ly) は Android および iPhone 向けの人気スタンプパック作成・管理アプリで、[Google Play ストア](https://play.google.com/store/apps/details?id=com.snowcorp.stickerly.android&hl=en_US&gl=US)だけでも1億ダウンロードを超えています。iMessage、WhatsApp、Telegram へのスタンプパックのインポートに対応していますが、アニメーションスタンプパックのインポート機能は WhatsApp のみに限定されています。

<p>
    <video autoplay loop muted playsinline disableRemotePlayback preload="metadata" width="498" height="1034" poster="/assets/video/telegram-stickerly-import-bot/stickerly-animated-import-cropped-poster.webp" style="max-height:600px;width:auto">
        <source src="/assets/video/telegram-stickerly-import-bot/stickerly-animated-import-cropped.mp4" type="video/mp4">
        お使いのブラウザは video タグに対応していません。
    </video>
</p>

熱心な Telegram ユーザーであり布教者でもある私は、やり取りのために友人たちによく Telegram への移行を勧めています。しかし友人の多くは、WhatsApp など他プラットフォームにある豊富なスタンプライブラリが使えないことに不満を感じていました。私はそれを解決すると約束し、ついにやり遂げました。ご紹介します：[Sticker.ly Sticker Pack Import Bot](https://t.me/StickerlyImportBot) です。

<p>
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="470" height="496" poster="/assets/video/telegram-stickerly-import-bot/stickerly-bot-screen-poster.webp" style="max-height:400px;width:auto">
        <source src="/assets/video/telegram-stickerly-import-bot/stickerly-bot-screen.mp4" type="video/mp4">
        お使いのブラウザは video タグに対応していません。
    </video>
</p>

使い方は簡単で、[https://sticker.ly/s/HBBCR8](https://sticker.ly/s/HBBCR8) のような Sticker.ly のパック URL を送るだけです。すると Bot がスタンプを Telegram 対応のアニメーション形式に変換し、アニメーションスタンプパックをライブラリに追加するためのリンクを返してくれます。

<p>
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="446" height="524" poster="/assets/video/telegram-stickerly-import-bot/stickerly-import-poster.webp" style="max-height:500px;width:auto">
        <source src="/assets/video/telegram-stickerly-import-bot/stickerly-import.mp4" type="video/mp4">
        お使いのブラウザは video タグに対応していません。
    </video>
</p>

なお、この Bot は静止画スタンプパックのインポートにも対応していますが、静止画パックについては Sticker.ly と Telegram が標準でインポートに対応しているため、そちらを使うことをおすすめします。

現在この Bot はベータ版のため、まれに失敗することがあります。スタンプパックの作成時に問題が発生した場合はもう一度試し、必要に応じて Bot 内の案内に従って途中まで作成されたスタンプパックを削除してください。
