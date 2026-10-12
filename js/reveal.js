/* page 5: title, the two-families line and each family fade up as they scroll into view */
(function(){
  var els=[].slice.call(document.querySelectorAll('.rv'));
  if(!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('in')});return}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.18});
  els.forEach(function(e){io.observe(e)});
  // backup: check positions on scroll too, so nothing can stay hidden
  function chk(){var vh=innerHeight;els=els.filter(function(e){var r=e.getBoundingClientRect();if(r.top<vh*.9&&r.bottom>0){e.classList.add('in');return false}return true})}
  var lastC=0,cq=0;addEventListener('scroll',function(){if(cq)return;cq=requestAnimationFrame(function(t){cq=0;if(t-lastC<200)return;lastC=t;chk()})},{passive:true});addEventListener('load',chk);chk();
  window.revealAdd=function(e){if(io)io.observe(e);els.push(e)};
})();
