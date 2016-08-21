import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import SidePanel from 'app/Layout/SidePanel';
import {bindActionCreators} from 'redux';
import {unselectDocument, saveDocument} from '../actions/libraryActions';

import DocumentForm from '../containers/DocumentForm';
import Immutable from 'immutable';
import EntityForm from '../containers/EntityForm';
import {actions as formActions} from 'react-redux-form';
import modals from 'app/Modals';
import {formater, ShowMetadata} from 'app/Metadata';
import {NeedAuthorization} from 'app/Auth';
import ShowIf from 'app/App/ShowIf';
import {actions} from 'app/Metadata';
import {deleteDocument} from 'app/Viewer/actions/documentActions';
import {browserHistory} from 'react-router';

export class ViewMetadataPanel extends Component {
  deleteDocument() {
    this.context.confirm({
      accept: () => {
        this.props.deleteDocument(this.props.rawDoc.toJS())
        .then(() => {
          browserHistory.push('/');
        });
      },
      title: 'Confirm delete document',
      message: 'Are you sure you want to delete this document?'
    });
  }

  submit(doc) {
    this.props.saveDocument(doc);
  }

  close() {
    if (this.props.formState.dirty) {
      return this.props.showModal('ConfirmCloseForm', this.props.metadata);
    }
    this.props.unselectDocument();
    this.props.resetForm('library.metadata');
  }

  render() {
    const {metadata, docBeingEdited} = this.props;
    const disabled = false;

    return (
      <SidePanel open={this.props.open}>
        <div className="sidepanel-header">
          <h1>Metadata</h1>
          <i className="fa fa-close close-modal" onClick={this.close.bind(this)}/>
        </div>
        <div className="sidepanel-footer">
          <NeedAuthorization>
            <ShowIf if={!docBeingEdited}>
              <button
                onClick={() => this.props.loadInReduxForm('library.metadata', this.props.rawDoc.toJS(), this.props.templates.toJS())}
                className="edit-metadata btn btn-primary">
                <i className="fa fa-pencil"></i>
                <span className="btn-label">Edit</span>
              </button>
            </ShowIf>
          </NeedAuthorization>
          <ShowIf if={docBeingEdited}>
            <button type="submit" form="metadataForm" disabled={disabled} className="edit-metadata btn btn-success">
              <i className="fa fa-save"></i>
              <span className="btn-label">Save</span>
            </button>
          </ShowIf>
          <a className="edit-metadata btn btn-primary" href={'/api/documents/download?_id=' + this.props.rawDoc.toJS()._id} target="_blank">
            <i className="fa fa-cloud-download"></i>
            <span className="btn-label">Download</span>
          </a>
          <NeedAuthorization>
            <button className="edit-metadata btn btn-danger" onClick={this.deleteDocument.bind(this)}>
              <i className="fa fa-trash"></i>
              <span className="btn-label">Delete</span>
            </button>
          </NeedAuthorization>
        </div>
        <div className="sidepanel-body">
          <ul className="nav nav-tabs">
            <li>
              <a href="#">Table of content</a>
            </li>
            <li className="active">
              <a href="#">Metadata</a>
            </li>
            <li>
              <a href="#">Connections (22)</a>
            </li>
          </ul>
          {(() => {
            if (docBeingEdited && this.props.metadata.type === 'document') {
              return <DocumentForm onSubmit={this.submit.bind(this)} />;
            }
            if (docBeingEdited && this.props.metadata.type === 'entity') {
              return <EntityForm/>;
            }
            return <ShowMetadata entity={metadata}/>;
          })()}
        </div>
      </SidePanel>
    );
  }
}

ViewMetadataPanel.propTypes = {
  metadata: PropTypes.object,
  templates: PropTypes.object,
  rawDoc: PropTypes.object,
  docBeingEdited: PropTypes.bool,
  open: PropTypes.bool,
  saveDocument: PropTypes.func,
  unselectDocument: PropTypes.func,
  resetForm: PropTypes.func,
  formState: PropTypes.object,
  showModal: PropTypes.func,
  deleteDocument: PropTypes.func,
  loadInReduxForm: PropTypes.func
};

ViewMetadataPanel.contextTypes = {
  confirm: PropTypes.func
};

const mapStateToProps = ({library}) => {
  return {
    open: library.ui.get('selectedDocument') ? true : false,
    docBeingEdited: !!library.metadata._id,
    formState: library.metadataForm,
    rawDoc: library.ui.get('selectedDocument') || Immutable.fromJS({}),
    templates: library.filters.get('templates'),
    metadata: formater.prepareMetadata(library.ui.get('selectedDocument') ? library.ui.get('selectedDocument').toJS() : {},
                                       library.filters.get('templates').toJS(),
                                       library.filters.get('thesauris').toJS())
  };
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    loadInReduxForm: actions.loadInReduxForm,
    unselectDocument,
    resetForm: formActions.reset,
    saveDocument,
    deleteDocument,
    showModal: modals.actions.showModal
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ViewMetadataPanel);
