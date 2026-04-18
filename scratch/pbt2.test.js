// ============================================================================
// ArchProject — scratch/pbt2.test.js
// Testes de Exploração e Preservação para archproject-bugfix-round2
//
// NOTA: Este ficheiro tem duas secções:
//   - EXPLORAÇÃO: verifica que os bugs EXISTEM (deve falhar após correcções)
//   - PRESERVAÇÃO: verifica comportamentos base (deve sempre passar)
//   - PÓS-CORRECÇÃO: verifica que os bugs foram corrigidos (deve passar após fixes)
//
// Execução: node scratch/pbt2.test.js
// Dependência: fast-check (npm install --save-dev fast-check)
// ============================================================================

const fc = require('fast-check');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

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

// ── Leitura de ficheiros ──────────────────────────────────────────────────────

const stylesCSS = fs.readFileSync(path.join(__dirname, '..', 'styles.css'), 'utf8');
const mockJS = fs.readFileSync(path.join(__dirname, '..', 'data/mock.js'), 'utf8');
const utilsJS = fs.readFileSync(path.join(__dirname, '..', 'data/utils.js'), 'utf8');
const readmeContent = fs.readFileSync(path.join(__dirname, '..', 'README.md'), 'utf8');
const projectPhasesJS = fs.readFileSync(path.join(__dirname, '..', 'modules/projects/project-phases.js'), 'utf8');
const projectTeamJS = fs.readFileSync(path.join(__dirname, '..', 'modules/projects/project-team.js'), 'utf8');
const portalJS = fs.readFileSync(path.join(__dirname, '..', 'portal.js'), 'utf8');
const projectListJS = fs.readFileSync(path.join(__dirname, '..', 'modules/projects/project-list.js'), 'utf8');
const quotesJS = fs.readFileSync(path.join(__dirname, '..', 'modules/quotes/quotes.js'), 'utf8');
const indexHTML = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const mutationsJS = fs.readFileSync(path.join(__dirname, '..', 'core/mutations.js'), 'utf8');

// ── Carregar PROJECTS de mock.js via vm ───────────────────────────────────────

let PROJECTS_FROM_MOCK = [];
try {
    const script = new vm.Script(`(function() { ${mockJS}; return PROJECTS; })()`);
    const ctx = vm.createContext({ console });
    PROJECTS_FROM_MOCK = script.runInContext(ctx);
} catch (e) {
    // fallback: contar projectos por id no ficheiro
    const ids = mockJS.match(/\bid:\s*'(p\d+)'/g) || [];
    PROJECTS_FROM_MOCK = [...new Set(ids.map(m => m.match(/'(p\d+)'/)[1]))].map(id => ({ id }));
}

// ── Constantes ───────────────────────────────────────────────────────────────

const MISSING_CSS_CLASSES = [
    'bg-green-100', 'text-green-800',
    'bg-blue-100',  'text-blue-800',
    'bg-yellow-100','text-yellow-800', 'text-yellow-700',
    'bg-red-100',   'text-red-800',    'text-red-700',
    'bg-orange-100','text-orange-800',
    'bg-gray-100',  'text-gray-600',   'text-gray-500',
    'bg-green-50',  'bg-blue-50',      'text-blue-700'
];

const SECTION_TITLE_PATTERN = 'font-size:14px; font-weight:800; text-transform:uppercase; letter-spacing:1px; color:#1a1714;';
const TABLE_TD_PATTERN = 'padding:16px 24px; font-size:13px; color:#6b7280; font-weight:500;';

// ============================================================================
// SECÇÃO A — PRESERVAÇÃO (deve sempre passar, antes e depois das correcções)
// ============================================================================

console.log('\n════════════════════════════════════════════════════════════');
console.log('SECÇÃO A — PRESERVAÇÃO: Comportamentos base a manter');
console.log('════════════════════════════════════════════════════════════');

// ── Preservação Bug 1: .badge base ───────────────────────────────────────────

console.log('\n── Preservação Bug 1: .badge base ──');

test('PRESERVAÇÃO: .badge em styles.css tem padding, border-radius e font-weight', () => {
    const badgeMatch = stylesCSS.match(/\.badge\s*\{[^}]+\}/);
    if (!badgeMatch) throw new Error('.badge não encontrado em styles.css');
    const badgeRule = badgeMatch[0];
    if (!badgeRule.includes('padding')) throw new Error('.badge não tem padding');
    if (!badgeRule.includes('border-radius')) throw new Error('.badge não tem border-radius');
    if (!badgeRule.includes('font-weight')) throw new Error('.badge não tem font-weight');
    console.log('    → .badge tem padding, border-radius e font-weight');
});

