let series = [];
function seeded(seed) { let x = seed % 2147483647; return () => (x = x * 16807 % 2147483647) / 2147483647; }
function createSeries() {
  const mode = document.getElementById('chartPattern').value;
  const random = seeded(mode === 'bull' ? 19 : mode === 'shock' ? 41 : 73);
  let price = 100;
  series = Array.from({ length: 42 }, (_, i) => {
    const drift = mode === 'bull' ? .65 : mode === 'shock' ? (i === 24 ? -12 : .12) : 0;
    const open = price;
    const close = Math.max(60, open + drift + (random() - .5) * 4);
    const high = Math.max(open, close) + random() * 3;
    const low = Math.min(open, close) - random() * 3;
    price = close; return { open, close, high, low };
  });
  drawMarket(false);
}
function drawMarket(analyzed) {
  const canvas = document.getElementById('marketCanvas');
  const { ctx, width, height } = fitCanvas(canvas, 390);
  const pad = {l:45,r:18,t:28,b:42};
  const min = Math.min(...series.map(x=>x.low))-2, max = Math.max(...series.map(x=>x.high))+2;
  const y = v => pad.t + (max-v)/(max-min)*(height-pad.t-pad.b);
  ctx.fillStyle='#fff';ctx.fillRect(0,0,width,height);ctx.strokeStyle='#e1e7f0';
  for(let i=0;i<6;i++){const yy=pad.t+i*(height-pad.t-pad.b)/5;ctx.beginPath();ctx.moveTo(pad.l,yy);ctx.lineTo(width-pad.r,yy);ctx.stroke();}
  const slot=(width-pad.l-pad.r)/series.length;
  series.forEach((d,i)=>{const x=pad.l+i*slot+slot/2;ctx.strokeStyle=d.close>=d.open?'#18794e':'#e63946';ctx.beginPath();ctx.moveTo(x,y(d.high));ctx.lineTo(x,y(d.low));ctx.stroke();ctx.fillStyle=ctx.strokeStyle;ctx.fillRect(x-slot*.28,Math.min(y(d.open),y(d.close)),slot*.56,Math.max(2,Math.abs(y(d.open)-y(d.close))));});
  if(document.getElementById('watermark').checked){ctx.save();ctx.globalAlpha=.12;ctx.fillStyle='#10264a';ctx.font='700 54px Segoe UI';ctx.translate(width/2,height/2);ctx.rotate(-.35);ctx.textAlign='center';ctx.fillText('MARKET DATA',0,0);ctx.restore();}
  const noise=Number(document.getElementById('noise').value);if(noise){ctx.save();ctx.globalAlpha=noise/1100;for(let i=0;i<noise*9;i++){ctx.fillStyle=i%2?'#000':'#2764b7';ctx.fillRect(Math.random()*width,Math.random()*height,1,1);}ctx.restore();}
  if(analyzed){ctx.save();ctx.strokeStyle='#2764b7';ctx.lineWidth=3;ctx.setLineDash([8,5]);ctx.strokeRect(pad.l-5,pad.t-5,width-pad.l-pad.r+10,height-pad.t-pad.b+10);ctx.setLineDash([]);ctx.fillStyle='#2764b7';ctx.font='700 14px Segoe UI';ctx.fillText('plot area',pad.l,pad.t-10);ctx.restore();}
}
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function analyzeVision(){
  const button=document.getElementById('runVision'),shell=document.getElementById('cvShell'),status=document.getElementById('visionStatus'),log=document.getElementById('visionLog'),mode=document.getElementById('visionModel').value;
  button.disabled=true;shell.className='canvas-shell cv-animated scanning';status.textContent='сканирование изображения';log.innerHTML='<span class="active">1. Нормализация и patches</span><span>2. Локализация</span><span>3. Маска и embedding</span>';
  await pause(900);shell.className='canvas-shell cv-animated detecting';status.textContent=mode==='clip'?'CLIP сравнивает текстовые классы':'YOLO локализует plot area';log.innerHTML='<span>1. Нормализация завершена</span><span class="active">2. Найдена область графика</span><span>3. Ожидается выход</span>';
  await pause(900);shell.className=`canvas-shell cv-animated ${mode==='yolo'||mode==='clip'?'detected':'segmenting'}`;status.textContent=mode==='dino'?'DINOv2 формирует embedding':mode==='clip'?'zero-shot: candlestick':mode==='yolo'?'box: plot area':'SAM 2 уточняет маску';drawMarket(true);
  await pause(850);const first=series.slice(0,6).reduce((a,x)=>a+x.close,0)/6,last=series.slice(-6).reduce((a,x)=>a+x.close,0)/6,delta=(last-first)/first,trend=delta>.04?'uptrend':delta<-.04?'downtrend':'sideways',noise=Number(document.getElementById('noise').value),confidence=Math.max(.61,.96-noise*.0025-(document.getElementById('watermark').checked?.04:0));
  document.getElementById('trendOut').textContent=trend;document.getElementById('diceOut').textContent=mode==='yolo'||mode==='clip'?'—':(.91-noise*.0012).toFixed(3).replace('.',',');document.getElementById('cvConfidence').textContent=confidence.toFixed(2).replace('.',',');status.textContent='анализ завершен';log.innerHTML=`<span>1. Изображение подготовлено</span><span>2. Область локализована</span><span class="active">3. ${mode==='dino'?'Embedding сохранен':mode==='clip'?'Класс выбран':'Признаки рассчитаны'}</span>`;document.getElementById('cvActionConclusion').textContent=confidence<.75?'Качество изображения снижает уверенность. Система использует text-only fallback.':`Режим ${document.getElementById('visionModel').selectedOptions[0].textContent} дал пригодный признак для fusion.`;button.disabled=false;
}
document.getElementById('generateChart').addEventListener('click',()=>{createSeries();document.getElementById('cvShell').className='canvas-shell cv-animated';document.getElementById('visionStatus').textContent='новое изображение';});document.getElementById('runVision').addEventListener('click',analyzeVision);document.getElementById('watermark').addEventListener('change',()=>drawMarket(false));document.getElementById('noise').addEventListener('input',()=>drawMarket(false));
function redraw(){drawMarket(false);drawBarChart('cvChart',['ResNet50','EffNet','ViT','Swin','CLIP','DINOv2','RuCLIP','DINO+OCR'],[.612,.628,.661,.672,.701,.718,.689,.731],{max:.8,highlight:7});}
window.addEventListener('redrawCharts',redraw);createSeries();drawBarChart('cvChart',['ResNet50','EffNet','ViT','Swin','CLIP','DINOv2','RuCLIP','DINO+OCR'],[.612,.628,.661,.672,.701,.718,.689,.731],{max:.8,highlight:7});
