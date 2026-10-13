/* page 4 scrolls normally. The couple starts with the groom's head at the top of the Patrika Gate; while the page
   scrolls up they move up more slowly than the gate, so they slide down it and are revealed head first (their feet stay
   below the screen edge, never floating). The moment their feet reach the platform they stay on it and scroll away. */
(function(){
  var $=function(i){return document.getElementById(i)};
  var sec=$('pg4'),st=$('p4stage');if(!sec)return;
  var gate=$('p4gate'),couple=$('p4couple'),plat=$('p4plat'),csh=$('p4csh'),ticking=false,M=null;
  // sizes of the scene, measured once and again only when the screen or a picture changes (not on every frame)
  function measure(){M={H:st.clientHeight,ch:couple.offsetHeight,gh:gate.offsetHeight,pb:parseFloat(getComputedStyle(gate).bottom)||0,plh:plat.offsetHeight,cs:csh.offsetHeight}}
  function cl(x){return Math.min(1,Math.max(0,x))}
  function es(t){return t*t*(3-2*t)}
  function render(){
    ticking=false;
    var vh=innerHeight,r0=sec.getBoundingClientRect(),top=r0.top;
    if(r0.top>vh*2.5||r0.bottom<-vh*1.5)return;           // far off screen: nothing to move
    if(sec.style.height)sec.style.height='';
    if(!M||!M.ch)measure();var H=M.H,ch=M.ch,gh=M.gh,pb=M.pb,plh=M.plh;
    var gTop=H-pb-gh;                                        // gate top, from the top of the scene
    var y1=plh*.25-ch*.014;                                  // landed: groom's soles on the platform floor (from the scene bottom)
    var start=vh-gTop;                                       // section top when the gate's top reaches the screen bottom
    var p=cl((start-top)/Math.max(1,start));                 // 0 -> 1 as the scene comes up until it fills the screen
    var headScreen0=vh,headScreen1=H-y1-ch;                  // couple's top edge on screen: at the gate top (screen bottom) -> landed
    var hs=headScreen0+(headScreen1-headScreen0)*p;          // moves up slower than the page
    // before page 4 arrives the couple waits at the top of the Patrika Gate and travels with the page (never shows
    // early at the bottom of other pages); then they slide down the gate; after touchdown they stay on the platform
    var y=p>=1?y1:(p<=0?H-gTop-ch:(top+H)-(hs+ch));
    couple.style.transform='translate3d(0,'+(-y).toFixed(1)+'px,0)';
    csh.style.opacity=es(cl((p-.9)/.1)).toFixed(3);
    csh.style.transform='translate3d(0,'+(-(y1+ch*.008)+M.cs*.5).toFixed(1)+'px,0)';
  }
  function kick(){if(window.PERF&&!PERF.near('pg4'))return;if(!ticking){ticking=true;requestAnimationFrame(render)}}
  addEventListener('scroll',kick,{passive:true});
  addEventListener('resize',function(){M=null;kick()});
  [gate,couple,plat].forEach(function(im){if(!im.complete)im.addEventListener('load',function(){M=null;kick()})});
  addEventListener('load',function(){M=null;render()});
  render();
})();