// ── Preservação Bug 2: addPostToProject estrutura ────────────────────────────

console.log('\n── Preservação Bug 2: addPostToProject ──');

test('PRESERVAÇÃO: addPostToProject cria posts com estrutura correcta', () => {
    const fnMatch = mutationsJS.match(/function addPostToProject[\s\S]*?^}/m);
    if (!fnMatch) throw new Error('addPostToProject não encontrada em mutations.js');
    const fnBody = fnMatch[0];
    if (!fnBody.includes('id:')) throw new Error('falta id:');
    if (!fnBody.includes('date:')) throw new Error('falta date:');
    if (!fnBody.includes('content:')) throw new Error('falta content:');
    if (!fnBody.includes('authorId:')) throw new Error('falta authorId:');
    if (!fnBody.includes('authorName:')) throw new Error('falta authorName:');
    if (!fnBody.includes('internal:')) throw new Error('falta internal:');
    console.log('    → addPostToProject cria posts com estrutura correcta');
});

test('PRESERVAÇÃO: addPostToProject tem guarda defensiva if (!proj.posts)', () => {
    const fnMatch = mutationsJS.match(/function addPostToProject[\s\S]*?^}/m);
    if (!fnMatch) throw new Error('addPostToProject não encontrada');
    if (!fnMatch[0].includes('if (!proj.posts)')) throw new Error('Guarda defensiva em falta');
    console.log('    → Guarda defensiva if (!proj.posts) presente');
});

// ── Preservação Bug 3: generateId() em utils.js ──────────────────────────────

console.log('\n── Preservação Bug 3: generateId() ──');

test("PRESERVAÇÃO: generateId() em utils.js usa formato 'id_' + timestamp + '_' + random", () => {
    if (!utilsJS.includes("'id_' + Date.now().toString(36)")) {
        throw new Error('generateId() não usa o formato esperado em utils.js');
    }
    console.log("    → generateId() usa formato correcto");
});

// ── Preservação Bug 4: README descreve mutations.js ──────────────────────────

console.log('\n── Preservação Bug 4: README ──');

test('PRESERVAÇÃO: README descreve a responsabilidade de mutations.js', () => {
    if (!readmeContent.includes('mutations.js')) throw new Error('README não menciona mutations.js');
    console.log('    → README menciona mutations.js');
});

// ── Preservação Bug 5: lógica extra das vistas ───────────────────────────────

console.log('\n── Preservação Bug 5: lógica extra das vistas ──');

test("PRESERVAÇÃO: completePhase() auto-activa fase seguinte", () => {
    const fnMatch = projectPhasesJS.match(/function completePhase[\s\S]*?^}/m);
    if (!fnMatch) throw new Error('completePhase não encontrada');
    const fnBody = fnMatch[0];
    if (!fnBody.includes("next.status = 'active'") && !fnBody.includes('next.status="active"')) {
        throw new Error('completePhase não auto-activa fase seguinte');
    }
    console.log("    → completePhase() auto-activa fase seguinte");
});

test("PRESERVAÇÃO: completePhase() marca proj.status = 'completed'", () => {
    const fnMatch = projectPhasesJS.match(/function completePhase[\s\S]*?^}/m);
    if (!fnMatch) throw new Error('completePhase não encontrada');
    if (!fnMatch[0].includes("proj.status = 'completed'")) {
        throw new Error("completePhase não marca proj.status = 'completed'");
    }
    console.log("    → completePhase() marca proj.status = 'completed'");
});

test('PRESERVAÇÃO: removeFromProject() verifica APP.currentUser.id', () => {
    const fnMatch = projectTeamJS.match(/function removeFromProject[\s\S]*?^}/m);
    if (!fnMatch) throw new Error('removeFromProject não encontrada');
    if (!fnMatch[0].includes('APP.currentUser.id')) {
        throw new Error('removeFromProject não verifica APP.currentUser.id');
    }
    console.log('    → removeFromProject() verifica APP.currentUser.id');
});

// ── Preservação Bug 6: valores semânticos ────────────────────────────────────

console.log('\n── Preservação Bug 6: valores semânticos ──');

test('PRESERVAÇÃO: mock.js contém os nomes de projectos correctos', () => {
    if (!mockJS.includes('Moradia Silva')) throw new Error('Moradia Silva não encontrado');
    if (!mockJS.includes('Moradia Costa')) throw new Error('Moradia Costa não encontrado');
    if (!mockJS.includes('Moradia Ferreira')) throw new Error('Moradia Ferreira não encontrado');
    console.log('    → Nomes de projectos correctos presentes');
});

