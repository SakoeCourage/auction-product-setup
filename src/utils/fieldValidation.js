import { z } from 'zod'

/**
 * Builds a Zod schema for a single field based on its definition.
 *
 * @param {Object} field - The field definition object
 * @param {string} field.fieldName - Internal field name
 * @param {string} field.fieldLabel - Display label
 * @param {string} field.dataType - One of: Text, Number, Decimal, Date, DateTime, Boolean,
 *                                  Dropdown, MultiSelect, TextArea, Email, Phone, Url,
 *                                  Currency, Percentage, File, Image
 * @param {boolean} field.isRequired - Whether the field is required
 * @param {Object|null} field.validationRules - Validation constraints
 * @param {number} [field.validationRules.minLength] - Min string length
 * @param {number} [field.validationRules.maxLength] - Max string length
 * @param {number} [field.validationRules.minValue] - Min numeric value
 * @param {number} [field.validationRules.maxValue] - Max numeric value
 * @param {string} [field.validationRules.pattern] - Regex pattern string
 * @param {Object|null} field.fieldProperties - Extra field properties
 * @param {Array}  field.options - Available options for Dropdown/MultiSelect
 * @returns {import('zod').ZodType}
 */
function buildFieldSchema(field) {
  const label = field.fieldLabel || field.fieldName || 'Field'
  const rules = field.validationRules || {}
  const props = field.fieldProperties || {}
  let schema

  switch (field.dataType) {
    case 'Number':
    case 'Currency': {
      schema = z.coerce.number({ message: `${label} must be a number` })
      if (rules.minValue != null) schema = schema.min(rules.minValue, { message: `${label} must be at least ${rules.minValue}` })
      if (rules.maxValue != null) schema = schema.max(rules.maxValue, { message: `${label} must be at most ${rules.maxValue}` })
      if (props.min != null) schema = schema.min(props.min, { message: `${label} must be at least ${props.min}` })
      if (props.max != null) schema = schema.max(props.max, { message: `${label} must be at most ${props.max}` })
      if (!field.isRequired) schema = schema.optional()
      break
    }

    case 'Decimal':
    case 'Percentage': {
      schema = z.coerce.number({ message: `${label} must be a number` })
      if (rules.minValue != null) schema = schema.min(rules.minValue, { message: `${label} must be at least ${rules.minValue}` })
      if (rules.maxValue != null) schema = schema.max(rules.maxValue, { message: `${label} must be at most ${rules.maxValue}` })
      if (props.min != null) schema = schema.min(props.min, { message: `${label} must be at least ${props.min}` })
      if (props.max != null) schema = schema.max(props.max, { message: `${label} must be at most ${props.max}` })
      if (!field.isRequired) schema = schema.optional()
      break
    }

    case 'Email': {
      schema = z.string({ message: `${label} is required` })
      if (field.isRequired) {
        schema = schema.min(1, { message: `${label} is required` })
      }
      schema = schema.email({ message: `${label} must be a valid email` })
      if (rules.minLength != null) schema = schema.min(rules.minLength, { message: `${label} must be at least ${rules.minLength} characters` })
      if (rules.maxLength != null) schema = schema.max(rules.maxLength, { message: `${label} must be at most ${rules.maxLength} characters` })
      if (!field.isRequired) schema = schema.optional()
      break
    }

    case 'Url': {
      schema = z.string({ message: `${label} is required` })
      if (field.isRequired) {
        schema = schema.min(1, { message: `${label} is required` })
      }
      schema = schema.url({ message: `${label} must be a valid URL` })
      if (rules.minLength != null) schema = schema.min(rules.minLength, { message: `${label} must be at least ${rules.minLength} characters` })
      if (rules.maxLength != null) schema = schema.max(rules.maxLength, { message: `${label} must be at most ${rules.maxLength} characters` })
      if (!field.isRequired) schema = schema.optional()
      break
    }

    case 'Phone': {
      schema = z.string({ message: `${label} is required` })
      if (field.isRequired) {
        schema = schema.min(1, { message: `${label} is required` })
      }
      if (rules.pattern) {
        schema = schema.regex(new RegExp(rules.pattern), { message: `${label} format is invalid` })
      }
      if (rules.minLength != null) schema = schema.min(rules.minLength, { message: `${label} must be at least ${rules.minLength} characters` })
      if (rules.maxLength != null) schema = schema.max(rules.maxLength, { message: `${label} must be at most ${rules.maxLength} characters` })
      if (!field.isRequired) schema = schema.optional()
      break
    }

    case 'Date':
    case 'DateTime': {
      schema = z.string({ message: `${label} is required` })
      if (field.isRequired) {
        schema = schema.min(1, { message: `${label} is required` })
      }
      if (!field.isRequired) schema = schema.optional()
      break
    }

    case 'Boolean': {
      schema = z.coerce.boolean({ message: `${label} must be true or false` })
      if (!field.isRequired) schema = schema.optional()
      break
    }

    case 'Dropdown': {
      const validValues = (field.options || []).map((o) => o.optionValue).filter(Boolean)
      schema = z.string({ message: `${label} is required` })
      if (field.isRequired) {
        schema = schema.min(1, { message: `${label} is required` })
      }
      if (validValues.length > 0) {
        schema = schema.refine((val) => !val || validValues.includes(val), {
          message: `${label} must be one of: ${validValues.join(', ')}`,
        })
      }
      if (!field.isRequired) schema = schema.optional()
      break
    }

    case 'MultiSelect': {
      const validValues = (field.options || []).map((o) => o.optionValue).filter(Boolean)
      // Stored as comma-separated string
      schema = z.string({ message: `${label} is required` })
      if (field.isRequired) {
        schema = schema.min(1, { message: `${label} requires at least one selection` })
      }
      if (validValues.length > 0) {
        schema = schema.refine(
          (val) => {
            if (!val) return true
            const selected = val.split(',').filter(Boolean)
            return selected.every((v) => validValues.includes(v))
          },
          { message: `${label} contains invalid selections` }
        )
      }
      if (!field.isRequired) schema = schema.optional()
      break
    }

    case 'File':
    case 'Image': {
      schema = z.string({ message: `${label} is required` })
      if (field.isRequired) {
        schema = schema.min(1, { message: `${label} is required` })
      }
      if (!field.isRequired) schema = schema.optional()
      break
    }

    default: {
      // Text, TextArea
      schema = z.string({ message: `${label} is required` })
      if (field.isRequired) {
        schema = schema.min(1, { message: `${label} is required` })
      }
      if (rules.minLength != null) schema = schema.min(rules.minLength, { message: `${label} must be at least ${rules.minLength} characters` })
      if (rules.maxLength != null) schema = schema.max(rules.maxLength, { message: `${label} must be at most ${rules.maxLength} characters` })
      if (rules.pattern) {
        schema = schema.regex(new RegExp(rules.pattern), { message: `${label} format is invalid` })
      }
      if (!field.isRequired) schema = schema.optional()
      break
    }
  }

  return schema
}

