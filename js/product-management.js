// Product Management System JavaScript

// Global variables
let products = [];
let cameraStream = null;
let editingProductId = null;

// DOM Elements
const cameraFeed = document.getElementById('cameraFeed');
const imageCanvas = document.getElementById('imageCanvas');
const startCameraBtn = document.getElementById('startCamera');
const captureImageBtn = document.getElementById('captureImage');
const stopCameraBtn = document.getElementById('stopCamera');
const cameraStatus = document.getElementById('cameraStatus');
const productForm = document.getElementById('productForm');

// Initialize the application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize AOS animations
  AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true
  });
  
  // Load products from localStorage
  loadProducts();
  
  // Initialize event listeners
  initEventListeners();
  
  // Initialize DataTable
  if ($.fn.DataTable) {
    $('#products-table').DataTable({
      responsive: true,
      order: [[3, 'asc']] // Sort by expiry date
    });
  }
  
  // Check for expiring products
  checkExpiringProducts();
});

// Initialize all event listeners
function initEventListeners() {
  // Product form submission
  productForm.addEventListener('submit', handleProductSubmit);
  
  // Camera functionality
  startCameraBtn.addEventListener('click', startCamera);
  captureImageBtn.addEventListener('click', captureImage);
  stopCameraBtn.addEventListener('click', stopCamera);
  
  // No expiry checkbox
  document.getElementById('noExpiryCheck').addEventListener('change', function() {
    const expiryDateInput = document.getElementById('productExpiryDate');
    expiryDateInput.disabled = this.checked;
    if (this.checked) {
      expiryDateInput.value = '';
    }
  });
  
  // Category filter
  document.getElementById('categoryFilter').addEventListener('change', filterProductsByCategory);
  
  // Save and clear buttons
  document.getElementById('saveProducts').addEventListener('click', saveProducts);
  document.getElementById('clearProducts').addEventListener('click', clearProducts);
  
  // Quick action buttons
  document.getElementById('add-product-btn').addEventListener('click', function() {
    document.getElementById('entry-tab').click();
  });
  
  document.getElementById('export-csv').addEventListener('click', exportToCSV);
  document.getElementById('refresh-data').addEventListener('click', refreshData);
  document.getElementById('show-expiring').addEventListener('click', showExpiringProducts);
  document.getElementById('manage-expired').addEventListener('click', showExpiredProducts);
  
  // Edit product form submission
  document.getElementById('edit-product-form').addEventListener('submit', handleEditProductSubmit);
}

// Camera Functions
function startCamera() {
  // Display camera status
  cameraStatus.style.display = 'block';
  cameraStatus.textContent = 'Starting camera...';
  
  // Check if camera is already running
  if (cameraStream) {
    stopCamera();
    return;
  }
  
  // Request camera access with rear camera preference
  navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: 'environment',
      width: { ideal: 1280 },
      height: { ideal: 720 }
    }
  })
  .then(function(stream) {
    cameraStream = stream;
    cameraFeed.srcObject = stream;
    cameraFeed.style.display = 'block';
    imageCanvas.style.display = 'none';
    
    // Update button states
    startCameraBtn.textContent = 'Restart Camera';
    captureImageBtn.disabled = false;
    stopCameraBtn.disabled = false;
    
    // Update status
    cameraStatus.textContent = 'Camera is active. Position the product and click Capture.';
    cameraStatus.className = 'alert alert-success mt-2';
  })
  .catch(function(error) {
    console.error('Error accessing camera:', error);
    cameraStatus.textContent = 'Error accessing camera: ' + error.message;
    cameraStatus.className = 'alert alert-danger mt-2';
  });
}

function stopCamera() {
  if (cameraStream) {
    // Stop all tracks in the stream
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
    
    // Hide video element
    cameraFeed.srcObject = null;
    cameraFeed.style.display = 'none';
    
    // Reset button states
    startCameraBtn.textContent = 'Start Camera';
    captureImageBtn.disabled = true;
    stopCameraBtn.disabled = true;
    
    // Update status
    cameraStatus.textContent = 'Camera stopped';
    cameraStatus.className = 'alert alert-info mt-2';
  }
}

function captureImage() {
  if (!cameraStream) return;
  
  // Set canvas dimensions to match video
  imageCanvas.width = cameraFeed.videoWidth;
  imageCanvas.height = cameraFeed.videoHeight;
  
  // Draw video frame to canvas
  const context = imageCanvas.getContext('2d');
  context.drawImage(cameraFeed, 0, 0, imageCanvas.width, imageCanvas.height);
  
  // Show canvas, hide video
  cameraFeed.style.display = 'none';
  imageCanvas.style.display = 'block';
  
  // Update status
  cameraStatus.textContent = 'Image captured! You can add the product or restart the camera.';
  cameraStatus.className = 'alert alert-success mt-2';
}

