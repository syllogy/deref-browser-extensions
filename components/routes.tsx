import { ComponentType } from 'react';
import DerefPanel from '~/components/deref-panel/DerefPanel';
import { doWarn } from '~/logging';
import { DerefContext, DerefMessage } from '~/page-handlers/messages';
import DerefButton from '~/components/DerefButton';
import PriceBar from '~/components/PriceBar';

// TODO: Add a proper router.

export interface RouteComponentBaseProps {
  derefContext: DerefContext;
}

export interface Route<TProps> {
  component: ComponentType<TProps>;
  style: (context: DerefContext) => Partial<CSSStyleDeclaration>;
  initialProps: (derefContext: DerefContext) => TProps;
  messageToProps?: (msg: DerefMessage, props: TProps) => TProps | void;
}

const createRoute = <TProps,>(route: Route<TProps>) => route;

export const DEREF_PANEL_SETTINGS = {
  offsetTop: 41,
  foldedHeight: 48,
};

const routes = {
  panel: createRoute({
    component: DerefPanel,
    style: (context) => ({
      position: 'fixed',
      top: `${DEREF_PANEL_SETTINGS.offsetTop}px`,
      right: '0',
      width: '300px',
      zIndex: '100',
      display: context.panelState.visible ? 'block' : 'none',
      height: context.panelState.expanded
        ? `calc(100vh - ${DEREF_PANEL_SETTINGS.offsetTop}px)`
        : `${DEREF_PANEL_SETTINGS.foldedHeight}px`,
    }),
    initialProps: (derefContext) => ({ derefContext }),
  }),
  button: createRoute({
    component: DerefButton,
    style: (context) => ({
      height: '36px',
      width: '60px',
    }),
    initialProps: (derefContext) => ({ derefContext }),
  }),
  priceBar: createRoute({
    component: PriceBar,
    style: (context) => ({
      height: '33px',
      minWidth: '550px',
    }),
    initialProps: (derefContext) => ({ derefContext }),
    messageToProps: (msg, props) => {
      switch (msg.type) {
        case 'price': {
          return {
            ...props,
            price: msg.payload,
          };
        }
      }
    },
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
