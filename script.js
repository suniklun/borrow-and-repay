const API_URL = 'data.json';  // 假設存放 JSON 檔案的路徑
let records = [];  // 存放借還款記錄

// 讀取 JSON 檔案
async function loadRecords() {
    try {
        const response = await fetch(API_URL);
        records = await response.json();
        updateIndexPage();
        updateRecordPage();
        updateAdminPage();
    } catch (error) {
        console.error('載入記錄失敗', error);
    }
}

// 更新首頁
function updateIndexPage() {
    if (!document.getElementById('currentBalance')) return;

    let balance = 0;
    records.forEach(record => {
        if (record.type === '借款') balance += record.amount;
        if (record.type === '還款') balance -= record.amount;
    });

    let balanceText = '';
    if (balance > 0) {
        balanceText = `尚差金額：${balance} 元`;
    } else if (balance < 0) {
        balanceText = `尚無欠款，倒還 ${Math.abs(balance)} 元`;
    } else {
        balanceText = '尚無欠款';
    }

    document.getElementById('currentBalance').textContent = balanceText;
    document.getElementById('lastUpdated').textContent = `截至 ${new Date().toLocaleDateString('zh-TW')} 為止`;
}

// 更新明細頁面
function updateRecordPage() {
    if (!document.getElementById('recordGrid')) return;

    const grid = document.getElementById('recordGrid');
    grid.innerHTML = '';

    // 按照日期從舊到新排序
    const sortedRecords = [...records].sort((a, b) => new Date(a.date) - new Date(b.date));

    sortedRecords.forEach(record => {
        const card = document.createElement('div');
        card.className = 'detail-card';
        card.innerHTML = `
            <div class="date">日期：${record.date}</div>
            <div class="type">類型：${record.type}</div>
            <div class="amount">金額：${record.amount}</div>
        `;
        grid.appendChild(card);
    });
}

// 更新後台管理頁面
function updateAdminPage() {
    if (!document.getElementById('adminRecordTable')) return;

    const tableBody = document.getElementById('adminRecordTable');
    tableBody.innerHTML = '';

    records.forEach((record, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.date}</td>
            <td>${record.type}</td>
            <td>${record.amount}</td>
            <td>
                <button onclick="editRecord(${index})">編輯</button>
                <button onclick="deleteRecord(${index})">刪除</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// 新增記錄
function addRecord() {
    const date = document.getElementById('dateInput').value;
    const type = document.getElementById('typeInput').value;
    const amount = parseFloat(document.getElementById('amountInput').value);

    if (!date || isNaN(amount)) {
        alert('請填寫完整資料');
        return;
    }

    records.push({ date, type, amount });
    saveRecords();
}

// 編輯記錄
function editRecord(index) {
    const record = records[index];
    document.getElementById('dateInput').value = record.date;
    document.getElementById('typeInput').value = record.type;
    document.getElementById('amountInput').value = record.amount;
    // 更新按鈕功能
    document.getElementById('addButton').onclick = function() {
        confirmEdit(index);
    };
}

function confirmEdit(index) {
    if (confirm('確定要更新這筆記錄嗎？')) {
        const date = document.getElementById('dateInput').value;
        const type = document.getElementById('typeInput').value;
        const amount = parseFloat(document.getElementById('amountInput').value);

        if (!date || isNaN(amount)) {
            alert('請填寫完整資料');
            return;
        }

        records[index] = { date, type, amount };
        saveRecords();
        document.getElementById('addButton').onclick = addRecord; // 恢復新增功能
    }
}

// 刪除記錄
function deleteRecord(index) {
    if (confirm('確定要刪除這筆記錄嗎？')) {
        records.splice(index, 1);
        saveRecords();
    }
}

// 儲存 JSON 檔案
function saveRecords() {
    localStorage.setItem('records', JSON.stringify(records));
    updateIndexPage();
    updateRecordPage();
    updateAdminPage();
}

// 初始化
window.onload = () => {
    const storedData = localStorage.getItem('records');
    records = storedData ? JSON.parse(storedData) : [];
    updateIndexPage();
    updateRecordPage();
    updateAdminPage();
};

// 登入功能
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // 這裡設置預設的管理員帳號密碼
    if (username === '卓珮雯' && password === '19741003') {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('adminSection').style.display = 'block';
    } else {
        alert('帳號或密碼錯誤');
    }
}

// 登出功能
function logout() {
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('adminSection').style.display = 'none';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}
