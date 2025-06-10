// you can call this function in an unreachable part of code.
// if Typescript deems it to be in fact reachable, it will throw an error
export function assertUnreachable(_: never) {
  throw new Error('Reached unreachable code')
}
