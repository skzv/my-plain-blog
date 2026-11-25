---
layout: post
lang_code: fr
locale: fr_FR
ref: monte-carlo-options-pricing
date: 2021-12-17 00:00:00 -0700
last_modified_at: 2021-12-17 00:00
permalink: /fr/monte-carlo-options-pricing
title: "Évaluation d'options par la méthode de Monte-Carlo"
imgpath: /assets/img/monte-carlo-stocks
previewurl: /gbm-example.png
description: "Explorez l'évaluation d'options par la méthode de Monte-Carlo grâce à des simulations interactives du mouvement brownien géométrique, des rendements boursiers, de la volatilité et des gains d'options."
image: /assets/img/monte-carlo-stocks/gbm-example.png
image_width: 1810
image_height: 990
image_alt: "Trajectoires simulées de cours boursiers par mouvement brownien géométrique"
mathjax: true
tags: [quant-finance, simulation]
toc: true
---

_Le casino des options_

Prédire l'évolution du cours des actions est un défi séduisant, chargé de promesses de richesse. Malheureusement, prévoir de manière fiable et régulière les cours futurs est généralement considéré comme impossible. En revanche, nous pouvons utiliser des modèles pour formuler des prévisions utiles, gérer le risque et réaliser des profits de façon *probabiliste*.

## Le mouvement brownien géométrique
L'un des modèles les plus couramment utilisés est le mouvement brownien géométrique ([1](https://stats.libretexts.org/Bookshelves/Probability_Theory/Probability_Mathematical_Statistics_and_Stochastic_Processes_(Siegrist)/18%3A_Brownian_Motion/18.04%3A_Geometric_Brownian_Motion), [2](http://www.columbia.edu/~ks20/FE-Notes/4700-07-Notes-GBM.pdf)) — d'ailleurs, la célèbre [formule de Black-Scholes pour l'évaluation des options](https://en.wikipedia.org/wiki/Black%E2%80%93Scholes_model) repose elle aussi sur ce modèle. Il s'écrit sous la forme :

{%include math.html content=
"
\begin{align}
 S(t) = S(0)\exp{((\mu-\frac{\sigma^2}{2})t + \sigma B(t))} \tag{0}  \label{eq:gbm}
\end{align}
" 
%}

où $$B(t)$$ est un mouvement brownien standard. Si nous notons $$S(0)$$ le cours initial de l'action, $$\mu$$ le [rendement composé continu](https://en.wikipedia.org/wiki/Rate_of_return#Logarithmic_or_continuously_compounded_return) moyen et $$\sigma$$ la [volatilité](https://en.wikipedia.org/wiki/Volatility_(finance)) du titre, nous pouvons alors générer des trajectoires de prix très réalistes.

<div id='plot-0'></div>
<span class="slider-container">
    <span class="slider-label" class="slider-label">$$\mu$$</span>
    <span>
        <input class="slider" id="mean-slider" type="range" min="-2.5" max="1" value="0" step="0.01">
    </span>
    <span class="slider-value" id="mean-slider-value">0</span>
</span>

<span class="slider-container">
    <span class="slider-label" class="slider-label">$$\sigma$$</span>
    <span>
        <input class="slider" id="sigma-slider" type="range" min="0" max="1" value="0" step="0.01">
    </span>
    <span class="slider-value" id="sigma-slider-value">0</span>
</span>

<button class="regenerate-button" onclick="regenerate0()">Régénérer</button>

<div style="display:none" id='mean-0'>0</div>
<div style="display:none" id='sigma-0'>0</div>
<div style="display:none" id='option-mean-0'>0</div>

Alors, que signifie tout cela, et pourquoi est-ce un bon modèle pour le prix des titres financiers ?

### Les rendements logarithmiques
En finance quantitative, il est courant de travailler avec des rendements composés en continu plutôt qu'avec des rendements simples. Cela signifie qu'au lieu d'étudier le rendement simple entre deux périodes de cotation $$1 + R_t = \frac{S(t)}{S(t-1)}$$, on s'intéresse au rendement composé $$r_t = \ln{(1 + R_t)} = \ln{\frac{S(t)}{S(t-1))}}$$. Cette formulation a une propriété très pratique : on retrouve le cours d'une action simplement en sommant les rendements logarithmiques :

{%include math.html content=
"
\begin{align}
 S(t) = S(0)\exp{(r_1 + r_2 + ... + r_{t-1})} \tag{1}  \label{eq:rr}
\end{align}
" 
%}

