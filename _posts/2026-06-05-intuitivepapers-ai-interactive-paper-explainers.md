---
title: "I built a machine that turns AI papers into interactive explainers"
updated: 2026-06-05 00:00
imgpath: /assets/img/intuitivepapers
previewurl: /home.png
---

{% include description.html content="LLM paper summaries are shallow and subtly wrong about the parts that matter. I wanted the opposite, so I built a pipeline that makes them, and pointed it at twenty papers." %}

I read a lot of machine learning papers, and I have a complicated relationship with them. A good paper is dense on purpose: written for reviewers who already know the field, it spends its pages on what's new and assumes you can fill in the rest. Great if you can, miserable if you can't. Most papers are a thin layer of new idea on a tall stack of prerequisites the authors politely decline to explain, so you read with a dozen tabs open, chasing a definition back through two earlier papers before the new one makes sense.

The obvious move in 2026 is to paste the PDF into a chatbot and ask for a summary. I do this all the time. It's fine, and it's also where I keep getting burned. The summary reads smoothly and gets the shape right, but the moment a real detail matters (which way a sign goes, whether something is exact or approximate, what variable is actually being updated), it's vague or confidently wrong. You can't tell which from the prose, because the wrong bits read just as smoothly as the right ones. So you go read the paper anyway, and the summary was a tax, not a shortcut.

What I actually wanted was what a good teacher gives you. Intuition first, then the math. One analogy per hard idea, with a note about where it breaks. A picture you can poke at. And every claim checked against the source, because it's only worth building if it's more trustworthy than a chatbot guess, not less.

## The one I made the hard way

