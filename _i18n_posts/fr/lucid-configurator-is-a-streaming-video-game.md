---
layout: post
lang_code: fr
locale: fr_FR
ref: lucid-configurator-is-a-streaming-video-game
date: 2021-07-28 00:00:00 -0700
last_modified_at: 2021-07-28 00:00
permalink: /fr/lucid-configurator-is-a-streaming-video-game
title: "Le configurateur de Lucid Motors est un jeu vidéo diffusé en streaming dans votre navigateur"
imgpath: /assets/img/lucid-configurator-is-a-streaming-video-game
previewurl: /lucid-configurator.png
description: "Comment le configurateur automobile de Lucid Motors utilise Unity, le rendu dans le cloud et WebRTC pour diffuser un showroom 3D interactif dans votre navigateur."
image: /assets/img/lucid-configurator-is-a-streaming-video-game/lucid-configurator.png
image_width: 1958
image_height: 845
image_alt: "Configurateur automobile 3D interactif de Lucid Motors"
mathjax: false
tags: [computer-vision, 3d-graphics, systems]
---

{% include description.html content="Tout s'éclaire quand on réalise que les moteurs de jeu vidéo sont les meilleurs simulateurs qui existent." %}

## Une solution ingénieuse

[Lucid Motors est entrée en bourse lundi](https://www.barrons.com/articles/lucid-churchill-merger-ipo-ev-51627308359), et même si je ne compte pas acheter de Lucid de sitôt, je me suis retrouvé à explorer [leur configurateur de véhicule](https://www.lucidmotors.com/air/configure/) par curiosité. C'est une véritable œuvre d'art. Il permet d'observer et d'interagir avec la voiture sous presque tous les angles, à l'extérieur comme à l'intérieur :

{% include video.html content="https://streamable.com/e/cudr66" %}
<p class="caption video-caption">Le configurateur de Lucid pour leur modèle phare haut de gamme, la Lucid Air Dream.</p>

On peut tester différentes teintes et finitions, ouvrir et fermer les portières, et même escamoter l'écran de la console centrale. Le pont du Golden Gate en arrière-plan se reflète dans les flaques d'eau lisses comme un miroir. Le configurateur restitue une foule de détails du véhicule, jusqu'aux lumières sous les poignées de porte qui s'allument quand on les actionne. J'ai l'impression de m'être fait une idée tellement précise de la voiture que je n'ai même plus besoin d'aller la voir en vrai.

Mais comment Lucid a-t-elle réussi ce tour de force ? Peut-on vraiment attendre du navigateur web d'un utilisateur moyen qu'il effectue en temps réel le rendu d'une telle scène, reflets compris ? Probablement pas. Si cela fonctionne, c'est parce que la scène que vous voyez est calculée par Unity — un moteur de jeu vidéo — qui tourne dans le cloud, déportant la lourde charge de calcul sur un serveur Amazon, avant d'être diffusée en streaming vers votre navigateur via WebRTC, un protocole de streaming vidéo pair-à-pair.

<div class="divider"></div>

## Le modèle

Au départ, j'avais naïvement supposé que le modèle était rendu directement dans mon navigateur via la dernière [bibliothèque WebGL](https://en.wikipedia.org/wiki/WebGL) (une API de rendu graphique 2D et 3D avec accélération matérielle dans les navigateurs web). Et puisque le modèle devait être rendu localement, il devait forcément résider quelque part dans ma RAM, ce qui m'aurait permis de l'extraire et de l'ouvrir dans un éditeur 3D. En particulier, je voulais voir si je pouvais retirer les pare-soleil qui interrompent le pare-brise panoramique presque continu — un effet que Tesla a réussi sur le Model X, et je ne comprends pas bien pourquoi Lucid n'a pas suivi la même voie.

![Pare-soleil de la Lucid Air interrompant la verrière panoramique]({{ "/lucid-air-sun-visors.webp" | prepend: page.imgpath }}){: width="1600" height="994" loading="lazy" decoding="async"}
{% include caption.html content="Les pare-soleil de la Lucid Air qui viennent interrompre la verrière panoramique." %}

J'ai donc plongé dans le code. Après un moment passé dans les outils de développement du navigateur, à parcourir des milliers de lignes de JavaScript minifié, à enregistrer et examiner les requêtes réseau entre mon ordinateur portable et les serveurs de Lucid, je me suis aperçu que la réponse s'affichait littéralement dans la console depuis le début :

![Le configurateur est un flux vidéo]({{ "/zlbolt-webrtc.png" | prepend: page.imgpath }}){: width="691" height="156" loading="lazy" decoding="async"}
{% include caption.html content="Le configurateur est un flux WebRTC." %}

Aucun modèle n'est rendu localement. Ce que je regarde, c'est une vidéo.

Que se passe-t-il donc en coulisses ? Le configurateur démarre avec un affichage 2D — autrement dit, un panorama saccadé d'images qui donne l'illusion d'une interaction 3D. C'est ainsi que fonctionnent la plupart des visionneuses 3D interactives en ligne. Vous pouvez en voir un aperçu ci-dessous :

{% include video.html content="https://streamable.com/e/ptjitc" %}
<p class="caption video-caption">Une vue 3D saccadée, construite à partir d'une série d'images 2D.</p>

Ensuite, le client teste ma bande passante et ma latence ; si ma connexion est suffisamment rapide pour supporter un flux vidéo en temps réel, il fait passer la session en 3D :

![Test de latence]({{ "/latency-test.png" | prepend: page.imgpath }}){: width="755" height="25" loading="lazy" decoding="async"}
![Test de bande passante]({{ "/bandwidth-test.png" | prepend: page.imgpath }}){: width="706" height="21" loading="lazy" decoding="async"}
{% include caption.html content="Vous passez en session 3D si votre bande passante le permet." %}

Cela établit une connexion WebRTC. [WebRTC](https://en.wikipedia.org/wiki/WebRTC) est un protocole de streaming pair-à-pair. La scène est calculée ailleurs, puis diffusée en streaming via WebRTC vers mon navigateur.

En inspectant le contenu de leur requête `get_token`, on découvre quelques détails supplémentaires sur leur fonctionnement.

![Contenu de la requête get_token]({{ "/get-token-request.png" | prepend: page.imgpath }}){: width="829" height="402" loading="lazy" decoding="async"}
{% include caption.html content="Contenu de la requête get_token." %}

Le premier encadré révèle que, pour mesurer votre bande passante, ils téléchargent partiellement [une image de test de 25 Mo](https://libzl.zlthunder.net/bandwidth-test-img.png) sur votre appareil et chronomètrent la durée de l'opération. Voici cette image, si vous êtes curieux (rassurez-vous, je l'ai compressée 10 fois).

![Image de test de bande passante]({{ "/bandwidth-test-image.webp" | prepend: page.imgpath }}){: width="895" height="1263" loading="lazy" decoding="async"}
{% include caption.html content="Pas grand-chose à voir avec l'automobile, mais parfait pour tester votre bande passante." %}

Au passage, [cette image semble provenir de l'effet produit par le greffon plasma de GIMP](https://www.gimp.org/tutorials/Floating_Logo/Plasma.jpg). Elle se charge assez lentement ; comme elle ressemble à du bruit, elle doit être quasiment incompressible.

En ouvrant [chrome://webrtc-internals/](chrome://webrtc-internals/), on obtient plus d'informations sur la connexion WebRTC qui diffuse la scène 3D vers mon navigateur.

![Informations WebRTC]({{ "/lucid-webrtc.png" | prepend: page.imgpath }}){: width="851" height="399" loading="lazy" decoding="async"}
{% include caption.html content="Les outils de débogage de Chrome fournissent davantage de détails sur la connexion WebRTC." %}

À ce stade, vous avez peut-être remarqué qu'aucune de ces URL n'appartient à un domaine Lucid : elles pointent toutes vers `zlthunder`. Qui sont-ils ?

<div class="divider"></div>

## ZeroLight

Une recherche web sur `zlthunder` mène à une entreprise nommée [ZeroLight](https://zerolight.com/). Ils expliquent proposer de la visualisation 3D dans le cloud, spécialisée dans l'automobile. Tout s'éclaire maintenant !

![ZeroLight]({{ "/zero-light.webp" | prepend: page.imgpath }}){: width="1600" height="640" loading="lazy" decoding="async"}
{% include caption.html content="Des spécialistes de la visualisation 3D dans le cloud." %}

Il ne m'a pas fallu longtemps pour tomber sur [cet article de blog d'Unity](https://unity3d.com/showcase/case-stories/zerolight) (le célèbre moteur de jeu vidéo) expliquant comment ZeroLight s'est appuyée sur le moteur pour créer un showroom virtuel réaliste, avec physique optimisée, reflets et tout le reste.

![Unity et ZeroLight]({{ "/unity-zero-light.webp" | prepend: page.imgpath }}){: width="1203" height="658" loading="lazy" decoding="async"}
{% include caption.html content="Les jeux vidéo nous ont menés bien loin." %}

Toutes les pièces du puzzle s'assemblent enfin. Lorsque je me connecte au site, il charge un configurateur 2D. Si ma connexion Internet suit, il me relie à une instance d'Unity — un moteur de jeu vidéo 3D — qui tourne sur un serveur AWS. Le serveur reçoit mes mouvements de souris, fait pivoter et zoome la caméra, calcule le rendu dans le cloud et me renvoie le résultat en streaming.

<div class="divider"></div>

## Ça doit coûter cher

Imaginez que 1 000 utilisateurs soient connectés au site en même temps : il faut 1 000 instances d'un moteur de jeu vidéo avec accélération matérielle qui reçoivent des entrées et renvoient de gros flux vidéo en temps réel — exactement comme les services de cloud gaming tels que Stadia ou GeForce Now. Mais ils en sont visiblement très conscients : pour limiter les coûts, ils vous déconnectent après 60 secondes d'inactivité :

![Rétrogradation pour inactivité]({{ "/inactivity-downgrade.png" | prepend: page.imgpath }}){: width="524" height="60" loading="lazy" decoding="async"}
{% include caption.html content="Rétrograder la session en cas d'inactivité doit faire économiser pas mal d'argent." %}

<div class="divider"></div>

## Au fond, qu'est-ce qu'un moteur de jeu vidéo ?

Même si cet usage d'un moteur de jeu vidéo peut surprendre au premier abord, un moteur de jeu n'est finalement rien d'autre qu'un simulateur optimisé. Les moteurs établis comme Unity intègrent des décennies de recherche sur la simulation des rayons lumineux et d'autres phénomènes physiques. Dès lors, si vous voulez simuler la réalité — même quand cette réalité est un showroom —, un moteur de jeu vidéo est un outil prêt à l'emploi idéal, adaptable à une multitude d'applications.

Avec le recul, j'aurais sans doute pu comprendre comment fonctionnait le configurateur de Lucid en faisant quelques recherches et en tombant directement sur l'article d'Unity. Mais faire de la rétro-ingénierie sur le configurateur m'a offert une vue bien plus précise des défis, des solutions et de la mécanique interne de leur produit, et je me suis senti comme un détective remontant la piste depuis zéro. Ce qui m'a le plus amusé, au final, c'est l'incroyable degré de complexité atteint par la technologie aujourd'hui : un simulateur physique ultraréaliste, tournant sur un serveur distant dans un centre de données d'Amazon, recevant les commandes de mon ordinateur et me renvoyant le flux vidéo à la vitesse de la lumière, tout cela pour que je puisse jouer avec un configurateur de voiture. Et dire qu'il ne nous avait fallu qu'une calculatrice pour aller sur la Lune !
