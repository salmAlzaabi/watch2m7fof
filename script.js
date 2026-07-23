// ======== البيانات ========
let state = {
    officers: [
        { id: 1, name: 'خالد الفهد', rank: 'نقيب', dept: 'المباحث', status: 'on-duty' },
        { id: 2, name: 'سعود المطيري', rank: 'ملازم', dept: 'المرور', status: 'on-duty' },
        { id: 3, name: 'نواف السالم', rank: 'رائد', dept: 'الأمن العام', status: 'off-duty' },
    ],
    reports: [
        { id: 1, type: 'سرقة', location: 'شارع الملك فهد', status: 'active', time: '10:30' },
        { id: 2, type: 'حريق', location: 'مبنى الأمانة', status: 'closed', time: '09:15' },
        { id: 3, type: 'شغب', location: 'ميدان التحرير', status: 'active', time: '11:45' },
    ],
    warrants: [
        { id: 1, name: 'أحمد محمد', charge: 'سطو مسلح', status: 'wanted' },
        { id: 2, name: 'سامي حسن', charge: 'تهريب مخدرات', status: 'wanted' },
    ],
    officerId: 4,
    reportId: 4,
    warrantId: 3,
    dispatchLogs: [],
    activeWindows: {},
    windowZIndex: 10,
};

// ======== تهيئة النوافذ ========
function initWindows() {
    const windows = document.querySelectorAll('.window');
    const positions = [
        { top: 40, left: 120, width: 550, height: 400 },
        { top: 60, left: 480, width: 500, height: 350 },
        { top: 100, left: 300, width: 450, height: 300 },
        { top: 50, left: 650, width: 480, height: 380 },
        { top: 80, left: 400, width: 420, height: 280 },
        { top: 150, left: 200, width: 500, height: 350 },
    ];
    windows.forEach((win, i) => {
        if (i < positions.length) {
            win.style.top = positions[i].top + 'px';
            win.style.left = positions[i].left + 'px';
            win.style.width = positions[i].width + 'px';
            win.style.height = positions[i].height + 'px';
        }
    });
}

// ======== فتح/إغلاق النوافذ ========
function openApp(appId) {
    const win = document.getElementById('win-' + appId);
    if (!win) return;
    win.style.display = 'flex';
    win.classList.add('active');
    state.windowZIndex++;
    win.style.zIndex = state.windowZIndex;
    state.activeWindows[appId] = true;
    updateTaskbar();
}

function closeApp(appId) {
    const win = document.getElementById('win-' + appId);
    if (win) {
        win.style.display = 'none';
        win.classList.remove('active');
    }
    delete state.activeWindows[appId];
    updateTaskbar();
}

function toggleApp(appId) {
    if (state.activeWindows[appId]) {
        closeApp(appId);
    } else {
        openApp(appId);
    }
}

// ======== شريط المهام ========
function updateTaskbar() {
    const container = document.getElementById('taskbarApps');
    const appNames = {
        reports: 'البلاغات',
        warrants: 'أوامر القبض',
        search: 'البحث',
        officers: 'الضباط',
        stats: 'الإحصائيات',
        dispatch: 'الإرسال'
    };
    const icons = {
        reports: 'fa-clipboard-list',
        warrants: 'fa-gavel',
        search: 'fa-search',
        officers: 'fa-users',
        stats: 'fa-chart-pie',
        dispatch: 'fa-broadcast-tower'
    };
    container.innerHTML = '';
    Object.keys(state.activeWindows).forEach(appId => {
        const btn = document.createElement('div');
        btn.className = 'taskbar-app active';
        btn.innerHTML = `<i class="fas ${icons[appId]}"></i> ${appNames[appId] || appId}`;
        btn.onclick = () => {
            const win = document.getElementById('win-' + appId);
            if (win) {
                state.windowZIndex++;
                win.style.zIndex = state.windowZIndex;
                win.classList.add('active');
            }
        };
        container.appendChild(btn);
    });
}

// ======== ساعة شريط المهام ========
function updateClock() {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    document.querySelector('.taskbar-clock span').textContent = h + ':' + m;
}
setInterval(updateClock, 10000);
updateClock();

