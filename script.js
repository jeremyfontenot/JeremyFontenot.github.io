/*==================== toggle icon navbar ====================*/
let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

menuIcon.onclick = () => {
   menuIcon.classList.toggle('bx-x');
   navbar.classList.toggle('active');
};

/*==================== scroll sections active link ====================*/
// Get all sections and navigation links
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('header nav a');

// Function to set the active link based on scroll position
function setActiveLink() {
   const scrollY = window.scrollY;

   sections.forEach(section => {
      const top = section.offsetTop - 150;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
         navLinks.forEach(link => {
            link.classList.remove('active');
         });
         document.querySelector(`header nav a[href="#${id}"]`).classList.add('active');
      }
   });
}

// Call setActiveLink on scroll
window.addEventListener('scroll', setActiveLink);

// Call setActiveLink on page load
document.addEventListener('DOMContentLoaded', setActiveLink);

/*==================== sticky navbar ====================*/
let header = document.querySelector('header');

window.addEventListener('scroll', () => {
   header.classList.toggle('sticky', window.scrollY > 100);
});

/*==================== remove toggle icon and navbar when click navbar link (scroll) ====================*/
navLinks.forEach(link => {
   link.addEventListener('click', () => {
      menuIcon.classList.remove('bx-x');
      navbar.classList.remove('active');
   });
});

/*==================== scroll reveal ====================*/
ScrollReveal({
   // reset: true,
   distance: '80px',
   duration: 2000,
   delay: 200
});

ScrollReveal().reveal('.home-content, .heading', {
   origin: 'top'
});
ScrollReveal().reveal('.home-img, .services-container, .portfolio-box, .contact form', {
   origin: 'bottom'
});
ScrollReveal().reveal('.home-content h1, .about-img', {
   origin: 'left'
});
ScrollReveal().reveal('.home-content p, .about-content', {
   origin: 'right'
});

/*==================== typed js ====================*/
const typed = new Typed('.multiple-text', {
   strings: ['IT Professional', 'Technology Enthusiast'],
   typeSpeed: 100,
   backSpeed: 100,
   backDelay: 1000,
   loop: true
});