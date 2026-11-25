---
layout: post
lang_code: es
locale: es_ES
ref: ccmux-tmux-manager-for-ai-coding-agents
date: 2026-06-05 00:00:00 -0700
last_modified_at: 2026-11-25 00:00
permalink: /es/ccmux-tmux-manager-for-ai-coding-agents
title: "ccmux: Gestionando agentes de programación con IA entre dispositivos"
imgpath: /assets/img/ccmux
previewurl: /preview.png
description: "Construyendo ccmux con amigos para gestionar agentes de programación con IA entre varias máquinas usando tmux, Tailscale, Mosh, un panel de terminal en Go y una app nativa para iOS."
image: /assets/img/ccmux/preview.png
image_width: 1200
image_height: 630
image_alt: "Panel de ccmux para gestionar sesiones de agentes de programación"
mathjax: false
tags: [ai-tools, systems]
---

{% include description.html content="Un gestor de sesiones de tmux que construí con amigos para seguir el rastro de agentes de programación entre varias máquinas y usarlos desde el móvil." %}

Normalmente tengo alrededor de diez agentes de programación funcionando al mismo tiempo repartidos entre mi Mac mini y mi portátil. Mantener las sesiones vivas en segundo plano con tmux es bastante sencillo, así que la verdadera molestia es llevar el control de todas ellas: recordar en qué máquina empecé una tarea, conectarme por SSH para comprobar si Claude sigue trabajando o lleva una hora atascado en una pregunta de sí/no, y no tener una buena manera de responder cuando estoy lejos de mi escritorio.

Lo que quería era lanzar una sesión en el Mac mini, alejarme, recibir una notificación en el móvil cuando el agente necesitara mi respuesta, contestarle desde allí y retomar esa misma sesión más tarde en mi portátil sin tener que escribir un montón de comandos de SSH y tmux de por medio.

