import { LookUpUrl } from '../shared/schema';
import { addDays } from 'date-fns';

export const saveOrUpdateLookUpUrl = async (hashedUrl: string, url: string) => {
  await LookUpUrl.findByIdAndUpdate(
    hashedUrl,
    {
      $set: {
        expiryDate: addDays(new Date(), 30),
        url,
      },
    },
    { upsert: true }
  ).exec();
};

export const deleteUrl = async (id: string) => {
  await LookUpUrl.findByIdAndRemove(id);
};
