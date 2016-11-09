/**
 * Created on 08.05.2016.
 */
define(function(require) {
  'use strict';

  var properties = require('properties');
  var event = require('event');

  var dataStore = require('stores/datastore');
  var actions = require('stores/actions');

  require('style!css/widgets/question.css');

  var questionTemplate = require('html!assets/templates/question.html');

  var Question = function(jsonData, model, pageModel, uniqueId) {
    var self = this;

    this.completed = false;
    this.selectedAnswer = null;
    this.answers = jsonData.question_answers;

    var view = questionTemplate.cloneNode(true);
    this.questionContainer = view.querySelector('.question-container');
    this.view = view;

    if (jsonData.type) {
      view.classList.add(jsonData.type);
    }

    var ariaText = jsonData.question_text.replace(/<span(.*?)>(.*?)<\/span>/g, '$2');
    view.setAttribute('aria-label', ariaText);
    view.querySelector('.question-text').innerHTML = jsonData.question_text;

    var answersContainer = view.querySelector('.question-answers');
    var answerTemplate = view.querySelector('.question-answer');
    var questionPrompt = view.querySelector('.question-prompt');

    // Randomize order of the questions if randomize option is set
    if (jsonData.randomize) {
      this.answers = _.shuffle(this.answers);
    }

    _.forEach(this.answers, function(answerData, i) {
      var answer = answerTemplate.cloneNode(true);
      answer.style.display = '';

      var id = 'question' + uniqueId + '-' + (i + 1);
      var input = answer.querySelector('input');
      input.setAttribute('id', id);
      input.setAttribute('value', i);
      input.setAttribute('name', 'question' + uniqueId);

      var label = answer.querySelector('label');
      label.setAttribute('for', id);
      label.innerHTML = answerData;

      if (!jsonData.question_answers_images && jsonData.descriptions && jsonData.descriptions[i]) {
        label.setAttribute('aria-label', jsonData.descriptions[i]);
      }

      if (jsonData.question_answers_images) {
        var image = new Image();
        image.src = 'images/' + jsonData.question_answers_images[i];

        if (jsonData.descriptions && jsonData.descriptions[i]) {
          image.alt = jsonData.descriptions[i];
        }

        label.appendChild(image);
      }

      // Completed if selected
      input.addEventListener('change', function(ind, e) {
        self.completed = true;
        self.selectedAnswer = ind;
        self.questionContainer.classList.remove('error');

        e.stopPropagation();
        e.preventDefault();
      }.bind(this, i));

      answersContainer.appendChild(answer);
    });

    // Check answer on click next page
    event.addCustomEventListener(actions.NEXT_PAGE, function(e) {
      if (model.currentPage !== pageModel.i) { return false; }

      self.attemptSubmit();

      // Export answer
      if (self.completed) {
        dataStore.setData(jsonData.exports_to, self.selectedAnswer);
      } else {
        // Prevent flip of pages
        e.stop = true;
        questionPrompt.focus();
      }
    });

    return view;
  };

  // Check if the user has input an answer before moving forward
  Question.prototype.attemptSubmit = function() {
    this.questionContainer.classList.remove('error');

    if (!this.completed) {
      this.questionContainer.classList.add('error');
    }
  };

  return Question;
});