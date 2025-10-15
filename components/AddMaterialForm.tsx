"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const addMaterialSchema = z.object({
  name: z.string().min(1, "材料名を入力してください"),
  size: z.string().optional(),
  type: z.string().optional(),
  weightKg: z.number().min(0, "重量は0以上で入力してください"),
  notes: z.string().optional(),
});

type AddMaterialFormData = z.infer<typeof addMaterialSchema>;

type Material = {
  id: string;
  materialCode: string;
  name: string;
  categoryId: string;
  size?: string;
  type: string;
  weightKg: number;
  isActive: boolean;
};

interface AddMaterialFormProps {
  categoryId: string;
  orderId?: string | null;
  onSuccess: (material: Material) => void;
  onCancel: () => void;
}

export default function AddMaterialForm({ categoryId, orderId, onSuccess, onCancel }: AddMaterialFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddMaterialFormData>({
    resolver: zodResolver(addMaterialSchema),
    defaultValues: {
      name: "",
      size: "",
      type: "標準",
      weightKg: 0,
      notes: "",
    },
  });

  const onSubmit = async (data: AddMaterialFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/materials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          categoryId,
          isTemporary: !!orderId,
          createdForOrderId: orderId || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '材料の追加に失敗しました');
      }

      const newMaterial = await response.json();
      onSuccess(newMaterial);
      reset();
    } catch (error) {
      console.error('材料追加エラー:', error);
      alert(error instanceof Error ? error.message : '材料の追加に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">新しい材料を追加</h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">
              材料名 <span className="text-red-500">*</span>
            </label>
            <input
              {...register("name")}
              type="text"
              className="w-full p-3 text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              placeholder="材料名を入力"
            />
            {errors.name && (
              <p className="text-red-500 mt-1 text-sm">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">サイズ</label>
            <input
              {...register("size")}
              type="text"
              className="w-full p-3 text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              placeholder="例: 1.2×5.1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">
              種別
            </label>
            <input
              {...register("type")}
              type="text"
              className="w-full p-3 text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
            {errors.type && (
              <p className="text-red-500 mt-1 text-sm">{errors.type.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">
              重量(kg) <span className="text-red-500">*</span>
            </label>
            <input
              {...register("weightKg", { valueAsNumber: true })}
              type="number"
              step="0.0001"
              className="w-full p-3 text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              placeholder="0.0000"
            />
            {errors.weightKg && (
              <p className="text-red-500 mt-1 text-sm">{errors.weightKg.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">備考</label>
            <textarea
              {...register("notes")}
              className="w-full p-3 text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              rows={3}
              placeholder="特記事項があれば入力"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitting ? "追加中..." : "追加"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}