/**
 * inventory.js — 背包系统：道具展示、过滤、分解、详情弹窗
 */

(function() {
  'use strict';

  const { RARITY, CLASS_CONFIG } = GAME_DATA;
  let currentFilter = 'all';
  let selectedItemId = null;

  /* ===================== RENDER ===================== */
  function render() {
    const state = GameCore.getState();
    const inv   = state.inventory;

    // Update stats
    document.getElementById('inv-count').textContent = inv.length;
    document.getElementById('inv-max').textContent   = state.inventoryMax;

    // Filter
    let items = inv;
    if (currentFilter !== 'all') {
      items = inv.filter(i => i.type === currentFilter);
    }

    // Sort: rarity desc, then name
    const rarOrder = { legendary:0, epic:1, rare:2, common:3 };
    items = [...items].sort((a,b) => {
      if (rarOrder[a.rarity] !== rarOrder[b.rarity]) return rarOrder[a.rarity] - rarOrder[b.rarity];
      return a.name.localeCompare(b.name);
    });

    const grid = document.getElementById('inv-grid');
    grid.innerHTML = '';

    if (items.length === 0) {
      grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:40px 0;font-size:0.85rem;">暂无道具</div>`;
      return;
    }

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = `item-card ${item.rarity}`;
      card.dataset.id = item.id;
      card.innerHTML = `
        <span class="item-card-emoji">${item.emoji}</span>
        <div class="item-card-name">${item.name}</div>
        ${(item.count||1) > 1 ? `<span class="item-count-badge">×${item.count}</span>` : ''}
        <div class="item-card-rarity-bar ${item.rarity}"></div>
      `;
      card.addEventListener('click', () => showItemDetail(item.id));
      grid.appendChild(card);
    });
  }

  /* ===================== ITEM DETAIL ===================== */
  function showItemDetail(itemId) {
    selectedItemId = itemId;
    const state = GameCore.getState();
    const item  = state.inventory.find(i => i.id === itemId);
    if (!item) return;

    const modal   = document.getElementById('item-detail-modal');
    const content = document.getElementById('item-detail-content');
    const btnEquip   = document.getElementById('btn-item-equip');
    const btnDiscard = document.getElementById('btn-item-discard');

    const rarData = RARITY[item.rarity];
    const typeLabels = { hero:'英雄', weapon:'武器', mount:'坐骑', pet:'宠物' };

    // Class requirement
    let classReqHtml = '';
    if (item.class_req) {
      const classNames = item.class_req.map(c => CLASS_CONFIG[c]?.label || c).join('、');
      classReqHtml = `<div class="item-detail-req">职业限制：<span style="color:var(--text-gold)">${classNames}</span></div>`;
    }
    if (item.class) {
      const cls = CLASS_CONFIG[item.class];
      classReqHtml = `<div class="item-detail-req">职业：<span style="color:${cls?.color || '#fff'}">${cls?.icon || ''} ${cls?.label || item.class}</span></div>`;
    }

    // Stats
    const statLabels = { hp:'生命值', atk:'攻击力', def:'防御力', spd:'速度', heal:'治疗量' };
    let statsHtml = '';
    if (item.stats) {
      statsHtml = '<div class="item-detail-stats">';
      for (const [k,v] of Object.entries(item.stats)) {
        if (v) statsHtml += `<div class="stat-row"><span class="stat-label">${statLabels[k]||k}</span><span class="stat-value">${v}</span></div>`;
      }
      statsHtml += '</div>';
    }

    content.innerHTML = `
      <div class="item-detail-header">
        <div class="item-detail-emoji">${item.emoji}</div>
        <div class="item-detail-info">
          <h3 style="color:${rarData.color}">${item.name}</h3>
          <div class="item-detail-rarity" style="color:${rarData.color}">${rarData.symbol} ${rarData.label}</div>
          <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px">${typeLabels[item.type]||item.type}</div>
        </div>
      </div>
      <p class="item-detail-desc">"${item.description}"</p>
      ${classReqHtml}
      ${statsHtml}
      ${(item.count||1)>1 ? `<div style="font-size:0.78rem;color:var(--text-muted);margin-top:8px">持有数量：×${item.count}</div>` : ''}
    `;

    // Equip button logic
    if (item.type === 'hero') {
      btnEquip.textContent = '查看角色';
      btnEquip.style.display = 'block';
    } else if (item.type === 'weapon' || item.type === 'mount' || item.type === 'pet') {
      btnEquip.textContent = '装备';
      btnEquip.style.display = 'block';
    } else {
      btnEquip.style.display = 'none';
    }

    modal.classList.remove('hidden');
  }

  /* ===================== EQUIP FROM INVENTORY ===================== */
  function handleEquip() {
    const state = GameCore.getState();
    const item  = state.inventory.find(i => i.id === selectedItemId);
    if (!item) return;

    if (item.type === 'hero') {
      document.getElementById('item-detail-modal').classList.add('hidden');
      GameCore.navigateTo('characters');
      return;
    }

    // For weapon/mount/pet, prompt to pick a character
    if (state.characters.length === 0) {
      GameCore.showToast('请先获得英雄角色！', 'warning');
      return;
    }

    // Auto-equip to first compatible character
    if (item.type === 'weapon') {
      const char = state.characters.find(c => {
        const cls = GAME_DATA.CLASS_CONFIG[c.class];
        return cls && item.class_req && item.class_req.includes(c.class);
      });
      if (!char) { GameCore.showToast('没有适合的职业角色！', 'warning'); return; }
      char.equipment.weapon = item.id;
      GameCore.showToast(`${item.name} 已装备给 ${char.name}`, 'success');
    } else if (item.type === 'mount') {
      const char = state.characters[0];
      char.mount = item.id;
      GameCore.showToast(`${item.name} 已装备给 ${char.name}`, 'success');
    } else if (item.type === 'pet') {
      const char = state.characters[0];
      char.pet = item.id;
      GameCore.showToast(`${item.name} 已装备给 ${char.name}`, 'success');
    }

    document.getElementById('item-detail-modal').classList.add('hidden');
    GameCore.checkAchievements();
  }

  /* ===================== DISCARD ===================== */
  function handleDiscard() {
    const state = GameCore.getState();
    const idx   = state.inventory.findIndex(i => i.id === selectedItemId);
    if (idx === -1) return;
    const item = state.inventory[idx];

    // Give gold
    const goldMap = { legendary:5000, epic:1000, rare:200, common:20 };
    const earned  = goldMap[item.rarity] || 20;

    if ((item.count||1) > 1) {
      item.count--;
    } else {
      state.inventory.splice(idx, 1);
    }
    state.gold += earned;
    GameCore.updateHUD();
    document.getElementById('item-detail-modal').classList.add('hidden');
    GameCore.showToast(`分解获得 ${earned} 金币`, 'success');
    render();
  }

  /* ===================== TABS ===================== */
  function bindTabs() {
    document.querySelectorAll('.inv-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.inv-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentFilter = tab.dataset.filter;
        render();
      });
    });
  }

  /* ===================== INIT ===================== */
  function init() {
    bindTabs();
    document.getElementById('item-modal-close').addEventListener('click', () => {
      document.getElementById('item-detail-modal').classList.add('hidden');
    });
    document.getElementById('btn-item-equip').addEventListener('click', handleEquip);
    document.getElementById('btn-item-discard').addEventListener('click', handleDiscard);
  }

  window.addEventListener('DOMContentLoaded', init);

  window.InventorySystem = { render };

})();
