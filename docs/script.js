// Estado de la aplicación
let processesInicio = [];
let processesFirme = [];
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

// Procesos por defecto - Inicio de trámite
const baseProcessesInicio = [
    { id: 1, name: 'Solicitud (Sol)', description: 'Fecha de inicio del trámite', days: 0 },
    { id: 2, name: 'Designación (Des)', description: 'Designación del responsable', days: 1 },
    { id: 3, name: 'Aceptación (Acep)', description: 'Aceptación del encargo', days: 2 },
    { id: 4, name: '001 - Admisión/Inadmisión', description: 'Decisión sobre admisión', days: 3 }
];

// Procesos por defecto - Trámite en firme
const baseProcessesFirme = [
    { id: 1, name: 'Fin de competencia del conciliador', description: 'Finalización de competencia', days: 60 },
    { id: 2, name: 'Prórroga de competencia del conciliador', description: 'Extensión de competencia', days: 30 }
];

// Funciones de localStorage para procesos
function saveProcessesToLocalStorage() {
    try {
        localStorage.setItem('processTimeline_processesInicio', JSON.stringify(processesInicio));
        localStorage.setItem('processTimeline_processesFirme', JSON.stringify(processesFirme));
        console.log('Procesos guardados en localStorage');
    } catch (error) {
        console.error('Error al guardar procesos:', error);
    }
}

function loadProcessesFromLocalStorage() {
    try {
        // Cargar procesos de inicio
        const savedInicio = localStorage.getItem('processTimeline_processesInicio');
        if (savedInicio) {
            const loadedProcesses = JSON.parse(savedInicio);
            if (Array.isArray(loadedProcesses) && loadedProcesses.length > 0) {
                processesInicio = loadedProcesses;
            } else {
                processesInicio = [...baseProcessesInicio];
            }
        } else {
            processesInicio = [...baseProcessesInicio];
        }
        
        // Cargar procesos en firme
        const savedFirme = localStorage.getItem('processTimeline_processesFirme');
        if (savedFirme) {
            const loadedProcesses = JSON.parse(savedFirme);
            if (Array.isArray(loadedProcesses) && loadedProcesses.length > 0) {
                processesFirme = loadedProcesses;
            } else {
                processesFirme = [...baseProcessesFirme];
            }
        } else {
            processesFirme = [...baseProcessesFirme];
        }
    } catch (error) {
        console.error('Error al cargar procesos:', error);
        processesInicio = [...baseProcessesInicio];
        processesFirme = [...baseProcessesFirme];
    }
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
    loadProcessesFromLocalStorage();
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
        days
    };
    
    if (type === 'inicio') {
        processesInicio.push(newProcess);
    } else {
        processesFirme.push(newProcess);
    }
    
    saveProcessesToLocalStorage(); // Guardar en localStorage
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
    const processes = type === 'inicio' ? processesInicio : processesFirme;
    
    if (processes.length === 0) {
        container.innerHTML = '<div class="no-items">No hay procesos configurados</div>';
        return;
    }
    
    container.innerHTML = processes.map((process, index) => `
                <div class="process-item">
                    <div class="item-header">
                        <span class="item-title">${process.name}</span>
                        <span class="item-badge">${process.days === 0 ? 'Inicio' : '+' + process.days + ' días'}</span>
                    </div>
                    <div class="item-description">${process.description}</div>
                    <div class="item-actions">
                        ${index > 0 ? `<button class="btn btn-small" onclick="moveProcess(${index}, -1, '${type}')">↑</button>` : ''}
                        ${index < processes.length - 1 ? `<button class="btn btn-small" onclick="moveProcess(${index}, 1, '${type}')">↓</button>` : ''}
                        <button class="btn btn-warning btn-small" onclick="editProcess(${index}, '${type}')">✏️ Editar</button>
                        <button class="btn btn-danger btn-small" onclick="removeProcess(${index}, '${type}')">🗑️ Eliminar</button>
                    </div>
                </div>
            `).join('');
}

function updateProcessField(index, field, value, type) {
    const processes = type === 'inicio' ? processesInicio : processesFirme;
    if (processes[index]) {
        processes[index][field] = value;
        saveProcessesToLocalStorage(); // Guardar cambios en localStorage
    }
}

