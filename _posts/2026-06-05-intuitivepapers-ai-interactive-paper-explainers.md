---
title: "Interactive AI Paper Explainers with intuitivepapers.ai"
last_modified_at: 2026-11-25 00:00
imgpath: /assets/img/intuitivepapers
previewurl: /home.png
description: "How I built intuitivepapers.ai, an automated pipeline that turns machine learning papers into verified interactive explainers with custom canvas figures."
image: /assets/img/intuitivepapers/home.png
image_width: 1280
image_height: 820
image_alt: "intuitivepapers.ai interactive AI paper explainers"
tags: [machine-learning, ai-tools]
mathjax: false
---

{% include description.html content="Can we automate turning dense machine learning papers into verified, interactive explainers?" %}

Reading machine learning papers can be frustratingly slow. A paper usually spends its pages on whatever is new and assumes you already have the five prerequisite ideas fresh in your head, so half the time I end up jumping down a chain of older references before the actual paper makes sense.

The easy shortcut now is to drop the PDF into an LLM and ask for an explanation. I do that plenty, and it's helpful for a rough first pass, but it also gets subtle details wrong surprisingly often. A flipped sign in an equation, whether a derivation is exact or an approximation, or which variable is actually being updated can completely change what an algorithm is doing. And if you don't already know the paper well, it's really hard to notice those mistakes when the explanation otherwise sounds completely plausible.

What I wanted were explanations that build up the intuition and the math together, with figures you can actually play with. I saw how much difference that makes when I put together my [interactive gradient descent demo]({% post_url 2021-11-15-gradient-descent %}) and [Monte Carlo options pricing simulations]({% post_url 2021-12-17-monte-carlo-options-pricing %}) a few years ago - dragging a slider and watching an algorithm overshoot or converge teaches you things a static equation never really conveys.

## Starting With DiffusionBlocks

