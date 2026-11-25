---
layout: post
lang_code: ko
locale: ko_KR
ref: ccmux-tmux-manager-for-ai-coding-agents
date: 2026-06-05 00:00:00 -0700
last_modified_at: 2026-11-25 00:00
permalink: /ko/ccmux-tmux-manager-for-ai-coding-agents
title: "ccmux: 여러 기기에서 AI 코딩 에이전트 관리하기"
imgpath: /assets/img/ccmux
previewurl: /preview.png
description: "tmux, Tailscale, Mosh, Go 터미널 대시보드, 네이티브 iOS 앱을 결합해 여러 머신에 걸친 AI 코딩 에이전트를 관리하는 ccmux를 친구들과 함께 만든 이야기를 소개합니다."
image: /assets/img/ccmux/preview.png
image_width: 1200
image_height: 630
image_alt: "코딩 에이전트 세션을 관리하는 ccmux 대시보드"
mathjax: false
tags: [ai-tools, systems]
---

{% include description.html content="여러 머신에서 실행 중인 코딩 에이전트를 한눈에 관리하고 휴대폰에서도 사용할 수 있도록 친구들과 만든 tmux 세션 매니저입니다." %}

평소 저는 Mac mini와 노트북에 걸쳐 열 개 안팎의 코딩 에이전트를 동시에 돌려 두고 작업합니다. tmux로 백그라운드 세션을 유지하는 것 자체는 어렵지 않지만, 진짜 번거로운 건 이 세션들을 전부 관리하는 일입니다. 어떤 작업을 어느 머신에서 띄웠는지 기억해야 하고, Claude가 아직 작업 중인지 아니면 한 시간째 yes/no 확인 프롬프트에서 멈춰 있는지 보려고 매번 ssh로 들어가야 했으며, 자리를 비웠을 때 응답할 마땅한 방법도 없었습니다.

제가 원했던 흐름은 단순했습니다. Mac mini에서 세션을 띄워 놓고 자리를 비운 뒤, 에이전트가 입력을 필요로 하면 휴대폰으로 알림을 받아 그 자리에서 답장하고, 나중에 노트북으로 돌아와서 중간에 복잡한 ssh나 tmux 명령어를 일일이 칠 필요 없이 똑같은 세션을 이어서 보는 것이었습니다.