A couple of weeks ago I made one of these myself: a [full explainer of the DiffusionBlocks paper](https://intuitivepapers.ai/diffusionblocks/), written with Claude and reworked draft after draft until it was right. The idea behind the paper is genuinely lovely: the residual connections already sitting in every Transformer are, if you squint, the steps of a diffusion model. To explain it properly I had to first build up diffusion, score matching, ODEs, and the residual-as-ODE-step trick, each with its own interactive figure you could drag around.

It came out well. It also took the better part of a week, and the most valuable part wasn't the writing. It was the checking. Getting the math right meant going back to the original sources, and that turned up a sign error in the paper's own equations, the kind of thing a summary would reproduce and I'd believe. That's when it clicked: the checking was the real work, and the prose and figures were just how you hand it over.

So the obvious, slightly unhinged thought: could I build a machine that does the whole thing? Not the easy, useless version ("summarize a paper") but the full week of work: read the sources, verify the claims, design the figures, write it like a human, then tear the draft apart looking for anything wrong or slop-flavored, and fix it.

## intuitivepapers.ai

That machine is [intuitivepapers.ai](https://intuitivepapers.ai), and it's real and live. There are twenty explainers up right now, and a new one lands most days.

![intuitivepapers.ai homepage]({{ "/home.png" | prepend: page.imgpath }})
{% include caption.html content="The pitch, minus the hedging: deep, interactive explainers, intuition first, every claim checked against the source." %}

The catalogue is what you'd expect someone who reads this field to want explained properly: Attention, BERT, ResNet, GANs, VAEs, CLIP, the diffusion lineage from DDPM to flow matching, RL and alignment work like PPO and DPO, efficiency work like LoRA, Mamba, and Mistral, and training papers like Adam and Chinchilla.
![the intuitivepapers library]({{ "/library.png" | prepend: page.imgpath }})
{% include caption.html content="Twenty papers, each card a live preview of the signature figure from the explainer behind it." %}

## What one of them feels like to read

Open one and it reads like a long, careful essay with the math built up in the right order. Down the side is the concept tower: the prerequisite ideas in dependency order, so you can see the scaffold before you climb it. At the top, a badge tells you it's verified and how long the read is. And scattered through the prose, right where you need them, are the figures.

![a figure inside the PPO explainer]({{ "/ppo-figure.png" | prepend: page.imgpath }})
{% include caption.html content="The clipped objective from PPO. Drag the ratio, flip the sign of the advantage, watch the gradient die outside the trust band. The concept tower is on the left." %}

The figures are the part I'm proudest of, because they're what a summary can never give you. Every one is a small interactive thing you drive yourself: a slider that morphs a distribution into noise, a vector field that sharpens as you turn a knob, a contrastive grid you can light up cell by cell. You don't read that PPO clips the policy ratio; you grab the ratio, drag it past the edge of the trust band, and watch the curve go flat and the gradient die.

Figures aren't the only thing a chatbot summary leaves out. Where an idea reads more clearly in code than in symbols, an explainer shows a few real lines of the implementation, the part that turns the equation into something that runs.

It all works on a phone too, which is where a lot of reading actually happens.

![an explainer on a phone]({{ "/mobile-ppo.png" | prepend: page.imgpath }}){:height="520px"}
{% include caption.html content="An explainer on a phone, verified badge and read time up top, the same figures inline." %}

One of those figures up close, CLIP's contrastive grid:

![CLIP contrastive grid]({{ "/clip-grid.png" | prepend: page.imgpath }})
{% include caption.html content="Every image scored against every caption. The bright diagonal is the real pairs CLIP learns to pull together; everything off it is an impostor it pushes apart. Flip the toggle and watch the softmax steer onto the diagonal." %}

## How the machine actually works

The thing that makes this more than a fancy prompt is that it isn't one. A single "explain this paper" call gives you exactly the slop I was complaining about. The quality comes from running it as a pipeline of separate steps, most of which exist to catch the others lying.

It goes roughly like this. First it ingests the paper as ground truth: it pulls the real source, converts the math, and keeps the equations verbatim, because the one thing you must never do is let a model paraphrase an equation from memory. Then it fans out, one agent per prerequisite concept, each going to the primary literature to verify the definitions, signs, and constants, and to flag where the paper's conventions disagree with the textbooks. When the paper's words are ambiguous about a mechanical detail, it reads the authors' code, which settles arguments the PDF can't. A separate editor folds all of that into one reference card, and the writer works only from the card, not the paper.

Then it designs the figures and writes the essay in a specific voice with a long list of forbidden tells. The step that does the real work comes next: the draft goes to a panel of adversarial critics. One checks every equation and number against the reference card. One reads it as a skeptic hunting for hand-waving. One simulates a confused reader and asks every "but why?" the draft skips. One checks that the math renders and the figures show what the prose claims. Their notes get consolidated, the false alarms thrown out, the real fixes applied. The only hard gate at the end is whether the build compiles.

It all runs on a timer on the Mac mini under my desk: it picks the next paper off a queue, runs all of that, and ships the result. By default no human is in the loop (generate, verify, build, deploy); when I want to look first, I flip a flag and it stops at a draft. The same little machine, pointed at one paper after another. The [reference figures](https://intuitivepapers.ai/mamba/) it builds are custom each time, like this Mamba block drawn from scratch:

![a Mamba block figure]({{ "/mamba-block-fig.jpeg" | prepend: page.imgpath }})
{% include caption.html content="A Mamba block, broken down. There are well over a hundred of these custom figures across the library, all hand-drawable canvas, no charting library in sight." %}

The critics catch a lot before a page ships, but the machine is still grading its own homework. So every explainer has a feedback form at the bottom, and when a real reader catches something it missed, I fold the fix into that page and into the rules the next paper gets written by.

## Where it's going

What I'm betting on is simple: the supply of papers is exploding and the supply of *understanding* isn't, because understanding is bottlenecked on teaching time, and there's never been enough of that. If a machine can do the patient, figure-by-figure work of a good teacher and check itself harder than a tired human would, the bottleneck moves.

I don't think the summary chatbots are wrong to exist. They're just aimed one notch too low. A summary tells you a paper happened; I wanted the thing that lets you turn around and explain it to someone else.

Twenty papers are up at [intuitivepapers.ai](https://intuitivepapers.ai). If there's one you've been meaning to actually understand, there's a queue where you can request it or upvote someone else's, and the machine under my desk works down the list. I built it for myself, mostly. If it saves someone else a few hours of jumping between PDFs, even better.
