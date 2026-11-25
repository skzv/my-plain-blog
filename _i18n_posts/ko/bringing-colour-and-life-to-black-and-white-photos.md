---
layout: post
lang_code: ko
locale: ko_KR
ref: bringing-colour-and-life-to-black-and-white-photos
date: 2021-06-12 00:00:00 -0700
last_modified_at: 2021-06-12 00:00
permalink: /ko/bringing-colour-and-life-to-black-and-white-photos
title: "흑백 사진에 색채와 생명을 불어넣기"
imgpath: /assets/img/colourising-black-and-white-photos
previewurl: /mama-and-vova-colorized.jpg
description: "AI와 DeepAI API로 가족 흑백 사진을 컬러 복원한 경험, 일괄 처리 스크립트, 그리고 AI 컬러화의 기술적 한계와 윤리적 고민을 나눕니다."
image: /assets/img/colourising-black-and-white-photos/og-preview.png
image_width: 1200
image_height: 630
image_alt: "AI로 컬러 복원된 가족 사진"
mathjax: false
tags: [computer-vision, machine-learning]
toc: true
---

{% include description.html content="머신러닝을 이용하면 흑백 사진에 손쉽게 색을 입힐 수 있습니다. 하지만 어떤 위험이 따를까요?" %}

## 다른 우주 속의 장면

