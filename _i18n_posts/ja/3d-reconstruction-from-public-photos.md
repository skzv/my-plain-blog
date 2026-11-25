---
layout: post
lang_code: ja
locale: ja_JP
ref: 3d-reconstruction-from-public-photos
date: 2025-08-21 00:00:00 -0700
last_modified_at: 2025-08-21 00:00
permalink: /ja/3d-reconstruction-from-public-photos
title: "機械学習を用いた公開写真からの 3D 再構成"
imgpath: /assets/img/3d-reconstruction
previewurl: /3d-reconstruction-preview.png
description: "Apple の Depth Pro、カメラ投影の幾何学、Open3D を使って公開写真を 3D 再構成する試み。深度推定、点群、モデルの限界を実例とともに紹介します。"
image: /assets/img/3d-reconstruction/3d-reconstruction-preview.png
image_width: 1200
image_height: 630
image_alt: "推定深度を用いた公開写真の 3D 再構成"
mathjax: true
tags: [computer-vision, 3d-graphics, machine-learning]
toc: true
---

{% include description.html content="公開されている写真だけから世界を 3D 再構成できるのでしょうか？" %}

## 世界をマッピングする

インターネット上には、Reddit、YouTube、Google マップの投稿写真など、さまざまなソースから集まった膨大な公開写真が存在します。

![Google マップの写真の例]({{ "/google-maps-photos.webp" | prepend: page.imgpath }}){: width="1600" height="1232" fetchpriority="high" decoding="async" style="max-height:400px;width:auto"}
{% include caption.html content="Google マップ上で公開されている写真" %}

そこで私はふと思いました――これだけのデータがあれば、世界の 3D マップを作れるのではないか？カメラで写真を撮ると 3D 情報はすべて失われてしまいますが、最先端の機械学習を使えばそれを復元し、このような写真を、

![Safeway 入力画像 0]({{ "/safeway-1.webp" | prepend: page.imgpath }}){: width="680" height="510" loading="lazy" decoding="async"}
{% include caption.html content="公開されている Safeway の入力画像 0。" %}

このような 3D モデルへと変換できるのです。

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1360" height="810" poster="/assets/video/3d-reconstruction/safeway-1-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/safeway-1-recording.mp4" type="video/mp4">
        お使いのブラウザは video タグに対応していません。
    </video>
</div>

有名なシンガポール・チャンギ空港の例も見てみましょう。

