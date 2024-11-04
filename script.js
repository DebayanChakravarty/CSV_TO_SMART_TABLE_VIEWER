document.addEventListener('DOMContentLoaded',function(){

const filePath = './JavaScript_Function_Classification_with_Use_Cases.csv';


// Method 1: Read CSV File and Create an Array of Rows and Columns
function readCSVFile(filePath) {
        return fetch(filePath)
            .then(response => response.text())
            .then(data => {
                // Use a regular expression to split the CSV respecting quoted values
                const rows = data.split('\n');
                const arrayData = rows.map(row => {
                    const regex = /("(?:[^"]|"")*"|[^,]+)/g;
                    const columns = [];
                    let match;
    
                    while ((match = regex.exec(row)) !== null) {
                        let value = match[0].trim();
                        // If the value is quoted, remove the surrounding quotes
                        if (value.startsWith('"') && value.endsWith('"')) {
                            value = value.slice(1, -1).replace(/""/g, '"'); // Remove surrounding quotes and handle escaped quotes
                        }
                        columns.push(value);
                    }
    
                    return columns;
                });
    
                return arrayData;
            })
            .catch(error => {
                console.error('Error reading CSV file:', error);
                return [];
            });
    }

// Method 2: Validate CSV Data and Return Errors
function validateCSVData(arrayData) {
    const errors = [];
    if (arrayData.length < 2) {
        errors.push('Insufficient data: CSV must contain headers and at least one row of data.');
    } else {
        // Check for empty headers
        const headers = arrayData[0];
        if (headers.some(header => !header.trim())) {
            errors.push('Invalid CSV: Headers must not be empty.');
        }

        // Check if all rows have the same number of columns as headers
        const expectedColumns = headers.length;
        for (let i = 1; i < arrayData.length; i++) {
            if (arrayData[i].length !== expectedColumns) {
                errors.push(`Invalid CSV: Row ${i + 1} does not match the number of columns in the header.`);
            }
        }
    }

    return errors;
}

// Method 3: Convert Array into JSON Object
function convertArrayToJSON(arrayData) {
    if (arrayData.length < 2) {
        console.error('Insufficient data to create JSON object');
        return [];
    }

    // Extract headers
    const headers = arrayData[0];
    const jsonObjects = arrayData.slice(1).map(row => {
        const rowObject = {};
        headers.forEach((header, index) => {
            rowObject[header] = row[index] || null; // Set as null if value is missing
        });
        return rowObject;
    });

    return jsonObjects;
}


// Method 4: Create HTML Table from JSON Object (with Sorting Feature and Indicators)
function createHTMLTable(jsonObjects) {
    const appDiv = document.getElementById('app');
    appDiv.innerHTML = ''; // Clear previous content

    // Create Search Input
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.id = 'searchInput';
    searchInput.placeholder = 'Search...';
    searchInput.addEventListener('keyup', debounce(filterTable, 300));
    appDiv.appendChild(searchInput);

    // Create Table
    const table = document.createElement('table');
    table.id = 'dataTable';
    appDiv.appendChild(table);

    if (jsonObjects.length === 0) {
        console.error('No data to create HTML table');
        return;
    }

    // Create Table Header with Sorting Feature
    const headers = Object.keys(jsonObjects[0]);
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headers.forEach((header, index) => {
        const th = document.createElement('th');
        th.textContent = header;
        th.style.cursor = 'pointer';
        th.dataset.columnIndex = index;
        th.dataset.sortOrder = 'asc'; // Initialize sort order to ascending

        // Add span for the sorting indicator
        const sortIndicator = document.createElement('span');
        sortIndicator.classList.add('sort-indicator');
        th.appendChild(sortIndicator);

        // Add click event listener for sorting
        th.addEventListener('click', () => sortTable(index, th));

        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create Table Body
    const tbody = document.createElement('tbody');
    jsonObjects.forEach(obj => {
        const row = document.createElement('tr');
        headers.forEach(header => {
            const td = document.createElement('td');
            td.textContent = obj[header] ?? '';
            row.appendChild(td);
        });
        tbody.appendChild(row);
    });
    table.appendChild(tbody);
}

// Method 5: Display Validation Errors in HTML Table
function displayValidationErrors(errors) {
    const appDiv = document.getElementById('app');
    appDiv.innerHTML = ''; // Clear previous content

    const errorTable = document.createElement('table');
    errorTable.id = 'errorTable';
    errorTable.style.border = '1px solid red';
    appDiv.appendChild(errorTable);

    // Create Table Header for Errors
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const th = document.createElement('th');
    th.textContent = 'Validation Errors';
    th.colSpan = 1; // Only one column for error messages
    headerRow.appendChild(th);
    thead.appendChild(headerRow);
    errorTable.appendChild(thead);

    // Create Table Body for Error Messages
    const tbody = document.createElement('tbody');
    errors.forEach(error => {
        const row = document.createElement('tr');
        const td = document.createElement('td');
        td.textContent = error;
        row.appendChild(td);
        tbody.appendChild(row);
    });
    errorTable.appendChild(tbody);
}

// Method 6: Debounce Function to Limit Frequency of `filterTable` Execution
function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// Method 7: Search Functionality to Filter the Table
function filterTable() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toLowerCase();
    const table = document.getElementById('dataTable');
    const rows = table.getElementsByTagName('tr');
    let visibleRows = 0;

    for (let i = 1; i < rows.length; i++) {
        let row = rows[i];
        let cells = row.getElementsByTagName('td');
        let rowContainsFilter = false;

        for (let j = 0; j < cells.length; j++) {
            if (cells[j] && cells[j].innerText.toLowerCase().includes(filter)) {
                rowContainsFilter = true;
                break;
            }
        }
        if (rowContainsFilter) {
            row.style.display = '';
            visibleRows++;
        } else {
            row.style.display = 'none';
        }
    }

    // Check if no rows are visible and add "No results found" row if necessary
    const tbody = table.getElementsByTagName('tbody')[0];
    let noResultRow = document.getElementById('noResultRow');

    if (visibleRows === 0) {
        if (!noResultRow) {
            noResultRow = document.createElement('tr');
            noResultRow.id = 'noResultRow';
            const noResultCell = document.createElement('td');
            noResultCell.colSpan = rows[0].cells.length;
            noResultCell.textContent = 'No results found';
            noResultRow.appendChild(noResultCell);
            tbody.appendChild(noResultRow);
        }
    } else {
        if (noResultRow) {
            tbody.removeChild(noResultRow);
        }
    }
}


// Method 8: Sort Table Rows Based on Column with Indicators
function sortTable(columnIndex, headerElement) {
    const table = document.getElementById('dataTable');
    const tbody = table.getElementsByTagName('tbody')[0];
    const rows = Array.from(tbody.getElementsByTagName('tr'));

    // Determine sort order and toggle for next click
    let sortOrder = headerElement.dataset.sortOrder;
    headerElement.dataset.sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';

    // Remove indicators from all headers
    const headers = table.getElementsByTagName('th');
    for (let th of headers) {
        const indicator = th.querySelector('.sort-indicator');
        if (indicator) {
            indicator.textContent = '';
        }
    }

    // Set indicator for the clicked header
    const sortIndicator = headerElement.querySelector('.sort-indicator');
    if (sortOrder === 'asc') {
        sortIndicator.textContent = '↑';
    } else {
        sortIndicator.textContent = '↓';
    }

    // Sort rows based on the columnIndex and current sortOrder
    rows.sort((a, b) => {
        const aCell = a.getElementsByTagName('td')[columnIndex];
        const bCell = b.getElementsByTagName('td')[columnIndex];

        const aText = aCell ? aCell.textContent.toLowerCase() : '';
        const bText = bCell ? bCell.textContent.toLowerCase() : '';

        if (aText < bText) {
            return sortOrder === 'asc' ? -1 : 1;
        }
        if (aText > bText) {
            return sortOrder === 'asc' ? 1 : -1;
        }
        return 0;
    });

    // Remove all rows and append them in sorted order
    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }
    rows.forEach(row => tbody.appendChild(row));

    // Safari Repaint Trigger: Force reflow
    table.style.display = 'none';
    table.offsetHeight; // Accessing offsetHeight forces a reflow
    table.style.display = '';
}


// Read CSV and Create Array
readCSVFile(filePath)
    .then(arrayData => {
        // Validate CSV Data
        const validationErrors = validateCSVData(arrayData);
        if (validationErrors.length > 0) {
            // Display Validation Errors
            displayValidationErrors(validationErrors);
        } else {
            // Convert Array to JSON Object
            const jsonObjects = convertArrayToJSON(arrayData);

            // Create HTML Table from JSON Object
            createHTMLTable(jsonObjects);
        }
    })
    .catch(error => console.error('Error in processing CSV:', error));




  





  
    
})






