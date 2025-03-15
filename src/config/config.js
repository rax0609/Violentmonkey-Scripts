window.w3AutoHelper.ConfigManager = (function() {
    // 私有變數
    const subscribers = new Set();

    // 配置物件
    const config = {
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
        },
        settings: {
            autoFunctionsSettings: {
                autoAnswer: GM_getValue("autoAnswer", false),
                autoNextQuestion: GM_getValue("autoNextQuestion", false),
                autoNextExercise: GM_getValue("autoNextExercise", false),
                autoRepeatAnswers: GM_getValue("autoRepeatAnswers", false),
            },
            delay: {
                answerDelay: GM_getValue("answerDelay", 500),
                nextQuestionDelay: GM_getValue("nextQuestionDelay", 1000),
                nextExerciseDelay: GM_getValue("nextExerciseDelay", 1000),
                repeatAnswersDelay: GM_getValue("repeatAnswersDelay", 1000),
            },
            uiSettings: {
                isControlPanelMinimized: GM_getValue("isMinimized", false),
                buttonOrder: GM_getValue("buttonOrder", [0, 1, 2, 3]),
                restoreButtonPosition: GM_getValue("restoreButtonPosition", {
                    top: "20px",
                    left: "20px",
                }),
            },
        }
    };

    // 通知訂閱者
    function notifySubscribers(key, value) {
        subscribers.forEach(callback => callback(key, value));
    }

    return {
        // 取得設定值
        getSetting(key) {
            const sections = ['autoFunctionsSettings', 'delay', 'uiSettings'];
            for (const section of sections) {
                if (key in config.settings[section]) {
                    return config.settings[section][key];
                }
            }
            return null;
        },

        // 儲存設定值
        saveSettings(key, value) {
            GM_setValue(key, value);
            const sections = ['autoFunctionsSettings', 'delay', 'uiSettings'];
            for (const section of sections) {
                if (key in config.settings[section]) {
                    config.settings[section][key] = value;
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
                restoreButtonPosition: { top: "20px", left: "20px" }
            };

            Object.entries(defaults).forEach(([key, value]) => {
                this.saveSettings(key, value);
            });
        },

        // 初始化設定
        init() {
            // 驗證所有設定值是否存在，若不存在則設定預設值
            Object.entries(config.settings.autoFunctionsSettings).forEach(([key]) => {
                if (GM_getValue(key) === undefined) {
                    this.saveSettings(key, false);
                }
            });

            Object.entries(config.settings.delay).forEach(([key, defaultValue]) => {
                if (GM_getValue(key) === undefined) {
                    this.saveSettings(key, defaultValue);
                }
            });

            if (GM_getValue("buttonOrder") === undefined) {
                this.saveSettings("buttonOrder", [0, 1, 2, 3]);
            }
        },

        // 取得按鈕文字
        getButtonText(key, isActive) {
            return config.buttonTexts[key][isActive ? 'stop' : 'start'];
        },

        // 取得所有設定
        getAllSettings() {
            return JSON.parse(JSON.stringify(config.settings));
        }
    };
})();
