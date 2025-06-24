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
  readCSVFile(e.target.files[0], (data) => { 
    etfData = data; 
    checkEnableRun(); 
  });
});

securityUpload.addEventListener('change', (e) => {
  readCSVFile(e.target.files[0], (data) => { 
    securityData = data; 
    checkEnableRun(); 
  });
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
    const rows = text.trim().split('\n').map(row => {
      // Handle commas inside quoted strings (like "1,222.29")
      // Simple CSV parser for your data:
      const pattern = /(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|([^\",]+))/g;
      let match;
      const result = [];
      while ((match = pattern.exec(row)) !== null) {
        // match[1] is quoted field, match[2] is unquoted
        result.push(match[1] ? match[1].replace(/""/g, '"') : match[2]);
      }
      return result;
    });
    callback(rows);
  };
  reader.readAsText(file);
}

function calculateAverageReturn(data) {
  if (!data) return 0;

  let sum = 0;
  let count = 0;

  for (let i = 1; i < data.length; i++) {  // skip header row
    let value = data[i][6];  // column G (index 6)
    if (value) {
      value = value.replace('%', '').trim();  // remove % sign
      let num = parseFloat(value);
      if (!isNaN(num)) {
        num = num / 100;  // convert percentage string to decimal
        sum += num;
        count++;
      }
    }
  }
  return count > 0 ? sum / count : 0;
}

function formatPercent(decimal) {
  return (decimal * 100).toFixed(2) + "%";
}
