// Global variables to store CSV data
let csvData = [];
let csvHeaders = [];

// File upload handler
document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('csvFile');
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            const contents = e.target.result;
            processData(contents);
            
        };
        reader.readAsText(file);
    });
    
    // Add enter key support for search
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchICSCode();
        }
    });
});
// ตัวเลือก 1: ใช้ console.log เท่านั้น (ไม่มี popup)
function processData(csvDataText) {
    console.log('=== Processing CSV ===');
        
    const lines = csvDataText.split('\n');
    const data = [];
    const headers = lines[0].split(',');

    console.log('All CSV Headers:', window.csvHeaders);
    console.log('Sample Row:', window.csvData[0]);
        
    console.log('Headers found:', headers);
        
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length === headers.length) {
            const entry = {};
            for (let j = 0; j < headers.length; j++) {
                entry[headers[j].trim()] = values[j].trim();
            }
            data.push(entry);
        }
    }
        
    csvData = data;
    csvHeaders = headers;
    window.csvData = data;
    window.csvHeaders = headers;
        
    console.log('CSV loaded successfully:', data.length, 'rows');
    console.log('Sample data:', data[0]);
        
    // แสดงข้อความใน console เท่านั้น
    console.log(`อัพโหลดไฟล์สำเร็จ! โหลดข้อมูล ${data.length} แถว`);
}
//--------------------------------
// ========================================
// TABLE COLUMN FILTER SYSTEM
// ========================================

// Global variables for filter
let activeFilters = {};
let filterDropdown = null;

// Initialize table filters
function initializeTableFilters() {
    const table = document.getElementById('resultsTable');
    if (!table) return;
    
    const headerCells = table.querySelectorAll('thead th');
    
    headerCells.forEach((th, columnIndex) => {
        // Skip if already has filter button
        if (th.querySelector('.filter-btn')) return;
        
        // Create filter button
        const filterBtn = document.createElement('button');
        filterBtn.className = 'filter-btn';
        filterBtn.innerHTML = '<i class="fas fa-filter"></i>';
        filterBtn.style.cssText = `
            margin-left: 8px;
            padding: 4px 8px;
            background: rgba(102, 126, 234, 0.1);
            border: 1px solid rgba(102, 126, 234, 0.3);
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            color: #667eea;
            transition: all 0.2s;
        `;
        
        filterBtn.onmouseover = function() {
            this.style.background = 'rgba(102, 126, 234, 0.2)';
            this.style.borderColor = '#667eea';
        };
        
        filterBtn.onmouseout = function() {
            this.style.background = 'rgba(102, 126, 234, 0.1)';
            this.style.borderColor = 'rgba(102, 126, 234, 0.3)';
        };
        
        filterBtn.onclick = function(e) {
            e.stopPropagation();
            showFilterDropdown(columnIndex, th);
        };
        
        th.appendChild(filterBtn);
        
        // Update filter button badge if filters exist
        updateFilterBadge(columnIndex);
    });
}

// Show filter dropdown
function showFilterDropdown(columnIndex, headerCell) {
    // Close existing dropdown
    if (filterDropdown) {
        closeFilterDropdown();
    }
    
    // Get unique values from column
    const table = document.getElementById('resultsTable');
    const tbody = table.querySelector('tbody');
    const rows = tbody.querySelectorAll('tr');
    
    const values = new Set();
    rows.forEach(row => {
        const cell = row.cells[columnIndex];
        if (cell) {
            const value = cell.textContent.trim();
            if (value) values.add(value);
        }
    });
    
    const uniqueValues = Array.from(values).sort();
    
    // Create dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'filter-dropdown';
    dropdown.style.cssText = `
        position: absolute;
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        padding: 12px;
        min-width: 250px;
        max-width: 350px;
        max-height: 400px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
    `;
    
    // Get position
    const rect = headerCell.getBoundingClientRect();
    dropdown.style.top = (rect.bottom + window.scrollY + 5) + 'px';
    dropdown.style.left = (rect.left + window.scrollX) + 'px';
    
    // Create content
    let content = '<div style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #e0e0e0;">';
    content += '<div style="font-weight: 600; color: #333; margin-bottom: 8px;">Filter Options</div>';
    
    // Search box
    content += '<input type="text" id="filterSearch" placeholder="Search..." style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 8px; font-size: 14px;">';
    
    // Select All / Deselect All
    content += '<div style="display: flex; gap: 10px; margin-bottom: 8px;">';
    content += '<button onclick="selectAllFilters(' + columnIndex + ')" style="flex: 1; padding: 6px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Select All</button>';
    content += '<button onclick="deselectAllFilters(' + columnIndex + ')" style="flex: 1; padding: 6px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Clear All</button>';
    content += '</div>';
    content += '</div>';
    
    // Values list
    content += '<div id="filterValuesList" style="overflow-y: auto; max-height: 250px; margin-bottom: 10px;">';
    
    if (uniqueValues.length === 0) {
        content += '<div style="text-align: center; padding: 20px; color: #999;">No data available</div>';
    } else {
        uniqueValues.forEach((value, index) => {
            const isChecked = !activeFilters[columnIndex] || activeFilters[columnIndex].includes(value);
            content += '<label style="display: flex; align-items: center; padding: 6px 8px; cursor: pointer; border-radius: 4px; transition: background 0.2s;" onmouseover="this.style.background=\'#f5f5f5\'" onmouseout="this.style.background=\'white\'">';
            content += '<input type="checkbox" class="filter-checkbox" value="' + value + '" ' + (isChecked ? 'checked' : '') + ' style="margin-right: 8px; cursor: pointer;">';
            content += '<span style="font-size: 13px; color: #333;">' + value + '</span>';
            content += '</label>';
        });
    }
    
    content += '</div>';
    
    // Action buttons
    content += '<div style="display: flex; gap: 8px; padding-top: 10px; border-top: 1px solid #e0e0e0;">';
    content += '<button onclick="applyColumnFilter(' + columnIndex + ')" style="flex: 1; padding: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">Apply</button>';
    content += '<button onclick="resetColumnFilter(' + columnIndex + ')" style="flex: 1; padding: 8px; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">Reset</button>';
    content += '<button onclick="closeFilterDropdown()" style="padding: 8px 12px; background: #f3f4f6; color: #374151; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">✕</button>';
    content += '</div>';
    
    dropdown.innerHTML = content;
    document.body.appendChild(dropdown);
    filterDropdown = dropdown;
    
    // Add search functionality
    setTimeout(() => {
        const searchInput = document.getElementById('filterSearch');
        if (searchInput) {
            searchInput.focus();
            searchInput.addEventListener('input', function() {
                filterValuesList(this.value.toLowerCase());
            });
        }
    }, 100);
    
    // Close on outside click
    setTimeout(() => {
        document.addEventListener('click', outsideClickHandler);
    }, 100);
}

