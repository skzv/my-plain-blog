---
title: "ccmux: Managing AI Coding Agents Across Devices"
last_modified_at: 2026-09-08 00:00
imgpath: /assets/img/ccmux
previewurl: /preview.png
description: "How we built ccmux to manage AI coding agents across machines using tmux, Tailscale, and Mosh, with a terminal dashboard and an iOS app."
image: /assets/img/ccmux/preview.png
image_width: 1200
image_height: 630
image_alt: "ccmux dashboard for managing coding agent sessions"
mathjax: false
---

{% include description.html content="A tmux session manager I built with friends to keep track of coding agents across my machines, and use them from my phone." %}

I often have three or four coding agents running across different machines. Keeping them running is easy enough with tmux, but keeping track of them is another problem. Which machine did I start that task on? Is the agent still working, or has it been waiting for me to answer a question?

I also wanted to interact with these agents from my phone. If a task is running on my Mac mini, I should be able to check on it and respond without going back to my desk.

So, together with Daniel Mandragona and Mike Choi, I built [ccmux](https://ccmux.ai/): a tmux session manager that collects coding agent sessions from multiple machines into one terminal interface. Below, I'll walk through how it works and show some examples.

![ccmux terminal interface showing coding agent sessions across projects]({{ "/hero.gif" | prepend: page.imgpath }})
{% include caption.html content="A tour of ccmux, with five agent sessions running across four projects." %}

## Keeping Track of Sessions

The dashboard lists the sessions and shows whether each agent is active, idle, or needs input. It also shows the other machines on the network, and tracks Claude's usage quota.

![ccmux dashboard with session status, connected devices, and Claude usage]({{ "/dashboard.gif" | prepend: page.imgpath }})
{% include caption.html content="The dashboard. Colours indicate the state of each session; the panels on the right show devices and usage." %}

To open a session, select it and press Enter. This attaches to the agent's terminal. When you're done, press `Ctrl-b d` to detach and return to the dashboard. The agent continues running on the machine where it started.

![Attaching to a tmux session and returning to the ccmux dashboard]({{ "/attach-detach.gif" | prepend: page.imgpath }})
{% include caption.html content="Attaching to a session, then detaching with Ctrl-b d. tmux keeps the session alive in between." %}

<div class="divider"></div>

## How It Works

There are a few pieces to this. tmux keeps the terminal sessions alive, including when you disconnect. [Tailscale](https://tailscale.com/) connects the machines through a private network, so they can reach each other even when they aren't on the same Wi-Fi. The terminal interface is built with [Charm](https://charm.sh/).

Each machine runs a daemon that keeps track of its sessions. ccmux queries these daemons to build the dashboard, and connects to the selected session over SSH or Mosh. The actual agent stays on its original machine; we're connecting to its terminal from somewhere else.

Claude Code is the default agent, but ccmux also supports Codex, Cursor, Antigravity, and others. The session management works the same way for each of them, since they run inside tmux.

<div class="divider"></div>

## Using It From a Phone

Phone access was a big part of why I wanted to build this. However, a phone is a somewhat awkward SSH client: connections can drop when it switches networks or goes to sleep. [Mosh](https://mosh.org/) helps with this by allowing the connection to recover after an interruption.

![ccmux dashboard in a narrow mobile terminal]({{ "/phone.gif" | prepend: page.imgpath }}){:height="420px"}
{% include caption.html content="The terminal interface at phone width, connecting over Mosh." %}

The same interface works in an iPhone terminal, as shown below. Notifications are useful here too: with a compatible terminal app, I can be notified when an agent needs input instead of repeatedly checking on it.

![ccmux running in the Moshi terminal app on an iPhone]({{ "/moshi.png" | prepend: page.imgpath }}){:height="520px"}
{% include caption.html content="ccmux running in Moshi on an iPhone." %}

We also built a native iOS app that connects to the same daemon over the Tailscale network. It has a session dashboard and an interactive terminal, which connects to tmux through a WebSocket bridge.

<div style="text-align:center">
<img src="{{ "/ios-dashboard.png" | prepend: page.imgpath }}" alt="ccmux iOS app listing coding agent sessions" height="460" style="display:inline-block;margin:0 6px" />
<img src="{{ "/ios-terminal.png" | prepend: page.imgpath }}" alt="Interactive tmux terminal in the ccmux iOS app" height="460" style="display:inline-block;margin:0 6px" />
</div>
{% include caption.html content="The native iOS app: session dashboard on the left, terminal on the right." %}

There are two input modes: Raw mode for interacting with the terminal directly, and Chat mode for composing messages to the agent.

![Switching between Raw and Chat input modes in the ccmux iOS app]({{ "/ios-mode-toggle.gif" | prepend: page.imgpath }}){:height="460px"}
{% include caption.html content="Switching between terminal input and composing a message." %}

<div class="divider"></div>

## Final Notes

I used ccmux daily for months, and other people started using it too. In the meantime, a lot of tools for managing coding agents appeared, including projects with funding and much larger teams. We decided to move on rather than try to keep up with those as a three-person side project.

I'm glad we built it. It solved a problem I had, and I wanted to put together this post to document the result.

The site is still at [ccmux.ai](https://ccmux.ai/), and the [source is available on GitHub](https://github.com/skzv/ccmux) under FSL-1.1-MIT. If you'd like to try it, the [setup instructions](https://ccmux.ai/docs/) cover installation and connecting your machines.
