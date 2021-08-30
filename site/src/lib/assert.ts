export function fakeAssert<T>(val: any): asserts val is T {}

export function assertNever(arg: never): never {
  debugger;
  throw new Error(`unexpected call to assertNever: ${arg}`);
}

export function assert(
  condition: boolean,
  message = "failed assert"
): asserts condition {
  if (!condition) {
    debugger;
    throw new Error(message);
  }
}
