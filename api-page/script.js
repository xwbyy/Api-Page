document.addEventListener('DOMContentLoaded', async () => {
    // Show loading screen
    const loadingScreen = document.getElementById('loadingScreen');
    document.body.classList.add('no-scroll');
    
    try {
        // Load settings
        const settings = await fetch('/src/settings.json').then(res => res.json());
        
        // Set page title and header
        document.title = settings.name || 'Nazir API Services';
        
        // Initialize mobile menu
        const mobileMenuButton = document.querySelector('.mobile-menu-button');
        const navLinks = document.querySelector('.nav-links');
        
        if (mobileMenuButton && navLinks) {
            mobileMenuButton.addEventListener('click', () => {
                navLinks.classList.toggle('active');
            });
        }
        
        // Initialize API content
        if (document.getElementById('apiContent')) {
            await initializeApiContent(settings);
        }
        
        // Initialize contributors
        if (document.getElementById('contributorsContainer')) {
            await initializeContributors(settings);
        }
        
        // Hide loading screen after 1.5 seconds
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

// Initialize API content
async function initializeApiContent(settings) {
    const apiContent = document.getElementById('apiContent');
    const searchInput = document.getElementById('searchInput');
    
    // Clear existing content
    apiContent.innerHTML = '';
    
    // Group endpoints by category
    const categories = {};
    settings.categories.forEach(category => {
        categories[category.name] = category.items;
    });
    
    // Create API cards for each category
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
                    <span class="api-card-method">GET</span>
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
    
    // Initialize search functionality
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
        
        // Hide empty categories
        document.querySelectorAll('.category-container').forEach(container => {
            const visibleCards = container.querySelectorAll('.api-card[style="display: block;"]');
            const categoryTitle = container.previousElementSibling;
            
            if (visibleCards.length === 0) {
                categoryTitle.style.display = 'none';
                container.style.display = 'none';
            } else {
                categoryTitle.style.display = 'block';
                container.style.display = 'grid';
            }
        });
    });
    
    // Initialize API modal
    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('api-card-button')) {
            const button = e.target;
            const path = button.dataset.path;
            const name = button.dataset.name;
            const desc = button.dataset.desc;
            
            await showApiModal(path, name, desc);
        }
    });
    
    // Initialize copy button
    document.addEventListener('click', (e) => {
        if (e.target.id === 'copyEndpoint' || e.target.closest('#copyEndpoint')) {
            const endpointUrl = document.getElementById('endpointUrl').textContent;
            navigator.clipboard.writeText(endpointUrl);
            
            const copyBtn = e.target.closest('button');
            copyBtn.innerHTML = '<i class="fas fa-check"></i>';
            copyBtn.style.color = 'var(--success-color)';
            
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="far fa-copy"></i>';
                copyBtn.style.color = '';
            }, 2000);
        }
    });
}

// Show API modal
async function showApiModal(path, name, desc) {
    const modal = document.getElementById('apiModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const endpointUrl = document.getElementById('endpointUrl');
    const queryParamsContainer = document.getElementById('queryParamsContainer');
    const tryEndpointBtn = document.getElementById('tryEndpoint');
    const responseLoader = document.getElementById('responseLoader');
    const responseContent = document.getElementById('responseContent');
    
    // Set modal content
    modalTitle.textContent = name;
    modalDescription.textContent = desc;
    endpointUrl.textContent = `${window.location.origin}${path}`;
    queryParamsContainer.innerHTML = '';
    responseContent.textContent = '';
    responseContent.classList.add('d-none');
    
    // Parse query parameters
    const url = new URL(path, window.location.origin);
    const params = new URLSearchParams(url.search);
    
    if (params.toString()) {
        const paramsForm = document.createElement('div');
        paramsForm.className = 'query-params';
        
        params.forEach((value, key) => {
            const paramGroup = document.createElement('div');
            paramGroup.className = 'param-group';
            
            paramGroup.innerHTML = `
                <label class="param-label">${key}</label>
                <input type="text" class="param-input" data-param="${key}" placeholder="Enter ${key}">
            `;
            
            paramsForm.appendChild(paramGroup);
        });
        
        queryParamsContainer.appendChild(paramsForm);
    }
    
    // Show modal
    modal.classList.add('active');
    
    // Close modal when clicking overlay or close button
    modal.querySelector('.modal-overlay').addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    modal.querySelector('.modal-close').addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    // Try endpoint button
    tryEndpointBtn.addEventListener('click', async () => {
        let apiUrl = `${window.location.origin}${path.split('?')[0]}`;
        const paramInputs = document.querySelectorAll('.param-input');
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
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                responseContent.textContent = JSON.stringify(data, null, 2);
            } else if (contentType && contentType.includes('image/')) {
                const blob = await response.blob();
                const imageUrl = URL.createObjectURL(blob);
                responseContent.innerHTML = `<img src="${imageUrl}" alt="API Response" style="max-width: 100%;">`;
            } else {
                const text = await response.text();
                responseContent.textContent = text;
            }
            
            endpointUrl.textContent = apiUrl;
        } catch (error) {
            responseContent.textContent = `Error: ${error.message}`;
        } finally {
            responseLoader.classList.remove('active');
            responseContent.classList.remove('d-none');
        }
    });
}

// Initialize contributors
async function initializeContributors(settings) {
    const contributorsContainer = document.getElementById('contributorsContainer');
    
    if (!contributorsContainer || !settings.contribute) return;
    
    contributorsContainer.innerHTML = '';
    
    settings.contribute.forEach(contributor => {
        const contributorCard = document.createElement('div');
        contributorCard.className = 'contributor-card';
        
        contributorCard.innerHTML = `
            <div class="contributor-bg"></div>
            <img src="https://avatars.githubusercontent.com/${contributor.github.split('/').pop()}" 
                 alt="${contributor.name}" 
                 class="contributor-avatar"
                 onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(contributor.name)}&background=random'">
            <div class="contributor-info">
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
                <p class="contributor-bio">${contributor.bio || 'A passionate developer contributing to the project.'}</p>
                <div class="contributor-social">
                    <a href="${contributor.github}" class="social-icon" target="_blank">
                        <i class="fab fa-github"></i>
                    </a>
                    <a href="mailto:${contributor.email}" class="social-icon" target="_blank">
                        <i class="fas fa-envelope"></i>
                    </a>
                    <a href="https://wa.me/${contributor.whatsapp}" class="social-icon" target="_blank">
                        <i class="fab fa-whatsapp"></i>
                    </a>
                </div>
            </div>
        `;
        
        contributorsContainer.appendChild(contributorCard);
    });
}

// Handle scroll events for navbar
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});