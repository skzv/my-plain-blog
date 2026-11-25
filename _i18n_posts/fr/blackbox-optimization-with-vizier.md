---
layout: post
lang_code: fr
locale: fr_FR
ref: blackbox-optimization-with-vizier
date: 2023-02-23 00:00:00 -0700
last_modified_at: 2023-02-23 00:00
permalink: /fr/blackbox-optimization-with-vizier
title: "Optimisation boîte noire et réglage d'hyperparamètres avec Vizier de Google"
imgpath: /assets/img/blackbox-optimization-with-vizier
previewurl: /black-box-optimization.png
description: "Un exemple concret d'optimisation boîte noire avec Google Vizier : définir des paramètres conditionnels, évaluer des essais et ajuster un modèle sur un signal bruité."
image: /assets/img/blackbox-optimization-with-vizier/og-preview.png
image_width: 1200
image_height: 630
image_alt: "Entrées et sorties de l'optimisation boîte noire"
mathjax: true
tags: [machine-learning, optimization]
toc: true
---
{% include description.html content="Optimiser automatiquement et intelligemment n'importe quel type de système" %}

<style>
img {
  max-height: 350px;
}
</style>

Lorsque vous construisez un modèle d'apprentissage automatique — ou tout autre système algorithmique — vous devez faire des choix d'architecture. En apprentissage automatique, par exemple, il vous faut décider du nombre de neurones dans une couche de réseau ou du taux de descente de gradient. Si vous concevez un [filtre particulaire](https://en.wikipedia.org/wiki/Particle_filter) pour suivre l'état d'un robot, vous devrez choisir la forme d'une fonction de vraisemblance. Ou encore, vous cherchez peut-être la taille de tampon et le nombre de threads qui minimisent votre consommation de ressources de calcul. Comment trouver l'architecture optimale de votre système ?

Vous pourriez essayer à la main : tester différentes valeurs pour le nombre de neurones, essayer différents pas de descente de gradient. Mais ce processus est lent, fastidieux et plein de pièges. Heureusement, il existe des services capables d'optimiser votre système à votre place, de façon intelligente et efficace.

<div class="divider"></div>

## Présentation de Vizier

[Vizier](https://github.com/google/vizier) est un service d'optimisation créé chez Google pour l'optimisation boîte noire et le réglage d'hyperparamètres. Il peut optimiser n'importe quel système du moment que vous pouvez lui fournir des entrées — suggérées par Vizier — et récupérer des sorties — des métriques que Vizier cherche à optimiser, en les maximisant ou en les minimisant. Le système lui-même est traité comme une boîte noire.

![Optimisation boîte noire]({{ "/black-box-optimization.png" | prepend: page.imgpath }}){: width="629" height="319" loading="lazy" decoding="async"}
{% include caption.html content="L'optimisation boîte noire n'exige aucune compréhension du système lui-même, tant qu'on peut lui fournir des entrées et récupérer des sorties. Source : Per Instance Algorithm Configuration for Continuous Black Box Optimization - Figure scientifique sur ResearchGate. Disponible sur : https://www.researchgate.net/figure/black-box-Optimization_fig1_322035981 [consulté le 23 février 2023]" %}

Contrairement aux méthodes d'optimisation qui ne sont pas des boîtes noires, comme [la descente de gradient](/fr/gradient-descent), qui exigent de comprendre la relation entre les paramètres du système et la métrique à minimiser ou maximiser, un système boîte noire comme Vizier n'a besoin d'aucune connaissance interne du système. Il n'en explore pas moins l'espace des paramètres efficacement pour trouver les valeurs qui optimisent votre système. Cela le rend également plus robuste face à des fonctions de métrique complexes, discontinues ou non convexes.

<div class="divider"></div>

## Paramètres vs hyperparamètres

Petite parenthèse : cette distinction vient de l'apprentissage automatique, où les « paramètres » désignent les valeurs internes au modèle utilisées pour l'inférence et apprises lors de l'entraînement sur un jeu de données, tandis que les hyperparamètres décrivent l'architecture du modèle ou la procédure d'entraînement. Un service d'optimisation boîte noire comme Vizier peut servir à optimiser n'importe quel type de système ; ce ne serait pas un moyen efficace d'entraîner directement un modèle d'apprentissage automatique, mais c'est un très bon outil pour en optimiser l'architecture.

<div class="divider"></div>

## Un exemple

Je vais prendre un exemple qui ne relève pas de l'apprentissage automatique, mais qui illustre très bien la puissance et la simplicité d'un algorithme d'optimisation boîte noire comme Vizier. Imaginons que nous ayons un signal bruité comme celui ci-dessous :

![Un signal bruité]({{ "/some-noisy-signal.png" | prepend: page.imgpath }}){: width="368" height="246" loading="lazy" decoding="async"}
{% include caption.html content="Un signal bruité." %}

Essayons de trouver une fonction analytique qui s'ajuste à ce signal. Nous hésitons entre ajuster une loi [gaussienne](https://en.wikipedia.org/wiki/Normal_distribution) ou une loi de [Laplace](https://en.wikipedia.org/wiki/Laplace_distribution), et chacune de ces deux fonctions possède ses propres paramètres — comme la moyenne et la variance — que nous devons aussi estimer.

Tant que nous pouvons fournir à Vizier une métrique à optimiser, il trouvera pour nous la fonction optimale.

<div class="divider"></div>

## Mise en place du problème
Le premier paramètre que nous voulons explorer est le type de modèle : gaussien ou Laplace :

```
{
    'parameter_id': 'model',
    'categorical_value_spec' : {
        'values': [
            'gaussian',
            'laplace',
        ]
}
```

Mais chaque modèle possède son propre ensemble de paramètres qui définit sa forme. Appelons-les les « paramètres enfants » de chaque modèle.

Pour la gaussienne, il s'agit de la moyenne `mu` ($$\mu$$) et de l'écart-type `sigma` ($$\sigma$$).

![Loi gaussienne de paramètres mu et sigma]({{ "/normal-distribution.png" | prepend: page.imgpath }}){: width="720" height="460" loading="lazy" decoding="async"}
{% include caption.html content="Loi gaussienne de paramètres mu et sigma. Source : https://commons.wikimedia.org/wiki/File:Normal_Distribution_PDF.svg" %}

Pour la loi de Laplace — la notation varie selon les auteurs — on trouve généralement le paramètre de position (ou moyenne) `mu` ($$\mu$$) et le facteur d'échelle `b` ($$b$$).

![Loi de Laplace de paramètres mu et b]({{ "/laplace-distribution.png" | prepend: page.imgpath }}){: width="800" height="600" loading="lazy" decoding="async"}
{% include caption.html content="Loi de Laplace de paramètres mu et b. Source : https://commons.wikimedia.org/wiki/File:Laplace_pdf_mod.svg" %}

Pour éviter toute confusion avec la moyenne de la gaussienne, appelons `a` plutôt que `mu` le paramètre de position de la loi de Laplace.

Lorsque l'on tente d'ajuster la loi gaussienne, nous ne voulons pas que Vizier essaie d'estimer les paramètres de la loi de Laplace, et réciproquement. Par chance, on peut définir les paramètres de chaque loi comme des paramètres enfants, ou conditionnels, du paramètre parent `model` :

```
'conditional_parameter_specs': [
{
    "parameter_spec": {
        "parameter_id": "mu",
        "scale_type": 'UNIT_LINEAR_SCALE',
        "double_value_spec": {
        "min_value": 0,
        "max_value": 10.0,
        },
    },
    "parent_categorical_values": {
        "values": ['gaussian']
    }
},
{
    "parameter_spec": {
        "parameter_id": "sigma",
        "scale_type": 'UNIT_LINEAR_SCALE',
        "double_value_spec": {
        "min_value": 1e-1,
        "max_value": 5.0,
        },
    },
    "parent_categorical_values": {
        "values": ['gaussian']
    }
},
    {
    "parameter_spec": {
        "parameter_id": "a",
        "scale_type": 'UNIT_LINEAR_SCALE',
        "double_value_spec": {
        "min_value": 0,
        "max_value": 10.0,
        },
    },
    "parent_categorical_values": {
        "values": ['laplace']
    }
},
{
    "parameter_spec": {
        "parameter_id": "b",
        "scale_type": 'UNIT_LINEAR_SCALE',
        "double_value_spec": {
        "min_value": 1e-1,
        "max_value": 5.0,
        },
    },
    "parent_categorical_values": {
        "values": ['laplace']
    }
}]
```

Enfin, il faut définir la métrique que Vizier va optimiser. Je souhaite ajuster une fonction au signal aussi fidèlement que possible, et j'évalue la qualité de l'ajustement en calculant la somme des carrés des résidus entre la fonction analytique et les données. Plus cette valeur est petite, meilleur est l'ajustement. Il suffit d'indiquer à Vizier que c'est cette métrique que nous voulons minimiser :

```
metric_ssr = {
    'metric_id': 'sum_of_squared_residuals',
    'goal': 'MINIMIZE',
}
```

Nous rassemblons tous ces éléments pour définir notre étude :

```
study = {
    'display_name': 'vizier_experiment',
    'study_spec' :
    {
        'parameters': [param_model],
        'metrics': [metric_ssr]
    }
}
```

Notez que Vizier n'a aucune compréhension des paramètres eux-mêmes. `Gaussian` et `Laplace` ne sont pour lui que des modalités d'un paramètre catégoriel, sans aucune autre signification. C'est mon code consommateur qui leur donne un sens — mais du point de vue de Vizier, ce code vit dans une boîte noire. Je ne l'inclus pas ici par souci de concision, mais vous trouverez l'intégralité du code au lien situé à la fin de l'article.


<div class="divider"></div>

## La recherche

À chaque essai, Vizier nous propose un jeu de paramètres à tester. Nous évaluons nous-mêmes la performance de ces paramètres, calculons la métrique (la somme des carrés des résidus) et renvoyons le résultat à Vizier. Vizier s'en sert alors pour générer le jeu de paramètres suivant.

![Vizier proposant des paramètres pour les essais]({{ "/vizier-trials.png" | prepend: page.imgpath }}){: width="1280" height="281" loading="lazy" decoding="async"}
{% include caption.html content="Vizier proposant des paramètres pour chaque essai." %}

Remarquez que Vizier ne propose des paramètres gaussiens que lorsque le modèle est gaussien, et inversement pour le modèle de Laplace.

Comment Vizier cherche-t-il les paramètres optimaux ? Il peut effectuer une recherche sur grille ou aléatoire, mais la vraie magie réside dans la combinaison d'autres algorithmes qu'il emploie : bandits à processus gaussiens, recherche par combinaison linéaire, ou leurs variantes.

Depuis GCP, nous pouvons consulter ces graphiques très parlants de la progression de Vizier :

![Tableau d'étude montrant l'évolution de la métrique optimisée et des paramètres de chaque essai]({{ "/study-progress-table.webp" | prepend: page.imgpath }}){: width="1600" height="1071" loading="lazy" decoding="async"}
{% include caption.html content="Tableau d'étude montrant l'évolution de la métrique optimisée et les paramètres de chaque essai." %}

![Graphique en coordonnées parallèles montrant les jeux de paramètres testés et la métrique obtenue]({{ "/parallel-chart.webp" | prepend: page.imgpath }}){: width="1600" height="726" loading="lazy" decoding="async"}
{% include caption.html content="Graphique en coordonnées parallèles montrant les jeux de paramètres testés et la valeur de métrique correspondante." %}

<div class="divider"></div>

## Ajustement optimal

On voit que la loi de Laplace l'emporte légèrement sur la gaussienne :

![Graphique en coordonnées parallèles zoomé sur les meilleurs essais minimisant la somme des carrés des résidus]({{ "/optimal-parallel-chart.webp" | prepend: page.imgpath }}){: width="1600" height="550" loading="lazy" decoding="async"}
{% include caption.html content="Graphique en coordonnées parallèles zoomé sur les meilleurs essais qui minimisent la somme des carrés des résidus. La loi de Laplace offre un meilleur ajustement que la loi gaussienne." %}

Nous interrogeons Vizier pour récupérer les paramètres du meilleur essai et les traçons :

![Ajustement optimisé sur le signal bruité]({{ "/noisy-signal-fit.png" | prepend: page.imgpath }}){: width="543" height="289" loading="lazy" decoding="async"}
{% include caption.html content="Paramètres optimisés ajustés au signal bruité." %}

L'ajustement est presque parfait ! Les paramètres trouvés par Vizier sont très proches de ceux que j'avais utilisés pour générer le signal avant d'y ajouter du bruit : une loi de Laplace avec $$a=5$$ et $$b=2$$.

![Signal de Laplace d'origine]({{ "/original-laplace-signal.png" | prepend: page.imgpath }}){: width="862" height="728" loading="lazy" decoding="async"}
{% include caption.html content="Signal de Laplace d'origine." %}

À titre de comparaison, une gaussienne aurait un sommet plus arrondi et des queues plus fines.

![Signal gaussien]({{ "/gaussian-signal.png" | prepend: page.imgpath }}){: width="878" height="726" loading="lazy" decoding="async"}
{% include caption.html content="Une loi gaussienne à titre de comparaison." %}

<div class="divider"></div>

## Comment reproduire cela ?

Le notebook Colab que j'ai utilisé pour rédiger cet article est disponible [ici](https://github.com/skzv/vizier-blog-post/blob/main/vizier_blog_post.ipynb). J'ai utilisé l'API Vertex AI Vizier de GCP parce qu'elle génère des graphiques sympas comme ceux inclus dans cet article, mais attention : cela peut coûter cher (1 $ par essai). Vizier est également open source et disponible [ici](https://github.com/google/vizier).
