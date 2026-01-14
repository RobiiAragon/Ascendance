// ==========================================
// MODULO DE DESARROLLO
// Registro de todo el trabajo y cambios del sistema
// ==========================================

const DEV_LOG_CATEGORIES = {
    feature: { label: 'Nueva Funcionalidad', icon: 'fa-star', color: '#10b981' },
    fix: { label: 'Bug Fix', icon: 'fa-bug', color: '#ef4444' },
    enhancement: { label: 'Mejora', icon: 'fa-arrow-up', color: '#6366f1' },
    ui: { label: 'UI/UX', icon: 'fa-paint-brush', color: '#ec4899' },
    security: { label: 'Seguridad', icon: 'fa-shield-alt', color: '#f59e0b' },
    performance: { label: 'Rendimiento', icon: 'fa-tachometer-alt', color: '#3b82f6' },
    refactor: { label: 'Refactor', icon: 'fa-code', color: '#8b5cf6' },
    migration: { label: 'Migracion', icon: 'fa-database', color: '#14b8a6' }
};

let developmentLogs = [];

// Cargar logs de desarrollo desde Firebase
async function loadDevelopmentLogs() {
    try {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();
            const snapshot = await db.collection('developmentLogs')
                .orderBy('date', 'desc')
                .get();

            developmentLogs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Si no hay logs, poblar con datos iniciales
            if (developmentLogs.length === 0) {
                await populateInitialLogs();
            }
        }
    } catch (error) {
        console.error('Error cargando logs de desarrollo:', error);
        // Usar datos locales como fallback
        if (developmentLogs.length === 0) {
            developmentLogs = getInitialLogs();
        }
    }
    return developmentLogs;
}

// Obtener logs iniciales
function getInitialLogs() {
    return [
        // Enero 2026
        {
            id: 'log_001',
            date: '2026-01-14',
            title: 'Modulo de Desarrollo Creado',
            description: 'Se creo el modulo de Development Log para trackear todo el trabajo realizado. Timeline por mes, filtros por categoria, stats, y funcion rapida para agregar entradas.',
            category: 'feature',
            files: ['js/development-log.js', 'index.html', 'js/script.js'],
            developer: 'Claude AI',
            requestedBy: 'Carlos'
        },
        {
            id: 'log_002',
            date: '2026-01-14',
            title: 'Fix de Timezone en PTO',
            description: 'Se arreglo el bug de timezone donde las fechas de solicitudes de tiempo libre aparecian como el dia anterior. Se agrego funcion parseLocalDate() para parsear fechas YYYY-MM-DD como hora local.',
            category: 'fix',
            files: ['js/pto-system.js'],
            developer: 'Claude AI',
            requestedBy: 'Tiana Estrada'
        },
        {
            id: 'log_003',
            date: '2026-01-14',
            title: 'Pod Matcher - Comparacion de 2 Dispositivos',
            description: 'Reescritura completa del Pod Matcher para soportar comparar 2 dispositivos simultaneamente. Toggle entre modo single y comparacion, resultados con colores mostrando compatibilidad con Dispositivo 1, Dispositivo 2, o Ambos.',
            category: 'feature',
            files: ['js/pod-matcher.js'],
            developer: 'Claude AI',
            requestedBy: 'Carlos'
        },
        {
            id: 'log_004',
            date: '2026-01-13',
            title: 'Super Admin God Mode',
            description: 'Se creo modulo completo de Super Admin con God Mode (impersonar usuarios), Database Explorer, Live Monitor, Emergency Controls (modo mantenimiento, broadcast, force logout), Mass Operations, y Feature Flags.',
            category: 'feature',
            files: ['js/super-admin.js', 'index.html', 'js/script.js'],
            developer: 'Claude AI',
            requestedBy: 'Carlos'
        },
        {
            id: 'log_005',
            date: '2026-01-13',
            title: 'Utilidad de Migracion de Empleados',
            description: 'Se creo utilidad de migracion para empleados con cambios de email/auth. Se migro exitosamente a Danny Barrantes de ID viejo a nuevo, transfiriendo schedules, clock-ins, y days off.',
            category: 'migration',
            files: ['js/migrate-employee.js'],
            developer: 'Claude AI',
            requestedBy: 'Carlos'
        },
        {
            id: 'log_006',
            date: '2026-01-13',
            title: 'Password Manager - Responsive Movil',
            description: 'Se agregaron estilos responsive para Password Manager en movil. Se arreglo el stacking del filter bar, reorganizacion de lista, y ajustes de grid para 768px y 480px breakpoints.',
            category: 'ui',
            files: ['css/styles.css', 'js/password-manager.js'],
            developer: 'Claude AI',
            requestedBy: 'Carlos'
        },
        {
            id: 'log_007',
            date: '2026-01-10',
            title: 'Likes y Comentarios en Anuncios',
            description: 'Se agregaron funciones sociales a anuncios: likes con tracking de usuarios, comentarios con agregar/eliminar, y sincronizacion en tiempo real con Firebase.',
            category: 'feature',
            files: ['js/pod-matcher.js'],
            developer: 'Claude AI',
            requestedBy: 'Carlos'
        },
        {
            id: 'log_008',
            date: '2026-01-08',
            title: 'Mejoras al Daily Checklist',
            description: 'Multiples mejoras al modulo de checklist diario: tareas por tienda, tracking de completados, aprobaciones de manager, y vista de historial.',
            category: 'enhancement',
            files: ['js/daily-checklist.js'],
            developer: 'Claude AI',
            requestedBy: 'Management'
        },
        {
            id: 'log_009',
            date: '2026-01-05',
            title: 'Sistema de Solicitud de PTO',
            description: 'Sistema completo de solicitud de PTO/vacaciones con autoservicio de empleados, workflow de aprobacion de managers, requisito de 30 dias de anticipacion, e integracion con calendario de dias libres.',
            category: 'feature',
            files: ['js/pto-system.js'],
            developer: 'Claude AI',
            requestedBy: 'HR'
        },
        {
            id: 'log_010',
            date: '2026-01-03',
            title: 'Integracion de Firebase Auth',
            description: 'Se integro Firebase Authentication para login seguro, registro de empleados, y control de acceso basado en roles.',
            category: 'security',
            files: ['js/firebase-utils.js', 'js/script.js'],
            developer: 'Claude AI',
            requestedBy: 'Carlos'
        },
        {
            id: 'log_011',
            date: '2026-01-02',
            title: 'Gestion de Facturas de Vendors',
            description: 'Se agrego sistema de tracking de facturas de proveedores con fechas de vencimiento, estado de pago, facturas recurrentes, y proyecciones financieras.',
            category: 'feature',
            files: ['js/vendors-module.js', 'js/pto-system.js'],
            developer: 'Claude AI',
            requestedBy: 'Contabilidad'
        }
    ];
}

