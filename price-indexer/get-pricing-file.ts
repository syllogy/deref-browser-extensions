import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';

const pricingUrl =
  'https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonEC2/current/index.csv';

export const pricingDirPath = path.join(process.cwd(), 'pricing-cache');

const etagPath = path.join(pricingDirPath, 'current-etag');

export const pricingFilePath = path.join(pricingDirPath, 'ec2-pricing.csv');

const ensurePricingDir = async () => {
  await fs.promises.mkdir(pricingDirPath, { recursive: true });
};

const getSavedEtag = async (): Promise<string | null> => {
  try {
    return await fs.promises.readFile(etagPath, {
      encoding: 'utf8',
    });
  } catch (err: unknown) {
    if ((err as any).code === 'ENOENT') {
      return null;
    }
    throw err;
  }
};

const getCurrentEtag = async () => {
  const headResp = await fetch(pricingUrl, { method: 'HEAD' });
  const etag = headResp.headers.get('etag');
  if (!etag) {
    throw new Error('No ETag returned from AWS');
  }
  return etag;
};

export const updatePricingFile = async (): Promise<void> => {
  const currentEtag = await getCurrentEtag();
  const isUpToDate = (await getSavedEtag()) === currentEtag;
  if (isUpToDate) {
    return;
  }

  try {
    console.log(
      'Downloading a new pricing file. This is a ~1.5G file so this may take some time.',
    );
    await ensurePricingDir();
    const destPath = path.join(pricingDirPath, `tmp-${Date.now()}`);
    const dest = fs.createWriteStream(destPath);
    const resp = await fetch(pricingUrl);

    if (resp.status !== 200) {
      throw new Error('Bad response from server');
    }

    resp.body.pipe(dest);
    await new Promise((resolve, reject) => {
      dest.on('error', () => reject);
      dest.on('close', () => {
        resolve(null);
      });
    });

    await fs.promises.rename(destPath, pricingFilePath);
    await fs.promises.writeFile(etagPath, currentEtag);
  } finally {
    // Clean up temporary files.
    const tmpFiles = await fs.promises.readdir(pricingDirPath);
    console.log(tmpFiles);
    await Promise.all(
      tmpFiles
        .filter((filePath) => filePath.startsWith('tmp-'))
        .map((filePath) =>
          fs.promises.unlink(path.join(pricingDirPath, filePath)),
        ),
    );
  }

  console.log('Finished downloading.');
};

export const main = updatePricingFile;
