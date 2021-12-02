const TRADING_DAYS_IN_YEAR = 252;
const dT = 1 / TRADING_DAYS_IN_YEAR;

const RANGE_MARGIN = 0.1;

const M0 = 1;
const M1 = 10;
const M2 = 500;

var s0 = 100;
var mu_y = 0.06;
var sigma_y = 0.15;
var N = TRADING_DAYS_IN_YEAR;
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
    var stats = calculateStatistics(TS);

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
            hovermode: false,
            margin: {
                l: 25,
                r: 0,
                b: 25,
                t: 25,
                pad: 0
            },
        };

        var config = { responsive: true, staticPlot: false };

        if (!M_WITHIN_THRESHOLD) {
            config.staticPlot = true;
        }

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
    // console.log(math.mean(ts.r));
    // console.log(math.std(ts.r));
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
    var z = normal(N);
    // var z = math.multiply(math.subtract(math.matrix(math.randomInt([1, N], 0, 2)), 1 / 2), 2);
    var means = math.multiply(math.ones([1, N]), (mu_y - sigma_y * sigma_y / 2) * dT)[0];
    var impulses = math.multiply(z, sigma_y * math.sqrt(dT));
    // console.log(math.mean(impulses));
    // console.log(math.std(impulses));
    var r = [0].concat(math.add(means, impulses));

    var t = [0].concat(math.range(1, N, true).toArray());
    return { t: t, r: r };
}

function calculateStatistics(TS) {
    var endPrices = TS.map(ts => ts.s[ts.s.length - 1]);
    var mean = math.mean(endPrices);
    var standardDeviation = math.std(endPrices);
    console.log(mean);
    console.log(standardDeviation);
}

function normal(n) {
    var u = math.subtract(1, math.random([1, 2 * n]))[0];
    var z = [];
    for (var i = 0; i < n; i++) {
        z.push(math.sqrt( -2.0 * math.log( u[i] )) * math.cos( 2.0 * Math.PI * u[n + i] ));
    }
    return z;
}