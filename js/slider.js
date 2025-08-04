document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    let currentSlide = 0;
    let slideInterval;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.remove('active');
            if (i === index) {
                slide.classList.add('active');
                // Reiniciar la animación si es el primer slide
                if (i === 0) {
                    const animatedMachine = slide.querySelector('.animated-machine');
                    if (animatedMachine) {
                        // Forzar reinicio de la animación
                        animatedMachine.style.animation = 'none';
                        setTimeout(() => {
                            animatedMachine.style.animation = 'slideInFromRight 2s ease-out forwards';
                        }, 50);
                    }
                }
            }
        });
    }

    function next() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    function prev() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }

    function startSlideShow() {
        slideInterval = setInterval(next, 5000); // Cambia de slide cada 5 segundos
    }

    function stopSlideShow() {
        clearInterval(slideInterval);
    }
    
    nextBtn.addEventListener('click', () => {
        stopSlideShow();
        next();
        startSlideShow();
    });

    prevBtn.addEventListener('click', () => {
        stopSlideShow();
        prev();
        startSlideShow();
    });

    // Iniciar el slider
    showSlide(currentSlide);
    startSlideShow();
});
