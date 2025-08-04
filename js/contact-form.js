// Manejo del formulario de contacto
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Obtener los datos del formulario
            const formData = new FormData(contactForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const message = formData.get('message');
            
            // Validar campos
            if (!name || !email || !message) {
                alert('Por favor, completa todos los campos obligatorios.');
                return;
            }
            
            // Crear el mensaje para WhatsApp
            const whatsappMessage = `¡Hola! Soy ${name}.
            
📧 Email: ${email}
💬 Mensaje: ${message}

Estoy interesado en sus servicios de alquiler de maquinaria pesada. ¿Podrían proporcionarme más información?`;
            
            // Codificar el mensaje para URL
            const encodedMessage = encodeURIComponent(whatsappMessage);
            
            // Número de WhatsApp 
            const whatsappNumber = '51912796215';
            
            // Crear la URL de WhatsApp
            const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
            
            // Abrir WhatsApp en una nueva ventana
            window.open(whatsappURL, '_blank');
            
            // Mostrar mensaje de éxito
            showSuccessMessage();
            
            // Limpiar el formulario
            contactForm.reset();
        });
    }
});

function showSuccessMessage() {
    // Crear elemento de mensaje de éxito
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <div class="success-content">
            <i class="fas fa-check-circle"></i>
            <h3>¡Mensaje enviado!</h3>
            <p>Serás redirigido a WhatsApp para completar tu consulta.</p>
        </div>
    `;
    
    // Estilos para el mensaje de éxito
    successDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px;
        border-radius: 15px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        z-index: 10000;
        text-align: center;
        animation: fadeInScale 0.3s ease-out;
    `;
    
    // Añadir estilos CSS para la animación
    if (!document.querySelector('#success-animation-styles')) {
        const styles = document.createElement('style');
        styles.id = 'success-animation-styles';
        styles.textContent = `
            @keyframes fadeInScale {
                from {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.8);
                }
                to {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
            }
            .success-message .success-content i {
                color: #27AE60;
                font-size: 3rem;
                margin-bottom: 15px;
            }
            .success-message .success-content h3 {
                color: #2C3E50;
                margin-bottom: 10px;
                font-family: 'Montserrat', sans-serif;
            }
            .success-message .success-content p {
                color: #666;
                margin: 0;
                font-family: 'Roboto', sans-serif;
            }
        `;
        document.head.appendChild(styles);
    }
    
    // Añadir al DOM
    document.body.appendChild(successDiv);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        successDiv.style.animation = 'fadeInScale 0.3s ease-out reverse';
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 300);
    }, 3000);
}

// Animaciones para los campos del formulario
document.addEventListener('DOMContentLoaded', function() {
    const formGroups = document.querySelectorAll('.form-group');
    
    formGroups.forEach((group, index) => {
        group.style.opacity = '0';
        group.style.transform = 'translateY(20px)';
        group.style.transition = 'all 0.6s ease';
        
        setTimeout(() => {
            group.style.opacity = '1';
            group.style.transform = 'translateY(0)';
        }, index * 100);
    });
});
