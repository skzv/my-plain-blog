const TRADING_DAYS_IN_YEAR = 252;
const dT = 1 / TRADING_DAYS_IN_YEAR;

const RANGE_MARGIN = 0.1;

const M0 = 1;
const M1 = 25;
const M2 = 1000;

var s0 = 100;
var mu_y = 0.1;
var sigma_y = 0.3;
var N = 252;
// var M = 50;

generate(/* divName= */ 'plot-0', /* isInitalized= */ false, s0, mu_y, sigma_y, dT, N, M0);
generate(/* divName= */ 'plot-1', /* isInitalized= */ false, s0, mu_y, sigma_y, dT, N, M1);
generate(/* divName= */ 'plot-2', /* isInitalized= */ false, s0, mu_y, sigma_y, dT, N, M2);

function regenerate0() {
    generate(/* divName= */ 'plot-0', /* isInitalized= */ true, s0, mu_y, sigma_y, dT, N, M0);
}

function regenerate1() {
    generate(/* divName= */ 'plot-1', /* isInitalized= */ true, s0, mu_y, sigma_y, dT, N, M1);
}

function regenerate2() {
    generate(/* divName= */ 'plot-2', /* isInitalized= */ true, s0, mu_y, sigma_y, dT, N, M2);
}

function generate(divName, isInitialized, s0, mu_y, sigma_y, dT, N, M) {
    const M_WITHIN_THRESHOLD = M <= 75;

    var TS = generateSetOfMonteCarloPriceSeries(s0, mu_y, sigma_y, dT, N, M);
    var XY = convertSetOfTimeSeriesToXYData(TS);

    var max = findMaxPriceOfAllSeries(TS);
    var min = findMinPriceOfAllSeries(TS);
    var diff = max - min;
    var margin = RANGE_MARGIN * diff;
    var range = [min - margin, max + margin];

    if (!isInitialized) {
        var layout = {
            title: "Monte Carlo Options",
            showlegend: false,
            autosize: true,
            plot_bgcolor: "black",
            paper_bgcolor: "rgba(0,0,0,0)",
            "yaxis": {
                "gridcolor": "grey",
                range: range,
            },
            "xaxis": {
                "gridcolor": "grey",
            },
        };

        var config = { responsive: true }

        Plotly.newPlot(divName, XY, layout, config);
    } else {
        var transitionParams;

        if (M <= 75) {
            transitionParams = {
                transition: {
                    duration: 500,
                    easing: 'cubic-in-out'
                },
                frame: {
                    duration: 500
                }
            };
        } else {
            transitionParams = {
                transition: {
                    duration: 0,
                    easing: 'none'
                },
                frame: {
                    duration: 0
                }
            };
        }

        Plotly.animate(divName, {
            data: XY,
            layout: {
            }
        }, transitionParams);

        if (M_WITHIN_THRESHOLD) {
            Plotly.animate(divName, {
                layout: {
                    yaxis: { range: range }
                }
            }, transitionParams);
        }

    }
}

function findMaxPriceOfAllSeries(TS) {
    return math.max(TS.map(ts => math.max(ts.s)));
}

function findMinPriceOfAllSeries(TS) {
    return math.min(TS.map(ts => math.min(ts.s)));
}

function convertTimeSeriesToXYData(ts) {
    return {
        x: ts.t,
        y: ts.s,
        line: { simplify: false },
    }
}

function convertSetOfTimeSeriesToXYData(TS) {
    return TS.map(ts => convertTimeSeriesToXYData(ts));
}

function generateSetOfMonteCarloPriceSeries(s0, mu_y, sigma_y, dT, N, M) {
    TS = [];
    for (var i = 0; i < M; i++) {
        TS.push(generateMonteCarloPriceSeries(s0, mu_y, sigma_y, dT, N));
    }
    return TS;
}

function generateMonteCarloPriceSeries(s0, mu_y, sigma_y, dT, N) {
    var ts = generateDailyMonteCarloReturns(mu_y, sigma_y, dT, N);
    // console.log(ts);
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