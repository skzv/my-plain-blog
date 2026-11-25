---
title: 3D Reconstruction From Public Photos with Machine Learning
last_modified_at: 2025-08-21 00:00
imgpath: /assets/img/3d-reconstruction
previewurl: /3d-reconstruction-preview.png
description: "Reconstructing public photos in 3D with Apple Depth Pro, camera projection, and Open3D. Examples show depth estimates, point clouds, and model limitations."
image: /assets/img/3d-reconstruction/3d-reconstruction-preview.png
image_width: 1200
image_height: 630
image_alt: "3D reconstruction of a public photo using estimated depth"
tags: [computer-vision, 3d-graphics, machine-learning]
toc: true
mathjax: true
---

{% include description.html content="Can we reconstruct the world from public photos?" %}

## Mapping the World

The internet provides an abundance of public photos from various sources: Reddit, Youtube, Google Maps photo uploads, and so forth.

![Google Maps Photos Example]({{ "/google-maps-photos.webp" | prepend: page.imgpath }}){: width="1600" height="1232" fetchpriority="high" decoding="async" style="max-height:400px;width:auto"}
{% include caption.html content="Public photos available on Google Maps" %}

I wondered: is it possible to create a 3D map of the world from all this data? Cameras remove all the 3D information when the photo is taken - but using state of the art machine learning, we can bring it back, and turn a photo like this:

![Safeway Input Image 0]({{ "/safeway-1.webp" | prepend: page.imgpath }}){: width="680" height="510" loading="lazy" decoding="async"}
{% include caption.html content="Public Safeway input image 0." %}

Into a 3D model like this:

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1360" height="810" poster="/assets/video/3d-reconstruction/safeway-1-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/safeway-1-recording.mp4" type="video/mp4">
        Your browser does not support the video tag.
    </video>
</div>

Another example, from the famous Singapore Airport:

