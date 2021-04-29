import { ComponentType } from 'react';
import DerefPanel from '~/components/deref-panel/DerefPanel';
import { doWarn } from '~/logging';
import { DerefContext } from '~/page-handlers/messages';
import DerefButton from '~/components/DerefButton';
import PriceBar from '~/components/PriceBar';

// TODO: Add a proper router.

export interface RouteComponentProps {
  derefContext: DerefContext;
}

export type RouteComponent = ComponentType<RouteComponentProps>;

export interface Route {
  component: RouteComponent;
  style: (context: DerefContext) => Partial<CSSStyleDeclaration>;
}

const createRoute = (route: Route) => route;

export const DEREF_PANEL_SETTINGS = {
  offsetTop: 41,
  foldedHeight: 40,
  offsetBottom: 35,
};

const routes = {
  panel: createRoute({
    component: DerefPanel,
    style: (context) => ({
      position: 'fixed',
      top: `${DEREF_PANEL_SETTINGS.offsetTop}px`,
      right: '0',
      width: '360px',
      zIndex: '100',
      display: context.panelState.visible ? 'block' : 'none',
      height: context.panelState.expanded
        ? `calc(100vh - ${
            DEREF_PANEL_SETTINGS.offsetTop + DEREF_PANEL_SETTINGS.offsetBottom
          }px)`
        : `${DEREF_PANEL_SETTINGS.foldedHeight}px`,
    }),
  }),
  button: createRoute({
    component: DerefButton,
    style: (context) => ({
      height: '36px',
      width: '60px',
    }),
  }),
  priceBar: createRoute({
    component: PriceBar,
    style: (context) => ({
      height: '33px',
      minWidth: '550px',
    }),
  }),
};

export type RouteKey = keyof typeof routes;

export const getRouteKeys = () => {
  return Object.keys(routes) as (keyof typeof routes)[];
};

export const getRoute = (key: RouteKey) => {
  return routes[key];
};

export const getRouteMaybe = (key: string) => {
  if (!(key in routes)) {
    doWarn(`Unknown route key ${key}`);
    return null;
  }
  return routes[key as RouteKey];
};
