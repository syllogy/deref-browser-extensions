import React, { createElement, useEffect } from 'react';
import { RouteComponentBaseProps, PANEL_SETTINGS } from '~/components/routes';
import {
  NavContext,
  NavContextType,
  postDerefMessage,
} from '~/page-handlers/messages';
import {
  PanelContent,
  PanelComponentProps,
} from '~/components/deref-panel/types';
import {
  Ec2InstanceHeader,
  Ec2InstanceContent,
} from '~/components/deref-panel/ec2instance';
import {
  DefaultHeader,
  DefaultContent,
  DefaultFooter,
} from '~/components/deref-panel/default';

interface Props extends RouteComponentBaseProps {}

const contentMap: Map<
  NavContextType<NavContext>,
  PanelContent<NavContext>
> = new Map([
  [
    'ec2Instance',
    {
      header: Ec2InstanceHeader,
      content: Ec2InstanceContent as any,
    },
  ],
]);

const defaultContent: Required<PanelContent<any>> = {
  header: DefaultHeader,
  content: DefaultContent,
  footer: DefaultFooter,
};

export default function DerefPanel(props: Props) {
  const content = props.derefContext.navContext
    ? contentMap.get(props.derefContext.navContext.type) ?? defaultContent
    : defaultContent;

  const componentProps: PanelComponentProps<any> = {
    ...props,
    navContext: props.derefContext.navContext,
  };

  const renderedContent = content.content
    ? createElement(content.content, componentProps)
    : null;

  useEffect(() => {
    if (!renderedContent && props.derefContext.panelState.expanded) {
      postDerefMessage({
        type: 'togglePanelExpand',
        payload: {
          expand: false,
        },
      });
    }
  }, [props.derefContext]);

  return (
    <div className="flex flex-col h-full border-l">
      <div style={{ height: PANEL_SETTINGS.foldedHeight }}>
        {createElement(content.header, componentProps)}
      </div>
      {renderedContent && props.derefContext.panelState.expanded && (
        <>
          <div className="flex-grow p-2">{renderedContent}</div>
          <div className="border-t p-2">
            {createElement(
              content.footer ?? defaultContent.footer,
              componentProps,
            )}
          </div>
        </>
      )}
    </div>
  );
}
