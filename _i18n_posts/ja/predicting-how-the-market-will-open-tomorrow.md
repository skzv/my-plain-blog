---
layout: post
lang_code: ja
locale: ja_JP
ref: predicting-how-the-market-will-open-tomorrow
date: 2025-03-23 00:00:00 -0700
last_modified_at: 2025-03-23 00:00
permalink: /ja/predicting-how-the-market-will-open-tomorrow
title: "明日の市場の寄り付きを予測する"
imgpath: /assets/img/predicting-market-open
previewurl: /preview.png
description: "指数先物、無リスク金利、配当利回りから翌日の市場寄り付きを推定する方法を、保有コストモデルの計算と自作ダッシュボード impliedopen.com とともに解説します。"
image: /assets/img/predicting-market-open/og-preview.png
image_width: 1200
image_height: 630
image_alt: "市場のインプライド寄り付き価格ダッシュボード"
mathjax: true
tags: [quant-finance]
---

_未来を予測する_

ある週末に悪い経済ニュースが流れ、月曜日の寄り付きに市場がどう反応するのか気になりました。そこで調べてみたところ、株式市場が閉まっている間も原資産となる指数の先物取引は続いており、先物市場を見ることでトレーダーたちが新しい情報をすでにどう受け止め、価格に織り込んでいるのかを――まるで水晶玉 🔮 のように――読み取れることを知りました。

先物価格と現在価格には一定の関係があるため、先物価格を時間軸に沿って現在へと割り引くことで、先物市場が織り込んでいる各指数の現在の理論価格（フェアバリュー）を計算できます。これにより、市場が開く前から各指数のインプライド寄り付き価格がわかり、日曜の夜のうちに翌日の市場が<span style="color: #66ff66;">高く</span>始まりそうか、<span style="color: #ff6666;">安く</span>始まりそうかを見通すことができるのです。

