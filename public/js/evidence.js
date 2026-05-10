document.addEventListener('DOMContentLoaded', function(){
  document.querySelectorAll('.evidence-item').forEach(function(item){
    item.addEventListener('click', function(e){
      // toggle open unless clicking a link inside
      if(e.target.tagName.toLowerCase() === 'a') return;
      item.classList.toggle('open');
    });
  });

  // keyboard accessibility: toggle on Enter/Space
  document.querySelectorAll('.evidence-item').forEach(function(item){
    item.setAttribute('tabindex', '0');
    item.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.classList.toggle('open');
      }
    });
  });

});
