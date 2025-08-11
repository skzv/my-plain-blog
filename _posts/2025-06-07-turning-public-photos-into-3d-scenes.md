---
title: Turning Public Photos into 3D scenes
updated: 2025-06-07 00:00
imgpath: /assets/img/predicting-market-open
previewurl: /preview.png
---

#### _Predicting the Future_

<button id="print-cam-button" style="display: block; margin: 10px;">Print Camera Position</button>

<model-viewer
  style="width:100%; height:600px;"
  src="assets/mesh/sg-airport-0_output_ply.glb"
  alt="Singapore Airport Reconstruction"
  camera-controls
  auto-rotate
  rotation-per-second="1deg"
  orientation="0deg 30deg 0deg"
  camera-orbit="1.45deg 31.02deg 54.54m"
  camera-target="-0.75m -3.46m -2.53m"
  field-of-view="7.96deg"
  min-field-of-view="5deg"
  min-camera-orbit="-8.55deg 21.02deg 0.1m"
  max-camera-orbit="11.45deg 41.02deg auto"
>
</model-viewer>
<model-viewer
  style="width:100%; height:600px;"
  src="assets/mesh/safeway-1_output_ply.glb"
  alt="Singapore Airport Reconstruction"
  camera-controls
  auto-rotate
  rotation-per-second="1deg"
  orientation="60deg 200deg 80deg"
  camera-orbit="0deg 0deg 0m"
  camera-target="auto"
  min-field-of-view="5deg"
>
</model-viewer>
<model-viewer
  style="width:100%; height:600px;"
  src="assets/mesh/safeway-1_output_ply.glb"
  alt="Singapore Airport Reconstruction"
  camera-controls
  camera-target="auto"
>
</model-viewer>
<model-viewer
  style="width:100%; height:600px;"
  src="assets/mesh/safeway-0_output_ply.glb"
  alt="Singapore Airport Reconstruction"
  camera-controls
  camera-target="auto"
>
</model-viewer>
<model-viewer
  style="width:100%; height:600px;"
  src="assets/mesh/coex-0_output_ply.glb"
  alt="Singapore Airport Reconstruction"
  camera-controls
  camera-target="auto"
>
</model-viewer>
<model-viewer
  style="width:100%; height:600px;"
  src="assets/mesh/forest-0_output_ply.glb"
  alt="Singapore Airport Reconstruction"
  camera-controls
  camera-target="auto"
>
</model-viewer>
<model-viewer
  style="width:100%; height:600px;"
  src="assets/mesh/nyc-0_output_ply.glb"
  alt="Singapore Airport Reconstruction"
  camera-controls
  camera-target="auto"
>
</model-viewer>
<!-- <model-viewer style="width:100%;height:600px;" src="assets/mesh/sg-airport-0_output_ply.glb" alt="Singapore Airport Reconstruction" auto-rotate camera-controls></model-viewer> -->

<script>    
    const setupModelViewer = () => {
        console.log("DOM is ready, running setupModelViewer() function.");

        const modelViewer = document.querySelector('model-viewer');
        const printCamButton = document.querySelector('#print-cam-button');

        if (!modelViewer) {
            console.error("Setup failed: <model-viewer> element not found.");
            return;
        }

        if (!printCamButton) {
            console.error("Setup failed: Button with ID 'print-cam-button' not found.");
            return;
        }

        printCamButton.addEventListener('click', () => {
            console.log("Button clicked! Getting camera parameters...");
            
            const orbit = modelViewer.getCameraOrbit();
            const target = modelViewer.getCameraTarget();
            const fov = modelViewer.getFieldOfView();

            const thetaDeg = orbit.theta * (180 / Math.PI);
            const phiDeg = orbit.phi * (180 / Math.PI);

            console.log('--- Copy these attributes into your <model-viewer> tag ---');
            console.log(`camera-orbit="${thetaDeg.toFixed(2)}deg ${phiDeg.toFixed(2)}deg ${orbit.radius.toFixed(2)}m"`);
            console.log(`camera-target="${target.x.toFixed(2)}m ${target.y.toFixed(2)}m ${target.z.toFixed(2)}m"`);
            console.log(`field-of-view="${fov.toFixed(2)}deg"`);
            console.log('----------------------------------------------------------');
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupModelViewer);
    } else {
        console.log("DOM was already ready, running setup directly.");
        setupModelViewer();
    }
</script>


<script src='https://cdn.plot.ly/plotly-2.4.2.min.js'></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/9.5.1/math.js" integrity="sha512-AfRcJIj922x/jSJpQLnry0DYIBg6EGCtwk/MiQ6QvDlzb7kNFxH8EdqXLkaXXY3YHQS9FrSb8H7LzuLn0CZQ1A==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"></script>
