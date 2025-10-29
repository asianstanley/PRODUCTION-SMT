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
function fetchCSV() {
  var csvUrl = 'https://raw.githubusercontent.com/asianstanley/PRODUCTION-SMT/refs/heads/main/TABLE.csv';
  fetch(csvUrl)
    .then(response => response.text())
    .then(data => processData(data))
    .catch(error => console.error('Error fetching the CSV file:', error));
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
            for (let i = 0; i < 29; i++) {
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
            cells[25].textContent = window.csvData[index]['Offset Num'] || '';
            
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
        for (var i = 0; i < 29; i++) {
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
        cells[25].textContent = window.csvData[index]['Offset Num'] || '';
        
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

// Export CSV function
function exportCSV() {
    const table = document.getElementById('resultsTable');
    
    if (!table) {
        console.error('ไม่พบตารางที่มี id="resultsTable"');
        return;
    }
    
    const csv = [];
    const rows = table.rows;
    
    for (let i = 0; i < rows.length; i++) {
        const row = [];
        const cells = rows[i].cells;
        
        for (let j = 0; j < cells.length; j++) {
            const cellText = cells[j].innerText.replace(/"/g, '""');
            row.push('"' + cellText + '"');
        }
        
        csv.push(row.join(','));
    }
    
    const csvContent = csv.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resultsearch.csv';
    
    setTimeout(function() {
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }, 100);
}

// Copy function
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
