import { LookUpUrl } from '../shared/schema';
import { addDays } from 'date-fns';

export const saveOrUpdateLookUpUrl = async (hashedUrl: string) => {
  await LookUpUrl.findByIdAndUpdate(
    hashedUrl,
    {
      $set: {
        expiryDate: addDays(new Date(), 30),
      },
    },
    { upsert: true }
  ).exec();
};
