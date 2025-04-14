// Load header and footer components
document.addEventListener('DOMContentLoaded', function() {
    // Load header if it exists
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        fetch('components/header.html')
            .then(response => response.text())
            .then(data => {
                headerPlaceholder.innerHTML = data;
            })
            .catch(error => console.error('Error loading header:', error));
    }
    
    // Load footer if it exists
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        fetch('components/footer.html')
            .then(response => response.text())
            .then(data => {
                footerPlaceholder.innerHTML = data;
                
                // Initialize any footer-specific scripts after loading
                const footerSocialIcons = document.querySelectorAll('.social-icons a');
                if (footerSocialIcons) {
                    footerSocialIcons.forEach(icon => {
                        icon.addEventListener('mouseenter', function() {
                            this.style.transform = 'translateY(-3px)';
                        });
                        icon.addEventListener('mouseleave', function() {
                            this.style.transform = 'translateY(0)';
                        });
                    });
                }
            })
            .catch(error => {
                console.error('Error loading footer:', error);
                footerPlaceholder.innerHTML = '<p class="text-center text-danger">Error loading footer. Please refresh the page.</p>';
            });
    }
});