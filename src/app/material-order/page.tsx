"use client";

import React, { useState } from "react";
import MaterialOrderForm from "@/components/MaterialOrderForm";
import { OrderDocument } from "@/types/material-order";
import { formatWeight, formatTotalWeight } from "@/lib/utils/format";

export default function MaterialOrderPage() {
  const [orderData, setOrderData] = useState<OrderDocument | null>(null);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);

  const handleFormSubmit = (data: OrderDocument) => {
    setOrderData(data);
    setShowPDFPreview(true);
  };

  const handleReset = () => {
    setOrderData(null);
    setShowPDFPreview(false);
    setOrderCreated(false);
  };

  const handleCreateOrder = async () => {
    if (!orderData) return;
    
    setIsCreatingOrder(true);
    try {
      // 発注書データをAPIに送信して保存
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectName: orderData.siteName,
          personInCharge: orderData.ordererName,
          orderDate: orderData.orderDate,
          deliveryDate: null,
          status: 'completed',
          notes: orderData.note,
          items: orderData.items.map(item => ({
            materialId: item.id,
            quantity: item.quantity,
            totalWeightKg: item.totalWeight,
            notes: null
          }))
        })
      });

      if (!response.ok) {
        throw new Error('発注書の作成に失敗しました');
      }

      const result = await response.json();
      console.log('発注書を作成しました:', result);
      
      // PDFをダウンロード
      const { printToPDF } = await import("@/components/OrderDocumentHTML");
      printToPDF(orderData);
      
      setOrderCreated(true);
      alert('発注書を作成しました！');
      
      // 3秒後にダッシュボードに戻る
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 3000);
    } catch (error) {
      console.error("発注書作成エラー:", error);
      alert("発注書の作成に失敗しました");
    } finally {
      setIsCreatingOrder(false);
    }
  };

  if (showPDFPreview && orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-slate-800">発注書プレビュー</h1>
            <div className="space-x-4">
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-slate-500 text-white rounded-lg hover:bg-slate-600 font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              >
                戻る
              </button>
              <button
                onClick={handleCreateOrder}
                disabled={isCreatingOrder || orderCreated}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              >
                {isCreatingOrder ? "作成中..." : orderCreated ? "作成済み" : "発注書を作成"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl p-8 bg-white shadow-xl">
            <h2 className="text-2xl font-bold mb-6 text-slate-800">発注内容確認</h2>
          
            <div className="space-y-3 mb-8 p-4 bg-slate-50 rounded-lg">
              <p className="text-lg"><span className="font-semibold text-slate-700">発注者:</span> <span className="text-slate-800">{orderData.ordererName}</span></p>
              <p className="text-lg"><span className="font-semibold text-slate-700">発注日:</span> <span className="text-slate-800">{new Date(orderData.orderDate).toLocaleDateString('ja-JP')}</span></p>
              {orderData.siteName && (
                <p className="text-lg"><span className="font-semibold text-slate-700">現場名:</span> <span className="text-slate-800">{orderData.siteName}</span></p>
              )}
            </div>

          <div className="overflow-x-auto">
              <table className="w-full border-collapse rounded-lg overflow-hidden shadow-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-700 to-slate-600">
                    <th className="p-4 text-left text-white font-semibold">資材名</th>
                    <th className="p-4 text-right text-white font-semibold">数量</th>
                    <th className="p-4 text-right text-white font-semibold">単位重量(kg)</th>
                    <th className="p-4 text-right text-white font-semibold">合計重量(kg)</th>
                  </tr>
                </thead>
              <tbody>
                {orderData.items.map((item) => (
                    <tr key={item.id} className="bg-white hover:bg-slate-50 border-b border-slate-200 transition-colors duration-150">
                      <td className="p-4 text-slate-800 font-medium">{item.name}</td>
                      <td className="p-4 text-right text-slate-800 font-semibold">{item.quantity}</td>
                      <td className="p-4 text-right text-slate-700">{formatWeight(item.weightPerUnit).replace('kg', '')}</td>
                      <td className="p-4 text-right text-slate-800 font-semibold">{formatWeight(item.totalWeight).replace('kg', '')}</td>
                    </tr>
                ))}
              </tbody>
              <tfoot>
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100">
                    <td colSpan={3} className="p-4 text-right font-bold text-slate-800">合計重量:</td>
                    <td className="p-4 text-right font-bold text-slate-800 text-lg">{formatTotalWeight(orderData.totalWeight)}</td>
                  </tr>
              </tfoot>
            </table>
          </div>

          {orderData.note && (
              <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="font-semibold mb-2 text-slate-800">備考:</p>
                <p className="whitespace-pre-wrap text-slate-700">{orderData.note}</p>
              </div>
          )}
          </div>
        </div>
      </div>
    );
  }

  return <MaterialOrderForm onSubmit={handleFormSubmit} />;
}