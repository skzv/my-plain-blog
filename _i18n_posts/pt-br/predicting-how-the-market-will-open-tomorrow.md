---
layout: post
lang_code: pt-br
locale: pt_BR
ref: predicting-how-the-market-will-open-tomorrow
date: 2025-03-23 00:00:00 -0700
last_modified_at: 2025-03-23 00:00
permalink: /pt-br/predicting-how-the-market-will-open-tomorrow
title: "Prevendo como o mercado vai abrir amanhã"
imgpath: /assets/img/predicting-market-open
previewurl: /preview.png
description: "Como futuros de índices, taxas de juros e rendimentos de dividendos podem estimar a próxima abertura do mercado, com o cálculo de custo de carregamento e meu painel impliedopen.com."
image: /assets/img/predicting-market-open/og-preview.png
image_width: 1200
image_height: 630
image_alt: "Painel de abertura implícita do mercado"
mathjax: true
tags: [quant-finance]
---

_Prevendo o futuro_

Em um fim de semana saíram notícias econômicas ruins, e fiquei me perguntando como isso impactaria a abertura do mercado na segunda-feira. Fui pesquisar sobre o assunto e descobri que, enquanto a bolsa de valores está fechada, a negociação de contratos futuros dos índices subjacentes continua aberta — e podemos olhar para o mercado futuro para entender como os operadores já estão reagindo e precificando as novas informações, quase como uma bola de cristal 🔮.

Como os preços futuros e os preços à vista estão relacionados, podemos calcular o que o mercado futuro está precificando como o valor justo atual de cada índice descontando o valor futuro de volta no tempo. Isso nos dá o preço implícito de abertura de cada índice antes mesmo de a bolsa abrir — assim, já na noite de domingo, conseguimos ver se o mercado provavelmente vai abrir em <span style="color: #66ff66;">alta</span> ou em <span style="color: #ff6666;">baixa</span> no dia seguinte.

