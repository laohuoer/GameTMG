/**
 * codex.js — 图鉴系统：收集进度、已收集展示、未收集剪影
 */

(function() {
  'use strict';

  const { RARITY, HEROES, WEAPONS, MOUNTS, PETS } = GAME_DATA;
  let currentType = 'hero';

  const TYPE_DATA = {
    hero:   { items: HEROES,  label: '英雄' },
    weapon: { items: WEAPONS, label: '装备' },
    mount:  { items: MOUNTS,  label: '坐骑' },
    pet:    { items: PETS,    label: '宠物' },
  };

  /* ===================== RENDER ===================== */
  function render() {
    const state   = GameCore.getState();
    const inv     = state.inventory;
    const ownedIds = new Set(inv.map(i => i.id));

    const allItems = TYPE_DATA[currentType].items;
    const grid     = document.getElementById('codex-grid');
    grid.innerHTML = '';

    // Sort: obtained first, then by rarity
    const rarOrder = { legendary:0, epic:1, rare:2, common:3 };
    const sorted = [...allItems].sort((a, b) => {
      const aOwned = ownedIds.has(a.id) ? 0 : 1;
      const bOwned = ownedIds.has(b.id) ? 0 : 1;
      if (aOwned !== bOwned) return aOwned - bOwned;
      return (rarOrder[a.rarity]||3) - (rarOrder[b.rarity]||3);
    });

    // Update progress
    const owned = sorted.filter(i => ownedIds.has(i.id)).length;
    const total = sorted.length;
    document.getElementById('codex-progress-text').textContent = `${owned} / ${total}`;
    const pct = total > 0 ? (owned / total * 100) : 0;
    document.getElementById('codex-progress-bar').style.width = pct + '%';

    sorted.forEach(item => {
      const isOwned = ownedIds.has(item.id);
      const rarData = RARITY[item.rarity] || RARITY.common;
      const obtainedItem = inv.find(i => i.id === item.id);

      const card = document.createElement('div');
      card.className = `codex-card ${item.rarity} ${isOwned ? 'obtained' : 'not-obtained'}`;

      if (isOwned) {
        card.innerHTML = `
          <span class="codex-card-emoji">${item.emoji}</span>
          <div class="codex-card-name" style="color:${rarData.color}">${item.name}</div>
          <div style="font-size:0.58rem;color:var(--text-muted);margin-top:2px">${rarData.symbol}</div>
        `;
        card.addEventListener('click', () => showCodexDetail(item, obtainedItem));
      } else {
        card.innerHTML = `
          <span class="codex-card-emoji" style="filter:grayscale(1) brightness(0.15)">❓</span>
          <div class="codex-card-name">???</div>
          <div style="font-size:0.58rem;color:#333;margin-top:2px">${rarData.symbol}</div>
        `;
      }

      grid.appendChild(card);
    });
  }

  /* ===================== CODEX DETAIL ===================== */
  function showCodexDetail(item, ownedItem) {
    const rarData   = RARITY[item.rarity] || RARITY.common;
    const typeLabel = { hero:'英雄', weapon:'武器', mount:'坐骑', pet:'宠物' }[item.type] || item.type;
    const obtainDate = ownedItem?.obtainedAt ? new Date(ownedItem.obtainedAt).toLocaleDateString('zh-CN') : '未知';

    // Reuse item detail modal
    const modal   = document.getElementById('item-detail-modal');
    const content = document.getElementById('item-detail-content');
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
          <div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px">${typeLabel}</div>
        </div>
      </div>
      <p class="item-detail-desc">"${item.description}"</p>
      ${statsHtml}
      <div style="font-size:0.74rem;color:var(--text-muted);margin-top:8px">🗓 获得日期：${obtainDate}</div>
    `;

    document.getElementById('btn-item-equip').style.display   = 'none';
    document.getElementById('btn-item-discard').style.display = 'none';
    modal.classList.remove('hidden');
  }

  /* ===================== TABS ===================== */
  function bindTabs() {
    document.querySelectorAll('.codex-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.codex-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentType = tab.dataset.type;
        render();
      });
    });
  }

  /* ===================== INIT ===================== */
  function init() {
    bindTabs();
  }

  window.addEventListener('DOMContentLoaded', init);

  window.CodexSystem = { render };

})();
