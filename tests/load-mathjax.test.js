const fs = require('fs');
const path = require('path');
const vm = require('vm');

const code = fs.readFileSync(path.resolve(__dirname, '../assets/js/load-mathjax.js'), 'utf8');

describe('load-mathjax.js', () => {
  let sandbox;
  let createdScript;
  let appendedScript;

  beforeEach(() => {
    createdScript = {};
    appendedScript = null;

    const mockDocument = {
      createElement: jest.fn((tagName) => {
        if (tagName === 'script') {
          return createdScript;
        }
        return {};
      }),
      head: {
        appendChild: jest.fn((element) => {
          appendedScript = element;
        }),
      },
    };

    sandbox = {
      window: {},
      document: mockDocument,
    };

    vm.createContext(sandbox);
  });

  test('should configure MathJax global object', () => {
    vm.runInContext(code, sandbox);
    expect(sandbox.window.MathJax).toBeDefined();
    expect(sandbox.window.MathJax.loader).toBeDefined();
    expect(sandbox.window.MathJax.tex).toBeDefined();
    expect(sandbox.window.MathJax.svg).toBeDefined();
  });

  test('should create and append script with correct attributes', () => {
    vm.runInContext(code, sandbox);

    expect(sandbox.document.createElement).toHaveBeenCalledWith('script');
    expect(sandbox.document.head.appendChild).toHaveBeenCalledWith(createdScript);
    expect(appendedScript).toBe(createdScript);

    expect(createdScript.src).toBe('https://cdn.jsdelivr.net/npm/mathjax@3.1.4/es5/tex-svg.js');
    expect(createdScript.integrity).toBe('sha384-h2WL2PP3/CnuQJQYwBa8km8+XBeeGN4CnrHEfGUTAlvLf+OolpJzxlrAuvg1F3bX');
    expect(createdScript.crossOrigin).toBe('anonymous');
    expect(createdScript.async).toBe(true);
  });
});
