'use client';

import ImagePlaceholder from '@/shared/components/image-placeholder';
import { ChevronRight } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Input from '../../../../../../../packages/components/input';

const page = () => {
  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [openImageModal, setOpenImageModal] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [images, setImages] = useState<(File | null)[]>([null]);
  const [loading, setLoading] = useState(false);

  const onSubmit = (data: any) => {
    console.log(data);
  };

  const handleImageChange = (file: File | null, index: number) => {
    const updatedImages = [...images];

    updatedImages[index] = file;

    if (index === images.length - 1 && images.length < 8) {
      updatedImages.push(null);
    }

    setImages(updatedImages);
    setValue('images', updatedImages);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prevImages) => {
      let updatedImages = [...prevImages];
      if (index === -1) {
        updatedImages[0] = null;
      } else {
        updatedImages.splice(index, 1);
      }

      if (!updatedImages.includes(null) && updatedImages.length < 8) {
        updatedImages.push(null);
      }

      setValue('images', updatedImages);

      return updatedImages;
    });
  };

  return (
    <form
      className="w-full mx-auto p-8 shadow-md rounded-lg text-white"
      onSubmit={handleSubmit(onSubmit)}
    >
      <h2 className="text-2xl py-2 font-semibold font-poppins text-white">
        Create Product
      </h2>
      <div className="flex items-center">
        <span className="text-[#80Deea] cursor-pointer">Dashboard</span>
        <ChevronRight size={20} className="opacity-[.8]" />
        <span>Create Product</span>
      </div>

      <div className="py-4 w-full flex gap-6">
        <div className="md:w-[35%]">
          {images?.length > 0 && (
            <ImagePlaceholder
              setOpenImageModal={setOpenImageModal}
              size="765 x 850"
              small={false}
              index={0}
              onImageChange={handleImageChange}
              onRemove={handleRemoveImage}
            />
          )}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {images.slice(1).map((_, index) => (
              <ImagePlaceholder
                setOpenImageModal={setOpenImageModal}
                size="765 x 850"
                key={index}
                small={true}
                index={index + 1}
                onImageChange={handleImageChange}
                onRemove={handleRemoveImage}
              />
            ))}
          </div>
        </div>
        <div className="md:w-[65%]">
          <div className="w-full flex gap-6">
            <div className="w-2/4">
              <Input
                label="Product Title *"
                placeholder="Enter Product Title"
                {...register('title', { required: 'Title is Required!' })}
              />
              {errors.title && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.title.message as string}
                </p>
              )}
              <div className="mt-2">
                <Input
                  type="textarea"
                  rows={7}
                  cols={10}
                  label="Short Description * (Max 150 Words)"
                  placeholder="Enter product description for quick view"
                  {...register('description', {
                    required: 'Description is Required!',
                    validate: (value) => {
                      const wordCount = value.trim().split(/\s+/).length;
                      return (
                        wordCount <= 150 ||
                        `Description cannot exceed 150 words (Current: ${wordCount})`
                      );
                    },
                  })}
                />
                {errors.description && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.description.message as string}
                  </p>
                )}
              </div>
              <div className="mt-2">
                <Input
                  label="Tags *"
                  placeholder="Enter Product Tags (eg: tag1,tag2,tag3)"
                  {...register('tags', { required: 'Tags is Required!' })}
                />
                {errors.tags && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.tags.message as string}
                  </p>
                )}
              </div>
              <div className="mt-2">
                <Input
                  label="Warranty *"
                  placeholder="e.g. 1 year / No Warranty"
                  {...register('warranty', {
                    required: 'Warranty is Required!',
                  })}
                />
                {errors.warranty && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.warranty.message as string}
                  </p>
                )}
              </div>
              <div className="mt-2">
                <Input
                  label="Slug *"
                  placeholder="product-slug"
                  {...register('slug', {
                    required: 'Slug is Required!',
                    pattern: {
                      value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                      message:
                        'Invalid Slug Format! Slug must be in lowercase letters, numbers and hyphens only.',
                    },
                    minLength: {
                      value: 3,
                      message: 'Slug must be at least 3 charaters long.',
                    },
                    maxLength: {
                      value: 50,
                      message: 'Slug cannot be more than 50 Characters',
                    },
                  })}
                />
                {errors.slug && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.slug.message as string}
                  </p>
                )}
              </div>
            </div>

            <div className="w-2/4"></div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default page;
