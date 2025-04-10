document.addEventListener('DOMContentLoaded', async () => {
    // Loading screen
    const loadingScreen = document.getElementById('loading-screen');
    
    try {
        // Load settings
        const settings = await fetch('/src/settings.json').then(res => res.json());
        
        // Set page title
        document.title = settings.name || 'Nazir API';
        
        // Load API data
        await loadAPIData(settings);
        
        // Initialize mobile menu
        initMobileMenu();
        
        // Initialize modal
        initModal();
        
    } catch (error) {
        console.error('Error loading data:', error);
    } finally {
        // Hide loading screen
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }, 1000);
    }
});

async function loadAPIData(settings) {
    // Load API categories and items
    const apiCategoriesContainer = document.getElementById('api-categories');
    const docsNav = document.getElementById('docs-nav');
    const docsContent = document.getElementById('docs-content');
    
    // Clear existing content
    apiCategoriesContainer.innerHTML = '';
    docsNav.innerHTML = '';
    docsContent.innerHTML = '';
    
    // Add categories to features section
    settings.categories.forEach(category => {
        // Sort items alphabetically
        const sortedItems = [...category.items].sort((a, b) => a.name.localeCompare(b.name));
        
        // Create category element
        const categoryElement = document.createElement('div');
        categoryElement.className = 'api-category';
        categoryElement.innerHTML = `
            <div class="category-header">
                <h3>${category.name}</h3>
            </div>
            <div class="api-items" id="${category.name.toLowerCase().replace(/\s+/g, '-')}-items">
                ${sortedItems.map(item => `
                    <div class="api-item" data-name="${item.name.toLowerCase()}" data-desc="${item.desc.toLowerCase()}">
                        <h3>${item.name}</h3>
                        <p>${item.desc}</p>
                        <button class="btn primary-btn open-api-modal" 
                                data-path="${item.path}" 
                                data-name="${item.name}" 
                                data-desc="${item.desc}">
                            Try it
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
        
        apiCategoriesContainer.appendChild(categoryElement);
        
        // Add to documentation navigation
        const navItem = document.createElement('div');
        navItem.className = 'docs-nav-item';
        navItem.innerHTML = `
            <h4>${category.name}</h4>
            <ul>
                ${sortedItems.map(item => `
                    <li><a href="#${item.name.toLowerCase().replace(/\s+/g, '-')}">${item.name}</a></li>
                `).join('')}
            </ul>
        `;
        docsNav.appendChild(navItem);
        
        // Add to documentation content
        const contentSection = document.createElement('section');
        contentSection.id = `${category.name.toLowerCase().replace(/\s+/g, '-')}-docs`;
        contentSection.innerHTML = `
            <h2>${category.name}</h2>
            ${sortedItems.map(item => `
                <article id="${item.name.toLowerCase().replace(/\s+/g, '-')}">
                    <h3>${item.name}</h3>
                    <p>${item.desc}</p>
                    <div class="endpoint-info">
                        <div class="endpoint-method">GET</div>
                        <code>${window.location.origin}${item.path}</code>
                    </div>
                    ${item.innerDesc ? `<div class="endpoint-desc">${item.innerDesc.replace(/\n/g, '<br>')}</div>` : ''}
                    <button class="btn primary-btn open-api-modal" 
                            data-path="${item.path}" 
                            data-name="${item.name}" 
                            data-desc="${item.desc}">
                        Try this endpoint
                    </button>
                </article>
            `).join('')}
        `;
        docsContent.appendChild(contentSection);
    });
    
    // Initialize search functionality
    initSearch();
}

function initSearch() {
    const searchInput = document.getElementById('api-search');
    
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const apiItems = document.querySelectorAll('.api-item');
        
        apiItems.forEach(item => {
            const name = item.getAttribute('data-name');
            const desc = item.getAttribute('data-desc');
            
            if (name.includes(searchTerm) || desc.includes(searchTerm)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
        
        // Hide empty categories
        document.querySelectorAll('.api-category').forEach(category => {
            const visibleItems = category.querySelectorAll('.api-item:not([style*="none"])');
            if (visibleItems.length === 0) {
                category.style.display = 'none';
            } else {
                category.style.display = 'block';
            }
        });
    });
}

function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    menuBtn.addEventListener('click', () => {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    });
    
    // Close menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.style.display = 'none';
        });
    });
}

function initModal() {
    const modal = document.getElementById('api-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    
    // Open modal when clicking on "Try it" buttons
    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('open-api-modal')) {
            const { path, name, desc } = e.target.dataset;
            openModal(path, name, desc);
        }
    });
    
    // Close modal
    closeModalBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    // Close when clicking outside modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

