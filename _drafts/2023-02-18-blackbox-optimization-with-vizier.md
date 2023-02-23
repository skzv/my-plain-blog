---
title: Blackbox Optimization and Hyperparameter Tuning With Google's Vizier
updated: 2023-02-18 00:00
imgpath: /assets/img/blackbox-optimization-with-vizier
previewurl: /currency-graph-on-black.png
---
{% include description.html content="TODO: come up with a good description" %}

When you build an machine learning model - or some other kind of algorithmic system - you will have to make choices about the architecture of your system. For example, for a machine learning application, you may need to decide how many neurons to have in a neural network layer, or the rate of gradient descent. Or if you are building a [particle filter](https://en.wikipedia.org/wiki/Particle_filter) to track the state of a robot, you may need to choose the shape of a likelihood function. How can you find the optimal architecture for your system?

You could try to find it manually. You can try different values for the number of neurons. You could try different rates of gradient descent. But this process is slow and tedious. Thankfully there exist services that can optimize your system for you, in an intelligent and efficient way.

<div class="divider"></div>

## Introducing Vizier

[Vizier](https://github.com/google/vizier) is an optimization service created at Google for blackbox and hyperparameter optimization. It can be used to optimize any kind of system as long as you can pass inputs to the system - that are suggested by Vizier - and get outputs from the system - metrics that Vizier is trying to optimize, such as by maximizing or minimizing them. The system itself is treated as a blackbox.

![Blackbox Optimization]({{ "/black-box-optimization.png" | prepend: page.imgpath }})
{% include caption.html content="Blackbox optimization doesn't requre any understanding of the system itself, as long as you can pass inputs and get outputs. Source: Per Instance Algorithm Configuration for Continuous Black Box Optimization - Scientific Figure on ResearchGate. Available from: https://www.researchgate.net/figure/black-box-Optimization_fig1_322035981 [accessed 23 Feb, 2023]" %}

Unlike non-blackbox optimization systems such as [gradient descent](https://blog.skz.dev/gradient-descent) which require an understanding of the relationship between the parameters of the system and the metric being minimized or maximized, a blackbox system like Vizier does not require any insight into the system itself. It can still search the parameter space efficiently for you, and find the values of the parameters that optimize your system.

<div class="divider"></div>

## Parameters vs Hyperparameters

Aside: the distinction comes from machine learning applications, where "parameters" are considered the values inside the model used for inference and found through training on a dataset, while hyperparameters describe the architecture of the model or the training procedure. However, a blackbox optimization service like Vizier can be used to optimize any kind of system, but it won't be an efficient way of training a machine learning model. But it is a good way to optimize the architecture of the model. 

<div class="divider"></div>

## An Example

I am going to use an example that is not machine learning related, but still demonstrates the power and simplicity of a blackbox optimization algorithm such as Vizier. Say we have a noisy signal like the one below:

![Some noisy signal]({{ "/some-noisy-signal.png" | prepend: page.imgpath }})
{% include caption.html content="Some noisy signal." %}

Let's try to find an analytical function that fits this signal. We can't decide if we want to fit a Gaussian shape or Laplace function to the signal, and both functions have their own parameters - such as mean and variance - that we are also trying to estimate.

As long as we can give Vizier a metric we are trying to optimize, it will find an optimal function for us.

<div class="divider"></div>

## Setting Up The Problem

![Optimized fit to noisy signal]({{ "/noisy-signal-fit.png" | prepend: page.imgpath }})
{% include caption.html content="Optimized parameters that fit the noisy signal." %}