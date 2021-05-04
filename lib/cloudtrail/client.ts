import * as rt from 'runtypes';
import { doWarn } from '~/logging';

// Unhelpfully the types returned in the frontend proxy
// are different from the official API types.
const CloudTrailEvent = rt.Record({
  eventId: rt.String,
  eventName: rt.String,
  readOnly: rt.Union(rt.Literal('false'), rt.Literal('true')),
  accessKeyId: rt.String,
  eventTime: rt.Number,
  eventSource: rt.String,
  username: rt.String,
  resources: rt.Array(
    rt.Record({
      resourceType: rt.String,
      resourceName: rt.String,
    }),
  ),
  cloudTrailEvent: rt.String,
});

type CloudTrailEvent = rt.Static<typeof CloudTrailEvent>;

const ResponseData = rt.Record({
  nextToken: rt.Union(rt.String, rt.Null),
  events: rt.Array(CloudTrailEvent),
});
type ResponseData = rt.Static<typeof ResponseData>;
type LookupField = 'ResourceName';

export const getCloudTrailEvents = async function*({
  lookupField,
  lookupValue,
  region,
  xsrfToken,
}: {
  lookupField: LookupField;
  lookupValue: string;
  region: string;
  xsrfToken: string;
}) {
  const url = new URL(
    `https://${region}.console.aws.amazon.com/cloudtrail/service/lookupEvents`,
  );
  url.search = new URLSearchParams({
    viewType: 'eventHistory',
    pageSize: '50',
    lookupField,
    lookupValue,
    region,
  }).toString();
  const resp = await fetch(url.toString(), {
    method: 'GET',
    headers: new Headers({
      Accept: 'application/json',
      'x-cloudtrail-xsrf-token': xsrfToken,
    }),
  });
  const respBody = (await resp.json()) as unknown;
  if (!(respBody as any).isSuccessful) {
    doWarn('Request was not successful');
    return;
  }

  const data = (respBody as any).data as ResponseData;
  const validation = ResponseData.validate(data);
  if (!validation.success) {
    doWarn('Could not validate body');
    return;
  }

  for (const event of data.events) {
    if (event.readOnly !== 'true') {
      yield event;
    }
  }

  // TODO handle pagination

  return;
};
