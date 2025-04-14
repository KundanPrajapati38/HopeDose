// Modal functionality
function openModal(itemType) {
  const modal = document.getElementById("donationModal");
  const modalTitle = document.getElementById("modalTitle");
  const itemTypeInput = document.getElementById("itemType");
  
  // Set the modal title based on item type
  modalTitle.textContent = `Donate ${itemType}`;
  
  // Set the hidden input value
  if (itemTypeInput) {
    itemTypeInput.value = itemType;
  }
  
  // Show the modal with animation
  modal.style.display = "block";
  setTimeout(() => {
    modal.style.opacity = "1";
  }, 10);
  
  // Disable scrolling on the body
  document.body.style.overflow = "hidden";
}

function closeModal() {
  const modal = document.getElementById("donationModal");
  
  // Hide the modal with animation
  modal.style.opacity = "0";
  setTimeout(() => {
    modal.style.display = "none";
  }, 300);
  
  // Re-enable scrolling on the body
  document.body.style.overflow = "auto";
}

// Close modal when clicking outside the modal content
window.onclick = function(event) {
  const modal = document.getElementById("donationModal");
  if (event.target === modal) {
    closeModal();
  }
}

// Handle donation form submission
function submitDonation(event) {
  event.preventDefault();
  
  // Get form data
  const form = document.getElementById("donationForm");
  const formData = new FormData(form);
  
  // Show loading state
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.textContent;
  submitBtn.textContent = "Processing...";
  submitBtn.disabled = true;
  
  // Simulate form submission (replace with actual API call)
  setTimeout(() => {
    // Reset form
    form.reset();
    
    // Show success message
    showNotification("Thank you for your donation! We'll contact you soon for pickup arrangements.", "success");
    
    // Close modal
    closeModal();
    
    // Reset button
    submitBtn.textContent = originalBtnText;
    submitBtn.disabled = false;
  }, 1500);
}

