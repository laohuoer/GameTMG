/**
 * main.js - 咕咕大冒险 核心逻辑：状态管理、页面路由、存档系统
 */

(function() {
  'use strict';

  /* ===================== STATE ===================== */
  let state = null;
  const STORAGE_KEY = 'gugu_adventure_state';

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        state = JSON.parse(raw);
        // Merge defaults for new keys
        const def = GAME_DATA.DEFAULT_STATE;
        for (const key of Object.keys(def)) {
          if (state[key] === undefined) state[key] = JSON.parse(JSON.stringify(def[key]));
        }
        // Ensure equipment keys are all present
        if (!state.equipment) state.equipment = {};
        const eqDef = GAME_DATA.DEFAULT_STATE.equipment;
        for (const slot of Object.keys(eqDef)) {
          if (state.equipment[slot] === undefined) state.equipment[slot] = null;
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
      state.lastSave = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      showToast('游戏已存档 💾', 'success');
    } catch(e) {
      showToast('存档失败！', 'error');
    }
  }

  function resetState() {
    localStorage.removeItem(STORAGE_KEY);
    state = JSON.parse(JSON.stringify(GAME_DATA.DEFAULT_STATE));
    updateHUD();
    navigateTo('map');
    showToast('游戏已重置', 'info');
  }

  function getState() { return state; }
  function setState(patch) { Object.assign(state, patch); }

  /* ===================== HUD ===================== */
  function updateHUD() {
    if (!state) return;
    document.getElementById('hud-gold').textContent  = formatNum(state.gold);
    document.getElementById('hud-level').textContent = state.level;
    document.getElementById('hud-exp').textContent   = formatNum(state.exp);
  }

  /* ===================== PAGE ROUTING ===================== */
  const PAGE_TITLES = {
    map:        '世界地图',
    battle:     '战斗',
    inventory:  '背包',
    character:  '个人信息',
    codex:      '图鉴',
    settings:   '设置',
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
    onPageEnter(pageId);
  }

  function onPageEnter(pageId) {
    switch(pageId) {
      case 'map':       window.MapSystem       && window.MapSystem.render();       break;
      case 'inventory': window.InventorySystem && window.InventorySystem.render(); break;
      case 'character': window.CharacterSystem && window.CharacterSystem.render(); break;
      case 'codex':     window.CodexSystem     && window.CodexSystem.render();     break;
      case 'settings':  window.SettingsSystem  && window.SettingsSystem.render();  break;
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

  /* ===================== INVENTORY HELPERS ===================== */
  function addItemToInventory(entry) {
    // entry: { id, name, type, emoji, data, count:1 }
    if (!entry.type) entry.type = 'item';
    const existing = state.inventory.find(i => i.id === entry.id);
    if (existing) {
      existing.count = (existing.count || 1) + (entry.count || 1);
      return true;
    }
    if (state.inventory.length >= state.inventoryMax) {
      showToast('背包已满！', 'warning');
      return false;
    }
    state.inventory.push({ ...entry, count: entry.count || 1, obtainedAt: Date.now() });
    return true;
  }

  function removeItemFromInventory(id, count = 1) {
    const idx = state.inventory.findIndex(i => i.id === id);
    if (idx === -1) return false;
    if ((state.inventory[idx].count || 1) <= count) {
      state.inventory.splice(idx, 1);
    } else {
      state.inventory[idx].count -= count;
    }
    return true;
  }

  /* ===================== LEVELING ===================== */
  function addExp(amount) {
    state.exp += amount;
    let leveled = false;
    while (state.level < 80) {
      const needed = GAME_DATA.calcExpForLevel(state.level + 1);
      if (state.exp >= needed) {
        state.exp -= needed;
        state.level++;
        leveled = true;
        showToast(`🎉 升级！当前等级 Lv.${state.level}`, 'success', 4000);
      } else break;
    }
    updateHUD();
    if (leveled && window.CharacterSystem) {
      window.CharacterSystem.onLevelUp();
    }
    return leveled;
  }

  function addGold(amount) {
    state.gold += amount;
    updateHUD();
  }

  /* ===================== CONFIRM DIALOG ===================== */
  let confirmCallback = null;
  function showConfirm(title, msg, onOk) {
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-msg').textContent = msg;
    document.getElementById('confirm-modal').classList.remove('hidden');
    confirmCallback = onOk;
  }

  /* ===================== NUMBER FORMAT ===================== */
  function formatNum(n) {
    if (n >= 1000000) return (n/1000000).toFixed(1) + 'M';
    if (n >= 10000)   return (n/1000).toFixed(1) + 'K';
    return Math.floor(n).toString();
  }

  /* ===================== CALC PLAYER BATTLE STATS ===================== */
  function calcPlayerStats() {
    const cfg = GAME_DATA.CLASS_CONFIG[state.playerClass] || GAME_DATA.CLASS_CONFIG['剑士'];
    const base = cfg.base_stats;
    // Scale stats with level — aligned to monster JSON HP values
    // Monster Lv1 HP ~30-100, Lv35 ~2000-2700, Lv80 ~10000-17000
    // Player HP should be in the same ballpark so fights last 3-8 turns
    const lv = state.level;
    let stats = {
      hp:    Math.floor((base.hp  * 3) * (1 + (lv - 1) * 0.15)),
      atk:   Math.floor((base.atk * 3) * (1 + (lv - 1) * 0.14)),
      def:   Math.floor((base.def * 2) * (1 + (lv - 1) * 0.12)),
      spd:   base.spd,
      crit:  5,
      acc:   90,
      eva:   5,
    };
    // Add equipment bonuses (from JSON base_stats, used directly)
    for (const slot of Object.keys(state.equipment)) {
      const itemId = state.equipment[slot];
      if (!itemId) continue;
      const weapon = GAME_DATA.getWeaponById(itemId);
      if (weapon) {
        const bs = weapon.base_stats || {};
        stats.atk  += (bs.attack_power   || 0);
        stats.spd  += (bs.attack_speed   || 0);
        stats.crit += (bs.critical_strike || 0);
        stats.acc  += (bs.accuracy       || 0);
        stats.eva  += (bs.evasion        || 0);
      }
      const armor = GAME_DATA.getArmorById(itemId);
      if (armor) {
        const bs = armor.base_stats || {};
        stats.def  += (bs.defense_power  || 0);
        stats.spd  += (bs.attack_speed   || 0);
        stats.eva  += (bs.evasion        || 0);
        stats.acc  += (bs.accuracy       || 0);
      }
    }
    return stats;
  }

  /* ===================== LOADING SCREEN ===================== */
  function runLoadingScreen() {
    const bar  = document.getElementById('loading-bar');
    const text = document.getElementById('loading-text');
    const msgs = ['正在加载世界数据...', '唤醒怪物们...', '整理背包...', '绘制地图...', '准备出发！'];
    let progress = 0, step = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 24 + 8;
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
      app.classList.add('visible');
    }, 500);
    updateHUD();
    navigateTo('map');
  }

  /* ===================== EVENTS ===================== */
  function bindEvents() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => navigateTo(btn.dataset.page));
    });
    // Confirm modal
    document.getElementById('confirm-cancel').addEventListener('click', () => {
      document.getElementById('confirm-modal').classList.add('hidden');
      confirmCallback = null;
    });
    document.getElementById('confirm-ok').addEventListener('click', () => {
      document.getElementById('confirm-modal').classList.add('hidden');
      if (confirmCallback) { confirmCallback(); confirmCallback = null; }
    });
    // Auto-save every 90s
    setInterval(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(e) {}
    }, 90000);
  }

  /* ===================== BOOT ===================== */
  window.addEventListener('DOMContentLoaded', () => {
    loadState();
    bindEvents();
    runLoadingScreen();
  });

  /* ===================== PUBLIC API ===================== */
  window.GameCore = {
    getState, setState, resetState,
    updateHUD, saveState,
    showToast, navigateTo,
    addItemToInventory, removeItemFromInventory,
    addExp, addGold,
    calcPlayerStats, formatNum,
    showConfirm,
    currentPage: () => currentPage,
  };

})();
