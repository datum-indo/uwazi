/** @format */
import RouteHandler from 'app/App/RouteHandler';
import api from 'app/Search/SearchAPI';
import TemplatesAPI from 'app/Templates/TemplatesAPI';
import ThesauriAPI from 'app/Thesauri/ThesauriAPI';
import { RequestParams } from 'app/utils/RequestParams';
import { shallow, ShallowWrapper } from 'enzyme';
import React from 'react';
import { TemplateSchema } from 'shared/types/templateType';
import { ThesaurusSchema } from 'shared/types/thesaurusType';

import { ThesaurusCockpitBase, ThesaurusCockpitProps } from '../ThesaurusCockpit';
import { ClassifierModelSchema } from '../types/classifierModelType';
import { SuggestionResultSchema } from '../types/suggestionResultType';

const templates: TemplateSchema[] = [
  {
    _id: 'underscoreID',
    name: 'Paragraph',
    properties: [
      {
        id: 'propertyID1',
        _id: '_propertyID1',
        name: 'thesaurus_name',
        label: 'ThesaurusName',
        content: 'thesaurusUnderscoreId1',
        type: 'multiselect',
      },
    ],
    default: true,
    commonProperties: [
      {
        label: 'commonProp1',
        type: 'multiselect',
      },
    ],
  },
  {
    _id: 'underscoreID2',
    name: 'Recommendation',
    properties: [
      {
        id: 'propertyID2',
        _id: '_propertyID2',
        name: 'recommendation',
        label: 'Recommendation',
        content: 'thesaurusUnderscoreId2',
        type: 'multiselect',
      },
    ],
    default: false,
    commonProperties: [
      {
        label: 'commonProp2',
        type: 'multiselect',
      },
    ],
  },
];
const models: ClassifierModelSchema[] = [
  {
    bert: 'testBert',
    completeness: 0,
    extraneous: 0,
    instances: ['timestamp'],
    name: 'ThesaurusName',
    preferred: 'timestamp',
    topics: {
      'Topic 1': {
        name: 'Topic 1',
        quality: 0.8,
        samples: 20,
      },
      'Topic 2': {
        name: 'Topic 2',
        quality: 0.92,
        samples: 25,
      },
      'Topic 3': {
        name: 'Topic 3',
        quality: 0.62,
        samples: 2,
      },
    },
  },
];
const thesauri: ThesaurusSchema[] = [
  {
    _id: 'thesaurusUnderscoreId1',
    name: 'ThesaurusName',
    values: [
      { _id: 'underscoreId1', label: 'Topic 1', id: 'id1' },
      { _id: 'underscoreId2', label: 'Topic 2', id: 'id2' },
      { _id: 'underscoreId3', label: 'Topic 3', id: 'id3' },
    ],
    enableClassification: true,
  },
  {
    _id: 'thesaurusUnderscoreId2',
    name: 'ThesaurusWithoutSuggestions',
    values: [{ _id: 'underscoreId1', label: 'Topic 1', id: 'id1' }],
    enableClassification: false,
  },
];
const suggestions: SuggestionResultSchema = {
  totalRows: 1,
  totalSuggestions: 1,
  thesaurus: {
    propertyName: 'thesaurus_name',
    values: {
      id1: 1,
      id2: 0,
    },
  },
};

describe('ThesaurusCockpit', () => {
  describe('render', () => {
    let component: ShallowWrapper<ThesaurusCockpitProps, {}, ThesaurusCockpitBase>;
    let props: ThesaurusCockpitProps;
    let context: any;
    let dispatchCallsOrder: any[];

    beforeEach(() => {
      const thesaurus = thesauri[0];
      thesaurus.property = {
        id: 'ID1',
        _id: '_ID1',
        content: 'content1',
        label: 'ThesaurusName',
        name: 'thesaurus_name',
      };
      props = { models, thesaurus: thesauri[0], suggestions };
      RouteHandler.renderedFromServer = true;
      dispatchCallsOrder = [];
      context = {
        confirm: jasmine.createSpy('confirm'),
        store: {
          getState: () => ({}),
          dispatch: jasmine.createSpy('dispatch').and.callFake(action => {
            dispatchCallsOrder.push(action.type);
          }),
        },
      };
    });

    const render = () => {
      component = shallow(<ThesaurusCockpitBase {...props} />, { context });
    };

    it('should render a ThesaurusCockpit', () => {
      render();
      //expect(component).toMatchSnapshot();
    });

    it('should find the cockpit table and verify names, values and quality icons', () => {
      render();
      expect(component.find('.cockpit').length).toBe(1);
      expect(component.find({ scope: 'row' }).length).toBe(3);
      /* We expect 5 data cells -- three with quality icons and 1 each of
    suggestion counts and a review button */
      expect(component.find('td').children().length).toBe(5);
      expect(component.find({ title: 'review-button-title' }).length).toBe(1);
      expect(component.contains(<td title="suggestions-count">{1}</td>)).toEqual(true);
    });
  });

  describe('requestState', () => {
    beforeEach(() => {
      spyOn(ThesauriAPI, 'getThesauri').and.returnValue(Promise.resolve(thesauri));
      spyOn(ThesauriAPI, 'getModelStatus').and.returnValue(Promise.resolve(models));
      spyOn(TemplatesAPI, 'get').and.returnValue(Promise.resolve(templates));
      spyOn(api, 'search').and.returnValue(Promise.resolve(suggestions));
    });

    it('should get the thesaurus, classification model and suggestion counts as react actions', async () => {
      await ThesaurusCockpitBase.requestState(new RequestParams());
      //expect(actions).toMatchSnapshot();
    });
  });
});
