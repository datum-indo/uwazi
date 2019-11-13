/** @format */

import moment from 'moment';
import { EntitySchema } from 'api/entities/EntityType.d.ts';
import { TemplateSchema } from 'api/templates/templateType.d.ts';
import { MetadataObjectSchema, PropertySchema } from 'shared/commonTypes';
import { fromJS, Map } from 'immutable';
import { ensure } from 'shared/tsUtils';

export interface FormatedMetadataProperty {
  value: string;
  label: string;
  name: string;
  translationContext: string;
  type: string;
  filter: boolean;
}

interface ImmutableTemplate extends Map<string, any> {
  toJS(): TemplateSchema;
  get<K extends keyof TemplateSchema>(key: K, notSetValue?: TemplateSchema[K]): TemplateSchema[K];
  set<K extends keyof TemplateSchema>(key: K, value: TemplateSchema[K]): this;
}

// const createImmutableTemplate = (data: TemplateSchema): ImmutableTemplate => fromJS(data) as any;

const TypeFormaters: { [key: string]: (param: MetadataObjectSchema[]) => string } = {
  text([{ value }]: MetadataObjectSchema[]) {
    return <string>value;
  },

  date([{ value }]: MetadataObjectSchema[]) {
    return moment.utc(<string>value, 'X').format('ll');
  },

  select([{ label }]: MetadataObjectSchema[]) {
    return <string>label;
  },
};

const formater = {
  prepareMetadata(
    entity: EntitySchema,
    templates: ImmutableTemplate[]
    // thesauris,
    // relationships,
    // options = {}
  ): FormatedMetadataProperty[] {
    const template: ImmutableTemplate = ensure(
      templates.find(t => t.get('_id') === entity.template)
    );

    return Object.keys(entity.metadata!).map(
      (key: string): FormatedMetadataProperty => {
        const property: PropertySchema = ensure(
          template.get('properties')!.find(p => p.get('name') === key),
          `property ${key} not found on template ${template.get('name')}`
        );
        return {
          label: property.get('label'),
          name: property.get('name'),
          translationContext: template.get('_id'),
          value: TypeFormaters[property.get('type')]
            ? TypeFormaters[property.get('type')](entity.metadata![key]!)
            : '',
        } as FormatedMetadataProperty;
      }
    );
  },
};

export default formater;
