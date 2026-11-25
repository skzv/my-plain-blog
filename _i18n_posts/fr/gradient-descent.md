---
layout: post
lang_code: fr
locale: fr_FR
ref: gradient-descent
date: 2021-11-15 00:00:00 -0700
last_modified_at: 2021-11-15 00:00
permalink: /fr/gradient-descent
title: "Démonstration interactive de la descente de gradient"
imgpath: /assets/img/gradient-descent
previewurl: /gradient-descent-preview.png
description: "Une démonstration interactive de la descente de gradient expliquant les gradients, le taux d'apprentissage et les minima locaux. Ajustez les paramètres et observez l'algorithme converger vers un minimum."
image: /assets/img/gradient-descent/gradient-descent-preview.png
image_width: 1564
image_height: 808
image_alt: "Visualisation interactive de la descente de gradient"
mathjax: true
tags: [machine-learning, optimization]
---

_Quel est cet algorithme si particulier ?_

La descente de gradient est un algorithme d'optimisation qui permet de trouver le minimum (local) d'une fonction.

## Pourquoi est-ce utile ?

Imaginons que vous disposiez d'une fonction $$f(x,y)$$. Cette fonction peut représenter un coût pour vous, tandis que $$x$$ et $$y$$ sont des paramètres d'entrée qui font varier ce coût. Naturellement, vous allez chercher les valeurs de $$x$$ et $$y$$ qui minimisent ce coût. Cela revient à trouver le minimum de $$f(x,y)$$. Par exemple, nous pourrions vouloir trouver le minimum de cette fonction, tracée ci-dessous :

{%include math.html content=
"
\begin{align}
f(x,y)=3(1 - x)^2 e^{- x^2 - (y + 1)^2} - 10(\frac{x}{5} - x^3 - y^5) e^{-x^2 - y^2} - \frac{1}{3} e^{-(x+1)^2 - y^2} \tag{0}  \label{eq:cost_func}
\end{align}
" 
%}

<div id='plot-0'></div>

C'est précisément là que la descente de gradient entre en jeu.

## Pourquoi la descente de gradient ?

De vos cours de calcul différentiel élémentaire, vous vous souvenez peut-être d'une méthode pour trouver le minimum d'une fonction : calculer la dérivée première, l'égaler à zéro et résoudre l'équation :

{%include math.html content=
"
\begin{align}
f'(x,y)=0 \tag{1}  \label{eq:first_deriv}
\end{align}
" 
%}

Cela révèle l'emplacement des extrema (maxima et minima) de la fonction. Le signe de la dérivée seconde $$f''(x,y)$$ indique ensuite si ces extrema sont des maxima locaux ou des minima locaux. Toutefois, résoudre l'équation de la dérivée première $$\eqref{eq:first_deriv}$$ peut s'avérer loin d'être trivial et nécessite souvent des méthodes numériques. Et à mesure que la fonction de coût fait intervenir de plus en plus de dimensions, par exemple $$f(x,y,z,w,q,u,v,...)$$, le problème devient vite ingérable. La descente de gradient offre une méthode efficace pour localiser des minima en exploitant astucieusement la dérivée première.

## L'algorithme de descente de gradient

L'intuition derrière la descente de gradient est très naturelle, et je parie que vous adopteriez spontanément la même démarche dans une situation physique analogue. Imaginez que vous soyez plongé dans un épais brouillard, ne pouvant voir qu'à quelques mètres devant vous et ressentir la pente du sol sous vos pieds. Vous cherchez à atteindre le fond d'une vallée aussi vite que possible. Vous n'allez certainement pas perdre votre temps à marcher à plat — ni pire encore, à monter. Pour descendre vite, vous observez la pente là où vous vous trouvez et vous avancez dans la direction où la descente est la plus raide. « Gradient » est un synonyme de pente : vous êtes donc en train d'effectuer une descente de gradient. À l'inverse, si vous cherchiez à atteindre le sommet d'une colline, vous suivriez la pente la plus raide vers le haut à chaque instant. Ce serait alors une *montée* de gradient.