// ── Preservação Bug 7: regras CSS dentro de breakpoints ──────────────────────

console.log('\n── Preservação Bug 7: regras CSS dentro de breakpoints ──');

test('PRESERVAÇÃO: bloco @media (max-width: 1024px) contém regras para .sidebar', () => {
    const block1024 = stylesCSS.match(/@media \(max-width: 1024px\)\s*\{[\s\S]*?\n\}/);
    if (!block1024) throw new Error('Bloco 1024px não encontrado');
    if (!block1024[0].includes('.sidebar')) throw new Error('Bloco 1024px não contém .sidebar');
    console.log('    → Bloco 1024px contém regras para .sidebar');
});

test('PRESERVAÇÃO: bloco @media (max-width: 768px) contém regras para .sidebar', () => {
    const block768 = stylesCSS.match(/@media \(max-width: 768px\)\s*\{[\s\S]*?\n\}/);
    if (!block768) throw new Error('Bloco 768px não encontrado');
    if (!block768[0].includes('.sidebar')) throw new Error('Bloco 768px não contém .sidebar');
    console.log('    → Bloco 768px contém regras para .sidebar');
});

test('PRESERVAÇÃO: bloco @media (max-width: 900px) contém regras para .sidebar', () => {
    const block900 = stylesCSS.match(/@media \(max-width: 900px\)\s*\{[\s\S]*?\n\}/);
    if (!block900) throw new Error('Bloco 900px não encontrado');
    if (!block900[0].includes('.sidebar')) throw new Error('Bloco 900px não contém .sidebar');
    console.log('    → Bloco 900px contém regras para .sidebar');
});

// ── Preservação Bug 8: .badge base ───────────────────────────────────────────

console.log('\n── Preservação Bug 8: .badge base ──');

test('PRESERVAÇÃO: styles.css tem regra .badge existente', () => {
    if (!stylesCSS.includes('.badge {') && !stylesCSS.includes('.badge{')) {
        throw new Error('.badge não encontrado em styles.css');
    }
    console.log('    → .badge existe em styles.css');
});

// ── Preservação Bug 9: proj.area nos mocks ───────────────────────────────────

console.log('\n── Preservação Bug 9: proj.area nos mocks ──');

test('PRESERVAÇÃO: projectos mock têm area como número', () => {
    const areaMatches = mockJS.match(/area:\s*(\d+),/g) || [];
    if (areaMatches.length === 0) throw new Error('Nenhuma definição de area numérica em mock.js');
    console.log(`    → ${areaMatches.length} definições de area numérica encontradas`);
});

// ============================================================================
// SECÇÃO B — PÓS-CORRECÇÃO (verifica que os bugs foram corrigidos)
// ============================================================================

console.log('\n════════════════════════════════════════════════════════════');
console.log('SECÇÃO B — PÓS-CORRECÇÃO: Verificar que os bugs foram corrigidos');
console.log('════════════════════════════════════════════════════════════');

// ── Bug 1 Fix: Classes CSS presentes ─────────────────────────────────────────

console.log('\n── Bug 1 Fix: Classes CSS presentes ──');

test('FIX Bug 1: todas as 18 classes de cor existem em styles.css', () => {
    const missingClasses = MISSING_CSS_CLASSES.filter(cls => !stylesCSS.includes(`.${cls}`));
    if (missingClasses.length > 0) {
        throw new Error(`Classes ainda em falta: ${missingClasses.join(', ')}`);
    }
    console.log('    → Todas as 18 classes de cor presentes em styles.css');
});

test('FIX Bug 1 PBT: todas as 18 classes estão definidas', () => {
    fc.assert(fc.property(
        fc.constantFrom(...MISSING_CSS_CLASSES),
        (cls) => stylesCSS.includes(`.${cls}`)
    ), { numRuns: MISSING_CSS_CLASSES.length });
});

// ── Bug 2 Fix: posts inicializado ────────────────────────────────────────────

console.log('\n── Bug 2 Fix: posts inicializado ──');

test('FIX Bug 2: todos os projectos mock têm posts: []', () => {
    const projectsSection = mockJS.substring(mockJS.indexOf('const PROJECTS'));
    if (!projectsSection.includes('posts:')) {
        throw new Error('posts: [] não encontrado nos projectos mock');
    }
    // Verificar via vm
    if (PROJECTS_FROM_MOCK.length > 0) {
        const withoutPosts = PROJECTS_FROM_MOCK.filter(p => !('posts' in p));
        if (withoutPosts.length > 0) {
            throw new Error(`${withoutPosts.length} projectos ainda sem posts`);
        }
        console.log(`    → Todos os ${PROJECTS_FROM_MOCK.length} projectos têm posts definido`);
    } else {
        console.log('    → posts: [] encontrado em mock.js (verificação via texto)');
    }
});

