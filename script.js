/**
 * PC.js OS Core Logic
 * All comments are in English as requested.
 */

// --- System State Configuration ---
let osState = {
    lang: 'en', // default language
    theme: 'light',
    wallpaper: '',
    notesContent: 'Welcome to PC.js Notes!', // Rich text content
    icons: [
        { id: 'browser', name: 'Browser', icon: '🌐', x: 20, y: 20 },
        { id: 'games', name: 'Game Hub', icon: '🎮', x: 20, y: 120 },
        { id: 'notes', name: 'Notes Pro', icon: '📝', x: 20, y: 220 },
        { id: 'installer', name: 'Installer', icon: '📦', x: 20, y: 320 }
    ]
};

const i18n = {
    en: { settings: "Settings", search: "Search/URL", install: "Install", featured: "Featured", save: "Save" },
    ru: { settings: "Настройки", search: "Поиск/URL", install: "Установить", featured: "Рекомендовано", save: "Сохранить" }
};

let zIndex = 100;

window.onload = () => {
    renderIcons();
    applyTheme();
    updateClock();
    setInterval(updateClock, 1000);
};

// --- Desktop Logic ---
function renderIcons() {
    const desktop = document.getElementById('desktop');
    desktop.innerHTML = '';
    osState.icons.forEach(iconData => {
        const iconEl = document.createElement('div');
        iconEl.className = 'desktop-icon';
        iconEl.style.left = iconData.x + 'px';
        iconEl.style.top = iconData.y + 'px';
        iconEl.innerHTML = `<div style="font-size:32px">${iconData.icon}</div><div>${iconData.name}</div>`;
        
        iconEl.ondblclick = () => openApp(iconData.id);
        makeDraggableIcon(iconEl, iconData);
        desktop.appendChild(iconEl);
    });
}

// --- App Manager ---
function openApp(id) {
    if (document.getElementById(`win-${id}`)) {
        bringToFront(document.getElementById(`win-${id}`));
        return;
    }

    const win = document.createElement('div');
    win.id = `win-${id}`;
    win.className = 'window';
    win.style.width = '700px'; win.style.height = '450px';
    win.style.top = '100px'; win.style.left = '150px';
    win.style.zIndex = ++zIndex;

    let content = '';

    switch(id) {
        case 'browser':
            content = `
                <div style="display:flex; padding:8px; gap:5px; background:var(--panel-bg);">
                    <input type="text" id="br-input" style="flex:1" placeholder="${i18n[osState.lang].search}" onkeydown="if(event.key==='Enter') navigateBrowser()">
                    <button onclick="navigateBrowser()">Go</button>
                </div>
                <iframe id="br-frame" src="https://www.bing.com"></iframe>`;
            break;

        case 'notes':
            content = `
                <div class="editor-toolbar">
                    <button onclick="execCmd('bold')"><b>B</b></button>
                    <button onclick="execCmd('italic')"><i>I</i></button>
                    <button onclick="execCmd('underline')"><u>U</u></button>
                    <div style="flex:1"></div>
                    <button onclick="saveNoteFile('txt')">Save TXT</button>
                    <input type="file" id="note-load" hidden onchange="loadNoteFile(event)">
                    <button onclick="document.getElementById('note-load').click()">Load File</button>
                </div>
                <div id="editor" class="editor-content" contenteditable="true" oninput="osState.notesContent = this.innerHTML">
                    ${osState.notesContent}
                </div>`;
            break;

        case 'installer':
            content = `
                <div style="padding:20px;">
                    <button onclick="showInstallerTab('url')">Custom URL</button>
                    <button onclick="showInstallerTab('featured')">Featured</button>
                    <hr>
                    <div id="installer-body">
                        <input type="text" id="script-url-input" style="width:70%" placeholder="https://site.com/app.js">
                        <button onclick="installAppAction()">Install Script</button>
                    </div>
                </div>`;
            break;

        case 'games':
            content = `<iframe src="https://www.crazygames.com" allowfullscreen></iframe>`;
            break;

        case 'settings':
            content = `
                <div style="padding:20px;">
                    <h3>${i18n[osState.lang].settings}</h3>
                    <button onclick="toggleTheme()">Toggle Theme</button>
                    <button onclick="changeLang()">Change Language (${osState.lang})</button>
                </div>`;
            break;
    }

    win.innerHTML = `
        <div class="title-bar" onmousedown="dragWindow(this.parentElement)">
            <span>${id.toUpperCase()}</span>
            <div class="win-btns">
                <button style="background:#ffbd2e" onclick="toggleMaximize('${id}')"></button>
                <button style="background:#ff5f56" onclick="closeApp('${id}')"></button>
            </div>
        </div>
        <div class="window-content" style="flex:1; display:flex; flex-direction:column;">${content}</div>
    `;
    document.body.appendChild(win);
}

