/**
 * inventory.js - 咕咕大冒险 背包系统
 */

(function() {
  'use strict';

  let currentFilter = 'all';

  /* ===================== RENDER ===================== */
  function render() {
    const state = GameCore.getState();
    const inv   = state.inventory;

    document.getElementById('inv-count').textContent =
      `${inv.length}/${state.inventoryMax}`;

    const filtered = currentFilter === 'all'
      ? inv
      : inv.filter(i => i.type === currentFilter);

    const grid = document.getElementById('inv-grid');
    grid.innerHTML = '';

    if (filtered.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'inv-empty';
      empty.textContent = currentFilter === 'all'
        ? '背包是空的，去冒险获取道具吧！'
        : `没有${filterLabel(currentFilter)}`;
      grid.appendChild(empty);
      return;
    }

    filtered.forEach(item => {
      const isEquipped = isItemEquipped(item, state);
      const el = document.createElement('div');
      el.className = `inv-item ${item.type || 'item'} ${isEquipped ? 'equipped' : ''}`;

      el.innerHTML = `
        <span class="inv-item-emoji">${item.emoji || '📦'}</span>
        <div class="inv-item-name">${item.name}</div>
        ${(item.count > 1) ? `<span class="inv-item-count">x${item.count}</span>` : ''}
      `;

      el.addEventListener('click', () => showItemDetail(item, state));
      grid.appendChild(el);
    });
  }

  function filterLabel(f) {
    return { weapon:'武器', armor:'防具', item:'道具' }[f] || f;
  }

  function isItemEquipped(item, state) {
    return Object.values(state.equipment).includes(item.id);
  }

  /* ===================== ITEM DETAIL MODAL ===================== */
  function showItemDetail(item, state) {
    const modal   = document.getElementById('item-modal');
    const content = document.getElementById('item-modal-content');
    const actions = document.getElementById('item-modal-actions');

    const equipped = isItemEquipped(item, state);

    let statsHtml = '';
    const data = item.data;
    if (data && data.base_stats) {
      const statLabels = {
        attack_power:    '攻击力',
        attack_speed:    '攻速',
        critical_strike: '暴击率',
        accuracy:        '命中',
        magic_power:     '魔法攻击',
        evasion:         '回避',
        defense_power:   '防御力',
      };
      statsHtml = '<div class="item-detail-stats">';
      for (const [k, v] of Object.entries(data.base_stats)) {
        if (v !== 0) {
          const sign = v > 0 ? '+' : '';
          statsHtml += `
            <div class="stat-row">
              <span class="stat-label">${statLabels[k] || k}</span>
              <span class="stat-value ${v > 0 ? 'positive' : 'negative'}">${sign}${v}</span>
            </div>`;
        }
      }
      statsHtml += '</div>';
    }

    let typeLabel = { weapon: '武器', armor: '防具', item: '道具' }[item.type] || '物品';
    let subtypeLabel = '';
    if (data) {
      if (data.category) subtypeLabel = data.category;
      else if (data.slot) subtypeLabel = data.slot;
    }

    let levelReq = '';
    if (data && data.required_level) {
      levelReq = `<div class="item-detail-type">需要等级：${data.required_level}</div>`;
    }
    let classReq = '';
    if (data && data.required_class) {
      classReq = `<div class="item-detail-class">职业限制：${data.required_class}</div>`;
    } else if (data && data.class && data.class !== '全职业') {
      classReq = `<div class="item-detail-class">职业限制：${data.class}</div>`;
    }

    content.innerHTML = `
      <div class="item-detail-header">
        <div class="item-detail-emoji">${item.emoji || '📦'}</div>
        <div class="item-detail-info">
          <h3>${item.name}</h3>
          <div class="item-detail-type">${typeLabel}${subtypeLabel ? ' · ' + subtypeLabel : ''}</div>
          ${levelReq}
          ${classReq}
          ${equipped ? '<div style="font-size:0.7rem;color:var(--accent-green);margin-top:4px">✓ 已装备</div>' : ''}
        </div>
      </div>
      ${data && data.description ? `<p class="item-detail-desc">${data.description}</p>` : ''}
      ${statsHtml}
    `;

    // Actions
    actions.innerHTML = '';
    if (item.type === 'weapon' || item.type === 'armor') {
      const canEquip = checkCanEquip(item, state);
      if (equipped) {
        const unequipBtn = document.createElement('button');
        unequipBtn.className = 'btn btn-ghost';
        unequipBtn.textContent = '卸下装备';
        unequipBtn.addEventListener('click', () => { unequipItem(item, state); modal.classList.add('hidden'); });
        actions.appendChild(unequipBtn);
      } else if (canEquip.ok) {
        const equipBtn = document.createElement('button');
        equipBtn.className = 'btn btn-primary';
        equipBtn.textContent = '装备';
        equipBtn.addEventListener('click', () => { equipItem(item, state); modal.classList.add('hidden'); });
        actions.appendChild(equipBtn);
      } else {
        const notice = document.createElement('span');
        notice.style.cssText = 'font-size:0.72rem;color:var(--accent-red)';
        notice.textContent = canEquip.reason;
        actions.appendChild(notice);
      }
    }

    if (item.type === 'item' && (item.count || 1) > 0) {
      const discardBtn = document.createElement('button');
      discardBtn.className = 'btn btn-ghost btn-sm';
      discardBtn.textContent = '丢弃';
      discardBtn.addEventListener('click', () => {
        GameCore.removeItemFromInventory(item.id, 1);
        modal.classList.add('hidden');
        render();
        GameCore.showToast(`丢弃了 ${item.name}`, 'info');
      });
      actions.appendChild(discardBtn);
    }

    modal.classList.remove('hidden');
  }

  function checkCanEquip(item, state) {
    const data = item.data;
    if (!data) return { ok: false, reason: '无法装备' };
    if (!state.playerClass) return { ok: false, reason: '请先选择职业' };

    // Level check
    if (data.required_level && state.level < data.required_level) {
      return { ok: false, reason: `需要等级 ${data.required_level}` };
    }

    // Class check
    if (data.required_class && data.required_class !== state.playerClass) {
      return { ok: false, reason: `需要职业：${data.required_class}` };
    }
    if (data.class && data.class !== '全职业' &&
        !data.class.includes(state.playerClass) &&
        !data.class.startsWith('等级')) {
      const cfg = GAME_DATA.CLASS_CONFIG[state.playerClass];
      if (cfg && !cfg.armor_classes.includes(data.class)) {
        return { ok: false, reason: `职业不匹配` };
      }
    }

    return { ok: true };
  }

  function equipItem(item, state) {
    const data = item.data;
    if (!data) return;
    const slot = item.type === 'weapon' ? '主武器' : (data.slot || '头部');
    state.equipment[slot] = item.id;
    GameCore.showToast(`装备了 ${item.name}`, 'success');
    render();
    if (window.CharacterSystem) window.CharacterSystem.render();
  }

  function unequipItem(item, state) {
    for (const slot of Object.keys(state.equipment)) {
      if (state.equipment[slot] === item.id) {
        state.equipment[slot] = null;
        break;
      }
    }
    GameCore.showToast(`卸下了 ${item.name}`, 'info');
    render();
    if (window.CharacterSystem) window.CharacterSystem.render();
  }

  /* ===================== INIT ===================== */
  function init() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        render();
      });
    });

    document.getElementById('item-modal-close').addEventListener('click', () => {
      document.getElementById('item-modal').classList.add('hidden');
    });
  }

  window.addEventListener('DOMContentLoaded', init);
  window.InventorySystem = { render };

})();
