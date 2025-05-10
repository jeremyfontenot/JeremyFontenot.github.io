// Initialize particles for each section with custom colors
function initParticles(canvasId) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = canvas.parentElement.offsetHeight;

  let particles = [];
  const particleCount = 100;

  // Custom particle colors
  function getRandomParticleColor() {
    const colors = ['#1ABC9C', '#3498DB', '#9B59B6', '#FF5733'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 3 + 1,
        dx: Math.random() * 2 - 1,
        dy: Math.random() * 2 - 1,
        color: getRandomParticleColor()
      });
    }
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(particle => {
      particle.x += particle.dx;
      particle.y += particle.dy;

      if (particle.x < 0 || particle.x > canvas.width) particle.dx *= -1;
      if (particle.y < 0 || particle.y > canvas.height) particle.dy *= -1;

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.fill();
    });
    requestAnimationFrame(animateParticles);
  }

  createParticles();
  animateParticles();
}

// Initialize particles on load
window.addEventListener("load", () => {
  initParticles("hero-particles");
  initParticles("about-me-particles");
  initParticles("recommended-particles");
  initParticles("experience-particles");
  initParticles("home-lab-particles");
  initParticles("tools-particles");
  initParticles("certifications-particles");
  initParticles("contact-particles");
  initParticles("footer-particles");
});

// Handle window resize for canvases
window.addEventListener('resize', () => {
  document.querySelectorAll('canvas').forEach(canvas => {
    canvas.width = window.innerWidth;
    canvas.height = canvas.parentElement.offsetHeight;
  });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Update About Me section animation on scroll
window.addEventListener('scroll', () => {
  const aboutMeOverlay = document.querySelector('#about-me .about-me-overlay');
  if (aboutMeOverlay) {
    const sectionPosition = aboutMeOverlay.getBoundingClientRect().top;
    const screenPosition = window.innerHeight / 1.3;
    if (sectionPosition < screenPosition) {
      aboutMeOverlay.classList.add('visible');
    }
  }
});

// Modal for images in cards
var modal = document.getElementById("imageModal");
var img = document.querySelector(".card .image-container img");
var modalImg = document.getElementById("modalImage");
var captionText = document.getElementById("caption");

if (img) {
  img.onclick = function(){
    modal.style.display = "block";
    modalImg.src = this.src;
    captionText.innerHTML = this.alt;
  }
}

var span = document.getElementsByClassName("close")[0];
if (span) {
  span.onclick = function() { 
    modal.style.display = "none";
  }
}

// Handle contact form submission
document.getElementById('contact-form').addEventListener('submit', function(event) {
  event.preventDefault();
  alert('Thank you for your message!');
});

// Typewriter effect for hero title
document.addEventListener("DOMContentLoaded", function () {
  const textElement = document.getElementById("hero-title");
  const text = "Welcome to My Digital Space";
  let index = 0;
  let isDeleting = false;
  let typingSpeed = 100;
  let deleteSpeed = 50;
  let pauseBetween = 1500;
  let loopPause = 1000;

  function typeEffect() {
    if (!isDeleting) {
      if (index < text.length) {
        textElement.textContent += text.charAt(index);
        index++;
        setTimeout(typeEffect, typingSpeed);
      } else {
        setTimeout(() => {
          isDeleting = true;
          typeEffect();
        }, pauseBetween);
      }
    } else {
      if (index > 0) {
        textElement.textContent = text.substring(0, index - 1);
        index--;
        setTimeout(typeEffect, deleteSpeed);
      } else {
        isDeleting = false;
        setTimeout(typeEffect, loopPause);
      }
    }
  }

  textElement.textContent = "";
  typeEffect();
});

// Hamburger menu toggle
document.addEventListener("DOMContentLoaded", function () {
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", function () {
      navLinks.classList.toggle("active");
      hamburger.classList.toggle("active");
    });

    document.querySelectorAll(".nav-links a").forEach(link => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("active");
        hamburger.classList.remove("active");
      });
    });
  }
});

// Advanced particles for Experience section using particles.js
document.addEventListener("DOMContentLoaded", () => {
  particlesJS("experience-particles", {
    particles: {
      number: {
        value: 50,
        density: {
          enable: true,
          value_area: 800,
        },
      },
      color: {
        value: ["#1ABC9C", "#3498DB", "#9B59B6", "#FF5733"], // Updated to match website colors
      },
      shape: {
        type: "circle",
      },
      opacity: {
        value: 0.5,
      },
      size: {
        value: 3,
        random: true,
      },
      line_linked: {
        enable: true,
        distance: 150,
        color: "#ffffff", // Keep white for linked lines
        opacity: 0.4,
        width: 1,
      },
      move: {
        enable: true,
        speed: 6,
      },
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: {
          enable: true,
          mode: "grab",
        },
        onclick: {
          enable: true,
          mode: "push",
        },
      },
      modes: {
        grab: {
          distance: 140,
          line_linked: {
            opacity: 1,
          },
        },
      },
    },
    retina_detect: true,
  });
});
