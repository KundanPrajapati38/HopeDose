document.addEventListener('DOMContentLoaded', function() {
  // Get all filter elements
  const categoryFilter = document.getElementById('categoryFilter');
  const availabilityFilter = document.getElementById('availabilityFilter');
  const sortByFilter = document.getElementById('sortBy');
  const searchInput = document.getElementById('searchInventory');
  const resetButton = document.getElementById('resetFilters');
  
  // Get all inventory items
  const inventoryItems = document.querySelectorAll('#inventoryItems > div');
  const emptyState = document.getElementById('emptyState');
  
  // Apply filters when any filter changes
  categoryFilter.addEventListener('change', applyFilters);
  availabilityFilter.addEventListener('change', applyFilters);
  sortByFilter.addEventListener('change', applyFilters);
  searchInput.addEventListener('input', applyFilters);
  
  // Reset filters
  resetButton.addEventListener('click', resetFilters);
  
  // Function to apply all filters
  function applyFilters() {
    const category = categoryFilter.value;
    const availability = availabilityFilter.value;
    const sortBy = sortByFilter.value;
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    let visibleCount = 0;
    
    // Filter items
    inventoryItems.forEach(item => {
      const itemCategory = item.getAttribute('data-category');
      const itemTitle = item.querySelector('.inventory-title').textContent.toLowerCase();
      const itemDescription = item.querySelector('.inventory-text').textContent.toLowerCase();
      const isLowStock = item.querySelector('.badge-low') !== null;
      
      // Check if item matches category filter
      const matchesCategory = category === 'all' || itemCategory === category;
      
      // Check if item matches availability filter
      const matchesAvailability = availability === 'all' || 
                                 (availability === 'available' && !isLowStock) ||
                                 (availability === 'low' && isLowStock);
      
      // Check if item matches search term
      const matchesSearch = searchTerm === '' || 
                           itemTitle.includes(searchTerm) || 
                           itemDescription.includes(searchTerm);
      
      // Show or hide item based on filters
      if (matchesCategory && matchesAvailability && matchesSearch) {
        item.style.display = 'block';
        visibleCount++;
      } else {
        item.style.display = 'none';
      }
    });
    
    // Show empty state if no items match filters
    if (visibleCount === 0) {
      emptyState.style.display = 'block';
      document.querySelector('.pagination-container').style.display = 'none';
    } else {
      emptyState.style.display = 'none';
      document.querySelector('.pagination-container').style.display = 'flex';
    }
    
    // Apply sorting
    sortItems(sortBy);
  }
  
  // Function to sort items
  function sortItems(sortBy) {
    const itemsArray = Array.from(inventoryItems);
    const container = document.getElementById('inventoryItems');
    
    itemsArray.sort((a, b) => {
      const titleA = a.querySelector('.inventory-title').textContent;
      const titleB = b.querySelector('.inventory-title').textContent;
      const dateA = new Date(a.querySelector('.inventory-date span').textContent.replace('Added: ', ''));
      const dateB = new Date(b.querySelector('.inventory-date span').textContent.replace('Added: ', ''));
      
      switch(sortBy) {
        case 'newest':
          return dateB - dateA;
        case 'oldest':
          return dateA - dateB;
        case 'name-asc':
          return titleA.localeCompare(titleB);
        case 'name-desc':
          return titleB.localeCompare(titleA);
        default:
          return 0;
      }
    });
    
    // Reorder items in the DOM
    itemsArray.forEach(item => {
      container.appendChild(item);
    });
  }
  
  // Function to reset all filters
  function resetFilters() {
    categoryFilter.value = 'all';
    availabilityFilter.value = 'all';
    sortByFilter.value = 'newest';
    searchInput.value = '';
    
    // Show all items
    inventoryItems.forEach(item => {
      item.style.display = 'block';
    });
    
    // Hide empty state
    emptyState.style.display = 'none';
    document.querySelector('.pagination-container').style.display = 'flex';
    
    // Apply default sorting
    sortItems('newest');
  }
  
  // Check if the user is logged in
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  
  if (isLoggedIn) {
    // Hide login and signup links if the user is logged in
    setTimeout(() => {
      document.querySelector('a[href="./login.html"]').style.display = 'none';
      document.querySelector('a[href="./signup.html"]').style.display = 'none';
      // Show logout button
      document.getElementById("logoutButton").style.display = 'block';
    }, 200);
  } else {
    // If not logged in, hide the logout button
    setTimeout(() => {
      document.getElementById("logoutButton").style.display = 'none';
    }, 200);
  }
  
  // Handle logout
  setTimeout(() => {
    document.getElementById("logoutButton").addEventListener("click", function () {
      localStorage.removeItem("isLoggedIn");
      alert("Logged out successfully!");
      window.location.href = "login.html";
    });
  }, 200);
  
  // Initialize pagination
  const paginationLinks = document.querySelectorAll('.pagination .page-link');
  paginationLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Remove active class from all pagination items
      document.querySelectorAll('.pagination .page-item').forEach(item => {
        item.classList.remove('active');
      });
      
      // Add active class to clicked pagination item
      if (!this.getAttribute('aria-label')) {
        this.parentElement.classList.add('active');
      }
    });
  });
});