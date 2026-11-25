---
layout: post
lang_code: ko
locale: ko_KR
ref: 3d-reconstruction-from-public-photos
date: 2025-08-21 00:00:00 -0700
last_modified_at: 2025-08-21 00:00
permalink: /ko/3d-reconstruction-from-public-photos
title: "머신러닝으로 공개 사진에서 3D 재구성하기"
imgpath: /assets/img/3d-reconstruction
previewurl: /3d-reconstruction-preview.png
description: "Apple Depth Pro, 카메라 투영 기하학, Open3D를 사용해 공개 사진 한 장을 3D로 재구성하는 방법을 살펴봅니다. 깊이 추정, 포인트 클라우드 예제, 모델의 한계까지 다룹니다."
image: /assets/img/3d-reconstruction/3d-reconstruction-preview.png
image_width: 1200
image_height: 630
image_alt: "추정된 깊이 정보를 사용해 공개 사진을 3D로 재구성한 모습"
mathjax: true
tags: [computer-vision, 3d-graphics, machine-learning]
toc: true
---

{% include description.html content="공개된 사진들만으로 세상을 3D로 재구성할 수 있을까요?" %}

## 세상을 3D로 매핑하기

인터넷에는 Reddit, YouTube, Google Maps 사진 업로드 등 온갖 출처에서 올라온 공개 사진이 넘쳐납니다.

![Google Maps 사진 예시]({{ "/google-maps-photos.webp" | prepend: page.imgpath }}){: width="1600" height="1232" fetchpriority="high" decoding="async" style="max-height:400px;width:auto"}
{% include caption.html content="Google Maps에 공개된 사진들" %}

문득 궁금해졌습니다. 이 수많은 데이터로 세상의 3D 지도를 만들 수 있을까요? 카메라는 사진을 찍을 때 모든 3D 정보를 날려 버리지만, 최신 머신러닝 기술을 사용하면 그 정보를 되살려 이런 평면 사진을:

![Safeway 입력 이미지 0]({{ "/safeway-1.webp" | prepend: page.imgpath }}){: width="680" height="510" loading="lazy" decoding="async"}
{% include caption.html content="공개 Safeway 입력 이미지 0." %}

이런 3D 모델로 바꿀 수 있습니다.

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1360" height="810" poster="/assets/video/3d-reconstruction/safeway-1-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/safeway-1-recording.mp4" type="video/mp4">
        브라우저가 video 태그를 지원하지 않습니다.
    </video>
</div>

유명한 싱가포르 공항(Singapore Airport) 사진으로 해 본 또 다른 예시입니다.