Así que, junto con Daniel Mandragona y Mike Choi, construí [ccmux](https://ccmux.ai/), un gestor multidispositivo de sesiones de tmux para agentes de programación con IA. A continuación explico cómo funciona, cómo encajan todas las piezas y lo que construimos para móvil.

<div style="text-align:center">
  <video autoplay loop muted playsinline disableRemotePlayback preload="metadata" width="1280" height="640" poster="/assets/video/ccmux/hero-poster.webp" style="width:100%;height:auto">
    <source src="/assets/video/ccmux/hero.mp4" type="video/mp4">
    Interfaz de terminal de ccmux mostrando sesiones de agentes de programación en varios proyectos
  </video>
</div>
{% include caption.html content="Un recorrido rápido por ccmux, con cinco sesiones de agentes ejecutándose en cuatro proyectos." %}

## El panel

Cuando abres `ccmux`, obtienes una única lista con todas las sesiones de agentes de programación que se están ejecutando en tus máquinas, codificadas por colores según lo que esté haciendo cada agente: activo (generando salida), inactivo o esperando tu respuesta. En el lado derecho hay un panel de Dispositivos que enumera el resto de máquinas de tu red, junto con un panel de uso que monitoriza la cuota de 5 horas de Claude para que veas cuándo te estás acercando al límite.

<div style="text-align:center">
  <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1280" height="640" poster="/assets/video/ccmux/dashboard-poster.webp" style="width:100%;height:auto">
    <source src="/assets/video/ccmux/dashboard.mp4" type="video/mp4">
    Panel de ccmux con el estado de las sesiones, dispositivos conectados y uso de Claude
  </video>
</div>
{% include caption.html content="El panel. Las filas de sesiones están codificadas por colores según su estado, con los dispositivos conectados y el uso de Claude a la derecha." %}

Para entrar en cualquier sesión, la seleccionas y pulsas `Enter`, lo que te conecta directamente a la sesión de tmux del agente. Cuando terminas, `Ctrl-b d` te desconecta y te devuelve al panel mientras el agente sigue ejecutándose en la máquina donde se inició.

<div style="text-align:center">
  <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1280" height="640" poster="/assets/video/ccmux/attach-detach-poster.webp" style="width:100%;height:auto">
    <source src="/assets/video/ccmux/attach-detach.mp4" type="video/mp4">
    Conectándose a una sesión de tmux y volviendo al panel de ccmux
  </video>
</div>
{% include caption.html content="Pulsando Enter para conectarse a una sesión y luego Ctrl-b d para desconectarse y volver al panel." %}

<div class="divider"></div>

## Cómo funciona por dentro

Queríamos que tmux siguiera siendo la verdadera fuente de verdad en lugar de encerrar las sesiones dentro de un envoltorio propietario. Si algún día dejas de usar ccmux, cada agente en ejecución sigue siendo simplemente una sesión normal de tmux a la que puedes conectarte a mano.

Cada máquina ejecuta dos binarios en Go:

- `ccmux` es la interfaz de terminal con la que interactúas, construida con el stack Bubble Tea de [Charm](https://charm.sh/).
- `ccmuxd` es un pequeño demonio en segundo plano que consulta tmux cada par de segundos, determina en qué estado está cada sesión y expone ese estado a través de un socket Unix local y una API HTTP opcional.

La detección de estado es una de las partes más delicadas. Mientras un agente está emitiendo salida activamente, el demonio lo marca como activo. En cuanto aparece una petición de entrada y el panel permanece en silencio durante unos segundos, el demonio cambia el estado de la sesión a `needs_input`. Siempre que haya sesiones activas, `ccmuxd` también mantiene un bloqueo de `caffeinate` en macOS (o `systemd-inhibit` en Linux) para que un Mac mini o un portátil no se suspendan en mitad de una tarea larga, con una opción de límite de batería en portátiles para que un equipo olvidado no se descargue por completo.

Para el descubrimiento entre varias máquinas usamos [Tailscale](https://tailscale.com/). En cada actualización, ccmux ejecuta `tailscale status --json`, sondea las máquinas accesibles en el puerto `7474` (`/v1/health`) e incorpora automáticamente en el panel cualquier demonio que responda. Así no tienes que mantener una lista manual de hosts ni exponer puertos a internet público. Como la capa WireGuard de Tailscale ya se encarga del cifrado y de la identidad de los dispositivos, el demonio habla HTTP plano sobre la IP de la tailnet y rechaza peticiones que lleven cabeceras de navegador `Origin` o `Sec-Fetch-*` para que ninguna página web cualquiera pueda comunicarse con él.

Cuando pulsas `Enter` en una sesión remota, ccmux ejecuta un `tmux attach` real sobre SSH o Mosh directamente contra el host donde corre el agente, en lugar de hacer de proxy del terminal a través de otra capa. Claude Code es la opción predeterminada, aunque ccmux también admite Codex, Cursor, Antigravity, Gemini CLI y otros guardando la elección de agente por proyecto y usando las opciones de lanzamiento y reanudación de cada herramienta.

<div class="divider"></div>

## Usarlo desde el móvil

Usar los agentes desde el móvil fue el motivo principal por el que quise construir esto. El problema con el SSH convencional en un teléfono es que las conexiones se caen constantemente: cada vez que cambias de Wi-Fi a datos móviles, bloqueas la pantalla o entras en una zona sin cobertura. [Mosh](https://mosh.org/) gestiona eso muchísimo mejor porque sobrevive a cambios de red y suspensiones y retoma la sesión al instante en cuanto vuelves a tener señal.

Cuando ccmux detecta un terminal estrecho (menos de 120 columnas), colapsa automáticamente el panel en una sola columna desplazable para que la misma interfaz funcione bien en la pantalla de un teléfono:

<div style="text-align:center">
  <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="430" height="900" poster="/assets/video/ccmux/phone-poster.webp" style="max-height:420px;width:auto">
    <source src="/assets/video/ccmux/phone.mp4" type="video/mp4">
    Panel de ccmux en un terminal móvil estrecho
  </video>
</div>
{% include caption.html content="La interfaz de terminal adaptándose a un diseño del ancho de un teléfono sobre Mosh." %}

Las notificaciones acabaron siendo muy sencillas de implementar. Cada vez que una sesión pasa a `needs_input`, el demonio hace sonar la campana estándar de terminal (`BEL`). Las apps de terminal de iOS que escuchan la campana la convierten directamente en una notificación push, sin ningún servidor intermedio en la nube. En [Moshi](https://getmoshi.app/) —un cliente de Mosh para iOS— ccmux también puede enlazar `moshi-hook` con los hooks de Claude Code para enviar notificaciones categorizadas (como aprobación requerida frente a tarea completada) y permitirte tocar la notificación para saltar directamente a la sesión.

![ccmux ejecutándose en la aplicación de terminal Moshi en un iPhone]({{ "/moshi.webp" | prepend: page.imgpath }}){: width="610" height="1323" loading="lazy" decoding="async" style="max-height:520px;width:auto"}
{% include caption.html content="ccmux ejecutándose dentro de Moshi en un iPhone." %}

Aun así, manejar una interfaz de terminal en la pantalla de un móvil puede resultar apretado, sobre todo cuando solo quieres echar un vistazo rápido a tus sesiones o escribir un prompt más largo. Por eso también construimos una aplicación nativa para iOS que habla directamente con `ccmuxd` a través de Tailscale. Emparejas el teléfono ejecutando `ccmux pair` en tu Mac y escaneando el código QR en el terminal. A partir de ahí, la app recibe en tiempo real los estados de las sesiones por SSE y se conecta a paneles interactivos de tmux mediante un puente PTY sobre WebSocket renderizado con SwiftTerm.

<div style="text-align:center">
<img src="{{ "/ios-dashboard.webp" | prepend: page.imgpath }}" alt="Aplicación de iOS de ccmux listando sesiones de agentes de programación" width="1206" height="2622" loading="lazy" decoding="async" style="display:inline-block;margin:0 6px;max-height:460px;width:auto" //>
<img src="{{ "/ios-terminal.webp" | prepend: page.imgpath }}" alt="Terminal interactivo de tmux en la aplicación de iOS de ccmux" width="1206" height="2622" loading="lazy" decoding="async" style="display:inline-block;margin:0 6px;max-height:460px;width:auto" //>
</div>
{% include caption.html content="La aplicación nativa de iOS: panel de sesiones a la izquierda, terminal en vivo a la derecha." %}

Algo con lo que nos topamos enseguida en iOS es que manejar un terminal y redactar prompts piden teclados opuestos. Controlar un terminal necesita pulsaciones sin procesar, teclas de flecha y un borrado rápido sin que el autocorrector se meta en medio, mientras que escribir un párrafo de instrucciones para un agente sin autocorrección ni selección de texto es un suplicio. Así que añadimos un interruptor en la propia vista del terminal para alternar entre el modo Raw (cada pulsación va directa al PTY) y el modo Chat (un cuadro de texto normal al estilo de iMessage para redactar prompts).

<div style="text-align:center">
  <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="400" height="870" poster="/assets/video/ccmux/ios-mode-toggle-poster.webp" style="max-height:460px;width:auto">
    <source src="/assets/video/ccmux/ios-mode-toggle.mp4" type="video/mp4">
    Alternando entre los modos de entrada Raw y Chat en la aplicación de iOS de ccmux
  </video>
</div>
{% include caption.html content="Alternando entre la entrada directa de terminal en modo Raw y el modo Chat para redactar prompts." %}

<div class="divider"></div>

## Notas finales

Usé ccmux a diario durante meses, y un puñado de personas más también empezó a utilizarlo. En esos mismos meses aparecieron muchas otras herramientas para gestionar agentes de programación, incluidos proyectos financiados con equipos a tiempo completo. Siendo un proyecto paralelo de tres personas, no tenía mucho sentido intentar competir con ellos como producto, así que decidimos dejar de impulsarlo en esa dirección. Aun así, de vez en cuando sigo trasteando en el repositorio y quería escribir esto para dejar documentado lo que construimos.

Todo sigue disponible en [ccmux.ai](https://ccmux.ai/), y el código fuente está en [GitHub](https://github.com/skzv/ccmux) bajo licencia FSL-1.1-MIT. Si quieres probarlo en macOS o Linux, puedes instalarlo y ejecutar el asistente de configuración con:

```bash
curl -fsSL https://raw.githubusercontent.com/skzv/ccmux/main/scripts/install.sh | sh
ccmux setup
```

La [documentación de configuración](https://ccmux.ai/docs/) explica cómo conectar varias máquinas mediante Tailscale y configurar el acceso desde el móvil.
