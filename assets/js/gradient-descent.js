/** Computes a 2D grid of the function f over the arrays X and Y. */
function computeFunctionGrid(X, Y, f) {
    var Z = [];
    math.forEach(Y, (y) => {
        Z.push([]);
        math.forEach(X, (x) => {
            Z[Z.length - 1].push(f(x, y));
        })
    })

    return math.matrix(Z);
}

function createPlotWithSurface(divName, title, X, Y, f, opacity) {
    var Z = computeFunctionGrid(X, Y, f);

    var data = [{
        x: X.toArray(),
        y: Y.toArray(),
        z: Z.toArray(),
        showscale: false,
        type: 'surface',
        opacity: opacity,
        contours: {
            z: {
                show: true,
                usecolormap: true,
                highlightcolor: "#42f462",
                project: { z: true }
            }
        }
    }];

    var config = {responsive: true}

    var layout = {
        title: title,
        scene: { camera: { eye: { x: 0.5, y: -0.7, z: 1.0 } }, aspectmode: "cube", },
        autosize: true,
        plot_bgcolor: "black",
        paper_bgcolor: "rgba(0,0,0,0)",
        hovermode: false,
        margin: {
            l: 0,
            r: 0,
            b: 0,
            t: 50,
            pad: 0
        },
    };

    Plotly.newPlot(divName, data, layout, config);
}

/* Constructs a trace above and below the surface so as to be more visible. */
function addGradientDescentToSurfPlot(divName, X, Y, Z) {
    var data = [createGradientDescentPathDataElement(X, Y, Z)];
    Plotly.addTraces(divName, data);
}

function createGradientDescentPathDataElement(X, Y, Z) {
    return {
        type: 'scatter3d',
        mode: 'lines+markers',
        showlegend: false,
        x: X.toArray(),
        y: Y.toArray(),
        z: Z.toArray(),
        opacity: 0.55,
        marker: {
            color: 'black',
            symbol: 'x',
            size: 2
        },
        line: {
            color: 'rgb(255, 0, 0)',
            width: 5,
        },
    };
}

/** Compute gradient descent for number of iterations N. */
function computeGradientDescentNumIterations(P0, f, gradf, alpha, N) {
    var P = [P0];
    var X = [getX(P0)];
    var Y = [getY(P0)];
    var Z = [f(P0)];
    for (var i = 0; i < N; i++) {
        // console.log("P " + P[P.length - 1].toArray());
        var Pi = iterateGradientDescent(P[P.length - 1], f, gradf, alpha);
        P.push(Pi.P);

        X.push(getX(Pi.P));
        Y.push(getY(Pi.P));
        Z.push(Pi.Z);
    }

    var T = { X: math.matrix(X), Y: math.matrix(Y), Z: math.matrix(Z) };
    return T;
}

/** Compute gradient descent for tolerance dZ and maximum number of iterations N. */
function computeGradientDescentTolerance(P0, f, gradf, alpha, tolerance, maxN) {
    var dZ = 1000000000000;
    var P = [P0];
    var X = [getX(P0)];
    var Y = [getY(P0)];
    var Z = [f(P0)];
    for (var i = 0; i < maxN && dZ > tolerance; i++) {
        var Pi = iterateGradientDescent(P[P.length - 1], f, gradf, alpha);
        dZ = math.abs(Pi.dZ);
        P.push(Pi.P);

        X.push(getX(Pi.P));
        Y.push(getY(Pi.P));
        Z.push(Pi.Z + 0.1); // TODO: only add offset if surf is opaque
    }

    var T = { X: math.matrix(X), Y: math.matrix(Y), Z: math.matrix(Z) };
    return T;
}

// TODO: add surf opaque toggle

function iterateGradientDescent(P0, f, gradf, alpha) {
    var Z0 = f(P0);
    // console.log("P0 " + P0.toArray());
    // console.log("gradf " + gradf(P0).toArray());
    var P = math.subtract(P0, math.multiply(alpha, gradf(P0)));
    var dP = math.subtract(P, P0);
    var Z = f(P);
    var dZ = Z - Z0;

    var P = { P0: P0, P: P, dP: dP, Z0: Z0, Z: Z, dZ: dZ };
    return P;
}

function getX(P) {
    return P.get([0]);
}

function getY(P) {
    return P.get([1]);
}

function F(P) {
    return evaluateAt(f, P);
}

function gradF(P) {
    return evaluateAt(gradf, P);
}

/*  3 * (1 - x)^2 * exp(- x^2 - (y + 1)^2) - 10 * (x / 5 - x^3 - y^5) 
    * exp(-x^2 - y^2) - 1 / 3 * exp(-(x+1)^2 - y^2) */
function f(x, y) {
    var x2 = x * x;
    var y2 = y * y;
    var oneMinusX = 1 - x;
    var oneMinusX2 = oneMinusX * oneMinusX;
    var yPlus1 = y + 1;
    var xPlus1 = x + 1;

    return 3 * oneMinusX2 * math.exp(-x2 - yPlus1 * yPlus1)
        - 10 * (x / 5 - x * x2 - math.pow(y, 5))
        * math.exp(-x2 - y2)
        - 1 / 3 * math.exp(-xPlus1 * xPlus1 - y2);
}

