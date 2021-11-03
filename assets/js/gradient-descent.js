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

function createPlot(divName, title, X, Y, f) {
    var Z = computeFunctionGrid(X, Y, f);

    var data = [{
        x: X.toArray(),
        y: Y.toArray(),
        z: Z.toArray(),
        showscale: false,
        type: 'surface',
        // opacity:0.98,
        contours: {
            z: {
                show: true,
                usecolormap: true,
                highlightcolor: "#42f462",
                project: { z: true }
            }
        }
    }];

    var layout = {
        title: title,
        scene: { camera: { eye: { x: -0.65, y: -1.15, z: 0.3 } }, aspectmode: "cube", },
        autosize: true,
        plot_bgcolor: "black",
        paper_bgcolor: "rgba(0,0,0,0)",
        margin: {
            l: 0,
            r: 0,
            b: 0,
            t: 50,
            pad: 0
        },
    };

    Plotly.newPlot(divName, data, layout);
}

/* Constructs a trace above and below the surface so as to be more visible. */
function addGradientDescentToSurfPlot(divName, X, Y, Z) {
    addLineTrace(divName, X, Y, math.map(Z, z => z + 0.05));
    addLineTrace(divName, X, Y, Z);
    addScatterTrace(divName, X, Y, Z);
}

function addLineTrace(divName, X, Y, Z) {
    var data = [createLineTraceDataElement(X, Y, Z)];
    Plotly.addTraces(divName, data);
}

function addScatterTrace(divName, X, Y, Z) {
    var data = [createScatterDataElement(X, Y, Z)];
    Plotly.addTraces(divName, data);
}

function createLineTraceDataElement(X, Y, Z) {
    return {
        type: 'scatter3d',
        mode: 'lines',
        showlegend: false,
        x: X.toArray(),
        y: Y.toArray(),
        z: Z.toArray(),
        line: {
            color: 'rgb(255, 0, 0)',
            width: 5,
        },
    };
}

function createScatterDataElement(X, Y, Z) {
    return {
        type: 'scatter3d',
        mode: 'markers',
        showlegend: false,
        x: X.toArray(),
        y: Y.toArray(),
        z: Z.toArray(),
        line: {
            color: 'rgb(255, 0, 0)',
            width: 5,
        },
    };
}

/** Compute gradient descent for number of iterations N. */
function computeGradientDescent(P0, f, gradf, alpha, N) {
    var P = [P0];
    var X = [getX(P0)];
    var Y = [getY(P0)];
    var Z = [F(P0)];
    for (var i = 0; i < N; i++) {
        console.log("P " + P[P.length - 1].toArray());
        var Pi = iterateGradientDescent(P[P.length - 1], f, gradf, alpha);
        P.push(Pi.P);

        X.push(getX(Pi.P));
        Y.push(getY(Pi.P));
        Z.push(Pi.Z);
    }

    var T = { X: math.matrix(X), Y: math.matrix(Y), Z: math.matrix(Z) };
    return T;
}

function iterateGradientDescent(P0, f, gradf, alpha) {
    var Z0 = f(P0);
    console.log("P0 " + P0.toArray());
    console.log("gradf " + gradf(P0).toArray());
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
    return f(getX(P), getY(P));
}

function gradF(P) {
    return gradf(getX(P), getY(P));
}

/*  3 * (1 - x)^2 * exp(- x^2 - (y + 1)^2) - 10 * (x / 5 - x^3 - y^5) 
    * exp(-x^2 - y^2) - 1 / 3 * exp(-(x+1)^2 - y^2) */
function f(x, y) {
    return 3 * math.pow(1 - x, 2) * math.exp(-math.pow(x, 2) - math.pow((y + 1), 2))
        - 10 * (x / 5 - math.pow(x, 3) - math.pow(y, 5))
        * math.exp(-math.pow(x, 2) - math.pow(y, 2))
        - 1 / 3 * math.exp(-math.pow(x + 1, 2) - math.pow(y, 2));
}

/* df/dx = -10 (1/5 - 3 x^2) e^(-x^2 - y^2) + 6 x (1 - x)^2 e^(x^2 - (y + 1)^2) - 6 (1 - x) 
e^(x^2 - (y + 1)^2) + 20 x e^(-x^2 - y^2) (-x^3 + x/5 - y^5) + 2/3 (x + 1) e^(-(x + 1)^2 - y^2)

df/dy = 50 y^4 e^(-x^2 - y^2) - 6 (1 - x)^2 (y + 1) e^(x^2 - (y + 1)^2) + 20 y e^(-x^2 - y^2) 
(-x^3 + x/5 - y^5) + 2/3 y e^(-(x + 1)^2 - y^2)

gradf(0,0) = [-4.0876939278726425,-2.207276647028654]
*/
function gradf(x, y) {
    var dfdx = -6 * math.exp(math.pow(x, 2) - math.pow(1 + y, 2))
        * (1 - x) + 6 * math.exp(math.pow(x, 2) - math.pow(1 + y, 2))
        * math.pow(1 - x, 2) * x + 2 / 3 * math.exp(1 - math.E * math.pow(1 + x, 2) - math.pow(y, 2))
        * (1 + x) - 10 * math.exp(-math.pow(x, 2) - math.pow(y, 2)) * (1 / 5 - 3 * math.pow(x, 2)) + 20
        * math.exp(-math.pow(x, 2) - math.pow(y, 2))
        * x * (x / 5 - math.pow(x, 3) - math.pow(y, 5));

    var dfdy = 2 / 3 * math.exp(-math.E * math.pow(1 + x, 2) - math.pow(y, 2))
        * y + 50 * math.exp(-math.pow(x, 2) - math.pow(y, 2))
        * math.pow(y, 4) - 6 * math.exp(math.pow(x, 2) - math.pow(1 + y, 2))
        * math.pow(1 - x, 2) * (1 + y) + 20 * math.exp(-math.pow(x, 2)
             -math.pow(y, 2)) * y * (x / 5 - math.pow(x, 3) - math.pow(y, 5));

    return math.matrix([dfdx, dfdy]);
}

