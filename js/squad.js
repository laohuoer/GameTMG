/**
 * squad.js — 小队系统：职责分配、战力计算、多队管理
 */

(function() {
  'use strict';

  const { CLASS_CONFIG } = GAME_DATA;

  let selectedRole = null;  // 当前待填充的职责位

  /* ===================== RENDER ===================== */
  function render() {
    const state = GameCore.getState();
    renderSquadSelector(state);
    const squad = getCurrentSquad(state);
    renderSlots(squad, state);
    renderPoolGrid(state);
    updatePower(squad, state);
  }

  function getCurrentSquad(state) {
    return state.squads.find(s => s.id === state.activeSquadId) || state.squads[0];
  }

  /* ---- Selector ---- */
  function renderSquadSelector(state) {
    const sel = document.getElementById('squad-selector');
    sel.innerHTML = '';
    state.squads.forEach(sq => {
      const opt = document.createElement('option');
      opt.value = sq.id;
      opt.textContent = sq.name;
      opt.selected = sq.id === state.activeSquadId;
      sel.appendChild(opt);
    });
  }

  /* ---- Slots ---- */
  function renderSlots(squad, state) {
    renderSlot('slot-tank',   squad.tank,   'tank',   state);
    renderSlot('slot-healer', squad.healer, 'healer', state);
    renderSlot('slot-dps',    squad.dps,    'dps',    state);
  }

  function renderSlot(elId, charId, role, state) {
    const el   = document.getElementById(elId);
    const char = charId ? state.characters.find(c => c.id === charId) : null;
    const cls  = char ? CLASS_CONFIG[char.class] : null;

    if (char) {
      el.innerHTML = `
        <div style="font-size:1.8rem">${char.emoji}</div>
        <div style="font-size:0.68rem;color:var(--text-gold);margin-top:4px">${char.name}</div>
        <div style="font-size:0.6rem;color:${cls?.color||'#aaa'}">${cls?.icon||''} ${cls?.label||char.class}</div>
        <button class="remove-char-btn" data-role="${role}" style="margin-top:4px;background:none;border:1px solid #6a3a3a;color:#cc6666;border-radius:3px;font-size:0.6rem;padding:2px 6px;cursor:pointer">移除</button>
      `;
      el.querySelector('.remove-char-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        removeFromSlot(role);
      });
    } else {
      el.innerHTML = `
        <div style="font-size:1.6rem;opacity:0.3">+</div>
        <div style="font-size:0.65rem;color:var(--text-muted);margin-top:4px">点击选择</div>
      `;
    }

    const slotEl = el.parentElement;
    slotEl.onclick = () => { selectedRole = role; renderPoolGrid(GameCore.getState()); };
    const roleColors = { tank:'rgba(196,156,58,0.6)', healer:'rgba(39,174,96,0.6)', dps:'rgba(204,34,0,0.6)' };
    slotEl.style.borderColor = roleColors[role] || '';
  }

  /* ---- Pool Grid ---- */
  function renderPoolGrid(state) {
    const grid = document.getElementById('squad-pool-grid');
    grid.innerHTML = '';

    const squad = getCurrentSquad(state);
    const assigned = [squad.tank, squad.healer, squad.dps].filter(Boolean);

    state.characters.forEach(char => {
      const cls  = CLASS_CONFIG[char.class] || {};
      const isAssigned = assigned.includes(char.id);

      const card = document.createElement('div');
      card.className = `squad-pool-card role-${cls.role || 'dps'} ${isAssigned ? 'selected' : ''}`;
      card.style.opacity = isAssigned ? '0.5' : '1';
      card.innerHTML = `
        <div style="font-size:1.4rem">${char.emoji}</div>
        <div style="color:var(--text-gold);font-size:0.65rem;margin-top:3px">${char.name}</div>
        <div style="color:${cls.color||'#aaa'};font-size:0.6rem">${cls.icon||''} ${cls.label||''}</div>
      `;

      card.addEventListener('click', () => {
        if (!selectedRole) {
          GameCore.showToast('请先点击职责槽位选择要填入的位置', 'warning');
          return;
        }
        if (isAssigned) {
          GameCore.showToast(`${char.name} 已在队伍中`, 'warning');
          return;
        }
        assignToSlot(char, selectedRole);
      });

      grid.appendChild(card);
    });

    if (state.characters.length === 0) {
      grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:20px 0;font-size:0.82rem;">暂无角色，去扭蛋获取英雄吧！</div>`;
    }
  }

  /* ===================== ASSIGN / REMOVE ===================== */
  function assignToSlot(char, role) {
    const state = GameCore.getState();
    const squad = getCurrentSquad(state);
    const cls   = CLASS_CONFIG[char.class] || {};

    // Role validation
    if (cls.role && cls.role !== role) {
      const roleLabels = { tank:'坦克', healer:'治疗', dps:'输出' };
      GameCore.showToast(`${char.name}（${cls.label}）不能担任${roleLabels[role]}位置！`, 'error');
      return;
    }

    squad[role] = char.id;
    selectedRole = null;
    updatePower(squad, state);
    renderSlots(squad, state);
    renderPoolGrid(state);
    GameCore.checkAchievements();
    GameCore.showToast(`${char.name} 已加入${role === 'tank' ? '坦克' : role === 'healer' ? '治疗' : '输出'}位`, 'success');
  }

  function removeFromSlot(role) {
    const state = GameCore.getState();
    const squad = getCurrentSquad(state);
    const charId = squad[role];
    if (!charId) return;
    const char = state.characters.find(c => c.id === charId);
    squad[role] = null;
    renderSlots(squad, state);
    renderPoolGrid(state);
    updatePower(squad, state);
    if (char) GameCore.showToast(`${char.name} 已移出队伍`, 'info');
  }

  /* ===================== POWER ===================== */
  function updatePower(squad, state) {
    let total = 0;
    for (const role of ['tank', 'healer', 'dps']) {
      const char = squad[role] ? state.characters.find(c => c.id === squad[role]) : null;
      if (char && window.CharacterSystem) {
        total += window.CharacterSystem.calcPower(char);
      }
    }
    document.getElementById('squad-power-val').textContent = total;
  }

  /* ===================== SQUAD MANAGEMENT ===================== */
  function bindSquadManagement() {
    const sel = document.getElementById('squad-selector');
    sel.addEventListener('change', () => {
      const state = GameCore.getState();
      state.activeSquadId = parseInt(sel.value);
      render();
    });

    document.getElementById('btn-new-squad').addEventListener('click', () => {
      const state = GameCore.getState();
      const newId = Math.max(...state.squads.map(s => s.id), 0) + 1;
      const name  = `小队${newId}`;
      state.squads.push({ id: newId, name, tank: null, healer: null, dps: null });
      state.activeSquadId = newId;
      render();
      GameCore.showToast(`已创建 ${name}`, 'success');
    });

    document.getElementById('btn-rename-squad').addEventListener('click', () => {
      const state = GameCore.getState();
      const squad = getCurrentSquad(state);
      const name  = prompt('输入新名称：', squad.name);
      if (name && name.trim()) {
        squad.name = name.trim();
        render();
      }
    });

    document.getElementById('btn-delete-squad').addEventListener('click', () => {
      const state = GameCore.getState();
      if (state.squads.length <= 1) {
        GameCore.showToast('至少保留一支小队', 'warning');
        return;
      }
      const idx = state.squads.findIndex(s => s.id === state.activeSquadId);
      state.squads.splice(idx, 1);
      state.activeSquadId = state.squads[0].id;
      render();
      GameCore.showToast('小队已删除', 'info');
    });
  }

  /* ===================== INIT ===================== */
  function init() {
    bindSquadManagement();
  }

  window.addEventListener('DOMContentLoaded', init);

  window.SquadSystem = { render };

})();
