let performanceData = [];
let chart = null;
let defaultDayWeights = {
    "Monday": -8,
    "Tuesday": -10,
    "Wednesday": -10,
    "Thursday": -10,
    "Friday": 0,
    "Saturday": -2,
    "Sunday": -12
};

function populateDayWeights() {
    document.getElementById('mondayWeight').value = defaultDayWeights["Monday"];
    document.getElementById('tuesdayWeight').value = defaultDayWeights["Tuesday"];
    document.getElementById('wednesdayWeight').value = defaultDayWeights["Wednesday"];
    document.getElementById('thursdayWeight').value = defaultDayWeights["Thursday"];
    document.getElementById('fridayWeight').value = defaultDayWeights["Friday"];
    document.getElementById('saturdayWeight').value = defaultDayWeights["Saturday"];
    document.getElementById('sundayWeight').value = defaultDayWeights["Sunday"];
}

function updateDayWeight() {
    defaultDayWeights["Monday"] = Number(document.getElementById('mondayWeight').value);
    defaultDayWeights["Tuesday"] = Number(document.getElementById('tuesdayWeight').value);
    defaultDayWeights["Wednesday"] = Number(document.getElementById('wednesdayWeight').value);
    defaultDayWeights["Thursday"] = Number(document.getElementById('thursdayWeight').value);
    defaultDayWeights["Friday"] = Number(document.getElementById('fridayWeight').value);
    defaultDayWeights["Saturday"] = Number(document.getElementById('saturdayWeight').value);
    defaultDayWeights["Sunday"] = Number(document.getElementById('sundayWeight').value);
}

function calculatePerformance() {
    const age = parseFloat(document.getElementById('age').value);
    const bodyWeight = parseFloat(document.getElementById('bodyWeight').value);
    const units = parseFloat(document.getElementById('units').value);
    const impactConstant = parseFloat(document.getElementById('impactConstant').value);
    const decayConstant = parseFloat(document.getElementById('decayConstant').value);
    const timeSinceLastDrink = parseFloat(document.getElementById('timeSinceLastDrink').value);
    const dateTime = document.getElementById('dateTime').value;
    const day = new Date(dateTime).toLocaleString('en-us', { weekday: 'long' });
    const dayWeight = defaultDayWeights[day];

    return (100 - age) / 100 * (bodyWeight / (bodyWeight + units * impactConstant)) * dayWeight * Math.exp(-decayConstant * timeSinceLastDrink);
}

function displayEquationWithValues() {
    const age = document.getElementById('age').value;
    const bodyWeight = document.getElementById('bodyWeight').value;
    const units = document.getElementById('units').value;
    const impactConstant = document.getElementById('impactConstant').value;
    const decayConstant = document.getElementById('decayConstant').value;
    const timeSinceLastDrink = document.getElementById('timeSinceLastDrink').value;
    const day = new Date(document.getElementById('dateTime').value).toLocaleString('en-us', { weekday: 'long' });
    const dayWeight = defaultDayWeights[day];

    const equation = `P = ((${100 - age}) / 100) * (${bodyWeight} / (${bodyWeight} + ${units} * ${impactConstant})) * ${dayWeight} * e^(-${decayConstant} * ${timeSinceLastDrink})`;
    document.getElementById('equationValues').innerText = 'Equation: ' + equation;
}

function calculateAndStorePerformance() {
    updateDayWeight(); // Ensure weights are up-to-date
    const performance = calculatePerformance();
    document.getElementById('results').innerText = 'Calculated Performance: ' + performance.toFixed(2);
    displayEquationWithValues(); 

    const dateTime = document.getElementById('dateTime').value;
    const day = new Date(dateTime).toLocaleDateString();

    // Check if an entry for the same day already exists
    const existingEntry = performanceData.find(entry => entry.day === day);
    if (existingEntry) {
        existingEntry.units += parseFloat(document.getElementById('units').value);
        existingEntry.performance = calculatePerformanceForEntry(existingEntry);
    } else {
        const record = {
            dateTime,
            day,
            age: document.getElementById('age').value,
            bodyWeight: document.getElementById('bodyWeight').value,
            units: parseFloat(document.getElementById('units').value),
            impactConstant: document.getElementById('impactConstant').value,
            decayConstant: document.getElementById('decayConstant').value,
            timeSinceLastDrink: document.getElementById('timeSinceLastDrink').value,
            performance: performance.toFixed(2),
            timestamp: new Date().toLocaleString()
        };
        performanceData.push(record);
    }

    localStorage.setItem('performanceData', JSON.stringify(performanceData));

    updateChart();
    updateLog();
}

