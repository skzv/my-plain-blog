window.MathJax = {
    loader: {load: ['[tex]/cancel']},
    tex: {
      inlineMath: [['$$', '$$'], ['\\(', '\\)']],
      packages: {'[+]': ['cancel']},
    //   linebreaks: { automatic: true }
    },
    svg: {
      fontCache: 'global',
    //   linebreaks: { automatic: true }
    },
  };
  
  (function () {
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3.1.4/es5/tex-svg.js';
    script.integrity = 'sha384-h2WL2PP3/CnuQJQYwBa8km8+XBeeGN4CnrHEfGUTAlvLf+OolpJzxlrAuvg1F3bX';
    script.crossOrigin = 'anonymous';
    script.async = true;
    document.head.appendChild(script);
  })();
