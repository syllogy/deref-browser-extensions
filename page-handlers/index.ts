import { PageHandler } from './common';
import { ec2InstanceWizard } from './ec2-instance-wizard';
import { ec2InstanceList } from './ec2-instance-list';
import { derefButton } from '~/page-handlers/deref-button';
import { derefPanel } from '~/page-handlers/deref-panel';

export const pageHandlers: PageHandler[] = [
  derefButton,
  derefPanel,
  ec2InstanceWizard,
  ec2InstanceList,
];
