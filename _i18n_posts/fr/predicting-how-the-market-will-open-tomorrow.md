---
layout: post
lang_code: fr
locale: fr_FR
ref: predicting-how-the-market-will-open-tomorrow
date: 2025-03-23 00:00:00 -0700
last_modified_at: 2025-03-23 00:00
permalink: /fr/predicting-how-the-market-will-open-tomorrow
title: "Prédire comment le marché ouvrira demain"
imgpath: /assets/img/predicting-market-open
previewurl: /preview.png
description: "Comment les contrats à terme sur indices, les taux d'intérêt et les rendements de dividendes permettent d'estimer la prochaine ouverture des marchés, avec le calcul du coût de portage et mon tableau de bord impliedopen.com."
image: /assets/img/predicting-market-open/og-preview.png
image_width: 1200
image_height: 630
image_alt: "Tableau de bord d'ouverture implicite des marchés"
mathjax: true
tags: [quant-finance]
---

_Prédire l'avenir_

Un week-end où de mauvaises nouvelles économiques étaient tombées, je me suis demandé quel impact elles auraient sur les marchés à l'ouverture du lundi. En creusant la question, j'ai découvert que, pendant que les bourses actions sont fermées, les contrats à terme (*futures*) sur les indices sous-jacents continuent de s'échanger, et qu'on peut observer ce marché à terme pour voir comment les traders réagissent déjà et intègrent les nouvelles informations dans les prix — un peu comme une boule de cristal 🔮.

Comme les prix à terme et les prix au comptant sont liés, nous pouvons calculer ce que les marchés à terme estiment être la juste valeur actuelle de chaque indice en actualisant la valeur future vers le présent. Cela nous donne le cours d'ouverture implicite de chaque indice avant même l'ouverture de la bourse — ainsi, dès le dimanche soir, on peut voir si le marché risque d'ouvrir <span style="color: #66ff66;">à la hausse</span> ou <span style="color: #ff6666;">à la baisse</span> le lendemain.

Ci-dessous, je détaille toutes les pièces de ce calcul, jusqu'au tableau de bord que j'ai construit pour avoir un aperçu des mouvements d'ouverture du lendemain sur [impliedopen.com](https://impliedopen.com).


