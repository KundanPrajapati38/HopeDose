/**
 * User Authentication System
 * Handles user registration, login, and session management
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

// Check authentication on page load and redirect if needed
(function checkAuth() {
  // Get current page
  const currentPage = window.location.pathname.split('/').pop();
  const authPages = ['login.html', 'signup.html'];
  
  // If not on auth page and not logged in, redirect to login
  if (!authPages.includes(currentPage) && !isUserLoggedIn()) {
    window.location.href = 'login.html';
  }
  
  // If on auth page but already logged in, redirect to home
  if (authPages.includes(currentPage) && isUserLoggedIn()) {
    window.location.href = 'index.html';
  }
})();