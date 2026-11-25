---
layout: post
lang_code: ja
locale: ja_JP
ref: blackbox-optimization-with-vizier
date: 2023-02-23 00:00:00 -0700
last_modified_at: 2023-02-23 00:00
permalink: /ja/blackbox-optimization-with-vizier
title: "Google の Vizier によるブラックボックス最適化とハイパーパラメータチューニング"
imgpath: /assets/img/blackbox-optimization-with-vizier
previewurl: /black-box-optimization.png
description: "Google の Vizier を使ったブラックボックス最適化の実践例。条件付きパラメータの定義、試行の評価、ノイズを含む信号へのモデル当てはめを解説します。"
image: /assets/img/blackbox-optimization-with-vizier/og-preview.png
image_width: 1200
image_height: 630
image_alt: "ブラックボックス最適化の入力と出力"
mathjax: true
tags: [machine-learning, optimization]
toc: true
---
{% include description.html content="あらゆる種類のシステムを自動的かつインテリジェントに最適化する" %}

<style>
img {
  max-height: 350px;
}
</style>

機械学習モデルや何らかのアルゴリズム的システムを構築するとき、システムのアーキテクチャについてさまざまな選択を迫られます。たとえば機械学習アプリケーションなら、ニューラルネットワークの層にニューロンをいくつ配置するか、あるいは勾配降下法の学習率をいくつにするかを決めなければなりません。ロボットの状態を追跡する[パーティクルフィルタ](https://en.wikipedia.org/wiki/Particle_filter)を作っているなら、尤度関数の形状を選ぶ必要があるでしょう。あるいは、計算リソースの消費を最小化するバッファサイズとスレッド数を探しているかもしれません。こうしたシステムの最適なアーキテクチャはどうすれば見つけられるでしょうか？

手作業で探すこともできます。ニューロン数をいくつか変えてみたり、勾配降下法の学習率をいろいろ試したりするわけです。しかしこの作業は遅くて退屈なうえ、落とし穴にはまりやすいものです。ありがたいことに、システムを賢く効率的に最適化してくれるサービスが存在します。

<div class="divider"></div>

## Vizier の紹介

[Vizier](https://github.com/google/vizier) は、ブラックボックス最適化およびハイパーパラメータ最適化のために Google で開発された最適化サービスです。Vizier が提案する入力をシステムに渡し、システムから出力（Vizier が最大化または最小化しようとする評価指標）を受け取ることさえできれば、どのような種類のシステムでも最適化できます。システム自体は「ブラックボックス」として扱われます。

![ブラックボックス最適化]({{ "/black-box-optimization.png" | prepend: page.imgpath }}){: width="629" height="319" loading="lazy" decoding="async"}
{% include caption.html content="ブラックボックス最適化では、入力を渡して出力を受け取れさえすれば、システム内部を理解する必要はありません。出典：Per Instance Algorithm Configuration for Continuous Black Box Optimization - Scientific Figure on ResearchGate. https://www.researchgate.net/figure/black-box-Optimization_fig1_322035981 [2023年2月23日参照]" %}

[勾配降下法](/ja/gradient-descent)のような非ブラックボックス最適化手法では、システムのパラメータと最小化・最大化したい指標との関係を理解している必要がありますが、Vizier のようなブラックボックス最適化システムではシステム内部に関する知見が一切不要です。それでもパラメータ空間を効率よく探索し、システムを最適化するパラメータ値を見つけ出してくれます。この性質により、複雑で不連続、あるいは非凸な評価関数に対しても高い頑健性を発揮します。

<div class="divider"></div>

## パラメータとハイパーパラメータの違い

余談ですが、この区別は機械学習の分野に由来します。「パラメータ」はデータセットでの学習を通じて見つけられ、推論時にモデル内部で使われる値を指すのに対し、「ハイパーパラメータ」はモデルのアーキテクチャや学習手順を規定する値を指します。Vizier のようなブラックボックス最適化サービスはあらゆるシステムの最適化に使えますが、機械学習モデルそのものの学習に使うのは効率的ではありません。一方で、モデルのアーキテクチャを最適化するには非常に優れた手段です。

<div class="divider"></div>

## 実例

ここでは機械学習とは無関係でありながら、Vizier のようなブラックボックス最適化アルゴリズムの力強さとシンプルさを示す例を使ってみます。次のようなノイズを含む信号があるとしましょう。

![ノイズを含む信号]({{ "/some-noisy-signal.png" | prepend: page.imgpath }}){: width="368" height="246" loading="lazy" decoding="async"}
{% include caption.html content="ノイズを含むある信号。" %}

この信号にフィットする解析関数を見つけてみましょう。[ガウス分布（正規分布）](https://en.wikipedia.org/wiki/Normal_distribution)と[ラプラス分布](https://en.wikipedia.org/wiki/Laplace_distribution)のどちらを当てはめるべきか決めかねており、さらにどちらの関数にも平均や分散といった推定すべき固有のパラメータがあるとします。

最適化したい評価指標を Vizier に伝えさえすれば、最適な関数を見つけ出してくれます。

<div class="divider"></div>

## 問題のセットアップ
最初に探索対象としたいパラメータはモデルの種類、つまりガウス分布かラプラス分布かです。

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

しかし各モデルには、その形状を決める固有のパラメータセットがあります。これらを各モデルの「子パラメータ」と呼ぶことにしましょう。

ガウス分布の場合は、平均 `mu` ($$\mu$$) と標準偏差 `sigma` ($$\sigma$$) です。

![パラメータ mu と sigma を持つガウス分布]({{ "/normal-distribution.png" | prepend: page.imgpath }}){: width="720" height="460" loading="lazy" decoding="async"}
{% include caption.html content="パラメータ mu と sigma を持つガウス分布。出典：https://commons.wikimedia.org/wiki/File:Normal_Distribution_PDF.svg" %}

ラプラス分布の場合は――文献によって記法は異なりますが――一般に、位置パラメータ（平均）`mu` ($$\mu$$) と尺度パラメータ `b` ($$b$$) があります。

![パラメータ mu と b を持つラプラス分布]({{ "/laplace-distribution.png" | prepend: page.imgpath }}){: width="800" height="600" loading="lazy" decoding="async"}
{% include caption.html content="パラメータ mu と b を持つラプラス分布。出典：https://commons.wikimedia.org/wiki/File:Laplace_pdf_mod.svg" %}

ガウス分布の平均と区別するため、ここではラプラス分布の位置パラメータを `mu` ではなく `a` と呼ぶことにします。

ガウス分布を当てはめようとしているときに、Vizier にラプラス分布のパラメータまで推定してほしいとは思いませんし、逆もまた然りです。幸いなことに、各分布のパラメータは親パラメータ `model` に紐づく子パラメータ（条件付きパラメータ）として指定できます。

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

最後に、Vizier が最適化する評価指標を定義します。関数を信号にできるだけ近づけたいので、解析関数とデータとの残差平方和（sum of squared residuals）を計算して当てはまりの良さを評価することにします。この値が小さいほど当てはまりが良いということです。Vizier に伝えるのは、この指標を最小化したいという点だけです。

```
metric_ssr = {
    'metric_id': 'sum_of_squared_residuals',
    'goal': 'MINIMIZE',
}
```

これらをすべてまとめると、問題の定義が完成します。

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

なお、Vizier 自体はパラメータの意味をまったく理解していません。`Gaussian` も `Laplace` もカテゴリカルパラメータの値に過ぎず、Vizier にとってはそれ以上の意味を持たないのです。それらに意味を与えるのはパラメータを受け取る私自身のコードですが、Vizier から見ればそのコードはブラックボックスの中にあります。簡潔にするためここではコードを省略していますが、記事末尾のリンクから全容を確認できます。


<div class="divider"></div>

## 探索

各トライアル（試行）で、Vizier は試すべきパラメータの組を提案してきます。私たちはそのパラメータがどれほどうまく機能するかを自前で評価し、指標（残差平方和）を計算して Vizier に返します。すると Vizier はその結果を使って、次に試すべきパラメータの組を生成します。

![トライアルのパラメータを提案する Vizier]({{ "/vizier-trials.png" | prepend: page.imgpath }}){: width="1280" height="281" loading="lazy" decoding="async"}
{% include caption.html content="トライアルごとにパラメータを提案する Vizier。" %}

モデルがガウス分布のときにはガウス分布のパラメータだけを、ラプラス分布のときにはラプラス分布のパラメータだけを提案している点に注目してください。

Vizier はどうやって最適なパラメータを探索しているのでしょうか？グリッドサーチやランダムサーチも選べますが、真価はガウス過程バンディット（Gaussian process bandits）や線形結合探索（linear combination search）、およびそれらの派生アルゴリズムの組み合わせにあります。

GCP 上では、Vizier の進捗を示すこうした見やすいチャートも確認できます。

![最適化対象の指標と各トライアルのパラメータ推移を示すスタディテーブル]({{ "/study-progress-table.webp" | prepend: page.imgpath }}){: width="1600" height="1071" loading="lazy" decoding="async"}
{% include caption.html content="最適化対象の指標の推移と各トライアルのパラメータを示すスタディテーブル。" %}

![試されたパラメータの組と結果の指標値を示す平行座標チャート]({{ "/parallel-chart.webp" | prepend: page.imgpath }}){: width="1600" height="726" loading="lazy" decoding="async"}
{% include caption.html content="試行されたパラメータの組み合わせと得られた指標値を示す平行座標チャート。" %}

<div class="divider"></div>

## 最適化されたフィット結果

ラプラス分布がガウス分布をわずかに上回っていることがわかります。

![残差平方和を最小化した上位トライアルにズームインした平行座標チャート]({{ "/optimal-parallel-chart.webp" | prepend: page.imgpath }}){: width="1600" height="550" loading="lazy" decoding="async"}
{% include caption.html content="残差平方和を最小化した上位トライアルにズームインした平行座標チャート。ガウス分布よりもラプラス分布の方が良いフィットが得られています。" %}

Vizier に最適トライアルのパラメータを問い合わせてプロットしてみます。

![ノイズを含む信号への最適化フィット]({{ "/noisy-signal-fit.png" | prepend: page.imgpath }}){: width="543" height="289" loading="lazy" decoding="async"}
{% include caption.html content="ノイズを含む信号にフィットするよう最適化されたパラメータ。" %}

ほとんど完璧なフィットです！Vizier が見つけ出したパラメータは、ノイズを加える前に私が信号生成に使った元のパラメータ――$$a=5$$、$$b=2$$ のラプラス分布――に極めて近い値でした。

![元のラプラス信号]({{ "/original-laplace-signal.png" | prepend: page.imgpath }}){: width="862" height="728" loading="lazy" decoding="async"}
{% include caption.html content="元のラプラス信号。" %}

比較のため、ガウス分布であれば頂点がより丸く、裾がより薄くなります。

![ガウス分布の信号]({{ "/gaussian-signal.png" | prepend: page.imgpath }}){: width="878" height="726" loading="lazy" decoding="async"}
{% include caption.html content="比較用のガウス分布。" %}

<div class="divider"></div>

## 再現するには？

この記事の生成に使った Colab ノートブックは[こちら](https://github.com/skzv/vizier-blog-post/blob/main/vizier_blog_post.ipynb)で公開しています。今回掲載したようなクールなチャートが自動生成されるため GCP の Vertex AI Vizier API を使用しましたが、高額になる点（1トライアルあたり1ドル）にはご注意ください。なお、Vizier はオープンソースとしても[こちら](https://github.com/google/vizier)で公開されています。
