---
layout: post
lang_code: ko
locale: ko_KR
ref: predicting-how-the-market-will-open-tomorrow
date: 2025-03-23 00:00:00 -0700
last_modified_at: 2025-03-23 00:00
permalink: /ko/predicting-how-the-market-will-open-tomorrow
title: "내일 증시가 어떻게 열릴지 예측하기"
imgpath: /assets/img/predicting-market-open
previewurl: /preview.png
description: "지수 선물, 무위험 이자율, 배당수익률을 이용한 보유비용 모델로 다음 날 주식 시장의 예상 시가를 계산하는 방법과 직접 만든 impliedopen.com 대시보드를 소개합니다."
image: /assets/img/predicting-market-open/og-preview.png
image_width: 1200
image_height: 630
image_alt: "내재 개장 시가 대시보드"
mathjax: true
tags: [quant-finance]
---

_미래 예측하기_

어느 주말에 좋지 않은 경제 뉴스가 터졌고, 월요일 장이 열리면 시장에 어떤 영향을 미칠지 궁금해졌습니다. 이 질문을 파고들다 보니, 정규 주식 시장은 닫혀 있어도 기초 지수의 선물(futures) 거래는 계속 이루어지며, 선물 시장을 들여다보면 트레이더들이 새로운 정보를 어떻게 받아들이고 가격에 반영하고 있는지 마치 수정 구슬 🔮처럼 미리 엿볼 수 있다는 사실을 알게 되었습니다.

선물 가격과 현재 현물 가격은 서로 밀접하게 연결되어 있으므로, 미래 시점의 선물 가격을 현재 시점으로 할인(discount)해 역산하면 선물 시장이 평가하는 각 지수의 현재 적정 가치(fair value)를 구할 수 있습니다. 이를 통해 정규장이 열리기 전에도 각 지수의 예상 개장 시가(implied opening price)를 알 수 있으며, 일요일 밤에도 다음 날 장이 <span style="color: #66ff66;">상승</span> 출발할지 <span style="color: #ff6666;">하락</span> 출발할지 가늠해 볼 수 있습니다.

