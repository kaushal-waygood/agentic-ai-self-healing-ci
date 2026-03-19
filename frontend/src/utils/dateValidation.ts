/**
 * Date validation helper functions for forms
 */

export interface DateValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Checks if end date is after start date
 */
export const isEndDateAfterStartDate = (
  startDate: string | null | undefined,
  endDate: string | null | undefined,
  isCurrent: boolean = false,
): DateValidationResult => {
  // Skip validation if currently working or dates missing
  if (isCurrent || !startDate || !endDate) {
    return { isValid: true };
  }

  const start = new Date(startDate + '-01');
  const end = new Date(endDate + '-01');

  if (end < start) {
    return {
      isValid: false,
      error: 'End date cannot be before start date',
    };
  }

  return { isValid: true };
};

/**
 * Checks if end date is not in the future
 */
export const isEndDateNotInFuture = (
  endDate: string | null | undefined,
  isCurrent: boolean = false,
): DateValidationResult => {
  // Skip validation if currently working or date missing
  if (isCurrent || !endDate) {
    return { isValid: true };
  }

  const end = new Date(endDate + '-01');
  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  if (end > currentMonth) {
    return {
      isValid: false,
      error: 'End date cannot be in the future',
    };
  }

  return { isValid: true };
};

/**
 * Checks if end date is required (when not current)
 */
export const isEndDateRequired = (
  endDate: string | null | undefined,
  isCurrent: boolean = false,
): DateValidationResult => {
  if (!isCurrent && !endDate) {
    return {
      isValid: false,
      error: 'End date is required if not currently working',
    };
  }

  return { isValid: true };
};

/**
 * Combined date validation for experience/education forms
 */
export const validateExperienceDates = (
  startDate: string | null | undefined,
  endDate: string | null | undefined,
  isCurrent: boolean = false,
): DateValidationResult => {
  // Check if end date required
  const requiredCheck = isEndDateRequired(endDate, isCurrent);
  if (!requiredCheck.isValid) return requiredCheck;

  // Check if end date after start date
  const afterCheck = isEndDateAfterStartDate(startDate, endDate, isCurrent);
  if (!afterCheck.isValid) return afterCheck;

  // Check if end date not in future
  const futureCheck = isEndDateNotInFuture(endDate, isCurrent);
  if (!futureCheck.isValid) return futureCheck;

  return { isValid: true };
};

/**
 * Direct validation function for Zod superRefine
 * This can be imported and used directly in schemas
 */
export const validateEndDate = (data: any, ctx: any) => {
  const isCurrent = Boolean(data?.isCurrent ?? data?.currentlyWorking);

  // End date required check
  // if (!data.isCurrent && !data.endDate) {
  if (!isCurrent && !data.endDate) {
    ctx.addIssue({
      code: 'custom',
      message: 'End date is required if not currently working',
      path: ['endDate'],
    });
    return false;
  }

  // End date after start date check
  // if (!data.isCurrent && data.startDate && data.endDate) {
  if (!isCurrent && data.startDate && data.endDate) {
    const start = new Date(data.startDate + '-01');
    const end = new Date(data.endDate + '-01');

    if (end < start) {
      ctx.addIssue({
        code: 'custom',
        message: 'End date cannot be before start date',
        path: ['endDate'],
      });
      return false;
    }
  }

  // End date not in future check
  // if (!data.isCurrent && data.endDate) {
  if (!isCurrent && data.endDate) {
    const end = new Date(data.endDate + '-01');
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    if (end > currentMonth) {
      ctx.addIssue({
        code: 'custom',
        message: 'End date cannot be in the future',
        path: ['endDate'],
      });
      return false;
    }
  }

  return true;
};

/**
 * Factory function to create date refinements (alternative approach)
 */
export const createDateRefinements = () => {
  return {
    validateEndDate: (data: any, ctx: any) => {
      const isCurrent = Boolean(data?.isCurrent ?? data?.currentlyWorking);

      // End date required check
      // if (!data.isCurrent && !data.endDate) {
      if (!isCurrent && !data.endDate) {
        ctx.addIssue({
          code: 'custom',
          message: 'End date is required if not currently working',
          path: ['endDate'],
        });
        return false;
      }

      // End date after start date check
      //  if (!data.isCurrent && data.startDate && data.endDate) {
      if (!isCurrent && data.startDate && data.endDate) {
        const start = new Date(data.startDate + '-01');
        const end = new Date(data.endDate + '-01');

        if (end < start) {
          ctx.addIssue({
            code: 'custom',
            message: 'End date cannot be before start date',
            path: ['endDate'],
          });
          return false;
        }
      }

      // End date not in future check
      // if (!data.isCurrent && data.endDate) {
      if (!isCurrent && data.endDate) {
        const end = new Date(data.endDate + '-01');
        const now = new Date();
        const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        if (end > currentMonth) {
          ctx.addIssue({
            code: 'custom',
            message: 'End date cannot be in the future',
            path: ['endDate'],
          });
          return false;
        }
      }

      return true;
    },
  };
};
