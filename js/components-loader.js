// Cargador de Componentes Reutilizables
class ComponentsLoader {
    constructor() {
        this.loadComponents();
    }

    async loadComponents() {
        await this.loadHeader();
        await this.loadFooter();
    }

    async loadHeader() {
        try {
            const headerPlaceholder = document.getElementById('header-placeholder');
            if (headerPlaceholder) {
                const response = await fetch('components/header.html');
                const headerHTML = await response.text();
                headerPlaceholder.innerHTML = headerHTML;
                
                // Activar navegación suave después de cargar el header
                this.enableSmoothNavigation();
            }
        } catch (error) {
            console.error('Error loading header:', error);
        }
    }

    async loadFooter() {
        try {
            const footerPlaceholder = document.getElementById('footer-placeholder');
            if (footerPlaceholder) {
                const response = await fetch('components/footer.html');
                const footerHTML = await response.text();
                footerPlaceholder.innerHTML = footerHTML;
            }
        } catch (error) {
            console.error('Error loading footer:', error);
        }
    }

    enableSmoothNavigation() {
        // Navegación suave para anchors
        const navLinks = document.querySelectorAll('a[href^="#"]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Activar navegación en móvil (si existe)
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        const mainNav = document.querySelector('.main-nav');
        
        if (mobileMenuToggle && mainNav) {
            mobileMenuToggle.addEventListener('click', function() {
                mainNav.classList.toggle('mobile-open');
                mobileMenuToggle.classList.toggle('active');
                document.body.classList.toggle('menu-open');
            });
            
            // Cerrar menú al hacer click en un enlace
            const navLinks = mainNav.querySelectorAll('a');
            navLinks.forEach(link => {
                link.addEventListener('click', function() {
                    mainNav.classList.remove('mobile-open');
                    mobileMenuToggle.classList.remove('active');
                    document.body.classList.remove('menu-open');
                });
            });
            
            // Cerrar menú con tecla Escape
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && mainNav.classList.contains('mobile-open')) {
                    mainNav.classList.remove('mobile-open');
                    mobileMenuToggle.classList.remove('active');
                    document.body.classList.remove('menu-open');
                }
            });
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new ComponentsLoader();
});
