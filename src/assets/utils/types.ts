export function isUndefined(target: unknown): target is undefined {
  return typeof target === 'undefined';
}