## Le gradient
Le gradient est essentiellement un autre mot pour désigner la pente. Tout le monde connaît la notion de pente en une dimension. En 1D, puisqu'on ne peut avancer ou reculer que sur une seule ligne, la pente est clairement définie. En revanche, dans un espace de dimension supérieure — imaginez que vous soyez en randonnée — la pente varie selon la direction que vous choisissez. Comment définir la pente en un point dans ce cas ?

En analyse vectorielle, on utilise l'opérateur gradient $$\nabla$$, qui est le vecteur des pentes (ou dérivées partielles premières) le long de chaque dimension.

{%include math.html content=
"
\begin{align}
\nabla f(x,y)= \begin{bmatrix}
           \frac{\partial f}{dx} (x,y) \\
           \frac{\partial f}{dy} (x,y)
         \end{bmatrix} \tag{2}  \label{eq:gradient}
\end{align}
" 
%}

Sur une surface 2D définie par $$f(x,y)$$, il s'agit de la pente selon l'axe des $$x$$ et de la pente selon l'axe des $$y$$. La pente dans une direction quelconque (ce qui est essentiel, puisque nous ne sommes pas contraints de nous déplacer uniquement selon l'axe des $$x$$ ou celui des $$y$$) s'obtient en combinant les composantes en $$x$$ et en $$y$$ de la pente dans cette direction. Autrement dit, le produit scalaire d'un vecteur direction avec le gradient donne la pente dans cette direction.

Une autre propriété remarquable du gradient est qu'il indique la direction de la pente la plus raide. Cela se voit mathématiquement : puisque la pente dans une direction donnée est le produit scalaire de ce vecteur direction avec le gradient, ce produit scalaire est maximal lorsque le vecteur direction est aligné avec le gradient lui-même !

Ci-dessous, j'ai tracé l'opposé du gradient de $$f(x,y)$$ avec Mathematica. Cela nous donne la direction de la plus forte descente en chaque point de $$f$$.

![Gradient de f]({{ "/gradient.png" | prepend: page.imgpath }}){: width="360" height="361" loading="lazy" decoding="async"}
{% include caption.html content="Gradient de f représenté sous forme de champ de vecteurs." %}

## Suivre la plus forte pente vers le bas
Plus haut, nous avons convenu que si vous deviez descendre une vallée à l'aveugle, vous suivriez la pente la plus raide vers le bas pour atteindre le fond le plus vite possible. Mathématiquement, cela revient à descendre la vallée en suivant l'opposé du gradient en chaque point, puisque ce vecteur pointe dans la direction de plus forte descente. En regardant la figure ci-dessus, on voit qu'en suivant les flèches on aboutit bien à un minimum (mais méfiance — chaque minimum possède son propre bassin d'attraction ! Nous y reviendrons).

Nous pouvons donc définir une procédure. Elle pourrait ressembler à ceci :

1. Observer la pente à votre position actuelle et déterminer la direction de plus forte descente.

2. Faire 5 pas dans cette direction.

3. Si vous continuez à descendre, revenir à l'étape 1. Sinon, vous êtes au fond !

Vous vous demandez peut-être d'où viennent ces 5 pas. C'est parfaitement arbitraire. Mais nous pouvons en faire un paramètre de notre procédure. Appelons-le le pas de descente, et notons-le $$\alpha$$. Plus $$\alpha$$ est grand, moins souvent nous avons besoin d'inspecter la pente autour de nous. Sur le plan du calcul, c'est plus efficace — mais comme vous allez le voir, cela peut aussi poser problème.

