---
layout: post
lang_code: zh
locale: zh_CN
ref: lucid-configurator-is-a-streaming-video-game
date: 2021-07-28 00:00:00 -0700
last_modified_at: 2021-07-28 00:00
permalink: /zh/lucid-configurator-is-a-streaming-video-game
title: "Lucid Motors 汽车配置器：流式传输到浏览器的云端电子游戏"
imgpath: /assets/img/lucid-configurator-is-a-streaming-video-game
previewurl: /lucid-configurator.png
description: "拆解 Lucid Motors 汽车配置器的实现原理：如何利用 Unity 引擎、AWS 云端渲染与 WebRTC，将交互式 3D 展厅实时流式传输到你的浏览器中。"
image: /assets/img/lucid-configurator-is-a-streaming-video-game/lucid-configurator.png
image_width: 1958
image_height: 845
image_alt: "Lucid Motors 交互式 3D 汽车配置器"
mathjax: false
tags: [computer-vision, 3d-graphics, systems]
---

{% include description.html content="当你意识到电子游戏引擎其实就是市面上最强的物理模拟器时，一切就都说得通了。" %}

## 一个巧妙的方案

[Lucid Motors 在周一上市了](https://www.barrons.com/articles/lucid-churchill-merger-ipo-ev-51627308359)。虽然我短期内肯定不会买一辆 Lucid，但出于好奇，我还是点开了[他们的在线选车配置器](https://www.lucidmotors.com/air/configure/)。不得不说，它简直是一件艺术品。你可以从几乎任何角度、由外及内地观察并与这辆车互动：

{% include video.html content="https://streamable.com/e/cudr66" %}
<p class="caption video-caption">Lucid 为其旗舰高端车型 Lucid Air Dream 打造的在线配置器。</p>

你可以切换不同的车漆颜色和内饰风格，开关车门，甚至可以把中控屏收进去。背景里的金门大桥倒映在如镜面般的积水中。配置器保留了车身上的种种细节，连使用车门把手时下方亮起的迎宾灯都还原了出来。我甚至觉得自己对这辆车已经有了足够真实的直观感受，都不用再去线下看实车了。

那么 Lucid 究竟是怎么做到这一点的？你能指望普通用户的网页浏览器在本地实时渲染出这种带光影反射的画面吗？答案多半是否定的。它之所以能做到如此惊艳，是因为你看到的画面其实是运行在云端的 Unity（一款电子游戏引擎）渲染出来的——繁重的计算任务全部交给亚马逊服务器处理——再通过点对点视频流协议 WebRTC 实时传输回你的浏览器。

<div class="divider"></div>

## 模型在哪？

一开始，我天真地以为这个 3D 模型是通过最新的 [WebGL 库](https://en.wikipedia.org/wiki/WebGL)（一种在浏览器中借助硬件加速渲染 2D/3D 图形的 API）在我的浏览器里本地渲染的。既然是在本地渲染，那模型肯定就躺在我的内存里某个地方，说不定我还能把它提取出来，导入 3D 建模软件里折腾一下。具体来说，我想试试能不能把挡在全景玻璃穹顶中间的遮阳板去掉——特斯拉 Model X 实现了近乎无缝的穹顶视觉效果，真不知道 Lucid 为什么没有跟进。

![Lucid Air 遮阳板打断了玻璃穹顶的连贯感]({{ "/lucid-air-sun-visors.webp" | prepend: page.imgpath }}){: width="1600" height="994" loading="lazy" decoding="async"}
{% include caption.html content="Lucid Air 的遮阳板打断了玻璃穹顶的连贯感。" %}

于是我一头扎进了代码里。在浏览器开发者工具里折腾了一通，扫了上千行压缩过的 JavaScript，又录制并分析了我的笔记本和 Lucid 服务器之间的网络请求之后，我突然发现，答案从头到尾就明晃晃地打印在控制台里：

![配置器其实是一个视频流]({{ "/zlbolt-webrtc.png" | prepend: page.imgpath }}){: width="691" height="156" loading="lazy" decoding="async"}
{% include caption.html content="这个配置器本质上是一路 WebRTC 视频流。" %}

根本没有什么本地渲染的 3D 模型。我看到的其实是一段视频。

那背后到底发生了什么？配置器刚打开时，先加载的是一个 2D 视图——也就是用一组并不那么丝滑的全景序列图来营造 3D 交互的错觉。市面上大多数在线 3D 展示都是这么做的。下面就是这个 2D 模式的演示：

{% include video.html content="https://streamable.com/e/ptjitc" %}
<p class="caption video-caption">由一系列 2D 图片拼出的略显卡顿的 3D 视图。</p>

紧接着，客户端会测试我的网络带宽和延迟；如果网速足够支撑实时视频流，就会自动把当前会话升级为真正的 3D 模式：

![延迟测试]({{ "/latency-test.png" | prepend: page.imgpath }}){: width="755" height="25" loading="lazy" decoding="async"}
![带宽测试]({{ "/bandwidth-test.png" | prepend: page.imgpath }}){: width="706" height="21" loading="lazy" decoding="async"}
{% include caption.html content="只要带宽足够，会话就会升级为 3D 模式。" %}

这时便会建立一条 WebRTC 连接。[WebRTC](https://en.wikipedia.org/wiki/WebRTC) 是一种点对点流媒体协议。3D 场景在远端完成渲染，再经由 WebRTC 串流到我的浏览器里。

查看 `get_token` 请求的返回内容，还能发现更多实现细节：

![get_token 请求的内容]({{ "/get-token-request.png" | prepend: page.imgpath }}){: width="829" height="402" loading="lazy" decoding="async"}
{% include caption.html content="get_token 请求返回的内容。" %}

第一个红框显示，为了测试带宽，客户端会从[一张 25 MB 的测试图](https://libzl.zlthunder.net/bandwidth-test-img.png)中下载一部分数据到你的设备上，并计算耗时。如果你好奇这张图长什么样，下面就是（别担心，我把它压缩小了 10 倍）。

![带宽测试图片]({{ "/bandwidth-test-image.webp" | prepend: page.imgpath }}){: width="895" height="1263" loading="lazy" decoding="async"}
{% include caption.html content="跟汽车没什么关系，但拿来测带宽再合适不过。" %}

顺便一提，[这张图看起来像是用 GIMP 的 plasma 插件生成的效果](https://www.gimp.org/tutorials/Floating_Logo/Plasma.jpg)。它加载得很慢，因为画面接近随机噪点，基本无法被有效压缩。

打开 [chrome://webrtc-internals/](chrome://webrtc-internals/)，可以看到正在把 3D 画面流式传输到我浏览器的这条 WebRTC 连接的更多底层信息。

![WebRTC 内部信息]({{ "/lucid-webrtc.png" | prepend: page.imgpath }}){: width="851" height="399" loading="lazy" decoding="async"}
{% include caption.html content="Chrome 的调试工具提供了关于这条 WebRTC 连接的更多详细信息。" %}

看到这里，你可能已经注意到，所有这些链接用的都不是 Lucid 自己的域名，而是在 `zlthunder` 旗下。他们是谁？

<div class="divider"></div>

## ZeroLight

上网一搜 `zlthunder`，就会找到一家名为 [ZeroLight](https://zerolight.com/) 的公司。他们的官网介绍自己是专注于汽车领域的云端 3D 可视化服务商。这下全对上号了！

![ZeroLight 官网]({{ "/zero-light.webp" | prepend: page.imgpath }}){: width="1600" height="640" loading="lazy" decoding="async"}
{% include caption.html content="专注于云端 3D 可视化的服务商。" %}

没过多久，我又找到了[知名游戏引擎 Unity 发布的一篇官方博客](https://unity3d.com/showcase/case-stories/zerolight)，专门介绍了 ZeroLight 如何借助 Unity 引擎打造逼真的虚拟展厅，包括精细优化的物理效果、光影反射等等。

![Unity 关于 ZeroLight 的案例文章]({{ "/unity-zero-light.webp" | prepend: page.imgpath }}){: width="1203" height="658" loading="lazy" decoding="async"}
{% include caption.html content="电子游戏技术已经带着我们走了这么远。" %}

现在所有拼图都严丝合缝地拼在一起了。当我访问这个网站时，页面会先加载一个 2D 配置器。如果我的网络条件达标，它就会把我连接到运行在 AWS 服务器上的一个 Unity（3D 游戏引擎）实例。服务器接收我的鼠标操作，实时旋转和缩放视角，在云端渲染出画面，再流式传回给我。

<div class="divider"></div>

## 听起来烧钱得很

想象一下，如果同时有 1,000 个用户在线浏览这个网站：你就需要 1,000 个带硬件加速的游戏引擎实例，同时接收输入并向外推送海量实时视频流——跟 Stadia、GeForce Now 这些云游戏平台如出一辙。不过他们显然非常清楚这笔账：为了节省成本，只要你闲置 60 秒，系统就会自动断开 3D 连接：

![闲置降级提示]({{ "/inactivity-downgrade.png" | prepend: page.imgpath }}){: width="524" height="60" loading="lazy" decoding="async"}
{% include caption.html content="闲置自动降级肯定省下了不少钱。" %}

<div class="divider"></div>

## 游戏引擎到底是什么？

乍一看，拿电子游戏引擎来做汽车配置器似乎有点出人意料，但游戏引擎本质上就是一个高度优化的物理模拟器。像 Unity 这样成熟的游戏引擎，凝聚了几十年来在光线追踪与其他物理现象模拟上的研究成果。因此，只要你想模拟现实世界——哪怕只是模拟一个汽车展厅——游戏引擎就是一款开箱即用、可拓展至无数领域的绝佳工具。

事后想想，我本来随便搜一搜、翻到 Unity 那篇案例文章，就能搞明白 Lucid 配置器的原理。但亲手逆向拆解它，让我更近距离地看到了这个产品背后的挑战、解法与运转机制，过程就像当了一回抽丝剥茧的侦探。不过最让我觉得好笑又震撼的，还是如今科技所达到的惊人复杂度：一个超级逼真的物理模拟器，运行在亚马逊数据中心的远程服务器上，以光速接收我电脑发出的指令并传回实时视频流——而这一切，仅仅是为了让我能在线玩玩汽车选配器。想当年，人类登月也不过靠了一台「计算器」而已！
