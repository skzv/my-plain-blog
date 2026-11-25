---
layout: post
lang_code: fr
locale: fr_FR
ref: arbitrage-as-a-shortest-path-problem
date: 2021-04-25 00:00:00 -0700
last_modified_at: 2021-04-25 00:00
permalink: /fr/arbitrage-as-a-shortest-path-problem
title: "L'arbitrage comme problème de plus court chemin"
imgpath: /assets/img/arbitrage-as-a-shortest-path-problem
previewurl: /currency-graph-on-black.png
description: "Comment l'arbitrage de devises devient un problème de graphe, en utilisant les logarithmes et l'algorithme de Bellman-Ford pour détecter des cycles d'échange rentables."
image: /assets/img/arbitrage-as-a-shortest-path-problem/og-preview.png
image_width: 1200
image_height: 630
image_alt: "Graphe de taux de change utilisé pour expliquer l'arbitrage"
mathjax: true
tags: [quant-finance, algorithms]
toc: true
---
{% include description.html content="Une explication de l'arbitrage et un aperçu d'un algorithme efficace pour détecter des opportunités d'arbitrage instantanées et sans risque." %}

_Qui n'aime pas gagner de l'argent ?_

Et si l'on pouvait transformer le problème de gagner de l'argent en un problème de recherche du plus court chemin ? C'est tout à fait possible, du moins d'une manière bien précise : en exploitant des opportunités d'arbitrage.

## Qu'est-ce que l'arbitrage ?

L'_arbitrage_ consiste à acheter et vendre un même actif sur différents marchés, ou sous différentes formes, afin de tirer profit des écarts de prix. Et comment appelle-t-on ceux qui le pratiquent ? Des _arbitragistes_ — un titre plutôt chic, il faut l'avouer.

Commençons par un exemple. Imaginons que Paul, Peter et Bob vivent dans un village où ils troquent des carottes, des pommes de terre et des laitues. Bob échange des pommes de terre contre des carottes, Peter échange des laitues contre des pommes de terre, et Paul échange des laitues contre des carottes.

De plus, Bob propose 2 pommes de terre pour une carotte, Peter propose 1 laitue pour 2 pommes de terre, et Paul propose 2 carottes pour 1 laitue. Si nous considérons chaque habitant comme un marché pour ses biens respectifs, à quoi ressembleraient les taux de change ?

| Marché                             | Taux de change                                         |
|:----------------------------------:|:------------------------------------------------------:|
| Bob (pommes de terre / carottes)   | 2 pommes de terre/carotte                              |
| Peter (laitues / pommes de terre)  | 1 laitue/2 pommes de terre = 0,5 laitue/pomme de terre |
| Paul (carottes / laitues)          | 2 carottes/laitue                                      |
{% include caption.html content="Les taux de change des marchandises dans notre village." %}

Vous sentez l'opportunité ?

Esprit entreprenant que vous êtes, vous allez tenter de l'exploiter. En partant avec 5 carottes, vous allez voir Bob et échangez vos 5 carottes contre 10 pommes de terre, au taux qu'il est prêt à pratiquer.

{%include math.html content=
"
\begin{align}
5 \text{ carrots} \times 2 \space \frac{\text{potatoes}}{\text{carrots}} = 10 \text{ potatoes} \tag{1} \label{eq:arb_example}
\end{align}
" 
%}

Ensuite, vous allez voir Peter avec vos pommes de terre, sachant qu'il vous donnera 5 laitues en échange. Puis vous apportez vos 5 laitues à Paul, qui vous les échange contre 10 carottes.

Après quelques échanges bien sentis, vous avez doublé votre stock de carottes. Vous avez transformé 5 carottes en 10 en exploitant une opportunité d'arbitrage.

Plus tard, les villageois pourraient développer des marchés plus sophistiqués où Bob, Peter et Paul ne seraient plus les seuls négociants. Ce petit village pourrait ainsi voir naître un marché carotte/laitue, un marché laitue/pomme de terre et un marché pomme de terre/carotte, où les taux en vigueur fluctuent selon ce que chacun est prêt à échanger.

