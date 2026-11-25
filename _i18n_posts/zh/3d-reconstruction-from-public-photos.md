---
layout: post
lang_code: zh
locale: zh_CN
ref: 3d-reconstruction-from-public-photos
date: 2025-08-21 00:00:00 -0700
last_modified_at: 2025-08-21 00:00
permalink: /zh/3d-reconstruction-from-public-photos
title: "利用机器学习从公开照片进行三维重建"
imgpath: /assets/img/3d-reconstruction
previewurl: /3d-reconstruction-preview.png
description: "结合 Apple Depth Pro 深度估计模型、相机透视投影与 Open3D，从单张公开照片重建真实尺度的三维点云，并展示多个场景效果与模型局限。"
image: /assets/img/3d-reconstruction/3d-reconstruction-preview.png
image_width: 1200
image_height: 630
image_alt: "利用估计深度从公开照片生成的三维重建结果"
mathjax: true
tags: [computer-vision, 3d-graphics, machine-learning]
toc: true
---

{% include description.html content="我们能否仅凭互联网上的公开照片，把整个世界重建为三维模型？" %}

## 测绘整个世界

互联网上汇聚了海量的公开照片，来自 Reddit、YouTube、Google Maps 用户上传等形形色色的渠道。

![Google Maps 公开照片示例]({{ "/google-maps-photos.webp" | prepend: page.imgpath }}){: width="1600" height="1232" fetchpriority="high" decoding="async" style="max-height:400px;width:auto"}
{% include caption.html content="Google Maps 上随处可见的公开照片" %}

我心里冒出一个念头：有没有可能用这些数据构建出一张覆盖全球的三维地图？相机在按下快门的那一刻丢弃了所有的三维空间信息——但借助前沿的机器学习技术，我们可以把丢失的维度找回来，将下面这样一张普通照片：

![Safeway 输入照片 0]({{ "/safeway-1.webp" | prepend: page.imgpath }}){: width="680" height="510" loading="lazy" decoding="async"}
{% include caption.html content="公开的 Safeway 超市输入照片 0。" %}

还原成下面这样的三维模型：

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1360" height="810" poster="/assets/video/3d-reconstruction/safeway-1-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/safeway-1-recording.mp4" type="video/mp4">
        您的浏览器不支持 video 标签。
    </video>
</div>

再看另一个例子，闻名遐迩的新加坡樟宜机场：