![シンガポール空港 入力画像]({{ "/sg-airport-0.jpeg" | prepend: page.imgpath }}){: width="960" height="1280" loading="lazy" decoding="async" style="max-height:600px;width:auto"}
{% include caption.html content="公開されているシンガポール空港の入力画像。" %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1012" height="1008" poster="/assets/video/3d-reconstruction/sg-airport-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/sg-airport-recording.mp4" type="video/mp4">
        お使いのブラウザは video タグに対応していません。
    </video>
</div>

さらには森の写真でも可能です。

![森の入力画像]({{ "/forest-0.jpg" | prepend: page.imgpath }}){: width="1500" height="900" loading="lazy" decoding="async"}
{% include caption.html content="公開されている森の入力画像。" %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1358" height="714" poster="/assets/video/3d-reconstruction/forest-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/forest-recording.mp4" type="video/mp4">
        お使いのブラウザは video タグに対応していません。
    </video>
</div>

これを実現するために、機械学習による深度推定モデルとちょっとした線形代数を使いました。

## カメラ投影

下の図のように、カメラは 3D から 2D への投影を行っていると見なすことができます。この過程で、3つ目の次元である「深度（奥行き）」の情報が失われます。

![カメラ投影の可視化]({{ "/camera-projection.png" | prepend: page.imgpath }}){: width="850" height="356" loading="lazy" decoding="async"}
{% include caption.html content="3D から 2D へのカメラ投影。出典：[1]" %}

私たちの課題は、この失われた3次元目を復元し、そのうえでこの投影を逆変換する方法を見つけることです。

## カメラの内部パラメータ（Camera Intrinsics）

画像を 3D 再構成するには、画像内の各ピクセルの深度を知るだけでは不十分です。なぜなら、3D 空間上の点が 2D のピクセルにどう写像されるかはカメラの特性――とりわけ焦点距離――によって決まるため、その写像を逆算するにはカメラの特性も知る必要があるからです。焦点距離が変わるだけで写り方がどれほど大きく変わるか、下のデモを見てみてください。

<div style="text-align:center">
  <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="600" height="600" poster="/assets/video/3d-reconstruction/face-focal-length-poster.webp" style="max-height:400px;width:auto">
    <source src="/assets/video/3d-reconstruction/face-focal-length.mp4" type="video/mp4">
    顔写真と焦点距離の関係のデモ
  </video>
</div>
{% include caption.html content="焦点距離が画像に与える影響のデモンストレーション。出典：[2]" %}

したがって、これらの画像のどれからであっても顔を正しく 3D 再構成するには、カメラの特性を知っている必要があるのは論理的に明らかです。

下図のような相似三角形の性質を使うと、画像上の点と 3D 空間上の点の関係は非常にシンプルに表せます。

{%include math.html content=
"
\begin{align}
x = f \frac{X}{Z} \space\space\space\space\space y = f \frac{Y}{Z} \tag{1} \label{eq:camera perspective projection}
\end{align}
" 
%}

![カメラの透視投影]({{ "/camera-perspective-focal.png" | prepend: page.imgpath }}){: width="1073" height="834" loading="lazy" decoding="async"}
{% include caption.html content="カメラの透視投影" %}

この変換を逆向きに解いて画像上の点を 3D 空間へ戻すと、次の式が得られます。

{%include math.html content=
"
\begin{align}
X = \frac{x \cdot Z}{f} \space\space\space\space\space Y = \frac{y \cdot Z}{f} \space\space\space\space\space Z = Z \tag{2} \label{eq:inverse camera perspective projection}
\end{align}
" 
%}

つまり、私たちが手に入れなければならない欠損ピースは2つ――各ピクセルの深度 $$Z$$ と、カメラの焦点距離 $$f$$ です。公開写真からはどちらもそのままでは取得できません。カメラ情報が入っている可能性のある EXIF データも、通常は削除されているからです。

なお、下図のようにカメラの姿勢（位置と向き）まで含めて 3D 座標系と 2D 座標系の完全な変換を記述することも可能ですが、この記事ではカメラのローカル座標系のみを扱います。

![完全なカメラモデル]({{ "/complete-camera-model.jpg" | prepend: page.imgpath }}){: width="1280" height="720" loading="lazy" decoding="async"}
{% include caption.html content="完全なカメラモデル。出典：[3]" %}

## 深度マスク（Depth Masks）

このプロジェクトを実現可能にしてくれたのが、Apple が最近公開した [DepthPro モデル](https://github.com/apple/ml-depth-pro)です。深度推定モデル自体は以前から存在していましたが、このモデルには大きく異なる点が2つありました。
    1. 絶対的なメートル法のスケールで深度を出力するため、単眼画像1枚からでも実寸比率の 3D 再構成が可能になる
    2. カメラの焦点距離まで自動で推定してくれる

![Depth Pro ティーザー画像]({{ "/depth-pro-teaser.webp" | prepend: page.imgpath }}){: width="1242" height="535" loading="lazy" decoding="async"}
{% include caption.html content="Depth Pro ティーザー画像。出典：[4]" %}

私はこのモデルをいくつもの公開写真に適用し、以下のように深度マスクと焦点距離を推定しました。たとえばこちらの画像の場合、

![Safeway 入力画像 1]({{ "/safeway-1.webp" | prepend: page.imgpath }}){: width="680" height="510" loading="lazy" decoding="async"}
{% include caption.html content="公開されている Safeway の入力画像 1。" %}

推定された深度マスクと焦点距離は次のようになります。

![Safeway 深度マスク 1]({{ "/safeway-1-depth-black.png" | prepend: page.imgpath }}){: width="507" height="396" loading="lazy" decoding="async"}
{% include caption.html content="DepthPro モデルによって予測された Safeway の深度マスク 1 と焦点距離。" %}

あとは式 $$(2)$$ を使って各ピクセルを 3D 空間へと逆投影して点群（ポイントクラウド）を生成し、Open3D で可視化しました。

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1360" height="810" poster="/assets/video/3d-reconstruction/safeway-1-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/safeway-1-recording.mp4" type="video/mp4">
        お使いのブラウザは video タグに対応していません。
    </video>
</div>

## 3D 再構成の実例

以下に私が試した実例をすべて載せています。特に注目してほしいのはニューヨークのスカイラインの例です。ニューヨークの高層ビル群のような巨大なスケールに対してどこまで通用するのか興味があったのですが、予想通り DepthPro モデルは良好な深度マスクを生成できませんでした。学習データセットはほぼ間違いなく、より小さなスケールのシーンに焦点を当てて作られているのでしょう。

### COEX モール

![COEX モール 入力画像]({{ "/coex-0.jpg" | prepend: page.imgpath }}){: width="924" height="483" loading="lazy" decoding="async"}
{% include caption.html content="公開されている COEX モールの入力画像。" %}

![COEX モール 深度マスク]({{ "/coex-0-depth-black.png" | prepend: page.imgpath }}){: width="506" height="389" loading="lazy" decoding="async"}
{% include caption.html content="DepthPro モデルによって予測された COEX モールの深度マスクと焦点距離。" %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1398" height="848" poster="/assets/video/3d-reconstruction/coex-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/coex-recording.mp4" type="video/mp4">
        お使いのブラウザは video タグに対応していません。
    </video>
</div>

<div class="divider"></div>

### 森

![森 入力画像]({{ "/forest-0.jpg" | prepend: page.imgpath }}){: width="1500" height="900" loading="lazy" decoding="async"}
{% include caption.html content="公開されている森の入力画像。" %}

![森 深度マスク]({{ "/forest-0-depth-black.png" | prepend: page.imgpath }}){: width="506" height="389" loading="lazy" decoding="async"}
{% include caption.html content="DepthPro モデルによって予測された森の深度マスクと焦点距離。" %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1358" height="714" poster="/assets/video/3d-reconstruction/forest-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/forest-recording.mp4" type="video/mp4">
        お使いのブラウザは video タグに対応していません。
    </video>
</div>

<div class="divider"></div>

### ニューヨークのスカイライン

![ニューヨーク 入力画像]({{ "/nyc-0.webp" | prepend: page.imgpath }}){: width="1000" height="560" loading="lazy" decoding="async"}
{% include caption.html content="公開されているニューヨークの入力画像。" %}

![ニューヨーク 深度マスク]({{ "/nyc-depth-black.png" | prepend: page.imgpath }}){: width="498" height="389" loading="lazy" decoding="async"}
{% include caption.html content="DepthPro モデルによって予測されたニューヨークの深度マスクと焦点距離。" %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1382" height="714" poster="/assets/video/3d-reconstruction/nyc-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/nyc-recording.mp4" type="video/mp4">
        お使いのブラウザは video タグに対応していません。
    </video>
</div>

<div class="divider"></div>

### Safeway 1

![Safeway 入力画像 0]({{ "/safeway-0.webp" | prepend: page.imgpath }}){: width="680" height="510" loading="lazy" decoding="async"}
{% include caption.html content="公開されている Safeway の入力画像 0。" %}

![Safeway 深度マスク 0]({{ "/safeway-0-depth-black.png" | prepend: page.imgpath }}){: width="506" height="396" loading="lazy" decoding="async"}
{% include caption.html content="DepthPro モデルによって予測された Safeway の深度マスク 0 と焦点距離。" %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1066" height="776" poster="/assets/video/3d-reconstruction/safeway-0-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/safeway-0-recording.mp4" type="video/mp4">
        お使いのブラウザは video タグに対応していません。
    </video>
</div>

<div class="divider"></div>

### Safeway 2

![Safeway 入力画像 1]({{ "/safeway-1.webp" | prepend: page.imgpath }}){: width="680" height="510" loading="lazy" decoding="async"}
{% include caption.html content="公開されている Safeway の入力画像 1。" %}

![Safeway 深度マスク 1]({{ "/safeway-1-depth-black.png" | prepend: page.imgpath }}){: width="507" height="396" loading="lazy" decoding="async"}
{% include caption.html content="DepthPro モデルによって予測された Safeway の深度マスク 1 と焦点距離。" %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1360" height="810" poster="/assets/video/3d-reconstruction/safeway-1-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/safeway-1-recording.mp4" type="video/mp4">
        お使いのブラウザは video タグに対応していません。
    </video>
</div>

<div class="divider"></div>

### シンガポール空港

![シンガポール空港 入力画像]({{ "/sg-airport-0.jpeg" | prepend: page.imgpath }}){: width="960" height="1280" loading="lazy" decoding="async" style="max-height:600px;width:auto"}
{% include caption.html content="公開されているシンガポール空港の入力画像。" %}

![シンガポール空港 深度マスク]({{ "/sg-airport-0-depth-black.png" | prepend: page.imgpath }}){: width="387" height="432" loading="lazy" decoding="async"}
{% include caption.html content="DepthPro モデルによって予測されたシンガポール空港の深度マスクと焦点距離。" %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1012" height="1008" poster="/assets/video/3d-reconstruction/sg-airport-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/sg-airport-recording.mp4" type="video/mp4">
        お使いのブラウザは video タグに対応していません。
    </video>
</div>

<div class="divider"></div> 

## 脚注

1. 3D から 2D へのカメラ投影。出典：[ResearchGate](https://www.researchgate.net/figure/The-perspective-projection-of-a-camera-model_fig2_324584663)
2. 焦点距離が画像に与える影響のデモンストレーション。出典：[DIY Photography](https://www.diyphotography.net/gif-explains-changing-focal-length-impacts-portrait)
3. 完全なカメラモデル。出典：[Robot Academy](https://robotacademy.net.au/lesson/summary-of-image-geometry/)
4. Depth Pro ティーザー画像。出典：[Apple](https://github.com/apple/ml-depth-pro)
