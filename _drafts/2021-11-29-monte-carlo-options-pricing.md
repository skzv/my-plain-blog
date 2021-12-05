---
title: Monte Carlo Options Pricing
updated: 2021-12-07 00:00
imgpath: /assets/img/gradient-descent
previewurl: /gradient-descent-preview.png
---

#### _The options casino_

<div id='plot-0'></div>
<span class="slider-container">
    <span class="slider-label" class="slider-label">$$\mu_y$$</span>
    <span>
        <input class="slider" id="mean-slider" type="range" min="-2.5" max="1" value="0" step="0.01">
    </span>
    <span class="slider-value" id="mean-slider-value">0</span>
</span>

<span class="slider-container">
    <span class="slider-label" class="slider-label">$$\sigma_y$$</span>
    <span>
        <input class="slider" id="sigma-slider" type="range" min="0" max="1" value="0" step="0.01">
    </span>
    <span class="slider-value" id="sigma-slider-value">0</span>
</span>

<button class="regenerate-button" onclick="regenerate0()">Regenerate</button>

<div id='mean-0'>0</div>
<div id='sigma-0'>0</div>

<div id='plot-1'></div>
<button class="regenerate-button" onclick="regenerate1()">Regenerate</button>
<div id='mean-1'>0</div>
<div id='sigma-1'>0</div>

<div id='plot-2'></div>
<button class="regenerate-button" onclick="regenerate2()">Regenerate</button>
<div id='mean-2'>0</div>
<div id='sigma-2'>0</div>

<script src='https://cdn.plot.ly/plotly-2.4.2.min.js'></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/9.5.1/math.js" integrity="sha512-AfRcJIj922x/jSJpQLnry0DYIBg6EGCtwk/MiQ6QvDlzb7kNFxH8EdqXLkaXXY3YHQS9FrSb8H7LzuLn0CZQ1A==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.inview/1.0.0/jquery.inview.min.js" integrity="sha512-dy8Q+KMsxJmEgLqvZA7kk/Pcaij/OhCK1LPj+oGuxfd/tcbbqrDSGOtiXNfzKbMun+ZBnQsTWUnhuXhVkISDOA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="/assets/js/monte-carlo-options.js" async></script>