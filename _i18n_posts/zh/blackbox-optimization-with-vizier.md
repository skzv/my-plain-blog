---
layout: post
lang_code: zh
locale: zh_CN
ref: blackbox-optimization-with-vizier
date: 2023-02-23 00:00:00 -0700
last_modified_at: 2023-02-23 00:00
permalink: /zh/blackbox-optimization-with-vizier
title: "使用 Google Vizier 进行黑盒优化与超参数调优"
imgpath: /assets/img/blackbox-optimization-with-vizier
previewurl: /black-box-optimization.png
description: "Google Vizier 黑盒优化实战示例：定义条件参数、评估试验结果，并自动调优模型以拟合带噪声的信号。"
image: /assets/img/blackbox-optimization-with-vizier/og-preview.png
image_width: 1200
image_height: 630
image_alt: "黑盒优化的输入与输出示意图"
mathjax: true
tags: [machine-learning, optimization]
toc: true
---
{% include description.html content="自动且智能地优化任意类型的系统" %}

<style>
img {
  max-height: 350px;
}
</style>

当你构建一个机器学习模型——或者其他类型的算法系统——时，总免不了要对系统架构做出各种抉择。比如，在机器学习应用中，你需要决定神经网络每一层放多少个神经元，或者梯度下降的学习率设多大；如果你在开发一个追踪机器人状态的[粒子滤波器（Particle Filter）](https://en.wikipedia.org/wiki/Particle_filter)，可能需要决定似然函数的形状；又或者，你可能在寻找一组能让计算资源占用降到最低的缓冲区大小和线程数。怎样才能找到系统的最优配置呢？

你当然可以手动去试：调一调神经元数量，换几个梯度下降速率。但这种人工摸索既慢又枯燥，还很容易踩坑。好在，如今已经有一些专门的服务，能以智能且高效的方式帮你自动完成系统优化。

<div class="divider"></div>

## 认识 Vizier

[Vizier](https://github.com/google/vizier) 是 Google 打造的一款面向黑盒优化与超参数调优的服务。它可以用来优化几乎任何系统，只要满足两个条件：你能把 Vizier 建议的输入传给系统，再从系统拿到输出指标（也就是 Vizier 试图最大化或最小化的目标）。系统内部本身完全被当作一个「黑盒」。

![黑盒优化示意图]({{ "/black-box-optimization.png" | prepend: page.imgpath }}){: width="629" height="319" loading="lazy" decoding="async"}
{% include caption.html content="只要能输入参数并获取输出指标，黑盒优化无需对系统内部有任何了解。来源：Per Instance Algorithm Configuration for Continuous Black Box Optimization - Scientific Figure on ResearchGate，访问于 2023 年 2 月 23 日：https://www.researchgate.net/figure/black-box-Optimization_fig1_322035981" %}

与[梯度下降](/zh/gradient-descent)这类非黑盒优化方法不同——后者需要明确知道系统参数与待优化指标之间的数学关系——像 Vizier 这样的黑盒优化系统不需要对系统内部有任何先验洞察，却依然能够高效地搜索参数空间，帮你找到令系统表现最优的参数组合。这也让它在面对复杂、不连续甚至非凸的指标函数时更加稳健。

<div class="divider"></div>

## 参数 vs 超参数

插一句题外话：这一区分源自机器学习领域。所谓「参数（Parameters）」，通常指模型内部用于在数据集上训练得到、并在推理时发挥作用的数值（如权重）；而「超参数（Hyperparameters）」则用来描述模型的架构或训练流程本身。虽然像 Vizier 这样的黑盒优化服务可以用于任何系统，但拿它来直接训练机器学习模型的内部权重并不高效；相比之下，用它来优化模型架构和超参数则再合适不过。

<div class="divider"></div>

## 一个实战例子

接下来我举一个跟机器学习无关的小例子，但它依然足以展示像 Vizier 这样的黑盒优化算法有多么强大且简洁。假设我们拿到了下面这样一条带有噪声的信号：

![带噪声的信号]({{ "/some-noisy-signal.png" | prepend: page.imgpath }}){: width="368" height="246" loading="lazy" decoding="async"}
{% include caption.html content="一条带有噪声的信号。" %}

我们想找一个解析函数来拟合这条信号。但我们拿不准应该用[高斯分布（Gaussian）](https://en.wikipedia.org/wiki/Normal_distribution)还是[拉普拉斯分布（Laplace）](https://en.wikipedia.org/wiki/Laplace_distribution)来拟合，而且这两种分布各自又都有需要估计的参数——例如均值和方差。

只要我们能给 Vizier 提供一个需要优化的评估指标，它就能帮我们自动找出最优的函数形式与参数。

<div class="divider"></div>

## 构建优化问题
我们要搜索的第一个参数是模型类型：高斯分布（Gaussian）或拉普拉斯分布（Laplace）：

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

不过每个模型都有各自决定曲线形状的一组参数，我们把它们称作各模型的「子参数」。

对于高斯分布，子参数是均值 `mu`（$$\mu$$）和标准差 `sigma`（$$\sigma$$）。

![带有参数 mu 和 sigma 的高斯分布]({{ "/normal-distribution.png" | prepend: page.imgpath }}){: width="720" height="460" loading="lazy" decoding="async"}
{% include caption.html content="带有参数 mu 和 sigma 的高斯分布。图片来源：https://commons.wikimedia.org/wiki/File:Normal_Distribution_PDF.svg" %}

对于拉普拉斯分布——不同文献的记号略有差异——通常包含位置参数（或均值）`mu`（$$\mu$$）以及尺度因子 `b`（$$b$$）。

![带有参数 mu 和 b 的拉普拉斯分布]({{ "/laplace-distribution.png" | prepend: page.imgpath }}){: width="800" height="600" loading="lazy" decoding="async"}
{% include caption.html content="带有参数 mu 和 b 的拉普拉斯分布。图片来源：https://commons.wikimedia.org/wiki/File:Laplace_pdf_mod.svg" %}

为了避免与高斯分布的均值重名，我们把拉普拉斯分布的位置参数记作 `a` 而不是 `mu`。

在尝试拟合高斯分布时，我们并不希望 Vizier 去瞎猜拉普拉斯分布的参数，反之亦然。好在 Vizier 支持把两种分布各自的参数定义为父级 `model` 参数的子参数（即条件参数）：

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

最后，我们需要定义 Vizier 要优化的目标指标。我希望找到的函数尽可能贴合这条信号，因此我通过计算解析函数与观测数据之间的残差平方和（Sum of Squared Residuals）来评估拟合优度。这个数值越小，说明拟合得越好。我们只需要告诉 Vizier 要最小化这个指标：

```
metric_ssr = {
    'metric_id': 'sum_of_squared_residuals',
    'goal': 'MINIMIZE',
}
```

把以上部分组合起来，就完整定义了我们的优化研究（Study）：

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

请注意，Vizier 对这些参数的实际含义一无所知。对它来说，`Gaussian` 和 `Laplace` 仅仅是一个分类参数的两个取值，没有任何额外语义。赋予它们真正含义的是接收这些参数的业务代码，而对 Vizier 而言，那段代码就藏在黑盒子里。为节省篇幅，这里省去了评估代码，但你可以在文末链接里找到完整实现，一看便知。


<div class="divider"></div>

## 开始搜索

在每一轮试验（Trial）中，Vizier 会给我们建议一组待测试的参数。我们自行评估这组参数的表现，算出目标指标（残差平方和），再把结果回报给 Vizier。Vizier 则根据反馈来生成下一组待尝试的参数。

![Vizier 为各次试验建议的参数]({{ "/vizier-trials.png" | prepend: page.imgpath }}){: width="1280" height="281" loading="lazy" decoding="async"}
{% include caption.html content="Vizier 为每次试验建议的参数。" %}

可以看到，只有当模型类型为高斯分布时，Vizier 才会建议高斯参数；拉普拉斯分布也是如此。

Vizier 究竟是如何搜索最优参数的？它既支持网格搜索或随机搜索，但真正的魔力在于它融合了多种高级优化算法：高斯过程多臂老虎机（Gaussian Process Bandits）、线性组合搜索及其各种变体。

借助 GCP，我们还能看到非常酷炫的 Vizier 优化进度图表：

![展示指标演进与每次试验参数的研究进度表]({{ "/study-progress-table.webp" | prepend: page.imgpath }}){: width="1600" height="1071" loading="lazy" decoding="async"}
{% include caption.html content="展示待优化指标演变趋势以及各次试验参数的研究进度表。" %}

![展示各组尝试参数与对应指标值的平行坐标图]({{ "/parallel-chart.webp" | prepend: page.imgpath }}){: width="1600" height="726" loading="lazy" decoding="async"}
{% include caption.html content="展示各组尝试参数及其对应指标值的平行坐标图。" %}

<div class="divider"></div>

## 优化拟合结果

从结果可以看出，拉普拉斯分布略微胜过了高斯分布：

![放大后的平行坐标图，显示使残差平方和最小的前排试验：拉普拉斯分布的拟合效果优于高斯分布]({{ "/optimal-parallel-chart.webp" | prepend: page.imgpath }}){: width="1600" height="550" loading="lazy" decoding="async"}
{% include caption.html content="放大后的平行坐标图，聚焦于残差平方和最小的最佳试验。可以看到拉普拉斯分布获得了比高斯分布更好的拟合效果。" %}

向 Vizier 查询最优试验的参数，并将其绘制出来：

![带噪声信号的优化拟合结果]({{ "/noisy-signal-fit.png" | prepend: page.imgpath }}){: width="543" height="289" loading="lazy" decoding="async"}
{% include caption.html content="拟合该噪声信号的最优参数曲线。" %}

几乎严丝合缝！Vizier 找到的参数非常接近我在叠加噪声之前用来生成原始信号的真实参数：位置参数 $$a=5$$、尺度因子 $$b=2$$ 的拉普拉斯分布。

![原始拉普拉斯信号]({{ "/original-laplace-signal.png" | prepend: page.imgpath }}){: width="862" height="728" loading="lazy" decoding="async"}
{% include caption.html content="原始的拉普拉斯信号。" %}

作为对比，高斯分布的波峰会更圆润，尾部也会更细。

![高斯分布对比信号]({{ "/gaussian-signal.png" | prepend: page.imgpath }}){: width="878" height="726" loading="lazy" decoding="async"}
{% include caption.html content="用于对比的高斯分布曲线。" %}

<div class="divider"></div>

## 如何复现？

我用来撰写这篇文章的 Colab 笔记本可以在[这里](https://github.com/skzv/vizier-blog-post/blob/main/vizier_blog_post.ipynb)找到。我用的是 GCP 的 Vertex AI Vizier API，因为它能生成文中那些很酷的可视化图表，但要注意它的费用不便宜（每次试验 1 美元）。Vizier 也有开源版本，可以在[这里](https://github.com/google/vizier)免费获取。
