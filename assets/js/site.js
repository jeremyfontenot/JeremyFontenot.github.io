const navToggle=document.querySelector(".nav-toggle");
const navLinks=document.querySelector(".nav-links");
if(navToggle&&navLinks){
  const closeMenu=()=>{navLinks.classList.remove("open");navToggle.setAttribute("aria-expanded","false")};
  navToggle.addEventListener("click",()=>{const open=navLinks.classList.toggle("open");navToggle.setAttribute("aria-expanded",String(open))});
  navLinks.addEventListener("click",event=>{if(event.target instanceof HTMLAnchorElement)closeMenu()});
  document.addEventListener("click",event=>{if(!navLinks.contains(event.target)&&!navToggle.contains(event.target))closeMenu()});
  document.addEventListener("keydown",event=>{if(event.key==="Escape")closeMenu()});
}
const revealNodes=[...document.querySelectorAll(".reveal")];
const reduceMotion=matchMedia("(prefers-reduced-motion: reduce)").matches;
if(!("IntersectionObserver" in window)||reduceMotion){
  revealNodes.forEach(node=>node.classList.add("is-visible"));
}else{
  const observer=new IntersectionObserver((entries,obs)=>{
    for(const entry of entries){
      if(entry.isIntersecting){
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      }
    }
  },{threshold:.14,rootMargin:"0px 0px -8% 0px"});
  revealNodes.forEach(node=>observer.observe(node));
}
document.querySelectorAll('a[href^="http"]').forEach(link=>{
  if(!link.rel)link.rel="noopener noreferrer";
});
