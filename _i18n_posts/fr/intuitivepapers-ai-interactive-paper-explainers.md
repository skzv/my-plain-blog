---
layout: post
lang_code: fr
locale: fr_FR
ref: intuitivepapers-ai-interactive-paper-explainers
date: 2026-06-05 00:00:00 -0700
last_modified_at: 2026-11-25 00:00
permalink: /fr/intuitivepapers-ai-interactive-paper-explainers
title: "Des explications interactives d'articles d'IA avec intuitivepapers.ai"
imgpath: /assets/img/intuitivepapers
previewurl: /home.png
description: "Comment j'ai conçu intuitivepapers.ai, un pipeline automatisé qui transforme des articles de recherche en apprentissage automatique en explications interactives vérifiées avec des figures sur mesure sur canvas."
image: /assets/img/intuitivepapers/home.png
image_width: 1280
image_height: 820
image_alt: "Explications interactives d'articles d'IA sur intuitivepapers.ai"
mathjax: false
tags: [machine-learning, ai-tools]
---

{% include description.html content="Peut-on transformer automatiquement des articles denses de machine learning en explications interactives et vérifiées ?" %}

Lire des articles de recherche en apprentissage automatique peut être d'une lenteur frustrante. Un article consacre en général ses pages à ce qu'il apporte de nouveau et suppose que vous avez déjà les cinq notions préalables bien fraîches en tête ; résultat, une fois sur deux, je finis par remonter toute une chaîne de références plus anciennes avant que l'article lui-même ne devienne clair.

Le raccourci facile aujourd'hui consiste à glisser le PDF dans un LLM et à lui demander une explication. Je le fais souvent, et c'est pratique pour un premier survol, mais il se trompe étonnamment souvent sur des détails subtils. Un signe inversé dans une équation, une dérivation présentée comme exacte alors qu'il s'agit d'une approximation, ou une confusion sur la variable réellement mise à jour peuvent changer du tout au tout le comportement d'un algorithme. Et quand on ne maîtrise pas encore bien l'article, il est très difficile de repérer ces erreurs dans une explication qui a par ailleurs l'air parfaitement plausible.

Ce que je voulais, c'étaient des explications qui construisent l'intuition et les mathématiques main dans la main, avec des figures que l'on peut réellement manipuler. J'avais vu à quel point cela change tout lorsque j'avais réalisé ma [démonstration interactive de la descente de gradient](/fr/gradient-descent) il y a quelques années : faire glisser un curseur et voir un algorithme osciller ou converger enseigne des choses qu'une équation figée ne transmet jamais vraiment.

## Commencer par DiffusionBlocks

