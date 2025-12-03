import DOMPurify from 'dompurify';
import { zodResolver } from '@hookform/resolvers/zod';
import _ from 'lodash';

/**
 *
 * @param {Array<Object>} data
 * @param {String} columnName - name of the column to groupBy
 * @param {?Function} functor - functor to transform the value in the columnName column
 * @returns {{keys: Array<?String>, groups: Object}} - an array of groups' keys in keys and grouped data in groups
 */
export const groupBy = (data, columnName, functor = null) => {
  const keys = [];
  const groups = {};
  const getKey = functor || ((value) => value);

  data.forEach(item => {
    const newKey = getKey(item[columnName]);

    if (newKey in groups) {
      groups[newKey].push(item);
    } else {
      keys.push(newKey);
      groups[newKey] = [item];
    }
  });

  return { keys, groups };
};

/**
 * Sanitizing data including nesting objects
 * @param {Object|String|Array} value - value to sanitize
 * @returns {Object|String|Array} - sanitized data
 */
const sanitizeData = (value) => {
  if (typeof value === "string") return DOMPurify.sanitize(value);
  if (Array.isArray(value)) return value.map(sanitizeData);

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, sanitizeData(v)])
    );
  }

  return value;
};

export const sanitizedZodResolver = (schema) => async (values, context, options) => {
  const sanitized = sanitizeData(values);
  return zodResolver(schema)(sanitized, context, options);
}
/**
 * Updating parameters of the query or returning the same object
 *
 * @param {Object} values - new values of the queryParams
 * @param {Object} prev - actual version of the queryParams' state
 * @param {Array<String>} params - a list of allowed queryParams
 * @returns {Object} - a new object if at least one allowed field changed, otherwise returns prev
 */
export const newQueryParams = (values, prev, params) => {
  const next = { ...prev };

  params.forEach(key => {
    if (values[key] != null) next[key] = values[key];
  });
  return !_.isEqual(prev, next) ? next : prev
};

/**
 * Validate (changed) fields and return their values if valid
 *
 * @param {Function} trigger - trigger function of react-hook-form
 * @param {Object} values - values of the react-hook-form
 * @param {?Object} dirtyFields - react-hook-form's formState.dirtyFields
 * @returns {?Object} - changed values if all (changed) fields are valid, null otherwise
 **/
export const validateFields = async (trigger, values, dirtyFields = null) => {
  const changedFields = Object.keys(dirtyFields ?? values)

  if (changedFields.length === 0) return null;

  const isValid = await trigger(changedFields);
  if (!isValid) return null;

  return changedFields.reduce((acc, key) => {
    acc[key] = values[key];
    return acc;
  }, {});
};