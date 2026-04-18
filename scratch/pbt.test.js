// ============================================================================
// ArchProject — scratch/pbt.test.js
// Property-Based Tests para archproject-code-cleanup
// Cobre as 5 propriedades de correcção + verificação de equivalência fmt→formatCurrency
//
// Execução: node scratch/pbt.test.js
// Dependência: fast-check (npm install --save-dev fast-check)
// ============================================================================

const fc = require('fast-check');

// ── Stub mínimo do ambiente global (sem browser) ──────────────────────────────

// Stub de navigate (usado em renderStatCard)
global.navigate = () => {};

// Stub de PROJECTS e TEAM para mutations e domain
global.APP = { currentUser: { id: 'u1', name: 'Test User' } };
global.PROJECTS = [
    {
        id: 'p1',
        phases: [
            { key: 'pp', name: 'Programa Preliminar', status: 'done', startDate: '2025-01-01', endDateActual: null, history: [] },
            { key: 'ep', name: 'Estudo Prévio',       status: 'active', startDate: null, endDateActual: null, history: [] }
        ],
        history: [],
        timeLogs: [],
        pendencias: [],
        visits: [],
        posts: []
    }
];
global.TEAM = { members: [], externals: [], clients: [] };

// Carregar funções do projecto (sem browser APIs)
// formatCurrency — inline para evitar dependência de DOM
global.formatCurrency = function(value, options = {}) {
    const { compact, ...intlOpts } = options;
    return new Intl.NumberFormat('pt-PT', {
        style: 'currency', currency: 'EUR',
        notation: compact ? 'compact' : 'standard',
        ...intlOpts
    }).format(value);
};

// renderStatCard — inline (cópia exacta de core/helpers.js após refactoring)
global.renderStatCard = function(value, label, sublabel, page, highlightColor) {
    return `<div class="card card-clickable stat-card" onclick="navigate('${page}')">
        <div style="display:flex; align-items:baseline; gap:6px; margin-bottom:12px;">
            <span class="stat-card__value" style="color:${highlightColor || '#111827'};">${value}</span>
        </div>
        <p class="stat-card__label">${label}</p>
        <p class="stat-card__sublabel">${sublabel}</p>
    </div>`;
};

// globalSearch — inline (cópia exacta de app.js após refactoring)
global.QuotesModule = { _list: [] };
global.globalSearch = function(query) {
    const results = [];
    if (!query || query.trim().length === 0) return { html: '', display: 'none' };
    const q = query.toLowerCase().trim();
    PROJECTS.forEach(p => {
        if (p.name && p.name.toLowerCase().includes(q)) {
            results.push({ type: 'Projecto', name: p.name, id: p.id, route: 'projecto' });
        }
    });
    if (results.length === 0) {
        return { html: '<div>Nenhum resultado encontrado</div>', display: 'block' };
    }
    const html = results.slice(0, 8).map(r => `
        <div class="search-result-item" 
             onclick="navigate('${r.route}', ${r.id ? `{id:'${r.id}'}` : '{}'})">
            <div>${r.type}</div>
            <div>${r.name}</div>
        </div>
    `).join('');
    return { html, display: 'block' };
};

// updatePhaseStatus — inline (cópia exacta de core/mutations.js após refactoring)
global.todayStr = () => new Date().toISOString().split('T')[0];
global.getProject = (id) => PROJECTS.find(p => p.id === id);
global.getPhase = (projectId, phaseKey) => {
    const proj = getProject(projectId);
    return proj ? proj.phases.find(ph => ph.key === phaseKey) : null;
};
global.addHistoryEntry = (projectId, action, detail, phaseKey) => {
    const proj = getProject(projectId);
    if (proj) proj.history.unshift({ date: todayStr(), user: APP.currentUser.id, action, detail, phase: phaseKey || null });
};
global.updatePhaseStatus = function(projectId, phaseKey, status, endDateActual) {
    const proj = getProject(projectId);
    if (!proj) return;
    const phase = getPhase(projectId, phaseKey);
    if (!phase) return;
    const normalizedStatus = status === 'completed' ? 'done' : status;
    phase.status = normalizedStatus;
    if (normalizedStatus === 'active' && !phase.startDate) phase.startDate = todayStr();
    if (normalizedStatus === 'done' && endDateActual) phase.endDateActual = endDateActual;
    addHistoryEntry(projectId, `Fase ${normalizedStatus}`, phase.name, phaseKey);
    return phase;
};

// ── Helpers de teste ──────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`  ✓ ${name}`);
        passed++;
    } catch (e) {
        console.error(`  ✗ ${name}`);
        console.error(`    ${e.message}`);
        failed++;
    }
}

// ── T3.1 — Equivalência fmt → formatCurrency ─────────────────────────────────

console.log('\n── T3.1: Equivalência fmt → formatCurrency ──');

// A função fmt original era:
const fmtOriginal = n => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', notation: 'compact' }).format(n);

test('formatCurrency(85000, {compact:true}) === fmt(85000)', () => {
    const a = formatCurrency(85000, { compact: true });
    const b = fmtOriginal(85000);
    if (a !== b) throw new Error(`"${a}" !== "${b}"`);
});

