---
title: Monte Carlo Options Pricing
updated: 2021-12-17 00:00
imgpath: /assets/img/monte-carlo-stocks
previewurl: /gbm-example.png
---

#### _The options casino_

Predicting the movement of stock prices is an alluring challenge with the promise of riches. Unfortunately, predicting future stock prices consistently and reliably is generally considered impossible. However, we can use models to make useful predictions, manage risk, and profit *probalistically*. 

# Geometric Brownian Motion
One such commonly used model is geometric Brownian motion ([1](https://stats.libretexts.org/Bookshelves/Probability_Theory/Probability_Mathematical_Statistics_and_Stochastic_Processes_(Siegrist)/18%3A_Brownian_Motion/18.04%3A_Geometric_Brownian_Motion), [2](http://www.columbia.edu/~ks20/FE-Notes/4700-07-Notes-GBM.pdf)). This has the form

{%include math.html content=
"
\begin{align}
 S(t) = S(0)\exp{((\mu-\frac{\sigma^2}{2})t + \sigma Z_t)} \tag{0}  \label{eq:gbm}
\end{align}
" 
%}

where $$Z_t$$ is standard Brownian motion. If we let $$S(0)$$ to be the initial stock price, $$\mu$$ to be the mean [compounding return](https://en.wikipedia.org/wiki/Rate_of_return#Logarithmic_or_continuously_compounded_return), and $$\sigma$$ to be the [volatility](https://en.wikipedia.org/wiki/Volatility_(finance)) of a stock, then we can generate very realistic price paths. 

<div id='plot-0'></div>
<span class="slider-container">
    <span class="slider-label" class="slider-label">$$\mu$$</span>
    <span>
        <input class="slider" id="mean-slider" type="range" min="-2.5" max="1" value="0" step="0.01">
    </span>
    <span class="slider-value" id="mean-slider-value">0</span>
</span>

<span class="slider-container">
    <span class="slider-label" class="slider-label">$$\sigma$$</span>
    <span>
        <input class="slider" id="sigma-slider" type="range" min="0" max="1" value="0" step="0.01">
    </span>
    <span class="slider-value" id="sigma-slider-value">0</span>
</span>

<button class="regenerate-button" onclick="regenerate0()">Regenerate</button>

<div style="display:none" id='mean-0'>0</div>
<div style="display:none" id='sigma-0'>0</div>
<div style="display:none" id='option-mean-0'>0</div>

So, what does this mean, and why is this a good model for security prices?

## Logarithmic Returns
In quantitative finance it is common to deal with continuously compounded returns rather than simple returns. What that means is that instead of examining a simple return between trading periods $$1 + R_t = \frac{S(t)}{S(t-1)}$$ we will examine the compounding return $$r_t = \ln{(1 + R_t)} = \ln{\frac{S(t)}{S(t-1))}}$$. This has the very nice property that one can recover the price of a stock by simply summing up the logarithmic returns as:

{%include math.html content=
"
\begin{align}
 S(t) = S(0)\exp{(r_1 + r_2 + ... + r_{t-1})} \tag{1}  \label{eq:rr}
\end{align}
" 
%}

This is also convenient because a common assumption in finance is that the logarithmic returns of a stock are independent and normally distributed with mean $$\mu$$ and variance $$\sigma^2$$. And, if the logarithmic returns are normally distributed, then this in turn implies the stock price is *lognormally* distributed. This has been observed empirically to some extent, although in real life stock prices tend to have "fatter tails" - meaning rare events happen more often than a normal distribution would predict.  Here are the monthly relative returns for the S&P 500 showing this behaviour (recall that small simple returns $$R_t$$ approximate logarthmic returns $$r_t$$ since $$r_t = \ln{(1 + R_t)} \approx R_t$$ ). 

![S&P 500 monthly returns]({{ "/sp500-monthly-returns.png" | prepend: page.imgpath }})
{% include caption.html content="Monthly returns of the S&P 500 with a fitted normal distribution. We observe more returns at the extremities of the distribution than the normal distribution would predict. We call these 'fat tails' or 'excess kurtosis'. <a href='https://towardsdatascience.com/are-stock-returns-normally-distributed-e0388d71267e' target='_blank'>Source</a>" %}

This model also works well because it only permits positive security prices. Securities tend to only have positive prices (although in some cases they can go negative - see the [oil crash of 2020](https://assets.weforum.org/editor/kE8TpkO7bzo3dLFWEh9UDvgqRuZPOmURhnh0FfwOVYc.png)).

So, we want a process that generates a series of normally distributed returns $$r_t$$ - which invites Brownian motion as a natural choice.


# Brownian motion
[Brownian motion](https://stats.libretexts.org/Bookshelves/Probability_Theory/Probability_Mathematical_Statistics_and_Stochastic_Processes_(Siegrist)/18%3A_Brownian_Motion/18.01%3A_Standard_Brownian_Motion) can essentially be considered a limiting form of the random walk where both the time between steps and the step length approach zero (with some caveats: namely, if the time step is $$t$$, the step length must be $$\sqrt{t}$$ - this produces a process whose variance scales exactly with time). Consider flipping a coin to determine whether to take a step forward or backward. Now let the time between steps approach zero. You would trace a path that looks like this:

![1-D Brownian Motion]({{ "/wiener-process-zoom.png" | prepend: page.imgpath }})
{% include caption.html content="1 dimensional [arithmetic] Brownian motion. Geometric Brownian motion is the exponential of this process. <a target='_blank' href='http://creativecommons.org/licenses/by-sa/3.0/' title='Creative Commons Attribution-Share Alike 3.0'>CC BY-SA 3.0</a>, <a target='_blank' href='https://commons.wikimedia.org/w/index.php?curid=1426987'>Source</a>" %}

Brownian motion has the very nice property that the trajectories are normally distributed, which is exactly what we are looking for. We can simulate a Brownian process with discrete steps by sampling from a normal distribution (although if you only cared about the terminal value of a time series, you could sample from any distribution with unit variance; due to the central limit theorem the sum of random variables would approach a Gaussian distribution in the long term anyway).

Hence, Brownian motion provides us with the series of normally distributed logarathmic returns $$r_t$$ as required in $$\eqref{eq:rr}$$. Taking the exponential to recover the price movement, we've recovered an equation for modelling stock price movement.

Of particular interest here is the drift rate $$\mu - \frac{\sigma^2}{2}$$ which causes the process to drift, as the name suggests. $$\mu$$ is obvious - it's the mean continuosly compounding return for the stock. But what about $$\frac{\sigma^2}{2}$$? Well, it turns out that the expected value of a lognormally distributed variable is $$\exp(\mu + \sigma^2/2)$$. Since we require that the expected value of the stock price after continuous compounding to be $$\exp(\mu t)$$, we must apply the correction term of $$- \frac{\sigma^2}{2}$$ to the process.

# Option Pricing

Monte-Carlo simulation is a statistical technique inspired by the casinos of Monaco. Much like gamblers resigning their fates to probability, we hand over the results of statistical analysis to chance. By running enough trials, we can make conclusions with statistical significance. 

Consider evaluating a call option with a strike prices of $105 for this stock. What would be the expected value of the option at expiry, given a geometric Brownian model for the stock's movement? We can estimate this by generating a series of price paths, each of which can be considered a trial. The terminal value of each trial is related to the intrinsic value of the option via the relation $$V = \max(0, S - K)$$ where $$S$$ is the stock price and $$K$$ is the strike price. The mean terminal value provides us with an estimate of the option's value at expiry, while the standard deviation of terminal values provides us with a measure of how certain we are that the option will expire close to this value. 

<div id='plot-1'></div>
<button class="regenerate-button" onclick="regenerate1()">Regenerate</button>
<div id='mean-1'>0</div>
<div id='sigma-1'>0</div>
<div id='option-mean-1'>0</div>

We can increase the number of trials to increase the statistical certainty of the estimate. Re-running the simulation (by clicking "Regenerate") on a large number of trials (below) yields a much smaller discrepency between experiments than on a small number of trials (above).

<div id='plot-2'></div>
<button class="regenerate-button" onclick="regenerate2()">Regenerate</button>
<div id='mean-2'>0</div>
<div id='sigma-2'>0</div>
<div id='option-mean-2'>0</div>

# More Advanced Scenarios
Monte-Carlo simulation of terminal values is a relatively simple simulation, and one that is not too useful as this analysis can probably be completed analytically. The true power of Monte-Carlo simulation is unlocked when analysing scenarios that are more difficult to solve analytically, if not impossible. For example, if we wanted to analyse an American-style option, which can be exercised anytime, we might want to count the probability of a stock price exceeding the strike price at any time during the lifetime of that option. We could do this by counting how many trials cross the strike price boundry, which is easy to do with a Monte-Carlo simulation.

<script src='https://cdn.plot.ly/plotly-2.4.2.min.js'></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/9.5.1/math.js" integrity="sha512-AfRcJIj922x/jSJpQLnry0DYIBg6EGCtwk/MiQ6QvDlzb7kNFxH8EdqXLkaXXY3YHQS9FrSb8H7LzuLn0CZQ1A==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="/assets/js/monte-carlo-options.js" async></script>