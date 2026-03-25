export const IMPROVEMENT_POPUP_EVENT_NAME =
  'zobsai:improvement-popup-event';

export type ImprovementEventType =
  | 'onboarding_complete'
  | 'cv_generate_complete'
  | 'cover_letter_complete'
  | 'job_apply_success'
  | 'auto_apply_success';

export type PendingImprovementEvent = {
  type: ImprovementEventType;
  createdAt: number;
  priority: number;
};

type ImprovementPopupState = {
  pendingEvent: PendingImprovementEvent | null;
  submittedUntil: number | null;
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const EVENT_PRIORITY: Record<ImprovementEventType, number> = {
  job_apply_success: 5,
  auto_apply_success: 4,
  cv_generate_complete: 3,
  cover_letter_complete: 2,
  onboarding_complete: 1,
};

const EVENT_DELAY_MS: Record<ImprovementEventType, number> = {
  onboarding_complete: 15_000,
  cv_generate_complete: 20_000,
  cover_letter_complete: 20_000,
  job_apply_success: 25_000,
  auto_apply_success: 25_000,
};

const VALID_EVENT_TYPES = new Set<ImprovementEventType>(
  Object.keys(EVENT_PRIORITY) as ImprovementEventType[],
);

function getStorageKey(userId: string) {
  return `improvement_popup_state_${userId}`;
}

export function getImprovementPopupSessionAttemptKey(userId: string) {
  return `improvement_popup_attempted_${userId}`;
}

export function getImprovementPopupEventAttemptId(
  event: PendingImprovementEvent,
) {
  return `${event.type}:${event.createdAt}`;
}

function getDefaultState(): ImprovementPopupState {
  return {
    pendingEvent: null,
    submittedUntil: null,
  };
}

function isValidEventType(value: unknown): value is ImprovementEventType {
  return typeof value === 'string' && VALID_EVENT_TYPES.has(value as any);
}

function normalizePendingEvent(value: unknown): PendingImprovementEvent | null {
  if (!value || typeof value !== 'object') return null;

  const maybeEvent = value as Record<string, unknown>;
  if (!isValidEventType(maybeEvent.type)) return null;

  return {
    type: maybeEvent.type,
    createdAt:
      typeof maybeEvent.createdAt === 'number'
        ? maybeEvent.createdAt
        : Date.now(),
    priority:
      typeof maybeEvent.priority === 'number'
        ? maybeEvent.priority
        : EVENT_PRIORITY[maybeEvent.type],
  };
}

function normalizeState(value: unknown): ImprovementPopupState {
  if (!value || typeof value !== 'object') return getDefaultState();

  const maybeState = value as Record<string, unknown>;
  const submittedUntil =
    typeof maybeState.submittedUntil === 'number'
      ? maybeState.submittedUntil
      : null;

  return {
    pendingEvent: normalizePendingEvent(maybeState.pendingEvent),
    submittedUntil:
      submittedUntil && submittedUntil > Date.now() ? submittedUntil : null,
  };
}

export function readImprovementPopupState(userId: string): ImprovementPopupState {
  if (!userId || typeof window === 'undefined') return getDefaultState();

  const key = getStorageKey(userId);
  const raw = localStorage.getItem(key);
  if (!raw) return getDefaultState();

  try {
    const nextState = normalizeState(JSON.parse(raw));
    if (!nextState.pendingEvent && !nextState.submittedUntil) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(nextState));
    }
    return nextState;
  } catch (error) {
    console.warn('Failed to parse improvement popup state:', error);
    localStorage.removeItem(key);
    return getDefaultState();
  }
}

function writeImprovementPopupState(
  userId: string,
  state: ImprovementPopupState,
) {
  if (!userId || typeof window === 'undefined') return;

  const key = getStorageKey(userId);
  if (!state.pendingEvent && !state.submittedUntil) {
    localStorage.removeItem(key);
    return;
  }

  localStorage.setItem(key, JSON.stringify(state));
}

export function markImprovementPopupPending(
  userId: string,
  type: ImprovementEventType,
) {
  const nextState = readImprovementPopupState(userId);

  // Suppression only applies to future prompts; new events during suppression
  // do not queue up stale prompts.
  if (nextState.submittedUntil && nextState.submittedUntil > Date.now()) {
    return nextState;
  }

  const nextEvent: PendingImprovementEvent = {
    type,
    createdAt: Date.now(),
    priority: EVENT_PRIORITY[type],
  };

  const currentEvent = nextState.pendingEvent;
  const shouldReplace =
    !currentEvent ||
    nextEvent.priority > currentEvent.priority ||
    (nextEvent.priority === currentEvent.priority &&
      nextEvent.createdAt >= currentEvent.createdAt);

  if (shouldReplace) {
    nextState.pendingEvent = nextEvent;
    writeImprovementPopupState(userId, nextState);
  }

  return nextState;
}

export function dismissImprovementPopup(userId: string) {
  const nextState = readImprovementPopupState(userId);
  nextState.pendingEvent = null;
  writeImprovementPopupState(userId, nextState);
  return nextState;
}

export function markImprovementPopupSubmitted(userId: string) {
  const nextState: ImprovementPopupState = {
    pendingEvent: null,
    submittedUntil: Date.now() + 30 * DAY_IN_MS,
  };
  writeImprovementPopupState(userId, nextState);
  return nextState;
}

export function getImprovementPopupDelayMs(type: ImprovementEventType) {
  return EVENT_DELAY_MS[type];
}

export function dispatchImprovementPopupEvent(type: ImprovementEventType) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent(IMPROVEMENT_POPUP_EVENT_NAME, {
      detail: { type },
    }),
  );
}
