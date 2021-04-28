import { RouteComponentProps } from '~/components/routes';
import { ComponentType } from 'react';
import { NavContext } from '~/page-handlers/messages';

export interface PanelComponentProps<TNavContext extends NavContext>
  extends RouteComponentProps {
  navContext: TNavContext;
}

export type PanelComponent<TNavContext extends NavContext> = ComponentType<
  PanelComponentProps<TNavContext>
>;

export interface PanelContent<TNavContext extends NavContext> {
  header: PanelComponent<TNavContext>;
  content?: PanelComponent<TNavContext>;
  footer?: PanelComponent<TNavContext>;
}
