---
layout: post
lang_code: ko
locale: ko_KR
ref: gradient-descent
date: 2021-11-15 00:00:00 -0700
last_modified_at: 2021-11-15 00:00
permalink: /ko/gradient-descent
title: "인터랙티브 경사 하강법 데모"
imgpath: /assets/img/gradient-descent
previewurl: /gradient-descent-preview.png
description: "그래디언트, 학습률, 극솟값을 설명하는 인터랙티브 경사 하강법 데모입니다. 파라미터를 직접 조절하며 알고리즘이 최솟값을 찾는 과정을 확인해 보세요."
image: /assets/img/gradient-descent/gradient-descent-preview.png
image_width: 1564
image_height: 808
image_alt: "인터랙티브 경사 하강법 시각화"
mathjax: true
tags: [machine-learning, optimization]
---

_이 특별한 알고리즘은 무엇일까요?_

경사 하강법(Gradient descent)은 함수의 (극소) 최솟값을 찾기 위한 최적화 알고리즘입니다.

## 왜 유용할까요?

어떤 함수 $$f(x,y)$$가 있다고 가정해 봅시다. 이 함수는 우리가 치러야 하는 비용을 나타내고, $$x$$와 $$y$$는 비용을 변화시키는 입력값일 수 있습니다. 당연히 우리는 비용을 최소화하는 $$x$$와 $$y$$ 값을 찾으려 할 것입니다. 즉, $$f(x,y)$$의 최솟값을 찾는 문제가 됩니다. 예를 들어 아래 그래프에 그려진 함수의 최솟값을 찾고 싶다고 해 보죠.

{%include math.html content=
"
\begin{align}
f(x,y)=3(1 - x)^2 e^{- x^2 - (y + 1)^2} - 10(\frac{x}{5} - x^3 - y^5) e^{-x^2 - y^2} - \frac{1}{3} e^{-(x+1)^2 - y^2} \tag{0}  \label{eq:cost_func}
\end{align}
" 
%}

<div id='plot-0'></div>

바로 이때 경사 하강법이 힘을 발휘합니다.

## 왜 경사 하강법을 쓸까요?

기초 미적분학에서 함수의 최솟값을 구하던 절차를 기억하실 겁니다. 1계 도함수를 구해 0으로 놓고 방정식을 푸는 것이죠.

{%include math.html content=
"
\begin{align}
f'(x,y)=0 \tag{1}  \label{eq:first_deriv}
\end{align}
" 
%}

이렇게 하면 함수의 극값(극댓값과 극솟값)의 위치를 찾을 수 있고, 2계 도함수 $$f''(x,y)$$의 부호를 통해 극대인지 극소인지 판별할 수 있습니다. 하지만 1계 도함수 방정식 $$\eqref{eq:first_deriv}$$을 해석적으로 푸는 일은 결코 간단하지 않아 수치적 기법이 필요한 경우가 많습니다. 게다가 비용 함수의 차원이 $$f(x,y,z,w,q,u,v,...)$$처럼 점점 높아지면 직접 풀기란 사실상 불가능해집니다. 경사 하강법은 1계 도함수를 영리하게 활용해 최솟값을 효율적으로 찾아내는 절차를 제공합니다.

## 경사 하강법 알고리즘

경사 하강법의 아이디어는 매우 직관적이어서, 비슷한 물리적 상황에 놓인다면 여러분도 똑같은 방법을 떠올리실 겁니다. 짙은 안개 속에 갇혀 눈앞 몇 걸음만 겨우 보이고 발밑 지면의 기울기만 느낄 수 있다고 상상해 보세요. 여러분은 가능한 한 빨리 골짜기 바닥으로 내려가야 합니다. 평탄한 길로 시간을 낭비하거나, 더 나쁘게는 오르막으로 올라가지는 않겠죠. 빠르게 내려가려면 현재 위치의 기울기를 살펴본 뒤, 아래쪽으로 가장 가파르게 기울어진 방향으로 나아갈 것입니다. 영어에서 'gradient'는 기울기(slope)의 동의어이므로, 바로 이 행동이 경사 하강(gradient descent)입니다. 반대로 언덕 꼭대기를 찾고 싶다면 현재 위치에서 가장 가파른 오르막 방향을 따라 올라가면 됩니다. 이를 경사 *상승법(gradient ascent)*이라고 합니다.

## 그래디언트(Gradient)

