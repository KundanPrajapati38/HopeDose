// Initialize AOS animations
document.addEventListener('DOMContentLoaded', function() {
  AOS.init({
    duration: 800,
    once: true
  });
  
  // Counter animation for stats
  const counters = document.querySelectorAll('.counter-value');
  const speed = 200; // The lower the slower
  
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };
  
  const observer = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = parseInt(counter.getAttribute('data-target'));
        let count = 0;
        const updateCount = () => {
          const increment = target / speed;
          if (count < target) {
            count += increment;
            counter.innerText = Math.ceil(count);
            setTimeout(updateCount, 1);
          } else {
            counter.innerText = target;
          }
        };
        updateCount();
        observer.unobserve(counter);
      }
    });
  }, observerOptions);
  
  counters.forEach(counter => {
    observer.observe(counter);
  });
  
  // Add smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
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
  
  // Add hover effect for team cards
  const teamCards = document.querySelectorAll('.team-card');
  teamCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.querySelector('.team-img').style.transform = 'scale(1.1)';
      this.querySelector('.team-social').style.bottom = '0';
    });
    
    card.addEventListener('mouseleave', function() {
      this.querySelector('.team-img').style.transform = 'scale(1)';
      this.querySelector('.team-social').style.bottom = '-50px';
    });
  });
});