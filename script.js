// ======== قاعدة بيانات وهمية (تخزن في الذاكرة) ========
let state = {
    officers: 12,
    reports: [
        { id: 1, type: 'سرقة', location: 'شارع الملك فهد', status: 'active', time: '10:30' },
        { id: 2, type: 'حريق', location: 'مبنى الأمانة', status: 'closed', time: '09:15' },
    ],
    warrants: [
        { id: 1, name: 'أحمد محمد', charge: 'سطو مسلح', status: 'wanted' },
        { id: 2, name: 'سامي حسن', charge: 'تهريب مخدرات', status: 'wanted' },
    ],
    reportIdCounter: 3,
    warrantIdCounter: 3,
};

// ======== تحديث الإحصائيات ========
function updateStats() {
    document.getElementById('officerCount').textContent = state.officers;
    document.getElementById('reportCount').textContent = state.reports.filter(r => r.status === 'active').length;
    document.getElementById('warrantCount').textContent = state.warrants.filter(w => w.status === 'wanted').length;
}

// ======== عرض الجداول ========
function renderReports() {
    const tbody = document.getElementById('reportsTableBody');
    tbody.innerHTML = state.reports.map(r => `
        <tr>
            <td>${r.id}</td>
            <td>${r.type}</td>
            <td>${r.location}</td>
            <td><span class="status ${r.status}">${r.status === 'active' ? 'نشط' : 'مغلق'}</span></td>
            <td>${r.time}</td>
            <td>
                <button class="btn danger" style="padding:6px 14px;font-size:13px;" onclick="deleteReport(${r.id})">
                    <i class="fas fa-trash"></i>
                </button>
                ${r.status === 'active' ? `<button class="btn info" style="padding:6px 14px;font-size:13px;" onclick="closeReport(${r.id})">
                    <i class="fas fa-check"></i>
                </button>` : ''}
            </td>
        </tr>
    `).join('');
}

