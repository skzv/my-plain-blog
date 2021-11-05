---
title: Gradient Descent vs Newton-Gauss Optimization Visualized
updated: 2021-04-25 00:00
---

<!-- Load plotly.js into the DOM -->
<script src='https://cdn.plot.ly/plotly-2.4.2.min.js'></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/rangeslider.js/2.3.3/rangeslider.min.css" integrity="sha512-Rp0yZ3NMh1xOUZ4VHYggmX4pq4ZJdpcOETH03qBD5qNDsqTBw1MzUnX0T5PcTJmr2mNTOmtbxsHaGwzjylNpHA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
<script src="https://cdnjs.cloudflare.com/ajax/libs/rangeslider.js/2.3.3/rangeslider.min.js" integrity="sha512-BUlWdwDeJo24GIubM+z40xcj/pjw7RuULBkxOTc+0L9BaGwZPwiwtbiSVzv31qR7TWx7bs6OPTE5IyfLOorboQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>

This is an article on gradient descent. 

<div id='plot-0'><!-- Plotly chart will be drawn inside this DIV --></div>

Add Quiver ZingChart here.
Make opacity a button. 

<div id='plot-1'><!-- Plotly chart will be drawn inside this DIV --></div>

<div id='plot-2'><!-- Plotly chart will be drawn inside this DIV --></div>

<input style="width: 100%;" id="x-slider" type="range" min="-3" max="3" value="0" step="0.05">
<input style="width: 100%;" id="y-slider" type="range" min="-3" max="3" value="0" step="0.05">
<input style="width: 100%;" id="alpha-slider" type="range" min="0" max="0.1" value="0" step="0.001">

<div id='plot-3'><!-- Plotly chart will be drawn inside this DIV --></div>

<div id='plot-4'><!-- Plotly chart will be drawn inside this DIV --></div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/9.5.1/math.js" integrity="sha512-AfRcJIj922x/jSJpQLnry0DYIBg6EGCtwk/MiQ6QvDlzb7kNFxH8EdqXLkaXXY3YHQS9FrSb8H7LzuLn0CZQ1A==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="/assets/js/gradient-descent.js" async></script>