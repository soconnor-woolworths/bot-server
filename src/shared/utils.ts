import { createHash } from 'crypto';
import { LookUpUrl } from './schema';

export function hashUrl(url: string): string {
  return createHash('sha1').update(url).digest('base64');
}

export const shouldReadFromBlogStorage = async (
  hashedUrl: string
): Promise<boolean> => {
  const lookupEntry = await LookUpUrl.findById(hashedUrl).exec();
  console.log({ lookupEntry });

  if (lookupEntry && new Date() < lookupEntry.expiryDate) {
    return true;
  }
  return false;
};

export const getAllLookupUrls = async () => {
  const lookupUrls = await LookUpUrl.find().exec();
  return lookupUrls;
};

export const getWoolworthsUrl = (url: string) =>
  `${process.env.BASE_URL || 'https://www.woolworths.com.au'}${url}`;
