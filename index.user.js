// ==UserScript==
// @name        陳定宏的6學分
// @namespace   Violentmonkey Scripts
// @match       https://www.w3schools.com/*/exercise.asp*
// @grant       GM_setValue
// @grant       GM_getValue
// @version     1.6
// @author      叮咚陳
// @description 2025/2/20 上午10:20:54
// ==/UserScript==

// 從 Violentmonkey 存儲中取得狀態
let autoAnswer = GM_getValue("autoAnswer", false);
let autoNextExercise = GM_getValue("autoNextExercise", false);
let autoNextQuestion = GM_getValue("autoNextQuestion", false);
let autoRepeatAnswers = GM_getValue("autoRepeatAnswers", false);
let isControlPanelMinimized = GM_getValue("isMinimized", false);
let buttonOrder = GM_getValue("buttonOrder", [0, 1, 2, 3]); // 新增：儲存按鈕順序
let restoreButtonPosition = GM_getValue("restoreButtonPosition", {
  top: "20px",
  left: "20px",
});

let answerDelay = GM_getValue("answerDelay", 500);
let nextExerciseDelay = GM_getValue("nextExerciseDelay", 500);
let nextQuestionDelay = GM_getValue("nextQuestionDelay", 500);
let repeatAnswersDelay = GM_getValue("repeatAnswersDelay", 500);

let correctAnswerDiv;
let completedAllDiv;
let retakeanswerDiv;
let divShowStatus;
// 全局變量，用於存儲控制面板和恢復按鈕的引用
let buttonContainer, toggleButton;

const buttonTexts = {
  autoAnswer: {
    start: "自動答題",
    stop: "停止答題",
  },
  autoNextQuestion: {
    start: "自動下一題",
    stop: "停止下一題",
  },
  autoNextExercise: {
    start: "自動下一題組",
    stop: "停止下一題組",
  },
  autoRepeatAnswers: {
    start: "重複作答",
    stop: "停止重複作答",
  },
};

