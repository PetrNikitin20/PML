const palette = { navy: '#10264a', blue: '#2764b7', red: '#e63946', gray: '#9aa8ba', grid: '#dce4ef' };

function fitCanvas(canvas, height = 330) {
  const ratio = window.devicePixelRatio || 1;
  const width = Math.max(320, canvas.parentElement.clientWidth - 32);
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { ctx, width, height };
}

function drawBarChart(canvasId, labels, values, options = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const { ctx, width, height } = fitCanvas(canvas, options.height || 330);
  const left = 56, right = 18, top = 20, bottom = 76;
  const max = options.max || Math.max(...values) * 1.12;
  ctx.clearRect(0, 0, width, height);
  ctx.font = '13px Segoe UI';
  ctx.fillStyle = '#5e6c84';
  ctx.strokeStyle = palette.grid;
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = top + (height - top - bottom) * i / 5;
    ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(width - right, y); ctx.stroke();
    const v = max * (1 - i / 5);
    ctx.fillText(options.percent ? `${Math.round(v * 100)}%` : v.toFixed(options.decimals ?? 2), 6, y + 4);
  }
  const plotW = width - left - right;
  const slot = plotW / labels.length;
  labels.forEach((label, i) => {
    const barW = Math.min(58, slot * .64);
    const x = left + slot * i + (slot - barW) / 2;
    const barH = (height - top - bottom) * values[i] / max;
    const y = height - bottom - barH;
    const grad = ctx.createLinearGradient(0, y, 0, height - bottom);
    grad.addColorStop(0, options.highlight === i ? palette.red : palette.blue);
    grad.addColorStop(1, palette.navy);
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, barW, barH);
    ctx.fillStyle = palette.navy;
    ctx.textAlign = 'center';
    ctx.fillText(values[i].toFixed(options.decimals ?? 3), x + barW/2, y - 7);
    ctx.save();
    ctx.translate(x + barW/2, height - bottom + 12);
    ctx.rotate(-Math.PI/5);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#4d5c73';
    ctx.fillText(label, 0, 0);
    ctx.restore();
  });
  ctx.textAlign = 'left';
}

function renderScores(targetId, items) {
  const target = document.getElementById(targetId);
  if (!target) return;
  const max = Math.max(...items.map(x => x.value));
  target.innerHTML = items.map((x, i) => `
    <div class="score-bar">
      <div class="score-row"><b>${i + 1}. ${x.name}</b><span>${x.value.toFixed(3)}</span></div>
      <div class="bar"><span style="width:${(x.value/max*100).toFixed(1)}%"></span></div>
      ${x.note ? `<small>${x.note}</small>` : ''}
    </div>`).join('');
}

window.addEventListener('resize', () => window.dispatchEvent(new CustomEvent('redrawCharts')));
