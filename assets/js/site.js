const navToggle=document.querySelector(".nav-toggle");
const navLinks=document.querySelector(".nav-links");
if(navToggle&&navLinks){
  const closeMenu=()=>{navLinks.classList.remove("open");navToggle.setAttribute("aria-expanded","false")};
  navToggle.addEventListener("click",()=>{const open=navLinks.classList.toggle("open");navToggle.setAttribute("aria-expanded",String(open));if(open){const firstLink=navLinks.querySelector("a");if(firstLink)firstLink.focus()}});
  navLinks.addEventListener("click",event=>{if(event.target instanceof HTMLAnchorElement)closeMenu()});
  document.addEventListener("click",event=>{
    const target=event.target;
    if(target instanceof Node&&!navLinks.contains(target)&&!navToggle.contains(target))closeMenu();
  });
  window.addEventListener("resize",()=>{if(matchMedia("(min-width: 981px)").matches)closeMenu()});
  document.addEventListener("keydown",event=>{
    if(event.key==="Escape"){
      closeMenu();
      navToggle.focus();
    }
  });
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
const filterButtons=[...document.querySelectorAll("[data-filter]")];
const projectCards=[...document.querySelectorAll("[data-project]")];
if(filterButtons.length&&projectCards.length){
  filterButtons.forEach(button=>{
    button.addEventListener("click",()=>{
      const filter=button.dataset.filter||"all";
      filterButtons.forEach(item=>{
        const active=item===button;
        item.classList.toggle("is-active",active);
        item.setAttribute("aria-pressed",String(active));
      });
      projectCards.forEach(card=>{
        const tags=card.dataset.project||"";
        card.hidden=filter!=="all"&&!tags.includes(filter);
      });
    });
    button.setAttribute("aria-pressed",String(button.classList.contains("is-active")));
  });
}
