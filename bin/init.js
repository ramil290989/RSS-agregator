import axios from 'axios';
import i18n from 'i18next';
import onChange from 'on-change';
import * as yup from 'yup';
import _ from 'lodash';
import resources from '../src/locales/index.js';
import render from './render.js';
import rssValidate from './rssValidate.js';
import rssParser from './rssParser.js';
import getAllOriginsUrl from './getAllOriginsUrl.js';

const init = () => {
  const state = {
    form: {
      processState: 'filling',
      errors: '',
    },
    feeds: [],
    posts: [],
  };

  const i18nInstance = i18n.createInstance();
  i18nInstance.init({
    lng: 'ru',
    debug: true,
    resources,
  });

  yup.setLocale({
    string: {
      url: 'urlIsInvalid',
    },
    mixed: {
      notOneOf: 'sameFeed',
      required: 'inputRequired',
    },
  });

  const validateSchema = yup
    .string()
    .url()
    .notOneOf(state.feeds.map((feed) => feed.url))
    .required();

  const htmlElements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    feedbackMessage: document.querySelector('.feedback'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
  };

  const timeoutInterval = 5000;

  const watchedState = onChange(state, render(state, htmlElements, i18nInstance));

  const validateInputUrl = (inputText) => {
    validateSchema.validate(inputText)
      .then((inputUrl) => {
        const url = getAllOriginsUrl(inputUrl);
        axios.get(url)
          .then((response) => {
            if (response.status === 200) {
              if (rssValidate(response.data.contents)) {
                const rssData = rssParser(response.data.contents);
                const feed = {
                  title: rssData.feed.title,
                  description: rssData.feed.description,
                  url: inputText,
                };
                const posts = rssData.posts.map((post) => ({
                  id: _.uniqueId(),
                  title: post.title,
                  link: post.link,
                  description: post.description,
                }));
                watchedState.form.errors = '';
                watchedState.feeds.unshift(feed);
                watchedState.posts = posts.concat(state.posts);
              } else {
                watchedState.form.errors = i18nInstance.t('errorMessages.noRssData');
              }
            }
          })
          .catch((error) => {
            watchedState.form.errors = i18nInstance.t(`errorMessages.${error.code}`);
          });
      })
      .catch((error) => {
        watchedState.form.errors = i18nInstance.t(`errorMessages.${error.errors}`);
      });
  };

  const rssUpdate = () => {
    state.feeds.forEach((feed) => {
      const url = getAllOriginsUrl(feed.url);
      axios.get(url)
        .then((response) => {
          watchedState.form.errors = '';
          const newData = rssParser(response.data.contents);
          const postsTitle = state.posts.map((post) => post.title);
          const newPosts = newData.posts.filter((newPost) => !postsTitle.includes(newPost.title));
          console.log(newPosts);
          if (newPosts.length) {
            watchedState.posts = newPosts.concat(state.posts);
          }
        })
        .catch((error) => {
          watchedState.form.errors = i18nInstance.t(`errorMessages.${error.code}`);
        });
    });
    setTimeout(rssUpdate, timeoutInterval);
  };

  rssUpdate();

  htmlElements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const inputUrl = formData.get('url');
    validateInputUrl(inputUrl);
  });
};

export default init;
