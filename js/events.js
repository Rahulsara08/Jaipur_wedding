(function(){
  var root=document.getElementById('events');if(!root)return;
  var track=document.getElementById('evTrack'),slides=[].slice.call(track.querySelectorAll('.ev-slide'));
  // the events change by themselves every 5 s while the section is on screen, until the guest touches anything in it
  // (an arrow, a dot, a swipe, a key, a click): from then on only the guest changes the event
  var n=slides.length,GAP=5000,cur=0,timer=0,stopped=false,visible=false,drag=null;
  // dots under the card
  var dots=document.createElement('div');dots.className='ev-dots';dots.setAttribute('role','tablist');
  slides.forEach(function(s,i){var b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Show '+(s.getAttribute('aria-label')||('event '+(i+1))));
    b.addEventListener('click',function(){show(i);seen();stop()});dots.appendChild(b)});
  track.parentNode.insertBefore(dots,track.nextSibling);
  // arrows on the frame's two sides and a "1 / 5" counter beside the dots, so guests know there are more events to see;
  // the next arrow nudges until the guest first changes the event themselves
  var CHEV='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function arrow(cls,label,step){var b=document.createElement('button');b.type='button';b.className='ev-arr '+cls;b.setAttribute('aria-label',label);b.innerHTML=CHEV;
    b.addEventListener('pointerdown',function(e){e.stopPropagation()});
    b.addEventListener('click',function(){show(cur+step);seen();stop()});track.appendChild(b);return b}
  arrow('prev','Previous event',-1);arrow('next','Next event',1);
  var count=document.createElement('span');count.className='ev-count';count.setAttribute('aria-live','polite');dots.appendChild(count);
  function seen(){root.classList.add('ev-seen')}
  function show(i){
    cur=(i+n)%n;
    slides.forEach(function(s,k){var on=k===cur;s.classList.toggle('is-on',on);s.setAttribute('aria-hidden',on?'false':'true')});
    [].forEach.call(dots.children,function(b,k){b.setAttribute('aria-current',k===cur?'true':'false')});
    track.setAttribute('data-on',slides[cur].getAttribute('data-theme')||'');
    count.textContent=(cur+1)+' / '+n;
  }
  // each event stays 5 s from the moment it is shown (the countdown starts afresh whenever the section comes into view)
  function arm(){clearTimeout(timer);if(stopped||!visible)return;timer=setTimeout(function(){if(stopped||!visible)return;if(document.hidden){arm();return}show(cur+1);arm()},GAP)}
  function stop(){stopped=true;clearTimeout(timer)}
  root.addEventListener('pointerdown',stop);
  root.addEventListener('keydown',stop);
  track.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){e.preventDefault();show(cur+1);seen()}else if(e.key==='ArrowLeft'){e.preventDefault();show(cur-1);seen()}});
  /* swipe (touch) or drag (mouse): the card does not move, it just fades to the next / previous one */
  track.addEventListener('pointerdown',function(e){if(e.pointerType==='mouse'&&e.button!==0)return;if(e.target.closest('a'))return;drag={x:e.clientX,y:e.clientY};if(e.pointerType==='mouse')track.classList.add('drag')});
  function endDrag(e){if(!drag)return;var dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag=null;track.classList.remove('drag');
    if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)){show(cur+(dx<0?1:-1));seen()}}
  track.addEventListener('pointerup',endDrag);track.addEventListener('pointercancel',function(){drag=null;track.classList.remove('drag')});
  track.addEventListener('wheel',function(e){if(Math.abs(e.deltaX)>Math.abs(e.deltaY)&&Math.abs(e.deltaX)>20){e.preventDefault();stop();if(!track._wl){track._wl=1;show(cur+(e.deltaX>0?1:-1));setTimeout(function(){track._wl=0},600)}}},{passive:false});
  if('IntersectionObserver' in window)new IntersectionObserver(function(es){var v=es[0].isIntersecting;if(v!==visible){visible=v;arm()}},{threshold:.35}).observe(root);
  else visible=true;
  show(0);arm();
})();
