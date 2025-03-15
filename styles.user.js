// ==UserScript==
// @name        陳定宏的6學分 - 美化樣式
// @namespace   Violentmonkey Scripts
// @match       https://www.w3schools.com/*/exercise.asp*
// @version     1.0
// @author      叮咚陳
// @description 2025/3/16 自動化W3Schools練習的UI美化
// ==/UserScript==

(function() {
    'use strict';
    
    // 創建全局樣式
    function createGlobalStyles() {
      const styleSheet = document.createElement("style");
      styleSheet.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&display=swap');
  
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
  
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
          100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
        }
  
        .control-container {
          animation: none; /* 移除原有淡入動畫 */
          background: rgba(30, 30, 36, 0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4),
                      0 2px 10px rgba(0, 0, 0, 0.2),
                      inset 0 1px 1px rgba(255, 255, 255, 0.1);
          padding: 20px;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          font-family: 'Nunito', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          transform-origin: var(--origin-x, top) var(--origin-y, left);
        }
  
        /* 新增展開動畫 */
        @keyframes expandFromButton {
          from { 
            transform: scale(0.1); 
            opacity: 0;
            border-radius: 50%; /* 從圓形開始 */
          }
          to { 
            transform: scale(1); 
            opacity: 1;
            border-radius: 18px; /* 變回方形面板 */
          }
        }
  
        /* 新增收合動畫 */
        @keyframes collapseToButton {
          from { 
            transform: scale(1); 
            opacity: 1;
            border-radius: 18px;
          }
          to { 
            transform: scale(0.1);  /* 更小的縮放讓動畫更明顯 */
            opacity: 0;
            border-radius: 50%; /* 變成圓形 */
          }
        }
  
        /* 移除主面板的拖動手柄 */
        .header-container .drag-handle {
          display: none;
        }
  
        .panel-expanding {
          animation: expandFromButton 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
  
        .panel-collapsing {
          animation: collapseToButton 0.3s cubic-bezier(0.6, -0.28, 0.735, 0.045) forwards;
        }
  
        .control-button {
          font-family: 'Nunito', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          padding: 10px 18px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-weight: 600;
          font-size: 14px;
          outline: none;
          color: white;
          width: 130px;
          letter-spacing: 0.3px;
          position: relative;
          overflow: hidden;
          text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
        }
  
        .control-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to bottom, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0));
          border-radius: 12px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
  
        .control-button:hover::before {
          opacity: 1;
        }
  
        .control-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 7px 20px rgba(0, 0, 0, 0.3);
        }
  
        .control-button:active {
          transform: translateY(-1px);
        }
  
        .control-button.active {
          background: linear-gradient(145deg, #4CAF50, #43A047);
          box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
        }
  
        .control-button.active:hover {
          box-shadow: 0 7px 25px rgba(76, 175, 80, 0.5);
        }
  
        .control-button.inactive {
          background: linear-gradient(145deg, #F44336, #E53935);
          box-shadow: 0 4px 15px rgba(244, 67, 54, 0.4);
        }
  
        .control-button.inactive:hover {
          box-shadow: 0 7px 25px rgba(244, 67, 54, 0.5);
        }
  
        .delay-input {
          width: 80px;
          padding: 8px 12px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.2);
          color: white;
          font-size: 13px;
          font-family: 'Nunito', sans-serif;
          transition: all 0.3s ease;
          text-align: center;
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
        }
  
        .delay-input:focus {
          outline: none;
          border-color: rgba(76, 175, 80, 0.5);
          box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2), inset 0 1px 3px rgba(0, 0, 0, 0.2);
        }
  
        .button-group {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.03);
          padding: 15px;
          border-radius: 16px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: grab;
          user-select: none;
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
  
        .button-group:hover {
          background: rgba(255, 255, 255, 0.06);
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }
  
        .button-group.dragging {
          opacity: 0.8;
          cursor: grabbing;
          z-index: 1000;
          transform: scale(1.05);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6);
          background: rgba(255, 255, 255, 0.08);
        }
  
        .control-label {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.7);
          margin-top: 5px;
          font-weight: 500;
        }
  
        .toggle-button {
          width: 50px !important;
          height: 50px !important;
          padding: 0 !important;
          border-radius: 50% !important;
          font-size: 22px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          background: linear-gradient(145deg, #2c2c36, #1e1e24) !important;
          border: none !important;
          position: fixed !important;
          z-index: 9999 !important;
          cursor: pointer !important;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3),
                      0 2px 8px rgba(0, 0, 0, 0.2),
                      inset 0 1px 1px rgba(255, 255, 255, 0.1) !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          color: white !important;
          font-weight: bold !important;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3) !important;
        }
  
        .toggle-button:hover {
          transform: scale(1.1) !important;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4),
                      0 3px 10px rgba(0, 0, 0, 0.3),
                      inset 0 1px 1px rgba(255, 255, 255, 0.15) !important;
        }
  
        .toggle-button:active {
          transform: scale(1.05) !important;
        }
  
        .drag-handle {
          width: 40px;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          margin-bottom: 10px;
          cursor: grab;
          transition: all 0.2s ease;
        }
  
        .drag-handle:hover {
          background: rgba(255, 255, 255, 0.2);
        }
  
        .drag-handle:active {
          cursor: grabbing;
          background: rgba(255, 255, 255, 0.25);
        }
  
        .header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          margin-bottom: 15px;
        }
  
        .panel-title {
          color: rgba(255, 255, 255, 0.95);
          font-size: 16px;
          font-weight: 600;
          margin: 0;
          letter-spacing: 0.5px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }
  
        .content-container {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
          justify-content: center;
        }
  
        @media (max-width: 768px) {
          .content-container {
            flex-direction: column;
          }
  
          .button-group {
            width: 100%;
          }
        }
      `;
      document.head.appendChild(styleSheet);
    }
    
    // 初始化樣式
    createGlobalStyles();
  })();
  