// 新增: 創建樣式表
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
        border-radius: 25px;
      }
      to { 
        transform: scale(1); 
        opacity: 1;
        border-radius: 18px;
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
        transform: scale(0.1); 
        opacity: 0;
        border-radius: 25px;
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

// 改進的拖動功能，讓元素實時跟隨滑鼠位置
function makeElementDraggable(element) {
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  let isDragging = false;

  element.addEventListener("mousedown", dragMouseDown);

  function dragMouseDown(e) {
    e.preventDefault();
    // 獲取鼠標初始位置
    pos3 = e.clientX;
    pos4 = e.clientY;

    // 添加鼠標移動和鬆開事件
    document.addEventListener("mousemove", elementDrag);
    document.addEventListener("mouseup", closeDragElement);

    // 添加拖動時的視覺效果
    element.style.cursor = "grabbing";
    element.style.opacity = "0.9";
    element.style.transition = "none";
    isDragging = true;
  }

  function elementDrag(e) {
    if (!isDragging) return;

    e.preventDefault();
    // 計算新位置
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;

    // 直接設置元素位置為滑鼠位置減去偏移
    element.style.top = e.clientY - 25 + "px"; // 25是偏移量，可以調整
    element.style.left = e.clientX - 25 + "px"; // 25是偏移量，可以調整

    // 確保按鈕不會超出視窗範圍
    const rect = element.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width;
    const maxY = window.innerHeight - rect.height;

    if (parseInt(element.style.left) < 0) element.style.left = "0px";
    if (parseInt(element.style.top) < 0) element.style.top = "0px";
    if (parseInt(element.style.left) > maxX) element.style.left = maxX + "px";
    if (parseInt(element.style.top) > maxY) element.style.top = maxY + "px";

    // 保存位置到全局變量和 GM_setValue
    restoreButtonPosition = {
      top: element.style.top,
      left: element.style.left,
    };
    GM_setValue("restoreButtonPosition", restoreButtonPosition);
  }

  function closeDragElement() {
    // 移除事件監聽器
    document.removeEventListener("mousemove", elementDrag);
    document.removeEventListener("mouseup", closeDragElement);

    // 恢復正常視覺效果
    element.style.cursor = "pointer";
    element.style.opacity = "1";
    element.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
    isDragging = false;
  }
}

// 根據按鈕位置決定控制面板的最佳展開方向和位置
function calculateOptimalPanelPosition(buttonRect) {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  // 估計控制面板尺寸
  const panelWidth = 650;
  const panelHeight = 350;

  // 計算各個方向的可用空間
  const spaceRight = windowWidth - buttonRect.right;
  const spaceLeft = buttonRect.left;
  const spaceBottom = windowHeight - buttonRect.bottom;
  const spaceTop = buttonRect.top;

  // 找出最佳方向（有足夠空間的優先方向）
  let bestDirection = "right"; // 默認向右
  let bestPosition = {
    top: buttonRect.top + "px",
    left: buttonRect.left + "px",
  };

  // 檢查右側空間
  if (spaceRight >= panelWidth) {
    bestDirection = "right";
    bestPosition = {
      top: buttonRect.top + "px",
      left: buttonRect.left + "px",
    };
  }
  // 檢查左側空間
  else if (spaceLeft >= panelWidth) {
    bestDirection = "left";
    bestPosition = {
      top: buttonRect.top + "px",
      left: buttonRect.left - panelWidth + buttonRect.width + "px",
    };
  }
  // 檢查底部空間
  else if (spaceBottom >= panelHeight) {
    bestDirection = "bottom";
    bestPosition = {
      top: buttonRect.top + "px",
      left:
        Math.max(0, Math.min(buttonRect.left, windowWidth - panelWidth)) + "px",
    };
  }
  // 檢查頂部空間
  else if (spaceTop >= panelHeight) {
    bestDirection = "top";
    bestPosition = {
      top: buttonRect.top - panelHeight + buttonRect.height + "px",
      left:
        Math.max(0, Math.min(buttonRect.left, windowWidth - panelWidth)) + "px",
    };
  }
  // 如果所有方向都沒有足夠空間，選擇最大的方向
  else {
    const spaces = [
      { direction: "right", space: spaceRight },
      { direction: "left", space: spaceLeft },
      { direction: "bottom", space: spaceBottom },
      { direction: "top", space: spaceTop },
    ];

    spaces.sort((a, b) => b.space - a.space);
    bestDirection = spaces[0].direction;

    // 根據最佳方向設置位置
    switch (bestDirection) {
      case "right":
        bestPosition = {
          top: buttonRect.top + "px",
          left: buttonRect.left + "px",
        };
        break;
      case "left":
        bestPosition = {
          top: buttonRect.top + "px",
          left: buttonRect.left - panelWidth + buttonRect.width + "px",
        };
        break;
      case "bottom":
        bestPosition = {
          top: buttonRect.top + "px",
          left:
            Math.max(0, Math.min(buttonRect.left, windowWidth - panelWidth)) +
            "px",
        };
        break;
      case "top":
        bestPosition = {
          top: buttonRect.top - panelHeight + buttonRect.height + "px",
          left:
            Math.max(0, Math.min(buttonRect.left, windowWidth - panelWidth)) +
            "px",
        };
        break;
    }
  }

  // 確保面板不會超出視窗範圍
  const panelLeft = parseInt(bestPosition.left);
  const panelTop = parseInt(bestPosition.top);

  if (panelLeft < 0) bestPosition.left = "0px";
  if (panelTop < 0) bestPosition.top = "0px";
  if (panelLeft + panelWidth > windowWidth)
    bestPosition.left = windowWidth - panelWidth + "px";
  if (panelTop + panelHeight > windowHeight)
    bestPosition.top = windowHeight - panelHeight + "px";

  return {
    direction: bestDirection,
    position: bestPosition,
  };
}

function createToggleButton() {
  createGlobalStyles();

  // 建立控制按鈕容器
  buttonContainer = document.createElement("div");
  buttonContainer.className = "control-container";
  buttonContainer.style.position = "fixed";
  buttonContainer.style.zIndex = "9999";
  buttonContainer.style.display = isControlPanelMinimized ? "none" : "flex";
  buttonContainer.style.flexDirection = "column";
  buttonContainer.style.gap = "15px";
  buttonContainer.style.cursor = "move"; // 新增：將整個面板設為可拖曳游標
  document.body.appendChild(buttonContainer);

  // 建立標題和最小化按鈕的容器
  const headerContainer = document.createElement("div");
  headerContainer.className = "header-container";
  buttonContainer.appendChild(headerContainer);

  // 添加標題
  const panelTitle = document.createElement("h3");
  panelTitle.className = "panel-title";
  panelTitle.textContent = "自動化控制面板";
  headerContainer.appendChild(panelTitle);

  // 建立統一的切換按鈕 (同時作為最小化和恢復功能)
  toggleButton = document.createElement("button");
  toggleButton.textContent = isControlPanelMinimized ? "+" : "−";
  toggleButton.className = "toggle-button";
  toggleButton.style.top = restoreButtonPosition.top;
  toggleButton.style.left = restoreButtonPosition.left;
  document.body.appendChild(toggleButton);

  // 添加拖動功能到切換按鈕
  makeElementDraggable(toggleButton);

  // 如果控制面板是展開的，則根據切換按鈕位置設置控制面板位置
  if (!isControlPanelMinimized) {
    const buttonRect = {
      top: parseInt(restoreButtonPosition.top),
      left: parseInt(restoreButtonPosition.left),
      width: 50,
      height: 50,
      right: parseInt(restoreButtonPosition.left) + 50,
      bottom: parseInt(restoreButtonPosition.top) + 50,
    };

    const optimalPosition = calculateOptimalPanelPosition(buttonRect);
    buttonContainer.style.top = optimalPosition.position.top;
    buttonContainer.style.left = optimalPosition.position.left;
  }

  // 按鈕容器內部的內容區域
  const contentContainer = document.createElement("div");
  contentContainer.className = "content-container";
  buttonContainer.appendChild(contentContainer);

  function createButton(text, state, onClick) {
    let button = document.createElement("button");
    button.className = `control-button ${state ? "active" : "inactive"}`;
    button.textContent = text;

    button.onclick = function () {
      const newState = onClick();
      button.textContent = newState;
      button.className = `control-button ${!state ? "active" : "inactive"}`;

      // 添加點擊效果
      button.style.transform = "scale(0.95)";
      setTimeout(() => {
        button.style.transform = "";
      }, 150);

      state = !state;
    };

    return button;
  }

  function createButtonGroup(button, delayValue, delayKey, index) {
    const container = document.createElement("div");
    container.className = "button-group";
    container.dataset.index = index;

    // 添加拖動手柄
    const dragHandle = document.createElement("div");
    dragHandle.className = "drag-handle";
    container.appendChild(dragHandle);

    const delayInput = document.createElement("input");
    delayInput.className = "delay-input";
    delayInput.type = "number";
    delayInput.value = delayValue;
    delayInput.min = "0";
    delayInput.step = "100";

    const label = document.createElement("div");
    label.className = "control-label";
    label.textContent = "延時(ms)";

    delayInput.addEventListener("change", (event) => {
      const value = parseInt(event.target.value) || 500;
      GM_setValue(delayKey, value);
      window[delayKey] = value;

      // 添加變更效果
      delayInput.style.boxShadow =
        "0 0 0 3px rgba(76, 175, 80, 0.4), inset 0 1px 3px rgba(0, 0, 0, 0.2)";
      setTimeout(() => {
        delayInput.style.boxShadow = "";
      }, 800);
    });

    container.appendChild(button);
    container.appendChild(delayInput);
    container.appendChild(label);

    // 添加拖拽功能
    setupDragAndDrop(container, contentContainer);

    return container;
  }

  const buttons = [
    {
      text: autoAnswer ? buttonTexts.autoAnswer.stop : buttonTexts.autoAnswer.start,
      state: autoAnswer,
      onClick: () => {
        autoAnswer = !autoAnswer;
        GM_setValue("autoAnswer", autoAnswer);
        Promise.resolve().then(() => {
          botoperate();
        });
        return autoAnswer ? buttonTexts.autoAnswer.stop : buttonTexts.autoAnswer.start;
      },
      delay: answerDelay,
      delayKey: "answerDelay",
    },
    {
      text: autoNextQuestion ? buttonTexts.autoNextQuestion.stop : buttonTexts.autoNextQuestion.start,
      state: autoNextQuestion,
      onClick: () => {
        autoNextQuestion = !autoNextQuestion;
        GM_setValue("autoNextQuestion", autoNextQuestion);
        Promise.resolve().then(() => {
          botoperate();
        });
        return autoNextQuestion ? buttonTexts.autoNextQuestion.stop : buttonTexts.autoNextQuestion.start;
      },
      delay: nextQuestionDelay,
      delayKey: "nextQuestionDelay",
    },
    {
      text: autoNextExercise ? buttonTexts.autoNextExercise.stop : buttonTexts.autoNextExercise.start,
      state: autoNextExercise,
      onClick: () => {
        autoNextExercise = !autoNextExercise;
        GM_setValue("autoNextExercise", autoNextExercise);
        Promise.resolve().then(() => {
          botoperate();
        });
        return autoNextExercise ? buttonTexts.autoNextExercise.stop : buttonTexts.autoNextExercise.start;
      },
      delay: nextExerciseDelay,
      delayKey: "nextExerciseDelay",
    },
    {
      text: autoRepeatAnswers ? buttonTexts.autoRepeatAnswers.stop : buttonTexts.autoRepeatAnswers.start,
      state: autoRepeatAnswers,
      onClick: () => {
        autoRepeatAnswers = !autoRepeatAnswers;
        GM_setValue("autoRepeatAnswers", autoRepeatAnswers);
        Promise.resolve().then(() => {
          botoperate();
        });
        return autoRepeatAnswers ? buttonTexts.autoRepeatAnswers.stop : buttonTexts.autoRepeatAnswers.start;
      },
      delay: repeatAnswersDelay,
      delayKey: "repeatAnswersDelay",
    },
  ];

  // 根據保存的順序添加按鈕
  const buttonGroups = [];
  buttonOrder.forEach((orderIndex, i) => {
    const btn = buttons[orderIndex];
    const button = createButton(btn.text, btn.state, btn.onClick);
    const group = createButtonGroup(
      button,
      btn.delay,
      btn.delayKey,
      orderIndex
    );
    buttonGroups.push(group);
  });

  buttonGroups.forEach((group) => {
    contentContainer.appendChild(group);
  });

  // 切換按鈕的點擊事件 (統一最小化和恢復功能)
  toggleButton.onclick = function () {
    if (!isControlPanelMinimized) {
      // 最小化面板
      const buttonRect = toggleButton.getBoundingClientRect();
      
      // 設定動畫起點為按鈕位置
      buttonContainer.style.setProperty('--origin-x', 
        buttonRect.left + buttonRect.width/2 - parseInt(buttonContainer.style.left) + 'px');
      buttonContainer.style.setProperty('--origin-y', 
        buttonRect.top + buttonRect.height/2 - parseInt(buttonContainer.style.top) + 'px');
      
      // 添加收合動畫
      buttonContainer.classList.remove('panel-expanding');
      buttonContainer.classList.add('panel-collapsing');
      
      // 動畫結束後隱藏面板
      setTimeout(() => {
        buttonContainer.style.display = "none";
        toggleButton.textContent = "+";
        isControlPanelMinimized = true;
        GM_setValue("isMinimized", true);
      }, 300);
    } else {
      // 恢復面板
      // 獲取切換按鈕的實際位置和尺寸
      const buttonRect = toggleButton.getBoundingClientRect();
  
      // 計算最佳位置
      const optimalPosition = calculateOptimalPanelPosition(buttonRect);
  
      // 設置控制面板位置
      buttonContainer.style.top = optimalPosition.position.top;
      buttonContainer.style.left = optimalPosition.position.left;
      
      // 設定動畫起點為按鈕位置
      buttonContainer.style.setProperty('--origin-x', 
        buttonRect.left + buttonRect.width/2 - parseInt(buttonContainer.style.left) + 'px');
      buttonContainer.style.setProperty('--origin-y', 
        buttonRect.top + buttonRect.height/2 - parseInt(buttonContainer.style.top) + 'px');
      
      // 顯示控制面板
      buttonContainer.style.display = "flex";
      buttonContainer.classList.remove('panel-collapsing');
      buttonContainer.classList.add('panel-expanding');
  
      toggleButton.textContent = "−";
      isControlPanelMinimized = false;
      GM_setValue("isMinimized", false);
    }
  
    // 添加點擊效果
    toggleButton.style.transform = "scale(0.9) !important";
    setTimeout(() => {
      toggleButton.style.transform = "";
    }, 150);
  };

  makeElementDraggable(buttonContainer);

  // 添加窗口大小變化的監聽，自動調整控制面板位置
  window.addEventListener("resize", function () {
    if (!isControlPanelMinimized && buttonContainer) {
      // 獲取當前控制面板位置
      const panelRect = buttonContainer.getBoundingClientRect();

      // 確保控制面板不會超出視窗範圍
      const maxX = window.innerWidth - panelRect.width;
      const maxY = window.innerHeight - panelRect.height;

      if (panelRect.right > window.innerWidth) {
        buttonContainer.style.left = `${maxX}px`;
      }

      if (panelRect.bottom > window.innerHeight) {
        buttonContainer.style.top = `${maxY}px`;
      }
    }
  });
}

function setupDragAndDrop(element, container) {
  let draggedItem = null;
  let initialX, initialY;
  let offsetX, offsetY;
  let isDragging = false;
  let placeholder = null;
  let initialIndex = -1;

  // 只有拖動手柄才能觸發拖動
  const dragHandle = element.querySelector(".drag-handle");

  dragHandle.addEventListener("mousedown", startDrag);

  function startDrag(e) {
    e.preventDefault();

    // 獲取初始位置
    draggedItem = element;
    initialX = e.clientX;
    initialY = e.clientY;

    // 計算偏移量
    const rect = draggedItem.getBoundingClientRect();
    offsetX = initialX - rect.left;
    offsetY = initialY - rect.top;

    // 記錄初始索引
    const groups = Array.from(container.querySelectorAll(".button-group"));
    initialIndex = groups.indexOf(draggedItem);

    // 創建佔位元素
    placeholder = document.createElement("div");
    placeholder.style.width = `${rect.width}px`;
    placeholder.style.height = `${rect.height}px`;
    placeholder.style.margin = "0";
    placeholder.style.padding = "0";
    placeholder.style.background = "rgba(255, 255, 255, 0.1)";
    placeholder.style.borderRadius = "16px";
    placeholder.style.border = "2px dashed rgba(255, 255, 255, 0.3)";
    placeholder.style.transition = "all 0.2s ease";
    placeholder.className = "drag-placeholder";

    // 添加拖動樣式
    draggedItem.classList.add("dragging");
    draggedItem.style.position = "absolute";
    draggedItem.style.zIndex = "1000";
    draggedItem.style.width = `${rect.width}px`;
    draggedItem.style.boxShadow = "0 15px 35px rgba(0, 0, 0, 0.6)";
    isDragging = true;

    // 插入佔位元素
    container.insertBefore(placeholder, draggedItem);

    // 更新拖曳元素位置
    updateDraggedPosition(e);

    // 添加拖動事件監聽器
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", endDrag);
  }

  function drag(e) {
    if (!isDragging || !draggedItem) return;

    e.preventDefault();
    updateDraggedPosition(e);

    // 檢查是否需要重新排序
    const allGroups = Array.from(
      container.querySelectorAll(".button-group:not(.dragging)")
    );
    const closestGroup = findClosestElement(e.clientX, e.clientY, allGroups);

    if (closestGroup) {
      const rect = closestGroup.getBoundingClientRect();

      // 確定放置位置（前面或後面）
      if (e.clientX < rect.left + rect.width / 2) {
        container.insertBefore(placeholder, closestGroup);
      } else {
        container.insertBefore(placeholder, closestGroup.nextSibling);
      }
    }
  }

  function updateDraggedPosition(e) {
    if (!draggedItem) return;
    // 直接將元素位置設為滑鼠位置減去偏移
    draggedItem.style.left = `${e.clientX - offsetX}px`;
    draggedItem.style.top = `${e.clientY - offsetY}px`;
  }

  function endDrag(e) {
    if (draggedItem && placeholder) {
      // 將拖曳元素放置到佔位元素的位置
      container.insertBefore(draggedItem, placeholder);
      container.removeChild(placeholder);

      // 移除拖動樣式
      draggedItem.classList.remove("dragging");
      draggedItem.style.position = "";
      draggedItem.style.top = "";
      draggedItem.style.left = "";
      draggedItem.style.zIndex = "";
      draggedItem.style.width = "";
      draggedItem.style.boxShadow = "";

      // 添加放置動畫效果
      draggedItem.style.transform = "scale(1.05)";
      setTimeout(() => {
        draggedItem.style.transform = "";
      }, 200);

      // 保存新的按鈕順序
      saveButtonOrder();

      // 檢查是否有實際移動
      const groups = Array.from(container.querySelectorAll(".button-group"));
      const finalIndex = groups.indexOf(draggedItem);

      if (initialIndex !== finalIndex) {
        // 播放移動音效或其他反饋
        draggedItem.style.animation = "pulse 0.5s ease";
        setTimeout(() => {
          draggedItem.style.animation = "";
        }, 500);
      }

      draggedItem = null;
      placeholder = null;
      isDragging = false;
    }

    // 移除事件監聽器
    document.removeEventListener("mousemove", drag);
    document.removeEventListener("mouseup", endDrag);
  }

  // 找到最接近的元素
  function findClosestElement(x, y, elements) {
    let closest = null;
    let minDistance = Number.MAX_VALUE;

    elements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // 使用二維距離計算
      const distance = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        closest = element;
      }
    });

    return closest;
  }

  // 保存按鈕順序
  function saveButtonOrder() {
    const groups = Array.from(container.querySelectorAll(".button-group"));
    const newOrder = groups.map((group) => parseInt(group.dataset.index));

    // 過濾掉無效值
    const filteredOrder = newOrder.filter((index) => !isNaN(index));

    // 保存新順序
    buttonOrder = filteredOrder;
    GM_setValue("buttonOrder", buttonOrder);
  }
}

