var MultipleChoice = function (runner, questions) {
  'use strict';

  var current = 0;
  var elems = {
    title: document.getElementById('question-title'),
    choices: document.getElementById('question-choices'),
    form: document.getElementById('question-form'),
    extras: document.getElementById('extras'),
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

  var createChoiceElement = function (i, label) {
    var tmpLi, tmpRadio, tmpLabel;
    tmpLi = document.createElement('li');

    tmpRadio = document.createElement('input');
    tmpRadio.setAttribute('type', 'radio');
    tmpRadio.setAttribute('name', 'question-choices');
    tmpRadio.id = 'choice-' + i;
    tmpRadio.setAttribute('data-id', i);
    tmpLi.appendChild(tmpRadio);

    tmpLabel = document.createElement('label');
    tmpLabel.setAttribute('for', 'choice-' + i);

    switch (typeof label) {
      case 'function':
        tmpLabel.classList.add('answer-code-block-label');
        tmpLabel.classList.add('push-1-2');
        tmpLabel.innerHTML = runner.wrapInCodeBlock(label(runner));
        break;
      case 'object': // array
        tmpLabel.innerHTML = label[0];
        break;
      default:
        tmpLabel.innerHTML = runner.convertToCode(runner.escape(label));
    }

    tmpLi.appendChild(tmpLabel);

    return tmpLi;
  };

  var populateQuestion = function (id) {
    var i = 0, t = questions[id].choices.length;

    elems.choices.innerHTML = '';
    elems.title.innerHTML = runner.convertToCode(runner.escape(questions[id].question));

    if (questions[id].extras) {
      elems.extras.innerHTML = document.getElementById(questions[id].extras).innerHTML;
    } else {
      elems.extras.innerHTML = '';
    }

    for (i; i<t; i++) {
      elems.choices.appendChild(createChoiceElement(i, questions[id].choices[i]));
    }

    if (questions[id].onStart) questions[id].onStart();
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
        }, { questionId: current });
        break;
      case 'no':
        runner.send('failure', false, { questionId: current });
        break;
      default:
        runner.send('failure', false, { questionId: current });
        break;
    }
  };

  var isAnswerCorrect = function () {
    var choice = elems.choices.querySelector(':checked');

    if (!choice) return;

    if (parseInt(choice.getAttribute('data-id'), 10) == questions[current].correct) {
      return 'yes';
    } else {
      return 'no';
    }
  };

  bindEvents();

  runner.listen('start', function () {
    populateQuestion(current);
  });
};
