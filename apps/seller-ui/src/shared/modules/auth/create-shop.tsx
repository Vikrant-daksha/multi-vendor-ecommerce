import { shopCategories } from '@/utils/categories';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import React from 'react';
import { useForm } from 'react-hook-form';

type ShopFormData = {
  name: string;
  bio: string;
  address: string;
  opening_hours: string;
  website?: string;
  category: string;
  sellerId: string;
};

const CreateShop = ({
  sellerId,
  setActiveStep,
}: {
  sellerId: string;
  setActiveStep: (step: number) => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShopFormData>();

  const createShopMutation = useMutation({
    mutationFn: async (data: ShopFormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/create-shop`,
        data,
      );
      return response.data;
    },
    onSuccess: () => setActiveStep(3),
  });

  const onSubmit = async (data: ShopFormData) => {
    if (!sellerId) return console.log(sellerId);
    const shopData = { ...data, sellerId };
    console.log(shopData);
    createShopMutation.mutate(shopData);
  };

  const countWords = (text: string) => text.trim().split(/\s+/).length;

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h3 className="text-2xl font-semibold text-center mb-4">
          Setup New Shop
        </h3>
        <label className="block text-gray-700 mb-1">
          Name <strong>*</strong>
        </label>
        <input
          type="text"
          placeholder="Shop Name"
          className="w-full p-2 border border-gray-300 outline-0 rounded mb-1"
          {...register('name', {
            required: 'Name is required',
            minLength: {
              value: 2,
              message: 'Name must be at least 2 characters',
            },
          })}
        ></input>
        {errors.name && (
          <p className="text-red-500 text-sm">{String(errors.name.message)}</p>
        )}
        <label className="block text-gray-700 mb-1">
          Bio (max 100 Words) <strong>*</strong>
        </label>
        <input
          type="text"
          placeholder="Shop Bio"
          className="w-full p-2 border border-gray-300 outline-0 rounded mb-1"
          {...register('bio', {
            required: 'bio is required',
            validate: (value) =>
              countWords(value) <= 100 || 'Bio Cannot exceed 100 Words.',
          })}
        ></input>
        {errors.bio && (
          <p className="text-red-500 text-sm">{String(errors.bio.message)}</p>
        )}
        <label className="block text-gray-700 mb-1">
          Address <strong>*</strong>
        </label>
        <input
          type="text"
          placeholder="Shop Location"
          className="w-full p-2 border border-gray-300 outline-0 rounded mb-1"
          {...register('address', {
            required: 'Shop Address is required',
          })}
        ></input>
        {errors.address && (
          <p className="text-red-500 text-sm">
            {String(errors.address.message)}
          </p>
        )}
        <label className="block text-gray-700 mb-1">
          Opening Hours <strong>*</strong>
        </label>
        <input
          type="text"
          placeholder="e.g., Mon-Fri 9AM - 6PM"
          className="w-full p-2 border border-gray-300 outline-0 rounded mb-1"
          {...register('opening_hours', {
            required: 'Opening Hours are required',
          })}
        ></input>
        {errors.opening_hours && (
          <p className="text-red-500 text-sm">
            {String(errors.opening_hours.message)}
          </p>
        )}
        <label className="block text-gray-700 mb-1">Website</label>
        <input
          type="text"
          placeholder="https://example.com"
          className="w-full p-2 border border-gray-300 outline-0 rounded mb-1"
          {...register('website', {
            pattern: {
              value: /^(https?:\/\/)?([\w\d-]+\.)+[a-zA-Z]{2,}(\/.*)?$/,
              message: 'Enter A valid URL',
            },
          })}
        ></input>
        {errors.website && (
          <p className="text-red-500 text-sm">
            {String(errors.website.message)}
          </p>
        )}
        <label className="block text-gray-700 mb-1">
          Category <strong>*</strong>
        </label>
        <select
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
          {...register('category', {
            required: 'Category is required',
            minLength: {
              value: 2,
              message: 'Name must be at least 2 characters',
            },
          })}
        >
          <option value="">Select A Category</option>
          {shopCategories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-red-500 text-sm">
            {String(errors.category.message)}
          </p>
        )}
        <button
          type="submit"
          disabled={createShopMutation.isPending}
          className="w-full text-lg bg-blue-600 text-white py-2 rounded-lg mt-4"
        >
          {createShopMutation.isPending ? 'Creating...' : 'Create'}
        </button>
      </form>
    </div>
  );
};

export default CreateShop;
