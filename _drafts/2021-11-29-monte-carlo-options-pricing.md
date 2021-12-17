---
title: Monte Carlo Options Pricing
updated: 2021-12-07 00:00
imgpath: /assets/img/monte-carlo-stocks
previewurl: /gradient-descent-preview.png
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

<div id='mean-0'>0</div>
<div id='sigma-0'>0</div>


So, what does this mean, and why is this a good model for security prices?

## Logarithmic Returns
In quantitative finance it is common to deal with continuously compounded returns rather than simple returns. What that means is that instead of examining an simple return between trading periods $$1 + R_t = \frac{S(t)}{S(t-1)}$$ we will examine the compounding return $$r_t = \ln{(1 + R_t)} = \ln{\frac{S(t)}{S(t-1))}}$$. This has the very nice property that one can recover the price of a stock by simply summing up the logarithmic returns as:

{%include math.html content=
"
\begin{align}
 S(t) = S(0)\exp{(r_1 + r_2 + ... + r_{t-1})} \tag{1}  \label{eq:rr}
\end{align}
" 
%}

This is also convenient because a common assumption in finance is that the logarithmic returns of a stock are independent and normally distributed with mean $$\mu$$ and variance $$\sigma^2$$ - meaning that if returns are normally distributed then the stock price is *lognormally* distributed. This has been observed empirically to some extent, although in real life stock prices tend to have "fatter tails" - meaning rare events happen more often than a normal distribution would predict.  Here are the monthly relative returns for the S&P 500 showing this behaviour (recall that small simple returns $$R_t$$ approximate logarthmic returns $$r_t$$ since $$r_t = \ln{(1 + R_t)} \approx R_t$$ ). [link](https://towardsdatascience.com/are-stock-returns-normally-distributed-e0388d71267e). 

![Gradient of f]({{ "/sp500-monthly-returns.png" | prepend: page.imgpath }})
{% include caption.html content="Monthly returns of the S&P 500 with a fitted normal distribution. We observe more returns at the extremities of the distribution than the normal distribution would predict. We call these 'fat tails' or 'excess kurtosis'. <a href='https://towardsdatascience.com/are-stock-returns-normally-distributed-e0388d71267e' target='_blank'>Source</a>" %}

This model also works well because it only permits positive security prices. Securities tend to only have positive prices (although in some cases they can go negative - see the oil crash of 2020).

So what we want is some process that generates a series of normally distributed returns $$r_t$$ - which invites Brownian motion as a natural choice.


# Brownian motion
[Brownian motion](https://stats.libretexts.org/Bookshelves/Probability_Theory/Probability_Mathematical_Statistics_and_Stochastic_Processes_(Siegrist)/18%3A_Brownian_Motion/18.01%3A_Standard_Brownian_Motion) can essentially be considered a random walk where the step size limit approaches zero. Consider flipping a coin to determine whether to take a step forward or backward. Now let the time between steps approach zero. You would trace a path that looks like this - Brownian motion.

[img]

Brownian motion has the very nice property that the probability of displacement has a Gaussian density. What this means is that if you repeated a Brownian experiment many times and plotted the distribution of paths, you would get a Gaussian shape. Thus, we can simulate a Brownian process with discrete steps by sampling from a Gaussian distribution (although if you only cared about the terminal value of a time series, you could sample from any distribution with unit variance; due to the central limit theorem the sum of random variables would approach a Gaussian distribution in the long term anyway).

Hence, Brownian motion provides us with the series of normally distributed logarathmic returns $$r_t$$ as required in $$\eqref{eq:rr}$$. Taking the exponential to recover the price movement, we've recovered an equation for modelling stock price movement.

Of particular interest here is the drift rate $$\mu - \frac{\sigma^2}{2}$$ which causes the process to drift, as the name suggests. $$\mu$$ is obvious - it's the mean continuosly compounding return for the stock. But what about $$\frac{\sigma^2}{2}$$? Well, it turns out that the expected value of a lognormally distributed variable is $$\exp(\mu + \sigma^2/2)$$. Since we require that the expected value of the stock price after continuous compounding to be $$\exp(\mu t)$$, we must apply the correction term of $$- \frac{\sigma^2}{2}$$ to the process.

<div id='plot-1'></div>
<button class="regenerate-button" onclick="regenerate1()">Regenerate</button>
<div id='mean-1'>0</div>
<div id='sigma-1'>0</div>

<div id='plot-2'></div>
<button class="regenerate-button" onclick="regenerate2()">Regenerate</button>
<div id='mean-2'>0</div>
<div id='sigma-2'>0</div>

<script src='https://cdn.plot.ly/plotly-2.4.2.min.js'></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/9.5.1/math.js" integrity="sha512-AfRcJIj922x/jSJpQLnry0DYIBg6EGCtwk/MiQ6QvDlzb7kNFxH8EdqXLkaXXY3YHQS9FrSb8H7LzuLn0CZQ1A==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="/assets/js/monte-carlo-options.js" async></script>