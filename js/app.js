const $ = (q, el = document) => el.querySelector(q);
const $$ = (q, el = document) => Array.from(el.querySelectorAll(q));

// Rodapé: ano atual
$('#ano').textContent = new Date().getFullYear();

// Alternância de tema: padrão por preferência do sistema, pode ser alterado via botão
const btnTheme = $('#toggle-theme');
const btnThemeIcon = $('#theme-icon', btnTheme)

let chosen = localStorage.getItem('themeChoice') ||
  (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

function applyTheme(name) {
  document.documentElement.setAttribute('data-theme', name);
  localStorage.setItem('themeChoice', name);
  btnTheme.setAttribute('aria-pressed', name === 'dark' ? 'true' : 'false');

  btnThemeIcon.classList.remove('bxs-sun', 'bxs-moon');
  btnThemeIcon.classList.add(`bxs-${name === 'dark' ? 'sun' : 'moon'}`);
}

applyTheme(chosen);

btnTheme.addEventListener('click', () => {
  chosen = (chosen === 'dark') ? 'light' : 'dark';
  applyTheme(chosen);
});

// Revelar ao rolar a página
const io = new IntersectionObserver(es => {
  es.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('is-visible');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

$$('.section, .hero').forEach(el => el.classList.add('reveal'));
$$('.reveal').forEach(el => io.observe(el));

// Estatísticas animadas
function animateStats() {
  $$('.stat-value').forEach(sv => {
    const target = +sv.dataset.target;
    let v = 0, t0 = null;

    function step(ts) {
      if (!t0) t0 = ts;
      const p = Math.min(1, (ts - t0) / 1200);
      v = Math.floor(target * p);
      sv.textContent = v;
      if (p < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  });
}

const ioStats = new IntersectionObserver(es => {
  es.forEach(e => {
    if (e.isIntersecting) {
      animateStats();
      ioStats.disconnect();
    }
  });
}, { threshold: 0.3 });

ioStats.observe($('.hero-media'));

// Copiar email
document.addEventListener('click', e => {
  const btn = e.target.closest('#btn-email');
  if (!btn) return;
  const email = btn.dataset.email || 'contato@exemplo.com';
  navigator.clipboard.writeText(email).then(() => {
    btn.textContent = 'email copiado';
    setTimeout(() => btn.textContent = 'copiar email', 1500);
  });
});

// Carregar JSON com fallback de tags embutidas
async function loadJSON(path, tagId) {
  try {
    if (location.protocol === 'file:') throw new Error('file');
    const res = await fetch(path);
    return await res.json();
  } catch (_) {
    try {
      return JSON.parse(document.getElementById(tagId).textContent || '[]');
    } catch (e) {
      return [];
    }
  }
}

// Links do perfil
(async function () {
  const profile = await loadJSON('data/profile.json', 'profile');
  const ul = $('#hero-links');
  const items = [];

  //if (profile.orcid) items.push(`<li><a href="${profile.orcid}" target="_blank" rel="noopener noreferrer" class="link">ORCID</a></li>`);
  //if (profile.scholar) items.push(`<li><a href="${profile.scholar}" target="_blank" rel="noopener noreferrer" class="link">Google Scholar</a></li>`);
  //if (profile.researchgate) items.push(`<li><a href="${profile.researchgate}" target="_blank" rel="noopener noreferrer" class="link">ResearchGate</a></li>`);
  if (profile.linkedin) items.push(`<li><a href="${profile.linkedin}" target="_blank" rel="noopener noreferrer" class="link">LinkedIn</a></li>`);
  if (profile.instagram) items.push(`<li><a href="${profile.instagram}" target="_blank" rel="noopener noreferrer" class="link">Instagram</a></li>`);
  if (profile.instagram) items.push(`<li><a href="${profile.github}" target="_blank" rel="noopener noreferrer" class="link">GitHub</a></li>`);


  ul.innerHTML = items.join('');
  if (profile.email) {
    const b = $('#btn-email');
    if (b) b.dataset.email = profile.email;
  }
})();

// Blocos de formação para cartões
(async function () {
  const f = await loadJSON('data/formacao.json', 'formacao');
  const grid = $('#grid-formacao');
  const blocks = [
    { titulo: 'Mestrado em Engenharia Elétrica e Computação', itens: f.mestrado || [] },
    { titulo: 'Especialização em Engenharia de Software', itens: f.esp_software || [] },
    { titulo: 'Especialização em Docência em Ciência e TI', itens: f.esp_docencia || [] },
    { titulo: 'Graduação em Ciência da Computação', itens: f.cc || [] },
    { titulo: 'Licenciatura em Matemática', itens: f.lic || [] },
    { titulo: 'Bacharelado em Matemática Aplicada e Computacional', itens: f.mac || [] },
    { titulo: 'Formação complementar', itens: f.complementar || [] }
  ];

  grid.innerHTML = blocks.map(b =>
    `<article class="card"><h3>${b.titulo}</h3><ul class="list">${b.itens.map(x => `<li>${x}</li>`).join('')}</ul></article>`
  ).join('');
})();

// Projetos e publicações
(async function () {
  const [projetos, pubs] = await Promise.all([
    loadJSON('data/projetos.json', 'data-projetos'),
    loadJSON('data/publicacoes.json', 'data-pubs')
  ]);

  const grid = $('#grid-projetos');
  let all = projetos;

  function render(list) {
    grid.innerHTML = list.map((p, i) =>
      `<article class="card item">
        <h3>${p.titulo}</h3>
        <p class="muted">${p.desc}</p>
        <div class="tagline">${p.categoria.join(' | ')}</div>
        <div class="row">
          <button class="btn btn-outline open" data-i="${i}">Abrir</button>
        </div>
      </article>`).join('');
  }

  render(all);

  const chips = $$('.chip');
  const inputQ = $('#q');

  chips.forEach(c =>
    c.addEventListener('click', () => {
      chips.forEach(x => x.classList.remove('is-active'));
      c.classList.add('is-active');
      const cat = c.dataset.cat;
      const t = (inputQ.value || '').toLowerCase();
      const filtered = all.filter(p =>
        (cat === 'todos' || p.categoria.includes(cat)) && p.titulo.toLowerCase().includes(t)
      );
      render(filtered);
    })
  );

  inputQ.addEventListener('input', () => {
    const active = $('.chip.is-active').dataset.cat;
    const t = (inputQ.value || '').toLowerCase();
    render(all.filter(p =>
      (active === 'todos' || p.categoria.includes(active)) && p.titulo.toLowerCase().includes(t)
    ));
  });

  const dlg = $('#dlg-projeto');
  const close = dlg.querySelector('.close');

  grid.addEventListener('click', e => {
    const btn = e.target.closest('.open');
    if (!btn) return;
    const p = all[+btn.dataset.i];
    dlg.querySelector('.dlg-title').textContent = p.titulo;
    dlg.querySelector('.dlg-desc').textContent = p.desc;
    const ul = dlg.querySelector('.dlg-links');
    ul.innerHTML = p.links.map(l =>
      `<li><a class="link" target="_blank" rel="noopener noreferrer" href="${l.url}">${l.nome}</a></li>`).join('');
    dlg.showModal();
    drawChart();
  });

  close.addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });

  // Publicações
  const ulP = $('#lista-pubs');
  ulP.innerHTML = pubs.map(p =>
    `<li><strong>${p.titulo}</strong> | <em>${p.veiculo}</em> | <a class="link" target="_blank" rel="noopener noreferrer" href="${p.link}">acessar</a></li>`
  ).join('');
})();

// Desenhar gráfico simples
function drawChart() {
  const cv = document.getElementById('chart');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);

  const pad = 36, w = cv.width - pad * 2, h = cv.height - pad * 2;
  ctx.strokeStyle = '#8fb6ff';
  ctx.globalAlpha = 0.9;
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(pad, pad);
  ctx.lineTo(pad, pad + h);
  ctx.lineTo(pad + w, pad + h);
  ctx.stroke();

  const data = Array.from({ length: 12 }, (_, i) =>
    40 + Math.sin(i * 0.5) * 20 + Math.random() * 8
  );

  ctx.beginPath();
  data.forEach((v, i) => {
    const x = pad + (i / (data.length - 1)) * w;
    const y = pad + h - (v / 100) * h;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.lineWidth = 2;
  ctx.stroke();
}

// Seções extras: orientações, eventos, bancas, curiosidades e frases
(async function () {
  const extra = await loadJSON('data/extra.json', 'extra');
  const orient = $('#lista-orientacoes');
  const eventos = $('#lista-eventos');
  const bancas = $('#lista-bancas');
  const curios = $('#lista-curiosidades');
  const frases = $('#lista-frases');

  if (orient && Array.isArray(extra.orientacoes)) {
    orient.innerHTML = extra.orientacoes.map(o =>
      `<article class="card">
        <h4>${o.titulo}</h4>
        <div class="tagline">${o.nivel} ${o.ano}${o.status ? ' • ' + o.status : ''}</div>
        <p class="muted">${o.resumo || ''}</p>
      </article>`).join('');
  }

  if (eventos && Array.isArray(extra.eventos)) {
    eventos.innerHTML = extra.eventos.map(e =>
      `<article class="card">
        <h4>${e.titulo}</h4>
        <div class="tagline">${e.ano} • ${e.papel} • ${e.local || ''}</div>
        ${e.tema ? `<p class='muted'>${e.tema}</p>` : ''}
        ${e.slides ? `<div class='row'><a class='link' target='_blank' rel='noopener noreferrer' href='${e.slides}'>slides</a></div>` : ''}
      </article>`).join('');
  }

  if (bancas && Array.isArray(extra.bancas)) {
    bancas.innerHTML = extra.bancas.map(b =>
      `<article class="card">
        <h4>${b.titulo}</h4>
        <div class="tagline">${b.autor} • ${b.curso} • ${b.ano}</div>
      </article>`).join('');
  }

  if (curios && Array.isArray(extra.curiosidades)) {
    curios.innerHTML = extra.curiosidades.map(c =>
      `<article class="card"><p>${c}</p></article>`
    ).join('');
  }

  if (frases && Array.isArray(extra.frases)) {
    frases.innerHTML = extra.frases.map(q =>
      `<article class="card">
        <blockquote class="small">“${q.texto}”</blockquote>
        <div class="tagline">${q.autor}</div>
      </article>`).join('');
  }
})();

// Menu retrátil mobile
(function initDrawer(){
  const btn = document.getElementById('btn-menu');
  const drawer = document.getElementById('drawer-nav');
  const overlay = document.getElementById('overlay');
  const themeDesktop = document.getElementById('toggle-theme');
  const themeDrawer = document.getElementById('drawer-theme');

  if(!btn || !drawer) return;

  function openDrawer(){
    document.body.classList.add('menu-open');
    drawer.setAttribute('aria-hidden','false');
    btn.setAttribute('aria-expanded','true');
  }
  function closeDrawer(){
    document.body.classList.remove('menu-open');
    drawer.setAttribute('aria-hidden','true');
    btn.setAttribute('aria-expanded','false');
  }
  btn.addEventListener('click', ()=>{
    const open = document.body.classList.contains('menu-open');
    open ? closeDrawer() : openDrawer();
  });
  if(overlay) overlay.addEventListener('click', closeDrawer);
  drawer.addEventListener('click', e=>{
    const a = e.target.closest('a');
    if(a) closeDrawer();
  });
  document.addEventListener('keydown', e=>{
    if(e.key === 'Escape') closeDrawer();
  });

  // Reaproveita sua função de tema dentro da gaveta
  if(themeDesktop && themeDrawer){
    themeDrawer.addEventListener('click', ()=> themeDesktop.click());
  }
})();
