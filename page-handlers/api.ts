import { BatchHttpLink } from '@apollo/client/link/batch-http';
import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
} from '@apollo/client';
// import { MyNotesDocument } from '~/graphql/types';
import { useWindowMessageListener } from './messages';

const batchHttpLink = new BatchHttpLink({
  uri: 'https://extension.deref.io/graphql',
});
const cache = new InMemoryCache();

// This middleware adds the auth header to the apollo client when it has been set to
// a non-null value.
export const authMiddleware = (apiToken: string | null) =>
  new ApolloLink((operation, forward) => {
    if (apiToken !== null) {
      operation.setContext({
        headers: {
          Authorization: `Bearer ${apiToken}`,
        }
      });
    }

    return forward(operation);
  });

export const useApolloClient = () => {
  // XXX: This only gets set when the message is sent. If the context is initialized before the
  // client is created, the token never gets set.
  const apiToken = useWindowMessageListener('updateApiToken');
  return new ApolloClient({
    link: authMiddleware(apiToken).concat(batchHttpLink),
    cache,
  });
};
