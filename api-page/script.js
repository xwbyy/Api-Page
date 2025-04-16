document.addEventListener('DOMContentLoaded', async () => {
    const loadingScreen = document.getElementById('loadingScreen');
    document.body.classList.add('no-scroll');
    
    try {
        const settings = await fetch('/src/settings.json').then(res => res.json());
        document.title = settings.name || 'Xwby API Services';
        
        // Initialize mobile menu
        const mobileMenuButton = document.querySelector('.mobile-menu-button');
        const navLinks = document.querySelector('.nav-links');
        
        if (mobileMenuButton && navLinks) {
            mobileMenuButton.addEventListener('click', () => {
                navLinks.classList.toggle('active');
            });
        }
        
        // Initialize API content if on API list page
        if (document.getElementById('apiContent')) {
            await initializeApiContent(settings);
        }
        
        // Initialize contributors if on contributors page
        if (document.getElementById('contributorsContainer')) {
            await initializeContributors(settings);
        }
        
        // Initialize scroll behavior for navbar
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
        
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            document.body.classList.remove('no-scroll');
        }, 1500);
    } catch (error) {
        console.error('Error initializing application:', error);
        loadingScreen.classList.add('hidden');
        document.body.classList.remove('no-scroll');
    }
});

async function initializeApiContent(settings) {
    const apiContent = document.getElementById('apiContent');
    const searchInput = document.getElementById('searchInput');
    
    apiContent.innerHTML = '';
    
    const categories = {};
    settings.categories.forEach(category => {
        categories[category.name] = category.items;
    });
    
    for (const [categoryName, endpoints] of Object.entries(categories)) {
        const categoryHeader = document.createElement('h3');
        categoryHeader.className = 'category-title';
        categoryHeader.textContent = categoryName;
        apiContent.appendChild(categoryHeader);
        
        const categoryContainer = document.createElement('div');
        categoryContainer.className = 'category-container';
        
        endpoints.forEach(endpoint => {
            const apiCard = document.createElement('div');
            apiCard.className = 'api-card';
            apiCard.dataset.name = endpoint.name.toLowerCase();
            apiCard.dataset.desc = endpoint.desc.toLowerCase();
            
            apiCard.innerHTML = `
                <div class="api-card-header">
                    <h3 class="api-card-title">${endpoint.name}</h3>
                    <span class="api-card-method">${endpoint.method || 'GET'}</span>
                </div>
                <p class="api-card-description">${endpoint.desc}</p>
                <div class="api-card-footer">
                    <button class="api-card-button" 
                            data-path="${endpoint.path}" 
                            data-name="${endpoint.name}" 
                            data-desc="${endpoint.desc}">
                        Try it out
                    </button>
                </div>
            `;
            
            categoryContainer.appendChild(apiCard);
        });
        
        apiContent.appendChild(categoryContainer);
    }
    
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase();
            const apiCards = document.querySelectorAll('.api-card');
            
            apiCards.forEach(card => {
                const name = card.dataset.name;
                const desc = card.dataset.desc;
                
                if (name.includes(searchTerm) || desc.includes(searchTerm)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
    
    // Handle API card clicks
    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('api-card-button')) {
            const button = e.target;
            const path = button.dataset.path;
            const name = button.dataset.name;
            const desc = button.dataset.desc;
            
            // Create modal
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.id = 'apiModal';
            modal.innerHTML = `
                <div class="modal-overlay"></div>
                <div class="modal-content">
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="modal-header">
                        <h3 id="modalTitle">${name}</h3>
                        <p id="modalDescription">${desc}</p>
                    </div>
                    <div class="modal-body">
                        <div class="endpoint-url">
                            <code id="endpointUrl">${window.location.origin}${path}</code>
                            <button class="copy-btn" id="copyEndpoint">
                                <i class="far fa-copy"></i>
                            </button>
                        </div>
                        <div id="queryParamsContainer"></div>
                        <div class="response-container">
                            <div class="response-header">
                                <h4>Response</h4>
                                <button class="btn btn-small" id="tryEndpoint">Try It</button>
                            </div>
                            <div class="response-loader" id="responseLoader">
                                <div class="loader-spinner small"></div>
                                <span>Loading response...</span>
                            </div>
                            <pre class="response-content" id="responseContent"></pre>
                        </div>
                    </div>
                </div>
            `;
            
            document.getElementById('modalContainer').appendChild(modal);
            initializeModal(modal, path);
        }
    });
}

