---
title: "DiffusionBlocks: Residual Networks Are Secretly Diffusion Models"
description: "Residual connections are secretly the steps of a diffusion model. An intuitive, visual walk through diffusion, score matching, ODEs, and how DiffusionBlocks trains a deep network one block at a time — at a fraction of the memory."
updated: 2026-05-28 00:00
imgpath: /assets/img/diffusionblocks
previewurl: /diffusionblocks-preview.png
---

#### _What if you could train a deep network one slice at a time, with no backpropagation running through the whole thing?_

Here is a fact that has quietly shaped the last decade of AI: to train a network with backpropagation, you have to remember everything. Every layer's output, every intermediate activation, all of it kept alive in memory from the forward pass so the backward pass can use it to compute gradients. Train a 100-layer model and you pay for 100 layers' worth of activations at once. Memory grows linearly with depth, and that wall, not arithmetic and not data, is often what decides how big a model you can fit on your GPU.

People have tried to dodge this for years by chopping the network into pieces and training each piece on its own. If you only ever hold one piece in memory, depth stops being a memory problem. The trouble is that nobody could make it work well. The pieces never knew what the other pieces were doing, so the field made up *local* objectives, little stand-in goals for each block, and those stand-ins were always a bit arbitrary, and the resulting networks always came out worse than just biting the bullet and training end-to-end. Block-wise training has been one of those ideas that's obviously a good idea and stubbornly refuses to pay off.

