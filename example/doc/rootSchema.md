# Root Schema

## version

> `number` | optional | defaults to `1.0.0`


Follows semantic versioning.

## foo

> `string` | required


This is a description.


whitelist: `valid0`, `valid1`, `valid2`, `valid3`


blacklist: `invalid0`, `invalid1`, `invalid2`, `invalid3`

## bar

> `boolean` | optional

## any

> `*` | optional

## list

> `array` | optional | length: `5`

## primitiveList

> `array`: `string`, `number`, `boolean` | optional | min: `1` | max: `3`

## objectList

> `array`: [List Item](./listItemSchema.md) | optional

## [nestedObjSchema1](./nestedObjSchema1.md)

> `object` | optional
