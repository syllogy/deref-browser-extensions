import { createElement } from 'react';
import ReactDOM from 'react-dom';
import { addWindowMessageListener } from '~/page-handlers/messages';
import { isDefined, Dict } from '~/lib/types';
import { doWarn } from '~/logging';
import { Route, RouteComponentProps, getRouteMaybe } from '~/components/routes';

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

const renderRoute = <TProps,>(
  route: Route<TProps>,
  props: RouteComponentProps<TProps>,
) => {
  ReactDOM.render(
    createElement(route.component, props),
    document.querySelector('#root'),
  );
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

let props: RouteComponentProps<unknown> | undefined = undefined;
addWindowMessageListener(window, (msg) => {
  const route = resolveRoute();
  if (!route) {
    return;
  }

  if (msg.type === 'init') {
    props = { ...(props ?? {}), derefContext: msg.payload };
    renderRoute(route, props);
    return;
  }

  if (props) {
    props = route.messageToProps(msg, props);
    renderRoute(route, props);
  }
});

export const iframeIndex = null;