// Poblar logs iniciales a Firebase
async function populateInitialLogs() {
    const initialLogs = getInitialLogs();

    try {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();
            const batch = db.batch();

            initialLogs.forEach(log => {
                const docRef = db.collection('developmentLogs').doc(log.id);
                batch.set(docRef, {
                    ...log,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            });

            await batch.commit();
            developmentLogs = initialLogs;
            console.log('Logs de desarrollo poblados exitosamente');
        }
    } catch (error) {
        console.error('Error poblando logs de desarrollo:', error);
        developmentLogs = initialLogs;
    }
}

// Renderizar pagina de Development Log
async function renderDevelopmentLog() {
    const dashboard = document.querySelector('.dashboard');

    // Mostrar loading
    dashboard.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 300px;">
            <div style="text-align: center;">
                <i class="fas fa-code fa-3x fa-spin" style="color: var(--accent-primary); margin-bottom: 16px;"></i>
                <p style="color: var(--text-muted);">Cargando registro de desarrollo...</p>
            </div>
        </div>
    `;

    await loadDevelopmentLogs();

    // Agrupar logs por mes
    const logsByMonth = {};
    developmentLogs.forEach(log => {
        const date = new Date(log.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = date.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });

        if (!logsByMonth[monthKey]) {
            logsByMonth[monthKey] = { label: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1), logs: [] };
        }
        logsByMonth[monthKey].logs.push(log);
    });

    // Calcular estadisticas
    const totalLogs = developmentLogs.length;
    const thisMonth = developmentLogs.filter(l => {
        const d = new Date(l.date);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    const categoryStats = {};
    developmentLogs.forEach(log => {
        categoryStats[log.category] = (categoryStats[log.category] || 0) + 1;
    });

    dashboard.innerHTML = `
        <div class="page-header">
            <div class="page-header-left">
                <h2 class="section-title"><i class="fas fa-code" style="margin-right: 10px; color: var(--accent-primary);"></i>Registro de Desarrollo</h2>
                <p class="section-subtitle">Historial de todo el trabajo y cambios del sistema</p>
            </div>
            <div class="page-header-right">
                <button onclick="openAddDevLogModal()" class="btn-primary" style="display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-plus"></i> Agregar
                </button>
            </div>
        </div>

        <!-- Stats Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
            <div class="card" style="padding: 20px; text-align: center;">
                <div style="font-size: 32px; font-weight: 700; color: var(--accent-primary);">${totalLogs}</div>
                <div style="font-size: 13px; color: var(--text-muted);">Total de Cambios</div>
            </div>
            <div class="card" style="padding: 20px; text-align: center;">
                <div style="font-size: 32px; font-weight: 700; color: #10b981;">${thisMonth}</div>
                <div style="font-size: 13px; color: var(--text-muted);">Este Mes</div>
            </div>
            <div class="card" style="padding: 20px; text-align: center;">
                <div style="font-size: 32px; font-weight: 700; color: #6366f1;">${categoryStats.feature || 0}</div>
                <div style="font-size: 13px; color: var(--text-muted);">Nuevas Funciones</div>
            </div>
            <div class="card" style="padding: 20px; text-align: center;">
                <div style="font-size: 32px; font-weight: 700; color: #ef4444;">${categoryStats.fix || 0}</div>
                <div style="font-size: 13px; color: var(--text-muted);">Bugs Arreglados</div>
            </div>
        </div>

        <!-- Filtro por Categoria -->
        <div class="card" style="padding: 16px; margin-bottom: 20px;">
            <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
                <span style="font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-right: 8px;">Filtrar:</span>
                <button onclick="filterDevLogs('all')" class="dev-log-filter-btn active" data-filter="all">
                    <i class="fas fa-list"></i> Todos
                </button>
                ${Object.entries(DEV_LOG_CATEGORIES).map(([key, cat]) => `
                    <button onclick="filterDevLogs('${key}')" class="dev-log-filter-btn" data-filter="${key}" style="--cat-color: ${cat.color}">
                        <i class="fas ${cat.icon}"></i> ${cat.label}
                    </button>
                `).join('')}
            </div>
        </div>

        <!-- Timeline -->
        <div id="devLogTimeline" class="dev-log-timeline">
            ${Object.entries(logsByMonth).sort((a, b) => b[0].localeCompare(a[0])).map(([monthKey, monthData]) => `
                <div class="dev-log-month" data-month="${monthKey}">
                    <h3 class="dev-log-month-header">
                        <i class="fas fa-calendar-alt"></i> ${monthData.label}
                        <span class="dev-log-month-count">${monthData.logs.length} cambios</span>
                    </h3>
                    <div class="dev-log-entries">
                        ${monthData.logs.map(log => renderDevLogEntry(log)).join('')}
                    </div>
                </div>
            `).join('')}
        </div>

        <style>
            .dev-log-filter-btn {
                padding: 6px 12px;
                border: 1px solid var(--border-color);
                border-radius: 20px;
                background: var(--bg-secondary);
                color: var(--text-secondary);
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .dev-log-filter-btn:hover {
                border-color: var(--accent-primary);
                color: var(--accent-primary);
            }

            .dev-log-filter-btn.active {
                background: var(--accent-primary);
                border-color: var(--accent-primary);
                color: white;
            }

            .dev-log-timeline {
                position: relative;
            }

            .dev-log-month {
                margin-bottom: 32px;
            }

            .dev-log-month-header {
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 18px;
                font-weight: 700;
                color: var(--text-primary);
                margin-bottom: 16px;
                padding-bottom: 12px;
                border-bottom: 2px solid var(--accent-primary);
            }

            .dev-log-month-count {
                font-size: 12px;
                font-weight: 500;
                color: var(--text-muted);
                background: var(--bg-secondary);
                padding: 4px 10px;
                border-radius: 12px;
                margin-left: auto;
            }

            .dev-log-entries {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .dev-log-entry {
                background: var(--bg-card);
                border: 1px solid var(--border-color);
                border-radius: 12px;
                padding: 16px;
                position: relative;
                transition: all 0.2s;
            }

            .dev-log-entry:hover {
                border-color: var(--accent-primary);
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
            }

            .dev-log-entry-header {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                margin-bottom: 10px;
            }

            .dev-log-category-icon {
                width: 40px;
                height: 40px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }

            .dev-log-category-icon i {
                color: white;
                font-size: 16px;
            }

            .dev-log-entry-title {
                font-size: 15px;
                font-weight: 600;
                color: var(--text-primary);
                margin-bottom: 4px;
            }

            .dev-log-entry-meta {
                font-size: 12px;
                color: var(--text-muted);
                display: flex;
                flex-wrap: wrap;
                gap: 12px;
            }

            .dev-log-entry-description {
                font-size: 13px;
                color: var(--text-secondary);
                line-height: 1.5;
                margin-bottom: 12px;
            }

            .dev-log-entry-files {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
            }

            .dev-log-file-tag {
                font-size: 11px;
                padding: 3px 8px;
                background: var(--bg-secondary);
                border-radius: 4px;
                color: var(--text-muted);
                font-family: monospace;
            }

            @media (max-width: 600px) {
                .dev-log-entry-header {
                    flex-direction: column;
                }

                .dev-log-category-icon {
                    width: 32px;
                    height: 32px;
                }

                .dev-log-entry-meta {
                    flex-direction: column;
                    gap: 4px;
                }
            }
        </style>
    `;
}

// Renderizar una entrada individual
function renderDevLogEntry(log) {
    const category = DEV_LOG_CATEGORIES[log.category] || DEV_LOG_CATEGORIES.feature;
    const date = new Date(log.date);
    const formattedDate = date.toLocaleDateString('es-MX', { weekday: 'short', month: 'short', day: 'numeric' });

    return `
        <div class="dev-log-entry" data-category="${log.category}">
            <div class="dev-log-entry-header">
                <div class="dev-log-category-icon" style="background: ${category.color};">
                    <i class="fas ${category.icon}"></i>
                </div>
                <div style="flex: 1;">
                    <div class="dev-log-entry-title">${log.title}</div>
                    <div class="dev-log-entry-meta">
                        <span><i class="fas fa-calendar"></i> ${formattedDate}</span>
                        <span><i class="fas fa-tag"></i> ${category.label}</span>
                        ${log.developer ? `<span><i class="fas fa-user-cog"></i> ${log.developer}</span>` : ''}
                        ${log.requestedBy ? `<span><i class="fas fa-user"></i> Pedido por ${log.requestedBy}</span>` : ''}
                    </div>
                </div>
            </div>
            <div class="dev-log-entry-description">${log.description}</div>
            ${log.files && log.files.length > 0 ? `
                <div class="dev-log-entry-files">
                    ${log.files.map(f => `<span class="dev-log-file-tag"><i class="fas fa-file-code"></i> ${f}</span>`).join('')}
                </div>
            ` : ''}
        </div>
    `;
}

// Filtrar logs por categoria
function filterDevLogs(category) {
    // Actualizar boton activo
    document.querySelectorAll('.dev-log-filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === category);
    });

    // Filtrar entradas
    document.querySelectorAll('.dev-log-entry').forEach(entry => {
        if (category === 'all' || entry.dataset.category === category) {
            entry.style.display = 'block';
        } else {
            entry.style.display = 'none';
        }
    });

    // Ocultar meses vacios
    document.querySelectorAll('.dev-log-month').forEach(month => {
        const visibleEntries = month.querySelectorAll('.dev-log-entry[style="display: block;"], .dev-log-entry:not([style])');
        const hasVisible = Array.from(visibleEntries).some(e => e.style.display !== 'none');
        month.style.display = hasVisible ? 'block' : 'none';
    });
}

// Abrir modal para agregar nueva entrada
function openAddDevLogModal() {
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-content');

    const today = new Date().toISOString().split('T')[0];

    modalContent.innerHTML = `
        <div class="modal-header">
            <h2><i class="fas fa-plus-circle" style="color: var(--accent-primary);"></i> Agregar Entrada</h2>
            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
            <div class="form-group">
                <label>Fecha *</label>
                <input type="date" class="form-input" id="dev-log-date" value="${today}">
            </div>

            <div class="form-group">
                <label>Titulo *</label>
                <input type="text" class="form-input" id="dev-log-title" placeholder="Titulo breve del cambio...">
            </div>

            <div class="form-group">
                <label>Categoria *</label>
                <select class="form-input" id="dev-log-category">
                    ${Object.entries(DEV_LOG_CATEGORIES).map(([key, cat]) => `
                        <option value="${key}">${cat.label}</option>
                    `).join('')}
                </select>
            </div>

            <div class="form-group">
                <label>Descripcion *</label>
                <textarea class="form-input" id="dev-log-description" rows="4" placeholder="Descripcion detallada de lo que se hizo..."></textarea>
            </div>

            <div class="form-group">
                <label>Archivos Modificados (separados por coma)</label>
                <input type="text" class="form-input" id="dev-log-files" placeholder="js/script.js, css/styles.css">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div class="form-group">
                    <label>Desarrollador</label>
                    <input type="text" class="form-input" id="dev-log-developer" value="Claude AI">
                </div>
                <div class="form-group">
                    <label>Pedido Por</label>
                    <input type="text" class="form-input" id="dev-log-requested-by" placeholder="Quien lo pidio?">
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
            <button class="btn-primary" onclick="saveDevLogEntry()">
                <i class="fas fa-save"></i> Guardar
            </button>
        </div>
    `;

    modal.classList.add('active');
}

// Guardar nueva entrada
async function saveDevLogEntry() {
    const date = document.getElementById('dev-log-date')?.value;
    const title = document.getElementById('dev-log-title')?.value?.trim();
    const category = document.getElementById('dev-log-category')?.value;
    const description = document.getElementById('dev-log-description')?.value?.trim();
    const filesRaw = document.getElementById('dev-log-files')?.value?.trim();
    const developer = document.getElementById('dev-log-developer')?.value?.trim();
    const requestedBy = document.getElementById('dev-log-requested-by')?.value?.trim();

    if (!date || !title || !category || !description) {
        showNotification('Por favor llena todos los campos requeridos', 'warning');
        return;
    }

    const files = filesRaw ? filesRaw.split(',').map(f => f.trim()).filter(f => f) : [];

    const newLog = {
        id: 'log_' + Date.now(),
        date,
        title,
        category,
        description,
        files,
        developer: developer || 'Claude AI',
        requestedBy: requestedBy || null,
        createdAt: new Date().toISOString()
    };

    try {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();
            await db.collection('developmentLogs').doc(newLog.id).set({
                ...newLog,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        developmentLogs.unshift(newLog);
        showNotification('Entrada agregada exitosamente!', 'success');
        closeModal();
        renderDevelopmentLog();

    } catch (error) {
        console.error('Error guardando entrada:', error);
        showNotification('Error al guardar. Intenta de nuevo.', 'error');
    }
}

// ==========================================
// UTILIDAD RAPIDA - Para que Claude AI registre trabajo
// ==========================================

/**
 * Agregar entrada rapida al log de desarrollo
 * Uso: await logDevWork('Titulo', 'Descripcion', 'feature', ['archivo1.js'], 'Carlos')
 * Categorias: feature, fix, enhancement, ui, security, performance, refactor, migration
 */
async function logDevWork(title, description, category = 'feature', files = [], requestedBy = 'Carlos') {
    const today = new Date().toISOString().split('T')[0];

    const newLog = {
        id: 'log_' + Date.now(),
        date: today,
        title,
        description,
        category,
        files: Array.isArray(files) ? files : [files],
        developer: 'Claude AI',
        requestedBy,
        createdAt: new Date().toISOString()
    };

    try {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();
            await db.collection('developmentLogs').doc(newLog.id).set({
                ...newLog,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('✅ Log agregado:', title);
            developmentLogs.unshift(newLog);
            return true;
        }
    } catch (error) {
        console.error('Error agregando log:', error);
    }
    return false;
}

// Hacer funciones disponibles globalmente
window.renderDevelopmentLog = renderDevelopmentLog;
window.openAddDevLogModal = openAddDevLogModal;
window.saveDevLogEntry = saveDevLogEntry;
window.filterDevLogs = filterDevLogs;
window.loadDevelopmentLogs = loadDevelopmentLogs;
window.logDevWork = logDevWork; // Agregar rapido para Claude AI

// ==========================================
// FIN MODULO DE DESARROLLO
// ==========================================