그래서 Daniel Mandragona, Mike Choi와 함께 AI 코딩 에이전트를 위한 크로스 디바이스 tmux 세션 매니저인 [ccmux](https://ccmux.ai/)를 만들었습니다. 아래에서는 ccmux가 어떻게 동작하고, 각 구성 요소가 어떻게 맞물리며, 모바일 환경을 위해 무엇을 만들었는지 살펴보겠습니다.

<div style="text-align:center">
  <video autoplay loop muted playsinline disableRemotePlayback preload="metadata" width="1280" height="640" poster="/assets/video/ccmux/hero-poster.webp" style="width:100%;height:auto">
    <source src="/assets/video/ccmux/hero.mp4" type="video/mp4">
    여러 프로젝트에 걸친 코딩 에이전트 세션을 보여 주는 ccmux 터미널 인터페이스
  </video>
</div>
{% include caption.html content="네 개의 프로젝트에서 다섯 개의 에이전트 세션이 돌아가고 있는 ccmux 둘러보기." %}

## 대시보드

`ccmux`를 열면 여러 머신에서 실행 중인 모든 코딩 에이전트 세션이 하나의 목록으로 나타납니다. 각 에이전트의 상태 — 활성(출력 생성 중), 유휴(idle), 입력 대기(waiting for input) — 에 따라 색상으로 구분됩니다. 오른쪽에는 네트워크에 연결된 다른 머신들을 보여 주는 Devices 패널과 함께, Claude의 5시간 할당량(quota)을 추적해 한도에 얼마나 가까워졌는지 확인할 수 있는 사용량 패널이 자리 잡고 있습니다.

<div style="text-align:center">
  <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1280" height="640" poster="/assets/video/ccmux/dashboard-poster.webp" style="width:100%;height:auto">
    <source src="/assets/video/ccmux/dashboard.mp4" type="video/mp4">
    세션 상태, 연결된 기기, Claude 사용량을 표시하는 ccmux 대시보드
  </video>
</div>
{% include caption.html content="대시보드 화면. 세션 행이 상태별로 색상 구분되어 있으며, 오른쪽에 연결된 기기와 Claude 사용량이 표시됩니다." %}

원하는 세션으로 들어가려면 해당 항목을 선택하고 `Enter`를 누르기만 하면 됩니다. 곧바로 그 에이전트의 tmux 세션에 연결(attach)됩니다. 작업을 마치고 `Ctrl-b d`를 눌러 빠져나오면(detach) 대시보드로 돌아오며, 에이전트는 원래 실행되던 머신에서 계속 작업을 이어 갑니다.

<div style="text-align:center">
  <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1280" height="640" poster="/assets/video/ccmux/attach-detach-poster.webp" style="width:100%;height:auto">
    <source src="/assets/video/ccmux/attach-detach.mp4" type="video/mp4">
    tmux 세션에 접속했다가 ccmux 대시보드로 돌아오는 모습
  </video>
</div>
{% include caption.html content="Enter를 눌러 세션에 연결한 뒤, Ctrl-b d로 빠져나와 대시보드로 복귀하는 모습." %}

<div class="divider"></div>

## 내부 동작 방식

저희는 세션을 독자적인 래퍼(wrapper) 안에 가두는 대신, tmux 자체가 진실의 원천(source of truth)으로 남기를 원했습니다. 설령 나중에 ccmux 사용을 그만두더라도, 실행 중인 모든 에이전트는 여전히 수동으로 바로 붙을 수 있는 일반 tmux 세션 그대로입니다.

각 머신에서는 두 개의 Go 바이너리가 실행됩니다.

- `ccmux`는 사용자가 직접 조작하는 터미널 UI로, [Charm](https://charm.sh/)의 Bubble Tea 스택으로 구축했습니다.
- `ccmuxd`는 몇 초마다 tmux를 폴링(poll)해 각 세션의 상태를 파악하고, 그 상태를 로컬 Unix 소켓과 선택적 HTTP API로 노출하는 가벼운 백그라운드 데몬입니다.

상태 감지는 꽤 까다로운 부분 중 하나였습니다. 에이전트가 활발히 출력을 스트리밍하는 동안 데몬은 세션을 활성 상태로 표시합니다. 그러다 입력 프롬프트가 나타나고 몇 초간 패인(pane)에 변화가 없으면 세션을 `needs_input` 상태로 전환합니다. 또한 활성 세션이 하나라도 있으면 `ccmuxd`가 macOS에서는 `caffeinate` 락을(Linux에서는 `systemd-inhibit`을) 잡아 두어, 긴 작업 도중에 Mac mini나 노트북이 절전 모드로 들어가지 않도록 합니다. 노트북을 깜빡 잊었을 때 배터리가 완전히 방전되지 않도록 배터리 하한선 차단 옵션도 넣었습니다.

여러 머신을 자동으로 찾기 위해 [Tailscale](https://tailscale.com/)을 사용했습니다. 새로고침할 때마다 ccmux가 `tailscale status --json`을 실행해 도달 가능한 머신의 `7474` 포트(`/v1/health`)를 탐색하고, 응답하는 데몬을 대시보드에 자동으로 합쳐 줍니다. 덕분에 호스트 목록을 수동으로 관리하거나 공용 인터넷에 포트를 열 필요가 없습니다. Tailscale의 WireGuard 계층이 이미 암호화와 기기 인증을 처리해 주므로 데몬은 tailnet IP 위에서 일반 HTTP로 통신하며, 임의의 웹페이지가 접근하지 못하도록 브라우저의 `Origin`이나 `Sec-Fetch-*` 헤더가 붙은 요청은 거부합니다.

원격 세션에서 `Enter`를 누르면 ccmux는 터미널을 별도의 계층으로 프록시하지 않고, 에이전트가 실행 중인 호스트에 SSH 또는 Mosh를 통해 직접 진짜 `tmux attach`를 실행합니다. 기본 에이전트는 Claude Code이지만, 프로젝트별로 사용할 에이전트를 저장해 두고 각 도구의 실행 및 재개(resume) 플래그를 활용하는 방식으로 Codex, Cursor, Antigravity, Gemini CLI 등도 지원합니다.

<div class="divider"></div>

## 휴대폰에서 사용하기

휴대폰에서 에이전트를 쓰는 것이 제가 이 프로젝트를 만들고 싶었던 가장 큰 이유였습니다. 휴대폰에서 일반 SSH를 쓸 때의 문제는 Wi-Fi에서 셀룰러로 전환하거나, 화면을 잠그거나, 신호가 약한 구간에 들어갈 때마다 연결이 툭툭 끊긴다는 점입니다. [Mosh](https://mosh.org/)는 네트워크 전환과 절전 상태를 훨씬 잘 견뎌 내며, 신호가 다시 잡히면 세션을 바로 이어서 복구해 줍니다.

ccmux는 터미널 너비가 좁아지면(120컬럼 미만) 대시보드를 스크롤 가능한 단일 컬럼 레이아웃으로 자동 축소해, 휴대폰 화면에서도 같은 인터페이스를 무리 없이 쓸 수 있게 합니다.

<div style="text-align:center">
  <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="430" height="900" poster="/assets/video/ccmux/phone-poster.webp" style="max-height:420px;width:auto">
    <source src="/assets/video/ccmux/phone.mp4" type="video/mp4">
    좁은 모바일 터미널에서 표시되는 ccmux 대시보드
  </video>
</div>
{% include caption.html content="Mosh 위에서 휴대폰 화면 폭에 맞게 축소된 TUI 레이아웃." %}

알림 기능은 의외로 단순하게 구현할 수 있었습니다. 세션이 `needs_input` 상태로 바뀔 때마다 데몬이 표준 터미널 벨(`BEL`)을 울립니다. 터미널 벨을 감지하는 iOS 터미널 앱은 중간에 클라우드 중계 서버 없이도 이를 즉시 푸시 알림으로 바꿔 줍니다. iOS용 Mosh 클라이언트인 [Moshi](https://getmoshi.app/)에서는 `moshi-hook`을 Claude Code의 훅(hooks)과 연동해 알림을 유형별(승인 필요 vs. 작업 완료 등)로 분류해서 보내고, 알림을 탭하면 바로 해당 세션으로 이동하게 할 수도 있습니다.

![iPhone의 Moshi 터미널 앱에서 실행 중인 ccmux]({{ "/moshi.webp" | prepend: page.imgpath }}){: width="610" height="1323" loading="lazy" decoding="async" style="max-height:520px;width:auto"}
{% include caption.html content="iPhone의 Moshi 안에서 실행 중인 ccmux." %}

그래도 휴대폰 화면에서 터미널 UI를 조작하는 건 답답할 때가 있습니다. 특히 세션 목록을 슬쩍 훑어보거나 긴 프롬프트를 작성할 때는 더욱 그렇죠. 그래서 Tailscale을 통해 `ccmuxd`와 직접 통신하는 네이티브 iOS 앱도 만들었습니다. Mac에서 `ccmux pair`를 실행하고 터미널에 뜬 QR 코드를 스캔하면 휴대폰과 페어링됩니다. 그다음부터는 앱이 SSE로 실시간 세션 상태를 스트리밍하고, SwiftTerm으로 렌더링되는 WebSocket PTY 브리지를 통해 인터랙티브 tmux 패인에 연결합니다.

<div style="text-align:center">
<img src="{{ "/ios-dashboard.webp" | prepend: page.imgpath }}" alt="코딩 에이전트 세션 목록을 보여 주는 ccmux iOS 앱" width="1206" height="2622" loading="lazy" decoding="async" style="display:inline-block;margin:0 6px;max-height:460px;width:auto" //>
<img src="{{ "/ios-terminal.webp" | prepend: page.imgpath }}" alt="ccmux iOS 앱의 인터랙티브 tmux 터미널" width="1206" height="2622" loading="lazy" decoding="async" style="display:inline-block;margin:0 6px;max-height:460px;width:auto" //>
</div>
{% include caption.html content="네이티브 iOS 앱: 왼쪽은 세션 대시보드, 오른쪽은 실시간 터미널." %}

iOS에서 금방 부딪힌 문제 하나는, 터미널 조작과 프롬프트 작성이 정반대의 키보드 경험을 요구한다는 점이었습니다. 터미널을 다룰 때는 자동 수정이 방해하지 않는 원시 키 입력(raw keystrokes), 방향키, 빠른 백스페이스가 필요하지만, 에이전트에게 긴 지시사항을 쓰는데 자동 수정도 텍스트 선택도 안 되면 꽤 고통스럽습니다. 그래서 터미널 화면에 모든 키 입력을 PTY로 그대로 보내는 Raw 모드와, 일반 iMessage처럼 프롬프트를 편하게 입력할 수 있는 Chat 모드를 바로 전환할 수 있는 토글을 넣었습니다.

<div style="text-align:center">
  <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="400" height="870" poster="/assets/video/ccmux/ios-mode-toggle-poster.webp" style="max-height:460px;width:auto">
    <source src="/assets/video/ccmux/ios-mode-toggle.mp4" type="video/mp4">
    ccmux iOS 앱에서 Raw 입력 모드와 Chat 입력 모드를 전환하는 모습
  </video>
</div>
{% include caption.html content="원시 터미널 입력용 Raw 모드와 프롬프트 작성용 Chat 모드 전환." %}

<div class="divider"></div>

## 마무리하며

저는 몇 달 동안 매일 ccmux를 사용했고, 다른 사용자 몇 분도 쓰기 시작했습니다. 그런데 그 몇 달 사이에 투자를 받아 전담 팀이 붙은 제품들을 포함해 수많은 코딩 에이전트 관리 도구들이 쏟아져 나왔습니다. 세 명이 하는 사이드 프로젝트로 그들과 제품 경쟁을 이어 가는 것은 큰 의미가 없다고 판단해, 제품화 방향으로는 더 밀지 않기로 결정했습니다. 그래도 가끔 저장소를 만지작거리곤 하며, 우리가 만든 것을 기록으로 남기고 싶어 이 글을 작성했습니다.

모든 정보는 여전히 [ccmux.ai](https://ccmux.ai/)에 올라와 있고, 소스 코드는 FSL-1.1-MIT 라이선스로 [GitHub](https://github.com/skzv/ccmux)에 공개되어 있습니다. macOS나 Linux에서 직접 사용해 보고 싶다면 아래 명령으로 설치하고 설정 마법사를 실행해 보세요.

```bash
curl -fsSL https://raw.githubusercontent.com/skzv/ccmux/main/scripts/install.sh | sh
ccmux setup
```

Tailscale을 통한 다중 머신 연결과 모바일 접근 설정 방법은 [설정 문서](https://ccmux.ai/docs/)에서 자세히 확인하실 수 있습니다.
