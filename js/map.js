/**
 * map.js — 世界地图系统：Canvas背景渲染、区域按钮、信息面板
 */

(function() {
  'use strict';

  const { MAP_REGIONS, ALL_ITEMS } = GAME_DATA;
  let canvas, ctx, canvasW, canvasH;
  let animFrame = null;
  let time = 0;
  let particles = [];

  /* ===================== CANVAS INIT ===================== */
  function initCanvas() {
    canvas  = document.getElementById('map-canvas');
    ctx     = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    spawnBgParticles();
    if (!animFrame) animLoop();
  }

  function resize() {
    canvasW = canvas.width  = canvas.offsetWidth;
    canvasH = canvas.height = canvas.offsetHeight;
  }

  /* ===================== PARTICLES ===================== */
  function spawnBgParticles() {
    particles = [];
    for (let i = 0; i < 60; i++) {
      particles.push(newParticle());
    }
  }

  function newParticle() {
    return {
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0003,
      vy: -Math.random() * 0.0004 - 0.0001,
      size: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.6 + 0.1,
      color: ['#c8962a','#a335ee','#0070dd','#ffffff'][Math.floor(Math.random()*4)],
    };
  }

  /* ===================== ANIMATION LOOP ===================== */
  function animLoop() {
    animFrame = requestAnimationFrame(animLoop);
    time += 0.016;
    drawBackground();
    drawParticles();
  }

  /* ===================== BACKGROUND ===================== */
  function drawBackground() {
    if (!ctx) return;
    // Sky gradient
    const sky = ctx.createRadialGradient(canvasW*0.5, canvasH*0.3, 0, canvasW*0.5, canvasH*0.5, canvasH);
    sky.addColorStop(0,   '#1a0a2e');
    sky.addColorStop(0.4, '#0e0818');
    sky.addColorStop(1,   '#050308');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvasW, canvasH);

    // Draw continent shapes
    drawContinents();

    // Draw connection paths between regions
    drawPaths();
  }

  function drawContinents() {
    // Eastern Kingdoms silhouette (right side)
    ctx.beginPath();
    ctx.moveTo(canvasW*0.35, canvasH*0.05);
    ctx.bezierCurveTo(canvasW*0.55, canvasH*0.05, canvasW*0.70, canvasH*0.20, canvasW*0.72, canvasH*0.50);
    ctx.bezierCurveTo(canvasW*0.70, canvasH*0.75, canvasW*0.55, canvasH*0.90, canvasW*0.40, canvasH*0.92);
    ctx.bezierCurveTo(canvasW*0.25, canvasH*0.90, canvasW*0.30, canvasH*0.70, canvasW*0.28, canvasH*0.50);
    ctx.bezierCurveTo(canvasW*0.26, canvasH*0.30, canvasW*0.30, canvasH*0.10, canvasW*0.35, canvasH*0.05);
    ctx.fillStyle = 'rgba(20, 14, 35, 0.7)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(100, 70, 150, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Kalimdor (left)
    ctx.beginPath();
    ctx.moveTo(canvasW*0.08, canvasH*0.10);
    ctx.bezierCurveTo(canvasW*0.22, canvasH*0.08, canvasW*0.28, canvasH*0.25, canvasW*0.26, canvasH*0.55);
    ctx.bezierCurveTo(canvasW*0.24, canvasH*0.80, canvasW*0.15, canvasH*0.92, canvasW*0.06, canvasH*0.88);
    ctx.bezierCurveTo(canvasW*0.00, canvasH*0.75, canvasW*0.02, canvasH*0.40, canvasW*0.05, canvasH*0.20);
    ctx.bezierCurveTo(canvasW*0.06, canvasH*0.12, canvasW*0.07, canvasH*0.10, canvasW*0.08, canvasH*0.10);
    ctx.fillStyle = 'rgba(18, 22, 14, 0.7)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(60, 100, 60, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Northrend (top)
    ctx.beginPath();
    ctx.moveTo(canvasW*0.38, canvasH*0.02);
    ctx.bezierCurveTo(canvasW*0.55, canvasH*0.00, canvasW*0.80, canvasH*0.05, canvasW*0.82, canvasH*0.22);
    ctx.bezierCurveTo(canvasW*0.80, canvasH*0.35, canvasW*0.68, canvasH*0.38, canvasW*0.55, canvasH*0.35);
    ctx.bezierCurveTo(canvasW*0.48, canvasH*0.33, canvasW*0.38, canvasH*0.28, canvasW*0.36, canvasH*0.18);
    ctx.bezierCurveTo(canvasW*0.35, canvasH*0.10, canvasW*0.37, canvasH*0.04, canvasW*0.38, canvasH*0.02);
    ctx.fillStyle = 'rgba(15, 22, 35, 0.75)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(100, 150, 200, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Ocean shimmer
    const oGrad = ctx.createLinearGradient(canvasW*0.25, 0, canvasW*0.38, 0);
    oGrad.addColorStop(0, 'rgba(0,40,80,0.15)');
    oGrad.addColorStop(1, 'rgba(0,20,40,0.05)');
    ctx.fillStyle = oGrad;
    ctx.fillRect(canvasW*0.26, canvasH*0.05, canvasW*0.12, canvasH*0.85);
  }

  function drawPaths() {
    ctx.strokeStyle = 'rgba(200, 150, 42, 0.12)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    const regs = MAP_REGIONS;
    for (let i = 0; i < regs.length - 1; i++) {
      const a = regs[i], b = regs[i+1];
      ctx.beginPath();
      ctx.moveTo(a.x * canvasW, a.y * canvasH);
      ctx.lineTo(b.x * canvasW, b.y * canvasH);
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }

  function drawParticles() {
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.y < -0.01 || p.x < -0.01 || p.x > 1.01) Object.assign(p, newParticle(), { y: 1.02 });

      ctx.beginPath();
      ctx.arc(p.x * canvasW, p.y * canvasH, p.size, 0, Math.PI*2);
      const glow = Math.sin(time * 2 + p.x * 10) * 0.3 + 0.7;
      ctx.fillStyle = p.color + Math.floor(p.alpha * glow * 255).toString(16).padStart(2,'0');
      ctx.fill();
    });
  }

  /* ===================== REGION BUTTONS ===================== */
  function renderRegionButtons() {
    const container = document.getElementById('map-regions');
    container.innerHTML = '';
    const state = GameCore.getState();

    MAP_REGIONS.forEach(region => {
      const isExplored = state.exploredRegions.includes(region.id);

      const btn = document.createElement('button');
      btn.className = `map-region-btn ${isExplored ? 'explored' : 'unexplored'} ${region.isLegendaryPool ? 'legendary-pool' : ''}`;
      btn.style.left = (region.x * 100) + '%';
      btn.style.top  = (region.y * 100) + '%';

      btn.innerHTML = `
        <span class="region-icon">${region.emoji}</span>
        <span class="region-label">${region.name}</span>
        ${isExplored ? '<span class="region-explored-badge">✓</span>' : ''}
      `;

      btn.addEventListener('click', () => showRegionPanel(region));
      container.appendChild(btn);
    });
  }

  /* ===================== INFO PANEL ===================== */
  function showRegionPanel(region) {
    const panel = document.getElementById('map-info-panel');
    const state = GameCore.getState();

    document.getElementById('map-panel-title').textContent = `${region.emoji} ${region.name}`;
    document.getElementById('map-panel-desc').textContent  = region.description;

    // Pool preview
    const poolEl = document.getElementById('map-panel-pool');
    poolEl.innerHTML = '';
    const poolItems = GAME_DATA.ALL_ITEMS.filter(i => region.poolItems.includes(i.id));
    poolItems.slice(0, 12).forEach(item => {
      const el = document.createElement('div');
      el.className = `pool-preview-item ${item.rarity}`;
      el.textContent = item.emoji;
      el.title = item.name;
      poolEl.appendChild(el);
    });
    if (poolItems.length > 12) {
      const more = document.createElement('div');
      more.className = 'pool-preview-item';
      more.style.color = 'var(--text-muted)';
      more.textContent = `+${poolItems.length-12}`;
      poolEl.appendChild(more);
    }

    panel.classList.remove('hidden');
    requestAnimationFrame(() => panel.classList.add('visible'));

    // Enter button
    const btnEnter = document.getElementById('map-panel-enter');
    btnEnter.onclick = () => {
      state.currentPool   = 'region';
      state.currentRegion = region.id;
      closePanel();
      GameCore.navigateTo('gacha');
      // Sync pool tab
      document.querySelectorAll('.pool-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.pool === 'region');
      });
      GameCore.showToast(`进入 ${region.name} 扭蛋池`, 'success');
    };
  }

  function closePanel() {
    const panel = document.getElementById('map-info-panel');
    panel.classList.remove('visible');
  }

  /* ===================== RENDER (public) ===================== */
  function render() {
    renderRegionButtons();
  }

  /* ===================== INIT ===================== */
  function init() {
    initCanvas();
    renderRegionButtons();

    document.getElementById('map-panel-close').addEventListener('click', closePanel);

    // Click on canvas (not a button) closes panel
    canvas.addEventListener('click', () => {
      const panel = document.getElementById('map-info-panel');
      if (panel.classList.contains('visible')) closePanel();
    });
  }

  window.addEventListener('DOMContentLoaded', init);

  window.MapSystem = { render };

})();
