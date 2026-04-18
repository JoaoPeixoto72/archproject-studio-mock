// ============================================================================
// ArchProject — calendario.js
// Módulo de Calendário Global e Linha do Tempo (Gantt)
// ============================================================================

function renderCalendario() {
    const container = document.getElementById('pageContent');
    
    // Agregação de eventos
    const events = aggregateEvents();

    let html = `
        <div class="content-container">
            <div class="page-header" style="display:flex; justify-content:space-between; align-items:flex-end; padding-bottom:30px;">
                <div>
                    <h2 style="font-size:32px; font-weight:800; letter-spacing:-1.2px;">Calendário Geral</h2>
                    <p style="font-size:14px; color:#6b7280; font-weight:500;">Prazos, visitas e marcos de todos os projetos num único mapa.</p>
                </div>
                <div style="display:flex; gap:12px;">
                    <button class="btn btn-secondary" style="height:40px; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; background:#fff; border:1px solid #e5e3dd;" onclick="openSyncModal()">Sincronizar Telemóvel (iCal)</button>
                    <div style="background:#f3f4f6; padding:4px; display:flex; gap:4px; border-radius:0;">
                         <button onclick="changeCalView('month')" style="padding:6px 16px; border:none; background:${UI_STATE.calendar.view==='month'?'#fff':'transparent'}; color:${UI_STATE.calendar.view==='month'?'#111827':'#6b7280'}; font-weight:700; font-size:11px; cursor:pointer;">Mês</button>
                         <button onclick="changeCalView('timeline')" style="padding:6px 16px; border:none; background:${UI_STATE.calendar.view==='timeline'?'#fff':'transparent'}; color:${UI_STATE.calendar.view==='timeline'?'#111827':'#6b7280'}; font-weight:700; font-size:11px; cursor:pointer;">Linha do Tempo</button>
                    </div>
                </div>
            </div>

            <div class="page-body">
                ${UI_STATE.calendar.view === 'month' ? renderMonthView(events) : renderTimelineView(events)}
            </div>
        </div>
    `;
    container.innerHTML = html;
}

function changeCalView(view) {
    UI_STATE.calendar.view = view;
    renderCalendario();
}

function aggregateEvents() {
    const events = [];
    const today = todayStr();

    PROJECTS.forEach(proj => {
        // 1. Prazos de Fases
        proj.phases.forEach(ph => {
            const date = ph.deadline || ph.endDate;
            if (date) {
                events.push({
                    id: `phase_${proj.id}_${ph.key}`,
                    date: date,
                    type: 'phase',
                    title: `Entrega: ${ph.abbr} - ${proj.name}`,
                    projectId: proj.id,
                    tab: 'fases',
                    color: '#111827'
                });
            }
        });

        // 2. Visitas de Obra
        if (proj.visits) {
            proj.visits.forEach(v => {
                events.push({
                    id: `visit_${v.id}`,
                    date: v.date,
                    type: 'visit',
                    title: `Visita: ${proj.name}`,
                    projectId: proj.id,
                    tab: 'obra',
                    color: '#2563eb'
                });
            });
        }

        // 3. Pendências / Tarefas
        if (proj.pendencias) {
            proj.pendencias.forEach(p => {
                if (p.deadline && p.status === 'open') {
                    events.push({
                        id: `task_${p.id}`,
                        date: p.deadline,
                        type: 'task',
                        title: p.description,
                        sub: proj.name,
                        projectId: proj.id,
                        tab: 'pendencias',
                        color: p.priority === 'high' ? '#ef4444' : (p.priority === 'medium' ? '#f59e0b' : '#3b82f6')
                    });
                }
            });
        }
    });

    return events;
}

