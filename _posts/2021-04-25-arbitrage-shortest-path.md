---
title: Arbitrage as a Shortest Path Problem
updated: 2021-04-25 00:00
---

#### _Who doesn't like to make money?_

And what if you could turn the problem of making money into the problem of finding the shortest-path? We can do that in at least one particular way: by exploiting arbitrage opportunities.

## What is arbitrage?

_Arbitrage_ is the act of buying or selling things across different markets, or in different forms, to profit from differences in prices. And the people who engage in it? They’re known as _arbitrageurs_ — a fancy title indeed.

Let’s start with an example. Say Paul, Peter, and Bob live in a village, where they barter carrots, potatoes, and lettuce. Bob trades potatoes for carrots, Peter trades lettuce for potatoes, and Paul trades lettuce for carrots.

Furthermore, Bob will trade 2 potatoes for a carrot, Peter will trade 1 lettuce for 2 potatoes, and Paul will trade 2 carrots for 1 lettuce. If we were to treat each individual as a market for their respective goods, what would the exchange rates look like?

| Market                         | Exchange Rate                             |
|:------------------------------:|:-----------------------------------------:|
| Bob (potatoes for carrots)     | 2 potato/carrot                           |
| Peter (lettuce for potatoes)   | 1 lettuce/2 potato = 0.5 lettuce/potato   |
| Paul (carrots for lettuce)     | 2 carrot/lettuce                          |

TODO: insert caption: Exchange rates for goods in our village.

Do you sense an opportunity?

Being the enterprising individual that you are, you may try to exploit it. Starting with 5 carrots, you approach Bob, and trade your 5 carrots for 10 potatoes, at the rate at which he is willing to trade.

$$
\begin{align}
5 \text{ carrots} \times 2 \space \frac{\text{potatoes}}{\text{carrots}} = 10 \text{ potatoes} \tag{1} \label{eq:arb_example}
\end{align}
$$

Next, you approach Peter with your potatoes, knowing that he’ll trade you 5 lettuce for them. Then you approach Paul with your 5 lettuce, and he trades 10 carrots for your lettuce.

After a few smart trades, you’ve doubled your carrot wealth. You turned 5 carrots into 10, by exploiting an arbitrage opportunity.

Later on, the villagers may develop more sophisticated markets where Bob, Peter, and Paul aren’t the only traders. Instead this little village might develop a carrot/lettuce market, a lettuce/potato market, and a potato/carrot market, where the going rate for each trade will fluctuate based on what people are willing to trade.

But the arbitrage principle remains the same. And the opportunity can be exploited until the traders offering to exchange at those rates run out of carrots, lettuce, and potatoes to trade. The arbitrage opportunity is exploited until the market reaches an equilibrium.

<div class="divider"></div>

## Arbitrage in Modern Times

When you think of modern markets, you probably don’t think of trading carrots, potatoes, and lettuce. If you’re into forex, you’re more likely thinking of trading dollars, pounds, and yen. And in that case, we would be dealing with a dollar/pound market, a pound/yen market, and a yen/dollar market, with many traders acting on each market. From now on, let’s use those currencies as examples of things to trade, but keep in mind the principles can apply to all sorts of trade-able things.

Say at a given time, the exchange rates are as follows:

| Market         | Exchange Rate     |
|:----------------:|:-------------------:|
| pound (£) / dollar ($) | 0.8 pounds/dollar |
| yen (¥) / pound (£)   | 100 yen/pound     |
| dollars ($) / yen (¥)  | 0.013 dollars/yen |

TODO: insert caption: An example of currency market exchange rates.

If you learned anything from Bob, Peter, and Paul trading carrots, lettuce, and potatoes, you’d sense an opportunity here.

If you trade $1 for pounds, you’ll end up with £0.8. Trading that for yen, you’ll end up with ¥80. You take your yen to the yen/dollar exchange where you trade it back for dollars… but now you have $1.04!

But you have to act quickly, before another arbitrageur beats you to the punch. These opportunities only exist temporarily, until the liquidity is used up and the rates equalize.

The perceptive among you may notice that we haven’t considered exchange fees in our example. Of course, you’d have to take those into account to calculate if a profitable arbitrage opportunity actually exists.

<div class="divider"></div>

## Acting Quickly

Hopefully you have some intuition to understand why acting fast is paramount. Exchange rates fluctuate quickly, and there is only a limited amount of “thing” available at that exchange rate.

While we’ve worked with relatively simple examples here, arbitrage opportunities can span many trades, becoming incredibly complex. Our examples used 3 trades, but what if you needed 10? And in a network of 20 currencies with a market for each pair, how quickly could you find an opportunity?

Using a computer is an obvious answer. But we need an efficient algorithm, lest someone else beat us to the opportunity.

To achieve that, we can leverage a few clever insights in mathematics and computer science.

<div class="divider"></div>

## Markets as a Graph

Graphs are an incredibly important structure that has found its uses in numerous applications. Many social and natural structures can be modeled with graphs, and it turns out that markets are one of them.

In our case, let’s treat each currency as a node. Moving from node to node corresponds to trading one currency for another.

![Simplified Currency Graph](assets/currency-graph-white.png)

TODO: insert caption: Simplified graph — there should be a distinct edge in each direction.