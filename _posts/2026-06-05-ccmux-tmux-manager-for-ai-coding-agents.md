---
title: "ccmux: a cross-device tmux manager for AI coding agents"
updated: 2026-06-05 00:00
imgpath: /assets/img/ccmux
previewurl: /preview.png
---

{% include description.html content="I kept starting Claude Code on one machine and losing track of it. So a couple of friends and I built a way to run all of them from anywhere, including my phone." %}

On a normal day I have three or four coding agents running: Claude Code on the Mac mini at my desk, Codex on the laptop, sometimes a Cursor agent in the background. Each one stays on the machine where I started it. When I leave the desk I have no clean way to check on a session from my phone, or pick it up on the laptop. More than once I've come back hours later to a Claude that sat on a yes/no question the whole time.

tmux keeps the sessions alive when you disconnect, so the sessions were never the problem. What lived only in my head was which machine each one was on, which session it was, whether it was done, and whether it was stuck.

So Daniel Mandragona, Mike Choi, and I built **ccmux**, a tmux session manager for coding agents. It shows every session you have running, on any machine you own, and lets you drop into the one that needs you. No session names to memorize, no `claude --resume <hash>`, no SSH-then-attach.

![ccmux hero tour]({{ "/hero.gif" | prepend: page.imgpath }})
{% include caption.html content="One dashboard, five agent sessions across four projects, color-coded by state. Attach to one, then tour the rest." %}

## The loop

It's 11pm. The session I started this morning on the Mac mini is still going, plugged in, the daemon holding a `caffeinate` lock all day so the machine never slept. My laptop's been shut for hours, but the session was never on it. My phone buzzes: Claude has a question. I tap the notification and I'm attached, same session, same machine, from bed. I answer, hit `Ctrl-b d`, lock the phone. Next morning on the train I open the laptop, type `ccmux`, and the session is right there. Three devices, no commands typed in between.

<div class="divider"></div>

## The dashboard

![ccmux dashboard]({{ "/dashboard.gif" | prepend: page.imgpath }})
{% include caption.html content="Sessions color-coded by state: active, idle, needs your input. The Devices panel lists every other machine on the tailnet. The usage panel tracks Claude's 5-hour quota." %}

Rows are color-coded by what the agent is doing: green generating, yellow idle, red when it has printed a prompt and gone quiet. The Devices panel shows every other machine on my tailnet running ccmux, so my laptop knows about the Mac mini's sessions and vice versa. Since I hit Claude's 5-hour limit often, a panel tracks the quota and per-agent prompt counts. Everything updates live.

## How it works

tmux provides the session persistence, and ccmux is the view over it. We didn't want to reinvent that or lock a session inside ccmux. If ccmux vanished tomorrow, every session would still be a plain tmux session you could attach to by hand.

Two pieces run on every machine:

- **`ccmux`**, the terminal UI you look at. A Go program built on [Charm](https://charm.sh/)'s Bubble Tea.
- **`ccmuxd`**, a background daemon. It polls tmux every couple of seconds, computes each session's state, holds the `caffeinate` lock, and exposes everything over an HTTP API on the tailnet.

The cross-device part uses [Tailscale](https://tailscale.com/). Every machine I own is on my tailnet, so they reach each other directly and encrypted, no port forwarding, no exposed SSH. ccmux reads the other daemons over that network and shows their sessions in one dashboard. When I attach it's a real attach: SSH from the laptop, [Mosh](https://mosh.org/) from the phone, into the actual tmux session on the actual host.

When the daemon detects a session print a prompt and then go quiet for a few seconds, it rings the terminal bell, a single `\a` byte. iOS terminals turn a bell into a push notification, so I get a buzz on my phone with no cloud service, no push token, and no Apple dependency.

![attach and detach]({{ "/attach-detach.gif" | prepend: page.imgpath }})
{% include caption.html content="Press Enter on a row to attach to the agent running inside tmux. Ctrl-b d to drop back to the dashboard." %}

Claude Code is the default and best-supported, but Codex, Cursor, Antigravity, Pi, and Grok all work, and the dashboard tags the others so a `[codex]` row stands out. It runs on macOS, Linux, and Windows under WSL2. Install is one Homebrew line plus a setup step that checks for tmux, Mosh, Tailscale, and the agent CLIs and installs whatever's missing.

```bash
brew install skzv/tap/ccmux
ccmux setup
```

<div class="divider"></div>

## Running it from the phone

Running it from my phone was the feature that started all of this. The TUI collapses to a single scrollable column in a narrow terminal, and every key works the same as on the desktop.

![ccmux on a phone-width terminal]({{ "/phone.gif" | prepend: page.imgpath }}){:height="420px"}
{% include caption.html content="The same TUI, same keys, in a 430-pixel-wide terminal. Attaches over Mosh." %}

A plain SSH session drops the moment your phone switches from wifi to cell, or you lock the screen, or you walk out of range. Mosh survives all of that, so on the phone I can detach on the train and reattach two stops later to the same prompt. Below is ccmux in [Moshi](https://getmoshi.app/), an iOS Mosh client.

![ccmux running in the Moshi app on iPhone]({{ "/moshi.png" | prepend: page.imgpath }}){:height="520px"}
{% include caption.html content="ccmux in a real iPhone terminal, watching a release go out." %}

## A native app

A TUI in a phone terminal works for power users and not much for anyone else, including me at 7am. So we built native apps that talk to the same daemon over the same tailnet, with no cloud in the middle. The iOS one got furthest.

<div style="text-align:center">
<img src="{{ "/ios-dashboard.png" | prepend: page.imgpath }}" alt="ccmux iOS app dashboard" height="460" style="display:inline-block;margin:0 6px" />
<img src="{{ "/ios-terminal.png" | prepend: page.imgpath }}" alt="ccmux iOS app terminal" height="460" style="display:inline-block;margin:0 6px" />
</div>
{% include caption.html content="The iOS app: a live dashboard, and a real interactive terminal attached to the tmux session over a WebSocket bridge." %}

Typing into an agent means switching between two modes: hammering control and arrow keys to drive it, and writing a paragraph of careful instructions. A phone keyboard is built for the second and bad at the first, so there's a toggle. Raw mode pipes every keystroke straight through, no autocorrect, fast backspace. Chat mode swaps in a normal composer for when you're writing a prompt.

![Raw to Chat mode toggle on iOS]({{ "/ios-mode-toggle.gif" | prepend: page.imgpath }}){:height="460px"}
{% include caption.html content="Raw mode for driving the agent, Chat mode for writing to it." %}

You pair a phone by running `ccmux pair` on the Mac, which shows a QR code. Scan it and you're done, no IP addresses to copy around. An Android port was next but never shipped.

## Where it landed

I ran ccmux as my daily driver for the last few months, including to build ccmux itself. The core loop held up across my machines, and it picked up some installs and stars along the way.

Then a wave of agent-management and orchestration systems showed up, some with YC or VC money and dozens of contributors, shipping features by the day. A side project built by three people in our spare time was never going to keep that pace. So Daniel, Mike, and I are calling it and moving on.

ccmux.ai stays up, and so does the source under FSL-1.1-MIT, which means source-available now and plain MIT in two years. If you run more than one coding agent and you've lost one, it's still there, and it still works.

<div class="divider"></div>

Hardly any of this was new. tmux has kept sessions alive since 2007, SSH goes back to the 90s, and Mosh, Tailscale, and the terminal bell were already available. ccmux wired them together for a 2026 problem: many agents writing code across many machines, and wanting a notification when one stops to ask you something.