function calculatePerformanceForEntry(entry) {
    const age = parseFloat(entry.age);
    const bodyWeight = parseFloat(entry.bodyWeight);
    const units = parseFloat(entry.units);
    const impactConstant = parseFloat(entry.impactConstant);
    const decayConstant = parseFloat(entry.decayConstant);
    const timeSinceLastDrink = parseFloat(entry.timeSinceLastDrink);
    const day = new Date(entry.dateTime).toLocaleString('en-us', { weekday: 'long' });
    const dayWeight = defaultDayWeights[day];

    return (100 - age) / 100 * (bodyWeight / (bodyWeight + units * impactConstant)) * dayWeight * Math.exp(-decayConstant * timeSinceLastDrink);
}

function updatePoundDisplay() {
    const kg = document.getElementById('bodyWeight').value;
    const pounds = kg * 2.20462; 
    document.getElementById('weightInPounds').textContent = `${pounds.toFixed(2)} lbs`;
}

function clearChart() {
    if (chart) {
        chart.destroy();
        chart = null;
    }
}

function clearLocalStorage() {
    localStorage.clear();
    performanceData = [];
    updateChart();
    updateLog();
}

function loadAndDisplayData() {
    const storedData = JSON.parse(localStorage.getItem('performanceData'));
    if (storedData) {
        performanceData = storedData;
    }
    populateDayWeights();
    updateChart();
    updateLog();
    calculateTimeSinceLastDrink();
}

function updateChart() {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    const labels = performanceData.map(item => item.day);
    const dataPoints = performanceData.map(item => parseFloat(item.performance));

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Performance Over Time',
                data: dataPoints,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                fill: false
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Performance Score'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                }
            },
            responsive: true
        }
    });
}

function updateLog() {
    const logContainer = document.getElementById('logContainer');
    logContainer.innerHTML = '';
    performanceData.forEach(data => {
        const entry = document.createElement('div');
        entry.innerHTML = `
            <strong>Date:</strong> ${data.dateTime} <br>
            <strong>Age:</strong> ${data.age} <br>
            <strong>Body Weight:</strong> ${data.bodyWeight} kg <br>
            <strong>Units:</strong> ${data.units} <br>
            <strong>Impact Constant:</strong> ${data.impactConstant} <br>
            <strong>Decay Constant:</strong> ${data.decayConstant} <br>
            <strong>Time Since Last Drink:</strong> ${data.timeSinceLastDrink} hours <br>
            <strong>Performance:</strong> ${data.performance}
        `;
        logContainer.appendChild(entry);
    });
}

function resetDayWeights() {
    defaultDayWeights = {
        "Monday": -8,
        "Tuesday": -10,
        "Wednesday": -10,
        "Thursday": -10,
        "Friday": 0,
        "Saturday": -2,
        "Sunday": -12
    };
    populateDayWeights();
}

function saveDayWeights() {
    updateDayWeight();
    alert("Day weights saved!");
}

function calculateTimeSinceLastDrink() {
    const lastEntry = performanceData[performanceData.length - 1];
    if (lastEntry) {
        const lastEntryTime = new Date(lastEntry.dateTime);
        const currentTime = new Date(document.getElementById('dateTime').value);
        const timeDiff = (currentTime - lastEntryTime) / (1000 * 60 * 60); // Time difference in hours
        document.getElementById('timeSinceLastDrink').value = timeDiff.toFixed(2);
    }
}

function aggregatePerformanceData() {
    const performanceByBeers = {};

    performanceData.forEach(entry => {
        const beers = entry.units;
        const performance = parseFloat(entry.performance);

        if (!performanceByBeers[beers]) {
            performanceByBeers[beers] = { totalPerformance: 0, count: 0 };
        }

        performanceByBeers[beers].totalPerformance += performance;
        performanceByBeers[beers].count += 1;
    });

    const aggregatedData = [];
    for (const beers in performanceByBeers) {
        const { totalPerformance, count } = performanceByBeers[beers];
        aggregatedData.push({ beers: parseFloat(beers), averagePerformance: totalPerformance / count });
    }

    return aggregatedData;
}

function findOptimalBeerLevel(aggregatedData) {
    return aggregatedData.reduce((max, entry) => entry.averagePerformance > max.averagePerformance ? entry : max, { beers: 0, averagePerformance: -Infinity });
}

