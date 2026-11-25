---
layout: post
lang_code: fr
locale: fr_FR
ref: bringing-colour-and-life-to-black-and-white-photos
date: 2021-06-12 00:00:00 -0700
last_modified_at: 2021-06-12 00:00
permalink: /fr/bringing-colour-and-life-to-black-and-white-photos
title: "Redonner couleur et vie aux photos en noir et blanc"
imgpath: /assets/img/colourising-black-and-white-photos
previewurl: /mama-and-vova-colorized.jpg
description: "Coloriser des photos de famille avec l'IA et l'API DeepAI : exemples, script de traitement par lots et réflexion sur les limites de la restauration des couleurs."
image: /assets/img/colourising-black-and-white-photos/og-preview.png
image_width: 1200
image_height: 630
image_alt: "Une photo de famille restaurée en couleur grâce à l'IA"
mathjax: false
tags: [computer-vision, machine-learning]
toc: true
---

{% include description.html content="L'apprentissage automatique nous permet de coloriser facilement des photos en noir et blanc, mais à quel prix ?" %}

## Un autre univers

Bien que la photographie en couleur existe techniquement depuis plus d'un siècle ([Sergueï Prokoudine-Gorski et Piotr Vedenissov, pionniers de la photographie couleur, ont parcouru la Russie impériale pour la documenter en couleurs](https://www.loc.gov/pictures/related/?fi=name&q=Prokudin-Gorski%20%2C%20Serge%20%20Mikha%20lovich%2C%201863-1944)), la majeure partie du XXe siècle a été immortalisée en noir et blanc. Même plus tard dans le siècle, une grande partie du monde n'avait pas le luxe de la pellicule couleur : mon père développait encore ses propres photos en noir et blanc dans les années 1980-1990 en Ukraine soviétique, et tandis que les Américains filmaient la guerre du Vietnam tout en couleurs, le point de vue du Nord semble être resté confiné à la photographie en noir et blanc.

![Jeune garçon près de la rivière Sim]({{ "/boy-sim-river.jpeg" | prepend: page.imgpath }}){: width="900" height="648" fetchpriority="high" decoding="async"}
{% include caption.html content="Jeune garçon près de la rivière Sim, une des toutes premières photographies couleur de la Russie impériale. Elle a été réalisée en prenant plusieurs clichés de la même scène à travers différents filtres de couleur. Avec l'aimable autorisation de la Bibliothèque du Congrès." %}

Certains diront que les images en noir et blanc possèdent une qualité qui leur est propre, et c'est sans doute vrai. Mais pour ma part, le noir et blanc me coupe de la scène. Il paraît manifestement éloigné dans le temps. Nous associons tous le noir et blanc au passé, comme en témoigne ce procédé classique du cinéma qui consiste à passer en noir et blanc pour évoquer un souvenir. Et pour quelqu'un qui perçoit la réalité tout en couleurs, il est difficile de se projeter dans des images en noir et blanc. J'ai du mal à me glisser dans la scène ou à me mettre à la place des personnages, parce que dans mon esprit tout cela appartient à un autre univers, un univers en noir et blanc. Pourtant, dès que ces images sont colorisées, tout paraît soudain plus réel, plus crédible, plus tangible. Il devient alors évident que ce qui y est montré appartient à la même Terre et aux mêmes humains — des gens comme vous et moi.

Aussi, lorsque mon père a récemment commencé à numériser notre collection de photos de famille — car les tirages papier se dégradent et risquent de disparaître à jamais, emportant avec eux les histoires, les souvenirs et l'héritage qu'ils préservent —, j'ai eu très envie de les coloriser également, afin de pouvoir les vivre plus pleinement et permettre à mes proches d'évoquer les êtres chers disparus ou de raviver les souvenirs de leur passé et de leur jeunesse.

<div class="divider"></div>

## Coloriser des photos avec l'IA

La restauration des couleurs peut se faire à la main, mais c'est un travail long et laborieux. Les modèles d'apprentissage automatique offrent un moyen rapide et peu coûteux de coloriser des photos, même s'ils comportent des limites que nous aborderons plus loin dans cet article. Je n'ai pas entraîné mon propre modèle pour cela. D'autres ont déjà consacré des milliers d'heures à concevoir et entraîner des modèles exactement pour cette tâche. J'ai trouvé un modèle existant qui fait un excellent travail.