// ======== التحكم في النوافذ (سحب - تصغير - تكبير - إغلاق) ========
document.querySelectorAll('.window').forEach(win => {
    const header = win.querySelector('.window-header');
    const closeBtn = win.querySelector('.close');
    const minBtn = win.querySelector('.minimize');
    const maxBtn = win.querySelector('.maximize');
    const appId = win.dataset.app;

    // إغلاق
    closeBtn.onclick = () => closeApp(appId);

    // تصغير
    minBtn.onclick = () => {
        win.style.display = 'none';
        win.classList.remove('active');
        delete state.activeWindows[appId];
        updateTaskbar();
    };

    // تكبير
    maxBtn.onclick = () => {
        win.classList.toggle('maximized');
    };

    // سحب النافذة
    let isDragging = false;
    let offsetX, offsetY;
    header.addEventListener('mousedown', (e) => {
        if (win.classList.contains('maximized')) return;
        isDragging = true;
        const rect = win.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        state.windowZIndex++;
        win.style.zIndex = state.windowZIndex;
        win.classList.add('active');
    });
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const newX = e.clientX - offsetX;
        const newY = e.clientY - offsetY;
        win.style.left = Math.max(0, newX) + 'px';
        win.style.top = Math.max(0, newY) + 'px';
    });
    document.addEventListener('mouseup', () => { isDragging = false; });
});

// ======== أيقونات سطح المكتب ========
document.querySelectorAll('.desktop-icon').forEach(icon => {
    icon.addEventListener('dblclick', () => {
        const app = icon.dataset.app;
        openApp(app);
    });
});

// ======== زر البدء ========
document.querySelector('.start-btn').addEventListener('click', () => {
    // فتح جميع التطبيقات (تجربة)
    ['reports', 'warrants', 'search', 'officers', 'stats', 'dispatch'].forEach(app => {
        openApp(app);
    });
});

// ======== تحديث الإحصائيات ========
function updateStats() {
    document.getElementById('statOfficers').textContent = state.officers.length;
    document.getElementById('statReports').textContent = state.reports.filter(r => r.status === 'active').length;
    document.getElementById('statWarrants').textContent = state.warrants.length;
    document.getElementById('statClosed').textContent = state.reports.filter(r => r.status === 'closed').length;
}

