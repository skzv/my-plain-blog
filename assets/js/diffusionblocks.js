/* DiffusionBlocks — interactive figures.
   All canvas-based, dark-themed to sit on the black page. No build step; vanilla JS.
   Each figure is guarded on the presence of its container, so the file is safe to load anywhere. */
(function () {
  "use strict";

  /* ----------------------------------------------------------------------- *
   *  Palette + small helpers
   * ----------------------------------------------------------------------- */
  var C = {
    data:   "#f14e32",   // clean data / the target y  (the site's hot accent)
    flow:   "#3aa6e0",   // score / velocity / flow
    flow2:  "#7fd1ff",
    noise:  "#8a8a8a",
    ink:    "#f2efe9",
    muted:  "#9a958c",
    faint:  "rgba(255,255,255,0.08)",
    faint2: "rgba(255,255,255,0.14)",
    blocks: ["#f14e32", "#3aa6e0", "#46c08d", "#c08adf", "#e0b341", "#e06aa0", "#ff8a5c", "#5cc8c2"]
  };
  var MONO = "'Consolas', ui-monospace, Menlo, monospace";
  var SANS = "'Montserrat', -apple-system, Segoe UI, Roboto, sans-serif";

  var TAU = Math.PI * 2;
  function clamp(x, a, b) { return x < a ? a : (x > b ? b : x); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  // Box–Muller standard normal
  var _spare = null;
  function randn() {
    if (_spare !== null) { var s = _spare; _spare = null; return s; }
    var u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    var r = Math.sqrt(-2 * Math.log(u));
    _spare = r * Math.sin(TAU * v);
    return r * Math.cos(TAU * v);
  }

  // erf, standard normal CDF / inverse CDF (for the equi-probability partition)
  function erf(x) {
    var s = x < 0 ? -1 : 1; x = Math.abs(x);
    var t = 1 / (1 + 0.3275911 * x);
    var y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return s * y;
  }
  function normCDF(x) { return 0.5 * (1 + erf(x / Math.SQRT2)); }
  function invNormCDF(p) {
    // Acklam's rational approximation
    var a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
    var b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
    var c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
    var d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
    var pl = 0.02425, ph = 1 - pl, q, r;
    if (p < pl) { q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    if (p <= ph) { q = p - 0.5; r = q * q; return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1); }
    q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }

  /* HiDPI canvas inside a container; returns {cv, ctx, w, h}. Rebuilds on resize. */
  function makeCanvas(container, height) {
    var cv = document.createElement("canvas");
    cv.style.width = "100%";
    cv.style.height = height + "px";
    cv.style.display = "block";
    container.appendChild(cv);
    var ctx = cv.getContext("2d");
    var state = { cv: cv, ctx: ctx, w: 0, h: height };
    function resize() {
      var dpr = window.devicePixelRatio || 1;
      var w = container.clientWidth || 600;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      state.w = w; state.h = height;
    }
    resize();
    window.addEventListener("resize", function () { resize(); if (state.onresize) state.onresize(); });
    return state;
  }

  // world<->screen view over [xmin,xmax] x [ymin,ymax] with padding, y up.
  function makeView(w, h, xmin, xmax, ymin, ymax, pad) {
    pad = pad || 0;
    var iw = w - 2 * pad, ih = h - 2 * pad;
    var sx = iw / (xmax - xmin), sy = ih / (ymax - ymin);
    return {
      X: function (x) { return pad + (x - xmin) * sx; },
      Y: function (y) { return pad + ih - (y - ymin) * sy; },
      sx: sx, sy: sy
    };
  }

  function makeSlider(opts) {
    // opts: {label, min, max, step, value, fmt, onInput}
    var wrap = document.createElement("div");
    wrap.style.cssText = "display:flex;align-items:center;gap:12px;margin:10px 0;font-family:" + MONO + ";font-size:13px;color:" + C.muted + ";";
    var lab = document.createElement("span");
    lab.style.cssText = "min-width:auto;color:" + C.ink + ";white-space:nowrap;";
    lab.innerHTML = opts.label;
    var input = document.createElement("input");
    input.type = "range"; input.min = opts.min; input.max = opts.max; input.step = opts.step; input.value = opts.value;
    input.className = "db-slider";
    input.style.cssText = "flex:1;accent-color:" + C.flow + ";";
    var val = document.createElement("span");
    val.style.cssText = "min-width:70px;text-align:right;color:" + C.flow2 + ";";
    function show() { val.innerHTML = opts.fmt(parseFloat(input.value)); }
    input.addEventListener("input", function () { show(); opts.onInput(parseFloat(input.value)); });
    show();
    wrap.appendChild(lab); wrap.appendChild(input); wrap.appendChild(val);
    return { el: wrap, input: input, refresh: show };
  }

  function caption(text) {
    var p = document.createElement("p");
    p.className = "caption";
    p.style.marginTop = "8px";
    p.innerHTML = text;
    return p;
  }

  /* small dot drawer */
  function dot(ctx, x, y, r, fill, alpha) {
    ctx.globalAlpha = alpha == null ? 1 : alpha;
    ctx.fillStyle = fill;
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    ctx.globalAlpha = 1;
  }
  function arrow(ctx, x0, y0, x1, y1, color, head) {
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    var a = Math.atan2(y1 - y0, x1 - x0); head = head || 4;
    ctx.beginPath(); ctx.moveTo(x1, y1);
    ctx.lineTo(x1 - head * Math.cos(a - 0.4), y1 - head * Math.sin(a - 0.4));
    ctx.lineTo(x1 - head * Math.cos(a + 0.4), y1 - head * Math.sin(a + 0.4));
    ctx.closePath(); ctx.fill();
  }

  /* ----------------------------------------------------------------------- *
   *  Mixture-of-Gaussians score (shared by score-field + reverse-sampling)
   *  Data points treated as deltas; after noising at level sigma the density
   *  is p_sigma(z) = (1/K) sum_k N(z; mu_k, sigma^2 I), with exact score
   *  grad log p_sigma(z) = sum_k w_k(z) (mu_k - z)/sigma^2,
   *  w_k(z) = softmax over -||z-mu_k||^2 / (2 sigma^2).
   * ----------------------------------------------------------------------- */
  function mogScore(z, mus, sigma) {
    var s2 = sigma * sigma, K = mus.length;
    var logw = new Array(K), m = -Infinity;
    for (var k = 0; k < K; k++) {
      var dx = z[0] - mus[k][0], dy = z[1] - mus[k][1];
      logw[k] = -(dx * dx + dy * dy) / (2 * s2);
      if (logw[k] > m) m = logw[k];
    }
    var sum = 0;
    for (k = 0; k < K; k++) { logw[k] = Math.exp(logw[k] - m); sum += logw[k]; }
    var gx = 0, gy = 0;
    for (k = 0; k < K; k++) {
      var wk = logw[k] / sum;
      gx += wk * (mus[k][0] - z[0]) / s2;
      gy += wk * (mus[k][1] - z[1]) / s2;
    }
    return [gx, gy];
  }

  /* ======================================================================= *
   *  FIGURE 1 — Forward noising:  z_sigma = y + sigma * eps
   * ======================================================================= */
  function figNoising(container) {
    var H = 360;
    var c = makeCanvas(container, H);
    var R = 6;

    // structured data: a two-arm Archimedean spiral
    var N = 900, base = [];
    for (var i = 0; i < N; i++) {
      var arm = i % 2;
      var t = (i / N) * 3.4 * Math.PI;
      var rr = 0.35 + t * 0.42;
      var th = t + arm * Math.PI;
      base.push([rr * Math.cos(th), rr * Math.sin(th)]);
    }
    // frozen noise directions so the slider is smooth (same eps, scaled by sigma)
    var eps = base.map(function () { return [randn(), randn()]; });

    var sigma = 0.0;
    var sl = makeSlider({
      label: "noise level &nbsp;<b>&sigma;</b>", min: 0, max: 4, step: 0.02, value: 0,
      fmt: function (v) { return "&sigma; = " + v.toFixed(2); },
      onInput: function (v) { sigma = v; render(); }
    });
    container.appendChild(sl.el);
    container.appendChild(caption("Each clean point <b style='color:" + C.data + "'>y</b> is pushed off the data manifold by Gaussian noise: <b style='color:" + C.ink + "'>z</b><sub>&sigma;</sub> = y + &sigma;&epsilon;. Drag &sigma; up and watch the spiral dissolve into a featureless blob — that blob is what every diffusion model starts from and must climb back out of."));

    function render() {
      var ctx = c.ctx, w = c.w, h = c.h;
      ctx.clearRect(0, 0, w, h);
      var v = makeView(w, h, -R, R, -R * h / w, R * h / w, 10);
      // faint reference of the clean manifold
      for (var i = 0; i < base.length; i++) dot(ctx, v.X(base[i][0]), v.Y(base[i][1]), 1.1, C.data, 0.18);
      // noised points
      for (i = 0; i < base.length; i++) {
        var x = base[i][0] + sigma * eps[i][0];
        var y = base[i][1] + sigma * eps[i][1];
        var a = clamp(0.85 - sigma * 0.08, 0.28, 0.85);
        dot(ctx, v.X(x), v.Y(y), 1.5, sigma < 0.04 ? C.data : C.flow2, a);
      }
      // label
      ctx.font = "13px " + MONO; ctx.fillStyle = C.muted; ctx.textAlign = "left";
      ctx.fillText(sigma < 0.04 ? "clean data  (σ ≈ 0)" : (sigma > 3 ? "≈ pure noise" : "noised"), 14, 22);
    }
    c.onresize = render;
    render();
  }

  /* ======================================================================= *
   *  FIGURE 2 — The score field grad log p_sigma  (points toward the data)
   * ======================================================================= */
  function figScore(container) {
    var H = 380;
    var c = makeCanvas(container, H);
    var R = 5;
    var mus = [[-2.4, 1.4], [0, 2.0], [2.4, 1.4], [-2.4, -1.4], [0, -2.0], [2.4, -1.4]];
    var sigma = 1.0;
    var sl = makeSlider({
      label: "noise level &nbsp;<b>&sigma;</b>", min: 0.25, max: 3.5, step: 0.01, value: 1.0,
      fmt: function (v) { return "&sigma; = " + v.toFixed(2); },
      onInput: function (v) { sigma = v; render(); }
    });
    container.appendChild(sl.el);
    container.appendChild(caption("The <b style='color:" + C.flow + "'>score</b> &nbsp;&nabla;<sub>z</sub> log&nbsp;p<sub>&sigma;</sub>(z) is a vector field: at every point it aims at where probability mass is densest. At small &sigma; it snaps sharply toward the nearest <b style='color:" + C.data + "'>data cluster</b>; at large &sigma; the clusters blur together and the field just points gently to the global center. A neural network that estimates this field is all you need to denoise."));

    function render() {
      var ctx = c.ctx, w = c.w, h = c.h;
      ctx.clearRect(0, 0, w, h);
      var ar = (R * h / w);
      var v = makeView(w, h, -R, R, -ar, ar, 12);
      // grid of arrows
      var step = 26;
      for (var px = 18; px < w - 8; px += step) {
        for (var py = 18; py < h - 8; py += step) {
          // invert screen->world
          var wx = -R + (px - 12) / v.sx;
          var wy = ar - (py - 12) / v.sy;
          var g = mogScore([wx, wy], mus, sigma);
          var mag = Math.hypot(g[0], g[1]) + 1e-9;
          // normalize for display, scale by a soft function of magnitude
          var L = clamp(Math.log(1 + mag) * 9, 3, 15);
          var ux = g[0] / mag, uy = g[1] / mag;
          var x1 = px + ux * L, y1 = py - uy * L; // screen y is down
          var t = clamp(mag * sigma, 0, 1); // brighter where field is decisive
          var col = "rgba(" + Math.round(lerp(58, 127, t)) + "," + Math.round(lerp(120, 209, t)) + "," + Math.round(lerp(170, 255, t)) + ",0.9)";
          arrow(ctx, px, py, x1, y1, col, 3.2);
        }
      }
      // data clusters
      for (var k = 0; k < mus.length; k++) {
        var sx = v.X(mus[k][0]), sy = v.Y(mus[k][1]);
        // sampled cloud around each center to show the cluster at this sigma
        for (var s = 0; s < 26; s++) dot(ctx, sx + randn() * sigma * v.sx * 0.5, sy + randn() * sigma * v.sy * 0.5, 1.1, C.data, 0.10);
        dot(ctx, sx, sy, 3.4, C.data, 0.95);
      }
      ctx.font = "13px " + MONO; ctx.fillStyle = C.muted; ctx.textAlign = "left";
      ctx.fillText("arrows: ∇ log p_σ   ·   dots: data", 14, 22);
    }
    c.onresize = render;
    render();
  }

  /* ======================================================================= *
   *  FIGURE 3 — Reverse generation: Euler-integrate the probability-flow ODE
   *  dz/dsigma = -sigma * score, integrated DOWNWARD from sigma_max -> sigma_min.
   *  Downward Euler step:  z += dsigma * sigma * score   (dsigma>0), which equals
   *  z += (dsigma/sigma)(D - z): the sample moves toward the denoised estimate.
   * ======================================================================= */
  function figReverse(container) {
    var H = 400;
    var c = makeCanvas(container, H);
    var R = 5;
    var mus = [[-2.4, 1.4], [0, 2.0], [2.4, 1.4], [-2.4, -1.4], [0, -2.0], [2.4, -1.4]];
    var SMAX = 4.0, SMIN = 0.05, STEPS = 32;
    var P, trails, stepIdx, sigmaNow, raf = null, frame = 0;

    function reset() {
      var M = 220;
      P = []; trails = [];
      for (var i = 0; i < M; i++) {
        var z = [randn() * SMAX, randn() * SMAX]; // pure noise at sigma_max
        P.push(z); trails.push([[z[0], z[1]]]);
      }
      stepIdx = 0; sigmaNow = SMAX; frame = 0;
    }

    function geometricSigmas(n) {
      // EDM-style: sigmas spaced so steps are larger at high noise
      var arr = [];
      for (var i = 0; i <= n; i++) {
        var t = i / n;
        arr.push(Math.pow(SMAX, 1 - t) * Math.pow(SMIN, t));
      }
      return arr; // descending
    }
    var SIG = geometricSigmas(STEPS);

    function stepOnce() {
      if (stepIdx >= STEPS) return false;
      var sCur = SIG[stepIdx], sNext = SIG[stepIdx + 1];
      var dsig = sCur - sNext; // > 0
      for (var i = 0; i < P.length; i++) {
        var g = mogScore(P[i], mus, sCur);
        // downward Euler of dz/dsigma = -sigma*score  =>  z += dsigma*sigma*score
        P[i][0] += dsig * sCur * g[0];
        P[i][1] += dsig * sCur * g[1];
        var tr = trails[i]; tr.push([P[i][0], P[i][1]]);
        if (tr.length > 40) tr.shift();
      }
      stepIdx++; sigmaNow = sNext;
      return true;
    }

    function draw() {
      var ctx = c.ctx, w = c.w, h = c.h;
      ctx.clearRect(0, 0, w, h);
      var ar = (R * h / w);
      var v = makeView(w, h, -R, R, -ar, ar, 12);
      // target clusters
      for (var k = 0; k < mus.length; k++) dot(ctx, v.X(mus[k][0]), v.Y(mus[k][1]), 4, C.data, 0.5);
      // trails
      for (var i = 0; i < P.length; i++) {
        var tr = trails[i];
        ctx.strokeStyle = "rgba(127,209,255,0.16)"; ctx.lineWidth = 1;
        ctx.beginPath();
        for (var j = 0; j < tr.length; j++) { var X = v.X(tr[j][0]), Y = v.Y(tr[j][1]); if (j === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
        ctx.stroke();
        dot(ctx, v.X(P[i][0]), v.Y(P[i][1]), 1.7, C.flow2, 0.92);
      }
      // HUD
      ctx.font = "13px " + MONO; ctx.textAlign = "left";
      ctx.fillStyle = C.muted; ctx.fillText("step " + stepIdx + " / " + STEPS, 14, 22);
      ctx.fillStyle = C.flow2; ctx.fillText("σ = " + sigmaNow.toFixed(2), 14, 40);
      ctx.fillStyle = stepIdx >= STEPS ? C.data : C.muted;
      ctx.textAlign = "right";
      ctx.fillText(stepIdx >= STEPS ? "samples landed on the data ✓" : "denoising…", w - 14, 22);
    }

    function loop() {
      frame++;
      if (frame % 4 === 0) stepOnce();   // ~ one ODE step every 4 frames
      draw();
      if (stepIdx < STEPS) raf = requestAnimationFrame(loop);
      else { raf = null; }
    }

    var bar = document.createElement("div");
    bar.style.cssText = "display:flex;gap:10px;margin:10px 0;";
    var btn = document.createElement("button");
    btn.textContent = "▶  Run reverse process";
    btn.style.cssText = "font-family:" + MONO + ";font-size:13px;background:" + C.flow + ";color:#001018;border:0;padding:9px 16px;cursor:pointer;border-radius:2px;font-weight:600;";
    btn.onclick = function () { if (raf) return; reset(); raf = requestAnimationFrame(loop); };
    bar.appendChild(btn);
    container.appendChild(bar);
    container.appendChild(caption("Generation runs the clock backward. Start from <b style='color:" + C.flow2 + "'>pure noise</b> at &sigma;=" + SMAX.toFixed(0) + ", then take " + STEPS + " little Euler steps down the probability-flow ODE &nbsp;dz/d&sigma; = &minus;&sigma;&nbsp;&nabla; log&nbsp;p<sub>&sigma;</sub>(z), nudging each particle along the score until it settles onto a <b style='color:" + C.data + "'>data cluster</b>. <b>Every step is one residual update</b> — hold that thought."));

    reset(); draw();
    c.onresize = draw;
  }

  /* ======================================================================= *
   *  FIGURE 4 — A residual network IS Euler's method.
   *  Continuous ODE dz/dt = field(z) vs the discrete residual update
   *  z_{l+1} = z_l + h*field(z_l), h = T / L. Slider = number of layers L.
   * ======================================================================= */
  function figEuler(container) {
    var H = 380;
    var c = makeCanvas(container, H);
    var R = 3.2;
    // a smooth swirling field with gentle inward pull -> visible curvature
    function field(z) {
      var x = z[0], y = z[1];
      var rot = 0.9;
      return [(-y) * rot - 0.15 * x, (x) * rot - 0.15 * y];
    }
    var start = [2.4, 0.0], T = 3.0;
    var L = 6;

    function integrate(steps, h) {
      var pts = [start.slice()], z = start.slice();
      for (var i = 0; i < steps; i++) {
        var f = field(z);
        z = [z[0] + h * f[0], z[1] + h * f[1]];
        pts.push(z.slice());
      }
      return pts;
    }

    var sl = makeSlider({
      label: "layers &nbsp;<b>L</b>", min: 1, max: 60, step: 1, value: 6,
      fmt: function (v) { return "L = " + v + "  (h=" + (T / v).toFixed(2) + ")"; },
      onInput: function (v) { L = v; render(); }
    });
    container.appendChild(sl.el);
    container.appendChild(caption("The true flow (the smooth <b style='color:" + C.data + "'>continuous-depth ODE</b>) is fixed. The <b style='color:" + C.flow2 + "'>residual network</b> approximates it with L discrete jumps, z<sub>&ell;+1</sub> = z<sub>&ell;</sub> + h&middot;f(z<sub>&ell;</sub>) — each dot is one layer. A handful of layers overshoots and cuts corners; add layers (shrink the step h) and the staircase melts into the curve. <b>Depth is time; a layer is one Euler step.</b>"));

    function render() {
      var ctx = c.ctx, w = c.w, h = c.h;
      ctx.clearRect(0, 0, w, h);
      var ar = (R * h / w);
      var v = makeView(w, h, -R, R, -ar, ar, 14);
      // faint field arrows
      for (var px = 22; px < w; px += 34) for (var py = 22; py < h; py += 34) {
        var wx = -R + (px - 14) / v.sx, wy = ar - (py - 14) / v.sy;
        var f = field([wx, wy]); var m = Math.hypot(f[0], f[1]) + 1e-9;
        arrow(ctx, px, py, px + f[0] / m * 8, py - f[1] / m * 8, "rgba(255,255,255,0.10)", 2.6);
      }
      // ground-truth trajectory (many tiny steps)
      var truth = integrate(600, T / 600);
      ctx.strokeStyle = C.data; ctx.lineWidth = 2.2; ctx.globalAlpha = 0.9;
      ctx.beginPath();
      for (var i = 0; i < truth.length; i++) { var X = v.X(truth[i][0]), Y = v.Y(truth[i][1]); if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
      ctx.stroke(); ctx.globalAlpha = 1;
      // discrete residual path
      var path = integrate(L, T / L);
      ctx.strokeStyle = C.flow2; ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (i = 0; i < path.length; i++) { X = v.X(path[i][0]); Y = v.Y(path[i][1]); if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
      ctx.stroke();
      for (i = 0; i < path.length; i++) {
        dot(ctx, v.X(path[i][0]), v.Y(path[i][1]), i === 0 ? 4 : 3, i === 0 ? C.ink : C.flow2, 1);
      }
      // labels
      ctx.font = "12px " + MONO; ctx.textAlign = "left";
      ctx.fillStyle = C.data; ctx.fillText("continuous ODE flow", 14, 22);
      ctx.fillStyle = C.flow2; ctx.fillText("residual network (" + L + " layers)", 14, 40);
      dot(ctx, v.X(start[0]), v.Y(start[1]), 4, C.ink, 1);
    }
    c.onresize = render;
    render();
  }

  /* ======================================================================= *
   *  FIGURE 5 — Equi-probability partitioning of the log-normal noise schedule
   *  log sigma ~ N(Pmean, Pstd^2). Boundaries chosen so each of B blocks owns
   *  exactly 1/B of the probability mass:
   *     sigma_b = exp(Pmean + Pstd * Phi^{-1}(q_b)),  q_b = qmin + (b/B)(qmax-qmin)
   * ======================================================================= */
  function figPartition(container) {
    var H = 360;
    var c = makeCanvas(container, H);
    var Pmean = -1.2, Pstd = 1.2, SMIN = 0.002, SMAX = 80;
    var B = 4;
    var qmin = normCDF((Math.log(SMIN) - Pmean) / Pstd);
    var qmax = normCDF((Math.log(SMAX) - Pmean) / Pstd);
    var Lmin = Math.log(SMIN), Lmax = Math.log(SMAX);

    function pdfLogSigma(t) { // density over t = log sigma
      return Math.exp(-(t - Pmean) * (t - Pmean) / (2 * Pstd * Pstd)) / (Pstd * Math.sqrt(TAU));
    }

    var sl = makeSlider({
      label: "blocks &nbsp;<b>B</b>", min: 2, max: 8, step: 1, value: 4,
      fmt: function (v) { return "B = " + v; },
      onInput: function (v) { B = v; render(); }
    });
    container.appendChild(sl.el);
    container.appendChild(caption("Noise levels are sampled from a log-normal (most mass at the perceptually crucial middle &sigma;). DiffusionBlocks slices it into B regions of <b>equal area</b> — equal probability mass — using the inverse normal CDF, so each block trains on the same share of the distribution. Notice the bands aren't equal width: the busy middle gets <b style='color:" + C.ink + "'>narrow, specialized</b> blocks while the quiet tails get wide ones. The <b style='color:" + C.muted + "'>gray ticks</b> show naive uniform-in-&sigma; cuts, which would starve some blocks and overload others."));

    function render() {
      var ctx = c.ctx, w = c.w, h = c.h;
      ctx.clearRect(0, 0, w, h);
      var pad = 14, axisY = h - 30;
      var v = makeView(w, axisY + 6, Lmin, Lmax, 0, 0.42, pad);
      // boundaries in q then sigma (log space)
      var bnds = [];
      for (var b = 0; b <= B; b++) {
        var q = qmin + (b / B) * (qmax - qmin);
        bnds.push(Pmean + Pstd * invNormCDF(q)); // = log sigma_b
      }
      // shaded equal-area bands
      for (b = 0; b < B; b++) {
        var t0 = bnds[b], t1 = bnds[b + 1];
        ctx.fillStyle = C.blocks[b % C.blocks.length];
        ctx.globalAlpha = 0.30;
        ctx.beginPath();
        ctx.moveTo(v.X(t0), axisY);
        var STEPS = 40;
        for (var s = 0; s <= STEPS; s++) { var t = lerp(t0, t1, s / STEPS); ctx.lineTo(v.X(t), v.Y(pdfLogSigma(t))); }
        ctx.lineTo(v.X(t1), axisY); ctx.closePath(); ctx.fill();
        ctx.globalAlpha = 1;
        // block label
        var tm = (t0 + t1) / 2;
        ctx.fillStyle = C.blocks[b % C.blocks.length];
        ctx.font = "11px " + MONO; ctx.textAlign = "center";
        ctx.fillText("blk " + (b + 1), v.X(tm), v.Y(pdfLogSigma(tm)) - 6);
        ctx.fillStyle = C.muted; ctx.fillText("1/" + B, v.X(tm), axisY - 6);
      }
      // pdf curve
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath();
      for (s = 0; s <= 200; s++) { var tt = lerp(Lmin, Lmax, s / 200); var X = v.X(tt), Y = v.Y(pdfLogSigma(tt)); if (s === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
      ctx.stroke();
      // equi-prob boundary lines
      for (b = 0; b <= B; b++) {
        ctx.strokeStyle = C.data; ctx.lineWidth = 1; ctx.globalAlpha = 0.8;
        ctx.beginPath(); ctx.moveTo(v.X(bnds[b]), v.Y(pdfLogSigma(bnds[b]))); ctx.lineTo(v.X(bnds[b]), axisY); ctx.stroke();
        ctx.globalAlpha = 1;
      }
      // naive uniform-in-sigma boundaries (gray ticks)
      for (b = 0; b <= B; b++) {
        var sig = SMIN + (b / B) * (SMAX - SMIN);
        var t = Math.log(Math.max(sig, SMIN));
        if (t < Lmin) continue;
        ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.globalAlpha = 0.7;
        ctx.beginPath(); ctx.moveTo(v.X(t), axisY); ctx.lineTo(v.X(t), axisY + 8); ctx.stroke();
        ctx.globalAlpha = 1;
      }
      // axis
      ctx.strokeStyle = C.faint2; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(pad, axisY); ctx.lineTo(w - pad, axisY); ctx.stroke();
      ctx.fillStyle = C.muted; ctx.font = "12px " + MONO; ctx.textAlign = "center";
      var ticks = [0.01, 0.1, 1, 10, 80];
      for (var i = 0; i < ticks.length; i++) {
        var lt = Math.log(ticks[i]); if (lt < Lmin || lt > Lmax) continue;
        ctx.fillText(String(ticks[i]), v.X(lt), axisY + 22);
      }
      ctx.textAlign = "right"; ctx.fillStyle = C.ink; ctx.fillText("noise level  σ  (log scale) →", w - pad, axisY + 22);
    }
    c.onresize = render;
    render();
  }

  /* ======================================================================= *
   *  FIGURE 6 — End-to-end backprop vs. block-wise DiffusionBlocks training.
   *  Animated schematic with two memory meters.
   * ======================================================================= */
  function figMemory(container) {
    var H = 420;
    var c = makeCanvas(container, H);
    var L = 12, B = 4, perBlock = L / B;
    var raf = null, phase = 0, t = 0, e2ePos = 0, e2eDir = 1, activeBlock = 0, blkTimer = 0, blkSigma = "";

    function sigmaLabel(b) {
      var ranges = ["[12.0, 80.0]", "[2.1, 12.0]", "[0.30, 2.1]", "[0.01, 0.30]"];
      return ranges[b % ranges.length];
    }
    blkSigma = sigmaLabel(0);

    container.appendChild(caption("Both train the same 12-layer network. <b style='color:" + C.flow2 + "'>End-to-end</b> (left) must run a full forward pass, <b>store every layer's activations</b>, then backprop through all of them — the memory meter pins at 100%. <b style='color:" + C.data + "'>DiffusionBlocks</b> (right) trains one block at a time on its own noise range: only that block's activations live in memory, so the meter sits near 1/B. Same network, " + B + "&times; less training memory."));

    function panel(ctx, x0, w, title, color) {
      ctx.fillStyle = color; ctx.font = "600 14px " + SANS; ctx.textAlign = "left";
      ctx.fillText(title, x0, 26);
    }

    function layerRects(x0, w) {
      // vertical stack
      var top = 44, bottom = H - 90, gap = 6;
      var lh = (bottom - top - gap * (L - 1)) / L;
      var rects = [];
      for (var i = 0; i < L; i++) rects.push({ x: x0 + 18, y: top + i * (lh + gap), w: w - 36, h: lh });
      return rects;
    }

    function meter(ctx, x, y, w, frac, color, label) {
      ctx.strokeStyle = C.faint2; ctx.lineWidth = 1; ctx.strokeRect(x, y, w, 16);
      ctx.fillStyle = color; ctx.globalAlpha = 0.85; ctx.fillRect(x, y, w * clamp(frac, 0, 1), 16); ctx.globalAlpha = 1;
      ctx.fillStyle = C.ink; ctx.font = "12px " + MONO; ctx.textAlign = "left";
      ctx.fillText(label + " " + Math.round(frac * 100) + "%", x, y + 31);
    }

    function draw() {
      var ctx = c.ctx, w = c.w; ctx.clearRect(0, 0, w, H);
      var halfW = w / 2;
      // ---------- left: end-to-end ----------
      panel(ctx, 14, halfW, "End-to-end backprop", C.flow2);
      var rL = layerRects(0, halfW);
      // animate a forward (down) then backward (up) sweep
      for (var i = 0; i < L; i++) {
        var r = rL[i];
        var lit = (e2eDir > 0 && i <= e2ePos) || (e2eDir < 0 && i >= e2ePos);
        ctx.fillStyle = lit ? C.flow : "rgba(58,166,224,0.16)";
        ctx.fillRect(r.x, r.y, r.w, r.h);
        // "stored activation" marker: all layers stored once forward pass touched them
        if (e2eDir < 0 || i <= e2ePos) { ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.fillRect(r.x + r.w - 8, r.y + r.h / 2 - 2, 4, 4); }
      }
      ctx.fillStyle = C.muted; ctx.font = "11px " + MONO; ctx.textAlign = "center";
      ctx.fillText(e2eDir > 0 ? "forward ↓  (storing activations)" : "backward ↑  (grad through all)", halfW / 2, H - 64);
      meter(ctx, 18, H - 50, halfW - 60, 1.0, C.flow2, "memory");

      // ---------- right: DiffusionBlocks ----------
      panel(ctx, halfW + 14, halfW, "DiffusionBlocks (block-wise)", C.data);
      var rR = layerRects(halfW, halfW);
      for (i = 0; i < L; i++) {
        var rb = rR[i];
        var b = Math.floor(i / perBlock);
        var isActive = (b === activeBlock);
        ctx.fillStyle = isActive ? C.blocks[b % C.blocks.length] : "rgba(255,255,255,0.06)";
        ctx.fillRect(rb.x, rb.y, rb.w, rb.h);
        if (isActive) { ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.fillRect(rb.x + rb.w - 8, rb.y + rb.h / 2 - 2, 4, 4); }
      }
      // bracket + label for active block
      ctx.fillStyle = C.data; ctx.font = "11px " + MONO; ctx.textAlign = "center";
      ctx.fillText("training block " + (activeBlock + 1) + " of " + B + "   ·   σ ∈ " + blkSigma, halfW + halfW / 2, H - 64);
      meter(ctx, halfW + 18, H - 50, halfW - 60, 1 / B, C.data, "memory");
    }

    function loop() {
      t++;
      // end-to-end sweep
      if (t % 5 === 0) {
        e2ePos += e2eDir;
        if (e2ePos > L - 1) { e2ePos = L - 1; e2eDir = -1; }
        else if (e2ePos < 0) { e2ePos = 0; e2eDir = 1; }
      }
      // block cycling
      blkTimer++;
      if (blkTimer > 70) { blkTimer = 0; activeBlock = Math.floor(Math.random() * B); blkSigma = sigmaLabel(activeBlock); }
      draw();
      raf = requestAnimationFrame(loop);
    }
    c.onresize = draw;
    draw();
    // pause when offscreen to be polite
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting && !raf) raf = requestAnimationFrame(loop);
          else if (!e.isIntersecting && raf) { cancelAnimationFrame(raf); raf = null; }
        });
      }, { threshold: 0.05 });
      io.observe(c.cv);
    } else { raf = requestAnimationFrame(loop); }
  }

  /* ----------------------------------------------------------------------- *
   *  Dispatch
   * ----------------------------------------------------------------------- */
  var FIGS = {
    "db-noising": figNoising,
    "db-score": figScore,
    "db-reverse": figReverse,
    "db-euler": figEuler,
    "db-partition": figPartition,
    "db-memory": figMemory
  };
  function boot() {
    Object.keys(FIGS).forEach(function (id) {
      var el = document.getElementById(id);
      if (el && !el.getAttribute("data-db-init")) {
        el.setAttribute("data-db-init", "1");
        try { FIGS[id](el); } catch (e) { if (window.console) console.error("DiffusionBlocks fig " + id + " failed:", e); }
      }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
