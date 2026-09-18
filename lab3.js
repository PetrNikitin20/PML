const assets = [
  {name:'SBER',risk:'medium',base:.78,nlp:.12,cv:.06,note:'прибыль выше ожиданий'},
  {name:'GAZP',risk:'medium',base:.69,nlp:.02,cv:.03,note:'нейтральный отчет'},
  {name:'YNDX',risk:'high',base:.74,nlp:.09,cv:.08,note:'рост и сильный тренд'},
  {name:'LKOH',risk:'medium',base:.70,nlp:.06,cv:.04,note:'дивидендное событие'},
  {name:'OZON',risk:'high',base:.66,nlp:.11,cv:.07,note:'рост выручки'},
  {name:'MOEX',risk:'low',base:.65,nlp:.04,cv:.02,note:'умеренный риск'},
  {name:'RGBI',risk:'low',base:.63,nlp:.01,cv:.05,note:'защитный компонент'},
  {name:'GLDR',risk:'low',base:.61,nlp:.02,cv:.06,note:'диверсификация'},
  {name:'TATN',risk:'medium',base:.64,nlp:.05,cv:.03,note:'стабильный профиль'},
  {name:'NVTK',risk:'high',base:.67,nlp:-.02,cv:.07,note:'визуальный сигнал'},
  {name:'ROSN',risk:'medium',base:.62,nlp:.03,cv:.02,note:'слабый положительный сигнал'},
  {name:'SNGS',risk:'medium',base:.58,nlp:.01,cv:.01,note:'baseline candidate'}
];
const waitRank=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function rank(){const button=document.getElementById('rankButton'),log=document.getElementById('rankLog'),ranking=document.getElementById('ranking');button.disabled=true;ranking.classList.remove('ranking-animated');const risk=document.getElementById('risk').value,useNlp=document.getElementById('useNlp').checked,useCv=document.getElementById('useCv').checked,rr=document.getElementById('rerank').checked;const allow=risk==='low'?['low']:risk==='medium'?['low','medium']:['low','medium','high'];log.innerHTML='<span class="active">1. Candidate set</span><span>2. Hard filter</span><span>3. Scoring</span><span>4. Reranking</span>';await waitRank(350);let out=assets.filter(x=>allow.includes(x.risk));log.children[1].classList.add('active');await waitRank(350);out=out.map(x=>({...x,value:x.base+(useNlp?x.nlp:0)+(useCv?x.cv:0)})).sort((a,b)=>b.value-a.value);log.children[2].classList.add('active');await waitRank(350);if(rr){out=out.map((x,i)=>({...x,value:x.value+(x.risk==='low'?.025:0)-(i>7?.01:0)})).sort((a,b)=>b.value-a.value);}log.children[3].classList.add('active');renderScores('ranking',out.slice(0,10));ranking.classList.add('ranking-animated');document.getElementById('recConclusion').textContent=`Допущено ${out.length} из ${assets.length} кандидатов. Нарушений после фильтра: 0. ${useNlp&&useCv?'NLP и CV влияют на порядок и основания.':'Отключение модальности используется как абляция.'}`;button.disabled=false;}
document.getElementById('rankButton').addEventListener('click',rank);function redraw(){drawBarChart('recChart',['Popularity','ALS','BPR','NCF','LightGCN','SASRec','BERT4Rec','Two-tower'],[.181,.247,.258,.266,.281,.293,.301,.318],{max:.35,highlight:7});}window.addEventListener('redrawCharts',redraw);redraw();rank();
