import * as rt from 'runtypes';
import { doWarn } from '~/logging';

// Unhelpfully the types returned in the frontend proxy
// are different from the official API types.
const CloudTrailEvent = rt.Record({
  eventId: rt.String,
  eventVersion: rt.Optional(rt.String),
  username: rt.String,
  eventTime: rt.Number,
  eventSource: rt.String,
  eventName: rt.Optional(rt.String),
  awsRegion: rt.Optional(rt.String),
  sourceIPAddress: rt.Optional(rt.String),
  userAgent: rt.Optional(rt.String),
  requestParameters: rt.Optional(
    rt.Record({
      roleArn: rt.Optional(rt.String),
      roleSessionName: rt.Optional(rt.String),
      durationSeconds: rt.Optional(rt.Number),
    }),
  ),
  responseElements: rt.Optional(
    rt.Record({
      credentials: rt.Optional(
        rt.Record({
          accessKeyId: rt.String,
          expiration: rt.String,
          sessionToken: rt.String,
        }),
      ),
      assumedRoleUser: rt.Optional(
        rt.Record({
          assumedRoleId: rt.String,
          arn: rt.String,
        }),
      ),
    }),
  ),
  requestId: rt.Optional(rt.String),
  readOnly: rt.Optional(rt.String),
  resources: rt.Optional(
    rt.Array(
      rt.Record({
        resourceName: rt.String,
        resourceType: rt.String,
      }),
    ),
  ),
  eventType: rt.Optional(rt.String),
  managementEvent: rt.Optional(rt.Boolean),
  eventCategory: rt.Optional(rt.String),
  recipientAccountId: rt.Optional(rt.String),
  sharedEventID: rt.Optional(rt.String),
});

type CloudTrailEvent = rt.Static<typeof CloudTrailEvent>;

const ResponseData = rt.Record({
  nextToken: rt.Union(rt.String, rt.Null),
  events: rt.Array(CloudTrailEvent),
});
type ResponseData = rt.Static<typeof ResponseData>;
type LookupField = 'ResourceName';

export const getCloudTrailEvents = async function* ({
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
    yield event;
  }

  // TODO handle pagination

  return;
};
