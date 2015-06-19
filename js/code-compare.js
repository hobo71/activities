var CodeCompare = function (runner, questions) {
  "use strict";

  var
    editor = null,
    current = 0,
    elems = {
      form: document.getElementById('question-form')
    }
  ;

  var init = function () {
    editor = ace.edit("editor");
    editor.setTheme("ace/theme/idle_fingers");
    editor.getSession().setMode("ace/mode/html");

    editor.getSession().setUseSoftTabs(false);
    editor.getSession().setTabSize(2);
    editor.getSession().setUseWrapMode(false);
    editor.setHighlightActiveLine(true);
    editor.setDisplayIndentGuides(true);
    editor.setShowInvisibles(true);
    editor.setShowPrintMargin(false);
    editor.setShowFoldWidgets(false);
    editor.getSession().setOption('useWorker', false);
  };

  var bindEvents = function () {
    elems.form.addEventListener('submit', function (e) {
      e.preventDefault();
      advanceOrFail();
    });
  };

  var hasAnotherQuestion = function () {
    return !(current == questions.length - 1);
  };

  var populateQuestion = function (id) {
    editor.setValue(questions[id].incorrect);
    editor.navigateFileStart();
    editor.focus();
  };

  var advanceQuestion = function () {
    if (hasAnotherQuestion()) {
      current++;
      populateQuestion(current);
    } else {
      runner.send('end');
    }
  };

  var advanceOrFail = function () {
    switch (isAnswerCorrect()) {
      case 'yes':
        runner.send('success', function () {
          advanceQuestion();
        });
        break;

      case 'no':
        runner.send('failure', function () {
          editor.focus();
        });
        break;

      default:
        runner.send('failure', function () {
          editor.focus();
        });
        break;
    }
  };

  var isAnswerCorrect = function () {
    if (editor.getValue() === questions[current].correct) {
      return 'yes';
    } else {
      return 'no';
    }
  };

  init();
  bindEvents();

  runner.listen('start', function () {
    populateQuestion(current);
  });
};