// Filter values list based on search
function filterValuesList(searchTerm) {
    const labels = document.querySelectorAll('#filterValuesList label');
    labels.forEach(label => {
        const text = label.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            label.style.display = 'flex';
        } else {
            label.style.display = 'none';
        }
    });
}

// Select all filters
function selectAllFilters(columnIndex) {
    const checkboxes = document.querySelectorAll('#filterValuesList .filter-checkbox');
    checkboxes.forEach(cb => {
        if (cb.parentElement.style.display !== 'none') {
            cb.checked = true;
        }
    });
}

// Deselect all filters
function deselectAllFilters(columnIndex) {
    const checkboxes = document.querySelectorAll('#filterValuesList .filter-checkbox');
    checkboxes.forEach(cb => {
        if (cb.parentElement.style.display !== 'none') {
            cb.checked = false;
        }
    });
}

// Apply column filter
function applyColumnFilter(columnIndex) {
    const checkboxes = document.querySelectorAll('#filterValuesList .filter-checkbox');
    const selectedValues = [];
    
    checkboxes.forEach(cb => {
        if (cb.checked) {
            selectedValues.push(cb.value);
        }
    });
    
    // Save filter
    if (selectedValues.length === 0) {
        delete activeFilters[columnIndex];
    } else {
        activeFilters[columnIndex] = selectedValues;
    }
    
    // Apply all filters
    applyAllFilters();
    
    // Update badge
    updateFilterBadge(columnIndex);
    
    // Close dropdown
    closeFilterDropdown();
    
    // Show message
    showToast(`Applied filter: ${selectedValues.length} values selected`, 'success');
}

// Reset column filter
function resetColumnFilter(columnIndex) {
    delete activeFilters[columnIndex];
    applyAllFilters();
    updateFilterBadge(columnIndex);
    closeFilterDropdown();
    showToast('Filter cleared', 'info');
}

// Apply all active filters
function applyAllFilters() {
    const table = document.getElementById('resultsTable');
    const tbody = table.querySelector('tbody');
    const rows = tbody.querySelectorAll('tr');
    
    rows.forEach(row => {
        let showRow = true;
        
        // Check each active filter
        for (const [columnIndex, allowedValues] of Object.entries(activeFilters)) {
            const cell = row.cells[columnIndex];
            if (cell) {
                const cellValue = cell.textContent.trim();
                if (!allowedValues.includes(cellValue)) {
                    showRow = false;
                    break;
                }
            }
        }
        
        row.style.display = showRow ? '' : 'none';
    });
    
    // Update visible count
    updateVisibleRowCount();
}

// Update visible row count
function updateVisibleRowCount() {
    const table = document.getElementById('resultsTable');
    const tbody = table.querySelector('tbody');
    const rows = tbody.querySelectorAll('tr');
    const visibleRows = Array.from(rows).filter(row => row.style.display !== 'none');
    
    console.log(`Showing ${visibleRows.length} of ${rows.length} rows`);
}

// Update filter badge
function updateFilterBadge(columnIndex) {
    const table = document.getElementById('resultsTable');
    const th = table.querySelectorAll('thead th')[columnIndex];
    if (!th) return;
    
    const filterBtn = th.querySelector('.filter-btn');
    if (!filterBtn) return;
    
    // Remove existing badge
    const existingBadge = filterBtn.querySelector('.filter-badge');
    if (existingBadge) {
        existingBadge.remove();
    }
    
    // Add new badge if filter is active
    if (activeFilters[columnIndex]) {
        const badge = document.createElement('span');
        badge.className = 'filter-badge';
        badge.textContent = activeFilters[columnIndex].length;
        badge.style.cssText = `
            position: absolute;
            top: -6px;
            right: -6px;
            background: #ef4444;
            color: white;
            border-radius: 10px;
            padding: 2px 6px;
            font-size: 10px;
            font-weight: 600;
            min-width: 18px;
            text-align: center;
        `;
        filterBtn.style.position = 'relative';
        filterBtn.appendChild(badge);
        
        // Change button color when filter is active
        filterBtn.style.background = 'rgba(239, 68, 68, 0.1)';
        filterBtn.style.borderColor = 'rgba(239, 68, 68, 0.3)';
        filterBtn.style.color = '#ef4444';
    } else {
        filterBtn.style.background = 'rgba(102, 126, 234, 0.1)';
        filterBtn.style.borderColor = 'rgba(102, 126, 234, 0.3)';
        filterBtn.style.color = '#667eea';
    }
}

