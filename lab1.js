const modelConfidence = { qwen: .91, finbert: .86, llama: .88, gigachat: .90 };
const companies = [
  { keys: ['сбер', 'sber'], entity: 'Сбербанк', ticker: 'SBER' },
  { keys: ['tesla', 'тесла'], entity: 'Tesla', ticker: 'TSLA' },
  { keys: ['газпром', 'gazprom'], entity: 'Газпром', ticker: 'GAZP' },
  { keys: ['apple'], entity: 'Apple', ticker: 'AAPL' }
];
const positive = ['рост', 'увелич', 'превыс', 'рекорд', 'прибыл', 'повыш'];
const negative = ['сниж', 'убыт', 'предупред', 'паден', 'штраф', 'сокращ'];
function analyze() {
  const text = document.getElementById('newsText').value.trim();
  const low = text.toLowerCase();
  const found = companies.find(c => c.keys.some(k => low.includes(k))) || { entity: 'не определено', ticker: '—' };
  const pos = positive.filter(k => low.includes(k)).length;
  const neg = negative.filter(k => low.includes(k)).length;
  const sentiment = pos > neg ? 'positive' : neg > pos ? 'negative' : 'neutral';
  const event = low.includes('дивид') ? 'dividend' : low.includes('прибыл') || low.includes('марж') ? 'earnings' : 'operational_update';
  const fragments = text.split(/[.!?]/).map(x => x.trim()).filter(Boolean);
  const evidence = fragments.find(x => [...positive, ...negative].some(k => x.toLowerCase().includes(k))) || fragments[0] || 'нет доказательного фрагмента';
  const base = modelConfidence[document.getElementById('nlpModel').value];
  const confidence = Math.max(.52, Math.min(.97, base + (pos + neg ? .01 : -.18) - (found.ticker === '—' ? .12 : 0)));
  document.getElementById('tickerOut').textContent = found.ticker;
  document.getElementById('sentimentOut').textContent = sentiment;
  document.getElementById('confidenceOut').textContent = confidence.toFixed(2).replace('.', ',');
  document.getElementById('eventOut').textContent = event;
  document.getElementById('entityOut').textContent = found.entity;
  const classOut = document.getElementById('classOut');
  classOut.className = `tag ${sentiment}`;
  classOut.textContent = sentiment === 'positive' ? 'положительное влияние' : sentiment === 'negative' ? 'негативное влияние' : 'нейтральное влияние';
  document.getElementById('evidenceOut').textContent = evidence;
  document.getElementById('actionConclusion').textContent = confidence < .7 ? 'Уверенность недостаточна: включается abstain, признак не влияет на выдачу.' : 'Признак можно передать в ранжирование, но решение требует проверки риска и актуальности цены.';
}
document.getElementById('analyzeNews').addEventListener('click', analyze);
document.querySelectorAll('.sample-news').forEach(b => b.addEventListener('click', () => { document.getElementById('newsText').value = b.dataset.text; analyze(); }));
function redraw() { drawBarChart('nlpChart', ['TF-IDF','BiLSTM','RuBERT','FinBERT','XLM-R','Qwen2.5','Llama 3.1','GigaChat'], [.682,.711,.781,.803,.796,.824,.806,.818], { max:.9, highlight:5 }); }
window.addEventListener('redrawCharts', redraw); redraw(); analyze();
