import { BatchHttpLink } from '@apollo/client/link/batch-http';
import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  concat,
  NormalizedCacheObject,
} from '@apollo/client';
import { ApolloCache } from '@apollo/client/cache';

const defaultUri = 'https://extension.deref.io/graphql';

interface ApolloConfig {
  apiToken: () => string | null;
  uri?: string;
  cache?: ApolloCache<NormalizedCacheObject>;
}

export const createApolloClient = (config: ApolloConfig) => {
  const uri = config.uri ?? defaultUri;
  const cache = config.cache ?? new InMemoryCache();

  const authMiddleware = new ApolloLink((operation, forward) => {
    const apiToken = config.apiToken();

    if (apiToken !== null) {
      operation.setContext({
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      });
    }

    return forward(operation);
  });

  const batchHttpLink = new BatchHttpLink({
    uri,
  });

  return new ApolloClient<NormalizedCacheObject>({
    link: concat(authMiddleware, batchHttpLink),
    cache,
  });
};
