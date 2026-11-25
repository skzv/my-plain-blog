---
layout: post
lang_code: fr
locale: fr_FR
ref: telegram-stickerly-import-bot
date: 2023-04-05 00:00:00 -0700
last_modified_at: 2023-04-05 00:00
permalink: /fr/telegram-stickerly-import-bot
title: "Un bot Telegram pour importer des packs Sticker.ly"
imgpath: /assets/img/telegram-stickerly-import-bot
previewurl: /telegram-stickerly-import-bot.png
description: "Un bot Telegram que j'ai créé pour importer des packs animés Sticker.ly. Envoyez l'URL d'un pack pour convertir ses autocollants et les ajouter à votre bibliothèque Telegram."
image: /assets/img/telegram-stickerly-import-bot/og-preview.png
image_width: 1200
image_height: 630
image_alt: "Bot d'importation de packs d'autocollants Sticker.ly pour Telegram"
mathjax: false
tags: [ai-tools, systems]
---
{% include description.html content="Importez facilement des packs animés Sticker.ly dans Telegram" %}

<style>
video {
    display: block;
    margin-left: auto;
    margin-right: auto;
    max-width: 100%;
}
</style>

[Sticker.ly](https://sticker.ly) est une application très populaire de création et de gestion de packs d'autocollants pour Android et iPhone, avec plus de 100 millions de téléchargements rien que sur [le Google Play Store](https://play.google.com/store/apps/details?id=com.snowcorp.stickerly.android&hl=en_US&gl=US). Elle permet d'importer des packs d'autocollants dans iMessage, WhatsApp et Telegram. Cependant, l'importation de packs d'autocollants animés est réservée exclusivement à WhatsApp.

<p>
    <video autoplay loop muted playsinline disableRemotePlayback preload="metadata" width="498" height="1034" poster="/assets/video/telegram-stickerly-import-bot/stickerly-animated-import-cropped-poster.webp" style="max-height:600px;width:auto">
        <source src="/assets/video/telegram-stickerly-import-bot/stickerly-animated-import-cropped.mp4" type="video/mp4">
        Votre navigateur ne prend pas en charge la balise vidéo.
    </video>
</p>

Utilisateur passionné et évangéliste de Telegram, j'encourage souvent mes amis à me rejoindre sur la plateforme pour discuter. Beaucoup sont frustrés de ne pas y retrouver la riche bibliothèque d'autocollants disponible sur d'autres messageries comme WhatsApp. J'avais promis de régler le problème, et c'est enfin chose faite. Voici le [Sticker.ly Sticker Pack Import Bot](https://t.me/StickerlyImportBot) :

<p>
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="470" height="496" poster="/assets/video/telegram-stickerly-import-bot/stickerly-bot-screen-poster.webp" style="max-height:400px;width:auto">
        <source src="/assets/video/telegram-stickerly-import-bot/stickerly-bot-screen.mp4" type="video/mp4">
        Votre navigateur ne prend pas en charge la balise vidéo.
    </video>
</p>

Pour utiliser le bot, il suffit de lui envoyer l'URL d'un pack Sticker.ly, par exemple [https://sticker.ly/s/HBBCR8](https://sticker.ly/s/HBBCR8). Le bot convertit alors les autocollants dans un format animé compatible avec Telegram et vous renvoie un lien pour ajouter le pack animé directement à votre bibliothèque.

<p>
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="446" height="524" poster="/assets/video/telegram-stickerly-import-bot/stickerly-import-poster.webp" style="max-height:500px;width:auto">
        <source src="/assets/video/telegram-stickerly-import-bot/stickerly-import.mp4" type="video/mp4">
        Votre navigateur ne prend pas en charge la balise vidéo.
    </video>
</p>

Bien que le bot prenne également en charge l'importation de packs statiques, je vous déconseille de l'utiliser pour cela, puisque Sticker.ly et Telegram gèrent déjà nativement l'importation des packs statiques.

Veuillez noter que le bot est actuellement en version bêta : certaines erreurs peuvent donc survenir. Si vous rencontrez un problème lors de la création d'un pack d'autocollants, réessayez et suivez les instructions du bot pour supprimer un pack partiellement créé si nécessaire.
