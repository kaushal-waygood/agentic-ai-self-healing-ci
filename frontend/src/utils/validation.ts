/**
 * Validation helper functions for forms
 */

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  message: string;
}

export interface ValidationRules {
  [key: string]: ValidationRule | ValidationRule[];
}

export interface ValidationErrors {
  [key: string]: string;
}

/**
 * Validate a single field against rules
 */
export const validateField = (
  value: any,
  rules: ValidationRule | ValidationRule[],
): string => {
  const ruleArray = Array.isArray(rules) ? rules : [rules];

  for (const rule of ruleArray) {
    // Required check
    if (
      rule.required &&
      (!value || (typeof value === 'string' && !value.trim()))
    ) {
      return rule.message;
    }

    // Skip other validations if value is empty and not required
    if (!value && !rule.required) continue;

    // Min length check
    if (rule.minLength && value?.length < rule.minLength) {
      return rule.message;
    }

    // Max length check
    if (rule.maxLength && value?.length > rule.maxLength) {
      return rule.message;
    }

    // Pattern check
    if (rule.pattern && !rule.pattern.test(value)) {
      return rule.message;
    }

    // Custom validation
    if (rule.custom && !rule.custom(value)) {
      return rule.message;
    }
  }

  return '';
};

/**
 * Validate entire form against rules
 */
export const validateForm = <T extends Record<string, any>>(
  data: T,
  rules: Record<keyof T, ValidationRule | ValidationRule[]>,
): ValidationErrors => {
  const errors: ValidationErrors = {};

  for (const field in rules) {
    const error = validateField(data[field], rules[field]);
    if (error) {
      errors[field] = error;
    }
  }

  return errors;
};

/**
 * Common validation rules
 */
export const requiredRule = (fieldName: string): ValidationRule => ({
  required: true,
  message: `${fieldName} is required`,
});

export const minLengthRule = (
  min: number,
  fieldName: string,
): ValidationRule => ({
  minLength: min,
  message: `${fieldName} must be at least ${min} characters`,
});

export const maxLengthRule = (
  max: number,
  fieldName: string,
): ValidationRule => ({
  maxLength: max,
  message: `${fieldName} must not exceed ${max} characters`,
});

export const phoneRule: ValidationRule = {
  pattern: /^[0-9]{10}$/,
  message: 'Please enter a valid 10-digit phone number',
};

export const emailRule: ValidationRule = {
  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  message: 'Please enter a valid email address',
};

export const locationRule: ValidationRule = {
  pattern: /^[a-zA-Z\s,.'-]+$/,
  message: 'Please enter a valid city or region',
};

export const fullNameRule: ValidationRule[] = [
  {
    required: true,
    message: 'Full Name is required',
  },
  {
    minLength: 2,
    message: 'Full Name must be at least 2 characters',
  },
  {
    maxLength: 50,
    message: 'Full Name must not exceed 50 characters',
  },
];

/**
 * Profile validation rules
 */
export const profileValidationRules = {
  fullName: fullNameRule,
  phone: [
    {
      pattern: /^[0-9]{10}$/,
      message: 'Please enter a valid 10-digit phone number',
    },
  ],
  location: {
    pattern: /^[a-zA-Z\s,.'-]+$/,
    message: 'Please enter a valid city or region',
  },
};
