import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Form } from 'react-redux-form';
import { NumericRangeSlide } from 'app/ReactReduxForms';


import SidePanel from 'app/Layout/SidePanel';
import { t, Translate } from 'app/I18N';

const filters = [
  {
    label: 'Threshold',
    model: 'threshold',
    min: 0.3,
    max: 1,
    step: 0.01,
    minLabel: 'Exploration',
    maxLabel: 'Precision'
  },
  {
    label: 'Minimum relevant sentences per document',
    model: 'minRelevantSentences',
    min: 1,
    max: 50,
    step: 1,
    minLabel: '',
    maxLabel: ''
  }
];

const filterValue = (filter, filtersValues) => filter.model === 'threshold' ?
  `${(filtersValues[filter.model] * 100).toFixed(2)}%` : filtersValues[filter.model];

export function ResultsFiltersPanel({ open, filtersValues }) {
  return (
    <SidePanel open={open}>
      <div className="sidepanel-body">
        <div className="sidepanel-title">
          { t('System', 'Fine tune')}
        </div>
        <Form model="semanticSearch.resultsFilters">
          <div className="view">
            { filters.map(filter => (
              <dl className="metadata-type-text" key={filter.label}>
                <dt>{t('System', filter.label)} {filterValue(filter, filtersValues)}</dt>
                <dd>
                  <NumericRangeSlide
                    delay={200}
                    model={`.${filter.model}`}
                    prefix={filter.model}
                    min={filter.min}
                    max={filter.max}
                    step={filter.step}
                    minLabel={t('System', filter.minLabel)}
                    maxLabel={t('System', filter.maxLabel)}
                  />
                </dd>
              </dl>
            ))}
          </div>
        </Form>
        <div className="semantic-search-help">
          <p><Translate>Semantic search overview</Translate></p>
          <p><Translate>Semantic search threshold help</Translate></p>
          <p><Translate>Semantic search minimum sentences help</Translate></p>
        </div>
      </div>
    </SidePanel>
  );
}

ResultsFiltersPanel.propTypes = {
  open: PropTypes.bool.isRequired,
  filtersValues: PropTypes.object.isRequired,
};

function mapStateToProps({ semanticSearch }) {
  return {
    open: semanticSearch.selectedDocument.isEmpty(),
    filtersValues: semanticSearch.resultsFilters
  };
}

export default connect(mapStateToProps)(ResultsFiltersPanel);
