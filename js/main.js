/**
 * main.js — 游戏核心逻辑：状态管理、页面路由、存档系统
 */

(function() {
  'use strict';

  /* ===================== STATE ===================== */
  let state = null;

  function loadState() {
    try {
      const raw = localStorage.getItem('wow_gacha_state');
      if (raw) {
        state = JSON.parse(raw);
        // Merge defaults for missing keys (version compatibility)
        const def = GAME_DATA.DEFAULT_STATE;
        for (const key of Object.keys(def)) {
          if (state[key] === undefined) state[key] = def[key];
        }
      } else {
        state = JSON.parse(JSON.stringify(GAME_DATA.DEFAULT_STATE));
      }
    } catch(e) {
      console.warn('State load error, resetting:', e);
      state = JSON.parse(JSON.stringify(GAME_DATA.DEFAULT_STATE));
    }
  }

  function saveState() {
    try {
      localStorage.setItem('wow_gacha_state', JSON.stringify(state));
      showToast('游戏已存档', 'success');
    } catch(e) {
      showToast('存档失败', 'error');
    }
  }

  function getState() { return state; }
  function setState(patch) {
    Object.assign(state, patch);
  }

  /* ===================== HUD ===================== */
  function updateHUD() {
    document.getElementById('hud-gold').textContent    = formatNum(state.gold);
    document.getElementById('hud-gems').textContent    = formatNum(state.gems);
    document.getElementById('hud-tickets').textContent = formatNum(state.tickets);
  }

  /* ===================== PAGE ROUTING ===================== */
  const PAGE_TITLES = {
    map:        '世界地图',
    gacha:      '扭蛋机',
    inventory:  '背包',
    characters: '角色',
    squad:      '小队',
    codex:      '图鉴',
  };

  let currentPage = 'map';

  function navigateTo(pageId) {
    if (currentPage === pageId) return;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.page === pageId);
    });
    const page = document.getElementById('page-' + pageId);
    if (page) page.classList.add('active');
    currentPage = pageId;
    document.getElementById('hud-page-title').textContent = PAGE_TITLES[pageId] || '';
    // Trigger page-specific refresh
    onPageEnter(pageId);
  }

  function onPageEnter(pageId) {
    switch(pageId) {
      case 'inventory':  window.InventorySystem && window.InventorySystem.render(); break;
      case 'characters': window.CharacterSystem && window.CharacterSystem.render(); break;
      case 'squad':      window.SquadSystem     && window.SquadSystem.render();     break;
      case 'codex':      window.CodexSystem     && window.CodexSystem.render();     break;
      case 'map':        window.MapSystem       && window.MapSystem.render();       break;
      case 'gacha':      window.GachaSystem     && window.GachaSystem.onEnter();    break;
    }
  }

  /* ===================== TOAST ===================== */
  function showToast(msg, type = 'info', duration = 3000) {
    const c = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(() => t.remove(), duration);
  }

  /* ===================== ACHIEVEMENT ===================== */
  function checkAchievements() {
    const { ACHIEVEMENTS } = GAME_DATA;
    for (const ach of ACHIEVEMENTS) {
      if (state.unlockedAchievements.includes(ach.id)) continue;
      if (ach.condition(state)) {
        state.unlockedAchievements.push(ach.id);
        showAchievementPopup(ach.name, ach.desc);
      }
    }
  }

  function showAchievementPopup(name, desc) {
    const popup = document.getElementById('achievement-popup');
    const descEl = document.getElementById('achievement-desc');
    descEl.textContent = desc;
    popup.classList.remove('hidden');
    popup.classList.add('show');
    setTimeout(() => {
      popup.classList.remove('show');
      setTimeout(() => popup.classList.add('hidden'), 400);
    }, 3500);
    showToast('🏆 ' + name, 'legendary', 4000);
  }

  /* ===================== CURRENCY HELPERS ===================== */
  function spendTickets(n) {
    if (state.tickets < n) {
      // Try converting gems (100 gems = 10 tickets)
      const needed = n - state.tickets;
      const gemCost = needed * 100;
      if (state.gems >= gemCost) {
        state.gems -= gemCost;
        state.tickets += needed;
      } else {
        showToast('扭蛋券不足！', 'error');
        return false;
      }
    }
    state.tickets -= n;
    updateHUD();
    return true;
  }

  function addItem(item) {
    // Check if item already in inventory
    const existing = state.inventory.find(i => i.id === item.id);
    if (existing) {
      existing.count = (existing.count || 1) + 1;
    } else {
      if (state.inventory.length >= state.inventoryMax) {
        showToast('背包已满！', 'error');
        return false;
      }
      state.inventory.push({ ...item, count: 1, obtainedAt: Date.now() });
      // Also add to characters if hero
      if (item.type === 'hero') {
        const existChar = state.characters.find(c => c.id === item.id);
        if (!existChar) {
          state.characters.push({
            id: item.id, name: item.name, rarity: item.rarity, class: item.class,
            emoji: item.emoji, stats: { ...item.stats },
            equipment: { head: null, shoulder: null, chest: null, weapon: null, offhand: null, legs: null, boots: null },
            mount: null, pet: null,
          });
        }
      }
    }
    return true;
  }

  /* ===================== NUMBER FORMAT ===================== */
  function formatNum(n) {
    if (n >= 1000000) return (n/1000000).toFixed(1) + 'M';
    if (n >= 1000)    return (n/1000).toFixed(1) + 'K';
    return n.toString();
  }

  /* ===================== LOADING SCREEN ===================== */
  function runLoadingScreen() {
    const bar  = document.getElementById('loading-bar');
    const text = document.getElementById('loading-text');
    const msgs = ['正在连接服务器...', '加载世界数据...', '召唤英雄...', '构建地图...', '准备完毕！'];
    let progress = 0;
    let step = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 22 + 8;
      if (progress > 100) progress = 100;
      bar.style.width = progress + '%';
      if (step < msgs.length) { text.textContent = msgs[step++]; }
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(initGame, 400);
      }
    }, 220);
  }

  function initGame() {
    const loading = document.getElementById('loading-screen');
    const app     = document.getElementById('app');
    loading.style.opacity = '0';
    loading.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
      loading.style.display = 'none';
      app.style.display = 'block';
    }, 500);
    updateHUD();
    navigateTo('map');
  }

  /* ===================== EVENT LISTENERS ===================== */
  function bindEvents() {
    // Nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => navigateTo(btn.dataset.page));
    });
    // Save button
    document.getElementById('btn-save').addEventListener('click', saveState);
    // Auto-save every 60s
    setInterval(() => {
      localStorage.setItem('wow_gacha_state', JSON.stringify(state));
    }, 60000);
  }

  /* ===================== BOOT ===================== */
  window.addEventListener('DOMContentLoaded', () => {
    loadState();
    bindEvents();
    runLoadingScreen();
  });

  /* ===================== PUBLIC API ===================== */
  window.GameCore = {
    getState, setState,
    updateHUD, saveState,
    showToast, showAchievementPopup, checkAchievements,
    navigateTo, spendTickets, addItem, formatNum,
    currentPage: () => currentPage,
  };

})();
