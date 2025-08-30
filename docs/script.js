// Estado de la aplicación
let processes = [];
let holidays = [];
let currentResults = [];
let editingHolidayIndex = -1;
let editingProcessIndex = -1;
let editingProcessType = 'inicio';
let currentProcessTab = 'inicio';

// Festivos oficiales de Colombia 2025 - CORREGIDOS según fuentes oficiales
const baseHolidays = [
    { name: 'Año Nuevo', date: '2025-01-01', custom: false },
    { name: 'Día de los Reyes Magos', date: '2025-01-06', custom: false },
    { name: 'Día de San José', date: '2025-03-24', custom: false },
    { name: 'Jueves Santo', date: '2025-04-17', custom: false },
    { name: 'Viernes Santo', date: '2025-04-18', custom: false },
    { name: 'Día del Trabajo', date: '2025-05-01', custom: false },
    { name: 'Día de la Ascensión', date: '2025-06-02', custom: false },
    { name: 'Corpus Christi', date: '2025-06-23', custom: false },
    { name: 'San Pedro y San Pablo', date: '2025-06-30', custom: false },
    { name: 'Día de la Independencia', date: '2025-07-20', custom: false },
    { name: 'Batalla de Boyacá', date: '2025-08-07', custom: false },
    { name: 'Asunción de la Virgen', date: '2025-08-18', custom: false },
    { name: 'Día de la Raza', date: '2025-10-13', custom: false },
    { name: 'Día de Todos los Santos', date: '2025-11-03', custom: false },
    { name: 'Independencia de Cartagena', date: '2025-11-17', custom: false },
    { name: 'Inmaculada Concepción', date: '2025-12-08', custom: false },
    { name: 'Navidad', date: '2025-12-25', custom: false }
];

// Procesos por defecto
const baseProcesses = [
    // Procesos de inicio
    { id: 1, name: 'Solicitud (Sol)', description: 'Fecha de inicio del trámite', days: 0, type: 'inicio' },
    { id: 2, name: 'Designación (Des)', description: 'Designación del responsable', days: 1, type: 'inicio' },
    { id: 3, name: 'Aceptación (Acep)', description: 'Aceptación del encargo', days: 2, type: 'inicio' },
    { id: 4, name: '001 - Admisión/Inadmisión', description: 'Decisión sobre admisión', days: 3, type: 'inicio' },
    // Procesos en firme
    { id: 5, name: 'Fin de competencia del conciliador', description: 'Finalización de competencia', days: 60, type: 'firme' },
    { id: 6, name: 'Prórroga de competencia del conciliador', description: 'Extensión de competencia', days: 30, type: 'firme' }
];

// Funciones de localStorage para procesos
function saveProcessesToLocalStorage() {
    try {
        localStorage.setItem('processTimeline_processes', JSON.stringify(processes));
        console.log('Procesos guardados en localStorage');
    } catch (error) {
        console.error('Error al guardar procesos:', error);
    }
}

function loadProcessesFromLocalStorage() {
    try {
        const saved = localStorage.getItem('processTimeline_processes');
        if (saved) {
            const loadedProcesses = JSON.parse(saved);
            if (Array.isArray(loadedProcesses) && loadedProcesses.length > 0) {
                return loadedProcesses;
            }
        }
    } catch (error) {
        console.error('Error al cargar procesos:', error);
    }
    return [...baseProcesses];
}

// Funciones de localStorage para festivos
function saveHolidaysToLocalStorage() {
    try {
        // Solo guardar festivos personalizados
        const customHolidays = holidays.filter(h => h.custom === true);
        localStorage.setItem('processTimeline_holidays', JSON.stringify(customHolidays));
        console.log('Festivos personalizados guardados en localStorage');
    } catch (error) {
        console.error('Error al guardar festivos:', error);
    }
}

