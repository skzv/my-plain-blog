---
layout: post
lang_code: zh
locale: zh_CN
ref: monte-carlo-options-pricing
date: 2021-12-17 00:00:00 -0700
last_modified_at: 2021-12-17 00:00
permalink: /zh/monte-carlo-options-pricing
title: "蒙特卡洛期权定价"
imgpath: /assets/img/monte-carlo-stocks
previewurl: /gbm-example.png
description: "通过交互式模拟探索蒙特卡洛期权定价：理解几何布朗运动、对数收益率、波动率以及期权到期收益估计。"
image: /assets/img/monte-carlo-stocks/gbm-example.png
image_width: 1810
image_height: 990
image_alt: "使用几何布朗运动模拟的股票价格路径"
mathjax: true
tags: [quant-finance, simulation]
toc: true
---

_期权赌场_

预测股票价格走势是一个充满诱惑的挑战，背后仿佛藏着致富的密码。遗憾的是，持续、可靠地预测未来股价普遍被认为是不可能的。不过，我们依然可以借助数学模型做出有价值的概率判断、管理风险，并*从概率意义上*获利。

## 几何布朗运动
最常用的模型之一便是几何布朗运动（Geometric Brownian Motion，参考 [1](https://stats.libretexts.org/Bookshelves/Probability_Theory/Probability_Mathematical_Statistics_and_Stochastic_Processes_(Siegrist)/18%3A_Brownian_Motion/18.04%3A_Geometric_Brownian_Motion)、[2](http://www.columbia.edu/~ks20/FE-Notes/4700-07-Notes-GBM.pdf)）——事实上，大名鼎鼎的 [Black-Scholes 期权定价公式](https://en.wikipedia.org/wiki/Black%E2%80%93Scholes_model)同样建立在这一模型假设之上。其表达式为：

{%include math.html content=
"
\begin{align}
 S(t) = S(0)\exp{((\mu-\frac{\sigma^2}{2})t + \sigma B(t))} \tag{0}  \label{eq:gbm}
\end{align}
" 
%}

其中 $$B(t)$$ 是标准布朗运动。如果我们令 $$S(0)$$ 为初始股价，$$\mu$$ 为平均[连续复利收益率](https://en.wikipedia.org/wiki/Rate_of_return#Logarithmic_or_continuously_compounded_return)，$$\sigma$$ 为股票的[波动率](https://en.wikipedia.org/wiki/Volatility_(finance))，就能生成看起来非常逼真的股价走势路径。

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

<button class="regenerate-button" onclick="regenerate0()">重新生成</button>

<div style="display:none" id='mean-0'>0</div>
<div style="display:none" id='sigma-0'>0</div>
<div style="display:none" id='option-mean-0'>0</div>

那么，这个公式究竟代表什么？为什么它适合用来刻画证券价格？

### 对数收益率
在量化金融中，人们通常使用连续复利收益率，而不是简单收益率。也就是说，我们并不直接考察相邻交易周期之间的简单收益率 $$1 + R_t = \frac{S(t)}{S(t-1)}$$，而是考察连续复利（对数）收益率 $$r_t = \ln{(1 + R_t)} = \ln{\frac{S(t)}{S(t-1))}}$$。这样做有一个极佳的数学性质：只需把各期对数收益率直接相加，就能还原出股票价格：

{%include math.html content=
"
\begin{align}
 S(t) = S(0)\exp{(r_1 + r_2 + ... + r_{t-1})} \tag{1}  \label{eq:rr}
\end{align}
" 
%}

这样做还很方便，因为金融学中有一个常见假设：股票的对数收益率彼此独立，且服从均值为 $$\mu$$、方差为 $$\sigma^2$$ 的正态分布。注意，当收益率较小时，简单收益率 $$R_t$$ 近似等于对数收益率 $$r_t$$，因为 $$r_t = \ln{(1 + R_t)} \approx R_t$$，两者差别不大，因此可以同时近似认为简单收益率和对数收益率都服从正态分布。进一步地，如果对数收益率服从正态分布，那就意味着股票价格服从*对数正态分布（Lognormal Distribution）*。经验数据在一定程度上印证了这一点，不过在现实市场中，股价往往呈现出更「肥的尾部」——也就是说，极端罕见事件发生的频率高于正态分布的预测。下图展示了 IBM 股票的月度收益率，清晰地体现了这一现象。

![IBM 月度收益率]({{ "/IBM-returns.webp" | prepend: page.imgpath }}){: width="1282" height="1008" loading="lazy" decoding="async"}
{% include caption.html content="IBM 股票的月度简单收益率与对数收益率及其拟合正态分布。我们可以看到，分布在两端的极端收益率比正态分布预测的要多，这被称为「肥尾（fat tails）」或「超额峰度（excess kurtosis）」。图片来源：Ruey S. Tsay 所著《Analysis of Financial Time Series, 3rd Ed.》。" %}

这个模型之所以好用，还因为它只允许证券价格取正值。现实中的证券价格通常也确实只能为正（当然也有极少数例外，价格会跌成负数——参见 [2020 年原油崩盘](https://assets.weforum.org/editor/kE8TpkO7bzo3dLFWEh9UDvgqRuZPOmURhnh0FfwOVYc.png)）。

因此，我们需要一个能生成一系列服从正态分布的收益率 $$r_t$$ 的随机过程——布朗运动便成了顺理成章的选择。


## 布朗运动
[布朗运动](https://stats.libretexts.org/Bookshelves/Probability_Theory/Probability_Mathematical_Statistics_and_Stochastic_Processes_(Siegrist)/18%3A_Brownian_Motion/18.01%3A_Standard_Brownian_Motion)原本用来描述悬浮在液体或气体中的微粒运动。微粒在周围流体分子的碰撞下「随机」弹跳，留下的轨迹充满噪声、杂乱无章。本质上，它可以看作随机游走（Random Walk）在步长时间间隔和步长都趋于零时的极限形式（需要满足一个关键条件：如果时间步长为 $$t$$，那么步长必须为 $$\sqrt{t}$$，这样生成的随机过程其方差才能精确地与时间成正比）。想象通过抛硬币决定向前走一步还是向后退一步，再让每一步之间的时间间隔趋近于零，你画出的轨迹就会长这样：

![一维布朗运动]({{ "/wiener-process-zoom.png" | prepend: page.imgpath }}){: width="800" height="600" loading="lazy" decoding="async"}
{% include caption.html content="一维（算术）布朗运动。几何布朗运动正是这一过程的指数形式。<a target='_blank' href='http://creativecommons.org/licenses/by-sa/3.0/' title='Creative Commons Attribution-Share Alike 3.0'>CC BY-SA 3.0</a>，<a target='_blank' href='https://commons.wikimedia.org/w/index.php?curid=1426987'>来源</a>" %}

布朗运动有一个非常棒的性质：它的轨迹增量服从正态分布，这恰恰符合我们的需求。我们可以通过从正态分布中采样，以离散时间步来模拟布朗运动（不过，如果你只关心时间序列的终点值，其实从任意单位方差分布中采样都可以；根据中心极限定理，大量随机变量之和在长期下都会趋近高斯分布）。

于是，布朗运动便为我们提供了式 $$\eqref{eq:rr}$$ 所需的一系列服从正态分布的对数收益率 $$r_t$$：

{%include math.html content=
"
\begin{align}
 r(t) = (\mu-\frac{\sigma^2}{2})t + \sigma B(t) \tag{2}  \label{eq:bm}
\end{align}
" 
%}

对这个过程取指数，我们就重新得到了刻画股价波动的方程。

这里特别值得留意的是漂移率（Drift Rate）$$\mu - \frac{\sigma^2}{2}$$，顾名思义，它使过程随时间呈线性漂移。$$\mu$$ 很好理解——它是股票的平均连续复利收益率，如果没有随机噪声（即波动率为零），股价就只会按这个复利水平稳步上涨（或下跌）。那多出来的 $$-\frac{\sigma^2}{2}$$ 是怎么回事？原来，一个对数正态分布随机变量的数学期望是 $$\exp(\mu + \sigma^2/2)$$。由于股票价格服从*对数正态分布*（而收益率服从*正态分布*），为了保证连续复利下股票价格的期望值恰好等于 $$S(0)\exp(\mu t)$$，我们必须在漂移项里加上 $$-\frac{\sigma^2}{2}$$ 这个修正项。

选择布朗运动作为该模型的基础，背后其实还有一层哲学上的依据。金融学的一个经典假设是市场有效，因此不应存在无风险套利机会。这意味着市场走势理应是不可预测的——只要有人能预测市场，就会产生套利空间，并迅速被市场力量抹平。因此，本质上是随机噪声的布朗运动，正是对市场建模的理想选择。

## 期权定价

蒙特卡洛模拟（Monte-Carlo Simulation）是一种灵感源自摩纳哥赌场的统计技术。就像赌徒把命运交给概率一样，我们把统计分析的结果交给随机抽样。只要运行足够多次试验，就能得出具有统计显著性的结论。

假设我们要评估这只股票上一份行权价为 $105 的看涨期权（Call Option）。在几何布朗运动的股价模型下，这份期权到期时的期望价值是多少？我们可以通过生成大量股价路径来估算——每条路径就是一次试验。每次试验的期末股价通过关系式 $$V = \max(0, S - K)$$ 对应到期权的内在价值，其中 $$S$$ 是期末股价，$$K$$ 是行权价。所有试验期末期权价值的均值，就给出了到期时期权价值的估计；而期末价值的标准差，则衡量了我们对期权到期价值落在该估计值附近的把握程度。

<div id='plot-1'></div>
<button class="regenerate-button" onclick="regenerate1()">重新生成</button>
<div id='mean-1'>0</div>
<div id='sigma-1'>0</div>
<div id='option-mean-1'>0</div>

我们可以通过增加试验次数来提高估计值的统计确定性。试着分别在上面（试验次数较少）和下面（试验次数很多）反复点击「重新生成」按钮重新运行模拟：你会发现，在试验次数很多时，每次实验结果之间的波动偏差明显小得多。

<div id='plot-2'></div>
<button class="regenerate-button" onclick="regenerate2()">重新生成</button>
<div id='mean-2'>0</div>
<div id='sigma-2'>0</div>
<div id='option-mean-2'>0</div>

## 更复杂的场景
仅仅模拟到期终点价值的蒙特卡洛模拟还比较简单，实用价值有限，因为这类问题通常可以直接求出解析解。蒙特卡洛模拟真正的威力，在于处理那些很难甚至根本无法用解析法求解的场景。举个例子，如果我们要分析一份可以在存续期内随时行权的美式期权，就可能需要计算在期权有效期的任意时刻股价突破行权价的概率。借助蒙特卡洛模拟，我们只需数一数有多少条模拟路径曾经越过行权价边界即可——实现起来轻而易举。

<script defer fetchpriority="low" src="https://cdn.plot.ly/plotly-2.4.2.min.js"></script>
<script defer fetchpriority="low" src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/9.5.1/math.js" integrity="sha512-AfRcJIj922x/jSJpQLnry0DYIBg6EGCtwk/MiQ6QvDlzb7kNFxH8EdqXLkaXXY3YHQS9FrSb8H7LzuLn0CZQ1A==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script defer src="/assets/js/monte-carlo-options.js"></script>