// Close filter dropdown
function closeFilterDropdown() {
    if (filterDropdown) {
        document.removeEventListener('click', outsideClickHandler);
        if (filterDropdown.parentNode) {
            filterDropdown.parentNode.removeChild(filterDropdown);
        }
        filterDropdown = null;
    }
}

// Outside click handler
function outsideClickHandler(e) {
    if (filterDropdown && !filterDropdown.contains(e.target)) {
        closeFilterDropdown();
    }
}

// Clear all filters
function clearAllFilters() {
  try {
    // Clear search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.value = '';
    }
    
    // Clear results lists
    const resultsList = document.getElementById('resultsList');
    if (resultsList) {
      resultsList.innerHTML = '';
    }
    
    const resultsList2 = document.getElementById('resultsList2');
    if (resultsList2) {
      resultsList2.innerHTML = '';
    }
    
    // Clear table
    const table = document.getElementById('resultsTable');
    const tbody = table.querySelector('tbody');
    if (tbody) {
      tbody.innerHTML = '';
    }
    
    // Clear file input
    const fileInput = document.getElementById('csvFile');
    if (fileInput) {
      fileInput.value = '';
    }
    
    // แสดง success message
    showClearSuccess();
    
  } catch (error) {
    console.error('Clear Filters Error:', error);
    alert('❌ เกิดข้อผิดพลาดในการล้างข้อมูล\n\n' + error.message);
  }
}

// Export filtered data only
function exportFilteredCSV() {
    const table = document.getElementById('resultsTable');
    
    if (!table) {
        console.error('Table not found');
        return;
    }
    
    const csv = [];
    
    // Add headers
    const headerRow = [];
    const headerCells = table.querySelectorAll('thead th');
    headerCells.forEach(th => {
        const text = th.textContent.replace(/"/g, '""');
        // Remove filter button icon from export
        const cleanText = text.replace(/\s*\uF0B0\s*/, '').trim();
        headerRow.push('"' + cleanText + '"');
    });
    csv.push(headerRow.join(','));
    
    // Add visible rows only
    const tbody = table.querySelector('tbody');
    const rows = tbody.querySelectorAll('tr');
    
    rows.forEach(row => {
        if (row.style.display !== 'none') {
            const rowData = [];
            const cells = row.cells;
            
            for (let j = 0; j < cells.length; j++) {
                const cellText = cells[j].textContent.replace(/"/g, '""');
                rowData.push('"' + cellText + '"');
            }
            
            csv.push(rowData.join(','));
        }
    });
    
    const csvContent = csv.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'filtered_results.csv';
    
    setTimeout(function() {
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
    
    showToast('Filtered data exported successfully', 'success');
}

// Call this after search results are displayed
function enableTableFilters() {
    setTimeout(() => {
        initializeTableFilters();
    }, 500);
}

//---------------------------------
function fetchCSV() {
  const csvUrl = 'https://media.githubusercontent.com/media/asianstanley/PRODUCTION-SMT/refs/heads/main/TABLE.csv';

  fetch(csvUrl)
    .then(res => res.text())
    .then(data => {
      console.log(data);  // CSV text จะอยู่ตรงนี้
      processData(data);
    })
    .catch(err => console.error(err));
}

// ตัวเลือก 2: แสดงข้อความใน element บนหน้าเว็บ
function processDataWithStatus(csvDataText) {
    console.log('=== Processing CSV ===');
        
    const lines = csvDataText.split('\n');
    const data = [];
    const headers = lines[0].split(',');
        
    console.log('Headers found:', headers);
        
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length === headers.length) {
            const entry = {};
            for (let j = 0; j < headers.length; j++) {
                entry[headers[j].trim()] = values[j].trim();
            }
            data.push(entry);
        }
    }
        
    csvData = data;
    csvHeaders = headers;
    window.csvData = data;
    window.csvHeaders = headers;
        
    console.log('CSV loaded successfully:', data.length, 'rows');
    console.log('Sample data:', data[0]);
    
    // แสดงใน status element (ต้องมี element ที่มี id="status" ในหน้าเว็บ)
    const statusElement = document.getElementById('status');
    if (statusElement) {
        statusElement.textContent = `อัพโหลดไฟล์สำเร็จ! โหลดข้อมูล ${data.length} แถว`;
        statusElement.style.color = 'green';
        
        // ซ่อนข้อความหลังจาก 3 วินาที
        setTimeout(() => {
            statusElement.textContent = '';
        }, 3000);
    }
}

// ตัวเลือก 3: สร้าง Toast Notification (แจ้งเตือนชั่วคราว)
function processDataWithToast(csvDataText) {
    console.log('=== Processing CSV ===');
        
    const lines = csvDataText.split('\n');
    const data = [];
    const headers = lines[0].split(',');
        
    console.log('Headers found:', headers);
        
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length === headers.length) {
            const entry = {};
            for (let j = 0; j < headers.length; j++) {
                entry[headers[j].trim()] = values[j].trim();
            }
            data.push(entry);
        }
    }
        
    csvData = data;
    csvHeaders = headers;
    window.csvData = data;
    window.csvHeaders = headers;
        
    console.log('CSV loaded successfully:', data.length, 'rows');
    console.log('Sample data:', data[0]);
    
    // สร้าง Toast notification
    showToast(`อัพโหลดไฟล์สำเร็จ! โหลดข้อมูล ${data.length} แถว`);
}
// ฟังก์ชันหลักสำหรับ process CSV data
// ฟังก์ชันหลักสำหรับ process CSV data
function processData(csvDataText) {
    console.log('=== Processing CSV ===');
    
    // ลบ BOM ถ้ามี
    csvDataText = csvDataText.replace(/^\uFEFF/, '');
    
    // Parse CSV อย่างถูกต้อง (รองรับ comma ใน quotes)
    const lines = parseCSVLines(csvDataText);
    
    if (lines.length === 0) {
        showToast('ไฟล์ CSV ว่างเปล่า', 'error');
        return;
    }
    
    const data = [];
    const headers = lines[0].map(h => h.trim());
    
    console.log('Headers found:', headers);
    console.log('Number of columns:', headers.length);
    
    // ตรวจสอบว่ามี headers หรือไม่
    if (headers.length === 0 || (headers.length === 1 && headers[0] === '')) {
        showToast('ไม่พบ headers ในไฟล์ CSV', 'error');
        console.error('No valid headers found');
        return;
    }
    
    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i];
        
        // ข้ามแถวว่าง
        if (values.length === 1 && values[0].trim() === '') {
            continue;
        }
        
        const entry = {};
        for (let j = 0; j < headers.length; j++) {
            entry[headers[j]] = values[j] ? values[j].trim() : '';
        }
        data.push(entry);
    }
    
    csvData = data;
    csvHeaders = headers;
    window.csvData = data;
    window.csvHeaders = headers;
    
    console.log('CSV loaded successfully:', data.length, 'rows');
    console.log('First 3 headers:', headers.slice(0, 3));
    console.log('Sample data:', data[0]);
    
    // แสดง Toast แทน alert
    showToast(`อัพโหลดไฟล์สำเร็จ! โหลดข้อมูล ${data.length} แถว (${headers.length} คอลัมน์)`, 'success');
}