function botoperate() {
  if (
    autoAnswer &&
    divShowStatus.correctAnswerDiv === "none" &&
    divShowStatus.completedAllDiv === "none" &&
    divShowStatus.retakeAnswerDiv === "none"
  ) {
    setTimeout(() => {
      answer_is_correct();
      console.log("執行: 自動答題");
    }, answerDelay);
  }

  if (
    autoNextQuestion &&
    divShowStatus.correctAnswerDiv === "block" &&
    divShowStatus.completedAllDiv !== "block" &&
    divShowStatus.retakeAnswerDiv !== "block"
  ) {
    setTimeout(() => {
      if (qnumber + 1 !== totalqnumbers) {
        let nextButton = correctAnswerDiv.querySelector(
          'button[onclick="goto_next_question()"]'
        );
        if (nextButton) {
          console.log("執行: 點擊下一題按鈕");
          nextButton.click();
        }
      }
    }, nextQuestionDelay);
  }

  if (
    autoNextExercise &&
    divShowStatus.completedAllDiv === "block" &&
    divShowStatus.retakeAnswerDiv !== "block"
  ) {
    setTimeout(() => {
      if (qnumber + 1 === totalqnumbers) {
        let nextButton = document.querySelector("#next_exercise_btn");
        if (nextButton) {
          console.log("執行: 點擊下一題組按鈕");
          nextButton.click();
        }
      }
    }, nextExerciseDelay);
  }

  if (autoRepeatAnswers && divShowStatus.retakeAnswerDiv === "block") {
    setTimeout(() => {
      let retakeButton = retakeanswerDiv.querySelector(
        '.ws-btn[onclick="retake_exercise()"]'
      );
      if (retakeButton) {
        console.log("執行: 點擊重複作答按鈕");
        retakeButton.click();
      }
    }, repeatAnswersDelay);
  }
}

