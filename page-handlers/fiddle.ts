import { PageHandler } from '~/page-handlers/common';
import { doWarn } from '~/logging';
import { getCloudTrailEvents } from '~/lib/cloudtrail/client';
import { getCloudTrailXsrfToken } from '~/lib/cloudtrail/xsrf';

export const fiddle: PageHandler = {
  conditions: [],
  async handler() {
    console.log('doing fiddle');
    const xsrfToken = await getCloudTrailXsrfToken();
    if (!xsrfToken) {
      doWarn('Cloudtrail XSRF token not found');
      return;
    }
    const region = 'us-west-2';
    for await (const event of getCloudTrailEvents({
      region,
      lookupField: 'ResourceName',
      lookupValue: 'i-00d89014c8065cde5',
      xsrfToken,
    })) {
      console.log(event);
    }
    return;
  },
};
