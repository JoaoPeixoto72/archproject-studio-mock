function getProject(id) {
    if (!id) return null;
    return PROJECTS.find(p => p.id === id);
}

function getPhase(projectId, phaseKey) {
    const proj = getProject(projectId);
    if (!proj || !proj.phases) return null;
    return proj.phases.find(ph => ph.key === phaseKey);
}

function getDeliverable(projectId, deliverableId) {
    const proj = getProject(projectId);
    if (!proj) return null;
    for (const phase of proj.phases) {
        const del = (phase.deliverables || []).find(d => d.id === deliverableId);
        if (del) return { phase, deliverable: del };
    }
    return null;
}

function getPersonById(id) {
    if (!id) return null;
    return TEAM.members.find(m => m.id === id) || 
           TEAM.externals.find(e => e.id === id) || 
           TEAM.clients.find(c => c.id === id);
}

function getAllPendencias() {
    let all = [];
    PROJECTS.forEach(p => {
        if (p.pendencias) {
            p.pendencias.forEach(pend => {
                all.push({ ...pend, projectId: p.id, projectName: p.name });
            });
        }
    });
    return all;
}

function getAllPendingApprovals() {
    let all = [];
    PROJECTS.forEach(p => {
        p.phases.forEach(ph => {
            if (ph.approvals) {
                ph.approvals.filter(a => a.status === 'pending').forEach(a => {
                    all.push({ ...a, projectId: p.id, projectName: p.name, phaseKey: ph.key, phaseName: ph.name });
                });
            }
        });
    });
    return all;
}

function getAllTimeLogs() {
    let all = [];
    PROJECTS.forEach(p => {
        if (p.timeLogs) {
            p.timeLogs.forEach(tl => {
                all.push({ ...tl, projectId: p.id, projectName: p.name });
            });
        }
    });
    return all;
}

