---
title: Predicting How the Market Will Open Tomorrow
updated: 2025-03-23 00:00
imgpath: /assets/img/predicting-market-open
previewurl: /preview.png
---

#### _Predicting the Future_

While the stock market is closed, futures trading of underlying indices continues. As future prices and
current prices are related, we can calculate what the futures markets are pricing as the current
fair value of each index by discounting the future value backwards in time. This gives us the implied
opening price of each index even before the market opens - so on Sunday night we can see whether the market
will likely open <span style="color: #66ff66;">higher</span> or <span style="color: #ff6666;">lower</span> the next day.

# Futures

Futures (future contracts) are instruments that allow traders to bet on the *future* price of an underlying asset at the future contract's date of expiry. Note the price and expiry date of the SP500 future below. It's currently trading higher than the SP500 price, but what does this tell us about what the current value of the SP500 is?

To relate the futures price to the current fair value being priced by the futures market, we have to account for the time between now and the future expiry date.

![SP500 Future Contract]({{ "/futures-price.png" | prepend: page.imgpath }})
{% include caption.html content="SP500 Future Contract" %}

We do this by using the cost of carry model, which takes into account the risk-free interest rate,
the dividend yield, and the time to maturity. It assumes that the price of the index should grow at the current
risk-free rate (essentialy a no arbitrage assumption) minus decreases in price due to divedends being paid out.

We can express this relationship as:

{% include math.html content=
"
\begin{align}
    F = S \times e^{(r - q) \times t} \tag{0}  \label{eq:coc}
\end{align}
"
 %}

where $$F$$ is the futures price, $$S$$ is the current stock price, $$r$$ is the risk-free interest
rate, $$q$$ is the dividend yield, and $$t$$ is the time to maturity.

# Going Back in Time

To calculate the current fair value of the stock price from the futures price, we can discount the futures price backwords in time, inverting the above formula:

{% include math.html content=
"
\begin{align}
    S = F \times e^{-(r - q) \times t} \tag{1}  \label{eq:discount}
\end{align}
"
 %}

Before the market opens, the fair value is our best estimate of the opening price of the index.

# Risk Free Rate

Does a risk-free investment even exist? Well, treasury bills - debt issued by the US treasury - are considered (nearly) riskless because:
- US government has a low chance of default; it can print its own money has a good history of paying debts
- short maturity reduces exposure to interest rate changes and long-term uncertainties
- very liquid market 
- no credit risk as the US government won't go bankrupt like in the case of corporate or municipal bonds

For the risk-free rate in these calculations, I choose the 3 month T-bill.

![3 Month US Treasury Yield]({{ "/3m-bond-yield-1.png" | prepend: page.imgpath }})
{% include caption.html content="3 Month US Treasury Yield" %}

We assume that the underlying assets will grow at atleast the risk-free rate, because otherwise investors wouldn't bother putting their money in these instruments.

# Dividend Yield

While we assume that the underlying instruments will grow at atleast the risk-free rate, we have to account for the fact that the underlying indices will drop when dividends are paid out by a commensurate amount. To do this, I am using the most recent dividend yield of each index - but a more accurate model will probably anticipate what the forward looking dividend yield will be. 

Below is the latest SP500 dividend yield which I use for my calculations.

![Latest SP500 Yield]({{ "/sp500-dividend-yield.png" | prepend: page.imgpath }})
{% include caption.html content="Latest SP500 Dividend Yield" %}

# Putting it All Together

I collect the last index price, the current trading futures price, my best estimate of the dividend yield, risk-free rate, and time to expiry, and calculate my current best estimate of the fair value of each major index. I've put all the pieces together on [impliedopen.com](https://impliedopen.com), which I've embedded below:

<iframe src="https://impliedopen.com" width="100%" height="1200px"></iframe>

This dashboard is most useful when the futures market is open but the regular market is closed - so we can use the futures market to understand what traders are pricing in before the regular market open. When the regular market is open, it provides the "true" current value of each index - as priced by the market. 

![Market Status View]({{ "/market-status.png" | prepend: page.imgpath }})
{% include caption.html content="Market Status View" %}

# Final Notes

I put this dashboard together pretty quickly, and ended up just scraping a lot of the values which I cache once a minute on my own API :) My apologies if things break or it goes down - at some point I will replace things with proper APIs, or this dashboard will become irrelevant as markets move towards 24/7 trading. In any case, I wanted to put together this blog post for permenance. 

![It is what it is.]({{ "/it-is-what-it-is.png" | prepend: page.imgpath }})
{% include caption.html content="It is what it is." %}

If you notice errors in my calculations or have suggestions or other feedback, please reach out to me and let me know!

If it ends up going down, this is what it looked like before then:

![Save game]({{ "/save-game.png" | prepend: page.imgpath }})
{% include caption.html content="Save game" %}

<script src='https://cdn.plot.ly/plotly-2.4.2.min.js'></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/9.5.1/math.js" integrity="sha512-AfRcJIj922x/jSJpQLnry0DYIBg6EGCtwk/MiQ6QvDlzb7kNFxH8EdqXLkaXXY3YHQS9FrSb8H7LzuLn0CZQ1A==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>