---
layout: post
lang_code: fr
locale: fr_FR
ref: ccmux-tmux-manager-for-ai-coding-agents
date: 2026-06-05 00:00:00 -0700
last_modified_at: 2026-11-25 00:00
permalink: /fr/ccmux-tmux-manager-for-ai-coding-agents
title: "ccmux : Gérer des agents de programmation IA sur plusieurs appareils"
imgpath: /assets/img/ccmux
previewurl: /preview.png
description: "Comment j'ai construit ccmux avec des amis pour gérer des agents de programmation IA sur plusieurs machines grâce à tmux, Tailscale, Mosh, un tableau de bord terminal en Go et une application iOS native."
image: /assets/img/ccmux/preview.png
image_width: 1200
image_height: 630
image_alt: "Tableau de bord ccmux pour gérer des sessions d'agents de programmation"
mathjax: false
tags: [ai-tools, systems]
---

{% include description.html content="Un gestionnaire de sessions tmux construit avec des amis pour suivre des agents de programmation sur plusieurs machines et les piloter depuis mon téléphone." %}

J'ai généralement une dizaine d'agents de programmation qui tournent en même temps entre mon Mac mini et mon ordinateur portable. Maintenir les sessions actives en arrière-plan avec tmux est assez simple ; la vraie pénibilité, c'est de garder le fil : se rappeler sur quelle machine j'ai lancé telle tâche, me connecter en SSH pour vérifier si Claude travaille encore ou s'il est bloqué depuis une heure sur une question oui/non, et ne disposer d'aucun moyen pratique de lui répondre quand je ne suis pas devant mon bureau.

Ce que je voulais, c'était lancer une session sur le Mac mini, m'éloigner, recevoir une notification sur mon téléphone dès que l'agent avait besoin d'une réponse, lui répondre depuis là, puis reprendre cette même session plus tard sur mon portable sans avoir à taper toute une série de commandes SSH et tmux entre-temps.

Avec Daniel Mandragona et Mike Choi, j'ai donc construit [ccmux](https://ccmux.ai/), un gestionnaire de sessions tmux multi-appareils conçu pour les agents de programmation IA. Je détaille ci-dessous son fonctionnement, la façon dont les briques s'assemblent et ce que nous avons développé pour mobile.

<div style="text-align:center">
  <video autoplay loop muted playsinline disableRemotePlayback preload="metadata" width="1280" height="640" poster="/assets/video/ccmux/hero-poster.webp" style="width:100%;height:auto">
    <source src="/assets/video/ccmux/hero.mp4" type="video/mp4">
    Interface terminal de ccmux affichant des sessions d'agents de programmation réparties sur plusieurs projets
  </video>
</div>
{% include caption.html content="Un rapide aperçu de ccmux, avec cinq sessions d'agents en cours sur quatre projets." %}

## Le tableau de bord

Quand vous ouvrez `ccmux`, vous obtenez une liste unique de toutes les sessions d'agents de programmation en cours sur l'ensemble de vos machines, avec un code couleur selon l'état de chaque agent : actif (en train de générer du texte), inactif ou en attente d'une réponse de votre part. Sur la droite figurent un panneau Appareils listant les autres machines de votre réseau, ainsi qu'un panneau d'utilisation qui suit le quota de 5 heures de Claude afin de voir quand vous approchez de la limite.

<div style="text-align:center">
  <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1280" height="640" poster="/assets/video/ccmux/dashboard-poster.webp" style="width:100%;height:auto">
    <source src="/assets/video/ccmux/dashboard.mp4" type="video/mp4">
    Tableau de bord ccmux avec l'état des sessions, les appareils connectés et l'utilisation de Claude
  </video>
</div>
{% include caption.html content="Le tableau de bord. Les lignes de session sont colorées selon leur état, avec les appareils connectés et l'utilisation de Claude sur la droite." %}

Pour plonger dans n'importe quelle session, il suffit de la sélectionner et d'appuyer sur `Enter`, ce qui vous rattache directement à la session tmux de l'agent. Quand vous avez terminé, `Ctrl-b d` détache la session et vous ramène au tableau de bord pendant que l'agent continue de tourner sur la machine qui l'a lancé.

<div style="text-align:center">
  <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1280" height="640" poster="/assets/video/ccmux/attach-detach-poster.webp" style="width:100%;height:auto">
    <source src="/assets/video/ccmux/attach-detach.mp4" type="video/mp4">
    Attachement à une session tmux et retour au tableau de bord ccmux
  </video>