function loadHolidaysFromLocalStorage() {
    try {
        const saved = localStorage.getItem('processTimeline_holidays');
        if (saved) {
            const customHolidays = JSON.parse(saved);
            if (Array.isArray(customHolidays)) {
                // Combinar festivos base con personalizados
                const allHolidays = [...baseHolidays, ...customHolidays];
                return allHolidays.sort((a, b) => new Date(a.date) - new Date(b.date));
            }
        }
    } catch (error) {
        console.error('Error al cargar festivos:', error);
    }
    return [...baseHolidays]; // Retorna solo festivos base si no hay guardados
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().split('T')[0];
    var dateInput = document.getElementById('startDate');
    dateInput.value = today;
    dateInput.focus();
    
    // Inicializar datos
    initializeData();
    
    // Event listeners - CORREGIDOS
    document.getElementById('processFormInicio').addEventListener('submit', function(e) {
        e.preventDefault();
        handleAddProcess('inicio');
    });
    
    document.getElementById('processFormFirme').addEventListener('submit', function(e) {
        e.preventDefault();
        handleAddProcess('firme');
    });
    
    document.getElementById('holidayForm').addEventListener('submit', function(e) {
        e.preventDefault();
        handleAddHoliday();
    });
    
    document.getElementById('editHolidayForm').addEventListener('submit', function(e) {
        e.preventDefault();
        handleEditHoliday();
    });
    
    document.getElementById('editProcessForm').addEventListener('submit', function(e) {
        e.preventDefault();
        handleEditProcess();
    });

    document.getElementById('calculateBtn').addEventListener('click', function() {
        calculateTimeline();
    });
    
    // Mobile menu functionality
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('sidebar');
    const mobileOverlay = document.getElementById('mobileOverlay');
    
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    mobileOverlay.addEventListener('click', closeMobileMenu);
    
    // Close sidebar when clicking on nav items (mobile)
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                closeMobileMenu();
            }
        });
    });
    
    // Detectar Enter y disparar el botón
    dateInput.addEventListener('keydown', (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            document.getElementById('calculateBtn').click();
            // 🔄 To focus the date at starting again
            setTimeout(() => {
                dateInput.blur();   // quita el foco
                dateInput.focus();  // lo vuelve a poner al inicio
            }, 50);
        }
    });
});

function initializeData() {
    // Cargar datos desde localStorage
    processes = loadProcessesFromLocalStorage();
    holidays = loadHolidaysFromLocalStorage();
    
    // Validar fechas de festivos base
    baseHolidays.forEach(h => {
        DateHelper.parseBogotaDate(h.date);
    });
    
    updateProcessList();
    updateHolidayList();
}

