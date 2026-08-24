import { X } from 'lucide-react';
import React from 'react';

const DeleteDiscountCodeModal = ({
  discount,
  onClose,
  onConfirm,
}: {
  discount: any;
  onClose: () => void;
  onConfirm?: any;
}) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-lg w-[450px] shadow-lg">
        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
          <h3 className="text-xl  text-white">Delete Discount Code</h3>
          <button
            onClick={() => onClose()}
            className="text-gray-400 hover:text-white"
          >
            <X size={22} />
          </button>
        </div>
        <p className="text-gray-300 mt-4">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-white">
            {discount.public_name}
          </span>
          ? <br />
          This action **cannot be undone!**.
        </p>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-md text-white"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white"
          >
            Delete
          </button>
        </div>

        {/* <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
          <Input
            label="Title (Public Name)"
            placeholder="Enter title"
            type="text"
            {...register('public_name', {
              required: 'Title is Required!',
            })}
          />
          {errors.public_name && (
            <p className="text-xs text-red-500 mt-1">
              {errors.public_name.message as string}
            </p>
          )}

          <div className="mt-2">
            <Input
              label="Type"
              select
              options={[
                { label: 'Percentage', value: 'percentage' },
                { label: 'Flat', value: 'flat' },
              ]}
              control={control}
              name="discountType"
            />
          </div>

          <div className="mt-2">
            <Input
              label={`Value (${selectedDiscount?.discountType === 'percentage' ? '%' : '$'})`}
              placeholder="Enter value"
              type="number"
              min={1}
              {...register('discountValue', {
                required: 'Value is Required!',
                valueAsNumber: true,
                validate: {
                  greaterThanZero: (v: number) =>
                    v > 0 || 'Value must be greater than 0',
                  percentageLimit: (v: number) =>
                    selectedDiscount?.discountType === 'percentage'
                      ? v <= 100 || 'Percentage cannot exceed 100%'
                      : true,
                  flatLimit: (v: number) =>
                    selectedDiscount?.discountType === 'flat'
                      ? v <= 200 || 'Flat discount cannot exceed $200'
                      : true,
                },
              })}
            />
            {errors.discountValue && (
              <p className="text-xs text-red-500 mt-1">
                {errors.discountValue.message as string}
              </p>
            )}
          </div>

          <div className="mt-2">
            <Input
              label="Discount Code"
              placeholder="Enter code"
              {...register('discountCode', {
                required: 'Code is Required!',
              })}
            />
            {errors.discountCode && (
              <p className="text-xs text-red-500 mt-1">
                {errors.discountCode.message as string}
              </p>
            )}
          </div>

          <div className="mt-4">
            <Input
              label="Selected Discount Codes"
              disabled
              value={
                (watch('discountType') === 'percentage' &&
                  watch('discountValue') &&
                  watch('discountCode') &&
                  `${watch('discountType')} (${watch('discountValue')}%) - ${watch('discountCode')}`) ||
                (watch('discountType') === 'flat' &&
                  watch('discountValue') &&
                  watch('discountCode') &&
                  `Flat (${watch('discountValue')}$) - ${watch('discountCode')}`)
              }
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createDiscountCodeMutation.isPending}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              {createDiscountCodeMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Create'
              )}
            </button>
          </div>
        </form> */}
      </div>
    </div>
  );
};

export default DeleteDiscountCodeModal;