기술적으로 컬러 사진은 100년 넘게 존재해 왔습니다([컬러 사진의 개척자인 Sergey Prokudin-Gorsky와 Piotr Vedenisov는 러시아 제국 곳곳을 여행하며 천연색으로 기록을 남겼습니다](https://www.loc.gov/pictures/related/?fi=name&q=Prokudin-Gorski%20%2C%20Serge%20%20Mikha%20lovich%2C%201863-1944)). 하지만 20세기의 대부분은 흑백으로 기록되었습니다. 20세기 후반에도 세계 곳곳에서는 컬러 필름을 쉽게 구할 수 없었습니다. 제 아버지도 1980~90년대 소비에트 우크라이나에서 흑백 사진을 직접 현상하셨고, 미국이 베트남 전쟁을 컬러 영상으로 기록하던 시절에도 북베트남 측의 시선은 거의 흑백 사진으로만 남아 있습니다.

![심 강가의 어린 소년]({{ "/boy-sim-river.jpeg" | prepend: page.imgpath }}){: width="900" height="648" fetchpriority="high" decoding="async"}
{% include caption.html content="심(Sim) 강가의 어린 소년. 러시아 제국 시절에 촬영된 아주 초기의 컬러 사진입니다. 같은 장면을 서로 다른 색 필터로 여러 번 촬영해 구현했습니다. 미국 의회도서관 소장." %}

흑백 영상만의 고유한 매력이 있다고 말하는 사람들도 있고, 그 말에도 일리가 있습니다. 하지만 저에게 흑백 영상은 장면과의 거리감을 느끼게 합니다. 시간적으로 멀리 떨어져 있다는 인상이 강하게 들죠. 영화에서 과거 회상 장면을 흑백으로 처리하는 클리셰가 보여주듯, 우리는 모두 흑백 화면을 '과거'와 연관 짓습니다. 온전한 색채 속에서 현실을 살아가는 사람으로서 흑백 장면에 온전히 몰입하기란 쉽지 않습니다. 제 머릿속에서는 그 장면이 어딘가 다른, 흑백의 우주에 존재하는 것처럼 느껴지기 때문입니다. 그런데 그 장면에 색이 입혀지는 순간, 갑자기 모든 것이 훨씬 생생하고, 믿기 쉽고, 손에 잡힐 듯이 다가옵니다. 사진 속 인물과 풍경이 바로 우리와 같은 지구, 우리와 똑같은 사람들의 이야기라는 사실이 단번에 와닿는 것이죠.

그래서 최근 아버지께서 가족 사진첩을 디지털화하기 시작하셨을 때 — 종이 사진은 시간이 지날수록 바래고, 그 안에 담긴 역사와 기억, 유산과 함께 영영 사라질 위험이 있으니까요 — 저도 이 사진들을 컬러로 복원해 보고 싶다는 마음이 들었습니다. 저 자신이 그 시절을 더 온전히 느껴 보고 싶기도 했고, 가족들이 이제는 곁에 없는 사랑하는 이들을 추억하고 자신의 젊은 날을 떠올릴 수 있으면 좋겠다고 생각했습니다.

<div class="divider"></div>

## AI로 사진에 색 입히기

컬러 복원은 사람이 수작업으로 공들여 할 수도 있지만, 머신러닝 모델을 이용하면 훨씬 빠르고 저렴하게 흑백 사진에 색을 입힐 수 있습니다. 물론 이 글 후반부에서 살펴볼 한계도 분명 존재합니다. 저는 이 작업을 위해 직접 모델을 학습시키지는 않았습니다. 이미 수많은 연구자들이 수천 시간을 쏟아부어 개발하고 학습시킨 모델들이 있으니까요. 그중 꽤 훌륭한 결과를 내는 기존 모델을 하나 찾았습니다.

제가 사용한 것은 [DeepAi의 Image Colorization API](https://deepai.org/machine-learning-model/colorizer)입니다. DeepAi가 서비스에 배포한 모델은 [이 GitHub 저장소](https://github.com/jantic/DeOldify)에서 공개된 DeOldify 모델의 일종으로 보입니다.

DeepAi API에서는 모델 파라미터를 직접 조정할 수 없는 것 같지만, 위 저장소에서 직접 실행하거나 [Colab 인스턴스](https://colab.research.google.com/github/jantic/DeOldify/blob/master/ImageColorizerColabStable.ipynb)를 사용하면 파라미터를 조절할 수 있습니다. [MyHeritage](https://www.myheritage.com/incolor) 역시 파라미터 조정이 가능한 서비스 형태로 이 API를 제공하고 있습니다.

저는 폴더 안의 사진을 한꺼번에 컬러화할 수 있는 간단한 스크립트를 만들었습니다. 지정한 디렉터리의 모든 사진을 순회하며 DeepAi의 Image Colorization API로 전송하고, 결과물을 별도의 폴더에 내려받는 방식입니다(이미 컬러화한 이미지는 건너뜁니다). 이 스크립트가 필요하시다면 본인의 DeepAi API 키를 환경 변수로 설정한 뒤 [이 스크립트](https://github.com/skzv/colorize-photos)를 실행해 보세요.

```bash
export DL_API_KEY=<your-deep-ai-key>
python3 main.py /path/to/images
```

<div class="divider"></div>

## 우리 가족 사진들

우리 가족 사진에 적용해 본 결과물 몇 장을 소개합니다.

![형 Vova를 안고 있는 어머니]({{ "/mama-and-vova.webp" | prepend: page.imgpath }}){: width="1600" height="1232" loading="lazy" decoding="async"}
{% include caption.html content="1990년대 초 우크라이나 헤르손(Kherson)에서 형을 안고 계신 어머니. Kuznetsov 가족 소장." %}

![컬러로 복원된 어머니와 형 Vova]({{ "/mama-and-vova-colorized.webp" | prepend: page.imgpath }}){: width="800" height="616" loading="lazy" decoding="async"}
{% include caption.html content="이제 컬러로." %}

![할머니 Allarkadina]({{ "/my-grandmother-allarkadina.jpg" | prepend: page.imgpath }}){: width="523" height="801" loading="lazy" decoding="async"}
{% include caption.html content="아마 1950년대쯤, 대학으로 향하는 길의 할머니 Allarkadina. 여러 교육 기관에서 전기공학을 전공하셨고, 선박 전기 엔지니어로서 성공적인 커리어를 쌓으셨습니다." %}

![컬러로 복원된 할머니 Allarkadina]({{ "/my-grandmother-alla-colourised.webp" | prepend: page.imgpath }}){: width="522" height="800" loading="lazy" decoding="async"}
{% include caption.html content="컬러 버전." %}

> 정말 멋지고 살아 숨 쉬는 것 같구나.

새롭게 색이 입혀진 사진들을 보신 아버지의 이 한마디만으로도 모든 노력이 충분히 보상받는 기분이었습니다.

<div class="divider"></div>

## 베트남 전쟁 사진들

가족 사진을 위해 일괄 컬러화 스크립트를 만든 지 몇 주 뒤, Hacker News 메인 상단에 ["북베트남 측에서 바라본 베트남 전쟁(The Vietnam War from the North Vietnamese Side)"](https://news.ycombinator.com/item?id=27283624)이라는 글이 올라왔습니다. 제 스크립트를 적용해 역사 기록 사진에 새로운 시각을 더해 볼 완벽한 기회처럼 보였습니다. 다큐멘터리 영화 ["그들은 늙지 않을 것이다(They Shall Not Grow Old)"](https://www.imdb.com/title/tt7905466/)가 1차 세계대전의 참혹함을 생생한 현실로 되살려 냈듯, 저도 북베트남의 시선으로 담긴 인물과 장면들을 생동감 있게 보여 주고 싶었습니다.

![고엽제로 파괴된 정글 흑백 사진]({{ "/vietnam-agent-orange.jpeg" | prepend: page.imgpath }}){: width="1600" height="1179" loading="lazy" decoding="async"}
{% include caption.html content="고엽제(Agent Orange)로 파괴된 정글." %}

![고엽제로 파괴된 정글 컬러 복원 사진]({{ "/vietnam-agent-orange-colourised.webp" | prepend: page.imgpath }}){: width="800" height="590" loading="lazy" decoding="async"}
{% include caption.html content="컬러 버전." %}

![격추된 미군기를 살피는 현지인들 흑백 사진]({{ "/vietnam-downed-aircraft.jpeg" | prepend: page.imgpath }}){: width="1600" height="1111" loading="lazy" decoding="async"}
{% include caption.html content="Stephen Owen Musselman 중위가 조종하던 격추된 미군기를 살펴보는 현지인들. 조종사는 생존하지 못했습니다 — 전쟁은 지옥입니다." %}

![격추된 미군기를 살피는 현지인들 컬러 복원 사진]({{ "/vietnam-downed-aircraft-colourised.webp" | prepend: page.imgpath }}){: width="800" height="556" loading="lazy" decoding="async"}
{% include caption.html content="컬러 버전." %}

원본 흑백 사진 전체는 [여기](https://rarehistoricalphotos.com/vietnam-war-images-from-vietnamese-photographers/)에서, 컬러로 복원한 버전은 [여기](https://imgur.com/a/aJbpMjf)에서 보실 수 있습니다.

<div class="divider"></div>

## Hacker News의 반응

제 시도는 칭찬을 받기도 했고

![칭찬 댓글]({{ "/praise.webp" | prepend: page.imgpath }}){: width="624" height="934" loading="lazy" decoding="async"}

비판을 받기도 했지만

![비판 댓글]({{ "/contempt.png" | prepend: page.imgpath }}){: width="546" height="286" loading="lazy" decoding="async"} {% include caption.html content="흥미로운 지적이 담긴 댓글이 [flagged] 처리되어 아쉽습니다. 대략 '제발 이런 짓 하지 말아 주세요'라는 내용이었습니다." %}

무엇보다 아주 흥미로운 토론들을 많이 이끌어 냈습니다.

![토론 댓글]({{ "/discussion.webp" | prepend: page.imgpath }}){: width="654" height="946" loading="lazy" decoding="async"}

이 컬러 복원 사진들로 촉발된 전체 스레드는 [여기](https://news.ycombinator.com/item?id=27284795)에서 확인하실 수 있습니다.

<div class="divider"></div>

## 한계점

그 토론에서 제 눈에 특히 띄었던 지점이 두 가지 있었습니다. 첫 번째는 AI의 한계를 다시금 일깨워 준 점입니다.

예를 들어 건설 중인 금문교(Golden Gate Bridge)의 옛날 사진에 모델을 적용하면 다리가 하얗게 칠해집니다. 완전히 틀린 말은 아닌 것이, 실제로 금문교는 공사 초기에는 하얀색이었습니다. 하지만 [DeOldify 저장소](https://github.com/jantic/DeOldify)의 설명에 따르면, 이 사진이 촬영된 시점에는 이미 붉은색 프라이머가 칠해져 있었다고 합니다. 즉 학습 데이터에 건설 중인 금문교 사진이 들어 있어서 모델이 다리 자체는 알아봤겠지만, 사진의 정확한 촬영 시점까지 파악해 이미 붉은 프라이머가 칠해진 상태라는 것까지는 추론하지 못한 것입니다.

![하얀색 금문교?]({{ "/golden-gate.webp" | prepend: page.imgpath }}){: width="1200" height="472" loading="lazy" decoding="async"} {% include caption.html content="하얀색 금문교라니? 실제로 하얀 시절이 있긴 했지만, 이 사진이 찍힐 때는 아니었습니다." %}

어떤 장면들은 본질적으로 모호합니다. 아래 사진처럼 화면 속 특징만으로는 바닥이 들판인지 아스팔트인지 모델이 구분하지 못해, 사람이라면 맞게 칠했을 아스팔트를 잘못해서 초록색으로 칠해 버리기도 합니다.

![기념 행사 컬러 복원 사진]({{ "/a-celebration-colourised.webp" | prepend: page.imgpath }}){: width="800" height="522" loading="lazy" decoding="async"} {% include caption.html content="모델이 바닥이 잔디가 아니라 아스팔트라는 걸 알아차리지 못했습니다." %}

또 하나 흥미로웠던 관찰은, 옷가지처럼 뚜렷한 색조나 질감, 단서가 부족한 대상은 정확하게 색을 입히기 어렵다는 점이었습니다. 모델은 특별한 단서나 맥락이 없으면 옷을 보라색 계열로 칠하는 경향이 있었습니다. 아마 옷 색깔을 확실히 추론하기 어려울 때 보라색이 모호한 색 공간의 중간 지점에 해당하는 안전한 선택이어서 학습 손실(loss)을 최소화하기 때문일 것입니다.

![베트남 잠수부들 — 전부 보라색 옷?]({{ "/vietnam-divers-colourised.webp" | prepend: page.imgpath }}){: width="796" height="800" loading="lazy" decoding="async"} {% include caption.html content="과거 사람들이 이 모델이 칠한 것처럼 보라색 옷을 그렇게 자주 입었을 것 같지는 않네요." %}

실제로 제 아버지도 복원된 사진 속 몇몇 물건의 색을 고쳐 달라고 부탁하셨습니다. 아쉽게도 그 요청을 해결해 드리지는 못했고, 어떻게 수정해야 할지도 당장 뾰족한 방법이 떠오르지 않았습니다. 하지만 한 댓글 작성자가 말했듯, 색이 조금 틀리더라도 사진에 생기가 되살아나는 효과는 분명합니다.

<div class="divider"></div>

## 윤리적 고민

이제 기술적 한계가 분명해졌으니, 컬러화 AI가 가져올 윤리적 파급 효과도 생각해 볼 시점입니다. 이것이 토론에서 제 마음에 깊이 남았던 두 번째 지점입니다. 처음 이 프로젝트를 시작할 때는 윤리 문제까지는 미처 생각하지 못했지만, 받은 피드백 덕분에 깊이 성찰할 계기가 되었고 그 점에 감사하고 있습니다.

핵심적인 윤리적 쟁점은 '진실성'입니다. 딥페이크(deepfake)가 무엇이 진실인지 혼란스럽게 만드는 논란과 비슷하게, 인위적인 채색은 우리가 역사를 경험하는 방식을 바꿀 수 있습니다. AI는 과거의 색을 임의로 선택하며, 그 선택은 반드시 정확하지 않습니다. 예를 들어 AI가 만들어 낸 하얀색 금문교 사진이 그대로 유통된다면, 보는 사람들은 역사적 사실과 다른 모습의 다리를 기억하게 됩니다. 물론 흑백 사진 역시 실제 색을 담고 있지는 않습니다. 하지만 흑백 사진을 보는 사람은 '과거가 원래 흑백은 아니었지'라고 분명히 인지하는 반면, 컬러 복원 사진을 보는 사람은 그게 실제 과거의 모습이었다고 쉽게 믿어 버릴 위험이 있습니다.

어떤 이들은 이런 보정이 역사를 고쳐 쓰는 행위라고까지 말하며, 실제로 그렇게 보이는 사례도 있습니다. 최근의 한 사건을 보죠.

> 캄보디아 정부는 크메르 루주(Khmer Rouge) 희생자들의 사진을 새롭게 컬러화해 실은 기사를 철회하라고 미국 매체 Vice에 요구했다. 일부 사진에 미소가 합성되어 고인에 대한 모독이라는 이유에서다.

<p class="caption" style="margin-top:-25px;"><a href="https://www.aljazeera.com/news/2021/4/11/cambodia-condemns-vice-for-altered-khmer-rouge-images">출처</a></p>

매우 타당한 항의입니다. 모델이 주로 웃는 얼굴 위주로 학습되어 과적합(overfit)되었을 가능성이 큽니다. 그 결과 희생자들의 얼굴마저 학습 데이터와 비슷하게 웃는 표정으로 바꿔 버린 것입니다. AI를 부주의하게 적용했을 때 어떤 함정에 빠질 수 있는지 잘 보여 주는 사례입니다.

제가 사용한 것과 같은 DeOldify 모델을 기반으로 컬러 복원 서비스를 제공하는 [MyHeritage](https://www.myheritage.com/incolor)는 모든 보정 이미지에 워터마크를 넣는 절충안을 택했습니다. 꽤 설득력 있는 주장이라고 생각합니다.

> 당사는 원래 컬러로 촬영된 사진과 컬러화 처리된 사진을 구분하기 위해, 컬러화된 모든 사진의 왼쪽 하단에 양각 형태의 팔레트 아이콘을 표시합니다. 아무리 사실적이더라도 컬러화 사진의 색상은 자동 알고리즘으로 시뮬레이션된 것이며 원본 장면의 실제 색과 다를 수 있습니다. 사용자가 실제 컬러 사진과 구별할 수 있도록 모든 컬러화 사진에 팔레트 아이콘을 넣으며, 사진 컬러화 기술을 사용하는 다른 곳들도 이런 책임 있는 관행을 따르기를 바랍니다. 반면 색 바랜 컬러 사진을 복원(color restoration)한 경우에는 원래의 색이므로 아이콘을 표시하지 않습니다.

제 경우에는 가족들이 제가 사진을 인위적으로 컬러화했다는 사실을 알고 있었고, 색이 완전히 정확하지 않다는 것도 알아봤습니다. 그럼에도 틀린 색이 섞여 있더라도 사진과 그 속의 사람들, 장면들은 생생하게 되살아났습니다. 고등학생 시절 양로원에서 봉사할 때, 50년 동안 고향에 가 보지 못한 어르신께 Google Street View로 어린 시절 사셨던 드레스덴(Dresden)의 집을 보여 드렸던 것처럼, 이번에는 AI의 힘으로 우리 가족을 수십 년 전의 좋았던 시절로 데려갈 수 있었습니다. 기술은 결국 도구이며, 이런 마법 같은 일이 가능한 시대에 살고 있음에 감사할 따름입니다.
