"use client";

import React, { useState } from "react";
import MaterialOrderForm from "@/components/MaterialOrderForm";
import { OrderDocument } from "@/types/material-order";

export default function MaterialOrderPage() {
  const [orderData, setOrderData] = useState<OrderDocument | null>(null);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleFormSubmit = (data: OrderDocument) => {
    setOrderData(data);
    setShowPDFPreview(true);
  };

  const handleReset = () => {
    setOrderData(null);
    setShowPDFPreview(false);
  };

  const handleGeneratePDF = async () => {
    if (!orderData) return;
    
    setIsGeneratingPDF(true);
    try {
      const { printToPDF } = await import("@/components/OrderDocumentHTML");
      printToPDF(orderData);
    } catch (error) {
      console.error("PDF生成エラー:", error);
      alert("PDF生成に失敗しました");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (showPDFPreview && orderData) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">発注書プレビュー</h1>
          <div className="space-x-4">
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              戻る
            </button>
            <button
              onClick={handleGeneratePDF}
              disabled={isGeneratingPDF}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isGeneratingPDF ? "PDF生成中..." : "PDFダウンロード"}
            </button>
          </div>
        </div>

        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">発注内容確認</h2>
          
          <div className="space-y-3 mb-6">
            <p className="text-lg"><span className="font-semibold text-gray-900">発注者:</span> <span className="text-gray-800">{orderData.ordererName}</span></p>
            <p className="text-lg"><span className="font-semibold text-gray-900">発注日:</span> <span className="text-gray-800">{new Date(orderData.orderDate).toLocaleDateString('ja-JP')}</span></p>
            {orderData.siteName && (
              <p className="text-lg"><span className="font-semibold text-gray-900">現場名:</span> <span className="text-gray-800">{orderData.siteName}</span></p>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-800">
                  <th className="border border-gray-300 p-3 text-left text-white font-semibold">資材名</th>
                  <th className="border border-gray-300 p-3 text-center text-white font-semibold">単位</th>
                  <th className="border border-gray-300 p-3 text-right text-white font-semibold">数量</th>
                  <th className="border border-gray-300 p-3 text-right text-white font-semibold">単位重量(kg)</th>
                  <th className="border border-gray-300 p-3 text-right text-white font-semibold">合計重量(kg)</th>
                </tr>
              </thead>
              <tbody>
                {orderData.items.map((item) => (
                  <tr key={item.id} className="bg-white hover:bg-gray-50">
                    <td className="border border-gray-300 p-3 text-gray-900 font-medium">{item.name}</td>
                    <td className="border border-gray-300 p-3 text-center text-gray-800">{item.unit}</td>
                    <td className="border border-gray-300 p-3 text-right text-gray-900 font-semibold">{item.quantity}</td>
                    <td className="border border-gray-300 p-3 text-right text-gray-800">{item.weightPerUnit.toFixed(1)}</td>
                    <td className="border border-gray-300 p-3 text-right text-gray-900 font-semibold">{item.totalWeight.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-blue-50">
                  <td colSpan={4} className="border border-gray-300 p-3 text-right font-bold text-gray-900">合計重量:</td>
                  <td className="border border-gray-300 p-3 text-right font-bold text-blue-700 text-lg">{orderData.totalWeight.toFixed(1)} kg</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {orderData.note && (
            <div className="mt-6 p-4 bg-yellow-50 rounded border border-yellow-200">
              <p className="font-semibold mb-2 text-gray-900">備考:</p>
              <p className="whitespace-pre-wrap text-gray-800">{orderData.note}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <MaterialOrderForm onSubmit={handleFormSubmit} />;
}