/* Opening: the wax-sealed patrika. A velvet maroon envelope with a lace flap, addressed to the guest (tall on portrait
   screens, square on wide ones). Tap: the seal cracks into two pieces, the flap opens, the card rises out, zooms to
   fill the screen, its paper turns into the sky and Hawa Mahal rises. The card is a copy of page 1, so when it fills
   the screen it is exactly the real page 1 underneath, which then takes over. */
(function(){
  window.__opReady=true;
  var root=document.documentElement,op=document.getElementById('op');
  function finish(){var nm=document.querySelector('.names');if(nm&&op)nm.style.animation='none'; // don't replay page 1's CSS fade
    root.classList.remove('op-on','op-lock');if(op&&op.parentNode)op.parentNode.removeChild(op);
    window.__opDone=true;try{document.dispatchEvent(new Event('opening:done'))}catch(e){}}
  if(!op){finish();return}
  var $=function(i){return document.getElementById(i)};
  // test aid: #op-skip goes straight to the site, #op-skip=pg6,-200 then scrolls to an element (and by an offset)
  var sk=/op-skip(?:=([\w-]+)(?:,(-?\d+))?)?/.exec(location.hash);
  if(sk){finish();if(sk[1])setTimeout(function(){var el=$(sk[1]);if(el){el.scrollIntoView();if(sk[2])scrollBy(0,+sk[2])}},700);return}
  var hero=$('stage');if(!hero||!op.animate){finish();return}
  if('scrollRestoration' in history)history.scrollRestoration='manual';
  scrollTo(0,0);

  var back=$('opBack'),pocket=$('opPocket'),flap=$('opFlap'),seal=$('opSeal'),hint=$('opHint'),tap=$('opTap'),card=$('opCard'),
      frame=$('opFrame'),black=$('opBlack'),welcome=$('opWelcome');
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var anims=[],G={},opened=false,seeking=false,clone=null,C={};

  /* ---------- envelope geometry (screen px) ---------- */
  function geo(){
    var W=innerWidth,H=innerHeight,tall=W<H;
    var cs,cw,ch,EW,EH,ex,ey,top0,clipB=0,down;
    if(tall){                                  // portrait screens: a card-shaped envelope most of the screen wide;
      var R=1.42;                              // the card shows the top of page 1 (where its text is)
      EH=Math.min(W*.86*R,H*.6);EW=EH/R;ex=(W-EW)/2;ey=(H-EH)/2+H*.02;
      cw=EW*.9;cs=cw/W;ch=EH*.92;clipB=Math.max(0,H-ch/cs);top0=ey+EH*.04;down=EH*.22;
    }else{                                     // wide screens: a square envelope; the card lies in the bottom of its pocket
      EW=EH=Math.min(H*.6,W*.56,600);cw=EW*.9;cs=cw/W;ch=H*cs;
      ex=(W-EW)/2;ey=(H-EH)/2+H*.08;top0=ey+EH*.95-ch;down=EH*.2;   // a little low, leaving the sky above for "Welcome to Jaipur"
    }
    var fd=Math.min(EH*.56,EW*.62),vd=fd*.68;               // top flap depth; how deep the pocket opens (the flap covers it)
    var sd=Math.max(48,Math.min(96,EW*.24)),topMin=Math.max(14,H*.025);
    G={W:W,H:H,cs:cs,EH:EH,clipB:clipB,down:down,c0:[ex+EW/2-W/2,top0],
       rise:Math.max(0,Math.min(tall?ch*.7:ch*.82,top0+down-topMin)),m:Math.min(22,Math.max(10,.026*Math.min(W,H)))};
    place(back,ex,ey,EW,EH);place(pocket,ex,ey,EW,EH);place(flap,ex,ey,EW,fd);
    // folded flaps: the side flaps meet the bottom flap's top edge at (xp, vd)
    var xp=EW*.36,P=function(x,y){return (x/EW*100).toFixed(2)+'% '+(y/EH*100).toFixed(2)+'%'};
    $('opPkL').style.clipPath='polygon('+P(0,0)+','+P(xp,vd)+','+P(0,EH)+')';
    $('opPkR').style.clipPath='polygon('+P(EW,0)+','+P(EW-xp,vd)+','+P(EW,EH)+')';
    $('opPkB').style.clipPath='polygon('+P(0,EH)+','+P(xp,vd)+','+P(EW-xp,vd)+','+P(EW,EH)+')';
    var ps=$('opPsvg'),hi='rgba(255,190,190,.2)';ps.setAttribute('viewBox','0 0 '+EW+' '+EH);
    ps.innerHTML='<path d="M1 1L'+xp+' '+vd+'M'+(EW-1)+' 1L'+(EW-xp)+' '+vd+'" fill="none" stroke="'+hi+'" stroke-width="1.2"/>'+
      '<path d="M1 '+(EH-1)+'L'+xp+' '+vd+'H'+(EW-xp)+'L'+(EW-1)+' '+(EH-1)+'" fill="none" stroke="'+hi+'" stroke-width="1.2"/>';
    var fs=$('opFsvg');fs.setAttribute('viewBox','0 0 '+EW+' '+fd);fs.innerHTML=lace(EW,fd);
    var to=$('opTo'),below=fd+sd*.5;to.style.top=(below+(EH-below)*(EH>EW?.18:.08))+'px';to.style.padding='0 '+EW*.08+'px';
    seal.style.setProperty('--sd',sd+'px');place(seal,ex+EW/2-sd/2,ey+fd-sd*.62,sd,sd);
    place(hint,0,ey+EH+Math.max(18,H*.035),W,20);
    place(tap,ex+EW/2-sd*.8,ey+fd-sd*.95,sd*1.6,sd*1.6);
    // the card is the whole screen, scaled from its top centre; on portrait screens only its top part shows until it zooms
    card.style.width=W+'px';card.style.height=H+'px';op.classList.add('op-placed');
    // "Welcome to Jaipur" fills the sky above the envelope
    if(welcome){var band=Math.max(60,ey-10);welcome.style.height=band+'px';welcome.style.setProperty('--ws',Math.min(band/1.7,W*.15,110).toFixed(1)+'px')}
  }
  // the lace edge of the top flap: scallops along both slanted edges, each with an eyelet, a row of tiny holes, a stitch line
  function lace(EW,fd){
    var lw=Math.max(9,Math.min(18,EW*.04)),band='',holes='',stitch='',f=function(v){return v.toFixed(1)};
    [[0,0],[EW,0]].forEach(function(A){
      var B=[EW/2,fd],dx=B[0]-A[0],dy=B[1]-A[1],L=Math.hypot(dx,dy),d=[dx/L,dy/L];
      var n=A[0]===0?[-d[1],d[0]]:[d[1],-d[0]];                 // outward from the flap
      var cnt=Math.max(6,Math.round(L/(lw*1.35))),st=L/cnt,k=lw*1.25;
      var pt=function(t,o){return [A[0]+d[0]*t+n[0]*o,A[1]+d[1]*t+n[1]*o]};
      var p0=pt(0,0),path='M'+f(p0[0])+' '+f(p0[1]);
      for(var i=0;i<cnt;i++){var a=pt(i*st,k),b=pt((i+1)*st,k),e=pt((i+1)*st,0);
        path+='C'+f(a[0])+' '+f(a[1])+' '+f(b[0])+' '+f(b[1])+' '+f(e[0])+' '+f(e[1]);
        var c=pt((i+.5)*st,lw*.5);holes+='<circle cx="'+f(c[0])+'" cy="'+f(c[1])+'" r="'+f(lw*.17)+'"/>';
        for(var j=1;j<4;j++){var h=pt((i+j/4)*st,lw*.06);holes+='<circle cx="'+f(h[0])+'" cy="'+f(h[1])+'" r="'+f(lw*.07)+'"/>'}}
      var q=pt(L,-lw*.5),r=pt(0,-lw*.5);path+='L'+f(q[0])+' '+f(q[1])+'L'+f(r[0])+' '+f(r[1])+'Z';band+=path;
      var s1=pt(lw*.4,-lw*1.1),s2=pt(L-lw*1.2,-lw*1.1);stitch+='M'+f(s1[0])+' '+f(s1[1])+'L'+f(s2[0])+' '+f(s2[1]);
    });
    return '<defs><mask id="opLace" maskUnits="userSpaceOnUse" x="-60" y="-60" width="'+(EW+120)+'" height="'+(fd+120)+'">'+
      '<path d="'+band+'" fill="#fff"/><g fill="#000">'+holes+'</g></mask></defs>'+
      '<path d="'+band+'" fill="#a23a4a" mask="url(#opLace)"/>'+
      '<path d="'+band+'" fill="none" stroke="rgba(255,205,205,.45)" stroke-width=".9" mask="url(#opLace)"/>'+
      '<path d="'+stitch+'" fill="none" stroke="rgba(255,205,205,.35)" stroke-width="1" stroke-dasharray="3 3"/>';
  }
  function place(el,x,y,w,h){el.style.left=x+'px';el.style.top=y+'px';el.style.width=w+'px';el.style.height=h+'px'}
  function ct(x,y,s){return 'translate('+x.toFixed(1)+'px,'+y.toFixed(1)+'px) scale('+s.toFixed(4)+')'}
  function clipAt(b,r){return 'inset(0px 0px '+b.toFixed(1)+'px 0px round '+r.toFixed(1)+'px)'}
  function A(el,kf,o){var a=el.animate(kf,Object.assign({fill:'forwards'},o));anims.push(a);return a}

  /* ---------- the card: a copy of page 1 with cream paper over its sky and the text in ink ---------- */
  var INK={ganesh:'#a9761f',h1:'#7a1530',weds:'#b8802a',married:'#6b1f2a',guest:'#8a5a2a',name:'#7a1530'},SH_INK='0 1px 0 rgba(255,255,255,.7)';
  function parts(n){return{ganesh:n.querySelector('.ganesh'),h1:n.querySelector('h1'),weds:n.querySelector('.weds'),
    married:n.querySelector('h1+p'),guest:n.querySelector('.hero-guest'),name:n.querySelector('.hero-guest .guest-name')}}
  function makeCard(){
    if(clone)return;
    clone=hero.cloneNode(true);clone.removeAttribute('id');
    [].forEach.call(clone.querySelectorAll('[id]'),function(e){e.removeAttribute('id')});
    clone.classList.add('op-clone');clone.style.width=hero.offsetWidth+'px';clone.style.height=hero.offsetHeight+'px';
    var paper=document.createElement('i');paper.className='op-paper';
    var sky=clone.querySelector('.sky');if(sky&&sky.nextSibling)clone.insertBefore(paper,sky.nextSibling);else clone.appendChild(paper);
    card.insertBefore(clone,frame);
    var real=parts(hero.querySelector('.names')),cp=parts(clone.querySelector('.names')),k;
    C={paper:paper,hawa:clone.querySelector('.hawa'),parts:cp,to:{}};
    for(k in cp)if(cp[k]&&real[k]){var cs=getComputedStyle(real[k]);C.to[k]={color:cs.color,textShadow:cs.textShadow};
      cp[k].style.color=INK[k];cp[k].style.textShadow=SH_INK}
    if(C.hawa)C.hawa.style.translate='0 '+(G.H+40)+'px';
    // phones: the ink-to-sky colour change is a fade between the ink copy of the text and a second copy already in
    // page 1's colours (fading is nearly free for a phone; changing the colour and glow of large text every frame is not)
    if(phone()){var nm=clone.querySelector('.names'),sk=hero.querySelector('.names').cloneNode(true);
      sk.style.opacity='0';sk.style.animation='none';sk.setAttribute('aria-hidden','true');nm.parentNode.insertBefore(sk,nm.nextSibling);C.ink=nm;C.sky=sk}
  }
  function phone(){return !!(window.MOBILE&&MOBILE.on())}

  // resting (closed) state
  function rest(){
    anims.forEach(function(a){a.cancel()});anims=[];
    card.style.transform=ct(G.c0[0],G.c0[1],G.cs);card.style.clipPath=clipAt(G.clipB,8/G.cs);
    frame.style.inset=G.m+'px';frame.style.bottom=(G.clipB+G.m)+'px';
    card.style.zIndex=2;back.style.zIndex=1;pocket.style.zIndex=3;flap.style.zIndex=5;seal.style.zIndex=6;hint.style.zIndex=6;
    flap.style.transform='perspective(900px) rotateX(0deg)';
  }

  /* ---------- the opening, in ms from the tap ---------- */
  function open(){
    if(opened)return;opened=true;tap.style.display='none';if(welcome)welcome.classList.add('out');
    if(reduce){op.style.transition='opacity .7s';op.style.opacity='0';setTimeout(finish,750);return}
    makeCard();
    var s=G,out='cubic-bezier(.5,0,.75,.4)';
    // 1. the seal: a crack shows, then it breaks into a big piece and a small one that fall away
    hint.style.animation='none';A(hint,[{opacity:1},{opacity:0}],{duration:300});
    A($('opCrack'),[{opacity:0},{opacity:1,offset:.25},{opacity:1,offset:.6},{opacity:0}],{duration:420});
    A($('opSealL'),[{transform:'none',opacity:1},{transform:'translate(-18%,55%) rotate(-16deg)',opacity:0}],{delay:200,duration:700,easing:out});
    A($('opSealR'),[{transform:'none',opacity:1},{transform:'translate(60%,75%) rotate(38deg)',opacity:0}],{delay:200,duration:620,easing:out});
    A(seal,[{transform:'scale(1)'},{transform:'scale(.95)',offset:.3},{transform:'scale(1)'}],{duration:260});
    // 2. the flap opens; past halfway it shows its lining and goes behind the card
    A(flap,[{transform:'perspective(900px) rotateX(0deg)',zIndex:5},{transform:'perspective(900px) rotateX(90deg)',zIndex:5,offset:.5},
             {transform:'perspective(900px) rotateX(90deg)',zIndex:1,offset:.501},{transform:'perspective(900px) rotateX(180deg)',zIndex:1}],
      {delay:520,duration:900,easing:'cubic-bezier(.4,0,.3,1)'});
    A($('opFlapBack'),[{opacity:0},{opacity:0,offset:.5},{opacity:1,offset:.501},{opacity:1}],{delay:520,duration:900});
    // 3. the card rises out while the envelope settles a little lower, then drops away
    var c1=[s.c0[0],s.c0[1]+s.down-s.rise];
    A(card,[{transform:ct(s.c0[0],s.c0[1],s.cs)},{transform:ct(c1[0],c1[1],s.cs)}],{delay:1250,duration:1050,easing:'cubic-bezier(.3,0,.2,1)'});
    [back,pocket,flap].forEach(function(el){
      A(el,[{translate:'0 0',opacity:1},{translate:'0 '+s.down+'px',opacity:1,offset:.4},{translate:'0 '+s.down+'px',opacity:1,offset:.58},{translate:'0 '+(s.H*.9)+'px',opacity:0}],
        {delay:1250,duration:2500,easing:'cubic-bezier(.45,0,.55,1)'});
    });
    // 4. the card zooms to fill the screen; its text lands exactly where page 1's text sits
    var zoom={delay:2700,duration:1400,easing:'cubic-bezier(.6,0,.2,1)'};
    A(card,[{transform:ct(c1[0],c1[1],s.cs),clipPath:clipAt(s.clipB,8/s.cs)},{transform:ct(0,0,1),clipPath:clipAt(0,0)}],zoom);
    A(frame,[{bottom:(s.clipB+s.m)+'px'},{bottom:s.m+'px'}],zoom);
    // 5. the paper turns into the sky and the text into page 1's colours
    var T5=4150;
    A(frame,[{opacity:1},{opacity:0}],{delay:T5,duration:500});
    A(C.paper,[{opacity:1},{opacity:0}],{delay:T5,duration:1000,easing:'ease'});
    if(C.sky){A(C.sky,[{opacity:0},{opacity:1}],{delay:T5,duration:900,easing:'ease'});A(C.ink,[{opacity:1},{opacity:0}],{delay:T5+900,duration:1})}   // the sky copy fades in over the ink copy, which then goes
    else for(var k in C.to)A(C.parts[k],[{color:INK[k],textShadow:SH_INK},{color:C.to[k].color,textShadow:C.to[k].textShadow}],{delay:T5,duration:900,easing:'ease'});
    // 6. Hawa Mahal rises into its place, then the real page 1 (identical, underneath) takes over
    if(C.hawa)A(C.hawa,[{translate:'0 '+(s.H+40)+'px'},{translate:'0 0'}],{delay:T5+700,duration:1300,easing:'cubic-bezier(.2,.7,.2,1)'});
    A(op,[{opacity:1},{opacity:0}],{delay:T5+2150,duration:350}).onfinish=function(){if(!seeking)finish()};
  }

  tap.addEventListener('click',function(e){e.stopPropagation();open()});
  op.addEventListener('click',open);
  op.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}});
  function refit(){if(!opened){geo();rest()}}
  addEventListener('resize',refit);
  addEventListener('orientationchange',function(){setTimeout(refit,150)});
  geo();rest();

  // fade in from black once the fonts are ready (or after 1.8 s at the latest); if the guest hasn't tapped 5 s after the
  // envelope appears, it opens by itself
  var shown=false;
  function show(){if(shown)return;shown=true;geo();rest();black.style.opacity='0';setTimeout(function(){try{tap.focus({preventScroll:true})}catch(e){}},700);
    setTimeout(function(){if(!opened&&!seeking)open()},5000)}
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(show);setTimeout(show,1800);

  // test aid: #op-seek=2.5 freezes the opening 2.5 s after the tap
  var hs=/op-seek=([\d.]+)/.exec(location.hash);
  if(hs)setTimeout(function(){show();seeking=true;black.style.transition='none';open();
    anims.forEach(function(a){a.pause();a.currentTime=+hs[1]*1000})},500);
})();
