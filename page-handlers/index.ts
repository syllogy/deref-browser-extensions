import { PageHandler } from './common';
import { ec2InstanceWizard } from './ec2-instance-wizard';
import { ec2InstanceList } from './ec2-instance-list';

export const pageHandlers: PageHandler[] = [ec2InstanceWizard, ec2InstanceList];
