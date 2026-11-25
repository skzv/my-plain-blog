---
layout: post
lang_code: ja
locale: ja_JP
ref: lucid-configurator-is-a-streaming-video-game
date: 2021-07-28 00:00:00 -0700
last_modified_at: 2021-07-28 00:00
permalink: /ja/lucid-configurator-is-a-streaming-video-game
title: "Lucid Motors のコンフィギュレーターはブラウザにストリーミングされるビデオゲームだ"
imgpath: /assets/img/lucid-configurator-is-a-streaming-video-game
previewurl: /lucid-configurator.png
description: "Lucid Motors の車両コンフィギュレーターがどのように Unity、クラウドレンダリング、WebRTC を組み合わせてインタラクティブな 3D ショールームをブラウザへ配信しているかを解明します。"
image: /assets/img/lucid-configurator-is-a-streaming-video-game/lucid-configurator.png
image_width: 1958
image_height: 845
image_alt: "Lucid Motors のインタラクティブな 3D 車両コンフィギュレーター"
mathjax: false
tags: [computer-vision, 3d-graphics, systems]
---

{% include description.html content="ゲームエンジンこそが世の中で最も優れたシミュレーターだと気づけば、なるほどと納得がいきます。" %}

## 巧みな解決策

[Lucid Motors が月曜日に上場しました](https://www.barrons.com/articles/lucid-churchill-merger-ipo-ev-51627308359)。近いうちに Lucid を買う予定があるわけではないのですが、好奇心から[同社の車両コンフィギュレーター](https://www.lucidmotors.com/air/configure/)を覗いてみました。これが実に芸術的な出来栄えなのです。車の内外装をほぼあらゆる角度から眺め、操作することができます。

{% include video.html content="https://streamable.com/e/cudr66" %}
<p class="caption video-caption">Lucid のフラッグシップ上位モデル、Lucid Air Dream のコンフィギュレーター。</p>

ボディカラーやトリムを自在に切り替え、ドアを開閉し、さらにはセンターコンソールのディスプレイを格納することまでできます。背景のゴールデンゲートブリッジがガラスのように滑らかな水たまりに映り込み、ドアハンドルを操作するとその下のライトまで点灯するなど、車両の細部まで見事に再現されています。正直、これだけリアルに体感できれば実車を見に行く必要すらないのではないかと思ってしまうほどです。

では、Lucid はこれをどうやって実現しているのでしょうか？一般ユーザーのウェブブラウザが、光の反射まですべて含めたこんなシーンをリアルタイムでレンダリングできるでしょうか？おそらく無理でしょう。これが動く理由は、目にしているシーンがクラウド上で動作するゲームエンジン Unity によってレンダリングされており――重い計算負荷を Amazon のサーバーにオフロードして――ピアツーピアの動画ストリーミングプロトコルである WebRTC 経由でブラウザに配信されているからです。

<div class="divider"></div>

## 3D モデルの正体

最初、私は単純に最新の [WebGL ライブラリ](https://en.wikipedia.org/wiki/WebGL)（ウェブブラウザ上でハードウェアアクセラレーションを使って 2D/3D グラフィックスを描画する API）でブラウザ内にレンダリングされていると思い込んでいました。ローカルで描画されているならメモリ（RAM）のどこかにモデルデータがあるはずなので、それを抜き出して 3D モデリングソフトで開けるのではないかと考えたのです。具体的には、ほぼ継ぎ目のないガラスキャノピーを遮っているサンバイザーを取り除いてみたかったのです（Tesla Model X はそれを実現しているのに、なぜ Lucid が倣わなかったのか不思議でした）。

![ガラスキャノピーを遮る Lucid Air のサンバイザー]({{ "/lucid-air-sun-visors.webp" | prepend: page.imgpath }}){: width="1600" height="994" loading="lazy" decoding="async"}
{% include caption.html content="ガラスキャノピーを遮っている Lucid Air のサンバイザー。" %}

そこでコードを掘り下げてみることにしました。ブラウザの開発者ツールを開き、何千行もの minify された JavaScript を眺め、自分のノート PC と Lucid のサーバー間のネットワークリクエストを記録・調査した末に気づいたのは、答えはずっとコンソールにそのまま出力されていたということでした。

![コンフィギュレーターは動画ストリーム]({{ "/zlbolt-webrtc.png" | prepend: page.imgpath }}){: width="691" height="156" loading="lazy" decoding="async"}
{% include caption.html content="コンフィギュレーターの実体は WebRTC ストリームでした。" %}

ローカルでレンダリングされているモデルなど存在しませんでした。私が見ていたのは動画だったのです。

では裏側で何が起きているのでしょうか？コンフィギュレーターは最初に 2D 表示――つまり複数の静止画をパノラマ状に並べて 3D 操作のように見せる、ややカクつく表示――で起動します。オンラインのインタラクティブな 3D 展示の大半はこの方式で作られています。以下のデモでその様子がわかります。

{% include video.html content="https://streamable.com/e/ptjitc" %}
<p class="caption video-caption">一連の 2D 画像で作られた、ややカクつく 3D ビュー。</p>

続いてクライアント側が回線帯域とレイテンシを測定し、リアルタイム動画ストリームに耐えうる速さがあると判断すると、セッションを 3D にアップグレードします。

![レイテンシテスト]({{ "/latency-test.png" | prepend: page.imgpath }}){: width="755" height="25" loading="lazy" decoding="async"}
![帯域幅テスト]({{ "/bandwidth-test.png" | prepend: page.imgpath }}){: width="706" height="21" loading="lazy" decoding="async"}
{% include caption.html content="十分な帯域幅があると 3D セッションへアップグレードされます。" %}

これにより WebRTC 接続が開始されます。[WebRTC](https://en.wikipedia.org/wiki/WebRTC) はピアツーピアのストリーミングプロトコルです。シーンは別の場所でレンダリングされ、WebRTC 経由で私のブラウザへストリーミングされてくるのです。

さらに `get_token` リクエストの中身を確認すると、仕組みの詳細が見えてきます。

![get_token リクエストの内容]({{ "/get-token-request.png" | prepend: page.imgpath }}){: width="829" height="402" loading="lazy" decoding="async"}
{% include caption.html content="get_token リクエストの内容。" %}

最初の枠からわかる通り、帯域幅をテストするために[25 MB のテスト画像](https://libzl.zlthunder.net/bandwidth-test-img.png)をデバイスへ部分的にダウンロードし、所要時間を計測しています。興味のある方向けに、その画像がこちらです（ご安心ください、10分の1のサイズに圧縮してあります）。

![帯域幅テスト用画像]({{ "/bandwidth-test-image.webp" | prepend: page.imgpath }}){: width="895" height="1263" loading="lazy" decoding="async"}
{% include caption.html content="自動車とは何の関係もありませんが、帯域幅のテストにはうってつけです。" %}

ちなみに、[この画像は GIMP のプラズマプラグインで生成されたエフェクト](https://www.gimp.org/tutorials/Floating_Logo/Plasma.jpg)のように見えます。読み込みがかなり遅いのですが、ノイズに近い見た目なのでほとんど圧縮が効かないのでしょう。

また、[chrome://webrtc-internals/](chrome://webrtc-internals/) を開くと、3D シーンをブラウザにストリーミングしている WebRTC 接続の詳細情報を見ることができます。

![WebRTC の詳細情報]({{ "/lucid-webrtc.png" | prepend: page.imgpath }}){: width="851" height="399" loading="lazy" decoding="async"}
{% include caption.html content="Chrome のデバッグツールで WebRTC 接続のさらに詳しい情報が確認できます。" %}

ここでお気づきの方もいるかもしれませんが、登場する URL はどれも Lucid のドメインではなく、`zlthunder` 配下になっています。これは一体何者なのでしょうか？

<div class="divider"></div>

## ZeroLight

`zlthunder` でウェブ検索すると、[ZeroLight](https://zerolight.com/) という会社に行き着きます。自動車業界に特化したクラウドベースの 3D ビジュアライゼーションを提供している企業です。これで完全に腑に落ちました！

![ZeroLight]({{ "/zero-light.webp" | prepend: page.imgpath }}){: width="1600" height="640" loading="lazy" decoding="async"}
{% include caption.html content="クラウドベース 3D ビジュアライゼーションの専門企業。" %}

間もなく、[Unity（著名なゲームエンジン）のブログ記事](https://unity3d.com/showcase/case-stories/zerolight)も見つかりました。ZeroLight がこのエンジンを活用して、最適化された物理演算や光の反射まで備えたリアルなバーチャルショールームをどう構築したかが紹介されています。

![Unity の ZeroLight 事例]({{ "/unity-zero-light.webp" | prepend: page.imgpath }}){: width="1203" height="658" loading="lazy" decoding="async"}
{% include caption.html content="ビデオゲーム技術はここまで進化しました。" %}

これですべてのピースが繋がりました。サイトに接続するとまず 2D コンフィギュレーターが読み込まれ、インターネット回線が十分速ければ、AWS サーバー上で動く 3D ゲームエンジン Unity のインスタンスに接続されます。サーバーは私のマウス操作を受け取って視点を回転・ズームし、クラウド上でレンダリングした結果をストリーミングで送り返してくるのです。

<div class="divider"></div>

## コストが高そう

サイトに1,000人のユーザーが同時接続している場面を想像してみてください。入力を受け取りながら大量のリアルタイム動画をストリーミングし続ける、ハードウェアアクセラレーション付きのゲームエンジンインスタンスが1,000台必要になります――まさに Stadia や GeForce Now といったクラウドゲーミング製品と同じです。もっとも、先方もその点は十分に意識しているようで、コスト削減のために60秒間操作がないと切断される仕組みになっています。

![無操作時のダウングレード]({{ "/inactivity-downgrade.png" | prepend: page.imgpath }}){: width="524" height="60" loading="lazy" decoding="async"}
{% include caption.html content="アイドル時にダウングレードすることで、相当なコストを節約しているはずです。" %}

<div class="divider"></div>

## そもそもゲームエンジンとは何か？

最初はゲームエンジンの意外な使い道に思えるかもしれませんが、ゲームエンジンとは突き詰めれば「高度に最適化されたシミュレーター」にほかなりません。Unity のような確立されたゲームエンジンには、光線やさまざまな物理現象をシミュレートするための数十年にわたる研究成果が詰め込まれています。だからこそ、それがショールームであれ現実をシミュレートしたいとき、ゲームエンジンはそのまま使えて幅広い用途に応用できる理想的な道具になるのです。

後から思えば、少し検索して Unity の記事を見つければ Lucid のコンフィギュレーターの仕組みはすぐわかったかもしれません。しかしリバースエンジニアリングしたことで、製品が抱える課題や解決策、内部メカニズムをより間近に見ることができ、一から手がかりを追う探偵のような気分を味わえました。それでも一番面白かったのは、現代のテクノロジーが到達した凄まじい複雑さです。Amazon のデータセンターにあるリモートサーバー上で超リアルな物理シミュレーターが動き、私のコンピュータからの操作を受け取って光速で映像ストリームを返してくる――それも、車のコンフィギュレーターを触るためだけに。月へ行くのに必要だったのは電卓並みの計算機だけだったというのに！
