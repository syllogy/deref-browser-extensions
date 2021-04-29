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
};


export type QueryResourceNoteArgs = {
  arn?: Maybe<Scalars['String']>;
};

export type SaveNoteForResourceInput = {
  arn: Scalars['String'];
  body: Scalars['String'];
};


export type MyNotesQueryVariables = Exact<{ [key: string]: never; }>;


export type MyNotesQuery = (
  { __typename?: 'Query' }
  & { myNotes: Array<(
    { __typename?: 'Note' }
    & Pick<Note, 'id' | 'body'>
  )> }
);


export const MyNotesDocument: DocumentNode<MyNotesQuery, MyNotesQueryVariables> = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyNotes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myNotes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"body"}}]}}]}}]};