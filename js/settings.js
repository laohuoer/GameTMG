/**
 * settings.js - 咕咕大冒险 设置系统：存档、重置
 */

(function() {
  'use strict';

  /* ===================== RENDER ===================== */
  function render() {
    const state = GameCore.getState();

    // Last save time
    const lastSaveEl = document.getElementById('last-save-time');
    if (state.lastSave) {
      const d = new Date(state.lastSave);
      lastSaveEl.textContent = d.toLocaleString('zh-CN');
    } else {
      lastSaveEl.textContent = '尚未存档';
    }

    // Stats
    const cfg = state.playerClass ? GAME_DATA.CLASS_CONFIG[state.playerClass] : null;
    document.getElementById('settings-class-info').textContent =
      cfg ? `${cfg.emoji} ${cfg.label}` : '未选择';
    document.getElementById('settings-level-info').textContent =
      `Lv.${state.level}`;
    document.getElementById('settings-kills-info').textContent =
      `${state.totalKills || 0} 只`;
  }

  /* ===================== INIT ===================== */
  function init() {
    document.getElementById('btn-save').addEventListener('click', () => {
      GameCore.saveState();
      render();
    });

    document.getElementById('btn-reset').addEventListener('click', () => {
      GameCore.showConfirm(
        '重新开始游戏',
        '确定要清除所有进度并重新开始吗？此操作无法撤销！',
        () => {
          GameCore.resetState();
          render();
        }
      );
    });
  }

  window.addEventListener('DOMContentLoaded', init);
  window.SettingsSystem = { render };

})();