function moveProcess(index, direction, type) {
    const processes = type === 'inicio' ? processesInicio : processesFirme;
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < processes.length) {
        [processes[index], processes[newIndex]] = [processes[newIndex], processes[index]];
        saveProcessesToLocalStorage(); // Guardar cambios en localStorage
        updateProcessList();
    }
}

function removeProcess(index, type) {
    if (confirm('¿Está seguro de que desea eliminar este proceso?')) {
        const processes = type === 'inicio' ? processesInicio : processesFirme;
        processes.splice(index, 1);
        saveProcessesToLocalStorage(); // Guardar cambios en localStorage
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

function editProcess(index, type) {
    const processes = type === 'inicio' ? processesInicio : processesFirme;
    const process = processes[index];
    if (!process) return;

    editingProcessIndex = index;
    editingProcessType = type;
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
    
    const processes = editingProcessType === 'inicio' ? processesInicio : processesFirme;
    
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
    
    saveProcessesToLocalStorage(); // Guardar cambios en localStorage
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
    if (processesInicio.length === 0 && processesFirme.length === 0) {
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
    let currentCalculationDate = startDate;
    
    processesInicio.forEach((process, index) => {
        let processDate;
        
        if (index === 0 || process.days === 0) {
            // CORREGIDO: Primer proceso usa la fecha de inicio exacta
            processDate = new Date(startDate);
        } else {
            // Calcular días hábiles desde la fecha del proceso anterior
            processDate = addBusinessDays(currentCalculationDate, process.days);
        }
        
        currentResults.push({
            ...process,
            type: 'inicio',
            date: processDate,
            dateString: processDate.toISOString().split('T')[0]
        });
        
        currentCalculationDate = new Date(processDate);
    });
    
    // Calcular procesos en firme (todos desde fecha de inicio)
    processesFirme.forEach((process, index) => {
        let processDate;
        
        if (process.days === 0) {
            processDate = new Date(startDate);
        } else {
            // Calcular días hábiles desde la fecha de inicio
            processDate = addBusinessDays(startDate, process.days);
        }
        
        currentResults.push({
            ...process,
            type: 'firme',
            date: processDate,
            dateString: processDate.toISOString().split('T')[0]
        });
    });
    
    // Ordenar por fecha
    currentResults.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    displayTimeline();
    
    // Cambiar a la sección de cálculo si no está activa
    if (!document.getElementById('calculate').classList.contains('active')) {
        showSection('calculate');
    }
}

function displayTimeline() {
    const container = document.getElementById('timeline');
    
    if (currentResults.length === 0) {
        container.innerHTML = '<div class="no-items">No hay resultados para mostrar</div>';
        return;
    }
    
    const formatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    
    container.innerHTML = currentResults.map(result => {
        const formattedDate = result.date.toLocaleDateString('es-ES', formatOptions);
        const typeClass = result.type === 'firme' ? 'firme' : 'inicio';
        const typeLabel = result.type === 'firme' ? 'Trámite en Firme' : 'Inicio de Trámite';
        
        return `
            <div class="timeline-item ${typeClass}">
                <div class="timeline-header">
                    <span class="timeline-title">${result.name}</span>
                    <span class="timeline-date">${formattedDate}</span>
                </div>
                <div class="timeline-body">
                    <div class="timeline-description">${result.description}</div>
                    <div class="timeline-badges">
                        <span class="item-badge type-badge ${typeClass}">${typeLabel}</span>
                        <span class="item-badge">+${result.days} días</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Funciones adicionales para manejo de datos
function resetProcesses() {
    if (confirm('¿Está seguro de que desea restaurar los procesos por defecto? Se perderán todos los cambios.')) {
        processesInicio = [...baseProcessesInicio];
        processesFirme = [...baseProcessesFirme];
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
        processesInicio: processesInicio,
        processesFirme: processesFirme,
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

// Cerrar modal al hacer clic fuera de él
window.onclick = function(event) {
    const modal = document.getElementById('holidayModal');
    if (event.target == modal) {
        closeHolidayModal();
    }
}