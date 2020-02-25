import React from 'react';
import { shallow } from 'enzyme';
import Immutable from 'immutable';

import { FilterSuggestions } from '../FilterSuggestions';

describe('FilterSuggestions', () => {
  let component;
  let props;
  let templates;
  let thesauris;

  function renderComponent(label = 'test', type = 'text', content) {
    templates = [
      {
        _id: 'template1',
        properties: [
          { localID: 1, label, filter: true, type },
          { localID: 2, label: 'something else' },
        ],
      },
      {
        _id: 'template2',
        name: 'Template 2',
        properties: [
          { label: 'Date', type: 'date', filter: true },
          { label: 'Author', type: 'text', filter: true },
          { label: 'filterFalse', type: 'text', filter: false },
          { label: 'Authors', type: 'select', filter: true, content: 'abc1' },
        ],
      },
      {
        _id: 'template3',
        name: 'Template 3',
        properties: [
          { label: 'date ', type: 'date', filter: true },
          { label: 'filterFalse', type: 'text', filter: true },
          { label: 'Keywords', type: 'text', filter: true },
        ],
      },
    ];

    thesauris = [
      { _id: 'abc1', name: 'Best SCI FI Authors' },
      { _id: 'abc2', name: 'Favourite dessert recipes' },
    ];

    props = {
      label,
      type,
      filter: true,
      content,
      data: { name: 'Current template', _id: 'template1' },
      templates: Immutable.fromJS(templates),
      thesauris: Immutable.fromJS(thesauris),
    };

    component = shallow(<FilterSuggestions {...props} />);
  }

  it('should always render the current property as a guide', () => {
    renderComponent('Year', 'date');
    const suggestion = component.find('tbody > tr').at(0);
    expect(suggestion).toMatchSnapshot();
  });

  describe('when matches type and label as other template property', () => {
    it('should show a message', () => {
      renderComponent('author', 'text');
      const suggestion = component.find('tbody > tr').at(1);
      expect(suggestion).toMatchSnapshot();
    });
  });

  describe('when label is the same but different type', () => {
    it('should mark it as conflict', () => {
      renderComponent('author', 'date');
      const suggestion = component.find('.conflict');
      expect(suggestion).toMatchSnapshot();
    });
  });

  describe('when label is the same but different content', () => {
    it('should mark it as conflict', () => {
      renderComponent('authors', 'select', 'abc2');
      const suggestion = component.find('.conflict');
      expect(suggestion).toMatchSnapshot();
    });
  });

  describe('when content does not match with a thesauri (happening when opening property and the dictionary has been deleted)', () => {
    it('should not show anything', () => {
      renderComponent('authors', 'select', 'non existent thesauri');
      const suggestion = component.find('tbody > tr').at(1);
      expect(suggestion).toMatchSnapshot();
    });
  });

  describe('when props.filter = flase', () => {
    it('should now show the preoperty with same name', () => {
      renderComponent('filterFalse', 'text');
      const suggestion = component.find('tbody > tr').at(1);
      expect(suggestion).toMatchSnapshot();
    });
  });
});
