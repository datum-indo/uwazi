import React, {Component} from 'react';
import TestUtils from 'react-addons-test-utils';
import TestBackend from 'react-dnd-test-backend';
import {DragDropContext} from 'react-dnd';
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import {reducer as formReducer} from 'redux-form';
import Immutable from 'immutable';

import MetadataProperty, {MetadataProperty as DumbComponent, dragSource, dropTarget} from '~/controllers/Templates/MetadataProperty';

function wrapInTestContext(DecoratedComponent) {
  return DragDropContext(TestBackend)(
    class TestContextContainer extends Component {
      render() {
        return <DecoratedComponent {...this.props} />;
      }
    }
  );
}

function sourceTargetTestContext(Target, Source, actions) {
  return DragDropContext(TestBackend)(
    class TestContextContainer extends Component {
      render() {
        const identity = x => x;
        let targetProps = {label: 'target', index: 1, id: 'target', connectDragSource: identity, isDragging: false};
        let sourceProps = {label: 'source', index: 2, id: 'source', connectDragSource: identity, isDragging: false};
        return <div>
                <Target {...targetProps} {...actions}/>
                <Source {...sourceProps} />
              </div>;
      }
    }
  );
}

describe('MetadataProperty', () => {
  let backend;
  let monitor;
  let store;
  let component;

  function renderComponent(ComponentToRender, props) {
    let result;
    let templateData = Immutable.fromJS({name: '', properties: []});
    store = createStore(() => {
      return {
        template: {data: templateData},
        form: formReducer
      };
    });
    TestUtils.renderIntoDocument(<Provider store={store}><ComponentToRender ref={(ref) => result = ref} {...props}/></Provider>);
    return result;
  }

  describe('MetadataProperty', () => {
    it('should have mapped action into props', () => {
      let TestComponent = wrapInTestContext(MetadataProperty);
      component = renderComponent(TestComponent, {label: 'test', index: 1, id: 'id'});
      let option = TestUtils.findRenderedComponentWithType(component, MetadataProperty).getWrappedInstance();
      expect(option.props.reorderProperty).toEqual(jasmine.any(Function));
      expect(option.props.addProperty).toEqual(jasmine.any(Function));
      expect(option.props.removeProperty).toEqual(jasmine.any(Function));
    });

    describe('when inserting', () => {
      it('should add "dragging" className', () => {
        let TestComponent = wrapInTestContext(MetadataProperty);
        component = renderComponent(TestComponent, {inserting: true, label: 'test', index: 1, id: 'id'});
        let option = TestUtils.findRenderedComponentWithType(component, dragSource);
        let div = TestUtils.scryRenderedDOMComponentsWithTag(option, 'div')[0];

        expect(div.className).toContain('dragging');
      });
    });

    describe('when clicking on remove button', () => {
      it('should removeProperty', () => {
        let removeProperty = jasmine.createSpy();
        let identity = x => x;
        component = renderComponent(DumbComponent, {
          removeProperty,
          isDragging: true,
          connectDragSource: identity,
          connectDropTarget: identity,
          inserting: true,
          label: 'test',
          index: 1,
          id: 'id'
        }
      );
        let removeButton = TestUtils.findRenderedDOMComponentWithClass(component, 'property-remove');

        TestUtils.Simulate.click(removeButton);
        expect(removeProperty).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('dragSource', () => {
    beforeEach(() => {
      let TestComponent = wrapInTestContext(dragSource);
      component = renderComponent(TestComponent, {label: 'test', index: 1, id: 'id'});
      backend = component.getManager().getBackend();
      monitor = component.getManager().getMonitor();
    });

    describe('beginDrag', () => {
      it('should return an object with name', () => {
        let option = TestUtils.findRenderedComponentWithType(component, dragSource);
        backend.simulateBeginDrag([option.getHandlerId()]);
        expect(monitor.getItem()).toEqual({index: 1, label: 'test'});
      });

      it('should add "dragging" class name', () => {
        let option = TestUtils.findRenderedComponentWithType(component, dragSource);
        let div = TestUtils.scryRenderedDOMComponentsWithTag(option, 'div')[0];

        expect(div.className).not.toContain('dragging');
        backend.simulateBeginDrag([option.getHandlerId()]);
        expect(div.className).toContain('dragging');
      });
    });
  });

  describe('dropTarget', () => {
    let actions = jasmine.createSpyObj(['reorderProperty', 'addProperty']);
    beforeEach(() => {
      let TestDragAndDropContext = sourceTargetTestContext(dropTarget, dragSource, actions);
      component = renderComponent(TestDragAndDropContext);
      backend = component.getManager().getBackend();
      monitor = component.getManager().getMonitor();
    });

    describe('when reordering', () => {
      it('should call reorder with drag and hover indexes', () => {
        let target = TestUtils.scryRenderedComponentsWithType(component, dropTarget)[0];
        let source = TestUtils.findRenderedComponentWithType(component, dragSource);

        backend.simulateBeginDrag([source.getHandlerId()]);
        backend.simulateHover([target.getHandlerId()]);

        expect(actions.reorderProperty).toHaveBeenCalledWith(2, 1);
      });
    });

    describe('when inserting', () => {
      it('should call addProperty with inserting flag and on index 0', () => {
        let target = TestUtils.scryRenderedComponentsWithType(component, dropTarget)[0];
        let source = TestUtils.findRenderedComponentWithType(component, dragSource);

        backend.simulateBeginDrag([source.getHandlerId()]);
        delete monitor.getItem().index;
        backend.simulateHover([target.getHandlerId()]);

        expect(actions.addProperty).toHaveBeenCalledWith({label: 'source', inserting: true}, 0);
      });
    });
  });
});
