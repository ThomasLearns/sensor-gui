// given an element handling an input event, check the validity of the number input
// return undefined if its not valid, the placeholder if its empty, or the
// value converted to a number otherwise
export function getValidNumberInput(
  target: HTMLInputElement & EventTarget,
  placeholder: number
): undefined | number {
  if (target.checkValidity() === false) return undefined
  if (target.value === '') return placeholder
  return Number(target.value)
}