async function openModal(path, name, desc) {
    const modal = document.getElementById('api-modal');
    const modalTitle = document.getElementById('modal-title');
    const endpointUrl = document.getElementById('endpoint-url');
    const paramsContainer = document.getElementById('params-container');
    const tryItBtn = document.getElementById('try-it-btn');
    const responseContent = document.getElementById('response-content');
    
    // Set modal title and endpoint URL
    modalTitle.textContent = name;
    endpointUrl.textContent = path;
    
    // Clear previous content
    paramsContainer.innerHTML = '';
    responseContent.textContent = '';
    
    // Check if endpoint has parameters
    const hasParams = path.includes('?');
    
    if (hasParams) {
        // Extract parameters from path
        const params = new URLSearchParams(path.split('?')[1]);
        
        // Create input fields for each parameter
        params.forEach((value, param) => {
            const paramGroup = document.createElement('div');
            paramGroup.className = 'param-group';
            paramGroup.innerHTML = `
                <label for="${param}">${param}</label>
                <input type="text" id="${param}" placeholder="Enter ${param}" required>
            `;
            paramsContainer.appendChild(paramGroup);
        });
        
        // Show try it button
        tryItBtn.style.display = 'block';
        
        // Set up try it button click handler
        tryItBtn.onclick = async () => {
            // Validate inputs
            const inputs = paramsContainer.querySelectorAll('input');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    input.classList.add('is-invalid');
                    isValid = false;
                } else {
                    input.classList.remove('is-invalid');
                }
            });
            
            if (!isValid) return;
            
            // Build URL with parameters
            const newParams = new URLSearchParams();
            inputs.forEach(input => {
                newParams.append(input.id, input.value.trim());
            });
            
            const apiUrl = `${window.location.origin}${path.split('?')[0]}?${newParams.toString()}`;
            
            // Make API request
            await fetchAPI(apiUrl, responseContent);
        };
    } else {
        // No parameters - hide try it button and make request immediately
        tryItBtn.style.display = 'none';
        const apiUrl = `${window.location.origin}${path}`;
        await fetchAPI(apiUrl, responseContent);
    }
    
    // Show modal
    modal.classList.add('active');
}

async function fetchAPI(url, responseElement) {
    const loader = document.querySelector('.response-loader');
    
    try {
        // Show loader
        loader.classList.add('active');
        responseElement.textContent = '';
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        responseElement.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        responseElement.textContent = `Error: ${error.message}`;
    } finally {
        // Hide loader
        loader.classList.remove('active');
    }
}

// Contributors page functionality
if (window.location.pathname.includes('contributors.html')) {
    document.addEventListener('DOMContentLoaded', async () => {
        const contributorsContainer = document.getElementById('contributors-container');
        
        try {
            const settings = await fetch('/src/settings.json').then(res => res.json());
            
            if (settings.contribute && settings.contribute.length > 0) {
                contributorsContainer.innerHTML = settings.contribute.map(contributor => `
                    <div class="contributor-card">
                        <div class="contributor-header"></div>
                        <img src="https://avatars.githubusercontent.com/${contributor.github.split('/').pop()}" 
                             alt="${contributor.name}" 
                             class="contributor-avatar"
                             onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(contributor.name)}&background=random'">
                        <div class="contributor-body">
                            <h3 class="contributor-name">${contributor.name}</h3>
                            <span class="contributor-role">${contributor.role || 'Contributor'}</span>
                            <div class="contributor-stats">
                                <div class="stat-item">
                                    <div class="stat-value">${Math.floor(Math.random() * 50) + 10}</div>
                                    <div class="stat-label">Commits</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">${Math.floor(Math.random() * 20) + 5}</div>
                                    <div class="stat-label">PRs</div>
                                </div>
                            </div>
                            <p class="contributor-bio">${contributor.bio || 'A passionate contributor to Nazir API.'}</p>
                            <div class="contributor-social">
                                <a href="${contributor.github}" class="social-icon github-icon" target="_blank">
                                    <i class="fab fa-github"></i>
                                </a>
                                <a href="mailto:${contributor.email}" class="social-icon email-icon" target="_blank">
                                    <i class="fas fa-envelope"></i>
                                </a>
                                <a href="https://wa.me/${contributor.whatsapp}" class="social-icon whatsapp-icon" target="_blank">
                                    <i class="fab fa-whatsapp"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                `).join('');
            } else {
                contributorsContainer.innerHTML = `
                    <div class="no-contributors">
                        <p>No contributors found.</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading contributors:', error);
            contributorsContainer.innerHTML = `
                <div class="error-loading">
                    <p>Error loading contributors. Please try again later.</p>
                </div>
            `;
        }
    });
}