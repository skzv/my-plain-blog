---
layout: post
lang_code: ko
locale: ko_KR
ref: telegram-stickerly-import-bot
date: 2023-04-05 00:00:00 -0700
last_modified_at: 2023-04-05 00:00
permalink: /ko/telegram-stickerly-import-bot
title: "Sticker.ly 스티커 팩을 가져오는 텔레그램 봇"
imgpath: /assets/img/telegram-stickerly-import-bot
previewurl: /telegram-stickerly-import-bot.png
description: "움직이는 Sticker.ly 스티커 팩을 텔레그램으로 가져오기 위해 만든 봇을 소개합니다. 팩 URL만 보내면 스티커를 변환해 텔레그램 라이브러리에 바로 추가할 수 있습니다."
image: /assets/img/telegram-stickerly-import-bot/og-preview.png
image_width: 1200
image_height: 630
image_alt: "텔레그램용 Sticker.ly 스티커 팩 가져오기 봇"
mathjax: false
tags: [ai-tools, systems]
---
{% include description.html content="움직이는 Sticker.ly 스티커 팩을 텔레그램으로 손쉽게 가져오기" %}

<style>
video {
    display: block;
    margin-left: auto;
    margin-right: auto;
    max-width: 100%;
}
</style>

[Sticker.ly](https://sticker.ly)는 [Google Play 스토어](https://play.google.com/store/apps/details?id=com.snowcorp.stickerly.android&hl=en_US&gl=US)에서만 1억 회 이상 다운로드된 인기 있는 Android 및 iPhone용 스티커 팩 제작·관리 앱입니다. 만든 스티커 팩을 iMessage, WhatsApp, Telegram으로 내보내는 기능을 지원하지만, 아쉽게도 움직이는(애니메이션) 스티커 팩 가져오기는 WhatsApp에서만 지원됩니다.

<p>
    <video autoplay loop muted playsinline disableRemotePlayback preload="metadata" width="498" height="1034" poster="/assets/video/telegram-stickerly-import-bot/stickerly-animated-import-cropped-poster.webp" style="max-height:600px;width:auto">
        <source src="/assets/video/telegram-stickerly-import-bot/stickerly-animated-import-cropped.mp4" type="video/mp4">
        브라우저가 video 태그를 지원하지 않습니다.
    </video>
</p>

열렬한 텔레그램 사용자이자 전도사로서, 저는 친구들에게 저와 연락할 때 텔레그램을 써 보라고 자주 권하곤 합니다. 그런데 많은 친구들이 WhatsApp 같은 다른 메신저에서 쓰던 풍부한 스티커 라이브러리를 그대로 쓸 수 없다는 점에 아쉬워하더군요. 이 문제를 해결해 주겠다고 약속했는데, 드디어 해냈습니다. [Sticker.ly Sticker Pack Import Bot](https://t.me/StickerlyImportBot)을 소개합니다!

<p>
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="470" height="496" poster="/assets/video/telegram-stickerly-import-bot/stickerly-bot-screen-poster.webp" style="max-height:400px;width:auto">
        <source src="/assets/video/telegram-stickerly-import-bot/stickerly-bot-screen.mp4" type="video/mp4">
        브라우저가 video 태그를 지원하지 않습니다.
    </video>
</p>

사용 방법은 간단합니다. [https://sticker.ly/s/HBBCR8](https://sticker.ly/s/HBBCR8) 같은 Sticker.ly 팩 URL을 봇에게 보내기만 하면 됩니다. 그러면 봇이 스티커들을 텔레그램과 호환되는 애니메이션 형식으로 변환한 뒤, 움직이는 스티커 팩을 내 라이브러리에 바로 추가할 수 있는 링크를 보내 줍니다.

<p>
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="446" height="524" poster="/assets/video/telegram-stickerly-import-bot/stickerly-import-poster.webp" style="max-height:500px;width:auto">
        <source src="/assets/video/telegram-stickerly-import-bot/stickerly-import.mp4" type="video/mp4">
        브라우저가 video 태그를 지원하지 않습니다.
    </video>
</p>

이 봇은 정지 이미지 스티커 팩 가져오기도 지원하지만, 정지 스티커 팩은 Sticker.ly와 텔레그램이 이미 기본적으로 가져오기를 지원하므로 굳이 이 봇을 쓰실 필요는 없습니다.

현재 이 봇은 베타 버전이라 간혹 오류가 발생할 수 있습니다. 스티커 팩 생성 중 문제가 생기면 다시 시도해 보시고, 필요하다면 봇의 안내에 따라 일부만 생성된 스티커 팩을 삭제한 뒤 진행해 주세요.