아래에서는 이 계산의 모든 구성 요소를 하나씩 살펴보고, 다음 날 장 시작 움직임을 미리 엿볼 수 있도록 제가 만든 [impliedopen.com](https://impliedopen.com) 대시보드를 소개합니다.

![다음 날 시장 움직임을 미리 엿볼 수 있도록 만든 대시보드 미리보기]({{ "/save-game.webp" | prepend: page.imgpath }}){: width="1168" height="1312" fetchpriority="high" decoding="async"}
{% include caption.html content="다음 날 시장 움직임을 미리 엿볼 수 있도록 만든 대시보드 미리보기." %}

## 선물(Futures)

선물(선물 계약)은 트레이더가 기초 자산의 만기 시점 *미래* 가격에 베팅할 수 있게 해 주는 금융 상품입니다. 아래 S&P 500 선물의 가격과 만기일을 보세요. 현재 S&P 500 현물 지수보다 높게 거래되고 있는데, 이것이 S&P 500의 현재 가치에 대해 무엇을 말해 줄까요?

선물 가격을 선물 시장이 반영하고 있는 현재 적정 가치로 환산하려면, 지금부터 선물 만기일까지 남은 시간을 고려해야 합니다.

![S&P 500 선물 계약]({{ "/futures-price.webp" | prepend: page.imgpath }}){: width="943" height="826" loading="lazy" decoding="async"}
{% include caption.html content="S&P 500 선물 계약" %}

이때 사용하는 것이 무위험 이자율, 배당수익률, 만기까지 남은 기간을 반영하는 보유비용 모델(cost of carry model)입니다. 이 모델은 지수의 가격이 현재 무위험 이자율만큼 성장하되(본질적으로 무차익거래 가정), 배당금 지급에 따른 가격 하락분만큼 차감된다고 가정합니다.

이 관계는 다음 수식으로 표현할 수 있습니다.

{% include math.html content=
"
\begin{align}
    F = S \times e^{(r - q) \times t} \tag{0}  \label{eq:coc}
\end{align}
"
 %}

여기서 $$F$$는 선물 가격, $$S$$는 현재 주가(현물 지수), $$r$$은 무위험 이자율, $$q$$는 배당수익률, $$t$$는 만기까지 남은 시간입니다.

## 시간을 거꾸로 돌리기

선물 가격으로부터 현재 현물 주가의 적정 가치를 구하려면, 위 공식을 뒤집어 선물 가격을 현재 시점으로 할인하면 됩니다.

{% include math.html content=
"
\begin{align}
    S = F \times e^{-(r - q) \times t} \tag{1}  \label{eq:discount}
\end{align}
"
 %}

장이 열리기 전에는 이렇게 계산한 적정 가치가 지수의 개장 시가에 대한 최선의 추정치가 됩니다.

## 무위험 이자율

과연 정말로 위험이 없는 투자라는 게 존재할까요? 미국 재무부가 발행하는 단기 국채(Treasury bills, T-bills)는 다음과 같은 이유로 (거의) 무위험 자산으로 간주됩니다.
- 미국 정부의 채무불이행 가능성이 매우 낮음(자국 통화를 직접 발행할 수 있고 채무 상환 이력이 탄탄함)
- 짧은 만기 덕분에 금리 변동과 장기 불확실성에 대한 노출이 적음
- 시장 유동성이 매우 풍부함
- 회사채나 지방채와 달리 미국 정부가 파산할 신용 위험이 사실상 없음

이 계산에서는 무위험 이자율로 미국 3개월물 국채(3-month T-bill) 수익률을 사용했습니다.

![미국 3개월물 국채 수익률]({{ "/3m-bond-yield-1.png" | prepend: page.imgpath }}){: width="993" height="633" loading="lazy" decoding="async"}
{% include caption.html content="미국 3개월물 국채 수익률" %}

기초 자산은 최소한 무위험 이자율만큼은 성장한다고 가정합니다. 그렇지 않다면 투자자들이 굳이 위험을 감수하며 이런 자산에 돈을 넣을 이유가 없기 때문입니다.

## 배당수익률

기초 자산이 최소한 무위험 이자율만큼 성장한다고 가정하더라도, 배당금이 지급될 때 기초 지수가 그에 상응하는 금액만큼 하락한다는 점도 반영해야 합니다. 이를 위해 저는 각 지수의 가장 최근 배당수익률을 사용했습니다. 물론 더 정교한 모델이라면 향후 예상되는 선행 배당수익률(forward-looking dividend yield)을 추정해 쓸 것입니다.

아래는 제 계산에 사용한 최신 S&P 500 배당수익률입니다.

![최신 S&P 500 배당수익률]({{ "/sp500-dividend-yield.png" | prepend: page.imgpath }}){: width="873" height="641" loading="lazy" decoding="async"}
{% include caption.html content="최신 S&P 500 배당수익률" %}

## 하나로 모으기

직전 지수 종가, 현재 거래 중인 선물 가격, 배당수익률 추정치, 무위험 이자율, 만기까지 남은 시간을 모두 수집해 주요 지수 각각의 현재 적정 가치 최선 추정치를 계산합니다. 이 모든 요소를 한데 모아 [impliedopen.com](https://impliedopen.com)에 올려 두었고, 아래에도 임베드해 두었습니다.

<iframe src="https://impliedopen.com" title="Implied Open 시장 대시보드" width="100%" height="1200px"></iframe>

이 대시보드는 선물 시장은 열려 있지만 정규 주식 시장은 닫혀 있을 때 가장 유용합니다. 정규장이 열리기 전에 트레이더들이 무엇을 가격에 반영하고 있는지 선물 시장을 통해 파악할 수 있기 때문입니다. 반대로 정규장이 열려 있을 때는 시장이 직접 매기는 각 지수의 "진짜" 현재 가치를 보여 줍니다.

![시장 상태 화면]({{ "/market-status.png" | prepend: page.imgpath }}){: width="751" height="159" loading="lazy" decoding="async"}
{% include caption.html content="시장 상태 화면" %}

## 마무리하며

이 대시보드는 꽤 급하게 만들다 보니, 많은 데이터를 스크래핑해서 제 API에서 1분마다 캐싱하는 방식으로 구현했습니다 :) 가끔 데이터가 깨지거나 서버가 내려가더라도 너그러이 양해 부탁드립니다. 언젠가는 제대로 된 API로 교체하거나, 어쩌면 시장 자체가 연중무휴 24시간 거래로 넘어가면서 이 대시보드가 쓸모없어질 수도 있겠죠. 어쨌든 기록으로 남겨 두기 위해 이렇게 블로그 글로 정리해 두었습니다.

![그게 인생이죠]({{ "/it-is-what-it-is.png" | prepend: page.imgpath }}){: width="690" height="365" loading="lazy" decoding="async"}
{% include caption.html content="어쩔 수 없죠(It is what it is)." %}

계산에 오류가 있거나 제안할 점, 혹은 다른 피드백이 있다면 언제든 편하게 연락해 알려 주세요!