Mais le principe de l'arbitrage reste identique. Et l'opportunité peut être exploitée jusqu'à ce que les négociants offrant ces taux n'aient plus de carottes, de laitues ou de pommes de terre à échanger. L'opportunité d'arbitrage est exploitée jusqu'à ce que le marché atteigne un équilibre.

<div class="divider"></div>

## L'arbitrage à l'époque moderne

Quand vous pensez aux marchés modernes, vous ne pensez probablement pas à troquer des carottes, des pommes de terre et des laitues. Si vous vous intéressez au marché des changes (le forex), vous pensez plutôt aux dollars, aux livres sterling et aux yens. Dans ce cas, nous aurions un marché dollar/livre, un marché livre/yen et un marché yen/dollar, avec de nombreux opérateurs actifs sur chacun d'eux. À partir de maintenant, prenons ces devises comme exemples de biens échangeables, tout en gardant à l'esprit que les mêmes principes s'appliquent à toutes sortes d'actifs négociables.

Supposons qu'à un instant donné, les taux de change soient les suivants :

| Marché                 | Taux de change       |
|:----------------------:|:--------------------:|
| livre (£) / dollar ($) | 0,8 livre/dollar     |
| yen (¥) / livre (£)    | 100 yens/livre       |
| dollar ($) / yen (¥)   | 0,013 dollar/yen     |
{% include caption.html content="Un exemple de taux de change sur le marché des devises." %}

Si vous avez retenu la leçon de Bob, Peter et Paul avec leurs carottes, leurs laitues et leurs pommes de terre, vous devriez repérer l'opportunité ici.

Si vous échangez 1 $ contre des livres, vous obtenez 0,8 £. En les échangeant contre des yens, vous obtenez 80 ¥. Vous apportez ensuite vos yens sur le marché yen/dollar pour les reconvertir en dollars… et vous voilà maintenant avec 1,04 $ !

Mais il faut agir vite, avant qu'un autre arbitragiste ne vous prenne de vitesse. Ces opportunités n'existent que temporairement, le temps que la liquidité soit absorbée et que les taux se rééquilibrent.

Les plus attentifs d'entre vous auront remarqué que nous n'avons pas pris en compte les frais de transaction dans notre exemple. Bien entendu, il faut les inclure dans le calcul pour savoir si une opportunité d'arbitrage réellement rentable existe.

<div class="divider"></div>

## Agir vite

Vous avez sans doute maintenant l'intuition de la raison pour laquelle la vitesse est primordiale. Les taux de change fluctuent rapidement et la quantité disponible à un taux donné est limitée.

Nous avons travaillé sur des exemples relativement simples jusqu'ici, mais les opportunités d'arbitrage peuvent impliquer de nombreux échanges et devenir extrêmement complexes. Nos exemples comptaient 3 transactions, mais qu'en serait-il s'il en fallait 10 ? Et dans un réseau de 20 devises comportant un marché pour chaque paire, à quelle vitesse pourriez-vous dénicher une opportunité ?

Utiliser un ordinateur est la réponse évidente. Encore nous faut-il un algorithme efficace, sous peine de voir quelqu'un d'autre saisir l'opportunité avant nous.

Pour y parvenir, nous pouvons nous appuyer sur quelques idées astucieuses issues des mathématiques et de l'informatique.

<div class="divider"></div>

## Les marchés vus comme un graphe

Les graphes constituent une structure fondamentale qui trouve des usages dans d'innombrables domaines. De nombreux systèmes sociaux et naturels se modélisent par des graphes, et il s'avère que les marchés en font partie.

Dans notre cas, considérons chaque devise comme un nœud. Passer d'un nœud à un autre correspond à échanger une devise contre une autre.

![Graphe simplifié de devises]({{ "/currency-graph-white.png" | prepend: page.imgpath }}){: width="448" height="283" loading="lazy" decoding="async"}
{% include caption.html content="Graphe simplifié — il devrait y avoir une arête orientée distincte dans chaque sens." %}

Se déplacer le long d'une arête entre deux nœuds doit donc transformer le montant de devise selon le taux de change.

