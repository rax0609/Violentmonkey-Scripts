(function () {
  "use strict";

  window.w3AutoHelper = window.w3AutoHelper || {};

  window.w3AutoHelper.buttons = (function () {
    const logger = window.w3AutoHelper.logger;
    const ConfigManager = window.w3AutoHelper.ConfigManager;

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
        toggleButton.style.display = isControlPanelMinimized ? "flex" : "none";
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
            minimizePanel(); // 使用封裝的最小化函數
          } else {
            expandPanel(); // 使用封裝的展開函數
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
      return {
        createToggleButton,
      };
  })();
})();