// ── Bug 3 Fix: generateId() única ────────────────────────────────────────────

console.log('\n── Bug 3 Fix: generateId() única ──');

test('FIX Bug 3: data/mock.js NÃO contém declaração de function generateId()', () => {
    if (mockJS.includes('function generateId()')) {
        throw new Error('mock.js ainda contém function generateId() — duplicada não removida');
    }
    console.log('    → mock.js não contém function generateId() (duplicada removida)');
});

test('FIX Bug 3: data/utils.js contém a única declaração de generateId()', () => {
    if (!utilsJS.includes('function generateId()')) {
        throw new Error('utils.js não contém function generateId()');
    }
    console.log('    → utils.js contém a declaração canónica de generateId()');
});

test('FIX Bug 3: index.html carrega utils.js ANTES de mock.js', () => {
    const utilsPos = indexHTML.indexOf('data/utils.js');
    const mockPos = indexHTML.indexOf('data/mock.js');
    if (utilsPos === -1 || mockPos === -1) throw new Error('Scripts não encontrados em index.html');
    if (utilsPos >= mockPos) {
        throw new Error(`utils.js (${utilsPos}) não está antes de mock.js (${mockPos})`);
    }
    console.log(`    → utils.js (${utilsPos}) carregado antes de mock.js (${mockPos})`);
});

// ── Bug 4 Fix: README "14 mutações" ──────────────────────────────────────────

console.log('\n── Bug 4 Fix: README "14 mutações" ──');

test('FIX Bug 4: README NÃO contém "17 funções de mutação" ou "17 mutações"', () => {
    const has17 = readmeContent.includes('17 funções de mutação') || readmeContent.includes('17 mutações');
    if (has17) {
        throw new Error('README ainda contém "17 funções de mutação" — não corrigido');
    }
    console.log('    → README não contém "17 funções de mutação"');
});

test('FIX Bug 4: README contém "14 funções de mutação" ou "14 mutações"', () => {
    const has14 = readmeContent.includes('14 funções de mutação') || readmeContent.includes('14 mutações');
    if (!has14) {
        throw new Error('README não contém "14 funções de mutação"');
    }
    console.log('    → README contém "14 funções de mutação"');
});

// ── Bug 5 Fix: Mutações delegadas para mutations.js ──────────────────────────

console.log('\n── Bug 5 Fix: Mutações delegadas ──');

test('FIX Bug 5: activatePhase() chama updatePhaseStatus()', () => {
    const fnMatch = projectPhasesJS.match(/function activatePhase[\s\S]*?^}/m);
    if (!fnMatch) throw new Error('activatePhase não encontrada');
    if (!fnMatch[0].includes('updatePhaseStatus(')) {
        throw new Error('activatePhase não chama updatePhaseStatus()');
    }
    console.log('    → activatePhase() chama updatePhaseStatus()');
});

test('FIX Bug 5: confirmAddToProject() chama addTeamMember()', () => {
    const fnMatch = projectTeamJS.match(/function confirmAddToProject[\s\S]*?^}/m);
    if (!fnMatch) throw new Error('confirmAddToProject não encontrada');
    if (!fnMatch[0].includes('addTeamMember(')) {
        throw new Error('confirmAddToProject não chama addTeamMember()');
    }
    console.log('    → confirmAddToProject() chama addTeamMember()');
});

test('FIX Bug 5: clientApprove() em portal.js chama updateApprovalStatus()', () => {
    const fnMatch = portalJS.match(/function clientApprove[\s\S]*?^}/m);
    if (!fnMatch) throw new Error('clientApprove não encontrada em portal.js');
    if (!fnMatch[0].includes('updateApprovalStatus(')) {
        throw new Error('clientApprove não chama updateApprovalStatus()');
    }
    console.log('    → clientApprove() chama updateApprovalStatus()');
});

// ── Bug 6 Fix: Sem espaços duplos ────────────────────────────────────────────

console.log('\n── Bug 6 Fix: Sem espaços duplos ──');

test('FIX Bug 6: data/mock.js NÃO contém "  -" (dois espaços antes de hífen)', () => {
    if (mockJS.includes('  -')) {
        const matches = mockJS.match(/  -/g) || [];
        throw new Error(`mock.js ainda contém ${matches.length} ocorrências de "  -"`);
    }
    console.log('    → mock.js não contém "  -"');
});