그래디언트는 본질적으로 기울기를 뜻하는 또 다른 말입니다. 1차원 상황에서는 누구나 기울기를 쉽게 떠올립니다. 앞이나 뒤로만 움직일 수 있기 때문에 기울기가 하나로 명확히 정의되죠. 하지만 더 높은 차원 — 등산 중이라고 상상해 보세요 — 에서는 어느 방향으로 걷느냐에 따라 기울기가 달라집니다. 이 지점의 기울기는 어떻게 정의해야 할까요?

벡터 미적분학에서는 각 차원별 기울기(1계 편도함수)를 모아 만든 벡터인 그래디언트 연산자 $$\nabla$$를 사용합니다.

{%include math.html content=
"
\begin{align}
\nabla f(x,y)= \begin{bmatrix}
           \frac{\partial f}{dx} (x,y) \\
           \frac{\partial f}{dy} (x,y)
         \end{bmatrix} \tag{2}  \label{eq:gradient}
\end{align}
" 
%}

$$f(x,y)$$로 정의된 2차원 곡면에서는 $$x$$축 방향의 기울기와 $$y$$축 방향의 기울기가 됩니다. 우리는 반드시 $$x$$축이나 $$y$$축으로만 움직여야 하는 게 아니므로 임의의 방향으로의 기울기를 알아야 하는데, 이는 해당 방향의 $$x$$성분과 $$y$$성분 기울기를 합해 구할 수 있습니다. 다시 말해 방향 벡터와 그래디언트의 내적(dot product)이 바로 그 방향의 기울기입니다.

그래디언트에는 또 하나의 흥미로운 성질이 있습니다. 바로 기울기가 가장 가파른 방향을 가리킨다는 점입니다. 수학적으로도 쉽게 알 수 있습니다. 임의의 방향 기울기는 방향 벡터와 그래디언트의 내적으로 구해지는데, 내적 값은 그래디언트가 자기 자신과 같은 방향일 때 최대가 되기 때문입니다!

아래는 Mathematica로 그린 $$f(x,y)$$의 음의 그래디언트(negative gradient)입니다. 곡면 $$f$$ 위의 모든 점에서 가장 가파르게 내려가는 방향을 보여 줍니다.

![함수 f의 그래디언트]({{ "/gradient.png" | prepend: page.imgpath }}){: width="360" height="361" loading="lazy" decoding="async"}
{% include caption.html content="벡터장으로 시각화한 f의 그래디언트." %}

## 가장 가파른 내리막을 따라가기

앞서 안개 낀 골짜기에서 최대한 빨리 바닥으로 가려면 매 지점에서 가장 가파른 내리막 방향을 따라가야 한다는 데 동의했습니다. 수학적으로 말하면 매 지점의 그래디언트 벡터가 가장 가파른 방향이므로, 음의 그래디언트를 따라 골짜기를 내려가는 셈입니다. 위 그림을 보면 화살표를 따라가기만 하면 최솟값에 도달한다는 것을 알 수 있습니다(다만 주의하세요 — 각 최솟값에는 저마다의 끌개 영역(basin of attraction)이 있습니다! 이 점은 잠시 뒤 살펴보겠습니다).

이제 절차를 정리해 볼 수 있습니다. 대략 다음과 같을 것입니다.

1. 현재 위치의 기울기를 살펴 가장 가파른 내리막 방향을 찾는다.

2. 그 방향으로 5걸음 이동한다.

3. 여전히 내려가고 있다면 1번으로 돌아간다. 아니라면 바닥에 도착한 것이다!

왜 하필 5걸음인지 궁금하실 수 있습니다. 사실 완전히 임의로 정한 숫자입니다. 대신 이 값을 절차의 파라미터로 두고, 하강률(descent rate)이라는 이름과 기호 $$\alpha$$를 붙여 봅시다. 하강률이 클수록 주변 기울기를 확인하는 횟수가 줄어들므로 계산 효율이 높아집니다. 하지만 곧 보게 되겠지만, 이 값이 너무 크면 함정에 빠질 수 있습니다.

여기에 최적화 아이디어를 하나 더 보탤 수 있습니다. 현재 위치의 경사가 아직 가파르다면 골짜기 바닥에서 멀리 떨어져 있을 가능성이 높습니다. 반대로 경사가 완만해졌다면 바닥에 거의 다 왔다고 볼 수 있죠. 따라서 그래디언트의 크기에 비례하는 보폭으로 내려가는 편이 합리적입니다. 그래디언트를 기호 $$\bar{g}$$로 나타내고 경사 하강 절차를 다시 써 봅시다.

