/* ── CURSOR ── */
const cur=document.getElementById('cur'),cur2=document.getElementById('cur2');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cur.style.left=mx+'px';cur.style.top=my+'px'});
(function loop(){rx+=(mx-rx)*.1;ry+=(my-ry)*.1;cur2.style.left=rx+'px';cur2.style.top=ry+'px';requestAnimationFrame(loop)})();

/* ── CANVAS RIVER FLOW ── */
const canvas=document.getElementById('heroCanvas');
const ctx=canvas.getContext('2d');
let W,H,lines=[];
function resize(){W=canvas.width=canvas.offsetWidth;H=canvas.height=canvas.offsetHeight;initLines()}
function initLines(){
  lines=[];
  for(let i=0;i<6;i++){
    lines.push({
      y:H*(0.1+i*0.16),
      phase:Math.random()*Math.PI*2,
      speed:.0008+Math.random()*.0005,
      amp:30+Math.random()*50,
      freq:.003+Math.random()*.002,
      alpha:.06+Math.random()*.1,
      color:i%2===0?'212,164,76':'45,125,168'
    });
  }
}
function drawLines(t){
  ctx.clearRect(0,0,W,H);
  lines.forEach(l=>{
    ctx.beginPath();
    ctx.strokeStyle=`rgba(${l.color},${l.alpha})`;
    ctx.lineWidth=1;
    for(let x=0;x<=W;x+=4){
      const y=l.y+Math.sin(x*l.freq+t*l.speed*1000+l.phase)*l.amp;
      x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    }
    ctx.stroke();
  });
}
let t0=null;
function animate(ts){
  if(!t0)t0=ts;
  drawLines((ts-t0)*.001);
  requestAnimationFrame(animate);
}
resize();
window.addEventListener('resize',resize);
requestAnimationFrame(animate);

/* ── PARTICLES ── */
const pf=document.getElementById('pfield');
for(let i=0;i<35;i++){
  const p=document.createElement('div');p.className='pt';
  const s=Math.random()*2+1;
  p.style.cssText=`width:${s}px;height:${s}px;left:${Math.random()*100}%;top:${Math.random()*100}%;--dx:${(Math.random()-.5)*260}px;--dy:${(Math.random()-.5)*260}px;animation-duration:${7+Math.random()*8}s;animation-delay:${Math.random()*-12}s`;
  pf.appendChild(p);
}

/* ── NAV SCROLL ── */
const nav=document.getElementById('nav');
window.addEventListener('scroll',()=>{
  nav.classList.toggle('scrolled',window.scrollY>60);
});

/* ── SCROLL REVEAL ── */
const ro=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('on')}),{threshold:.1});
document.querySelectorAll('.rv').forEach(el=>ro.observe(el));

/* ── COUNTERS ── */
const co=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting||e.target.dataset.done)return;
  e.target.dataset.done=1;
  const t=parseInt(e.target.dataset.c);
  if(e.target.dataset.zero){e.target.textContent='Zero';return}
  let c=0;const inc=t/45;
  const tm=setInterval(()=>{c=Math.min(c+inc,t);e.target.textContent=Math.round(c);if(c>=t)clearInterval(tm)},25);
}),{threshold:.5});
document.querySelectorAll('[data-c]').forEach(el=>co.observe(el));

/* ── TYPEWRITER TAGLINE ── */
const tags=['AI Handoff Intelligence','Zero Context Loss','Multi-Agent Orchestration','Built for the Transition'];
let ti=0,ci=0,deleting=false;
const tw=document.getElementById('tagline');
if(tw){
  tw.classList.add('typewrite');
  setInterval(()=>{
    const full=tags[ti];
    if(!deleting){
      tw.textContent=full.slice(0,++ci);
      if(ci===full.length){deleting=true;setTimeout(()=>{},1200)}
    } else {
      tw.textContent=full.slice(0,--ci);
      if(ci===0){deleting=false;ti=(ti+1)%tags.length}
    }
  },80);
}

/* ── MOUSE PARALLAX ORBS ── */
document.addEventListener('mousemove',e=>{
  const x=(e.clientX/window.innerWidth-.5)*20;
  const y=(e.clientY/window.innerHeight-.5)*20;
  document.querySelectorAll('.orb').forEach((o,i)=>{
    const f=(i+1)*0.4;
    o.style.transform=`translateY(-50%) translate(${x*f}px,${y*f}px)`;
  });
});