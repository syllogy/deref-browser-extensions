import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** The `Upload` scalar type represents a file upload. */
  Upload: any;
};


export enum CacheControlScope {
  Public = 'PUBLIC',
  Private = 'PRIVATE'
}

export type Mutation = {
  __typename?: 'Mutation';
  saveNoteForResource?: Maybe<Note>;
};


export type MutationSaveNoteForResourceArgs = {
  note?: Maybe<SaveNoteForResourceInput>;
};

export type Note = {
  __typename?: 'Note';
  id: Scalars['ID'];
  arn: Scalars['String'];
  body: Scalars['String'];
  createdAt: Scalars['Int'];
  updatedAt: Scalars['Int'];
};

export type Query = {
  __typename?: 'Query';
  resourceNote?: Maybe<Note>;
  myNotes: Array<Note>;
  arnToAwsConsoleUrl?: Maybe<Scalars['String']>;
};


export type QueryResourceNoteArgs = {
  arn?: Maybe<Scalars['String']>;
};


export type QueryArnToAwsConsoleUrlArgs = {
  arn: Scalars['String'];
};

export type SaveNoteForResourceInput = {
  arn: Scalars['String'];
  body: Scalars['String'];
};


export type ResourceNoteQueryVariables = Exact<{
  arn: Scalars['String'];
}>;


export type ResourceNoteQuery = (
  { __typename?: 'Query' }
  & { resourceNote?: Maybe<(
    { __typename?: 'Note' }
    & Pick<Note, 'id' | 'body'>
  )> }
);

export type SaveResourceNoteMutationVariables = Exact<{
  input: SaveNoteForResourceInput;
}>;


export type SaveResourceNoteMutation = (
  { __typename?: 'Mutation' }
  & { saveNoteForResource?: Maybe<(
    { __typename?: 'Note' }
    & Pick<Note, 'id' | 'body'>
  )> }
);


export const ResourceNoteDocument: DocumentNode<ResourceNoteQuery, ResourceNoteQueryVariables> = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ResourceNote"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"arn"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resourceNote"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"arn"},"value":{"kind":"Variable","name":{"kind":"Name","value":"arn"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"body"}}]}}]}}]};
export const SaveResourceNoteDocument: DocumentNode<SaveResourceNoteMutation, SaveResourceNoteMutationVariables> = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SaveResourceNote"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SaveNoteForResourceInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"saveNoteForResource"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"note"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"body"}}]}}]}}]};
export const namedOperations = {
  Query: {
    ResourceNote: 'ResourceNote'
  },
  Mutation: {
    SaveResourceNote: 'SaveResourceNote'
  }
}