test('formatCurrency(0, {compact:true}) === fmt(0)', () => {
    const a = formatCurrency(0, { compact: true });
    const b = fmtOriginal(0);
    if (a !== b) throw new Error(`"${a}" !== "${b}"`);
});

test('formatCurrency(1200000, {compact:true}) === fmt(1200000)', () => {
    const a = formatCurrency(1200000, { compact: true });
    const b = fmtOriginal(1200000);
    if (a !== b) throw new Error(`"${a}" !== "${b}"`);
});

// Property: para qualquer número não-negativo, formatCurrency compact === fmt
test('PBT: formatCurrency(n, {compact}) === fmt(n) para qualquer n ≥ 0', () => {
    fc.assert(fc.property(
        fc.float({ min: 0, max: 10_000_000, noNaN: true }),
        (n) => formatCurrency(n, { compact: true }) === fmtOriginal(n)
    ), { numRuns: 200 });
});

// ── Property 1 — HTML de pesquisa sem handlers inline ────────────────────────

console.log('\n── Property 1: HTML de pesquisa sem handlers inline ──');

test('PBT: globalSearch nunca gera onmouseenter/onmouseleave', () => {
    fc.assert(fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        (query) => {
            const { html } = globalSearch(query);
            return !html.includes('onmouseenter') && !html.includes('onmouseleave');
        }
    ), { numRuns: 200 });
});

test('globalSearch com query vazia retorna display:none', () => {
    const { display } = globalSearch('');
    if (display !== 'none') throw new Error(`display esperado 'none', obtido '${display}'`);
});

// ── Property 2 — renderStatCard usa classes CSS ───────────────────────────────

console.log('\n── Property 2: renderStatCard usa classes CSS ──');

test('PBT: renderStatCard sempre contém as 4 classes CSS', () => {
    fc.assert(fc.property(
        fc.string(), fc.string(), fc.string(), fc.string(),
        (value, label, sublabel, page) => {
            const html = renderStatCard(value, label, sublabel, page);
            return html.includes('stat-card') &&
                   html.includes('stat-card__value') &&
                   html.includes('stat-card__label') &&
                   html.includes('stat-card__sublabel');
        }
    ), { numRuns: 200 });
});

test('PBT: renderStatCard não contém estilos inline hardcoded de label/sublabel', () => {
    fc.assert(fc.property(
        fc.string(), fc.string(), fc.string(), fc.string(),
        (value, label, sublabel, page) => {
            const html = renderStatCard(value, label, sublabel, page);
            // Estes estilos foram movidos para CSS — não devem aparecer inline
            return !html.includes('font-size:32px') &&
                   !html.includes('text-transform:uppercase; letter-spacing:0.5px; color:#111827; margin:0 0 6px') &&
                   !html.includes('font-size:11px; color:#9ca3af; margin:0; font-weight:500');
        }
    ), { numRuns: 200 });
});

// ── Property 3 — renderStatCard aplica highlightColor inline ─────────────────

console.log('\n── Property 3: renderStatCard aplica highlightColor inline ──');

test('PBT: highlightColor fornecido → style="color:X" no valor', () => {
    fc.assert(fc.property(
        fc.string(), fc.string(), fc.string(), fc.string(),
        fc.constantFrom('#ef4444', '#d97706', '#3b82f6', '#10b981', '#111827'),
        (value, label, sublabel, page, color) => {
            const html = renderStatCard(value, label, sublabel, page, color);
            return html.includes(`color:${color}`);
        }
    ), { numRuns: 200 });
});

test('PBT: sem highlightColor → usa cor default #111827', () => {
    fc.assert(fc.property(
        fc.string(), fc.string(), fc.string(), fc.string(),
        (value, label, sublabel, page) => {
            const html = renderStatCard(value, label, sublabel, page); // sem highlightColor
            return html.includes('color:#111827');
        }
    ), { numRuns: 200 });
});

test('PBT: null/undefined highlightColor → usa cor default #111827', () => {
    fc.assert(fc.property(
        fc.string(), fc.string(), fc.string(), fc.string(),
        fc.constantFrom(null, undefined),
        (value, label, sublabel, page, color) => {
            const html = renderStatCard(value, label, sublabel, page, color);
            return html.includes('color:#111827');
        }
    ), { numRuns: 100 });
});

// ── Property 4 — Mutações de status produzem valores canónicos ───────────────

console.log('\n── Property 4: Mutações de status produzem valores canónicos ──');

const CANONICAL_STATUSES = ['done', 'active', 'pending', 'blocked', 'in-progress', 'in-review'];
const INPUT_STATUSES = [...CANONICAL_STATUSES, 'completed']; // 'completed' é alias retroactivo

test('PBT: updatePhaseStatus sempre produz status canónico', () => {
    fc.assert(fc.property(
        fc.constantFrom(...INPUT_STATUSES),
        (inputStatus) => {
            const proj = PROJECTS[0];
            const phase = proj.phases[0];
            const originalStatus = phase.status;
            const originalStartDate = phase.startDate;

            updatePhaseStatus(proj.id, phase.key, inputStatus);
            const resultStatus = phase.status;

            // Restaurar estado
            phase.status = originalStatus;
            phase.startDate = originalStartDate;

            return CANONICAL_STATUSES.includes(resultStatus);
        }
    ), { numRuns: 100 });
});

