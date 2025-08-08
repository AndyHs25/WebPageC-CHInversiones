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

        this.init();
    }

    async init() {
        await this.loadProductsData();
        this.setupEventListeners();
        this.renderFilters();
        this.renderProducts();
    }

    async loadProductsData() {
        try {
            const response = await fetch('assets/Json/productos.json');
            const data = await response.json();
            
            this.productos = data.productos || [];
            this.categorias = data.categorias || [];
            this.marcas = data.marcas || [];
            this.filteredProducts = [...this.productos];
            
            this.hideLoading();
        } catch (error) {
            console.error('Error loading products data:', error);
            this.showError('Error al cargar los productos');
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
    }

    renderFilters() {
        // Renderizar filtros de categoría
        const categoriaFilters = document.getElementById('categoriaFilters');
        if (categoriaFilters) {
            categoriaFilters.innerHTML = this.categorias.map(categoria => `
                <label class="filter-checkbox">
                    <input type="checkbox" name="categoria" value="${categoria.id}">
                    <span class="checkmark"></span>
                    ${categoria.nombre}
                </label>
            `).join('');
        }

        // Renderizar filtros de marca
        const marcaFilters = document.getElementById('marcaFilters');
        if (marcaFilters) {
            marcaFilters.innerHTML = this.marcas.map(marca => `
                <label class="filter-checkbox">
                    <input type="checkbox" name="marca" value="${marca.id}">
                    <span class="checkmark"></span>
                    ${marca.nombre}
                </label>
            `).join('');
        }
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
            if (this.currentFilters.priceMin !== null && 
                producto.precio < this.currentFilters.priceMin) {
                return false;
            }

            if (this.currentFilters.priceMax !== null && 
                producto.precio > this.currentFilters.priceMax) {
                return false;
            }

            return true;
        });

        this.sortAndRenderProducts();
    }

    sortAndRenderProducts() {
        // Ordenar productos
        this.filteredProducts.sort((a, b) => {
            switch (this.currentSort) {
                case 'precio-asc':
                    return a.precio - b.precio;
                case 'precio-desc':
                    return b.precio - a.precio;
                case 'año-desc':
                    return b.año - a.año;
                case 'año-asc':
                    return a.año - b.año;
                case 'nombre':
                    return a.nombre.localeCompare(b.nombre);
                case 'fecha':
                default:
                    return new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion);
            }
        });

        this.renderProducts();
    }

    renderProducts() {
        const productosGrid = document.getElementById('productosGrid');
        const productCount = document.getElementById('productCount');
        const noResults = document.getElementById('noResults');

        // Actualizar contador
        if (productCount) {
            const count = this.filteredProducts.length;
            productCount.textContent = `${count} producto${count !== 1 ? 's' : ''} encontrado${count !== 1 ? 's' : ''}`;
        }

        // Mostrar/ocultar sin resultados
        if (noResults) {
            noResults.style.display = this.filteredProducts.length === 0 ? 'block' : 'none';
        }

        // Renderizar productos
        if (productosGrid) {
            productosGrid.innerHTML = this.filteredProducts.map(producto => `
                <div class="producto-card" onclick="catalog.openProductModal(${producto.id})">
                    <div class="producto-image">
                        <img src="${producto.imagenes[0]}" alt="${producto.nombre}" loading="lazy">
                        <div class="producto-badges">
                            <span class="badge ${producto.tipo}">${producto.tipo}</span>
                            <span class="badge ${producto.estado}">${producto.estado}</span>
                        </div>
                        <div class="producto-price">
                            ${producto.moneda} ${producto.precio.toLocaleString()}
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
                                <span>${producto.año}</span>
                            </div>
                            <div class="detail">
                                <i class="fas fa-clock"></i>
                                <span>${producto.horas.toLocaleString()} hrs</span>
                            </div>
                            <div class="detail">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>${producto.ubicacion}</span>
                            </div>
                        </div>
                        <button class="ver-producto-btn">Ver detalles</button>
                    </div>
                </div>
            `).join('');
        }
    }

    openProductModal(productId) {
        const producto = this.productos.find(p => p.id === productId);
        if (!producto) return;

        this.currentProduct = producto;
        this.currentImageIndex = 0;

        // Llenar información del modal
        document.getElementById('modalTitle').textContent = producto.nombre;
        document.getElementById('modalPrice').textContent = `${producto.moneda} ${producto.precio.toLocaleString()}`;
        document.getElementById('modalTipo').textContent = producto.tipo;
        document.getElementById('modalTipo').className = `badge ${producto.tipo}`;
        document.getElementById('modalEstado').textContent = producto.estado;
        document.getElementById('modalEstado').className = `badge ${producto.estado}`;
        
        document.getElementById('modalMarca').textContent = producto.marca;
        document.getElementById('modalModelo').textContent = producto.modelo;
        document.getElementById('modalAño').textContent = producto.año;
        document.getElementById('modalHoras').textContent = `${producto.horas.toLocaleString()} hrs`;
        document.getElementById('modalDescripcion').textContent = producto.descripcion;

        // Especificaciones
        const especificacionesContainer = document.getElementById('modalEspecificaciones');
        especificacionesContainer.innerHTML = Object.entries(producto.especificaciones).map(([key, value]) => `
            <div class="detail-item">
                <span class="label">${key.replace(/_/g, ' ')}:</span>
                <span class="value">${value}</span>
            </div>
        `).join('');

        // Características
        const caracteristicasContainer = document.getElementById('modalCaracteristicas');
        caracteristicasContainer.innerHTML = producto.caracteristicas.map(caracteristica => `
            <li>${caracteristica}</li>
        `).join('');

        // Imágenes
        this.updateModalImages();

        // Botones de contacto
        const whatsappBtn = document.getElementById('contactWhatsApp');
        const emailBtn = document.getElementById('contactEmail');

        if (whatsappBtn) {
            whatsappBtn.onclick = () => {
                const message = `Hola, estoy interesado en: ${producto.nombre} - ${producto.moneda} ${producto.precio.toLocaleString()}`;
                const whatsappURL = `https://wa.me/51905447143?text=${encodeURIComponent(message)}`;
                window.open(whatsappURL, '_blank');
            };
        }

        if (emailBtn) {
            emailBtn.onclick = () => {
                const subject = `Consulta sobre: ${producto.nombre}`;
                const body = `Estimados,\n\nEstoy interesado en obtener más información sobre:\n\n${producto.nombre}\nPrecio: ${producto.moneda} ${producto.precio.toLocaleString()}\n\nQuedo atento a su respuesta.\n\nSaludos cordiales.`;
                const mailtoURL = `mailto:ventas@chycinversiones.pe?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                window.location.href = mailtoURL;
            };
        }

        // Mostrar modal
        const modal = document.getElementById('productModal');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    updateModalImages() {
        const mainImage = document.getElementById('modalMainImage');
        const thumbnailsContainer = document.getElementById('imageThumbnails');

        if (this.currentProduct) {
            // Imagen principal
            mainImage.src = this.currentProduct.imagenes[this.currentImageIndex];
            mainImage.alt = this.currentProduct.nombre;

            // Miniaturas
            thumbnailsContainer.innerHTML = this.currentProduct.imagenes.map((imagen, index) => `
                <div class="thumbnail ${index === this.currentImageIndex ? 'active' : ''}" onclick="catalog.setModalImage(${index})">
                    <img src="${imagen}" alt="${this.currentProduct.nombre} ${index + 1}">
                </div>
            `).join('');
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

        // Reaplicar filtros
        this.applyFilters();
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
}

// Inicializar catálogo cuando el DOM esté listo
let catalog;
document.addEventListener('DOMContentLoaded', () => {
    catalog = new ProductCatalog();
});
