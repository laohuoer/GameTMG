/**
 * character.js - 咕咕大冒险 角色系统：职业选择、属性展示、装备槽
 */

(function() {
  'use strict';

  const SLOT_ICONS = {
    '主武器': '⚔️', '头部': '⛑️', '上衣': '👕', '下裤': '👖',
    '鞋子': '👟', '副武器': '🛡️', '脸部': '🎭', '项链': '📿',
    '手套': '🧤', '背部': '🎒', '翅膀': '🪶', '尾巴': '🦎',
  };

  /* ===================== RENDER ===================== */
  function render() {
    const state = GameCore.getState();
    const cfg   = state.playerClass ? GAME_DATA.CLASS_CONFIG[state.playerClass] : null;

    // Avatar
    document.getElementById('char-emoji').textContent =
      cfg ? cfg.emoji : '❓';
    document.getElementById('char-name-display').textContent = state.playerName;
    document.getElementById('char-class-badge').textContent =
      cfg ? cfg.label : '未选择职业';
    document.getElementById('char-level').textContent = state.level;

    // EXP bar
    const expNeeded = GAME_DATA.calcExpForLevel(state.level + 1);
    const expPct    = state.level >= 80 ? 100 : Math.floor((state.exp / expNeeded) * 100);
    document.getElementById('char-exp-bar').style.width = expPct + '%';
    document.getElementById('char-exp-val').textContent  = GameCore.formatNum(state.exp);
    document.getElementById('char-exp-next').textContent = GameCore.formatNum(expNeeded);

    // Stats
    renderStats(state, cfg);

    // Equipment
    renderEquipment(state);

    // Class select panel
    const classPanel = document.getElementById('class-select-panel');
    if (!state.playerClass) {
      classPanel.classList.remove('hidden');
      renderClassOptions();
    } else {
      classPanel.classList.add('hidden');
    }
  }

  function renderStats(state, cfg) {
    const grid = document.getElementById('char-stats-grid');
    const ps   = GameCore.calcPlayerStats();

    const statDefs = [
      { label: '❤️ HP',   value: ps.hp },
      { label: '⚔️ 攻击', value: ps.atk },
      { label: '🛡️ 防御', value: ps.def },
      { label: '💨 速度', value: ps.spd },
      { label: '💥 暴击', value: ps.crit + '%' },
      { label: '🎯 命中', value: ps.acc + '%' },
    ];

    grid.innerHTML = '';
    statDefs.forEach(s => {
      const el = document.createElement('div');
      el.className = 'stat-item';
      el.innerHTML = `
        <span class="stat-item-label">${s.label}</span>
        <span class="stat-item-value">${s.value}</span>
      `;
      grid.appendChild(el);
    });
  }

  function renderEquipment(state) {
    const grid  = document.getElementById('char-equip-grid');
    const slots = Object.keys(state.equipment);
    grid.innerHTML = '';

    slots.forEach(slot => {
      const itemId   = state.equipment[slot];
      const itemInv  = itemId ? state.inventory.find(i => i.id === itemId) : null;
      const icon     = SLOT_ICONS[slot] || '📦';

      const el = document.createElement('div');
      el.className = `equip-slot ${itemInv ? 'equipped' : ''}`;
      el.innerHTML = `
        <span class="equip-slot-icon">${icon}</span>
        <span class="equip-slot-label">${slot}</span>
        <span class="equip-slot-name ${itemInv ? '' : 'equip-slot-empty'}">
          ${itemInv ? itemInv.name : '空'}
        </span>
        ${itemInv ? '<span style="font-size:0.62rem;color:var(--text-muted)">点击卸下</span>' : ''}
      `;

      if (itemInv) {
        el.addEventListener('click', () => {
          state.equipment[slot] = null;
          render();
          GameCore.showToast(`卸下了 ${itemInv.name}`, 'info');
        });
      }

      grid.appendChild(el);
    });
  }

  /* ===================== CLASS SELECTION ===================== */
  function renderClassOptions() {
    const container = document.getElementById('class-options');
    container.innerHTML = '';

    const classOrder = ['剑士','骑士','小丑','祭司','法师','猎人','铁匠','饕客'];
    classOrder.forEach(className => {
      const cfg = GAME_DATA.CLASS_CONFIG[className];
      if (!cfg) return;

      const card = document.createElement('div');
      card.className = 'class-option-card';
      card.innerHTML = `
        <div class="class-option-icon">${cfg.emoji}</div>
        <div class="class-option-name" style="color:${cfg.color}">${cfg.label}</div>
        <div class="class-option-desc">${cfg.desc}</div>
      `;
      card.addEventListener('click', () => selectClass(className, cfg));
      container.appendChild(card);
    });
  }

  function selectClass(className, cfg) {
    GameCore.showConfirm(
      `选择 ${cfg.label}`,
      `确定选择「${cfg.label}」作为你的职业吗？职业一旦选择无法更改。`,
      () => {
        const state = GameCore.getState();
        state.playerClass = className;
        GameCore.showToast(`成为了 ${cfg.label}！`, 'success', 4000);
        render();
      }
    );
  }

  /* ===================== LEVEL UP CALLBACK ===================== */
  function onLevelUp() {
    render();
  }

  /* ===================== POWER CALC ===================== */
  function calcPower(state) {
    const ps = GameCore.calcPlayerStats();
    return ps.hp + ps.atk * 3 + ps.def * 2;
  }

  /* ===================== INIT ===================== */
  window.addEventListener('DOMContentLoaded', () => {});
  window.CharacterSystem = { render, onLevelUp, calcPower };

})();
