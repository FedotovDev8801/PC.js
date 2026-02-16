// Example for a test package, a Notes app.

(function() {
    // 1. Creating an icon on desktop
    const desktop = document.getElementById('desktop');
    const icon = document.createElement('div');
    icon.className = 'desktop-icon';
    icon.id = 'icon-notes';
    icon.innerHTML = '📝<br>Notes';
    
    // App starting function
    icon.onclick = function() {
        openNotesApp();
    };

    desktop.appendChild(icon);

    // 2. Appplication code
    function openNotesApp() {
        const appId = 'notes-plugin';
        
        // Check if window is already opened
            if (document.getElementById(`win-${appId}`)) {
            const win = document.getElementById(`win-${appId}`);
            win.style.zIndex = ++zIndexCounter;
            return;
        }

        const win = document.createElement('div');
        win.id = `win-${appId}`;
        win.className = 'window';
        win.style.width = '350px';
        win.style.height = '400px';
        win.style.top = '200px';
        win.style.left = '300px';
        win.style.zIndex = ++zIndexCounter;

        win.innerHTML = `
            <div class="title-bar">
                <span>📝 Notes</span>
                <div class="buttons">
                    <button class="btn btn-close" onclick="document.getElementById('win-${appId}').remove(); updateTaskbar();"></button>
                </div>
            </div>
            <div class="window-content" style="height: calc(100% - 40px);">
                <textarea id="notes-area" style="width: 100%; height: 100%; border: none; padding: 10px; box-sizing: border-box; font-family: sans-serif; resize: none; outline: none;" placeholder="Введите текст здесь..."></textarea>
            </div>
        `;

        document.getElementById('desktop').appendChild(win);
        
        // Making window draggable (using function from script.js)
        if (typeof dragElement === 'function') {
            dragElement(win);
        }

        // Updating taskbar
        if (typeof updateTaskbar === 'function') {
            updateTaskbar();
        }

        // Text autofocus
        document.getElementById('notes-area').focus();
    }

    console.log("Packager: Application 'Notes' was successfully installed!");
})();