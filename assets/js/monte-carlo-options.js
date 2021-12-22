const TRADING_DAYS_IN_YEAR = 252;
const dT = 1 / TRADING_DAYS_IN_YEAR;

const RANGE_MARGIN = 0.1;

const M0 = 1;
const M1 = 10;
const M2 = 10000;

var N = TRADING_DAYS_IN_YEAR;

var seriesParams =
    { s0: 100, mu_y: 0.15, sigma_y: 0.07, strike: 105 };
// var s0 = 100;
// var mu_y = 0.06;
// var sigma_y = 0.15;
// var M = 50;

generate(/* index= */ 0, /* isInitalized= */ false, seriesParams, dT, N, M0);
generate(/* index= */ 1, /* isInitalized= */ false, seriesParams, dT, N, M1);
generate(/* index= */ 2, /* isInitalized= */ false, seriesParams, dT, N, M2);

function regenerate0() {
    generate(/* index= */ 0, /* isInitalized= */ true, seriesParams, dT, N, M0);
}

function regenerate1() {
    generate(/* index= */ 1, /* isInitalized= */ true, seriesParams, dT, N, M1);
}

function regenerate2() {
    generate(/* index= */ 2, /* isInitalized= */ true, seriesParams, dT, N, M2);
}

var meanSlider = document.getElementById('mean-slider');
var meanSliderValue = document.getElementById('mean-slider-value');
var sigmaSlider = document.getElementById('sigma-slider');
var sigmaSliderValue = document.getElementById('sigma-slider-value');

meanSlider.value = seriesParams.mu_y;
sigmaSlider.value = seriesParams.sigma_y;
meanSliderValue.innerHTML = (seriesParams.mu_y * 100).toFixed(0) + "%";
sigmaSliderValue.innerHTML = (seriesParams.sigma_y * 100).toFixed(0) + "%";

meanSlider.oninput = function () {
    seriesParams.mu_y = this.valueAsNumber;
    meanSliderValue.innerHTML = (seriesParams.mu_y * 100).toFixed(0) + "%";
}

sigmaSlider.oninput = function () {
    seriesParams.sigma_y = this.valueAsNumber;
    sigmaSliderValue.innerHTML = (seriesParams.sigma_y * 100).toFixed(0) + "%";
}

var animationLock = false;

var timestampLastAnimation = Date.now();

meanSlider.onchange = function () {
    regenerate0();
    timestampLastAnimation = Date.now();
    if (!animationLock) {
        maybeRegenerateOtherCharts();
    }
    // regenerate1();
}

sigmaSlider.onchange = function () {
    regenerate0();
    timestampLastAnimation = Date.now();
    if (!animationLock) {
        maybeRegenerateOtherCharts();
    }
    // regenerate1();
}

function maybeRegenerateOtherCharts() {
    animationLock = true;
    if (Date.now() - timestampLastAnimation > 7000) {
        regenerate1();
        setTimeout(function () {
            regenerate2();
        }, 1000);
        timestampLastAnimation = Date.now();
        animationLock = false;
    } else {
        setTimeout(function () {
            maybeRegenerateOtherCharts();
        }, 1000);
    }
}

function generate(index, isInitialized, seriesParams, dT, N, M) {
    const M_WITHIN_THRESHOLD = M <= 75;
    const MAX_TRACES_TO_RENDER = 100;

    const s0 = seriesParams.s0;
    const mu_y = seriesParams.mu_y;
    const sigma_y = seriesParams.sigma_y;

    const divName = 'plot-' + index;

    var TS = generateSetOfMonteCarloPriceSeries(s0, mu_y, sigma_y, dT, N, M);
    var stats = calculateStatistics(TS, seriesParams.strike);
    updateStats(index, stats, seriesParams.strike);

    var TS_clipped = TS.slice(0, MAX_TRACES_TO_RENDER);
    var XY = convertSetOfTimeSeriesToXYData(TS_clipped);

    var max = findMaxPriceOfAllSeries(TS_clipped);
    var min = findMinPriceOfAllSeries(TS_clipped);
    var diff = max - min;
    var margin = RANGE_MARGIN * diff;
    var range = [min - margin, max + margin];

    if (!isInitialized) {
        var layout = {
            // title: "Monte Carlo Options",
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

        if (!M_WITHIN_THRESHOLD || true) {
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

        // if (M_WITHIN_THRESHOLD) {
        Plotly.animate(divName, {
            layout: {
                yaxis: { range: range }
            }
        }, transitionParams);
        // }

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
    // console.log(S);
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

function calculateStatistics(TS, strike) {
    var endPrices = TS.map(ts => ts.s[ts.s.length - 1]);
    var mean = math.mean(endPrices);
    var standardDeviation = math.std(endPrices);
    var strikeValues = math.subtract(endPrices, strike);
    strikeValues = strikeValues.map(v => math.max(0, v));
    var optionMean = math.mean(strikeValues);
    var optionStandardDeviation = math.std(strikeValues);
    return { mean: mean, standardDeviation: standardDeviation, optionMean: optionMean, optionStandardDeviation: optionStandardDeviation };
    // console.log(mean);
    // console.log(standardDeviation);
}

function updateStats(index, stats, strike) {
    document.getElementById('mean-' + index).innerHTML = "<span class='option-stats'>Mean terminal value:</span> $" + (stats.mean).toFixed(2);
    document.getElementById('sigma-' + index).innerHTML = "<span class='option-stats'>Standard deviation of terminal values:</span> $" + (stats.standardDeviation).toFixed(2);
    document.getElementById('option-mean-' + index).innerHTML = "<span class='option-stats'>Mean $" + strike + " call option terminal value:</span> $" + (stats.optionMean).toFixed(2) + " ± $" + (stats.optionStandardDeviation).toFixed(2);
}

function normal(n) {
    var u = math.subtract(1, math.random([1, 2 * n]))[0];
    var z = [];
    for (var i = 0; i < n; i++) {
        z.push(math.sqrt(-2.0 * math.log(u[i])) * math.cos(2.0 * Math.PI * u[n + i]));
    }
    return z;
}