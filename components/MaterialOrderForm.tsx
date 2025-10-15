"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  MaterialOrderItem,
  OrderDocument,
} from "@/types/material-order";
import { formatWeight, formatTotalWeight } from "@/lib/utils/format";
import AddMaterialForm from "./AddMaterialForm";
import { ChevronDown } from "lucide-react";

const orderFormSchema = z.object({
  ordererName: z.string().min(1, "注文者名を入力してください"),
  siteName: z.string().min(1, "現場名を入力してください"),
  contactInfo: z.string().optional(),
  loadingDate: z.string().optional(),
  note: z.string().optional(),
  materials: z.record(z.number().int().min(0)),
});

type OrderFormData = z.infer<typeof orderFormSchema>;

interface EditOrderData {
  orderId: string;
  ordererName: string;
  siteName: string;
  contactInfo: string;
  loadingDate: string;
  note: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    weightPerUnit: number;
    totalWeight: number;
  }>;
}

interface MaterialOrderFormProps {
  onSubmit: (data: OrderDocument) => void;
  editMode?: boolean;
  editOrderData?: EditOrderData | null;
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

export default function MaterialOrderForm({ onSubmit, editMode = false, editOrderData = null }: MaterialOrderFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showAddMaterialForm, setShowAddMaterialForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [editData, setEditData] = useState<EditOrderData | null>(editOrderData);
  const [draftOrderId, setDraftOrderId] = useState<string | null>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  // 編集データが props で渡された場合に設定
  useEffect(() => {
    if (editOrderData) {
      setEditData(editOrderData);
    }
  }, [editOrderData]);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      ordererName: "",
      siteName: "",
      contactInfo: "",
      loadingDate: "",
      note: "",
      materials: {},
    },
  });

  // 編集データの読み込みとデータ取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 編集モードの場合はeditData.orderId、新規の場合はdraftOrderIdを使用
        const orderId = editMode ? editData?.orderId : draftOrderId;
        const materialsUrl = orderId ? `/api/materials?orderId=${orderId}` : '/api/materials';

        const [categoriesRes, materialsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch(materialsUrl)
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
  }, [editMode, editData, draftOrderId, setValue]);

  // 編集データと資材データが揃ったらフォームを初期化
  useEffect(() => {
    console.log('Form initialization check:', {
      editMode,
      hasEditData: !!editData,
      materialsCount: materials.length,
      loading
    });
    
    if (editMode && editData && materials.length > 0 && !loading) {
      console.log('Initializing form with edit data:', editData);
      
      // 資材の数量を復元
      const materialQuantities: { [key: string]: number } = {};
      editData.items?.forEach((item) => {
        const material = materials.find((m: Material) => m.name === item.name);
        if (material) {
          materialQuantities[material.id] = item.quantity;
          console.log(`Mapping material: ${item.name} -> ${material.id} (quantity: ${item.quantity})`);
        } else {
          console.warn(`Material not found: ${item.name}`);
        }
      });
      
      console.log('Material quantities to set:', materialQuantities);
      
      // reset()を使用してフォーム全体を再初期化
      const formData = {
        ordererName: editData.ordererName || "",
        siteName: editData.siteName || "",
        contactInfo: editData.contactInfo || "",
        loadingDate: editData.loadingDate || "",
        note: editData.note || "",
        materials: materialQuantities,
      };
      
      console.log('Resetting form with:', formData);
      reset(formData);
    }
  }, [editMode, editData, materials, loading, reset]);

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

  const currentMaterials = useMemo(() => {
    const filtered = materials.filter(m => {
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

    // 編集モードの場合は、数量が0より大きいものを優先的に上に表示
    if (editMode) {
      return filtered.sort((a, b) => {
        const quantityA = selectedMaterials[a.id] || 0;
        const quantityB = selectedMaterials[b.id] || 0;

        // 数量が0より大きいものを優先
        if (quantityA > 0 && quantityB === 0) return -1;
        if (quantityA === 0 && quantityB > 0) return 1;
        return 0;
      });
    }

    return filtered;
  }, [materials, selectedCategoryId, searchQuery, editMode, selectedMaterials]);

  const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
  const isOtherCategory = selectedCategory?.name === 'その他';

  const handleAddMaterialClick = async () => {
    // 新規発注で、まだ draft が作成されていない場合は draft 発注を作成
    if (!editMode && !draftOrderId) {
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectName: 'Draft',
            personInCharge: '',
            orderDate: new Date().toISOString(),
            status: 'draft',
            items: []
          })
        });

        if (!response.ok) {
          throw new Error('Failed to create draft order');
        }

        const data = await response.json();
        setDraftOrderId(data.order.id);
        console.log('Draft order created:', data.order.id);
      } catch (error) {
        console.error('Draft order creation failed:', error);
        alert('下書き発注の作成に失敗しました');
        return;
      }
    }
    setShowAddMaterialForm(true);
  };

  const handleAddMaterial = (newMaterial: Material) => {
    setMaterials(prev => [...prev, newMaterial]);
    setShowAddMaterialForm(false);
  };

  // 注文ボタンまでスクロールする関数
  const scrollToSubmit = () => {
    if (submitButtonRef.current) {
      submitButtonRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
    }
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
      contactInfo: data.contactInfo,
      loadingDate: data.loadingDate,
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 p-6">
      <form onSubmit={handleSubmit(onFormSubmit)} className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-4 text-slate-800">
            {editMode ? '発注書編集' : '資材発注書作成'}
          </h1>
          <div className="h-1 w-24 mx-auto bg-slate-300 rounded-full"></div>
        </div>

        <div className="space-y-6 mb-10 bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
          <div className="relative">
            <label className="block text-lg font-semibold mb-3 text-slate-700">
              注文者名 <span className="text-red-500">*</span>
            </label>
            <input
              {...register("ordererName")}
              type="text"
              className="w-full p-4 text-lg text-slate-800 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all duration-200 hover:border-gray-300 placeholder:text-slate-400"
              placeholder="山田太郎"
            />
            {errors.ordererName && (
              <p className="text-red-500 mt-2 text-sm font-medium">{errors.ordererName.message}</p>
            )}
          </div>

          <div className="relative">
            <label className="block text-lg font-semibold mb-3 text-slate-700">
              現場名 <span className="text-red-500">*</span>
            </label>
            <input
              {...register("siteName")}
              type="text"
              className="w-full p-4 text-lg text-slate-800 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all duration-200 hover:border-gray-300 placeholder:text-slate-400"
              placeholder="〇〇ビル新築工事"
            />
            {errors.siteName && (
              <p className="text-red-500 mt-2 text-sm font-medium">{errors.siteName.message}</p>
            )}
          </div>

          <div className="relative">
            <label className="block text-lg font-semibold mb-3 text-slate-700">
              連絡先
            </label>
            <input
              {...register("contactInfo")}
              type="text"
              className="w-full p-4 text-lg text-slate-800 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all duration-200 hover:border-gray-300 placeholder:text-slate-400"
              placeholder="090-1234-5678"
            />
            {errors.contactInfo && (
              <p className="text-red-500 mt-2 text-sm font-medium">{errors.contactInfo.message}</p>
            )}
          </div>

          <div className="relative">
            <label className="block text-lg font-semibold mb-3 text-slate-700">
              積込日
            </label>
            <input
              {...register("loadingDate")}
              type="date"
              placeholder="積込予定日を選択"
              className="w-full p-4 text-lg text-slate-800 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all duration-200 hover:border-gray-300 placeholder:text-slate-400"
            />
            {errors.loadingDate && (
              <p className="text-red-500 mt-2 text-sm font-medium">{errors.loadingDate.message}</p>
            )}
          </div>

          <div className="relative">
            <label className="block text-lg font-semibold mb-3 text-slate-700">
              備考
            </label>
            <textarea
              {...register("note")}
              className="w-full p-4 text-lg text-slate-800 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all duration-200 hover:border-gray-300 placeholder:text-slate-400 resize-none"
              rows={3}
              placeholder="特記事項があれば入力"
            />
          </div>
        </div>

        <div className="mb-10 bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
          <label className="block text-2xl font-bold mb-6 text-slate-800 text-center">
            資材カテゴリー
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategoryId(category.id)}
                className={`px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-md ${
                  selectedCategoryId === category.id
                    ? "bg-slate-800 text-white shadow-lg shadow-slate-300"
                    : "bg-gray-50 text-slate-700 hover:bg-gray-100 border border-gray-200 hover:shadow-lg"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-slate-800">
              資材選択
            </h2>
            {isOtherCategory && (
              <button
                type="button"
                onClick={handleAddMaterialClick}
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 flex items-center space-x-2"
              >
                <span>材料を追加</span>
              </button>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
            <label className="block text-lg font-semibold mb-4 text-slate-700">
              資材検索
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-4 text-lg text-slate-800 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all duration-200 hover:border-gray-300 placeholder:text-slate-400 pr-12"
                placeholder="資材名で検索..."
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
              </div>
            </div>
            {searchQuery && (
              <div className="flex justify-between items-center mt-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-slate-700 font-medium">
                  {currentMaterials.length}件見つかりました
                </span>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
                >
                  クリア
                </button>
              </div>
            )}
          </div>
        {currentMaterials.map((material) => (
          <div
            key={material.id}
            className="bg-white rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.01] border border-gray-200"
          >
            <div className="mb-4">
              <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-2">{material.name}</h3>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  {formatWeight(Number(material.weightKg))}
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center justify-center sm:justify-start space-x-3 md:space-x-4">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(material.id, -1)}
                  className="w-10 h-10 md:w-12 md:h-12 bg-slate-600 text-white rounded-xl text-lg md:text-xl font-bold hover:bg-slate-700 shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
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
                      min="0"
                      step="1"
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        // 空文字の場合はそのまま空文字を設定（0にしない）
                        if (inputValue === '') {
                          field.onChange('');
                          return;
                        }
                        const value = parseInt(inputValue);
                        // 数値でない場合は0、負の数の場合は0にする
                        if (isNaN(value)) {
                          field.onChange(0);
                        } else {
                          field.onChange(Math.max(0, value));
                        }
                      }}
                      onFocus={(e) => {
                        // フォーカス時に全選択
                        e.target.select();
                      }}
                      onBlur={(e) => {
                        // フォーカスが外れた時に空文字なら0にする
                        if (e.target.value === '' || e.target.value === null) {
                          field.onChange(0);
                        }
                      }}
                      className="w-16 md:w-20 text-center text-lg md:text-xl bg-white border-2 border-gray-300 rounded-xl p-2 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  )}
                />
                <button
                  type="button"
                  onClick={() => handleQuantityChange(material.id, 1)}
                  className="w-10 h-10 md:w-12 md:h-12 bg-slate-600 text-white rounded-xl text-lg md:text-xl font-bold hover:bg-slate-700 shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
                >
                  +
                </button>
              </div>
              <div className="flex justify-center sm:justify-end">
                <div className="px-3 py-2 md:px-4 md:py-2 bg-orange-100 text-orange-800 font-bold text-base md:text-lg rounded-xl max-w-full overflow-hidden">
                  {formatWeight(Number(selectedMaterials[material.id] || 0) * Number(material.weightKg))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

        <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200 mb-8">
          <div className="text-center mb-6">
            <div className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">合計重量</div>
            <div className="text-4xl font-bold text-slate-800">
              {formatTotalWeight(orderItems.totalWeight)}
            </div>
          </div>
          <div className="flex justify-center items-center space-x-8 text-slate-600">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800">{orderItems.items.length}</div>
              <div className="text-sm font-medium">選択資材</div>
            </div>
            <div className="w-px h-12 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800">
                {orderItems.items.reduce((sum, item) => sum + item.quantity, 0)}
              </div>
              <div className="text-sm font-medium">合計点数</div>
            </div>
          </div>
        </div>

        <button
          ref={submitButtonRef}
          type="submit"
          disabled={orderItems.items.length === 0}
          className="w-full py-5 bg-gradient-to-r from-slate-800 to-slate-700 text-white text-xl font-bold rounded-xl hover:from-slate-900 hover:to-slate-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1 active:scale-[0.98]"
        >
          {editMode ? '発注書を更新' : '発注書を作成'}
        </button>
      </form>
      
      {/* スクロールボタン */}
      <button
        onClick={scrollToSubmit}
        className="fixed bottom-6 right-6 w-14 h-14 bg-slate-700 hover:bg-slate-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110 active:scale-95 z-50 flex items-center justify-center"
        title="注文ボタンまで移動"
      >
        <ChevronDown className="h-6 w-6" />
      </button>
      
      {showAddMaterialForm && (
        <AddMaterialForm
          categoryId={selectedCategoryId}
          orderId={editMode ? editData?.orderId : draftOrderId}
          onSuccess={handleAddMaterial}
          onCancel={() => setShowAddMaterialForm(false)}
        />
      )}
    </div>
  );
}