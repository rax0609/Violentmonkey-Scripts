// ==UserScript==
// @name        w3schools測驗增強工具
// @namespace   Violentmonkey Scripts
// @match       https://www.w3schools.com/*/exercise.asp*
// @grant       GM_setValue
// @grant       GM_getValue
// @version     0.1
// @author      叮咚陳
// @description 項目開始 - 2025/2/20 上午10:20:54
// @require     https://cdn.jsdelivr.net/gh/你的用戶名/倉庫名@main/src/config/config.js
// @require     https://cdn.jsdelivr.net/gh/你的用戶名/倉庫名@main/src/core/core.js
// @require     https://cdn.jsdelivr.net/gh/你的用戶名/倉庫名@main/src/ui/styles.js
// @require     https://cdn.jsdelivr.net/gh/你的用戶名/倉庫名@main/src/ui/panel.js
// ==/UserScript==
 
// *****************************
// *這只是一個範本 還需要重新編寫*
// * 理論上這裡只需要初始化即可  *
// * 開發指南: src/dev.md       *
// * 你可以參考 src/core/core.js*
// * 儲存管理: src/config.js    *        
// *****************************

(function() {
  'use strict';
  
  // 初始化全域命名空間
  window.w3AutoHelper = {};
  
  // DOM載入後初始化
  document.addEventListener("DOMContentLoaded", function() {
    // 初始化設定
    window.w3AutoHelper.ConfigManager.init();
    
    // 初始化UI
    window.w3AutoHelper.Panel.init();
    
    // 初始化核心
    window.w3AutoHelper.Core.init();
  });
})();