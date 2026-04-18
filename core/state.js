// ============================================================================
// ArchProject — core/state.js
// Centralized UI state management
// All global UI state variables consolidated into a single object
// ============================================================================

const UI_STATE = {
    currentPage: 'painel',
    currentProjectId: null,
    currentProjectTab: 'visao-geral',
    currentPhaseKey: null,

    calendar: { view: 'month', month: new Date().getMonth(), year: new Date().getFullYear() },
    config: { tab: 'geral' },
    geralTarefas: { tab: 'tarefas', taskPriorityFilter: '' },
    geralPendFilter: { project: '', responsible: '' },
    actividade: { project: '', user: '' },
    projectList: { sortKey: 'name', sortDir: 'asc', search: '', status: '' },
    projectViewMode: 'list',
    phaseViewMode: 'detailed', // 'detailed' | 'compact'
    docFilter: { search: '', phase: '', status: '' },
    pendFilter: { responsible: '', phase: '' },

    timer: {
        interval: null,
        running: false,
        seconds: 0,
        projectId: null,
        phaseKey: null,
        startTime: null
    },
    search: {
        query: '',
        results: [],
        isOpen: false
    }
};
