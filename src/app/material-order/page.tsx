"use client";

import React, { useState, useEffect } from "react";
import MaterialOrderForm from "@/components/MaterialOrderForm";
import { OrderDocument } from "@/types/material-order";
import { formatWeight, formatTotalWeight } from "@/lib/utils/format";

export default function MaterialOrderPage() {
  const [orderData, setOrderData] = useState<OrderDocument | null>(null);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editOrderId, setEditOrderId] = useState<string | null>(null);

  const handleFormSubmit = (data: OrderDocument) => {
    setOrderData(data);
    setShowPDFPreview(true);
  };

  // 編集データの読み込み
  useEffect(() => {
    console.log('MaterialOrderPage mounted, checking for edit data...');
    
    const editData = localStorage.getItem('editOrderData');
    console.log('Edit data in localStorage:', editData);
    
    if (editData) {
      try {
        const parsedData = JSON.parse(editData);
        console.log('Setting edit mode, parsed data:', parsedData);
        setEditMode(true);
        setEditOrderId(parsedData.orderId);
        // localStorageはここでは削除しない（MaterialOrderFormで使用するため）
      } catch (error) {
        console.error('Failed to parse edit data:', error);
        localStorage.removeItem('editOrderData');
      }
    } else {
      console.log('No edit data found, using create mode');
    }
  }, []);

  const handleReset = () => {
    setOrderData(null);
    setShowPDFPreview(false);
    setOrderCreated(false);
  };

  const handleCreateOrder = async () => {
    if (!orderData) return;

    // ポップアップブロックを回避するため、クリックイベント内で即座にウィンドウを開く
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('ポップアップがブロックされました。ポップアップを許可してから再度お試しください。');
      return;
    }

    // ローディング画面を表示
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>発注書を生成中...</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(to br, #f8fafc, #e2e8f0);
          }
          .loading {
            text-align: center;
          }
          .spinner {
            border: 4px solid #e2e8f0;
            border-top: 4px solid #475569;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="loading">
          <div class="spinner"></div>
          <p>発注書を生成中...</p>
        </div>
      </body>
      </html>
    `);

    setIsCreatingOrder(true);
    try {
      const requestData = {
        projectName: orderData.siteName,
        personInCharge: orderData.ordererName,
        contactInfo: orderData.contactInfo,
        loadingDate: orderData.loadingDate,
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
      };

      // 編集モードの場合はPUT、新規の場合はPOST
      const url = editMode && editOrderId ? `/api/orders/${editOrderId}` : '/api/orders';
      const method = editMode && editOrderId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        printWindow.close();
        throw new Error(errorData.error || '発注書の作成に失敗しました');
      }

      const result = await response.json();
      console.log(editMode ? '発注書を更新しました:' : '発注書を作成しました:', result);

      // PDFをダウンロード（既に開いているウィンドウに書き込む）
      const { generatePDFContent } = await import("@/components/OrderDocumentHTML");
      const htmlContent = generatePDFContent(orderData);
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      setOrderCreated(true);
      alert(editMode ? '発注書を更新しました！' : '発注書を作成しました！');

      // 3秒後にダッシュボードに戻る
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 3000);
    } catch (error) {
      console.error(editMode ? "発注書更新エラー:" : "発注書作成エラー:", error);
      alert(editMode ? "発注書の更新に失敗しました" : "発注書の作成に失敗しました");
    } finally {
      setIsCreatingOrder(false);
    }
  };

  if (showPDFPreview && orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-3 md:p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4 md:mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <h1 className="text-xl md:text-3xl font-bold text-slate-800">{editMode ? '発注書編集プレビュー' : '発注書プレビュー'}</h1>
            <div className="flex gap-2 sm:gap-4">
              <button
                onClick={handleReset}
                className="flex-1 sm:flex-none px-4 md:px-6 py-2 md:py-3 bg-slate-500 text-white rounded-lg hover:bg-slate-600 font-semibold shadow-md hover:shadow-lg transition-all duration-200 text-sm md:text-base"
              >
                戻る
              </button>
              <button
                onClick={handleCreateOrder}
                disabled={isCreatingOrder || orderCreated}
                className="flex-1 sm:flex-none px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-lg hover:from-slate-800 hover:to-slate-900 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed font-semibold shadow-md hover:shadow-lg transition-all duration-200 text-sm md:text-base"
              >
                {isCreatingOrder ? (editMode ? "更新中..." : "作成中...") : orderCreated ? (editMode ? "更新済み" : "作成済み") : (editMode ? "発注書を更新" : "発注書を作成")}
              </button>
            </div>
          </div>

          <div className="rounded-xl md:rounded-2xl p-4 md:p-8 bg-white shadow-xl">
            <h2 className="text-lg md:text-2xl font-bold mb-4 md:mb-6 text-slate-800">発注内容確認</h2>

            <div className="space-y-2 md:space-y-3 mb-6 md:mb-8 p-3 md:p-4 bg-slate-50 rounded-lg">
              <p className="text-sm md:text-lg"><span className="font-semibold text-slate-700">注文者:</span> <span className="text-slate-800">{orderData.ordererName}</span></p>
              <p className="text-sm md:text-lg"><span className="font-semibold text-slate-700">発注日:</span> <span className="text-slate-800">{new Date(orderData.orderDate).toLocaleDateString('ja-JP')}</span></p>
              {orderData.siteName && (
                <p className="text-sm md:text-lg"><span className="font-semibold text-slate-700">現場名:</span> <span className="text-slate-800">{orderData.siteName}</span></p>
              )}
              {orderData.contactInfo && (
                <p className="text-sm md:text-lg"><span className="font-semibold text-slate-700">連絡先:</span> <span className="text-slate-800">{orderData.contactInfo}</span></p>
              )}
              {orderData.loadingDate && (
                <p className="text-sm md:text-lg"><span className="font-semibold text-slate-700">積込日:</span> <span className="text-slate-800">{new Date(orderData.loadingDate).toLocaleDateString('ja-JP')}</span></p>
              )}
            </div>

          <div className="overflow-x-auto -mx-4 md:mx-0">
              <table className="w-full min-w-[500px] border-collapse rounded-lg overflow-hidden shadow-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-700 to-slate-600">
                    <th className="p-2 md:p-4 text-left text-white font-semibold text-xs md:text-base">資材名</th>
                    <th className="p-2 md:p-4 text-right text-white font-semibold text-xs md:text-base whitespace-nowrap">数量</th>
                    <th className="p-2 md:p-4 text-right text-white font-semibold text-xs md:text-base whitespace-nowrap">単位重量<span className="hidden sm:inline">(kg)</span></th>
                    <th className="p-2 md:p-4 text-right text-white font-semibold text-xs md:text-base whitespace-nowrap">合計重量<span className="hidden sm:inline">(kg)</span></th>
                  </tr>
                </thead>
              <tbody>
                {orderData.items.map((item) => (
                    <tr key={item.id} className="bg-white hover:bg-slate-50 border-b border-slate-200 transition-colors duration-150">
                      <td className="p-2 md:p-4 text-slate-800 font-medium text-xs md:text-base">{item.name}</td>
                      <td className="p-2 md:p-4 text-right text-slate-800 font-semibold text-xs md:text-base">{item.quantity}</td>
                      <td className="p-2 md:p-4 text-right text-slate-700 text-xs md:text-base">{formatWeight(item.weightPerUnit).replace('kg', '')}</td>
                      <td className="p-2 md:p-4 text-right text-slate-800 font-semibold text-xs md:text-base">{formatWeight(item.totalWeight).replace('kg', '')}</td>
                    </tr>
                ))}
              </tbody>
              <tfoot>
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100">
                    <td colSpan={3} className="p-2 md:p-4 text-right font-bold text-slate-800 text-xs md:text-base">合計重量:</td>
                    <td className="p-2 md:p-4 text-right font-bold text-slate-800 text-sm md:text-lg">{formatTotalWeight(orderData.totalWeight)}</td>
                  </tr>
              </tfoot>
            </table>
          </div>

          {orderData.note && (
              <div className="mt-4 md:mt-6 p-3 md:p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="font-semibold mb-2 text-slate-800 text-sm md:text-base">備考:</p>
                <p className="whitespace-pre-wrap text-slate-700 text-sm md:text-base">{orderData.note}</p>
              </div>
          )}
          </div>
        </div>
      </div>
    );
  }

  console.log('Rendering MaterialOrderForm with editMode:', editMode);
  return <MaterialOrderForm onSubmit={handleFormSubmit} editMode={editMode} />;
}