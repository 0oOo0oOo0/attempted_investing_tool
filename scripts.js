const etfUpload = document.getElementById('etf-upload');
const securityUpload = document.getElementById('security-upload');
const runButton = document.getElementById('run-button');
const clearButton = document.getElementById('clear-button');
const resultsSection = document.getElementById('results-section');
const resultsTableBody = document.querySelector('#results-table tbody');

function checkEnableRun() {
  if (etfUpload.files.length > 0 && securityUpload.files.length > 0) {
    runButton.disabled = false;
  } else {
    runButton.disabled = true;
  }
}

etfUpload.addEventListener('change', checkEnableRun);
securityUpload.addEventListener('change', checkEnableRun);

clearButton.addEventListener('click', () => {
  etfUpload.value = "";
  securityUpload.value = "";
  runButton.disabled = true;
  resultsSection.style.display = 'none';
  resultsTableBody.innerHTML = "";
});

runButton.addEventListener('click', () => {
  resultsTableBody.innerHTML = `
    <tr>
      <td>Average Return</td>
      <td>...</td>
      <td>...</td>
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