// Product Form Submission
function handleProductSubmit(e) {
  e.preventDefault();
  
  // Get form values
  const productName = document.getElementById('productName').value;
  const category = document.getElementById('productCategory').value;
  const quantity = parseInt(document.getElementById('productQuantity').value);
  const condition = document.getElementById('productCondition').value;
  const description = document.getElementById('productDescription').value;
  const manufactureDate = document.getElementById('productManufactureDate').value;
  const noExpiry = document.getElementById('noExpiryCheck').checked;
  const expiryDate = noExpiry ? null : document.getElementById('productExpiryDate').value;
  
  // Get image from either URL input or canvas
  let imageUrl = document.getElementById('productImage').value;
  if (!imageUrl && imageCanvas.style.display !== 'none') {
    imageUrl = imageCanvas.toDataURL('image/jpeg');
  }
  
  // Create product object
  const product = {
    id: Date.now().toString(),
    name: productName,
    category: category,
    quantity: quantity,
    condition: condition,
    description: description,
    manufactureDate: manufactureDate,
    expiryDate: expiryDate,
    noExpiry: noExpiry,
    image: imageUrl,
    createdAt: new Date().toISOString()
  };
  
  // Add to products array
  products.push(product);
  
  // Save to localStorage
  saveProducts();
  
  // Add to product list UI
  addProductToList(product);
  
  // Update dashboard stats
  updateDashboardStats();
  
  // Reset form
  productForm.reset();
  
  // Reset camera
  if (cameraStream) {
    stopCamera();
  }
  imageCanvas.style.display = 'none';
  cameraStatus.style.display = 'none';
  
  // Show success message
  showAlert('Product added successfully!', 'success');
  
  // Add to activity log
  addActivity('Added new product: ' + productName, 'success');
  
  // Check if no products message should be hidden
  checkNoProductsMessage();
}

