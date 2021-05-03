import * as rt from 'runtypes';

const Output = rt.Record({
  data: rt.Optional(
    rt.Record({
      arnToAwsConsoleUrl: rt.Optional(rt.String.nullable()),
    }),
  ),
});

const query = `
  query($arn: String!) {
    arnToAwsConsoleUrl(arn: $arn)
  }
`;

export const arnToUrl = async (arn: string) => {
  // TODO: Use Apollo GraphQL Client.
  const response = await fetch('https://extension.deref.io/graphql', {
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      variables: {
        arn,
      },
      query,
      operationName: null,
    }),
    method: 'POST',
    mode: 'cors',
  });
  const output = await response.json();
  if (!Output.guard(output)) {
    return null;
  }
  return output?.data?.arnToAwsConsoleUrl ?? null;
};