Ainsi, passer du nœud dollar au nœud livre correspond à multiplier par 0,8 livre/dollar. Attribuons le taux de change comme poids de chaque arête.

Notons que les taux de change dans un sens et dans l'autre seront _approximativement_ inverses l'un de l'autre. Autrement dit, si le taux pour convertir des dollars en livres est de 0,8 livre/dollar, le taux dans le sens inverse sera de 1/(0,8 livre/dollar) = 1,25 dollar/livre. Pour nous, cela implique de bien traiter l'achat et la vente sur chaque marché comme deux arêtes orientées distinctes, avec des poids différents.

La raison pour laquelle les taux de change dans les deux sens ne sont qu'_approximativement_ inverses tient aux légers écarts entre les prix d'achat et de vente des devises, ce qu'on appelle le spread (ou fourchette achat-vente). Par exemple, si à un moment donné vous pouvez acheter des livres à 0,8 livre/dollar (le prix auquel quelqu'un accepte de vous vendre), mais que vous pouvez vendre des livres pour des dollars à 0,82 livre/dollar (soit 1,22 dollar/livre, le prix auquel quelqu'un accepte de vous acheter), votre modèle de graphe ressemblera à ceci (en omettant les autres taux par souci de simplicité) :

![Graphe de devises avec taux de change]({{ "/currency-graph-w-exchange-rates-white.png" | prepend: page.imgpath }}){: width="451" height="378" loading="lazy" decoding="async"}

Une suite de transactions peut être modélisée par un parcours le long des arêtes de ce graphe, et le résultat de ces transactions s'obtient en **_multipliant_** les poids des arêtes au fil du parcours.

<div class="divider"></div>

## Repérer l'opportunité

Maintenant que nous avons un modèle opérationnel, que cherchons-nous dans notre graphe qui corresponde à une opportunité d'arbitrage ?

Pour savoir si une série d'échanges est rentable, nous avons besoin d'une mesure de rentabilité cohérente. En d'autres termes, si nous commençons notre série d'échanges en dollars, nous devons aussi la terminer en dollars. En comparant la somme en dollars obtenue à la fin à celle de départ, nous saurons si l'opération a été profitable ou non.

Dans notre graphe, cela signifie que notre suite de transactions doit se terminer au même nœud que celui dont elle est partie. Dans notre exemple, nous sommes partis du nœud dollar et revenus au nœud dollar. En théorie des graphes, c'est ce qu'on appelle un cycle. Nous savons donc que nous cherchons un cycle — mais quel genre de cycle est rentable ?

Remarquons qu'en multipliant le long des arêtes d'un chemin, nous transformons les unités du taux de change effectif.

{%include math.html content=
"
\begin{align}
a \space \frac{\cancel{£}}{$} \times b \space \frac{¥}{\cancel{£}} = ab \space \frac{¥}{$}  \tag{2} \label{eq:units_of_exchange_rate}
\end{align}
" 
%}

Cependant, lorsque nous revenons à notre nœud de départ, la grandeur devient sans dimension. Elle passe d'un taux de change à un facteur de rendement ! Parcourir un cycle dans notre graphe et calculer le produit des taux de change rencontrés revient à calculer le ratio de rendement obtenu à l'issue de la série de transactions.

{%include math.html content=
"
\begin{align}
a \space \frac{\cancel{£}}{\cancel{$}} \times b \space \frac{\cancel{¥}}{\cancel{£}} \times c \space \frac{\cancel{$}}{\cancel{¥}} = abc \space \text{[dimensionless]}  \tag{3} \label{eq:unitless_exchange}
\end{align}
" 
%}

Si le marché est parfaitement efficient, notre facteur de rendement, $$abc$$, vaudra 1, car les taux de change se sont équilibrés. Si le produit des poids est supérieur à 1, par exemple 1,02, alors notre opportunité d'arbitrage nous aura rapporté un rendement de 2 %.

Par conséquent, en généralisant à un nombre arbitraire de transactions, une opportunité d'arbitrage correspond à l'inégalité suivante :

{%include math.html content=
"
\begin{align}
\prod_i^n{e_i} = e_ie_2...e_n > 1  \tag{4} \label{eq:arbitrage_return}
\end{align}
" 
%}

où $$e_i$$ désigne le $$i^{\text{e}}$$ taux de change, pour chaque transaction $$i$$, sur $$n$$ transactions.

Il nous faut donc un algorithme capable de trouver un cycle dans le graphe des marchés dont le produit des poids d'arêtes soit supérieur à 1. On pourrait inventer un algorithme de toutes pièces pour cela — mais en informatique, comme dans la vie en général, il est souvent bien plus judicieux de ramener un problème à un autre qu'on sait déjà résoudre.

<div class="divider"></div>

## L'algorithme de Bellman-Ford

La recherche du plus court chemin est un problème classique et fondamental en informatique, applicable à de très nombreux scénarios. L'exemple le plus évident, en faisant le lien entre un graphe et une carte routière, est la recherche de l'itinéraire le plus court sur une carte. Mais avec un peu d'ingéniosité, bien d'autres types de problèmes peuvent aussi se ramener à un problème de plus court chemin. Je vais vous montrer que la recherche d'opportunités d'arbitrage en fait partie.

Commençons par rappeler ce qu'est le problème du plus court chemin. Étant donné deux nœuds $$s$$ et $$t$$ dans un graphe, le plus court chemin est celui qui minimise la _somme_ des poids des arêtes. Autrement dit, on parcourt le chemin de $$s$$ à $$t$$ en additionnant les poids des arêtes rencontrées ; le chemin dont la somme est minimale est le plus court chemin — celui de coût minimal.

Ensuite, il est utile de savoir qu'il existe différentes classes de problèmes de plus court chemin. Dans l'exemple évident — comme l'itinéraire le plus court sur une carte — les poids des arêtes sont nécessairement positifs. À moins de disposer d'une machine à remonter le temps, emprunter une route ne peut pas réduire votre temps de trajet. Dans un graphe ne contenant que des poids positifs, le célèbre algorithme de Dijkstra calcule le plus court chemin vers tous les nœuds du graphe.

Rien n'empêche pourtant un graphe de posséder des arêtes de poids négatif. Dans ce cas, emprunter une telle arête diminue le coût total du chemin. Mais s'il existe un _cycle_ de poids total négatif, on peut alors parcourir ce _cycle_ indéfiniment — en abaissant à chaque tour le coût total du chemin — si bien que le plus court chemin aura un coût tendant vers $$-\infty$$. Dans ce contexte, il est très précieux que notre algorithme de plus court chemin sache détecter les cycles de poids négatif. Sans quoi la recherche du plus court chemin tournerait en boucle sur ce cycle négatif pour l'éternité.

L'algorithme de Bellman-Ford est précisément cet algorithme. Version plus générale de l'algorithme de Dijkstra, il gère les poids négatifs. Pour ce faire, il détecte les _cycles de poids négatif_ — les cycles d'un graphe le long desquels la _somme_ des poids donne une valeur négative.

Mais en quoi un algorithme qui trouve des cycles où la **_somme_** des arêtes est inférieure à 0 peut-il nous aider, alors que nous avons besoin d'un algorithme détectant des cycles où le **_produit_** des arêtes est supérieur à 1 ?

<div class="divider"></div>

## Le logarithme à la rescousse

L'idée clé suivante est qu'un produit peut être transformé en une somme grâce à la fonction logarithme, en vertu de l'identité :

{%include math.html content=
"
\begin{align}
\log{ab} = \log{a} + \log{b}  \tag{5} \label{eq:log_product_identity}
\end{align}
" 
%}

Nous pouvons ainsi transformer notre problème de recherche d'un cycle dont le _produit_ est supérieur à 1 en un problème de recherche d'un cycle dont la _somme_ est supérieure à 0 ! Il suffit de prendre le logarithme de chaque taux de change et de l'utiliser comme poids de chaque arête.

Vérifions-le en appliquant le logarithme aux deux membres de notre inégalité. D'abord, prendre le logarithme du membre de gauche transforme le calcul d'un produit en celui d'une somme :

{%include math.html content=
"
\begin{align}
\log{\prod_i^n{e_i}} = \log{e_ie_2...e_n} = \log{e_1} + ... + \log{e_n} = \sum_i^n{\log{e_i}} \tag{6} 
\end{align}
" 
%}

Le logarithme du membre de droite transforme simplement le 1 en 0 :

{%include math.html content=
"
\begin{align}
\sum_i^n{\log{e_i}} > \log{1} \rightarrow \sum_i^n{\log{e_i}} > 0 \tag{7}
\end{align}
" 
%}

On y est presque, mais pas tout à fait. La dernière étape pour ramener notre problème à celui que l'algorithme connu sait résoudre consiste à multiplier le poids de chaque arête par -1. La recherche d'un cycle de poids positif devient alors la recherche d'un cycle de poids négatif :

{%include math.html content=
"
\begin{align}
\sum_i^n{-\log{e_i}} < 0 \tag{8}
\end{align}
" 
%}

Ce que l'algorithme de Bellman-Ford sait faire ! En construisant le graphe de cette manière et en y exécutant Bellman-Ford, nous trouvons rapidement et efficacement les opportunités d'arbitrage, parce que nous avons transformé le problème de l'arbitrage en un problème de plus court chemin — _le chemin infiniment le plus court_.

![Graphe de devises avec logarithmes négatifs]({{ "/neg-log-currency-graph-white.png" | prepend: page.imgpath }}){: width="448" height="283" loading="lazy" decoding="async"}
{% include caption.html content="Nous cherchons un cycle de poids négatif, où les poids sont l'opposé du logarithme des taux de change." %}

Avec le recul, il paraît tout naturel qu'il y ait une correspondance entre un cycle de poids négatif — qui réduit le coût du chemin à chaque passage — et une opportunité d'arbitrage, qui génère un profit à chaque passage. L'astuce décisive consiste à transformer la recherche d'un produit supérieur à 1 en la recherche d'une somme inférieure à 0 en appliquant $$-\log$$ aux poids des arêtes.

<div class="divider"></div>

## La preuve par l'exemple

Exécutons cet algorithme sur nos taux de change pour vérifier qu'il identifie correctement l'opportunité d'arbitrage. En transformant les taux par $$-\log$$, nous obtenons :

| Marché                 | -log(Taux de change) |
|:----------------------:|:--------------------:|
| livre (£) / dollar ($) | 0,223                |
| yen (¥) / livre (£)    | -4,605               |
| dollar ($) / yen (¥)   | 4,343                |

En sommant sur les transactions, l'inégalité est bien vérifiée — _nous avons trouvé un cycle de poids négatif_ !

{%include math.html content=
"
\begin{align}
\sum_i^n{-\log{e_i}} = 0.223 - 4.605 + 4.343 = -0.039 \label{eq:neg_log_exchange_rate_example} \tag{9}
\end{align}
" 
%}

Nous pouvons inverser la transformation logarithmique pour retrouver le produit et calculer le rendement :

{%include math.html content=
"
\begin{align}
\prod_i^n{e_i} &= \exp{\sum_i^n{-\log{e_i}}} \\
\prod_i^n{e_i} &= \exp(0.039) = 1.04 \tag{10}
\end{align}
" 
%}

Ce qui correspond exactement au rendement de 4 % que nous avions calculé plus haut.

<div class="divider"></div>

## Dans le monde réel

Puisqu'une opportunité d'arbitrage correspond à un cycle de poids négatif, on pourrait croire qu'il suffit de parcourir le cycle à l'infini pour gagner une somme d'argent infinie. Évidemment, il n'en est rien.

La liquidité — le volume disponible avant que le prix ne bouge de manière significative — associée à toute opportunité d'arbitrage est limitée, et elle est très vite absorbée par des traders algorithmiques qui repoussent les limites de l'informatique et des lois de la physique pour se devancer mutuellement.

Cela étant dit, j'espère que vous aurez trouvé cet exercice — appliquer la théorie des graphes et un algorithme bien connu de plus court chemin pour résoudre un problème de finance et gagner de l'argent — aussi passionnant que je l'ai toujours trouvé.
