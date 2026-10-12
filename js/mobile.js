/* Mobile layer: phones (up to 767px wide) get their own layout values; laptops and desktops keep the originals.
   The CSS half is css/mobile.css (loaded only on phones). Other scripts ask MOBILE.on() and use these values. */
window.MOBILE=(function(){
  var mq=matchMedia('(max-width: 767px)'),root=document.documentElement;
  function on(){return mq.matches}
  function mark(){root.classList.toggle('is-mobile',on())}
  mark();
  // phones: the address bar showing / hiding changes only the height and fires "resize" on every scroll direction
  // change; nothing needs re-measuring for that (sizes use the stable svh / lvh units), so those events stop here,
  // before any other page script sees them. Real width changes (rotation) still go through.
  var lastW=innerWidth,pass=false;
  addEventListener('resize',function(e){if(pass||!on()){lastW=innerWidth;return}if(innerWidth===lastW)e.stopImmediatePropagation();else lastW=innerWidth});
  // switching between phone and desktop sizes (rotating a tablet, resizing a window): re-run every layout
  (mq.addEventListener?mq.addEventListener.bind(mq,'change'):mq.addListener.bind(mq))(function(){mark();pass=true;dispatchEvent(new Event('resize'));pass=false});
  return {
    on:on,
    // first page: Hawa Mahal's width on a phone - about a third smaller than before, so more of the building shows
    hawaW:function(W,H){return Math.max(W*1.6,H*.94)}
  };
})();
