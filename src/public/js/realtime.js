const socket = io();

socket.on('realtimeProductRemoval', removedProductId => {
  removeProductFromList(removedProductId);
});

let currentPage = 1;
let totalPages = 1;
const productsPerPage = 10

async function fetchAndRenderProductList(page = 1) {
  try {
    const response = await fetch(`/api/products?page=${page}`);
    const { products, currentPage: fetchedCurrentPage, totalPages: fetchedTotalPages } = await response.json();
    
    renderProductList(products);
    

    currentPage = fetchedCurrentPage;
    totalPages = fetchedTotalPages;
    

    updatePaginationUI(currentPage, totalPages);
  } catch (error) {
    console.error('Error al obtener la lista de productos:', error);
  }
}

function updatePaginationUI(currentPage, totalPages) {

}

function loadPreviousPage() {
  if (currentPage > 1) {
    currentPage--;
    fetchAndRenderProductList(currentPage);
  }
  updatePaginationButtons();
}

function loadNextPage() {
  if (currentPage < totalPages) {
    currentPage++;
    fetchAndRenderProductList(currentPage);
  }
  updatePaginationButtons();
}

function updatePaginationButtons() {
  const previousButton = document.getElementById('previousButton');
  const nextButton = document.getElementById('nextButton');

  previousButton.disabled = (currentPage === 1);
  nextButton.disabled = (currentPage === totalPages);
}


async function addProduct(event) {
  event.preventDefault();

  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const price = document.getElementById('price').value;
  const category = document.getElementById('category').value;
  const thumbnail = document.getElementById('thumbnail').value;
  const code = document.getElementById('code').value;
  const stock = document.getElementById('stock').value;

  if (!title || !description || !price || !category || !thumbnail || !code || !stock) {
    console.error('Todos los campos son obligatorios.');
    return;
  }

  const newProduct = {
    title,
    description,
    price: parseFloat(price),
    category,
    thumbnail,
    code,
    stock: parseInt(stock),
    status: true
  };

  try {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newProduct),
    });

    if (!response.ok) {
      throw new Error('La respuesta de la red fue invalidada');
    }

    const addedProduct = await response.json();
    console.log('Producto agregado:', addedProduct);
    socket.emit('realtimeProductUpdate', addedProduct);
    fetchAndRenderProductList(currentPage);
  } catch (error) {
    console.error('Error al agregar producto:', error);
  }
}

function renderProductList(products) {
  const productList = document.getElementById('productList');
  productList.innerHTML = '';

  if (!Array.isArray(products)) {
    console.error('Error: Expected an array of products.');
    return;
  }

  products.forEach(product => {
    const listItem = document.createElement('li');
    listItem.id = `product_${product._id}`;
    listItem.innerHTML = `
      <div class="product-details">
        <div>${product.title}</div>
        <div>Precio: ${product.price}</div>
        <div>Stock: ${product.stock}</div>
        <button type="button" onclick="deleteProduct('${product._id}')">Borrar</button>
      </div>`;
    productList.appendChild(listItem);
  });
}

async function deleteProduct(productId) {
  try {
    const response = await fetch(`/api/products/${productId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    if (data.success) {
      console.log('Producto borrado correctamente');
      socket.emit('realtimeProductRemoval', productId);
      fetchAndRenderProductList(currentPage);
    } else {
      console.error('Error al borrar el producto:', data.message);
    }
  } catch (error) {
    console.error('Error al borrar el producto:', error);
  }
}

function updatePaginationUI(currentPage, totalPages) {
  const currentPageDisplay = document.getElementById('currentPageDisplay');
  currentPageDisplay.textContent = `Página ${currentPage} de ${totalPages}`;
}

socket.on('connect_error', error => {
  console.error('Socket.IO connection error:', error);
});

socket.on('disconnect', reason => {
  console.log('Socket.IO disconnected:', reason);
});

fetchAndRenderProductList();
