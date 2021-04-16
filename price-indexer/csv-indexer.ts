import path from 'path';
import fs from 'fs';
import parse from 'csv-parse';
import { getIndexKey, IndexSearch } from './index-key';
import { pricingFilePath, updatePricingFile } from './get-pricing-file';

const expectedColumns = <const>[
  'SKU',
  'OfferTermCode',
  'RateCode',
  'TermType',
  'PriceDescription',
  'EffectiveDate',
  'StartingRange',
  'EndingRange',
  'Unit',
  'PricePerUnit',
  'Currency',
  'RelatedTo',
  'LeaseContractLength',
  'PurchaseOption',
  'OfferingClass',
  'Product Family',
  'serviceCode',
  'Location',
  'Location Type',
  'Instance Type',
  'Current Generation',
  'Instance Family',
  'vCPU',
  'Physical Processor',
  'Clock Speed',
  'Memory',
  'Storage',
  'Network Performance',
  'Processor Architecture',
  'Storage Media',
  'Volume Type',
  'Max Volume Size',
  'Max IOPS/volume',
  'Max IOPS Burst Performance',
  'Max throughput/volume',
  'Provisioned',
  'Tenancy',
  'EBS Optimized',
  'Operating System',
  'License Model',
  'Group',
  'Group Description',
  'Transfer Type',
  'From Location',
  'From Location Type',
  'To Location',
  'To Location Type',
  'usageType',
  'operation',
  'CapacityStatus',
  'Dedicated EBS Throughput',
  'ECU',
  'Elastic Graphics Type',
  'Enhanced Networking Supported',
  'GPU',
  'GPU Memory',
  'Instance',
  'Instance Capacity - 10xlarge',
  'Instance Capacity - 12xlarge',
  'Instance Capacity - 16xlarge',
  'Instance Capacity - 18xlarge',
  'Instance Capacity - 24xlarge',
  'Instance Capacity - 2xlarge',
  'Instance Capacity - 32xlarge',
  'Instance Capacity - 4xlarge',
  'Instance Capacity - 8xlarge',
  'Instance Capacity - 9xlarge',
  'Instance Capacity - large',
  'Instance Capacity - medium',
  'Instance Capacity - metal',
  'Instance Capacity - xlarge',
  'instanceSKU',
  'Intel AVX Available',
  'Intel AVX2 Available',
  'Intel Turbo Available',
  'Normalization Size Factor',
  'Physical Cores',
  'Pre Installed S/W',
  'Processor Features',
  'Product Type',
  'Resource Type',
  'serviceName',
  'Volume API Name',
];

type CsvRecord = Record<typeof expectedColumns[number], string>;

const makeIndexSearch = (record: CsvRecord): IndexSearch => ({
  tenancy: record.Tenancy,
  location: record.Location,
  instanceType: record['Instance Type'],
  operatingSystem: record['Operating System'],
  preInstalledSw: record['Pre Installed S/W'],
});

export const main = async () => {
  await updatePricingFile();

  const parser = fs.createReadStream(pricingFilePath).pipe(
    parse({
      from_line: 7, // The first six lines are metadata about the CSV.
      columns: expectedColumns.slice(), // Copy to avoid issues with the readonly type.
    }),
  );

  const prices: Dict<number> = {};
  for await (const untypedRecord of parser) {
    const record: CsvRecord = untypedRecord;
    if (
      record.serviceCode === 'AmazonEC2' &&
      record.TermType === 'OnDemand' &&
      ['Used', 'AllocatedHost'].includes(record['CapacityStatus']) &&
      record['Operating System'] !== 'Windows' && // TODO: account for windows licensing
      record.Unit === 'Hrs' &&
      parseFloat(record['PricePerUnit']) !== 0
    ) {
      if (record.Currency !== 'USD') {
        throw new Error(`Unexpected currency: ${record.Currency}`);
      }
      const key = getIndexKey(makeIndexSearch(record));
      if (prices[key]) {
        console.warn('Instance key is', key);
        throw new Error('Instance key already indexed');
      }
      prices[key] = parseFloat(record.PricePerUnit);
    }
  }
  await fs.promises.writeFile(
    path.join(
      requireEnvString('DEREF_ROOT'),
      'packages/aes/dist/price-index.json',
    ),
    JSON.stringify(prices, null, 2),
  );
};
