/**
 * character.js — 角色系统：角色列表、装备管理、属性面板
 */

(function() {
  'use strict';

  const { RARITY, CLASS_CONFIG } = GAME_DATA;
  let selectedCharId = null;

  const SLOT_LABELS = {
    head:    '头盔',
    shoulder:'肩甲',
    chest:   '胸甲',
    weapon:  '武器',
    offhand: '副手',
    legs:    '腿甲',
    boots:   '靴子',
  };

  /* ===================== RENDER CHARACTER LIST ===================== */
  function render() {
    const state = GameCore.getState();
    const list  = document.getElementById('char-list');
    list.innerHTML = '';

    if (state.characters.length === 0) {
      list.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:40px 0;font-size:0.85rem;">还没有英雄，快去扭蛋吧！</div>`;
      return;
    }

    state.characters.forEach(char => {
      const cls    = CLASS_CONFIG[char.class] || {};
      const rarData = RARITY[char.rarity] || RARITY.common;
      const power  = calcPower(char);

      const card = document.createElement('div');
      card.className = `char-card ${char.rarity}`;
      card.innerHTML = `
        <div class="char-portrait-thumb">${char.emoji}</div>
        <div class="char-card-name">${char.name}</div>
        <div class="char-card-class" style="color:${cls.color||'#aaa'}">${cls.icon||''} ${cls.label||char.class}</div>
        <div class="char-card-power">⚡ ${power}</div>
        <div class="item-card-rarity-bar ${char.rarity}"></div>
      `;
      card.addEventListener('click', () => showCharDetail(char.id));
      list.appendChild(card);
    });
  }

  /* ===================== POWER CALC ===================== */
  function calcPower(char) {
    const s = char.stats;
    let base = (s.hp||0)/10 + (s.atk||0) + (s.def||0) + (s.spd||0)*2 + (s.heal||0)*0.5;
    // Add equipped item stats
    const state = GameCore.getState();
    const inv = state.inventory;
    for (const slotId of Object.values(char.equipment || {})) {
      if (!slotId) continue;
      const item = inv.find(i => i.id === slotId);
      if (item && item.stats) {
        base += (item.stats.atk||0) + (item.stats.def||0);
      }
    }
    return Math.round(base);
  }

  /* ===================== CHARACTER DETAIL MODAL ===================== */
  function showCharDetail(charId) {
    selectedCharId = charId;
    const state = GameCore.getState();
    const char  = state.characters.find(c => c.id === charId);
    if (!char) return;

    const cls    = CLASS_CONFIG[char.class] || {};
    const rarData = RARITY[char.rarity] || RARITY.common;

    document.getElementById('modal-char-portrait').textContent = char.emoji;
    document.getElementById('modal-char-name').textContent     = char.name;
    const badge = document.getElementById('modal-char-class');
    badge.textContent = `${cls.icon||''} ${cls.label||char.class}`;
    badge.style.color = cls.color || '#aaa';
    badge.style.borderColor = cls.color || '#aaa';

    renderEquipSlots(char);
    renderMountPetSlots(char);
    renderCharStats(char);

    document.getElementById('char-detail-modal').classList.remove('hidden');
  }

  function renderEquipSlots(char) {
    const slotsEl = document.getElementById('equip-slots');
    const state   = GameCore.getState();
    const inv     = state.inventory;
    slotsEl.innerHTML = '';

    for (const [slotId, label] of Object.entries(SLOT_LABELS)) {
      const equippedId = char.equipment[slotId];
      const item       = equippedId ? inv.find(i => i.id === equippedId) : null;
      const slot = document.createElement('div');
      slot.className = `equip-slot ${item ? 'filled' : ''}`;
      slot.innerHTML = `
        <div class="equip-slot-label">${label}</div>
        <div class="equip-slot-item">${item ? item.emoji : '—'}</div>
        <div class="equip-slot-name">${item ? item.name : '空'}</div>
      `;
      slot.addEventListener('click', () => openEquipPicker(char.id, slotId));
      slotsEl.appendChild(slot);
    }
  }

  function renderMountPetSlots(char) {
    const el    = document.getElementById('mount-pet-slots');
    const state = GameCore.getState();
    const inv   = state.inventory;
    el.innerHTML = '';

    const mountItem = char.mount ? inv.find(i => i.id === char.mount) : null;
    const petItem   = char.pet   ? inv.find(i => i.id === char.pet)   : null;

    const mSlot = document.createElement('div');
    mSlot.className = 'mount-pet-slot';
    mSlot.innerHTML = `
      <div class="equip-slot-label">🐴 坐骑</div>
      <div class="equip-slot-item">${mountItem ? mountItem.emoji : '—'}</div>
      <div class="equip-slot-name" style="font-size:0.62rem;color:var(--text-muted)">${mountItem ? mountItem.name : '未装备'}</div>
    `;
    mSlot.addEventListener('click', () => openMountPetPicker(char.id, 'mount'));

    const pSlot = document.createElement('div');
    pSlot.className = 'mount-pet-slot';
    pSlot.innerHTML = `
      <div class="equip-slot-label">🐾 宠物</div>
      <div class="equip-slot-item">${petItem ? petItem.emoji : '—'}</div>
      <div class="equip-slot-name" style="font-size:0.62rem;color:var(--text-muted)">${petItem ? petItem.name : '未装备'}</div>
    `;
    pSlot.addEventListener('click', () => openMountPetPicker(char.id, 'pet'));

    el.appendChild(mSlot);
    el.appendChild(pSlot);
  }

  function renderCharStats(char) {
    const panel = document.getElementById('char-stats-panel');
    const s     = char.stats;
    const statLabels = { hp:'❤ 生命', atk:'⚔ 攻击', def:'🛡 防御', spd:'💨 速度', heal:'💚 治疗' };
    let html = '<div class="item-detail-stats">';
    for (const [k,label] of Object.entries(statLabels)) {
      if (s[k] !== undefined) {
        html += `<div class="stat-row"><span class="stat-label">${label}</span><span class="stat-value">${s[k]}</span></div>`;
      }
    }
    html += `<div class="stat-row" style="grid-column:1/-1"><span class="stat-label">⚡ 综合战力</span><span class="stat-value" style="color:var(--rarity-legendary)">${calcPower(char)}</span></div>`;
    html += '</div>';
    panel.innerHTML = html;
  }

  /* ===================== EQUIP PICKERS ===================== */
  function openEquipPicker(charId, slotId) {
    const state = GameCore.getState();
    const char  = state.characters.find(c => c.id === charId);
    if (!char) return;
    const cls = CLASS_CONFIG[char.class];

    // Filter weapons compatible with this class & slot
    const weapons = state.inventory.filter(i => {
      if (i.type !== 'weapon') return false;
      if (!i.class_req) return false;
      return i.class_req.includes(char.class);
    });

    if (weapons.length === 0) {
      GameCore.showToast('背包中没有该职业可用的武器', 'warning');
      return;
    }

    // Simple: just equip the first matching weapon
    // (A full picker modal could be added later)
    const item = weapons[0];
    char.equipment[slotId] = item.id;
    GameCore.showToast(`${item.name} 已装备到 ${SLOT_LABELS[slotId]}`, 'success');
    renderEquipSlots(char);
    renderCharStats(char);
  }

  function openMountPetPicker(charId, type) {
    const state = GameCore.getState();
    const char  = state.characters.find(c => c.id === charId);
    if (!char) return;

    const items = state.inventory.filter(i => i.type === type);
    if (items.length === 0) {
      GameCore.showToast(`背包中没有${type === 'mount' ? '坐骑' : '宠物'}`, 'warning');
      return;
    }

    const item = items[0];
    if (type === 'mount') char.mount = item.id;
    else                  char.pet   = item.id;

    GameCore.showToast(`${item.name} 已装备`, 'success');
    renderMountPetSlots(char);
  }

  /* ===================== INIT ===================== */
  function init() {
    document.getElementById('char-modal-close').addEventListener('click', () => {
      document.getElementById('char-detail-modal').classList.add('hidden');
    });
  }

  window.addEventListener('DOMContentLoaded', init);

  window.CharacterSystem = {
    render, calcPower, showCharDetail,
  };

})();
