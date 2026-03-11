/**
 * gacha.js — 扭蛋系统：抽卡逻辑、保底机制、动画演出
 */

(function() {
  'use strict';

  const { RARITY, GACHA_POOLS, MAP_REGIONS, ALL_ITEMS } = GAME_DATA;

  /* ===================== PROBABILITY ===================== */
  function calcRarityProbs(pityCount, softPityStart, hardPity) {
    if (pityCount >= hardPity - 1) {
      return { legendary: 1, epic: 0, rare: 0, common: 0 };
    }
    let legendaryProb = RARITY.legendary.prob;
    if (pityCount >= softPityStart) {
      // Soft pity: linear ramp from 1% → 100% over (hardPity - softPityStart) pulls
      const ramp = (pityCount - softPityStart + 1) / (hardPity - softPityStart);
      legendaryProb = RARITY.legendary.prob + (1 - RARITY.legendary.prob) * ramp;
      legendaryProb = Math.min(legendaryProb, 1);
    }
    const remaining = 1 - legendaryProb;
    const epicProb  = remaining * (RARITY.epic.prob  / (RARITY.epic.prob + RARITY.rare.prob + RARITY.common.prob));
    const rareProb  = remaining * (RARITY.rare.prob  / (RARITY.epic.prob + RARITY.rare.prob + RARITY.common.prob));
    const comProb   = remaining * (RARITY.common.prob / (RARITY.epic.prob + RARITY.rare.prob + RARITY.common.prob));
    return { legendary: legendaryProb, epic: epicProb, rare: rareProb, common: comProb };
  }

  function rollRarity(probs) {
    const r = Math.random();
    let acc = 0;
    if (r < (acc += probs.legendary)) return 'legendary';
    if (r < (acc += probs.epic))      return 'epic';
    if (r < (acc += probs.rare))      return 'rare';
    return 'common';
  }

  function pickItem(rarity, pool) {
    const candidates = pool.filter(i => i.rarity === rarity);
    if (!candidates.length) {
      // Fallback to any
      const all = pool.filter(i => i.rarity !== 'legendary');
      return all[Math.floor(Math.random() * all.length)] || pool[0];
    }
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  /* ===================== PULL LOGIC ===================== */
  function getActivePool() {
    const state = GameCore.getState();
    const poolId = state.currentPool || 'standard';
    if (poolId === 'region' && state.currentRegion) {
      const region = MAP_REGIONS.find(r => r.id === state.currentRegion);
      if (region) {
        const poolItemIds = region.poolItems;
        return ALL_ITEMS.filter(i => poolItemIds.includes(i.id));
      }
    }
    if (poolId === 'limited') return GACHA_POOLS.limited.items;
    return GACHA_POOLS.standard.items;
  }

  function doPull(n) {
    const state = GameCore.getState();
    if (!GameCore.spendTickets(n)) return null;

    const results = [];
    const pool = getActivePool();

    for (let i = 0; i < n; i++) {
      const probs = calcRarityProbs(state.pityCount, state.softPityStart, state.hardPity);
      const rarity = rollRarity(probs);
      const item   = pickItem(rarity, pool);

      // Advance pity
      if (rarity === 'legendary') {
        state.pityCount = 0;
      } else {
        state.pityCount++;
      }

      state.totalPulls++;
      GameCore.addItem(item);
      results.push(item);
    }

    // Mark region as explored
    if (state.currentRegion && !state.exploredRegions.includes(state.currentRegion)) {
      state.exploredRegions.push(state.currentRegion);
    }

    GameCore.updateHUD();
    updatePityUI();
    GameCore.checkAchievements();
    return results;
  }

  /* ===================== PITY UI ===================== */
  function updatePityUI() {
    const state = GameCore.getState();
    const pct = (state.pityCount / state.hardPity) * 100;
    const bar = document.getElementById('pity-bar');
    document.getElementById('pity-count').textContent = state.pityCount;
    bar.style.width = pct + '%';
    bar.classList.remove('soft-pity', 'near-pity');
    if (state.pityCount >= state.hardPity - 10) bar.classList.add('near-pity');
    else if (state.pityCount >= state.softPityStart) bar.classList.add('soft-pity');
  }

  /* ===================== ANIMATIONS ===================== */
  function playOrbSpin(cb) {
    const orb = document.getElementById('machine-orb');
    orb.classList.add('spinning');
    setTimeout(() => {
      orb.classList.remove('spinning');
      cb && cb();
    }, 1000);
  }

  function spawnParticles(rarity, x, y) {
    const colors = {
      legendary: ['#FF8000','#FFD700','#FF4400'],
      epic:      ['#A335EE','#CC88FF','#7700CC'],
      rare:      ['#0070DD','#55AAFF','#0044AA'],
      common:    ['#888','#aaa','#666'],
    };
    const cls = colors[rarity] || colors.common;
    for (let i = 0; i < (rarity === 'legendary' ? 20 : rarity === 'epic' ? 12 : 6); i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = (x + (Math.random()-0.5)*80) + 'px';
      p.style.top  = (y + (Math.random()-0.5)*80) + 'px';
      p.style.background = cls[Math.floor(Math.random()*cls.length)];
      p.style.width  = (Math.random()*6+3) + 'px';
      p.style.height = p.style.width;
      p.style.animationDuration = (Math.random()*0.6+0.6) + 's';
      p.style.animationDelay    = (Math.random()*0.3) + 's';
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 1500);
    }
  }

  function buildResultCard(item, delay) {
    const d = document.createElement('div');
    d.className = `result-card ${item.rarity}`;
    d.style.animationDelay = delay + 'ms';
    d.innerHTML = `
      <div class="result-card-shine"></div>
      <span class="result-card-emoji">${item.emoji}</span>
      <div class="result-card-name">${item.name}</div>
      <div class="result-card-rarity ${item.rarity}">${RARITY[item.rarity].symbol} ${RARITY[item.rarity].label}</div>
    `;
    return d;
  }

  function showResults(results) {
    const overlay    = document.getElementById('gacha-result-overlay');
    const container  = document.getElementById('result-container');
    const backdrop   = document.getElementById('result-backdrop');
    container.innerHTML = '';

    overlay.classList.remove('hidden');

    const hasLegendary = results.some(r => r.rarity === 'legendary');
    const hasEpic      = results.some(r => r.rarity === 'epic');

    // Set backdrop color
    if (hasLegendary) {
      backdrop.style.background = 'rgba(20,8,0,0.94)';
    } else if (hasEpic) {
      backdrop.style.background = 'rgba(10,3,20,0.94)';
    } else {
      backdrop.style.background = 'rgba(5,3,15,0.92)';
    }

    results.forEach((item, idx) => {
      const delay = idx * 80;
      const card  = buildResultCard(item, delay);
      container.appendChild(card);

      if (item.rarity === 'legendary' || item.rarity === 'epic') {
        setTimeout(() => {
          const rect = card.getBoundingClientRect();
          spawnParticles(item.rarity, rect.left + rect.width/2, rect.top + rect.height/2);
        }, delay + 400);
      }
    });

    if (hasLegendary) {
      const orb = document.getElementById('machine-orb');
      orb.classList.add('legendary-glow');
      setTimeout(() => orb.classList.remove('legendary-glow'), 2000);
    }
  }

  /* ===================== POOL SWITCHER ===================== */
  function bindPoolTabs() {
    document.querySelectorAll('.pool-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.pool-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        GameCore.getState().currentPool = tab.dataset.pool;
      });
    });
  }

  /* ===================== PULL BUTTONS ===================== */
  function bindPullButtons() {
    const btnSingle = document.getElementById('btn-single-gacha');
    const btnTen    = document.getElementById('btn-ten-gacha');
    const btnClose  = document.getElementById('btn-result-close');

    btnSingle.addEventListener('click', () => {
      if (btnSingle.disabled) return;
      btnSingle.disabled = true; btnTen.disabled = true;
      playOrbSpin(() => {
        const results = doPull(1);
        btnSingle.disabled = false; btnTen.disabled = false;
        if (results) showResults(results);
      });
    });

    btnTen.addEventListener('click', () => {
      if (btnTen.disabled) return;
      btnSingle.disabled = true; btnTen.disabled = true;
      playOrbSpin(() => {
        const results = doPull(10);
        btnSingle.disabled = false; btnTen.disabled = false;
        if (results) showResults(results);
      });
    });

    btnClose.addEventListener('click', () => {
      document.getElementById('gacha-result-overlay').classList.add('hidden');
    });

    // Tap backdrop to close
    document.getElementById('result-backdrop').addEventListener('click', () => {
      document.getElementById('gacha-result-overlay').classList.add('hidden');
    });
  }

  /* ===================== INIT ===================== */
  function onEnter() {
    updatePityUI();
  }

  function init() {
    bindPoolTabs();
    bindPullButtons();
    updatePityUI();
  }

  window.addEventListener('DOMContentLoaded', init);

  window.GachaSystem = {
    doPull, onEnter, updatePityUI,
  };

})();
