/** @format */

/* eslint-disable max-statements */

// import Immutable from 'immutable';

// import { metadataSelectors } from '../../selectors';

import formater, { FormatedMetadataProperty } from '../formater';
import { doc, templates, thesauris, relationships } from './fixtures';

describe('metadata formater', () => {
  describe('prepareMetadata', () => {
    let metadata: FormatedMetadataProperty[];
    beforeAll(() => {
      metadata = formater.prepareMetadata(
        doc,
        templates
        // metadataSelectors.indexedThesaurus({ thesauris }),
        // relationships
      );
    });

    it('should process all metadata', () => {
      expect(metadata.length).toEqual(16);
    });
  });

  describe('text type', () => {
    let metadata: FormatedMetadataProperty[];
    beforeAll(() => {
      metadata = formater.prepareMetadata(
        { ...doc, metadata: { text: doc.metadata!.text } },
        templates
        // metadataSelectors.indexedThesaurus({ thesauris }),
        // relationships
      );
    });

    it('should process text type', () => {
      expect(metadata[0]).toEqual({
        label: 'Text',
        name: 'text',
        value: 'text content',
        translationContext: 'templateID',
      });
    });
  });

  describe('date type', () => {
    let metadata: FormatedMetadataProperty[];
    beforeAll(() => {
      metadata = formater.prepareMetadata(
        { ...doc, metadata: { date: doc.metadata!.date } },
        templates
        // metadataSelectors.indexedThesaurus({ thesauris }),
        // relationships
      );
    });

    it('should process date type', () => {
      expect(metadata[0]).toEqual({
        label: 'Date',
        name: 'date',
        value: expect.stringContaining('1970'),
        translationContext: 'templateID',
      });
    });
  });

  describe('select type', () => {
    let metadata: FormatedMetadataProperty[];
    beforeAll(() => {
      metadata = formater.prepareMetadata(
        { ...doc, metadata: { select: doc.metadata!.select } },
        templates
        // metadataSelectors.indexedThesaurus({ thesauris }),
        // relationships
      );
    });

    it('should process select type', () => {
      expect(metadata[0]).toEqual({
        label: 'Select',
        name: 'select',
        value: 'Value 5',
        translationContext: 'templateID',
      });
    });
  });
});