</div>
{% include caption.html content="Appuyer sur Enter pour s'attacher à une session, puis Ctrl-b d pour se détacher et revenir au tableau de bord." %}

<div class="divider"></div>

## Sous le capot

Nous voulions que tmux reste la véritable source de vérité plutôt que d'enfermer les sessions dans un wrapper propriétaire. Si vous cessez un jour d'utiliser ccmux, chaque agent en cours d'exécution reste une session tmux tout à fait classique à laquelle vous pouvez vous rattacher manuellement.

Chaque machine exécute deux binaires Go :

- `ccmux` est l'interface terminal avec laquelle vous interagissez, construite avec la pile Bubble Tea de [Charm](https://charm.sh/).
- `ccmuxd` est un petit démon en arrière-plan qui interroge tmux toutes les deux secondes, détermine l'état de chaque session et expose cet état via un socket Unix local ainsi qu'une API HTTP optionnelle.

La détection d'état est l'une des parties les plus délicates. Tant qu'un agent diffuse activement de la sortie, le démon le marque comme actif. Dès qu'une invite de saisie apparaît et que le panneau reste silencieux pendant quelques secondes, le démon passe la session à l'état `needs_input`. Tant que des sessions sont actives, `ccmuxd` maintient aussi un verrou `caffeinate` sous macOS (ou `systemd-inhibit` sous Linux) afin qu'un Mac mini ou un ordinateur portable ne se mette pas en veille au milieu d'une longue tâche — avec un seuil de batterie sur portable pour éviter qu'une machine oubliée ne se vide complètement.