![싱가포르 공항 입력 이미지]({{ "/sg-airport-0.jpeg" | prepend: page.imgpath }}){: width="960" height="1280" loading="lazy" decoding="async" style="max-height:600px;width:auto"}
{% include caption.html content="공개 싱가포르 공항 입력 이미지." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1012" height="1008" poster="/assets/video/3d-reconstruction/sg-airport-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/sg-airport-recording.mp4" type="video/mp4">
        브라우저가 video 태그를 지원하지 않습니다.
    </video>
</div>

심지어 숲 사진도 가능합니다.

![숲 입력 이미지]({{ "/forest-0.jpg" | prepend: page.imgpath }}){: width="1500" height="900" loading="lazy" decoding="async"}
{% include caption.html content="공개 숲 입력 이미지." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1358" height="714" poster="/assets/video/3d-reconstruction/forest-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/forest-recording.mp4" type="video/mp4">
        브라우저가 video 태그를 지원하지 않습니다.
    </video>
</div>

이를 구현하기 위해 저는 머신러닝 깊이 추정 모델과 약간의 선형대수학을 사용했습니다.

## 카메라 투영

아래 그림처럼 카메라는 3D 공간을 2D 평면으로 투영(projection)하는 장치로 볼 수 있습니다. 이 과정에서 세 번째 차원인 깊이(depth) 정보가 사라집니다.

![카메라 투영 시각화]({{ "/camera-projection.png" | prepend: page.imgpath }}){: width="850" height="356" loading="lazy" decoding="async"}
{% include caption.html content="3D에서 2D로의 카메라 투영. 출처: [1]" %}

우리가 해결해야 할 과제는 사라진 세 번째 차원을 복원하고, 이 투영을 거꾸로 되돌리는 방법을 찾는 것입니다.

## 카메라 내부 파라미터(Camera Intrinsics)

이미지를 3D로 재구성하려면 모든 픽셀의 깊이만 아는 것으로는 충분하지 않습니다. 카메라의 고유 특성 — 그중에서도 특히 초점거리(focal length) — 이 3D 공간의 점들이 2D 픽셀로 어떻게 매핑되는지를 결정하기 때문에, 이 매핑을 역변환하려면 카메라의 특성도 알아야 합니다. 아래 예시를 보면 초점거리가 달라질 때 이미지가 얼마나 크게 변하는지 한눈에 알 수 있습니다.

<div style="text-align:center">
  <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="600" height="600" poster="/assets/video/3d-reconstruction/face-focal-length-poster.webp" style="max-height:400px;width:auto">
    <source src="/assets/video/3d-reconstruction/face-focal-length.mp4" type="video/mp4">
    초점거리에 따른 얼굴 사진 변화 시연
  </video>
</div>
{% include caption.html content="초점거리가 이미지에 미치는 영향을 보여 주는 시연. 출처: [2]" %}

따라서 이 사진들 중 어느 하나로든 얼굴을 정확하게 3D 재구성하려면 카메라의 특성을 반드시 알아야 한다는 결론이 자연스럽게 나옵니다.

아래 그림의 닮은 삼각형 성질을 이용하면, 이미지 상의 점과 3D 공간의 점 사이의 관계는 아주 간단하게 나타납니다.

{%include math.html content=
"
\begin{align}
x = f \frac{X}{Z} \space\space\space\space\space y = f \frac{Y}{Z} \tag{1} \label{eq:camera perspective projection}
\end{align}
" 
%}

![카메라 원근 투영]({{ "/camera-perspective-focal.png" | prepend: page.imgpath }}){: width="1073" height="834" loading="lazy" decoding="async"}
{% include caption.html content="카메라 원근 투영" %}

이 변환을 뒤집어 이미지 상의 점을 다시 3D 좌표로 매핑하면 다음과 같습니다.

{%include math.html content=
"
\begin{align}
X = \frac{x \cdot Z}{f} \space\space\space\space\space Y = \frac{y \cdot Z}{f} \space\space\space\space\space Z = Z \tag{2} \label{eq:inverse camera perspective projection}
\end{align}
" 
%}

결국 우리에게 없는 두 가지 핵심 조각은 각 픽셀의 깊이 $$Z$$와 카메라의 초점거리 $$f$$입니다. 공개 사진에서는 이 둘 모두 바로 얻을 수 없습니다. 카메라 정보가 담겨 있을 법한 EXIF 데이터도 웹에 올라오면서 대부분 삭제되기 때문입니다.

참고로 아래 그림처럼 카메라의 위치와 자세(pose)까지 반영해 3D와 2D 좌표계 사이의 완전한 변환을 기술할 수도 있습니다. 하지만 이 글에서는 카메라의 로컬 좌표계만 다루겠습니다.

![완전한 카메라 모델]({{ "/complete-camera-model.jpg" | prepend: page.imgpath }}){: width="1280" height="720" loading="lazy" decoding="async"}
{% include caption.html content="완전한 카메라 모델. 출처: [3]" %}

## 깊이 마스크(Depth Masks)

이 프로젝트를 가능하게 만들어 준 것은 Apple이 최근 공개한 [DepthPro 모델](https://github.com/apple/ml-depth-pro)입니다. 깊이 추정 모델은 이전에도 오래전부터 있었지만, 이 모델은 두 가지 면에서 남달랐습니다.
    1. 절대적인 미터법 스케일(metric scale)로 깊이를 추정해 주기 때문에, 단안(mono) 이미지 한 장만으로도 실제 비율이 맞는 3D 재구성이 가능했습니다.
    2. 카메라의 초점거리까지 함께 추정해 주었습니다.

![Depth Pro 티저 이미지]({{ "/depth-pro-teaser.webp" | prepend: page.imgpath }}){: width="1242" height="535" loading="lazy" decoding="async"}
{% include caption.html content="Depth Pro 티저 이미지. 출처: [4]" %}

여러 공개 사진에 이 모델을 돌려 깊이 마스크와 초점거리를 추정해 보았습니다. 예를 들어 이 이미지의 경우:

![Safeway 입력 이미지 1]({{ "/safeway-1.webp" | prepend: page.imgpath }}){: width="680" height="510" loading="lazy" decoding="async"}
{% include caption.html content="공개 Safeway 입력 이미지 1." %}

모델이 추정한 깊이 마스크와 초점거리는 다음과 같습니다.

![Safeway 깊이 마스크 1]({{ "/safeway-1-depth-black.png" | prepend: page.imgpath }}){: width="507" height="396" loading="lazy" decoding="async"}
{% include caption.html content="DepthPro 모델이 예측한 Safeway 깊이 마스크 1과 초점거리." %}

그런 다음 식 $$(2)$$를 사용해 각 픽셀을 다시 3D 공간으로 매핑해 포인트 클라우드(point cloud)를 만들고, Open3D로 시각화했습니다.

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1360" height="810" poster="/assets/video/3d-reconstruction/safeway-1-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/safeway-1-recording.mp4" type="video/mp4">
        브라우저가 video 태그를 지원하지 않습니다.
    </video>
</div>

## 3D 재구성 결과 모음

아래에서 제가 실험한 모든 예시를 확인해 보세요. 특히 뉴욕 스카이라인(NYC Skyline) 예시를 주목해 보시기 바랍니다. 뉴욕 스카이라인처럼 거대한 스케일의 장면에서도 얼마나 잘 작동할지 궁금해서 돌려 보았는데, 예상대로 DepthPro 모델은 좋은 깊이 마스크를 만들어 내지 못했습니다. 학습 데이터셋이 거의 확실히 더 작은 스케일의 장면에 집중되어 있기 때문일 것입니다.

### COEX Mall

![코엑스몰 입력 이미지]({{ "/coex-0.jpg" | prepend: page.imgpath }}){: width="924" height="483" loading="lazy" decoding="async"}
{% include caption.html content="공개 COEX Mall 입력 이미지." %}

![코엑스몰 깊이 마스크]({{ "/coex-0-depth-black.png" | prepend: page.imgpath }}){: width="506" height="389" loading="lazy" decoding="async"}
{% include caption.html content="DepthPro 모델이 예측한 COEX Mall 깊이 마스크와 초점거리." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1398" height="848" poster="/assets/video/3d-reconstruction/coex-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/coex-recording.mp4" type="video/mp4">
        브라우저가 video 태그를 지원하지 않습니다.
    </video>
</div>

<div class="divider"></div>

### Forest

![숲 입력 이미지]({{ "/forest-0.jpg" | prepend: page.imgpath }}){: width="1500" height="900" loading="lazy" decoding="async"}
{% include caption.html content="공개 숲 입력 이미지." %}

![숲 깊이 마스크]({{ "/forest-0-depth-black.png" | prepend: page.imgpath }}){: width="506" height="389" loading="lazy" decoding="async"}
{% include caption.html content="DepthPro 모델이 예측한 숲 깊이 마스크와 초점거리." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1358" height="714" poster="/assets/video/3d-reconstruction/forest-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/forest-recording.mp4" type="video/mp4">
        브라우저가 video 태그를 지원하지 않습니다.
    </video>
</div>

<div class="divider"></div>

### NYC Skyline

![뉴욕 스카이라인 입력 이미지]({{ "/nyc-0.webp" | prepend: page.imgpath }}){: width="1000" height="560" loading="lazy" decoding="async"}
{% include caption.html content="공개 뉴욕 스카이라인 입력 이미지." %}

![뉴욕 스카이라인 깊이 마스크]({{ "/nyc-depth-black.png" | prepend: page.imgpath }}){: width="498" height="389" loading="lazy" decoding="async"}
{% include caption.html content="DepthPro 모델이 예측한 뉴욕 스카이라인 깊이 마스크와 초점거리." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1382" height="714" poster="/assets/video/3d-reconstruction/nyc-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/nyc-recording.mp4" type="video/mp4">
        브라우저가 video 태그를 지원하지 않습니다.
    </video>
</div>

<div class="divider"></div>

### Safeway 1

![Safeway 입력 이미지 0]({{ "/safeway-0.webp" | prepend: page.imgpath }}){: width="680" height="510" loading="lazy" decoding="async"}
{% include caption.html content="공개 Safeway 입력 이미지 0." %}

![Safeway 깊이 마스크 0]({{ "/safeway-0-depth-black.png" | prepend: page.imgpath }}){: width="506" height="396" loading="lazy" decoding="async"}
{% include caption.html content="DepthPro 모델이 예측한 Safeway 깊이 마스크 0과 초점거리." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1066" height="776" poster="/assets/video/3d-reconstruction/safeway-0-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/safeway-0-recording.mp4" type="video/mp4">
        브라우저가 video 태그를 지원하지 않습니다.
    </video>
</div>

<div class="divider"></div>

### Safeway 2

![Safeway 입력 이미지 1]({{ "/safeway-1.webp" | prepend: page.imgpath }}){: width="680" height="510" loading="lazy" decoding="async"}
{% include caption.html content="공개 Safeway 입력 이미지 1." %}

![Safeway 깊이 마스크 1]({{ "/safeway-1-depth-black.png" | prepend: page.imgpath }}){: width="507" height="396" loading="lazy" decoding="async"}
{% include caption.html content="DepthPro 모델이 예측한 Safeway 깊이 마스크 1과 초점거리." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1360" height="810" poster="/assets/video/3d-reconstruction/safeway-1-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/safeway-1-recording.mp4" type="video/mp4">
        브라우저가 video 태그를 지원하지 않습니다.
    </video>
</div>

<div class="divider"></div>

### Singapore Airport

![싱가포르 공항 입력 이미지]({{ "/sg-airport-0.jpeg" | prepend: page.imgpath }}){: width="960" height="1280" loading="lazy" decoding="async" style="max-height:600px;width:auto"}
{% include caption.html content="공개 싱가포르 공항 입력 이미지." %}

![싱가포르 공항 깊이 마스크]({{ "/sg-airport-0-depth-black.png" | prepend: page.imgpath }}){: width="387" height="432" loading="lazy" decoding="async"}
{% include caption.html content="DepthPro 모델이 예측한 싱가포르 공항 깊이 마스크와 초점거리." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1012" height="1008" poster="/assets/video/3d-reconstruction/sg-airport-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/sg-airport-recording.mp4" type="video/mp4">
        브라우저가 video 태그를 지원하지 않습니다.
    </video>
</div>

<div class="divider"></div> 

## 각주

1. 3D에서 2D로의 카메라 투영. 출처: [ResearchGate](https://www.researchgate.net/figure/The-perspective-projection-of-a-camera-model_fig2_324584663)
2. 초점거리가 이미지에 미치는 영향 시연. 출처: [DIY Photography](https://www.diyphotography.net/gif-explains-changing-focal-length-impacts-portrait)
3. 완전한 카메라 모델. 출처: [Robot Academy](https://robotacademy.net.au/lesson/summary-of-image-geometry/)
4. Depth Pro 티저 이미지. 출처: [Apple](https://github.com/apple/ml-depth-pro)
