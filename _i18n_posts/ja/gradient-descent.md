---
layout: post
lang_code: ja
locale: ja_JP
ref: gradient-descent
date: 2021-11-15 00:00:00 -0700
last_modified_at: 2021-11-15 00:00
permalink: /ja/gradient-descent
title: "インタラクティブ勾配降下法デモ"
imgpath: /assets/img/gradient-descent
previewurl: /gradient-descent-preview.png
description: "勾配、学習率、局所最小値を直感的に理解できるインタラクティブな勾配降下法デモ。パラメータを動かしてアルゴリズムが最小値へ収束する様子を観察できます。"
image: /assets/img/gradient-descent/gradient-descent-preview.png
image_width: 1564
image_height: 808
image_alt: "インタラクティブな勾配降下法の可視化"
mathjax: true
tags: [machine-learning, optimization]
---

_この特別なアルゴリズムとは何でしょうか？_

勾配降下法（Gradient Descent）は、関数の（局所）最小値を見つけるための最適化アルゴリズムです。

## なぜそれが役に立つのか？

ある関数 $$f(x,y)$$ があるとしましょう。この関数は何らかのコストを表しており、$$x$$ と $$y$$ はそのコストを変化させる入力だと考えます。当然、コストを最小にする $$x$$ と $$y$$ の値を見つけたくなるはずです。これが $$f(x,y)$$ の最小値を求める問題です。たとえば、以下にプロットされた関数の最小値を見つけたいとしましょう。

{%include math.html content=
"
\begin{align}
f(x,y)=3(1 - x)^2 e^{- x^2 - (y + 1)^2} - 10(\frac{x}{5} - x^3 - y^5) e^{-x^2 - y^2} - \frac{1}{3} e^{-(x+1)^2 - y^2} \tag{0}  \label{eq:cost_func}
\end{align}
" 
%}

<div id='plot-0'></div>

ここで活躍するのが勾配降下法です。

## なぜ勾配降下法を使うのか？

基礎的な微分積分で学んだ、関数の最小値を求める手順を覚えているかもしれません。1階導関数を求め、それを0と置いて方程式を解く方法です。

{%include math.html content=
"
\begin{align}
f'(x,y)=0 \tag{1}  \label{eq:first_deriv}
\end{align}
" 
%}

これにより、関数の極値（極大値と極小値）の位置がわかります。さらに2階導関数 $$f''(x,y)$$ の符号を見れば、その極値が極大なのか極小なのかも判定できます。しかし、1階導関数の方程式 $$\eqref{eq:first_deriv}$$ を解くのは簡単でないことが多く、数値解法が必要になる場合が多々あります。そしてコスト関数が $$f(x,y,z,w,q,u,v,...)$$ のように高次元になるにつれ、問題は手に負えなくなっていきます。勾配降下法は、1階導関数を巧みに利用することで、最小値を効率的に見つけ出す手順を提供してくれます。

## 勾配降下法のアルゴリズム

勾配降下法の発想はとても直感的で、似たような物理的状況に置かれれば、きっとあなたも同じ手順にたどり着くはずです。深い霧の中に閉じ込められ、数フィート先しか見えず、足元の地面の傾きしか感じ取れない場面を想像してみてください。あなたはできるだけ早く谷底に下りようとしています。平坦な場所を歩いて時間を無駄にしたり、ましてや上り坂に進んだりするはずがありません。素早く下るには、現在地の傾きを確かめ、最も急な下り坂の方向へ進むでしょう。「勾配（gradient）」とは傾きの言い換えにほかなりません。つまり、あなたが今行っていることこそが勾配降下法なのです。逆に、丘の頂上を目指しているなら、今いる場所で最も急な上り方向へ進みます。こちらは勾配*上昇*法（gradient *ascent*）と呼ばれます。

## 勾配（Gradient）
勾配とは本質的に「傾き」を表す別の言葉です。1次元の状況で傾きを求めることには多くの人が馴染みがあるでしょう。1次元では前に進むか後ろに戻るかしかないため、傾きは一意に定まります。しかし高次元になると――ハイキングに出かけている自分を想像してみてください――どの方向へ進むかによって傾きの値が変わってきます。では、ある地点での傾きをどう定義すればよいのでしょうか？

ベクトル解析では、各次元方向の傾き（1階偏導関数）を並べたベクトルである勾配演算子 $$\nabla$$ を使います。

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

$$f(x,y)$$ で定義される2次元曲面上では、これは x 軸方向の傾きと y 軸方向の傾きから成ります。任意の方向における傾き（私たちは x 軸方向か y 軸方向にしか動けないわけではないので、これは重要です）は、その方向における x 成分と y 成分の傾きを足し合わせることで求められます。言い換えると、方向ベクトルと勾配の内積（ドット積）をとることで、その方向の傾きが得られるのです。

