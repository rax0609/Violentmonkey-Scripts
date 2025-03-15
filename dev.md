# W3Schools 測驗增強工具 - 架構說明(Copilot產生)

## 架構概覽
本專案採用模組化架構，主要基於以下設計模式：
- 模組模式 (Module Pattern)：封裝私有狀態和方法
- 觀察者模式 (Observer Pattern)：處理設定變更通知
- 單例模式 (Singleton Pattern)：確保全域命名空間唯一性

## 專案結構
```plaintext
src/
├── config/         # 設定管理
│   └── config.js   # 集中管理設定和狀態
├── core/           # 核心功能
│   └── core.js     # 自動化操作邏輯
└── ui/             # 使用者介面
    ├── panel.js    # 控制面板
    └── styles.js   # 樣式定義
```

### 各模組職責

1. **ConfigManager (config.js)**
   - 管理所有設定值
   - 提供設定的讀寫介面
   - 實現觀察者模式，通知設定變更

2. **Core (core.js)**
   - 實現自動化操作邏輯
   - 監聽頁面變化
   - 回應設定變更

3. **UI (panel.js)**
   - 建立使用者介面
   - 處理使用者互動
   - 更新畫面狀態

### 資料流向

1. **設定變更流程**
   ConfigManager → 通知訂閱者 → Core/UI 模組更新

2. **使用者操作流程**
   UI 操作 → ConfigManager 更新設定 → Core 模組響應

3. **自動化操作流程**
   頁面變化 → Core 偵測 → 查詢設定 → 執行操作

### 開發指南

1. **新增功能**
   - 在相應模組中添加功能
   - 使用 ConfigManager 管理新設定
   - 必要時訂閱設定變更

2. **程式碼規範**
   - 使用 IIFE 封裝模組
   - 透過 return 暴露公開 API
   - 使用 ConfigManager 進行設定管理

3. **例子**
```javascript
// 新增功能示例
window.w3AutoHelper.newModule = (function() {
    const ConfigManager = window.w3AutoHelper.ConfigManager;
    
    function initialize() {
        ConfigManager.subscribe((key, value) => {
            // 處理設定變更
        });
    }
    
    return { initialize };
})();