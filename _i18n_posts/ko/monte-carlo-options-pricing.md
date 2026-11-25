---
layout: post
lang_code: ko
locale: ko_KR
ref: monte-carlo-options-pricing
date: 2021-12-17 00:00:00 -0700
last_modified_at: 2021-12-17 00:00
permalink: /ko/monte-carlo-options-pricing
title: "몬테카를로 옵션 가격 결정"
imgpath: /assets/img/monte-carlo-stocks
previewurl: /gbm-example.png
description: "기하 브라운 운동, 주식 수익률, 변동성, 할인된 옵션 페이오프의 인터랙티브 시뮬레이션을 통해 몬테카를로 옵션 가격 결정 원리를 탐구합니다."
image: /assets/img/monte-carlo-stocks/gbm-example.png
image_width: 1810
image_height: 990
image_alt: "기하 브라운 운동으로 시뮬레이션한 주가 경로"
mathjax: true
tags: [quant-finance, simulation]
toc: true
---

_옵션이라는 카지노_

주가의 움직임을 예측하는 일은 큰 부를 약속하는 매력적인 도전입니다. 하지만 안타깝게도 미래 주가를 일관되고 신뢰성 있게 예측하는 것은 일반적으로 불가능하다고 여겨집니다. 그렇더라도 수학적 모델을 활용하면 유용한 추정을 내리고, 리스크를 관리하며, *확률적으로* 수익을 낼 수 있습니다.

## 기하 브라운 운동

