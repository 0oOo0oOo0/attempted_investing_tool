const etfUpload = document.getElementById('etf-upload');
const securityUpload = document.getElementById('security-upload');
const runButton = document.getElementById('run-button');
const clearButton = document.getElementById('clear-button');
const resultsSection = document.getElementById('results-section');
const resultsTableBody = document.querySelector('#results-table tbody');

let etfData = null;
let securityData = null;

function checkEnableRun() {
  if (etfUpload.files.length > 0 && securityUpload.files.length > 0) {
    runButton.disabled = false;
  } else {
    runButton.disabled = true;
  }
}

etfUpload.addEventListener('change', (e) => {
  readExcelFile(e.target.files[0], (data) => { etfData = data; checkEnableRun(); });
});

securityUpload.addEventListener('change', (e) => {
  readExcelFile(e.target.files[0], (data) => { securityData = data; checkEnableRun(); });
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
      <td>${etfAvgReturn.toFixed(4)}</td>
      <td>${securityAvgReturn.toFixed(4)}</td>
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

function readExcelFile(file, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    callback(json);
  };
  reader.readAsArrayBuffer(file);
}

function calculateAverageReturn(data) {
  if (!data) return 0;

  let sum = 0;
  let count = 0;

  for (let i = 1; i < data.length; i++) {  // starting at row 2 (index 1)
    const row = data[i];
    const value = parseFloat(row[6]);  // column G is index 6
    if (!isNaN(value)) {
      sum += value;
      count++;
    }
  }
  return count > 0 ? sum / count : 0;
}