function containTrace(T, minX, maxX, minY, maxY, minZ, maxZ) {
    // TODO add precondition
    Xc = [];
    Yc = [];
    Zc = [];
    for (var i = 0; i < T.X.size()[0]; i++) {
        var x = T.X.get([i]);
        var y = T.Y.get([i]);
        var z = T.Z.get([i]);
        // console.log("" + x + " " + y + " " + z);
        if (minX <= x && x <= maxX && minY <= y && y <= maxY && minZ <= z && z <= maxZ) {
            Xc.push(x);
            Yc.push(y);
            Zc.push(z);
        }
    }

    var Tc = { X: math.matrix(Xc), Y: math.matrix(Yc), Z: math.matrix(Zc) };
    return Tc;
}

// var X = math.range(-3, 3, 0.1, true);
// var Y = math.range(-3, 3, 0.1, true);

var X = math.range(-3, 3, 0.1, true);
var Y = math.range(-3, 3, 0.1, true);
createPlotWithSurface('plot-0', 'Cost Function', X, Y, f, 1);

createPlotWithSurface('plot-1', 'Cost Function', X, Y, f, 1);

// Update the current slider value (each time you drag the slider handle)
var mX = -0.2;
var mY = -0.6;
var alpha = 0.01;

var xSlider = document.getElementById('x-slider');
var xSliderValue = document.getElementById('x-slider-value');
var ySlider = document.getElementById('y-slider');
var ySliderValue = document.getElementById('y-slider-value');
var alphaSlider = document.getElementById('alpha-slider');
var alphaSliderValue = document.getElementById('alpha-slider-value');

xSlider.oninput = function () {
    mX = this.valueAsNumber;
    xSliderValue.innerHTML = mX;
    runGradientDescent();
}

ySlider.oninput = function () {
    mY = this.valueAsNumber;
    ySliderValue.innerHTML = mY;
    runGradientDescent();
}

alphaSlider.oninput = function () {
    alpha = this.valueAsNumber;
    alphaSliderValue.innerHTML = alpha;
    runGradientDescent();
}

xSlider.value = mX;
xSliderValue.innerHTML = mX;
ySlider.value = mY;
ySliderValue.innerHTML = mY;
alphaSlider.value = alpha;
alphaSliderValue.innerHTML = alpha;

function runGradientDescent() {
    var T = computeGradientDescentTolerance(math.matrix([mX, mY]), F, gradF, alpha, 1e-10, 1e2);
    T = containTrace(T, -3, 3, -3, 3, -10, 50);
    Plotly.animate('plot-1', {
        data: [{ x: T.X.toArray(), y: T.Y.toArray(), z: T.Z.toArray() }],
        traces: [1],
        layout: {}
    }, {
        transition: {
            duration: 0,
            // easing: 'cubic-in-out'
        },
        frame: {
            duration: 0
        }
    })
}

var T = computeGradientDescentTolerance(math.matrix([mX, mY]), F, gradF, 0.01, 1e-10, 1e3);
addGradientDescentToSurfPlot('plot-1', T.X, T.Y, T.Z);

function evaluateAt(f, P) {
    return f(getX(P), getY(P));
}

/* df/dx = -10 (1/5 - 3 x^2) e^(-x^2 - y^2) + 6 x (1 - x)^2 e^(x^2 - (y + 1)^2) - 6 (1 - x) 
   e^(x^2 - (y + 1)^2) + 20 x e^(-x^2 - y^2) (-x^3 + x/5 - y^5) + 2/3 (x + 1) e^(-(x + 1)^2 - y^2)

   df/dy = 50 y^4 e^(-x^2 - y^2) - 6 (1 - x)^2 (y + 1) e^(x^2 - (y + 1)^2) + 20 y e^(-x^2 - y^2) 
    (-x^3 + x/5 - y^5) + 2/3 y e^(-(x + 1)^2 - y^2)
 
    gradf(0,0) = [-4.0876939278726425,-2.207276647028654]
   */
function gradf(x, y) {
    var x2 = x * x;
    var y2 = y * y;
    var oneMinusX = 1 - x;
    var oneMinusX2 = oneMinusX * oneMinusX;
    var xPlus1 = x + 1;
    var yPlus1 = y + 1;
    var yPlus1_2 = yPlus1 * yPlus1;
    var xPlus1_2 = xPlus1 * xPlus1;

    var exp1 = math.exp(-x2 - yPlus1_2);
    var exp2 = math.exp(-x2 - y2);
    var exp3 = math.exp(-xPlus1_2 - y2);

    var polyTerm = (x / 5 - x * x2 - math.pow(y, 5));

    var dfdx = -6 * exp1 * oneMinusX
        - 6 * exp1 * oneMinusX2 * x
        + 2 / 3 * exp3 * xPlus1
        - 10 * exp2 * (1 / 5 - 3 * x2)
        + 20 * exp2 * x * polyTerm;

    var dfdy = 2 / 3 * exp3 * y
        + 50 * exp2 * math.pow(y, 4)
        - 6 * exp1 * oneMinusX2 * yPlus1
        + 20 * exp2 * y * polyTerm;

    return math.matrix([dfdx, dfdy]);
}

function F2(P) {
    return evaluateAt(f2, P);
}

function gradF2(P) {
    return evaluateAt(gradf2, P);
}

function f2(x, y) {
    return math.pow(x, 2) + math.pow(y, 2);
}

function gradf2(x, y) {
    var dfdx = 2 * x;
    var dfdy = 2 * y;

    return math.matrix([dfdx, dfdy]);
}