function initializeModal(modal, path) {
    const modalOverlay = modal.querySelector('.modal-overlay');
    const modalClose = modal.querySelector('.modal-close');
    const tryEndpointBtn = modal.querySelector('#tryEndpoint');
    const responseLoader = modal.querySelector('#responseLoader');
    const responseContent = modal.querySelector('#responseContent');
    const copyBtn = modal.querySelector('#copyEndpoint');
    
    // Show modal
    modal.classList.add('active');
    
    // Close modal
    modalOverlay.addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    });
    
    modalClose.addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    });
    
    // Copy endpoint URL
    copyBtn.addEventListener('click', () => {
        const endpointUrl = modal.querySelector('#endpointUrl').textContent;
        navigator.clipboard.writeText(endpointUrl);
        
        copyBtn.innerHTML = '<i class="fas fa-check"></i>';
        copyBtn.style.color = 'var(--success-color)';
        
        setTimeout(() => {
            copyBtn.innerHTML = '<i class="far fa-copy"></i>';
            copyBtn.style.color = '';
        }, 2000);
    });
    
    // Try endpoint
    tryEndpointBtn.addEventListener('click', async () => {
        let apiUrl = `${window.location.origin}${path.split('?')[0]}`;
        const paramInputs = modal.querySelectorAll('.param-input');
        const params = new URLSearchParams();
        
        // Validate inputs
        let isValid = true;
        paramInputs.forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('error');
                isValid = false;
            } else {
                input.classList.remove('error');
                params.append(input.dataset.param, input.value.trim());
            }
        });
        
        if (!isValid) {
            responseContent.textContent = 'Please fill in all required fields.';
            responseContent.classList.remove('d-none');
            return;
        }
        
        // Add query params if they exist
        if (params.toString()) {
            apiUrl += `?${params.toString()}`;
        }
        
        // Show loader
        responseLoader.classList.add('active');
        responseContent.classList.add('d-none');
        
        try {
            const response = await fetch(apiUrl);
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                responseContent.textContent = JSON.stringify(data, null, 2);
            } else if (contentType && contentType.includes('image/')) {
                const blob = await response.blob();
                const imageUrl = URL.createObjectURL(blob);
                responseContent.innerHTML = `<img src="${imageUrl}" alt="API Response">`;
            } else {
                const text = await response.text();
                responseContent.textContent = text;
            }
            
            modal.querySelector('#endpointUrl').textContent = apiUrl;
        } catch (error) {
            responseContent.textContent = `Error: ${error.message}`;
        } finally {
            responseLoader.classList.remove('active');
            responseContent.classList.remove('d-none');
        }
    });
}

async function initializeContributors(settings) {
    const contributorsContainer = document.getElementById('contributorsContainer');
    
    if (!contributorsContainer) return;
    
    try {
        const response = await fetch('/src/contributors.json');
        const contributors = await response.json();
        
        contributorsContainer.innerHTML = '';
        
        contributors.forEach(contributor => {
            const contributorCard = document.createElement('div');
            contributorCard.className = 'contributor-card';
            
            contributorCard.innerHTML = `
                <div class="contributor-bg"></div>
                <img src="${contributor.avatar}" alt="${contributor.name}" class="contributor-avatar">
                <div class="contributor-info">
                    <h3 class="contributor-name">${contributor.name}</h3>
                    <span class="contributor-role">${contributor.role}</span>
                    <p class="contributor-bio">${contributor.bio}</p>
                    <div class="contributor-social">
                        ${contributor.social.map(social => `
                            <a href="${social.url}" class="social-icon" target="_blank" rel="noopener noreferrer">
                                <i class="${social.icon}"></i>
                            </a>
                        `).join('')}
                    </div>
                </div>
            `;
            
            contributorsContainer.appendChild(contributorCard);
        });
    } catch (error) {
        console.error('Error loading contributors:', error);
        contributorsContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load contributors. Please try again later.</p>
            </div>
        `;
    }
}
