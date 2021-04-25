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

Do you sense an opportunity?

Being the enterprising individual that you are, you may try to exploit it. Starting with 5 carrots, you approach Bob, and trade your 5 carrots for 10 potatoes, at the rate at which he is willing to trade.

$$
\begin{align}
5 \text{ carrots} \times 2 \space \frac{\text{potatoes}}{\text{carrots}} = 10 \text{ potatoes} \tag{1} \label{eq:arb_example}
\end{align}
$$