J'ai utilisé l'[API Image Colorization de DeepAI](https://deepai.org/machine-learning-model/colorizer). Le modèle déployé en production par DeepAI semble être une variante du modèle DeOldify, disponible sur [ce dépôt GitHub](https://github.com/jantic/DeOldify).

Je ne pense pas que l'API DeepAI permette d'ajuster les paramètres du modèle, mais vous pouvez le faire si vous l'exécutez vous-même depuis le dépôt ci-dessus ou via [une instance Colab](https://colab.research.google.com/github/jantic/DeOldify/blob/master/ImageColorizerColabStable.ipynb). [MyHeritage](https://www.myheritage.com/incolor) propose également cette API sous forme de service avec des paramètres réglables.

J'ai donc écrit un petit script pour coloriser des dossiers entiers par lots. Il parcourt toutes les photos d'un répertoire, les envoie à l'API Image Colorization de DeepAI et télécharge le résultat dans un dossier séparé (en ignorant les images déjà colorisées). Si cela peut vous être utile, définissez simplement votre clé API DeepAI en variable d'environnement et lancez [ce script](https://github.com/skzv/colorize-photos) :

```bash
export DL_API_KEY=<your-deep-ai-key>
python3 main.py /path/to/images
```

<div class="divider"></div>

## Mes photos de famille
Voici quelques exemples des résultats obtenus sur nos photos de famille.

![Maman avec Vova]({{ "/mama-and-vova.webp" | prepend: page.imgpath }}){: width="1600" height="1232" loading="lazy" decoding="async"}
{% include caption.html content="Ma mère tenant mon frère au début des années 1990 à Kherson, en Ukraine. Avec l'aimable autorisation de la famille Kuznetsov." %}

![Maman avec Vova colorisée]({{ "/mama-and-vova-colorized.webp" | prepend: page.imgpath }}){: width="800" height="616" loading="lazy" decoding="async"}
{% include caption.html content="Maintenant en couleur." %}

![Babouchka Allarkadina]({{ "/my-grandmother-allarkadina.jpg" | prepend: page.imgpath }}){: width="523" height="801" loading="lazy" decoding="async"}
{% include caption.html content="Ma grand-mère, Allarkadina, probablement dans les années 1950, en chemin vers l'université. Diplômée de plusieurs instituts avec une spécialisation en génie électrique, elle a mené une brillante carrière d'ingénieure en électrotechnique marine." %}

![Babouchka Allarkadina colorisée]({{ "/my-grandmother-alla-colourised.webp" | prepend: page.imgpath }}){: width="522" height="800" loading="lazy" decoding="async"}
{% include caption.html content="En couleur." %}

> C'est tellement beau et vivant.

Ces mots de mon père en découvrant les photos fraîchement colorisées ont suffi à rendre tout ce travail largement rentable.

<div class="divider"></div>

## Photos de la guerre du Vietnam
Quelques semaines après avoir préparé ce script de colorisation par lots pour mes photos de famille, un article intitulé [« The Vietnam War from the North Vietnamese Side »](https://news.ycombinator.com/item?id=27283624) est arrivé en tête de Hacker News. L'occasion semblait idéale pour appliquer le script et offrir un regard neuf sur des archives historiques. Tout comme [« Pour les soldats tombés » (« They Shall Not Grow Old »)](https://www.imdb.com/title/tt7905466/) avait rendu les horreurs de la Première Guerre mondiale vivantes et tangibles, j'avais envie de rendre plus réels les visages et les scènes vus du côté nord-vietnamien.

![Destruction de la jungle par l'Agent Orange]({{ "/vietnam-agent-orange.jpeg" | prepend: page.imgpath }}){: width="1600" height="1179" loading="lazy" decoding="async"}
{% include caption.html content="Destruction de la jungle causée par l'Agent Orange." %}

![Destruction de la jungle par l'Agent Orange en couleur]({{ "/vietnam-agent-orange-colourised.webp" | prepend: page.imgpath }}){: width="800" height="590" loading="lazy" decoding="async"}
{% include caption.html content="En couleur." %}

![Habitants inspectant un avion américain abattu]({{ "/vietnam-downed-aircraft.jpeg" | prepend: page.imgpath }}){: width="1600" height="1111" loading="lazy" decoding="async"}
{% include caption.html content="Des habitants inspectant un avion américain abattu, piloté par le lieutenant Stephen Owen Musselman. Le pilote n'a pas survécu — la guerre est un enfer." %}

![Habitants inspectant un avion américain abattu en couleur]({{ "/vietnam-downed-aircraft-colourised.webp" | prepend: page.imgpath }}){: width="800" height="556" loading="lazy" decoding="async"}
{% include caption.html content="En couleur." %}

Toutes les images originales en noir et blanc sont visibles [ici](https://rarehistoricalphotos.com/vietnam-war-images-from-vietnamese-photographers/), et les versions colorisées [ici](https://imgur.com/a/aJbpMjf).

<div class="divider"></div>

## Réactions sur Hacker News

Mes essais ont suscité à la fois des éloges

![Éloges]({{ "/praise.webp" | prepend: page.imgpath }}){: width="624" height="934" loading="lazy" decoding="async"}

et du mépris

![Mépris]({{ "/contempt.png" | prepend: page.imgpath }}){: width="546" height="286" loading="lazy" decoding="async"} {% include caption.html content="Dommage pour le commentaire [signalé], car il soulevait un point intéressant. Il disait quelque chose comme « S'il vous plaît, ne faites pas ça. »" %}

mais surtout, ils ont déclenché de très nombreuses discussions passionnantes.

![Discussion]({{ "/discussion.webp" | prepend: page.imgpath }}){: width="654" height="946" loading="lazy" decoding="async"}

Le fil complet suscité par les photos colorisées se trouve [ici](https://news.ycombinator.com/item?id=27284795).

<div class="divider"></div>

## Limites

Deux aspects de la discussion m'ont particulièrement marqué. Le premier a été un rappel des limites de l'IA.

Par exemple, le modèle appliqué à une vieille photo du Golden Gate en construction produit un pont blanc. À vrai dire, ce n'est pas totalement faux — le pont était effectivement blanc au début de sa construction, mais au moment où la photo a été prise, il avait déjà été recouvert d'un apprêt rouge (selon la source indiquée sur le [dépôt DeOldify](https://github.com/jantic/DeOldify)). Ainsi, même si les données d'entraînement contenaient probablement le Golden Gate en construction et que le modèle a su reconnaître le même pont en chantier, il était incapable d'en déduire la date et de savoir que l'apprêt rouge avait déjà été appliqué à ce stade.

![Un Golden Gate blanc ?]({{ "/golden-gate.webp" | prepend: page.imgpath }}){: width="1200" height="472" loading="lazy" decoding="async"} {% include caption.html content="Un Golden Gate blanc ? Il l'a été — mais pas au moment où cette photo a été prise." %}

Certaines scènes sont ambiguës. Par exemple, d'après les indices visuels de la photo suivante, le modèle ne parvient pas à distinguer si le sol est un champ ou de l'asphalte, et colorise l'asphalte en vert par erreur, là où un coloriste humain aurait probablement vu juste.

![Une célébration]({{ "/a-celebration-colourised.webp" | prepend: page.imgpath }}){: width="800" height="522" loading="lazy" decoding="async"} {% include caption.html content="Le modèle ne comprend pas que le sol est en asphalte et non en herbe." %}

Une autre observation intéressante : les vêtements manquent souvent de teintes, de textures, de motifs ou de contexte suffisamment distinctifs pour être colorisés avec justesse. Le modèle avait tendance à colorier les vêtements en violet — sauf lorsqu'un indice ou un contexte précis l'en dissuadait. C'est probablement parce que, lorsqu'il ne parvient pas à inférer correctement la couleur d'un vêtement, le violet constitue un pari prudent, quelque part au milieu de l'espace chromatique ambigu, qui minimise la fonction de perte lors de l'entraînement.

![Plongeurs vietnamiens — tous en violet ?]({{ "/vietnam-divers-colourised.webp" | prepend: page.imgpath }}){: width="796" height="800" loading="lazy" decoding="async"} {% include caption.html content="Je ne pense pas que les vêtements d'autrefois étaient aussi souvent violets que ce modèle voudrait nous le faire croire." %}

D'ailleurs, mon père m'a demandé de corriger la couleur de certains objets sur nos photos. Malheureusement, je n'ai pas donné suite à cette demande, et je ne vois pas immédiatement comment je pourrais le faire facilement. Mais comme l'a fait remarquer un commentateur, même quand les couleurs sont fausses, elles redonnent tout de même vie aux images.

<div class="divider"></div>

## Considérations éthiques

Une fois certaines de ces limites bien en tête, nous sommes mieux armés pour examiner les implications éthiques d'une IA de colorisation. C'est le second aspect de la discussion qui m'a marqué. L'éthique ne m'était pas venue à l'esprit en lançant ce projet, mais certains retours m'ont poussé à réfléchir, et j'en suis reconnaissant.

La principale question éthique est celle de la vérité. À l'instar de la controverse autour des deepfakes qui brouillent notre rapport au vrai, la colorisation artificielle peut altérer notre perception de l'histoire. L'IA fait des choix sur les couleurs du passé qui ne sont pas nécessairement exacts. Par exemple, si l'on conserve et diffuse la version blanche du Golden Gate produite par une telle IA, la version du pont que découvrent les spectateurs n'est pas historiquement fidèle. Bien sûr, la version en noir et blanc ne l'est pas non plus. Le problème tient peut-être au fait que face à une image en noir et blanc, le spectateur sait bien que le passé n'était pas en noir et blanc, tandis que devant une image en couleur, on se laisse facilement convaincre que c'est bien ainsi que l'histoire s'est déroulée.

Certains vont jusqu'à dire qu'une telle retouche revient à réécrire l'histoire — et il faut reconnaître que cela y ressemble parfois. Prenons cet exemple récent :

> Le Cambodge a demandé au groupe média américain Vice de retirer un article présentant des photographies nouvellement colorisées de victimes des Khmers rouges, estimant que ces images sont une insulte aux morts car certaines ont été modifiées pour y ajouter des sourires.

<p class="caption" style="margin-top:-25px;"><a href="https://www.aljazeera.com/news/2021/4/11/cambodia-condemns-vice-for-altered-khmer-rouge-images">Source</a></p>

C'est une plainte tout à fait légitime. Le modèle semblait surappris, probablement entraîné majoritairement sur des visages souriants. Il a donc modifié les visages des victimes pour les rapprocher de ses données d'entraînement — en les faisant sourire. C'est un exemple frappant des dérives de l'IA, en particulier lorsqu'on l'applique sans précaution.

[MyHeritage](https://www.myheritage.com/incolor), qui propose un service de restauration des couleurs basé sur le même modèle DeOldify que celui que j'ai utilisé, tente un compromis en apposant un filigrane sur toutes ses images retouchées. Leur argument est convaincant :

> Nous distinguons les photos colorisées de celles photographiées à l'origine en couleur à l'aide d'un symbole de palette en relief dans le coin inférieur gauche des photos colorisées. Bien que très réalistes, les photos colorisées possèdent des couleurs simulées par des algorithmes automatiques, qui peuvent différer des couleurs réelles de la scène d'origine. L'icône de palette apparaît sur toutes les photos colorisées afin que les utilisateurs puissent les distinguer des photos aux couleurs réelles. Nous espérons que cette pratique responsable sera adoptée par d'autres utilisateurs de technologies de colorisation. Les photos ayant subi une simple restauration des couleurs ne portent pas d'icône, car leurs couleurs sont authentiques.

Dans mon cas, ma famille savait que j'avais colorisé nos photos artificiellement, et chacun pouvait voir que les couleurs n'étaient pas totalement exactes. Mais même imparfaites, ces couleurs ont redonné vie aux photos, aux personnes et aux scènes qu'elles renfermaient. Tout comme lorsque j'étais lycéen bénévole en maison de retraite et que j'ai pu ramener un résident âgé devant sa maison d'enfance à Dresde grâce à Google Street View — un endroit où il n'était pas retourné depuis 50 ans —, j'ai pu utiliser l'IA pour téléporter notre famille vers des moments heureux vieux de plusieurs décennies. La technologie est un outil, et je suis reconnaissant de vivre à une époque où une telle magie est possible.