![SG Airport Input Image]({{ "/sg-airport-0.jpeg" | prepend: page.imgpath }}){: width="960" height="1280" loading="lazy" decoding="async" style="max-height:600px;width:auto"}
{% include caption.html content="Public SG Airport input image." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1012" height="1008" poster="/assets/video/3d-reconstruction/sg-airport-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/sg-airport-recording.mp4" type="video/mp4">
        Your browser does not support the video tag.
    </video>
</div>

And even an image of a forest:

![Forest Input Image]({{ "/forest-0.jpg" | prepend: page.imgpath }}){: width="1500" height="900" loading="lazy" decoding="async"}
{% include caption.html content="Public Forest input image." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1358" height="714" poster="/assets/video/3d-reconstruction/forest-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/forest-recording.mp4" type="video/mp4">
        Your browser does not support the video tag.
    </video>
</div>

To achieve this, I used an ML depth model and some linear algebra.

## Camera Projection

We can consider a camera as performing a projection from 3D to 2D, as in the image below. This removes information about the 3rd dimension: depth.

![Camera Projection Visualization]({{ "/camera-projection.png" | prepend: page.imgpath }}){: width="850" height="356" loading="lazy" decoding="async"}
{% include caption.html content="Camera projection from 3D to 2D. Source: [1]" %}

Our task is to recover this 3rd dimension, and then figure out how to undo this projection.

## Camera Intrinsics

It is not sufficient to know the depth for every pixel in the image to reconstruct it in 3D. This is because the properties of the camera - most importantly the focal length - determine how points in 3D get mapped to pixels in 2D, and so to undo this mapping, we need to have these properties of the camera. Consider the demonstration of this below, where different focal lengths produce significantly different images:

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="600" height="600" poster="/assets/video/3d-reconstruction/face-focal-length-poster.webp" style="max-height:400px;width:auto">
        <source src="/assets/video/3d-reconstruction/face-focal-length.mp4" type="video/mp4">
        Your browser does not support the video tag.
    </video>
</div>
{% include caption.html content="A demonstration of the effect of focal length on image. Source: [2]" %}

Logically it follows that if we want to reconstruct the face in 3D from any of these images, we need to know the camera properties.

Using properties of similar triangles shown below, it can be seen that the relation between the image points and the 3D points are simple:

{%include math.html content=
"
\begin{align}
x = f \frac{X}{Z} \space\space\space\space\space y = f \frac{Y}{Z} \tag{1} \label{eq:camera perspective projection}
\end{align}
" 
%}

![Camera Perspective Projection]({{ "/camera-perspective-focal.png" | prepend: page.imgpath }}){: width="1073" height="834" loading="lazy" decoding="async"}
{% include caption.html content="Camera Perspective Projection" %}

Reversing this transformation to map image points back to 3D, we find:

{%include math.html content=
"
\begin{align}
X = \frac{x \cdot Z}{f} \space\space\space\space\space Y = \frac{y \cdot Z}{f} \space\space\space\space\space Z = Z \tag{2} \label{eq:inverse camera perspective projection}
\end{align}
" 
%}

So, the two missing pieces we need are the depth at each pixel, $$Z$$, and the focal length of the camera, $$f$$. Neither of these are immediately available from public photos. The EXIF data, which may have camera information, is typically removed. 

Note, it's also possible to describe the full transformation between 3D and 2D coordinate frames, taking into account the camera's pose, shown below. But for the purpose of this article, we just consider the camera's local coordinate frame. 

![Complete Camera Model]({{ "/complete-camera-model.jpg" | prepend: page.imgpath }}){: width="1280" height="720" loading="lazy" decoding="async"}
{% include caption.html content="Complete Camera Model. Source: [3]" %}

## Depth Masks

Apple's recently released [DepthPro model](https://github.com/apple/ml-depth-pro) made this project possible. While depth models have existed for a long time, I noticed this model was different in two ways:
    1. It provided depth in an absolute, metric scale, which meant 3D reconstructions would actually have metric proportions, even when generated from a single mono image
    2. It estimated the focal length of the camera for me

![Depth Pro Teaser]({{ "/depth-pro-teaser.webp" | prepend: page.imgpath }}){: width="1242" height="535" loading="lazy" decoding="async"}
{% include caption.html content="Depth Pro Teaser. Source: [4]" %}

I ran this model on a bunch of public photos, estimating the depth masks and focal lengths, as shown below. For example, for this image:

![Safeway Input Image 1]({{ "/safeway-1.webp" | prepend: page.imgpath }}){: width="680" height="510" loading="lazy" decoding="async"}
{% include caption.html content="Public Safeway input image 1." %}

The corresponding estimated depth mask and focal length are:

![Safeway depth mask 1]({{ "/safeway-1-depth-black.png" | prepend: page.imgpath }}){: width="507" height="396" loading="lazy" decoding="async"}
{% include caption.html content="Safeway depth mask 1 and focal length predicted by the DepthPro model." %}

I then used equations $$(2)$$ to map each pixel back into 3D, created a point cloud, and then visualized it with Open3D: 

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1360" height="810" poster="/assets/video/3d-reconstruction/safeway-1-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/safeway-1-recording.mp4" type="video/mp4">
        Your browser does not support the video tag.
    </video>
</div>

## 3D Reconstruction

Check out all my examples, below. Notably, check out the NYC skyline example. I was curious to see how well it would work on a huge scene, like the skyline of NYC. As expected, the depth pro model did not produce a good depth mask. The training dataset almost certainly focused on smaller scales.

### COEX Mall

![Coex Mall Input Image]({{ "/coex-0.jpg" | prepend: page.imgpath }}){: width="924" height="483" loading="lazy" decoding="async"}
{% include caption.html content="Public COEX Mall input image." %}

![Coex Mall depth mask]({{ "/coex-0-depth-black.png" | prepend: page.imgpath }}){: width="506" height="389" loading="lazy" decoding="async"}
{% include caption.html content="COEX Mall depth mask and focal length predicted by the DepthPro model. " %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1398" height="848" poster="/assets/video/3d-reconstruction/coex-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/coex-recording.mp4" type="video/mp4">
        Your browser does not support the video tag.
    </video>
</div>

<div class="divider"></div>

### Forest

![Forest Input Image]({{ "/forest-0.jpg" | prepend: page.imgpath }}){: width="1500" height="900" loading="lazy" decoding="async"}
{% include caption.html content="Public Forest input image." %}

![Forest depth mask]({{ "/forest-0-depth-black.png" | prepend: page.imgpath }}){: width="506" height="389" loading="lazy" decoding="async"}
{% include caption.html content="Forest depth mask and focal length predicted by the DepthPro model." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1358" height="714" poster="/assets/video/3d-reconstruction/forest-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/forest-recording.mp4" type="video/mp4">
        Your browser does not support the video tag.
    </video>
</div>

<div class="divider"></div>

### NYC Skyline

![NYC Input Image]({{ "/nyc-0.webp" | prepend: page.imgpath }}){: width="1000" height="560" loading="lazy" decoding="async"}
{% include caption.html content="Public NYC input image." %}

![NYC depth mask]({{ "/nyc-depth-black.png" | prepend: page.imgpath }}){: width="498" height="389" loading="lazy" decoding="async"}
{% include caption.html content="NYC depth mask and focal length predicted by the DepthPro model." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1382" height="714" poster="/assets/video/3d-reconstruction/nyc-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/nyc-recording.mp4" type="video/mp4">
        Your browser does not support the video tag.
    </video>
</div>

<div class="divider"></div>

### Safeway 1

![Safeway Input Image 0]({{ "/safeway-0.webp" | prepend: page.imgpath }}){: width="680" height="510" loading="lazy" decoding="async"}
{% include caption.html content="Public Safeway input image 0." %}

![Safeway depth mask 0]({{ "/safeway-0-depth-black.png" | prepend: page.imgpath }}){: width="506" height="396" loading="lazy" decoding="async"}
{% include caption.html content="Safeway depth mask 0 and focal length predicted by the DepthPro model." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1066" height="776" poster="/assets/video/3d-reconstruction/safeway-0-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/safeway-0-recording.mp4" type="video/mp4">
        Your browser does not support the video tag.
    </video>
</div>

<div class="divider"></div>

### Safeway 2

![Safeway Input Image 1]({{ "/safeway-1.webp" | prepend: page.imgpath }}){: width="680" height="510" loading="lazy" decoding="async"}
{% include caption.html content="Public Safeway input image 1." %}

![Safeway depth mask 1]({{ "/safeway-1-depth-black.png" | prepend: page.imgpath }}){: width="507" height="396" loading="lazy" decoding="async"}
{% include caption.html content="Safeway depth mask 1 and focal length predicted by the DepthPro model." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1360" height="810" poster="/assets/video/3d-reconstruction/safeway-1-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/safeway-1-recording.mp4" type="video/mp4">
        Your browser does not support the video tag.
    </video>
</div>

<div class="divider"></div>

### Singapore Airport

![SG Airport Input Image]({{ "/sg-airport-0.jpeg" | prepend: page.imgpath }}){: width="960" height="1280" loading="lazy" decoding="async" style="max-height:600px;width:auto"}
{% include caption.html content="Public SG Airport input image." %}

![SG Airport depth mask]({{ "/sg-airport-0-depth-black.png" | prepend: page.imgpath }}){: width="387" height="432" loading="lazy" decoding="async"}
{% include caption.html content="SG Airport depth mask and focal length predicted by the DepthPro model." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1012" height="1008" poster="/assets/video/3d-reconstruction/sg-airport-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/sg-airport-recording.mp4" type="video/mp4">
        Your browser does not support the video tag.
    </video>
</div>

<div class="divider"></div> 

## Footnotes

1. Camera projection from 3D to 2D. Source: [ResearchGate](https://www.researchgate.net/figure/The-perspective-projection-of-a-camera-model_fig2_324584663)
2. A demonstration of the effect of focal length on image. Source: [DIY Photography](https://www.diyphotography.net/gif-explains-changing-focal-length-impacts-portrait)
3. Complete Camera Model. Source: [Robot Academy](https://robotacademy.net.au/lesson/summary-of-image-geometry/)
4. Depth Pro Teaser. Source: [Apple](https://github.com/apple/ml-depth-pro)
