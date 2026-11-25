---
layout: post
lang_code: pt-br
locale: pt_BR
ref: telegram-stickerly-import-bot
date: 2023-04-05 00:00:00 -0700
last_modified_at: 2023-04-05 00:00
permalink: /pt-br/telegram-stickerly-import-bot
title: "Um bot do Telegram para importar pacotes do Sticker.ly"
imgpath: /assets/img/telegram-stickerly-import-bot
previewurl: /telegram-stickerly-import-bot.png
description: "Um bot do Telegram que criei para importar pacotes animados do Sticker.ly. Envie o link de um pacote para converter as figurinhas e adicioná-las à sua biblioteca do Telegram."
image: /assets/img/telegram-stickerly-import-bot/og-preview.png
image_width: 1200
image_height: 630
image_alt: "Bot de importação de pacotes de figurinhas do Sticker.ly para o Telegram"
mathjax: false
tags: [ai-tools, systems]
---
{% include description.html content="Importe pacotes animados do Sticker.ly para o Telegram com facilidade" %}

<style>
video {
    display: block;
    margin-left: auto;
    margin-right: auto;
    max-width: 100%;
}
</style>

O [Sticker.ly](https://sticker.ly) é um aplicativo popular para criar e gerenciar pacotes de figurinhas em dispositivos Android e iPhone, com mais de 100 milhões de downloads só na [Google Play Store](https://play.google.com/store/apps/details?id=com.snowcorp.stickerly.android&hl=en_US&gl=US). Ele permite importar pacotes de figurinhas para o iMessage, WhatsApp e Telegram. No entanto, a importação de pacotes de figurinhas animadas é limitada apenas ao WhatsApp.

<p>
    <video autoplay loop muted playsinline disableRemotePlayback preload="metadata" width="498" height="1034" poster="/assets/video/telegram-stickerly-import-bot/stickerly-animated-import-cropped-poster.webp" style="max-height:600px;width:auto">
        <source src="/assets/video/telegram-stickerly-import-bot/stickerly-animated-import-cropped.mp4" type="video/mp4">
        Seu navegador não suporta a tag de vídeo.
    </video>
</p>

Como usuário assíduo e entusiasta do Telegram, vivo incentivando meus amigos a entrarem na plataforma para conversar comigo. Muitos deles ficam frustrados por não terem acesso à rica biblioteca de figurinhas disponível em outras plataformas, como o WhatsApp. Prometi resolver isso e finalmente cumpri. Apresento o [Sticker.ly Sticker Pack Import Bot](https://t.me/StickerlyImportBot).

<p>
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="470" height="496" poster="/assets/video/telegram-stickerly-import-bot/stickerly-bot-screen-poster.webp" style="max-height:400px;width:auto">
        <source src="/assets/video/telegram-stickerly-import-bot/stickerly-bot-screen.mp4" type="video/mp4">
        Seu navegador não suporta a tag de vídeo.
    </video>
</p>

Para usar o bot, basta enviar a URL de um pacote do Sticker.ly, como [https://sticker.ly/s/HBBCR8](https://sticker.ly/s/HBBCR8). O bot converterá as figurinhas para um formato animado compatível com o Telegram e enviará um link para você adicionar o pacote animado à sua biblioteca.

<p>
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="446" height="524" poster="/assets/video/telegram-stickerly-import-bot/stickerly-import-poster.webp" style="max-height:500px;width:auto">
        <source src="/assets/video/telegram-stickerly-import-bot/stickerly-import.mp4" type="video/mp4">
        Seu navegador não suporta a tag de vídeo.
    </video>
</p>

Embora o bot também suporte a importação de pacotes estáticos, recomendo não usá-lo para esse fim, já que o Sticker.ly e o Telegram oferecem suporte nativo para importar pacotes estáticos direto da caixa.

Observe que o bot ainda está em fase beta, então algumas falhas podem acontecer. Se você tiver problemas ao criar um pacote de figurinhas, tente novamente e siga as instruções do próprio bot para excluir um pacote criado parcialmente, caso necessário.
