window.w3AutoHelper.config = {
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
  },
};