1. 현재 위치의 기울기를 살펴 가장 가파른 내리막 방향을 찾는다.

2. 그 방향으로 $$\alpha \times \|\bar{g}\|$$만큼 이동한다.

3. 여전히 내려가고 있다면 1번으로 돌아간다. 아니라면 바닥에 도착한 것이다!

그렇다면 아직 내려가고 있는지 아닌지는 어떻게 판단할까요? 한 가지 방법은 매 반복마다 고도가 얼마나 낮아졌는지 확인하는 것입니다. 고도 변화가 거의 없다면 이미 사실상 바닥에 도착했다고 볼 수 있겠죠.

이 절차를 수식으로 표현하면 다음과 같습니다.

{%include math.html content=
"
\begin{align}
\bar{p}_{n+1} = \bar{p}_n - \alpha \nabla f(x,y) \tag{3}  \label{eq:grad_descent}
\end{align}
" 
%}

여기서 $$p_n$$은 $$n$$번째 반복에서의 현재 위치입니다. 아래 데모에서 직접 시험해 보세요. $$\alpha$$를 바꾸면 하강 속도가 달라지고, $$X$$와 $$Y$$를 바꾸면 곡면 위의 시작 위치가 바뀝니다. 어떤 현상이 관찰되나요?

<div id='plot-1'></div>

<span class="slider-container">
    <span class="slider-label" class="slider-label">X</span>
    <span>
        <input class="slider" id="x-slider" type="range" min="-3" max="3" value="0" step="0.05">
    </span>
    <span class="slider-value" id="x-slider-value">0</span>
</span>

<span class="slider-container">
    <span class="slider-label" >Y</span>
    <input class="slider" id="y-slider" type="range" min="-3" max="3" value="0" step="0.05">
    <span class="slider-value" id="y-slider-value">0</span>
</span>

<span class="slider-container">
    <span class="slider-label" >&#945;</span>
    <input class="slider" id="alpha-slider" type="range" min="0" max="0.2" value="0" step="0.001">
    <span class="slider-value" id="alpha-slider-value">0</span>
</span>

## 관찰 결과

경사 하강법이 초기 위치에 민감하다는 점을 눈치채셨을 겁니다. 알고리즘은 전역 최솟값(global minimum)이 아닐 수도 있는 국소 최솟값(local minimum)으로 우리를 끌어당깁니다. 경사 하강법이 특정 최솟값으로 수렴하게 만드는 정의역의 영역을 그 최솟값의 끌개 영역(basin of attraction)이라고 부릅니다.

또한 하강률 $$\alpha$$를 키우면 최솟값에 도달하는 데 필요한 반복 횟수가 줄어드는 것도 볼 수 있습니다. 하지만 $$\alpha$$를 너무 크게 잡으면 알고리즘이 최솟값을 지나쳐 버리고(overshoot), 심하면 발산(diverge)할 수도 있습니다.

## 머신러닝과의 연결

아마 머신러닝 맥락에서 경사 하강법을 들어 보신 적이 있을 겁니다. 머신러닝에서 비용 함수는 모델의 오차를 나타냅니다. 예를 들어 이미지 분류 오차가 비용 함수이고, 그 입력은 우리가 조절하려는 모델의 가중치(weights)입니다. 따라서 경사 하강법을 사용해 신경망의 분류 오차를 최소화하는 최적의 가중치 조합을 찾을 수 있는 것이죠! 이 분야에서는 하강률 $$\alpha$$를 특별한 이름으로 부릅니다. 바로 *학습률(learning rate)*입니다. 어쩌면 우리 인간의 뇌도 그동안 똑같은 일을 해 왔는지도 모르겠습니다.

<script defer fetchpriority="low" src="https://cdn.plot.ly/plotly-2.4.2.min.js"></script>
<script defer fetchpriority="low" src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/9.5.1/math.js" integrity="sha512-AfRcJIj922x/jSJpQLnry0DYIBg6EGCtwk/MiQ6QvDlzb7kNFxH8EdqXLkaXXY3YHQS9FrSb8H7LzuLn0CZQ1A==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script defer src="/assets/js/gradient-descent.js"></script>