J'ai commencé par construire une première [explication de l'article DiffusionBlocks de Sakana AI](https://intuitivepapers.ai/diffusionblocks/) avec Claude. Il m'a fallu environ une semaine d'allers-retours pour obtenir un résultat propre. Une grande partie de ce temps a servi à revérifier chaque équation par rapport aux sources primaires (comme l'article EDM) et au dépôt GitHub officiel des auteurs.

Ce travail de vérification a d'ailleurs mis au jour une véritable erreur de signe imprimée dans l'article lui-même. L'article définit `Δσ = σ_prev - σ_next > 0` et écrit sa mise à jour d'Euler à l'équation (4) avec `(z - D)`, ce qui éloigne en fait l'état de la prédiction du débruiteur. En discrétisant leur équation (1), on obtient `(D - z)`, et effectivement, un coup d'œil au code officiel des auteurs (`model.py`) a confirmé que l'implémentation utilise bien le signe corrigé. Un résumé classique généré par un LLM se serait contenté de recopier la coquille imprimée, et je ne m'en serais probablement jamais aperçu.

C'est ce qui m'a donné envie de savoir quelle part de toute cette semaine de travail pouvait être automatisée. Pouvais-je construire un pipeline qui récupère les sources réelles d'un article, vérifie les mathématiques préalables dans la littérature primaire et le code, fabrique des figures interactives et relit son propre brouillon avant de publier ?

Le résultat s'appelle [intuitivepapers.ai](https://intuitivepapers.ai/). Le site a démarré avec vingt explications — couvrant aussi bien des classiques que des articles plus récents comme Attention, BERT, les GAN, les VAE, CLIP, PPO, Mamba et Adam — et dépasse désormais les 150 explications grâce au pipeline qui tourne selon un calendrier automatique.

![Page d'accueil d'intuitivepapers.ai présentant des explications interactives d'articles de machine learning]({{ "/home.webp" | prepend: page.imgpath }}){: width="1280" height="820" fetchpriority="high" decoding="async"}
{% include caption.html content="La page d'accueil d'intuitivepapers.ai." %}

![Bibliothèque de vingt explications d'articles d'IA avec aperçus de figures]({{ "/library.webp" | prepend: page.imgpath }}){: width="1280" height="2621" loading="lazy" decoding="async"}
{% include caption.html content="La bibliothèque initiale de vingt articles. Chaque carte affiche un aperçu en direct d'une figure issue de son explication." %}

<div class="divider"></div>

## À quoi ressemble une explication

Chaque page commence par les prérequis et monte progressivement jusqu'à l'idée centrale de l'article dans l'ordre des dépendances. Sur ordinateur, une barre latérale que j'appelle la tour de concepts cartographie cette chaîne de dépendances afin que l'on voie comment les briques s'empilent, et de courts extraits de code relient la notation mathématique à ce qui s'exécute réellement.

Ma partie préférée, ce sont les figures interactives. Par exemple, PPO utilise un objectif écrêté (*clipped objective*) pour empêcher les mises à jour de politique d'aller trop loin en une seule étape. Dans la figure ci-dessous, vous pouvez faire varier le ratio de probabilités et inverser le signe de l'avantage pour voir exactement où la fonction objectif s'aplatit et cesse de produire un gradient. Jouer avec pendant dix secondes fait comprendre la logique de l'écrêtage bien plus vite que de fixer l'expression `min` toute seule.

![Objectif écrêté interactif de PPO montrant le ratio de probabilités et l'avantage]({{ "/ppo-figure.png" | prepend: page.imgpath }}){: width="1280" height="820" loading="lazy" decoding="async"}
{% include caption.html content="Explorer l'objectif écrêté de PPO en faisant glisser le ratio de probabilités et en inversant le signe de l'avantage." %}

Tout s'adapte également aux écrans de téléphone, où je finis moi-même par faire une bonne partie de mes lectures :

![Explication de l'article PPO avec une figure intégrée sur téléphone]({{ "/mobile-ppo.png" | prepend: page.imgpath }}){: width="400" height="840" loading="lazy" decoding="async" style="max-height:520px;width:auto"}
{% include caption.html content="L'explication de PPO sur téléphone, avec la même figure interactive intégrée." %}

Autre exemple : CLIP, qui entraîne des encodeurs d'image et de texte à aligner les paires correspondantes. La grille interactive ci-dessous évalue chaque image face à chaque légende d'un lot : la diagonale lumineuse regroupe les vraies paires qui sont rapprochées, tandis que tout ce qui est hors diagonale correspond à des paires incompatibles qui sont repoussées.

![Grille de similarité CLIP comparant des images avec des légendes correspondantes et non correspondantes]({{ "/clip-grid.png" | prepend: page.imgpath }}){: width="664" height="593" loading="lazy" decoding="async"}
{% include caption.html content="La grille de similarité image-légende de CLIP. Les paires correspondantes se trouvent sur la diagonale." %}

<div class="divider"></div>

## Comment fonctionne le pipeline

Un simple prompt du type « explique cet article » donne exactement le genre de résumés superficiels que je voulais éviter. Pour obtenir un résultat plus fiable, j'ai découpé la génération en un pipeline en plusieurs étapes, avec toute une série de contrôles automatisés entre le brouillon et la mise en ligne.

D'abord, plutôt que de laisser un modèle paraphraser des équations de mémoire, le pipeline récupère le rendu HTML d'arXiv (`arxiv.org/html/<id>`) et convertit le MathML en LaTeX avec `pandoc`, de sorte que les équations et les chiffres de l'article soient extraits mot pour mot.

Ensuite, il vérifie les concepts préalables dans les sources primaires — définitions, signes et conventions — et lorsque le texte de l'article laisse un détail ambigu, il consulte le code officiel des auteurs et cite le fichier ainsi que les numéros de ligne exacts dans un panneau de provenance en bas de page. Tout cela est consolidé dans une fiche de référence vérifiée sur laquelle s'appuie le rédacteur, plutôt que d'écrire directement à partir de l'article brut.

À partir de là, le pipeline construit des figures interactives sur mesure directement en HTML5 Canvas (sans bibliothèque de graphiques) et rédige l'explication dans l'ordre des dépendances, en associant les équations à des exemples numériques concrets et à du pseudo-code concis.

Avant toute publication, le brouillon passe par une combinaison de vérifications déterministes et de modèles critiques :

1. Une passe déterministe gratuite recherche les tics rédactionnels typiques de l'IA, valide la syntaxe KaTeX, vérifie que les versions mobiles étroites des équations sont mathématiquement équivalentes aux versions bureau sans déborder de l'écran d'un téléphone, et balaie chaque figure interactive sur ordinateur comme sur mobile à travers différents états de curseurs et de boutons pour détecter les étiquettes qui se chevauchent ou sont coupées.
2. Des critiques distincts évaluent ensuite la fidélité par rapport à l'article, la clarté, le ton, les figures et les captures d'écran rendues.
3. Les problèmes confirmés passent par une étape de correction, le site est recompilé et seuls les contrôles ayant échoué sont relancés, sur quelques itérations au maximum. Si un problème subsiste à la fin, le pipeline échoue de manière sûre (*fail closed*) et ouvre une pull request en brouillon au lieu de publier automatiquement.

L'ensemble du pipeline tourne quotidiennement via `launchd` sur le Mac mini sous mon bureau. Chaque matin, il prend l'article le plus voté de la file d'attente (qui combine un backlog sélectionné à la main et les suggestions des lecteurs), attend la réinitialisation des quotas de session du modèle pour reprendre automatiquement si une limite est atteinte, et déploie la page finale une fois que la compilation et les revues passent sans erreur.

Voici ci-dessous l'un des schémas dessinés sur canvas pour l'explication de Mamba, qui décompose les éléments d'un bloc Mamba.

![Schéma détaillant les composants d'un bloc Mamba]({{ "/mamba-block-fig.jpeg" | prepend: page.imgpath }}){: width="1280" height="900" loading="lazy" decoding="async"}
{% include caption.html content="Décomposition d'un bloc Mamba, dessinée sur canvas pour l'explication de Mamba." %}

<div class="divider"></div>

## Remarques finales

Tout a commencé parce que je voulais vraiment comprendre un seul article, et cela s'est transformé en une expérience pour voir jusqu'où pouvait aller la vérification automatisée. Croiser les sources primaires, lire le code des auteurs et balayer les différents états des figures permet d'attraper beaucoup d'erreurs subtiles, même si cela ne rend évidemment pas le résultat infaillible. Les figures interactives complexes restent la partie la plus difficile à réussir de manière fiable sans regard humain, et il arrive encore qu'une explication maladroite ou un bug dans un cas limite passe entre les mailles du filet.

Pour y remédier, chaque page dispose d'un champ de retour en bas. Les signalements des lecteurs servent à corriger les erreurs sur la page et à resserrer les règles du pipeline afin que les prochaines explications évitent les mêmes écueils.

S'il y a un article de machine learning que vous aviez prévu d'étudier sérieusement, allez jeter un œil à [intuitivepapers.ai](https://intuitivepapers.ai/). Vous pouvez proposer un article ou voter pour l'un de ceux déjà en file d'attente, et si vous repérez une erreur dans une explication, n'hésitez pas à me la signaler via le champ de retour afin que je puisse la corriger.
