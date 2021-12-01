const TRADING_DAYS_IN_YEAR = 252;
const dT = 1 / TRADING_DAYS_IN_YEAR;

const RANGE_MARGIN = 0.1;

var s0 = 100;
var mu_y = 0.1;
var sigma_y = 0.3;
var N = 252;
var M = 5;

var TS = generateMonteCarloPriceSeries(s0, mu_y, sigma_y, dT, N);
console.log(TS);

var data = [{
    x: TS.t,
    y: TS.s,
    line: { simplify: false },
}];
var layout = {
    title: "Monte Carlo Options",
    autosize: true,
    plot_bgcolor: "black",
    paper_bgcolor: "rgba(0,0,0,0)",
    "yaxis": {
        "gridcolor": "grey",
    },
    "xaxis": {
        "gridcolor": "grey",
    },
};

var config = { responsive: true }

Plotly.newPlot('plot-0', data, layout, config);

function recompute() {
    var TS = generateMonteCarloPriceSeries(s0, mu_y, sigma_y, dT, N);
    var data = [{
        x: TS.t,
        y: TS.s,
        line: { simplify: false },
    }];

    var min = math.min(TS.s);
    var max = math.max(TS.s);
    var diff = max - min;
    var margin = RANGE_MARGIN * diff;

    Plotly.animate('plot-0', {
        data: data,
        traces: [0],
        layout: {
        }
    }, {
        transition: {
            duration: 500,
            easing: 'cubic-in-out'
        },
        frame: {
            duration: 500
        }
    });

    Plotly.animate('plot-0', {
        layout: {
            yaxis: { range: [min - margin, max + margin] }
        }
    }, {
        transition: {
            duration: 500,
            easing: 'cubic-in-out'
        },
        frame: {
            duration: 500
        }
    });
}

function generateMonteCarloPriceSeries(s0, mu_y, sigma_y, dT, N) {
    var ts = generateDailyMonteCarloReturns(mu_y, sigma_y, dT, N);
    console.log(ts);
    var cum_r = accumulateMonteCarloReturns(ts.r);
    var S = math.multiply(s0, math.exp(cum_r));
    return { t: ts.t, s: S };
}

function accumulateMonteCarloReturns(r) {
    var cumsum = 0;
    return r.map(s => cumsum += s);
}

function generateDailyMonteCarloReturns(mu_y, sigma_y, dT, N) {
    var z = math.matrix(math.random([1, N], -0.5, 0.5));
    var means = math.multiply(math.ones([1, N]), mu_y * dT);
    var impulses = math.multiply(z, sigma_y * math.sqrt(dT));
    var r = [0].concat(math.add(means, impulses).toArray()[0]);

    var t = [0].concat(math.range(1, N, true).toArray());
    return { t: t, r: r };
}