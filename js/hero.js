(function(){
  var $=function(i){return document.getElementById(i)};
  var cue=$('heroCue'),track=$('track'),sky=$('sky'),hawa=$('hawa'),tl=$('tl'),tr=$('tr'),names=document.querySelector('.names');
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cur=0,target=0,last=0,running=false,T=1,vh=innerHeight,nk=0.6,nmax=innerHeight,drawn=-1,native=false,fly=null,front=null;
  function cl(x){return Math.min(1,Math.max(0,x))}
  function es(t){return t*t*(3-2*t)}
  function setVars(){
    var st=document.getElementById('stage'),W=st.clientWidth||innerWidth,H=innerHeight,ph=window.MOBILE&&MOBILE.on();
    if(!lvh){lvh=document.createElement('div');lvh.style.cssText='position:fixed;left:0;top:0;width:0;height:100vh;height:100lvh;visibility:hidden;pointer-events:none';document.body.appendChild(lvh)}
    if(ph){if(!fixH||fixW!==W){fixH=Math.max(H,lvh.offsetHeight);fixW=W}H=fixH}   // phones: the tallest screen, worked out once per width
    st.style.setProperty('--hw',(window.MOBILE&&MOBILE.on()?MOBILE.hawaW(W,H):Math.max(W*1.02,1.3*H))+'px');
    if(hawa.naturalWidth)st.style.setProperty('--har',(hawa.naturalHeight/hawa.naturalWidth*(window.MOBILE&&MOBILE.on()?1:1.18)).toFixed(4));   // phones: true shape, no stretch
    st.style.setProperty('--th',Math.min(.74*H,1.18*W)+'px');
    // phones: the screen gets taller when the address bar hides; size the hero to the tallest screen so nothing shows under it
    st.style.height=(ph?H:Math.max(H,lvh.offsetHeight))+'px';
  }
  var lw=0,lh=0,rq=0,lvh=null,fixH=0,fixW=0;
  function doRefit(){rq=0;setVars();layout();readTarget();cur=target;render(cur)}
  function refit(){if(rq)return;rq=requestAnimationFrame(doRefit)}
  function onSize(){var ph=window.MOBILE&&MOBILE.on();if(innerWidth!==lw||(!ph&&innerHeight!==lh)){lw=innerWidth;lh=innerHeight;refit()}}
  function layout(){
    vh=document.getElementById('stage').offsetHeight||innerHeight;   // the stage is as tall as the tallest phone screen
    var H=hawa.offsetHeight||vh*1.5;
    T=Math.max(1,H-0.4*vh-3);                          // distance the building travels = scroll distance (1:1)
    track.style.height=(vh+T)+'px';
    // the text must end up wholly behind the solid wall, below the domes and their gaps (~16% of the building's
    // height), when the building stops; on short travels (phones) it moves faster than 0.6 to get there in time
    var end=(vh*0.6-T)+0.16*H-names.offsetTop;
    nk=Math.max(0.6,end/T);nmax=Math.max(vh,end);
    if(native){hawa.style.transform='translate3d(0,'+(vh*0.6).toFixed(2)+'px,0)';if(cue)cue.style.transform='translate3d(-50%,'+(vh*0.6).toFixed(2)+'px,0)';front.style.height=front.style.marginTop='';front.style.height=vh+'px';front.style.marginTop=(-vh)+'px'}
    drawn=-1;
  }
  function readTarget(){
    var s=scrollY-track.offsetTop;
    target=reduce?T:Math.min(T,Math.max(0,s));      // clamp: building stops (is fixed) once fully scrolled
  }
  function render(s){
    if(s===drawn)return;drawn=s;                      // nothing changed since the last frame: no style writes at all
    // Hawa Mahal scrolls exactly with the page, then holds at the bottom (phones: it simply scrolls with the page)
    if(!native)hawa.style.transform='translate3d(0,'+(vh*0.6-s).toFixed(2)+'px,0)';
    // trees: slide in from the left and right at the bottom of Hawa Mahal, complete at the end
    var e=es(cl((s-0.4*T)/(0.55*T)));
    tl.style.transform='translate3d('+(-(1-e)*105).toFixed(2)+'%,0,0)';
    tr.style.transform='translate3d('+((1-e)*105).toFixed(2)+'%,0,0)';
    sky.style.transform='translate3d(0,'+(-(s/T)*12).toFixed(2)+'%,0)';
    // text slides down with the scroll and disappears fully behind the building (no blur / fade)
    names.style.transform='translate3d(0,'+Math.min(s*nk,nmax).toFixed(2)+'px,0)';
    // the scroll cue sits just above the building's top and rides up with it, fading out over the first steps
    if(cue){if(!native)cue.style.transform='translate3d(-50%,'+(vh*0.6-s).toFixed(2)+'px,0)';cue.style.opacity=Math.max(0,1-s/140).toFixed(3)}
  }
  function loop(now){
    var dt=Math.min(0.05,(now-last)/1000||0.016);last=now;
    if(native)cur=target;                              // phones: no easing, the layers follow the finger in the same frame
    else cur+=(target-cur)*(1-Math.exp(-dt*14));
    if(Math.abs(target-cur)<0.3)cur=target;
    render(cur);
    if(cur!==target)requestAnimationFrame(loop);else running=false;
  }
  function kick(){if(window.PERF&&!PERF.near('track')&&drawn===T&&!running)return;readTarget();if(target===drawn&&!running)return;if(!running){running=true;last=performance.now();requestAnimationFrame(loop)}}
  addEventListener('scroll',kick,{passive:true});
  addEventListener('resize',onSize);addEventListener('orientationchange',function(){setTimeout(onSize,120)});
  hawa.addEventListener('load',function(){lw=0;onSize()});
  lw=innerWidth;lh=innerHeight;
  setVars();layout();readTarget();cur=target;render(cur);

  /* phones: the "hovering" fix. A layer moved by script trails a frame behind a phone's own scrolling, so the building
     seemed to float while the page moved. Once the opening has handed over (its card is a copy of this page), Hawa
     Mahal and the scroll cue move out of the pinned stage into the page itself, so they scroll natively with the
     finger; the trees move to a second pinned layer in front of them, so the layering stays exactly the same. */
  function goNative(){
    if(native||!(window.MOBILE&&MOBILE.on())||reduce)return;
    var stage=document.getElementById('stage');
    fly=document.createElement('div');fly.className='hero-fly';fly.setAttribute('aria-hidden','false');
    front=document.createElement('div');front.className='hero-front';front.setAttribute('aria-hidden','true');
    if(cue)fly.appendChild(cue);fly.appendChild(hawa);front.appendChild(tl);front.appendChild(tr);
    ['--hw','--har','--th'].forEach(function(k){var v=stage.style.getPropertyValue(k);if(v){fly.style.setProperty(k,v);front.style.setProperty(k,v)}});
    stage.parentNode.insertBefore(fly,stage.nextSibling);fly.parentNode.insertBefore(front,fly.nextSibling);
    track.classList.add('native');native=true;
    var keep=setVars;setVars=function(){keep();var st=document.getElementById('stage');['--hw','--har','--th'].forEach(function(k){var v=st.style.getPropertyValue(k);fly.style.setProperty(k,v);front.style.setProperty(k,v)})};
    layout();readTarget();cur=target;drawn=-1;render(cur);
  }
  // rotating a phone past the phone width (or back): put the layers back in the stage, or out again
  function goBack(){
    if(!native)return;var stage=document.getElementById('stage');
    if(cue)stage.insertBefore(cue,names.nextSibling);stage.insertBefore(hawa,cue?cue.nextSibling:names.nextSibling);stage.appendChild(tl);stage.appendChild(tr);
    fly.remove();front.remove();track.classList.remove('native');native=false;setVars=baseSetVars;doRefit();
  }
  var baseSetVars=setVars,opDone=false;
  function onOpen(){opDone=true;goNative()}
  if(window.__opDone)onOpen();else document.addEventListener('opening:done',onOpen,{once:true});
  var mq=matchMedia('(max-width: 767px)');(mq.addEventListener?mq.addEventListener.bind(mq,'change'):mq.addListener.bind(mq))(function(){
    setTimeout(function(){if(mq.matches){if(opDone)goNative()}else goBack()},60)});
})();
