  document.getElementById("limpiarCarritoBtn").addEventListener("click", async function() {
        const cartId = this.getAttribute("data-cart-id");
        try {
            const response = await fetch(`/api/carts/${cartId}`, {
                method: "DELETE"
            });
            if (!response.ok) {
                throw new Error("Fallo al limpiar carrito");
            }
            console.log("Se limpio el carrito, gracias mr musculo.");

            setTimeout(() => {
                location.reload();
            }, 1000);
        } catch (error) {
            console.error("Error al limpiar el carrito, nos fallo mr musculo", error);
        }
    });

    
