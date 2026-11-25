---
title: "ccmux: Managing AI Coding Agents Across Devices"
last_modified_at: 2026-11-25 00:00
imgpath: /assets/img/ccmux
previewurl: /preview.png
description: "Building ccmux with friends to manage AI coding agents across machines using tmux, Tailscale, Mosh, a Go terminal dashboard, and a native iOS app."
image: /assets/img/ccmux/preview.png
image_width: 1200
image_height: 630
image_alt: "ccmux dashboard for managing coding agent sessions"
mathjax: false
---

{% include description.html content="A tmux session manager I built with friends to keep track of coding agents across machines and use them from my phone." %}

I usually have around ten coding agents running at the same time across my Mac mini and my laptop. Keeping the sessions alive in the background with tmux is straightforward enough, so the real annoyance is keeping track of all of them - remembering which machine I started a task on, ssh-ing in to check whether Claude is still working or has been stuck on a yes/no prompt for an hour, and having no good way to reply when I'm away from my desk.

What I wanted was to kick off a session on the Mac mini, walk away, get a notification on my phone when the agent needed input, answer it there, and pick the same session back up later on my laptop without typing a bunch of ssh and tmux commands in between.

So together with Daniel Mandragona and Mike Choi, I built [ccmux](https://ccmux.ai/), a cross-device tmux session manager for AI coding agents. Below, I walk through how it works, how the pieces fit together, and what we built for mobile.

![ccmux terminal interface showing coding agent sessions across projects]({{ "/hero.gif" | prepend: page.imgpath }})
{% include caption.html content="A quick tour of ccmux, with five agent sessions running across four projects." %}

## The Dashboard

When you open `ccmux`, you get a single list of every coding agent session running across your machines, colour-coded by what each agent is doing - active (generating output), idle, or waiting for your input. On the right side, there's a Devices panel listing the other machines on your network, along with a usage panel that tracks Claude's 5-hour quota so you can see when you're getting close to the limit.

![ccmux dashboard with session status, connected devices, and Claude usage]({{ "/dashboard.gif" | prepend: page.imgpath }})
{% include caption.html content="The dashboard. Session rows are colour-coded by state, with connected devices and Claude usage on the right." %}

To jump into any session, you select it and press `Enter`, which attaches you straight to the agent's tmux session. When you're done, `Ctrl-b d` detaches and brings you back to the dashboard while the agent keeps running on whichever machine started it.

![Attaching to a tmux session and returning to the ccmux dashboard]({{ "/attach-detach.gif" | prepend: page.imgpath }})
{% include caption.html content="Pressing Enter to attach to a session, then Ctrl-b d to detach back to the dashboard." %}

<div class="divider"></div>

## How It Works Under the Hood

We wanted tmux to stay the real source of truth instead of trapping sessions inside a custom wrapper. If you ever stop using ccmux, every running agent is still just a regular tmux session you can attach to by hand.

Each machine runs two Go binaries:

- `ccmux` is the terminal UI you interact with, built with [Charm](https://charm.sh/)'s Bubble Tea stack.
- `ccmuxd` is a small background daemon that polls tmux every couple of seconds, figures out what state each session is in, and exposes that state over a local Unix socket and an optional HTTP API.

State detection is one of the trickier parts. While an agent is actively streaming output, the daemon marks it active. Once an input prompt shows up and the pane stays quiet for a few seconds, the daemon switches the session to `needs_input`. Whenever sessions are active, `ccmuxd` also holds a `caffeinate` lock on macOS (or `systemd-inhibit` on Linux) so a Mac mini or laptop doesn't go to sleep in the middle of a long task - with a battery cutoff option on laptops so a forgotten machine won't drain itself completely.

For multi-machine discovery, we used [Tailscale](https://tailscale.com/). Every refresh, ccmux runs `tailscale status --json`, probes reachable machines on port `7474` (`/v1/health`), and merges any responding daemons into the dashboard automatically. That way you don't have to maintain a list of hosts or expose any ports to the public internet. Since Tailscale's WireGuard layer already handles encryption and device identity, the daemon speaks plain HTTP on the tailnet IP and rejects requests carrying browser `Origin` or `Sec-Fetch-*` headers so random web pages can't talk to it.

When you press `Enter` on a remote session, ccmux runs a real `tmux attach` over SSH or Mosh directly into the host where the agent is running, instead of proxying the terminal through another layer. Claude Code is the default, though ccmux also supports Codex, Cursor, Antigravity, Gemini CLI, and others by saving a per-project agent choice and using each tool's launch and resume flags.

<div class="divider"></div>

## Using It From a Phone

Using agents from my phone was the main reason I wanted to build this. The trouble with plain SSH on a phone is that connections drop constantly - whenever you switch from Wi-Fi to cellular, lock your screen, or walk into a dead zone. [Mosh](https://mosh.org/) handles that much better because it survives roaming and sleep and picks the session right back up once you have signal again.

When ccmux detects a narrow terminal (under 120 columns), it automatically collapses the dashboard into a single scrollable column so the same interface works on a phone screen:

![ccmux dashboard in a narrow mobile terminal]({{ "/phone.gif" | prepend: page.imgpath }}){:height="420px"}
{% include caption.html content="The TUI collapsing to a phone-width layout over Mosh." %}

Notifications ended up being pretty simple to implement. Whenever a session transitions to `needs_input`, the daemon rings the standard terminal bell (`BEL`). iOS terminal apps that watch for the bell turn it straight into a push notification, with no cloud relay in the middle. In [Moshi](https://getmoshi.app/) - a Mosh client for iOS - ccmux can also wire up `moshi-hook` with Claude Code's hooks to send categorized notifications (like approval needed vs. task complete) and let you tap straight into the session.

![ccmux running in the Moshi terminal app on an iPhone]({{ "/moshi.png" | prepend: page.imgpath }}){:height="520px"}
{% include caption.html content="ccmux running inside Moshi on an iPhone." %}

Still, driving a terminal UI on a phone screen can feel cramped, especially when you just want to glance at your sessions or write out a longer prompt. So we also built a native iOS app that talks directly to `ccmuxd` over Tailscale. You pair a phone by running `ccmux pair` on your Mac and scanning the QR code in the terminal. From there, the app streams live session states over SSE and attaches to interactive tmux panes through a WebSocket PTY bridge rendered with SwiftTerm.

<div style="text-align:center">
<img src="{{ "/ios-dashboard.png" | prepend: page.imgpath }}" alt="ccmux iOS app listing coding agent sessions" height="460" style="display:inline-block;margin:0 6px" />
<img src="{{ "/ios-terminal.png" | prepend: page.imgpath }}" alt="Interactive tmux terminal in the ccmux iOS app" height="460" style="display:inline-block;margin:0 6px" />
</div>
{% include caption.html content="The native iOS app: session dashboard on the left, live terminal on the right." %}

One thing we ran into quickly on iOS is that terminal input and prompt writing want opposite keyboards. Driving a terminal needs raw keystrokes, arrow keys, and fast backspace without autocorrect getting in the way, whereas writing a paragraph of instructions to an agent with no autocorrect or text selection is painful. So we added a toggle right in the terminal view between Raw mode (every keystroke goes straight to the PTY) and Chat mode (a normal iMessage-style text box for composing prompts).

![Switching between Raw and Chat input modes in the ccmux iOS app]({{ "/ios-mode-toggle.gif" | prepend: page.imgpath }}){:height="460px"}
{% include caption.html content="Switching between Raw terminal input and Chat mode for composing prompts." %}

<div class="divider"></div>

## Final Notes

I used ccmux daily for months, and a handful of other people started using it too. Over the same few months, a lot of other tools for managing coding agents came out, including funded projects with full-time teams. As a three-person side project, it didn't make much sense to try to keep up with those as a product, so we decided to move on from pushing it that way. Still, I tinker on the repo occasionally, and wanted to write this up to document what we built.

Everything is still up at [ccmux.ai](https://ccmux.ai/), and the source code is on [GitHub](https://github.com/skzv/ccmux) under FSL-1.1-MIT. If you want to try it on macOS or Linux, you can install it and run the setup wizard with:

```bash
curl -fsSL https://raw.githubusercontent.com/skzv/ccmux/main/scripts/install.sh | sh
ccmux setup
```

The [setup docs](https://ccmux.ai/docs/) cover connecting multiple machines over Tailscale and hooking up mobile access.