// Add product to the UI list
function addProductToList(product) {
  const productList = document.getElementById('productList');
  const noProductsMessage = document.querySelector('.no-products');
  
  // Hide no products message if it exists
  if (noProductsMessage) {
    noProductsMessage.style.display = 'none';
  }
  
  // Create product card
  const productCard = document.createElement('div');
  productCard.className = 'product-card';
  productCard.dataset.id = product.id;
  productCard.dataset.category = product.category;
  
  // Calculate days until expiry
  let expiryStatus = '';
  let daysRemaining = '';
  
  if (product.noExpiry) {
    expiryStatus = '<span class="badge bg-info">No Expiry</span>';
    daysRemaining = 'N/A';
  } else if (product.expiryDate) {
    const today = new Date();
    const expiry = new Date(product.expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    daysRemaining = diffDays + ' days';
    
    if (diffDays < 0) {
      expiryStatus = '<span class="badge bg-danger">Expired</span>';
    } else if (diffDays <= 10) {
      expiryStatus = '<span class="badge bg-warning text-dark">Expiring Soon</span>';
    } else {
      expiryStatus = '<span class="badge bg-success">Active</span>';
    }
  }
  
  // Set product card HTML
  productCard.innerHTML = `
    <div class="product-image">
      ${product.image ? `<img src="${product.image}" alt="${product.name}">` : 
        `<div class="no-image"><i class="fas fa-image"></i></div>`}
    </div>
    <div class="product-details">
      <h5 class="product-name">${product.name}</h5>
      <p class="product-category"><i class="fas fa-folder me-1"></i>${product.category}</p>
      <p class="product-quantity"><i class="fas fa-cubes me-1"></i>Quantity: ${product.quantity}</p>
      <p class="product-expiry">
        <i class="fas fa-calendar-alt me-1"></i>
        ${product.noExpiry ? 'No Expiry' : 'Expires: ' + formatDate(product.expiryDate)}
      </p>
      <div class="product-status">
        ${expiryStatus}
        <span class="days-remaining">${daysRemaining}</span>
      </div>
    </div>
    <div class="product-actions">
      <button class="btn btn-sm btn-primary edit-product" data-id="${product.id}">
        <i class="fas fa-edit"></i>
      </button>
      <button class="btn btn-sm btn-danger delete-product" data-id="${product.id}">
        <i class="fas fa-trash-alt"></i>
      </button>
    </div>
  `;
  
  // Add event listeners to buttons
  productCard.querySelector('.edit-product').addEventListener('click', function() {
    openEditModal(product.id);
  });
  
  productCard.querySelector('.delete-product').addEventListener('click', function() {
    deleteProduct(product.id);
  });
  
  // Add to product list
  productList.appendChild(productCard);
}

// Load products from localStorage
function loadProducts() {
  const savedProducts = localStorage.getItem('products');
  if (savedProducts) {
    products = JSON.parse(savedProducts);
    
    // Add products to UI
    products.forEach(product => {
      addProductToList(product);
    });
    
    // Update dashboard stats
    updateDashboardStats();
    
    // Check if no products message should be hidden
    checkNoProductsMessage();
    
    // Populate products table
    populateProductsTable();
    
    // Update category counts
    updateCategoryCounts();
  }
}

// Save products to localStorage
function saveProducts() {
  localStorage.setItem('products', JSON.stringify(products));
  showAlert('Products saved successfully!', 'success');
}

// Clear all products
function clearProducts() {
  if (confirm('Are you sure you want to clear all products? This action cannot be undone.')) {
    products = [];
    localStorage.removeItem('products');
    
    // Clear product list UI
    document.getElementById('productList').innerHTML = `
      <div class="no-products">
        <i class="fas fa-box-open fa-3x mb-3"></i>
        <h4>No products added yet</h4>
        <p>Add your first product using the form on the left</p>
      </div>
    `;
    
    // Update dashboard stats
    updateDashboardStats();
    
    // Clear products table
    document.getElementById('products-table-body').innerHTML = '';
    
    // Update category counts
    updateCategoryCounts();
    
    // Add to activity log
    addActivity('Cleared all products', 'danger');
    
    showAlert('All products have been cleared', 'info');
  }
}

// Delete a product
function deleteProduct(id) {
  if (confirm('Are you sure you want to delete this product?')) {
    // Find product index
    const index = products.findIndex(product => product.id === id);
    
    if (index !== -1) {
      const productName = products[index].name;
      
      // Remove from array
      products.splice(index, 1);
      
      // Save to localStorage
      saveProducts();
      
      // Remove from UI
      const productCard = document.querySelector(`.product-card[data-id="${id}"]`);
      if (productCard) {
        productCard.remove();
      }
      
      // Update dashboard stats
      updateDashboardStats();
      
      // Update products table
      populateProductsTable();
      
      // Update category counts
      updateCategoryCounts();
      
      // Add to activity log
      addActivity('Deleted product: ' + productName, 'danger');
      
      // Check if no products message should be shown
      checkNoProductsMessage();
      
      showAlert('Product deleted successfully', 'success');
    }
  }
}

// Filter products by category
function filterProductsByCategory() {
  const category = document.getElementById('categoryFilter').value;
  const productCards = document.querySelectorAll('.product-card');
  
  productCards.forEach(card => {
    if (category === 'All' || card.dataset.category === category) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

// Check if no products message should be shown or hidden
function checkNoProductsMessage() {
  const productList = document.getElementById('productList');
  const noProductsMessage = document.querySelector('.no-products');
  
  if (products.length === 0) {
    // If no products, show message
    if (!noProductsMessage) {
      productList.innerHTML = `
        <div class="no-products">
          <i class="fas fa-box-open fa-3x mb-3"></i>
          <h4>No products added yet</h4>
          <p>Add your first product using the form on the left</p>
        </div>
      `;
    } else {
      noProductsMessage.style.display = 'block';
    }
  } else if (noProductsMessage) {
    // If there are products, hide message
    noProductsMessage.style.display = 'none';
  }
}

// Update dashboard stats
function updateDashboardStats() {
  if (!document.getElementById('total-products')) return;
  
  const today = new Date();
  const tenDaysFromNow = new Date(today);
  tenDaysFromNow.setDate(today.getDate() + 10);
  
  let totalProducts = products.length;
  let activeProducts = 0;
  let expiringSoon = 0;
  let expiredProducts = 0;
  
  products.forEach(product => {
    if (product.noExpiry) {
      activeProducts++;
    } else if (product.expiryDate) {
      const expiryDate = new Date(product.expiryDate);
      
      if (expiryDate < today) {
        expiredProducts++;
      } else if (expiryDate <= tenDaysFromNow) {
        expiringSoon++;
        activeProducts++;
      } else {
        activeProducts++;
      }
    }
  });
  
  // Update stats
  document.getElementById('total-products').textContent = totalProducts;
  document.getElementById('active-products').textContent = activeProducts;
  document.getElementById('expiring-soon').textContent = expiringSoon;
  document.getElementById('expired-products').textContent = expiredProducts;
  
  // Update expiring products alert
  updateExpiringProductsAlert();
}

// Update expiring products alert
function updateExpiringProductsAlert() {
  const alertElement = document.getElementById('expiring-products-alert');
  const listElement = document.getElementById('expiring-products-list');
  
  if (!alertElement || !listElement) return;
  
  const today = new Date();
  const tenDaysFromNow = new Date(today);
  tenDaysFromNow.setDate(today.getDate() + 10);
  
  // Filter expiring products
  const expiringProducts = products.filter(product => {
    if (product.noExpiry) return false;
    if (!product.expiryDate) return false;
    
    const expiryDate = new Date(product.expiryDate);
    return expiryDate > today && expiryDate <= tenDaysFromNow;
  });
  
  if (expiringProducts.length > 0) {
    // Show alert
    alertElement.classList.remove('d-none');
    
    // Clear list
    listElement.innerHTML = '';
    
    // Add expiring products to list
    expiringProducts.forEach(product => {
      const expiryDate = new Date(product.expiryDate);
      const daysRemaining = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      
      const li = document.createElement('li');
      li.innerHTML = `<strong>${product.name}</strong> - Expires in ${daysRemaining} days (${formatDate(product.expiryDate)})`;
      listElement.appendChild(li);
    });
    
    // Also update modal list if it exists
    const modalList = document.getElementById('modal-expiring-products-list');
    if (modalList) {
      modalList.innerHTML = listElement.innerHTML;
      
      // Show modal on first load if there are expiring products
      if (!localStorage.getItem('expiryAlertShown')) {
        const expiryModal = new bootstrap.Modal(document.getElementById('expiryNotificationModal'));
        expiryModal.show();
        localStorage.setItem('expiryAlertShown', 'true');
      }
    }
  } else {
    // Hide alert
    alertElement.classList.add('d-none');
  }
}

// Check for expiring products
function checkExpiringProducts() {
  const today = new Date();
  
  // Reset expiry alert shown flag each day
  const lastCheck = localStorage.getItem('lastExpiryCheck');
  if (!lastCheck || new Date(lastCheck).getDate() !== today.getDate()) {
    localStorage.removeItem('expiryAlertShown');
    localStorage.setItem('lastExpiryCheck', today.toISOString());
  }
  
  updateExpiringProductsAlert();
}

// Populate products table
function populateProductsTable() {
  const tableBody = document.getElementById('products-table-body');
  if (!tableBody) return;
  
  // Clear table
  tableBody.innerHTML = '';
  
  // Add products to table
  products.forEach(product => {
    const today = new Date();
    const row = document.createElement('tr');
    
    // Calculate days remaining and status
    let status = '';
    let daysRemaining = '';
    
    if (product.noExpiry) {
      status = '<span class="badge bg-info">No Expiry</span>';
      daysRemaining = 'N/A';
    } else if (product.expiryDate) {
      const expiryDate = new Date(product.expiryDate);
      const diffTime = expiryDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      daysRemaining = diffDays;
      
      if (diffDays < 0) {
        status = '<span class="badge bg-danger">Expired</span>';
      } else if (diffDays <= 10) {
        status = '<span class="badge bg-warning text-dark">Expiring Soon</span>';
      } else {
        status = '<span class="badge bg-success">Active</span>';
      }
    }
    
    row.innerHTML = `
      <td>${product.name}</td>
      <td>${product.category}</td>
      <td>${formatDate(product.manufactureDate)}</td>
      <td>${product.noExpiry ? 'No Expiry' : formatDate(product.expiryDate)}</td>
      <td>${daysRemaining}</td>
      <td>${status}</td>
      <td>
        <button class="btn btn-sm btn-primary edit-product-table" data-id="${product.id}">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-danger delete-product-table" data-id="${product.id}">
          <i class="fas fa-trash-alt"></i>
        </button>
      </td>
    `;
    
    // Add event listeners
    row.querySelector('.edit-product-table').addEventListener('click', function() {
      openEditModal(product.id);
    });
    
    row.querySelector('.delete-product-table').addEventListener('click', function() {
      deleteProduct(product.id);
    });
    
    tableBody.appendChild(row);
  });
}

// Update category counts
function updateCategoryCounts() {
  // Get all category counts
  const categoryCounts = {};
  
  products.forEach(product => {
    if (!categoryCounts[product.category]) {
      categoryCounts[product.category] = 0;
    }
    categoryCounts[product.category]++;
  });
  
  // Update UI
  Object.keys(categoryCounts).forEach(category => {
    const countElement = document.getElementById(`${category.toLowerCase()}-count`);
    if (countElement) {
      countElement.textContent = `${categoryCounts[category]} items`;
    }
  });
  
  // Set default for categories with no products
  ['toys', 'books', 'clothes', 'food', 'games', 'medicines', 'others'].forEach(category => {
    const countElement = document.getElementById(`${category}-count`);
    if (countElement && !categoryCounts[category.charAt(0).toUpperCase() + category.slice(1)]) {
      countElement.textContent = '0 items';
    }
  });
}

// Open edit modal
function openEditModal(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;
  
  // Set editing product ID
  editingProductId = id;
  
  // Fill form fields
  document.getElementById('edit-product-id').value = product.id;
  document.getElementById('edit-productName').value = product.name;
  document.getElementById('edit-manufactureDate').value = product.manufactureDate;
  document.getElementById('edit-expiryDate').value = product.expiryDate || '';
  document.getElementById('edit-productCategory').value = product.category;
  document.getElementById('edit-productQuantity').value = product.quantity;
  document.getElementById('edit-productDescription').value = product.description;
  
  // Show modal
  const editModal = new bootstrap.Modal(document.getElementById('editProductModal'));
  editModal.show();
}

// Handle edit product form submission
function handleEditProductSubmit(e) {
  e.preventDefault();
  
  if (!editingProductId) return;
  
  // Find product index
  const index = products.findIndex(p => p.id === editingProductId);
  
  if (index !== -1) {
    // Get form values
    const name = document.getElementById('edit-productName').value;
    const manufactureDate = document.getElementById('edit-manufactureDate').value;
    const expiryDate = document.getElementById('edit-expiryDate').value;
    const category = document.getElementById('edit-productCategory').value;
    const quantity = parseInt(document.getElementById('edit-productQuantity').value);
    const description = document.getElementById('edit-productDescription').value;
    
    // Update product
    products[index].name = name;
    products[index].manufactureDate = manufactureDate;
    products[index].expiryDate = expiryDate;
    products[index].category = category;
    products[index].quantity = quantity;
    products[index].description = description;
    products[index].noExpiry = !expiryDate;
    
    // Save to localStorage
    saveProducts();
    
    // Update UI
    const productCard = document.querySelector(`.product-card[data-id="${editingProductId}"]`);
    if (productCard) {
      productCard.remove();
      addProductToList(products[index]);
    }
    
    // Update dashboard stats
    updateDashboardStats();
    
    // Update products table
    populateProductsTable();
    
    // Update category counts
    updateCategoryCounts();
    
    // Add to activity log
    addActivity('Updated product: ' + name, 'warning');
    
    // Close modal
    const editModal = bootstrap.Modal.getInstance(document.getElementById('editProductModal'));
    editModal.hide();
    
    // Reset editing product ID
    editingProductId = null;
    
    showAlert('Product updated successfully', 'success');
  }
}

// Show expiring products
function showExpiringProducts() {
  // Switch to inventory tab
  document.getElementById('inventory-tab').click();
  
  // Filter table to show only expiring products
  const today = new Date();
  const tenDaysFromNow = new Date(today);
  tenDaysFromNow.setDate(today.getDate() + 10);
  
  const expiringProducts = products.filter(product => {
    if (product.noExpiry) return false;
    if (!product.expiryDate) return false;
    
    const expiryDate = new Date(product.expiryDate);
    return expiryDate > today && expiryDate <= tenDaysFromNow;
  });
  
  // Update table
  const tableBody = document.getElementById('products-table-body');
  if (!tableBody) return;
  
  // Clear table
  tableBody.innerHTML = '';
  
  // Add expiring products to table
  expiringProducts.forEach(product => {
    const expiryDate = new Date(product.expiryDate);
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const row = document.createElement('tr');
    row.className = 'table-warning';
    
    row.innerHTML = `
      <td>${product.name}</td>
      <td>${product.category}</td>
      <td>${formatDate(product.manufactureDate)}</td>
      <td>${formatDate(product.expiryDate)}</td>
      <td>${diffDays}</td>
      <td><span class="badge bg-warning text-dark">Expiring Soon</span></td>
      <td>
        <button class="btn btn-sm btn-primary edit-product-table" data-id="${product.id}">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-danger delete-product-table" data-id="${product.id}">
          <i class="fas fa-trash-alt"></i>
        </button>
      </td>
    `;
    
    // Add event listeners
    row.querySelector('.edit-product-table').addEventListener('click', function() {
      openEditModal(product.id);
    });
    
    row.querySelector('.delete-product-table').addEventListener('click', function() {
      deleteProduct(product.id);
    });
    
    tableBody.appendChild(row);
  });
  
  // Show message if no expiring products
  if (expiringProducts.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td colspan="7" class="text-center">No products expiring soon</td>
    `;
    tableBody.appendChild(row);
  }
  
  // Add to activity log
  addActivity('Viewed expiring products', 'warning');
}

// Show expired products
function showExpiredProducts() {
  // Switch to inventory tab
  document.getElementById('inventory-tab').click();
  
  // Filter table to show only expired products
  const today = new Date();
  
  const expiredProducts = products.filter(product => {
    if (product.noExpiry) return false;
    if (!product.expiryDate) return false;
    
    const expiryDate = new Date(product.expiryDate);
    return expiryDate < today;
  });
  
  // Update table
  const tableBody = document.getElementById('products-table-body');
  if (!tableBody) return;
  
  // Clear table
  tableBody.innerHTML = '';
  
  // Add expired products to table
  expiredProducts.forEach(product => {
    const expiryDate = new Date(product.expiryDate);
    const diffTime = today - expiryDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const row = document.createElement('tr');
    row.className = 'table-danger';
    
    row.innerHTML = `
      <td>${product.name}</td>
      <td>${product.category}</td>
      <td>${formatDate(product.manufactureDate)}</td>
      <td>${formatDate(product.expiryDate)}</td>
      <td>-${diffDays}</td>
      <td><span class="badge bg-danger">Expired</span></td>
      <td>
        <button class="btn btn-sm btn-primary edit-product-table" data-id="${product.id}">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-danger delete-product-table" data-id="${product.id}">
          <i class="fas fa-trash-alt"></i>
        </button>
      </td>
    `;
    
    // Add event listeners
    row.querySelector('.edit-product-table').addEventListener('click', function() {
      openEditModal(product.id);
    });
    
    row.querySelector('.delete-product-table').addEventListener('click', function() {
      deleteProduct(product.id);
    });
    
    tableBody.appendChild(row);
  });
  
  // Show message if no expired products
  if (expiredProducts.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td colspan="7" class="text-center">No expired products</td>
    `;
    tableBody.appendChild(row);
  }
  
  // Add to activity log
  addActivity('Viewed expired products', 'danger');
}

// Export to CSV
function exportToCSV() {
  if (products.length === 0) {
    showAlert('No products to export', 'warning');
    return;
  }
  
  // Create CSV header
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Name,Category,Quantity,Condition,Description,Manufacture Date,Expiry Date,Status\n";
  
  // Add product data
  products.forEach(product => {
    const today = new Date();
    let status = '';
    
    if (product.noExpiry) {
      status = 'No Expiry';
    } else if (product.expiryDate) {
      const expiryDate = new Date(product.expiryDate);
      const diffTime = expiryDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        status = 'Expired';
      } else if (diffDays <= 10) {
        status = 'Expiring Soon';
      } else {
        status = 'Active';
      }
    }
    
    // Format row data
    const row = [
      product.name,
      product.category,
      product.quantity,
      product.condition,
      product.description.replace(/,/g, ';'), // Replace commas with semicolons
      formatDate(product.manufactureDate),
      product.noExpiry ? 'No Expiry' : formatDate(product.expiryDate),
      status
    ];
    
    csvContent += row.join(',') + '\n';
  });
  
  // Create download link
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `product-inventory-${formatDateForFilename(new Date())}.csv`);
  document.body.appendChild(link);
  
  // Trigger download
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  
  // Add to activity log
  addActivity('Exported products to CSV', 'info');
  
  showAlert('Products exported to CSV', 'success');
}

// Refresh data
function refreshData() {
  // Update dashboard stats
  updateDashboardStats();
  
  // Update products table
  populateProductsTable();
  
  // Update category counts
  updateCategoryCounts();
  
  // Check for expiring products
  checkExpiringProducts();
  
  // Update charts if they exist
  if (window.categoryChart) {
    updateCategoryChart();
  }
  
  if (window.expiryChart) {
    updateExpiryChart();
  }
  
  // Add to activity log
  addActivity('Refreshed data', 'info');
  
  showAlert('Data refreshed', 'success');
}

// Add activity to log
function addActivity(message, type) {
  const activityLog = JSON.parse(localStorage.getItem('activityLog') || '[]');
  
  // Add new activity
  activityLog.unshift({
    message: message,
    type: type,
    timestamp: new Date().toISOString()
  });
  
  // Keep only the last 50 activities
  if (activityLog.length > 50) {
    activityLog.pop();
  }
  
  // Save to localStorage
  localStorage.setItem('activityLog', JSON.stringify(activityLog));
  
  // Update recent entries if they exist
  updateRecentEntries();
}

// Update recent entries
function updateRecentEntries() {
  const recentEntriesElement = document.getElementById('recent-entries');
  const noEntriesElement = document.getElementById('no-entries');
  
  if (!recentEntriesElement || !noEntriesElement) return;
  
  const activityLog = JSON.parse(localStorage.getItem('activityLog') || '[]');
  
  if (activityLog.length > 0) {
    // Hide no entries message
    noEntriesElement.style.display = 'none';
    
    // Clear entries
    recentEntriesElement.innerHTML = '';
    
    // Add recent activities
    activityLog.slice(0, 5).forEach(activity => {
      const entry = document.createElement('div');
      entry.className = `activity-entry ${activity.type}`;
      
      entry.innerHTML = `
        <div class="activity-icon">
          <i class="fas ${getActivityIcon(activity.type)}"></i>
        </div>
        <div class="activity-details">
          <p class="activity-message">${activity.message}</p>
          <p class="activity-time">${formatDateTime(new Date(activity.timestamp))}</p>
        </div>
      `;
      
      recentEntriesElement.appendChild(entry);
    });
  } else {
    // Show no entries message
    noEntriesElement.style.display = 'block';
    recentEntriesElement.innerHTML = '';
  }
}

// Get activity icon based on type
function getActivityIcon(type) {
  switch (type) {
    case 'success':
      return 'fa-check-circle';
    case 'warning':
      return 'fa-exclamation-triangle';
    case 'danger':
      return 'fa-times-circle';
    case 'info':
    default:
      return 'fa-info-circle';
  }
}

// Initialize charts
function initCharts() {
  // Category chart
  const categoryCtx = document.getElementById('category-chart');
  if (categoryCtx) {
    window.categoryChart = new Chart(categoryCtx, {
      type: 'doughnut',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [
            '#4e73df',
            '#1cc88a',
            '#36b9cc',
            '#f6c23e',
            '#e74a3b',
            '#6f42c1',
            '#fd7e14'
          ],
          hoverBackgroundColor: [
            '#2e59d9',
            '#17a673',
            '#2c9faf',
            '#dda20a',
            '#be2617',
            '#5a3092',
            '#c96a17'
          ],
          hoverBorderColor: "rgba(234, 236, 244, 1)",
        }],
      },
      options: {
        maintainAspectRatio: false,
        tooltips: {
          backgroundColor: "rgb(255,255,255)",
          bodyFontColor: "#858796",
          borderColor: '#dddfeb',
          borderWidth: 1,
          xPadding: 15,
          yPadding: 15,
          displayColors: false,
          caretPadding: 10,
        },
        legend: {
          display: true,
          position: 'bottom'
        },
        cutoutPercentage: 70,
      },
    });
    
    updateCategoryChart();
  }
  
  // Expiry chart
  const expiryCtx = document.getElementById('expiry-chart');
  if (expiryCtx) {
    window.expiryChart = new Chart(expiryCtx, {
      type: 'pie',
      data: {
        labels: ['Active', 'Expiring Soon', 'Expired', 'No Expiry'],
        datasets: [{
          data: [0, 0, 0, 0],
          backgroundColor: ['#1cc88a', '#f6c23e', '#e74a3b', '#36b9cc'],
          hoverBackgroundColor: ['#17a673', '#dda20a', '#be2617', '#2c9faf'],
          hoverBorderColor: "rgba(234, 236, 244, 1)",
        }],
      },
      options: {
        maintainAspectRatio: false,
        tooltips: {
          backgroundColor: "rgb(255,255,255)",
          bodyFontColor: "#858796",
          borderColor: '#dddfeb',
          borderWidth: 1,
          xPadding: 15,
          yPadding: 15,
          displayColors: false,
          caretPadding: 10,
        },
        legend: {
          display: true,
          position: 'bottom'
        },
      },
    });
    
    updateExpiryChart();
  }
}

