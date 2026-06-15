---
title: "I built a machine that turns AI papers into interactive explainers"
updated: 2026-06-05 00:00
imgpath: /assets/img/intuitivepapers
previewurl: /home.png
---

{% include description.html content="LLM paper summaries are shallow and subtly wrong about the parts that matter. I wanted the opposite, so I built a pipeline that makes them, and pointed it at twenty papers." %}

I read a lot of machine learning papers, and I have a complicated relationship with them. A good paper is dense on purpose. It's written for reviewers who already know the field, so it spends its pages on what's new and assumes you can fill in everything underneath. Which is great if you can, and miserable if you can't. Most papers are a thin layer of genuinely new idea sitting on a tall stack of prerequisites the authors politely decline to explain. So you read with a dozen tabs open, chasing a definition back through two earlier papers before the new one even starts to make sense.

The obvious move in 2026 is to paste the PDF into a chatbot and ask for a summary. I do this all the time. It is fine, and it is also where I keep getting burned. The summary reads smoothly and gets the shape right, but the moment a real detail matters (which direction a sign goes, whether something is exact or just approximate, what the actual variable being updated is), it's either vague or confidently wrong. You can't tell which from the prose, because the wrong bits are written just as smoothly as the right ones. So you go read the paper anyway, and the summary turned out to be a tax, not a shortcut.

What I actually wanted was the thing a really good teacher gives you. Intuition first, then the math. One analogy per hard idea, with a note about where it breaks. A picture you can poke at. And every claim checked against the source, because the reason to build it at all is to be more trustworthy than the paper-shaped guesses, not less.

## The one I made by hand

A couple of weeks ago I wrote one of these by hand: a [full explainer of the DiffusionBlocks paper](https://intuitivepapers.ai/diffusionblocks/). The idea behind the paper is genuinely lovely: the residual connections already sitting in every Transformer are, if you squint, the steps of a diffusion model. To explain it properly I had to first build up diffusion, score matching, ODEs, and the residual-as-ODE-step trick, each with its own interactive figure you could drag around.

It came out well. It also took the better part of a week, and the most valuable part wasn't the writing. It was the checking. To get the math right I went back to the original sources, and along the way the verification turned up a sign error in the paper's own equations, the kind of thing a summary would have cheerfully reproduced and I would have cheerfully believed. That's when it clicked: the checking was the real work, and the prose and figures were just how you hand it over.

So the obvious, slightly unhinged thought: could I build a machine that does the whole thing? Not the easy, useless version ("summarize a paper") but the full week of work: read the sources, verify the claims, design the figures, write it like a human, then tear the draft apart looking for anything wrong or slop-flavored, and fix it.

## intuitivepapers.ai

That machine is [intuitivepapers.ai](https://intuitivepapers.ai), and it's real and live. There are twenty explainers up right now, and a new one lands most days.

![intuitivepapers.ai homepage]({{ "/home.png" | prepend: page.imgpath }})
{% include caption.html content="The pitch, minus the hedging: deep, interactive explainers, intuition first, every claim checked against the source." %}

The catalogue is the stuff you'd expect someone who reads this field to want explained properly: Attention, BERT, ResNet, GANs, VAEs, CLIP, the diffusion lineage from DDPM to flow matching, the RL and alignment papers like PPO and DPO, the efficiency work like LoRA and Mamba and Mistral, and the load-bearing training papers like Adam and Chinchilla.
![the intuitivepapers library]({{ "/library.png" | prepend: page.imgpath }})
{% include caption.html content="Twenty papers, each card a live preview of the signature figure from the explainer behind it." %}

## What one of them feels like to read

Open one and it reads like a long, careful essay with the math built up in the right order. Down the side is what I think of as the concept tower: the prerequisite ideas, listed in dependency order, so you can see the scaffold before you climb it. At the top, a little badge tells you it's verified and roughly how long the read is. And scattered through the prose, exactly where you need them, are the figures.

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

It goes roughly like this. First it ingests the paper as ground truth: it pulls the real source, converts the math properly, and keeps the equations verbatim, because the one thing you must never do is let a model paraphrase an equation from memory. Then it fans out: one agent per prerequisite concept, each one going to the primary literature to verify the definitions, the signs, the constants, and flag anywhere the paper's conventions disagree with the textbooks. When the paper's own words are ambiguous about some mechanical detail, it goes and reads the authors' code, which is the real ground truth and settles arguments the PDF can't. A separate editor cross-checks all of that into one reference card, and the writer is only allowed to write from the card, not from the paper directly.

Then it designs the figures and writes the essay in a specific voice with a long list of forbidden tells. The step that does the real work comes next: the draft goes to a panel of adversarial critics. One checks every equation and number against the reference card. One reads it as a skeptic hunting for hand-waving. One simulates a confused reader and asks every "but why?" the draft skips. One checks that the math actually renders and that the figures show what the prose claims. Their notes get consolidated, the false alarms thrown out, and the real fixes applied. The only hard gate at the end is whether the build still compiles.

It all runs on a timer on the Mac mini under my desk: it picks the next paper off a queue, runs all of that, and ships the result. By default there's no human in the loop (generate, verify, build, deploy), and when I want to look first I flip a flag and it stops at a draft instead. The same little machine, pointed at one paper after another. The [reference figures](https://intuitivepapers.ai/mamba/) it builds are genuinely custom each time, like this Mamba block drawn from scratch:

![a Mamba block figure]({{ "/mamba-block-fig.jpeg" | prepend: page.imgpath }})
{% include caption.html content="A Mamba block, broken down. There are well over a hundred of these custom figures across the library, all hand-drawable canvas, no charting library in sight." %}

The critics catch a lot before a page ships, but the machine is still grading its own homework. So every explainer has a feedback form at the bottom, and when a real reader catches something it missed, I fold the fix into that page and into the rules the next paper gets written by.

## Where it's going

What I'm betting on is straightforward: the supply of papers is exploding and the supply of *understanding* is not, because understanding is bottlenecked on human teaching time, and there has never been enough of that to go around. If a machine can do the patient, checkable, figure-by-figure work of a good teacher, and verify itself harder than a tired human would, then the bottleneck moves.

I don't think the summary chatbots are wrong to exist. They're just aimed one notch too low. A summary tells you a paper happened; I wanted the thing that lets you turn around and explain it to someone else.

Twenty papers are up at [intuitivepapers.ai](https://intuitivepapers.ai). If there's one you've been meaning to actually understand, there's a queue where you can request it or upvote someone else's, and the machine under my desk works down the list. I built it for myself, mostly. If it saves someone else a few hours of jumping between PDFs, even better.
