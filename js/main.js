// Initialize AOS animations
document.addEventListener('DOMContentLoaded', function() {
  // Initialize AOS
  AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true,
    mirror: false
  });

  // Navbar scroll effect
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  // Handle logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      // Clear authentication tokens
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      
      // Redirect to login page
      window.location.href = 'login.html';
      updateNavigation(true);
    });
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
  
  // Fix About Us page content loading
  if (window.location.pathname.includes('about.html')) {
    loadAboutUsContent();
  }
  
  // Enhance Donation page
  if (window.location.pathname.includes('Donate.html')) {
    enhanceDonationPage();
  }
});

// Function to load About Us content
function loadAboutUsContent() {
  const aboutContainer = document.querySelector('.about-content');
  if (aboutContainer) {
    // Make sure content is visible
    aboutContainer.style.display = 'block';
    
    // Add animation to team members
    const teamMembers = document.querySelectorAll('.team-card');
    teamMembers.forEach((member, index) => {
      member.setAttribute('data-aos', 'fade-up');
      member.setAttribute('data-aos-delay', (index * 100).toString());
    });
    
    // Refresh AOS to apply new animations
    AOS.refresh();
  }
}

// Function to enhance donation page
function enhanceDonationPage() {
  // Add hover effects to donation cards
  const donationCards = document.querySelectorAll('.custom-card');
  donationCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-15px)';
      this.style.boxShadow = '0 15px 30px rgba(0,0,0,0.2)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = '';
      this.style.boxShadow = '';
    });
  });
  
  // Add donation amount selector if it exists
  const amountButtons = document.querySelectorAll('.amount-btn');
  if (amountButtons.length > 0) {
    amountButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        // Remove active class from all buttons
        amountButtons.forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        this.classList.add('active');
        
        // Update amount in custom input if it exists
        const customAmount = document.getElementById('customAmount');
        if (customAmount) {
          customAmount.value = this.getAttribute('data-amount');
        }
      });
    });
  }
}

// Handle logout functionality
document.addEventListener('DOMContentLoaded', function() {
    // Find logout button and add event listener
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Clear login status
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("userId");
            localStorage.removeItem("loginTime");
            localStorage.removeItem("currentUser");
            
            // Update navigation
            const authLinks = document.querySelectorAll('.auth-link');
            const dashboardLink = document.querySelector('.dashboard-link');
            
            // Show login/signup links
            authLinks.forEach(link => link.style.display = 'block');
            
            // Hide dashboard link and logout button
            if (dashboardLink) dashboardLink.style.display = 'none';
            this.style.display = 'none';
            
            // Redirect to home page
            window.location.href = "index.html";
        });
    }
    
    // Check login status and update navigation
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (isLoggedIn) {
        const authLinks = document.querySelectorAll('.auth-link');
        const dashboardLink = document.querySelector('.dashboard-link');
        const logoutBtn = document.getElementById('logoutBtn');
        
        // Hide login/signup links
        authLinks.forEach(link => link.style.display = 'none');
        
        // Show dashboard link and logout button
        if (dashboardLink) dashboardLink.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'block';
    }
});