// --- Installer Fix ---
function installAppAction() {
    const url = document.getElementById('script-url-input').value;
    if (!url) return;

    // Fixed script loading logic
    const script = document.createElement('script');
    script.src = url;
    script.onload = () => alert("Application Script Loaded Successfully!");
    script.onerror = () => alert("Error: Could not load the script.");
    document.head.appendChild(script);
}

function showInstallerTab(tab) {
    const body = document.getElementById('installer-body');
    if (tab === 'featured') {
        body.innerHTML = `
            <div style="cursor:pointer; padding:5px; background:#ddd; margin-bottom:5px;" onclick="document.getElementById('script-url-input').value='trusted-packages/testpkg.js'">
                ⭐ Test Package (BROKEN)
            </div>
            <p>More scripts coming soon...</p>
        `;
    } else {
        body.innerHTML = `
            <input type="text" id="script-url-input" style="width:70%" placeholder="https://...">
            <button onclick="installAppAction()">Install</button>
        `;
    }
}

// --- Notes Logic (TXT / DOCX) ---
function execCmd(cmd) { document.execCommand(cmd, false, null); }

function saveNoteFile(ext) {
    const text = document.getElementById('editor').innerText;
    const blob = new Blob([text], {type: 'text/plain'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `document.${ext}`;
    link.click();
}

function loadNoteFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.name.endsWith('.docx')) {
        // Use Mammoth library for DOCX
        const reader = new FileReader();
        reader.onload = (e) => {
            mammoth.convertToHtml({arrayBuffer: e.target.result})
                .then(result => {
                    document.getElementById('editor').innerHTML = result.value;
                });
        };
        reader.readAsArrayBuffer(file);
    } else {
        // Normal text loading
        const reader = new FileReader();
        reader.onload = (e) => document.getElementById('editor').innerText = e.target.result;
        reader.readAsText(file);
    }
}

// --- Browser Logic ---
function navigateBrowser() {
    const query = document.getElementById('br-input').value;
    const frame = document.getElementById('br-frame');
    if (query.includes('.') && !query.includes(' ')) {
        frame.src = query.startsWith('http') ? query : 'https://' + query;
    } else {
        frame.src = `https://www.google.com/search?q=${encodeURIComponent(query)}&igu=1`;
    }
}

// --- System Utilities ---
function toggleMaximize(id) { document.getElementById(`win-${id}`).classList.toggle('maximized'); }
function closeApp(id) { document.getElementById(`win-${id}`).remove(); }
function bringToFront(el) { el.style.zIndex = ++zIndex; }

function toggleTheme() {
    osState.theme = osState.theme === 'light' ? 'dark' : 'light';
    applyTheme();
}

function applyTheme() {
    document.body.className = 'theme-' + osState.theme;
}

function changeLang() {
    osState.lang = osState.lang === 'en' ? 'ru' : 'en';
    alert("Language: " + osState.lang);
}

// --- State Persistence (.PCJS) ---
function saveSystemState() {
    const data = JSON.stringify(osState);
    const blob = new Blob([data], {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'backup.pcjs';
    a.click();
}

function loadSystemState(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        osState = JSON.parse(e.target.result);
        renderIcons();
        applyTheme();
        alert("System Restored!");
    };
    reader.readAsText(file);
}

// --- Drag & Drop Core ---
function dragWindow(el) {
    let px = 0, py = 0;
    px = window.event.clientX; py = window.event.clientY;
    document.onmousemove = (e) => {
        let dx = px - e.clientX; let dy = py - e.clientY;
        px = e.clientX; py = e.clientY;
        el.style.top = (el.offsetTop - dy) + "px";
        el.style.left = (el.offsetLeft - dx) + "px";
    };
    document.onmouseup = () => { document.onmousemove = null; };
}

function makeDraggableIcon(el, data) {
    let px = 0, py = 0;
    el.onmousedown = (e) => {
        px = e.clientX; py = e.clientY;
        document.onmousemove = (e) => {
            let dx = px - e.clientX; let dy = py - e.clientY;
            px = e.clientX; py = e.clientY;
            el.style.left = (el.offsetLeft - dx) + "px";
            el.style.top = (el.offsetTop - dy) + "px";
            data.x = el.offsetLeft; data.y = el.offsetTop;
        };
        document.onmouseup = () => document.onmousemove = null;
    };
}

function updateClock() {
    document.getElementById('top-clock').innerText = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

function toggleStartMenu() {
    document.getElementById('start-menu').classList.toggle('hidden');
}