function renderWarrants() {
    const tbody = document.getElementById('warrantsTableBody');
    tbody.innerHTML = state.warrants.map(w => `
        <tr>
            <td>${w.id}</td>
            <td>${w.name}</td>
            <td>${w.charge}</td>
            <td><span class="status wanted">مطلوب</span></td>
            <td>
                <button class="btn danger" style="padding:6px 14px;font-size:13px;" onclick="deleteWarrant(${w.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// ======== إدارة البلاغات ========
function addReport(type, location, details) {
    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    state.reports.push({
        id: state.reportIdCounter++,
        type,
        location,
        details: details || '',
        status: 'active',
        time,
    });
    updateUI();
    // 🔔 هنا تقدر ترسل إشعار لديسكورد عبر Webhook
    sendToDiscord(`🚨 بلاغ جديد: ${type} في ${location}`);
}

function deleteReport(id) {
    if (confirm('هل أنت متأكد من حذف هذا البلاغ؟')) {
        state.reports = state.reports.filter(r => r.id !== id);
        updateUI();
    }
}

function closeReport(id) {
    const report = state.reports.find(r => r.id === id);
    if (report) {
        report.status = 'closed';
        updateUI();
    }
}

// ======== إدارة أوامر القبض ========
function addWarrant(name, charge) {
    state.warrants.push({
        id: state.warrantIdCounter++,
        name,
        charge,
        status: 'wanted',
    });
    updateUI();
    sendToDiscord(`⛓️ أمر قبض صادر بحق: ${name} - ${charge}`);
}

function deleteWarrant(id) {
    if (confirm('هل أنت متأكد من إلغاء أمر القبض؟')) {
        state.warrants = state.warrants.filter(w => w.id !== id);
        updateUI();
    }
}

// ======== البحث ========
function search(query) {
    const resultDiv = document.getElementById('searchResult');
    if (!query.trim()) {
        resultDiv.innerHTML = '✏️ اكتب كلمة للبحث...';
        return;
    }
    const q = query.trim().toLowerCase();
    let found = [];

    // بحث في البلاغات
    state.reports.forEach(r => {
        if (r.type.includes(q) || r.location.includes(q)) {
            found.push(`📋 بلاغ: ${r.type} - ${r.location}`);
        }
    });

    // بحث في أوامر القبض
    state.warrants.forEach(w => {
        if (w.name.includes(q) || w.charge.includes(q)) {
            found.push(`⛓️ أمر قبض: ${w.name} - ${w.charge}`);
        }
    });

    if (found.length === 0) {
        resultDiv.innerHTML = '❌ لا توجد نتائج مطابقة.';
    } else {
        resultDiv.innerHTML = found.map(item => `• ${item}`).join('<br>');
    }
}

// ======== دمج مع Discord (Webhook) ========
function sendToDiscord(message) {
    // ⚠️ استبدل الرابط برابط Webhook الخاص بك
    const webhookURL = 'https://discord.com/api/webhooks/XXXXXXXXXXX/YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY';

    fetch(webhookURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content: message,
            username: 'MDT System',
            avatar_url: 'https://i.imgur.com/4M6fi5K.png',
        }),
    }).catch(err => console.error('فشل الإرسال إلى Discord:', err));
}

// ======== تحديث الواجهة بالكامل ========
function updateUI() {
    updateStats();
    renderReports();
    renderWarrants();
}

// ======== أحداث الأزرار والمودالات ========
// فتح مودال البلاغ
document.getElementById('addReportBtn').onclick = () => {
    document.getElementById('reportModal').style.display = 'flex';
};
document.getElementById('closeReportModal').onclick = () => {
    document.getElementById('reportModal').style.display = 'none';
};

// فتح مودال أمر القبض
document.getElementById('addWarrantBtn').onclick = () => {
    document.getElementById('warrantModal').style.display = 'flex';
};
document.getElementById('closeWarrantModal').onclick = () => {
    document.getElementById('warrantModal').style.display = 'none';
};

// إغلاق المودال بالنقر خارج المحتوى
window.onclick = (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
};

// إرسال البلاغ
document.getElementById('reportForm').onsubmit = (e) => {
    e.preventDefault();
    const type = document.getElementById('reportType').value;
    const location = document.getElementById('reportLocation').value.trim();
    const details = document.getElementById('reportDetails').value.trim();
    if (location) {
        addReport(type, location, details);
        document.getElementById('reportModal').style.display = 'none';
        document.getElementById('reportForm').reset();
    }
};

// إصدار أمر قبض
document.getElementById('warrantForm').onsubmit = (e) => {
    e.preventDefault();
    const name = document.getElementById('warrantName').value.trim();
    const charge = document.getElementById('warrantCharge').value.trim();
    if (name && charge) {
        addWarrant(name, charge);
        document.getElementById('warrantModal').style.display = 'none';
        document.getElementById('warrantForm').reset();
    }
};

// البحث
document.getElementById('searchBtn').onclick = () => {
    const section = document.getElementById('searchSection');
    section.style.display = section.style.display === 'none' ? 'flex' : 'none';
    if (section.style.display === 'flex') {
        document.getElementById('searchInput').focus();
    }
};
document.getElementById('searchExecBtn').onclick = () => {
    search(document.getElementById('searchInput').value);
};
document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') search(e.target.value);
});

// ======== تحميل أولي ========
updateUI();

// ======== محاكاة إضافة بلاغ عشوائي كل دقيقة (للتجربة) ========
setInterval(() => {
    const types = ['سرقة', 'شغب', 'حريق', 'حوادث سير', 'تجمهر'];
    const locations = ['شارع السلام', 'ميدان التحرير', 'المنطقة الصناعية', 'الجامعة', 'المطار'];
    const randType = types[Math.floor(Math.random() * types.length)];
    const randLoc = locations[Math.floor(Math.random() * locations.length)];
    addReport(randType, randLoc, 'بلاغ تلقائي (تجربة)');
}, 60000); // كل 60 ثانية