function smoothInterpolation(X, Y, Z) {
    for (var i = 1; i < Y.size()[0]; i++) {

    }
}

var X = math.range(-3, 3, 0.1, true);
var Y = math.range(-3, 3, 0.1, true);
createPlot('plot-0', 'Cost Function', X, Y, f);

var X = math.range(-3, 3, 0.1, true);
var Y = math.range(-3, 3, 0.1, true);
createPlot('plot-1', 'Cost Function', X, Y, f);

var X = math.zeros(Y.size()[0]);
var Z = [];
math.forEach(Y, y => {
    Z.push(f(0, y));
});
Z = math.matrix(Z);
addLineTrace('plot-0', X, Y, Z);

var T = computeGradientDescent(math.matrix([2.2, -1.9]), F, gradF, 0.001, 20);
addGradientDescentToSurfPlot('plot-1', T.X, T.Y, T.Z);


//     /* df/dx = -10 (1/5 - 3 x^2) e^(-x^2 - y^2) + 6 x (1 - x)^2 e^(x^2 - (y + 1)^2) - 6 (1 - x) 
//        e^(x^2 - (y + 1)^2) + 20 x e^(-x^2 - y^2) (-x^3 + x/5 - y^5) + 2/3 (x + 1) e^(-(x + 1)^2 - y^2)

//        df/dy = 50 y^4 e^(-x^2 - y^2) - 6 (1 - x)^2 (y + 1) e^(x^2 - (y + 1)^2) + 20 y e^(-x^2 - y^2) 
//         (-x^3 + x/5 - y^5) + 2/3 y e^(-(x + 1)^2 - y^2)
    
//         gradf(0,0) = [-4.0876939278726425,-2.207276647028654]
//        */
//     function gradf(x, y) {
//         // x = math.bignumber(x);
//         // y = math.bignumber(y);
    
//         var dfdx =
//             math.multiply(
//                 -6,
//                 math.exp(
//                     math.subtract(
//                         math.pow(x, 2),
//                         math.pow(1 + y, 2)
//                     )
//                 ),
//                 math.subtract(1, x)
//             )
//             +
//             math.multiply(
//                 6,
//                 math.exp(
//                     math.subtract(
//                         math.pow(x, 2),
//                         math.pow(1 + y, 2))
//                 ),
//                 math.pow(1 - x, 2),
//                 x
//             )
//             +
//             math.multiply(
//                 2 / 3,
//                 math.exp(
//                     math.subtract(
//                         math.subtract(
//                             1,
//                             math.multiply(
//                                 math.E,
//                                 math.pow(math.add(1, x), 2)
//                             )
//                         ),
//                         math.pow(y, 2)
//                     )
//                 ),
//                 (1 + x)
//             )
//             -
//             10 * math.exp(-math.pow(x, 2) - math.pow(y, 2)) * (1 / 5 - 3 * math.pow(x, 2))
//             +
//             20 * math.exp(-math.pow(x, 2) - math.pow(y, 2)) * x * (math.divide(x, 5) - math.pow(x, 3) - math.pow(y, 5));
    
//         var dfdy = 
//             math.multiply(
//                 2 / 3, 
//                 math.exp(
//                     -math.E * math.pow(1 + x, 2) - math.pow(y, 2)
//                 ), 
//                 y
//             )
//             + 
//             math.multiply(
//                 50, 
//                 math.exp(-math.pow(x, 2) - math.pow(y, 2)),
//                 math.pow(y, 4)
//             )
//             - 
//             math.multiply(
//                 6, 
//                 math.exp(
//                     math.pow(
//                         x, 
//                         2
//                     ) 
//                     - 
//                     math.pow(
//                         math.add(1, y), 
//                         2)
//                     ), 
//                 math.pow(
//                     math.subtract(
//                         1,
//                         x
//                     ), 
//                     2
//                 ), 
//                 math.add(1, y)
//             )
//             + 
//             math.multiply(
//                 20, 
//                 math.exp(-math.pow(x, 2) -math.pow(y, 2)), 
//                 y, 
//                 (x / 5 - math.pow(x, 3) - math.pow(y, 5))
//             );
    
//         return math.matrix([dfdx, dfdy]);
//     }