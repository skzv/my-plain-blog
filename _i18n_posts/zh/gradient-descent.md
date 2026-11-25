---
layout: post
lang_code: zh
locale: zh_CN
ref: gradient-descent
date: 2021-11-15 00:00:00 -0700
last_modified_at: 2021-11-15 00:00
permalink: /zh/gradient-descent
title: "交互式梯度下降演示"
imgpath: /assets/img/gradient-descent
previewurl: /gradient-descent-preview.png
description: "通过交互式梯度下降演示理解梯度、学习率与局部最小值。亲手拖动参数，观察算法如何在曲面上一步步找到最小值。"
image: /assets/img/gradient-descent/gradient-descent-preview.png
image_width: 1564
image_height: 808
image_alt: "交互式梯度下降可视化演示"
mathjax: true
tags: [machine-learning, optimization]
---

_这个神奇的算法到底是什么？_

梯度下降（Gradient Descent）是一种用于寻找函数（局部）最小值的优化算法。

## 它为什么有用？

假设你有一个函数 $$f(x,y)$$。这个函数可以代表你的某项代价（成本），而 $$x$$ 和 $$y$$ 是会影响代价的输入变量。你自然希望找到能让代价最小的 $$x$$ 和 $$y$$ 的取值。这就是寻找 $$f(x,y)$$ 最小值的问题。例如，我们可能想找出下面这个绘制出来的函数的最小值：

{%include math.html content=
"
\begin{align}
f(x,y)=3(1 - x)^2 e^{- x^2 - (y + 1)^2} - 10(\frac{x}{5} - x^3 - y^5) e^{-x^2 - y^2} - \frac{1}{3} e^{-(x+1)^2 - y^2} \tag{0}  \label{eq:cost_func}
\end{align}
" 
%}

<div id='plot-0'></div>

这时候，梯度下降就派上用场了。

## 为什么要使用梯度下降？

你还记得基础微积分里求函数最小值的方法吗？可以求出一阶导数，令其等于零，然后解这个方程：

{%include math.html content=
"
\begin{align}
f'(x,y)=0 \tag{1}  \label{eq:first_deriv}
\end{align}
" 
%}

这样可以找出函数的极值点（极大值和极小值），再根据二阶导数 $$f''(x,y)$$ 的正负，就能判断极值点是局部极大值还是局部极小值。然而，求解一阶导数方程 $$\eqref{eq:first_deriv}$$ 往往并不容易，常常需要借助数值方法。而且随着代价函数的维度越来越高，比如 $$f(x,y,z,w,q,u,v,...)$$，直接求解很快就会变得难以应付。梯度下降则巧妙地利用一阶导数，提供了一套高效定位最小值的迭代流程。

## 梯度下降算法

梯度下降背后的直觉非常自然——我敢打赌，如果你置身于类似的现实处境中，也会不自觉地用上完全一样的策略。想象你身处浓雾之中，只能看清脚前几步，靠双脚感受脚下地面的坡度，而你想尽快走到山谷底部。你肯定不会浪费时间沿着平地闲逛，更不会往高处爬。为了最快下山，你会先感受自己所处位置的坡度，然后朝着下坡最陡的方向迈步。梯度（Gradient）其实就是坡度的同义词，因此你所做的正是梯度下降。反过来，如果你想找山顶，就会在每个位置沿着最陡的上坡方向走——那就是梯度*上升（Ascent）*。

## 什么是梯度

梯度本质上就是坡度（斜率）的另一种说法。大多数人都熟悉一维情况下的斜率。在一维空间里，你只能向前或向后走，所以斜率的定义非常明确。但在更高维的空间里——想象你正在徒步爬山——朝不同方向迈步，坡度是完全不同的。那该怎么定义某一点的坡度呢？

在向量微积分中，我们使用梯度算子 $$\nabla$$，它是一个由函数沿各个维度的一阶偏导数（斜率）组成的向量：

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

在由 $$f(x,y)$$ 定义的二维曲面上，它就是沿 $$x$$ 轴方向的斜率和沿 $$y$$ 轴方向的斜率。既然我们并不受限于只能沿 $$x$$ 轴或 $$y$$ 轴移动，想求任意方向上的坡度，只需把该方向对应的 $$x$$ 分量和 $$y$$ 分量上的斜率加权相加即可——换句话说，将方向向量与梯度做点积，就能得到沿该方向的坡度。

