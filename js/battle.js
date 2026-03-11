/**
 * battle.js - 咕咕大冒险 回合制战斗系统
 * 核心逻辑：选敌、攻击/技能/道具/防御、敌人AI回合、战利品掉落
 */

(function() {
  'use strict';

  /* ===================== BATTLE STATE ===================== */
  let battle = null;  // current battle session

  /* ===================== MONSTER EMOJIS ===================== */
  // Map monster attributes/names to emojis for visual representation
  function getMonsterEmoji(monster) {
    const attrEmojis = {
      '水': '💧', '火': '🔥', '木': '🌿', '金': '⚡',
      '土': '🪨', '暗': '💀', '光': '✨', '物理': '⚔️',
      '魔法': '🔮', '无': '👾', '-': '👺',
    };
    // Name-based overrides
    const name = monster.name || '';
    if (name.includes('稻草人') || name.includes('人偶')) return '🪆';
    if (name.includes('青蛙') || name.includes('蛙')) return '🐸';
    if (name.includes('蜘蛛')) return '🕷️';
    if (name.includes('蝴蝶') || name.includes('蛾')) return '🦋';
    if (name.includes('蜂') || name.includes('蜜蜂')) return '🐝';
    if (name.includes('鸟') || name.includes('鸡') || name.includes('鹦鹉')) return '🐦';
    if (name.includes('鱼') || name.includes('鲸') || name.includes('美人鱼')) return '🐟';
    if (name.includes('龙') || name.includes('幼龙')) return '🐉';
    if (name.includes('狼') || name.includes('犬') || name.includes('狗')) return '🐺';
    if (name.includes('熊') || name.includes('北极熊')) return '🐻';
    if (name.includes('猫') || name.includes('虎')) return '🐱';
    if (name.includes('骑士') || name.includes('战士') || name.includes('武士')) return '⚔️';
    if (name.includes('法师') || name.includes('巫师') || name.includes('魔导')) return '🧙';
    if (name.includes('僵尸') || name.includes('骷髅') || name.includes('幽灵')) return '💀';
    if (name.includes('精灵') || name.includes('妖精')) return '🧚';
    if (name.includes('树') || name.includes('木') && monster.attribute === '木') return '🌳';
    if (name.includes('石') || name.includes('岩')) return '🪨';
    if (name.includes('冰') || name.includes('雪')) return '❄️';
    if (name.includes('火') || monster.attribute === '火') return '🔥';
    if (name.includes('暗') || monster.attribute === '暗') return '👹';
    if (name.includes('噜啦')) return '👾';
    if (name.includes('咕咕')) return '🐓';
    if (name.includes('哈比') || name.includes('精灵')) return '🧝';
    return attrEmojis[monster.attribute] || '👹';
  }

  /* ===================== SCALING ===================== */
  // Scale monster HP for playability (raw HP in millions is too high)
  function scaleMonsterStats(monster, playerLevel) {
    const playerStats = GameCore.calcPlayerStats();
    // Scale enemy HP to be ~3-8 turns of player damage
    const avgDmg = Math.max(playerStats.atk - monster.defense, 10);
    const targetHp = avgDmg * (4 + Math.random() * 4);
    const scaledHp = Math.max(targetHp, playerStats.hp * 0.3);

    // Scale monster attack to do 10-25% of player max HP per hit
    const scaledAtk = Math.max(
      Math.floor(playerStats.hp * (0.10 + Math.random() * 0.15)),
      1
    );
    const scaledDef = Math.max(Math.floor(playerStats.def * 0.3), 0);

    return {
      ...monster,
      scaledHp:  Math.floor(scaledHp),
      scaledAtk: scaledAtk,
      scaledDef: scaledDef,
      emoji:     getMonsterEmoji(monster),
    };
  }

  /* ===================== START BATTLE ===================== */
  function startBattle(regionId) {
    const state   = GameCore.getState();
    const region  = GAME_DATA.getRegionById(regionId);
    const allMons = GAME_DATA.getRegionMonsters(regionId);

    if (!allMons.length) {
      GameCore.showToast('此地区暂无怪物', 'warning');
      return;
    }

    // Pick 1-3 random monsters from region pool
    const count = 1 + Math.floor(Math.random() * Math.min(3, allMons.length));
    const shuffled = [...allMons].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, count);

    const playerStats = GameCore.calcPlayerStats();

    // Initialize enemies with scaled stats
    const enemies = picked.map(m => {
      const scaled = scaleMonsterStats(m, state.level);
      return {
        id:      m.id,
        name:    m.name,
        level:   m.level,
        emoji:   scaled.emoji,
        attr:    m.attribute,
        maxHp:   scaled.scaledHp,
        hp:      scaled.scaledHp,
        atk:     scaled.scaledAtk,
        def:     scaled.scaledDef,
        exp:     m.exp,
        gold:    Math.floor(m.level * (2 + Math.random() * 3)),
        drops:   m.drops || {},
        defeated: false,
        isDefending: false,
      };
    });

    // Initialize battle state
    battle = {
      regionId,
      regionName:  region.name,
      enemies,
      playerMaxHp: playerStats.hp,
      playerHp:    playerStats.hp,
      playerMaxMp: 50 + state.level * 5,
      playerMp:    50 + state.level * 5,
      playerStats,
      playerDefending: false,
      selectedEnemy:  0,
      turn:           1,
      phase:          'player',  // 'player' | 'enemy' | 'over'
      log:            [],
    };

    // Navigate to battle page
    GameCore.navigateTo('battle');
    // Hack: battle is not in onPageEnter, manual init
    renderBattle();
    addLog(`⚔️ 进入 ${region.name}，遭遇了 ${enemies.map(e=>e.name).join('、')}！`, 'system-msg');
    addLog('你的回合！选择行动。', 'system-msg');
  }

  /* ===================== RENDER ===================== */
  function renderBattle() {
    if (!battle) return;

    document.getElementById('battle-map-name').textContent = battle.regionName;
    document.getElementById('battle-turn').textContent = battle.turn;

    // Player info
    const state = GameCore.getState();
    const cfg   = GAME_DATA.CLASS_CONFIG[state.playerClass] || {};
    document.getElementById('battle-player-name').textContent  = state.playerName;
    document.getElementById('battle-player-class').textContent = cfg.label || state.playerClass || '冒险者';
    document.getElementById('battle-player-emoji').textContent = cfg.emoji || '🧙';

    updatePlayerBars();
    renderEnemies();
    updateActionButtons();
  }

  function updatePlayerBars() {
    if (!battle) return;
    const hpPct = Math.max(0, (battle.playerHp / battle.playerMaxHp) * 100);
    const mpPct = Math.max(0, (battle.playerMp / battle.playerMaxMp) * 100);
    document.getElementById('battle-hp-bar').style.width = hpPct + '%';
    document.getElementById('battle-mp-bar').style.width = mpPct + '%';
    document.getElementById('battle-hp-text').textContent =
      `${Math.max(0,Math.floor(battle.playerHp))}/${battle.playerMaxHp}`;
    document.getElementById('battle-mp-text').textContent =
      `${Math.floor(battle.playerMp)}/${battle.playerMaxMp}`;
  }

  function renderEnemies() {
    const area = document.getElementById('battle-enemy-area');
    area.innerHTML = '';

    battle.enemies.forEach((enemy, idx) => {
      const card = document.createElement('div');
      card.className = 'enemy-card' +
        (enemy.defeated ? ' defeated' : '') +
        (idx === battle.selectedEnemy && !enemy.defeated ? ' selected' : '');
      card.dataset.idx = idx;

      const attrColor = GAME_DATA.ATTR_COLORS[enemy.attr] || '#606060';
      const hpPct = Math.max(0, (enemy.hp / enemy.maxHp) * 100);

      card.innerHTML = `
        <div class="enemy-emoji">${enemy.emoji}</div>
        <div class="enemy-name">${enemy.name}</div>
        <div class="enemy-level">Lv.${enemy.level}</div>
        <div class="enemy-attr-badge" style="background:${attrColor}22;color:${attrColor};border:1px solid ${attrColor}44">
          ${enemy.attr !== '-' && enemy.attr !== '无' ? enemy.attr : '普通'}
        </div>
        <div class="enemy-hp-bar-wrap">
          <div class="enemy-hp-bar" style="width:${hpPct}%"></div>
        </div>
        <div class="enemy-hp-text">${Math.max(0,Math.floor(enemy.hp))} HP</div>
      `;

      if (!enemy.defeated) {
        card.addEventListener('click', () => {
          if (battle.phase !== 'player') return;
          battle.selectedEnemy = idx;
          renderEnemies();
        });
      }
      area.appendChild(card);
    });
  }

  function updateActionButtons() {
    const isPlayerTurn = battle && battle.phase === 'player';
    ['btn-attack','btn-skill','btn-item','btn-defend'].forEach(id => {
      document.getElementById(id).disabled = !isPlayerTurn;
    });
  }

  function addLog(msg, type = 'system-msg') {
    battle.log.unshift({ msg, type });
    const inner = document.getElementById('battle-log-inner');
    const entry = document.createElement('div');
    entry.className = 'battle-log-entry ' + type;
    entry.textContent = msg;
    inner.insertBefore(entry, inner.firstChild);
    // Keep log at max 30 entries
    while (inner.children.length > 30) inner.removeChild(inner.lastChild);
  }

  function showDamagePopup(enemyIdx, amount, type = 'damage') {
    const area  = document.getElementById('battle-enemy-area');
    const cards = area.querySelectorAll('.enemy-card');
    if (!cards[enemyIdx]) return;
    const popup = document.createElement('div');
    popup.className = 'dmg-popup ' + (type === 'heal' ? 'heal' : type === 'miss' ? 'miss' : type === 'crit' ? 'crit' : '');
    popup.textContent = type === 'miss' ? 'MISS' : (type === 'heal' ? '+'+amount : '-'+amount);
    cards[enemyIdx].style.position = 'relative';
    cards[enemyIdx].appendChild(popup);
    setTimeout(() => popup.remove(), 800);
  }

  /* ===================== PLAYER ACTIONS ===================== */
  function getTargetEnemy() {
    // Return selected enemy, skip defeated ones
    if (battle.enemies[battle.selectedEnemy] && !battle.enemies[battle.selectedEnemy].defeated) {
      return battle.selectedEnemy;
    }
    // Find first alive enemy
    const idx = battle.enemies.findIndex(e => !e.defeated);
    if (idx !== -1) battle.selectedEnemy = idx;
    return idx;
  }

  function playerAttack() {
    if (battle.phase !== 'player') return;
    const targetIdx = getTargetEnemy();
    if (targetIdx === -1) return;

    battle.playerDefending = false;
    const enemy = battle.enemies[targetIdx];
    const ps    = battle.playerStats;

    // Hit check (accuracy vs evasion)
    const hitChance = Math.min(95, Math.max(30, (ps.acc || 90) - 5));
    if (Math.random() * 100 > hitChance) {
      addLog(`你攻击了 ${enemy.name}，但没有命中！`, 'player-action');
      showDamagePopup(targetIdx, 0, 'miss');
      endPlayerTurn();
      return;
    }

    // Calc damage
    let dmg = Math.max(1, ps.atk - enemy.def);
    dmg = Math.floor(dmg * (0.85 + Math.random() * 0.3));

    let isCrit = false;
    if (Math.random() * 100 < (ps.crit || 5)) {
      dmg = Math.floor(dmg * 1.8);
      isCrit = true;
    }

    enemy.hp -= dmg;
    const dmgType = isCrit ? 'crit' : 'damage';
    addLog(`${isCrit ? '💥 暴击！' : ''}你对 ${enemy.name} 造成了 ${dmg} 点伤害！`, 'player-action');
    showDamagePopup(targetIdx, dmg, dmgType);

    // Shake animation
    const cards = document.getElementById('battle-enemy-area').querySelectorAll('.enemy-card');
    if (cards[targetIdx]) {
      cards[targetIdx].classList.add('taking-damage');
      setTimeout(() => cards[targetIdx] && cards[targetIdx].classList.remove('taking-damage'), 400);
    }

    checkEnemyDefeated(targetIdx);
    renderEnemies();
    endPlayerTurn();
  }

  function playerSkill() {
    if (battle.phase !== 'player') return;
    const state  = GameCore.getState();
    const cfg    = GAME_DATA.CLASS_CONFIG[state.playerClass] || {};
    const mpCost = 15;

    if (battle.playerMp < mpCost) {
      GameCore.showToast('MP不足！', 'warning');
      return;
    }

    battle.playerMp -= mpCost;
    battle.playerDefending = false;

    const targetIdx = getTargetEnemy();
    if (targetIdx === -1) return;
    const enemy = battle.enemies[targetIdx];
    const ps    = battle.playerStats;

    // Skill multiplier by class
    const classMultipliers = {
      '剑士': 1.6, '骑士': 1.3, '小丑': 2.0, '祭司': 0.8,
      '法师': 2.2, '猎人': 1.8, '铁匠': 1.4, '饕客': 1.2,
    };
    const mult = classMultipliers[state.playerClass] || 1.5;

    let dmg = Math.max(1, Math.floor((ps.atk - enemy.def) * mult * (0.9 + Math.random() * 0.2)));

    // 祭司 skill: heal instead of damage
    if (state.playerClass === '祭司') {
      const healAmt = Math.floor(ps.hp * 0.25 * (0.8 + Math.random() * 0.4));
      battle.playerHp = Math.min(battle.playerMaxHp, battle.playerHp + healAmt);
      addLog(`✨ 神圣治愈！恢复了 ${healAmt} HP！`, 'player-action');
      updatePlayerBars();
      endPlayerTurn();
      return;
    }

    enemy.hp -= dmg;

    const skillNames = {
      '剑士': '剑气斩', '骑士': '圣盾突击', '小丑': '致命背刺',
      '法师': '奥术爆发', '猎人': '穿心箭', '铁匠': '铁锤重击',
      '饕客': '饕餮之力',
    };
    const skillName = skillNames[state.playerClass] || '必杀技';
    addLog(`✨ ${skillName}！对 ${enemy.name} 造成了 ${dmg} 点伤害！`, 'player-action');
    showDamagePopup(targetIdx, dmg, 'crit');

    checkEnemyDefeated(targetIdx);
    renderEnemies();
    updatePlayerBars();
    endPlayerTurn();
  }

  function playerItem() {
    if (battle.phase !== 'player') return;
    showItemPicker();
  }

  function playerDefend() {
    if (battle.phase !== 'player') return;
    battle.playerDefending = true;
    addLog('🛡️ 你进入防御姿态，下回合受到的伤害减少40%！', 'player-action');
    endPlayerTurn();
  }

  /* ===================== ITEM USE IN BATTLE ===================== */
  function showItemPicker() {
    const state = GameCore.getState();
    const usableItems = state.inventory.filter(i => i.type === 'item');

    const modal = document.getElementById('item-picker-modal');
    const grid  = document.getElementById('item-picker-grid');
    grid.innerHTML = '';

    if (usableItems.length === 0) {
      grid.innerHTML = '<div class="item-picker-empty">背包中没有可用的道具</div>';
    } else {
      usableItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'item-picker-card';
        card.innerHTML = `
          <span class="emoji">🧪</span>
          <div class="name">${item.name}</div>
          <div class="count">x${item.count}</div>
        `;
        card.addEventListener('click', () => {
          useItem(item);
          modal.classList.add('hidden');
        });
        grid.appendChild(card);
      });
    }

    modal.classList.remove('hidden');
  }

  function useItem(item) {
    if (battle.phase !== 'player') return;
    battle.playerDefending = false;

    // Determine item effect based on name keywords
    const name = item.name || '';
    let healed = 0;

    if (name.includes('红药水') || name.includes('鸡蛋') || name.includes('熊胆') || name.includes('肝')) {
      healed = Math.floor(battle.playerMaxHp * (name.includes('大') ? 0.40 : 0.20));
    } else if (name.includes('蓝药水') || name.includes('豌豆') || name.includes('豆奶')) {
      // MP restore
      const mpRestore = Math.floor(battle.playerMaxMp * (name.includes('大') ? 0.50 : 0.30));
      battle.playerMp = Math.min(battle.playerMaxMp, battle.playerMp + mpRestore);
      addLog(`🧪 使用了 ${name}，恢复了 ${mpRestore} MP！`, 'player-action');
      GameCore.removeItemFromInventory(item.id, 1);
      updatePlayerBars();
      endPlayerTurn();
      return;
    } else if (name.includes('香菇') || name.includes('萝卜') || name.includes('面粉') || name.includes('海苔')) {
      healed = Math.floor(battle.playerMaxHp * 0.15);
    } else {
      // Generic: small heal
      healed = Math.floor(battle.playerMaxHp * 0.10);
    }

    if (healed > 0) {
      battle.playerHp = Math.min(battle.playerMaxHp, battle.playerHp + healed);
      addLog(`🧪 使用了 ${name}，恢复了 ${healed} HP！`, 'player-action');
    } else {
      addLog(`🧪 使用了 ${name}，但效果不明显...`, 'player-action');
    }

    GameCore.removeItemFromInventory(item.id, 1);
    updatePlayerBars();
    endPlayerTurn();
  }

  /* ===================== ENEMY DEFEATED ===================== */
  function checkEnemyDefeated(idx) {
    const enemy = battle.enemies[idx];
    if (enemy.hp <= 0) {
      enemy.hp = 0;
      enemy.defeated = true;
      addLog(`💀 ${enemy.name} 被击败了！`, 'system-msg');
      // Select next alive enemy
      const nextAlive = battle.enemies.findIndex((e, i) => !e.defeated && i !== idx);
      if (nextAlive !== -1) battle.selectedEnemy = nextAlive;
    }
  }

  /* ===================== TURN MANAGEMENT ===================== */
  function endPlayerTurn() {
    updateActionButtons();
    // Check if all enemies defeated
    if (battle.enemies.every(e => e.defeated)) {
      setTimeout(handleVictory, 400);
      return;
    }
    // Enemy turn
    battle.phase = 'enemy';
    updateActionButtons();
    setTimeout(enemyTurn, 800);
  }

  function enemyTurn() {
    if (!battle || battle.phase !== 'enemy') return;
    battle.turn++;
    document.getElementById('battle-turn').textContent = battle.turn;

    battle.enemies.forEach(enemy => {
      if (enemy.defeated) return;
      enemy.isDefending = false;

      // Enemy AI: 90% attack, 10% skip
      if (Math.random() < 0.1) {
        addLog(`${enemy.name} 在蓄力中...`, 'enemy-action');
        return;
      }

      // Calc damage to player
      let dmg = Math.max(1, enemy.atk - (battle.playerStats.def * 0.3));
      dmg = Math.floor(dmg * (0.8 + Math.random() * 0.4));

      // Player defending
      if (battle.playerDefending) {
        dmg = Math.floor(dmg * 0.6);
      }

      battle.playerHp -= dmg;
      addLog(`${enemy.emoji} ${enemy.name} 对你造成了 ${dmg} 点伤害！`, 'enemy-action');
    });

    battle.playerDefending = false;
    updatePlayerBars();

    // Check defeat
    if (battle.playerHp <= 0) {
      battle.playerHp = 0;
      updatePlayerBars();
      setTimeout(handleDefeat, 400);
      return;
    }

    // Back to player turn
    battle.phase = 'player';
    updateActionButtons();
    addLog('你的回合！', 'system-msg');
  }

  /* ===================== VICTORY / DEFEAT ===================== */
  function handleVictory() {
    battle.phase = 'over';
    updateActionButtons();

    const state = GameCore.getState();
    let totalExp  = 0;
    let totalGold = 0;
    const drops   = [];
    const newItems = [];

    // Collect exp, gold, drops from all defeated enemies
    battle.enemies.forEach(enemy => {
      totalExp  += enemy.exp * 100;
      totalGold += enemy.gold;

      // Record monster defeat
      if (!state.defeatedMonsters.includes(enemy.id)) {
        state.defeatedMonsters.push(enemy.id);
        newItems.push({ type: 'codex', name: enemy.name });
      }
      state.totalKills = (state.totalKills || 0) + 1;

      // Roll drops
      const rolledDrops = GAME_DATA.rollDrops(GAME_DATA.getMonsterById(enemy.id) || enemy);
      rolledDrops.forEach(d => {
        drops.push(d);
        if (d.armorData) {
          const added = GameCore.addItemToInventory({
            id:    d.armorData.id,
            name:  d.armorData.name,
            type:  'armor',
            emoji: '🛡️',
            data:  d.armorData,
          });
          if (added) newItems.push({ type: 'armor', name: d.armorData.name });
        } else if (d.itemData) {
          GameCore.addItemToInventory({
            id:    d.itemData.id,
            name:  d.itemData.name,
            type:  'item',
            emoji: '🧪',
            data:  d.itemData,
          });
        }
      });
    });

    // Add weapon drop chance (5% per enemy)
    battle.enemies.forEach(enemy => {
      if (Math.random() < 0.05) {
        const classWeapons = GAME_DATA.getEquippableWeapons(state.playerClass);
        const levelAppropriate = classWeapons.filter(w => Math.abs(w.required_level - state.level) <= 5);
        const pool = levelAppropriate.length ? levelAppropriate : classWeapons;
        if (pool.length) {
          const w = pool[Math.floor(Math.random() * pool.length)];
          const added = GameCore.addItemToInventory({
            id: w.id, name: w.name, type: 'weapon', emoji: '⚔️', data: w,
          });
          if (added) {
            drops.push({ name: w.name, isWeapon: true });
            newItems.push({ type: 'weapon', name: w.name });
          }
        }
      }
    });

    GameCore.addExp(totalExp);
    GameCore.addGold(totalGold);
    GameCore.updateHUD();

    // Build result overlay
    const resultDropsEl = document.getElementById('battle-result-drops');
    resultDropsEl.innerHTML = '';

    drops.slice(0, 10).forEach(d => {
      const tag = document.createElement('div');
      tag.className = 'result-drop-tag' + (newItems.find(n => n.name === d.name) ? ' new' : '');
      tag.textContent = d.name;
      resultDropsEl.appendChild(tag);
    });
    if (drops.length === 0) {
      const tag = document.createElement('div');
      tag.className = 'result-drop-tag';
      tag.textContent = '无掉落物';
      resultDropsEl.appendChild(tag);
    }

    document.getElementById('battle-result-icon').textContent = '🏆';
    document.getElementById('battle-result-title').textContent = '战斗胜利！';
    document.getElementById('battle-result-desc').textContent =
      `获得 ${totalExp} EXP  🪙 ${totalGold} 金币`;
    document.getElementById('battle-result').classList.remove('hidden');

    addLog(`🏆 战斗胜利！获得 ${totalExp} EXP，${totalGold} 金币！`, 'victory');
  }

  function handleDefeat() {
    battle.phase = 'over';
    updateActionButtons();

    document.getElementById('battle-result-icon').textContent = '💀';
    document.getElementById('battle-result-title').textContent = '战斗失败！';
    document.getElementById('battle-result-desc').textContent = '你被击倒了，但获得了一些经验。';
    document.getElementById('battle-result-drops').innerHTML = '';

    // Consolation exp
    const consolationExp = battle.enemies.reduce((s,e) => s + e.exp * 20, 0);
    GameCore.addExp(consolationExp);

    document.getElementById('battle-result').classList.remove('hidden');
    addLog('💀 你被击倒了...', 'defeat');
  }

  /* ===================== INIT / BIND ===================== */
  function init() {
    document.getElementById('btn-attack').addEventListener('click', playerAttack);
    document.getElementById('btn-skill').addEventListener('click', playerSkill);
    document.getElementById('btn-item').addEventListener('click', playerItem);
    document.getElementById('btn-defend').addEventListener('click', playerDefend);

    document.getElementById('battle-back-btn').addEventListener('click', () => {
      if (battle && battle.phase === 'player') {
        GameCore.showConfirm('撤退', '确定要撤退吗？战斗中的进度将丢失。', () => {
          battle = null;
          GameCore.navigateTo('map');
        });
      } else {
        battle = null;
        GameCore.navigateTo('map');
      }
    });

    document.getElementById('battle-result-close').addEventListener('click', () => {
      document.getElementById('battle-result').classList.add('hidden');
      battle = null;
      GameCore.saveState();
      GameCore.navigateTo('map');
    });

    document.getElementById('item-picker-close').addEventListener('click', () => {
      document.getElementById('item-picker-modal').classList.add('hidden');
    });
  }

  window.addEventListener('DOMContentLoaded', init);

  window.BattleSystem = {
    startBattle,
    getCurrentBattle: () => battle,
  };

})();