Nous pouvons aller encore plus loin dans l'optimisation. Lorsque la pente locale est encore raide, nous sommes probablement loin du fond de la vallée. Mais à mesure que la pente s'adoucit, on peut supposer que l'on s'approche du fond. Il est donc judicieux de descendre d'un pas proportionnel à la norme du gradient. Notons le gradient $$\bar{g}$$, et reformulons notre procédure de descente de gradient :

1. Observer la pente à votre position actuelle et déterminer la direction de plus forte descente.

2. Faire $$\alpha \times \|\bar{g}\|$$ pas dans cette direction.

3. Si vous continuez à descendre, revenir à l'étape 1. Sinon, vous êtes au fond !

Reste à savoir comment déterminer si nous sommes toujours en train de descendre. Une approche consiste à mesurer de combien nous avons descendu à chaque itération. Si notre altitude varie à peine, c'est que nous sommes déjà quasiment au fond.

Mathématiquement, notre procédure s'écrit :

{%include math.html content=
"
\begin{align}
\bar{p}_{n+1} = \bar{p}_n - \alpha \nabla f(x,y) \tag{3}  \label{eq:grad_descent}
\end{align}
" 
%}

où $$p_n$$ est notre position à la $$n^{\text{e}}$$ itération de la descente. Essayez-la sur la démonstration ci-dessous. Faire varier $$\alpha$$ modifie la vitesse de descente, tandis que faire varier $$X$$ et $$Y$$ change le point de départ sur la surface. Que remarquez-vous ?

<div id='plot-1'></div>

<span class="slider-container">
    <span class="slider-label" class="slider-label">X</span>
    <span>
        <input class="slider" id="x-slider" type="range" min="-3" max="3" value="0" step="0.05">
    </span>
    <span class="slider-value" id="x-slider-value">0</span>
</span>

<span class="slider-container">
    <span class="slider-label" >Y</span>
    <input class="slider" id="y-slider" type="range" min="-3" max="3" value="0" step="0.05">
    <span class="slider-value" id="y-slider-value">0</span>
</span>

<span class="slider-container">
    <span class="slider-label" >&#945;</span>
    <input class="slider" id="alpha-slider" type="range" min="0" max="0.2" value="0" step="0.001">
    <span class="slider-value" id="alpha-slider-value">0</span>
</span>

## Observations

Vous remarquerez que la descente de gradient est sensible à la position initiale. Elle vous attire vers un minimum local, qui n'est pas forcément le minimum global. La région du domaine à partir de laquelle la descente de gradient converge vers un minimum donné s'appelle le bassin d'attraction de ce minimum.

Vous constaterez également qu'augmenter le pas de descente $$\alpha$$ réduit le nombre d'itérations nécessaires pour atteindre le minimum. Mais s'il est trop grand, l'algorithme dépasse le minimum et peut même diverger.

## Apprentissage automatique

Vous avez probablement déjà entendu parler de la descente de gradient dans le contexte de l'apprentissage automatique (machine learning). Dans ce cadre, la fonction de coût représente l'erreur de notre modèle. Il peut par exemple s'agir de l'erreur de classification d'images, et les entrées de la fonction de coût sont les poids du modèle que nous ajustons. Nous pouvons ainsi utiliser la descente de gradient pour trouver la configuration optimale des poids qui minimise l'erreur de classification du réseau de neurones ! Dans ce domaine, le pas de descente $$\alpha$$ porte un nom bien précis : le *taux d'apprentissage* (*learning rate*). Peut-être est-ce ce que nos cerveaux font depuis toujours.

<script defer fetchpriority="low" src="https://cdn.plot.ly/plotly-2.4.2.min.js"></script>
<script defer fetchpriority="low" src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/9.5.1/math.js" integrity="sha512-AfRcJIj922x/jSJpQLnry0DYIBg6EGCtwk/MiQ6QvDlzb7kNFxH8EdqXLkaXXY3YHQS9FrSb8H7LzuLn0CZQ1A==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script defer src="/assets/js/gradient-descent.js"></script>