function showSection(sectionId) {
    // Ocultar todas las secciones
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Mostrar la sección seleccionada
    document.getElementById(sectionId).classList.add('active');
    
    // Actualizar navegación
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Marcar como activo el elemento correcto basado en el onclick
    const activeNavItem = document.querySelector(`.nav-item[onclick="showSection('${sectionId}')"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }
}

function handleAddProcess(type) {
    const suffix = type === 'inicio' ? 'Inicio' : 'Firme';
    const name = document.getElementById(`processName${suffix}`).value.trim();
    const description = document.getElementById(`processDescription${suffix}`).value.trim();
    const days = parseInt(document.getElementById(`processDays${suffix}`).value);
    
    if (!name) {
        alert('Por favor ingrese un nombre para el proceso');
        return;
    }
    
    const newProcess = {
        id: Date.now(),
        name,
        description: description || 'Sin descripción',
        days,
        type
    };
    
    processes.push(newProcess);
    saveProcessesToLocalStorage();
    updateProcessList();
    
    // Limpiar formulario
    document.getElementById(`processForm${suffix}`).reset();
    document.getElementById(`processDays${suffix}`).value = 1;
    
    alert('Proceso agregado exitosamente');
}

function handleAddHoliday() {
    const name = document.getElementById('holidayName').value.trim();
    const date = document.getElementById('holidayDate').value;
    
    if (!name || !date) {
        alert('Por favor complete todos los campos');
        return;
    }
    
    // Verificar si ya existe un festivo en esa fecha
    const existingHoliday = holidays.find(h => h.date === date);
    if (existingHoliday) {
        alert(`Ya existe un festivo en esa fecha: ${existingHoliday.name}`);
        return;
    }
    
    const newHoliday = {
        id: Date.now(),
        name,
        date,
        custom: true
    };
    
    holidays.push(newHoliday);
    holidays.sort((a, b) => new Date(a.date) - new Date(b.date));
    saveHolidaysToLocalStorage(); // Guardar en localStorage
    updateHolidayList();
    
    // Limpiar formulario
    document.getElementById('holidayForm').reset();
    
    alert('Festivo agregado exitosamente');
}

function updateProcessList() {
    updateProcessListForType('inicio');
    updateProcessListForType('firme');
}

function updateProcessListForType(type) {
    const suffix = type === 'inicio' ? 'Inicio' : 'Firme';
    const container = document.getElementById(`processItems${suffix}`);
    
    if (!container) {
        console.error(`Container not found: processItems${suffix}`);
        return;
    }
    
    const filteredProcesses = processes.filter(p => p.type === type);
    
    if (filteredProcesses.length === 0) {
        container.innerHTML = '<div class="no-items">No hay procesos configurados</div>';
        return;
    }
    
    container.innerHTML = filteredProcesses.map((process) => {
        const globalIndex = processes.findIndex(p => p.id === process.id);
        const typeProcesses = processes.filter(p => p.type === type);
        const typeIndex = typeProcesses.findIndex(p => p.id === process.id);
        
        return `
                <div class="process-item">
                    <div class="item-header">
                        <span class="item-title">${process.name}</span>
                        <span class="item-badge">${process.days === 0 ? 'Inicio' : '+' + process.days + ' días'}</span>
                    </div>
                    <div class="item-description">${process.description}</div>
                    <div class="item-actions">
                        ${typeIndex > 0 ? `<button class="btn btn-small" onclick="moveProcess(${globalIndex}, -1, '${type}')">↑</button>` : ''}
                        ${typeIndex < typeProcesses.length - 1 ? `<button class="btn btn-small" onclick="moveProcess(${globalIndex}, 1, '${type}')">↓</button>` : ''}
                        <button class="btn btn-warning btn-small" onclick="editProcess(${globalIndex})">✏️ Editar</button>
                        <button class="btn btn-danger btn-small" onclick="removeProcess(${globalIndex})">🗑️ Eliminar</button>
                    </div>
                </div>
            `;
    }).join('');
}

function updateProcessField(index, field, value) {
    if (processes[index]) {
        processes[index][field] = value;
        saveProcessesToLocalStorage();
    }
}

function moveProcess(index, direction, type) {
    const typeProcesses = processes.filter(p => p.type === type);
    const currentProcess = processes[index];
    const currentTypeIndex = typeProcesses.findIndex(p => p.id === currentProcess.id);
    
    if (currentTypeIndex + direction < 0 || currentTypeIndex + direction >= typeProcesses.length) {
        return;
    }
    
    const targetProcess = typeProcesses[currentTypeIndex + direction];
    const targetIndex = processes.findIndex(p => p.id === targetProcess.id);
    
    [processes[index], processes[targetIndex]] = [processes[targetIndex], processes[index]];
    saveProcessesToLocalStorage();
    updateProcessList();
}

function removeProcess(index) {
    if (confirm('¿Está seguro de que desea eliminar este proceso?')) {
        processes.splice(index, 1);
        saveProcessesToLocalStorage();
        updateProcessList();
    }
}

function updateHolidayList() {
    const container = document.getElementById('holidayItems');
    
    if (holidays.length === 0) {
        container.innerHTML = '<div class="no-items">No hay festivos configurados</div>';
        return;
    }
    
    // Ordenar por fecha
    const sortedHolidays = holidays.sort((a, b) => new Date(a.date) - new Date(b.date));
    container.innerHTML = sortedHolidays.map((holiday, index) => {
        const date = DateHelper.parseBogotaDate(holiday.date);
        const formattedDate = date.toLocaleDateString('es-CO', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        return `
            <div class="festivo-item">
                <div class="item-header">
                    <span class="item-title">${holiday.name}</span>
                    <span class="item-badge ${holiday.custom ? 'custom' : ''}">${holiday.custom ? 'Personalizado' : 'Oficial'}</span>
                </div>
                <div class="item-description">${formattedDate}</div>
                ${holiday.custom ? `
                    <div class="item-actions">
                        <button class="btn btn-warning btn-small" onclick="editHoliday(${index})">✏️ Editar</button>
                        <button class="btn btn-danger btn-small" onclick="removeHoliday(${index})">🗑️ Eliminar</button>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

function removeHoliday(index) {
    if (confirm('¿Está seguro de que desea eliminar este festivo?')) {
        const holidayToRemove = holidays[index];
        if (holidayToRemove && holidayToRemove.custom) {
            holidays.splice(index, 1);
            saveHolidaysToLocalStorage(); // Guardar cambios en localStorage
            updateHolidayList();
        } else {
            alert('No se pueden eliminar festivos oficiales');
        }
    }
}

function editHoliday(index) {
    const holiday = holidays[index];
    if (!holiday.custom) return; // Solo editar festivos personalizados
    
    editingHolidayIndex = index;
    document.getElementById('editHolidayName').value = holiday.name;
    document.getElementById('editHolidayDate').value = holiday.date;
    document.getElementById('holidayModal').style.display = 'block';
}

function editProcess(index) {
    const process = processes[index];
    if (!process) return;

    editingProcessIndex = index;
    editingProcessType = process.type;
    document.getElementById('editProcessName').value = process.name;
    document.getElementById('editProcessDays').value = process.days;
    document.getElementById('editProcessDescription').value = process.description;
    document.getElementById('processModal').style.display = 'block';
}
function handleEditProcess() {
    const name = document.getElementById('editProcessName').value.trim();
    const days = parseInt(document.getElementById('editProcessDays').value);
    const description = document.getElementById('editProcessDescription').value.trim();
    
    if (!name || isNaN(days) || days < 0) {
        alert('Por favor complete todos los campos correctamente');
        return;
    }
    
    // Verificar si ya existe otro proceso con el mismo nombre (excepto el que estamos editando)
    const existingProcess = processes.find((p, idx) => p.name === name && idx !== editingProcessIndex);
    if (existingProcess) {
        alert(`Ya existe un proceso con ese nombre: ${existingProcess.name}`);
        return;
    }
    
    // Actualizar el proceso
    processes[editingProcessIndex].name = name;
    processes[editingProcessIndex].days = days;
    processes[editingProcessIndex].description = description || 'Sin descripción';
    
    saveProcessesToLocalStorage();
    updateProcessList();
    closeProcessModal();
    
    alert('Proceso actualizado exitosamente');
}
// Funciones para manejar edición y eliminación de festivos

function handleEditHoliday() {
    const name = document.getElementById('editHolidayName').value.trim();
    const date = document.getElementById('editHolidayDate').value;
    
    if (!name || !date) {
        alert('Por favor complete todos los campos');
        return;
    }
    
    // Verificar si ya existe otro festivo en esa fecha (excepto el que estamos editando)
    const existingHoliday = holidays.find((h, idx) => h.date === date && idx !== editingHolidayIndex);
    if (existingHoliday) {
        alert(`Ya existe un festivo en esa fecha: ${existingHoliday.name}`);
        return;
    }
    
    // Actualizar el festivo
    holidays[editingHolidayIndex].name = name;
    holidays[editingHolidayIndex].date = date;
    
    holidays.sort((a, b) => new Date(a.date) - new Date(b.date));
    saveHolidaysToLocalStorage(); // Guardar cambios en localStorage
    updateHolidayList();
    closeHolidayModal();
    
    alert('Festivo actualizado exitosamente');
}

function closeHolidayModal() {
    document.getElementById('holidayModal').style.display = 'none';
    editingHolidayIndex = -1;
}

function closeProcessModal() {
    document.getElementById('processModal').style.display = 'none';
    editingProcessIndex = -1;
    editingProcessType = 'inicio';
}

function isBusinessDay(date) {
    const dayOfWeek = date.getDay();
    const dateStr = date.toISOString().split('T')[0];
    
    // Excluir fines de semana (0 = domingo, 6 = sábado)
    if (dayOfWeek === 0 || dayOfWeek === 6) return false;
    
    // Excluir festivos
    if (holidays.some(h => h.date === dateStr)) return false;
    
    return true;
}

function addBusinessDays(startDate, days) {
    let currentDate = new Date(startDate);
    let addedDays = 0;
    
    while (addedDays < days) {
        currentDate.setDate(currentDate.getDate() + 1);
        if (isBusinessDay(currentDate)) {
            addedDays++;
        }
    }
    
    return new Date(currentDate);
}

function calculateTimeline() {
    if (processes.length === 0) {
        alert('Debe configurar al menos un proceso antes de calcular');
        return;
    }
    
    const startDateStr = document.getElementById('startDate').value;
    if (!startDateStr) {
        alert('Por favor ingrese la fecha de inicio');
        return;
    }
    
    const startDate = DateHelper.parseBogotaDate(startDateStr);
    currentResults = [];
    
    // Calcular procesos de inicio
    const processesInicio = processes.filter(p => p.type === 'inicio');
    let currentCalculationDate = startDate;
    
    processesInicio.forEach((process, index) => {
        let processDate;
        
        if (index === 0 || process.days === 0) {
            processDate = new Date(startDate);
        } else {
            processDate = addBusinessDays(currentCalculationDate, process.days);
        }
        
        currentResults.push({
            ...process,
            date: processDate,
            dateString: processDate.toISOString().split('T')[0]
        });
        
        currentCalculationDate = new Date(processDate);
    });
    
    // Calcular procesos en firme (secuencial entre ellos)
    const processesFirme = processes.filter(p => p.type === 'firme');
    let currentFirmeCalculationDate = startDate;
    
    processesFirme.forEach((process, index) => {
        let processDate;
        
        if (process.days === 0) {
            // Solo si el proceso tiene 0 días, usar fecha de inicio exacta
            processDate = new Date(startDate);
        } else if (index === 0) {
            // Primer proceso en firme calcula sus días desde la fecha de inicio
            processDate = addBusinessDays(startDate, process.days);
        } else {
            // Procesos siguientes calculan desde el proceso anterior
            processDate = addBusinessDays(currentFirmeCalculationDate, process.days);
        }
        
        currentResults.push({
            ...process,
            date: processDate,
            dateString: processDate.toISOString().split('T')[0]
        });
        
        currentFirmeCalculationDate = new Date(processDate);
    });
    
    displayTimeline();
    
    if (!document.getElementById('calculate').classList.contains('active')) {
        showSection('calculate');
    }
}

function displayTimeline() {
    const containerInicio = document.getElementById('timelineInicio');
    const containerFirme = document.getElementById('timelineFirme');
    
    if (currentResults.length === 0) {
        containerInicio.innerHTML = '<div class="no-items">No hay procesos de inicio configurados</div>';
        containerFirme.innerHTML = '<div class="no-items">No hay procesos en firme configurados</div>';
        return;
    }
    
    const formatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    
    // Filtrar resultados por tipo
    const resultsInicio = currentResults.filter(r => r.type === 'inicio');
    const resultsFirme = currentResults.filter(r => r.type === 'firme');
    
    // Mostrar procesos de inicio
    if (resultsInicio.length === 0) {
        containerInicio.innerHTML = '<div class="no-items">No hay procesos de inicio configurados</div>';
    } else {
        containerInicio.innerHTML = resultsInicio.map(result => {
            const formattedDate = result.date.toLocaleDateString('es-ES', formatOptions);
            
            return `
                <div class="timeline-item inicio">
                    <div class="timeline-header">
                        <span class="timeline-title">${result.name}</span>
                        <span class="timeline-date">${formattedDate}</span>
                    </div>
                    <div class="timeline-body">
                        <div class="timeline-description">${result.description}</div>
                        <span class="item-badge">+${result.days} días</span>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Mostrar procesos en firme
    if (resultsFirme.length === 0) {
        containerFirme.innerHTML = '<div class="no-items">No hay procesos en firme configurados</div>';
    } else {
        containerFirme.innerHTML = resultsFirme.map(result => {
            const formattedDate = result.date.toLocaleDateString('es-ES', formatOptions);
            
            return `
                <div class="timeline-item firme">
                    <div class="timeline-header">
                        <span class="timeline-title">${result.name}</span>
                        <span class="timeline-date">${formattedDate}</span>
                    </div>
                    <div class="timeline-body">
                        <div class="timeline-description">${result.description}</div>
                        <span class="item-badge">+${result.days} días</span>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// Funciones adicionales para manejo de datos
function resetProcesses() {
    if (confirm('¿Está seguro de que desea restaurar los procesos por defecto? Se perderán todos los cambios.')) {
        processes = [...baseProcesses];
        saveProcessesToLocalStorage();
        updateProcessList();
        alert('Procesos restaurados por defecto');
    }
}

function resetHolidays() {
    if (confirm('¿Está seguro de que desea eliminar todos los festivos personalizados?')) {
        holidays = [...baseHolidays];
        saveHolidaysToLocalStorage();
        updateHolidayList();
        alert('Festivos personalizados eliminados');
    }
}

function exportData() {
    const data = {
        processes: processes,
        customHolidays: holidays.filter(h => h.custom === true),
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `timeline_data_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Función para cambiar entre tabs de procesos
function switchProcessTab(tabType) {
    currentProcessTab = tabType;
    
    // Actualizar botones de tabs
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`tab${tabType === 'inicio' ? 'Inicio' : 'Firme'}`).classList.add('active');
    
    // Actualizar contenido de tabs
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`tab${tabType === 'inicio' ? 'Inicio' : 'Firme'}Content`).classList.add('active');
}

// Función de debug para limpiar localStorage
function clearLocalStorage() {
    localStorage.removeItem('processTimeline_processes');
    localStorage.removeItem('processTimeline_holidays');
    console.log('LocalStorage limpiado');
    location.reload();
}

// Mobile menu functions
function toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const isActive = sidebar.classList.contains('active');
    
    if (isActive) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

function openMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('sidebar');
    const mobileOverlay = document.getElementById('mobileOverlay');
    
    mobileMenuBtn.classList.add('active');
    sidebar.classList.add('active');
    mobileOverlay.classList.add('active');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('sidebar');
    const mobileOverlay = document.getElementById('mobileOverlay');
    
    mobileMenuBtn.classList.remove('active');
    sidebar.classList.remove('active');
    mobileOverlay.classList.remove('active');
    
    // Restore body scroll
    document.body.style.overflow = '';
}

// Cerrar modal al hacer clic fuera de él
window.onclick = function(event) {
    const modal = document.getElementById('holidayModal');
    if (event.target == modal) {
        closeHolidayModal();
    }
}