---
title: 3D Reconstruction From Public Photos with Machine Learning
updated: 2025-08-21 00:00
imgpath: /assets/img/3d-reconstruction
previewurl: /preview.png
---

{% include description.html content="Can we reconstruct the world from public photos?" %}

#### Mapping the World

The internet provides an abundance of public photos from various sources: Reddit, Youtube, Google Maps photo uploads, and so forth.

![Google Maps Photos Example]({{ "/google-maps-photos.png" | prepend: page.imgpath }}){:height="400px"}
{% include caption.html content="Public photos available on Google Maps" %}

I wondered: is it possible to create a 3D map of the world from all this data? Cameras remove all the 3D information when the photo is taken - but using state of the art machine learning, we can bring it back, and turn a photo like this:

![Safeway Input Image 0]({{ "/safeway-1.webp" | prepend: page.imgpath }})
{% include caption.html content="Public Safeway input image 0." %}

Into a 3D model like this:

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback height="500">
        <source src="assets/video/3d-reconstruction/safeway-1-recording.mp4" type="video/mp4">
        Your browser does not support the video tag.
    </video>
</div>

Another example, from the famous Singapore Airport:

![SG Airport Input Image]({{ "/sg-airport-0.jpeg" | prepend: page.imgpath }}){:height="600px"}
{% include caption.html content="Public SG Airport input image." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback height="800">
        <source src="assets/video/3d-reconstruction/sg-airport-recording.mp4" type="video/mp4">
        Your browser does not support the video tag.
    </video>
</div>

And even an image of a forest:

![Forest Input Image]({{ "/forest-0.jpg" | prepend: page.imgpath }})
{% include caption.html content="Public Forest input image." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback height="400">
        <source src="assets/video/3d-reconstruction/forest-recording.mp4" type="video/mp4">
        Your browser does not support the video tag.
    </video>
</div>

To achieve this, I used an ML depth model and some linear algebra.

### Camera Projection

We can consider a camera as performing a projection from 3D to 2D, as in the image below. This removes information about the 3rd dimension: depth.

![Camera Projection Visualization]({{ "/camera-projection.png" | prepend: page.imgpath }})
{% include caption.html content="Camera projection from 3D to 2D. Source: [1]" %}

Our task is to recover this 3rd dimension, and then figure out how to undo this projection.

### Camera Intrinsics 

It is not sufficient to know the depth for every pixel in the image to reconstruct it in 3D. This is because the properties of the camera - most importantly the focal length - determine how points in 3D get mapped to pixels in 2D, and so to undo this mapping, we need to have these properties of the camera. Consider the demonstration of this below, where different focal lengths produce significantly different images:

![Face vs Focal Length Demonstration]({{ "/face-focal-length.gif" | prepend: page.imgpath }}){:height="400px"}
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

![Camera Perspective Projection]({{ "/camera-perspective-focal.png" | prepend: page.imgpath }})
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

![Complete Camera Model]({{ "/complete-camera-model.jpg" | prepend: page.imgpath }})
{% include caption.html content="Complete Camera Model. Source: [3]" %}

### Depth Masks

Apple recently released the [DepthPro model](https://github.com/apple/ml-depth-pro), which made this possible. Depth models have existed for a long time, but I noticed this model was different in 2 ways:
    1. It provided depth in an absolute, metric scale, which meant 3D reconstructions would actually have metric proportions, even when generated from a single mono image
    2. It estimated the focal length of the camera for me

![Depth Pro Teaser]({{ "/depth-pro-teaser.jpg" | prepend: page.imgpath }})
{% include caption.html content="Depth Pro Teaser. Source: [4]" %}

I ran this model on a bunch of public photos, estimating the depth masks and focal lengths, as shown below. For example, for this image:

![Safeway Input Image 1]({{ "/safeway-1.webp" | prepend: page.imgpath }})
{% include caption.html content="Public Safeway input image 1." %}

The corresponding estimated depth mask and focal length are:

![Safeway depth mask 1]({{ "/safeway-1-depth-black.png" | prepend: page.imgpath }})
{% include caption.html content="Safeway depth mask 1 and focal length predicted by the DepthPro model." %}

I then used equations $$(2)$$ to map each pixel back into 3D, created a point cloud, and then visualized it with Open3D: 

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback height="500">
        <source src="assets/video/3d-reconstruction/safeway-1-recording.mp4" type="video/mp4">
        Your browser does not support the video tag.
    </video>
</div>

### 3D Reconstruction

Check out all my examples, below. I was curious to see how well it would work on a huge scene, like the skyline of NYC. Expectedly, the depth pro model did not produce a good depth mask. The model is generated from iPhone LiDAR data, so it's no wonder they didn't have accurate skyline depth training data for their model. 

#### COEX Mall

![Coex Mall Input Image]({{ "/coex-0.jpg" | prepend: page.imgpath }})
{% include caption.html content="Public COEX Mall input image." %}

![Coex Mall depth mask]({{ "/coex-0-depth-black.png" | prepend: page.imgpath }})
{% include caption.html content="COEX Mall depth mask and focal length predicted by the DepthPro model. " %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback height="500">
        <source src="assets/video/3d-reconstruction/coex-recording.mp4" type="video/mp4">
        Your browser does not support the video tag.
    </video>
</div>

<div class="divider"></div>

#### Forest

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

<div class="divider"></div>

#### NYC Skyline

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

<div class="divider"></div>

#### Safeway 1

![Safeway Input Image 0]({{ "/safeway-0.webp" | prepend: page.imgpath }})
{% include caption.html content="Public Safeway input image 0." %}

![Safeway depth mask 0]({{ "/safeway-0-depth-black.png" | prepend: page.imgpath }})
{% include caption.html content="Safeway depth mask 0 and focal length predicted by the DepthPro model." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback height="500">
        <source src="assets/video/3d-reconstruction/safeway-0-recording.mp4" type="video/mp4">
        Your browser does not support the video tag.
    </video>
</div>

<div class="divider"></div>

#### Safeway 2

![Safeway Input Image 1]({{ "/safeway-1.webp" | prepend: page.imgpath }})
{% include caption.html content="Public Safeway input image 1." %}

![Safeway depth mask 1]({{ "/safeway-1-depth-black.png" | prepend: page.imgpath }})
{% include caption.html content="Safeway depth mask 1 and focal length predicted by the DepthPro model." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback height="500">
        <source src="assets/video/3d-reconstruction/safeway-1-recording.mp4" type="video/mp4">
        Your browser does not support the video tag.
    </video>
</div>

<div class="divider"></div>

#### Singapore Airport

![SG Airport Input Image]({{ "/sg-airport-0.jpeg" | prepend: page.imgpath }}){:height="600px"}
{% include caption.html content="Public SG Airport input image." %}

![SG Airport depth mask]({{ "/sg-airport-0-depth-black.png" | prepend: page.imgpath }})
{% include caption.html content="SG Airport depth mask and focal length predicted by the DepthPro model." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback height="800">
        <source src="assets/video/3d-reconstruction/sg-airport-recording.mp4" type="video/mp4">
        Your browser does not support the video tag.
    </video>
</div>

<div class="divider"></div> 

#### Footnotes

1. Camera projection from 3D to 2D. Source: [ResearchGate](https://www.researchgate.net/figure/The-perspective-projection-of-a-camera-model_fig2_324584663)
2. A demonstration of the effect of focal length on image. Source: [DIY Photography](https://www.diyphotography.net/gif-explains-changing-focal-length-impacts-portrait)
3. Complete Camera Model. Source: [Robot Academy](https://robotacademy.net.au/lesson/summary-of-image-geometry/)
4. Depth Pro Teaser. Source: [Apple](https://github.com/apple/ml-depth-pro)


<script src='https://cdn.plot.ly/plotly-2.4.2.min.js'></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/9.5.1/math.js" integrity="sha512-AfRcJIj922x/jSJpQLnry0DYIBg6EGCtwk/MiQ6QvDlzb7kNFxH8EdqXLkaXXY3YHQS9FrSb8H7LzuLn0CZQ1A==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>