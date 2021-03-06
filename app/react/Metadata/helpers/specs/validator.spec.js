import validator, { notEmpty } from '../validator';

describe('metadata validator', () => {
  const fieldsTemplate = [
    { name: 'field1', label: 'label1', required: true },
    { name: 'field2', label: 'label2', type: 'select', content: 'thesauriId' },
    { name: 'field3', label: 'label3', required: true },
  ];

  const template = { name: 'template1', _id: 'templateId', properties: fieldsTemplate };

  describe('required', () => {
    it('should return false on an empty string', () => {
      expect(notEmpty('')).toBe(false);
      expect(notEmpty('  ')).toBe(false);
      expect(notEmpty({})).toBe(false);
      expect(notEmpty([])).toBe(false);
      expect(notEmpty('value')).toBe(true);
      expect(notEmpty(null)).toBe(false);
      expect(notEmpty(423)).toBe(true);
      expect(notEmpty(0)).toBe(true);
    });

    it('should return false on an empty array', () => {
      expect(notEmpty([])).toBe(false);
    });
  });

  describe('generate', () => {
    it('should should generate a validation based on the template passed', () => {
      const validationObject = validator.generate(template);
      expect(validationObject.title).toEqual({ required: notEmpty });
      expect(validationObject['metadata.field1']).toEqual({ required: notEmpty });
      expect(validationObject['metadata.field3']).toEqual({ required: notEmpty });
    });
  });
});
