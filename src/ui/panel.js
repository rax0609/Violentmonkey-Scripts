(function () {
  "use strict";

  window.w3AutoHelper = window.w3AutoHelper || {};

  window.w3AutoHelper.panel = (function () {
    const logger = window.w3AutoHelper.logger;
    const ConfigManager = window.w3AutoHelper.ConfigManager;
    const bts = window.w3AutoHelper.buttons;
    let buttonContainer, toggleButton;

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

      container.appendChild(button);
      container.appendChild(delayInput);
      container.appendChild(label);

      // 添加拖拽功能
      setupDragAndDrop(container, contentContainer);

      return container;
    }

    const buttons = [
      {
        text: autoAnswer
          ? buttonTexts.autoAnswer.stop
          : buttonTexts.autoAnswer.start,
        state: autoAnswer,
        onClick: () => {
          autoAnswer = !autoAnswer;
          GM_setValue("autoAnswer", autoAnswer);
          Promise.resolve().then(() => {
            botoperate();
          });
          return autoAnswer
            ? buttonTexts.autoAnswer.stop
            : buttonTexts.autoAnswer.start;
        },
        delay: answerDelay,
        delayKey: "answerDelay",
      },
      {
        text: autoNextQuestion
          ? buttonTexts.autoNextQuestion.stop
          : buttonTexts.autoNextQuestion.start,
        state: autoNextQuestion,
        onClick: () => {
          autoNextQuestion = !autoNextQuestion;
          GM_setValue("autoNextQuestion", autoNextQuestion);
          Promise.resolve().then(() => {
            botoperate();
          });
          return autoNextQuestion
            ? buttonTexts.autoNextQuestion.stop
            : buttonTexts.autoNextQuestion.start;
        },
        delay: nextQuestionDelay,
        delayKey: "nextQuestionDelay",
      },
      {
        text: autoNextExercise
          ? buttonTexts.autoNextExercise.stop
          : buttonTexts.autoNextExercise.start,
        state: autoNextExercise,
        onClick: () => {
          autoNextExercise = !autoNextExercise;
          GM_setValue("autoNextExercise", autoNextExercise);
          Promise.resolve().then(() => {
            botoperate();
          });
          return autoNextExercise
            ? buttonTexts.autoNextExercise.stop
            : buttonTexts.autoNextExercise.start;
        },
        delay: nextExerciseDelay,
        delayKey: "nextExerciseDelay",
      },
      {
        text: autoRepeatAnswers
          ? buttonTexts.autoRepeatAnswers.stop
          : buttonTexts.autoRepeatAnswers.start,
        state: autoRepeatAnswers,
        onClick: () => {
          autoRepeatAnswers = !autoRepeatAnswers;
          GM_setValue("autoRepeatAnswers", autoRepeatAnswers);
          Promise.resolve().then(() => {
            botoperate();
          });
          return autoRepeatAnswers
            ? buttonTexts.autoRepeatAnswers.stop
            : buttonTexts.autoRepeatAnswers.start;
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

    // 新增: 封裝最小化面板的功能
    function minimizePanel() {
      if (!isControlPanelMinimized) {
        console.log("執行面板最小化");

        // 獲取面板和按鈕的位置信息
        const panelRect = buttonContainer.getBoundingClientRect();

        // 計算要設置的縮回原點（面板左上角）
        buttonContainer.style.setProperty("--origin-x", "0px");
        buttonContainer.style.setProperty("--origin-y", "0px");

        // 先保存按鈕應該回到的位置
        const targetTop = panelRect.top + "px";
        const targetLeft = panelRect.left + "px";

        // 添加收合動畫
        buttonContainer.classList.remove("panel-expanding");
        buttonContainer.classList.add("panel-collapsing");

        // 動畫結束後隱藏面板，顯示切換按鈕，並將按鈕放置到面板左上角
        setTimeout(() => {
          // 先變更狀態，再處理UI變化
          isControlPanelMinimized = true;
          GM_setValue("isMinimized", true);

          // 設置面板為隱藏
          buttonContainer.style.display = "none";

          // 設置按鈕位置為面板左上角
          toggleButton.style.top = targetTop;
          toggleButton.style.left = targetLeft;

          // 將位置保存到 GM_setValue
          restoreButtonPosition = {
            top: targetTop,
            left: targetLeft,
          };
          GM_setValue("restoreButtonPosition", restoreButtonPosition);

          // 強制顯示浮動按鈕 - 特別確保它一定顯示
          toggleButton.textContent = "+";
          toggleButton.style.setProperty("display", "flex", "important");

          console.log("面板已最小化，按鈕位置：", targetTop, targetLeft);
        }, 300);
      }
    }

    function expandPanel() {
      if (isControlPanelMinimized) {
        console.log("執行面板展開");

        // 獲取切換按鈕的實際位置和尺寸
        const buttonRect = toggleButton.getBoundingClientRect();

        // 計算最佳位置
        const optimalPosition = calculateOptimalPanelPosition(buttonRect);

        // 設置控制面板位置
        buttonContainer.style.top = optimalPosition.position.top;
        buttonContainer.style.left = optimalPosition.position.left;

        // 設定動畫起點為按鈕中心相對於面板的位置
        // 由於我們希望從面板左上角展開，設置為(0,0)
        buttonContainer.style.setProperty("--origin-x", "0px");
        buttonContainer.style.setProperty("--origin-y", "0px");

        // 先變更狀態
        isControlPanelMinimized = false;
        GM_setValue("isMinimized", false);

        // 保存新的面板位置到全局變數和 GM_setValue，確保下次加載時能記住位置
        restoreButtonPosition = {
          top: optimalPosition.position.top,
          left: optimalPosition.position.left,
        };
        GM_setValue("restoreButtonPosition", restoreButtonPosition);

        // 強制隱藏浮動按鈕
        toggleButton.style.setProperty("display", "none", "important");
        toggleButton.textContent = "−";

        // 顯示控制面板
        buttonContainer.style.display = "flex";

        buttonContainer.classList.remove("panel-collapsing");
        buttonContainer.classList.add("panel-expanding");

        console.log(
          "面板已展開，位置：",
          optimalPosition.position.top,
          optimalPosition.position.left
        );
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
            Math.max(0, Math.min(buttonRect.left, windowWidth - panelWidth)) +
            "px",
        };
      }
      // 檢查頂部空間
      else if (spaceTop >= panelHeight) {
        bestDirection = "top";
        bestPosition = {
          top: buttonRect.top - panelHeight + buttonRect.height + "px",
          left:
            Math.max(0, Math.min(buttonRect.left, windowWidth - panelWidth)) +
            "px",
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
                Math.max(
                  0,
                  Math.min(buttonRect.left, windowWidth - panelWidth)
                ) + "px",
            };
            break;
          case "top":
            bestPosition = {
              top: buttonRect.top - panelHeight + buttonRect.height + "px",
              left:
                Math.max(
                  0,
                  Math.min(buttonRect.left, windowWidth - panelWidth)
                ) + "px",
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
    // 新增: 添加點擊外部收回面板功能
    function setupOutsideClickListener() {
      document.addEventListener("mousedown", function (event) {
        // 如果控制面板已經最小化，或者點擊的是控制面板或切換按鈕本身，則不處理
        if (
          isControlPanelMinimized ||
          event.target.closest(".control-container") ||
          event.target.closest(".toggle-button")
        ) {
          return;
        }

        // 點擊在面板外部，觸發收回動作
        minimizePanel();
      });
    }

    function initialize() {
        try {
            logger.debug('初始化控制面板');
            
            createToggleButton();
            setupOutsideClickListener();
            
            // 同步面板狀態
            const isMinimized = ConfigManager.getSetting('isMinimized');
            if (isMinimized) {
                minimizePanel(false); // false 表示不觸發動畫
            } else {
                expandPanel(false);
            }
            
            logger.info('控制面板初始化完成');
        } catch (error) {
            logger.error('控制面板初始化失敗', error);
        }
    }

    function getState() {
        return {
            isMinimized: isControlPanelMinimized,
            position: {
                top: buttonContainer?.style.top,
                left: buttonContainer?.style.left
            }
        };
    }

    return {
        initialize,       // 初始化面板
        minimizePanel,    // 最小化面板
        expandPanel,      // 展開面板
        getState,        // 取得面板狀態
    };
  })();
})();
