import request from 'graphql-request'
import { type TypedDocumentNode } from '@graphql-typed-document-node/core'

export function graphqlQuery<TResult, TVariables>(
  document: TypedDocumentNode<TResult, TVariables>,
  ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
): Promise<TResult> {
  return request('http://localhost:4000/graphql', document, variables ? variables : undefined);
}

export function query(endpoint: string, query: string, variables: any) {
  return fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: query,
      variables: variables,
    })
  })
}
