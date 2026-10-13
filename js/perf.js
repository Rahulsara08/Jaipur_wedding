/* Performance layer: keeps the whole invitation smooth on phones without changing how it looks.
   - every page goes to sleep while it is well off screen: its looping CSS animations pause (they are invisible there
     anyway) and the page scripts skip their per-scroll work for it (they ask PERF.near(id))
   - phones: big background pictures of pages further down load only shortly before they come into view
   - phones: a lighter tier ("lite") for slow phones - chosen up front from the device, or switched on when scrolling
     keeps dropping frames - with fewer falling petals, a slower cloud sky and no glowing / bobbing extras
   All the values that can be tweaked are in CFG below; the number of petals kept on phones (4 of 12, 2 in lite) is in
   css/mobile.css. Test aid: ?perf=full or ?perf=lite forces a tier. */
window.PERF=(function(){
  var CFG={
    sleepMargin:'100% 0px',       // a page sleeps when it is more than one screen away from the visible area
    lazyMargin:'150% 0px',        // phones: a page's pictures start loading 1.5 screens before it comes into view
    skyFps:20,skyFpsLite:10,      // phones: frames per second of the animated cloud skies (Patrika Gate, cloud band)
    skyScale:.4,skyScaleLite:.3,  // phones: resolution of those skies (share of the screen pixels)
    hearts:.35,                   // phones: share of the RSVP celebration hearts
    lowEndCores:4,lowEndMemory:4, // phones reporting at most this many CPU cores or GB memory start in the lite tier (only
                                  // phones that report their memory; iPhones always report 4 cores, so they rely on the
                                  // frame-rate check below)
    fpsFloor:40,fpsWindow:2000    // phones: switch to lite when scrolling stays under 40 fps for 2 s
  };
  var root=document.documentElement,phone=function(){return !!(window.MOBILE&&MOBILE.on())};
  var SECTIONS=['track','roadwrap','gtrack','wall','p4gap','pg4','pg5','pgc','pg6','pg7','pg8','pg9'];
  var near={};SECTIONS.forEach(function(id){near[id]=true});

  // ---- tier ----
  var force=(/[?&]perf=(full|lite)/.exec(location.search)||[])[1];
  function lite(on){root.classList.toggle('lite',!!on);try{document.dispatchEvent(new Event('perf:tier'))}catch(e){}}
  if(force)lite(force==='lite');
  else if(phone()&&navigator.deviceMemory&&(navigator.deviceMemory<=CFG.lowEndMemory||(navigator.hardwareConcurrency||8)<=CFG.lowEndCores))lite(true);

  function init(){
    // ---- sleeping pages ----
    if('IntersectionObserver' in window){
      var io=new IntersectionObserver(function(es){var woke=false;es.forEach(function(e){if(e.isIntersecting&&near[e.target.id]===false)woke=true;near[e.target.id]=e.isIntersecting;e.target.classList.toggle('zz',!e.isIntersecting)});
        if(woke)dispatchEvent(new Event('scroll'))},{rootMargin:CFG.sleepMargin});   // a page waking up: its script catches up
      SECTIONS.forEach(function(id){var el=document.getElementById(id);if(el)io.observe(el)});
    }
    // ---- phones: the paisley layer behind Family / Bride & Groom (body::before, css/mobile.css) loads when they come near
    if('IntersectionObserver' in window){var bg=document.getElementById('pg4')||document.getElementById('pg5');
      if(bg){var bo=new IntersectionObserver(function(es){if(es[0].isIntersecting){root.classList.add('bg-near');bo.disconnect()}},{rootMargin:CFG.lazyMargin});bo.observe(bg)}}
    else root.classList.add('bg-near');
    // ---- phones: pictures of pages further down wait until the page is close ----
    if(phone()&&'IntersectionObserver' in window){
      var lz=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.remove('lz');lz.unobserve(e.target)}})},{rootMargin:CFG.lazyMargin});
      [].forEach.call(document.querySelectorAll('.lz'),function(el){lz.observe(el)});
    }else [].forEach.call(document.querySelectorAll('.lz'),function(el){el.classList.remove('lz')});
    // ---- phones: watch the frame rate while the guest scrolls; drop to lite if it stays low ----
    if(phone()&&!force&&!root.classList.contains('lite')){
      var scrolling=0,frames=0,t0=0,slow=0,raf=0;
      function tick(t){raf=0;if(performance.now()-scrolling>200){t0=0;return}
        if(!t0){t0=t;frames=0}else frames++;
        if(t-t0>=CFG.fpsWindow){var fps=frames*1000/(t-t0);slow=fps<CFG.fpsFloor?slow+1:0;t0=t;frames=0;if(slow>=1){lite(true);removeEventListener('scroll',onScroll);return}}
        raf=requestAnimationFrame(tick)}
      function onScroll(){scrolling=performance.now();if(!raf)raf=requestAnimationFrame(tick)}
      addEventListener('scroll',onScroll,{passive:true});
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();

  return {cfg:CFG,phone:phone,
    near:function(id){return near[id]!==false},          // is this page on or near the screen?
    lite:function(){return root.classList.contains('lite')}};
})();
