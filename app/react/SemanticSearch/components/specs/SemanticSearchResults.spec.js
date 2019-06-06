import React from 'react';

import { shallow } from 'enzyme';

import Immutable from 'immutable';

import Doc from 'app/Library/components/Doc';
import * as actions from 'app/SemanticSearch/actions/actions';

import { SemanticSearchResults, mapStateToProps, mapDispatchToProps } from '../SemanticSearchResults';

describe('SemanticSearchResults', () => {
  let state;
  let dispatch;
  beforeEach(() => {
    state = {
      semanticSearch: {
        resultsFilters: {
          threshold: 0.3,
          minRelevantSentences: 1
        },
        search: Immutable.fromJS({
          _id: 'id',
          searchTerm: 'query',
          documents: [],
          status: 'completed',
          results: [
            {
              sharedId: 'one',
              semanticSearch: {
                averageScore: 0.6,
                numRelevant: 2,
                relevantRate: 0.5,
                results: [{ score: 0.7 }, { score: 0.2 }, { score: 0.1 }]
              }
            },
            {
              sharedId: 'two',
              semanticSearch: {
                averageScore: 0.4,
                numRelevant: 1,
                relevantRate: 0.4,
                results: [{ score: 0.6 }, { score: 0.5 }, { score: 0.2 }]
              }
            }
          ]
        })
      }
    };
    dispatch = jest.fn();
  });

  const getProps = () => ({
    ...mapStateToProps(state),
    ...mapDispatchToProps(dispatch)
  });

  const render = () => shallow(<SemanticSearchResults {...getProps()} />);

  it('should render results in ItemList sorted by descending percentage of sentences above threshold', () => {
    const component = render();
    expect(component).toMatchSnapshot();
  });
  it('should only display items that match filters', () => {
    state.semanticSearch.resultsFilters = {
      threshold: 0.4,
      minRelevantSentences: 2
    };
    const component = render();
    expect(component).toMatchSnapshot();
  });
  describe('when the search is empty', () => {
    it('should render not found page', () => {
      state.semanticSearch.search = Immutable.fromJS({});
      const component = render();
      expect(component).toMatchSnapshot();
    });
  });
  it('should select document when item is clicked', () => {
    jest.spyOn(actions, 'selectSemanticSearchDocument').mockImplementation(() => {});
    const component = render();
    component.find(Doc).first().simulate('click');
    expect(actions.selectSemanticSearchDocument).toHaveBeenCalled();
  });
});
