// Authentication check - redirect to login if not authenticated
(function() {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    // Check if current page is login or signup page
    const currentPage = window.location.pathname.split('/').pop();
    const authPages = ['login.html', 'signup.html'];
    
    // Always redirect to login page if not logged in
    if (!isLoggedIn && currentPage !== 'login.html' && currentPage !== 'signup.html') {
        // User is not logged in and not on an auth page, redirect to login
        window.location.href = "login.html";
    } else if (isLoggedIn && authPages.includes(currentPage)) {
        // User is logged in but on an auth page, redirect to home
        window.location.href = "index.html";
    }
})();