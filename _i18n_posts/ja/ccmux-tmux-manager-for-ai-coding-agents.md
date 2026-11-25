---
layout: post
lang_code: ja
locale: ja_JP
ref: ccmux-tmux-manager-for-ai-coding-agents
date: 2026-06-05 00:00:00 -0700
last_modified_at: 2026-11-25 00:00
permalink: /ja/ccmux-tmux-manager-for-ai-coding-agents
title: "ccmux：複数デバイス間で AI コーディングエージェントを管理する"
imgpath: /assets/img/ccmux
previewurl: /preview.png
description: "tmux、Tailscale、Mosh、Go 製ターミナルダッシュボード、ネイティブ iOS アプリを組み合わせて複数マシン上の AI コーディングエージェントを管理する ccmux を友人たちと作った話。"
image: /assets/img/ccmux/preview.png
image_width: 1200
image_height: 630
image_alt: "コーディングエージェントのセッションを管理する ccmux ダッシュボード"
mathjax: false
tags: [ai-tools, systems]
---

{% include description.html content="複数マシンにまたがるコーディングエージェントを把握し、スマホからも操作できるように友人たちと作った tmux セッションマネージャー。" %}

私は普段、Mac mini とノート PC にまたがって10個ほどのコーディングエージェントを同時に動かしています。tmux でセッションをバックグラウンドに維持すること自体は難しくないのですが、本当に煩わしいのはそれらすべてを把握しておくことです――どのマシンでタスクを始めたか思い出し、Claude がまだ作業中なのかそれとも1時間前から yes/no プロンプトで止まったままなのかを SSH で繋いで確認し、さらにデスクを離れている間は返信するまともな手段もない、という具合です。

私が欲しかったのは、Mac mini でセッションを立ち上げて席を離れ、エージェントが入力を求めたらスマホに通知が届き、その場で返事をして、あとからノート PC で同じセッションを引き継げる――その間に大量の ssh コマンドや tmux コマンドを打ち込まずに済む仕組みでした。

