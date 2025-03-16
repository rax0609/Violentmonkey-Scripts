(function () {
  "use strict";

  window.w3AutoHelper = window.w3AutoHelper || {};

  window.w3AutoHelper.buttons = (function () {
    const logger = window.w3AutoHelper.logger;
    const ConfigManager = window.w3AutoHelper.ConfigManager;

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
    }

    return {
      createButton,
      createButtonGroup,
    };
  })();
})();
