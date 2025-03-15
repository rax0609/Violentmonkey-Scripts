window.w3AutoHelper.core = (function () {
  const config = window.w3AutoHelper.config;
  let correctAnswerDiv;
  let completedAllDiv;
  let retakeanswerDiv;
  let divShowStatus;

  function botoperate() {
    const { autoFunctionsSettings, delay } = config.settings;

    if (
      autoFunctionsSettings.autoAnswer &&
      divShowStatus.correctAnswerDiv === "none" &&
      divShowStatus.completedAllDiv === "none" &&
      divShowStatus.retakeAnswerDiv === "none"
    ) {
      setTimeout(() => {
        answer_is_correct();
      }, delay.answerDelay);
    }

    if (
      autoFunctionsSettings.autoNextQuestion &&
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
      }, delay.nextQuestionDelay);
    }

    if (
      autoFunctionsSettings.autoNextExercise &&
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
      }, delay.nextExerciseDelay);
    }

    if (autoFunctionsSettings.autoRepeatAnswers && divShowStatus.retakeAnswerDiv === "block") {
      setTimeout(() => {
        let retakeButton = retakeanswerDiv.querySelector(
          '.ws-btn[onclick="retake_exercise()"]'
        );
        if (retakeButton) {
          retakeButton.click();
        }
      }, delay.repeatAnswersDelay);
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
    botoperate,
    exerciseWindowRefresh,
    setupPageObserver
  };
})();
