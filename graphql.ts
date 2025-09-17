import request from 'graphql-request'
import { type TypedDocumentNode } from '@graphql-typed-document-node/core'
import { GRAPHQL_ENDPOINT } from '@/constants';

export function graphqlQuery<TResult, TVariables>(
  document: TypedDocumentNode<TResult, TVariables>,
  ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
): Promise<TResult> {
  // TODO I should be able to handle `File` types here (see codegen.ts), and correctly POST for
  // multi-part uploads. See images/new/upload/route.ts
  return request(GRAPHQL_ENDPOINT, document, variables ? variables : undefined);
}

