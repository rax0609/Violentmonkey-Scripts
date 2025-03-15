window.w3AutoHelper.core = (function () {
  const ConfigManager = window.w3AutoHelper.ConfigManager;
  let correctAnswerDiv;
  let completedAllDiv;
  let retakeanswerDiv;
  let divShowStatus;

  function manageAutoAnswers() {
    // 使用 ConfigManager 取得設定
    const autoAnswer = ConfigManager.getSetting("autoAnswer");
    const autoNextQuestion = ConfigManager.getSetting("autoNextQuestion");
    const autoNextExercise = ConfigManager.getSetting("autoNextExercise");
    const autoRepeatAnswers = ConfigManager.getSetting("autoRepeatAnswers");

    const answerDelay = ConfigManager.getSetting("answerDelay");
    const nextQuestionDelay = ConfigManager.getSetting("nextQuestionDelay");
    const nextExerciseDelay = ConfigManager.getSetting("nextExerciseDelay");
    const repeatAnswersDelay = ConfigManager.getSetting("repeatAnswersDelay");

    if (
      autoAnswer &&
      divShowStatus.correctAnswerDiv === "none" &&
      divShowStatus.completedAllDiv === "none" &&
      divShowStatus.retakeAnswerDiv === "none"
    ) {
      setTimeout(() => {
        answer_is_correct();
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
          retakeButton.click();
        }
      }, repeatAnswersDelay);
    }
  }

  function initialize() {
    // 訂閱設定變更
    ConfigManager.subscribe((key, value) => {
      if (key.startsWith("auto") || key.endsWith("Delay")) {
        manageAutoAnswers();
      }
    });
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
    manageAutoAnswers();
  }

  function setupPageObserver() {
    const waitForExerciseWindow = setInterval(() => {
      const targetNode = document.querySelector(".exercisewindow");
      if (targetNode) {
        clearInterval(waitForExerciseWindow);

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
              exerciseWindowRefresh();
            }
          }
        };

        const observer = new MutationObserver(callback);
        observer.observe(targetNode, config);
      }
    }, 100);
  }

  return {
    initialize,
    manageAutoAnswers,
    exerciseWindowRefresh,
    setupPageObserver,
  };
})();