function fitQuadraticCurve(data) {
    // Fit a quadratic curve y = ax^2 + bx + c to the data
    const n = data.length;
    let sumX = 0, sumY = 0, sumX2 = 0, sumX3
    = 0, sumX4 = 0, sumXY = 0, sumX2Y = 0;

    data.forEach(point => {
        const x = point.beers;
        const y = point.averagePerformance;
        sumX += x;
        sumY += y;
        sumX2 += x * x;
        sumX3 += x * x * x;
        sumX4 += x * x * x * x;
        sumXY += x * y;
        sumX2Y += x * x * y;
    });

    const A = [
        [sumX4, sumX3, sumX2],
        [sumX3, sumX2, sumX],
        [sumX2, sumX, n]
    ];
    const B = [sumX2Y, sumXY, sumY];

    // Solve for a, b, c
    const [a, b, c] = solveLinearSystem(A, B);
    return { a, b, c };
}

function solveLinearSystem(A, B) {
    // Solve the system of linear equations using Gaussian elimination
    for (let i = 0; i < A.length; i++) {
        let maxEl = Math.abs(A[i][i]);
        let maxRow = i;
        for (let k = i + 1; k < A.length; k++) {
            if (Math.abs(A[k][i]) > maxEl) {
                maxEl = Math.abs(A[k][i]);
                maxRow = k;
            }
        }

        for (let k = i; k < A.length; k++) {
            const tmp = A[maxRow][k];
            A[maxRow][k] = A[i][k];
            A[i][k] = tmp;
        }
        const tmp = B[maxRow];
        B[maxRow] = B[i];
        B[i] = tmp;

        for (let k = i + 1; k < A.length; k++) {
            const c = -A[k][i] / A[i][i];
            for (let j = i; j < A.length; j++) {
                if (i === j) {
                    A[k][j] = 0;
                } else {
                    A[k][j] += c * A[i][j];
                }
            }
            B[k] += c * B[i];
        }
    }

    const x = new Array(A.length).fill(0);
    for (let i = A.length - 1; i >= 0; i--) {
        x[i] = B[i] / A[i][i];
        for (let k = i - 1; k >= 0; k--) {
            B[k] -= A[k][i] * x[i];
        }
    }
    return x;
}

function generatePerformanceArc(a, b, c, numPoints = 100) {
    const arcData = [];
    for (let i = 0; i <= numPoints; i++) {
        const x = i * 10 / numPoints; // Adjust this range as necessary
        const y = a * x * x + b * x + c;
        arcData.push({ x, y });
    }
    return arcData;
}

function plotOptimalBeerLevelChart() {
    const aggregatedData = aggregatePerformanceData();
    const optimalBeerLevel = findOptimalBeerLevel(aggregatedData);
    const { a, b, c } = fitQuadraticCurve(aggregatedData);
    const performanceArc = generatePerformanceArc(a, b, c);

    const ctx = document.getElementById('optimalBeerLevelChart').getContext('2d');
    new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Performance vs. Beers',
                data: aggregatedData.map(entry => ({ x: entry.beers, y: entry.averagePerformance })),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgb(75, 192, 192)',
                showLine: true,
                fill: false,
                tension: 0.1
            }, {
                label: 'Performance Arc',
                data: performanceArc,
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                showLine: true,
                fill: false,
                tension: 0.1
            }]
        },
        options: {
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Performance'
                    },
                    min: Math.min(...performanceArc.map(point => point.y)),
                    max: Math.max(...performanceArc.map(point => point.y)),
                    ticks: {
                        callback: function(value) {
                            if (value === Math.max(...performanceArc.map(point => point.y))) {
                                return '😀'; // Good performance
                            }
                            if (value === Math.min(...performanceArc.map(point => point.y))) {
                                return '☹️'; // Poor performance
                            }
                            return value;
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Number of Beers'
                    }
                }
            },
            responsive: true,
            plugins: {
                annotation: {
                    annotations: {
                        line1: {
                            type: 'line',
                            xMin: optimalBeerLevel.beers,
                            xMax: optimalBeerLevel.beers,
                            borderColor: 'red',
                            borderWidth: 2,
                            label: {
                                content: `Peak: ${optimalBeerLevel.beers} Beers`,
                                enabled: true,
                                position: 'top'
                            }
                        }
                    }
                }
            }
        }
    });
}

document.getElementById('dateTime').addEventListener('change', calculateTimeSinceLastDrink);
document.getElementById('calculateOptimalBeerLevel').addEventListener('click', plotOptimalBeerLevelChart);

window.onload = loadAndDisplayData;

