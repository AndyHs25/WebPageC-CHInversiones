// Carrusel de Anuncios de Maquinaria - Una sola fila
let currentAnnouncementSlide = 0;
const announcementSlider = document.getElementById('announcementsSlider');
let announcementCards = [];
let announcementDots = [];

// Variables para controlar el carrusel
let cardsPerView = 3; // Número de tarjetas visibles a la vez
let cardWidth = 320; // Ancho de cada tarjeta
let gapWidth = 30; // Espacio entre tarjetas

// Inicializar variables cuando el DOM esté listo
function initializeCarousel() {
    announcementCards = document.querySelectorAll('.announcement-card');
    announcementDots = document.querySelectorAll('.announcement-dot');
    
    // Calcular cardsPerView basado en el ancho de la ventana
    updateCardsPerView();
}

// Actualizar número de tarjetas por vista según el tamaño de pantalla
function updateCardsPerView() {
    const containerWidth = window.innerWidth;
    
    if (containerWidth <= 480) {
        cardsPerView = 1;
        cardWidth = 260;
    } else if (containerWidth <= 768) {
        cardsPerView = 1;
        cardWidth = 280;
    } else if (containerWidth <= 1024) {
        cardsPerView = 2;
        cardWidth = 320;
    } else {
        cardsPerView = 3;
        cardWidth = 320;
    }
}

// Calcular número total de slides
function getTotalAnnouncementSlides() {
    if (!announcementCards.length) return 0;
    return Math.max(0, announcementCards.length - cardsPerView + 1);
}

// Actualizar la posición del carrusel
function updateAnnouncementCarousel() {
    if (!announcementSlider || !announcementCards.length) return;
    
    const translateX = currentAnnouncementSlide * (cardWidth + gapWidth);
    announcementSlider.style.transform = `translateX(-${translateX}px)`;
    
    // Actualizar indicadores
    if (announcementDots.length > 0) {
        announcementDots.forEach((dot, index) => {
            const slideRange = Math.ceil(announcementCards.length / 3); // Agrupar slides para indicadores
            const currentGroup = Math.floor(currentAnnouncementSlide / Math.ceil(announcementCards.length / slideRange));
            dot.classList.toggle('active', index === currentGroup);
        });
    }
}

// Controlar navegación del carrusel
function controlAnnouncementCarousel(direction) {
    const totalSlides = getTotalAnnouncementSlides();
    
    if (direction === 'next') {
        if (currentAnnouncementSlide < totalSlides - 1) {
            currentAnnouncementSlide++;
        } else {
            currentAnnouncementSlide = 0; // Volver al inicio
        }
    } else {
        if (currentAnnouncementSlide > 0) {
            currentAnnouncementSlide--;
        } else {
            currentAnnouncementSlide = totalSlides - 1; // Ir al final
        }
    }
    
    updateAnnouncementCarousel();
}

// Ir a slide específico
function goToAnnouncementSlide(slideIndex) {
    const totalSlides = getTotalAnnouncementSlides();
    const slidesPerIndicator = Math.ceil(totalSlides / 3);
    
    currentAnnouncementSlide = Math.min(slideIndex * slidesPerIndicator, totalSlides - 1);
    updateAnnouncementCarousel();
}

// Auto-play del carrusel
function startAnnouncementAutoplay() {
    setInterval(() => {
        controlAnnouncementCarousel('next');
    }, 4000); // Cambia cada 4 segundos
}

// Inicializar carrusel cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar variables
    initializeCarousel();
    
    // Configurar el carrusel inicial
    updateAnnouncementCarousel();
    
    // Iniciar autoplay
    startAnnouncementAutoplay();
    
    // Reajustar en cambio de tamaño de ventana
    window.addEventListener('resize', function() {
        updateCardsPerView();
        const totalSlides = getTotalAnnouncementSlides();
        if (currentAnnouncementSlide >= totalSlides) {
            currentAnnouncementSlide = Math.max(0, totalSlides - 1);
        }
        updateAnnouncementCarousel();
    });
    
    // Touch/swipe support para móviles
    let startX = 0;
    let endX = 0;
    let isDown = false;
    
    if (announcementSlider) {
        // Touch events
        announcementSlider.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
            isDown = true;
            announcementSlider.style.cursor = 'grabbing';
        });
        
        announcementSlider.addEventListener('touchmove', function(e) {
            if (!isDown) return;
            e.preventDefault();
            endX = e.touches[0].clientX;
        });
        
        announcementSlider.addEventListener('touchend', function(e) {
            if (!isDown) return;
            isDown = false;
            announcementSlider.style.cursor = 'grab';
            
            const diff = startX - endX;
            
            if (Math.abs(diff) > 50) { // Minimum swipe distance
                if (diff > 0) {
                    controlAnnouncementCarousel('next');
                } else {
                    controlAnnouncementCarousel('prev');
                }
            }
        });
        
        // Mouse events para desktop
        announcementSlider.addEventListener('mousedown', function(e) {
            startX = e.clientX;
            isDown = true;
            announcementSlider.style.cursor = 'grabbing';
        });
        
        announcementSlider.addEventListener('mousemove', function(e) {
            if (!isDown) return;
            e.preventDefault();
            endX = e.clientX;
        });
        
        announcementSlider.addEventListener('mouseup', function(e) {
            if (!isDown) return;
            isDown = false;
            announcementSlider.style.cursor = 'grab';
            
            const diff = startX - endX;
            
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    controlAnnouncementCarousel('next');
                } else {
                    controlAnnouncementCarousel('prev');
                }
            }
        });
        
        announcementSlider.addEventListener('mouseleave', function() {
            isDown = false;
            announcementSlider.style.cursor = 'grab';
        });
        
        // Estilo del cursor
        announcementSlider.style.cursor = 'grab';
    }
});

// Hacer las funciones globales para que puedan ser llamadas desde HTML
window.controlAnnouncementCarousel = controlAnnouncementCarousel;
window.goToAnnouncementSlide = goToAnnouncementSlide;