// Notification system
function showNotification(message, type = "info") {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
      <p>${message}</p>
    </div>
    <button class="notification-close"><i class="fas fa-times"></i></button>
  `;
  
  // Add to DOM
  document.body.appendChild(notification);
  
  // Show notification with animation
  setTimeout(() => {
    notification.classList.add("show");
  }, 10);
  
  // Set up close button
  const closeBtn = notification.querySelector(".notification-close");
  closeBtn.addEventListener("click", () => {
    notification.classList.remove("show");
    setTimeout(() => {
      notification.remove();
    }, 300);
  });
  
  // Auto-close after 5 seconds
  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.classList.remove("show");
      setTimeout(() => {
        notification.remove();
      }, 300);
    }
  }, 5000);
}

// Quick donation form handling
document.addEventListener('DOMContentLoaded', function() {
  // Handle custom amount toggle
  const amountCustom = document.getElementById('amountCustom');
  const customAmountContainer = document.getElementById('customAmountContainer');
  const customAmountInput = document.getElementById('customAmountInput');
  const quickDonationForm = document.getElementById('quickDonationForm');
  
  if (amountCustom && customAmountContainer) {
    // Initially hide the custom amount input
    customAmountContainer.style.display = 'none';
    
    // Show/hide custom amount input based on radio selection
    document.querySelectorAll('input[name="amount"]').forEach(radio => {
      radio.addEventListener('change', function() {
        if (this.id === 'amountCustom') {
          customAmountContainer.style.display = 'block';
          customAmountInput.focus();
        } else {
          customAmountContainer.style.display = 'none';
        }
      });
    });
  }
  
  // Handle quick donation form submission
  if (quickDonationForm) {
    quickDonationForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      let selectedAmount = document.querySelector('input[name="amount"]:checked').value;
      let donationAmount;
      
      // Get the donation amount
      if (selectedAmount === 'custom') {
        donationAmount = customAmountInput.value;
        if (!donationAmount || donationAmount <= 0) {
          showNotification("Please enter a valid donation amount", "info");
          return;
        }
      } else {
        donationAmount = selectedAmount;
      }
      
      // Store the amount in localStorage for use on the payment page
      localStorage.setItem('donationAmount', donationAmount);
      
      // Show loading state on button
      const submitBtn = document.getElementById('quickDonateBtn');
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Processing...';
      submitBtn.disabled = true;
      
      // Redirect to payment page after a short delay
      setTimeout(() => {
        window.location.href = 'payment.html';
      }, 800);
    });
  }
});

// Add animation to donation buttons
document.addEventListener('DOMContentLoaded', function() {
  const donationBtns = document.querySelectorAll('.donation-btn');
  
  donationBtns.forEach(btn => {
    btn.addEventListener('mouseover', function() {
      this.innerHTML = '<i class="fas fa-heart-circle me-2"></i>Donate Now';
    });
    
    btn.addEventListener('mouseout', function() {
      const originalText = this.getAttribute('data-original-text') || this.textContent;
      this.innerHTML = originalText;
    });
    
    // Store original text
    btn.setAttribute('data-original-text', btn.innerHTML);
  });
});

// Amount selector for cash donations
function selectAmount(amount) {
  const buttons = document.querySelectorAll('.amount-btn');
  const customInput = document.getElementById('customAmount');
  
  // Reset all buttons
  buttons.forEach(btn => btn.classList.remove('active'));
  
  // If a preset amount is selected
  if (amount) {
    // Add active class to selected button
    event.target.classList.add('active');
    
    // Clear and disable custom amount
    if (customInput) {
      customInput.value = '';
      customInput.disabled = true;
    }
  } else {
    // Enable custom amount input
    if (customInput) {
      customInput.disabled = false;
      customInput.focus();
    }
  }
}

// Initialize donation page
document.addEventListener('DOMContentLoaded', function() {
  // Set up donation form submission
  const donationForm = document.getElementById("donationForm");
  if (donationForm) {
    donationForm.addEventListener("submit", submitDonation);
  }
  
  // Set up amount selector buttons
  const amountButtons = document.querySelectorAll('.amount-btn');
  if (amountButtons.length > 0) {
    amountButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        selectAmount(this.dataset.amount);
      });
    });
    
    // Select default amount
    amountButtons[1].click();
  }
  
  // Initialize custom amount input
  const customAmountInput = document.getElementById('customAmount');
  if (customAmountInput) {
    customAmountInput.addEventListener('focus', function() {
      selectAmount(null);
    });
  }
  
  // Add animation to donation cards
  const cards = document.querySelectorAll('.custom-card, .card');
  if (cards.length > 0) {
    cards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.1}s`;
      card.classList.add('fade-in');
    });
  }
  
  // Initialize FAQ accordion
  const accordionItems = document.querySelectorAll('.accordion-item');
  if (accordionItems.length > 0) {
    accordionItems.forEach(item => {
      const header = item.querySelector('.accordion-header');
      header.addEventListener('click', () => {
        // Toggle current item
        item.classList.toggle('active');
        
        // Close other items
        accordionItems.forEach(otherItem => {
          if (otherItem !== item && otherItem.classList.contains('active')) {
            otherItem.classList.remove('active');
          }
        });
      });
    });
    
    // Open first accordion item by default
    accordionItems[0].classList.add('active');
  }
});

// Add CSS for notifications
document.addEventListener('DOMContentLoaded', function() {
  const style = document.createElement('style');
  style.textContent = `
    .notification {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: white;
      border-radius: 10px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.2);
      padding: 15px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 1000;
      transform: translateY(100px);
      opacity: 0;
      transition: all 0.3s ease;
      max-width: 400px;
    }
    
    .notification.show {
      transform: translateY(0);
      opacity: 1;
    }
    
    .notification.success {
      border-left: 4px solid #28a745;
    }
    
    .notification.info {
      border-left: 4px solid #4db8ff;
    }
    
    .notification.error {
      border-left: 4px solid #dc3545;
    }
    
    .notification-content {
      display: flex;
      align-items: center;
    }
    
    .notification-content i {
      font-size: 1.5rem;
      margin-right: 15px;
    }
    
    .notification.success i {
      color: #28a745;
    }
    
    .notification.info i {
      color: #4db8ff;
    }
    
    .notification.error i {
      color: #dc3545;
    }
    
    .notification-content p {
      margin: 0;
      color: #333;
    }
    
    .notification-close {
      background: none;
      border: none;
      color: #999;
      cursor: pointer;
      margin-left: 15px;
      padding: 5px;
      transition: all 0.3s ease;
    }
    
    .notification-close:hover {
      color: #333;
      transform: scale(1.2);
    }
    
    @keyframes fade-in {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .fade-in {
      animation: fade-in 0.6s ease forwards;
      opacity: 0;
    }
  `;
  document.head.appendChild(style);
});