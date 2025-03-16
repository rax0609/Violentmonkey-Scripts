(function () {
  "use strict";

  window.w3AutoHelper = window.w3AutoHelper || {};

  window.w3AutoHelper.buttons = (function () {
    const logger = window.w3AutoHelper.logger;
    const ConfigManager = window.w3AutoHelper.ConfigManager;
    const core = window.w3AutoHelper.core;

    function createAutoButton(config) {
      const button = document.createElement("button");
      const state = ConfigManager.getAutoFunction(config.key);

      function updateButton(newState) {
        button.className = `control-button ${newState ? "active" : "inactive"}`;
        button.textContent = ConfigManager.getButtonText(config.key, newState);

        // 添加點擊效果
        button.style.transform = "scale(0.95)";
        setTimeout(() => {
          button.style.transform = "";
        }, 150);
      }

      updateButton(state);

      button.onclick = () => {
        const newState = !ConfigManager.getAutoFunction(config.key);
        ConfigManager.setAutoFunction(config.key, newState);
        updateButton(newState);
        
        // 觸發自動操作檢查
        Promise.resolve().then(() => {
          core.manageAutoAnswers();
        });
      };

      return button;
    }

    function createDelayInput(delayKey) {
      const delayInput = document.createElement("input");
      delayInput.className = "delay-input";
      delayInput.type = "number";
      delayInput.value = ConfigManager.getDelay(delayKey);
      delayInput.min = "0";
      delayInput.step = "100";

      const label = document.createElement("div");
      label.className = "control-label";
      label.textContent = "延時(ms)";

      delayInput.addEventListener("change", (event) => {
        const value = parseInt(event.target.value) || 500;
        ConfigManager.setDelay(delayKey, value);

        // 添加變更效果
        delayInput.style.boxShadow = 
          "0 0 0 3px rgba(76, 175, 80, 0.4), inset 0 1px 3px rgba(0, 0, 0, 0.2)";
        setTimeout(() => {
          delayInput.style.boxShadow = "";
        }, 800);
      });

      const container = document.createElement("div");
      container.appendChild(delayInput);
      container.appendChild(label);
      
      return container;
    }

    function createButtonGroup(buttonConfig, index) {
      const group = document.createElement("div");
      group.className = "button-group";
      group.dataset.index = index;

      // 添加拖動手柄
      const dragHandle = document.createElement("div");
      dragHandle.className = "drag-handle";
      group.appendChild(dragHandle);

      const button = createAutoButton(buttonConfig);
      const delayInputContainer = createDelayInput(buttonConfig.delayKey);

      group.appendChild(button);
      group.appendChild(delayInputContainer);

      return group;
    }

    function getButtonConfig(index) {
      const configs = {
        0: {
          key: 'autoAnswer',
          delayKey: 'answerDelay',
          texts: ConfigManager.getButtonTexts('autoAnswer')
        },
        1: {
          key: 'autoNextQuestion',
          delayKey: 'nextQuestionDelay',
          texts: ConfigManager.getButtonTexts('autoNextQuestion')
        },
        2: {
          key: 'autoNextExercise',
          delayKey: 'nextExerciseDelay',
          texts: ConfigManager.getButtonTexts('autoNextExercise')
        },
        3: {
          key: 'autoRepeatAnswers',
          delayKey: 'repeatAnswersDelay',
          texts: ConfigManager.getButtonTexts('autoRepeatAnswers')
        }
      };

      return configs[index];
    }

    return {
      createAutoButton,
      createButtonGroup,
      getButtonConfig: ConfigManager.getButtonConfig.bind(ConfigManager)
    };
  })();
})();
