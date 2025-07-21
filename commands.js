// ===== COMMANDS PAGE FUNCTIONALITY =====

document.addEventListener('DOMContentLoaded', function() {
    initCommandsPage();
});

function initCommandsPage() {
    renderCommands();
    initSearch();
    initFilters();
    initModal();
}

// ===== RENDER COMMANDS =====
function renderCommands(filter = 'all', searchTerm = '') {
    const commandsGrid = document.getElementById('commands-grid');
    const noResults = document.getElementById('no-results');
    
    if (!commandsGrid || !window.commandsData) return;

    let allCommands = [];
    
    // Flatten all commands from all categories
    Object.keys(window.commandsData).forEach(category => {
        allCommands = allCommands.concat(window.commandsData[category]);
    });

    // Filter commands
    let filteredCommands = allCommands;
    
    if (filter !== 'all') {
        filteredCommands = filteredCommands.filter(cmd => cmd.category === filter);
    }
    
    if (searchTerm) {
        filteredCommands = filteredCommands.filter(cmd => 
            cmd.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cmd.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cmd.aliases.some(alias => alias.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }

    // Clear grid
    commandsGrid.innerHTML = '';

    if (filteredCommands.length === 0) {
        noResults.style.display = 'block';
        commandsGrid.style.display = 'none';
    } else {
        noResults.style.display = 'none';
        commandsGrid.style.display = 'grid';
        
        filteredCommands.forEach(command => {
            const commandCard = createCommandCard(command);
            commandsGrid.appendChild(commandCard);
        });
    }
}

// ===== CREATE COMMAND CARD =====
function createCommandCard(command) {
    const card = document.createElement('div');
    card.className = 'command-card';
    card.setAttribute('data-command', command.name);
    
    const permissionsHtml = command.permissions.length > 0 
        ? `<div class="command-permissions">
             ${command.permissions.map(perm => `<span class="permission-tag">${perm}</span>`).join('')}
           </div>`
        : '';

    card.innerHTML = `
        <div class="command-header">
            <div class="command-name">-${command.name}</div>
            <div class="command-category">${command.category}</div>
        </div>
        <div class="command-description">${command.description}</div>
        <div class="command-meta">
            <span><i class="fas fa-clock"></i> ${formatCooldown(command.cooldown)}</span>
            ${command.aliases.length > 0 ? `<span><i class="fas fa-tag"></i> ${command.aliases.length} aliases</span>` : ''}
            ${command.permissions.length > 0 ? `<span><i class="fas fa-shield-alt"></i> Requires permissions</span>` : ''}
        </div>
        ${permissionsHtml}
    `;

    // Add click event to open modal
    card.addEventListener('click', () => openCommandModal(command));

    return card;
}

// ===== FORMAT COOLDOWN =====
function formatCooldown(seconds) {
    if (seconds >= 86400) {
        return `${Math.floor(seconds / 86400)}d`;
    } else if (seconds >= 3600) {
        return `${Math.floor(seconds / 3600)}h`;
    } else if (seconds >= 60) {
        return `${Math.floor(seconds / 60)}m`;
    } else {
        return `${seconds}s`;
    }
}

// ===== SEARCH FUNCTIONALITY =====
function initSearch() {
    const searchInput = document.getElementById('command-search');
    if (!searchInput) return;

    let searchTimeout;
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const searchTerm = e.target.value.trim();
            const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
            renderCommands(activeFilter, searchTerm);
        }, 300);
    });
}

// ===== FILTER FUNCTIONALITY =====
function initFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active filter
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Get search term and filter
            const searchTerm = document.getElementById('command-search').value.trim();
            const filter = btn.getAttribute('data-filter');
            
            renderCommands(filter, searchTerm);
        });
    });
}

// ===== MODAL FUNCTIONALITY =====
function initModal() {
    const modal = document.getElementById('command-modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalClose = document.getElementById('modal-close');
    
    if (!modal) return;

    // Close modal events
    modalClose.addEventListener('click', closeCommandModal);
    modalOverlay.addEventListener('click', closeCommandModal);
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeCommandModal();
        }
    });
}

function openCommandModal(command) {
    const modal = document.getElementById('command-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    if (!modal || !modalTitle || !modalBody) return;

    modalTitle.textContent = `-${command.name}`;
    
    const aliasesHtml = command.aliases.length > 0 
        ? `<div class="modal-section">
             <h4>Aliases</h4>
             <div class="aliases-list">
               ${command.aliases.map(alias => `<span class="alias-tag">-${alias}</span>`).join('')}
             </div>
           </div>`
        : '';

    const permissionsHtml = command.permissions.length > 0 
        ? `<div class="modal-section">
             <h4>Required Permissions</h4>
             <ul>
               ${command.permissions.map(perm => `<li>${perm}</li>`).join('')}
             </ul>
           </div>`
        : '';

    modalBody.innerHTML = `
        <div class="modal-section">
            <h4>Description</h4>
            <p>${command.description}</p>
        </div>
        
        <div class="modal-section">
            <h4>Usage</h4>
            <div class="usage-example">-${command.usage}</div>
            <p><strong>Note:</strong> You can also use slash commands: <code>/${command.name}</code></p>
        </div>
        
        <div class="modal-section">
            <h4>Examples</h4>
            ${command.examples.map(example => `<div class="usage-example">-${example}</div>`).join('')}
        </div>
        
        ${aliasesHtml}
        ${permissionsHtml}
        
        <div class="modal-section">
            <h4>Details</h4>
            <ul>
                <li><strong>Category:</strong> ${command.category.charAt(0).toUpperCase() + command.category.slice(1)}</li>
                <li><strong>Cooldown:</strong> ${formatCooldown(command.cooldown)}</li>
                <li><strong>Permissions Required:</strong> ${command.permissions.length > 0 ? 'Yes' : 'No'}</li>
            </ul>
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCommandModal() {
    const modal = document.getElementById('command-modal');
    if (!modal) return;

    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// ===== COPY COMMAND FUNCTIONALITY =====
document.addEventListener('click', (e) => {
    if (e.target.closest('.usage-example')) {
        const commandText = e.target.closest('.usage-example').textContent;
        copyToClipboard(commandText);
    }
});

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
    // Focus search on Ctrl+K or Cmd+K
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('command-search');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }
});

// ===== COMMAND STATISTICS =====
function getCommandStats() {
    if (!window.commandsData) return {};

    const stats = {
        total: 0,
        byCategory: {}
    };

    Object.keys(window.commandsData).forEach(category => {
        const commands = window.commandsData[category];
        stats.byCategory[category] = commands.length;
        stats.total += commands.length;
    });

    return stats;
}

// ===== EXPORT FOR EXTERNAL USE =====
window.commandsPageAPI = {
    renderCommands,
    openCommandModal,
    closeCommandModal,
    getCommandStats
};
