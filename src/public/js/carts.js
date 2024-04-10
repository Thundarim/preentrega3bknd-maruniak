async function fetchAndRenderCartList() {
  try {
      const cartList = await fetch('/api/carts');
      const carts = await cartList.json();
      if (Array.isArray(carts)) {
          renderCartList(carts);
      } else {
          console.error('La lista de carritos no es un array:', carts);
      }
  } catch (error) {
      console.error('Error al obtener la lista de carritos:', error);
  }
}

function renderCartList(carts) {
  const cartList = document.getElementById('cartList');
  cartList.innerHTML = '';

  carts.forEach(cart => {
      const listItem = document.createElement('li');
      listItem.id = `cart_${cart._id}`;
      listItem.innerHTML = `
          <div class="cart-details">
              <div>ID del carrito: ${cart._id}</div>
              <div>Precio total: ${cart.totalPrice}</div>
              <button type="button" onclick="redirectToCart('${cart._id}')">Ver carrito</button>
          </div>
      `;
      cartList.appendChild(listItem);
  });
}

function redirectToCart(cartId) {
  var apiUrl = '/api/carts/' + cartId;
  window.location.href = apiUrl;
}

async function fetchAndRenderLists() {
  await fetchAndRenderCartList();
}

fetchAndRenderLists();
