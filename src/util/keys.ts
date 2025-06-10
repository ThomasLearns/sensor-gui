export function keys<ObjectType extends object>(
  obj: ObjectType
): (keyof ObjectType)[] {
  return Object.keys(obj) as (keyof ObjectType)[]
}
