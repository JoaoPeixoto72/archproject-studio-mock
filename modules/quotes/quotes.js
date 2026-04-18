// ============================================================================
// Módulo de Orçamentação
// ============================================================================

function generateReference() {
    const year = new Date().getFullYear();
    // Conta todos os orçamentos incluindo os de data.js
    const existing = typeof QUOTES !== 'undefined' ? QUOTES.length : 0;
    const count = (QuotesModule._list.length || existing) + 1;
    return `ORC-${year}-${count.toString().padStart(3, '0')}`;
}

// addDays e getInitials definidos em core/helpers.js



const QuotesModule = {
    _list:         [],
    _active:       null,
    _step:         1,
    _filterStatus: '',
    _typeSelection: false,

    async init() {
        await this.load();
    },

    async load() {
        const saved = await DB.getAll('quotes');
        if (saved.length > 0) {
            this._list = saved;
        } else {
            this._list = typeof QUOTES !== 'undefined'
                ? JSON.parse(JSON.stringify(QUOTES))
                : [];
            await this.persist();
        }
    },

    async persist() {
        await DB.saveAll('quotes', this._list);
    },

    deleteQuoteRequest(quoteId) {
        const q = this._list.find(x => x.id === quoteId);
        if (!q) return;

        const body = `
            <div style="text-align:center; padding:10px 0;">
                <p style="font-size:15px; font-weight:700; margin-bottom:8px; color:#111827;">Apagar orçamento "${q.reference}"?</p>
                <p style="font-size:13px; color:#6b7280; line-height:1.5;">O registo de proposta e todos os dados associados serão removidos permanentemente.</p>
            </div>
        `;

        const footer = `
            <button class="btn btn-danger" style="width:100%; margin-bottom:8px;" onclick="QuotesModule.confirmDeleteQuote('${q.id}')">Apagar Orçamento</button>
            <button class="btn btn-secondary" style="width:100%;" onclick="closeModal()">Cancelar</button>
        `;

        openModal('Confirmar Remoção', body, footer);
    },

    confirmDeleteQuote(quoteId) {
        this._list = this._list.filter(q => q.id !== quoteId);
        this.persist();
        closeModal();
        showToast('Orçamento removido');
        this.render();
    },

    createBlank() {
        const now = new Date().toISOString();
        const id = 'QT-' + Date.now();

        return {
            id,
            reference: generateReference(),
            version: 1,
            status: 'draft',
            createdAt: now,
            updatedAt: now,
            sentAt: null,
            acceptedAt: null,
            rejectedAt: null,
            validUntil: addDays(now, 30),
            projectId: null,
            type: 'project', // 'project' | 'simple'
            items: [], // Usado apenas em type: 'simple'
            client: { name: '', email: '', phone: '', nif: '' },
            brief: {
                projectName: '',
                type: '', 
                subtype: '', 
                area: null,
                location: '', 
                quality: 'media',
                urgency: 'normal',
                complexity: 'normal',
                clientBudget: null,
                notes: ''
            },
            scope: {
                templateId: null,
                phases: [],
                deliverables: [],
                exclusions: [],
                assumptions: '',
                includedMeetings: 2,
                includedRevisions: 2,
                includedSiteVisits: 0
            },
            fees: {
                model: 'hourly',
                ratePerHour: 75,
                percentage: 8,
                constructionEstimate: null,
                constructionEstimateIsManual: false,
                internalRoles: [
                    { role: 'senior', label: 'Arq. Sénior', hours: 0, costRate: 35 },
                    { role: 'junior', label: 'Arq. Júnior', hours: 0, costRate: 22 },
                    { role: 'bim',    label: 'Desenho/BIM', hours: 0, costRate: 18 }
                ],
                paymentSchedule: [],
                summary: {
                    base: 0, optionals: 0, subtotal: 0, vatRate: 23, vat: 0,
                    total: 0, internalCost: 0, grossMargin: 0, grossMarginPct: 0
                }
            },
            proposal: {
                intro: 'Conforme solicitado, apresentamos a nossa proposta de honorários para a elaboração do projecto em epígrafe.',
                includeConstructionEstimate: false,
                validityDays: 30,
                legalNotes: 'Os valores apresentados não incluem taxas camarárias, taxas de apreciação por entidades externas, levantamento topográfico ou cópias impressas adicionais.'
            }
        };
    },

    initFromProject(projectId) {
        // Will be called from projects.js view. Handled globally via window.QuotesModule
        const project = typeof getProject === 'function' ? getProject(projectId) : PROJECTS.find(p => p.id === projectId);
        if (!project) return;
        
        const quote = this.createBlank();
        quote.projectId = project.id;
        quote.brief.projectName = project.name;
        quote.brief.location = project.location || '';
        
        // Mocking client extraction if client exists, usually project.client is ID in data.js, but let's be safe
        let clientObj = TEAM.clients.find(c => c.id === project.client || c.project === project.id);
        if (clientObj) {
            quote.client.name = clientObj.name || '';
            quote.client.email = clientObj.email || '';
        }

        if (project.phases?.length) {
            quote.scope.phases = project.phases.map(p => ({
                id: p.key,
                label: p.name,
                estimatedHours: 40, // default if não hoursAllocated
                fixedPrice: 0,
                included: true
            }));
        }

        this._active = quote;
        this._step = 1;
        this.persist();
        navigate('orcamentos');
    },

    render() {
        if (this._typeSelection) {
            this.renderTypeSelection();
        } else if (this._active) {
            if (this._active.type === 'simple') {
                this.renderSimpleQuoteEditor();
            } else {
                this.renderWizard();
            }
        } else {
            this.renderList();
        }
    },

    renderTypeSelection() {
        const container = document.getElementById('pageContent');
        container.innerHTML = `
            <div class="content-container">
                <div class="page-header">
                    <h2 style="font-size:32px; font-weight:800; letter-spacing:-1px;">Novo Orçamento</h2>
                    <p style="font-size:14px; color:#6b7280; font-weight:500;">Escolha o método de criação da proposta.</p>
                </div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:32px; padding:20px 0;">
                    <div class="card card-clickable" style="padding:40px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:20px;" onclick="QuotesModule.startNew('project')">
                        <div style="width:64px; height:64px; background:#eff6ff; color:#2563eb; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                        </div>
                        <div>
                            <h3 style="font-size:18px; font-weight:900; margin:0 0 8px;">Honorários de Projecto</h3>
                            <p style="font-size:13px; color:#6b7280; line-height:1.5;">Wizard completo com fases (Estudo Prévio, Licenciamento, etc.), cálculo por horas, % de obra ou taxas fixas.</p>
                        </div>
                        <button class="btn btn-primary" style="margin-top:auto;">Criar Orçamento de Projecto</button>
                    </div>
                    
                    <div class="card card-clickable" style="padding:40px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:20px;" onclick="QuotesModule.startNew('simple')">
                        <div style="width:64px; height:64px; background:#f0fdf4; color:#16a34a; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                        </div>
                        <div>
                            <h3 style="font-size:18px; font-weight:900; margin:0 0 8px;">Orçamento Simplificado</h3>
                            <p style="font-size:13px; color:#6b7280; line-height:1.5;">Introdução directa por linhas de serviço. Ideal para pequenas consultorias, levantamentos ou trabalhos avulsos.</p>
                        </div>
                        <button class="btn btn-secondary" style="margin-top:auto; background:#fff;">Criar Orçamento Simples</button>
                    </div>
                </div>
                <div style="margin-top:32px; text-align:center;">
                    <button class="btn btn-secondary" onclick="QuotesModule._typeSelection=false; QuotesModule._active=null; QuotesModule.render();">Voltar à lista</button>
                </div>
            </div>
        `;
    },

    startNew(type) {
        const q = this.createBlank();
        q.type = type;
        if (type === 'simple') {
            q.items = [{ description: '', amount: 0 }];
            q.fees.model = 'global';
        }
        this._active = q;
        this._step = 1;
        this._typeSelection = false;
        this.render();
    },

    renderSimpleQuoteEditor() {
        const q = this._active;
        const container = document.getElementById('pageContent');
        
        let itemsHtml = q.items.map((item, i) => `
            <div style="display:flex; gap:16px; margin-bottom:12px; align-items:flex-end;">
                <div style="flex:1;">
                    ${i === 0 ? '<label class="form-label">Descrição do Serviço / Item</label>' : ''}
                    <input type="text" class="form-input" style="background:#fff;" placeholder="Ex: Levantamento topográfico Moradia X" value="${esc(item.description)}" onchange="QuotesModule._active.items[${i}].description=this.value; QuotesModule.syncSimpleTotals();">
                </div>
                <div style="width:140px;">
                    ${i === 0 ? '<label class="form-label">Valor (€)</label>' : ''}
                    <input type="number" class="form-input" style="text-align:right; background:#fff;" value="${item.amount}" onchange="QuotesModule._active.items[${i}].amount=Number(this.value); QuotesModule.syncSimpleTotals();">
                </div>
                ${q.items.length > 1 ? `
                    <button onclick="QuotesModule._active.items.splice(${i},1); QuotesModule.syncSimpleTotals(); QuotesModule.render();" style="border:none; background:transparent; color:#ef4444; cursor:pointer; padding-bottom:10px;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                ` : '<div style="width:18px;"></div>'}
            </div>
        `).join('');

        container.innerHTML = `
            <div class="content-container">
                                <div class="page-header" style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <h2 style="font-size:32px; font-weight:800; letter-spacing:-1px;">Orçamento Simples</h2>
                        <p style="font-size:14px; color:#6b7280; font-weight:500;">Preenchimento rápido linha-a-linha.</p>
                    </div>
                    <div style="display:flex; gap:12px;">
                        <button class="btn btn-secondary" onclick="if(confirm('Descartar rascunho?')) { QuotesModule._active=null; QuotesModule.render(); }">Cancelar</button>
                        <button class="btn btn-primary" onclick="QuotesModule.finishSimple()">Gerar e Finalizar</button>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: 2fr 1fr; gap:40px;">
                    <section>
                         <div class="card" style="padding:32px; background:#fff;">
                             <div class="form-group" style="margin-bottom:32px;">
                                 <label class="form-label">Nome do Cliente</label>
                                 <input type="text" class="form-input" style="font-size:16px; font-weight:700;" placeholder="Nome ou Empresa" value="${esc(q.client.name)}" onchange="QuotesModule._active.client.name=this.value">
                             </div>
                             
                             <div style="margin-top:24px;">
                                 <h3 style="font-size:11px; font-weight:800; text-transform:uppercase; margin-bottom:20px; color:#9ca3af; letter-spacing:1px;">Linhas de Serviço</h3>
                                 ${itemsHtml}
                                 <button class="btn btn-secondary" style="margin-top:12px; width:100%; border-style:dashed; background:transparent;" onclick="QuotesModule._active.items.push({description:'', amount:0}); QuotesModule.render();">+ Adicionar Linha</button>
                             </div>
                         </div>
                    </section>
                    
                    <aside>
                        <div class="card" style="padding:32px; background:#f9fafb;">
                            <h3 style="font-size:14px; font-weight:800; margin-bottom:24px;">Resumo Financeiro</h3>
                            
                            <div style="display:flex; justify-content:space-between; margin-bottom:12px; font-size:14px;">
                                <span style="color:#6b7280;">Subtotal</span>
                                <span style="font-weight:700;">${formatCurrency(q.fees.summary.subtotal)}</span>
                            </div>
                            <div style="display:flex; justify-content:space-between; margin-bottom:24px; font-size:14px;">
                                <span style="color:#6b7280;">IVA (23%)</span>
                                <span style="font-weight:700;">${formatCurrency(q.fees.summary.vat)}</span>
                            </div>
                            
                            <div style="padding-top:20px; border-top:2px solid #e5e3dd; display:flex; justify-content:space-between; align-items:baseline;">
                                <span style="font-size:16px; font-weight:800;">TOTAL</span>
                                <span style="font-size:24px; font-weight:900; color:#111827;">${formatCurrency(q.fees.summary.total)}</span>
                            </div>
                            
                            <div style="margin-top:40px;">
                                <label class="form-label">Validade (dias)</label>
                                <input type="number" class="form-input" value="${q.proposal.validityDays}" onchange="QuotesModule._active.proposal.validityDays=this.value">
                            </div>
                            
                            <button class="btn btn-primary" style="margin-top:32px; width:100%; height:50px; font-size:14px;" onclick="QuotesModule.finishSimple()">Finalizar e imprimir PDF</button>
                        </div>
                    </aside>
                </div>
            </div>
        `;
    },

    syncSimpleTotals() {
        const q = this._active;
        const subtotal = q.items.reduce((sum, item) => sum + (item.amount || 0), 0);
        q.fees.summary.subtotal = subtotal;
        q.fees.summary.base = subtotal;
        q.fees.summary.vat = subtotal * (q.fees.summary.vatRate / 100);
        q.fees.summary.total = q.fees.summary.subtotal + q.fees.summary.vat;
        
        // Criar cronograma simples de 100% num item para compatibilidade de print
        q.fees.paymentSchedule = [{ trigger: 'Conforme execução/entrega', percentage: 100, amount: q.fees.summary.total }];
    },

    finishSimple() {
        const q = this._active;
        if (!q.client.name.trim()) return showToast('Nome do cliente é obrigatório', 'error');
        if (q.fees.summary.total <= 0) return showToast('O valor total deve ser superior a zero', 'error');
        
        q.status = 'sent';
        q.sentAt = new Date().toISOString();
        this._list.unshift(q);
        this.persist();
        showToast('Orçamento simples guardado!');
        printProposal(q);
        this._active = null;
        this.render();
    },

    renderList() {
        // Verifica expirados ao carregar
        const today = new Date().toISOString();
        this._list.forEach(q => {
            if (q.status === 'sent' && today > q.validUntil) {
                q.status = 'expired';
            }
        });
        this.persist();

        const STATUS_STYLE = {
            draft:    { bg:'#f3f4f6', color:'#4b5563',  label:'Rascunho'  },
            sent:     { bg:'#fef3c7', color:'#92400e',  label:'Enviado'   },
            accepted: { bg:'#ecfdf5', color:'#065f46',  label:'Aceite'    },
            rejected: { bg:'#fef2f2', color:'#991b1b',  label:'Rejeitado' },
            expired:  { bg:'#fff7ed', color:'#9a3412',  label:'Expirado'  }
        };

        const fmt = n => new Intl.NumberFormat('pt-PT',
            { style:'currency', currency:'EUR' }).format(n);

        const container = document.getElementById('pageContent');

        let metricsHtml = '';
        if (isFullMode()) {
            const list = QuotesModule._list || [];
            const byStatus = { draft: 0, sent: 0, accepted: 0, rejected: 0, expired: 0 };
            list.forEach(q => { if (byStatus[q.status] !== undefined) byStatus[q.status]++; });
            const convRate = (byStatus.accepted + byStatus.rejected) > 0
                ? Math.round(byStatus.accepted / (byStatus.accepted + byStatus.rejected) * 100)
                : null;
            const accepted = list.filter(q => q.status === 'accepted');
            const avgValue = accepted.length > 0
                ? accepted.reduce((s, q) => s + (q.fees?.summary?.total || 0), 0) / accepted.length
                : null;
            const withTimes = accepted.filter(q => q.sentAt && q.acceptedAt);
            const avgDays = withTimes.length > 0
                ? Math.round(withTimes.reduce((s, q) => s + daysBetween(q.sentAt, q.acceptedAt), 0) / withTimes.length)
                : null;

            metricsHtml = `<div style="display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:24px;">
                <div style="padding:16px; background:#f9fafb; border:1px solid #eee; text-align:center;">
                    <p style="font-size:10px; color:#9ca3af; margin:0 0 4px; text-transform:uppercase;">Taxa Conversão</p>
                    <p style="font-size:22px; font-weight:800; margin:0; color:#111827;">${convRate !== null ? convRate + '%' : '—'}</p>
                </div>
                <div style="padding:16px; background:#f9fafb; border:1px solid #eee; text-align:center;">
                    <p style="font-size:10px; color:#9ca3af; margin:0 0 4px; text-transform:uppercase;">Valor Médio Aceite</p>
                    <p style="font-size:22px; font-weight:800; margin:0; color:#111827;">${avgValue !== null ? formatCurrency(avgValue) : '—'}</p>
                </div>
                <div style="padding:16px; background:#f9fafb; border:1px solid #eee; text-align:center;">
                    <p style="font-size:10px; color:#9ca3af; margin:0 0 4px; text-transform:uppercase;">Tempo Médio (dias)</p>
                    <p style="font-size:22px; font-weight:800; margin:0; color:#111827;">${avgDays !== null ? avgDays + 'd' : '—'}</p>
                </div>
                <div style="padding:16px; background:#f9fafb; border:1px solid #eee; text-align:center;">
                    <p style="font-size:10px; color:#9ca3af; margin:0 0 4px; text-transform:uppercase;">Por Estado</p>
                    <p style="font-size:11px; font-weight:600; margin:0; color:#6b7280; line-height:1.8;">
                        ${byStatus.accepted} aceites · ${byStatus.rejected} rejeitados<br>
                        ${byStatus.sent} enviados · ${byStatus.draft} rascunhos
                    </p>
                </div>
            </div>`;
        }

        container.innerHTML = `
            <div class="content-container">
                <div class="page-header" style="
                    display:flex; justify-content:space-between;
                    align-items:flex-start;">
                    <div>
                        <h2>Orçamentos</h2>
                        <p style="color:#6b7280; font-size:14px; margin-top:4px;">
                            Ponto de entrada do atelier — cada projecto começa aqui.
                        </p>
                    </div>
                    <button class="btn btn-primary"
                            style="border-radius:0;"
                            onclick="QuotesModule._typeSelection=true; QuotesModule.render();">
                        + Novo Orçamento
                    </button>
                </div>

                <div class="page-body">
                    ${metricsHtml}
                    <!-- Filtros rápidos -->
                    <div style="display:flex; gap:8px; margin-bottom:24px; flex-wrap:wrap;">
                        ${['Todos','draft','sent','accepted','rejected','expired'].map((f,i) => `
                            <button
                                style="padding:6px 14px; border-radius:0; font-size:12px;
                                       font-weight:700; border:1px solid
                                       ${QuotesModule._filterStatus===(i===0?'':f)?'#1a1714':'#e5e7dd'};
                                       background:${QuotesModule._filterStatus===(i===0?'':f)?'#1a1714':'#fff'};
                                       color:${QuotesModule._filterStatus===(i===0?'':f)?'#fff':'#4b5563'};
                                       cursor:pointer;"
                                onclick="QuotesModule._filterStatus='${i===0?'':f}';
                                         QuotesModule.renderList()">
                                ${i===0?'Todos':STATUS_STYLE[f]?.label||f}
                            </button>
                        `).join('')}
                    </div>

                    ${(() => {
                        const list = QuotesModule._filterStatus
                            ? QuotesModule._list.filter(q => q.status === QuotesModule._filterStatus)
                            : QuotesModule._list;

                        if (!list.length) return `
                            <div style="text-align:center; padding:60px; color:#9ca3af;">
                                <p style="font-size:14px;">
                                    Nenhum orçamento encontrado.<br>
                                    Crie um nãovo para começar.
                                </p>
                            </div>`;

                        return `
                            <div class="card" style="padding:0; overflow:hidden;">
                                <table style="width:100%; border-collapse:collapse;
                                              font-size:13px;">
                                    <thead style="background:#f9fafb;
                                                  border-bottom:1px solid #e5e3dd;">
                                        <tr>
                                            <th style="padding:12px 24px; text-align:left;
                                                font-weight:700; color:#9ca3af;
                                                text-transform:uppercase; font-size:10px;">
                                                Referência
                                            </th>
                                            <th style="padding:12px 24px; text-align:left;
                                                font-weight:700; color:#9ca3af;
                                                text-transform:uppercase; font-size:10px;">
                                                Cliente / Projecto
                                            </th>
                                            <th style="padding:12px 24px; text-align:right;
                                                font-weight:700; color:#9ca3af;
                                                text-transform:uppercase; font-size:10px;">
                                                Total c/IVA
                                            </th>
                                            <th style="padding:12px 24px; text-align:left;
                                                font-weight:700; color:#9ca3af;
                                                text-transform:uppercase; font-size:10px;">
                                                Estado
                                            </th>
                                            <th style="padding:12px 24px; text-align:left;
                                                font-weight:700; color:#9ca3af;
                                                text-transform:uppercase; font-size:10px;">
                                                Validade
                                            </th>
                                            <th style="padding:12px 24px;"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${list.slice().reverse().map(q => {
                                            const st = STATUS_STYLE[q.status]
                                                || { bg:'#f3f4f6', color:'#4b5563',
                                                     label: q.status };
                                            const validDate = new Date(q.validUntil);
                                            const daysLeft  = Math.ceil(
                                                (validDate - new Date()) /
                                                (1000*3600*24));
                                            const validLabel = q.status === 'sent'
                                                ? (daysLeft > 0
                                                    ? `${daysLeft}d`
                                                    : 'Expirado')
                                                : '—';

                                            return `
                                            <tr style="border-bottom:1px solid #f4f3f0;
                                                       transition:background .15s;"
                                                onmouseenter="this.style.background='#fafaf8'"
                                                onmouseleave="this.style.background=''"
                                                onclick="QuotesModule.open('${q.id}')"
                                                style="cursor:pointer;">
                                                <td style="padding:16px 24px;">
                                                    <span style="font-weight:700;">
                                                        ${q.reference}
                                                    </span>
                                                    <span style="color:#9ca3af;
                                                                 font-size:11px;
                                                                 margin-left:4px;">
                                                        v${q.version}
                                                    </span>
                                                </td>
                                                <td style="padding:16px 24px;">
                                                    <div style="font-weight:600;
                                                                color:#1a1714;">
                                                        ${esc(q.client.name) || '—'}
                                                    </div>
                                                    <div style="font-size:11px;
                                                                color:#6b7280;">
                                                        ${esc(q.brief.projectName) || '—'}
                                                    </div>
                                                </td>
                                                <td style="padding:16px 24px;
                                                           text-align:right;
                                                           font-weight:700;
                                                           font-size:14px;">
                                                    ${fmt(q.fees.summary.total || 0)}
                                                </td>
                                                <td style="padding:16px 24px;">
                                                    <span style="
                                                        display:inline-block;
                                                        padding:3px 10px;
                                                        font-size:11px;
                                                        font-weight:700;
                                                        background:${st.bg};
                                                        color:${st.color};">
                                                        ${st.label}
                                                    </span>
                                                </td>
                                                <td style="padding:16px 24px;
                                                           font-size:12px;
                                                           color:${daysLeft < 6 && q.status==='sent'?'#dc2626':'#6b7280'};">
                                                    ${validLabel}
                                                </td>
                                                <td style="padding:16px 24px;
                                                           text-align:right;
                                                           white-space:nowrap;"
                                                    onclick="event.stopPropagation()">

                                                    <!-- Acções por estado -->
                                                    ${q.status === 'draft' ? `
                                                        <button class="btn btn-secondary btn-xs"
                                                            style="border-radius:0; margin-left:4px;"
                                                            onclick="QuotesModule.open('${q.id}')">
                                                            Editar
                                                        </button>
                                                        <button class="btn btn-secondary btn-xs"
                                                            style="border-radius:0; margin-left:4px;"
                                                            onclick="QuotesModule.printProposalById('${q.id}')">
                                                            PDF
                                                        </button>
                                                    ` : ''}

                                                    ${q.status === 'sent' ? `
                                                        <button class="btn btn-xs"
                                                            style="border-radius:0; margin-left:4px;
                                                                   background:#ecfdf5; color:#065f46;
                                                                   border:1px solid #a7f3d0;"
                                                            onclick="QuotesModule.markAccepted('${q.id}')">
                                                            Marcar Aceite
                                                        </button>
                                                        <button class="btn btn-secondary btn-xs"
                                                            style="border-radius:0; margin-left:4px;"
                                                            onclick="QuotesModule.printProposalById('${q.id}')">
                                                            PDF
                                                        </button>
                                                    ` : ''}

                                                    ${q.status === 'accepted' && !q.projectId ? `
                                                        <button class="btn btn-primary btn-xs"
                                                            style="border-radius:0; margin-left:4px;"
                                                            onclick="QuotesModule.convertToProject('${q.id}')">
                                                            Criar Projecto
                                                        </button>
                                                    ` : ''}

                                                    ${q.status === 'accepted' && q.projectId ? `
                                                        <button class="btn btn-secondary btn-xs"
                                                            style="border-radius:0; margin-left:4px;"
                                                            onclick="navigate('projecto',{id:'${q.projectId}'})">
                                                            Ver Projecto →
                                                        </button>
                                                    ` : ''}

                                                    ${q.status === 'expired' ? `
                                                        <button class="btn btn-secondary btn-xs"
                                                            style="border-radius:0; margin-left:4px;"
                                                            onclick="renewQuote('${q.id}')">
                                                            Renovar
                                                        </button>
                                                    ` : ''}

                                                    <button class="btn btn-secondary btn-xs"
                                                        style="border-radius:0; margin-left:4px;"
                                                        onclick="duplicateQuote('${q.id}')">
                                                        Dup.
                                                    </button>
                                                    <button class="btn btn-secondary btn-xs"
                                                        style="border-radius:0; margin-left:4px; color:#ef4444;"
                                                        onclick="QuotesModule.deleteQuoteRequest('${q.id}')">
                                                        Apagar
                                                    </button>
                                                </td>
                                            </tr>`;
                                        }).join('')}
                                    </tbody>
                                </table>
                            </div>`;
                    })()}
                </div>
            </div>`;
    },

    open(id) {
        const q = this._list.find(x => x.id === id);
        if (q) {
            this._active = q;
            this._step = 1;
            this.render();
        }
    },

    close() {
        if (this._active) {
            const isNew = !this._list.some(q => q.id === this._active.id);
            if (isNew && this._active.client.name.trim() !== '') {
                this._list.push(this._active);
            } else if (!isNew) {
                const idx = this._list.findIndex(q => q.id === this._active.id);
                if (idx !== -1) this._list[idx] = this._active;
            }
            this.persist();
        }
        this._active = null;
        this.renderList();
    },

    duplicate(id) {
        duplicateQuote(id);
    },

    printProposalById(id) {
        const q = this._list.find(x => x.id === id) || (this._active && this._active.id === id ? this._active : null);
        if (q) printProposal(q);
    },

    nextStep() {
        const errors = STEP_VALIDATION[this._step](this._active);
        if (errors.length > 0) {
            showToast('Erros: ' + errors.join('. '));
            return;
        }
        if (this._step < 4) {
            this._step++;
            recalculate(this._active);
            this.render();
        }
    },

    prevStep() {
        if (this._step > 1) {
            this._step--;
            this.render();
        } else {
            this._typeSelection = true;
            this._active = null;
            this.render();
        }
    },

    saveActive() {
        const isNew = !this._list.some(q => q.id === this._active.id);
        if (isNew) {
            this._list.push(this._active);
        } else {
            const idx = this._list.findIndex(q => q.id === this._active.id);
            if (idx !== -1) this._list[idx] = this._active;
        }
        this.persist();
        showToast('Orçamento guardado.');
    },

    applyTemplate(templateKey) {
        const tpl = QUOTE_TEMPLATES[templateKey];
        if (!tpl) return;
        this._active.scope.templateId = templateKey;
        this._active.scope.phases = tpl.phases.map(p => ({ ...p }));
        this._active.scope.exclusions = [...(tpl.exclusions || [])];
        this._active.scope.assumptions = (tpl.assumptions || []).join('\n');
        this._active.scope.deliverables = DELIVERABLES_LIBRARY.map(d => ({ ...d, included: false }));
        recalculate(this._active);
        this.render();
    },

    renderWizard() {
        const container = document.getElementById('pageContent');
        const q = this._active;

        let contentObj = '';
        if (this._step === 1) contentObj = this.getStep1Html(q);
        else if (this._step === 2) contentObj = this.getStep2Html(q);
        else if (this._step === 3) contentObj = this.getStep3Html(q);
        else if (this._step === 4) contentObj = this.getStep4Html(q);

        let html = `
            <div class="content-container" style="padding-top: 60px; padding-bottom: 60px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                    <div>
                        <h2 style="font-size:24px; font-weight:800; margin:0;">${q.reference} <span style="font-size:14px; color:#9ca3af; font-weight:500;">— Edição (Passo ${this._step} de 4)</span></h2>
                    </div>
                    <div>
                        <button class="btn btn-secondary"
                                style="border-radius:0; margin-right:8px;"
                                onclick="QuotesModule.close()">
                            ← Orçamentos
                        </button>
                        <button class="btn btn-secondary"
                                style="border-radius:0; margin-right:8px;"
                                onclick="QuotesModule.saveActive()">
                            Guardar
                        </button>
                        ${q.status === 'draft' ? `
                            <button class="btn btn-primary"
                                    style="border-radius:0;"
                                    onclick="QuotesModule.markAsSent('${q.id}')">
                                Marcar como Enviado
                            </button>
                        ` : ''}
                        ${q.status === 'sent' ? `
                            <button class="btn btn-xs"
                                    style="border-radius:0; padding:8px 16px;
                                           background:#ecfdf5; color:#065f46;
                                           border:1px solid #a7f3d0; font-weight:700;"
                                    onclick="QuotesModule.markAccepted('${q.id}')">
                                Marcar Aceite
                            </button>
                        ` : ''}
                        ${q.status === 'accepted' && !q.projectId ? `
                            <button class="btn btn-primary"
                                    style="border-radius:0;"
                                    onclick="QuotesModule.convertToProject('${q.id}')">
                                Criar Projecto →
                            </button>
                        ` : ''}
                        ${q.status === 'accepted' && q.projectId ? `
                            <button class="btn btn-secondary"
                                    style="border-radius:0;"
                                    onclick="navigate('projecto',{id:'${q.projectId}'})">
                                Ver Projecto →
                            </button>
                        ` : ''}
                    </div>
                </div>

                <div style="display:flex; gap:8px; margin-bottom:32px;">
                    <div style="flex:1; height:4px; background:${this._step >= 1 ? '#1a1714' : '#e5e7eb'};"></div>
                    <div style="flex:1; height:4px; background:${this._step >= 2 ? '#1a1714' : '#e5e7eb'};"></div>
                    <div style="flex:1; height:4px; background:${this._step >= 3 ? '#1a1714' : '#e5e7eb'};"></div>
                    <div style="flex:1; height:4px; background:${this._step >= 4 ? '#1a1714' : '#e5e7eb'};"></div>
                </div>

                <div style="background:#fff; border:1px solid #e5e3dd; padding:32px; min-height:500px;">
                    ${contentObj}
                </div>

                <div style="display:flex; justify-content:space-between; margin-top:24px;">
                    <button class="btn btn-secondary" style="border-radius:0;" onclick="QuotesModule.prevStep()">Anterior</button>
                    ${this._step < 4 
                        ? `<button class="btn btn-primary" style="border-radius:0;" onclick="QuotesModule.nextStep()">Próximo Passo</button>` 
                        : `<button class="btn btn-primary" style="border-radius:0;" onclick="QuotesModule.printProposalById('${q.id}')">Gerar PDF Proposal</button>`}
                </div>
            </div>
        `;
        container.innerHTML = html;
    },

    getStep1Html(q) {
        return `
            <div style="max-width:800px; margin:0 auto;">
                <h3 style="font-size:18px; font-weight:800; margin-bottom:24px;">1. Dados do Cliente e Briefing</h3>
                
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:32px;">
                    <div>
                        <label style="display:block; font-size:12px; font-weight:700; margin-bottom:8px;">Nome do Cliente *</label>
                        <input type="text" style="width:100%; border:1px solid #e5e3dd; padding:10px; border-radius:0;" value="${esc(q.client.name)}" onchange="QuotesModule._active.client.name = this.value">
                    </div>
                    <div>
                        <label style="display:block; font-size:12px; font-weight:700; margin-bottom:8px;">NIF</label>
                        <input type="text" style="width:100%; border:1px solid #e5e3dd; padding:10px; border-radius:0;" value="${q.client.nif || ''}" onchange="QuotesModule._active.client.nif = this.value">
                    </div>
                    <div>
                        <label style="display:block; font-size:12px; font-weight:700; margin-bottom:8px;">Email</label>
                        <input type="text" style="width:100%; border:1px solid #e5e3dd; padding:10px; border-radius:0;" value="${q.client.email || ''}" onchange="QuotesModule._active.client.email = this.value">
                    </div>
                    <div>
                        <label style="display:block; font-size:12px; font-weight:700; margin-bottom:8px;">Telefone</label>
                        <input type="text" style="width:100%; border:1px solid #e5e3dd; padding:10px; border-radius:0;" value="${q.client.phone || ''}" onchange="QuotesModule._active.client.phone = this.value">
                    </div>
                </div>

                <hr style="border:0; border-top:1px solid #eee; margin:32px 0;">

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
                    <div style="grid-column: span 2;">
                        <label style="display:block; font-size:12px; font-weight:700; margin-bottom:8px;">Nome do Projecto</label>
                        <input type="text" style="width:100%; border:1px solid #e5e3dd; padding:10px; border-radius:0;" value="${esc(q.brief.projectName)}" onchange="QuotesModule._active.brief.projectName = this.value">
                    </div>
                    <div>
                        <label style="display:block; font-size:12px; font-weight:700; margin-bottom:8px;">Tipo de Projecto *</label>
                        <select style="width:100%; border:1px solid #e5e3dd; padding:10px; border-radius:0;" onchange="QuotesModule._active.brief.type = this.value">
                            <option value="">Selecione...</option>
                            <option value="moradia" ${q.brief.type === 'moradia' ? 'selected' : ''}>Moradia</option>
                            <option value="reabilitacao" ${q.brief.type === 'reabilitacao' ? 'selected' : ''}>Reabilitação</option>
                            <option value="comercial" ${q.brief.type === 'comercial' ? 'selected' : ''}>Comercial</option>
                            <option value="interiores" ${q.brief.type === 'interiores' ? 'selected' : ''}>Interiores</option>
                        </select>
                    </div>
                    <div>
                        <label style="display:block; font-size:12px; font-weight:700; margin-bottom:8px;">Localização *</label>
                        <select style="width:100%; border:1px solid #e5e3dd; padding:10px; border-radius:0;" onchange="QuotesModule._active.brief.location = this.value">
                            <option value="">Selecione...</option>
                            <option value="porto" ${q.brief.location === 'porto' ? 'selected' : ''}>Grande Porto</option>
                            <option value="lisboa" ${q.brief.location === 'lisboa' ? 'selected' : ''}>Grande Lisboa</option>
                            <option value="algarve" ${q.brief.location === 'algarve' ? 'selected' : ''}>Algarve</option>
                            <option value="centro" ${q.brief.location === 'centro' ? 'selected' : ''}>Centro</option>
                            <option value="norte_interior" ${q.brief.location === 'norte_interior' ? 'selected' : ''}>Norte / Interior</option>
                        </select>
                    </div>
                    <div>
                        <label style="display:block; font-size:12px; font-weight:700; margin-bottom:8px;">Área (m2) *</label>
                        <input type="number" style="width:100%; border:1px solid #e5e3dd; padding:10px; border-radius:0;" value="${q.brief.area || ''}" onchange="QuotesModule._active.brief.area = Number(this.value)">
                    </div>
                    <div>
                        <label style="display:block; font-size:12px; font-weight:700; margin-bottom:8px;">Qualidade dos Acabamentos</label>
                        <select style="width:100%; border:1px solid #e5e3dd; padding:10px; border-radius:0;" onchange="QuotesModule._active.brief.quality = this.value">
                            <option value="baixa" ${q.brief.quality === 'baixa' ? 'selected' : ''}>Económica</option>
                            <option value="media" ${q.brief.quality === 'media' ? 'selected' : ''}>Média</option>
                            <option value="alta" ${q.brief.quality === 'alta' ? 'selected' : ''}>Alta</option>
                            <option value="luxo" ${q.brief.quality === 'luxo' ? 'selected' : ''}>Luxo</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    },

    getStep2Html(q) {
        return `
            <div style="max-width:900px; margin:0 auto;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                    <h3 style="font-size:18px; font-weight:800; margin:0;">2. Âmbito do Serviço (Fases e Entregáveis)</h3>
                    <div>
                        <select style="border:1px solid #1a1714; padding:6px 12px; border-radius:0; font-size:12px;" onchange="QuotesModule.applyTemplate(this.value); this.value='';">
                            <option value="">Aplicar Template...</option>
                            <option value="moradia">Moradia Unifamiliar</option>
                            <option value="reabilitacao">Reabilitação</option>
                            <option value="comercial">Comercial</option>
                            <option value="interiores">Interiores</option>
                        </select>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: 2fr 1fr; gap:40px;">
                    <div>
                        <!-- Fases -->
                        <h4 style="font-size:14px; font-weight:700; text-transform:uppercase; margin-bottom:16px;">Fases Incluídas</h4>
                        <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:32px;">
                            ${q.scope.phases.map((p, idx) => `
                                <div style="display:flex; align-items:center; gap:16px; padding:12px; background:#f9fafb; border:1px solid #e5e3dd;">
                                    <input type="checkbox" ${p.included ? 'checked' : ''} onchange="QuotesModule._active.scope.phases[${idx}].included = this.checked; recalculate(QuotesModule._active); QuotesModule.render();">
                                    <span style="flex:1; font-weight:600; font-size:14px;">${p.label}</span>
                                    <div style="display:flex; align-items:center; gap:8px;">
                                        <span style="font-size:11px; color:#6b7280;">Horas est.</span>
                                        <input type="number" style="width:60px; padding:4px; text-align:center; border:1px solid #ccc; border-radius:0;" value="${p.estimatedHours}" onchange="QuotesModule._active.scope.phases[${idx}].estimatedHours = Number(this.value); recalculate(QuotesModule._active); QuotesModule.render();">
                                    </div>
                                </div>
                            `).join('') || '<p style="font-size:12px; color:#6b7280;">Nenhuma fase adicionada. Aplique um template.</p>'}
                        </div>

                        <!-- Entregáveis Adicionais -->
                        <h4 style="font-size:14px; font-weight:700; text-transform:uppercase; margin-bottom:16px;">Entregáveis Opcionais / Adicionais</h4>
                        <div style="display:flex; flex-direction:column; gap:8px;">
                            ${q.scope.deliverables.map((d, idx) => `
                                <div style="display:flex; align-items:center; gap:16px; padding:12px; border:1px solid ${d.included ? '#1a1714' : '#e5e3dd'}; background:${d.included ? '#fff' : '#f9fafb'};">
                                    <input type="checkbox" ${d.included ? 'checked' : ''} onchange="QuotesModule._active.scope.deliverables[${idx}].included = this.checked; recalculate(QuotesModule._active); QuotesModule.render();">
                                    <span style="flex:1; font-size:13px; color:${d.included ? '#1a1714' : '#6b7280'};">${d.label}</span>
                                    ${d.included ? `
                                        <div style="display:flex; align-items:center; gap:8px;">
                                            <span style="font-size:11px; color:#6b7280;">Qtd</span>
                                            <input type="number" style="width:50px; padding:4px; text-align:center; border:1px solid #ccc; border-radius:0;" value="${d.qty}" onchange="QuotesModule._active.scope.deliverables[${idx}].qty = Number(this.value); recalculate(QuotesModule._active); QuotesModule.render();">
                                            <span style="font-size:11px; color:#6b7280;">€</span>
                                            <input type="number" style="width:70px; padding:4px; text-align:right; border:1px solid #ccc; border-radius:0;" value="${d.unitPrice}" onchange="QuotesModule._active.scope.deliverables[${idx}].unitPrice = Number(this.value); recalculate(QuotesModule._active); QuotesModule.render();">
                                        </div>
                                    ` : `
                                        <span style="font-size:12px; color:#9ca3af;">+ ${d.unitPrice}€ / unid.</span>
                                    `}
                                </div>
                            `).join('') || '<p style="font-size:12px; color:#6b7280;">Aplique um template para ver as opções.</p>'}
                        </div>
                    </div>

                    <div>
                        <!-- Textos legais baseados não template -->
                        <h4 style="font-size:14px; font-weight:700; text-transform:uppercase; margin-bottom:16px;">Exclusões</h4>
                        <textarea style="width:100%; border:1px solid #e5e3dd; padding:12px; font-size:12px; line-height:1.5; border-radius:0; min-height:120px; font-family:inherit; margin-bottom:24px;" 
                            onchange="QuotesModule._active.scope.exclusions = this.value.split('\\n').filter(Boolean)">${q.scope.exclusions.join('\n')}</textarea>

                        <h4 style="font-size:14px; font-weight:700; text-transform:uppercase; margin-bottom:16px;">Premissas</h4>
                        <textarea style="width:100%; border:1px solid #e5e3dd; padding:12px; font-size:12px; line-height:1.5; border-radius:0; min-height:120px; font-family:inherit;" 
                            onchange="QuotesModule._active.scope.assumptions = this.value">${q.scope.assumptions}</textarea>
                    </div>
                </div>
            </div>
        `;
    },

    getStep3Html(q) {
        const s = q.fees.summary;
        const fmt = (n) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(n);
        
        return `
            <div style="max-width:900px; margin:0 auto;">
                <h3 style="font-size:18px; font-weight:800; margin-bottom:24px;">3. Estrutura de Honorários Financeiros</h3>
                
                <div style="display:grid; grid-template-columns: 2fr 1.5fr; gap:40px;">
                    <div>
                        <!-- Configurador de Honorários -->
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-bottom:24px; padding:20px; background:#f9fafb; border:1px solid #e5e3dd;">
                            <div>
                                <label style="display:block; font-size:11px; font-weight:800; text-transform:uppercase; margin-bottom:8px;">Modelo de Cálculo</label>
                                <select style="width:100%; padding:8px; border:1px solid #ccc; border-radius:0;" onchange="QuotesModule._active.fees.model = this.value; recalculate(QuotesModule._active); QuotesModule.render();">
                                    <option value="fixed" ${q.fees.model === 'fixed' ? 'selected' : ''}>Preço Fixo por Fase</option>
                                    <option value="hourly" ${q.fees.model === 'hourly' ? 'selected' : ''}>Taxa Horária Média (€/h)</option>
                                    <option value="percentage" ${q.fees.model === 'percentage' ? 'selected' : ''}>% Custo Estimado</option>
                                    <option value="global" ${q.fees.model === 'global' ? 'selected' : ''}>Valor Global / Serviço Único</option>
                                </select>
                            </div>
                            <div>
                                ${q.fees.model === 'hourly' ? `
                                    <label style="display:block; font-size:11px; font-weight:800; text-transform:uppercase; margin-bottom:8px;">Taxa Média (€/h)</label>
                                    <input type="number" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:0; text-align:right;" value="${q.fees.ratePerHour}" onchange="QuotesModule._active.fees.ratePerHour = Number(this.value); recalculate(QuotesModule._active); QuotesModule.render();">
                                ` : q.fees.model === 'percentage' ? `
                                    <label style="display:block; font-size:11px; font-weight:800; text-transform:uppercase; margin-bottom:8px;">Percentagem (%)</label>
                                    <input type="number" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:0; text-align:right;" value="${q.fees.percentage}" onchange="QuotesModule._active.fees.percentage = Number(this.value); recalculate(QuotesModule._active); QuotesModule.render();">
                                ` : q.fees.model === 'global' ? `
                                    <label style="display:block; font-size:11px; font-weight:800; text-transform:uppercase; margin-bottom:8px;">Valor do Serviço (€)</label>
                                    <input type="number" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:0; text-align:right;" value="${q.fees.globalPrice || 0}" placeholder="0.00" onchange="QuotesModule._active.fees.globalPrice = Number(this.value); recalculate(QuotesModule._active); QuotesModule.render();">
                                ` : ''}
                            </div>
                        </div>

                        ${(q.fees.model === 'percentage' || q.proposal.includeConstructionEstimate) && q.fees.model !== 'global' ? `
                            <div style="margin-bottom:24px; padding:20px; background:#fff; border:1px solid #e5e3dd;">
                                <label style="display:block; font-size:11px; font-weight:800; text-transform:uppercase; margin-bottom:8px;">Estimativa de Custo de Construção (€)</label>
                                <div style="display:flex; gap:12px;">
                                    <input type="number" style="flex:1; padding:8px; border:1px solid #ccc; border-radius:0; text-align:right;" value="${q.fees.constructionEstimate || estimateConstructionCost(q.brief)}" onchange="QuotesModule._active.fees.constructionEstimate = Number(this.value); QuotesModule._active.fees.constructionEstimateIsManual = true; recalculate(QuotesModule._active); QuotesModule.render();">
                                    <button class="btn btn-secondary btn-sm" style="border-radius:0;" onclick="QuotesModule._active.fees.constructionEstimate = estimateConstructionCost(QuotesModule._active.brief); QuotesModule._active.fees.constructionEstimateIsManual = false; recalculate(QuotesModule._active); QuotesModule.render();">Recalcular (Benchmarks)</button>
                                </div>
                            </div>
                        ` : ''}

                        <!-- Cronograma Pagamentos -->
                        <h4 style="font-size:14px; font-weight:700; text-transform:uppercase; margin-bottom:16px;">Cronograma de Pagamentos</h4>
                        <table style="width:100%; border-collapse:collapse; margin-bottom:12px; font-size:12px;">
                            <thead>
                                <tr style="background:#f9fafb; border-bottom:1px solid #ccc;">
                                    <th style="padding:8px; text-align:left;">Marco de Facturação</th>
                                    <th style="padding:8px; text-align:right; width:60px;">%</th>
                                    <th style="padding:8px; text-align:right; width:100px;">Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${q.fees.paymentSchedule.map((ps, idx) => `
                                    <tr style="border-bottom:1px solid #eee;">
                                        <td style="padding:8px;">
                                            <input type="text" style="width:100%; border:none; background:transparent; font-size:12px;" value="${ps.trigger}" onchange="QuotesModule._active.fees.paymentSchedule[${idx}].trigger=this.value">
                                        </td>
                                        <td style="padding:8px; text-align:right;">
                                            <input type="number" style="width:50px; border:none; background:transparent; text-align:right; font-size:12px;" value="${ps.percentage}" onchange="QuotesModule._active.fees.paymentSchedule[${idx}].percentage=Number(this.value); QuotesModule._active.fees.paymentSchedule[${idx}].amount=QuotesModule._active.fees.summary.total*(Number(this.value)/100);">
                                        </td>
                                        <td style="padding:8px; text-align:right; font-weight:600;">${fmt(ps.amount)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    <div>
                        <!-- Sumário e Margem -->
                        <div style="background:#1a1714; color:#fff; padding:32px; border-radius:0; box-shadow:0 10px 25px rgba(0,0,0,0.1);">
                            <h4 style="font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:1px; margin:0 0 24px; color:#9ca3af;">Resumo Financeiro</h4>
                            <div style="display:flex; justify-content:space-between; margin-bottom:12px; font-size:14px;">
                                <span>Honorários Base</span>
                                <span>${fmt(s.base)}</span>
                            </div>
                            <div style="display:flex; justify-content:space-between; margin-bottom:12px; font-size:14px;">
                                <span>Opcionais</span>
                                <span>${fmt(s.optionals)}</span>
                            </div>
                            <div style="height:1px; background:#333; margin:16px 0;"></div>
                            <div style="display:flex; justify-content:space-between; margin-bottom:16px; font-size:14px;">
                                <span>Subtotal s/ IVA</span>
                                <span style="font-weight:700;">${fmt(s.subtotal)}</span>
                            </div>
                            <div style="display:flex; justify-content:space-between; margin-bottom:16px; font-size:14px;">
                                <span>IVA (23%)</span>
                                <span>${fmt(s.vat)}</span>
                            </div>
                            <div style="display:flex; justify-content:space-between; font-size:20px; font-weight:800; color:#fbbf24; margin-top:24px; padding-top:24px; border-top:1px solid #333;">
                                <span>Total Global</span>
                                <span>${fmt(s.total)}</span>
                            </div>
                        </div>

                        <!-- Rentabilidade projectada (Visível só para Admin) -->
                        <div style="margin-top:24px; padding:20px; border:1px solid #e5e3dd; background:#f9fafb;">
                            <h4 style="font-size:11px; font-weight:800; text-transform:uppercase; color:#1a1714; margin:0 0 16px;">Análise de Margem Interna</h4>
                            <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:12px;">
                                <span color="#6b7280">Custo Ref. Internão</span>
                                <span style="font-weight:600;">${fmt(s.internalCost)}</span>
                            </div>
                            <div style="display:flex; justify-content:space-between; font-size:12px;">
                                <span color="#6b7280">Lucro Bruto Projetado</span>
                                <span style="font-weight:800; color:${s.grossMarginPct > 30 ? '#059669' : '#d97706'};">${s.grossMarginPct}% (${fmt(s.grossMargin)})</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    getStep4Html(q) {
        return `
            <div style="max-width:800px; margin:0 auto;">
                <h3 style="font-size:18px; font-weight:800; margin-bottom:24px;">4. Finalizar e Rever Proposta</h3>
                
                <div style="margin-bottom:24px;">
                    <label style="display:block; font-size:11px; font-weight:800; text-transform:uppercase; margin-bottom:8px;">Texto Introdutório</label>
                    <textarea style="width:100%; border:1px solid #e5e3dd; padding:12px; font-size:13px; line-height:1.6; border-radius:0; min-height:100px; font-family:inherit;" 
                        onchange="QuotesModule._active.proposal.intro = this.value">${q.proposal.intro}</textarea>
                </div>

                <div style="margin-bottom:24px;">
                    <label style="display:block; font-size:11px; font-weight:800; text-transform:uppercase; margin-bottom:8px;">Notas Finais</label>
                    <textarea style="width:100%; border:1px solid #e5e3dd; padding:12px; font-size:13px; line-height:1.6; border-radius:0; min-height:80px; font-family:inherit;" 
                        onchange="QuotesModule._active.proposal.legalNotes = this.value">${q.proposal.legalNotes}</textarea>
                </div>

                <div style="display:flex; gap:40px;">
                    <div>
                        <label style="display:block; font-size:11px; font-weight:800; text-transform:uppercase; margin-bottom:8px;">Validade (Dias)</label>
                        <input type="number" style="width:100px; padding:10px; border:1px solid #e5e3dd; border-radius:0;" value="${q.proposal.validityDays}" onchange="QuotesModule._active.proposal.validityDays = Number(this.value)">
                    </div>
                    <div style="padding-top:24px;">
                        <label style="display:flex; align-items:center; gap:8px; font-size:13px; font-weight:600;">
                            <input type="checkbox" ${q.proposal.includeConstructionEstimate ? 'checked' : ''} onchange="QuotesModule._active.proposal.includeConstructionEstimate = this.checked">
                            Mostrar linha formativa de estimativa de custo de obra não PDF
                        </label>
                    </div>
                </div>

                <div style="margin-top:48px; padding:24px; background:#ecfdf5; border:1px solid #a7f3d0;">
                    <h4 style="font-size:14px; font-weight:800; color:#065f46; margin:0 0 8px;">Tudo Pronto</h4>
                    <p style="font-size:13px; color:#047857; margin:0 0 16px;">Guarde o orçamento ou clique abaixo para assinalar que foi enviado ao cliente.</p>
                    <button class="btn" style="background:#059669; color:white; font-weight:bold; border-radius:0; padding:10px 20px; border:none;" onclick="QuotesModule.markAsSent('${q.id}')">Marcar como "Enviado ao Cliente"</button>
                </div>
            </div>
        `;
    },

    markAsSent(id) {
        if(this._active && this._active.id === id) {
            this._active.status = 'sent';
            this._active.sentAt = new Date().toISOString();
            this.saveActive();
            this.close();
        }
    },

    markAccepted(id) {
        const q = this._list.find(x => x.id === id);
        if (!q) return;
        q.status    = 'accepted';
        q.acceptedAt = new Date().toISOString();
        this.persist();
        showToast('Orçamento marcado como aceite.');

        if (!q.projectId) {
            openModal(
                'Orçamento Aceite',
                `<p style="font-size:14px; line-height:1.6;">
                    O orçamento <strong>${q.reference}</strong> foi aceite.<br>
                    Pretende criar o projecto agora?
                 </p>`,
                `<button class="btn btn-primary" style="border-radius:0;"
                    onclick="closeModal(); QuotesModule.convertToProject('${id}')">
                    Criar Projecto
                 </button>
                 <button class="btn btn-secondary" style="border-radius:0;"
                    onclick="closeModal(); QuotesModule.renderList()">
                    Fazer Mais Tarde
                 </button>`
            );
        } else {
            this.renderList();
        }
    },

    convertToProject(quoteId) {
        const q = this._list.find(x => x.id === quoteId);
        if (!q) return;

        const projId = 'PRJ-' + Date.now();
        const phases = buildPhasesFromSource(q.scope.phases, { fromQuote: true });

        const clientMatch = TEAM.clients.find(c =>
            c.name.toLowerCase() === q.client.name.toLowerCase() ||
            c.email === q.client.email
        );

        const projectData = {
            id:              projId,
            name:            q.brief.projectName || q.client.name,
            client:          clientMatch ? clientMatch.id : null,
            location:        q.brief.location || '',
            typology:        q.brief.type || '',
            area:            q.brief.area ? Number(q.brief.area) : 0,
            budget:          q.fees.summary.total || 0,
            budgetSpent:     0,
            status:          'active',
            currentPhaseKey: phases.length > 0 ? phases[0].key : null,
            templateUsed:    null,

            // Liga orçamento ao projecto
            quoteId:         q.id,
            origin:          'quote',
            contractValue:   q.fees.summary.total,
            budgetedHours:   q.scope.phases
                .filter(p => p.included)
                .reduce((s, p) => s + p.estimatedHours, 0),
            paymentSchedule: q.fees.paymentSchedule,

            team: {
                members:  [APP.currentUser.id],
                externals: [],
                clients:  clientMatch ? [clientMatch.id] : []
            },
            phases:      phases,
            visits:      [],
            timeLogs:    [],
            pendencias:  [],
            historyDetail: `A partir do orçamento ${q.reference}`
        };

        createNewProject(projectData);

        q.projectId = projId;
        this.persist();
        
        updateBadges();
        closeModal();
        showToast(`Projecto "${projectData.name}" criado com sucesso.`);
        navigate('projecto', { id: projId });
    }
};

// ============================================================================
// MOTOR DE CÁLCULO
// ============================================================================

function recalculate(quote) {
    const base = calcBase(quote);
    const optionals = quote.scope.deliverables
        .filter(d => d.included)
        .reduce((sum, d) => sum + ((d.qty || 1) * (d.unitPrice || 0)), 0);

    const subtotal = base + optionals;
    const vatRate = quote.fees.summary.vatRate ?? 23;
    const vat = subtotal * (vatRate / 100);
    const total = subtotal + vat;

    // Calcular horas totais para Internal Cost
    const totalHours = quote.scope.phases.filter(p => p.included).reduce((s, p) => s + (p.estimatedHours || 0), 0);
    // Simplificacao do mockup: assumir distribuição padrao do internalRoles (50% senior, 30% junior, 20% bim)
    if(quote.fees.internalRoles[0] && totalHours > 0) {
        quote.fees.internalRoles[0].hours = totalHours * 0.5;
        quote.fees.internalRoles[1].hours = totalHours * 0.3;
        quote.fees.internalRoles[2].hours = totalHours * 0.2;
    }

    const internalCost = quote.fees.internalRoles.reduce((sum, r) => sum + ((r.hours || 0) * (r.costRate || 0)), 0);
    const grossMargin = subtotal - internalCost;
    const grossMarginPct = subtotal > 0 ? Math.round((grossMargin / subtotal) * 100) : 0;

    quote.fees.summary = { base, optionals, subtotal, vatRate, vat, total, internalCost, grossMargin, grossMarginPct };
    
    // So regenera se a tabela estiver vazia, para nao apagar ediçoes manuais (A menãos que total altere muito)
    quote.fees.paymentSchedule = buildPaymentSchedule(quote.scope.phases.filter(p => p.included), total);

    quote.updatedAt = new Date().toISOString();
    return quote;
}

function calcBase(quote) {
    const phases = quote.scope.phases.filter(p => p.included);
    switch (quote.fees.model) {
        case 'fixed':
            return phases.reduce((s, p) => s + (Number(p.fixedPrice) || 0), 0);
        case 'hourly': {
            const hours = phases.reduce((s, p) => s + (Number(p.estimatedHours) || 0), 0);
            return hours * (Number(quote.fees.ratePerHour) || 0);
        }
        case 'percentage': {
            const constructionBase = Number(quote.fees.constructionEstimate) || estimateConstructionCost(quote.brief);
            return constructionBase * ((Number(quote.fees.percentage) || 0) / 100);
        }
        case 'global':
            return Number(quote.fees.globalPrice) || 0;
        default: return 0;
    }
}

function estimateConstructionCost(brief) {
    if (!brief.area || !brief.location || !brief.quality) return 0;
    const benchmarks = PRICE_BENCHMARKS[brief.location]?.[brief.quality] ?? 1550;
    let cost = brief.area * benchmarks;
    if (brief.area > 400) cost *= 0.92;
    if (brief.urgency === 'alta') cost *= 1.08;
    if (brief.subtype === 'reabilitacao_parcial') cost *= 0.85;
    return Math.round(cost);
}

function buildPaymentSchedule(activePhases, total) {
    if (!activePhases.length) return [];
    if (activePhases.length === 1) {
        return [
            { trigger: 'Adjudicação', percentage: 50, amount: total * 0.5 },
            { trigger: `Entrega ${activePhases[0].label}`, percentage: 50, amount: total * 0.5 }
        ];
    }
    const lastPhase = activePhases[activePhases.length - 1];
    const middlePhases = activePhases.slice(1, -1);
    const middlePct = middlePhases.length > 0 ? Math.floor(50 / middlePhases.length) : 0;
    
    const schedule = [{ trigger: 'Adjudicação', percentage: 30, amount: Math.round(total * 0.30) }];
    
    middlePhases.forEach(p => {
        schedule.push({ trigger: `Entrega ${p.label}`, percentage: middlePct, amount: Math.round(total * middlePct / 100) });
    });
    
    const usedPct = 30 + (middlePct * middlePhases.length);
    const finalPct = 100 - usedPct;
    schedule.push({ trigger: `Entrega ${lastPhase.label}`, percentage: finalPct, amount: Math.round(total * finalPct / 100) });
    
    return schedule;
}

const STEP_VALIDATION = {
    1: (q) => {
        const errors = [];
        if (!q.client.name.trim()) errors.push('Nome do cliente obrigatório');
        if (!q.brief.type) errors.push('Tipo de projecto obrigatório');
        if (!q.brief.area || q.brief.area <= 0) errors.push('Área deve ser maior que zero');
        if (!q.brief.location) errors.push('Localização obrigatória');
        return errors;
    },
    2: (q) => {
        const errors = [];
        const activeFases = q.scope.phases.filter(p => p.included);
        if (!activeFases.length) errors.push('Selecciona pelo menãos uma fase');
        return errors;
    },
    3: (q) => {
        const errors = [];
        if (q.fees.summary.total <= 0) errors.push('Total de honorários não pode ser zero');
        const MathSum = Math.round(q.fees.paymentSchedule.reduce((s, p) => s + p.percentage, 0));
        if (Math.abs(MathSum - 100) > 1) errors.push('Cronograma de pagamentos deve somar 100%');
        return errors;
    },
    4: (_q) => []
};

// ============================================================================
// ACÇÕES GLOBAIS
// ============================================================================

function renewQuote(quoteId) {
    const original = QuotesModule._list.find(q => q.id === quoteId);
    if(!original) return;
    const renewed = JSON.parse(JSON.stringify(original));
    renewed.id = 'QT-' + Date.now();
    renewed.reference = generateReference();
    renewed.version = original.version + 1;
    renewed.status = 'draft';
    renewed.createdAt = new Date().toISOString();
    renewed.updatedAt = new Date().toISOString();
    renewed.sentAt = null;
    renewed.acceptedAt = null;
    renewed.validUntil = addDays(new Date().toISOString(), 30);
    
    QuotesModule._list.push(renewed);
    QuotesModule.persist();
    QuotesModule.open(renewed.id);
    QuotesModule._step = 3;
    QuotesModule.render();
}

function duplicateQuote(quoteId) {
    const original = QuotesModule._list.find(q => q.id === quoteId);
    if(!original) return;
    const copy = JSON.parse(JSON.stringify(original));
    copy.id = 'QT-' + Date.now();
    copy.reference = generateReference();
    copy.version = 1;
    copy.status = 'draft';
    copy.createdAt = new Date().toISOString();
    copy.updatedAt = new Date().toISOString();
    copy.sentAt = null;
    copy.acceptedAt = null;
    copy.rejectedAt = null;
    copy.validUntil = addDays(new Date().toISOString(), 30);
    
    copy.client = { name: '', email: '', phone: '', nif: '' };
    copy.projectId = null;
    
    QuotesModule._list.push(copy);
    QuotesModule.persist();
    QuotesModule._active = copy;
    QuotesModule._step = 1;
    QuotesModule.render();
}

function onQuoteAccepted(quote) {
    if (quote.projectId && typeof ProjectsModule !== 'undefined') {
        const project = ProjectsModule.getById(quote.projectId);
        if(project) {
            project.budgetedHours = quote.scope.phases.filter(p => p.included).reduce((s, p) => s + p.estimatedHours, 0);
            project.contractValue = quote.fees.summary.total;
            project.paymentSchedule = quote.fees.paymentSchedule;
            ProjectsModule.update(project);
        }
    } else {
        // No project module implemented fully with this signature in our monolithic prototype 
        // We will mock this logic contextually if needed
        showToast('Orçamento aceite e métricas aplicadas ao projecto associado.', 'success');
    }
}

// ============================================================================
// PDF HTML GENERATION
// ============================================================================

function printProposal(quote) {
    const html = buildProposalHTML(quote);
    const win = window.open('', '_blank');
    win.document.write(`
        <!DOCTYPE html>
        <html lang="pt">
        <head>
            <meta charset="UTF-8">
            <title>Proposta ${quote.reference}</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">
            <style>
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: 'Inter', sans-serif; color: #1a1a1a; background: white; font-size: 11pt; line-height: 1.6; }
                h1, h2 { font-family: 'Playfair Display', serif; }
                h1 { font-size: 28pt; font-weight: 400; margin-bottom: 8pt; }
                h2 { font-size: 14pt; font-weight: 400; margin: 24pt 0 8pt; padding-bottom: 4pt; border-bottom: 1px solid #c8b89a; }
                h3 { font-size: 10pt; font-weight: 600; margin: 16pt 0 4pt; text-transform: uppercase; letter-spacing: 0.05em; }
                .page { max-width: 170mm; margin: 0 auto; padding: 20mm; }
                .cover { min-height: 80mm; display: flex; flex-direction: column; justify-content: flex-end; margin-bottom: 32pt; }
                .section { margin-bottom: 20pt; }
                .meta { color: #666; font-size: 9pt; margin-top: 4pt; }
                table { width: 100%; border-collapse: collapse; margin-top: 8pt; }
                th { font-size: 9pt; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; text-align: left; padding: 6pt 8pt; background: #f5f0e8; border-bottom: 1px solid #c8b89a; }
                td { padding: 6pt 8pt; border-bottom: 1px solid #ece8df; font-size: 10pt; }
                .total-row td { font-weight: 600; border-top: 2px solid #1a1a1a; border-bottom: none; }
                .scope-item { padding: 3pt 0; border-bottom: 1px solid #ece8df; }
                .exclusion { color: #666; font-size: 9pt; padding: 2pt 0; }
                .exclusion::before { content: '× '; }
                .assumption { color: #555; font-size: 9pt; padding: 2pt 0; }
                .assumption::before { content: '• '; }
                .construction-note { background: #f5f0e8; padding: 12pt; margin-top: 12pt; }
                .construction-note p { font-size: 9pt; color: #555; margin-top: 4pt; }
                .acceptance { margin-top: 40pt; padding-top: 20pt; border-top: 1px solid #c8b89a; }
                .sig-line { margin-top: 24pt; display: flex; justify-content: space-between; }
                .sig-block { width: 45%; }
                .sig-block .line { border-bottom: 1px solid #1a1a1a; height: 24pt; margin-top: 4pt; }
                .sig-block label { font-size: 9pt; color: #666; }
                .pdf-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40pt; }
                .office-logo { max-height: 60px; max-width: 200px; object-fit: contain; }
                .office-details { text-align: right; font-size: 9pt; color: #666; line-height: 1.4; }
                @media print {
                    @page { margin: 15mm; size: A4 portrait; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    h2 { break-after: avoid; }
                    table { break-inside: avoid; }
                    .acceptance { break-before: avoid; }
                }
            </style>
        </head>
        <body>
            <div class="page">${html}</div>
        </body>
        </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 500);
}

function buildProposalHTML(quote) {
    const s = quote.fees.summary;
    const fmt = (n) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(n);
    
    const logoHtml = APP.office.logo ? `<img src="${APP.office.logo}" class="office-logo">` : `<h2 style="margin:0; font-family:'Inter'">${APP.office.name}</h2>`;

    return `
        <div class="pdf-header">
            <div>${logoHtml}</div>
            <div class="office-details">
                <p><strong>${APP.office.name}</strong></p>
                <p>${APP.office.address}</p>
                <p>NIF: ${APP.office.nif} · ${APP.office.phone}</p>
                <p>${APP.office.email}</p>
            </div>
        </div>
        <div class="cover">
            <h1>Proposta de Honorários</h1>
            <div class="meta">${quote.reference} · v${quote.version}</div>
            <div class="meta">
                Emitida em ${formatDate(quote.createdAt)} · 
                Válida até ${formatDate(quote.validUntil)}
            </div>
        </div>
        <div class="section">
            <h2>Cliente</h2>
            <p><strong>${esc(quote.client.name)}</strong></p>
            ${quote.client.email ? `<p>${esc(quote.client.email)}</p>` : ''}
            ${quote.client.nif ? `<p>NIF: ${esc(quote.client.nif)}</p>` : ''}
        </div>
        <div class="section">
            <h2>Âmbito dos Serviços</h2>
            ${quote.proposal.intro ? `<p style="margin-bottom:12pt;">${quote.proposal.intro}</p>` : ''}
            
            ${quote.type === 'simple' ? `
                <table>
                    <thead>
                        <tr>
                            <th style="text-align:left; border-bottom:1px solid #1a1714;">Descrição do Item / Serviço</th>
                            <th style="text-align:right; border-bottom:1px solid #1a1714;">Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${quote.items.map(item => `
                            <tr>
                                <td style="padding:8pt 0;">${esc(item.description)}</td>
                                <td style="text-align:right; padding:8pt 0;">${fmt(item.amount)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            ` : `
                <h3>Fases Incluídas</h3>
                ${quote.scope.phases.filter(p => p.included).map(p => `<div class="scope-item">${p.label}</div>`).join('')}
                ${quote.scope.deliverables.filter(d => d.included).length ? `
                    <h3>Entregáveis Adicionais</h3>
                    ${quote.scope.deliverables.filter(d => d.included).map(d => `<div class="scope-item">${d.label}${d.qty > 1 ? ` × ${d.qty}` : ''}</div>`).join('')}
                ` : ''}
                <h3>Exclusões</h3>
                ${quote.scope.exclusions.map(e => `<div class="exclusion">${e}</div>`).join('')}
                <h3>Premissas</h3>
                ${quote.scope.assumptions.split('\n').filter(Boolean).map(a => `<div class="assumption">${a.replace(/^[•\-]\s*/, '')}</div>`).join('')}
            `}
        </div>
        <div class="section" style="page-break-before: always;">
            <h2>Honorários</h2>
            <table>
                <tr><td>Honorários base</td><td style="text-align:right">${fmt(s.base)}</td></tr>
                ${s.optionals > 0 ? `<tr><td>Entregáveis adicionais</td><td style="text-align:right">${fmt(s.optionals)}</td></tr>` : ''}
                <tr><td>Subtotal</td><td style="text-align:right">${fmt(s.subtotal)}</td></tr>
                <tr><td>IVA (${s.vatRate}%)</td><td style="text-align:right">${fmt(s.vat)}</td></tr>
                <tr class="total-row"><td>Total Global</td><td style="text-align:right">${fmt(s.total)}</td></tr>
            </table>
            ${quote.proposal.includeConstructionEstimate && quote.fees.constructionEstimate ? `
                <div class="construction-note">
                    <strong>Estimativa indicativa de custo de construção:</strong>
                    ${fmt(quote.fees.constructionEstimate)}
                    <p>Valor meramente indicativo baseado em honorários regionais de €/m². Não substitui orçamento de empreiteiro.</p>
                </div>
            ` : ''}
            <h3>Cronograma de Pagamentos</h3>
            <table>
                <thead><tr><th>Marco</th><th style="text-align:right">%</th><th style="text-align:right">Valor</th></tr></thead>
                <tbody>
                    ${quote.fees.paymentSchedule.map(p => `<tr><td>${p.trigger}</td><td style="text-align:right">${p.percentage}%</td><td style="text-align:right">${fmt(p.amount)}</td></tr>`).join('')}
                </tbody>
            </table>
        </div>
        <div class="section">
            <h2>Condições Gerais</h2>
            <p>Revisões de âmbito não previstas nesta proposta serão objecto de proposta adicional antes de qualquer trabalho extra.</p>
            <p style="margin-top:8pt">Esta proposta é válida por ${quote.proposal.validityDays} dias a partir da data de emissão.</p>
            ${quote.proposal.legalNotes ? `<p style="margin-top:8pt">${quote.proposal.legalNotes}</p>` : ''}
        </div>
        <div class="acceptance">
            <h2>Aceitação</h2>
            <p>Ao assinar o presente documento, o cliente declara ter lido e aceite todos os termos desta proposta de honorários.</p>
            <div class="sig-line">
                <div class="sig-block"><label>Data</label><div class="line"></div></div>
                <div class="sig-block"><label>Assinatura do Cliente</label><div class="line"></div></div>
            </div>
        </div>
    `;
}