function exerciseWindowRefresh() {
  correctAnswerDiv = document.querySelector(".correctanswer");
  completedAllDiv = document.querySelector(".completed_all");
  retakeanswerDiv = document.querySelector(".retakeanswer");
  divShowStatus = {
    correctAnswerDiv: correctAnswerDiv
      ? window.getComputedStyle(correctAnswerDiv).display
      : "none",
    completedAllDiv: completedAllDiv
      ? window.getComputedStyle(completedAllDiv).display
      : "none",
    retakeAnswerDiv: retakeanswerDiv
      ? window.getComputedStyle(retakeanswerDiv).display
      : "none",
  };
  botoperate();
}

function setupPageObserver() {
  console.log("初始化: 設置頁面監聽器");

  const waitForExerciseWindow = setInterval(() => {
    const targetNode = document.querySelector(".exercisewindow");
    if (targetNode) {
      clearInterval(waitForExerciseWindow);
      console.log("發現練習視窗，開始監聽");

      const config = {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["style", "class"],
      };

      const callback = function (mutationsList, observer) {
        for (const mutation of mutationsList) {
          const hasAnswerButton = targetNode.querySelector(
            ".w3-btn.w3-green.w3-margin-bottom"
          );
          const hasRetakeDiv = targetNode.querySelector(".retakeanswer");

          if (hasAnswerButton || hasRetakeDiv) {
            console.log("偵測到練習視窗更新: 執行自動操作");
            exerciseWindowRefresh();
          }
        }
      };

      const observer = new MutationObserver(callback);
      observer.observe(targetNode, config);
    }
  }, 100);
}

(async function () {
  "use strict";

  window.onload = function () {
    createToggleButton();
    setupPageObserver();
    exerciseWindowRefresh();
  };
})();