널리 쓰이는 모델 중 하나가 기하 브라운 운동(geometric Brownian motion)입니다([1](https://stats.libretexts.org/Bookshelves/Probability_Theory/Probability_Mathematical_Statistics_and_Stochastic_Processes_(Siegrist)/18%3A_Brownian_Motion/18.04%3A_Geometric_Brownian_Motion), [2](http://www.columbia.edu/~ks20/FE-Notes/4700-07-Notes-GBM.pdf)). 유명한 [블랙-숄즈(Black-Scholes) 옵션 가격 결정 공식](https://en.wikipedia.org/wiki/Black%E2%80%93Scholes_model) 역시 바로 이 모델을 가정합니다. 수식은 다음과 같은 형태입니다.

{%include math.html content=
"
\begin{align}
 S(t) = S(0)\exp{((\mu-\frac{\sigma^2}{2})t + \sigma B(t))} \tag{0}  \label{eq:gbm}
\end{align}
" 
%}

여기서 $$B(t)$$는 표준 브라운 운동(standard Brownian motion)입니다. $$S(0)$$을 초기 주가, $$\mu$$를 평균 [연속 복리 수익률](https://en.wikipedia.org/wiki/Rate_of_return#Logarithmic_or_continuously_compounded_return), $$\sigma$$를 주식의 [변동성(volatility)](https://en.wikipedia.org/wiki/Volatility_(finance))으로 두면 아주 그럴듯한 주가 경로를 생성할 수 있습니다.

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

<button class="regenerate-button" onclick="regenerate0()">다시 생성</button>

<div style="display:none" id='mean-0'>0</div>
<div style="display:none" id='sigma-0'>0</div>
<div style="display:none" id='option-mean-0'>0</div>

그렇다면 이 식은 무엇을 의미하며, 왜 증권 가격을 설명하는 좋은 모델일까요?

### 로그 수익률

퀀트 금융에서는 단순 수익률보다 연속 복리 수익률(로그 수익률)을 다루는 경우가 많습니다. 즉 거래 기간 사이의 단순 수익률 $$1 + R_t = \frac{S(t)}{S(t-1)}$$ 대신 연속 복리 수익률 $$r_t = \ln{(1 + R_t)} = \ln{\frac{S(t)}{S(t-1))}}$$을 사용합니다. 이 방식에는 로그 수익률들을 단순히 더하기만 해도 주가를 복원할 수 있다는 아주 멋진 성질이 있습니다.

{%include math.html content=
"
\begin{align}
 S(t) = S(0)\exp{(r_1 + r_2 + ... + r_{t-1})} \tag{1}  \label{eq:rr}
\end{align}
" 
%}

또한 금융에서는 주식의 로그 수익률이 서로 독립이며 평균 $$\mu$$, 분산 $$\sigma^2$$인 정규 분포를 따른다고 흔히 가정하기 때문에 다루기도 편리합니다. 수익률이 작을 때는 $$r_t = \ln{(1 + R_t)} \approx R_t$$이므로 단순 수익률 $$R_t$$가 로그 수익률 $$r_t$$에 근사합니다. 두 수익률의 차이가 크지 않으므로 단순 수익률과 로그 수익률 모두 정규 분포를 따른다고 가정할 수 있죠. 그리고 로그 수익률이 정규 분포를 따르면 주가는 자연스럽게 *로그 정규 분포(lognormal distribution)*를 따르게 됩니다. 이는 경험적으로도 어느 정도 관측되는 현상이지만, 실제 주가는 정규 분포가 예측하는 것보다 극단적인 사건이 더 자주 발생하는 "두꺼운 꼬리(fatter tails)"를 갖는 경향이 있습니다. IBM 주식의 월간 수익률에서 이런 특성을 확인할 수 있습니다.

![IBM 월간 수익률]({{ "/IBM-returns.webp" | prepend: page.imgpath }}){: width="1282" height="1008" loading="lazy" decoding="async"}
{% include caption.html content="IBM 주식의 월간 단순 수익률 및 로그 수익률과 정규 분포 적합 곡선. 정규 분포가 예측하는 것보다 분포의 양 끝단에서 더 많은 수익률이 관측됩니다. 이를 '두꺼운 꼬리(fat tails)' 또는 '초과 첨도(excess kurtosis)'라고 부릅니다. 출처: Ruey S. Tsay, 'Analysis of Financial Time Series, 3rd Ed.'." %}

또한 이 모델은 양수의 증권 가격만 허용한다는 점에서도 실용적입니다. 증권 가격은 대체로 양수만 갖기 때문이죠(물론 특수한 경우에는 음수가 되기도 합니다 — [2020년 원유 가격 폭락 사태](https://assets.weforum.org/editor/kE8TpkO7bzo3dLFWEh9UDvgqRuZPOmURhnh0FfwOVYc.png)를 참고하세요).

결국 우리에게 필요한 것은 정규 분포를 따르는 일련의 수익률 $$r_t$$를 만들어 내는 확률 과정이며, 자연스럽게 브라운 운동이 후보로 떠오릅니다.

## 브라운 운동

[브라운 운동(Brownian motion)](https://stats.libretexts.org/Bookshelves/Probability_Theory/Probability_Mathematical_Statistics_and_Stochastic_Processes_(Siegrist)/18%3A_Brownian_Motion/18.01%3A_Standard_Brownian_Motion)은 액체나 기체 속 입자의 움직임을 설명합니다. 입자는 주변 유체 분자들과 부딪히며 "무작위로" 튀어 다니고, 그 궤적은 매우 불규칙하고 노이즈가 많아 보입니다. 본질적으로 이는 각 걸음 사이의 시간 간격과 걸음의 보폭이 모두 0으로 수렴하는 무작위 행보(random walk)의 극한 형태로 볼 수 있습니다(단, 시간 간격이 $$t$$라면 보폭은 $$\sqrt{t}$$여야 한다는 조건이 붙습니다 — 이렇게 해야 분산이 시간에 정확히 비례하는 과정이 만들어집니다). 동전을 던져 앞으로 한 걸음 갈지 뒤로 한 걸음 갈지 정한다고 생각해 보세요. 이제 걸음 사이의 시간을 0에 가깝게 줄이면 다음과 같은 궤적이 그려집니다.

![1차원 브라운 운동]({{ "/wiener-process-zoom.png" | prepend: page.imgpath }}){: width="800" height="600" loading="lazy" decoding="async"}
{% include caption.html content="1차원 [산술] 브라운 운동. 기하 브라운 운동은 이 과정에 지수 함수를 취한 것입니다. <a target='_blank' href='http://creativecommons.org/licenses/by-sa/3.0/' title='Creative Commons Attribution-Share Alike 3.0'>CC BY-SA 3.0</a>, <a target='_blank' href='https://commons.wikimedia.org/w/index.php?curid=1426987'>출처</a>" %}

브라운 운동은 그 궤적 값이 정규 분포를 따른다는 훌륭한 성질을 갖고 있어 우리가 찾던 조건에 정확히 부합합니다. 정규 분포에서 표본을 추출해 이산 단계로 브라운 운동을 시뮬레이션할 수 있습니다(사실 시계열의 최종 시점 값만 중요하다면 단위 분산을 가진 어떤 분포에서 표본을 뽑더라도 중심극한정리에 의해 장기적으로는 확률변수의 합이 가우시안 분포에 수렴합니다).

따라서 브라운 운동은 식 $$\eqref{eq:rr}$$에서 필요로 하는 정규 분포 로그 수익률 $$r_t$$를 다음과 같이 제공합니다.

{%include math.html content=
"
\begin{align}
 r(t) = (\mu-\frac{\sigma^2}{2})t + \sigma B(t) \tag{2}  \label{eq:bm}
\end{align}
" 
%}

여기에 지수 함수를 취하면 주가 움직임을 모델링하는 원래의 방정식을 얻게 됩니다.

여기서 특히 눈여겨볼 부분은 이름 그대로 과정을 선형적으로 이동시키는 드리프트율(drift rate) $$\mu - \frac{\sigma^2}{2}$$입니다. $$\mu$$는 분명합니다 — 주식의 평균 연속 복리 수익률이며, 노이즈(변동성)가 없다면 주가는 정확히 이 복리율만큼만 상승(또는 하락)할 것입니다. 그렇다면 $$-\frac{\sigma^2}{2}$$ 항은 왜 붙었을까요? 로그 정규 분포를 따르는 확률변수의 기댓값이 $$\exp(\mu + \sigma^2/2)$$이기 때문입니다. 수익률은 *정규 분포*를 따르지만 주가는 *로그 정규 분포*를 따르므로, 연속 복리 적용 후 주가의 기댓값이 정확히 $$S(0)\exp(\mu t)$$가 되게 하려면 과정에 $$-\frac{\sigma^2}{2}$$ 보정 항을 넣어 주어야 합니다.

브라운 운동을 이 모델의 토대로 삼는 데에는 철학적인 근거도 있습니다. 금융에서는 흔히 시장이 효율적이어서 차익거래 기회가 존재하지 않는다고 가정합니다. 그렇다면 시장은 예측 불가능해야 합니다. 누군가 시장을 예측할 수 있다면 곧바로 차익거래 기회가 생겨나 순식간에 사라질 테니까요. 따라서 본질적으로 무작위 노이즈인 브라운 운동은 시장을 모델링하는 데 매우 적합한 선택입니다.

## 옵션 가격 결정

몬테카를로 시뮬레이션(Monte-Carlo simulation)은 모나코의 카지노에서 영감을 얻은 통계 기법입니다. 도박사가 운명을 확률에 맡기듯, 통계 분석의 결과를 무작위 시행에 맡기는 방식이죠. 충분히 많은 시행을 반복하면 통계적으로 유의미한 결론을 얻을 수 있습니다.

이 주식에 대해 행사가격(strike price)이 $105인 콜옵션(call option)을 평가한다고 가정해 봅시다. 주가가 기하 브라운 운동을 따른다고 할 때 만기 시점 옵션의 기댓값은 얼마일까요? 이를 추정하기 위해 수많은 주가 경로를 생성하고 각 경로를 하나의 시행(trial)으로 봅니다. 각 시행의 만기 주가는 $$V = \max(0, S - K)$$라는 관계를 통해 옵션의 내재 가치로 연결됩니다($$S$$는 주가, $$K$$는 행사가격). 만기 옵션 가치들의 평균은 만기 시점 옵션 가격의 추정치가 되며, 표준편차는 옵션이 이 값 근처에서 만기될 확실성이 어느 정도인지를 알려 줍니다.

<div id='plot-1'></div>
<button class="regenerate-button" onclick="regenerate1()">다시 생성</button>
<div id='mean-1'>0</div>
<div id='sigma-1'>0</div>
<div id='option-mean-1'>0</div>

시행 횟수를 늘리면 추정치의 통계적 확실성을 높일 수 있습니다. ("다시 생성" 버튼을 눌러) 시뮬레이션을 다시 돌려 보면, 시행 횟수가 많은 아래쪽 결과가 시행 횟수가 적은 위쪽 결과보다 실험 간 편차가 훨씬 작다는 것을 확인할 수 있습니다.

<div id='plot-2'></div>
<button class="regenerate-button" onclick="regenerate2()">다시 생성</button>
<div id='mean-2'>0</div>
<div id='sigma-2'>0</div>
<div id='option-mean-2'>0</div>

## 더 복잡한 시나리오

만기 시점의 가치만 계산하는 몬테카를로 시뮬레이션은 비교적 단순한 편이며, 사실 이런 분석은 해석적으로도 풀 수 있어 실효성이 아주 크지는 않습니다. 몬테카를로 시뮬레이션의 진가는 해석적으로 풀기 어렵거나 불가능한 시나리오를 다룰 때 발휘됩니다. 예를 들어 만기 전 언제든 행사할 수 있는 아메리칸 옵션(American-style option)을 분석하려면, 옵션의 존속 기간 중 어느 시점에라도 주가가 행사가격을 돌파할 확률을 알고 싶을 수 있습니다. 몬테카를로 시뮬레이션에서는 전체 시행 중 주가 경로가 행사가격 경계를 넘은 횟수만 세면 되므로 이런 계산을 아주 간단하게 해낼 수 있습니다.

<script defer fetchpriority="low" src="https://cdn.plot.ly/plotly-2.4.2.min.js"></script>
<script defer fetchpriority="low" src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/9.5.1/math.js" integrity="sha512-AfRcJIj922x/jSJpQLnry0DYIBg6EGCtwk/MiQ6QvDlzb7kNFxH8EdqXLkaXXY3YHQS9FrSb8H7LzuLn0CZQ1A==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script defer src="/assets/js/monte-carlo-options.js"></script>