Abaixo, explico cada parte desse cálculo, culminando em um painel que criei para dar uma prévia dos movimentos de abertura do dia seguinte em [impliedopen.com](https://impliedopen.com).

![Uma prévia do painel que criei para dar uma espiada nos movimentos do mercado no dia seguinte.]({{ "/save-game.webp" | prepend: page.imgpath }}){: width="1168" height="1312" fetchpriority="high" decoding="async"}
{% include caption.html content="Uma prévia do painel que criei para dar uma espiada nos movimentos do mercado no dia seguinte." %}

## Futuros

Futuros (contratos futuros) são instrumentos que permitem aos operadores apostar no preço *futuro* de um ativo subjacente na data de vencimento do contrato. Observe o preço e a data de vencimento do contrato futuro do S&P 500 abaixo. Ele está sendo negociado acima do preço atual do S&P 500, mas o que isso nos diz sobre qual é o valor atual do S&P 500?

Para relacionar o preço do contrato futuro ao valor justo atual precificado pelo mercado futuro, precisamos levar em conta o tempo restante entre agora e a data de vencimento do contrato.

![Contrato futuro do S&P 500]({{ "/futures-price.webp" | prepend: page.imgpath }}){: width="943" height="826" loading="lazy" decoding="async"}
{% include caption.html content="Contrato futuro do S&P 500" %}

Fazemos isso usando o modelo de custo de carregamento (_cost of carry_), que considera a taxa de juros livre de risco, o rendimento de dividendos (_dividend yield_) e o tempo até o vencimento. Esse modelo parte da premissa de que o preço do índice deve crescer à taxa livre de risco atual (essencialmente uma premissa de ausência de arbitragem), descontando as quedas de preço causadas pelo pagamento de dividendos.

Podemos expressar essa relação como:

{% include math.html content=
"
\begin{align}
    F = S \times e^{(r - q) \times t} \tag{0}  \label{eq:coc}
\end{align}
"
 %}

em que $$F$$ é o preço futuro, $$S$$ é o preço atual do índice (ou ação), $$r$$ é a taxa de juros livre de risco, $$q$$ é o rendimento de dividendos e $$t$$ é o tempo até o vencimento.

## Voltando no tempo

Para calcular o valor justo atual do índice a partir do preço futuro, descontamos o preço futuro de volta no tempo, invertendo a fórmula acima:

{% include math.html content=
"
\begin{align}
    S = F \times e^{-(r - q) \times t} \tag{1}  \label{eq:discount}
\end{align}
"
 %}

Antes da abertura do mercado, esse valor justo é a nossa melhor estimativa para o preço de abertura do índice.

## Taxa livre de risco

Será que existe mesmo um investimento livre de risco? Bem, os títulos do Tesouro de curto prazo (_Treasury bills_ ou _T-bills_) — dívida emitida pelo Tesouro dos EUA — são considerados (quase) livres de risco porque:
- o governo dos EUA tem baixa probabilidade de calote; pode emitir sua própria moeda e tem um longo histórico de honrar suas dívidas
- o vencimento curto reduz a exposição a mudanças nas taxas de juros e incertezas de longo prazo
- possuem um mercado extremamente líquido
- não há risco de crédito, pois o governo dos EUA não vai falir como pode ocorrer com títulos corporativos ou municipais

Para a taxa livre de risco nesses cálculos, escolhi o _T-bill_ de 3 meses.

![Rendimento do título do Tesouro dos EUA de 3 meses]({{ "/3m-bond-yield-1.png" | prepend: page.imgpath }}){: width="993" height="633" loading="lazy" decoding="async"}
{% include caption.html content="Rendimento do título do Tesouro dos EUA de 3 meses" %}

Assumimos que os ativos subjacentes devem render pelo menos a taxa livre de risco, pois caso contrário os investidores não se dariam ao trabalho de colocar dinheiro neles.

## Rendimento de dividendos

Embora assumamos que os ativos subjacentes cresçam pelo menos à taxa livre de risco, precisamos considerar que os índices caem em valor proporcional quando dividendos são distribuídos. Para isso, uso o rendimento de dividendos (_dividend yield_) mais recente de cada índice — ainda que um modelo mais preciso provavelmente tentasse projetar o rendimento de dividendos futuro.

Abaixo está o rendimento de dividendos mais recente do S&P 500 que utilizo nos meus cálculos.

![Rendimento de dividendos mais recente do S&P 500]({{ "/sp500-dividend-yield.png" | prepend: page.imgpath }}){: width="873" height="641" loading="lazy" decoding="async"}
{% include caption.html content="Rendimento de dividendos mais recente do S&P 500" %}

## Juntando tudo

Coleto o último preço do índice, o preço atual de negociação do contrato futuro, minha melhor estimativa do rendimento de dividendos, a taxa livre de risco e o tempo até o vencimento, e calculo minha melhor estimativa atual do valor justo de cada grande índice. Reuni todas essas peças em [impliedopen.com](https://impliedopen.com), que incorporei abaixo:

<iframe src="https://impliedopen.com" title="Painel de abertura implícita do mercado (Implied Open)" width="100%" height="1200px"></iframe>

Esse painel é mais útil quando o mercado futuro está aberto, mas o mercado regular está fechado — assim podemos usar os futuros para entender o que os operadores estão precificando antes da abertura oficial. Quando o mercado regular está aberto, ele mostra o valor atual "real" de cada índice conforme negociado no mercado.

![Visualização do status do mercado]({{ "/market-status.png" | prepend: page.imgpath }}){: width="751" height="159" loading="lazy" decoding="async"}
{% include caption.html content="Visualização do status do mercado" %}

## Considerações finais

Montei esse painel bem rápido e acabei fazendo scraping de vários valores, armazenando-os em cache uma vez por minuto na minha própria API :) Peço desculpas se algo quebrar ou sair do ar — em algum momento vou substituir tudo por APIs adequadas, ou então esse painel ficará obsoleto conforme os mercados evoluírem para negociação 24 horas por dia, 7 dias por semana. De qualquer forma, quis escrever este post para deixar o registro permanente.

![É o que é.]({{ "/it-is-what-it-is.png" | prepend: page.imgpath }}){: width="690" height="365" loading="lazy" decoding="async"}
{% include caption.html content="É o que é." %}

Se você notar erros nos meus cálculos ou tiver sugestões e comentários, entre em contato comigo e me avise!
