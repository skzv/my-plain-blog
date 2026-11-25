---
layout: post
lang_code: ko
locale: ko_KR
ref: blackbox-optimization-with-vizier
date: 2023-02-23 00:00:00 -0700
last_modified_at: 2023-02-23 00:00
permalink: /ko/blackbox-optimization-with-vizier
title: "Google Vizier로 하는 블랙박스 최적화와 하이퍼파라미터 튜닝"
imgpath: /assets/img/blackbox-optimization-with-vizier
previewurl: /black-box-optimization.png
description: "Google Vizier를 활용한 블랙박스 최적화 실습 예제입니다. 조건부 파라미터를 정의하고 시행을 평가해 노이즈가 섞인 신호에 최적의 모델을 적합해 봅니다."
image: /assets/img/blackbox-optimization-with-vizier/og-preview.png
image_width: 1200
image_height: 630
image_alt: "블랙박스 최적화의 입력과 출력"
mathjax: true
tags: [machine-learning, optimization]
toc: true
---
{% include description.html content="어떤 종류의 시스템이든 자동으로, 그리고 지능적으로 최적화하기" %}

<style>
img {
  max-height: 350px;
}
</style>

머신러닝 모델이나 기타 알고리즘 시스템을 구축할 때는 시스템의 아키텍처에 대해 여러 결정을 내려야 합니다. 예를 들어 머신러닝 애플리케이션이라면 신경망 레이어의 뉴런 수를 몇 개로 할지, 경사 하강법의 학습률을 얼마로 둘지 정해야 합니다. 로봇의 상태를 추적하는 [파티클 필터(particle filter)](https://en.wikipedia.org/wiki/Particle_filter)를 만든다면 우도 함수(likelihood function)의 형태를 골라야 할 수도 있고, 컴퓨팅 자원 사용량을 최소화하는 버퍼 크기와 스레드 개수를 찾아야 할 수도 있습니다. 시스템에 가장 잘 맞는 최적의 아키텍처는 어떻게 찾을 수 있을까요?

수작업으로 찾아볼 수도 있습니다. 뉴런 개수를 이리저리 바꿔 보고, 경사 하강법의 학습률도 여러 값으로 시도해 보는 것이죠. 하지만 이런 과정은 느리고 지루할 뿐 아니라 실수나 편향에 빠지기도 쉽습니다. 다행히도 지능적이고 효율적인 방식으로 시스템을 대신 최적화해 주는 서비스가 있습니다.

<div class="divider"></div>

## Vizier 소개

[Vizier](https://github.com/google/vizier)는 Google에서 만든 블랙박스 및 하이퍼파라미터 최적화 서비스입니다. Vizier가 제안한 입력을 시스템에 전달하고, 시스템으로부터 출력 — 즉 Vizier가 최대화하거나 최소화하려는 평가 지표(metric) — 을 돌려받을 수만 있다면 어떤 종류의 시스템이든 최적화하는 데 활용할 수 있습니다. 시스템 내부는 말 그대로 블랙박스로 취급됩니다.

![블랙박스 최적화]({{ "/black-box-optimization.png" | prepend: page.imgpath }}){: width="629" height="319" loading="lazy" decoding="async"}
{% include caption.html content="블랙박스 최적화는 입력을 넣고 출력을 얻을 수만 있다면 시스템 내부를 전혀 이해하지 않아도 됩니다. 출처: Per Instance Algorithm Configuration for Continuous Black Box Optimization - Scientific Figure on ResearchGate. https://www.researchgate.net/figure/black-box-Optimization_fig1_322035981 [2023년 2월 23일 열람]" %}

시스템 파라미터와 최적화 대상 지표 사이의 관계를 알아야 하는 [경사 하강법](/ko/gradient-descent) 같은 비(非)블랙박스 최적화 기법과 달리, Vizier 같은 블랙박스 시스템은 시스템 내부에 대한 통찰을 전혀 요구하지 않습니다. 그러면서도 파라미터 공간을 효율적으로 탐색해 시스템을 최적화하는 파라미터 값을 찾아냅니다. 덕분에 복잡하거나 불연속적이거나 비볼록(non-convex)한 목적 함수에도 훨씬 강건합니다.

<div class="divider"></div>

## 파라미터 vs. 하이퍼파라미터

잠깐 짚고 넘어가자면, 이 구분은 머신러닝 분야에서 유래했습니다. 데이터셋 학습을 통해 찾아지며 추론에 사용되는 모델 내부의 값을 "파라미터(parameters)"라고 부르고, 모델의 아키텍처나 학습 절차를 정의하는 설정값을 "하이퍼파라미터(hyperparameters)"라고 부릅니다. Vizier 같은 블랙박스 최적화 서비스는 어떤 종류의 시스템에도 적용할 수 있지만, 머신러닝 모델 자체를 학습시키는 데는 효율적이지 않습니다. 대신 모델의 아키텍처(하이퍼파라미터)를 최적화하는 데 매우 효과적입니다.

<div class="divider"></div>

## 실습 예제

머신러닝과는 무관하지만 Vizier 같은 블랙박스 최적화 알고리즘의 강력함과 단순함을 잘 보여 주는 예제를 사용해 보겠습니다. 아래와 같이 노이즈가 섞인 신호가 있다고 가정해 봅시다.

![노이즈가 섞인 신호]({{ "/some-noisy-signal.png" | prepend: page.imgpath }}){: width="368" height="246" loading="lazy" decoding="async"}
{% include caption.html content="노이즈가 섞인 어떤 신호." %}

이 신호에 잘 들어맞는 해석적 함수를 찾아보겠습니다. 이 신호에 [가우시안(Gaussian) 분포](https://en.wikipedia.org/wiki/Normal_distribution)를 적합할지 [라플라스(Laplace) 분포](https://en.wikipedia.org/wiki/Laplace_distribution)를 적합할지 아직 결정하지 못했고, 두 함수 모두 평균이나 분산처럼 추정해야 할 고유한 파라미터를 가지고 있습니다.

Vizier에 최적화할 지표만 알려 주면, Vizier가 우리 대신 최적의 함수를 찾아 줄 것입니다.

<div class="divider"></div>

## 문제 설정하기

먼저 탐색할 첫 번째 파라미터는 모델 종류(Gaussian 또는 Laplace)입니다.

```
{
    'parameter_id': 'model',
    'categorical_value_spec' : {
        'values': [
            'gaussian',
            'laplace',
        ]
}
```

하지만 각 모델에는 그 모양을 결정하는 고유한 파라미터 집합이 있습니다. 이를 각 모델의 "자식 파라미터(child parameters)"라고 부르겠습니다.

가우시안 분포에서는 평균 `mu`($$\mu$$)와 표준편차 `sigma`($$\sigma$$)가 이에 해당합니다.

![파라미터 mu와 sigma를 가진 가우시안 분포]({{ "/normal-distribution.png" | prepend: page.imgpath }}){: width="720" height="460" loading="lazy" decoding="async"}
{% include caption.html content="파라미터 mu와 sigma를 가진 가우시안 분포. 출처: https://commons.wikimedia.org/wiki/File:Normal_Distribution_PDF.svg" %}

라플라스 분포의 경우 문헌마다 표기법이 조금씩 다르지만, 보통 위치 파라미터(또는 평균) `mu`($$\mu$$)와 척도 계수 `b`($$b$$)를 사용합니다.

![파라미터 mu와 b를 가진 라플라스 분포]({{ "/laplace-distribution.png" | prepend: page.imgpath }}){: width="800" height="600" loading="lazy" decoding="async"}
{% include caption.html content="파라미터 mu와 b를 가진 라플라스 분포. 출처: https://commons.wikimedia.org/wiki/File:Laplace_pdf_mod.svg" %}

가우시안 분포의 평균과 혼동하지 않도록 라플라스 분포의 위치 파라미터는 `mu` 대신 `a`라고 부르겠습니다.

가우시안 분포를 적합할 때는 Vizier가 라플라스 분포의 파라미터를 추정하지 않기를 바라고, 반대 경우도 마찬가지입니다. 다행히 각 분포의 파라미터를 부모 `model` 파라미터에 종속된 자식, 즉 조건부 파라미터(conditional parameter)로 지정할 수 있습니다.

```
'conditional_parameter_specs': [
{
    "parameter_spec": {
        "parameter_id": "mu",
        "scale_type": 'UNIT_LINEAR_SCALE',
        "double_value_spec": {
        "min_value": 0,
        "max_value": 10.0,
        },
    },
    "parent_categorical_values": {
        "values": ['gaussian']
    }
},
{
    "parameter_spec": {
        "parameter_id": "sigma",
        "scale_type": 'UNIT_LINEAR_SCALE',
        "double_value_spec": {
        "min_value": 1e-1,
        "max_value": 5.0,
        },
    },
    "parent_categorical_values": {
        "values": ['gaussian']
    }
},
    {
    "parameter_spec": {
        "parameter_id": "a",
        "scale_type": 'UNIT_LINEAR_SCALE',
        "double_value_spec": {
        "min_value": 0,
        "max_value": 10.0,
        },
    },
    "parent_categorical_values": {
        "values": ['laplace']
    }
},
{
    "parameter_spec": {
        "parameter_id": "b",
        "scale_type": 'UNIT_LINEAR_SCALE',
        "double_value_spec": {
        "min_value": 1e-1,
        "max_value": 5.0,
        },
    },
    "parent_categorical_values": {
        "values": ['laplace']
    }
}]
```

마지막으로 Vizier가 최적화할 지표를 정의해야 합니다. 저는 함수가 신호에 최대한 가깝게 맞기를 원하므로, 해석적 함수와 실제 데이터 사이의 잔차 제곱합(sum of squared residuals)으로 적합도를 평가하겠습니다. 이 값이 작을수록 더 잘 맞는 것입니다. Vizier에게는 이 지표를 최소화해야 한다는 사실만 알려 주면 됩니다.

```
metric_ssr = {
    'metric_id': 'sum_of_squared_residuals',
    'goal': 'MINIMIZE',
}
```

이 모든 설정을 하나로 묶으면 우리의 최적화 문제가 정의됩니다.

```
study = {
    'display_name': 'vizier_experiment',
    'study_spec' :
    {
        'parameters': [param_model],
        'metrics': [metric_ssr]
    }
}
```

주목할 점은 Vizier가 이 파라미터들의 의미를 전혀 알지 못한다는 것입니다. `Gaussian`과 `Laplace`는 그저 범주형 파라미터의 값일 뿐이며 Vizier에게는 그 이상의 의미가 없습니다. 이 값들에 실제 의미를 부여하는 것은 이를 받아 처리하는 제 코드이지만, Vizier 입장에서 그 코드는 블랙박스 안에 숨겨져 있습니다. 글이 길어지지 않도록 전체 코드는 생략했지만, 글 마지막의 링크에서 확인해 보실 수 있습니다.

<div class="divider"></div>

## 탐색 과정

매 시행(trial)마다 Vizier가 시도해 볼 파라미터 조합을 제안합니다. 그러면 우리가 직접 그 파라미터가 얼마나 잘 작동하는지 평가해 지표(잔차 제곱합)를 계산하고, 결과를 Vizier에 돌려보냅니다. Vizier는 그 결과를 바탕으로 다음에 시도할 파라미터 조합을 생성합니다.

![시행마다 파라미터를 제안하는 Vizier]({{ "/vizier-trials.png" | prepend: page.imgpath }}){: width="1280" height="281" loading="lazy" decoding="async"}
{% include caption.html content="각 시행(trial)에 대해 파라미터를 제안하는 Vizier." %}

모델이 Gaussian일 때는 가우시안 파라미터만, Laplace일 때는 라플라스 파라미터만 제안하는 것을 확인할 수 있습니다.

Vizier는 최적 파라미터를 어떻게 탐색할까요? 그리드 서치나 랜덤 서치도 가능하지만, 진정한 마법은 가우시안 프로세스 밴딧(Gaussian process bandits), 선형 결합 탐색(linear combination search) 및 그 변형 알고리즘들을 조합해 활용하는 데 있습니다.

GCP 콘솔을 통하면 Vizier의 진행 상황을 보여 주는 멋진 차트들도 확인할 수 있습니다.

![최적화 지표의 변화와 각 시행의 파라미터를 보여 주는 스터디 테이블]({{ "/study-progress-table.webp" | prepend: page.imgpath }}){: width="1600" height="1071" loading="lazy" decoding="async"}
{% include caption.html content="최적화 중인 지표의 변화와 각 시행의 파라미터를 보여 주는 스터디 테이블." %}

![시도된 파라미터 조합과 결과 지표 값을 보여 주는 평행 좌표 차트]({{ "/parallel-chart.webp" | prepend: page.imgpath }}){: width="1600" height="726" loading="lazy" decoding="async"}
{% include caption.html content="시도한 파라미터 조합과 그에 따른 지표 값을 보여 주는 평행 좌표 차트." %}

<div class="divider"></div>

## 최적화 결과

라플라스 분포가 가우시안 분포보다 근소하게 더 나은 결과를 내는 것을 볼 수 있습니다.

![잔차 제곱합을 최소화한 상위 시행을 확대해 보여 주는 평행 좌표 차트. 가우시안 분포보다 라플라스 분포가 더 나은 적합도를 보입니다.]({{ "/optimal-parallel-chart.webp" | prepend: page.imgpath }}){: width="1600" height="550" loading="lazy" decoding="async"}
{% include caption.html content="잔차 제곱합을 최소화한 상위 시행들을 확대해 본 평행 좌표 차트. 가우시안 분포보다 라플라스 분포에서 더 좋은 적합 결과가 나왔습니다." %}

Vizier에 최적 시행의 파라미터를 조회해 그래프로 그려 보았습니다.

![노이즈가 섞인 신호에 대한 최적 적합 결과]({{ "/noisy-signal-fit.png" | prepend: page.imgpath }}){: width="543" height="289" loading="lazy" decoding="async"}
{% include caption.html content="노이즈가 섞인 신호에 적합된 최적 파라미터." %}

거의 완벽하게 들어맞습니다! Vizier가 찾아낸 파라미터는 제가 노이즈를 더하기 전 원본 신호를 생성할 때 사용했던 파라미터인 $$a=5$$, $$b=2$$의 라플라스 분포와 매우 가깝습니다.

![원본 라플라스 신호]({{ "/original-laplace-signal.png" | prepend: page.imgpath }}){: width="862" height="728" loading="lazy" decoding="async"}
{% include caption.html content="원본 라플라스 신호." %}

비교해 보면, 가우시안 분포는 정점이 더 둥글고 꼬리가 더 얇은 형태를 띱니다.

![비교용 가우시안 분포]({{ "/gaussian-signal.png" | prepend: page.imgpath }}){: width="878" height="726" loading="lazy" decoding="async"}
{% include caption.html content="비교용 가우시안 분포." %}

<div class="divider"></div>

## 직접 재현해 보려면?

이 글을 작성하는 데 사용한 Colab 노트북은 [여기](https://github.com/skzv/vizier-blog-post/blob/main/vizier_blog_post.ipynb)에서 확인하실 수 있습니다. 저는 이 글에 실은 것처럼 멋진 차트를 자동으로 그려 주는 GCP의 Vertex AI Vizier API를 사용했지만, 비용이 꽤 비쌀 수 있다는 점(시행당 $1)을 유의하세요. Vizier는 오픈소스로도 [여기](https://github.com/google/vizier)에 공개되어 있습니다.
