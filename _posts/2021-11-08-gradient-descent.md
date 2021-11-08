---
title: Interactive Gradient Descent Demo
updated: 2021-11-08 00:00
---

<!-- Load plotly.js into the DOM -->
<script src='https://cdn.plot.ly/plotly-2.4.2.min.js'></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/rangeslider.js/2.3.3/rangeslider.min.js" integrity="sha512-BUlWdwDeJo24GIubM+z40xcj/pjw7RuULBkxOTc+0L9BaGwZPwiwtbiSVzv31qR7TWx7bs6OPTE5IyfLOorboQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>

<!-- <div id='plot-0'>Plotly chart will be drawn inside this DIV</div> -->

<div id='plot-1'><!-- Plotly chart will be drawn inside this DIV --></div>

<span class="slider-container">
    <span class="slider-label" class="slider-label">X</span>
    <span>
        <input class="slider" id="x-slider" type="range" min="-3" max="3" value="0" step="0.05">
    </span>
    <span class="slider-value" id="x-slider-value">0</span>
</span>

<span class="slider-container">
    <span class="slider-label" >Y</span>
    <input class="slider" id="y-slider" type="range" min="-3" max="3" value="0" step="0.05">
    <span class="slider-value" id="y-slider-value">0</span>
</span>

<span class="slider-container">
    <span class="slider-label" >&#945;</span>
    <input class="slider" id="alpha-slider" type="range" min="0" max="0.2" value="0" step="0.001">
    <span class="slider-value" id="alpha-slider-value">0</span>
</span>


<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/9.5.1/math.js" integrity="sha512-AfRcJIj922x/jSJpQLnry0DYIBg6EGCtwk/MiQ6QvDlzb7kNFxH8EdqXLkaXXY3YHQS9FrSb8H7LzuLn0CZQ1A==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="/assets/js/gradient-descent.js" async></script>