// Update category chart
function updateCategoryChart() {
  if (!window.categoryChart) return;
  
  // Get category counts
  const categoryCounts = {};
  
  products.forEach(product => {
    if (!categoryCounts[product.category]) {
      categoryCounts[product.category] = 0;
    }
    categoryCounts[product.category]++;
  });
  
  // Update chart data
  window.categoryChart.data.labels = Object.keys(categoryCounts);
  window.categoryChart.data.datasets[0].data = Object.values(categoryCounts);
  
  // Update chart
  window.categoryChart.update();
}

// Update expiry chart
function updateExpiryChart() {
  if (!window.expiryChart) return;
  
  const today = new Date();
  const tenDaysFromNow = new Date(today);
  tenDaysFromNow.setDate(today.getDate() + 10);
  
  let active = 0;
  let expiringSoon = 0;
  let expired = 0;
  let noExpiry = 0;
  
  products.forEach(product => {
    if (product.noExpiry) {
      noExpiry++;
    } else if (product.expiryDate) {
      const expiryDate = new Date(product.expiryDate);
      
      if (expiryDate < today) {
        expired++;
      } else if (expiryDate <= tenDaysFromNow) {
        expiringSoon++;
      } else {
        active++;
      }
    }
  });
  
  // Update chart data
  window.expiryChart.data.datasets[0].data = [active, expiringSoon, expired, noExpiry];
  
  // Update chart
  window.expiryChart.update();
}

