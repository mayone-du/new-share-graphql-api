/* tslint:disable */
/* eslint-disable */

/* auto-generated by NAPI-RS */

export class ExternalObject<T> {
  readonly '': {
    readonly '': unique symbol
    [K: symbol]: T
  }
}
export interface MetaFields {
  title: string
  description: string
  imageUrl: string
}
export function fetchMetaFields(url: string): MetaFields
