"use client";

import React, { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
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
  }, [watchAllFields, materials]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <form onSubmit={handleSubmit(onFormSubmit)} className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-slate-800">資材発注書作成</h1>

        <div className="space-y-4 mb-8 bg-white p-6 rounded-2xl shadow-xl">
          <div>
            <label className="block text-lg font-semibold mb-2 text-slate-700">
              発注者名 <span className="text-red-500">*</span>
            </label>
            <input
              {...register("ordererName")}
              type="text"
              className="w-full p-3 text-lg text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-slate-400 placeholder:text-slate-400"
              placeholder="山田太郎"
            />
            {errors.ordererName && (
              <p className="text-red-500 mt-1 text-sm">{errors.ordererName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-lg font-semibold mb-2 text-slate-700">現場名</label>
            <input
              {...register("siteName")}
              type="text"
              className="w-full p-3 text-lg text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-slate-400 placeholder:text-slate-400"
              placeholder="〇〇ビル新築工事"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold mb-2 text-slate-700">備考</label>
            <textarea
              {...register("note")}
              className="w-full p-3 text-lg text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-slate-400 placeholder:text-slate-400"
              rows={3}
              placeholder="特記事項があれば入力"
            />
          </div>
        </div>

        <div className="mb-6 bg-white p-6 rounded-2xl shadow-xl">
          <label className="block text-lg font-semibold mb-2 text-slate-700">資材カテゴリー</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-3 text-lg text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-slate-400 bg-white"
          >
            {Object.keys(materialsByCategory).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4 mb-8">
          <h2 className="text-2xl font-bold text-slate-800">資材選択</h2>
        {currentMaterials.map((material) => (
          <div
            key={material.id}
            className="rounded-xl p-5 bg-white shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-xl font-semibold text-slate-800">{material.name}</h3>
                <p className="text-slate-600">
                  単位: {material.unit} / 重量: {material.weightPerUnit}kg
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => handleQuantityChange(material.id, -1)}
                className="w-12 h-12 bg-red-500 text-white rounded-lg text-2xl font-bold hover:bg-red-600 shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
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
                    className="w-24 text-center text-2xl border border-slate-200 rounded-lg p-2 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                )}
              />
              <button
                type="button"
                onClick={() => handleQuantityChange(material.id, 1)}
                className="w-12 h-12 bg-indigo-600 text-white rounded-lg text-2xl font-bold hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
              >
                +
              </button>
              <span className="text-xl min-w-[100px] text-right font-semibold text-slate-800">
                {((materials[material.id] || 0) * material.weightPerUnit).toFixed(1)}kg
              </span>
            </div>
          </div>
        ))}
      </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl mb-6">
          <div className="flex justify-between items-center text-2xl font-bold">
            <span className="text-slate-800">合計重量:</span>
            <span className="text-indigo-600">{orderItems.totalWeight.toFixed(1)}kg</span>
          </div>
          <div className="text-slate-600 mt-2">
            選択資材数: {orderItems.items.length}点
          </div>
        </div>

        <button
          type="submit"
          disabled={orderItems.items.length === 0}
          className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-xl font-bold rounded-lg hover:from-indigo-700 hover:to-indigo-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 active:scale-[0.98]"
        >
          発注書を作成
        </button>
      </form>
    </div>
  );
}