// Initialize barcode scanner
function initBarcodeScanner() {
  const scannerViewfinder = document.getElementById('scanner-viewfinder');
  const scannerStatus = document.getElementById('scanner-status');
  const startScannerBtn = document.getElementById('start-scanner');
  const stopScannerBtn = document.getElementById('stop-scanner');
  
  if (!scannerViewfinder || !scannerStatus || !startScannerBtn || !stopScannerBtn) return;
  
  let scanner = null;
  
  // Start scanner button
  startScannerBtn.addEventListener('click', function() {
    // Hide placeholder
    document.getElementById('scanner-placeholder').style.display = 'none';
    
    // Show viewfinder
    scannerViewfinder.style.display = 'block';
    scannerViewfinder.innerHTML = '';
    
    // Update status
    scannerStatus.textContent = 'Scanner starting...';
    scannerStatus.className = 'alert alert-info mt-2';
    
    // Initialize scanner
    Quagga.init({
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: scannerViewfinder,
        constraints: {
          width: 480,
          height: 320,
          facingMode: "environment"
        },
      },
      decoder: {
        readers: [
          "code_128_reader",
          "ean_reader",
          "ean_8_reader",
          "code_39_reader",
          "code_39_vin_reader",
          "codabar_reader",
          "upc_reader",
          "upc_e_reader",
          "i2of5_reader"
        ],
        debug: {
          showCanvas: true,
          showPatches: true,
          showFoundPatches: true,
          showSkeleton: true,
          showLabels: true,
          showPatchLabels: true,
          showRemainingPatchLabels: true,
          boxFromPatches: {
            showTransformed: true,
            showTransformedBox: true,
            showBB: true
          }
        }
      },
    }, function(err) {
      if (err) {
        console.error('Error initializing barcode scanner:', err);
        scannerStatus.textContent = 'Error initializing scanner: ' + err;
        scannerStatus.className = 'alert alert-danger mt-2';
        return;
      }
      
      // Start scanner
      Quagga.start();
      
      // Update button states
      startScannerBtn.disabled = true;
      stopScannerBtn.disabled = false;
      
      // Update status
      scannerStatus.textContent = 'Scanner active. Position barcode in view.';
      scannerStatus.className = 'alert alert-success mt-2';
      
      // Set scanner
      scanner = Quagga;
    });
    
    // Listen for barcode detection
    Quagga.onDetected(function(result) {
      if (result && result.codeResult && result.codeResult.code) {
        const barcode = result.codeResult.code;
        
        // Stop scanner
        Quagga.stop();
        
        // Update button states
        startScannerBtn.disabled = false;
        stopScannerBtn.disabled = true;
        
        // Update status
        scannerStatus.textContent = 'Barcode detected: ' + barcode;
        scannerStatus.className = 'alert alert-success mt-2';
        
        // Search for product with barcode
        searchBarcode(barcode);
      }
    });
  });
  
  // Stop scanner button
  stopScannerBtn.addEventListener('click', function() {
    if (scanner) {
      // Stop scanner
      scanner.stop();
      
      // Update button states
      startScannerBtn.disabled = false;
      stopScannerBtn.disabled = true;
      
      // Update status
      scannerStatus.textContent = 'Scanner stopped';
      scannerStatus.className = 'alert alert-info mt-2';
      
      // Show placeholder
      document.getElementById('scanner-placeholder').style.display = 'block';
      
      // Hide viewfinder
      scannerViewfinder.style.display = 'none';
    }
  });
  
  // Search barcode button
  document.getElementById('search-barcode').addEventListener('click', function() {
    const barcode = document.getElementById('barcode-input').value.trim();
    
    if (barcode) {
      searchBarcode(barcode);
    } else {
      showAlert('Please enter a barcode', 'warning');
    }
  });
}

