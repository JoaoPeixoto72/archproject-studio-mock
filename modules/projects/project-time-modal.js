function openManualTimeModal(projectId, phaseKey) {
    const proj = getProject(projectId);
    if (!proj) return;

    const body = `
        <div class="form-group">
            <label class="form-label">Fase</label>
            <select class="form-input" id="manualPhaseSelect">
                ${proj.phases.map(ph =>
                    `<option value="${ph.key}"
                     ${ph.key === phaseKey ? 'selected' : ''}>
                        ${ph.abbr} — ${ph.name}
                     </option>`
                ).join('')}
            </select>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div class="form-group">
                <label class="form-label">Data</label>
                <input type="date" class="form-input"
                       id="manualTimeDate" value="${todayStr()}">
            </div>
            <div class="form-group">
                <label class="form-label">Horas</label>
                <input type="number" step="0.25" class="form-input"
                       id="manualTimeHrs" placeholder="Ex: 2.5">
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">Descrição</label>
            <input type="text" class="form-input"
                   id="manualTimeDesc" placeholder="O que fez...">
        </div>
        <div class="form-group"
             style="display:flex;align-items:center;gap:8px;">
            <input type="checkbox" id="manualTimeBill" checked>
            <label for="manualTimeBill"
                   style="font-size:13px;font-weight:600;
                          margin:0;cursor:pointer;">
                Facturável
            </label>
        </div>
    `;

    const footer = `
        <button class="btn btn-primary"
                onclick="saveManualTime('${projectId}')">
            Registar
        </button>
        <button class="btn btn-secondary" onclick="closeModal()">
            Cancelar
        </button>
    `;

    openModal('Registar Tempo Manual', body, footer);
}

function saveManualTime(projectId) {
    const proj = getProject(projectId);
    if (!proj) return;
    const phaseKey = document.getElementById('manualPhaseSelect').value;
    const hours    = parseFloat(document.getElementById('manualTimeHrs').value);
    const desc     = document.getElementById('manualTimeDesc').value.trim();
    const date     = document.getElementById('manualTimeDate').value;
    const billable = document.getElementById('manualTimeBill').checked;

    if (!phaseKey || !hours || !desc) {
        showToast('Preencha todos os campos');
        return;
    }

    addTimeLog(projectId, {
        date,
        hours,
        phase: phaseKey,
        description: desc,
        billable
    });
    closeModal();
    showToast('Tempo registado');
    handleRoute();
}