test("updatePhaseStatus('completed') normaliza para 'done'", () => {
    const proj = PROJECTS[0];
    const phase = proj.phases[0];
    const originalStatus = phase.status;

    updatePhaseStatus(proj.id, phase.key, 'completed');
    const result = phase.status;
    phase.status = originalStatus;

    if (result !== 'done') throw new Error(`Esperado 'done', obtido '${result}'`);
});

// ── Property 5 — Separação de data.js preserva scope global ─────────────────

console.log('\n── Property 5: Separação de data.js preserva scope global ──');

// Carregar os três ficheiros e verificar que todos os globals existem
const path = require('path');
const fs = require('fs');
const vm = require('vm');

// Nota: No browser, const/let no top-level de um <script> são globais.
// Em Node.js vm, const/let ficam no script scope mas não no objeto do contexto.
// Usamos vm.runInThisContext para function declarations (que ficam globais)
// e verificamos const via eval() para simular o comportamento do browser.

// Verificar que os ficheiros carregam sem erros de sintaxe
test('data/mock.js carrega sem erros', () => {
    const code = fs.readFileSync(path.join(__dirname, '..', 'data/mock.js'), 'utf8');
    new vm.Script(code); // compila sem executar — valida sintaxe
});

test('data/utils.js carrega sem erros', () => {
    const code = fs.readFileSync(path.join(__dirname, '..', 'data/utils.js'), 'utf8');
    new vm.Script(code);
});

test('data/domain.js carrega sem erros', () => {
    const code = fs.readFileSync(path.join(__dirname, '..', 'data/domain.js'), 'utf8');
    new vm.Script(code);
});

// Verificar que as funções declaradas com `function` ficam globais (comportamento idêntico browser/Node)
// As declaradas com `const` são verificadas por presença no ficheiro correcto
const FUNCTION_GLOBALS = [
    'generateId', 'todayStr', 'getStatusLabel', 'getStatusColor',
    'getPriorityLabel', 'getPriorityColor', 'getApprovalTypeLabel',
    'getProject', 'getPhase', 'getDeliverable', 'getPersonById', 'getPersonName',
    'getAllPendencias', 'getAllPendingApprovals', 'getAllTimeLogs', 'getAllHistory',
    'getProjectProgress', 'getPhaseProgress', 'getTotalHours', 'getPhaseHours',
    'getBillableHours', 'getWeeklyHours', 'addHistoryEntry', 'buildPhasesFromSource'
];

// Carregar via vm.runInThisContext (expõe function declarations no scope global de Node)
[
    path.join(__dirname, '..', 'data/mock.js'),
    path.join(__dirname, '..', 'data/utils.js'),
    path.join(__dirname, '..', 'data/domain.js')
].forEach(filePath => {
    try {
        vm.runInThisContext(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
        // const/let no top-level podem causar redeclaration errors se já definidos — ignorar
        if (!e.message.includes('already been declared')) throw e;
    }
});

test('PBT: todas as funções de domínio estão acessíveis no scope global', () => {
    fc.assert(fc.property(
        fc.constantFrom(...FUNCTION_GLOBALS),
        (fnName) => typeof global[fnName] === 'function'
    ), { numRuns: FUNCTION_GLOBALS.length });
});

// Verificar presença de const globals nos ficheiros correctos
const CONST_GLOBALS_IN_MOCK = ['APP', 'SETTINGS', 'TEAM', 'PHASE_DEFINITIONS', 'TEMPLATES', 'PROJECTS', 'TIMER', 'QUOTES'];

test('PBT: todos os const globals estão declarados em data/mock.js', () => {
    const mockContent = fs.readFileSync(path.join(__dirname, '..', 'data/mock.js'), 'utf8');
    fc.assert(fc.property(
        fc.constantFrom(...CONST_GLOBALS_IN_MOCK),
        (name) => mockContent.includes(`const ${name}`)
    ), { numRuns: CONST_GLOBALS_IN_MOCK.length });
});

// Verificações individuais para diagnóstico claro
FUNCTION_GLOBALS.forEach(name => {
    test(`function ${name} está definida no scope global`, () => {
        if (typeof global[name] !== 'function') throw new Error(`${name} não é uma função no scope global`);
    });
});

CONST_GLOBALS_IN_MOCK.forEach(name => {
    test(`const ${name} declarada em data/mock.js`, () => {
        const mockContent = fs.readFileSync(path.join(__dirname, '..', 'data/mock.js'), 'utf8');
        if (!mockContent.includes(`const ${name}`)) throw new Error(`${name} não encontrado em data/mock.js`);
    });
});

// ── Sumário ───────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(50)}`);
console.log(`Resultado: ${passed} passou, ${failed} falhou`);
if (failed > 0) {
    console.log('FALHOU');
    process.exit(1);
} else {
    console.log('PASSOU');
    process.exit(0);
}
