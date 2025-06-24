const etfUpload = document.getElementById('etf-upload');
const securityUpload = document.getElementById('security-upload');
const runButton = document.getElementById('run-button');
const clearButton = document.getElementById('clear-button');
const resultsSection = document.getElementById('results-section');
const resultsTableBody = document.querySelector('#results-table tbody');

// Utility function to parse CSV text into array of rows
function parseCSV(text) {
    return text.trim().split('\n').map(row => {
        const values = [];
        let current = '';
        let insideQuotes = false;
        for (let char of row) {
            if (char === '"' && insideQuotes) {
                insideQuotes = false;
            } else if (char === '"' && !insideQuotes) {
                insideQuotes = true;
            } else if (char === ',' && !insideQuotes) {
                values.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current);
        return values;
    });
}

// Extracts Change % column (G) as decimals
function extractReturns(data) {
    return data.slice(1) // skip header
        .map(row => {
            const changeStr = row[6].replace('%', '').replace(',', '.').trim();
            return parseFloat(changeStr) / 100;
        });
}

function calculateAverageReturn(returns) {
    const sum = returns.reduce((a, b) => a + b, 0);
    return sum / returns.length;
}

function calculateVariance(returns, averageReturn) {
    const squaredDiffs = returns.map(ret => Math.pow(ret - averageReturn, 2));
    const sum = squaredDiffs.reduce((a, b) => a + b, 0);
    return sum / returns.length;
}

function calculateStandardDeviation(variance) {
    return Math.sqrt(variance);
}

function formatPercentage(value) {
    return (value * 100).toFixed(2) + '%';
}

// --- File parsing logic ---
let etfReturns = [];
let securityReturns = [];

etfUpload.addEventListener('change', () => {
    if (etfUpload.files.length > 0) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = parseCSV(e.target.result);
            etfReturns = extractReturns(data);
            checkEnableRun();
        };
        reader.readAsText(etfUpload.files[0]);
    }
});

securityUpload.addEventListener('change', () => {
    if (securityUpload.files.length > 0) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = parseCSV(e.target.result);
            securityReturns = extractReturns(data);
            checkEnableRun();
        };
        reader.readAsText(securityUpload.files[0]);
    }
});

function checkEnableRun() {
    if (etfReturns.length > 0 && securityReturns.length > 0) {
        runButton.disabled = false;
    }
}

clearButton.addEventListener('click', () => {
    etfUpload.value = "";
    securityUpload.value = "";
    runButton.disabled = true;
    resultsSection.style.display = 'none';
    resultsTableBody.innerHTML = "";
});

runButton.addEventListener('click', () => {
    const etfAvg = calculateAverageReturn(etfReturns);
    const etfVar = calculateVariance(etfReturns, etfAvg);
    const etfStd = calculateStandardDeviation(etfVar);

    const secAvg = calculateAverageReturn(securityReturns);
    const secVar = calculateVariance(securityReturns, secAvg);
    const secStd = calculateStandardDeviation(secVar);

    resultsTableBody.innerHTML = `
        <tr>
            <td>Average Return</td>
            <td>${formatPercentage(etfAvg)}</td>
            <td>${formatPercentage(secAvg)}</td>
        </tr>
        <tr>
            <td>Variance</td>
            <td>${formatPercentage(etfVar)}</td>
            <td>${formatPercentage(secVar)}</td>
        </tr>
        <tr>
            <td>Standard Deviation</td>
            <td>${formatPercentage(etfStd)}</td>
            <td>${formatPercentage(secStd)}</td>
        </tr>
    `;
    resultsSection.style.display = 'block';
});
