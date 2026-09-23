# DiffusionBlocks post redirect

The DiffusionBlocks explainer (`/diffusionblocks-explained`) was removed on 2026-06-15 when it
moved to https://intuitivepapers.ai/diffusionblocks/. The old URL then 404ed, losing any
links to it (it was the flagship link in intuitivepapers.ai's own brief).

`diffusionblocks-explained.html` restores the URL as an instant redirect: meta refresh plus a
`rel=canonical` to the new page (GitHub Pages cannot send a 301; Google treats an instant
meta refresh as a permanent redirect). It is excluded from the sitemap.
