// Carrusel de Marcas - Funcionalidad
let currentBrandSlide = 0;
const totalBrandSlides = 12; // Total de marcas
let brandSlideInterval;
let isAnimationPaused = false;

// Función para iniciar el carrusel automático
function startBrandCarousel() {
    if (!isAnimationPaused) {
        brandSlideInterval = setInterval(() => {
            nextBrandSlide();
        }, 3000); // Cambia cada 3 segundos
    }
}

// Función para detener el carrusel automático
function stopBrandCarousel() {
    clearInterval(brandSlideInterval);
}

// Función para ir al siguiente slide
function nextBrandSlide() {
    currentBrandSlide = (currentBrandSlide + 1) % totalBrandSlides;
    updateBrandCarousel();
}

// Función para ir al slide anterior
function prevBrandSlide() {
    currentBrandSlide = (currentBrandSlide - 1 + totalBrandSlides) % totalBrandSlides;
    updateBrandCarousel();
}

// Función para controlar el carrusel manualmente
function controlBrandCarousel(direction) {
    stopBrandCarousel();
    
    if (direction === 'next') {
        nextBrandSlide();
    } else if (direction === 'prev') {
        prevBrandSlide();
    }
    
    // Reiniciar el carrusel automático después de 3 segundos
    setTimeout(() => {
        if (!isAnimationPaused) {
            startBrandCarousel();
        }
    }, 3000);
}

// Función para ir a un slide específico
function goToBrandSlide(groupIndex) {
    stopBrandCarousel();
    currentBrandSlide = groupIndex * 3; // Cada grupo tiene 3 marcas
    updateBrandCarousel();
    
    // Reiniciar el carrusel automático después de 3 segundos
    setTimeout(() => {
        startBrandCarousel();
    }, 3000);
}

// Función para actualizar la visualización del carrusel
function updateBrandCarousel() {
    const slider = document.getElementById('brandsSlider');
    const dots = document.querySelectorAll('.carousel-dot');
    
    if (!slider) return;
    
    // Calcular el desplazamiento - mostrar 4 marcas a la vez
    const itemWidth = 100 / 4; // 25% cada una para mostrar 4 a la vez
    const translateX = -currentBrandSlide * itemWidth;
    slider.style.transform = `translateX(${translateX}%)`;
    slider.style.transition = 'transform 0.5s ease-in-out';
    
    // Actualizar indicadores (4 grupos de 3 marcas)
    const currentGroup = Math.floor(currentBrandSlide / 3);
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentGroup);
    });
}

// Función para pausar la animación en hover
function pauseBrandAnimation() {
    isAnimationPaused = true;
    stopBrandCarousel();
}

// Función para reanudar la animación
function resumeBrandAnimation() {
    isAnimationPaused = false;
    startBrandCarousel();
}

// Inicializar el carrusel cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando carrusel de marcas...');
    
    // Verificar que el elemento existe
    const slider = document.getElementById('brandsSlider');
    if (!slider) {
        console.error('No se encontró el elemento brandsSlider');
        return;
    }
    
    // Agregar event listeners para hover
    const brandsSection = document.querySelector('.brands-carousel');
    if (brandsSection) {
        brandsSection.addEventListener('mouseenter', pauseBrandAnimation);
        brandsSection.addEventListener('mouseleave', resumeBrandAnimation);
    }
    
    // Inicializar posición del carrusel
    updateBrandCarousel();
    
    // Iniciar el carrusel automático
    startBrandCarousel();
    
    // Soporte para navegación con teclado
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            controlBrandCarousel('prev');
        } else if (e.key === 'ArrowRight') {
            controlBrandCarousel('next');
        }
    });
    
    console.log('Carrusel de marcas inicializado correctamente');
});

// Función para optimizar el rendimiento en dispositivos móviles
function optimizeForMobile() {
    const isMobile = window.innerWidth <= 768;
    const slider = document.getElementById('brandsSlider');
    
    if (isMobile && slider) {
        // Reducir la velocidad de la animación en móviles
        slider.style.animationDuration = '40s';
    }
}

// Ejecutar optimización en carga y redimensionamiento
window.addEventListener('load', optimizeForMobile);
window.addEventListener('resize', optimizeForMobile);
