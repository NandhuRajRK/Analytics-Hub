import Papa from 'papaparse';

export function loadCSV(filePath, callback) {
  fetch(filePath)
    .then(response => response.text())
    .then(csvText => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          callback(results.data);
        },
      });
    });
} 