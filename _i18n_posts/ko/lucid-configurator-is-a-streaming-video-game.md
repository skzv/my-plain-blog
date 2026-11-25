---
layout: post
lang_code: ko
locale: ko_KR
ref: lucid-configurator-is-a-streaming-video-game
date: 2021-07-28 00:00:00 -0700
last_modified_at: 2021-07-28 00:00
permalink: /ko/lucid-configurator-is-a-streaming-video-game
title: "Lucid Motors 차량 컨피규레이터는 브라우저로 스트리밍되는 비디오 게임이다"
imgpath: /assets/img/lucid-configurator-is-a-streaming-video-game
previewurl: /lucid-configurator.png
description: "Lucid Motors의 차량 컨피규레이터가 Unity, 클라우드 렌더링, WebRTC를 활용해 인터랙티브 3D 쇼룸을 브라우저로 스트리밍하는 방식을 분석합니다."
image: /assets/img/lucid-configurator-is-a-streaming-video-game/lucid-configurator.png
image_width: 1958
image_height: 845
image_alt: "Lucid Motors 인터랙티브 3D 차량 컨피규레이터"
mathjax: false
tags: [computer-vision, 3d-graphics, systems]
---

{% include description.html content="비디오 게임 엔진이 현존하는 최고의 시뮬레이터라는 사실을 깨닫고 나면 고개가 끄덕여집니다." %}

## 영리한 해결책

