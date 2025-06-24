const etfUpload = document.getElementById('etf-upload');
const securityUpload = document.getElementById('security-upload');
const runButton = document.getElementById('run-button');
const clearButton = document.getElementById('clear-button');
const resultsSection = document.getElementById('results-section');
const resultsTableBody = document.querySelector('#results-table tbody');

let etfData = null;
let securityData = null;

function checkEnableRun() {
  if (etfData && securityData) {
    runButton.disabled = false;
  } else {
    runButton.disabled = true;
  }
}

etfUpload.addEventListener('change', (e) => {
  readCSVFile(e.target.files[0], (data) => { etfData = data; checkEnableRun(); });
});

securityUpload.addEventListener('change', (e) => {
  readCSVFile(e.target.files[0], (data) => { securityData = data; checkEnableRun(); });
});

clearButton.addEventListener('click', () => {
  etfUpload.value = "";
  securityUpload.value = "";
  runButton.disabled = true;
  resultsSection.style.display = 'none';
  resultsTableBody.innerHTML = "";
  etfData = null;
  securityData = null;
});

runButton.addEventListener('click', () => {
  const etfAvgReturn = calculateAverageReturn(etfData);
  const securityAvgReturn = calculateAverageReturn(securityData);

  resultsTableBody.innerHTML = `
    <tr>
      <td>Average Return</td>
      <td>${formatPercent(etfAvgReturn)}</td>
      <td>${formatPercent(securityAvgReturn)}</td>
    </tr>
    <tr>
      <td>Variance</td>
      <td>...</td>
      <td>...</td>
    </tr>
    <tr>
      <td>Standard Deviation</td>
      <td>...</td>
      <td>...</td>
    </tr>
  `;
  resultsSection.style.display = 'block';
});

function readCSVFile(file, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target.result;
    const rows = text.trim().split('\n').map(row => row.split(','));
    callback(rows);
  };
  reader.readAsText(file);
}

function calculateAverageReturn(data) {
  if (!data) return 0;

  let sum = 0;
  let count = 0;

  for (let i = 1; i < data.length; i++) {  // start from row 2
    let value = data[i][6];  // column G (index 6)
    if (value) {
      value = value.replace(/[^0-9.\-]+/g, '');  // remove non-numeric characters
      const num = parseFloat(value);
      if (!isNaN(num)) {
        sum += num;
        count++;
      }
    }
  }
  return count > 0 ? sum / count : 0;
}

// Updated helper: no longer multiply by 100
function formatPercent(value) {
  return value.toFixed(2) + "%";
}
