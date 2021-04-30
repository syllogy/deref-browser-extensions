import React, { createElement, useMemo } from 'react';
import { useWindowMessageListener } from '~/page-handlers/messages';
import { Route } from '~/components/routes';
import { createApolloClient } from '~/graphql/apollo-client';
import { ApolloProvider } from '@apollo/client';

interface Props {
  route: Route;
}

export default function Iframe(props: Props) {
  const derefContext = useWindowMessageListener('init');
  const apolloClient = useMemo(() => {
    return createApolloClient({
      apiToken: () => derefContext?.user?.apiToken ?? null,
    });
  }, [derefContext?.user?.apiToken]);

  if (!derefContext) {
    return null;
  }

  return (
    <ApolloProvider client={apolloClient}>
      {createElement(props.route.component, { derefContext })}
    </ApolloProvider>
  );
}