[Lucid Motors가 월요일에 상장했습니다](https://www.barrons.com/articles/lucid-churchill-merger-ipo-ev-51627308359). 당장 Lucid 차량을 살 일은 없겠지만 호기심에 [차량 컨피규레이터](https://www.lucidmotors.com/air/configure/)를 둘러보았습니다. 그야말로 예술 작품이더군요. 차량의 안팎을 거의 모든 각도에서 관찰하고 조작해 볼 수 있습니다.

{% include video.html content="https://streamable.com/e/cudr66" %}
<p class="caption video-caption">Lucid의 플래그십 최고급 모델인 Lucid Air Dream 컨피규레이터.</p>

다양한 색상과 트림을 조합해 보고, 문을 여닫거나 심지어 센터 콘솔 디스플레이를 접어 넣을 수도 있습니다. 배경의 금문교는 바닥의 물웅덩이에 유리처럼 반사됩니다. 문손잡이를 조작할 때 아래에서 켜지는 조명까지 온갖 디테일이 살아 있습니다. 차량에 대한 감을 너무 정확하게 잡아서 굳이 실물을 보러 가지 않아도 될 것 같은 기분이 들 정도였습니다.

도대체 Lucid는 이걸 어떻게 구현했을까요? 평범한 사용자의 웹 브라우저가 반사 효과까지 포함된 이런 장면을 실시간으로 렌더링할 수 있을까요? 아마 아닐 겁니다. 이것이 가능한 이유는, 지금 눈앞에 보이는 장면이 클라우드 — 즉 Amazon 서버로 막대한 연산 부하를 넘겨 실행되는 비디오 게임 엔진 Unity에서 렌더링되고, P2P 비디오 스트리밍 프로토콜인 WebRTC를 통해 브라우저로 실시간 스트리밍되고 있기 때문입니다.

<div class="divider"></div>

## 3D 모델의 정체

처음에 저는 순진하게도 이 모델이 최신 [WebGL 라이브러리](https://en.wikipedia.org/wiki/WebGL)(웹 브라우저에서 하드웨어 가속으로 2D 및 3D 그래픽을 렌더링하는 API)를 통해 내 브라우저에서 직접 렌더링되고 있을 거라고 생각했습니다. 로컬에서 렌더링된다면 어딘가 내 RAM에 모델 데이터가 있을 테니, 그걸 추출해서 3D 모델 에디터로 열어 볼 수 있겠다고 여겼죠. 구체적으로는 거의 끊김 없이 이어지는 유리 캐노피를 가로막고 있는 선바이저를 제거해 보고 싶었습니다. Tesla Model X가 구현한 깔끔한 시야를 Lucid는 왜 따라 하지 않았는지 궁금했거든요.

![유리 캐노피를 가로막는 Lucid Air 선바이저]({{ "/lucid-air-sun-visors.webp" | prepend: page.imgpath }}){: width="1600" height="994" loading="lazy" decoding="async"}
{% include caption.html content="유리 캐노피의 개방감을 가로막는 Lucid Air의 선바이저." %}

그래서 코드를 파헤치기 시작했습니다. 브라우저 개발자 도구를 열어 수천 줄의 난독화된 JavaScript 코드를 훑고, 내 노트북과 Lucid 서버 사이를 오가는 네트워크 요청을 기록해 분석하다 보니, 정작 해답은 처음부터 콘솔에 버젓이 찍혀 있다는 걸 깨달았습니다.

![컨피규레이터는 비디오 스트림이다]({{ "/zlbolt-webrtc.png" | prepend: page.imgpath }}){: width="691" height="156" loading="lazy" decoding="async"}
{% include caption.html content="이 컨피규레이터는 WebRTC 스트림입니다." %}

로컬에서 렌더링되는 모델 따위는 없었습니다. 제가 보고 있던 것은 그냥 영상이었습니다.

그럼 내부에서는 무슨 일이 벌어지고 있을까요? 컨피규레이터는 먼저 2D 화면 — 즉 3D 조작처럼 보이게 만드는 뚝뚝 끊기는 파노라마 이미지 묶음으로 시작합니다. 대부분의 온라인 인터랙티브 3D 뷰어가 사용하는 방식이죠. 아래 영상에서 그 모습을 볼 수 있습니다.

{% include video.html content="https://streamable.com/e/ptjitc" %}
<p class="caption video-caption">여러 장의 2D 이미지를 이어 붙여 만든 뚝뚝 끊기는 3D 뷰.</p>

그런 다음 클라이언트가 사용자의 대역폭과 지연 시간(latency)을 측정하고, 실시간 영상 스트림을 감당할 만큼 충분히 빠르다고 판단되면 세션을 3D로 업그레이드합니다.

![지연 시간 테스트]({{ "/latency-test.png" | prepend: page.imgpath }}){: width="755" height="25" loading="lazy" decoding="async"}
![대역폭 테스트]({{ "/bandwidth-test.png" | prepend: page.imgpath }}){: width="706" height="21" loading="lazy" decoding="async"}
{% include caption.html content="대역폭이 충분하면 3D 세션으로 업그레이드됩니다." %}

이때 WebRTC 연결이 시작됩니다. [WebRTC](https://en.wikipedia.org/wiki/WebRTC)는 P2P 스트리밍 프로토콜입니다. 장면은 다른 곳에서 렌더링되어 WebRTC를 통해 제 브라우저로 스트리밍됩니다.

`get_token` 요청의 내용을 들여다보면 작동 방식에 대한 단서가 더 보입니다.

![get_token 요청 내용]({{ "/get-token-request.png" | prepend: page.imgpath }}){: width="829" height="402" loading="lazy" decoding="async"}
{% include caption.html content="get_token 요청의 상세 내용." %}

첫 번째 상자를 보면, 대역폭을 측정하기 위해 [25 MB짜리 테스트 이미지](https://libzl.zlthunder.net/bandwidth-test-img.png)를 기기로 일부 내려받으면서 걸리는 시간을 잰다는 것을 알 수 있습니다. 궁금해하실 분들을 위해 그 이미지를 첨부합니다(걱정 마세요, 용량을 10분의 1로 압축해 두었습니다).

![대역폭 테스트 이미지]({{ "/bandwidth-test-image.webp" | prepend: page.imgpath }}){: width="895" height="1263" loading="lazy" decoding="async"}
{% include caption.html content="자동차와는 별 관련이 없지만, 대역폭 측정 용도로는 제격입니다." %}

여담이지만 [이 이미지는 GIMP의 plasma 플러그인으로 만든 효과로 보입니다](https://www.gimp.org/tutorials/Floating_Logo/Plasma.jpg). 로딩이 꽤 느린데, 노이즈와 비슷하게 생겨서 거의 압축이 되지 않기 때문일 겁니다.

[chrome://webrtc-internals/](chrome://webrtc-internals/)를 열어 보면 3D 장면을 제 브라우저로 보내 주는 WebRTC 연결의 세부 정보도 확인할 수 있습니다.

![WebRTC 연결 정보]({{ "/lucid-webrtc.png" | prepend: page.imgpath }}){: width="851" height="399" loading="lazy" decoding="async"}
{% include caption.html content="Chrome 개발자 도구에서 WebRTC 연결에 대한 자세한 정보를 확인할 수 있습니다." %}

이쯤 되면 눈치채셨겠지만, 여기 나오는 URL 중 어느 것도 Lucid 도메인이 아니라 `zlthunder` 도메인입니다. 대체 누구일까요?

<div class="divider"></div>

## ZeroLight

웹에서 `zlthunder`를 검색해 보면 [ZeroLight](https://zerolight.com/)라는 회사가 나옵니다. 자동차 분야에 특화된 클라우드 기반 3D 시각화 솔루션을 제공하는 기업이죠. 이제 모든 퍼즐이 맞춰졌습니다!

![ZeroLight 웹사이트]({{ "/zero-light.webp" | prepend: page.imgpath }}){: width="1600" height="640" loading="lazy" decoding="async"}
{% include caption.html content="클라우드 기반 3D 시각화 전문 기업." %}

얼마 지나지 않아 유명 비디오 게임 엔진인 [Unity의 공식 블로그 포스트](https://unity3d.com/showcase/case-stories/zerolight)도 찾았습니다. ZeroLight가 Unity 엔진을 활용해 물리 효과와 반사 표현까지 최적화된 사실적인 가상 쇼룸을 어떻게 구축했는지 설명하는 글이었습니다.

![Unity와 ZeroLight 사례]({{ "/unity-zero-light.webp" | prepend: page.imgpath }}){: width="1203" height="658" loading="lazy" decoding="async"}
{% include caption.html content="비디오 게임 기술이 정말 먼 길을 걸어왔습니다." %}

이제 전체 구조가 한눈에 들어옵니다. 사이트에 접속하면 먼저 2D 컨피규레이터가 로드됩니다. 인터넷 연결이 충분히 빠르면 AWS 서버에서 돌아가는 3D 비디오 게임 엔진인 Unity 인스턴스에 연결됩니다. 서버는 제 마우스 입력을 받아 시점을 회전하거나 확대·축소하고, 클라우드에서 결과를 렌더링한 뒤 실시간으로 저에게 스트리밍해 주는 것입니다.

<div class="divider"></div>

## 비용이 만만치 않겠는데

사이트에 동시 접속자가 1,000명 있다고 상상해 보세요. 입력을 받아 대용량 실시간 영상을 스트리밍해 주는 하드웨어 가속 게임 엔진 인스턴스가 1,000개나 필요합니다. Stadia나 GeForce Now 같은 클라우드 게임 서비스와 똑같은 구조죠. 회사 측도 이 비용을 잘 알고 있는 듯합니다. 60초 동안 아무 조작이 없으면 비용 절감을 위해 연결을 끊어 버립니다.

![비활성 상태 다운그레이드]({{ "/inactivity-downgrade.png" | prepend: page.imgpath }}){: width="524" height="60" loading="lazy" decoding="async"}
{% include caption.html content="유휴 상태에서 2D로 다운그레이드하는 것만으로도 비용을 엄청나게 아낄 수 있을 겁니다." %}

<div class="divider"></div>

## 애초에 비디오 게임 엔진이란 무엇인가

언뜻 보면 게임 엔진을 이런 곳에 쓰는 게 의외로 느껴질 수 있지만, 비디오 게임 엔진은 본질적으로 고도로 최적화된 시뮬레이터입니다. Unity처럼 검증된 게임 엔진에는 광선 추적과 각종 물리 현상을 시뮬레이션하기 위한 수십 년의 연구 성과가 녹아 있습니다. 그러니 현실을 시뮬레이션하고 싶다면 — 그것이 자동차 쇼룸이라 하더라도 — 비디오 게임 엔진은 수많은 분야로 확장할 수 있는 완벽하고 즉시 활용 가능한 도구인 셈입니다.

돌이켜 보면 그냥 검색을 좀 해 보고 Unity 블로그 글을 찾아냈어도 Lucid 컨피규레이터의 원리를 알아낼 수 있었을 겁니다. 하지만 직접 역공학(reverse-engineering)을 해 보니 이 제품이 직면한 과제와 해법, 내부 메커니즘을 훨씬 가까이서 들여다볼 수 있었고, 바닥부터 단서를 추적하는 탐정이 된 기분이 들었습니다. 무엇보다 가장 유쾌하게 느껴졌던 점은 오늘날 기술이 도달한 어마어마한 복잡성이었습니다. Amazon 데이터센터의 원격 서버에서 돌아가는 초현실적인 물리 시뮬레이터가 내 컴퓨터의 명령을 받아 빛의 속도로 영상을 스트리밍해 주는 덕분에, 내가 브라우저에서 자동차 꾸미기 놀이를 하고 있다니 말입니다. 달에 갈 때 필요했던 건 고작 계산기 수준이었는데 말이죠!
