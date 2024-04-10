document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/sessions/current')
        .then(response => {
            if (!response.ok) {
                throw new Error('Fallo al hacer fetch al carrito');
            }
            return response.json();
        })
        .then(session => {
            console.log('Sesion:', session);
            if (session.cart && Array.isArray(session.cart)) {
                const cart = session.cart;
                let totalPrice = 0;
                cart.forEach(item => {
                    if (item.product && typeof item.product.price === 'number') {
                        totalPrice += item.product.price * item.quantity;
                    } else {
                        console.error('Precio invalido o producto invalido:', item);
                    }
                });
                console.log('Precio Total:', totalPrice.toFixed(2));
                const totalPriceElement = document.querySelector('#totalPrice');
                if (totalPriceElement) {
                    totalPriceElement.textContent = totalPrice.toFixed(2);
                } else {
                    console.error('Elemento del precio total no encontrado.');
                }
            } else {
                console.error('No se encuentran productos en el carrito.');
            }
        })
        .catch(error => {
            console.error('Error al hacer fetch a los detalles del carrito:', error);
        });
});
