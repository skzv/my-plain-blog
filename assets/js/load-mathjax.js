window.MathJax = {
    tex: {
      inlineMath: [['$$', '$$'], ['\\(', '\\)']],
    //   linebreaks: { automatic: true }
    },
    svg: {
      fontCache: 'global',
    //   linebreaks: { automatic: true }
    },
  };
  
  (function () {
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3.1/es5/tex-svg.js';
    script.async = true;
    document.head.appendChild(script);
  })();