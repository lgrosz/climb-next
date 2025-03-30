import request from 'graphql-request'
import { type TypedDocumentNode } from '@graphql-typed-document-node/core'
import { GRAPHQL_ENDPOINT } from '@/constants';

export function graphqlQuery<TResult, TVariables>(
  document: TypedDocumentNode<TResult, TVariables>,
  ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
): Promise<TResult> {
  return request(GRAPHQL_ENDPOINT, document, variables ? variables : undefined);
}

