"use client";

import React, { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Material,
  MaterialOrderItem,
  OrderDocument,
  materialsByCategory,
} from "@/types/material-order";

const orderFormSchema = z.object({
  ordererName: z.string().min(1, "発注者名を入力してください"),
  siteName: z.string().optional(),
  note: z.string().optional(),
  materials: z.record(z.number().int().min(0)),
});

type OrderFormData = z.infer<typeof orderFormSchema>;

interface MaterialOrderFormProps {
  onSubmit: (data: OrderDocument) => void;
}

export default function MaterialOrderForm({ onSubmit }: MaterialOrderFormProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(
    Object.keys(materialsByCategory)[0]
  );

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      ordererName: "",
      siteName: "",
      note: "",
      materials: {},
    },
  });

  // 全フォームデータを監視
  const watchAllFields = watch();
  const materials = watchAllFields.materials || {};

  const currentMaterials = materialsByCategory[selectedCategory] || [];

  const orderItems = useMemo(() => {
    const items: MaterialOrderItem[] = [];
    let total = 0;

    Object.entries(materials).forEach(([materialId, quantity]) => {
      if (quantity > 0) {
        const material = Object.values(materialsByCategory)
          .flat()
          .find((m) => m.id === materialId);
        
        if (material) {
          const totalWeight = material.weightPerUnit * quantity;
          items.push({
            id: material.id,
            name: material.name,
            unit: material.unit,
            quantity,
            weightPerUnit: material.weightPerUnit,
            totalWeight,
          });
          total += totalWeight;
        }
      }
    });

    return { items, totalWeight: total };
  }, [watchAllFields]);

  const handleQuantityChange = (materialId: string, delta: number) => {
    const currentValue = materials[materialId] || 0;
    const newValue = Math.max(0, currentValue + delta);
    setValue(`materials.${materialId}`, newValue, { shouldValidate: true });
  };

  const onFormSubmit = (data: OrderFormData) => {
    const orderDocument: OrderDocument = {
      ordererName: data.ordererName,
      siteName: data.siteName,
      orderDate: new Date().toISOString(),
      note: data.note,
      items: orderItems.items,
      totalWeight: orderItems.totalWeight,
    };
    onSubmit(orderDocument);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="p-4 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">資材発注書作成</h1>

      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-xl font-medium mb-2">
            発注者名 <span className="text-red-500">*</span>
          </label>
          <input
            {...register("ordererName")}
            type="text"
            className="w-full p-3 text-xl border rounded-lg"
            placeholder="山田太郎"
          />
          {errors.ordererName && (
            <p className="text-red-500 mt-1">{errors.ordererName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xl font-medium mb-2">現場名</label>
          <input
            {...register("siteName")}
            type="text"
            className="w-full p-3 text-xl border rounded-lg"
            placeholder="〇〇ビル新築工事"
          />
        </div>

        <div>
          <label className="block text-xl font-medium mb-2">備考</label>
          <textarea
            {...register("note")}
            className="w-full p-3 text-xl border rounded-lg"
            rows={3}
            placeholder="特記事項があれば入力"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-xl font-medium mb-2">資材カテゴリー</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full p-3 text-xl border rounded-lg"
        >
          {Object.keys(materialsByCategory).map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4 mb-8">
        <h2 className="text-2xl font-bold">資材選択</h2>
        {currentMaterials.map((material) => (
          <div
            key={material.id}
            className="border rounded-lg p-4 bg-gray-50"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{material.name}</h3>
                <p className="text-gray-600">
                  単位: {material.unit} / 重量: {material.weightPerUnit}kg
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => handleQuantityChange(material.id, -1)}
                className="w-12 h-12 bg-red-500 text-white rounded-lg text-2xl font-bold hover:bg-red-600"
              >
                −
              </button>
              <Controller
                name={`materials.${material.id}`}
                control={control}
                defaultValue={0}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    value={field.value || 0}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      field.onChange(Math.max(0, value));
                    }}
                    className="w-24 text-center text-2xl border rounded-lg p-2 font-semibold text-gray-900"
                  />
                )}
              />
              <button
                type="button"
                onClick={() => handleQuantityChange(material.id, 1)}
                className="w-12 h-12 bg-blue-500 text-white rounded-lg text-2xl font-bold hover:bg-blue-600"
              >
                +
              </button>
              <span className="text-xl min-w-[100px] text-right font-semibold text-gray-900">
                {((materials[material.id] || 0) * material.weightPerUnit).toFixed(1)}kg
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-4 mb-6">
        <div className="flex justify-between items-center text-2xl font-bold">
          <span>合計重量:</span>
          <span className="text-blue-600">{orderItems.totalWeight.toFixed(1)}kg</span>
        </div>
        <div className="text-gray-600 mt-2">
          選択資材数: {orderItems.items.length}点
        </div>
      </div>

      <button
        type="submit"
        disabled={orderItems.items.length === 0}
        className="w-full py-4 bg-blue-600 text-white text-2xl font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        発注書を作成
      </button>
    </form>
  );
}