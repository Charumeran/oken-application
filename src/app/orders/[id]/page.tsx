"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, FileText, Calendar, Package, User, Edit } from 'lucide-react';

interface OrderDetail {
  id: string;
  orderNumber: string;
  customerName: string;
  customerAddress: string;
  contactInfo: string;
  loadingDate: string | null;
  deliveryDate: string;
  shippingAddress: string;
  totalWeight: number;
  status: string;
  createdAt: string;
  items: Array<{
    productName: string;
    quantity: number;
    weightPerUnit: number;
    totalWeight: number;
  }>;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchOrderDetail(params.id as string);
    }
  }, [params.id]);

  const fetchOrderDetail = async (id: string) => {
    try {
      const response = await fetch(`/api/orders/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }
      const data = await response.json();
      setOrder(data.order);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!order) return;
    
    try {
      // OrderDocument形式に変換
      const orderDocument = {
        orderDate: order.deliveryDate || order.createdAt,
        ordererName: order.customerAddress || '担当者',
        siteName: order.customerName,
        contactInfo: order.contactInfo,
        loadingDate: order.loadingDate || undefined,
        items: order.items.map(item => ({
          id: `${order.id}-${item.productName}`,
          name: item.productName,
          quantity: item.quantity,
          weightPerUnit: item.weightPerUnit,
          totalWeight: item.totalWeight
        })),
        totalWeight: order.totalWeight,
        note: order.shippingAddress || ''
      };

      // 発注書PDFを生成
      const { printToPDF } = await import("@/components/OrderDocumentHTML");
      printToPDF(orderDocument);
    } catch (error) {
      console.error('Error downloading order:', error);
    }
  };

  const handleEdit = () => {
    if (!order) return;
    
    // 発注書データをlocalStorageに保存
    const editData = {
      orderId: order.id,
      ordererName: order.customerAddress || '',
      siteName: order.customerName || '',
      contactInfo: order.contactInfo || '',
      loadingDate: order.loadingDate ? order.loadingDate.split('T')[0] : '', // YYYY-MM-DD形式に変換
      note: order.shippingAddress || '',
      items: order.items.map(item => ({
        id: item.productName, // 資材名で特定するための一時的ID
        name: item.productName,
        quantity: item.quantity,
        weightPerUnit: item.weightPerUnit,
        totalWeight: item.totalWeight
      }))
    };
    
    console.log('Saving edit data:', editData);
    localStorage.setItem('editOrderData', JSON.stringify(editData));
    console.log('Data saved to localStorage');
    router.push('/material-order');
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center bg-white rounded-lg p-8 shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 py-8">
          <Card className="border border-gray-200">
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 mb-4">発注書が見つかりません</p>
              <Button
                onClick={() => router.push('/order-history')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                履歴に戻る
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      pending: { label: '処理中', className: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
      completed: { label: '完了', className: 'bg-green-50 text-green-700 border border-green-200' },
      cancelled: { label: 'キャンセル', className: 'bg-red-50 text-red-700 border border-red-200' },
    };
    
    const config = statusConfig[status] || { label: status, className: 'bg-gray-50 text-gray-700 border border-gray-200' };
    return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.className}`}>{config.label}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        {/* ヘッダーアクション */}
        <div className="mb-6 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => router.push('/order-history')}
            className="flex items-center gap-2 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            履歴に戻る
          </Button>
          <div className="flex gap-2">
            <Button
              onClick={handleEdit}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white shadow-sm"
            >
              <Edit className="h-4 w-4" />
              編集
            </Button>
            <Button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white shadow-sm"
            >
              <Download className="h-4 w-4" />
              発注書出力
            </Button>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="grid gap-6">
          {/* ヘッダー情報カード */}
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-600" />
                    <CardTitle className="text-2xl font-semibold text-gray-900">発注書詳細</CardTitle>
                  </div>
                  <p className="text-gray-600">発注番号: <span className="font-medium text-gray-900">{order.orderNumber}</span></p>
                </div>
                <div>{getStatusBadge(order.status)}</div>
              </div>
            </CardHeader>
          </Card>

          {/* 発注・配送情報カード */}
          <div className="grid gap-6">
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-600" />
                  <CardTitle className="text-lg font-medium text-gray-900">発注情報</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">現場名</p>
                    <p className="font-medium text-gray-900">{order.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">担当者</p>
                    <p className="font-medium text-gray-900">{order.customerAddress}</p>
                  </div>
                  {order.contactInfo && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">連絡先</p>
                      <p className="font-medium text-gray-900">{order.contactInfo}</p>
                    </div>
                  )}
                  {order.loadingDate && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        積込日
                      </p>
                      <p className="font-medium text-gray-900">
                        {format(new Date(order.loadingDate), 'yyyy年M月d日', { locale: ja })}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 注文商品リストカード */}
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-gray-600" />
                <CardTitle className="text-lg font-medium text-gray-900">注文商品</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-y border-gray-200">
                      <th className="text-left px-4 py-3 font-medium text-gray-700">商品名</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-700">数量</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-700">単位重量(kg)</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-700">合計重量(kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-900 font-medium">{item.productName}</td>
                        <td className="text-right px-4 py-3 text-gray-700">{item.quantity}</td>
                        <td className="text-right px-4 py-3 text-gray-700">{item.weightPerUnit.toFixed(1)}</td>
                        <td className="text-right px-4 py-3 text-gray-900 font-medium">{item.totalWeight.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 border-t border-gray-200">
                      <td colSpan={3} className="text-right px-4 py-3 font-semibold text-gray-700">
                        合計重量:
                      </td>
                      <td className="text-right px-4 py-3 font-bold text-lg text-gray-900">
                        {order.totalWeight.toFixed(1)}kg
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* フッター情報 */}
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardContent className="py-4">
              <div className="flex items-center justify-between text-sm">
                <p className="text-gray-600">
                  発注日: <span className="font-medium text-gray-900">{format(new Date(order.createdAt), 'yyyy年M月d日 HH:mm', { locale: ja })}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}