const SENSITIVE_KEY_PATTERNS = [
  'password',
  'token',
  'secret',
  'cookie',
  'creditcard',
  'ssn',
  'gpa',
  'cv',
  'transcript',
  'phonenumber',
] as const;

const REDACTED_PLACEHOLDER = '[REDACTED_SENSITIVE_DATA]';

function isSensitiveKey(key: string): boolean {
  const lower = key.toLowerCase();
  return SENSITIVE_KEY_PATTERNS.some((pattern) => lower.includes(pattern));
}

export function redactSensitiveData(value: unknown, seen = new WeakSet<object>()): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value !== 'object') {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (seen.has(value)) {
    return '[CIRCULAR]';
  }
  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => redactSensitiveData(item, seen));
  }

  const input = value as Record<string, unknown>;
  const output: Record<string, unknown> = {};

  for (const [key, val] of Object.entries(input)) {
    if (isSensitiveKey(key)) {
      output[key] = REDACTED_PLACEHOLDER;
    } else {
      output[key] = redactSensitiveData(val, seen);
    }
  }

  return output;
}
