export const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
  Promise.race<T>([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), ms)),
  ]);