/**
 * Evaluates whether a field is visible based on its conditional rules and current form values.
 *
 * @param {Object|null} rules - The conditional rules object
 * @param {string} [rules.showIf] - Field name to depend on
 * @param {string} [rules.operator] - Comparison operator
 * @param {string} [rules.value] - Target value to compare against
 * @param {Object} formValues - Current form values keyed by fieldName
 * @returns {boolean}
 */
export function evaluateCondition(rules, formValues) {
  if (!rules || !rules.showIf) return true
  const depValue = formValues[rules.showIf] ?? ''
  const target = rules.value ?? ''
  const op = rules.operator || 'equals'

  switch (op) {
    case 'equals':
      return String(depValue).toLowerCase() === String(target).toLowerCase()
    case 'notEquals':
      return String(depValue).toLowerCase() !== String(target).toLowerCase()
    case 'contains':
      return String(depValue).toLowerCase().includes(String(target).toLowerCase())
    case 'greaterThan':
      return parseFloat(depValue) > parseFloat(target)
    case 'lessThan':
      return parseFloat(depValue) < parseFloat(target)
    default:
      return true
  }
}

/**
 * Builds a full Zod object schema from an array of field definitions.
 * Only includes fields that are currently visible based on conditional rules.
 *
 * @param {Array<Object>} fields - Array of field definition objects
 * @param {Object} [formValues={}] - Current form values (used for conditional visibility)
 * @returns {import('zod').ZodObject}
 */
export function buildFormSchema(fields, formValues = {}) {
  const shape = {}

  for (const field of fields) {
    if (!field.fieldName) continue

    const visible = evaluateCondition(field.conditionalRules, formValues)
    if (!visible) continue

    shape[field.fieldName] = buildFieldSchema(field)
  }

  return z.object(shape)
}

/**
 * Validates form values against field definitions.
 * Returns a result object with success status and field-level errors.
 *
 * @param {Array<Object>} fields - Array of field definition objects
 * @param {Object} formValues - Form values keyed by fieldName
 * @returns {{ success: boolean, errors: Object<string, string>, data: Object|null }}
 *   - success: true if all validations pass
 *   - errors: map of fieldName → first error message (only for failing fields)
 *   - data: parsed/coerced values if successful, null otherwise
 */
export function validateForm(fields, formValues) {
  const schema = buildFormSchema(fields, formValues)
  const result = schema.safeParse(formValues)

  if (result.success) {
    return { success: true, errors: {}, data: result.data }
  }

  const errors = {}
  for (const issue of result.error.issues) {
    const fieldName = issue.path[0]
    if (fieldName && !errors[fieldName]) {
      errors[fieldName] = issue.message
    }
  }

  return { success: false, errors, data: null }
}