// ฟังก์ชัน parse CSV ที่รองรับ comma ใน quotes
function parseCSVLines(text) {
    const lines = [];
    let currentRow = [];
    let currentField = '';
    let inQuotes = false;
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];
        
        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                // Escaped quote
                currentField += '"';
                i++; // Skip next quote
            } else {
                // Toggle quote state
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            // End of field
            currentRow.push(currentField);
            currentField = '';
        } else if ((char === '\n' || char === '\r') && !inQuotes) {
            // End of row
            if (char === '\r' && nextChar === '\n') {
                i++; // Skip \n in \r\n
            }
            currentRow.push(currentField);
            if (currentRow.length > 0) {
                lines.push(currentRow);
            }
            currentRow = [];
            currentField = '';
        } else {
            currentField += char;
        }
    }
    
    // Add last field and row if exists
    if (currentField !== '' || currentRow.length > 0) {
        currentRow.push(currentField);
        lines.push(currentRow);
    }
    
    return lines;
}

// ฟังก์ชันสำหรับแสดง Toast notification
function showToast(message, type = 'success') {
    // สร้าง toast container ถ้ายังไม่มี
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            pointer-events: none;
        `;
        document.body.appendChild(toastContainer);
    }
    
    // กำหนดสีตามประเภท
    const colors = {
        success: '#4CAF50',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196F3'
    };
    
    // สร้าง toast element
    const toast = document.createElement('div');
    toast.innerHTML = `
        <div style="
            background: ${colors[type] || colors.success};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 10px;
            transform: translateX(100%);
            transition: all 0.3s ease;
            pointer-events: auto;
            cursor: pointer;
            border-left: 4px solid rgba(255,255,255,0.3);
        ">
            ${message}
        </div>
    `;
    
    toastContainer.appendChild(toast);
    const toastElement = toast.firstElementChild;
    
    // Animation เข้า
    setTimeout(() => {
        toastElement.style.transform = 'translateX(0)';
    }, 10);
    
    // Click เพื่อปิด
    toastElement.addEventListener('click', () => {
        hideToast(toast);
    });
    
    // Auto hide หลัง 4 วินาที
    setTimeout(() => {
        hideToast(toast);
    }, 4000);
    
    function hideToast(toastWrapper) {
        const element = toastWrapper.firstElementChild;
        element.style.transform = 'translateX(100%)';
        element.style.opacity = '0';
        
        setTimeout(() => {
            if (toastWrapper.parentNode) {
                toastWrapper.parentNode.removeChild(toastWrapper);
            }
        }, 300);
    }
}

// ตัวอย่างการใช้งานประเภทต่างๆ
function showSuccessToast(message) {
    showToast(message, 'success');
}

function showErrorToast(message) {
    showToast(message, 'error');
}

function showWarningToast(message) {
    showToast(message, 'warning');
}

function showInfoToast(message) {
    showToast(message, 'info');
}

window.onload = fetchCSV;
function exportCSV() {
  var table = document.getElementById('resultsTable');

  if (!table) {
      console.error('ไม่พบตารางที่มี id="resulttable"');
      return;
  }

  var csv = [];
  var rows = table.rows;

  for (var i = 0; i < rows.length; i++) { //rows.length คือจำนวนแถวในตาราง resultsTable.
      var row = []; //row เป็นอาร์เรย์ที่ใช้เพื่อเก็บข้อมูลแต่ละเซลล์ในแถวปัจจุบันของตาราง.
      var cells = rows[i].cells; //cells เป็นคอลเล็กชันของเซลล์ในแถวปัจจุบัน (rows[i]). 

      for (var j = 0; j < cells.length; j++) { //วนลูปผ่านเซลล์ในแต่ละแถว (cells):
          var cellText = cells[j].innerText.replace(/"/g, '""'); // cells[j].innerText คือข้อความที่อยู่ในเซลล์ที่ j ในแถวปัจจุบัน. replace(/"/g, '""') ใช้เพื่อแทนที่เครื่องหมาย " ด้วย "" เพื่อป้องกันการขัดแย้งกับตัวครอบข้อมูลใน CSV.
          row.push('"' + cellText + '"');//เพิ่มข้อความที่ผ่านการป้องกันแล้วเข้าไปในอาร์เรย์ row โดยใส่เครื่องหมายคำพูดครอบข้อมูล.
      }

      csv.push(row.join(','));//row.join(',') จะเชื่อมข้อมูลในอาร์เรย์ row เข้าด้วยกันโดยใช้เครื่องหมาย , เป็นตัวคั่น และเพิ่มแถว CSV ที่เกิดจากการเชื่อมข้อมูลนั้นลงในอาร์เรย์ csv.
  }

  var csvContent = csv.join('\n');
  var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  // สร้าง URL สำหรับ Blob object
  var url = URL.createObjectURL(blob);

  // สร้าง element <a> เพื่อลิงก์ไปยัง URL และทำการดาวน์โหลดไฟล์
  var a = document.createElement('a');
  a.href = url;
  a.download = 'resultsearch.csv';

  // เพิ่ม element <a> เข้าไปใน DOM แต่ยังไม่ทำการ append ไปยัง document.body
  // สามารถใช้ setTimeout เพื่อให้ browser มีเวลาในการเตรียมตัวสำหรับการดาวน์โหลด
  setTimeout(function() {
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  }, 100);
}
// ========================================
// เพิ่มฟังก์ชันเหล่านี้ในไฟล์ JavaScript ของคุณ
// ========================================

// Show Offset Modal
function showOffsetModal(offsetData) {
    // ลบ modal เก่าถ้ามี
    const existingModal = document.getElementById('offsetModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // สร้าง modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'offsetModal';
    modalOverlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.7); display: flex; justify-content: center; align-items: center; z-index: 10000; animation: fadeIn 0.3s ease;';
    
    // สร้าง modal content
    const modalContent = document.createElement('div');
    modalContent.style.cssText = 'background: white; border-radius: 15px; padding: 30px; max-width: 600px; max-height: 80vh; overflow-y: auto; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3); position: relative; animation: slideIn 0.3s ease;';
    
    // Parse offset data
    var displayContent = '';
    if (!offsetData || offsetData.trim() === '') {
        displayContent = '<p style="text-align: center; color: #666; padding: 20px; font-size: 16px;">ไม่มีข้อมูล Offset XY</p>';
    } else {
        displayContent = '<div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid #667eea;">';
        displayContent += '<pre style="margin: 0; font-family: Courier New, monospace; font-size: 14px; line-height: 1.8; color: #333; white-space: pre-wrap; word-wrap: break-word;">' + offsetData + '</pre>';
        displayContent += '</div>';
    }
    
    // สร้าง HTML ของ modal
    var modalHTML = '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">';
    modalHTML += '<h3 style="margin: 0; color: #333; font-size: 24px;">';
    modalHTML += '<i class="fas fa-crosshairs" style="color: #667eea; margin-right: 10px;"></i>';
    modalHTML += 'Offset XY Data';
    modalHTML += '</h3>';
    modalHTML += '<button onclick="closeOffsetModal()" style="background: none; border: none; font-size: 28px; color: #999; cursor: pointer; padding: 0; width: 35px; height: 35px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: all 0.2s;" onmouseover="this.style.background=\'#f0f0f0\'; this.style.color=\'#333\';" onmouseout="this.style.background=\'none\'; this.style.color=\'#999\';">';
    modalHTML += '×';
    modalHTML += '</button>';
    modalHTML += '</div>';
    modalHTML += displayContent;
    modalHTML += '<div style="margin-top: 20px; text-align: right;">';
    modalHTML += '<button onclick="copyOffsetData()" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 500; margin-right: 10px; transition: transform 0.2s;" onmouseover="this.style.transform=\'translateY(-2px)\';" onmouseout="this.style.transform=\'translateY(0)\';">';
    modalHTML += '<i class="fas fa-copy"></i> Copy';
    modalHTML += '</button>';
    modalHTML += '<button onclick="closeOffsetModal()" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 500; transition: transform 0.2s;" onmouseover="this.style.transform=\'translateY(-2px)\';" onmouseout="this.style.transform=\'translateY(0)\';">';
    modalHTML += '<i class="fas fa-times"></i> Close';
    modalHTML += '</button>';
    modalHTML += '</div>';
    
    modalContent.innerHTML = modalHTML;
    
    // เก็บ offset data ไว้ใน attribute เพื่อใช้ copy
    modalContent.setAttribute('data-offset', offsetData);
    
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    
    // ปิด modal เมื่อคลิกที่ overlay
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            closeOffsetModal();
        }
    });
    
    // เพิ่ม CSS animations
    if (!document.getElementById('modalAnimations')) {
        var style = document.createElement('style');
        style.id = 'modalAnimations';
        style.textContent = '@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } @keyframes slideIn { from { transform: translateY(-50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } } @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }';
        document.head.appendChild(style);
    }
}

// Close Offset Modal
function closeOffsetModal() {
    var modal = document.getElementById('offsetModal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(function() {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }
}

// Copy Offset Data
function copyOffsetData() {
    var modal = document.getElementById('offsetModal');
    if (!modal) return;
    
    var modalContent = modal.querySelector('div');
    var offsetData = modalContent.getAttribute('data-offset');
    
    if (!offsetData || offsetData.trim() === '') {
        showToast('ไม่มีข้อมูลให้ Copy', 'warning');
        return;
    }
    
    var textarea = document.createElement('textarea');
    textarea.value = offsetData;
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        showToast('Copy ข้อมูล Offset XY สำเร็จ!', 'success');
    } catch (err) {
        showToast('ไม่สามารถ Copy ได้', 'error');
        console.error('Copy failed:', err);
    }
    
    document.body.removeChild(textarea);
}
///-------------------+++++++++++++++++++
 

//+-----------------------++++++++++++++++++

// Search function (exact copy of working code with Part Comment correction)
function searchICSCode() {
    console.log('=== Starting Search ===');
    
    const searchInput = document.getElementById('searchInput').value.trim().toLowerCase();
    const resultsList = document.getElementById('resultsList');
    const resultsList2 = document.getElementById('resultsList2');
    const resultsTableBody = document.getElementById('resultsTable').getElementsByTagName('tbody')[0];
    
    console.log('Search term:', searchInput);


    
    
    // Clear previous results
    resultsList.innerHTML = '';
    resultsList2.innerHTML = '';
    resultsTableBody.innerHTML = '';
    
    if (!window.csvData) {
        alert('No CSV data available.');
        return;
    }
    
    if (!searchInput) {
        alert('กรุณาใส่คำค้นหา');
        return;
    }
    
    console.log('Searching in', window.csvData.length, 'rows');
    
    // Search for matches
    const foundIndexes = [];
    for (let i = 0; i < window.csvData.length; i++) {
        let matchFound = false;
        
        const icsCode = window.csvData[i]['ICS Code'] || '';
        const partComment = window.csvData[i]['Part Comment'] || '';
        const programName = window.csvData[i]['Program Name'] || '';
        
        if (icsCode.toLowerCase().includes(searchInput) ||
            partComment.toLowerCase().includes(searchInput) ||
            programName.toLowerCase().includes(searchInput)) {
            foundIndexes.push(i);
            matchFound = true;
        } else {
            for (const prop in window.csvData[i]) {
                if (window.csvData[i].hasOwnProperty(prop)) {
                    const value = window.csvData[i][prop].toString().toLowerCase();
                    if (value.includes(searchInput)) {
                        foundIndexes.push(i);
                        matchFound = true;
                        break;
                    }
                }
            }
        }
    }

    
    
    console.log('Total matches found:', foundIndexes.length);
    
    if (foundIndexes.length > 0) {
        const uniqueResults = {};
        
        foundIndexes.forEach(function(index) {
            const icsCode = window.csvData[index]['ICS Code'] || '';
            const partComment = window.csvData[index]['Part Comment'] || '';
            
            if (icsCode && !uniqueResults[icsCode]) {
                const option = document.createElement('option');
                option.text = icsCode;
                option.value = icsCode;
                resultsList.add(option);
                uniqueResults[icsCode] = true;
            }
            
            if (partComment && !uniqueResults[partComment]) {
                const option2 = document.createElement('option');
                option2.text = partComment;
                option2.value = partComment;
                resultsList2.add(option2);
                uniqueResults[partComment] = true;
            }
        });
        
        // Display all matching data in table
        foundIndexes.forEach(function(index) {
            const row = resultsTableBody.insertRow();
            const cells = [];
            for (let i = 0; i < 30; i++) {
                cells.push(row.insertCell(i));
            }
            
            cells[0].textContent = window.csvData[index]['Feeder No.'] || '';
            cells[1].textContent = window.csvData[index]['ICS Code'] || '';
            cells[2].textContent = window.csvData[index]['Part Comment'] || '';
            cells[3].textContent = window.csvData[index]['Fdr Type'] || '';
            cells[4].textContent = window.csvData[index]['Pitch'] || '';
            cells[5].textContent = window.csvData[index]['Program Name'] || '';
            cells[6].textContent = window.csvData[index]['Machine No.'] || '';
            cells[7].textContent = window.csvData[index]['Mount Height'] || '';
            cells[8].textContent = window.csvData[index]['Mount Timer'] || '';
            cells[9].textContent = window.csvData[index]['Pick Height'] || '';
            cells[10].textContent = window.csvData[index]['Pick Timer'] || '';
            cells[11].textContent = window.csvData[index]['Pick Start'] || '';
            cells[12].textContent = window.csvData[index]['Pick Speed'] || '';
            cells[13].textContent = window.csvData[index]['XY Speed'] || '';
            cells[14].textContent = window.csvData[index]['Pick Action'] || '';
            cells[15].textContent = window.csvData[index]['Mount Action'] || '';
            cells[16].textContent = window.csvData[index]['Mount Speed'] || '';
            cells[17].textContent = window.csvData[index]['Body X'] || '';
            cells[18].textContent = window.csvData[index]['Body Y'] || '';
            cells[19].textContent = window.csvData[index]['Body Z'] || '';
            cells[20].textContent = window.csvData[index]['Alignment Type'] || '';
            cells[21].textContent = window.csvData[index]['Algorithm'] || '';
            cells[22].textContent = window.csvData[index]['DatumAngle'] || '';
            cells[23].textContent = window.csvData[index]['Nozzle'] || '';
            cells[24].textContent = window.csvData[index]['TrayHeight'] || '';
            cells[25].textContent = window.csvData[index]['Offset_Num'] || '';
            
            // *** แก้ไขส่วนนี้ - สร้างปุ่มสำหรับ Offset XY ***
            const offsetXY = window.csvData[index]['Offset XY'] || '';
            const viewBtn = document.createElement('button');
            viewBtn.className = 'btn-view-offset';
            viewBtn.innerHTML = '<i class="fas fa-eye"></i> View';
            viewBtn.onclick = function() {
                showOffsetModal(offsetXY);
            };
            cells[26].appendChild(viewBtn);
            cells[26].style.textAlign = 'center';
            
            cells[27].textContent = window.csvData[index]['Point'] || '';
            cells[28].textContent = window.csvData[index]['Board'] || '';
            cells[29].textContent = window.csvData[index]['Mount Comments'] || '';
            
            // Highlight matching cells
            cells.forEach(cell => {
                if (cell.textContent && cell.textContent.toLowerCase().includes(searchInput)) {
                    cell.style.backgroundColor = '#fffacd';
                    cell.style.fontWeight = 'bold';
                }
            });
        });
        
        console.log('Search completed successfully');
        showSuccessMessage(`พบข้อมูล ${foundIndexes.length} รายการ`);
        
    } else {
        console.log('No matching data found');
        alert('No matching data found.');
    }
}

function inserttable() {
    var searchInput = document.getElementById('searchInput').value.trim().toLowerCase();
    
    if (!window.csvData || window.csvData.length === 0) {
        alert('No CSV data available. Please upload a file first.');
        return;
    }
    
    if (!searchInput) {
        alert('Please enter search criteria.');
        return;
    }
    
    var foundIndexes = [];
    for (var i = 0; i < window.csvData.length; i++) {
        var matchFound = false;
        if (window.csvData[i]['ICS Code'] && window.csvData[i]['ICS Code'].toLowerCase().includes(searchInput) ||
            window.csvData[i]['Part Comment'] && window.csvData[i]['Part Comment'].toLowerCase().includes(searchInput)) {
            foundIndexes.push(i);
            matchFound = true;
        } else {
            for (var prop in window.csvData[i]) {
                if (window.csvData[i].hasOwnProperty(prop)) {
                    var value = window.csvData[i][prop].toString().toLowerCase();
                    if (value.includes(searchInput)) {
                        foundIndexes.push(i);
                        matchFound = true;
                        break;
                    }
                }
            }
        }
    }

    if (foundIndexes.length === 0) {
        alert('No matching data found.');
        return;
    }
    
    var resultsList = document.getElementById('resultsList');
    var resultsList2 = document.getElementById('resultsList2');
    var tableBody = document.getElementById('resultsTable').getElementsByTagName('tbody')[0];
    
    foundIndexes.forEach(function(index) {
        var newRow = tableBody.insertRow();
        var cells = [];
        for (var i = 0; i < 30; i++) {
            cells.push(newRow.insertCell(i));
        }

        cells[0].textContent = window.csvData[index]['Feeder No.'] || '';
        cells[1].textContent = window.csvData[index]['ICS Code'] || '';
        cells[2].textContent = window.csvData[index]['Part Comment'] || '';
        cells[3].textContent = window.csvData[index]['Fdr Type'] || '';
        cells[4].textContent = window.csvData[index]['Pitch'] || '';
        cells[5].textContent = window.csvData[index]['Program Name'] || '';
        cells[6].textContent = window.csvData[index]['Machine No.'] || '';
        cells[7].textContent = window.csvData[index]['Mount Height'] || '';
        cells[8].textContent = window.csvData[index]['Mount Timer'] || '';
        cells[9].textContent = window.csvData[index]['Pick Height'] || '';
        cells[10].textContent = window.csvData[index]['Pick Timer'] || '';
        cells[11].textContent = window.csvData[index]['Pick Start'] || '';
        cells[12].textContent = window.csvData[index]['Pick Speed'] || '';
        cells[13].textContent = window.csvData[index]['XY Speed'] || '';
        cells[14].textContent = window.csvData[index]['Pick Action'] || '';
        cells[15].textContent = window.csvData[index]['Mount Action'] || '';
        cells[16].textContent = window.csvData[index]['Mount Speed'] || '';
        cells[17].textContent = window.csvData[index]['Body X'] || '';
        cells[18].textContent = window.csvData[index]['Body Y'] || '';
        cells[19].textContent = window.csvData[index]['Body Z'] || '';
        cells[20].textContent = window.csvData[index]['Alignment Type'] || '';
        cells[21].textContent = window.csvData[index]['Algorithm'] || '';
        cells[22].textContent = window.csvData[index]['DatumAngle'] || '';
        cells[23].textContent = window.csvData[index]['Nozzle'] || '';
        cells[24].textContent = window.csvData[index]['TrayHeight'] || '';
        cells[25].textContent = window.csvData[index]['Offset_Num'] || '';
        
        // *** แก้ไขส่วนนี้ - สร้างปุ่มสำหรับ Offset XY ***
        const offsetXY = window.csvData[index]['Offset XY'] || '';
        const viewBtn = document.createElement('button');
        viewBtn.className = 'btn-view-offset';
        viewBtn.innerHTML = '<i class="fas fa-eye"></i> View';
        viewBtn.onclick = function() {
            showOffsetModal(offsetXY);
        };
        cells[26].appendChild(viewBtn);
        cells[26].style.textAlign = 'center';
        
        cells[27].textContent = window.csvData[index]['Point'] || '';
        cells[28].textContent = window.csvData[index]['Board'] || '';
        cells[29].textContent = window.csvData[index]['Mount Comments'] || '';

        cells.forEach(function(cell) {
            if (cell.textContent && cell.textContent.toLowerCase().includes(searchInput)) {
                cell.style.backgroundColor = '#fffacd';
                cell.style.fontWeight = 'bold';
            }
        });
        
        var icsCode = window.csvData[index]['ICS Code'] || '';
        if (icsCode && !resultsList.querySelector('option[value="' + icsCode + '"]')) {
            var option = document.createElement('option');
            option.value = icsCode;
            option.textContent = icsCode;
            resultsList.appendChild(option);
        }
        
        var partComment = window.csvData[index]['Part Comment'] || '';
        if (partComment && !resultsList2.querySelector('option[value="' + partComment + '"]')) {
            var option2 = document.createElement('option');
            option2.value = partComment;
            option2.textContent = partComment;
            resultsList2.appendChild(option2);
        }
    });

    if (tableBody.rows.length > 0) {
        tableBody.rows[tableBody.rows.length - 1].scrollIntoView({ 
            behavior: 'smooth', 
            block: 'end', 
            inline: 'nearest' 
        });
    }

    alert('Data inserted successfully. Added ' + foundIndexes.length + ' matching rows.');
}

function exportFilteredCSV() {
  try {
    const table = document.getElementById('resultsTable');
    
    if (!table) {
      showToast('ไม่พบตาราง', 'error');
      return;
    }
    
    const tbody = table.querySelector('tbody');
    const thead = table.querySelector('thead');
    
    // ตรวจสอบว่ามีข้อมูลหรือไม่
    if (!tbody || tbody.rows.length === 0) {
      showToast('⚠️ ไม่มีข้อมูลให้ Export กรุณาค้นหาและแสดงข้อมูลก่อน', 'warning');
      return;
    }
    
    const csv = [];
    
    // เพิ่ม Headers
    const headerRow = [];
    const headerCells = thead.querySelectorAll('th');
    headerCells.forEach(th => {
      let text = th.textContent.trim();
      // ลบไอคอน filter ออก
      text = text.replace(/\s*[\uF0B0]\s*/g, '').trim();
      // Escape quotes
      text = text.replace(/"/g, '""');
      headerRow.push('"' + text + '"');
    });
    csv.push(headerRow.join(','));
    
    // นับแถวที่มองเห็น (ไม่ถูก filter)
    let visibleRowCount = 0;
    const rows = tbody.querySelectorAll('tr');
    
    rows.forEach(row => {
      // ตรวจสอบว่าแถวนี้ถูก filter หรือไม่
      if (row.style.display !== 'none') {
        visibleRowCount++;
        const rowData = [];
        const cells = row.querySelectorAll('td');
        
        cells.forEach(cell => {
          // ตรวจสอบว่าเป็นปุ่ม View หรือไม่
          const button = cell.querySelector('.btn-view-offset');
          let cellText;
          
          if (button) {
            // ถ้ามีปุ่ม ให้เอา Offset XY data จาก onclick
            cellText = 'View Offset';
          } else {
            cellText = cell.textContent.trim();
          }
          
          // Escape quotes
          cellText = cellText.replace(/"/g, '""');
          rowData.push('"' + cellText + '"');
        });
        
        csv.push(rowData.join(','));
      }
    });
    
    if (visibleRowCount === 0) {
      showToast('ไม่มีข้อมูลที่มองเห็นให้ Export', 'warning');
      return;
    }
    
    // สร้าง CSV content
    const csvContent = csv.join('\n');
    
    // เพิ่ม BOM สำหรับ UTF-8 (รองรับภาษาไทย)
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // สร้างชื่อไฟล์ที่มี timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = 'filtered_data_' + timestamp + '.csv';
    
    // Download
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    
    setTimeout(function() {
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showToast(`Export สำเร็จ! ${visibleRowCount} แถว`, 'success');
    }, 100);
    
  } catch (error) {
    console.error('Export Error:', error);
    showToast('❌ เกิดข้อผิดพลาดในการ Export: ' + error.message, 'error');
  }
}
function copySelectedOptions(selectId) {
    const select = document.getElementById(selectId);
    let selectedOptions;
    
    if (select.selectedOptions.length === 0) {
        // Copy all options if none selected
        selectedOptions = Array.from(select.options).map(option => option.text).join('\n');
    } else {
        // Copy selected options
        selectedOptions = Array.from(select.selectedOptions).map(option => option.text).join('\n');
    }
    
    if (selectedOptions) {
        const textarea = document.createElement('textarea');
        textarea.value = selectedOptions;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('Copied to clipboard: \n' + selectedOptions);
    }
}

// Clear functions
function clearFileInput() {
    document.getElementById('csvFile').value = '';
    csvData = [];
    csvHeaders = [];
    window.csvData = null;
    window.csvHeaders = null;
    showSuccessMessage('ล้างไฟล์แล้ว');
}

function clearSearchInput() {
    document.getElementById('searchInput').value = '';
}

function clearResultsList() {
    document.getElementById('resultsList').innerHTML = '';
}

function clearResultsList2() {
    document.getElementById('resultsList2').innerHTML = '';
}

function clearResultsTable() {
    const tbody = document.getElementById('resultsTable').getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';
}

function clearAll() {
    clearSearchInput();
    clearResultsList();
    clearResultsList2();
    clearResultsTable();
    showSuccessMessage('ล้างข้อมูลทั้งหมดแล้ว');
}

// Show success message
function showSuccessMessage(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
        z-index: 9999;
        font-weight: 500;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    toast.innerHTML = `<i class="fas fa-check-circle me-2"></i>${message}`;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Menu toggle function
function toggleMenu() {
    const menu = document.getElementById('menuPopup');
    const overlay = document.getElementById('menuOverlay');
    
    menu.classList.toggle('active');
    overlay.classList.toggle('active');
}   


// ฟังก์ชันช่วยเหลือ: Escape CSV values
function escapeCSVValue(value) {
  // ตรวจสอบว่าค่ามี comma, quotes, หรือ newlines
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    // Escape double quotes และครอบด้วย double quotes
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}

// ฟังก์ชันช่วยเหลือ: Download CSV file
function downloadCSV(content, filename) {
  // เพิ่ม BOM สำหรับ UTF-8 encoding (รองรับภาษาไทย)
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
  
  // สร้าง download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // ปล่อย URL object
  URL.revokeObjectURL(url);
}