以下ではこの計算を構成する要素を順を追って説明し、最後に翌日の寄り付き動向を先取りして見られる自作ダッシュボード [impliedopen.com](https://impliedopen.com) を紹介します。


![翌日の市場動向を先取りして見られる自作ダッシュボードのプレビュー]({{ "/save-game.webp" | prepend: page.imgpath }}){: width="1168" height="1312" fetchpriority="high" decoding="async"}
{% include caption.html content="翌日の市場動向を先取りして見られる自作ダッシュボードのプレビュー。" %}

## 先物（Futures）

先物（先物契約）とは、満期日における原資産の*将来*価格に対してトレーダーが賭けることのできる金融商品です。下の SP500 先物の価格と満期日に注目してみてください。現在の SP500 現物価格より高く取引されていますが、これは現在の SP500 の価値について何を示しているのでしょうか？

先物価格を、先物市場が織り込んでいる現在の理論価格と結びつけるには、現在から先物の満期日までの期間を考慮する必要があります。

![SP500 先物契約]({{ "/futures-price.webp" | prepend: page.imgpath }}){: width="943" height="826" loading="lazy" decoding="async"}
{% include caption.html content="SP500 先物契約" %}

ここで用いるのが保有コストモデル（Cost of Carry モデル）です。無リスク金利、配当利回り、満期までの残存期間を考慮に入れます。このモデルでは、指数の価格は現在の無リスク金利で成長する（本質的には無裁定条件の仮定）一方、配当の支払いによってその分だけ価格が下落すると仮定します。

この関係は次のように表せます。

{% include math.html content=
"
\begin{align}
    F = S \times e^{(r - q) \times t} \tag{0}  \label{eq:coc}
\end{align}
"
 %}

ここで $$F$$ は先物価格、$$S$$ は現在の株価（指数価格）、$$r$$ は無リスク金利、$$q$$ は配当利回り、$$t$$ は満期までの期間です。

## 時間を遡る

先物価格から現在の理論価格（フェアバリュー）を算出するには、上の式を逆算して先物価格を現在へ割り引きます。

{% include math.html content=
"
\begin{align}
    S = F \times e^{-(r - q) \times t} \tag{1}  \label{eq:discount}
\end{align}
"
 %}

市場が開く前において、この理論価格こそが指数の寄り付き価格に対する最良の推定値となります。

## 無リスク金利（Risk-Free Rate）

そもそもリスクゼロの投資など存在するのでしょうか？米国財務省が発行する財務省短期証券（T-bill）は、以下の理由から（ほぼ）無リスクと見なされています。
- 米国政府はデフォルトの可能性が極めて低く、自国通貨を発行でき、債務返済の実績も十分にある
- 満期が短いため、金利変動や長期的な不確実性に対するエクスポージャーが小さい
- 市場の流動性が非常に高い
- 社債や地方債と異なり、米国政府が破産することはないため信用リスクがない

今回の計算では、無リスク金利として3ヶ月物米国債（3-month T-bill）を採用しています。

![3ヶ月物米国債利回り]({{ "/3m-bond-yield-1.png" | prepend: page.imgpath }}){: width="993" height="633" loading="lazy" decoding="async"}
{% include caption.html content="3ヶ月物米国債利回り" %}

原資産は少なくとも無リスク金利と同程度には成長すると仮定します。そうでなければ、投資家がわざわざこれらの資産に資金を投じる理由がないからです。

## 配当利回り（Dividend Yield）

原資産は少なくとも無リスク金利で成長すると仮定する一方、配当が支払われると原資産の指数はその分だけ下落する点も考慮しなければなりません。ここでは各指数の直近の配当利回りを使っていますが、より精度の高いモデルでは今後の予想配当利回り（フォワード配当利回り）を見積もるのが望ましいでしょう。

以下は、計算に使用している最新の SP500 配当利回りです。

![最新の SP500 配当利回り]({{ "/sp500-dividend-yield.png" | prepend: page.imgpath }}){: width="873" height="641" loading="lazy" decoding="async"}
{% include caption.html content="最新の SP500 配当利回り" %}

## すべてを組み合わせる

直近の指数価格、現在取引中の先物価格、配当利回り、無リスク金利、そして満期までの残存期間を集め、主要各指数の理論価格に対する現時点の最良の推定値を計算します。これらすべてをまとめたのが [impliedopen.com](https://impliedopen.com) で、下にも埋め込んであります。

<iframe src="https://impliedopen.com" title="Implied Open 市場ダッシュボード" width="100%" height="1200px"></iframe>

このダッシュボードが最も役立つのは、先物市場が開いていて通常市場（現物市場）が閉まっている時間帯です。通常市場の寄り付き前にトレーダーたちが何を織り込んでいるかを、先物市場から読み取ることができます。一方、通常市場が開いている間は、市場そのものがつけている各指数の「真の」現在価格が表示されます。

![マーケットステータス画面]({{ "/market-status.png" | prepend: page.imgpath }}){: width="751" height="159" loading="lazy" decoding="async"}
{% include caption.html content="マーケットステータス画面" %}

## おわりに

このダッシュボードはかなり突貫で作ったので、値の多くはスクレイピングして自分の API で1分ごとにキャッシュしています :) もし壊れたり落ちたりしたらごめんなさい――いずれきちんとした API に置き換えるつもりですが、あるいは市場の24時間365日取引が進んでこのダッシュボード自体が役目を終える方が先かもしれません。いずれにせよ、記録として残すためにこのブログ記事を書いておきたかったのです。

![まあそんなもんです]({{ "/it-is-what-it-is.png" | prepend: page.imgpath }}){: width="690" height="365" loading="lazy" decoding="async"}
{% include caption.html content="まあそんなもんです（It is what it is.）。" %}

計算の誤りに気づいた方や、提案・フィードバックがある方は、ぜひ気軽に連絡して教えてください！