そこで Daniel Mandragona と Mike Choi と一緒に、AI コーディングエージェント向けのクロスデバイス tmux セッションマネージャー [ccmux](https://ccmux.ai/) を作りました。以下では、その仕組みや各コンポーネントの連携、そしてモバイル向けに構築した内容を紹介します。

<div style="text-align:center">
  <video autoplay loop muted playsinline disableRemotePlayback preload="metadata" width="1280" height="640" poster="/assets/video/ccmux/hero-poster.webp" style="width:100%;height:auto">
    <source src="/assets/video/ccmux/hero.mp4" type="video/mp4">
    複数プロジェクトのコーディングエージェントセッションを表示する ccmux のターミナル画面
  </video>
</div>
{% include caption.html content="ccmux の簡単なツアー。4つのプロジェクトにわたって5つのエージェントセッションが動いています。" %}

## ダッシュボード

`ccmux` を開くと、手元の全マシン上で動いているコーディングエージェントのセッションが一覧表示され、各エージェントの状態――アクティブ（出力生成中）、アイドル、入力待ち――ごとに色分けされます。右側にはネットワーク上の他マシンを表示する Devices パネルと、Claude の5時間クォータを追跡して上限が近づいたときに一目でわかる使用量パネルがあります。

<div style="text-align:center">
  <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1280" height="640" poster="/assets/video/ccmux/dashboard-poster.webp" style="width:100%;height:auto">
    <source src="/assets/video/ccmux/dashboard.mp4" type="video/mp4">
    セッション状態、接続デバイス、Claude 使用量を表示する ccmux ダッシュボード
  </video>
</div>
{% include caption.html content="ダッシュボード。セッション行は状態ごとに色分けされ、右側には接続デバイスと Claude の使用量が表示されます。" %}

任意のセッションに入るには、選択して `Enter` を押すだけでエージェントの tmux セッションに直接アタッチできます。用が済んだら `Ctrl-b d` でデタッチすればダッシュボードに戻り、エージェントは開始したマシン上でそのまま動き続けます。

<div style="text-align:center">
  <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1280" height="640" poster="/assets/video/ccmux/attach-detach-poster.webp" style="width:100%;height:auto">
    <source src="/assets/video/ccmux/attach-detach.mp4" type="video/mp4">
    tmux セッションにアタッチして ccmux ダッシュボードへ戻る様子
  </video>
</div>
{% include caption.html content="Enter でセッションにアタッチし、Ctrl-b d でダッシュボードへ戻る操作。" %}

<div class="divider"></div>

## 内部の仕組み

私たちは独自のラッパーの中にセッションを閉じ込めるのではなく、あくまで tmux 自体を唯一の信頼できる情報源（source of truth）として保ちたいと考えました。もし将来 ccmux を使うのをやめても、動いているエージェントはすべて普通の tmux セッションのままなので、手作業でそのままアタッチできます。

各マシンでは2つの Go バイナリが動作します。

- `ccmux` は操作用のターミナル UI で、[Charm](https://charm.sh/) の Bubble Tea スタックで構築しています。
- `ccmuxd` は数秒おきに tmux をポーリングして各セッションの状態を判定し、ローカルの Unix ソケットおよびオプションの HTTP API で公開する軽量なバックグラウンドデーモンです。

状態判定は特に工夫が要る部分の一つです。エージェントが出力をストリーミングし続けている間、デーモンはそのセッションをアクティブと判定します。入力プロンプトが表示されてペインが数秒間静かになると、デーモンはセッションの状態を `needs_input` に切り替えます。またセッションがアクティブな間、`ccmuxd` は macOS では `caffeinate` ロック（Linux では `systemd-inhibit`）を保持し、長時間のタスク途中で Mac mini やノート PC がスリープしてしまわないようにします――ノート PC 向けにはバッテリー下限設定もあり、放置したマシンが完全に電池切れになるのも防ぎます。

複数マシンの自動検出には [Tailscale](https://tailscale.com/) を使いました。更新のたびに ccmux が `tailscale status --json` を実行して到達可能なマシンのポート `7474`（`/v1/health`）をプローブし、応答したデーモンをすべてダッシュボードへ自動統合します。そのためホスト一覧を手動管理する必要も、インターネットにポートを公開する必要もありません。暗号化とデバイス認証はすでに Tailscale の WireGuard レイヤーが担っているため、デーモンは tailnet IP 上で平文の HTTP を話しつつ、ブラウザ由来の `Origin` や `Sec-Fetch-*` ヘッダーを含むリクエストを拒否することで、見知らぬウェブページから勝手に通信されないようにしています。

リモートセッション上で `Enter` を押すと、ccmux は別レイヤー経由でターミナルをプロキシするのではなく、エージェントが動いているホストへ SSH または Mosh 経由で本物の `tmux attach` を直接実行します。デフォルトは Claude Code ですが、プロジェクトごとのエージェント設定を保存し各ツールの起動・再開フラグを使い分けることで、Codex、Cursor、Antigravity、Gemini CLI などにも対応しています。

<div class="divider"></div>

## スマホから使う

スマホからエージェントを操作できるようにすることこそ、これを作りたかった最大の理由です。スマホで素の SSH を使うと、Wi-Fi とモバイル回線の切り替えや画面ロック、電波の届かない場所への移動のたびに接続がブツブツ切れてしまいます。その点 [Mosh](https://mosh.org/) はローミングやスリープに強く、電波が戻ればそのままセッションを再開してくれるのでずっと快適です。

ccmux は狭いターミナル（120桁未満）を検出すると、同じインターフェースがスマホ画面でも使えるよう、ダッシュボードを自動的に1列のスクロール表示へと折りたたみます。

<div style="text-align:center">
  <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="430" height="900" poster="/assets/video/ccmux/phone-poster.webp" style="max-height:420px;width:auto">
    <source src="/assets/video/ccmux/phone.mp4" type="video/mp4">
    幅の狭いモバイルターミナル上の ccmux ダッシュボード
  </video>
</div>
{% include caption.html content="Mosh 越しにスマホ幅のレイアウトへ自動で折りたたまれた TUI。" %}

通知機能の実装は思いのほかシンプルに収まりました。セッションが `needs_input` に遷移するたび、デーモンが標準のターミナルベル（`BEL`）を鳴らします。ベルを監視している iOS ターミナルアプリは、途中にクラウドリレーを挟むことなくそのままプッシュ通知に変換してくれます。さらに iOS 向け Mosh クライアントの [Moshi](https://getmoshi.app/) では、`moshi-hook` を Claude Code のフックと連携させることで、「承認待ち」「タスク完了」といったカテゴリ別の通知を送り、タップ一つで該当セッションへ直接飛び込むこともできます。

![iPhone 上の Moshi ターミナルアプリで動く ccmux]({{ "/moshi.webp" | prepend: page.imgpath }}){: width="610" height="1323" loading="lazy" decoding="async" style="max-height:520px;width:auto"}
{% include caption.html content="iPhone の Moshi 内で動作している ccmux。" %}

とはいえ、ちょっとセッション一覧を眺めたいときや長めのプロンプトを書きたいとき、スマホ画面でターミナル UI を操作するのはやはり窮屈に感じることがあります。そこで、Tailscale 経由で `ccmuxd` と直接通信するネイティブ iOS アプリも作りました。ペアリングは Mac で `ccmux pair` を実行し、ターミナルに表示された QR コードをスキャンするだけ。あとはアプリが SSE でライブのセッション状態を受信し、SwiftTerm で描画する WebSocket PTY ブリッジ経由でインタラクティブな tmux ペインにアタッチします。

<div style="text-align:center">
<img src="{{ "/ios-dashboard.webp" | prepend: page.imgpath }}" alt="コーディングエージェントのセッション一覧を表示する ccmux iOS アプリ" width="1206" height="2622" loading="lazy" decoding="async" style="display:inline-block;margin:0 6px;max-height:460px;width:auto" //>
<img src="{{ "/ios-terminal.webp" | prepend: page.imgpath }}" alt="ccmux iOS アプリ内のインタラクティブな tmux ターミナル" width="1206" height="2622" loading="lazy" decoding="async" style="display:inline-block;margin:0 6px;max-height:460px;width:auto" //>
</div>
{% include caption.html content="ネイティブ iOS アプリ：左がセッションダッシュボード、右がライブターミナル。" %}

iOS アプリを作ってすぐ突き当たった課題の一つが、ターミナル操作とプロンプト執筆では真逆のキーボード挙動が求められるという点でした。ターミナル操作には自動修正に邪魔されない生のキー入力、矢印キー、素早いバックスペースが必要ですが、逆に自動修正もテキスト選択もない環境でエージェント宛てに数段落の指示を書くのは苦行です。そこでターミナル画面の中に、Raw モード（すべてのキー入力がそのまま PTY に届く）と Chat モード（プロンプト作成用の iMessage 風テキスト入力欄）を切り替えられるトグルを設けました。

<div style="text-align:center">
  <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="400" height="870" poster="/assets/video/ccmux/ios-mode-toggle-poster.webp" style="max-height:460px;width:auto">
    <source src="/assets/video/ccmux/ios-mode-toggle.mp4" type="video/mp4">
    ccmux iOS アプリで Raw 入力モードと Chat 入力モードを切り替える様子
  </video>
</div>
{% include caption.html content="生のターミナル入力（Raw モード）とプロンプト作成用（Chat モード）の切り替え。" %}

<div class="divider"></div>

## おわりに

私は何ヶ月も毎日 ccmux を使ってきましたし、他にも何人か使ってくれる人が現れました。同じ数ヶ月の間に、資金調達をして専任チームを抱えるプロジェクトを含め、コーディングエージェントを管理するためのツールが数多く登場しました。3人のサイドプロジェクトとしてプロダクト競争を追い続けるのはあまり現実的ではないと考え、その方向で推し進めるのは一区切りにすることにしました。それでも今でもたまにリポジトリをいじっていますし、自分たちが作ったものを記録として残しておきたくてこの記事を書きました。

サイトは今も [ccmux.ai](https://ccmux.ai/) で公開されており、ソースコードも FSL-1.1-MIT ライセンスで [GitHub](https://github.com/skzv/ccmux) に置いています。macOS や Linux で試してみたい方は、以下のコマンドでインストールしてセットアップウィザードを実行できます。

```bash
curl -fsSL https://raw.githubusercontent.com/skzv/ccmux/main/scripts/install.sh | sh
ccmux setup
```

Tailscale 経由での複数マシン連携やモバイルアクセスの設定方法は、[セットアップドキュメント](https://ccmux.ai/docs/)にまとめてあります。