function renderMonthView(events) {
    const months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    const daysOfWeek = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
    
    // Lógica para primeiro dia e número de dias
    const firstDay = new Date(UI_STATE.calendar.year, UI_STATE.calendar.month, 1).getDay(); // 0 è domingo
    const daysInMonth = new Date(UI_STATE.calendar.year, UI_STATE.calendar.month + 1, 0).getDate();
    
    // Ajuste para começar na Segunda (ISO)
    const offset = firstDay === 0 ? 6 : firstDay - 1;

    let html = `
        <div style="background:#fff; border:1px solid #eee; overflow:hidden;">
            <!-- Navegação de Mês -->
            <div style="padding:20px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center;">
                <h3 style="font-size:18px; font-weight:800; margin:0;">${months[UI_STATE.calendar.month]} ${UI_STATE.calendar.year}</h3>
                <div style="display:flex; gap:8px;">
                    <button class="btn btn-secondary btn-sm" onclick="navCal(-1)">&lsaquo;</button>
                    <button class="btn btn-secondary btn-sm" onclick="UI_STATE.calendar.month=new Date().getMonth(); UI_STATE.calendar.year=new Date().getFullYear(); renderCalendario();">Hoje</button>
                    <button class="btn btn-secondary btn-sm" onclick="navCal(1)">&rsaquo;</button>
                </div>
            </div>

            <!-- Grelha -->
            <div style="display:grid; grid-template-columns:repeat(7, 1fr); background:#eee; gap:1px; border:1px solid #eee; padding:1px;">
                ${daysOfWeek.map(d => `<div style="background:#f9fafb; padding:12px; text-align:center; font-size:10px; font-weight:800; text-transform:uppercase; color:#9ca3af; letter-spacing:1px;">${d}</div>`).join('')}
                
                ${Array(offset).fill(0).map(() => `<div style="background:#fdfdfd; min-height:120px; padding:10px;"></div>`).join('')}
                
                ${Array(daysInMonth).fill(0).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${UI_STATE.calendar.year}-${(UI_STATE.calendar.month+1).toString().padStart(2,'0')}-${day.toString().padStart(2,'0')}`;
                    const dayEvents = events.filter(e => e.date === dateStr);
                    const isToday = todayStr() === dateStr;

                    return `
                        <div style="background:#fff; min-height:120px; padding:10px; border-top:1px solid #f3f3f3; position:relative;">
                            <span style="font-size:12px; font-weight:900; color:${isToday ? '#2563eb' : '#111827'}; ${isToday ? 'background:#eff6ff; width:24px; height:24px; display:flex; align-items:center; justify-content:center; border-radius:50%; margin-left:-4px; margin-top:-4px;' : ''}">${day}</span>
                            <div style="display:flex; flex-direction:column; gap:4px; margin-top:8px;">
                                ${dayEvents.map(e => `
                                    <div onclick="navigate('projecto',{id:'${e.projectId}', tab:'${e.tab}'})" style="padding:4px 6px; background:${e.color}; color:#fff; font-size:10px; font-weight:700; border-radius:1px; cursor:pointer; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; line-height:1.2;">
                                        ${e.title}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
                ${(() => {
                    const totalCells = offset + daysInMonth;
                    const remainder = totalCells % 7;
                    if (remainder === 0) return '';
                    const emptyEnd = 7 - remainder;
                    return Array(emptyEnd).fill(0).map(() =>
                        `<div style="background:#fdfdfd; min-height:120px; padding:10px;"></div>`
                    ).join('');
                })()}
            </div>
        </div>
    `;
    return html;
}

function renderTimelineView(events) {
    const activeProjects = PROJECTS.filter(p => p.status === 'active');
    const today = new Date();
    const monthsToShow = 5;
    
    // Gerar cabeçalho de meses (Hoje + 4 meses)
    const axisMonths = [];
    for(let i=0; i<=monthsToShow; i++) {
        const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
        axisMonths.push({
            name: d.toLocaleString('pt-PT', { month: 'short' }).toUpperCase(),
            year: d.getFullYear(),
            month: d.getMonth()
        });
    }

    const startOfTimeline = new Date(today.getFullYear(), today.getMonth(), 1).getTime();
    const endOfTimeline = new Date(today.getFullYear(), today.getMonth() + monthsToShow + 1, 0).getTime();
    const totalDuration = endOfTimeline - startOfTimeline;

    return `
        <div class="card" style="padding:40px; border-radius:0; background:#fff;">
            <div style="margin-bottom:40px; border-bottom:1px solid #f3f4f6; padding-bottom:20px;">
                <h3 style="font-size:16px; font-weight:800; margin:0; letter-spacing:0.5px; text-transform:uppercase;">Plano de Carga Arquitectura (6 Meses)</h3>
                <p style="font-size:13px; color:#6b7280; margin:4px 0 0;">Visualização horizontal de prazos e marcos de entrega.</p>
            </div>
            
            <div style="position:relative;">
                <!-- Eixo dos Meses -->
                <div style="display:flex; margin-left:180px; border-bottom:1px solid #eee; padding-bottom:10px; margin-bottom:20px;">
                    ${axisMonths.map(m => `<div style="flex:1; font-size:10px; font-weight:800; color:#9ca3af; text-align:center;">${m.name}</div>`).join('')}
                </div>

                <!-- Grelha de Fundo -->
                <div style="position:absolute; top:30px; left:180px; right:0; bottom:0; display:flex; pointer-events:none;">
                    ${axisMonths.map(() => `<div style="flex:1; border-right:1px solid #f9f9f9;"></div>`).join('')}
                </div>

                <div style="display:flex; flex-direction:column; gap:32px;">
                    ${activeProjects.map(proj => {
                        const phasesWithDates = (proj.phases || []).filter(ph => ph.deadline || ph.endDate);
                        const lastPhase = phasesWithDates.slice().sort((a,b) => (b.deadline || b.endDate).localeCompare(a.deadline || a.endDate))[0];
                        
                        const startDate = new Date(proj.createdAt || todayStr()).getTime();
                        const endDate = lastPhase ? new Date(lastPhase.deadline || lastPhase.endDate).getTime() : new Date(today.getFullYear(), today.getMonth() + 5, 1).getTime();
                        
                        const left = Math.max(0, Math.min(100, ((startDate - startOfTimeline) / totalDuration) * 100));
                        const width = Math.max(2, Math.min(100 - left, ((endDate - startDate) / totalDuration) * 100));

                        // Cores industriais via Design Tokens
                        const phaseColors = {
                            'pp': 'var(--phase-pp)',
                            'ep': 'var(--phase-ep)',
                            'ap': 'var(--phase-ap)',
                            'la': 'var(--phase-la)',
                            'le': 'var(--phase-le)',
                            'pe': 'var(--phase-pe)',
                            'at': 'var(--phase-at)',
                            'tf': 'var(--phase-tf)',
                            'def': '#9ca3af'
                        };

                        return `
                            <div style="display:flex; align-items:center; position:relative; cursor:pointer;" class="timeline-row" 
                                 onclick="if(event.target.tagName !== 'BUTTON') navigate('projecto', {id:'${proj.id}'})">
                                <div style="width:180px; padding-right:20px; flex-shrink:0;">
                                    <p style="font-size:13px; font-weight:800; margin:0; color:#111827; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${esc(proj.name)}</p>
                                    <p style="font-size:9px; color:#9ca3af; font-weight:800; text-transform:uppercase; margin-top:2px; letter-spacing:0.5px;">${proj.status} · ${proj.type || 'Projecto'}</p>
                                </div>
                                <div style="flex:1; height:14px; background:#f3f4f6; position:relative; border-radius:7px; overflow:visible;">
                                    <!-- Barra Progressiva do Projecto -->
                                    <div style="position:absolute; left:${left}%; width:${width}%; height:100%; background:linear-gradient(90deg, #f1f5f9 0%, #cbd5e1 100%); border:1px solid #e2e8f0; border-radius:7px; transition:all 0.2s;" class="project-bar"></div>
                                    
                                    <!-- Marcadores de Fases (Cromáticos) -->
                                    ${phasesWithDates.map(ph => {
                                        const date = ph.deadline || ph.endDate;
                                        const phTime = new Date(date).getTime();
                                        const phLeft = Math.max(0, Math.min(100, ((phTime - startOfTimeline) / totalDuration) * 100));
                                        
                                        const color = phaseColors[ph.abbr.toLowerCase()] || phaseColors['def'];
                                        const isOverdue = new Date(date) < today && ph.status !== 'done';

                                        return `
                                            <div style="position:absolute; left:${phLeft}%; top:50%; transform:translate(-50%, -50%); z-index:2; transition:transform 0.2s;" 
                                                 class="phase-marker"
                                                 title="${ph.name}: ${date}" 
                                                 onclick="event.stopPropagation(); navigate('projecto', {id:'${proj.id}', tab:'fases'})">
                                                <div style="width:16px; height:16px; background:#fff; border:3px solid ${isOverdue ? '#dc2626' : color}; border-radius:50%; box-shadow:0 2px 4px rgba(0,0,0,0.1); display:flex; align-items:center; justify-content:center;">
                                                    <div style="width:4px; height:4px; background:${isOverdue ? '#dc2626' : color}; border-radius:50%;"></div>
                                                </div>
                                                <div style="position:absolute; top:-18px; left:50%; transform:translateX(-50%); font-size:9px; font-weight:900; color:${isOverdue ? '#dc2626' : color}; white-space:nowrap; letter-spacing:0.3px;">
                                                    ${ph.abbr}
                                                </div>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <div style="display:flex; flex-wrap:wrap; gap:16px; margin-top:24px; padding-top:16px; border-top:1px solid #eee;">
                <div style="display:flex; align-items:center; gap:8px;"><div style="width:10px; height:10px; background:#38bdf8; border-radius:50%;"></div><span style="font-size:10px; font-weight:700; color:#4b5563;">PP (Preliminar)</span></div>
                <div style="display:flex; align-items:center; gap:8px;"><div style="width:10px; height:10px; background:#6366f1; border-radius:50%;"></div><span style="font-size:10px; font-weight:700; color:#4b5563;">EP (Base)</span></div>
                <div style="display:flex; align-items:center; gap:8px;"><div style="width:10px; height:10px; background:#a855f7; border-radius:50%;"></div><span style="font-size:10px; font-weight:700; color:#4b5563;">AP (Aprov.)</span></div>
                <div style="display:flex; align-items:center; gap:8px;"><div style="width:10px; height:10px; background:#f43f5e; border-radius:50%;"></div><span style="font-size:10px; font-weight:700; color:#4b5563;">LA (Camara)</span></div>
                <div style="display:flex; align-items:center; gap:8px;"><div style="width:10px; height:10px; background:#ec4899; border-radius:50%;"></div><span style="font-size:10px; font-weight:700; color:#4b5563;">LE (Exec.)</span></div>
                <div style="display:flex; align-items:center; gap:8px;"><div style="width:10px; height:10px; background:#f97316; border-radius:50%;"></div><span style="font-size:10px; font-weight:700; color:#4b5563;">PE (Escrit.)</span></div>
                <div style="display:flex; align-items:center; gap:8px;"><div style="width:10px; height:10px; background:#8b5cf6; border-radius:50%;"></div><span style="font-size:10px; font-weight:700; color:#4b5563;">AT (Obra)</span></div>
                <div style="display:flex; align-items:center; gap:8px;"><div style="width:10px; height:10px; background:#10b981; border-radius:50%;"></div><span style="font-size:10px; font-weight:700; color:#4b5563;">TF (Final)</span></div>
                <div style="display:flex; align-items:center; gap:8px;"><div style="border:2px solid #dc2626; width:10px; height:10px; border-radius:50%;"></div><span style="font-size:10px; font-weight:900; color:#dc2626;">ATRASADO</span></div>
            </div>
        </div>
    `;
}

function navCal(diff) {
    UI_STATE.calendar.month += diff;
    if (UI_STATE.calendar.month > 11) { UI_STATE.calendar.month = 0; UI_STATE.calendar.year++; }
    if (UI_STATE.calendar.month < 0) { UI_STATE.calendar.month = 11; UI_STATE.calendar.year--; }
    renderCalendario();
}

function openSyncModal() {
    const body = `
        <div style="text-align:center; padding:10px 0;">
            <div style="width:64px; height:64px; background:#eff6ff; color:#2563eb; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 20px;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </div>
            <h3 style="font-size:18px; font-weight:800; margin:0 0 12px;">Sincronizar com Telemóvel</h3>
            <p style="font-size:14px; color:#6b7280; line-height:1.6; margin-bottom:24px;">Copie o link abaixo para subscrever este calendário no seu iPhone, Android ou Google Calendar. Todos os prazos e visitas aparecerão automaticamente.</p>
            
            <div style="background:#f9fafb; border:1px solid #e5e3dd; padding:12px; font-family:monospace; font-size:12px; color:#111827; word-break:break-all; border-radius:4px; margin-bottom:24px;">
                https://app.archproject.pt/sync/ical/${APP.currentUser.id}_${Date.now()}.ics
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                <button class="btn btn-secondary" style="width:100%; height:44px; border-radius:0; font-size:11px; font-weight:800; text-transform:uppercase;" onclick="showToast('Link copiado!')">Copiar Link iCAL</button>
                <button class="btn btn-primary" style="width:100%; height:44px; border-radius:0; font-size:11px; font-weight:800; text-transform:uppercase;" onclick="showToast('A abrir aplicação de calendário...')">Abrir na App Nativa</button>
            </div>
        </div>
    `;
    openModal('Sincronização iCal', body, '');
}

