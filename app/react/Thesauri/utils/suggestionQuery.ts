import { SuggestionResultSchema } from '../types/suggestionResultType';

/* An Un-sanitized Elastic Search Result
.
└── template results: []
    ├── result 1: {}
    └── result 2: {}
        ├── rows: []
        ├── totalRows: number
        └── aggregations: []
            └── aggregation: {}
                └── all: {}
                    ├── meta
                    ├── doc_count: number
                    ├── thesaurus: {}
                    │   └── buckets: []
                    └── _thesaurus: {}
                        └── buckets: []
                            └── bucket: {}
                                ├── key: string
                                ├── doc_count: number
                                └── filtered: {}
                                    ├── meta
                                    └── doc_count: number
                                    */

/* Takes an elastic query response and transforms it into a SuggestionResult.*/
export function buildSuggestionResult(
  raw: any,
  thesaurusPropertyName: string
): SuggestionResultSchema {
  const suggestionFieldName = `_${thesaurusPropertyName}`;
  const result: Partial<SuggestionResultSchema> = {};
  result.totalRows = raw.totalRows || 0;
  result.totalSuggestions = 0;
  if (
    raw.aggregations !== undefined &&
    raw.aggregations.all !== undefined &&
    raw.aggregations.all.hasOwnProperty(suggestionFieldName)
  ) {
    const { buckets: rawValues } = raw.aggregations.all[suggestionFieldName];
    const totalValues: { [key: string]: number } = {};
    rawValues.forEach((rawResult: any) => {
      totalValues[rawResult.key] = rawResult.filtered.doc_count;
      result.totalSuggestions += rawResult.filtered.doc_count;
    });
    result.thesaurus = {
      propertyName: thesaurusPropertyName,
      totalValues,
    };
  }
  return result as SuggestionResultSchema;
}

/* Flattens SuggestionResult[] into a single SuggestionResult. */
export function flattenSuggestionResults(
  perTemplate: SuggestionResultSchema[],
  thesaurusPropertyName: string
): SuggestionResultSchema {
  const result: SuggestionResultSchema = {
    totalRows: 0,
    totalSuggestions: 0,
    thesaurus: { propertyName: thesaurusPropertyName, totalValues: {} },
  };
  perTemplate.forEach((templateResult: SuggestionResultSchema) => {
    result.totalRows += templateResult.totalRows;
    result.totalSuggestions += templateResult.totalSuggestions;
    if (
      templateResult.hasOwnProperty('thesaurus') &&
      templateResult.thesaurus.hasOwnProperty('totalValues')
    ) {
      Object.entries(templateResult.thesaurus.totalValues).forEach(([key, value]) => {
        if (!result.thesaurus.totalValues.hasOwnProperty(key)) {
          result.thesaurus.totalValues[key] = 0;
        }
        result.thesaurus.totalValues[key]! += value || 0;
      });
    }
  });
  return result;
}
