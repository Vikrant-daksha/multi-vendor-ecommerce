import { SiteConfigModel } from '../../../../packages/libs/db/models/products.model';

const intializeConfig = async () => {
  try {
    const existingConfig = await SiteConfigModel.exists({});
    if (!existingConfig) {
      await SiteConfigModel.create({
        categories: [
          'Electronics',
          'Fashion',
          'Home & Kitchen',
          'Sports & Fitness',
        ],
        subCategories: {
          Electronics: ['Mobiles', 'Laptop', 'Accessories', 'Gaming'],
          Fashion: ['Men', 'Women', 'Kids', 'Footwear'],
          'Home & Kitchen': ['Furniture', 'Appliance', 'Decor'],
          'Sports & Fitness': ['Gym Equipment', 'Outdoor Sports', 'Wearables'],
        },
      });
    }
  } catch (error) {
    console.log('Error Initializing site Config', error);
  }
};

export default intializeConfig;