![新加坡机场输入照片]({{ "/sg-airport-0.jpeg" | prepend: page.imgpath }}){: width="960" height="1280" loading="lazy" decoding="async" style="max-height:600px;width:auto"}
{% include caption.html content="公开的新加坡机场输入照片。" %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1012" height="1008" poster="/assets/video/3d-reconstruction/sg-airport-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/sg-airport-recording.mp4" type="video/mp4">
        您的浏览器不支持 video 标签。
    </video>
</div>

甚至是一张森林照片：

![森林输入照片]({{ "/forest-0.jpg" | prepend: page.imgpath }}){: width="1500" height="900" loading="lazy" decoding="async"}
{% include caption.html content="公开的森林输入照片。" %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1358" height="714" poster="/assets/video/3d-reconstruction/forest-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/forest-recording.mp4" type="video/mp4">
        您的浏览器不支持 video 标签。
    </video>
</div>

为了实现这个效果，我只用到了一个机器学习深度估计模型，外加一点线性代数。

## 相机投影

我们可以把相机看作执行了一次从三维空间到二维平面的投影，如下图所示。这个投影过程抹去了第三个维度的信息：深度（Depth）。

![相机投影示意图]({{ "/camera-projection.png" | prepend: page.imgpath }}){: width="850" height="356" loading="lazy" decoding="async"}
{% include caption.html content="从三维到二维的相机投影。来源：[1]" %}

我们的任务，就是先恢复出这第三个维度，再想办法逆转这次投影。

## 相机内参

要将图像重建回三维空间，仅仅知道每个像素的深度是不够的。因为相机自身的光学属性——其中最重要的是焦距（Focal Length）——决定了三维空间中的点是如何映射到二维像素上的；要逆转这一映射，我们就必须知道这些相机参数。看看下面这个演示，不同焦距拍出来的画面差异有多大：

<div style="text-align:center">
  <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="600" height="600" poster="/assets/video/3d-reconstruction/face-focal-length-poster.webp" style="max-height:400px;width:auto">
    <source src="/assets/video/3d-reconstruction/face-focal-length.mp4" type="video/mp4">
    焦距对人脸成像的影响演示
  </video>
</div>
{% include caption.html content="焦距变化对成像效果影响的演示。来源：[2]" %}

顺理成章地，如果我们想从上面任意一张照片中把这张人脸重建成三维模型，就必须掌握拍摄时相机的内参。

利用下图所示的相似三角形性质，图像像素点与三维空间点之间的关系其实非常简洁：

{%include math.html content=
"
\begin{align}
x = f \frac{X}{Z} \space\space\space\space\space y = f \frac{Y}{Z} \tag{1} \label{eq:camera perspective projection}
\end{align}
" 
%}

![相机透视投影]({{ "/camera-perspective-focal.png" | prepend: page.imgpath }}){: width="1073" height="834" loading="lazy" decoding="async"}
{% include caption.html content="相机透视投影几何关系" %}

将这个变换反过来，把二维图像点映射回三维空间，便得到：

{%include math.html content=
"
\begin{align}
X = \frac{x \cdot Z}{f} \space\space\space\space\space Y = \frac{y \cdot Z}{f} \space\space\space\space\space Z = Z \tag{2} \label{eq:inverse camera perspective projection}
\end{align}
" 
%}

也就是说，我们缺失的两块关键拼图分别是每个像素的深度 $$Z$$ 以及相机的焦距 $$f$$。而对于互联网上的公开照片，这两项信息都无法直接拿到——原本可能记录着相机参数的 EXIF 元数据，在上传时通常早已被抹除了。

顺便一提，如果再把相机的空间位姿考虑进来，还可以写出三维世界坐标系与二维图像坐标系之间的完整变换关系，如下图所示。不过在本文中，我们只需考虑相机自身的局部坐标系即可。

![完整相机模型]({{ "/complete-camera-model.jpg" | prepend: page.imgpath }}){: width="1280" height="720" loading="lazy" decoding="async"}
{% include caption.html content="完整相机成像模型。来源：[3]" %}

## 深度图估计

Apple 近期开源的 [DepthPro 模型](https://github.com/apple/ml-depth-pro)让这个项目成为了可能。虽然深度估计模型早就存在，但我发现 DepthPro 有两个非常突出的特点：
    1. 它输出的是绝对的公制尺度深度（Metric Depth），这意味着哪怕只有单张普通照片，重建出来的三维场景也拥有真实准确的物理比例；
    2. 它还能顺带帮我估算出相机的焦距。

![Depth Pro 效果展示]({{ "/depth-pro-teaser.webp" | prepend: page.imgpath }}){: width="1242" height="535" loading="lazy" decoding="async"}
{% include caption.html content="Depth Pro 效果展示。来源：[4]" %}

我用这个模型跑了一批公开照片，估算出各自的深度图与焦距。举个例子，对于下面这张照片：

![Safeway 输入照片 1]({{ "/safeway-1.webp" | prepend: page.imgpath }}){: width="680" height="510" loading="lazy" decoding="async"}
{% include caption.html content="公开的 Safeway 超市输入照片 1。" %}

模型预测出的深度图与焦距如下：

![Safeway 深度图 1]({{ "/safeway-1-depth-black.png" | prepend: page.imgpath }}){: width="507" height="396" loading="lazy" decoding="async"}
{% include caption.html content="DepthPro 模型预测出的 Safeway 深度图 1 与焦距。" %}

接着，我套用公式 $$(2)$$ 将每个像素反投影回三维空间，生成三维点云，并用 Open3D 进行可视化：

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1360" height="810" poster="/assets/video/3d-reconstruction/safeway-1-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/safeway-1-recording.mp4" type="video/mp4">
        您的浏览器不支持 video 标签。
    </video>
</div>

## 三维重建效果展示

下面是我跑出来的全部示例。特别值得留意的是纽约天际线那一组——我很好奇模型在纽约天际线这种超大尺度场景上表现如何。果不其然，DepthPro 在这张图上没能生成理想的深度图，它的训练数据集几乎可以肯定主要集中在中小尺度场景上。

### COEX 购物中心

![COEX 购物中心输入照片]({{ "/coex-0.jpg" | prepend: page.imgpath }}){: width="924" height="483" loading="lazy" decoding="async"}
{% include caption.html content="公开的 COEX 购物中心输入照片。" %}

![COEX 购物中心深度图]({{ "/coex-0-depth-black.png" | prepend: page.imgpath }}){: width="506" height="389" loading="lazy" decoding="async"}
{% include caption.html content="DepthPro 模型预测出的 COEX 购物中心深度图与焦距。" %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1398" height="848" poster="/assets/video/3d-reconstruction/coex-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/coex-recording.mp4" type="video/mp4">
        您的浏览器不支持 video 标签。
    </video>
</div>

<div class="divider"></div>

### 森林

![森林输入照片]({{ "/forest-0.jpg" | prepend: page.imgpath }}){: width="1500" height="900" loading="lazy" decoding="async"}
{% include caption.html content="公开的森林输入照片。" %}

![森林深度图]({{ "/forest-0-depth-black.png" | prepend: page.imgpath }}){: width="506" height="389" loading="lazy" decoding="async"}
{% include caption.html content="DepthPro 模型预测出的森林深度图与焦距。" %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1358" height="714" poster="/assets/video/3d-reconstruction/forest-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/forest-recording.mp4" type="video/mp4">
        您的浏览器不支持 video 标签。
    </video>
</div>

<div class="divider"></div>

### 纽约天际线

![纽约天际线输入照片]({{ "/nyc-0.webp" | prepend: page.imgpath }}){: width="1000" height="560" loading="lazy" decoding="async"}
{% include caption.html content="公开的纽约天际线输入照片。" %}

![纽约天际线深度图]({{ "/nyc-depth-black.png" | prepend: page.imgpath }}){: width="498" height="389" loading="lazy" decoding="async"}
{% include caption.html content="DepthPro 模型预测出的纽约天际线深度图与焦距。" %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1382" height="714" poster="/assets/video/3d-reconstruction/nyc-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/nyc-recording.mp4" type="video/mp4">
        您的浏览器不支持 video 标签。
    </video>
</div>

<div class="divider"></div>

### Safeway 超市 1

![Safeway 输入照片 0]({{ "/safeway-0.webp" | prepend: page.imgpath }}){: width="680" height="510" loading="lazy" decoding="async"}
{% include caption.html content="公开的 Safeway 超市输入照片 0。" %}

![Safeway 深度图 0]({{ "/safeway-0-depth-black.png" | prepend: page.imgpath }}){: width="506" height="396" loading="lazy" decoding="async"}
{% include caption.html content="DepthPro 模型预测出的 Safeway 深度图 0 与焦距。" %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1066" height="776" poster="/assets/video/3d-reconstruction/safeway-0-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/safeway-0-recording.mp4" type="video/mp4">
        您的浏览器不支持 video 标签。
    </video>
</div>

<div class="divider"></div>

### Safeway 超市 2

![Safeway 输入照片 1]({{ "/safeway-1.webp" | prepend: page.imgpath }}){: width="680" height="510" loading="lazy" decoding="async"}
{% include caption.html content="公开的 Safeway 超市输入照片 1。" %}

![Safeway 深度图 1]({{ "/safeway-1-depth-black.png" | prepend: page.imgpath }}){: width="507" height="396" loading="lazy" decoding="async"}
{% include caption.html content="DepthPro 模型预测出的 Safeway 深度图 1 与焦距。" %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1360" height="810" poster="/assets/video/3d-reconstruction/safeway-1-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/safeway-1-recording.mp4" type="video/mp4">
        您的浏览器不支持 video 标签。
    </video>
</div>

<div class="divider"></div>

### 新加坡樟宜机场

![新加坡机场输入照片]({{ "/sg-airport-0.jpeg" | prepend: page.imgpath }}){: width="960" height="1280" loading="lazy" decoding="async" style="max-height:600px;width:auto"}
{% include caption.html content="公开的新加坡机场输入照片。" %}

![新加坡机场深度图]({{ "/sg-airport-0-depth-black.png" | prepend: page.imgpath }}){: width="387" height="432" loading="lazy" decoding="async"}
{% include caption.html content="DepthPro 模型预测出的新加坡机场深度图与焦距。" %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1012" height="1008" poster="/assets/video/3d-reconstruction/sg-airport-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/sg-airport-recording.mp4" type="video/mp4">
        您的浏览器不支持 video 标签。
    </video>
</div>

<div class="divider"></div> 

## 参考文献与来源

1. 从三维到二维的相机投影。来源：[ResearchGate](https://www.researchgate.net/figure/The-perspective-projection-of-a-camera-model_fig2_324584663)
2. 焦距变化对人像成像影响的演示。来源：[DIY Photography](https://www.diyphotography.net/gif-explains-changing-focal-length-impacts-portrait)
3. 完整相机成像模型。来源：[Robot Academy](https://robotacademy.net.au/lesson/summary-of-image-geometry/)
4. Depth Pro 效果展示。来源：[Apple](https://github.com/apple/ml-depth-pro)
