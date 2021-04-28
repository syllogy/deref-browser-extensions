import React, { createElement, useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import {
  addWindowMessageListener,
  DerefContext,
} from '~/page-handlers/messages';
import { isDefined, Dict } from '~/lib/types';
import { doWarn } from '~/logging';
import { Route, getRouteMaybe } from '~/components/routes';

type ParsedQuery = Dict<string>;

const parseQuery = (string: string): ParsedQuery => {
  const query: ParsedQuery = {};
  const pairs = (string[0] === '?' ? string.substr(1) : string).split('&');
  for (const pair of pairs) {
    const [keyPart, valuePart] = pair.split('=');
    if (keyPart === '') {
      continue;
    }
    const key = decodeURIComponent(keyPart);
    const value = decodeURIComponent(valuePart ?? '');
    if (query[key]) {
      doWarn(`Duplicate key ${key}`);
    } else {
      query[key] = value;
    }
  }
  return query;
};

const resolveRoute = () => {
  const query = parseQuery(window.location.search);
  if (!isDefined(query.route)) {
    doWarn('No route');
    return null;
  }
  const route = getRouteMaybe(query.route);
  if (!route) {
    doWarn(`Unknown route key ${query.route}`);
    return null;
  }

  return route;
};

interface IframeProps<TProps> {
  route: Route<TProps>;
  derefContext: DerefContext;
}

function Iframe<TProps>(props: IframeProps<TProps>) {
  const [routeComponentProps, setRouteComponentProps] = useState<TProps>(() =>
    props.route.initialProps(props.derefContext),
  );
  const routeComponentPropsRef = useRef<TProps>(routeComponentProps);
  routeComponentPropsRef.current = routeComponentProps;

  useEffect(() => {
    addWindowMessageListener(window, (msg) => {
      if (msg.type === 'init') {
        setRouteComponentProps({
          ...routeComponentPropsRef.current,
          ...props.route.initialProps(msg.payload),
        });
        return;
      }

      if (props.route?.messageToProps && routeComponentPropsRef.current) {
        const newProps = props.route.messageToProps(
          msg,
          routeComponentPropsRef.current,
        );
        if (newProps) {
          setRouteComponentProps(newProps);
        }
      }
    });
  }, []);

  return createElement(props.route.component, routeComponentProps);
}

const route = resolveRoute();
if (route) {
  const remove = addWindowMessageListener(window, (msg) => {
    if (msg.type === 'init') {
      ReactDOM.render(
        <Iframe route={route} derefContext={msg.payload} />,
        document.querySelector('#root'),
      );
      remove();
    }
  });
}

// Dummy export in order for playground to load this script.
export const iframeIndex = null;
