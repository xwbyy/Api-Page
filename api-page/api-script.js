document.addEventListener('DOMContentLoaded', async () => {
    const loadingScreen = document.getElementById("loadingScreen");
    const body = document.body;
    
    try {
        // Load settings first
        const [settings] = await Promise.all([
            fetch('/src/settings.json').then(res => res.json()),
            new Promise(resolve => setTimeout(resolve, 500)) // Minimum loading time
        ]);

        // Set page title
        document.title = `API List - ${settings.name}`;

        // Display API categories and items
        const apiContent = document.getElementById('apiContent');
        apiContent.innerHTML = ''; // Clear loading state
        
        settings.categories.forEach((category) => {
            const sortedItems = category.items.sort((a, b) => a.name.localeCompare(b.name));
            
            const categoryContent = sortedItems.map(item => `
                <div class="col-md-6 col-lg-4 mb-4">
                    <div class="api-item-card" data-name="${item.name.toLowerCase()}" data-desc="${item.desc.toLowerCase()}">
                        <h5>${item.name}</h5>
                        <p>${item.desc}</p>
                        <button class="btn btn-sm btn-outline-primary get-api-btn" 
                                data-api-path="${item.path}" 
                                data-api-name="${item.name}" 
                                data-api-desc="${item.desc}">
                            Test Endpoint
                        </button>
                    </div>
                </div>
            `).join('');
            
            apiContent.insertAdjacentHTML('beforeend', `
                <h3 class="category-header">${category.name}</h3>
                <div class="row g-4">${categoryContent}</div>
            `);
        });

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase().trim();
            
            if (!searchTerm) {
                document.querySelectorAll('.api-item-card').forEach(card => {
                    card.closest('.col-md-6').style.display = '';
                });
                document.querySelectorAll('.category-header').forEach(header => {
                    header.style.display = '';
                });
                return;
            }
            
            document.querySelectorAll('.api-item-card').forEach(card => {
                const name = card.getAttribute('data-name');
                const desc = card.getAttribute('data-desc');
                const parentCol = card.closest('.col-md-6');
                
                if (name.includes(searchTerm) || desc.includes(searchTerm)) {
                    parentCol.style.display = '';
                } else {
                    parentCol.style.display = 'none';
                }
            });

            document.querySelectorAll('.category-header').forEach(header => {
                const categoryRow = header.nextElementSibling;
                const visibleItems = categoryRow.querySelectorAll('.col-md-6:not([style*="display: none"])');
                header.style.display = visibleItems.length ? '' : 'none';
            });
        });

        // API modal functionality
        document.addEventListener('click', async (event) => {
            if (!event.target.classList.contains('get-api-btn')) return;

            const { apiPath, apiName, apiDesc } = event.target.dataset;
            const modal = new bootstrap.Modal(document.getElementById('apiResponseModal'));
            const modalRefs = {
                label: document.getElementById('apiResponseModalLabel'),
                desc: document.getElementById('apiResponseModalDesc'),
                content: document.getElementById('apiResponseContent'),
                endpoint: document.getElementById('apiEndpoint'),
                spinner: document.getElementById('apiResponseLoading'),
                queryInputContainer: document.getElementById('apiQueryInputContainer'),
                submitBtn: document.getElementById('submitQueryBtn')
            };

            // Set modal content
            modalRefs.label.textContent = apiName;
            modalRefs.desc.textContent = apiDesc;
            modalRefs.content.textContent = '';
            modalRefs.content.classList.add('d-none');
            modalRefs.spinner.classList.add('d-none');
            
            // Clear previous inputs
            modalRefs.queryInputContainer.innerHTML = '';
            modalRefs.submitBtn.classList.add('d-none');

            let baseApiUrl = `${window.location.origin}${apiPath}`;
            let params = new URLSearchParams(apiPath.split('?')[1]);
            let hasParams = params.toString().length > 0;

            if (hasParams) {
                const paramContainer = document.createElement('div');
                paramContainer.className = 'param-container';

                const paramsArray = Array.from(params.keys());
                
                paramsArray.forEach((param, index) => {
                    const paramGroup = document.createElement('div');
                    paramGroup.className = index < paramsArray.length - 1 ? 'mb-2' : '';

                    const label = document.createElement('label');
                    label.textContent = param;
                    label.className = 'form-label';
                    label.style.fontSize = '0.8rem';
                    label.style.fontWeight = '500';
                    label.style.marginBottom = '5px';
                    label.style.display = 'block';

                    const inputField = document.createElement('input');
                    inputField.type = 'text';
                    inputField.className = 'form-control';
                    inputField.placeholder = `Enter ${param}...`;
                    inputField.dataset.param = param;
                    inputField.required = true;
                    inputField.addEventListener('input', () => {
                        const inputs = document.querySelectorAll('.param-container input');
                        const isValid = Array.from(inputs).every(input => input.value.trim() !== '');
                        modalRefs.submitBtn.disabled = !isValid;
                    });

                    paramGroup.appendChild(label);
                    paramGroup.appendChild(inputField);
                    paramContainer.appendChild(paramGroup);
                });
                
                const currentItem = settings.categories
                    .flatMap(category => category.items)
                    .find(item => item.path === apiPath);

                if (currentItem && currentItem.innerDesc) {
                    const innerDescDiv = document.createElement('div');
                    innerDescDiv.className = 'text-muted mt-3';
                    innerDescDiv.style.fontSize = '0.8rem';
                    innerDescDiv.innerHTML = currentItem.innerDesc.replace(/\n/g, '<br>');
                    paramContainer.appendChild(innerDescDiv);
                }

                modalRefs.queryInputContainer.appendChild(paramContainer);
                modalRefs.submitBtn.classList.remove('d-none');
                modalRefs.submitBtn.disabled = true;

                modalRefs.submitBtn.onclick = async () => {
                    const inputs = modalRefs.queryInputContainer.querySelectorAll('input');
                    const newParams = new URLSearchParams();
                    let isValid = true;

                    inputs.forEach(input => {
                        if (!input.value.trim()) {
                            isValid = false;
                            input.classList.add('is-invalid');
                        } else {
                            input.classList.remove('is-invalid');
                            newParams.append(input.dataset.param, input.value.trim());
                        }
                    });

                    if (!isValid) {
                        modalRefs.content.textContent = 'Please fill in all required fields.';
                        modalRefs.content.classList.remove('d-none');
                        return;
                    }

                    const apiUrlWithParams = `${window.location.origin}${apiPath.split('?')[0]}?${newParams.toString()}`;
                    await handleApiRequest(apiUrlWithParams, modalRefs, apiName);
                };
            } else {
                await handleApiRequest(baseApiUrl, modalRefs, apiName);
            }

            modal.show();
        });

        async function handleApiRequest(apiUrl, modalRefs, apiName) {
            modalRefs.endpoint.textContent = apiUrl;
            modalRefs.spinner.classList.remove('d-none');
            modalRefs.content.classList.add('d-none');

            try {
                const response = await fetch(apiUrl);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const contentType = response.headers.get('Content-Type');
                if (contentType && contentType.startsWith('image/')) {
                    const blob = await response.blob();
                    const imageUrl = URL.createObjectURL(blob);

                    const img = document.createElement('img');
                    img.src = imageUrl;
                    img.alt = apiName;
                    img.style.maxWidth = '100%';
                    img.style.height = 'auto';
                    img.style.borderRadius = '5px';

                    modalRefs.content.innerHTML = '';
                    modalRefs.content.appendChild(img);
                } else {
                    const data = await response.json();
                    modalRefs.content.textContent = JSON.stringify(data, null, 2);
                }
            } catch (error) {
                modalRefs.content.textContent = `Error: ${error.message}`;
            } finally {
                modalRefs.spinner.classList.add('d-none');
                modalRefs.content.classList.remove('d-none');
            }
        }
    } catch (error) {
        console.error('Error loading settings:', error);
        document.getElementById('apiContent').innerHTML = `
            <div class="alert alert-danger">
                Failed to load API list. Please try again later.
            </div>
        `;
    } finally {
        loadingScreen.style.display = "none";
        body.classList.remove("no-scroll");
    }
});