I started by building a single [explainer for Sakana AI's DiffusionBlocks paper](https://intuitivepapers.ai/diffusionblocks/) together with Claude. It took about a week of back-and-forth to get it into good shape. A lot of that time went into checking every equation back against the primary sources (like the EDM paper) and the authors' official GitHub repository.

While doing that, the verification caught a real sign error printed in the paper itself. The paper defines `Δσ = σ_prev - σ_next > 0` and writes its Eq. (4) Euler update with `(z - D)`, which actually steps *away* from the denoiser's prediction. Discretizing their Eq. (1) gives `(D - z)`, and sure enough, checking the authors' code (`model.py`) confirmed the implementation uses the corrected sign. An ordinary LLM summary would have just repeated the printed typo, and I probably never would have noticed.

That got me wondering how much of that whole week of work I could automate. Could I build a pipeline that pulls a paper's actual source, verifies the prerequisite math against primary literature and code, builds interactive figures, and reviews its own draft before publishing?

The result is [intuitivepapers.ai](https://intuitivepapers.ai/). It started out with twenty explainers - covering classics and newer papers like Attention, BERT, GANs, VAEs, CLIP, PPO, Mamba, and Adam - and has since grown past 150 explainers as the pipeline keeps running on a schedule.

![intuitivepapers.ai homepage with interactive machine learning paper explainers]({{ "/home.webp" | prepend: page.imgpath }}){: width="1280" height="820" fetchpriority="high" decoding="async"}
{% include caption.html content="The intuitivepapers.ai homepage." %}

![Library of twenty AI paper explainers with figure previews]({{ "/library.webp" | prepend: page.imgpath }}){: width="1280" height="2621" loading="lazy" decoding="async"}
{% include caption.html content="The original library of twenty papers. Each card renders a live preview of a figure from its explainer." %}

<div class="divider"></div>

## What an Explainer Looks Like

Each page starts with the prerequisites and builds up to the paper's main idea in dependency order. On desktop, a sidebar I call the concept tower maps out that dependency chain so you can see how the pieces stack together, and short code blocks connect the notation back to what actually runs.

My favourite part is the interactive figures. For example, PPO uses a clipped objective to stop policy updates from moving too far in a single step. In the figure below, you can drag the probability ratio and flip the sign of the advantage to watch exactly where the objective goes flat and stops producing a gradient. Playing with it for ten seconds makes the clipping logic click much faster than staring at the `min` expression on its own.

![Interactive PPO clipped objective showing the probability ratio and advantage]({{ "/ppo-figure.png" | prepend: page.imgpath }}){: width="1280" height="820" loading="lazy" decoding="async"}
{% include caption.html content="Exploring PPO's clipped objective by dragging the probability ratio and flipping the advantage sign." %}

Everything also scales down to work on a phone, which is where I end up doing a lot of my own reading:

![PPO paper explainer with an inline figure on a phone]({{ "/mobile-ppo.png" | prepend: page.imgpath }}){: width="400" height="840" loading="lazy" decoding="async" style="max-height:520px;width:auto"}
{% include caption.html content="The PPO explainer on a phone, with the same interactive figure inline." %}

Another example is CLIP, which trains image and text encoders to line up matching pairs. The interactive grid below scores every image against every caption in a batch - the bright diagonal holds the real pairs being pulled together, while everything off the diagonal is a mismatch being pushed apart.

![CLIP similarity grid comparing images with matching and mismatched captions]({{ "/clip-grid.png" | prepend: page.imgpath }}){: width="664" height="593" loading="lazy" decoding="async"}
{% include caption.html content="CLIP's image-caption similarity grid. Matching pairs sit along the diagonal." %}

<div class="divider"></div>

## How the Pipeline Works

A single "explain this paper" prompt produces the exact shallow summaries I was trying to get away from. To get more reliable output, I split the generation into a multi-stage pipeline with several automated checks sitting between the draft and deployment.

First, instead of letting a model paraphrase equations from memory, the pipeline fetches the arXiv HTML render (`arxiv.org/html/<id>`) and converts MathML to LaTeX with `pandoc` so the paper's equations and numbers are extracted verbatim.

Next, it verifies the prerequisite concepts against primary sources - checking definitions, signs, and conventions - and when the paper's prose leaves a detail ambiguous, it reads the authors' official code and cites the exact file and line numbers in a provenance panel at the bottom of the page. All of that gets consolidated into a verified reference card that the writer works from, rather than drafting straight from the raw paper.

From there, the pipeline builds custom interactive figures directly on HTML5 canvas (no charting library) and writes the explainer in dependency order, pairing equations with concrete worked numbers and short pseudocode.

Before anything ships, the draft goes through a mix of deterministic checks and model critics:

1. A free deterministic pass checks the prose for common AI tells, validates KaTeX syntax, verifies that narrow mobile versions of equations are mathematically equivalent to the desktop ones without overflowing a phone screen, and sweeps every interactive figure across desktop and mobile slider and button states to catch overlapping or clipped labels.
2. Separate critics then review accuracy against the paper, clarity, voice, figures, and rendered screenshots.
3. Confirmed findings go to a fix pass, the site rebuilds, and only the failing checks re-run for up to a few rounds. If anything still fails at the end, the pipeline fails closed and opens a draft PR instead of publishing automatically.

The whole pipeline runs on a daily `launchd` schedule on the Mac mini under my desk. Each morning it grabs the highest-upvoted paper from the queue (combining a curated backlog with reader submissions), waits out model session limits and resumes automatically if a run hits a quota reset, and deploys the finished page once the build and review gate pass cleanly.

Below is one of the custom canvas diagrams from the Mamba explainer, breaking down the pieces of a Mamba block.

![Diagram showing the components of a Mamba block]({{ "/mamba-block-fig.jpeg" | prepend: page.imgpath }}){: width="1280" height="900" loading="lazy" decoding="async"}
{% include caption.html content="A breakdown of a Mamba block, drawn on canvas for the Mamba explainer." %}

<div class="divider"></div>

## Final Notes

This started because I wanted to properly understand one paper, and turned into an experiment in seeing how far automated verification can go. Checking primary sources, reading the authors' code, and sweeping figure states catches a lot of subtle mistakes, though it definitely doesn't make the output infallible. Complex interactive figures are still the hardest part to get right reliably without human eyes, and occasionally a clunky explanation or edge-case bug slips through.

To help with that, every page has a feedback box at the bottom. Reader reports get used to fix errors on the page and tighten the pipeline's rules so future explainers avoid the same mistakes.

If there's an ML paper you've been meaning to work through properly, check out [intuitivepapers.ai](https://intuitivepapers.ai/). You can request a paper or upvote one in the queue, and if you spot an error in any of the explainers, please send it through the feedback box so I can get it fixed.
