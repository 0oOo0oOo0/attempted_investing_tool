const etfUpload = document.getElementById('etf-upload');
const securityUpload = document.getElementById('security-upload');
const runButton = document.getElementById('run-button');
const clearButton = document.getElementById('clear-button');
const resultsSection = document.getElementById('results-section');
const resultsTableBody = document.querySelector('#results-table tbody');
const decimalCheckbox = document.getElementById('decimal-checkbox');
const percentageCheckbox = document.getElementById('percentage-checkbox');

let etfReturns = [];
let securityReturns = [];
let computedStats = null;

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

function extractReturns(data) {
  return data.slice(1).map(row => {
    const changeStr = row[6].replace('%', '').replace(',', '.').trim();
    return parseFloat(changeStr) / 100;
  });
}

function calculateAverageReturn(returns) {
  return returns.reduce((a, b) => a + b, 0) / returns.length;
}

function calculateVariance(returns, avg) {
  const sumSquaredDiff = returns.reduce((sum, ret) => sum + Math.pow(ret - avg, 2), 0);
  return sumSquaredDiff / returns.length;
}

function calculateStandardDeviation(variance) {
  return Math.sqrt(variance);
}

function calculateCorrelation(etfReturns, etfAvg, secReturns, secAvg, etfStd, secStd) {
  let sumProduct = 0;
  for (let i = 0; i < etfReturns.length; i++) {
    sumProduct += (etfReturns[i] - etfAvg) * (securityReturns[i] - secAvg);
  }
  const covariance = sumProduct / etfReturns.length;
  return covariance / (etfStd * secStd);
}

function formatDecimal(value) {
  return value.toFixed(4);
}

function formatPercentage(value) {
  return (value * 100).toFixed(2) + '%';
}

function renderResultsTable(format) {
  if (!computedStats) return;
  const { etfAvg, etfVar, etfStd, secAvg, secVar, secStd, correlation } = computedStats;
  const fmt = format === 'percentage' ? formatPercentage : formatDecimal;

  resultsTableBody.innerHTML = `
    <tr>
      <td>Average Return</td>
      <td>${fmt(etfAvg)}</td>
      <td>${fmt(secAvg)}</td>
    </tr>
    <tr>
      <td>Variance</td>
      <td>${fmt(etfVar)}</td>
      <td>${fmt(secVar)}</td>
    </tr>
    <tr>
      <td>Standard Deviation</td>
      <td>${fmt(etfStd)}</td>
      <td>${fmt(secStd)}</td>
    </tr>
    <tr>
      <td>Correlation Coefficient</td>
      <td colspan="2">${correlation.toFixed(4)}</td>
    </tr>
  `;
  resultsSection.style.display = 'block';
}

function checkEnableRun() {
  runButton.disabled = etfReturns.length === 0 || securityReturns.length === 0;
}

etfUpload.addEventListener('change', () => {
  if (etfUpload.files.length > 0) {
    const reader = new FileReader();
    reader.onload = (e) => {
      etfReturns = extractReturns(parseCSV(e.target.result));
      checkEnableRun();
    };
    reader.readAsText(etfUpload.files[0]);
  }
});

securityUpload.addEventListener('change', () => {
  if (securityUpload.files.length > 0) {
    const reader = new FileReader();
    reader.onload = (e) => {
      securityReturns = extractReturns(parseCSV(e.target.result));
      checkEnableRun();
    };
    reader.readAsText(securityUpload.files[0]);
  }
});

clearButton.addEventListener('click', () => {
  etfUpload.value = "";
  securityUpload.value = "";
  runButton.disabled = true;
  resultsSection.style.display = 'none';
  resultsTableBody.innerHTML = "";
  computedStats = null;
  decimalCheckbox.checked = true;
  percentageCheckbox.checked = false;
});

runButton.addEventListener('click', () => {
  const etfAvg = calculateAverageReturn(etfReturns);
  const etfVar = calculateVariance(etfReturns, etfAvg);
  const etfStd = calculateStandardDeviation(etfVar);

  const secAvg = calculateAverageReturn(securityReturns);
  const secVar = calculateVariance(securityReturns, secAvg);
  const secStd = calculateStandardDeviation(secVar);

  const correlation = calculateCorrelation(etfReturns, etfAvg, securityReturns, secAvg, etfStd, secStd);

  computedStats = { etfAvg, etfVar, etfStd, secAvg, secVar, secStd, correlation };

  renderResultsTable(decimalCheckbox.checked ? 'decimal' : 'percentage');
});

decimalCheckbox.addEventListener('change', () => {
  if (decimalCheckbox.checked) {
    percentageCheckbox.checked = false;
    renderResultsTable('decimal');
  } else {
    percentageCheckbox.checked = true;
  }
});

percentageCheckbox.addEventListener('change', () => {
  if (percentageCheckbox.checked) {
    decimalCheckbox.checked = false;
    renderResultsTable('percentage');
  } else {
    decimalCheckbox.checked = true;
  }
});
