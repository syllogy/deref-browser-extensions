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

export type RouteComponentProps<TProps> = RouteComponentBaseProps & TProps;

export interface Route<TProps> {
  component: ComponentType<RouteComponentProps<TProps>>;
  style: Partial<CSSStyleDeclaration>;
  messageToProps: (
    msg: DerefMessage,
    props: RouteComponentBaseProps & Partial<RouteComponentProps<TProps>>,
  ) => RouteComponentProps<TProps>;
}

const createRoute = <TProps,>(route: Route<TProps>) => route;

export const PANEL_SETTINGS = {
  offsetTop: 41,
  foldedHeight: 48,
};

const routes = {
  panel: createRoute({
    component: DerefPanel,
    style: {
      position: 'fixed',
      top: `${PANEL_SETTINGS.offsetTop}px`,
      right: '0',
      width: '300px',
      zIndex: '100',
      display: 'none',
    },
    messageToProps: (msg, props) => {
      return props;
    },
  }),
  button: createRoute({
    component: DerefButton,
    style: {
      height: '36px',
      width: '60px',
    },
    messageToProps: (msg, props) => {
      return props;
    },
  }),
  priceBar: createRoute({
    component: PriceBar,
    style: {
      height: '33px',
      minWidth: '550px',
    },
    messageToProps: (msg, props) => {
      switch (msg.type) {
        case 'price': {
          return {
            ...props,
            price: msg.payload,
          };
        }
      }
      return props;
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
