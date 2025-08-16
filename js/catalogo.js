// Catálogo de Productos - JavaScript Principal
class ProductCatalog {
    constructor() {
        this.productos = [];
        this.categorias = [];
        this.marcas = [];
        this.filteredProducts = [];
        this.currentFilters = {
            search: '',
            categoria: [],
            marca: [],
            tipo: [],
            estado: [],
            priceMin: null,
            priceMax: null
        };
        this.currentSort = 'fecha';
        this.currentImageIndex = 0;
        this.currentProduct = null;
        
        // Paginación
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.totalPages = 1;
        this.paginatedProducts = [];

        this.init();
    }

    async init() {
        await this.loadProductsData();
        this.setupEventListeners();
        this.renderFilters();
        this.updatePagination();
        this.renderCurrentPage();
    }

    async loadProductsData() {
        try {
            const response = await fetch('assets/Json/productos.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Filtrar solo productos disponibles (disponible: true)
            const todosLosProductos = data.productos || [];
            this.productos = todosLosProductos.filter(producto => producto.disponible === true);
            
            this.categorias = data.categorias || [];
            this.marcas = data.marcas || [];
            this.filteredProducts = [...this.productos];
            
            console.log('Productos totales en JSON:', todosLosProductos.length);
            console.log('Productos disponibles cargados:', this.productos.length);
            console.log('Productos no disponibles filtrados:', todosLosProductos.length - this.productos.length);
            console.log('Categorías cargadas:', this.categorias.length);
            console.log('Marcas cargadas:', this.marcas.length);
            
            this.hideLoading();
        } catch (error) {
            console.error('Error loading products data:', error);
            this.showError('Error al cargar los productos: ' + error.message);
        }
    }

    setupEventListeners() {
        // Búsqueda
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentFilters.search = e.target.value.toLowerCase();
                this.applyFilters();
            });
        }
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.applyFilters();
            });
        }

        // Filtros
        document.addEventListener('change', (e) => {
            if (e.target.matches('input[name="categoria"]')) {
                this.updateArrayFilter('categoria', e.target.value, e.target.checked);
            }
            if (e.target.matches('input[name="marca"]')) {
                this.updateArrayFilter('marca', e.target.value, e.target.checked);
            }
            if (e.target.matches('input[name="tipo"]')) {
                this.updateArrayFilter('tipo', e.target.value, e.target.checked);
            }
            if (e.target.matches('input[name="estado"]')) {
                this.updateArrayFilter('estado', e.target.value, e.target.checked);
            }
        });

        // Filtro de precio
        const applyPriceBtn = document.getElementById('applyPriceFilter');
        if (applyPriceBtn) {
            applyPriceBtn.addEventListener('click', () => {
                const minPrice = document.getElementById('minPrice').value;
                const maxPrice = document.getElementById('maxPrice').value;
                
                this.currentFilters.priceMin = minPrice ? parseInt(minPrice) : null;
                this.currentFilters.priceMax = maxPrice ? parseInt(maxPrice) : null;
                this.applyFilters();
            });
        }

        // Limpiar filtros
        const clearFiltersBtn = document.getElementById('clearFilters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.clearAllFilters();
            });
        }

        // Ordenamiento
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.sortAndRenderProducts();
            });
        }

        // Paginación
        const itemsPerPageSelect = document.getElementById('itemsPerPage');
        if (itemsPerPageSelect) {
            itemsPerPageSelect.addEventListener('change', (e) => {
                this.itemsPerPage = parseInt(e.target.value);
                this.currentPage = 1;
                this.updatePagination();
                this.renderCurrentPage();
            });
        }

        // Modal
        const modal = document.getElementById('productModal');
        const closeModal = document.getElementById('closeModal');
        
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.closeModal();
            });
        }
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }

        // Navegación de imágenes en modal
        const prevImage = document.getElementById('prevImage');
        const nextImage = document.getElementById('nextImage');
        
        if (prevImage) {
            prevImage.addEventListener('click', () => {
                this.changeModalImage(-1);
            });
        }
        
        if (nextImage) {
            nextImage.addEventListener('click', () => {
                this.changeModalImage(1);
            });
        }

        // Teclas del modal
        document.addEventListener('keydown', (e) => {
            if (modal && modal.classList.contains('active')) {
                if (e.key === 'Escape') {
                    this.closeModal();
                }
                if (e.key === 'ArrowLeft') {
                    this.changeModalImage(-1);
                }
                if (e.key === 'ArrowRight') {
                    this.changeModalImage(1);
                }
            }
        });

        // Toggle de filtros móviles
        this.setupMobileFilters();
    }

    setupMobileFilters() {
        const filtrosToggle = document.getElementById('filtrosToggle');
        const filtrosOverlay = document.getElementById('filtrosOverlay');
        const filtrosSidebar = document.querySelector('.filtros-sidebar');

        if (filtrosToggle && filtrosOverlay && filtrosSidebar) {
            // Abrir filtros
            filtrosToggle.addEventListener('click', () => {
                filtrosSidebar.classList.add('mobile-open');
                filtrosOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            });

            // Cerrar filtros con overlay
            filtrosOverlay.addEventListener('click', () => {
                this.closeMobileFilters();
            });

            // Cerrar filtros con tecla Escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && filtrosSidebar.classList.contains('mobile-open')) {
                    this.closeMobileFilters();
                }
            });

            // Cerrar filtros automáticamente cuando se aplica un filtro en móvil
            document.addEventListener('change', (e) => {
                if (window.innerWidth <= 768 && 
                    (e.target.matches('input[name="categoria"]') || 
                     e.target.matches('input[name="marca"]') || 
                     e.target.matches('input[name="tipo"]') || 
                     e.target.matches('input[name="estado"]'))) {
                    // Cerrar después de un pequeño delay para que el usuario vea el cambio
                    setTimeout(() => {
                        this.closeMobileFilters();
                    }, 300);
                }
            });
        }
    }

    closeMobileFilters() {
        const filtrosSidebar = document.querySelector('.filtros-sidebar');
        const filtrosOverlay = document.getElementById('filtrosOverlay');

        if (filtrosSidebar && filtrosOverlay) {
            filtrosSidebar.classList.remove('mobile-open');
            filtrosOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    renderFilters() {
        // Renderizar filtros de categoría con iconos
        const categoriaFilters = document.getElementById('categoriaFilters');
        if (categoriaFilters) {
            categoriaFilters.innerHTML = this.categorias.map(categoria => {
                // Obtener ícono de la categoría o usar uno por defecto
                const iconClass = categoria.icono || 'fas fa-cog';
                return `
                    <label class="filter-checkbox" data-category="${categoria.id}">
                        <input type="checkbox" name="categoria" value="${categoria.id}">
                        <span class="checkmark"></span>
                        <span class="filter-label">
                            <i class="${iconClass}"></i>
                            ${categoria.nombre}
                        </span>
                        <span class="filter-count">0</span>
                    </label>
                `;
            }).join('');
        }

        // Renderizar filtros de marca con iconos
        const marcaFilters = document.getElementById('marcaFilters');
        if (marcaFilters) {
            marcaFilters.innerHTML = this.marcas.map(marca => {
                return `
                    <label class="filter-checkbox" data-brand="${marca.id}">
                        <input type="checkbox" name="marca" value="${marca.id}">
                        <span class="checkmark"></span>
                        <span class="filter-label">
                            <i class="fas fa-industry"></i>
                            ${marca.nombre}
                        </span>
                        <span class="filter-count">0</span>
                    </label>
                `;
            }).join('');
        }

        // Actualizar contadores de filtros
        this.updateFilterCounts();
        
        // Agregar event listeners para los nuevos checkboxes
        this.setupFilterEventListeners();
    }

    setupFilterEventListeners() {
        // Event listeners para checkboxes de categoría y marca
        document.querySelectorAll('.filter-checkbox input').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const parent = e.target.closest('.filter-checkbox');
                
                if (e.target.checked) {
                    parent.classList.add('active');
                } else {
                    parent.classList.remove('active');
                }
                
                // Aplicar filtro específico
                if (e.target.name === 'categoria') {
                    this.updateArrayFilter('categoria', e.target.value, e.target.checked);
                } else if (e.target.name === 'marca') {
                    this.updateArrayFilter('marca', e.target.value, e.target.checked);
                }
                
                this.updateFilterIndicators();
            });
        });
    }

    updateFilterCounts() {
        // Actualizar contadores para categorías
        this.categorias.forEach(categoria => {
            const count = this.productos.filter(p => p.categoria === categoria.id).length;
            const filterElement = document.querySelector(`.filter-checkbox[data-category="${categoria.id}"] .filter-count`);
            if (filterElement) {
                filterElement.textContent = count;
                if (count > 0) {
                    filterElement.style.opacity = '0.7';
                }
            }
        });

        // Actualizar contadores para marcas
        this.marcas.forEach(marca => {
            const count = this.productos.filter(p => p.marca === marca.id).length;
            const filterElement = document.querySelector(`.filter-checkbox[data-brand="${marca.id}"] .filter-count`);
            if (filterElement) {
                filterElement.textContent = count;
                if (count > 0) {
                    filterElement.style.opacity = '0.7';
                }
            }
        });
    }

    // Función para aplicar filtro de precio (llamable desde HTML)
    applyPriceFilter() {
        const minPrice = document.getElementById('minPrice').value;
        const maxPrice = document.getElementById('maxPrice').value;
        
        this.currentFilters.priceMin = minPrice ? parseInt(minPrice) : null;
        this.currentFilters.priceMax = maxPrice ? parseInt(maxPrice) : null;
        this.applyFilters();
        this.updateFilterIndicators();
    }

    updateArrayFilter(filterType, value, checked) {
        if (checked) {
            if (!this.currentFilters[filterType].includes(value)) {
                this.currentFilters[filterType].push(value);
            }
        } else {
            const index = this.currentFilters[filterType].indexOf(value);
            if (index > -1) {
                this.currentFilters[filterType].splice(index, 1);
            }
        }
        this.applyFilters();
    }

    applyFilters() {
        this.filteredProducts = this.productos.filter(producto => {
            // Filtro de búsqueda
            if (this.currentFilters.search && 
                !producto.nombre.toLowerCase().includes(this.currentFilters.search) &&
                !producto.marca.toLowerCase().includes(this.currentFilters.search) &&
                !producto.descripcion.toLowerCase().includes(this.currentFilters.search)) {
                return false;
            }

            // Filtro de categoría
            if (this.currentFilters.categoria.length > 0 && 
                !this.currentFilters.categoria.includes(producto.categoria)) {
                return false;
            }

            // Filtro de marca
            if (this.currentFilters.marca.length > 0) {
                const marcaId = producto.marca.toLowerCase().replace(/\s+/g, '-');
                if (!this.currentFilters.marca.includes(marcaId)) {
                    return false;
                }
            }

            // Filtro de tipo
            if (this.currentFilters.tipo.length > 0 && 
                !this.currentFilters.tipo.includes(producto.tipo)) {
                return false;
            }

            // Filtro de estado
            if (this.currentFilters.estado.length > 0 && 
                !this.currentFilters.estado.includes(producto.estado)) {
                return false;
            }

            // Filtro de precio
            if (this.currentFilters.priceMin !== null) {
                const productPrice = producto.precio || 0;
                if (productPrice < this.currentFilters.priceMin) {
                    return false;
                }
            }

            if (this.currentFilters.priceMax !== null) {
                const productPrice = producto.precio || 0;
                if (productPrice > this.currentFilters.priceMax) {
                    return false;
                }
            }

            return true;
        });

        this.currentPage = 1; // Reset to first page when filters change
        this.sortAndRenderProducts();
    }

    sortAndRenderProducts() {
        // Ordenar productos
        this.filteredProducts.sort((a, b) => {
            switch (this.currentSort) {
                case 'precio-asc':
                    const precioA = a.precio || 0;
                    const precioB = b.precio || 0;
                    return precioA - precioB;
                case 'precio-desc':
                    const precioDescA = a.precio || 0;
                    const precioDescB = b.precio || 0;
                    return precioDescB - precioDescA;
                case 'año-desc':
                    const añoDescA = a.año || 0;
                    const añoDescB = b.año || 0;
                    return añoDescB - añoDescA;
                case 'año-asc':
                    const añoAscA = a.año || 0;
                    const añoAscB = b.año || 0;
                    return añoAscA - añoAscB;
                case 'nombre':
                    return a.nombre.localeCompare(b.nombre);
                case 'fecha':
                default:
                    return new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion);
            }
        });

        this.updatePagination();
        this.renderCurrentPage();
    }

    renderProducts() {
        const productosGrid = document.getElementById('productosGrid');
        const productCount = document.getElementById('productCount');
        const noResults = document.getElementById('noResults');

        // Actualizar contador
        if (productCount) {
            const count = this.filteredProducts.length;
            const totalDisponibles = this.productos.length;
            productCount.innerHTML = `
                <span class="products-count">${count} producto${count !== 1 ? 's' : ''} encontrado${count !== 1 ? 's' : ''}</span>
                <span class="products-available" title="Solo se muestran productos disponibles">
                    <i class="fas fa-check-circle" style="color: #27ae60;"></i>
                    ${totalDisponibles} disponible${totalDisponibles !== 1 ? 's' : ''}
                </span>
            `;
        }

        // Mostrar/ocultar sin resultados
        if (noResults) {
            noResults.style.display = this.filteredProducts.length === 0 ? 'block' : 'none';
        }

        // Usar productos paginados o filtrados según corresponda
        const productsToRender = this.paginatedProducts.length > 0 ? this.paginatedProducts : this.filteredProducts;

        // Renderizar productos
        if (productosGrid) {
            productosGrid.innerHTML = productsToRender.map(producto => {
                const precio = producto.precio ? `${producto.moneda} ${producto.precio.toLocaleString()}` : 'Consultar precio';
                const año = producto.año ? producto.año : 'N/A';
                const horas = producto.horas ? `${producto.horas.toLocaleString()} hrs` : 'N/A';
                
                return `
                <div class="producto-card" onclick="productCatalog.openProductModal(${producto.id})">
                    <div class="producto-image">
                        <img src="${producto.imagenes[0]}" alt="${producto.nombre}" loading="lazy">
                        <div class="producto-badges">
                            <span class="badge ${producto.tipo}">${producto.tipo}</span>
                            <span class="badge ${producto.estado}">${producto.estado}</span>
                        </div>
                        <div class="producto-price">
                            ${precio}
                        </div>
                    </div>
                    <div class="producto-content">
                        <h3>${producto.nombre}</h3>
                        <div class="producto-details">
                            <div class="detail">
                                <i class="fas fa-industry"></i>
                                <span>${producto.marca}</span>
                            </div>
                            <div class="detail">
                                <i class="fas fa-calendar-alt"></i>
                                <span>${año}</span>
                            </div>
                            <div class="detail">
                                <i class="fas fa-clock"></i>
                                <span>${horas}</span>
                            </div>
                            <div class="detail">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>${producto.ubicacion}</span>
                            </div>
                        </div>
                        <button class="ver-producto-btn">Ver detalles</button>
                    </div>
                </div>
            `;
            }).join('');
        }
    }

    openProductModal(productId) {
        console.log('Intentando abrir modal para producto:', productId);
        
        const producto = this.productos.find(p => p.id === productId);
        if (!producto) {
            console.error('Producto no encontrado:', productId);
            return;
        }

        console.log('Producto encontrado:', producto);
        this.currentProduct = producto;
        this.currentImageIndex = 0;

        // Verificar y llenar información del modal
        const modalTitle = document.getElementById('modalTitle');
        const modalPrice = document.getElementById('modalPrice');
        const modalTipo = document.getElementById('modalTipo');
        const modalEstado = document.getElementById('modalEstado');
        const modalMarca = document.getElementById('modalMarca');
        const modalModelo = document.getElementById('modalModelo');
        const modalAño = document.getElementById('modalAño');
        const modalHoras = document.getElementById('modalHoras');
        const modalDescripcion = document.getElementById('modalDescripcion');

        if (modalTitle) modalTitle.textContent = producto.nombre || 'Sin nombre';
        
        const precio = producto.precio ? `${producto.moneda || 'USD'} ${producto.precio.toLocaleString()}` : 'Consultar precio';
        if (modalPrice) modalPrice.textContent = precio;
        
        if (modalTipo) {
            modalTipo.textContent = producto.tipo || 'N/A';
            modalTipo.className = `badge ${producto.tipo || ''}`;
        }
        
        if (modalEstado) {
            modalEstado.textContent = producto.estado || 'N/A';
            modalEstado.className = `badge ${producto.estado || ''}`;
        }
        
        if (modalMarca) modalMarca.textContent = producto.marca || 'N/A';
        if (modalModelo) modalModelo.textContent = producto.modelo || 'N/A';
        if (modalAño) modalAño.textContent = producto.año || 'N/A';
        if (modalHoras) modalHoras.textContent = producto.horas ? `${producto.horas.toLocaleString()} hrs` : 'N/A';
        if (modalDescripcion) modalDescripcion.textContent = producto.descripcion || 'Sin descripción disponible';

        // Especificaciones
        const especificacionesContainer = document.getElementById('modalEspecificaciones');
        if (especificacionesContainer && producto.especificaciones) {
            especificacionesContainer.innerHTML = Object.entries(producto.especificaciones).map(([key, value]) => `
                <div class="detail-item">
                    <span class="label">${key.replace(/_/g, ' ')}:</span>
                    <span class="value">${value || 'N/A'}</span>
                </div>
            `).join('');
        }

        // Características
        const caracteristicasContainer = document.getElementById('modalCaracteristicas');
        if (caracteristicasContainer && producto.caracteristicas) {
            caracteristicasContainer.innerHTML = producto.caracteristicas.map(caracteristica => `
                <li>${caracteristica}</li>
            `).join('');
        }

        // Imágenes
        this.updateModalImages();

        // Botones de contacto
        const whatsappBtn = document.getElementById('contactWhatsApp');
        const emailBtn = document.getElementById('contactEmail');

        if (whatsappBtn) {
            whatsappBtn.onclick = () => {
                const precio = producto.precio ? `${producto.moneda} ${producto.precio.toLocaleString()}` : 'Consultar precio';
                const message = `Hola, estoy interesado en: ${producto.nombre} - ${precio}`;
                const whatsappURL = `https://wa.me/51905447143?text=${encodeURIComponent(message)}`;
                window.open(whatsappURL, '_blank');
            };
        }

        if (emailBtn) {
            emailBtn.onclick = () => {
                const precio = producto.precio ? `${producto.moneda} ${producto.precio.toLocaleString()}` : 'Consultar precio';
                const subject = `Consulta sobre: ${producto.nombre}`;
                const body = `Estimados,\n\nEstoy interesado en obtener más información sobre:\n\n${producto.nombre}\nPrecio: ${precio}\n\nQuedo atento a su respuesta.\n\nSaludos cordiales.`;
                const mailtoURL = `mailto:ventas@chycinversiones.pe?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                window.location.href = mailtoURL;
            };
        }

        // Mostrar modal
        const modal = document.getElementById('productModal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            console.error('Modal no encontrado en el DOM');
        }
    }

    updateModalImages() {
        const mainImage = document.getElementById('modalMainImage');
        const thumbnailsContainer = document.getElementById('imageThumbnails');

        if (this.currentProduct && this.currentProduct.imagenes) {
            // Imagen principal
            if (mainImage) {
                mainImage.src = this.currentProduct.imagenes[this.currentImageIndex] || '';
                mainImage.alt = this.currentProduct.nombre || 'Imagen del producto';
            }

            // Miniaturas
            if (thumbnailsContainer) {
                thumbnailsContainer.innerHTML = this.currentProduct.imagenes.map((imagen, index) => `
                    <div class="thumbnail ${index === this.currentImageIndex ? 'active' : ''}" onclick="productCatalog.setModalImage(${index})">
                        <img src="${imagen}" alt="${this.currentProduct.nombre} ${index + 1}">
                    </div>
                `).join('');
            }
        }
    }

    setModalImage(index) {
        this.currentImageIndex = index;
        this.updateModalImages();
    }

    changeModalImage(direction) {
        if (!this.currentProduct) return;

        this.currentImageIndex += direction;
        
        if (this.currentImageIndex < 0) {
            this.currentImageIndex = this.currentProduct.imagenes.length - 1;
        }
        
        if (this.currentImageIndex >= this.currentProduct.imagenes.length) {
            this.currentImageIndex = 0;
        }

        this.updateModalImages();
    }

    closeModal() {
        const modal = document.getElementById('productModal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
        this.currentProduct = null;
    }

    clearAllFilters() {
        // Resetear filtros
        this.currentFilters = {
            search: '',
            categoria: [],
            marca: [],
            tipo: [],
            estado: [],
            priceMin: null,
            priceMax: null
        };

        // Limpiar inputs
        document.getElementById('searchInput').value = '';
        document.getElementById('minPrice').value = '';
        document.getElementById('maxPrice').value = '';

        // Desmarcar checkboxes
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });

        // Reset pagination
        this.currentPage = 1;

        // Reaplicar filtros
        this.applyFilters();
    }

    // ===============================
    // FUNCIONES DE PAGINACIÓN
    // ===============================

    updatePagination() {
        const totalProducts = this.filteredProducts.length;
        this.totalPages = Math.ceil(totalProducts / this.itemsPerPage);
        
        // Asegurar que currentPage esté dentro del rango válido
        if (this.currentPage > this.totalPages) {
            this.currentPage = Math.max(1, this.totalPages);
        }

        this.renderPaginationControls();
        this.updateResultsSummary();
        
        // Mostrar/ocultar contenedor de paginación
        const paginationContainer = document.getElementById('paginationContainer');
        if (paginationContainer) {
            paginationContainer.style.display = totalProducts > this.itemsPerPage ? 'flex' : 'none';
        }
    }

    renderPaginationControls() {
        const paginationControls = document.getElementById('paginationControls');
        if (!paginationControls) return;

        let paginationHTML = '';

        // Botón anterior
        paginationHTML += `
            <button class="pagination-btn pagination-nav ${this.currentPage === 1 ? 'disabled' : ''}" 
                    onclick="productCatalog.goToPage(${this.currentPage - 1})" 
                    ${this.currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
                Anterior
            </button>
        `;

        // Números de página
        const pageNumbers = this.generatePageNumbers();
        pageNumbers.forEach(page => {
            if (page === '...') {
                paginationHTML += `<span class="pagination-ellipsis">...</span>`;
            } else {
                paginationHTML += `
                    <button class="pagination-btn page-number ${page === this.currentPage ? 'active' : ''}" 
                            onclick="productCatalog.goToPage(${page})">
                        ${page}
                    </button>
                `;
            }
        });

        // Botón siguiente
        paginationHTML += `
            <button class="pagination-btn pagination-nav ${this.currentPage === this.totalPages ? 'disabled' : ''}" 
                    onclick="productCatalog.goToPage(${this.currentPage + 1})" 
                    ${this.currentPage === this.totalPages ? 'disabled' : ''}>
                Siguiente
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        paginationControls.innerHTML = paginationHTML;
    }

    generatePageNumbers() {
        const pageNumbers = [];
        const maxVisiblePages = 7;

        if (this.totalPages <= maxVisiblePages) {
            // Mostrar todas las páginas
            for (let i = 1; i <= this.totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            // Lógica para mostrar páginas con puntos suspensivos
            const startPage = Math.max(1, this.currentPage - 2);
            const endPage = Math.min(this.totalPages, this.currentPage + 2);

            // Siempre mostrar la primera página
            if (startPage > 1) {
                pageNumbers.push(1);
                if (startPage > 2) {
                    pageNumbers.push('...');
                }
            }

            // Mostrar páginas alrededor de la actual
            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }

            // Siempre mostrar la última página
            if (endPage < this.totalPages) {
                if (endPage < this.totalPages - 1) {
                    pageNumbers.push('...');
                }
                pageNumbers.push(this.totalPages);
            }
        }

        return pageNumbers;
    }

    updateResultsSummary() {
        const resultsSummary = document.getElementById('resultsSummary');
        if (!resultsSummary) return;

        const totalProducts = this.filteredProducts.length;
        const startIndex = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endIndex = Math.min(this.currentPage * this.itemsPerPage, totalProducts);

        if (totalProducts === 0) {
            resultsSummary.textContent = 'No hay productos para mostrar';
        } else {
            resultsSummary.textContent = `Mostrando ${startIndex}-${endIndex} de ${totalProducts} productos`;
        }
    }

    goToPage(pageNumber) {
        if (pageNumber < 1 || pageNumber > this.totalPages || pageNumber === this.currentPage) {
            return;
        }

        this.currentPage = pageNumber;
        this.renderCurrentPage();
        this.renderPaginationControls();
        this.updateResultsSummary();

        // Scroll hacia arriba suavemente
        const productosMain = document.querySelector('.productos-main');
        if (productosMain) {
            productosMain.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    renderCurrentPage() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        this.paginatedProducts = this.filteredProducts.slice(startIndex, endIndex);

        this.renderProducts();
    }

    hideLoading() {
        const loadingSpinner = document.getElementById('loadingSpinner');
        if (loadingSpinner) {
            loadingSpinner.style.display = 'none';
        }
    }

    showError(message) {
        console.error(message);
        // Aquí puedes mostrar un mensaje de error al usuario
        const productosGrid = document.getElementById('productosGrid');
        if (productosGrid) {
            productosGrid.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error al cargar productos</h3>
                    <p>Por favor, recarga la página e intenta nuevamente.</p>
                </div>
            `;
        }
    }

    // Nuevas funciones para filtros toggle
    toggleTypeFilter(type, button) {
        button.classList.toggle('active');
        
        if (button.classList.contains('active')) {
            if (!this.currentFilters.tipo.includes(type)) {
                this.currentFilters.tipo.push(type);
            }
        } else {
            this.currentFilters.tipo = this.currentFilters.tipo.filter(t => t !== type);
        }
        
        this.applyFilters();
        this.updateFilterIndicators();
    }

    toggleStateFilter(state, button) {
        button.classList.toggle('active');
        
        if (button.classList.contains('active')) {
            if (!this.currentFilters.estado.includes(state)) {
                this.currentFilters.estado.push(state);
            }
        } else {
            this.currentFilters.estado = this.currentFilters.estado.filter(s => s !== state);
        }
        
        this.applyFilters();
        this.updateFilterIndicators();
    }

    updateFilterIndicators() {
        // Actualizar indicadores visuales de filtros activos
        const activeFiltersCount = 
            this.currentFilters.categoria.length + 
            this.currentFilters.marca.length + 
            this.currentFilters.tipo.length + 
            this.currentFilters.estado.length +
            (this.currentFilters.precioMin || this.currentFilters.precioMax ? 1 : 0);

        // Crear o actualizar indicador en el header de filtros
        let indicator = document.querySelector('.active-filters-indicator');
        const header = document.querySelector('.filtros-header h3');
        
        if (activeFiltersCount > 0) {
            if (!indicator && header) {
                indicator = document.createElement('span');
                indicator.className = 'active-filters-indicator';
                header.appendChild(indicator);
            }
            if (indicator) {
                indicator.textContent = activeFiltersCount;
                indicator.style.display = 'flex';
            }
        } else if (indicator) {
            indicator.style.display = 'none';
        }
    }

    clearAllFilters() {
        // Limpiar filtros internos
        this.currentFilters = {
            search: '',
            categoria: [],
            marca: [],
            tipo: [],
            estado: [],
            precioMin: null,
            precioMax: null
        };

        // Limpiar checkboxes
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
            const parent = checkbox.closest('.filter-checkbox');
            if (parent) parent.classList.remove('active');
        });

        // Limpiar botones toggle
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Limpiar campos de precio
        const minPrice = document.getElementById('minPrice');
        const maxPrice = document.getElementById('maxPrice');
        if (minPrice) minPrice.value = '';
        if (maxPrice) maxPrice.value = '';

        // Limpiar búsqueda
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.value = '';

        // Aplicar filtros y actualizar vista
        this.applyFilters();
        this.updateFilterIndicators();
    }

    // Función para alternar mostrar productos no disponibles (uso futuro)
    async toggleMostrarNoDisponibles(mostrar = false) {
        try {
            const response = await fetch('assets/Json/productos.json');
            const data = await response.json();
            const todosLosProductos = data.productos || [];
            
            if (mostrar) {
                // Mostrar todos los productos (disponibles y no disponibles)
                this.productos = todosLosProductos;
                console.log('Mostrando todos los productos (incluyendo no disponibles)');
            } else {
                // Mostrar solo productos disponibles
                this.productos = todosLosProductos.filter(producto => producto.disponible === true);
                console.log('Mostrando solo productos disponibles');
            }
            
            // Resetear filtros y renderizar
            this.filteredProducts = [...this.productos];
            this.currentPage = 1;
            this.renderFilters();
            this.applyFilters();
            this.updateFilterCounts();
            
        } catch (error) {
            console.error('Error al alternar productos:', error);
        }
    }
}

// Inicializar catálogo cuando el DOM esté listo
let productCatalog;
document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando ProductCatalog...');
    productCatalog = new ProductCatalog();
    
    // Hacer funciones disponibles globalmente para los event handlers en HTML
    window.productCatalog = productCatalog;
    console.log('ProductCatalog inicializado y disponible globalmente');
});
