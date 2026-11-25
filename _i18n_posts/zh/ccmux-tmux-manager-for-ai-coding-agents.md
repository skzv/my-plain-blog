---
layout: post
lang_code: zh
locale: zh_CN
ref: ccmux-tmux-manager-for-ai-coding-agents
date: 2026-06-05 00:00:00 -0700
last_modified_at: 2026-11-25 00:00
permalink: /zh/ccmux-tmux-manager-for-ai-coding-agents
title: "ccmux：跨设备管理 AI 编程智能体"
imgpath: /assets/img/ccmux
previewurl: /preview.png
description: "与朋友一起打造 ccmux 的实践记录：结合 tmux、Tailscale、Mosh、Go 终端仪表盘与原生 iOS 应用，跨设备无缝管理 AI 编程智能体。"
image: /assets/img/ccmux/preview.png
image_width: 1200
image_height: 630
image_alt: "用于管理编程智能体会话的 ccmux 仪表盘"
mathjax: false
tags: [ai-tools, systems]
---

{% include description.html content="我和朋友一起打造的一款 tmux 会话管理工具，用来跨设备追踪 AI 编程智能体，还能直接在手机上操作它们。" %}

我平时经常在 Mac mini 和笔记本电脑上同时跑十个左右的 AI 编程智能体。用 tmux 让这些会话在后台持续运行本身并不难，真正让人头疼的是管理它们——你得记清每个任务当初是在哪台机器上启动的，还得不停 SSH 上去查看 Claude 到底是在努力干活，还是早就在一个 yes/no 确认提示上干等了一小时；更别提离开电脑桌后，根本没什么顺手的办法去回复它。

我真正想要的体验是：在 Mac mini 上启动一个会话，然后直接离开；等智能体需要人工输入时，手机收到推送通知，顺手在手机上回复；过一会儿回到笔记本前，无需敲一长串 ssh 和 tmux 命令，就能无缝接管同一个会话。