C'est également pratique parce qu'une hypothèse classique en finance veut que les rendements logarithmiques d'une action soient indépendants et suivent une loi normale de moyenne $$\mu$$ et de variance $$\sigma^2$$. Remarquons que pour de faibles rendements, le rendement simple $$R_t$$ est très proche du rendement logarithmique $$r_t$$ puisque $$r_t = \ln{(1 + R_t)} \approx R_t$$ ; l'écart entre les deux est donc minime et l'on peut assimiler les deux à une distribution normale. Ensuite, si les rendements logarithmiques suivent une loi normale, alors le cours de l'action suit une loi *log-normale*. On observe empiriquement ce comportement dans une certaine mesure, même si dans la réalité les cours boursiers présentent des « queues plus épaisses » — c'est-à-dire que les événements extrêmes surviennent plus souvent que ne le prédit une loi normale. Voici les rendements mensuels de l'action IBM qui illustrent ce phénomène.

![Rendements mensuels d'IBM]({{ "/IBM-returns.webp" | prepend: page.imgpath }}){: width="1282" height="1008" loading="lazy" decoding="async"}
{% include caption.html content="Rendements mensuels simples et logarithmiques de l'action IBM comparés à des lois normales ajustées. On observe davantage de rendements aux extrémités que ne le prévoirait la loi normale : c'est ce qu'on appelle des « queues épaisses » ou un « excès de kurtosis ». Image tirée de « Analysis of Financial Time Series, 3rd Ed. » par Ruey S. Tsay." %}

Ce modèle a un autre atout : il n'autorise que des prix strictement positifs. Or les titres financiers ont presque toujours un prix positif (même si dans certains cas rares ils peuvent devenir négatifs — pensez au [krach pétrolier de 2020](https://assets.weforum.org/editor/kE8TpkO7bzo3dLFWEh9UDvgqRuZPOmURhnh0FfwOVYc.png)).

Nous voulons donc un processus capable de générer une suite de rendements $$r_t$$ suivant une loi normale — ce qui fait du mouvement brownien un choix tout naturel.


## Le mouvement brownien
Le [mouvement brownien](https://stats.libretexts.org/Bookshelves/Probability_Theory/Probability_Mathematical_Statistics_and_Stochastic_Processes_(Siegrist)/18%3A_Brownian_Motion/18.01%3A_Standard_Brownian_Motion) décrit le déplacement d'une particule dans un fluide ou un gaz. Cette particule rebondit de manière « aléatoire » dans le milieu qui l'entoure, traçant une trajectoire particulièrement bruitée et erratique. On peut le voir comme la limite d'une marche aléatoire dont l'intervalle de temps entre deux pas et la taille de chaque pas tendent tous deux vers zéro (avec une nuance importante : si le pas de temps vaut $$t$$, la taille du pas doit être de $$\sqrt{t}$$ — ce qui garantit que la variance du processus croît exactement proportionnellement au temps). Imaginez tirer à pile ou face pour décider d'avancer ou de reculer d'un pas, puis faire tendre l'intervalle entre chaque tirage vers zéro. Vous traceriez une trajectoire qui ressemble à ceci :

![Mouvement brownien en 1D]({{ "/wiener-process-zoom.png" | prepend: page.imgpath }}){: width="800" height="600" loading="lazy" decoding="async"}
{% include caption.html content="Mouvement brownien [arithmétique] unidimensionnel. Le mouvement brownien géométrique correspond à l'exponentielle de ce processus. <a target='_blank' href='http://creativecommons.org/licenses/by-sa/3.0/' title='Creative Commons Attribution-Share Alike 3.0'>CC BY-SA 3.0</a>, <a target='_blank' href='https://commons.wikimedia.org/w/index.php?curid=1426987'>Source</a>" %}

Le mouvement brownien possède l'excellente propriété que ses incréments suivent une loi normale, exactement ce que nous recherchons. On peut simuler un processus brownien à pas discrets en échantillonnant dans une loi normale (bien que si seule la valeur finale d'une série temporelle vous importe, n'importe quelle distribution de variance unitaire ferait l'affaire : d'après le théorème central limite, la somme de variables aléatoires finit de toute façon par tendre vers une gaussienne).

Le mouvement brownien nous fournit ainsi la suite de rendements logarithmiques normalement distribués $$r_t$$ demandée dans $$\eqref{eq:rr}$$ :

{%include math.html content=
"
\begin{align}
 r(t) = (\mu-\frac{\sigma^2}{2})t + \sigma B(t) \tag{2}  \label{eq:bm}
\end{align}
" 
%}

En prenant l'exponentielle de ce processus, nous retrouvons notre équation pour modéliser l'évolution d'un cours boursier.

Un point particulièrement intéressant ici est le terme de dérive $$\mu - \frac{\sigma^2}{2}$$ qui entraîne le processus de façon linéaire, comme son nom l'indique. Le rôle de $$\mu$$ est évident : c'est le rendement composé continu moyen du titre et, en l'absence de bruit (ou de volatilité), le prix de l'action ne ferait que croître (ou décroître) à ce rythme composé. Mais d'où vient le $$-\frac{\sigma^2}{2}$$ ? Il s'avère que l'espérance d'une variable log-normale vaut $$\exp(\mu + \sigma^2/2)$$. Comme le prix de l'action suit une *loi log-normale* (alors que les rendements suivent une *loi normale*) et que nous voulons que l'espérance du cours après capitalisation continue soit égale à $$S(0)\exp(\mu t)$$, il faut appliquer ce terme correctif de $$-\frac{\sigma^2}{2}$$ au processus.

Il existe aussi un argument presque philosophique en faveur du mouvement brownien comme base de ce modèle. Une hypothèse classique en finance est que les marchés sont efficients, c'est-à-dire qu'il ne devrait pas exister d'opportunité d'arbitrage. Le marché devrait donc être imprévisible : si un acteur parvenait à le prédire, cela créerait une opportunité d'arbitrage qui serait immédiatement exploitée jusqu'à disparaître. Du bruit aléatoire (ce qu'est essentiellement le mouvement brownien) constitue donc un choix pertinent pour modéliser les marchés.

## Évaluation d'options

La simulation de Monte-Carlo est une technique statistique inspirée des casinos de Monaco. Tout comme un joueur remet son sort aux probabilités, nous confions les résultats d'une analyse statistique au hasard. En réalisant suffisamment d'essais, nous pouvons tirer des conclusions statistiquement significatives.

Considérons l'évaluation d'une option d'achat (*call*) de prix d'exercice (*strike*) de 105 $ sur cette action. Quelle serait la valeur espérée de l'option à l'échéance, si l'évolution du titre suit un mouvement brownien géométrique ? Nous pouvons l'estimer en générant une série de trajectoires de cours, chacune jouant le rôle d'un essai. La valeur finale de chaque essai donne la valeur intrinsèque de l'option via la relation $$V = \max(0, S - K)$$, où $$S$$ est le cours de l'action et $$K$$ le prix d'exercice. La moyenne des valeurs finales nous fournit une estimation du prix de l'option à l'échéance, tandis que leur écart-type mesure notre degré de certitude quant au fait que l'option expire proche de cette valeur.

<div id='plot-1'></div>
<button class="regenerate-button" onclick="regenerate1()">Régénérer</button>
<div id='mean-1'>0</div>
<div id='sigma-1'>0</div>
<div id='option-mean-1'>0</div>

Nous pouvons augmenter le nombre d'essais pour accroître la précision statistique de l'estimation. Relancer la simulation (en cliquant sur « Régénérer ») sur un grand nombre de tirages (ci-dessous) produit des écarts beaucoup plus faibles entre deux expériences que sur un petit nombre de tirages (ci-dessus).

<div id='plot-2'></div>
<button class="regenerate-button" onclick="regenerate2()">Régénérer</button>
<div id='mean-2'>0</div>
<div id='sigma-2'>0</div>
<div id='option-mean-2'>0</div>

## Scénarios plus avancés
La simulation de Monte-Carlo sur les valeurs à l'échéance reste relativement simple, et pas forcément indispensable puisqu'une telle analyse peut généralement se résoudre analytiquement. La véritable puissance de la méthode de Monte-Carlo se révèle face à des scénarios beaucoup plus difficiles, voire impossibles, à résoudre par le calcul exact. Par exemple, pour analyser une option américaine, qui peut être exercée à tout moment, on peut vouloir calculer la probabilité que le cours de l'action dépasse le prix d'exercice à n'importe quel instant de la vie de l'option. Il suffit alors de compter combien de trajectoires franchissent cette barrière — ce qui est très simple à faire avec une simulation de Monte-Carlo.

<script defer fetchpriority="low" src="https://cdn.plot.ly/plotly-2.4.2.min.js"></script>
<script defer fetchpriority="low" src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/9.5.1/math.js" integrity="sha512-AfRcJIj922x/jSJpQLnry0DYIBg6EGCtwk/MiQ6QvDlzb7kNFxH8EdqXLkaXXY3YHQS9FrSb8H7LzuLn0CZQ1A==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script defer src="/assets/js/monte-carlo-options.js"></script>
