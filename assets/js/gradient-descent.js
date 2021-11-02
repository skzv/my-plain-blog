// TODO: use bignumber

/* Creates an array of N numbers lienarly spaced between x_0 and x_f inclusive. */
function range(a, b, N) {
    dx = (b - a) / N;
    r = [];
    for (var x = a; x <= b; x += dx) {
        r.push(x);
    }
    return r;
}

/*  3 * (1 - x)^2 * exp(- x^2 - (y + 1)^2) - 10 * (x / 5 - x^3 - y^5) 
    * exp(-x^2 - y^2) - 1 / 3 * exp(-(x+1)^2 - y^2) */
function f(x, y) {
    return 3 * Math.pow(1 - x, 2) * Math.exp(-Math.pow(x, 2) - Math.pow((y + 1), 2))
        - 10 * (x / 5 - Math.pow(x, 3) - Math.pow(y, 5))
        * Math.exp(-Math.pow(x, 2) - Math.pow(y, 2))
        - 1 / 3 * Math.exp(-Math.pow(x + 1, 2) - Math.pow(y, 2));
}

/* df/dx = -10 (1/5 - 3 x^2) e^(-x^2 - y^2) + 6 x (1 - x)^2 e^(x^2 - (y + 1)^2) - 6 (1 - x) 
   e^(x^2 - (y + 1)^2) + 20 x e^(-x^2 - y^2) (-x^3 + x/5 - y^5) + 2/3 (x + 1) e^(-(x + 1)^2 - y^2)
   
   df/dy = 50 y^4 e^(-x^2 - y^2) - 6 (1 - x)^2 (y + 1) e^(x^2 - (y + 1)^2) + 20 y e^(-x^2 - y^2) 
    (-x^3 + x/5 - y^5) + 2/3 y e^(-(x + 1)^2 - y^2)
   */
function df(x, y) {
    var dfdx = -6 * Math.exp(Math.pow(x, 2) - Math.pow(1 + y, 2))
        * (1 - x) + 6 * Math.exp(Math.pow(x, 2) - Math.pow(1 + y, 2))
        * Math.pow(1 - x, 2) * x + 2 / 3 * Math.exp(1 - Math.E * Math.pow(1 + x, 2) - Math.pow(y, 2))
        * (1 + x) - 10 * Math.exp(-Math.pow(x, 2) - Math.pow(y, 2)) * (1 / 5 - 3 * Math.pow(x, 2)) + 20
        * Math.exp(-Math.pow(x, 2) - Math.pow(y, 2))
        * x * (x / 5 - Math.pow(x, 3) - Math.pow(y, 5));

    var dfdy = 2 / 3 * Math.exp(-Math.E * Math.pow(1 + x, 2) - Math.pow(y, 2))
        * y + 50 * Math.exp(-Math.pow(x, 2) - Math.pow(y, 2))
        * Math.pow(y, 4) - 6 * Math.exp(Math.pow(x, 2) - Math.pow(1 + y, 2))
        * Math.pow(1 - x, 2) * (1 + y) + 20 * Math.exp(-Math.pow(x, 2)
            * -Math.pow(y, 2)) * y * (x / 5 - Math.pow(x, 3) - Math.pow(y, 5));

    return { dfdx: dfdx, dfdy: dfdy };
}

function createPlot() {
    var x = range(-3, 3, 50);
    var y = range(-3, 3, 50);
    var z = [];

    for (var y_i of y) {
        z.push([]);
        for (var x_i of x) {
            z[z.length - 1].push(f(x_i, y_i));
        }
    }

    var data = [{
        x: x,
        y: y,
        z: z,
        showscale: false,
        type: 'surface',
        // opacity:0.95,
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
        title: 'Cost Function',
        scene: { camera: { eye: { x: -0.65, y: -1.15, z: 0.3 } }, aspectmode: "cube", },
        autosize: true,
        plot_bgcolor: "black",
        paper_bgcolor: "rgba(0,0,0,0)",
        margin: {
            l: 0,
            r: 0,
            b: 0,
            t: 0,
            pad: 0
        },
    };

    Plotly.newPlot('myDiv', data, layout);
}

function createGradientTrace() {
    var x0 = 0;
    var yR = range(-3,3,100000);
    var dy = yR[1]-yR[0];
    var dx = dy;

    var x = [x0];
    var y = [yR[0]]
    var z = [f(x0, yR[0])];

    for (var yi of yR) {
        var zi = f(x0, yi);
        var df0 = df(x0, yi);

        x.push(x0 + dx);
        y.push(yi + dy);
        z.push(zi + df0.dfdx * dx + df0.dfdy * dy + 0.2);
    }
    

    console.log(df0);

    var data = [{
        type: 'scatter3d',
        mode: 'lines',
        x: x,
        y: y,
        z: z,
        line: {
            color: 'rgb(255, 0, 0)',
            width: 15,
        },
    }];
    Plotly.addTraces('myDiv', data);
}

createPlot();
createGradientTrace();