import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import {I18NLink} from 'app/I18N';
import Loader from 'app/components/Elements/Loader';

import api from 'app/Search/SearchAPI';

const processesIds = ['58b2f3a35d59f31e1345b48a'];
const provisionalMeasuresIds = ['58b2f3a35d59f31e1345b4a4'];
const documentsIds = ['58b2f3a35d59f31e1345b4ac', '58b2f3a35d59f31e1345b471', '58b2f3a35d59f31e1345b482', '58b2f3a35d59f31e1345b479'];

export class cejilChart001 extends Component {

  getData() {
    api.search({limit: 0})
    .then(results => {
      this.setState({data: results.aggregations.all});
    });
  }

  conformLibraryLink(types, sort) {
    const escapedValues = types.map(t => '%27' + t + '%27');
    return `/library/?q=(order:desc,sort:${sort},types:!(${escapedValues.join(',')}),userSelectedSorting:!t)`;
  }

  getCount(ids) {
    return ids.reduce((count, id) => {
      const bucket = this.state.data.types.buckets.find(b => b.key === id);
      return count + (bucket ? bucket.filtered.doc_count : 0);
    }, 0);
  }

  componentDidMount() {
    this.getData();
  }

  render() {
    const {title = '', buttons = []} = this.props;

    let processesCount;
    let provisionalMeasuresCount;
    let documentsCount;
    if (this.state && this.state.data) {
      processesCount = this.getCount(processesIds);
      provisionalMeasuresCount = this.getCount(provisionalMeasuresIds);
      documentsCount = this.getCount(documentsIds);
    }

    return (
      <div className="hero">
        <h1>{title}</h1>
        <div className="hero-stats">
          <I18NLink to={this.conformLibraryLink(processesIds, 'metadata._ltima_actualizaci_n')}>
            <h2>{processesCount}</h2>
            {buttons[0]}
          </I18NLink>
          <I18NLink to={this.conformLibraryLink(documentsIds, 'metadata.fecha')}>
            <h2>{provisionalMeasuresCount}</h2>
            {buttons[1]}
          </I18NLink>
          <I18NLink to={this.conformLibraryLink(documentsIds, 'metadata.fecha')}>
            <h2>{documentsCount}</h2>
            {buttons[2]}
          </I18NLink>
        </div>
      </div>
    );
  }
}

cejilChart001.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  buttons: PropTypes.array
};

export function mapStateToProps({templates, thesauris}) {
  return {templates, thesauris};
}

export default connect(mapStateToProps)(cejilChart001);