function getAllHistory() {
    let all = [];
    PROJECTS.forEach(p => {
        if (p.history) {
            p.history.forEach(h => {
                all.push({ ...h, projectId: p.id, projectName: p.name });
            });
        }
    });
    return all.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function buildPhasesFromSource(sourcePhases, options = {}) {
    if (!sourcePhases) return [];
    
    // Deep copy to avoid mutating source
    const phases = JSON.parse(JSON.stringify(sourcePhases));
    
    return phases
        .filter(p => options.fromQuote ? p.included : true)
        .map((p, idx) => {
            // Determine key and names (handles mismatch between Quote phase and Project phase)
            const key = p.key || p.id || ('ph_' + idx);
            const name = p.name || p.label || p.id;
            const abbr = p.abbr || (name ? name.substring(0,2).toUpperCase() : 'PH');

            const phase = {
                key: key,
                abbr: abbr,
                name: name,
                description: p.description || '',
                order: p.order || (idx + 1),
                status: 'pending',
                startDate: null,
                endDate: null,
                endDateActual: null,
                budgetedHours: p.estimatedHours || p.budgetHours || 0,
                deliverables: [],
                approvals: [],
                notes: [],
                photos: [],
                ...p
            };

            // Materialize default deliverables if they exist (Templates)
            if (p.defaultDeliverables) {
                phase.deliverables = p.defaultDeliverables.map(d => ({
                    id: generateId(),
                    name: d.name,
                    description: d.description || '',
                    status: 'pending',
                    responsible: null,
                    visibility: ['admin', 'member'],
                    documents: [],
                    notes: []
                }));
                delete phase.defaultDeliverables;
            }

            // Materialize default approvals if they exist (Templates)
            if (p.defaultApprovals) {
                phase.approvals = p.defaultApprovals.map(a => ({
                    id: generateId(),
                    type: a.type || 'client',
                    name: a.name,
                    status: 'pending',
                    submittedAt: null,
                    respondedAt: null,
                    respondedBy: null,
                    notes: ''
                }));
                delete phase.defaultApprovals;
            }

            return phase;
        });
}

function getProjectHealth(projectId) {
    const proj = getProject(projectId);
    if (!proj) return 'green';
    const openPendencias = (proj.pendencias || []).filter(p => p.status === 'open');
    if (openPendencias.length === 0) return 'green';
    const today = todayStr();
    const overdue = openPendencias.some(p => p.deadline && p.deadline < today);
    if (overdue) return 'red';
    return 'yellow';
}

function getPhaseProgress(phase) {
    if (!phase || !phase.deliverables || phase.deliverables.length === 0) return 0;
    const total = phase.deliverables.length;
    const done = phase.deliverables.filter(d => d.status === 'approved' || d.status === 'done').length;
    const inProgress = phase.deliverables.filter(d => d.status === 'in-progress' || d.status === 'in-review').length;
    return Math.round(((done + inProgress * 0.3) / total) * 100);
}

function isDeliverableFilled(deliverable) {
    const docs = (deliverable.documents || []).filter(d => (d.fileType || 'document') === 'document').length;
    return docs > 0 || deliverable.status === 'done' || deliverable.status === 'approved';
}

function refreshPhaseStatuses(projectId) {
    const proj = getProject(projectId);
    if (!proj) return;

    proj.phases.forEach(phase => {
        // Não tocar em fases done, active ou blocked
        if (phase.status === 'done' || phase.status === 'active' || phase.status === 'blocked') return;

        // Verificar se todas as dependências estão done
        const deps = phase.dependencies || [];
        if (deps.length === 0) {
            // Sem dependências e não está bloqueada: se está pending, fica ready
            if (phase.status === 'pending') {
                phase.status = 'ready';
            }
            return;
        }

        const allDepsDone = deps.every(depKey => {
            const dep = proj.phases.find(ph => ph.key === depKey);
            return dep && dep.status === 'done';
        });

        if (allDepsDone) {
            if (phase.status === 'pending') {
                phase.status = 'ready';
            }
        } else {
            if (phase.status === 'ready') {
                phase.status = 'pending';
            }
        }
    });
}

function getTotalHours(projectId) {
    const proj = getProject(projectId);
    if (!proj) return 0;
    return proj.timeLogs.reduce((sum, tl) => sum + tl.hours, 0);
}

function getPhaseHours(projectId, phaseKey) {
    const proj = getProject(projectId);
    if (!proj) return 0;
    return proj.timeLogs.filter(tl => tl.phase === phaseKey).reduce((sum, tl) => sum + tl.hours, 0);
}

function getBillableHours(projectId) {
    const proj = getProject(projectId);
    if (!proj) return { billable: 0, nonBillable: 0 };
    const billable = proj.timeLogs.filter(tl => tl.billable).reduce((sum, tl) => sum + tl.hours, 0);
    const nonBillable = proj.timeLogs.filter(tl => !tl.billable).reduce((sum, tl) => sum + tl.hours, 0);
    return { billable, nonBillable };
}

function getWeeklyHours() {
    const now = new Date();
    const weekStart = new Date(now);
    const day = now.getDay() || 7;
    weekStart.setDate(now.getDate() - day + 1); // Monday
    weekStart.setHours(0, 0, 0, 0);
    const weekStartStr = weekStart.toISOString().split('T')[0];

    let total = 0;
    PROJECTS.forEach(proj => {
        if (!proj.timeLogs) return;
        proj.timeLogs.forEach(tl => {
            if (tl.date >= weekStartStr) total += tl.hours;
        });
    });
    return total;
}

function getPreviousWeekHours() {
    const now = new Date();
    const weekStart = new Date(now);
    const day = now.getDay() || 7;
    weekStart.setDate(now.getDate() - day + 1); // Monday
    weekStart.setHours(0, 0, 0, 0);
    
    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevWeekEnd = new Date(weekStart);
    prevWeekEnd.setDate(prevWeekEnd.getDate() - 1);
    
    const startStr = prevWeekStart.toISOString().split('T')[0];
    const endStr = prevWeekEnd.toISOString().split('T')[0];

    let total = 0;
    PROJECTS.forEach(proj => {
        if (!proj.timeLogs) return;
        proj.timeLogs.forEach(tl => {
            if (tl.date >= startStr && tl.date <= endStr) total += tl.hours;
        });
    });
    return total;
}

function getMemberWeeklyHours(memberId) {
    const now = new Date();
    const weekStart = new Date(now);
    const day = now.getDay() || 7;
    weekStart.setDate(now.getDate() - day + 1);
    weekStart.setHours(0, 0, 0, 0);
    const weekStartStr = weekStart.toISOString().split('T')[0];

    let total = 0;
    PROJECTS.forEach(proj => {
        if (!proj.timeLogs) return;
        proj.timeLogs.forEach(tl => {
            if (tl.user === memberId && tl.date >= weekStartStr) total += tl.hours;
        });
    });
    return total;
}

function getMemberMonthlyHours(memberId) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    monthStart.setHours(0, 0, 0, 0);
    const monthStartStr = monthStart.toISOString().split('T')[0];

    let total = 0;
    PROJECTS.forEach(proj => {
        if (!proj.timeLogs) return;
        proj.timeLogs.forEach(tl => {
            if (tl.user === memberId && tl.date >= monthStartStr) total += tl.hours;
        });
    });
    return total;
}

function addHistoryEntry(projectId, action, detail, phaseKey) {
    const proj = getProject(projectId);
    if (!proj) return;
    proj.history.unshift({
        date: new Date().toISOString().split('T')[0],
        user: APP.currentUser.id,
        action: action,
        detail: detail,
        phase: phaseKey || null
    });
    if (proj.history.length > 200) {
        proj.history.pop();
    }
    persistAll();
}

function getProjectProgress(projectId) {
    const proj = getProject(projectId);
    if (!proj) return 0;
    const totalPhases = proj.phases.length;
    const completedPhases = proj.phases.filter(ph => ph.status === 'done').length;
    
    // Contar progresso da fase actual
    const currentPhase = proj.phases.find(ph => ph.status === 'active');
    let extra = 0;
    if (currentPhase) {
        extra = getPhaseProgress(currentPhase) / 100;
    }
    
    return Math.min(100, Math.round(((completedPhases + extra) / totalPhases) * 100));
}
