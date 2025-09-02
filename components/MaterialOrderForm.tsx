"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  MaterialOrderItem,
  OrderDocument,
} from "@/types/material-order";
import { formatWeight, formatTotalWeight } from "@/lib/utils/format";
import AddMaterialForm from "./AddMaterialForm";

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

type Category = {
  id: string;
  name: string;
  displayOrder: number;
};

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

export default function MaterialOrderForm({ onSubmit }: MaterialOrderFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showAddMaterialForm, setShowAddMaterialForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const {
    register,
    control,
    handleSubmit,
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

  // データをDBから取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, materialsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/materials')
        ]);
        
        const categoriesData = await categoriesRes.json();
        const materialsData = await materialsRes.json();
        
        setCategories(categoriesData);
        setMaterials(materialsData);
        
        if (categoriesData.length > 0) {
          setSelectedCategoryId(categoriesData[0].id);
        }
      } catch (error) {
        console.error('データの取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // useWatchを使用してmaterialsフィールドを監視
  const watchedMaterials = useWatch({
    control,
    name: 'materials',
    defaultValue: {}
  });
  
  // デバッグ用
  useEffect(() => {
    console.log('watchedMaterials changed (useWatch):', watchedMaterials);
  }, [watchedMaterials]);
  
  const selectedMaterials = useMemo(() => watchedMaterials || {}, [watchedMaterials]);

  const currentMaterials = materials.filter(m => {
    if (m.categoryId !== selectedCategoryId || !m.isActive) {
      return false;
    }
    
    if (searchQuery.trim() === "") {
      return true;
    }
    
    const query = searchQuery.toLowerCase();
    return m.name.toLowerCase().includes(query) ||
           (m.size && m.size.toLowerCase().includes(query)) ||
           m.type.toLowerCase().includes(query) ||
           m.materialCode.toLowerCase().includes(query);
  });
  
  const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
  const isOtherCategory = selectedCategory?.name === 'その他';

  const handleAddMaterial = (newMaterial: Material) => {
    setMaterials(prev => [...prev, newMaterial]);
    setShowAddMaterialForm(false);
  };

  const orderItems = useMemo(() => {
    const items: MaterialOrderItem[] = [];
    const unitWeights: number[] = []; // 単位重量のみ（最小重量判定用）
    let total = 0;
    
    console.log('orderItems recalculating, selectedMaterials:', selectedMaterials);
    
    Object.entries(selectedMaterials).forEach(([materialId, quantity]) => {
      if (quantity > 0) {
        const material = materials.find((m) => m.id === materialId);
        
        if (material) {
          const materialWeight = Number(material.weightKg);
          const totalWeight = Math.round((materialWeight * Number(quantity)) * 10000) / 10000;
          console.log(`Material ${material.name}: ${quantity} x ${materialWeight}kg = ${totalWeight}kg`);
          console.log(`Running total before adding: ${total}`);
          
          items.push({
            id: material.id,
            name: material.name,
            quantity: Number(quantity),
            weightPerUnit: materialWeight,
            totalWeight: totalWeight,
          });
          
          // 単位重量を記録（重複なし、最小重量判定用）
          if (!unitWeights.includes(materialWeight)) {
            unitWeights.push(materialWeight);
          }
          
          total += totalWeight;
          console.log(`Running total after adding: ${total}`);
        }
      }
    });

    // 浮動小数点演算の精度問題を回避
    total = Math.round(total * 10000) / 10000;
    
    console.log('Total weight calculated:', total);
    console.log('Unit weights for precision:', unitWeights);
    return { items, totalWeight: total, unitWeights };
  }, [selectedMaterials, materials]);

  const handleQuantityChange = (materialId: string, delta: number) => {
    const currentValue = selectedMaterials[materialId] || 0;
    const newValue = Math.max(0, currentValue + delta);
    setValue(`materials.${materialId}`, newValue, { 
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true 
    });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 flex items-center justify-center">
        <div className="text-slate-600">データを読み込み中...</div>
      </div>
    );
  }

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
          <label className="block text-lg font-semibold mb-4 text-slate-700">資材カテゴリー</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategoryId(category.id)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  selectedCategoryId === category.id
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-slate-800">資材選択</h2>
            {isOtherCategory && (
              <button
                type="button"
                onClick={() => setShowAddMaterialForm(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2"
              >
                <span>+</span>
                <span>材料を追加</span>
              </button>
            )}
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-md">
            <label className="block text-sm font-medium mb-2 text-slate-700">資材検索</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="資材名で検索..."
            />
            {searchQuery && (
              <div className="flex justify-between items-center mt-2 text-sm text-slate-600">
                <span>{currentMaterials.length}件見つかりました</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  クリア
                </button>
              </div>
            )}
          </div>
        {currentMaterials.map((material) => (
          <div
            key={material.id}
            className="rounded-xl p-5 bg-white shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-xl font-semibold text-slate-800">{material.name}</h3>
                <p className="text-slate-600">
                  重量: {formatWeight(Number(material.weightKg))}
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
                {formatWeight(Number(selectedMaterials[material.id] || 0) * Number(material.weightKg))}
              </span>
            </div>
          </div>
        ))}
      </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl mb-6">
          <div className="flex justify-between items-center text-2xl font-bold">
            <span className="text-slate-800">合計重量:</span>
            <span className="text-indigo-600">{formatTotalWeight(orderItems.totalWeight)}</span>
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
      
      {showAddMaterialForm && (
        <AddMaterialForm
          categoryId={selectedCategoryId}
          onSuccess={handleAddMaterial}
          onCancel={() => setShowAddMaterialForm(false)}
        />
      )}
    </div>
  );
}