// Initialize AOS animations
AOS.init({
  duration: 800,
  easing: 'ease-in-out',
  once: true
});

// Check if the user is logged in
document.addEventListener('DOMContentLoaded', function() {
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

  // Handle custom amount toggle
  const amountCustom = document.getElementById('amountCustom');
  const customAmountContainer = document.getElementById('customAmountContainer');
  
  if (amountCustom && customAmountContainer) {
    // Show/hide custom amount input based on radio selection
    document.querySelectorAll('input[name="amount"]').forEach(radio => {
      radio.addEventListener('change', function() {
        if (this.id === 'amountCustom') {
          customAmountContainer.style.display = 'block';
          document.getElementById('customAmount').focus();
        } else {
          customAmountContainer.style.display = 'none';
        }
      });
    });
  }

  // Handle donation form submission
  const donationForm = document.getElementById('donationForm');
  
  if (donationForm) {
    donationForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get form values
      const firstName = document.getElementById('firstName').value;
      const lastName = document.getElementById('lastName').value;
      const email = document.getElementById('email').value;
      
      // Get selected amount
      let amount;
      const selectedAmount = document.querySelector('input[name="amount"]:checked');
      
      if (selectedAmount.value === 'custom') {
        amount = document.getElementById('customAmount').value;
      } else {
        amount = selectedAmount.value;
      }
      
      // Get donation frequency
      const frequency = document.querySelector('input[name="frequency"]:checked').value;
      
      // Get donation purpose
      const cause = document.getElementById('cause').value;
      
      // Get payment method
      const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
      
      // Check if anonymous
      const isAnonymous = document.getElementById('anonymous').checked;
      
      // Check if subscribed to newsletter
      const isSubscribed = document.getElementById('newsletter').checked;
      
      // Store donation data in localStorage (in a real app, this would be sent to a server)
      const donationData = {
        firstName,
        lastName,
        email,
        amount,
        frequency,
        cause,
        paymentMethod,
        isAnonymous,
        isSubscribed,
        date: new Date().toISOString()
      };
      
      // Get existing donations or initialize empty array
      const donations = JSON.parse(localStorage.getItem('donations') || '[]');
      
      // Add new donation
      donations.push(donationData);
      
      // Save to localStorage
      localStorage.setItem('donations', JSON.stringify(donations));
      
      // Show success message
      alert('Thank you for your donation! Your contribution will make a significant impact.');
      
      // Reset form
      donationForm.reset();
      customAmountContainer.style.display = 'none';
      
      // Redirect to thank you page (if it exists)
      // window.location.href = 'thank-you.html';
    });
  }

  // Handle FAQ accordion
  const accordionItems = document.querySelectorAll('.accordion-item');
  
  accordionItems.forEach(item => {
    const header = item.querySelector('.accordion-header');
    const content = item.querySelector('.accordion-content');
    
    header.addEventListener('click', function() {
      // Close all other accordion items
      accordionItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          otherItem.querySelector('.accordion-content').style.maxHeight = null;
        }
      });
      
      // Toggle current accordion item
      item.classList.toggle('active');
      
      if (item.classList.contains('active')) {
        content.style.maxHeight = content.scrollHeight + 'px';
      } else {
        content.style.maxHeight = null;
      }
    });
  });

  // Smooth scroll for anchor links
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  
  anchorLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 100,
          behavior: 'smooth'
        });
      }
    });
  });

  // Add donation amount validation
  const customAmount = document.getElementById('customAmount');
  
  if (customAmount) {
    customAmount.addEventListener('input', function() {
      // Remove non-numeric characters
      this.value = this.value.replace(/[^0-9]/g, '');
      
      // Ensure minimum amount
      if (this.value && parseInt(this.value) < 1) {
        this.value = '1';
      }
    });
  }

  // Add payment method specific fields
  const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
  const paymentDetailsContainer = document.createElement('div');
  paymentDetailsContainer.className = 'payment-details mt-3';
  
  if (paymentMethods.length > 0) {
    // Insert payment details container after payment methods
    const paymentMethodsContainer = document.querySelector('.payment-methods');
    if (paymentMethodsContainer) {
      paymentMethodsContainer.parentNode.insertBefore(paymentDetailsContainer, paymentMethodsContainer.nextSibling);
    }
    
    // Handle payment method change
    paymentMethods.forEach(method => {
      method.addEventListener('change', function() {
        updatePaymentDetails(this.value);
      });
    });
    
    // Initialize with default selected payment method
    const defaultMethod = document.querySelector('input[name="paymentMethod"]:checked');
    if (defaultMethod) {
      updatePaymentDetails(defaultMethod.value);
    }
  }

  // Function to update payment details based on selected method
  function updatePaymentDetails(method) {
    let detailsHTML = '';
    
    switch(method) {
      case 'credit-card':
        detailsHTML = `
          <div class="row mb-3">
            <div class="col-12 mb-3">
              <label for="cardNumber" class="form-label">Card Number</label>
              <input type="text" class="form-control" id="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19">
            </div>
          </div>
          <div class="row mb-3">
            <div class="col-md-6 mb-3 mb-md-0">
              <label for="expiryDate" class="form-label">Expiry Date</label>
              <input type="text" class="form-control" id="expiryDate" placeholder="MM/YY" maxlength="5">
            </div>
            <div class="col-md-6">
              <label for="cvv" class="form-label">CVV</label>
              <input type="text" class="form-control" id="cvv" placeholder="123" maxlength="3">
            </div>
          </div>
          <div class="row">
            <div class="col-12">
              <label for="cardName" class="form-label">Name on Card</label>
              <input type="text" class="form-control" id="cardName" placeholder="John Doe">
            </div>
          </div>
        `;
        break;
      case 'upi':
        detailsHTML = `
          <div class="mb-3">
            <label for="upiId" class="form-label">UPI ID</label>
            <input type="text" class="form-control" id="upiId" placeholder="yourname@upi">
          </div>
        `;
        break;
      case 'net-banking':
        detailsHTML = `
          <div class="mb-3">
            <label for="bankName" class="form-label">Select Bank</label>
            <select class="form-select" id="bankName">
              <option value="">Select your bank</option>
              <option value="sbi">State Bank of India</option>
              <option value="hdfc">HDFC Bank</option>
              <option value="icici">ICICI Bank</option>
              <option value="axis">Axis Bank</option>
              <option value="pnb">Punjab National Bank</option>
              <option value="other">Other</option>
            </select>
          </div>
        `;
        break;
    }
    
    paymentDetailsContainer.innerHTML = detailsHTML;
    
    // Add validation for credit card fields
    if (method === 'credit-card') {
      const cardNumber = document.getElementById('cardNumber');
      const expiryDate = document.getElementById('expiryDate');
      const cvv = document.getElementById('cvv');
      
      if (cardNumber) {
        cardNumber.addEventListener('input', function() {
          // Format card number with spaces
          this.value = this.value.replace(/[^0-9]/g, '').replace(/(.{4})/g, '$1 ').trim();
        });
      }
      
      if (expiryDate) {
        expiryDate.addEventListener('input', function() {
          // Format expiry date as MM/YY
          this.value = this.value.replace(/[^0-9]/g, '');
          if (this.value.length > 2) {
            this.value = this.value.substring(0, 2) + '/' + this.value.substring(2, 4);
          }
        });
      }
      
      if (cvv) {
        cvv.addEventListener('input', function() {
          // Allow only numbers for CVV
          this.value = this.value.replace(/[^0-9]/g, '');
        });
      }
    }
  }
});