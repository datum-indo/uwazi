import { isClient } from 'app/utils';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

import { applyMiddleware, createStore } from 'redux';
import reducer from './reducer';

const data = isClient && window.__reduxData__ ? window.__reduxData__ : {};
let store;

export default function create(initialData = data) {
  store = createStore(reducer, initialData, composeWithDevTools(applyMiddleware(thunk)));

  return store;
}

if (module.hot) {
  if (!window.store) {
    window.store = create();
  }
  store = window.store;
  module.hot.accept('./reducer', () => {
    const rootReducer = require('./reducer');
    store.replaceReducer(rootReducer);
  });
}

if (!store) {
  store = create();
}

export { store };