// ======== عرض الجداول ========
function renderReports() {
    const tbody = document.getElementById('reportsTableBody');
    const filter = document.getElementById('reportFilter')?.value.toLowerCase() || '';
    const filtered = state.reports.filter(r =>
        r.type.includes(filter) || r.location.includes(filter)
    );
    tbody.innerHTML = filtered.map(r => `
        <tr>
            <td>${r.id}</td>
            <td>${r.type}</td>
            <td>${r.location}</td>
            <td><span class="status ${r.status}">${r.status === 'active' ? 'نشط' : 'مغلق'}</span></td>
            <td>${r.time}</td>
            <td>
                <button class="btn danger small" onclick="deleteReport(${r.id})"><i class="fas fa-trash"></i></button>
                ${r.status === 'active' ? `<button class="btn success small" onclick="closeReport(${r.id})"><i class="fas fa-check"></i></button>` : ''}
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
                <button class="btn danger small" onclick="deleteWarrant(${w.id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function renderOfficers() {
    const tbody = document.getElementById('officersTableBody');
    tbody.innerHTML = state.officers.map(o => `
        <tr>
            <td>${o.id}</td>
            <td>${o.name}</td>
            <td>${o.rank}</td>
            <td>${o.dept}</td>
            <td><span class="status ${o.status}">${o.status === 'on-duty' ? '🟢 متواجد' : '🔴 غير متواجد'}</span></td>
            <td>
                <button class="btn warning small" onclick="toggleOfficerStatus(${o.id})">
                    <i class="fas fa-sync"></i>
                </button>
                <button class="btn danger small" onclick="deleteOfficer(${o.id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

// ======== إدارة البلاغات ========
function addReport(type, location, details) {
    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    state.reports.push({
        id: state.reportId++,
        type,
        location,
        details: details || '',
        status: 'active',
        time,
    });
    updateUI();
    addDispatchLog(`🚨 بلاغ جديد: ${type} في ${location}`, 'alert');
    sendToDiscord(`🚨 بلاغ جديد: ${type} في ${location}`);
}

function deleteReport(id) {
    if (confirm('حذف البلاغ؟')) {
        state.reports = state.reports.filter(r => r.id !== id);
        updateUI();
    }
}

function closeReport(id) {
    const report = state.reports.find(r => r.id === id);
    if (report) {
        report.status = 'closed';
        updateUI();
        addDispatchLog(`✅ تم إغلاق بلاغ #${id} (${report.type})`, 'system');
    }
}

// ======== إدارة أوامر القبض ========
function addWarrant(name, charge) {
    state.warrants.push({
        id: state.warrantId++,
        name,
        charge,
        status: 'wanted',
    });
    updateUI();
    addDispatchLog(`⛓️ أمر قبض صادر بحق: ${name} - ${charge}`, 'emergency');
    sendToDiscord(`⛓️ أمر قبض صادر بحق: ${name} - ${charge}`);
}

function deleteWarrant(id) {
    if (confirm('إلغاء أمر القبض؟')) {
        state.warrants = state.warrants.filter(w => w.id !== id);
        updateUI();
    }
}

// ======== إدارة الضباط ========
function addOfficer(name, rank, dept) {
    state.officers.push({
        id: state.officerId++,
        name,
        rank,
        dept,
        status: 'on-duty',
    });
    updateUI();
    addDispatchLog(`👮 ضابط جديد: ${name} (${rank})`, 'system');
}

function deleteOfficer(id) {
    if (confirm('حذف الضابط؟')) {
        state.officers = state.officers.filter(o => o.id !== id);
        updateUI();
    }
}

function toggleOfficerStatus(id) {
    const officer = state.officers.find(o => o.id === id);
    if (officer) {
        officer.status = officer.status === 'on-duty' ? 'off-duty' : 'on-duty';
        updateUI();
        addDispatchLog(`👮 ${officer.name} ${officer.status === 'on-duty' ? 'متواجد' : 'غير متواجد'}`, 'system');
    }
}

// ======== البحث ========
function search(query) {
    const resultDiv = document.getElementById('searchResult');
    if (!query.trim()) {
        resultDiv.innerHTML = '<span class="empty">✏️ اكتب كلمة للبحث...</span>';
        return;
    }
    const q = query.trim().toLowerCase();
    let found = [];

    state.reports.forEach(r => {
        if (r.type.includes(q) || r.location.includes(q)) {
            found.push(`📋 بلاغ: ${r.type} - ${r.location} (${r.status === 'active' ? 'نشط' : 'مغلق'})`);
        }
    });
    state.warrants.forEach(w => {
        if (w.name.includes(q) || w.charge.includes(q)) {
            found.push(`⛓️ أمر قبض: ${w.name} - ${w.charge}`);
        }
    });
    state.officers.forEach(o => {
        if (o.name.includes(q) || o.dept.includes(q)) {
            found.push(`👮 ضابط: ${o.name} - ${o.rank} (${o.dept})`);
        }
    });

    if (found.length === 0) {
        resultDiv.innerHTML = '<span class="empty">❌ لا توجد نتائج مطابقة.</span>';
    } else {
        resultDiv.innerHTML = found.map(item => `<span class="found">• ${item}</span>`).join('<br>');
    }
}

// ======== سجل الإرسال ========
function addDispatchLog(message, type = 'system') {
    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    state.dispatchLogs.push({ message, type, time });
    renderDispatchLog();
}

function renderDispatchLog() {
    const log = document.getElementById('dispatchLog');
    log.innerHTML = state.dispatchLogs.slice(-50).map(entry => `
        <div class="log-entry ${entry.type}">
            <span class="time">[${entry.time}]</span> ${entry.message}
        </div>
    `).join('');
    log.scrollTop = log.scrollHeight;
}

// ======== Discord Webhook ========
function sendToDiscord(message) {
    const webhookURL = 'https://discord.com/api/webhooks/XXXXXXXXXXX/YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY';
    fetch(webhookURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content: message,
            username: 'MDT System',
            avatar_url: 'https://i.imgur.com/4M6fi5K.png',
        }),
    }).catch(() => {});
}