梯度还有一个非常妙的性质：它指向的正是坡度最陡的方向。从数学上很容易看出原因——既然任意方向的坡度是方向向量与梯度的点积，而两个向量的点积在方向完全一致（即与梯度自身做点积）时达到最大，那么梯度方向自然就是上升最陡的方向！

下面我用 Mathematica 绘制了 $$f(x,y)$$ 的负梯度场，它标出了曲面上每一点处下降最快的方向。

![f 的梯度向量场]({{ "/gradient.png" | prepend: page.imgpath }}){: width="360" height="361" loading="lazy" decoding="async"}
{% include caption.html content="绘制为向量场的 f 的梯度。" %}

## 沿着最陡的方向往下走

前面我们已经达成共识：如果在浓雾中摸索下山，想最快到达谷底，就应该始终顺着最陡的下坡方向走。用数学语言来说，就是每一步都沿着当前位置的负梯度方向前进，因为负梯度指向的正是下降最陡的方向。从上面的向量场图可以看出，顺着箭头走最终会把我们带到一个最小值（但要小心——每个最小值都有各自的吸引域！稍后我们会谈到这一点）。

于是我们可以写出这样一套流程：

1. 检查当前位置的坡度，确定下降最陡的方向；

2. 朝那个方向走 5 步；

3. 如果你还在往下走，回到第 1 步；否则，你已经到谷底了！

你可能会好奇，为什么是 5 步？其实这完全是随手定的。我们可以把它设成算法的一个可调参数，称之为「下降率」（步长），记作 $$\alpha$$。下降率越大，我们需要停下来检查坡度的次数就越少。从计算角度看这样效率更高——但正如你马上会看到的，这也暗藏陷阱。

此外，我们还可以做另一项优化。当脚下的坡度依然很陡时，说明我们大概离谷底还远；而随着坡度逐渐变缓，说明我们已经快到谷底了。因此，让每一步迈出的距离与梯度大小成正比会更加合理。我们用 $$\bar{g}$$ 表示梯度，重新改写梯度下降流程：

1. 检查当前位置的坡度，确定下降最陡的方向；

2. 朝那个方向走 $$\alpha \times \|\bar{g}\|$$ 步；

3. 如果你还在往下走，回到第 1 步；否则，你已经到谷底了！

接下来，怎么判断自己是否「还在往下走」？一种常见方法是检查每次迭代下降了多少高度。如果海拔几乎不再变化，那大概率就已经基本到达谷底了。

用数学公式来写，整个过程就是：

{%include math.html content=
"
\begin{align}
\bar{p}_{n+1} = \bar{p}_n - \alpha \nabla f(x,y) \tag{3}  \label{eq:grad_descent}
\end{align}
" 
%}

其中 $$p_n$$ 是我们在第 $$n$$ 次迭代时所处的位置。快来下面的交互演示里亲手试试吧！调节 $$\alpha$$ 会改变下降步长，调节 $$X$$ 和 $$Y$$ 则会改变曲面上的初始出发点。你观察到了什么？

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

## 观察与发现

你可能已经注意到，梯度下降对初始位置非常敏感。它会把你拉向某个局部最小值，而这未必是全局最小值。在定义域中，所有会使梯度下降最终收敛到同一个最小值的初始点所构成的区域，称为该最小值的**吸引域（Basin of Attraction）**。

你大概也发现了，增大下降率 $$\alpha$$ 可以减少到达最小值所需的迭代次数。但一旦把 $$\alpha$$ 调得太大，算法就会「迈过头」（Overshoot），甚至彻底发散。

## 与机器学习的关系

你很可能是在机器学习的语境里听说过梯度下降的。在机器学习中，代价函数代表模型的误差——比如图像分类的错误率——而代价函数的输入变量则是我们要不断调整的模型权重。因此，我们可以用梯度下降来找到一组最优权重，使神经网络的分类误差降到最低！在这个领域，下降率 $$\alpha$$ 有一个专门的名字：*学习率（Learning Rate）*。说不定，我们的大脑一直以来也是这么学习的。

<script defer fetchpriority="low" src="https://cdn.plot.ly/plotly-2.4.2.min.js"></script>
<script defer fetchpriority="low" src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/9.5.1/math.js" integrity="sha512-AfRcJIj922x/jSJpQLnry0DYIBg6EGCtwk/MiQ6QvDlzb7kNFxH8EdqXLkaXXY3YHQS9FrSb8H7LzuLn0CZQ1A==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script defer src="/assets/js/gradient-descent.js"></script>
