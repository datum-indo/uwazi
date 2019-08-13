import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Immutable from 'immutable';

import { BarChart, Bar } from 'recharts';

import { arrayUtils } from 'app/Charts';

import markdownDatasets from '../markdownDatasets';
import PagesContext from './Context';
import { objectPath } from '../utils';

class ChartData extends Component {
  render() {
    const { excludeZero, maxCategories, property, data, context, thesauris } = this.props;
    if (data) {
      const formattedData = arrayUtils.sortValues(
        arrayUtils.formatDataForChart(data, property, thesauris, {
          excludeZero: Boolean(excludeZero),
          context,
          maxCategories
        })
      );

      if (this.props.children.length) {
        // return (
        //   <BarChart
        //     width={500}
        //     height={300}
        //     data={formattedData}
        //   >
        //     <Bar dataKey="results" fill="rgb(30, 28, 138)" stackId="unique" />
        //   </BarChart>
        // );
        // return this.props.children;
        const childrenWithProps = React.Children.map(this.props.children, child =>
          child.type ? React.cloneElement(child, { data: formattedData }) : child
        );
        // console.log(childrenWithProps);
        return childrenWithProps;
      }
      return JSON.stringify(formattedData, null, ' ');
    }
    return 'loading';
    // const { property, value } = this.props;
    // return property ? this.renderChildren(value) : (<PagesContext.Consumer>{val => this.renderChildren(val)}</PagesContext.Consumer>);
  }
}

ChartData.defaultProps = {
  context: 'System',
  excludeZero: false,
  maxCategories: '0',
  data: null
};

ChartData.propTypes = {
  thesauris: PropTypes.instanceOf(Immutable.List).isRequired,
  property: PropTypes.string.isRequired,
  context: PropTypes.string,
  excludeZero: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool
  ]),
  maxCategories: PropTypes.string,
  data: PropTypes.instanceOf(Immutable.List)
};

export const mapStateToProps = (state, props) => ({
  data: markdownDatasets.getAggregations(state, props),
  thesauris: state.thesauris
});

export default connect(mapStateToProps)(ChartData);