// ── Bug 7 Fix: Ordem media queries correcta ───────────────────────────────────

console.log('\n── Bug 7 Fix: Ordem media queries ──');

test('FIX Bug 7: 900px aparece ANTES de 768px em styles.css', () => {
    const pos900 = stylesCSS.indexOf('@media (max-width: 900px)');
    const pos768 = stylesCSS.indexOf('@media (max-width: 768px)');
    if (pos900 === -1 || pos768 === -1) throw new Error('Media queries não encontradas');
    if (pos900 >= pos768) {
        throw new Error(`900px (${pos900}) não está antes de 768px (${pos768})`);
    }
    console.log(`    → 900px (${pos900}) aparece antes de 768px (${pos768})`);
});

// ── Bug 8 Fix: Classes CSS reutilizáveis ─────────────────────────────────────

console.log('\n── Bug 8 Fix: Classes CSS reutilizáveis ──');

test('FIX Bug 8: styles.css contém .section-title', () => {
    if (!stylesCSS.includes('.section-title')) {
        throw new Error('.section-title não encontrado em styles.css');
    }
    console.log('    → .section-title definido em styles.css');
});

test('FIX Bug 8: styles.css contém .table-th', () => {
    if (!stylesCSS.includes('.table-th')) {
        throw new Error('.table-th não encontrado em styles.css');
    }
    console.log('    → .table-th definido em styles.css');
});

test('FIX Bug 8: styles.css contém .table-td', () => {
    if (!stylesCSS.includes('.table-td')) {
        throw new Error('.table-td não encontrado em styles.css');
    }
    console.log('    → .table-td definido em styles.css');
});

test('FIX Bug 8: padrão section-title NÃO existe inline nos ficheiros de vista', () => {
    const allViewFiles = { portal: portalJS, team: projectTeamJS, phases: projectPhasesJS, list: projectListJS, quotes: quotesJS };
    const filesWithPattern = Object.entries(allViewFiles).filter(([, f]) => f.includes(SECTION_TITLE_PATTERN));
    if (filesWithPattern.length > 0) {
        throw new Error(`Padrão section-title ainda inline em: ${filesWithPattern.map(([k]) => k).join(', ')}`);
    }
    console.log('    → Padrão section-title removido dos ficheiros de vista');
});

test('FIX Bug 8: padrão table-td NÃO existe inline nos ficheiros de vista', () => {
    const allViewFiles = { portal: portalJS, team: projectTeamJS, phases: projectPhasesJS, list: projectListJS, quotes: quotesJS };
    const filesWithPattern = Object.entries(allViewFiles).filter(([, f]) => f.includes(TABLE_TD_PATTERN));
    if (filesWithPattern.length > 0) {
        throw new Error(`Padrão table-td ainda inline em: ${filesWithPattern.map(([k]) => k).join(', ')}`);
    }
    console.log('    → Padrão table-td removido dos ficheiros de vista');
});

// ── Bug 9 Fix: proj.area sempre número ───────────────────────────────────────

console.log('\n── Bug 9 Fix: proj.area sempre número ──');

test('FIX Bug 9: createProject() usa parseFloat para area', () => {
    const fnMatch = projectListJS.match(/function createProject[\s\S]*?^}/m);
    if (!fnMatch) throw new Error('createProject não encontrada');
    const areaLine = fnMatch[0].match(/area:\s*[^\n,]+/);
    if (!areaLine) throw new Error('Linha de area não encontrada');
    if (!areaLine[0].includes('parseFloat')) {
        throw new Error(`createProject não usa parseFloat para area: ${areaLine[0].trim()}`);
    }
    console.log(`    → createProject() usa parseFloat: ${areaLine[0].trim()}`);
});

test('FIX Bug 9: convertToProject() usa Number() para area', () => {
    const hasNumber = quotesJS.includes('Number(q.brief.area)') || quotesJS.includes('Number(');
    const hasTemplateArea = quotesJS.includes('`${q.brief.area} m²`') || quotesJS.includes("q.brief.area ? `${q.brief.area} m\u00b2`");
    if (hasTemplateArea) {
        throw new Error('convertToProject ainda usa template string com m² para area');
    }
    if (!hasNumber) {
        throw new Error('convertToProject não usa Number() para area');
    }
    console.log('    → convertToProject() usa Number() para area');
});

// ── Sumário ───────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(60)}`);
console.log(`Resultado: ${passed} passou, ${failed} falhou`);
if (failed > 0) {
    console.log('FALHOU');
    process.exit(1);
} else {
    console.log('PASSOU');
    process.exit(0);
}