于是，我和 Daniel Mandragona、Mike Choi 一起开发了 [ccmux](https://ccmux.ai/)——一款面向 AI 编程智能体的跨设备 tmux 会话管理器。下面我来拆解它的工作原理、各个组件的协作方式，以及我们为移动端打造的使用体验。

<div style="text-align:center">
  <video autoplay loop muted playsinline disableRemotePlayback preload="metadata" width="1280" height="640" poster="/assets/video/ccmux/hero-poster.webp" style="width:100%;height:auto">
    <source src="/assets/video/ccmux/hero.mp4" type="video/mp4">
    展示跨项目编程智能体会话的 ccmux 终端界面
  </video>
</div>
{% include caption.html content="ccmux 快速一览：四个项目中同时运行着五个智能体会话。" %}

## 仪表盘

打开 `ccmux` 后，你会看到一张统一列表，汇集了你所有机器上正在运行的全部编程智能体会话，并根据各自状态用不同颜色标出——活跃中（正在生成输出）、空闲，或是等待你的输入。界面右侧是一个 Devices 面板，列出局域网/组网中的其他设备，下方还有一个用量面板，用于追踪 Claude 的 5 小时配额，让你随时看清自己离额度上限还有多远。

<div style="text-align:center">
  <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1280" height="640" poster="/assets/video/ccmux/dashboard-poster.webp" style="width:100%;height:auto">
    <source src="/assets/video/ccmux/dashboard.mp4" type="video/mp4">
    显示会话状态、已连接设备与 Claude 用量的 ccmux 仪表盘
  </video>
</div>
{% include caption.html content="主仪表盘。会话列表按状态着色，右侧显示已连接的设备与 Claude 配额用量。" %}

想进入某个会话，只需选中它并按下 `Enter`，就会直接附着（attach）到该智能体的 tmux 会话中。处理完毕后，按 `Ctrl-b d` 即可脱离会话并回到仪表盘，而智能体则继续留在启动它的那台机器上运行。

<div style="text-align:center">
  <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1280" height="640" poster="/assets/video/ccmux/attach-detach-poster.webp" style="width:100%;height:auto">
    <source src="/assets/video/ccmux/attach-detach.mp4" type="video/mp4">
    附着到 tmux 会话并返回 ccmux 仪表盘
  </video>
</div>
{% include caption.html content="按 Enter 附着到会话，再按 Ctrl-b d 脱离并返回仪表盘。" %}

<div class="divider"></div>

## 底层工作原理

我们希望始终把 tmux 本身作为真正的「单一事实来源」（Source of Truth），而不是把会话困在某个自研封装层里。就算你哪天不再使用 ccmux，每一个正在运行的智能体依然是原汁原味的普通 tmux 会话，随时可以手动 attach 上去。

每台机器上都运行着两个 Go 二进制程序：

- `ccmux` 是你直接交互的终端界面（TUI），基于 [Charm](https://charm.sh/) 的 Bubble Tea 技术栈构建。
- `ccmuxd` 是一个轻量级后台守护进程，每隔几秒轮询一次 tmux，判断各个会话当前所处的状态，并通过本地 Unix Socket 以及可选的 HTTP API 对外暴露这些状态。

状态检测是整套系统里比较棘手的一环。当智能体正在持续流式输出内容时，守护进程会将其标记为活跃；一旦出现等待输入的提示符且终端窗格静默几秒，守护进程就会把会话切换为 `needs_input` 状态。只要还有活跃会话，`ccmuxd` 还会在 macOS 上持有一个 `caffeinate` 锁（在 Linux 上则是 `systemd-inhibit`），防止 Mac mini 或笔记本在跑长任务中途进入休眠——对于笔记本还提供了低电量阈值保护，避免忘了插电的机器把电池彻底耗干。

对于多机自动发现，我们选用了 [Tailscale](https://tailscale.com/)。每次刷新时，ccmux 会执行 `tailscale status --json`，探测可达机器的 `7474` 端口（`/v1/health`），并把所有响应的守护进程自动合并进仪表盘。这样一来，你既不用手动维护主机列表，也不必向公网暴露任何端口。由于 Tailscale 的 WireGuard 层已经搞定了传输加密与设备身份认证，守护进程只需在 tailnet IP 上使用明文 HTTP 通信，同时拒绝任何携带浏览器 `Origin` 或 `Sec-Fetch-*` 请求头的访问，防止陌生网页跨站调用本地接口。

当你对某个远程会话按下 `Enter` 时，ccmux 会通过 SSH 或 Mosh 直接在目标主机上执行真正的 `tmux attach`，而不是再套一层终端代理。它默认支持 Claude Code，同时也通过按项目保存智能体偏好并调用各自工具的启动与恢复参数，兼容 Codex、Cursor、Antigravity、Gemini CLI 等多种工具。

<div class="divider"></div>

## 在手机上使用

能在手机上操控智能体，正是我最初想做这个工具的最大动机。在手机上直接用普通 SSH 有个大麻烦：连接动不动就断——只要你从 Wi-Fi 切到蜂窝网络、锁屏，或者走进信号死角，会话就掉线了。[Mosh](https://mosh.org/) 在这方面好得多，它能扛住网络漫游和设备休眠，一旦信号恢复，会话瞬间就能无缝续上。

当 ccmux 检测到窄屏终端（宽度不足 120 列）时，会自动把仪表盘折叠成单列可滚动布局，让同一套终端界面在手机屏幕上也能清晰操作：

<div style="text-align:center">
  <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="430" height="900" poster="/assets/video/ccmux/phone-poster.webp" style="max-height:420px;width:auto">
    <source src="/assets/video/ccmux/phone.mp4" type="video/mp4">
    窄屏移动端终端中的 ccmux 仪表盘
  </video>
</div>
{% include caption.html content="在 Mosh 连接下，TUI 自动折叠为适配手机宽度的布局。" %}

通知功能的实现意外地简洁。每当有会话切换到 `needs_input` 状态时，守护进程就会触发标准的终端响铃字符（`BEL`）。支持监听响铃信号的 iOS 终端应用会直接把它转成一条手机推送通知，中间完全不需要任何云端中转服务器。在 iOS 端的 Mosh 客户端 [Moshi](https://getmoshi.app/) 中，ccmux 还可以将 `moshi-hook` 与 Claude Code 的 hooks 联动起来，发送带分类标签的通知（例如「需要审批」还是「任务完成」），点一下通知就能直达对应会话。

![运行在 iPhone 的 Moshi 终端应用中的 ccmux]({{ "/moshi.webp" | prepend: page.imgpath }}){: width="610" height="1323" loading="lazy" decoding="async" style="max-height:520px;width:auto"}
{% include caption.html content="在 iPhone 的 Moshi 应用里运行 ccmux。" %}

不过话说回来，在手机小屏上操作终端界面还是略显局促，尤其是你只想快速扫一眼所有会话的状态，或者想输入一段较长的提示词时。因此，我们还专门开发了一款原生 iOS 应用，直接通过 Tailscale 与 `ccmuxd` 通信。只需在 Mac 上运行 `ccmux pair`，用手机扫一下终端里的二维码即可完成配对。之后，App 会通过 SSE 实时接收会话状态流，并借助基于 WebSocket 的 PTY 桥接与 SwiftTerm 渲染器，直接附着到可交互的 tmux 窗格中。

<div style="text-align:center">
<img src="{{ "/ios-dashboard.webp" | prepend: page.imgpath }}" alt="列出编程智能体会话的 ccmux iOS 应用" width="1206" height="2622" loading="lazy" decoding="async" style="display:inline-block;margin:0 6px;max-height:460px;width:auto" //>
<img src="{{ "/ios-terminal.webp" | prepend: page.imgpath }}" alt="ccmux iOS 应用中的交互式 tmux 终端" width="1206" height="2622" loading="lazy" decoding="async" style="display:inline-block;margin:0 6px;max-height:460px;width:auto" //>
</div>
{% include caption.html content="原生 iOS 应用：左侧为会话仪表盘，右侧为实时终端。" %}

在开发 iOS 版时，我们很快碰到了一个棘手的体验矛盾：操作终端与撰写提示词对键盘的需求截然相反。控制终端需要原始按键、方向键和干脆利落的退格键，千万不能让自动纠错来捣乱；而给智能体写一整段需求说明时，没有自动纠错和自由选词简直痛不欲生。于是我们在终端视图里直接做了一个模式切换开关，可以在 Raw 模式（每次按键直通 PTY）和 Chat 模式（类似 iMessage 的常规输入框，方便组织提示词）之间一键切换。

<div style="text-align:center">
  <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="400" height="870" poster="/assets/video/ccmux/ios-mode-toggle-poster.webp" style="max-height:460px;width:auto">
    <source src="/assets/video/ccmux/ios-mode-toggle.mp4" type="video/mp4">
    在 ccmux iOS 应用的 Raw 和 Chat 输入模式之间切换
  </video>
</div>
{% include caption.html content="在用于操控终端的 Raw 模式与用于撰写提示词的 Chat 模式之间自由切换。" %}

<div class="divider"></div>

## 写在最后

我把 ccmux 当作主力工具日用了好几个月，期间也有一小批其他用户开始用它。但就在这几个月里，市面上涌现了大量同类 AI 编程智能体管理工具，其中不乏拿到融资、配备全职团队的项目。作为一个三人业余项目，硬着头皮按商业产品的节奏去追赶其实没什么意义，所以我们决定不再往那个方向推进。不过我偶尔还是会回仓库里折腾两下，也想写下这篇文章，把我们当时做出来的东西好好记录下来。

项目主页目前仍在 [ccmux.ai](https://ccmux.ai/) 上线运行，源代码则以 FSL-1.1-MIT 协议开源在 [GitHub](https://github.com/skzv/ccmux)。如果你想在 macOS 或 Linux 上试试看，可以用下面的命令一键安装并启动配置向导：

```bash
curl -fsSL https://raw.githubusercontent.com/skzv/ccmux/main/scripts/install.sh | sh
ccmux setup
```

[配置文档](https://ccmux.ai/docs/)详细介绍了如何通过 Tailscale 连接多台机器以及配置手机端访问。
