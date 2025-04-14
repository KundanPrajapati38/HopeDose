/**
 * User Authentication System
 * Handles user registration, login, and session management
 * Restricts access to all features until user is authenticated
 */

// Initialize user storage if it doesn't exist
if (!localStorage.getItem('users')) {
  localStorage.setItem('users', JSON.stringify([]));
}

// User registration function
function registerUser(name, email, password) {
  // Get existing users
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  
  // Check if email already exists
  if (users.some(user => user.email === email)) {
    return {
      success: false,
      message: 'Email already registered'
    };
  }
  
  // Add new user
  users.push({
    name: name,
    email: email,
    password: password, // In a real app, this should be hashed
    createdAt: new Date().toISOString()
  });
  
  // Save updated users array
  localStorage.setItem('users', JSON.stringify(users));
  
  return {
    success: true,
    message: 'Registration successful'
  };
}

// User login function
function loginUser(email, password) {
  // Get users from storage
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  
  // Find user with matching email and password
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    // Set login state
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('loginTime', Date.now());
    
    // Store user info (excluding password)
    const userInfo = {
      name: user.name,
      email: user.email
    };
    localStorage.setItem('currentUser', JSON.stringify(userInfo));
    
    return {
      success: true,
      user: userInfo
    };
  } else {
    return {
      success: false,
      message: 'Invalid email or password'
    };
  }
}

// User logout function
function logoutUser() {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('currentUser');
  localStorage.removeItem('loginTime');
  localStorage.removeItem('rememberMe');
  return true;
}

// Check if user is logged in
function isUserLoggedIn() {
  return localStorage.getItem('isLoggedIn') === 'true';
}

// Get current user info
function getCurrentUser() {
  return JSON.parse(localStorage.getItem('currentUser') || '{}');
}

// Initialize event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Handle signup form
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const name = document.getElementById('fullName').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      
      const errorElement = document.getElementById('signupError');
      const successElement = document.getElementById('signupSuccess');
      
      // Reset messages
      errorElement.style.display = 'none';
      successElement.style.display = 'none';
      
      // Validate passwords match
      if (password !== confirmPassword) {
        errorElement.textContent = 'Passwords do not match';
        errorElement.style.display = 'block';
        return;
      }
      
      // Register user
      const result = registerUser(name, email, password);
      
      if (result.success) {
        successElement.textContent = 'Account created successfully! Redirecting to login...';
        successElement.style.display = 'block';
        
        // Reset form
        signupForm.reset();
        
        // Redirect to login page after delay
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 2000);
      } else {
        errorElement.textContent = result.message;
        errorElement.style.display = 'block';
      }
    });
  }
  
  // Handle login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const rememberMe = document.getElementById('rememberMe')?.checked;
      
      const errorElement = document.getElementById('loginError');
      
      // Reset error
      errorElement.style.display = 'none';
      
      // Login user
      const result = loginUser(email, password);
      
      if (result.success) {
        // If remember me is checked, set a longer expiry
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }
        
        // Redirect to home page
        window.location.href = 'index.html';
      } else {
        errorElement.textContent = result.message;
        errorElement.style.display = 'block';
      }
    });
  }
  
  // Handle logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      logoutUser();
      window.location.href = 'login.html';
    });
  }
  
  // Update UI based on login state
  updateAuthUI();
  
  // Apply access restrictions based on auth status
  restrictAccess();
});

// Update UI elements based on authentication state
function updateAuthUI() {
  const isLoggedIn = isUserLoggedIn();
  const currentUser = getCurrentUser();
  
  // Update auth links visibility
  const authLinks = document.querySelectorAll('.auth-link');
  const dashboardLink = document.querySelector('.dashboard-link');
  const logoutBtn = document.getElementById('logoutBtn');
  
  if (isLoggedIn) {
    // Hide login/signup links
    authLinks.forEach(link => link.style.display = 'none');
    
    // Show dashboard link and logout button
    if (dashboardLink) dashboardLink.style.display = 'block';
    if (logoutBtn) logoutBtn.style.display = 'block';
    
    // Display user name if available
    const userNameElement = document.getElementById('userName');
    if (userNameElement && currentUser.name) {
      userNameElement.textContent = currentUser.name;
    }
  } else {
    // Show login/signup links
    authLinks.forEach(link => link.style.display = 'block');
    
    // Hide dashboard link and logout button
    if (dashboardLink) dashboardLink.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
  }
}

