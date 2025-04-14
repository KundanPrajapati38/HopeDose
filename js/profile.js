// Profile Page JavaScript

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
  // Load header and footer
  $("#header-placeholder").load("components/header.html", function() {
    // After header is loaded, check if user is logged in
    checkLoginStatus();
    
    // Add active class to current nav item
    const currentLocation = location.href;
    const navItems = document.querySelectorAll('.navbar .nav-link');
    navItems.forEach(item => {
      if (item.href === currentLocation) {
        item.classList.add('active');
      }
    });
  });
  $("#footer-placeholder").load("components/footer.html");
  
  // Initialize AOS animation library
  AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true
  });
  
  // Setup event listeners
  setupEventListeners();
  
  // Animate stats when they come into view
  setupStatsAnimation();
});

// Check login status
function checkLoginStatus() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const authLinks = document.querySelectorAll('.auth-link');
  const dashboardLink = document.querySelector('.dashboard-link');
  const logoutBtn = document.getElementById('logoutBtn');
  
  if (isLoggedIn) {
    // Hide login/signup links and show dashboard link and logout button
    authLinks.forEach(link => link.style.display = 'none');
    if (dashboardLink) dashboardLink.style.display = 'block';
    if (logoutBtn) logoutBtn.style.display = 'block';
    
    // Load user data
    loadUserData();
  } else {
    // Show login/signup links and hide dashboard link and logout button
    authLinks.forEach(link => link.style.display = 'block');
    if (dashboardLink) dashboardLink.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
    
    // Redirect to login page if not on login or signup page
    if (!window.location.href.includes('login.html') && !window.location.href.includes('signup.html')) {
      window.location.href = 'login.html';
    }
  }
}

// Load user data from localStorage
function loadUserData() {
  const userData = JSON.parse(localStorage.getItem('userData')) || {};
  
  // Set profile information
  if (userData.name) {
    document.getElementById('profileName').textContent = userData.name;
    document.getElementById('fullName').textContent = userData.name;
  }
  
  if (userData.email) {
    document.getElementById('profileEmail').textContent = userData.email;
    document.getElementById('contactEmail').textContent = userData.email;
  }
  
  if (userData.phone) {
    document.getElementById('phone').textContent = userData.phone;
  }
  
  if (userData.location) {
    document.getElementById('location').textContent = userData.location;
  }
  
  if (userData.address) {
    document.getElementById('address').textContent = userData.address;
  }
  
  // Set member since date
  if (userData.joinDate) {
    document.getElementById('memberSince').textContent = userData.joinDate;
  } else {
    const currentDate = new Date();
    const formattedDate = new Intl.DateTimeFormat('en-US', { 
      month: 'long', 
      year: 'numeric' 
    }).format(currentDate);
    document.getElementById('memberSince').textContent = formattedDate;
    
    // Save join date if it doesn't exist
    userData.joinDate = formattedDate;
    localStorage.setItem('userData', JSON.stringify(userData));
  }
  
  // Set alternative phone if available
  if (userData.altPhone) {
    document.getElementById('altPhone').textContent = userData.altPhone;
  }
  
  // Set preferred contact method if available
  if (userData.preferredContact) {
    document.getElementById('preferredContact').textContent = userData.preferredContact;
  }
  
  // Set profile image if available
  if (userData.profileImage) {
    document.getElementById('profileImagePreview').src = userData.profileImage;
  }
  
  // Load donation statistics if available
  if (userData.donationStats) {
    const stats = userData.donationStats;
    if (stats.count) document.getElementById('donationCount').textContent = stats.count;
    if (stats.peopleHelped) document.getElementById('peopleHelped').textContent = stats.peopleHelped;
    if (stats.totalAmount) document.getElementById('totalAmount').textContent = '₹' + stats.totalAmount;
    if (stats.rank) document.getElementById('rank').textContent = stats.rank;
  }
}

// Setup event listeners
function setupEventListeners() {
  // Logout functionality
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('isLoggedIn');
        window.location.href = 'login.html';
      }
    });
  }
  
  // Change password link
  const changePasswordLink = document.querySelector('a[href="#"].ms-2.text-primary.small');
  if (changePasswordLink) {
    changePasswordLink.addEventListener('click', function(e) {
      e.preventDefault();
      // Show password change modal or redirect to password change page
      alert('Password change functionality will be implemented soon!');
    });
  }
  
  // Enable 2FA link
  const enable2FALink = document.querySelector('a[href="#"].ms-2.text-primary.small:nth-child(2)');
  if (enable2FALink) {
    enable2FALink.addEventListener('click', function(e) {
      e.preventDefault();
      // Show 2FA setup modal or redirect to 2FA setup page
      alert('Two-factor authentication setup will be implemented soon!');
    });
  }
  
  // Navbar scroll effect
  window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      if (window.scrollY > 30) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  });
}

// Setup stats animation
function setupStatsAnimation() {
  const animateValue = (id, start, end, duration) => {
    if (!document.getElementById(id)) return;
    
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const value = Math.floor(progress * (end - start) + start);
      document.getElementById(id).textContent = value;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  };
  
  // Animate stats when they come into view
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Get values from elements or use defaults
        const donationCount = document.getElementById('donationCount');
        const peopleHelped = document.getElementById('peopleHelped');
        const donationCountValue = donationCount ? parseInt(donationCount.textContent) : 12;
        const peopleHelpedValue = peopleHelped ? parseInt(peopleHelped.textContent) : 36;
        
        animateValue('donationCount', 0, donationCountValue, 1500);
        animateValue('peopleHelped', 0, peopleHelpedValue, 1500);
        
        // Animate total amount with currency symbol
        setTimeout(() => {
          const totalAmount = document.getElementById('totalAmount');
          if (totalAmount) {
            const originalText = totalAmount.textContent;
            totalAmount.textContent = '₹0';
            
            let count = 0;
            const targetAmount = parseInt(originalText.replace(/[^\d]/g, ''));
            const duration = 1500;
            const interval = 30;
            const increment = targetAmount / (duration / interval);
            
            const timer = setInterval(() => {
              count += increment;
              if (count >= targetAmount) {
                clearInterval(timer);
                totalAmount.textContent = originalText;
              } else {
                totalAmount.textContent = '₹' + Math.floor(count).toLocaleString();
              }
            }, interval);
          }
        }, 200);
        
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  
  const statsSection = document.querySelector('.profile-stats');
  if (statsSection) {
    observer.observe(statsSection);
  }
}

// Mock function to simulate donation data (would be replaced with actual API calls)
function fetchDonationData() {
  // This would be an API call in a real application
  return {
    donations: [
      { type: 'Books', items: 15, date: '2 days ago', location: 'Punjab Public Library' },
      { type: 'Cash', amount: 2000, date: '1 week ago', campaign: 'Education For All Campaign' },
      { type: 'Clothes', families: 5, date: '2 weeks ago', program: 'Winter Relief Program' },
      { type: 'Food', amount: 1500, date: '1 month ago', drive: 'Food Distribution Drive' }
    ],
    stats: {
      count: 12,
      peopleHelped: 36,
      totalAmount: 8500,
      rank: 'Silver'
    },
    categories: {
      books: 40,
      clothes: 30,
      food: 20,
      cash: 10
    }
  };
}