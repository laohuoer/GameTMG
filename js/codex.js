/**
 * codex.js - 咕咕大冒险 图鉴系统：怪物/武器/防具/道具收集进度
 */

(function() {
  'use strict';

  let currentType = 'monster';

  const ATTR_EMOJI = {
    '水': '💧', '火': '🔥', '木': '🌿', '金': '⚡', '土': '🪨',
    '暗': '💀', '光': '✨', '物理': '⚔️', '魔法': '🔮', '无': '👾', '-': '👺',
  };

  /* ===================== RENDER ===================== */
  function render() {
    const state   = GameCore.getState();
    const grid    = document.getElementById('codex-grid');
    grid.innerHTML = '';

    let allItems = [];
    let obtained = 0;

    switch(currentType) {
      case 'monster':
        allItems = GAME_DATA.MONSTERS_DB.map(m => ({
          id:       m.id,
          name:     m.name,
          emoji:    getMonsterEmoji(m),
          subtext:  `Lv.${m.level} · ${m.attribute !== '-' ? m.attribute : '普通'}`,
          data:     m,
          isOwned:  state.defeatedMonsters.includes(m.id),
        }));
        break;
      case 'weapon':
        allItems = GAME_DATA.WEAPONS_DB.map(w => ({
          id:      w.id,
          name:    w.name,
          emoji:   '⚔️',
          subtext: `${w.required_class} · Lv${w.required_level}`,
          data:    w,
          isOwned: state.inventory.some(i => i.id === w.id),
        }));
        break;
      case 'armor':
        allItems = GAME_DATA.ARMOR_DB.map(a => ({
          id:      a.id,
          name:    a.name,
          emoji:   getArmorEmoji(a.slot),
          subtext: `${a.class} · ${a.slot}`,
          data:    a,
          isOwned: state.inventory.some(i => i.id === a.id),
        }));
        break;
      case 'item':
        allItems = GAME_DATA.ITEMS_DB.map(it => ({
          id:      it.id,
          name:    it.name,
          emoji:   '🧪',
          subtext: it.description ? it.description.slice(0, 20) : '',
          data:    it,
          isOwned: state.inventory.some(i => i.id === it.id),
        }));
        break;
    }

    // Sort: owned first
    allItems.sort((a, b) => (b.isOwned ? 1 : 0) - (a.isOwned ? 1 : 0));
    obtained = allItems.filter(i => i.isOwned).length;

    // Update progress
    document.getElementById('codex-progress-text').textContent =
      `${obtained} / ${allItems.length}`;
    const pct = allItems.length > 0 ? (obtained / allItems.length * 100) : 0;
    document.getElementById('codex-progress-bar').style.width = pct + '%';

    // Render cards
    allItems.forEach(item => {
      const card = document.createElement('div');
      card.className = `codex-card ${item.isOwned ? 'obtained' : 'not-obtained'}`;

      if (item.isOwned) {
        card.innerHTML = `
          <span class="codex-card-emoji">${item.emoji}</span>
          <div class="codex-card-name">${item.name}</div>
          <div style="font-size:0.58rem;color:var(--text-muted);margin-top:2px">${item.subtext}</div>
        `;
        card.addEventListener('click', () => showCodexDetail(item));
      } else {
        card.innerHTML = `
          <span class="codex-card-emoji" style="filter:grayscale(1) brightness(0.15)">❓</span>
          <div class="codex-card-name" style="color:var(--text-muted)">???</div>
          <div style="font-size:0.58rem;color:#333;margin-top:2px">${item.subtext}</div>
        `;
      }

      grid.appendChild(card);
    });
  }

  function getMonsterEmoji(monster) {
    // Reuse same logic as battle.js
    const attrEmojis = {
      '水':'💧','火':'🔥','木':'🌿','金':'⚡','土':'🪨',
      '暗':'💀','光':'✨','物理':'⚔️','魔法':'🔮','无':'👾','-':'👺',
    };
    const name = monster.name || '';
    if (name.includes('稻草人')) return '🪆';
    if (name.includes('青蛙')) return '🐸';
    if (name.includes('蜘蛛')) return '🕷️';
    if (name.includes('蜂')) return '🐝';
    if (name.includes('鸡') || name.includes('咕咕')) return '🐓';
    if (name.includes('鸟')) return '🐦';
    if (name.includes('鱼') || name.includes('美人鱼')) return '🐟';
    if (name.includes('龙')) return '🐉';
    if (name.includes('狼') || name.includes('犬')) return '🐺';
    if (name.includes('熊')) return '🐻';
    if (name.includes('骑士') || name.includes('战士')) return '⚔️';
    if (name.includes('法师') || name.includes('巫师')) return '🧙';
    if (name.includes('僵尸') || name.includes('骷髅')) return '💀';
    if (name.includes('噜啦')) return '👾';
    if (name.includes('树')) return '🌳';
    if (name.includes('石') || name.includes('岩')) return '🪨';
    if (name.includes('冰') || name.includes('雪')) return '❄️';
    return attrEmojis[monster.attribute] || '👹';
  }

  function getArmorEmoji(slot) {
    const map = {
      '头部':'⛑️','上衣':'👕','下裤':'👖','鞋子':'👟',
      '副武器':'🛡️','脸部':'🎭','项链':'📿','手套':'🧤',
      '背部':'🎒','翅膀':'🪶','尾巴':'🦎',
    };
    return map[slot] || '🛡️';
  }

  /* ===================== DETAIL MODAL ===================== */
  function showCodexDetail(item) {
    const modal   = document.getElementById('item-modal');
    const content = document.getElementById('item-modal-content');
    const actions = document.getElementById('item-modal-actions');

    let detailHtml = '';
    const data = item.data;

    if (currentType === 'monster' && data) {
      const attrColor = GAME_DATA.ATTR_COLORS[data.attribute] || '#606060';
      const drops = data.drops || {};
      const allDrops = [
        ...(drops.common_items || []),
        ...(drops.recovery_items || []),
        ...(drops.gems || []),
        ...(drops.armors || []),
      ];

      detailHtml = `
        <div class="item-detail-header">
          <div class="item-detail-emoji">${item.emoji}</div>
          <div class="item-detail-info">
            <h3>${item.name}</h3>
            <div class="item-detail-type">怪物 · Lv.${data.level}</div>
            <div style="margin-top:5px">
              <span class="monster-attr-badge" style="background:${attrColor}22;color:${attrColor};border:1px solid ${attrColor}44">
                ${ATTR_EMOJI[data.attribute] || ''} ${data.attribute !== '-' ? data.attribute : '普通'}属性
              </span>
            </div>
          </div>
        </div>
        <div class="item-detail-stats">
          <div class="stat-row"><span class="stat-label">生命值</span><span class="stat-value">${data.hp.toLocaleString()}</span></div>
          <div class="stat-row"><span class="stat-label">攻击力</span><span class="stat-value">${data.attack_power}</span></div>
          <div class="stat-row"><span class="stat-label">防御力</span><span class="stat-value">${data.defense}</span></div>
          <div class="stat-row"><span class="stat-label">经验值</span><span class="stat-value positive">${data.exp}</span></div>
        </div>
        ${allDrops.length > 0 ? `
          <div class="monster-drops">
            <div class="monster-drops-title">掉落物品</div>
            <div class="monster-drops-grid">
              ${allDrops.slice(0, 15).map(d => `<span class="drop-tag">${d}</span>`).join('')}
              ${allDrops.length > 15 ? `<span class="drop-tag">+${allDrops.length-15}</span>` : ''}
            </div>
          </div>
        ` : ''}
        <div style="font-size:0.72rem;color:var(--text-muted);margin-top:8px">
          出没地点：${(data.spawn_maps||[]).join('、')}
        </div>
      `;
    } else if ((currentType === 'weapon' || currentType === 'armor') && data) {
      const statLabels = {
        attack_power:'攻击力', attack_speed:'攻速', critical_strike:'暴击率',
        accuracy:'命中', magic_power:'魔法攻击', evasion:'回避', defense_power:'防御力',
      };
      let statsHtml = '<div class="item-detail-stats">';
      if (data.base_stats) {
        for (const [k, v] of Object.entries(data.base_stats)) {
          if (v !== 0) {
            const sign = v > 0 ? '+' : '';
            statsHtml += `<div class="stat-row">
              <span class="stat-label">${statLabels[k]||k}</span>
              <span class="stat-value ${v>0?'positive':'negative'}">${sign}${v}</span>
            </div>`;
          }
        }
      }
      statsHtml += '</div>';

      detailHtml = `
        <div class="item-detail-header">
          <div class="item-detail-emoji">${item.emoji}</div>
          <div class="item-detail-info">
            <h3>${item.name}</h3>
            <div class="item-detail-type">${currentType === 'weapon' ? (data.category||'武器') : (data.slot||'防具')}</div>
            ${data.required_level ? `<div class="item-detail-type">需要等级：${data.required_level}</div>` : ''}
            ${(data.required_class || data.class) ? `<div class="item-detail-class">职业：${data.required_class || data.class}</div>` : ''}
          </div>
        </div>
        ${statsHtml}
      `;
    } else if (currentType === 'item' && data) {
      detailHtml = `
        <div class="item-detail-header">
          <div class="item-detail-emoji">${item.emoji}</div>
          <div class="item-detail-info">
            <h3>${item.name}</h3>
            <div class="item-detail-type">道具</div>
          </div>
        </div>
        ${data.description ? `<p class="item-detail-desc">${data.description}</p>` : ''}
      `;
    }

    content.innerHTML = detailHtml;
    actions.innerHTML = '';
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

  window.addEventListener('DOMContentLoaded', bindTabs);
  window.CodexSystem = { render };

})();
