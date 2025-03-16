// *****************************
// *這只是一個範本 還需要重新編寫*
// * 理論上這裡只需要初始化即可  *
// * 開發指南: src/dev.md       *
// * 你可以參考 src/core/core.js*
// * 儲存管理: src/config.js    *
// *****************************



// ==UserScript==
// @name        w3schools測驗增強工具
// @namespace   Violentmonkey Scripts
// @match       https://www.w3schools.com/*/exercise.asp*
// @grant       GM_setValue
// @grant       GM_getValue
// @version     0.1
// @author      叮咚陳
// @description 項目開始 - 2025/2/20 上午10:20:54
// @require     https://cdn.jsdelivr.net/gh/你的用戶名/倉庫名@main/src/log/log.js
// @require     https://cdn.jsdelivr.net/gh/你的用戶名/倉庫名@main/src/config/config.js
// @require     https://cdn.jsdelivr.net/gh/你的用戶名/倉庫名@main/src/core/core.js
// @require     https://cdn.jsdelivr.net/gh/你的用戶名/倉庫名@main/src/ui/styles.js
// @require     https://cdn.jsdelivr.net/gh/你的用戶名/倉庫名@main/src/ui/panel.js
// ==/UserScript==

(function() {
  'use strict';
  
  // 初始化全域命名空間
  window.w3AutoHelper = {};
  
  // 取得 logger 實例
  const logger = window.w3AutoHelper.logger;
  
  // DOM載入後初始化
  document.addEventListener("DOMContentLoaded", function() {
    try {
      logger.info('開始初始化應用程式...');
      
      // 設定日誌等級
      logger.setLevel('DEBUG');  // 開發時使用
      logger.debug('日誌系統已設定為 DEBUG 等級');
      
      // 初始化模組
      // logger.info('初始化設定管理器...');
      // window.w3AutoHelper.ConfigManager.init();
      
      logger.info('初始化使用者介面...');
      window.w3AutoHelper.panel.initialize();
      
      logger.info('初始化核心功能...');
      window.w3AutoHelper.core.initialize();
      
      logger.info('應用程式初始化完成');
    } catch (error) {
      logger.error('應用程式初始化失敗', error);
    }
  });
})();