// Script de debug para verificar funcionalidad del catálogo
console.log('=== DEBUG CATÁLOGO ===');

// Verificar elementos de paginación
document.addEventListener('DOMContentLoaded', function() {
    console.log('1. Verificando elementos del DOM...');
    
    const paginationContainer = document.getElementById('paginationContainer');
    const paginationControls = document.getElementById('paginationControls');
    const productosGrid = document.getElementById('productosGrid');
    
    console.log('paginationContainer:', paginationContainer ? 'EXISTE' : 'NO EXISTE');
    console.log('paginationControls:', paginationControls ? 'EXISTE' : 'NO EXISTE');
    console.log('productosGrid:', productosGrid ? 'EXISTE' : 'NO EXISTE');
    
    // Verificar instancia del catálogo
    setTimeout(() => {
        console.log('2. Verificando instancia del catálogo...');
        console.log('productCatalog:', window.productCatalog ? 'EXISTE' : 'NO EXISTE');
        
        if (window.productCatalog) {
            console.log('Productos cargados:', window.productCatalog.productos.length);
            console.log('Productos filtrados:', window.productCatalog.filteredProducts.length);
            console.log('Página actual:', window.productCatalog.currentPage);
            console.log('Total páginas:', window.productCatalog.totalPages);
        }
    }, 2000);
    
    // Monitor de clicks en paginación
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('pagination-btn')) {
            console.log('3. Click en botón de paginación:', e.target.textContent);
            console.log('Onclick attribute:', e.target.getAttribute('onclick'));
        }
    });
    
    // Verificar responsividad
    function checkResponsiveness() {
        const width = window.innerWidth;
        console.log('4. Ancho de pantalla:', width + 'px');
        
        if (width <= 480) {
            console.log('   -> Móvil pequeño');
        } else if (width <= 768) {
            console.log('   -> Móvil/Tablet');
        } else if (width <= 1024) {
            console.log('   -> Tablet');
        } else {
            console.log('   -> Desktop');
        }
    }
    
    checkResponsiveness();
    window.addEventListener('resize', checkResponsiveness);
});
