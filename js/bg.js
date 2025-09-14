const c = document.getElementById('bg');
const ctx = c.getContext('2d');

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  c.width = innerWidth * dpr;
  c.height = innerHeight * dpr;
  c.style.width = '100%';
  c.style.height = '100%';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

addEventListener('resize', resize);
resize();

let t0 = performance.now();

function loop(now) {
  const t = (now - t0) / 1000;

  ctx.clearRect(0, 0, c.width, c.height);

  ctx.globalAlpha = 0.06;
  const s = 56;
  ctx.strokeStyle = '#6a89d9';

  for (let x = 0; x < innerWidth + s; x += s) {
    const y = Math.sin((x * 0.02) + t * 0.6) * 6;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, innerHeight + y);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