Pour la découverte multi-machines, nous avons utilisé [Tailscale](https://tailscale.com/). À chaque rafraîchissement, ccmux exécute `tailscale status --json`, sonde les machines joignables sur le port `7474` (`/v1/health`) et fusionne automatiquement dans le tableau de bord tous les démons qui répondent. Ainsi, pas besoin de maintenir une liste d'hôtes ni d'exposer le moindre port sur l'Internet public. Comme la couche WireGuard de Tailscale assure déjà le chiffrement et l'identité des appareils, le démon parle en HTTP en clair sur l'adresse IP du tailnet et rejette les requêtes comportant des en-têtes navigateur `Origin` ou `Sec-Fetch-*` afin qu'aucune page web ne puisse lui parler.

Lorsque vous appuyez sur `Enter` sur une session distante, ccmux lance un véritable `tmux attach` via SSH ou Mosh directement vers l'hôte où tourne l'agent, au lieu de relayer le terminal à travers une couche intermédiaire. Claude Code est l'agent par défaut, mais ccmux prend aussi en charge Codex, Cursor, Antigravity, Gemini CLI et d'autres en enregistrant un choix d'agent par projet et en utilisant les options de lancement et de reprise propres à chaque outil.

<div class="divider"></div>

## L'utiliser depuis un téléphone

Piloter mes agents depuis mon téléphone était la raison principale qui m'a poussé à créer cet outil. Le souci avec un simple SSH sur mobile, c'est que les connexions coupent sans arrêt — dès qu'on passe du Wi-Fi au réseau cellulaire, qu'on verrouille l'écran ou qu'on traverse une zone blanche. [Mosh](https://mosh.org/) gère cela bien mieux, car il survit aux changements de réseau comme à la mise en veille et reprend la session exactement où elle en était dès que le signal revient.

Lorsque ccmux détecte un terminal étroit (moins de 120 colonnes), il replie automatiquement le tableau de bord en une seule colonne déroulante afin que la même interface reste agréable sur un écran de téléphone :

<div style="text-align:center">
  <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="430" height="900" poster="/assets/video/ccmux/phone-poster.webp" style="max-height:420px;width:auto">
    <source src="/assets/video/ccmux/phone.mp4" type="video/mp4">
    Tableau de bord ccmux dans un terminal mobile étroit
  </video>
</div>
{% include caption.html content="L'interface terminal qui se replie en mise en page mobile via Mosh." %}

Les notifications se sont avérées très simples à mettre en place. Dès qu'une session passe à l'état `needs_input`, le démon déclenche la cloche standard du terminal (`BEL`). Les applications de terminal iOS qui surveillent cette cloche la convertissent directement en notification push, sans aucun relais cloud au milieu. Dans [Moshi](https://getmoshi.app/) — un client Mosh pour iOS — ccmux peut également relier `moshi-hook` aux hooks de Claude Code pour envoyer des notifications catégorisées (validation requise vs tâche terminée) et vous permettre d'ouvrir directement la session d'un simple tap.

![ccmux exécuté dans l'application terminal Moshi sur un iPhone]({{ "/moshi.webp" | prepend: page.imgpath }}){: width="610" height="1323" loading="lazy" decoding="async" style="max-height:520px;width:auto"}
{% include caption.html content="ccmux dans Moshi sur un iPhone." %}

Malgré tout, manipuler une interface terminal sur un écran de téléphone peut vite sembler à l'étroit, surtout quand on veut simplement jeter un œil à ses sessions ou rédiger un prompt un peu long. Nous avons donc aussi construit une application iOS native qui discute directement avec `ccmuxd` via Tailscale. On associe son téléphone en lançant `ccmux pair` sur son Mac et en scannant le QR code affiché dans le terminal. À partir de là, l'application reçoit en direct l'état des sessions en SSE et s'attache aux panneaux tmux interactifs via un pont PTY WebSocket rendu avec SwiftTerm.

<div style="text-align:center">
<img src="{{ "/ios-dashboard.webp" | prepend: page.imgpath }}" alt="Application iOS ccmux listant les sessions d'agents de programmation" width="1206" height="2622" loading="lazy" decoding="async" style="display:inline-block;margin:0 6px;max-height:460px;width:auto" //>
<img src="{{ "/ios-terminal.webp" | prepend: page.imgpath }}" alt="Terminal tmux interactif dans l'application iOS ccmux" width="1206" height="2622" loading="lazy" decoding="async" style="display:inline-block;margin:0 6px;max-height:460px;width:auto" //>
</div>
{% include caption.html content="L'application iOS native : tableau de bord des sessions à gauche, terminal en direct à droite." %}

Sur iOS, nous nous sommes vite heurtés à un constat : piloter un terminal et rédiger un prompt exigent des claviers radicalement opposés. Un terminal demande des frappes brutes, des flèches directionnelles et une touche retour arrière rapide sans que la correction automatique ne vienne tout gâcher, alors qu'écrire tout un paragraphe d'instructions pour un agent sans correction automatique ni sélection de texte devient vite pénible. Nous avons donc ajouté directement dans la vue terminal un sélecteur entre le mode Raw (chaque touche part directement au PTY) et le mode Chat (une zone de saisie classique façon iMessage pour composer des prompts).

<div style="text-align:center">
  <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="400" height="870" poster="/assets/video/ccmux/ios-mode-toggle-poster.webp" style="max-height:460px;width:auto">
    <source src="/assets/video/ccmux/ios-mode-toggle.mp4" type="video/mp4">
    Bascule entre les modes de saisie Raw et Chat dans l'application iOS ccmux
  </video>
</div>
{% include caption.html content="Passage du mode terminal brut (Raw) au mode Chat pour rédiger des prompts." %}

<div class="divider"></div>

## Remarques finales

J'ai utilisé ccmux quotidiennement pendant des mois, et quelques autres personnes se sont mises à l'utiliser aussi. Durant ces mêmes mois, de nombreux autres outils dédiés à la gestion d'agents de programmation ont vu le jour, y compris des projets financés avec des équipes à temps plein. En tant que projet personnel mené à trois, il n'avait pas vraiment de sens de tenter de suivre le rythme en tant que produit commercial, nous avons donc choisi de ne pas le pousser dans cette direction. Je continue néanmoins de bricoler sur le dépôt de temps en temps, et je voulais écrire cet article pour documenter ce que nous avons construit.

Tout reste en ligne sur [ccmux.ai](https://ccmux.ai/), et le code source est disponible sur [GitHub](https://github.com/skzv/ccmux) sous licence FSL-1.1-MIT. Si vous voulez l'essayer sur macOS ou Linux, vous pouvez l'installer et lancer l'assistant de configuration avec :

```bash
curl -fsSL https://raw.githubusercontent.com/skzv/ccmux/main/scripts/install.sh | sh
ccmux setup
```

La [documentation d'installation](https://ccmux.ai/docs/) explique comment connecter plusieurs machines via Tailscale et configurer l'accès mobile.
