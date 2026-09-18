const waitProject=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function evaluate(){
  const button=document.getElementById('evaluatePipeline'),log=document.getElementById('projectLog');
  button.disabled=true;
  const nlp=document.getElementById('pNlp').checked,cv=document.getElementById('pCv').checked,history=document.getElementById('pHistory').checked,rerank=document.getElementById('pRerank').checked,cal=document.getElementById('pCalibration').checked;
  log.innerHTML='<span class="active">1. Конфигурация</span><span>2. Инференс</span><span>3. Ограничения</span><span>4. Метрики</span>';
  await waitProject(280);
  let ndcg=.176,coverage=.118,latency=42,violations=4.8;
  if(history){ndcg=.276;coverage=.496;latency=96;violations=3.1;}
  if(nlp){ndcg+=.026;coverage+=.087;latency+=75;}
  if(cv){ndcg+=.011;coverage+=.065;latency+=92;}
  if(nlp&&cv){ndcg+=.005;coverage-=.007;latency-=15;}
  log.children[1].classList.add('active');await waitProject(280);
  if(rerank){ndcg-=.006;coverage+=.043;latency+=28;violations=0;}
  if(cal){violations=Math.max(0,violations-.5);}
  log.children[2].classList.add('active');await waitProject(280);
  ndcg=Math.max(.15,Math.min(.33,ndcg));coverage=Math.max(.08,Math.min(.72,coverage));
  document.getElementById('pNdcg').textContent=ndcg.toFixed(3).replace('.',',');
  document.getElementById('pCoverage').textContent=coverage.toFixed(3).replace('.',',');
  document.getElementById('pLatency').textContent=`${latency} мс`;
  document.getElementById('pViolations').textContent=`${violations.toFixed(1).replace('.',',')}%`;
  const active=[history?'history':'popularity',nlp?'NLP':null,cv?'CV':null,rerank?'safe rerank':null,cal?'calibration':null].filter(Boolean);
  document.getElementById('activePipeline').innerHTML=active.map(x=>`<span class="tag">${x}</span>`).join('');
  log.children[3].classList.add('active');
  document.getElementById('projectConclusion').textContent=violations>0?'Конфигурация отклонена: ограничения отключены, есть нарушения пригодности.':(!nlp||!cv?'Это абляция: сравните падение качества и coverage с полной конфигурацией.':'Конфигурация принята: нарушения равны нулю, потеря NDCG после reranking находится в допуске.');
  button.disabled=false;
}
document.getElementById('evaluatePipeline').addEventListener('click',evaluate);
function redraw(){drawBarChart('projectChart',['Popularity','Collaborative','NLP only','CV only','NLP+CV','Full+rerank','Fallback'],[.176,.276,.302,.287,.318,.312,.283],{max:.35,highlight:5});}
window.addEventListener('redrawCharts',redraw);redraw();evaluate();