[DiffusionBlocks](https://arxiv.org/abs/2506.14202), out of Sakana AI, is the best answer I've seen. The pitch is almost too tidy: *the residual connections already sitting in every modern Transformer are, mathematically, the steps of a diffusion model's denoising process.* And a diffusion model has a property nobody else's local objective had. Its training objective splits cleanly across noise levels. So each piece really can be trained on its own, against a principled target, and the pieces still add up to one network at the end.

To see why, we have to build up a small tower of ideas: what a diffusion model actually is, what the "score" is and why a denoiser secretly computes it, how generation is really just an ODE you solve with Euler's method, and why a residual layer is *the same shape* as one Euler step. None of these pieces is hard on its own. Stacked up, they explain the whole paper.

## The data lives on a thin sheet

Start with a picture I want you to keep in your head for the rest of this post. Imagine all the "real" things a model could produce, every photograph of a face, say, as points in an enormous space. A modest image has hundreds of thousands of pixels, so each image is a point in a space of hundreds of thousands of dimensions. The crucial intuition is that real images occupy almost none of it. Scramble the pixels randomly and you get static, essentially never a face. The faces sit on a thin, crumpled, lower-dimensional sheet, the *data manifold* (a manifold just means a lower-dimensional surface that looks like ordinary flat space up close, even though it curves and folds when you stand back), floating in a vast emptiness.

Generation is the problem of landing on that sheet. You start somewhere random in the void and you need a way to walk back onto the manifold. Diffusion models learn that walk by first studying its reverse: how the sheet dissolves into the void when you add noise.

The noising is as simple as it sounds. Take a clean point $$\mathbf{y}$$ and add Gaussian noise of standard deviation $$\sigma$$:

{%include math.html content="
\begin{align}
\mathbf{z}_\sigma = \mathbf{y} + \sigma\boldsymbol{\epsilon}, \qquad \boldsymbol{\epsilon}\sim\mathcal{N}(\mathbf{0},\mathbf{I}) \tag{1} \label{eq:noising}
\end{align}
"%}

That's the whole forward process in the *variance-exploding* (VE) convention this paper uses (the one Karras and collaborators settled on in their [EDM](https://arxiv.org/abs/2206.00364) paper). The name is worth unpacking, because it flags a convention you have to keep straight. Notice the signal $$\mathbf{y}$$ is never touched. It isn't shrunk or rescaled, it just sits there while a bigger and bigger cloud of noise is piled on top. The *variance* of the noise is what explodes as $$\sigma$$ grows. (The other popular convention, the one from the original DDPM line of work, instead shrinks the signal by $$\sqrt{\alpha}$$ as it adds noise, keeping the total variance pinned near one. Same family of ideas, different bookkeeping. The VE choice matters here because it's what keeps the algebra clean later, when we discover the residual connection hiding inside.)

So $$\sigma$$ is really a clock. At $$\sigma \approx 0$$ you have clean data; crank $$\sigma$$ up and structure washes out until you're left with a featureless Gaussian blob, pure noise, the same blob no matter what image you started from. That blob is where every diffusion model begins generation, and the manifold is where it has to end up.

Drag the slider and watch a spiral, our stand-in for "structured data," come apart:

<div id="db-noising"></div>

The spiral is gone by the time $$\sigma$$ is large, and that's the point. The forward direction destroys information; it's easy and requires no learning at all. All the intelligence lives in running it backward.

## The score: a compass that points toward data

To walk back toward the manifold, you'd love to have, at every point in the space, an arrow telling you which way the data is. That arrow exists, and it has a name.

Write $$p_\sigma$$ for the distribution of the noised data $$\mathbf{z}_\sigma$$ at level $$\sigma$$, the cloud you just watched the spiral dissolve into. The arrow we want is the gradient of its log-density, $$\nabla_{\mathbf{z}} \log p_\sigma(\mathbf{z})$$, and it's called the **score**. (Specifically the *Stein* score, the gradient with respect to the point in data space, not with respect to any model parameters. Keep that straight; "score" is an overloaded word.) At any location $$\mathbf{z}$$, it points in the direction in which the noised density increases fastest. A compass needle that always points uphill toward where the data is dense.

Two things make the score lovely to work with. First, it doesn't care about normalizing constants. A probability density has an annoying $$1/Z$$ out front to make it integrate to one, and $$Z$$ is usually a hopeless integral over the whole space. But the *gradient of the log* kills any constant: $$\nabla \log(p/Z) = \nabla \log p - \nabla \log Z$$, and that second term is zero. The score sidesteps the hardest part of probability.

Second, the score behaves exactly the way intuition demands as you change the noise level. At small $$\sigma$$ the density is sharp, concentrated tightly around the data, so the compass snaps decisively toward the nearest clump. At large $$\sigma$$ everything has blurred together into one broad hill, and the compass just points gently toward the global center of mass. Play with $$\sigma$$ and watch the field stiffen and relax:

<div id="db-score"></div>

If you had this vector field, generation would be easy: drop a particle in the noise and let the compass guide it home. So the entire game reduces to *estimating the score*. Which sounds hard, until you realize you already know how to do it, under a different name.

## Tweedie's formula: a denoiser is a score estimator

Suppose I hand you a noisy point $$\mathbf{z}_\sigma$$ and ask for your single best guess of the clean $$\mathbf{y}$$ it came from. "Best" in the least-squares sense means you should return the *average* of every clean point that could plausibly have been noised into this $$\mathbf{z}_\sigma$$, the conditional mean $$\mathbb{E}[\mathbf{y}\mid\mathbf{z}_\sigma]$$. Call that best guess $$D(\mathbf{z}_\sigma,\sigma)$$; it's a **denoiser**.

A result from the 1950s called **Tweedie's formula** says something convenient enough to be suspicious: for Gaussian noise, that best-guess denoiser and the score are the *same arrow*, up to a constant.

{%include math.html content="
\begin{align}
\nabla_{\mathbf{z}} \log p_\sigma(\mathbf{z}) = \frac{D(\mathbf{z},\sigma) - \mathbf{z}}{\sigma^2} \tag{2} \label{eq:tweedie}
\end{align}
"%}

Read it slowly. The left side is the score, the abstract, normalizer-free compass we said was the whole game. The right side is "your best guess of the clean image, minus where you currently are." Of course that difference points from your noisy point toward the clean data; dividing by $$\sigma^2$$ just sets the length. The direction of increasing plausibility *is* the direction from noisy toward denoised. Estimating the score and denoising an image are literally the same task.

It's worth seeing where this comes from, because the derivation is three lines and you know every move in it. The noised density is just the data blurred by a Gaussian, $$p_\sigma(\mathbf{z}) = \int \mathcal{N}(\mathbf{z};\mathbf{y},\sigma^2\mathbf{I})\,p(\mathbf{y})\,d\mathbf{y}$$. Differentiate in $$\mathbf{z}$$ (the only place $$\mathbf{z}$$ appears is inside the Gaussian), divide by $$p_\sigma(\mathbf{z})$$, and the integral collapses into a posterior average:

{%include math.html content="
\begin{align}
\nabla_{\mathbf{z}} \mathcal{N}(\mathbf{z};\mathbf{y},\sigma^2\mathbf{I}) = \mathcal{N}(\mathbf{z};\mathbf{y},\sigma^2\mathbf{I})\,\frac{\mathbf{y}-\mathbf{z}}{\sigma^2} \quad\Longrightarrow\quad \nabla_{\mathbf{z}} \log p_\sigma(\mathbf{z}) = \frac{\mathbb{E}[\mathbf{y}\mid\mathbf{z}] - \mathbf{z}}{\sigma^2}.
\end{align}
"%}

That posterior mean $$\mathbb{E}[\mathbf{y}\mid\mathbf{z}]$$ is exactly the best-guess denoiser $$D$$, so you've recovered eq $$\eqref{eq:tweedie}$$ with nothing fancier than the chain rule. The Gaussian is what makes the clean $$(\mathbf{y}-\mathbf{z})/\sigma^2$$ factor fall out; other noise families have their own Tweedie identity, but they lose this exact form.

And this matters, because one of these tasks is hard to set up and one is trivial. You cannot directly supervise "the score," since you don't have ground-truth arrows. But you can absolutely supervise a denoiser: take clean data, add noise *yourself* (so you know the answer), and train a network to undo it. That's a plain regression problem:

{%include math.html content="
\begin{align}
\mathcal{L}(\boldsymbol{\theta}) = \mathbb{E}_{\mathbf{y},\,\sigma,\,\boldsymbol{\epsilon}}\Big[\, w(\sigma)\,\big\lVert D_{\boldsymbol{\theta}}(\mathbf{y}+\sigma\boldsymbol{\epsilon},\,\sigma) - \mathbf{y} \big\rVert_2^2 \,\Big] \tag{3} \label{eq:loss}
\end{align}
"%}

Show the network a noised sample, ask it to predict the clean original, penalize the squared error. The weight $$w(\sigma)$$ just balances how much each noise level counts so no single $$\sigma$$ dominates the gradient. Train this and, by $$\eqref{eq:tweedie}$$, you've trained a score estimator for free.

Two caveats, since they'll come up. Tweedie's formula is an *exact* theorem about the ideal denoiser $$\mathbb{E}[\mathbf{y}\mid\mathbf{z}]$$; the "$$\approx$$" you'll see in the paper is only because a real trained network $$D_{\boldsymbol{\theta}}$$ approximates that ideal, not because the math is loose. And notice $$D_{\boldsymbol{\theta}}$$ predicts the *clean data* $$\mathbf{y}$$, not the noise $$\boldsymbol\epsilon$$ the way vanilla DDPM does. These are interchangeable reparameterizations, but it pays to know which one you're holding. There's one more thing the formula quietly implies: because the denoiser returns the *mean* over all candidate clean images, its output at high noise looks blurry, an average of many faces rather than a face. That's not a bug; a conditional expectation is supposed to look like that.

## Generation is an ODE you solve with Euler's method

We have a compass. Now we need to actually walk.

The clean way to state the walk is as a differential equation. There's a famous result (Song and collaborators, in the paper that unified diffusion models under [stochastic differential equations](https://arxiv.org/abs/2011.13456)) that the noising process can be reversed in two equivalent ways: a noisy, random one (an SDE) and a smooth, deterministic one that produces the exact same distribution of outcomes at every noise level. The deterministic version is called the **probability-flow ODE**, and for the VE convention it's strikingly simple:

{%include math.html content="
\begin{align}
\frac{d\mathbf{z}_\sigma}{d\sigma} = -\sigma\,\nabla_{\mathbf{z}} \log p_\sigma(\mathbf{z}_\sigma) \tag{4} \label{eq:pfode}
\end{align}
"%}

An ODE like this is just a rule that says "at this position and this noise level, here is the velocity." A *vector field*. To generate, you start at the top, a sample of pure noise at $$\sigma_{\max}$$, and integrate this velocity downward as $$\sigma$$ shrinks toward zero, and you land on the manifold. (The deterministic ODE and the random SDE share the same *marginal distributions* at every $$\sigma$$. That means if you ran either process many times and looked at the cloud of points at a given $$\sigma$$, you'd see the identical distribution, even though any single deterministic run traces a different path than any single random one.)

That shared-marginals fact is load-bearing, and it has a clean reason worth a sentence. As $$\sigma$$ grows, the VE process is just points doing a driftless random walk, so the density $$p_\sigma$$ obeys a diffusion (heat) equation. Any such spreading can be rewritten as a *continuity equation*, the bookkeeping a physicist uses for a fluid that is neither created nor destroyed: the density changes only because probability flows somewhere, at some velocity. Solve for the velocity that reproduces the heat equation's spreading and it comes out to exactly $$-\sigma\,\nabla_{\mathbf{z}}\log p_\sigma$$, which is eq $$\eqref{eq:pfode}$$. The random walk and the deterministic flow are two ways to shove the same density around, which is why they agree at every noise level. The minus sign and the $$\sigma$$ aren't free knobs; they're what makes the two descriptions match.

Now substitute Tweedie's formula $$\eqref{eq:tweedie}$$ into the ODE $$\eqref{eq:pfode}$$ to get rid of the abstract score and put our trainable denoiser front and center:

{%include math.html content="
\begin{align}
\frac{d\mathbf{z}_\sigma}{d\sigma} = -\sigma \cdot \frac{D - \mathbf{z}}{\sigma^2} = \frac{\mathbf{z} - D}{\sigma}
\end{align}
"%}

To actually solve an ODE on a computer you take small steps. **Euler's method**, the most basic method in numerical analysis. From a point $$\mathbf{z}$$ at noise level $$\sigma_{\text{prev}}$$, you step to the next, lower level $$\sigma_{\text{next}}$$ by moving along the velocity for the length of the step:

{%include math.html content="
\begin{align}
\mathbf{z}_{\text{next}} = \mathbf{z} + (\sigma_{\text{next}} - \sigma_{\text{prev}})\cdot\frac{\mathbf{z}-D}{\sigma_{\text{prev}}}
\end{align}
"%}

There's a sign here worth slowing down for. It's the single easiest thing to get backwards in all of diffusion, and the paper itself writes the displacement in the opposite order. Watch the two minus signs. The ODE $$\eqref{eq:pfode}$$ has a *minus* in front, so you head *downhill in noise* (the minus isn't undoing the compass; it's there because decreasing $$\sigma$$ is the direction of generation). And you're walking the $$\sigma$$-axis *backward*, from large $$\sigma$$ down to small, so your step $$(\sigma_{\text{next}} - \sigma_{\text{prev}})$$ is itself negative. Two reversals compose into forward progress. Let $$\Delta\sigma = \sigma_{\text{prev}} - \sigma_{\text{next}} > 0$$ be the positive size of the step, and the whole thing collapses to something you can read at a glance:

{%include math.html content="
\begin{align}
\mathbf{z}_{\text{next}} = \mathbf{z} + \frac{\Delta\sigma}{\sigma_{\text{prev}}}\big(D - \mathbf{z}\big) \tag{5} \label{eq:euler}
\end{align}
"%}

In words: take a step a fraction of the way from where you are toward where the denoiser says the clean data is. If your guess says the answer is at $$D=2$$ and you're sitting at $$\mathbf{z}=5$$, you move to something like $$4.25$$, closer to $$2$$ and never further. The denoiser pulls you in; the noise schedule sets how hard.

One thing worth pinning down: Euler is a *first-order* method. Its error per step shrinks like $$\Delta\sigma^2$$, and the accumulated error over the whole trajectory like $$\Delta\sigma$$. Take coarser steps and you cut corners; take more steps and you track the true curve better. (This is exactly why fancier samplers add a second-order correction.) Remember that: more steps, better approximation. It comes back later.

Here's the whole reverse process running. Pure noise at the top, thirty-two Euler steps down the probability-flow ODE, and the particles settle onto the data:

<div id="db-reverse"></div>

Watch the arrows over a full run, because they answer a question you might be sitting on: why does a particle keep changing direction on the way down? It falls straight out of the velocity, $$(\mathbf{z}-D)/\sigma$$, and the fact that the denoiser $$D$$ is itself a function of $$\sigma$$.

At high $$\sigma$$ the denoiser is hedging. With that much noise on its input, $$D$$ genuinely can't tell which data point you came from, so its best guess is close to the *average* of all of them: one blurry blob sitting at the center of the data. Every particle, wherever it starts, gets pulled toward that same place, so early in the run the field is smooth and slow and barely varies from point to point. The big decisions haven't been made yet.

As $$\sigma$$ shrinks, $$D$$ sharpens. Now the noise is small enough that the nearest data point dominates the guess, so $$D$$ stops reporting the global average and starts reporting *which mode you actually belong to*. The field reorganizes from "everything flows to the center" into "each region flows to its own data point," with sharp ridges along the borders between basins. A particle that was drifting toward the middle commits to a specific cluster. That is the direction change you see. It isn't randomness; it's the denoiser changing its mind as the falling noise level lets it resolve finer structure.

The same fact explains the other thing you notice, that the arrows are lazy out in the open and frantic near the data. Two effects stack. The $$1/\sigma$$ out front scales the whole field up as $$\sigma \to 0$$. And near a data point, nudging $$\mathbf{z}$$ a little swings the direction toward it a lot (and crossing the border between two points flips $$D$$ from one to the other), so the field turns fastest exactly where the data is densest. Far from any data there's nothing to resolve, and the arrows just point home.

The compact way to say all of it: $$p_\sigma$$ is the data distribution blurred by a Gaussian of width $$\sigma$$, and the score can only "see" structure coarser than $$\sigma$$. Large $$\sigma$$ blurs everything into a single hill, so the field is coarse and smooth. Small $$\sigma$$ resolves the individual data points, so the field grows sharp features right where they sit. This is why diffusion paints coarse-to-fine: the layout first, the detail last. It's also a preview of the partitioning section, where the *middle* noise levels, the ones busy reorganizing the field from "one center" into "specific modes," turn out to be where the real work happens.

Every one of those steps is a single application of $$\eqref{eq:euler}$$: state, plus a correction toward the denoiser's guess. That shape, `state + correction`, is about to show up somewhere familiar.

## A residual block is one Euler step

If you've looked at the guts of a ResNet or a Transformer, you know the residual connection. A block doesn't replace its input; it computes a correction and *adds* it:

{%include math.html content="
\begin{align}
\mathbf{z}_\ell = \mathbf{z}_{\ell-1} + f_{\theta_\ell}(\mathbf{z}_{\ell-1}) \tag{6} \label{eq:residual}
\end{align}
"%}

Unpacking the symbols: $$\mathbf{z}_{\ell-1}$$ is the activation flowing *into* layer $$\ell$$ (for a Transformer, the whole sequence of token vectors, a tensor of shape tokens $$\times$$ $$d$$), $$\mathbf{z}_\ell$$ is what flows *out* to the next layer, and $$f_{\theta_\ell}$$ is that layer's own learned transformation (its attention and MLP, with weights $$\theta_\ell$$). The residual connection says layer $$\ell$$ doesn't build $$\mathbf{z}_\ell$$ from scratch. It computes a *correction* $$f_{\theta_\ell}(\mathbf{z}_{\ell-1})$$ and adds it to what it received, so each layer only has to learn how to *adjust* the running state, not regenerate it.

This single design decision is most of why deep networks train at all. It's the idea behind [ResNets](https://arxiv.org/abs/1512.03385), and it's in every Transformer block ever shipped. Now put it next to the Euler step $$\eqref{eq:euler}$$:

{%include math.html content="
\begin{align}
\underbrace{\mathbf{z}_\ell = \mathbf{z}_{\ell-1} + f_{\theta_\ell}(\mathbf{z}_{\ell-1})}_{\text{a residual layer}} \qquad\Longleftrightarrow\qquad \underbrace{\mathbf{z}_{\text{next}} = \mathbf{z} + \tfrac{\Delta\sigma}{\sigma}\big(D - \mathbf{z}\big)}_{\text{one Euler step}}
\end{align}
"%}

They are the same shape. "Old state plus a learned correction" *is* "old state plus a velocity step." This is the observation behind [Neural ODEs](https://arxiv.org/abs/1806.07366): a residual network is Euler's method applied to some hidden ODE, with the step size baked in to one, and the network's *depth* playing the role of *time*. Each layer advances you one tick along a continuous trajectory; the function $$f_\theta$$ is approximating that trajectory's velocity field.

You can feel it. Below, the smooth red curve is a true continuous-depth ODE flow. The blue path is a residual network trying to follow it with a handful of discrete layers, each dot one layer, one Euler step. Few layers and it overshoots and cuts the corners; add layers (shrinking the step) and the staircase melts into the curve:

<div id="db-euler"></div>

The match is structural, not exact. A vanilla residual block is a crude, step-size-one Euler step, and an off-the-shelf ResNet won't converge to a clean Neural ODE without some care. But the shape is real, and the shape is all DiffusionBlocks needs.

There's one coefficient a ResNet-literate reader will immediately want to chase down. A vanilla residual block adds its correction with weight one; the honest Euler step $$\eqref{eq:euler}$$ adds it with weight $$\Delta\sigma/\sigma_{\text{prev}}$$, which differs for every block and shrinks as you approach clean data. DiffusionBlocks doesn't make the network learn to fight that factor. The block predicts only the denoised guess $$D$$, a plain regression target, and the known noise schedule supplies the $$\Delta\sigma/\sigma$$ multiplier when the Euler update is assembled around it. The learned part is just denoising; the geometry of the step is bookkeeping the schedule already knows.

Now for the question the paper is built on: what if we *deliberately* made the residual blocks into denoising Euler steps, and trained each one with the diffusion objective?

## The synthesis: every block becomes its own denoiser

Here is the move. We have a stack of residual blocks. We're going to declare that the network isn't computing some opaque feedforward function, it's running the reverse diffusion ODE, and each block is responsible for one stretch of the journey from noise to data.

The recipe is three steps, and none of them is heavy.

**One, cut the stack into blocks.** Take your $$L$$ layers and group them into $$B$$ contiguous blocks. (A "block" can be a single layer or a dozen; in the paper's experiments it's typically a few Transformer layers.)

**Two, hand each block a noise range.** Slice the range of noise levels $$[\sigma_{\min},\sigma_{\max}]$$ into $$B$$ consecutive intervals and give one to each block. The block that owns the high-noise end is doing coarse, blow-the-marble-off-in-chunks work; the block that owns the near-clean end is doing fine detail. (How to cut the intervals fairly is its own neat problem, which is the next section.)

**Three, tell each block it's a denoiser.** Feed the block a noised input and condition it on the noise level $$\sigma$$, meaning you feed $$\sigma$$ in as an extra input so the same block can adapt its behavior across its whole noise band. (The standard mechanism, [AdaLN](https://arxiv.org/abs/2212.09748), nudges each layer's normalization based on $$\sigma$$; it's the same conditioning DiT uses.) The block now plays the role of $$D$$ in the Euler update $$\eqref{eq:euler}$$, and its job is to predict the clean target $$\mathbf{y}$$ from a noisy input within *its* assigned noise range.

That conditioning is where the ODE reading stops being a metaphor. A plain residual layer has no clock; the same $$f_\theta$$ runs no matter where in the stack you are. But the velocity $$(\mathbf{z}-D)/\sigma$$ depends explicitly on $$\sigma$$, so a block standing in for it has to be told its noise level. Feeding in $$\sigma$$ is exactly what turns a fixed layer into a genuine time-dependent velocity field $$v(\mathbf{z},\sigma)$$, an honest right-hand side for the differential equation rather than a slogan about depth.

That third step is the one that breaks the chains. Look back at the training loss $$\eqref{eq:loss}$$. It's an expectation over noise levels, and the target at $$\sigma = 5$$ (the clean data) has nothing to do with the target at $$\sigma = 0.1$$. In ordinary diffusion those per-$$\sigma$$ problems still fight over one shared set of weights $$\boldsymbol\theta$$. DiffusionBlocks removes even that coupling: give each block its own parameters *and* a disjoint slice of $$\sigma$$, and now nothing links them, not the target and not the weights. Each block has a complete, self-contained objective:

{%include math.html content="
\begin{align}
\mathcal{L}_b(\boldsymbol{\theta}_b) = \mathbb{E}_{(\mathbf{x},\mathbf{y}),\,\sigma\sim p^{(b)},\,\boldsymbol{\epsilon}}\Big[\, w(\sigma)\,\big\lVert \bar{f}_{\boldsymbol{\theta}_b\mid\sigma}(\mathbf{x},\,\mathbf{y}+\sigma\boldsymbol{\epsilon}) - \mathbf{y} \big\rVert^2 \,\Big] \tag{7} \label{eq:blockloss}
\end{align}
"%}

Here $$\mathbf{x}$$ is whatever the network is conditioned on (the class label, the text prompt, nothing at all for plain generation), and $$p^{(b)}$$ is just the overall noise distribution restricted and renormalized to block $$b$$'s slice. To train block $$b$$, you take clean data, add noise at a level drawn from *its* range, ask it to denoise, and backpropagate through that one block only. No previous block's output is needed. No gradient flows between blocks. No backpropagation through the whole stack.

And the obvious worry, the one a careful reader feels immediately: if block $$b$$ never sees block $$b+1$$'s output during training, how do the handoffs line up at the end? The answer is the quiet crux of the whole paper. No block is ever trained against another block's output. Every block is trained against the same fixed ground truth, real data with fresh noise added at its own $$\sigma$$. The reverse ODE only ever needs the correct denoiser *at each noise level*, and that target is identical whether one network learns all the levels or $$B$$ separate blocks split them up. Get each band right on its own and the global trajectory is automatically right. This is the relay race that finally works, and it works because earlier block-wise methods invented a local objective and *hoped* the blocks would cohere, whereas here the local objective is derived. It's the denoising-score-matching loss for that block's noise band, and the diffusion theory guarantees that consistent local denoising rebuilds the global reverse process.

Be precise about what changes between training and running, because that's where the doubt lives. In training, no block ever sees another block's output; each gets fresh-noised real data at its own $$\sigma$$. At generation the blocks run in sequence, and block $$b{+}1$$ consumes whatever block $$b$$ actually produced, imperfections and all. So if a block denoises imperfectly its output drifts off $$p_\sigma$$, and that error feeds downstream. This is the diffusion cousin of *exposure bias*: train on truth, run on your own approximations. It's real, and it isn't peculiar to splitting the network. A single shared diffusion model has the identical problem, since it too is fed its own previous output while sampling, and it copes because each step's error is small (Euler's per-step error shrinks like $$\Delta\sigma^2$$) and the velocity field keeps contracting toward the data over most of the trip. Block-wise training adds no new source of mismatch, since the learning target never references another block. The paper does hedge the seam in one concrete way: it lets adjacent blocks overlap a little, training each on a noise range stretched about 5% past its own boundaries on each side, so every block has already seen inputs from just outside its slice before it has to accept a handoff there.

What you buy is memory. You only ever hold one block's activations live, so training memory drops from $$L$$ layers to $$L/B$$, a $$B$$-fold reduction, and the model's parameter count doesn't change at all. The paper measures exactly that: a clean $$3\times$$ reduction for its $$B{=}3$$ diffusion model, $$4\times$$ for the $$B{=}4$$ autoregressive one. (Gradient checkpointing, the usual trick for trading compute to save activation memory, helps the constant factor but doesn't remove the coupling between blocks the way this does.) Both panels below train the *same* twelve-layer network; the left does it end-to-end with the memory meter pinned at 100%, the right does it block-wise with the meter near $$1/B$$:

<div id="db-memory"></div>

What about generation, once everything is trained? It's just the forward pass you already know. You feed a noisy input in at the top, and the blocks run in order: each applies its Euler update over its own $$\sigma$$-band, state plus a correction toward its denoised guess, and hands the result down to the next. The bottom of the stack is your sample. The network runs exactly like any residual network at inference; we changed how it's *trained*, not how it *runs*. (For a plain diffusion model you can be lazier still and call only the one block whose noise band a given denoising step falls in.)

A word on bookkeeping, because three different things have all been called a "step." One residual layer is one Euler step of the hidden ODE. A block is several layers, so a block is a short run, not a single step. And the reverse demo earlier took thirty-two steps. So how do three or four blocks cover a fine trajectory? They don't have to: the number of Euler steps is a separate dial from the number of blocks. By default the paper takes one step per block, the coarse setting, but you can take more, and at each step the sampler just calls whichever block owns the current $$\sigma$$ and re-conditions it. Block count is a memory decision; step count is an accuracy decision; the two are independent, and more steps still track the true curve better.

### What it looks like in practice

A fair objection has been building. The diffusion story put $$\mathbf{z}$$ in data space, the same shape as the image, but the state running between Transformer blocks is a hidden activation, nothing like a picture. How can a residual block denoise an image it never sees? It doesn't. DiffusionBlocks runs the whole diffusion in the model's *hidden* space, not in pixel space. A shared read-in lifts the noised target up to hidden width once at the top, and a shared read-out maps the final hidden state back to whatever the task needs. Both sit outside the $$B$$ blocks and are the only pieces every block shares. In between, the $$\mathbf{z}$$ each block corrects is a hidden vector, and the clean target is the hidden representation of the answer. The dimension that must match, block in to block out, is the hidden width, which is exactly why a residual stack qualifies and a U-Net that resizes partway does not.

This is also how the framework swallows a classifier, which has no image to denoise. Take the vision Transformer. The thing being denoised isn't the picture, it's the *label*: the clean target $$\mathbf{y}$$ is the (normalized) embedding of the correct class, the image is fed in as the conditioning $$\mathbf{x}$$, the noised label-embedding rides through the blocks as an extra token, and the read-out turns the denoised embedding into class logits. The block is doing ordinary denoising regression on a label embedding while looking at the image. The next-token Llama works the same way: the noise lives in the continuous embedding space the model already has, never on the discrete token ids, and the read-out maps the denoised embedding back to a token. You're never adding Gaussian noise to a word or a pixel; you're denoising a continuous representation and decoding it at the end.

Let me make all of that concrete. Say the base network is a 12-layer Transformer over a sequence of $$n$$ tokens, each a $$d$$-dimensional vector, so an activation is a tensor of shape $$n \times d$$. Pick $$B = 4$$, so each block is 3 consecutive layers with its own parameters $$\theta_1,\dots,\theta_4$$. Take the noise range $$[\sigma_{\min},\sigma_{\max}] = [0.002,\ 80]$$ from EDM; the equi-probability boundaries (next section) land near $$\{0.002,\ 0.13,\ 0.30,\ 0.68,\ 80\}$$, so the blocks own:

- **block 1** &rarr; $$\sigma \in [0.68,\ 80]$$ &nbsp;(the heavy-noise end; coarse layout),
- **block 2** &rarr; $$[0.30,\ 0.68]$$,
- **block 3** &rarr; $$[0.13,\ 0.30]$$,
- **block 4** &rarr; $$[0.002,\ 0.13]$$ &nbsp;(nearly clean; fine detail),

and each band carries exactly a quarter of the training mass.

Now one training step, say for block 2. Draw a clean target $$\mathbf{y}$$ from the data (shape $$n \times d$$) and whatever conditioning $$\mathbf{x}$$ goes with it. Sample a noise level from block 2's band, say $$\sigma = 0.45$$. Build the noised input $$\mathbf{z} = \mathbf{y} + 0.45\,\boldsymbol{\epsilon}$$ with fresh Gaussian $$\boldsymbol{\epsilon}$$ (same $$n \times d$$ shape). Feed $$(\mathbf{x}, \mathbf{z})$$ into block 2, conditioned on $$\sigma = 0.45$$, and it returns a prediction $$\hat{\mathbf{y}}$$ of the clean target. The loss is a single number, $$w(0.45)\,\lVert \hat{\mathbf{y}} - \mathbf{y}\rVert^2$$. Backprop touches **only** $$\theta_2$$ (three layers' weights and activations); blocks 1, 3, and 4 are not in the graph at all. Step the optimizer and repeat. The other three blocks are trained the exact same way on their own bands, in any order, even on separate machines:

```python
# One optimizer step for block b. Every block's step is identical and independent.
x, y   = sample_batch()                 # y: clean target, shape [n, d]
sigma  = sample_noise_level(band[b])    # drawn from block b's slice, e.g. [0.30, 0.68]
z      = y + sigma * randn_like(y)      # noised input, shape [n, d]
y_hat  = block[b](x, z, sigma)          # block predicts the clean y (AdaLN injects sigma)
loss   = w(sigma) * mse(y_hat, y)       # a scalar
loss.backward()                         # gradient flows ONLY into block[b]'s params
opt[b].step()                           # update theta_b alone  ->  ~L/B layers in memory
```

(One honest omission from that loss: in practice the bare network is wrapped in EDM's $$\sigma$$-dependent preconditioning, input and output scalings $$c_\text{in}, c_\text{skip}, c_\text{out}$$ plus a transformed $$\sigma$$ fed to the conditioning, which keeps the regression target unit-scaled across a huge range of noise levels. The plain MSE above is the idea; the preconditioned version is what actually trains well.)

Generation runs the same blocks in sequence, walking the noise level down from $$\sigma_{\max}$$ to $$\sigma_{\min}$$. Each block takes the running state, asks its denoiser where the clean data is, and takes one Euler step of that size toward it:

```python
# Generation: one pass down the blocks, high noise -> low noise.
z = sigma_max * randn(n, d)                       # start from pure noise
for b in [1, 2, 3, 4]:                            # block 1 owns the highest-noise band
    s_prev, s_next = band[b]                       # this block's slice; sigma steps DOWN
    y_hat = block[b](x, z, s_prev)                 # the block's clean-data guess (this is D)
    z = z + (s_prev - s_next) / s_prev * (y_hat - z)   # Euler step (5): move toward D
return z                                           # a finished sample
```

That is the whole system: $$B$$ small denoisers, each trained alone against real data with fresh noise, chained at inference into one residual network. Same forward pass everyone already runs, a quarter of the training memory.

## Cutting the noise range fairly

Step two left a question hanging: how do you slice $$[\sigma_{\min},\sigma_{\max}]$$ into $$B$$ intervals? The lazy answer is to cut $$\sigma$$ into equal-width pieces. That's a mistake, and seeing *why* is a nice payoff for everything above.

Not all noise levels are equally important, and not all are equally busy. During training you don't sample $$\sigma$$ uniformly. Following EDM, you sample $$\log\sigma$$ from a normal distribution, specifically $$\log\sigma \sim \mathcal{N}(P_{\text{mean}}, P_{\text{std}}^2)$$, so $$P_{\text{mean}}$$ and $$P_{\text{std}}$$ are nothing more than the mean and spread of that bell curve. It piles most of the probability mass on the *middle* noise levels, and there's a reason. The extremes are boring: at very high $$\sigma$$ everything is basically noise and the best you can do is predict the data mean, and at very low $$\sigma$$ the input is basically clean and there's little to fix. The interesting decisions, where the broad strokes of an image resolve into actual structure, happen in the middle.

So you want each block to shoulder an equal share of the *work*, which means an equal share of the probability mass, not an equal slice of the axis. DiffusionBlocks picks the boundaries so each of the $$B$$ blocks owns exactly $$1/B$$ of the distribution. Since $$\log\sigma$$ is Gaussian, "equal area under the bell curve" has a closed form via the inverse normal CDF $$\Phi^{-1}$$, which just reads off the noise level at evenly spaced probabilities $$q_b$$:

{%include math.html content="
\begin{align}
\sigma_b = \exp\!\Big(P_{\text{mean}} + P_{\text{std}}\,\Phi^{-1}(q_b)\Big), \qquad q_b = q_{\min} + \tfrac{b}{B}\,(q_{\max}-q_{\min}) \tag{8} \label{eq:partition}
\end{align}
"%}

The consequence is the opposite of what you might first guess. Because the middle is where the mass is, equal-mass slices are *narrow* in the dense middle and *wide* out in the sparse tails. With the standard settings and the $$\sigma$$ range the paper uses, $$B=4$$ gives you boundaries near $$\{0.002, 0.13, 0.30, 0.68, 80\}$$: the two middle blocks each span only a factor of about $$2.3\times$$ in $$\sigma$$, while the extreme blocks span well over an order of magnitude (here roughly $$67\times$$ and $$118\times$$, the exact figures depending on where you clamp the ends), and yet every block carries exactly a quarter of the mass. It's like sculpting marble and staffing your carvers by where the decisions cluster: a crowd of specialists on the mid-roughness range where the figure actually emerges, a couple of generalists on the "barely started" and "almost done" ends.

Drag $$B$$ and watch the equal-area slices fall where they fall. The gray ticks show the naive equal-width-in-$$\sigma$$ cuts, which jam almost every boundary up at the high end and would leave most blocks fighting over noise nobody cares about:

<div id="db-partition"></div>

The paper calls this *equi-probability partitioning*, and it's what keeps the blocks balanced instead of overloading a few. On CIFAR-10 it takes the FID (Fréchet Inception Distance, the standard image-generation quality score, where lower is better) from $$43.5$$ with uniform slicing down to $$38.0$$. There's a bonus, too: by handing each block an equally hard, equally data-rich job, you've accidentally built a *curriculum*, in the curriculum-learning sense that each block faces a task of controlled, balanced difficulty rather than a mix of trivial and impossible cases, which tends to make the optimization smoother.

## So what does it actually do

The main result should sound impossible given the history. Trained block-wise, with gradients flowing through only one block at a time, DiffusionBlocks *matches* end-to-end backpropagation. Not close-for-a-memory-starved-method. Matches. And it does so across a genuinely diverse spread of architectures: vision Transformers for classification, DiT-style models for image generation, masked diffusion language models, and even vanilla autoregressive language models, which were never designed to denoise anything.

That last one is worth a beat. An autoregressive Llama-style Transformer predicts the next token; it has no notion of a noise level. DiffusionBlocks converts it anyway (augment the input, add noise conditioning, slice it into blocks, train each as a denoiser) and it works, reaching comparable quality while only ever training three layers at a time, since the model has twelve layers in $$B=4$$ blocks. The framework doesn't care that the architecture wasn't born for it. As long as there are residual connections, there's an ODE hiding inside, and an ODE can be sliced.

The cleanest demonstration is on *recurrent-depth* models, networks like [Huginn](https://arxiv.org/abs/2502.05171) that apply the *same* block over and over, looping to "think longer." Training those leans on backpropagation through time, and even the affordable version truncates the loop (Huginn backprops through 8 of its 32 iterations), with you still paying for every step you keep. But a loop of $$\mathbf{z}_k = \mathbf{z}_{k-1} + f_\theta(\mathbf{z}_{k-1})$$ is exactly our `state + correction` shape; it's already a discretized ODE. DiffusionBlocks trains it with a single forward pass per step instead, roughly a 10× cut in *training compute*, and comes out ahead on the benchmark. The arithmetic is direct: backprop-through-time has to keep every looped iteration it trains through alive at once and run a backward pass over all of them, while DiffusionBlocks trains each iteration as its own denoiser against the fixed clean target, one forward pass and a local backward with nothing upstream held live. Many cheap independent steps instead of one expensive coupled chain, which is where the order of magnitude comes from. A 10× cut and it scores higher is the kind of result that makes you trust the abstraction.

One last thing, and the paper says so itself. Sometimes block-wise training doesn't just match end-to-end, it *beats* it (on ImageNet, a DiT-L gets FID $$10.6$$ block-wise versus $$12.1$$ end-to-end). It's the same architecture with the same parameter count, only the training changes, so this isn't a bigger model sneaking in; "matches" and "beats" mean equal or better quality at equal capacity, not that block-wise training rediscovers the weights end-to-end would. Why would chopping a network into independently-trained pieces ever help? The authors don't claim to know; they offer a hypothesis, and I think it's the right one. Equi-probability partitioning hands each block a task of calibrated, balanced difficulty, that curriculum again, and ties each block directly to the clean target through its own denoising objective instead of a long, noisy chain of gradients from the output. That's a different optimization landscape, and apparently sometimes a friendlier one. Whether that intuition becomes a theorem is, as they say, future work.

The limits are real. The trick needs each block's input and output to have matching dimensions, which is less an extra rule than a direct echo of the Euler step itself: $$\mathbf{z}_{\text{next}} = \mathbf{z} + \text{correction}$$ only typechecks when $$\mathbf{z}$$ and $$\mathbf{z}_{\text{next}}$$ live in the same space. A classic U-Net deliberately changes resolution between stages, so its blocks break that identity and it doesn't fit yet. And everything here is trained from scratch, which leaves converting an already-trained large model by fine-tuning as the obvious, tantalizing next step.

Step back and the argument is four facts long. A residual connection is an Euler step. An Euler step solves a diffusion ODE. A diffusion ODE is driven by a denoiser, and a denoiser is trained by simple regression, independently at each noise level. Chain those four and a stubborn decade-old problem quietly dissolves: you can train a deep network one slice at a time, with a principled target for each slice, and pay for only a fraction of the memory. The residual connections were diffusion steps the whole time. We just hadn't been reading them that way.

#### Footnotes & further reading

1. The paper: Shing, Koyama, Akiba, [*DiffusionBlocks: Block-wise Neural Network Training via Diffusion Interpretation*](https://arxiv.org/abs/2506.14202) (Sakana AI / University of Tokyo, ICLR 2026). [Code](https://github.com/SakanaAI/DiffusionBlocks).
2. The VE diffusion conventions, the log-normal noise schedule, and the weighting all come from Karras et al., [*Elucidating the Design Space of Diffusion-Based Generative Models*](https://arxiv.org/abs/2206.00364) (EDM).
3. The score / SDE / probability-flow ODE unification: Song et al., [*Score-Based Generative Modeling through SDEs*](https://arxiv.org/abs/2011.13456).
4. Residual networks as discretized dynamics: Chen et al., [*Neural Ordinary Differential Equations*](https://arxiv.org/abs/1806.07366), and Haber & Ruthotto, [*Stable Architectures for Deep Neural Networks*](https://arxiv.org/abs/1705.03341).
5. Tweedie's formula and denoising score matching: Vincent, [*A Connection Between Score Matching and Denoising Autoencoders*](https://www.iro.umontreal.ca/~vincentp/Publications/smdae_techreport.pdf) (2011), building on a 1956 result of Robbins.
6. The prior block-wise method this clearly outperforms, Hinton's [Forward-Forward](https://arxiv.org/abs/2212.13345), and the concurrent, kindred-spirit [NoProp](https://arxiv.org/abs/2503.24322), which DiffusionBlocks beats on NoProp's own architecture. The difference is that NoProp stays classification-only and discrete-time, while DiffusionBlocks is general and continuous-time.

<script src="/assets/js/diffusionblocks.js" async></script>
