---
title: 3D Reconstruction of Public Photos with Machine Learning
updated: 2025-08-21 00:00
imgpath: /assets/img/3d-reconstruction
previewurl: /preview.png
---

![Coex Mall Input Image]({{ "/coex-0.jpg" | prepend: page.imgpath }})
{% include caption.html content="Public COEX Mall input image." %}

![Coex Mall depth mask]({{ "/coex-0-depth-black.png" | prepend: page.imgpath }})
{% include caption.html content="COEX Mall depth mask and focal length predicted by the DepthPro model. " %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback height="400">
        <source src="assets/video/3d-reconstruction/coex-recording.mp4" type="video/mp4">
        Your browser does not support the video tag.
    </video>
</div>

![Forest Input Image]({{ "/forest-0.jpg" | prepend: page.imgpath }})
{% include caption.html content="Public Forest input image." %}

![Forest depth mask]({{ "/forest-0-depth-black.png" | prepend: page.imgpath }})
{% include caption.html content="Forest depth mask and focal length predicted by the DepthPro model." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback height="400">
        <source src="assets/video/3d-reconstruction/forest-recording.mp4" type="video/mp4">
        Your browser does not support the video tag.
    </video>
</div>

![NYC Input Image]({{ "/nyc-0.jpg" | prepend: page.imgpath }})
{% include caption.html content="Public NYC input image." %}

![NYC depth mask]({{ "/nyc-depth-black.png" | prepend: page.imgpath }})
{% include caption.html content="NYC depth mask and focal length predicted by the DepthPro model." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback height="400">
        <source src="assets/video/3d-reconstruction/nyc-recording.mp4" type="video/mp4">
        Your browser does not support the video tag.
    </video>
</div>

![Safeway Input Image 0]({{ "/safeway-0.webp" | prepend: page.imgpath }})
{% include caption.html content="Public Safeway input image 0." %}

![Safeway depth mask 0]({{ "/safeway-0-depth-black.png" | prepend: page.imgpath }})
{% include caption.html content="Safeway depth mask 0 and focal length predicted by the DepthPro model." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback height="400">
        <source src="assets/video/3d-reconstruction/safeway-0-recording.mp4" type="video/mp4">
        Your browser does not support the video tag.
    </video>
</div>

![Safeway Input Image 1]({{ "/safeway-1.webp" | prepend: page.imgpath }})
{% include caption.html content="Public Safeway input image 1." %}

![Safeway depth mask 1]({{ "/safeway-1-depth-black.png" | prepend: page.imgpath }})
{% include caption.html content="Safeway depth mask 1 and focal length predicted by the DepthPro model." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback height="400">
        <source src="assets/video/3d-reconstruction/safeway-1-recording.mp4" type="video/mp4">
        Your browser does not support the video tag.
    </video>
</div>

![SG Airport Input Image]({{ "/sg-airport-0.jpeg" | prepend: page.imgpath }})
{% include caption.html content="Public SG Airport input image." %}

![SG Airport depth mask]({{ "/sg-airport-0-depth-black.png" | prepend: page.imgpath }})
{% include caption.html content="SG Airport depth mask and focal length predicted by the DepthPro model." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback height="400">
        <source src="assets/video/3d-reconstruction/sg-airport-recording.mp4" type="video/mp4">
        Your browser does not support the video tag.
    </video>
</div>

<script src='https://cdn.plot.ly/plotly-2.4.2.min.js'></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/9.5.1/math.js" integrity="sha512-AfRcJIj922x/jSJpQLnry0DYIBg6EGCtwk/MiQ6QvDlzb7kNFxH8EdqXLkaXXY3YHQS9FrSb8H7LzuLn0CZQ1A==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>