勾配にはもう一つ面白い性質があります。それは「最も急な傾きの方向」を指し示すということです。これも数学的に理解できます――任意の方向の傾きはその方向ベクトルと勾配の内積で求められるため、勾配自身と内積をとったときに最大になるからです！

以下に、Mathematica を使って $$f(x,y)$$ の負の勾配をプロットしました。これにより、$$f$$ 上のすべての点における最急降下方向がわかります。

![f の勾配]({{ "/gradient.png" | prepend: page.imgpath }}){: width="360" height="361" loading="lazy" decoding="async"}
{% include caption.html content="ベクトル場としてプロットした f の勾配。" %}

## 最も急な下り坂を辿る
先ほど、視界のない中で谷底を目指すなら、一番早く底にたどり着くために地面が最も急に下っている方向へ進むはずだ、という話で一致しました。数学的には、各地点での負の勾配ベクトルが最急降下方向を指しているため、勾配に沿って谷を下っていることになります。上の図を見ると、矢印を辿っていけば最小値に行き着くことがわかります（ただし要注意――それぞれの最小値には固有の「吸引領域（basin of attraction）」があります。これについては後ほど詳しく触れます）。

こうして手順を定義できます。おおよそ次のような流れになります。

1. 現在地の傾きを調べ、最も急な下り方向を見極める

2. その方向へ5歩進む

3. まだ下っているなら 1 に戻る。そうでなければ谷底に到着！

なぜ5歩なのか疑問に思ったかもしれません。実のところ、これはまったく適当な数字です。そこでこれを手順のパラメータにしてしまいましょう。「降下率」と呼び、記号 $$\alpha$$ を割り当てます。降下率が大きいほど、周囲の傾きを調べ直す回数が減ります。計算上はその方が効率的ですが、これから見るように落とし穴もあります。

さらに、もう一つ工夫ができます。局所的な傾きがまだ急なうちは、おそらく谷底から遠く離れています。一方、傾きが緩やかになってきたら、谷底に近づいていると考えられます。そこで、勾配の大きさに比例した歩幅で下るようにしてみましょう。勾配を記号 $$\bar{g}$$ で表し、勾配降下法の手順を再定義します。

1. 現在地の傾きを調べ、最も急な下り方向を見極める

2. その方向へ $$\alpha \times \|\bar{g}\|$$ 歩進む

3. まだ下っているなら 1 に戻る。そうでなければ谷底に到着！

次に、「まだ下っているか」をどう判定するでしょうか？一つの方法は、各反復でどれだけ標高が下がったかを確認することです。高度がほとんど変わらなくなっていれば、実質的にもう谷底に着いていると考えられます。

この手順を数式で表すと次のようになります。

{%include math.html content=
"
\begin{align}
\bar{p}_{n+1} = \bar{p}_n - \alpha \nabla f(x,y) \tag{3}  \label{eq:grad_descent}
\end{align}
" 
%}

ここで $$p_n$$ は降下の $$n$$ 回目の反復における位置です。下のデモでぜひ試してみてください。$$\alpha$$ を変えると降下率が変化し、$$X$$ と $$Y$$ を変えると曲面上の初期位置が変わります。どんなことに気づくでしょうか？

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

## 観察してわかること

勾配降下法は初期位置に敏感だということに気づいたでしょう。アルゴリズムは近くの局所最小値（ローカルミニマム）へと引き寄せられますが、それは大域的最小値（グローバルミニマム）とは限りません。勾配降下法を特定の最小値へと収束させる定義域の領域は、その最小値の「吸引領域（basin of attraction）」と呼ばれます。

また、降下率 $$\alpha$$ を大きくすると最小値に到達するまでの反復回数が減ることもわかります。しかし大きくしすぎると、アルゴリズムが最小値を飛び越えて（オーバーシュートして）しまい、最悪の場合は発散してしまいます。

## 機械学習における勾配降下法

おそらく機械学習の文脈で勾配降下法を耳にしたことがあるでしょう。機械学習では、コスト関数はモデルの誤差を表します。たとえば画像分類の誤差であり、コスト関数への入力は調整対象となるモデルの重み（パラメータ）です。したがって、勾配降下法を使えば、ニューラルネットワークの分類誤差を最小化する最適な重みの組み合わせを見つけ出せるのです！この分野では、降下率 $$\alpha$$ には特別な呼び名があり、*学習率（learning rate）*と呼ばれます。もしかすると、私たちの脳もずっと同じことをしてきたのかもしれません。

<script defer fetchpriority="low" src="https://cdn.plot.ly/plotly-2.4.2.min.js"></script>
<script defer fetchpriority="low" src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/9.5.1/math.js" integrity="sha512-AfRcJIj922x/jSJpQLnry0DYIBg6EGCtwk/MiQ6QvDlzb7kNFxH8EdqXLkaXXY3YHQS9FrSb8H7LzuLn0CZQ1A==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script defer src="/assets/js/gradient-descent.js"></script>
