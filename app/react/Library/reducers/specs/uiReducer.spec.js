import Immutable from 'immutable';
import * as types from 'app/Library/actions/actionTypes';

import uiReducer from 'app/Library/reducers/uiReducer';
import 'jasmine-immutablejs-matchers';

describe('uiReducer', () => {
  const initialState = Immutable.fromJS({searchTerm: '', previewDoc: '', suggestions: []});

  describe('when state is undefined', () => {
    it('returns initial', () => {
      let newState = uiReducer();
      expect(newState).toEqual(initialState);
    });
  });

  describe('SET_SEARCHTERM', () => {
    it('should set the searchTerm in the state', () => {
      let newState = uiReducer(initialState, {type: types.SET_SEARCHTERM, searchTerm: 'something cool'});
      expect(newState.toJS().searchTerm).toBe('something cool');
    });
  });

  describe('SET_SUGGESTIONS', () => {
    it('should set the suggestions in the state', () => {
      let suggestions = [{title: 'something'}];
      let newState = uiReducer(initialState, {type: types.SET_SUGGESTIONS, suggestions});
      expect(newState.toJS().suggestions).toEqual(suggestions);
    });
  });

  describe('SHOW_SUGGESTIONS', () => {
    it('should set the showSuggestions to true', () => {
      let newState = uiReducer(initialState, {type: types.SHOW_SUGGESTIONS});
      expect(newState.toJS().showSuggestions).toBe(true);
    });
  });

  describe('HIDE_SUGGESTIONS', () => {
    it('should set the showSuggestions to true', () => {
      let newState = uiReducer(initialState, {type: types.HIDE_SUGGESTIONS});
      expect(newState.toJS().showSuggestions).toBe(false);
    });
  });

  describe('SET_PREVIEW_DOC', () => {
    it('should set the searchTerm in the state', () => {
      let newState = uiReducer(initialState, {type: types.SET_PREVIEW_DOC, docId: 'docId'});
      expect(newState.toJS().previewDoc).toBe('docId');
    });
  });
});
