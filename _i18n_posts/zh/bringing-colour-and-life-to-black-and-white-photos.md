---
layout: post
lang_code: zh
locale: zh_CN
ref: bringing-colour-and-life-to-black-and-white-photos
date: 2021-06-12 00:00:00 -0700
last_modified_at: 2021-06-12 00:00
permalink: /zh/bringing-colour-and-life-to-black-and-white-photos
title: "用 AI 为黑白老照片赋予色彩与生命力"
imgpath: /assets/img/colourising-black-and-white-photos
previewurl: /mama-and-vova-colorized.jpg
description: "利用 AI 和 DeepAI API 为家庭老照片与历史影像上色：包含效果示例、批量处理脚本，以及对 AI 色彩还原局限性与伦理问题的探讨。"
image: /assets/img/colourising-black-and-white-photos/og-preview.png
image_width: 1200
image_height: 630
image_alt: "经由 AI 还原色彩的家庭老照片"
mathjax: false
tags: [computer-vision, machine-learning]
toc: true
---

{% include description.html content="机器学习让我们能轻松为黑白照片上色，但这背后又隐藏着什么风险？" %}

## 另一个宇宙

尽管彩色照片在技术上已经存在了一个多世纪（[彩色摄影先驱谢尔盖·普罗库金-戈尔斯基与彼得·韦杰尼索夫曾游历沙皇俄国，用全彩影像记录下了那个时代](https://www.loc.gov/pictures/related/?fi=name&q=Prokudin-Gorski%20%2C%20Serge%20%20Mikha%20lovich%2C%201863-1944)），但 20 世纪的大多数时光仍是以黑白影像留存下来的。即便到了 20 世纪后期，世界上很多地方也用不起彩色胶卷——直到 1980、90 年代，我父亲在苏联时期的乌克兰依然是自己冲洗黑白照片；而当美国人用全彩胶片记录越南战争时，北越视角的影像却几乎全是黑白照片。

![西姆河畔的少年]({{ "/boy-sim-river.jpeg" | prepend: page.imgpath }}){: width="900" height="648" fetchpriority="high" decoding="async"}
{% include caption.html content="西姆河畔的少年，一张极其早期的沙俄彩色照片。这张照片是通过使用不同滤色镜对同一场景拍摄多张底片合成的。图片由美国国会图书馆提供。" %}

有人会说，黑白影像有着自己独特的质感，这或许没错。但对我而言，黑白影像总会在我和画面之间划出一道隔阂。它明显带着遥远的时间距离感。我们所有人都会把黑白画面与「过去」联系在一起——影视作品里经常用黑白画面来表现回忆，正是这种心理联想的写照。而作为一个在彩色世界中感知现实的人，我很难真正代入黑白影像里。我很难把自己放进那个场景或片中人物的处境里，因为在潜意识里，它们仿佛存在于另一个黑白宇宙。然而一旦给这些影像上色，一切突然变得更真实、更可信、更触手可及。那一刻你会真切地感受到，画面里记录的就发生在同一片土地上，画中人也是和我们一样的普通人。

因此，当父亲最近开始把我们家的老照片数字化——毕竟实体照片会随着时间褪色损坏，甚至有永久遗失的风险，连同它们承载的家族历史、记忆与传承一起消失——我也萌生了给它们上色的念头。我想更真切地感受这些画面，也想让家人们能够借此怀念已经离世的亲人，重温他们曾经的青春与往昔。

<div class="divider"></div>

## 用 AI 为照片上色

手动给照片修复色彩既费时又费力。机器学习模型提供了一种快速且低成本的替代方案，不过它们也有自身的局限，后文我们会详细讨论。我并没有为此自己训练模型——别人已经投入了数千小时来研发和训练专门做这件事的模型，我直接找到了一个效果非常出色的现成模型。

我使用的是 [DeepAI 提供的图像上色 API（Image Colorization API）](https://deepai.org/machine-learning-model/colorizer)。DeepAI 线上部署的似乎是 DeOldify 模型的某个变体，源码可以在[这个 GitHub 仓库](https://github.com/jantic/DeOldify)找到。

DeepAI 的 API 似乎不允许调整模型参数，但如果你从上面的仓库自己本地运行，或者使用 [Colab 实例](https://colab.research.google.com/github/jantic/DeOldify/blob/master/ImageColorizerColabStable.ipynb)，就可以自由调参。[MyHeritage](https://www.myheritage.com/incolor) 也把这个模型封装成了支持调节参数的在线服务。

我自己写了一个小脚本，用来批量处理整个文件夹里的照片。它会遍历目录中的所有图片，发送到 DeepAI 的图像上色 API，再把结果下载到另一个文件夹中（同时跳过已经上过色的图片）。如果你也用得上，只需把自己的 DeepAI API 密钥设为环境变量，然后运行[这个脚本](https://github.com/skzv/colorize-photos)即可：

```bash
export DL_API_KEY=<your-deep-ai-key>
python3 main.py /path/to/images
```

<div class="divider"></div>

## 我的家庭老照片
下面展示几张我们家老照片的上色效果。

![妈妈抱着哥哥沃瓦]({{ "/mama-and-vova.webp" | prepend: page.imgpath }}){: width="1600" height="1232" loading="lazy" decoding="async"}
{% include caption.html content="90 年代初在乌克兰赫尔松，母亲抱着我哥哥。图片由库兹涅佐夫（Kuznetsov）家族提供。" %}

![上色后的妈妈与沃瓦]({{ "/mama-and-vova-colorized.webp" | prepend: page.imgpath }}){: width="800" height="616" loading="lazy" decoding="async"}
{% include caption.html content="上色之后。" %}

![祖母阿拉尔卡季娜]({{ "/my-grandmother-allarkadina.jpg" | prepend: page.imgpath }}){: width="523" height="801" loading="lazy" decoding="async"}
{% include caption.html content="我的祖母阿拉尔卡季娜（Allarkadina），大概摄于 50 年代去大学的路上。她毕业于多所院校，专攻电气工程，曾是一名非常成功的船舶电气工程师。" %}

![上色后的祖母阿拉尔卡季娜]({{ "/my-grandmother-alla-colourised.webp" | prepend: page.imgpath }}){: width="522" height="800" loading="lazy" decoding="async"}
{% include caption.html content="上色之后。" %}

> 看起来真漂亮，栩栩如生。

父亲看到刚上完色的照片时说的这句话，让我觉得一切折腾都值了。

<div class="divider"></div>

## 越南战争老照片
在为家庭照片写好批量上色脚本几周后，一篇题为[「北越视角下的越南战争（The Vietnam War from the North Vietnamese Side）」](https://news.ycombinator.com/item?id=27283624)的帖子登上了 Hacker News 首页。我觉得这正是用这个脚本的绝佳机会，也许能为这些历史影像带来全新的视角。正如电影[《他们已不再变老》（They Shall Not Grow Old）](https://www.imdb.com/title/tt7905466/)让一战的残酷变得鲜活而真实一样，我也希望能让北越视角下的人物与场景同样生动起来。

![橙剂摧毁的丛林黑白照]({{ "/vietnam-agent-orange.jpeg" | prepend: page.imgpath }}){: width="1600" height="1179" loading="lazy" decoding="async"}
{% include caption.html content="橙剂（Agent Orange）对丛林造成的毁灭性破坏。" %}

![橙剂摧毁的丛林彩色照]({{ "/vietnam-agent-orange-colourised.webp" | prepend: page.imgpath }}){: width="800" height="590" loading="lazy" decoding="async"}
{% include caption.html content="上色之后。" %}

![当地人查看坠毁的美军飞机黑白照]({{ "/vietnam-downed-aircraft.jpeg" | prepend: page.imgpath }}){: width="1600" height="1111" loading="lazy" decoding="async"}
{% include caption.html content="当地人正在查看一架坠毁的美军飞机，飞行员为斯蒂芬·欧文·马瑟尔曼（Stephen Owen Musselman）中尉。他未能生还——战争即是地狱。" %}

![当地人查看坠毁的美军飞机彩色照]({{ "/vietnam-downed-aircraft-colourised.webp" | prepend: page.imgpath }}){: width="800" height="556" loading="lazy" decoding="async"}
{% include caption.html content="上色之后。" %}

所有原始黑白照片都可以在[这里](https://rarehistoricalphotos.com/vietnam-war-images-from-vietnamese-photographers/)查看，上色后的版本则在[这里](https://imgur.com/a/aJbpMjf)。

<div class="divider"></div>

## Hacker News 上的反响

我的尝试收获了不少赞誉，

![赞誉评论截图]({{ "/praise.webp" | prepend: page.imgpath }}){: width="624" height="934" loading="lazy" decoding="async"}

也招来了一些反感，

![反感评论截图]({{ "/contempt.png" | prepend: page.imgpath }}){: width="546" height="286" loading="lazy" decoding="async"} {% include caption.html content="那条被折叠（[flagged]）的评论挺可惜的，因为它其实点出了一个很有意思的观点，大意是「请不要这么做」。" %}

但最重要的是，它引发了许多非常有价值的讨论。

![讨论评论截图]({{ "/discussion.webp" | prepend: page.imgpath }}){: width="654" height="946" loading="lazy" decoding="async"}

由这批上色照片引发的完整讨论帖可以在[这里](https://news.ycombinator.com/item?id=27284795)看到。

<div class="divider"></div>

## 模型的局限性

这场讨论中有两个方面让我印象尤为深刻。第一点，是对 AI 局限性的清醒提醒。

例如，把这个模型用到一张建造中的金门大桥老照片上，它会输出一座白色的大桥。公平地说，这倒也不算完全离谱——大桥在施工初期确实是白色的；但根据 [DeOldify 仓库](https://github.com/jantic/DeOldify)的说明，在这张照片拍摄时，大桥其实已经刷上了红色防锈底漆。虽然训练数据里大概包含建造中的金门大桥，模型也确实认出了这是建造中的同一座桥，但它无法判断照片的拍摄日期，也就不知道此时桥身早已涂上了红底漆。

![白色的金门大桥？]({{ "/golden-gate.webp" | prepend: page.imgpath }}){: width="1200" height="472" loading="lazy" decoding="async"} {% include caption.html content="白色的金门大桥？它确实曾是白色的——但不是拍这张照片的时候。" %}

还有一些场景本身就模棱两可。比如下面这张图，仅凭画面特征，模型分不清地面是草地还是柏油路，于是错误地把柏油路涂成了绿色，而人类上色师往往能判断准确。

![一场庆祝活动]({{ "/a-celebration-colourised.webp" | prepend: page.imgpath }}){: width="800" height="522" loading="lazy" decoding="async"} {% include caption.html content="模型没能分辨出地面是柏油路而不是草坪。" %}

另一个有趣的现象是，衣物往往缺乏足够鲜明的色调、纹理、特征或上下文来支持准确上色。除非衣服本身有非常明显的特征或场景线索，否则模型特别倾向于把衣服涂成紫色。原因大概在于，当模型无法可靠推断衣服颜色时，紫色处于模糊色彩空间的中间地带，是一个能最小化训练损失的「保守押注」。

![越南潜水员——全都是紫色？]({{ "/vietnam-divers-colourised.webp" | prepend: page.imgpath }}){: width="796" height="800" loading="lazy" decoding="async"} {% include caption.html content="我不觉得过去人们穿紫色衣服的频率有这个模型以为的那么高。" %}

事实上，我父亲后来还问我能不能把照片里几件物品的颜色调准一点。遗憾的是我没有继续深究这个需求，一时也不太清楚该怎么精准修改。不过正如一位网友所说，就算颜色并不完全准确，它们依然让画面鲜活了起来。

<div class="divider"></div>

## 伦理考量

清楚了这些局限之后，我们就能更好地思考 AI 上色背后的伦理影响。这也是那场讨论中让我印象深刻的第二个方面。一开始做这个项目时，我压根没想过伦理问题，但收到的一些反馈促使我认真反思，对此我很感激。

最核心的伦理考量在于「真实性」。就像围绕深度伪造（Deepfake）会混淆真假的争议一样，人工上色也可能改变我们对历史的感知。AI 会对过去世界的色彩做出自己的选择，而这些选择未必符合史实。举个例子，如果我们保存并传播 AI 生成的「白色金门大桥」，观众所体验到的历史画面就是失实的。当然，黑白版本本身也不是当时真实世界的样子。也许真正的症结在于：看黑白照片时，观众心里很清楚过去并不是黑白的；但看彩色照片时，观众很容易误以为历史原本就是这个模样。

有些人甚至认为这种后期修饰是在篡改历史，而且有时候情况确实如此。看看下面这个近期的例子：

> 柬埔寨要求美国媒体机构 Vice 撤回一篇刊登了红色高棉遇难者新上色照片的文章，称这些照片是对逝者的亵渎，因为部分遇难者的脸上被篡改加上了笑容。

<p class="caption" style="margin-top:-25px;"><a href="https://www.aljazeera.com/news/2021/4/11/cambodia-condemns-vice-for-altered-khmer-rouge-images">来源</a></p>

这项抗议完全站得住脚。看起来模型出现了过拟合，训练集里大概率充斥着面带微笑的人脸，因此它硬生生把遇难者的面容改成了更接近训练数据的样子——加上了笑容。这是一个非常典型的反面教材，说明草率使用 AI 会带来怎样的陷阱。

[MyHeritage](https://www.myheritage.com/incolor) 使用的也是我用到的同款 DeOldify 模型，他们采取了一种折中做法：给所有经过上色处理的照片打上水印。我觉得他们的理由很有说服力：

> 我们在上色照片的左下角加上了一个特殊的浮雕调色板图标，以此将后期上色的照片与原始彩色照片区分开来。尽管效果高度逼真，但上色照片的颜色是由自动算法模拟生成的，未必与原始场景中的真实色彩一致。所有上色照片都会带有这个调色板图标，以便用户将其与真实色彩的照片区分开。我们希望这一负责任的做法能被其他使用照片上色技术的机构采纳。至于仅经过色彩修复的照片则不会带有该图标，因为它们的色彩本身是真实的。

就我家而言，家人们都知道这些照片是我用 AI 后期上色的，也看得出有些颜色并不完全准确。但即便色彩有偏差，照片里的人物与场景依然重新焕发了生机。这让我想起高中时在养老院做志愿者的经历：当时我用 Google 街景把一位老人带回了他 50 年未曾回去过的德累斯顿童年故居；而这一次，我用 AI 把全家人瞬间带回了数十年前的美好时光。技术终究是一种工具，我很庆幸自己生活在这样一个能让此类「魔法」成为现实的时代。
