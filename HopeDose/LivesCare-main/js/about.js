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
});

// Animate counter numbers
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
  const statsSection = document.querySelector('.stats-section');
  if(statsSection && isInViewport(statsSection) && !statsSection.classList.contains('counted')) {
    statsSection.classList.add('counted');
    animateCounters();
  }
});

// Team member hover effects
document.addEventListener('DOMContentLoaded', function() {
  const teamCards = document.querySelectorAll('.team-card');
  
  teamCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.querySelector('.team-social').style.bottom = '0';
    });
    
    card.addEventListener('mouseleave', function() {
      this.querySelector('.team-social').style.bottom = '-50px';
    });
  });
});

// Testimonial carousel functionality
document.addEventListener('DOMContentLoaded', function() {
  // Check if testimonial section exists
  const testimonialSection = document.querySelector('.testimonial-section');
  if (testimonialSection) {
    // Add more testimonials dynamically
    const additionalTestimonials = [
      {
        text: "The transparency of HopeDose is what I appreciate most. I can see exactly where my donations are going and the impact they're making.",
        name: "Amit Joshi",
        position: "Regular Donor",
        image: "https://randomuser.me/api/portraits/men/75.jpg"
      },
      {
        text: "As a volunteer with HopeDose, I've witnessed firsthand the difference this organization makes in people's lives. The team's dedication is truly inspiring.",
        name: "Sunita Rao",
        position: "Volunteer",
        image: "https://randomuser.me/api/portraits/women/63.jpg"
      }
    ];
    
    // Create and append new testimonial cards
    const testimonialRow = document.querySelector('.testimonial-section .row');
    
    additionalTestimonials.forEach((testimonial, index) => {
      const testimonialCard = document.createElement('div');
      testimonialCard.className = 'col-md-6 mb-4';
      testimonialCard.setAttribute('data-aos', 'fade-up');
      testimonialCard.setAttribute('data-aos-delay', (index + 3) * 100);
      
      testimonialCard.innerHTML = `
        <div class="testimonial-card">
          <div class="testimonial-content">
            <p class="testimonial-text">${testimonial.text}</p>
          </div>
          <div class="testimonial-author">
            <div class="testimonial-img">
              <img src="${testimonial.image}" alt="Testimonial">
            </div>
            <div class="testimonial-info">
              <h5>${testimonial.name}</h5>
              <p>${testimonial.position}</p>
            </div>
          </div>
        </div>
      `;
      
      testimonialRow.appendChild(testimonialCard);
    });
  }
});

// FAQ accordion functionality
document.addEventListener('DOMContentLoaded', function() {
  // Check if FAQ section exists
  const faqSection = document.querySelector('.faq-section');
  if (faqSection) {
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
  }
});

// Smooth scroll for anchor links
document.addEventListener('DOMContentLoaded', function() {
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
});

// Image gallery lightbox
document.addEventListener('DOMContentLoaded', function() {
  const galleryImages = document.querySelectorAll('.gallery-img');
  
  if (galleryImages.length > 0) {
    // Create lightbox elements
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <div class="lightbox-content">
        <span class="lightbox-close">&times;</span>
        <img class="lightbox-image">
        <div class="lightbox-caption"></div>
      </div>
    `;
    document.body.appendChild(lightbox);
    
    const lightboxImage = lightbox.querySelector('.lightbox-image');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');
    const lightboxClose = lightbox.querySelector('.lightbox-close');
    
    // Open lightbox on image click
    galleryImages.forEach(img => {
      img.addEventListener('click', function() {
        lightbox.style.display = 'flex';
        lightboxImage.src = this.src;
        lightboxCaption.textContent = this.alt;
      });
    });
    
    // Close lightbox
    lightboxClose.addEventListener('click', function() {
      lightbox.style.display = 'none';
    });
    
    lightbox.addEventListener('click', function(e) {
      if (e.target === lightbox) {
        lightbox.style.display = 'none';
      }
    });
  }
});

// Newsletter subscription
document.addEventListener('DOMContentLoaded', function() {
  const newsletterForm = document.getElementById('newsletter-form');
  
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const emailInput = this.querySelector('input[type="email"]');
      const email = emailInput.value.trim();
      
      if (email) {
        // Store subscription in localStorage (in a real app, this would be sent to a server)
        const subscribers = JSON.parse(localStorage.getItem('newsletter-subscribers') || '[]');
        subscribers.push({
          email: email,
          date: new Date().toISOString()
        });
        localStorage.setItem('newsletter-subscribers', JSON.stringify(subscribers));
        
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'alert alert-success mt-3';
        successMessage.textContent = 'Thank you for subscribing to our newsletter!';
        
        newsletterForm.appendChild(successMessage);
        emailInput.value = '';
        
        // Remove success message after 3 seconds
        setTimeout(() => {
          successMessage.remove();
        }, 3000);
      }
    });
  }
});