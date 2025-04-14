document.addEventListener('DOMContentLoaded', function() {
    // Hide alert initially
    const loginAlert = document.getElementById('loginAlert');
    if (loginAlert) {
        loginAlert.style.display = 'none';
    }
    
    // Login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Simple validation
            if (!email || !password) {
                loginAlert.textContent = 'Please enter both email and password.';
                loginAlert.style.display = 'block';
                return;
            }
            
            // For demo purposes - in a real app, you would validate with a server
            if (email === 'demo@example.com' && password === 'password') {
                // Store login state
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userData', JSON.stringify({
                    name: 'Demo User',
                    email: email,
                    role: 'user'
                }));
                
                // Redirect to dashboard or home
                window.location.href = 'index.html';
            } else {
                loginAlert.textContent = 'Invalid email or password. Please try again.';
                loginAlert.style.display = 'block';
            }
        });
    }

    // Forgot password handler
    const forgotPasswordLink = document.querySelector('.forgot-password');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Password reset functionality would be implemented here.');
        });
    }

    // Social login handlers
    const socialButtons = document.querySelectorAll('.social-btn');
    socialButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const platform = this.classList.contains('facebook') ? 'Facebook' : 
                            this.classList.contains('google') ? 'Google' : 'Twitter';
            alert(`${platform} login would be implemented here.`);
        });
    });
    
    // Remember me functionality
    const rememberMeCheckbox = document.getElementById('rememberMe');
    if (rememberMeCheckbox) {
        // Check if we have saved credentials
        const savedEmail = localStorage.getItem('rememberedEmail');
        if (savedEmail) {
            document.getElementById('email').value = savedEmail;
            rememberMeCheckbox.checked = true;
        }
        
        // Save credentials when form is submitted if remember me is checked
        if (loginForm) {
            loginForm.addEventListener('submit', function() {
                if (rememberMeCheckbox.checked) {
                    localStorage.setItem('rememberedEmail', document.getElementById('email').value);
                } else {
                    localStorage.removeItem('rememberedEmail');
                }
            });
        }
    }
    
    // Password visibility toggle
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        // Create and append the toggle button
        const toggleButton = document.createElement('button');
        toggleButton.type = 'button';
        toggleButton.className = 'btn btn-outline-secondary password-toggle';
        toggleButton.innerHTML = '<i class="fas fa-eye"></i>';
        toggleButton.style.position = 'absolute';
        toggleButton.style.right = '10px';
        toggleButton.style.top = '50%';
        toggleButton.style.transform = 'translateY(-50%)';
        toggleButton.style.zIndex = '10';
        toggleButton.style.border = 'none';
        toggleButton.style.background = 'transparent';
        
        // Add the button to the password input's parent
        const passwordParent = passwordInput.parentElement;
        passwordParent.style.position = 'relative';
        passwordParent.appendChild(toggleButton);
        
        // Toggle password visibility
        toggleButton.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
    }
    
    // Add animation to form elements
    const formElements = document.querySelectorAll('.form-group, .form-check, .btn-login, .divider, .social-login, .login-footer');
    formElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 100 + (index * 100));
    });
    
    // Check if user is already logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
        // Redirect to home page if already logged in
        window.location.href = 'index.html';
    }
    
    // Handle signup link
    const signupLink = document.querySelector('.login-footer a');
    if (signupLink) {
        signupLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'signup.html';
        });
    }
});