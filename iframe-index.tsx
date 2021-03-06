import React from 'react';
import ReactDOM from 'react-dom';
import { isDefined, Dict } from '~/lib/types';
import { doWarn } from '~/logging';
import { getRouteMaybe } from '~/components/routes';
import Iframe from '~/components/Iframe';

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

const route = resolveRoute();
if (route) {
  window.onload = () => {
    ReactDOM.render(<Iframe route={route} />, document.querySelector('#root'));
  };
}

// Dummy export in order for playground to load this script.
export const iframeIndex = null;
