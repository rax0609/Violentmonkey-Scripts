(function () {
  window.w3AutoHelper = window.w3AutoHelper || {};

  window.w3AutoHelper.core = (function () {
    const ConfigManager = window.w3AutoHelper.ConfigManager;
    const logger = window.w3AutoHelper.logger;
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
        logger.debug("準備提交答案");
        setTimeout(() => {
          answer_is_correct();
          logger.debug("已提交答案");
        }, answerDelay);
      }

      if (
        autoNextQuestion &&
        divShowStatus.correctAnswerDiv === "block" &&
        divShowStatus.completedAllDiv !== "block" &&
        divShowStatus.retakeAnswerDiv !== "block"
      ) {
        logger.info("準備進入下一題");
        setTimeout(() => {
          if (qnumber + 1 !== totalqnumbers) {
            let nextButton = correctAnswerDiv.querySelector(
              'button[onclick="goto_next_question()"]'
            );
            if (nextButton) {
              logger.debug("點擊下一題按鈕");
              nextButton.click();
            } else {
              logger.warn("找不到下一題按鈕，嘗試直接調用函數");
              goto_next_question();
            }
          }
        }, nextQuestionDelay);
      }

      if (
        autoNextExercise &&
        divShowStatus.completedAllDiv === "block" &&
        divShowStatus.retakeAnswerDiv !== "block"
      ) {
        logger.info("準備進入下一題組");
        setTimeout(() => {
          if (qnumber + 1 === totalqnumbers) {
            let nextButton = document.querySelector("#next_exercise_btn");
            if (nextButton) {
              logger.debug("點擊下一題組按鈕");
              nextButton.click();
            } else {
              logger.warn("找不到下一題組按鈕，請手動操作");
            }
          }
        }, nextExerciseDelay);
      }

      if (autoRepeatAnswers && divShowStatus.retakeAnswerDiv === "block") {
        logger.info("準備重新作答");
        setTimeout(() => {
          let retakeButton = retakeanswerDiv.querySelector(
            '.ws-btn[onclick="retake_exercise()"]'
          );
          if (retakeButton) {
            logger.debug("點擊重新作答按鈕");
            retakeButton.click();
          } else {
            logger.warn("找不到重新作答按鈕，嘗試直接調用函數");
            retake_exercise();
          }
        }, repeatAnswersDelay);
      }
    }

    function initialize() {
      // 訂閱設定變更
      ConfigManager.subscribe((key, value) => {
        if (key.startsWith("auto") || key.endsWith("Delay")) {
          logger.debug("設定已變更，以新設定執行");
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
      logger.debug("開始檢測窗口類別");
      if (divShowStatus.correctAnswerDiv === "block") {
        logger.debug("檢測到題目完成");
      }
      if (divShowStatus.completedAllDiv === "block") {
        logger.debug("檢測到題組完成");
      }
      if (divShowStatus.retakeAnswerDiv === "block") {
        logger.debug("檢測到重複答題");
      }
      manageAutoAnswers();
    }

    function setupPageObserver() {
      const waitForExerciseWindow = setInterval(() => {
        const targetNode = document.querySelector(".exercisewindow");
        if (targetNode) {
          logger.debug("已檢測到測驗區域");
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
                logger.debug("檢測到測驗區域變更");
                exerciseWindowRefresh();
              }
            }
          };

          const observer = new MutationObserver(callback);
          observer.observe(targetNode, config);
        } else {
          logger.debug("等待 exercisewindow 出現");
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
})();
