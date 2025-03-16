(function () {
  'use strict';
  
  window.w3AutoHelper = window.w3AutoHelper || {};

  window.w3AutoHelper.ConfigManager = (function () {
    const logger = window.w3AutoHelper.logger;
    // 訂閱者集合
    const subscribers = new Set();
    
    // 私有狀態
    const config = {
      autoFunctions: {
        autoAnswer: GM_getValue("autoAnswer", false),
        autoNextQuestion: GM_getValue("autoNextQuestion", false),
        autoNextExercise: GM_getValue("autoNextExercise", false),
        autoRepeatAnswers: GM_getValue("autoRepeatAnswers", false)
      },
      delays: {
        answerDelay: GM_getValue("answerDelay", 500),
        nextQuestionDelay: GM_getValue("nextQuestionDelay", 500),
        nextExerciseDelay: GM_getValue("nextExerciseDelay", 500),
        repeatAnswersDelay: GM_getValue("repeatAnswersDelay", 500)
      },
      ui: {
        isMinimized: GM_getValue("isMinimized", false),
        buttonOrder: GM_getValue("buttonOrder", [0, 1, 2, 3]),
        position: GM_getValue("restoreButtonPosition", {
          top: "20px",
          left: "20px"
        })
      },
      buttonTexts: {
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
      }
    };

    // 通知訂閱者
    function notifySubscribers(key, value) {
      logger.debug(`設定已變更: ${key} = ${value}`);
      subscribers.forEach((callback) => callback(key, value));
    }

    return {
      getAutoFunction(key) {
        return config.autoFunctions[key];
      },
      
      setAutoFunction(key, value) {
        config.autoFunctions[key] = value;
        GM_setValue(key, value);
        logger.debug(`自動功能已更新: ${key} = ${value}`);
      },

      getDelay(key) {
        return config.delays[key];
      },

      setDelay(key, value) {
        config.delays[key] = value;
        GM_setValue(key, value);
        logger.debug(`延遲時間已更新: ${key} = ${value}`);
      },

      getUIState() {
        return { ...config.ui };
      },

      setUIState(key, value) {
        config.ui[key] = value;
        GM_setValue(key, value);
        logger.debug(`UI狀態已更新: ${key}`, value);
      },

      // 取得設定值
      getSetting(key) {
        const sections = ["autoFunctions", "delays", "ui"];
        for (const section of sections) {
          if (key in config[section]) {
            return config[section][key];
          }
        }
        return null;
      },

      // 儲存設定值
      saveSettings(key, value) {
        logger.debug(`儲存設定: ${key} = ${value}`);
        GM_setValue(key, value);
        const sections = ["autoFunctions", "delays", "ui"];
        for (const section of sections) {
          if (key in config[section]) {
            config[section][key] = value;
            notifySubscribers(key, value);
            break;
          }
        }
      },

      // 訂閱設定變更
      subscribe(callback) {
        subscribers.add(callback);
        return () => subscribers.delete(callback); // 返回取消訂閱函數
      },

      // 重設所有設定為預設值
      resetToDefaults() {
        logger.info("重設所有設定為預設值");
        const defaults = {
          autoAnswer: false,
          autoNextQuestion: false,
          autoNextExercise: false,
          autoRepeatAnswers: false,
          answerDelay: 500,
          nextQuestionDelay: 1000,
          nextExerciseDelay: 1000,
          repeatAnswersDelay: 1000,
          isMinimized: false,
          buttonOrder: [0, 1, 2, 3],
          restoreButtonPosition: { top: "20px", left: "20px" },
        };

        Object.entries(defaults).forEach(([key, value]) => {
          this.saveSettings(key, value);
        });
      },

      // 取得按鈕文字
      getButtonText(key, isActive) {
        const texts = config.buttonTexts[key];
        if (!texts) {
          logger.warn(`找不到按鈕文字配置: ${key}`);
          return isActive ? "停止" : "開始";
        }
        return texts[isActive ? "stop" : "start"];
      },

      // 取得所有按鈕文字設定
      getAllButtonTexts() {
        return JSON.parse(JSON.stringify(config.buttonTexts));
      },

      // 取得特定按鈕的所有文字
      getButtonTexts(key) {
        const texts = config.buttonTexts[key];
        if (!texts) {
          logger.warn(`找不到按鈕文字配置: ${key}`);
          return { start: "開始", stop: "停止" };
        }
        return { ...texts };
      },

      // 取得所有設定
      getAllSettings() {
        return JSON.parse(JSON.stringify(config));
      },

      // 取得按鈕設定
      getButtonConfig(index) {
        const configs = {
          0: {
            key: 'autoAnswer',
            delayKey: 'answerDelay',
            texts: this.getButtonTexts('autoAnswer')
          },
          1: {
            key: 'autoNextQuestion',
            delayKey: 'nextQuestionDelay',
            texts: this.getButtonTexts('autoNextQuestion')
          },
          2: {
            key: 'autoNextExercise',
            delayKey: 'nextExerciseDelay', 
            texts: this.getButtonTexts('autoNextExercise')
          },
          3: {
            key: 'autoRepeatAnswers',
            delayKey: 'repeatAnswersDelay',
            texts: this.getButtonTexts('autoRepeatAnswers')
          }
        };

        return configs[index];
      },
    };
  })();
})();
