---
layout: post
lang_code: ja
locale: ja_JP
ref: monte-carlo-options-pricing
date: 2021-12-17 00:00:00 -0700
last_modified_at: 2021-12-17 00:00
permalink: /ja/monte-carlo-options-pricing
title: "モンテカルロ法によるオプション価格評価"
imgpath: /assets/img/monte-carlo-stocks
previewurl: /gbm-example.png
description: "幾何ブラウン運動、株式リターン、ボラティリティ、オプションのペイオフをインタラクティブなシミュレーションで体験しながら、モンテカルロ法によるオプション価格評価を学びます。"
image: /assets/img/monte-carlo-stocks/gbm-example.png
image_width: 1810
image_height: 990
image_alt: "幾何ブラウン運動を用いてシミュレートされた株価経路"
mathjax: true
tags: [quant-finance, simulation]
toc: true
---

_オプションというカジノ_

株価の動きを予測することは、一攫千金の夢を秘めた魅力的な挑戦です。残念ながら、将来の株価を一貫して確実に予測することは一般に不可能とされています。しかし、モデルを使えば有用な予測を立て、リスクを管理し、*確率的に*利益を狙うことはできます。

## 幾何ブラウン運動
よく用いられるモデルの一つが幾何ブラウン運動（Geometric Brownian Motion、[1](https://stats.libretexts.org/Bookshelves/Probability_Theory/Probability_Mathematical_Statistics_and_Stochastic_Processes_(Siegrist)/18%3A_Brownian_Motion/18.04%3A_Geometric_Brownian_Motion), [2](http://www.columbia.edu/~ks20/FE-Notes/4700-07-Notes-GBM.pdf)）です。実際、有名な[ブラック＝ショールズ・オプション価格評価式](https://en.wikipedia.org/wiki/Black%E2%80%93Scholes_model)もこのモデルを前提としています。数式は次の形をとります。

{%include math.html content=
"
\begin{align}
 S(t) = S(0)\exp{((\mu-\frac{\sigma^2}{2})t + \sigma B(t))} \tag{0}  \label{eq:gbm}
\end{align}
" 
%}

ここで $$B(t)$$ は標準ブラウン運動です。$$S(0)$$ を初期株価、$$\mu$$ を平均[連続複利リターン](https://en.wikipedia.org/wiki/Rate_of_return#Logarithmic_or_continuously_compounded_return)、$$\sigma$$ を株式の[ボラティリティ](https://en.wikipedia.org/wiki/Volatility_(finance))とすると、非常にリアルな株価の推移経路を生成できます。

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

<button class="regenerate-button" onclick="regenerate0()">再生成</button>

<div style="display:none" id='mean-0'>0</div>
<div style="display:none" id='sigma-0'>0</div>
<div style="display:none" id='option-mean-0'>0</div>

では、この式は何を意味していて、なぜ証券価格の良いモデルになるのでしょうか？

### 対数リターン
クオンツファイナンスでは、単純リターンではなく連続複利リターン（対数リターン）を扱うのが一般的です。つまり、取引期間ごとの単純リターン $$1 + R_t = \frac{S(t)}{S(t-1)}$$ を見るのではなく、連続複利リターン $$r_t = \ln{(1 + R_t)} = \ln{\frac{S(t)}{S(t-1))}}$$ に注目します。これには、対数リターンを単純に足し合わせるだけで株価を復元できるという非常に便利な性質があります。

{%include math.html content=
"
\begin{align}
 S(t) = S(0)\exp{(r_1 + r_2 + ... + r_{t-1})} \tag{1}  \label{eq:rr}
\end{align}
" 
%}

また、金融工学では「株式の対数リターンは互いに独立で、平均 $$\mu$$、分散 $$\sigma^2$$ の正規分布に従う」という仮定がよく置かれるため、この点でも好都合です。なお、リターンが小さいときは $$r_t = \ln{(1 + R_t)} \approx R_t$$ が成り立ち、単純リターン $$R_t$$ は対数リターン $$r_t$$ に近似できるため両者の差は大きくなく、単純リターンも対数リターンも正規分布に従うと仮定して差し支えありません。そして対数リターンが正規分布に従うなら、株価そのものは*対数正規分布*に従うことになります。これは実証的にもある程度確認されていますが、現実の株価には「ファットテール（裾が厚い分布）」が見られる傾向があります――つまり、正規分布が予測するよりも極端なレア事象が頻繁に起こるのです。以下の IBM 株の月次リターンがその傾向を示しています。

![IBM の月次リターン]({{ "/IBM-returns.webp" | prepend: page.imgpath }}){: width="1282" height="1008" loading="lazy" decoding="async"}
{% include caption.html content="IBM 株の月次単純リターンおよび対数リターンと、当てはめた正規分布。分布の両端において正規分布の予測より多くのリターンが観測されます。これは『ファットテール』または『超過尖度』と呼ばれます。画像は Ruey S. Tsay 著『Analysis of Financial Time Series, 3rd Ed.』より引用。" %}

さらに、このモデルが優れているのは「正の証券価格しか許さない」という点でもあります。証券価格は通常プラスの値しか取りません（もっとも稀にマイナスになることもあります――[2020年の原油価格暴落](https://assets.weforum.org/editor/kE8TpkO7bzo3dLFWEh9UDvgqRuZPOmURhnh0FfwOVYc.png)がその例です）。

こうして、正規分布に従うリターン $$r_t$$ の系列を生み出す確率過程が欲しくなり、そこで自然な選択肢としてブラウン運動が登場します。


## ブラウン運動
[ブラウン運動](https://stats.libretexts.org/Bookshelves/Probability_Theory/Probability_Mathematical_Statistics_and_Stochastic_Processes_(Siegrist)/18%3A_Brownian_Motion/18.01%3A_Standard_Brownian_Motion)は、液体や気体の中にある微粒子の動きを記述するものです。微粒子は周囲の流体の中で「ランダム」に跳ね回り、その軌跡はノイズに満ちたランダムな形を描きます。これは本質的に、ステップ間の時間と1ステップの歩幅の両方を0に近づけたランダムウォークの極限とみなせます（ただし注意点があり、時間刻みを $$t$$ とすると歩幅は $$\sqrt{t}$$ にしなければなりません――そうすることで分散がちょうど時間に比例する過程になります）。コインを投げて前に進むか後ろに戻るかを決める場面を想像し、ステップ間の時間を0に近づけてみてください。次のような経路が描かれます。

![1次元ブラウン運動]({{ "/wiener-process-zoom.png" | prepend: page.imgpath }}){: width="800" height="600" loading="lazy" decoding="async"}
{% include caption.html content="1次元の［算術］ブラウン運動。幾何ブラウン運動はこの過程の指数関数をとったものです。<a target='_blank' href='http://creativecommons.org/licenses/by-sa/3.0/' title='Creative Commons Attribution-Share Alike 3.0'>CC BY-SA 3.0</a>, <a target='_blank' href='https://commons.wikimedia.org/w/index.php?curid=1426987'>出典</a>" %}

ブラウン運動には「軌跡の増分が正規分布に従う」というまさに私たちが求めていた素晴らしい性質があります。離散ステップのブラウン運動は正規分布からサンプリングすることでシミュレートできます（もっとも、時系列の最終値だけに関心があるなら分散1の任意の分布からサンプリングしても構いません。中心極限定理により、確率変数の和は長期的にガウス分布へ近づくからです）。

したがって、ブラウン運動によって式 $$\eqref{eq:rr}$$ で必要となる正規分布に従う対数リターン $$r_t$$ の系列が得られます。

{%include math.html content=
"
\begin{align}
 r(t) = (\mu-\frac{\sigma^2}{2})t + \sigma B(t) \tag{2}  \label{eq:bm}
\end{align}
" 
%}

この過程の指数をとることで、株価変動をモデル化する方程式が導かれました。

ここで特に興味深いのがドリフト項 $$\mu - \frac{\sigma^2}{2}$$ です。その名の通り、過程を線形にドリフト（推移）させます。$$\mu$$ の意味は明らかで、その株式の平均連続複利リターンです。ノイズ（ボラティリティ）がなければ、株価はこの複利分だけで上昇（または下落）します。では $$-\frac{\sigma^2}{2}$$ は何でしょうか？実は、対数正規分布に従う確率変数の期待値は $$\exp(\mu + \sigma^2/2)$$ になります。株価は*対数正規分布*に従う（一方でリターンは*正規分布*に従う）ため、連続複利後の株価の期待値がちょうど $$S(0)\exp(\mu t)$$ になるようにするには、過程に $$- \frac{\sigma^2}{2}$$ という補正項を加えておく必要があるのです。

このモデルの基礎にブラウン運動を選ぶことには、哲学的な根拠もあります。金融学では「市場は効率的であり、裁定機会は存在しない」という仮定がよく置かれます。したがって市場は予測不可能であるはずです――もし誰かが予測できるなら、それは裁定機会となり、すぐさま取引されて消えてしまうからです。ゆえに、ランダムノイズ（ブラウン運動の本質はまさにそれです）は市場をモデル化するうえで妥当な選択なのです。

## オプションの価格評価

モンテカルロ・シミュレーションは、モナコのカジノに着想を得た統計的手法です。ギャンブラーが運命を確率に委ねるように、私たちも統計解析の結果を偶然に委ねます。十分な回数の試行を行えば、統計的に有意な結論を導き出せるのです。

この株式に対する行使価格 $105 のコールオプションを評価することを考えてみましょう。株価の動きが幾何ブラウン運動に従うとしたとき、満期時におけるオプションの期待価値はいくらになるでしょうか？これを推定するために、1本1本を1回の試行とみなして多数の株価経路を生成します。各試行の満期時株価は、$$V = \max(0, S - K)$$ という関係式（$$S$$ は株価、$$K$$ は行使価格）によってオプションの本質的価値に結びつきます。各試行から得られる満期価値の平均が満期時のオプション価値の推定値となり、標準偏差はオプションがその値付近で満期を迎える確からしさの指標になります。

<div id='plot-1'></div>
<button class="regenerate-button" onclick="regenerate1()">再生成</button>
<div id='mean-1'>0</div>
<div id='sigma-1'>0</div>
<div id='option-mean-1'>0</div>

試行回数を増やせば、推定値の統計的確実性を高められます。下の試行回数が多いシミュレーションで（「再生成」をクリックして）再実行すると、上の試行回数が少ないシミュレーションに比べて、実験ごとのばらつきがずっと小さくなることがわかります。

<div id='plot-2'></div>
<button class="regenerate-button" onclick="regenerate2()">再生成</button>
<div id='mean-2'>0</div>
<div id='sigma-2'>0</div>
<div id='option-mean-2'>0</div>

## より高度なシナリオ
満期時の価値だけを見るモンテカルロ・シミュレーションは比較的単純であり、この程度であれば解析的に解けてしまうため、実用上のありがたみはまだ薄いかもしれません。モンテカルロ・シミュレーションが真価を発揮するのは、解析的に解くのが困難、あるいは不可能なシナリオを分析するときです。たとえば、満期前いつでも権利行使できるアメリカン・オプションを分析したい場合、オプションの有効期間中のどこかの時点で株価が行使価格を上回る確率を知りたいかもしれません。モンテカルロ・シミュレーションを使えば、行使価格の境界を一度でも超えた試行がいくつあるかを数えるだけで、それを簡単に求められるのです。

<script defer fetchpriority="low" src="https://cdn.plot.ly/plotly-2.4.2.min.js"></script>
<script defer fetchpriority="low" src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/9.5.1/math.js" integrity="sha512-AfRcJIj922x/jSJpQLnry0DYIBg6EGCtwk/MiQ6QvDlzb7kNFxH8EdqXLkaXXY3YHQS9FrSb8H7LzuLn0CZQ1A==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script defer src="/assets/js/monte-carlo-options.js"></script>