// Search for product with barcode
function searchBarcode(barcode) {
  // In a real application, you would search for the product in the database
  // For this demo, we'll just show a sample product
  
  const scanResult = document.getElementById('scan-result');
  
  if (!scanResult) return;
  
  // Show result
  scanResult.classList.remove('d-none');
  
  // Set result values
  document.getElementById('result-name').textContent = 'Sample Product';
  document.getElementById('result-barcode').textContent = 'Barcode: ' + barcode;
  document.getElementById('result-category').textContent = 'Toys';
  document.getElementById('result-quantity').textContent = '10';
  document.getElementById('result-manufacture-date').textContent = '2023-01-01';
  document.getElementById('result-expiry-date').textContent = '2024-01-01';
  document.getElementById('result-description').textContent = 'This is a sample product description.';
  
  // Add to activity log
  addActivity('Scanned barcode: ' + barcode, 'info');
}

// Format date for display
function formatDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}

// Format date and time for display
function formatDateTime(date) {
  if (!date) return '';
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

// Format date for filename
function formatDateForFilename(date) {
  if (!date) return '';
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${year}${month}${day}_${hours}${minutes}`;
}

// Show alert message
function showAlert(message, type) {
  // Use Toastify if available
  if (typeof Toastify === 'function') {
    Toastify({
      text: message,
      duration: 3000,
      close: true,
      gravity: 'top',
      position: 'right',
      backgroundColor: getAlertColor(type),
      stopOnFocus: true
    }).showToast();
  } else {
    // Fallback to alert
    alert(message);
  }
}

// Get alert color based on type
function getAlertColor(type) {
  switch (type) {
    case 'success':
      return '#1cc88a';
    case 'warning':
      return '#f6c23e';
    case 'danger':
    case 'error':
      return '#e74a3b';
    case 'info':
    default:
      return '#36b9cc';
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  // Initialize charts
  if (typeof Chart === 'function') {
    initCharts();
  }
  
  // Initialize barcode scanner
  if (typeof Quagga === 'function') {
    initBarcodeScanner();
  }
  
  // Initialize recent entries
  updateRecentEntries();
  
  // Load header
  const headerPlaceholder = document.getElementById('header-placeholder');
  if (headerPlaceholder) {
    fetch('components/header.html')
      .then(response => response.text())
      .then(data => {
        headerPlaceholder.innerHTML = data;
        
        // Initialize header after loading
        if (typeof initHeader === 'function') {
          initHeader();
        }
      })
      .catch(error => {
        console.error('Error loading header:', error);
      });
  }
  
  // Add retake image button functionality
  const retakeImageBtn = document.getElementById('retakeImage');
  if (retakeImageBtn) {
    retakeImageBtn.addEventListener('click', function() {
      if (cameraStream) {
        // Hide canvas, show video
        imageCanvas.style.display = 'none';
        cameraFeed.style.display = 'block';
        
        // Update status
        cameraStatus.textContent = 'Camera is active. Position the product and click Capture.';
        cameraStatus.className = 'alert alert-success mt-2';
      }
    });
  }
});