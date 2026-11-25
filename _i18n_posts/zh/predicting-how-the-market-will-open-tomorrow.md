---
layout: post
lang_code: zh
locale: zh_CN
ref: predicting-how-the-market-will-open-tomorrow
date: 2025-03-23 00:00:00 -0700
last_modified_at: 2025-03-23 00:00
permalink: /zh/predicting-how-the-market-will-open-tomorrow
title: "预测明天股市如何开盘"
imgpath: /assets/img/predicting-market-open
previewurl: /preview.png
description: "如何结合股指期货、无风险利率与股息率，通过持有成本模型测算次日股市的隐含开盘价，并介绍我开发的 impliedopen.com 仪表盘。"
image: /assets/img/predicting-market-open/og-preview.png
image_width: 1200
image_height: 630
image_alt: "隐含市场开盘价仪表盘"
mathjax: true
tags: [quant-finance]
---

_预测未来_

某个周末传来一则利空的经济消息，我不禁好奇这会对周一股市开盘造成怎样的影响。研究一番之后我了解到：虽然股票市场休市了，但标的指数的期货交易仍在持续进行；我们可以从期货市场观察交易员们如何即时消化并将新信息计入价格——就像一颗水晶球 🔮。

由于期货价格与现货价格之间存在确定的定价关系，我们可以把期货价格沿时间向后折现，从而反推出期货市场当前为各大指数给出的公允价值。这样在股市正式开盘之前，我们就能得到各指数的隐含开盘价——哪怕在周日晚上，也能提前看出第二天大盘大概率会<span style="color: #66ff66;">高开</span>还是<span style="color: #ff6666;">低开</span>。

下面我会逐步拆解这一计算的各个环节，并展示最终搭建的仪表盘 [impliedopen.com](https://impliedopen.com)，帮你抢先一窥次日开盘动向。


![我搭建的仪表盘预览，可提前一窥次日开盘动向。]({{ "/save-game.webp" | prepend: page.imgpath }}){: width="1168" height="1312" fetchpriority="high" decoding="async"}
{% include caption.html content="我搭建的仪表盘预览，可提前一窥次日市场开盘动向。" %}

## 期货

期货（期货合约）是一种金融工具，允许交易者就标的资产在合约到期日的*未来*价格进行博弈。留意下图中标普 500（S&P 500）期货的价格与到期日：它当前的交易价格高于标普 500 现货指数，但这究竟反映了期货市场对标普 500 当前价值的何种定价呢？

要把期货价格与期货市场所隐含的当前公允价值联系起来，我们必须考虑从现在到期货到期日之间的时间跨度。

![标普 500 期货合约]({{ "/futures-price.webp" | prepend: page.imgpath }}){: width="943" height="826" loading="lazy" decoding="async"}
{% include caption.html content="标普 500 期货合约" %}

为此，我们要用到「持有成本模型（Cost of Carry Model）」，它综合考虑了无风险利率、股息率以及距离到期的时间。该模型假设指数价格应当以当前无风险利率增长（本质上是无套利假设），同时扣除因分红派息而导致的价格回落。

这种关系可以写成：

{% include math.html content=
"
\begin{align}
    F = S \times e^{(r - q) \times t} \tag{0}  \label{eq:coc}
\end{align}
"
 %}

其中，$$F$$ 是期货价格，$$S$$ 是当前现货指数价格，$$r$$ 是无风险利率，$$q$$ 是股息率，$$t$$ 是剩余到期时间。

## 沿时间回溯折现

要想从期货价格反推出现货指数当前的公允价值，只需将上述公式求逆，把期货价格往回折现：

{% include math.html content=
"
\begin{align}
    S = F \times e^{-(r - q) \times t} \tag{1}  \label{eq:discount}
\end{align}
"
 %}

在股市开盘之前，这个公允价值就是我们对指数开盘价的最佳估计。

## 无风险利率

世界上真的存在「无风险」投资吗？美国国库券（Treasury Bills，由美国财政部发行的短期国债）通常被认为（几乎）没有风险，原因如下：
- 美国政府违约概率极低：它可以自行印钞，且历史上一直保持良好的偿债记录
- 期限很短，降低了暴露在利率波动与长期不确定性中的风险
- 市场流动性极高
- 不存在像公司债或市政债那样的破产信用风险，因为美国政府不会破产

在我的计算中，我选用 3 个月期美国国库券收益率作为无风险利率。

![3 个月期美国国债收益率]({{ "/3m-bond-yield-1.png" | prepend: page.imgpath }}){: width="993" height="633" loading="lazy" decoding="async"}
{% include caption.html content="3 个月期美国国债收益率" %}

我们假设标的资产至少会以无风险利率增长，因为否则投资者根本不会把钱投入这些资产。

## 股息率

尽管我们假设标的资产至少会按无风险利率增值，但也必须计入另一项因素：当成分股派发股息时，标的指数会相应除息回落。为此，我使用了各指数最近一次公布的股息率——不过更精确的模型可能会尝试预测未来的预期股息率。

下图是我用于计算的最新标普 500 股息率。

![最新标普 500 股息率]({{ "/sp500-dividend-yield.png" | prepend: page.imgpath }}){: width="873" height="641" loading="lazy" decoding="async"}
{% include caption.html content="最新标普 500 股息率" %}

## 整合成型

我汇总了各主要指数的最新收盘价、当前交易中的期货价格，以及我对股息率、无风险利率和剩余到期时间的最佳估计，实时算出每个主要指数的当前隐含公允价值。我把这一切整合成了网站 [impliedopen.com](https://impliedopen.com)，直接嵌入在下方：

<iframe src="https://impliedopen.com" title="Implied Open 市场开盘预测仪表盘" width="100%" height="1200px"></iframe>

这个仪表盘在「期货市场开盘、常规股市休市」的时段最有用——能帮我们借助期货市场看清交易员在正式开盘前已经计入的价格预期。当常规股市开盘交易时，现货市场本身就会直接给出每个指数的「真实」当前报价。

![市场状态视图]({{ "/market-status.png" | prepend: page.imgpath }}){: width="751" height="159" loading="lazy" decoding="async"}
{% include caption.html content="市场状态视图" %}

## 写在最后

这个仪表盘是我相当仓促地攒出来的，很多数据其实就是靠爬虫抓取，再在我自己的 API 上每分钟缓存一次 :) 如果哪天出了故障或者挂了，还请多多包涵——以后有空我会把数据源换成正规 API，或者等到金融市场全面走向 7×24 小时交易，这个仪表盘也就自然功成身退了。不管怎样，我都想写下这篇博客留个纪念。

![顺其自然吧。]({{ "/it-is-what-it-is.png" | prepend: page.imgpath }}){: width="690" height="365" loading="lazy" decoding="async"}
{% include caption.html content="顺其自然吧。" %}

如果你在我的计算过程里发现了错误，或者有任何建议与反馈，欢迎随时联系我告诉我！