// Restrict access to functionality until user is authenticated
function restrictAccess() {
  const isLoggedIn = isUserLoggedIn();
  const currentPage = window.location.pathname.split('/').pop();
  const publicPages = ['login.html', 'signup.html', 'about.html', 'contact.html'];
  
  // If not logged in and not on a public page, show auth overlay
  if (!isLoggedIn && !publicPages.includes(currentPage) && currentPage !== '') {
    // Create auth overlay if it doesn't exist
    if (!document.getElementById('authOverlay')) {
      const overlay = document.createElement('div');
      overlay.id = 'authOverlay';
      overlay.innerHTML = `
        <div class="auth-restriction-modal">
          <h2>Authentication Required</h2>
          <p>Please log in or sign up to access this feature.</p>
          <div class="auth-buttons">
            <a href="login.html" class="btn btn-primary">Login</a>
            <a href="signup.html" class="btn btn-outline-primary">Sign Up</a>
          </div>
        </div>
      `;
      
      // Style the overlay
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      overlay.style.zIndex = '9999';
      overlay.style.display = 'flex';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      
      // Add overlay to body
      document.body.appendChild(overlay);
      
      // Disable scrolling on the body
      document.body.style.overflow = 'hidden';
      
      // Add CSS for the modal
      const style = document.createElement('style');
      style.textContent = `
        .auth-restriction-modal {
          background-color: white;
          padding: 30px;
          border-radius: 10px;
          text-align: center;
          max-width: 400px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.3);
          animation: fadeIn 0.3s ease;
        }
        
        .auth-restriction-modal h2 {
          color: #007bff;
          margin-bottom: 15px;
        }
        
        .auth-restriction-modal p {
          margin-bottom: 25px;
          color: #555;
        }
        
        .auth-buttons {
          display: flex;
          justify-content: center;
          gap: 15px;
        }
        
        .auth-buttons .btn {
          padding: 10px 20px;
          border-radius: 5px;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        
        .auth-buttons .btn-primary {
          background-color: #007bff;
          color: white;
          border: none;
        }
        
        .auth-buttons .btn-outline-primary {
          background-color: transparent;
          color: #007bff;
          border: 1px solid #007bff;
        }
        
        .auth-buttons .btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 5px 10px rgba(0,0,0,0.1);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Disable all interactive elements behind the overlay
    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
    interactiveElements.forEach(element => {
      if (!element.closest('#authOverlay')) {
        element.disabled = true;
        if (element.tagName === 'A') {
          element.style.pointerEvents = 'none';
        }
      }
    });
  }
}

// Check authentication on page load and redirect if needed
(function checkAuth() {
  // Get current page
  const currentPage = window.location.pathname.split('/').pop();
  const publicPages = ['login.html', 'signup.html', 'about.html', 'contact.html'];
  
  // If not on a public page and not logged in, redirect to login
  if (!publicPages.includes(currentPage) && currentPage !== '' && !isUserLoggedIn()) {
    // Set a flag to indicate auth is required
    localStorage.setItem('authRequired', 'true');
    localStorage.setItem('redirectAfterLogin', window.location.href);
    
    // Redirect to login
    window.location.href = 'login.html';
  }
  
  // If on auth page but already logged in, redirect to home
  if ((currentPage === 'login.html' || currentPage === 'signup.html') && isUserLoggedIn()) {
    window.location.href = 'index.html';
  }
  
  // Check for session timeout (if not using remember me)
  if (isUserLoggedIn() && !localStorage.getItem('rememberMe')) {
    const loginTime = parseInt(localStorage.getItem('loginTime') || '0');
    const currentTime = Date.now();
    const sessionTimeout = 30 * 60 * 1000; // 30 minutes
    
    if (currentTime - loginTime > sessionTimeout) {
      // Session expired
      logoutUser();
      
      // Set flag to show session expired message
      localStorage.setItem('sessionExpired', 'true');
      
      // Redirect to login
      window.location.href = 'login.html';
    }
  }
})();