import cron from 'node-cron';
import { ProductModel } from '../../../../packages/libs/db/models/products.model';

cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();

    await ProductModel.deleteMany({
      deletedAt: { $exists: true },
    })
      .where('deletedAt')
      .lte(now.getTime());
  } catch (error) {
    console.log(error);
  }
});
