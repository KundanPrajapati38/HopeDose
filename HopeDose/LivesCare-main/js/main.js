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
    document.querySelector('a[href="./login.html"]').style.display = 'none';
    document.querySelector('a[href="./signup.html"]').style.display = 'none';
    // Show logout button
    document.getElementById("logoutButton").style.display = 'block';
  } else {
    // Hide logout button if not logged in
    document.getElementById("logoutButton").style.display = 'none';
  }
});

// Handle logout
document.getElementById("logoutButton").addEventListener("click", function () {
  localStorage.removeItem("isLoggedIn");
  alert("Logged out successfully!");
  window.location.href = "login.html";
});

// Add smooth scrolling for all links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    
    const targetId = this.getAttribute('href');
    if(targetId === '#') return;
    
    document.querySelector(targetId).scrollIntoView({
      behavior: 'smooth'
    });
  });
});

// Add counter animation for impact numbers
function animateCounters() {
  const counters = document.querySelectorAll('.counter-value');
  const speed = 200;
  
  counters.forEach(counter => {
    const target = +counter.getAttribute('data-target');
    let count = 0;
    const increment = target / speed;
    
    const updateCount = () => {
      if(count < target) {
        count += increment;
        counter.innerText = Math.ceil(count);
        setTimeout(updateCount, 1);
      } else {
        counter.innerText = target;
      }
    };
    
    updateCount();
  });
}

// Check if element is in viewport
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Trigger counter animation when scrolled into view
window.addEventListener('scroll', function() {
  const counterSection = document.querySelector('.impact-section');
  if(counterSection && isInViewport(counterSection) && !counterSection.classList.contains('counted')) {
    counterSection.classList.add('counted');
    animateCounters();
  }
});