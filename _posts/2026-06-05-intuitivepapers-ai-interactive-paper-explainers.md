---
title: "I built a machine that turns AI papers into interactive explainers"
updated: 2026-06-05 00:00
imgpath: /assets/img/intuitivepapers
previewurl: /home.png
---

{% include description.html content="LLM paper summaries are shallow and subtly wrong about the parts that matter. I wanted the opposite, so I built a pipeline that makes them, and pointed it at twenty papers." %}

I read a lot of machine learning papers. A good one is dense on purpose: written for reviewers who know the field, it spends its pages on what's new and assumes you can fill in the rest. Most are one new idea resting on prerequisites the authors don't explain, so you read with a dozen tabs open, chasing a definition back through two earlier papers before the new one makes sense.

The 2026 move is to paste the PDF into a chatbot and ask for a summary. I do it all the time, and it keeps failing me. The summary reads smoothly and gets the shape right, but when a real detail matters (which way a sign goes, whether something is exact or approximate, what variable is updated) it goes vague or confidently wrong, and you can't tell which from the prose. So you read the paper anyway.

I wanted what a good teacher gives you: intuition first, then the math, one analogy per hard idea with a note on where it breaks, a figure you can interact with, and every claim checked against the source, so it's more trustworthy than a chatbot guess.

## The one I made by iterating

A couple of weeks ago I made one myself with Claude, over about a week of drafts: a [full explainer of the DiffusionBlocks paper](https://intuitivepapers.ai/diffusionblocks/). Its idea is that the residual connections already in every Transformer are the steps of a diffusion model. To explain it I first had to build up diffusion, score matching, ODEs, and the residual-as-ODE-step, each with its own interactive figure.

The checking mattered more than the writing. Getting the math right meant going back to the original sources, and that turned up a sign error in the paper's own equations, the kind of thing a summary would reproduce and I'd believe. So I wondered whether I could build a machine that does the week of work: read the sources, verify the claims, design the figures, write it the way a person would, then go back through the draft for anything wrong and fix it.

## intuitivepapers.ai

I put that machine live at [intuitivepapers.ai](https://intuitivepapers.ai). There are twenty explainers up, and a new one goes up most days.

![intuitivepapers.ai homepage]({{ "/home.png" | prepend: page.imgpath }})
{% include caption.html content="Deep, interactive explainers, intuition first, every claim checked against the source." %}

The catalogue is what someone who reads this field would want explained properly: Attention, BERT, ResNet, GANs, VAEs, CLIP, the diffusion lineage from DDPM to flow matching, PPO and DPO, LoRA, Mamba, Mistral, Adam, and Chinchilla.
![the intuitivepapers library]({{ "/library.png" | prepend: page.imgpath }})
{% include caption.html content="Twenty papers, each card a live preview of the signature figure from the explainer behind it." %}

## Reading one

Each one reads as a long, careful essay with the math built up in order. Down the side is the concept tower: the prerequisite ideas in dependency order. A badge at the top marks it verified and gives the read time. The figures sit in the prose where you need them.

![a figure inside the PPO explainer]({{ "/ppo-figure.png" | prepend: page.imgpath }})
{% include caption.html content="The clipped objective from PPO. Drag the ratio, flip the sign of the advantage, watch the gradient go to zero outside the trust band. The concept tower is on the left." %}

The figures are what I'm proudest of, because a summary can't give you them. Each one is interactive and you drive it yourself: a slider that morphs a distribution into noise, a vector field that sharpens as you turn a knob, a contrastive grid you can light up cell by cell. You don't read that PPO clips the policy ratio; you drag the ratio past the edge of the trust band and watch the gradient go to zero.

Where an idea reads more clearly in code than in symbols, an explainer shows a few real lines of the implementation.

It works on a phone, which is where a lot of reading happens.

![an explainer on a phone]({{ "/mobile-ppo.png" | prepend: page.imgpath }}){:height="520px"}
{% include caption.html content="An explainer on a phone, verified badge and read time up top, the same figures inline." %}

One of those figures up close, CLIP's contrastive grid:

![CLIP contrastive grid]({{ "/clip-grid.png" | prepend: page.imgpath }})
{% include caption.html content="Every image scored against every caption. The bright diagonal is the real pairs CLIP pulls together; everything off it gets pushed apart. Flip the toggle and watch the softmax concentrate on the diagonal." %}

## How the machine works

A single explain-this-paper call gives you the shallow, subtly wrong summary I was complaining about. The quality comes from running it as a pipeline of separate steps, most of which exist to catch the others' errors.

First it ingests the paper as ground truth, pulling the real source, converting the math, and keeping the equations verbatim, because a model must never paraphrase an equation from memory. Then it fans out, one agent per prerequisite concept, each going to the primary literature to verify definitions, signs, and constants, and to flag where the paper's conventions disagree with the textbooks. When the words are ambiguous about a mechanical detail, it reads the authors' code, which settles what the PDF can't. An editor folds all of that into one reference card, and the writer works only from the card.

Then it designs the figures and writes the essay in a specific voice with a long list of forbidden tells. Next the draft goes to a panel of adversarial critics: one checks every equation and number against the reference card, one reads as a skeptic hunting for hand-waving, one simulates a confused reader and asks every "but why?" the draft skips, and one checks that the math renders and the figures show what the prose claims. Their notes get consolidated, the false alarms thrown out, the real fixes applied. The only hard gate at the end is whether the build compiles.

It runs on a timer on the Mac mini under my desk: it picks the next paper off a queue, runs all of that, and ships the result. By default no human is in the loop (generate, verify, build, deploy); when I want to look first, I flip a flag and it stops at a draft. The [reference figures](https://intuitivepapers.ai/mamba/) it builds are custom each time, like this Mamba block drawn from scratch:

![a Mamba block figure]({{ "/mamba-block-fig.jpeg" | prepend: page.imgpath }})
{% include caption.html content="A Mamba block, broken down. There are well over a hundred custom figures across the library, all hand-drawn canvas, no charting library." %}

The critics catch a lot before a page ships, but the machine is still checking its own work. So every explainer has a feedback form at the bottom, and when a reader catches something it missed, I fold the fix into that page and into the rules the next paper gets written by.

## Where it's going

The supply of papers is exploding and the supply of understanding isn't, because understanding is bottlenecked on teaching time, and there's never been enough of that. If a machine can do the patient, figure-by-figure work of a good teacher and check itself harder than a tired human would, the bottleneck moves.

The summary chatbots aren't wrong to exist. They're aimed one notch too low. A summary tells you a paper happened; I wanted the thing that lets you explain it to someone else.

Twenty papers are up at [intuitivepapers.ai](https://intuitivepapers.ai). If there's one you've been meaning to understand, there's a queue where you can request it or upvote someone else's, and the machine under my desk works down the list. I built it for myself, mostly. If it saves someone else a few hours of jumping between PDFs, even better.
