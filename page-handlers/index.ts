import { doPageHandler } from './common';

export const handleAllPages = async () =>
  Promise.all(
    [
      (await import('./ec2-instance-wizard')).ec2InstanceWizard,
      (await import('./ec2-instance-list')).ec2InstanceList,
    ].map(doPageHandler),
  );
