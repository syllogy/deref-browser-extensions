export const regionNameMap = {
  'af-south-1': 'Africa (Cape Town)',
  'ap-east-1': 'Asia Pacific (Hong Kong)',
  'ap-south-1': 'Asia Pacific (Mumbai)',
  'ap-northeast-3': 'Asia Pacific (Osaka-Local)',
  'ap-northeast-2': 'Asia Pacific (Seoul)',
  'ap-southeast-1': 'Asia Pacific (Singapore)',
  'ap-southeast-2': 'Asia Pacific (Sydney)',
  'ap-northeast-1': 'Asia Pacific (Tokyo)',
  'ca-central-1': 'Canada (Central)',

  'eu-central-1': 'EU (Frankfurt)',
  'eu-west-1': 'EU (Ireland)',
  'eu-west-2': 'EU (London)',
  'eu-south-1': 'EU (Milan)',
  'eu-west-3': 'EU (Paris)',
  'eu-north-1': 'EU (Stockholm)',

  'me-south-1': 'Middle East (Bahrain)',
  'sa-east-1': 'South America (Sao Paulo)',

  'us-east-2': 'US East (Ohio)',
  'us-east-1': 'US East (N. Virginia)',
  'us-west-1': 'US West (N. California)',
  'us-west-2': 'US West (Oregon)',

  'us-gov-east-1': 'AWS GovCloud (US-East)',
  'us-gov-west-1': 'AWS GovCloud (US-West)',

  // The below regions appear in the pricing file but are unsupported as it's
  // unclear what their region code is.

  // Seems like these are "Local Zones":
  // aws.amazon.com/about-aws/global-infrastructure/localzones
  // You can see how to enable these in the console, see for example us-east-1
  // and us-west-2, which have a different subset of local zones you can turn
  // on:
  //  - console.aws.amazon.com/ec2/v2/home?region=us-east-1#Settings:tab=zones
  //  - us-west-2.console.aws.amazon.com/ec2/v2/home?region=us-west-2#Settings:tab=zones
  //
  // The "Verizon" zones are part of Wavelength.
  //
  // You can list zones with a command like:
  // aws ec2 --region us-east-1 describe-availability-zones --all-availability-zones

  //"Asia Pacific (SKT) - Daejeon",
  //'Asia Pacific (KDDI) - Tokyo',
  //"US East (Boston)",
  //"US East (Houston)",
  //"US East (Miami)",
  //"US East (Verizon) - Atlanta",
  //"US East (Verizon) - Boston",
  //"US East (Verizon) - Dallas",
  //"US East (Verizon) - Miami",
  //"US East (Verizon) - New York",
  //"US East (Verizon) - Washington DC",
  //"US West (Los Angeles)",
  //"US West (Verizon) - Denver",
  //"US West (Verizon) - Las Vegas",
  //"US West (Verizon) - San Francisco Bay Area",
  //"US West (Verizon) - Seattle",
};

export const getIndexKey = (search: IndexSearch): string => {
  return Object.entries(search)
    .sort(([k0], [k1]) => k0.localeCompare(k1))
    .map(([_k, v]) => v)
    .join('-:-');
};

export interface IndexSearch {
  operatingSystem: string;
  instanceType: string;
  preInstalledSw: string;
  location: string;
  tenancy: string;
}

export type UnvalidatedIndexSearch = {
  [k in keyof IndexSearch]: IndexSearch[k] | null;
};

export const isIndexSearch = (
  search: UnvalidatedIndexSearch,
): search is IndexSearch => Object.values(search).every((v) => v !== null);
