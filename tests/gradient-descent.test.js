const fs = require('fs');
const path = require('path');
const vm = require('vm');

const code = fs.readFileSync(path.resolve(__dirname, '../assets/js/gradient-descent.js'), 'utf8');

// Mock browser environment
const mockDocument = {
  getElementById: () => ({ oninput: null, innerHTML: '', value: '0' }),
};
const mockPlotly = {
  newPlot: () => {},
  addTraces: () => {},
  animate: () => {},
};

// Minimal mathjs mock
const mockMath = {
  matrix: (arg) => ({
    get: (idx) => arg[idx[0]],
    toArray: () => arg,
    size: () => [arg.length]
  }),
  forEach: (arr, callback) => {
    if (arr && arr.forEach) arr.forEach(callback);
  },
  pow: Math.pow,
  exp: Math.exp,
  abs: Math.abs,
  subtract: (a, b) => ({
    get: (idx) => (a.get ? a.get(idx) : a[idx[0]]) - (b.get ? b.get(idx) : b[idx[0]])
  }),
  multiply: (s, v) => ({
    get: (idx) => s * (v.get ? v.get(idx) : v[idx[0]])
  }),
  range: () => ({ toArray: () => [] })
};

const sandbox = {
  document: mockDocument,
  Plotly: mockPlotly,
  math: mockMath,
  window: {},
  console: { log: jest.fn() },
};

vm.createContext(sandbox);
// Execute the code in the sandbox to load functions into the sandbox object
vm.runInContext(code, sandbox);

describe('gradient-descent.js', () => {
  const { evaluateAt, getX, getY } = sandbox;

  test('getX should return the first element of a matrix-like point', () => {
    const P = { get: (idx) => (idx[0] === 0 ? 10 : 20) };
    expect(getX(P)).toBe(10);
  });

  test('getY should return the second element of a matrix-like point', () => {
    const P = { get: (idx) => (idx[0] === 1 ? 20 : 10) };
    expect(getY(P)).toBe(20);
  });

  test('evaluateAt should call f with x and y coordinates of P', () => {
    const mockF = jest.fn((x, y) => x + y);
    const P = { get: (idx) => (idx[0] === 0 ? 3 : 4) };

    const result = evaluateAt(mockF, P);

    expect(mockF).toHaveBeenCalledWith(3, 4);
    expect(result).toBe(7);
  });

  test('evaluateAt works with multiple types of functions', () => {
    const f1 = (x, y) => x * y;
    const P = { get: (idx) => (idx[0] === 0 ? 5 : 6) };
    expect(evaluateAt(f1, P)).toBe(30);
  });

  test('evaluateAt works with functions returning objects/matrices', () => {
    const fMock = (x, y) => ({ sum: x + y, diff: x - y });
    const P = { get: (idx) => (idx[0] === 0 ? 10 : 4) };
    const result = evaluateAt(fMock, P);
    expect(result).toEqual({ sum: 14, diff: 6 });
  });

  test('evaluateAt handles negative coordinates', () => {
    const fMock = (x, y) => x + y;
    const P = { get: (idx) => (idx[0] === 0 ? -5 : -2) };
    expect(evaluateAt(fMock, P)).toBe(-7);
  });

  test('F should use evaluateAt with f', () => {
    const { F, f } = sandbox;
    const P = { get: (idx) => (idx[0] === 0 ? 1 : 2) };
    // f is the complex function from the file, but we can check if F(P) returns what f(1, 2) returns
    expect(F(P)).toBe(f(1, 2));
  });

  test('gradF should use evaluateAt with gradf', () => {
    const { gradF, gradf } = sandbox;
    const P = { get: (idx) => (idx[0] === 0 ? 1 : 2) };
    expect(gradF(P).toArray()).toEqual(gradf(1, 2).toArray());
  });
});
