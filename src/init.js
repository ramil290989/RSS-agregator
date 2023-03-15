import axios from 'axios';
import i18n from 'i18next';
import onChange from 'on-change';
import * as yup from 'yup';
import _ from 'lodash';
import resources from './locales/index.js';
import render from './render.js';
import rssParser from './rssParser.js';
import getAllOriginsUrl from './getAllOriginsUrl.js';

const timeoutInterval = 5000;

const validateInputUrl = (inputText, state) => {
  const validateSchema = yup
    .string()
    .url()
    .notOneOf(state.feeds.map((feed) => feed.url))
    .required();
  return validateSchema.validate(inputText);
};

const init = () => {
  const i18nInstance = i18n.createInstance();
  i18nInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  })
    .then(() => {
      const state = {
        form: {
          process: 'filling',
        },
        errors: '',
        feeds: [],
        posts: [],
        readPostIds: [],
      };

      yup.setLocale({
        string: {
          url: 'urlIsInvalid',
        },
        mixed: {
          notOneOf: 'sameFeed',
          required: 'inputRequired',
        },
      });

      const htmlElements = {
        button: document.querySelector('button[type=submit]'),
        form: document.querySelector('.rss-form'),
        input: document.querySelector('#url-input'),
        feedbackMessage: document.querySelector('.feedback'),
        feeds: document.querySelector('.feeds'),
        posts: document.querySelector('.posts'),
        modalTitle: document.querySelector('.modal-title'),
        modalBody: document.querySelector('.modal-body'),
        modalReadButton: document.querySelector('.btn-primary'),
      };

      const watchedState = onChange(state, render(state, htmlElements, i18nInstance));

      const loadRssData = (inputText) => {
        validateInputUrl(inputText, state)
          .then((url) => axios.get(getAllOriginsUrl(url)))
          .then((response) => rssParser(response.data.contents))
          .then((rssData) => {
            const feed = {
              title: rssData.feed.title,
              description: rssData.feed.description,
              url: inputText,
            };
            const posts = rssData.posts.map((post) => ({
              title: post.title,
              link: post.link,
              description: post.description,
              id: _.uniqueId('postID_'),
            }));
            watchedState.feeds.unshift(feed);
            watchedState.posts = posts.concat(state.posts);
            watchedState.form.process = 'added';
            watchedState.form.process = 'filling';
          })
          .catch((error) => {
            watchedState.form.process = 'error';
            switch (error.name) {
              case 'ValidationError':
                watchedState.errors = i18nInstance.t(`errorMessages.${error.errors}`);
                break;
              case 'ParsingError':
                watchedState.errors = i18nInstance.t('errorMessages.noRssData');
                break;
              case 'AxiosError':
                watchedState.errors = i18nInstance.t(`errorMessages.${error.code}`);
                break;
              default:
                watchedState.errors = i18nInstance.t('errorMessages.undefined');
            }
          });
      };

      const rssUpdate = () => {
        const postsTitle = state.posts.map((post) => post.title);
        const newPostsRequests = state.feeds
          .map((feed) => axios.get(getAllOriginsUrl(feed.url))
            .then((response) => rssParser(response.data.contents))
            .then((newRssData) => {
              const newPosts = newRssData.posts
                .filter((newPost) => !postsTitle.includes(newPost.title))
                .map((newPost) => ({ ...newPost, id: _.uniqueId('postID_') }));
              return newPosts;
            })
            .catch(() => null));
        Promise.all(newPostsRequests)
          .then((allNewPosts) => {
            const newPosts = allNewPosts
              .flat()
              .filter((newPost) => newPost !== null);
            if (newPosts.length) {
              watchedState.posts = newPosts.concat(state.posts);
            }
          })
          .finally(() => setTimeout(rssUpdate, timeoutInterval));
      };

      rssUpdate();

      htmlElements.form.addEventListener('submit', (e) => {
        watchedState.form.process = 'waiting';
        e.preventDefault();
        const formData = new FormData(e.target);
        const inputUrl = formData.get('url');
        loadRssData(inputUrl);
      });

      htmlElements.posts.addEventListener('click', ({ target }) => {
        const postId = target.dataset.id;
        if (postId !== undefined) {
          watchedState.readPostIds = _.union([postId], state.readPostIds);
        }
      });
    });
};

export default init;
