/** @format */

/* eslint-disable max-lines,max-statements */

import Ajv from 'ajv';
import db from 'api/utils/testing_db';
import { validateEntity } from '../entitySchema';
import fixtures, { templateId, simpleTemplateId, nonExistentId } from './validatorFixtures';

describe('entity schema', () => {
  beforeEach(async () => {
    await db.clearAllAndLoad(fixtures);
  });

  afterAll(async () => {
    await db.disconnect();
  });

  describe('validateEntity', () => {
    let entity;

    beforeEach(() => {
      entity = {
        _id: 'entity',
        sharedId: 'sharedId',
        title: 'Test',
        template: templateId.toString(),
        language: 'en',
        mongoLanguage: 'en',
        file: {
          originalname: 'file',
          filename: 'file',
          mimetype: 'pdf',
          size: 100,
          timestamp: 100,
          language: 'en',
        },
        attachments: [
          {
            originalname: 'att',
            filename: 'att',
            mimetype: 'doc',
            timestamp: 100,
            size: 100,
          },
        ],
        icon: {
          _id: 'icon',
          type: 'icon',
          label: 'Icon',
        },
        totalPages: 11,
        fullText: {
          1: 'this is[[1]] a test[[1]]',
        },
        creationDate: 100,
        processed: true,
        uploaded: true,
        published: false,
        pdfInfo: {
          1: {
            chars: 20,
          },
        },
        toc: [
          {
            range: { start: 100, end: 200 },
            label: 'Label',
            indentation: 0,
          },
        ],
        user: 'user',
        metadata: {
          name: [{ value: 'test' }],
          markdown: [{ value: 'rich text' }],
          image: [{ value: 'image' }],
          media: [{ value: 'https://youtube.com/foo' }],
          numeric: [{ value: 100 }],
          date: [{ value: 100 }],
          multidate: [{ value: 100 }, { value: 200 }],
          daterange: [{ value: { from: 100, to: 200 } }],
          multidaterange: [{ value: { from: 100, to: 200 } }, { value: { from: 1000, to: 2000 } }],
          geolocation: [{ value: { lat: 80, lon: 76, label: '' } }],
          select: [{ value: 'value' }],
          multiselect: [{ value: 'one' }, { value: 'two' }],
          required_multiselect: [{ value: 'one' }],
          relationship: [{ value: 'rel1' }, { value: 'rel2' }],
          link: [{ value: { label: 'label', url: 'url' } }],
          preview: [{ value: '' }],
        },
      };
    });

    const testValid = () => validateEntity(entity);

    const testInvalid = async () => {
      try {
        await validateEntity(entity);
        fail('should throw error');
      } catch (e) {
        expect(e).toBeInstanceOf(Ajv.ValidationError);
      }
    };

    it('should allow ObjectId for _id fields', async () => {
      entity._id = db.id();
      entity.user = db.id();
      entity.template = templateId;
      await testValid();
    });

    it('should allow template to be missing', async () => {
      delete entity.template;
      await testValid();
      entity.template = '';
      await testValid();
    });

    it('should fail if template does not exist', async () => {
      entity.template = nonExistentId.toString();
      await testInvalid();
    });

    it('should fail if title is not a string', async () => {
      entity.title = {};
      await testInvalid();
      entity.title = 10;
      await testInvalid();
    });

    it('should allow title to be missing', async () => {
      delete entity.title;
      await testValid();
    });

    describe('metadata', () => {
      it('should allow non-required properties to be missing', async () => {
        delete entity.metadata.geolocation;
        await testValid();
        delete entity.metadata.date;
        await testValid();
      });

      describe('if no property is required', () => {
        it('should allow metadata object to be missing if there are not required properties', async () => {
          entity.template = simpleTemplateId;
          delete entity.metadata;
          await testValid();
        });

        it('should allow metadata object to be empty', async () => {
          entity.template = simpleTemplateId;
          entity.metadata = {};
          await testValid();
        });
      });

      describe('if property is required', () => {
        it('should fail if field does not exist', async () => {
          delete entity.metadata.name;
          await testInvalid();
          entity.metadata.name = [{ value: '' }];
          await testInvalid();
          entity.metadata.name = [{ value: null }];
          await testInvalid();
          entity.metadata.name = [{ value: 'name' }];
          entity.metadata.required_multiselect = [];
          await testInvalid();
        });
      });

      describe('any property', () => {
        it('should fail if value is not an array', async () => {
          entity.metadata.name = { value: 10 };
          await testInvalid();
        });
      });

      describe('text property', () => {
        it('should fail if value is not a string', async () => {
          entity.metadata.name = [{ value: 10 }];
          await testInvalid();
        });
        it('should fail if value is not a single string', async () => {
          entity.metadata.name = [{ value: 'a' }, { value: 'b' }];
          await testInvalid();
        });
      });

      describe('markdown property', () => {
        it('should fail if value is not a string', async () => {
          entity.metadata.markdown = [{ value: {} }];
          await testInvalid();
        });
      });

      describe('media property', () => {
        it('should fail if value is not a string', async () => {
          entity.metadata.media = [{ value: 10 }];
          await testInvalid();
        });
      });

      describe('image property', () => {
        it('should fail if value is not a string', async () => {
          entity.metadata.image = [{ value: 10 }];
          await testInvalid();
        });
      });

      describe('numeric property', () => {
        it('should fail if value is not a number', async () => {
          entity.metadata.numeric = [{ value: 'test' }];
          await testInvalid();
        });
        it('should allow value to be empty string', async () => {
          entity.metadata.numeric = [{ value: '' }];
          await testValid();
        });
      });

      describe('date property', () => {
        it('should fail if value is not a positive number', async () => {
          entity.metadata.date = [{ value: 'test' }];
          await testInvalid();
          entity.metadata.date = [{ value: -100 }];
          await testInvalid();
        });
        it('should allow value to be null if property is not required', async () => {
          entity.metadata.date = [{ value: null }];
          await testValid();
        });
      });

      describe('multidate property', () => {
        it('should fail if value is not an array of numbers', async () => {
          entity.metadata.multidate = [{ value: 100 }, { value: '200' }];
          await testInvalid();
          entity.metadata.multidate = [{ value: '100' }];
          await testInvalid();
          entity.metadata.multidate = { value: 100 };
          await testInvalid();
        });
        it('should allow null items', async () => {
          entity.metadata.multidate = [
            { value: 100 },
            { value: null },
            { value: 200 },
            { value: null },
          ];
          await testValid();
        });
      });

      describe('daterange property', () => {
        it('should fail if value is not an object', async () => {
          entity.metadata.daterange = [{ value: 'dates' }];
          await testInvalid();
          entity.metadata.daterange = [{ value: 100 }, { value: 200 }];
          await testInvalid();
        });

        it('should allow either from or to to be null', async () => {
          entity.metadata.daterange = [{ value: { from: null, to: 100 } }];
          await testValid();
          entity.metadata.daterange = [{ value: { from: 100, to: null } }];
          await testValid();
          entity.metadata.daterange = [{ value: { from: null, to: null } }];
          await testValid();
        });
        it('should allow value to be an empty object', async () => {
          entity.metadata.daterange = [{ value: {} }];
          await testValid();
        });
        it('should fail if from and to are not numbers', async () => {
          entity.metadata.daterange = [{ value: { from: 'test', to: 'test' } }];
          await testInvalid();
        });
        it('should fail if from is greater than to', async () => {
          entity.metadata.daterange = [{ value: { from: 100, to: 50 } }];
          await testInvalid();
        });
      });

      describe('multidaterange property', () => {
        it('should fail if value is not array of date ranges', async () => {
          entity.metadata.multidaterange = [{ value: { from: 100, to: '200' } }];
          await testInvalid();
          entity.metadata.multidaterange = [{ value: 100 }, { value: 200 }];
          await testInvalid();
          entity.metadata.multidaterange = [{ value: { from: 200, to: 100 } }];
          await testInvalid();
        });
      });

      describe('select property', () => {
        it('should fail if value is not a non-empty string', async () => {
          entity.metadata.select = [{ value: 10 }];
          await testInvalid();
          entity.metadata.select = [{ value: ['test'] }];
          await testInvalid();
        });
        it('should allow empty string if property is not required', async () => {
          entity.metadata.select = [{ value: '' }];
          await testValid();
        });
      });

      describe('multiselect property', () => {
        it('should fail if value is not an array of non-empty strings', async () => {
          entity.metadata.multiselect = ['val1', 10, {}];
          await testInvalid();
          entity.metadata.multiselect = ['one', '', 'two'];
          await testInvalid();
        });
        it('should allow value to be an empty array', async () => {
          entity.metadata.multiselect = [];
          await testValid();
        });
      });

      describe('relationship property', () => {
        it('should fail if value is not an array of non-empty strings', async () => {
          entity.metadata.relationship = ['val1', 10, {}];
          await testInvalid();
          entity.metadata.relationship = ['one', '', 'two'];
          await testInvalid();
        });
      });

      describe('link property', () => {
        it('should fail if value is not an object', async () => {
          entity.metadata.link = ['label', 'url'];
          await testInvalid();
        });

        it('should fail if label or url are not provided', async () => {
          entity.metadata.link = { label: 'label', url: '' };
          await testInvalid();
          entity.metadata.link = { label: 'label' };
          await testInvalid();
          entity.metadata.link = { label: '', url: 'url' };
          await testInvalid();
          entity.metadata.link = { url: 'url' };
          await testInvalid();
        });

        it('should fail if label or url is not a string', async () => {
          entity.metadata.link = { label: 'label', url: 10 };
          await testInvalid();
          entity.metadata.link = { label: true, url: 'url' };
          await testInvalid();
        });
      });

      describe('geolocation property', () => {
        it('should fail if value is not an array of lat/lon object', async () => {
          entity.metadata.geolocation = { lat: 80, lon: 80, label: '' };
          await testInvalid();
          entity.metadata.geolocation = [80, 90];
          await testInvalid();
        });
        it('should fail if lat or lon are not numbers', async () => {
          entity.metadata.geolocation = [{ value: { lat: '', lon: 80, label: '' } }];
          await testInvalid();
          entity.metadata.geolocation = [{ value: { lat: 80, lon: '', label: '' } }];
          await testInvalid();
        });
        it('should fail if label is not a string', async () => {
          entity.metadata.geolocation[0].value.label = 10;
          await testInvalid();
        });
        it('should fail if lat or lon is missing', async () => {
          entity.metadata.geolocation = [{ value: { lon: 80, label: '' } }];
          await testInvalid();
          entity.metadata.geolocation = [{ value: { lat: 80, label: '' } }];
          await testInvalid();
        });
        it('should fail if lat is not within range -90 - 90', async () => {
          entity.metadata.geolocation[0].value.lat = -91;
          await testInvalid();
          entity.metadata.geolocation[0].value.lat = 91;
          await testInvalid();
        });
        it('should fail if lon is not within range -180 - 180', async () => {
          entity.metadata.geolocation[0].value.lon = -181;
          await testInvalid();
          entity.metadata.geolocation[0].value.lon = 181;
          await testInvalid();
        });
      });
    });
  });
});