![Aperçu du tableau de bord que j'ai construit pour anticiper les mouvements du marché le lendemain]({{ "/save-game.webp" | prepend: page.imgpath }}){: width="1168" height="1312" fetchpriority="high" decoding="async"}
{% include caption.html content="Un aperçu du tableau de bord que j'ai construit pour anticiper les mouvements du marché le lendemain." %}

## Les contrats à terme (futures)

Les contrats à terme (*futures*) sont des instruments qui permettent aux traders de parier sur le prix *futur* d'un actif sous-jacent à la date d'échéance du contrat. Observez le prix et la date d'échéance du contrat à terme sur le S&P 500 ci-dessous. Il se négocie actuellement au-dessus du cours du S&P 500, mais qu'est-ce que cela nous dit sur la valeur actuelle du S&P 500 ?

Pour relier le prix du contrat à terme à la juste valeur actuelle implicite fixée par le marché à terme, nous devons tenir compte du temps qui nous sépare de la date d'échéance du contrat.

![Contrat à terme S&P 500]({{ "/futures-price.webp" | prepend: page.imgpath }}){: width="943" height="826" loading="lazy" decoding="async"}
{% include caption.html content="Contrat à terme sur le S&P 500" %}

Nous y parvenons grâce au modèle du coût de portage (*cost of carry*), qui prend en compte le taux d'intérêt sans risque, le rendement des dividendes et le temps restant jusqu'à l'échéance. Il repose sur l'hypothèse que le cours de l'indice devrait croître au taux sans risque actuel (essentiellement une hypothèse d'absence d'arbitrage), diminué de la baisse de valeur liée au versement des dividendes.

Nous pouvons exprimer cette relation par :

{% include math.html content=
"
\begin{align}
    F = S \times e^{(r - q) \times t} \tag{0}  \label{eq:coc}
\end{align}
"
 %}

où $$F$$ est le prix du contrat à terme, $$S$$ est le cours actuel de l'indice, $$r$$ est le taux d'intérêt sans risque, $$q$$ est le rendement des dividendes et $$t$$ est le temps restant jusqu'à l'échéance.

## Remonter le temps

Pour déduire la juste valeur actuelle de l'indice à partir du prix du contrat à terme, on actualise ce prix vers le présent en inversant la formule précédente :

{% include math.html content=
"
\begin{align}
    S = F \times e^{-(r - q) \times t} \tag{1}  \label{eq:discount}
\end{align}
"
 %}

Avant l'ouverture de la bourse, cette juste valeur constitue notre meilleure estimation du cours d'ouverture de l'indice.

## Le taux sans risque

Un placement sans risque existe-t-il vraiment ? Les bons du Trésor américain (*Treasury bills* ou *T-bills*) — la dette émise par le Trésor des États-Unis — sont considérés comme (quasiment) sans risque parce que :
- le gouvernement américain a une probabilité de défaut très faible : il peut émettre sa propre monnaie et dispose d'un solide historique de remboursement ;
- leur courte maturité réduit l'exposition aux variations de taux d'intérêt et aux incertitudes de long terme ;
- le marché est extrêmement liquide ;
- il n'y a pas de risque de crédit au sens où l'État américain ne fait pas faillite comme une entreprise ou une collectivité émettrice d'obligations.

Pour le taux sans risque de ces calculs, j'ai choisi le T-bill à 3 mois.

![Rendement des bons du Trésor américain à 3 mois]({{ "/3m-bond-yield-1.png" | prepend: page.imgpath }}){: width="993" height="633" loading="lazy" decoding="async"}
{% include caption.html content="Rendement des bons du Trésor américain à 3 mois" %}

On suppose que les actifs sous-jacents progressent au moins au taux sans risque, faute de quoi les investisseurs n'auraient aucun intérêt à y placer leur argent.

## Le rendement des dividendes

Bien que nous supposions que les sous-jacents croissent au moins au taux sans risque, il faut tenir compte du fait que les indices baissent d'un montant équivalent lorsque des dividendes sont détachés. Pour cela, j'utilise le rendement de dividende le plus récent de chaque indice — même si un modèle plus précis chercherait probablement à anticiper le rendement de dividende futur.

Voici le dernier rendement de dividende du S&P 500 que j'utilise dans mes calculs.

![Dernier rendement de dividende du S&P 500]({{ "/sp500-dividend-yield.png" | prepend: page.imgpath }}){: width="873" height="641" loading="lazy" decoding="async"}
{% include caption.html content="Dernier rendement de dividende du S&P 500" %}

## Mettre le tout ensemble

Je récupère le dernier cours de l'indice, le prix actuel du contrat à terme, ma meilleure estimation du rendement de dividende, du taux sans risque et du temps jusqu'à l'échéance, et je calcule ainsi ma meilleure estimation de la juste valeur de chaque grand indice. J'ai réuni tout cela sur [impliedopen.com](https://impliedopen.com), intégré ci-dessous :

<iframe src="https://impliedopen.com" title="Tableau de bord d'ouverture implicite des marchés Implied Open" width="100%" height="1200px"></iframe>

Ce tableau de bord est surtout utile lorsque le marché à terme est ouvert mais que le marché classique est fermé — on peut alors s'appuyer sur les contrats à terme pour voir ce que les traders intègrent dans les prix avant l'ouverture officielle. Quand le marché classique est ouvert, c'est lui qui fournit la « vraie » valeur actuelle de chaque indice, telle qu'évaluée par le marché.

![Vue de l'état des marchés]({{ "/market-status.png" | prepend: page.imgpath }}){: width="751" height="159" loading="lazy" decoding="async"}
{% include caption.html content="Vue de l'état des marchés" %}

## Remarques finales

J'ai monté ce tableau de bord assez vite, et j'ai fini par récupérer une bonne partie des données par scraping, en les mettant en cache toutes les minutes via ma propre API :) Toutes mes excuses si quelque chose casse ou tombe en panne — je finirai par remplacer tout ça par de vraies API, à moins que ce tableau de bord ne devienne obsolète à mesure que les bourses passent à la cotation 24h/24 et 7j/7. Quoi qu'il en soit, je voulais rédiger cet article pour en garder une trace durable.

![C'est comme ça]({{ "/it-is-what-it-is.png" | prepend: page.imgpath }}){: width="690" height="365" loading="lazy" decoding="async"}
{% include caption.html content="C'est comme ça." %}

Si vous repérez des erreurs dans mes calculs ou si vous avez des suggestions ou des retours, n'hésitez pas à me contacter pour m'en faire part !
