---
title: "ccmux: a cross-device tmux manager for AI coding agents"
updated: 2026-06-05 00:00
imgpath: /assets/img/ccmux
previewurl: /preview.png
---

{% include description.html content="I kept starting Claude Code on one machine and losing track of it. So a couple of friends and I built a way to run all of them from anywhere, including my phone." %}

On a normal day I have three or four coding agents running across my machines, each stuck on the one where I started it, with no clean way to check on one from my phone or resume it on the laptop. tmux keeps the sessions alive, so the sessions were never the problem. What lived only in my head was which machine each one was on.

So Daniel Mandragona, Mike Choi, and I built **ccmux**, a cross-device tmux session manager for coding agents. It shows every session running on every machine you own, and lets you drop into the one that needs you from any device.

![ccmux hero tour]({{ "/hero.gif" | prepend: page.imgpath }})
{% include caption.html content="One dashboard, five agent sessions across four projects, color-coded by state. Attach to one, then tour the rest." %}

## The loop

It's 11pm. My phone buzzes: the Mac mini session has a question. I answer from bed and hit `Ctrl-b d`. Next morning on the train I type `ccmux` on the laptop and the session is right there.

<div class="divider"></div>

## The dashboard

![ccmux dashboard]({{ "/dashboard.gif" | prepend: page.imgpath }})
{% include caption.html content="Sessions color-coded by state: active, idle, needs your input. The Devices panel lists every other machine on the tailnet. The usage panel tracks Claude's 5-hour quota." %}

## How it works

tmux provides the session persistence; ccmux sits on top as the view. The cross-device part uses [Tailscale](https://tailscale.com/), so ccmux reads the other machines' daemons directly and attaching is a real attach, SSH from the laptop or Mosh from the phone.

When a session prints a prompt and goes quiet, the daemon rings the terminal bell, and iOS terminals turn that into a push notification, no cloud in between.

![attach and detach]({{ "/attach-detach.gif" | prepend: page.imgpath }})
{% include caption.html content="Press Enter on a row to attach to the agent running inside tmux. Ctrl-b d to drop back to the dashboard." %}

Claude Code is the default, but other agents work too. Install with Homebrew plus a setup step:

```bash
brew install skzv/tap/ccmux
ccmux setup
```

<div class="divider"></div>

## Running it from the phone

![ccmux on a phone-width terminal]({{ "/phone.gif" | prepend: page.imgpath }}){:height="420px"}
{% include caption.html content="The same TUI, same keys, in a 430-pixel-wide terminal. Attaches over Mosh." %}

Running it from my phone started all of this. Plain SSH drops when the phone switches networks or locks; [Mosh](https://mosh.org/) survives that, so I detach on the train and reattach two stops later, same prompt.

![ccmux running in the Moshi app on iPhone]({{ "/moshi.png" | prepend: page.imgpath }}){:height="520px"}
{% include caption.html content="ccmux in a real iPhone terminal, watching a release go out." %}

## A native app

A TUI in a phone terminal works for power users. For everyone else, including me at 7am, we built a native iOS app on the same daemon and tailnet.

<div style="text-align:center">
<img src="{{ "/ios-dashboard.png" | prepend: page.imgpath }}" alt="ccmux iOS app dashboard" height="460" style="display:inline-block;margin:0 6px" />
<img src="{{ "/ios-terminal.png" | prepend: page.imgpath }}" alt="ccmux iOS app terminal" height="460" style="display:inline-block;margin:0 6px" />
</div>
{% include caption.html content="The iOS app: a live dashboard, and a real interactive terminal attached to the tmux session over a WebSocket bridge." %}

![Raw to Chat mode toggle on iOS]({{ "/ios-mode-toggle.gif" | prepend: page.imgpath }}){:height="460px"}
{% include caption.html content="Raw mode for driving the agent, Chat mode for writing to it." %}

## Where it landed

I ran ccmux as my daily driver for months. Then funded competitors with much bigger teams started shipping features by the day, and a three-person side project couldn't keep that pace, so we're moving on.

ccmux.ai and the source under FSL-1.1-MIT stay up. If you run more than one coding agent and you've lost one, it still works.
