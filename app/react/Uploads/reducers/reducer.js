import {combineReducers} from 'redux';

import documents from 'app/Uploads/reducers/uploadsReducer';
import thesauris from 'app/Uploads/reducers/thesaurisReducer';
import templates from 'app/Uploads/reducers/templatesReducer';
import progress from 'app/Uploads/reducers/progressReducer';
import uiState from 'app/Uploads/reducers/uiStateReducer';

export default combineReducers({
  documents,
  templates,
  thesauris,
  progress,
  uiState
});
