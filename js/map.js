/**
 * map.js - 咕咕大冒险 世界地图系统：Canvas背景、区域按钮、信息面板
 * 地图上只显示地图名，点击后在面板内选择难度
 */

(function() {
  'use strict';

  const { MAP_REGIONS, ATTR_COLORS } = GAME_DATA;
  let canvas, ctx, canvasW, canvasH;
  let animFrame = null;
  let time = 0;
  let particles = [];

  /* ===================== BASE MAP GROUPING ===================== */
  // Strip trailing "_1", "_2", "_3"... suffix to get the base map id
  // For regions that already have no numeric suffix (echorange, crosslake, etc.)
  // the base id equals the region id itself.
  function getBaseId(regionId) {
    return regionId.replace(/_\d+$/, '');
  }

  // Build a map of baseId -> array of sub-regions (sorted by tier / level_range)
  function buildBaseMapGroups() {
    const groups = {};
    MAP_REGIONS.forEach(r => {
      const base = getBaseId(r.id);
      if (!groups[base]) groups[base] = [];
      groups[base].push(r);
    });
    // Sort each group by level_range[0] ascending
    Object.values(groups).forEach(arr =>
      arr.sort((a, b) => a.level_range[0] - b.level_range[0])
    );
    return groups;
  }

  // Representative info for each base map (first sub-region's emoji/position/name)
  function getBaseMapMeta(subRegions) {
    const first = subRegions[0];
    // Strip "·难度N" or "·东部/西部" suffix from name for display on map button
    const baseName = first.name
      .replace(/·难度\d+$/, '')
      .replace(/·(东部|西部)$/, '');
    // Use middle position if multiple tiers
    const midIdx = Math.floor(subRegions.length / 2);
    return {
      name:  baseName || first.name,
      emoji: first.emoji,
      color: first.color,
      tier:  Math.min(...subRegions.map(r => r.tier)),
      x:     subRegions[midIdx].x,
      y:     subRegions[midIdx].y,
    };
  }

  // Derive a readable difficulty label for a sub-region
  function getDiffLabel(region) {
    // If name already contains "·难度N", extract it
    const m = region.name.match(/难度(\d+)/);
    if (m) return `难度 ${m[1]}`;
    // For single-tier maps (no suffix), just use "进入"
    return '进入';
  }

  /* ===================== CANVAS ===================== */
  function initCanvas() {
    canvas = document.getElementById('map-canvas');
    ctx    = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    spawnParticles();
    if (!animFrame) animLoop();
  }

  function resize() {
    canvasW = canvas.width  = canvas.offsetWidth  || canvas.parentElement.offsetWidth;
    canvasH = canvas.height = canvas.offsetHeight || canvas.parentElement.offsetHeight;
  }

  /* ===================== PARTICLES ===================== */
  function spawnParticles() {
    particles = [];
    for (let i = 0; i < 50; i++) particles.push(newParticle());
  }

  function newParticle() {
    const colors = ['#4a90d9','#3acc70','#e8b840','#c090e0','#f09090','#ffffff'];
    return {
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0002,
      vy: -Math.random() * 0.0003 - 0.00005,
      size: Math.random() * 1.8 + 0.4,
      alpha: Math.random() * 0.5 + 0.08,
      color: colors[Math.floor(Math.random() * colors.length)],
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
    if (!ctx || !canvasW) return;
    const bg = ctx.createRadialGradient(canvasW*0.5, canvasH*0.3, 0, canvasW*0.5, canvasH*0.6, canvasH*1.1);
    bg.addColorStop(0,   '#0d1a30');
    bg.addColorStop(0.5, '#080f20');
    bg.addColorStop(1,   '#030508');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvasW, canvasH);
    drawLandmasses();
    drawPaths();
  }

  function drawLandmasses() {
    // Central continent
    ctx.beginPath();
    ctx.moveTo(canvasW*0.20, canvasH*0.08);
    ctx.bezierCurveTo(canvasW*0.55, canvasH*0.05, canvasW*0.80, canvasH*0.18, canvasW*0.82, canvasH*0.52);
    ctx.bezierCurveTo(canvasW*0.80, canvasH*0.82, canvasW*0.60, canvasH*0.95, canvasW*0.35, canvasH*0.93);
    ctx.bezierCurveTo(canvasW*0.15, canvasH*0.90, canvasW*0.08, canvasH*0.72, canvasW*0.08, canvasH*0.50);
    ctx.bezierCurveTo(canvasW*0.08, canvasH*0.28, canvasW*0.14, canvasH*0.10, canvasW*0.20, canvasH*0.08);
    ctx.fillStyle = 'rgba(16, 28, 20, 0.72)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(58, 180, 90, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Northern island
    ctx.beginPath();
    ctx.moveTo(canvasW*0.70, canvasH*0.05);
    ctx.bezierCurveTo(canvasW*0.88, canvasH*0.04, canvasW*0.96, canvasH*0.18, canvasW*0.95, canvasH*0.35);
    ctx.bezierCurveTo(canvasW*0.93, canvasH*0.48, canvasW*0.84, canvasH*0.52, canvasW*0.74, canvasH*0.48);
    ctx.bezierCurveTo(canvasW*0.65, canvasH*0.44, canvasW*0.62, canvasH*0.28, canvasW*0.65, canvasH*0.15);
    ctx.bezierCurveTo(canvasW*0.67, canvasH*0.08, canvasW*0.69, canvasH*0.05, canvasW*0.70, canvasH*0.05);
    ctx.fillStyle = 'rgba(12, 18, 28, 0.70)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(90, 130, 180, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Southern isle
    ctx.beginPath();
    ctx.moveTo(canvasW*0.78, canvasH*0.68);
    ctx.bezierCurveTo(canvasW*0.92, canvasH*0.66, canvasW*0.98, canvasH*0.76, canvasW*0.96, canvasH*0.88);
    ctx.bezierCurveTo(canvasW*0.94, canvasH*0.96, canvasW*0.84, canvasH*0.98, canvasW*0.76, canvasH*0.94);
    ctx.bezierCurveTo(canvasW*0.68, canvasH*0.90, canvasW*0.67, canvasH*0.78, canvasW*0.72, canvasH*0.70);
    ctx.bezierCurveTo(canvasW*0.74, canvasH*0.67, canvasW*0.77, canvasH*0.68, canvasW*0.78, canvasH*0.68);
    ctx.fillStyle = 'rgba(18, 12, 28, 0.70)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(130, 80, 160, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  function drawPaths() {
    // Draw paths between unique base map positions
    const groups = buildBaseMapGroups();
    const baseMaps = Object.values(groups).map(subs => getBaseMapMeta(subs));
    ctx.strokeStyle = 'rgba(200, 170, 80, 0.10)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 8]);
    for (let i = 0; i < baseMaps.length - 1; i++) {
      const a = baseMaps[i], b = baseMaps[i+1];
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
      if (p.y < -0.02 || p.x < -0.02 || p.x > 1.02) {
        Object.assign(p, newParticle(), { y: 1.02 });
      }
      const glow = Math.sin(time * 1.5 + p.x * 8) * 0.3 + 0.7;
      const alpha = Math.floor(p.alpha * glow * 255).toString(16).padStart(2, '0');
      ctx.beginPath();
      ctx.arc(p.x * canvasW, p.y * canvasH, p.size, 0, Math.PI*2);
      ctx.fillStyle = p.color + alpha;
      ctx.fill();
    });
  }

  /* ===================== REGION BUTTONS (one per base map) ===================== */
  function renderRegionButtons() {
    const container = document.getElementById('map-regions');
    container.innerHTML = '';
    const state  = GameCore.getState();
    const groups = buildBaseMapGroups();

    Object.entries(groups).forEach(([baseId, subRegions]) => {
      const meta = getBaseMapMeta(subRegions);

      // A base map is "discovered" if any of its sub-regions has been discovered
      const isDiscovered = subRegions.some(r =>
        state.discoveredMaps && state.discoveredMaps.includes(r.id)
      );

      const btn = document.createElement('button');
      btn.className = 'map-region-btn';
      btn.dataset.tier  = meta.tier;
      btn.dataset.base  = baseId;
      btn.style.left    = (meta.x * 100) + '%';
      btn.style.top     = (meta.y * 100) + '%';

      btn.innerHTML = `
        <span class="region-icon" style="filter:${isDiscovered ? 'none' : 'grayscale(0.6) brightness(0.6)'}">${meta.emoji}</span>
        <span class="region-label">${meta.name}</span>
        <span class="region-tier-badge">${meta.tier}</span>
      `;

      btn.addEventListener('click', () => showBaseMapPanel(baseId, subRegions));
      container.appendChild(btn);
    });
  }

  /* ===================== MAP PANEL (two-step: tier select → detail) ===================== */
  function showBaseMapPanel(baseId, subRegions) {
    const panel = document.getElementById('map-info-panel');
    const meta  = getBaseMapMeta(subRegions);

    // Set title to base map name (no tier suffix)
    document.getElementById('map-panel-title').innerHTML =
      `${meta.emoji} ${meta.name}`;

    // Show overall level range + base description
    const minLv = Math.min(...subRegions.map(r => r.level_range[0]));
    const maxLv = Math.max(...subRegions.map(r => r.level_range[1]));
    // Use the first sub-region description as base description
    const baseDesc = subRegions[0].description;
    document.getElementById('map-panel-desc').innerHTML =
      `<span class="map-panel-level-badge">🗺️ 等级范围：Lv.${minLv} – ${maxLv}</span>` +
      (subRegions.length === 1 ? `<br><span style="font-size:0.75rem;color:var(--text-muted)">${baseDesc}</span>` : '');

    // Build tier buttons
    const tierBtnsEl  = document.getElementById('map-tier-buttons');
    const tierDetail  = document.getElementById('map-tier-detail');
    tierBtnsEl.innerHTML = '';
    tierDetail.classList.add('hidden');

    subRegions.forEach((region, idx) => {
      const btn = document.createElement('button');
      btn.className = 'map-tier-btn';
      btn.dataset.tier = region.tier;

      const diffLabel = getDiffLabel(region);
      btn.innerHTML = `
        <span class="tier-btn-label">${diffLabel}</span>
        <span class="tier-btn-range">Lv.${region.level_range[0]}-${region.level_range[1]}</span>
      `;

      btn.addEventListener('click', () => {
        // Mark active
        tierBtnsEl.querySelectorAll('.map-tier-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // Update desc to this tier's description
        document.getElementById('map-tier-desc').textContent = region.description;
        showTierDetail(region);
      });
      tierBtnsEl.appendChild(btn);

      // Auto-select first tier
      if (idx === 0) {
        btn.classList.add('active');
        document.getElementById('map-tier-desc').textContent = region.description;
        showTierDetail(region);
      }
    });

    panel.classList.remove('visible');
    requestAnimationFrame(() => panel.classList.add('visible'));
  }

  function showTierDetail(region) {
    const state    = GameCore.getState();
    const monsters = GAME_DATA.getRegionMonsters(region.id);
    const detail   = document.getElementById('map-tier-detail');

    // Monster tags
    const monsterEl = document.getElementById('map-panel-monsters');
    monsterEl.innerHTML = '';
    monsters.slice(0, 8).forEach(m => {
      const attrColor = GAME_DATA.ATTR_COLORS[m.attribute] || '#606060';
      const tag = document.createElement('div');
      tag.className = 'map-monster-tag';
      tag.innerHTML = `
        <span class="attr-dot" style="background:${attrColor}"></span>
        <span>${m.name}</span>
        <span class="monster-lvl">Lv.${m.level}</span>
      `;
      monsterEl.appendChild(tag);
    });
    if (monsters.length > 8) {
      const more = document.createElement('div');
      more.className = 'map-monster-tag';
      more.textContent = `+${monsters.length - 8} 种`;
      monsterEl.appendChild(more);
    }

    // Wire enter button to this specific sub-region
    const btnEnter = document.getElementById('map-panel-enter');
    btnEnter.onclick = () => {
      if (!state.playerClass) {
        GameCore.showToast('请先在「个人」页面选择职业！', 'warning');
        closePanel();
        GameCore.navigateTo('character');
        return;
      }
      if (!state.discoveredMaps.includes(region.id)) {
        state.discoveredMaps.push(region.id);
      }
      closePanel();
      window.BattleSystem && window.BattleSystem.startBattle(region.id);
    };

    detail.classList.remove('hidden');
  }

  function closePanel() {
    document.getElementById('map-info-panel').classList.remove('visible');
  }

  /* ===================== RENDER ===================== */
  function render() {
    renderRegionButtons();
  }

  /* ===================== INIT ===================== */
  function init() {
    initCanvas();
    renderRegionButtons();
    document.getElementById('map-panel-close').addEventListener('click', closePanel);
    canvas.addEventListener('click', () => {
      const panel = document.getElementById('map-info-panel');
      if (panel.classList.contains('visible')) closePanel();
    });
  }

  window.addEventListener('DOMContentLoaded', init);
  window.MapSystem = { render };

})();
