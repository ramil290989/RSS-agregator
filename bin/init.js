import onChange from 'on-change';
import * as yup from 'yup';
import render from './render.js';

const init = () => {
  const state = {
    form: {
      processState: 'filling',
      errors: '',
    },
    feeds: [],
    posts: [],
    readPostsId: [],
  };

  const htmlElements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    feedbackMessage: document.querySelector('.feedback'),
    feeds: document.querySelector('.feeds'),
  };

  const watchedState = onChange(state, render(state, htmlElements));

  const validateInputUrl = (inputText) => {
    const validateSchema = yup
      .string()
      .url('неверный URL адрес')
      .notOneOf(state.feeds, 'такой фид уже существует').required();
    validateSchema.validate(inputText)
      .then((newFeed) => {
        watchedState.form.errors = '';
        watchedState.feeds.push(newFeed);
      })
      .catch((error) => {
        watchedState.form.errors = error.message;
      });
  };

  htmlElements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const inputUrl = formData.get('url');
    validateInputUrl(inputUrl);
  });
};

export default init;
