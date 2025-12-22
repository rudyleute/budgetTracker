import { sanitizedZodResolver } from '../helpers/utils.js';

export const formUtils = (schema) => {
  return {
    resolver: sanitizedZodResolver(schema),
    fieldsMeta: Object.keys(schema.shape).reduce((acc, name) => {
      acc[name] = {required: !schema.shape[name].isOptional()};
      return acc;
    }, {})
  };
};