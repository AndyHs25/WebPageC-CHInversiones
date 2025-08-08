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
            mobileMenuToggle.addEventListener('click', () => {
                mainNav.classList.toggle('active');
            });
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new ComponentsLoader();
});