// ======== تحديث الواجهة ========
function updateUI() {
    updateStats();
    renderReports();
    renderWarrants();
    renderOfficers();
}

// ======== أحداث المودالات ========
function setupModals() {
    // بلاغ
    document.getElementById('addReportBtn').onclick = () => {
        document.getElementById('reportModal').classList.add('active');
    };
    document.getElementById('closeReportModal').onclick = () => {
        document.getElementById('reportModal').classList.remove('active');
    };
    document.getElementById('reportForm').onsubmit = (e) => {
        e.preventDefault();
        const type = document.getElementById('reportType').value;
        const location = document.getElementById('reportLocation').value.trim();
        const details = document.getElementById('reportDetails').value.trim();
        if (location) {
            addReport(type, location, details);
            document.getElementById('reportModal').classList.remove('active');
            document.getElementById('reportForm').reset();
        }
    };

    // أمر قبض
    document.getElementById('addWarrantBtn').onclick = () => {
        document.getElementById('warrantModal').classList.add('active');
    };
    document.getElementById('closeWarrantModal').onclick = () => {
        document.getElementById('warrantModal').classList.remove('active');
    };
    document.getElementById('warrantForm').onsubmit = (e) => {
        e.preventDefault();
        const name = document.getElementById('warrantName').value.trim();
        const charge = document.getElementById('warrantCharge').value.trim();
        if (name && charge) {
            addWarrant(name, charge);
            document.getElementById('warrantModal').classList.remove('active');
            document.getElementById('warrantForm').reset();
        }
    };

    // ضابط
    document.getElementById('addOfficerBtn').onclick = () => {
        document.getElementById('officerModal').classList.add('active');
    };
    document.getElementById('closeOfficerModal').onclick = () => {
        document.getElementById('officerModal').classList.remove('active');
    };
    document.getElementById('officerForm').onsubmit = (e) => {
        e.preventDefault();
        const name = document.getElementById('officerName').value.trim();
        const rank = document.getElementById('officerRank').value;
        const dept = document.getElementById('officerDept').value.trim();
        if (name && dept) {
            addOfficer(name, rank, dept);
            document.getElementById('officerModal').classList.remove('active');
            document.getElementById('officerForm').reset();
        }
    };

    // إغلاق المودال بالنقر خارج المحتوى
    document.querySelectorAll('.modal').forEach(modal => {
        modal.onclick = (e) => {
            if (e.target === modal) modal.classList.remove('active');
        };
    });
}

// ======== أحداث البحث والإرسال ========
function setupEvents() {
    document.getElementById('searchExecBtn').onclick = () => {
        search(document.getElementById('searchInput').value);
    };
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') search(e.target.value);
    });

    document.getElementById('reportFilter').addEventListener('input', renderReports);

    document.getElementById('dispatchSendBtn').onclick = () => {
        const input = document.getElementById('dispatchInput');
        const msg = input.value.trim();
        if (msg) {
            addDispatchLog(`📢 ${msg}`, 'alert');
            sendToDiscord(`📢 ${msg}`);
            input.value = '';
        }
    };
    document.getElementById('dispatchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') document.getElementById('dispatchSendBtn').click();
    });
}

// ======== تهيئة ========
initWindows();
setupModals();
setupEvents();
updateUI();

// فتح بعض النوافذ افتراضياً
setTimeout(() => {
    openApp('reports');
    openApp('stats');
    openApp('dispatch');
}, 300);

// ======== محاكاة بلاغات عشوائية ========
setInterval(() => {
    const types = ['سرقة', 'شغب', 'حريق', 'حوادث سير', 'تجمهر', 'اعتداء'];
    const locations = ['شارع السلام', 'ميدان التحرير', 'المنطقة الصناعية', 'الجامعة', 'المطار', 'السوق المركزي'];
    const randType = types[Math.floor(Math.random() * types.length)];
    const randLoc = locations[Math.floor(Math.random() * locations.length)];
    addReport(randType, randLoc, 'بلاغ تلقائي');
}, 45000);

// ======== حفظ/تحميل الحالة (اختياري) ========
// يمكنك إضافة localStorage هنا لحفظ البيانات
