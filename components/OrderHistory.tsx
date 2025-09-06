"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Search, Calendar, FileText, Printer } from 'lucide-react';

interface OrderData {
  id: string;
  orderNumber: string;
  customerName: string;
  deliveryDate: string;
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

export default function OrderHistory() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch = 
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      
      let matchesDate = true;
      if (dateFilter !== 'all') {
        const orderDate = new Date(order.createdAt);
        const today = new Date();
        if (dateFilter === 'today') {
          matchesDate = orderDate.toDateString() === today.toDateString();
        } else if (dateFilter === 'week') {
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = orderDate >= weekAgo;
        } else if (dateFilter === 'month') {
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = orderDate >= monthAgo;
        }
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [orders, searchTerm, statusFilter, dateFilter]);

  const handleView = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  const handleDownload = async (orderId: string) => {
    try {
      // 注文詳細を取得
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }
      const data = await response.json();
      const order = data.order;

      // OrderDocument形式に変換
      const orderDocument = {
        orderDate: order.deliveryDate || order.createdAt,
        ordererName: order.customerAddress || '担当者',
        siteName: order.customerName,
        items: order.items.map((item: { productName: string; quantity: number; weightPerUnit: number; totalWeight: number }) => ({
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
      alert('発注書の出力に失敗しました');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      pending: { label: '処理中', className: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
      completed: { label: '完了', className: 'bg-green-50 text-green-700 border border-green-200' },
      cancelled: { label: 'キャンセル', className: 'bg-red-50 text-red-700 border border-red-200' },
    };
    
    const config = statusConfig[status] || { label: status, className: 'bg-gray-50 text-gray-700 border border-gray-200' };
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>{config.label}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        {/* ページタイトル */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            発注書履歴
          </h1>
          <p className="text-gray-600">
            過去の発注書を確認・ダウンロードできます
          </p>
        </div>

        {/* 検索・フィルターセクション */}
        <Card className="mb-8 border border-gray-200">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-600" />
              <CardTitle className="text-lg text-gray-900">検索・フィルター</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4">
              {/* 検索欄 */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  placeholder="現場名または発注番号で検索..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder-gray-500"
                />
              </div>
              
              {/* フィルター */}
              <div className="flex flex-col sm:flex-row gap-3 lg:w-auto">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[140px] h-10 bg-white text-gray-900 border-gray-300">
                    <SelectValue placeholder="ステータス" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-gray-900">
                    <SelectItem value="all">すべて</SelectItem>
                    <SelectItem value="pending">処理中</SelectItem>
                    <SelectItem value="completed">完了</SelectItem>
                    <SelectItem value="cancelled">キャンセル</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-full sm:w-[140px] h-10 bg-white text-gray-900 border-gray-300">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                      <SelectValue placeholder="期間" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white text-gray-900">
                    <SelectItem value="all">すべて</SelectItem>
                    <SelectItem value="today">今日</SelectItem>
                    <SelectItem value="week">過去7日間</SelectItem>
                    <SelectItem value="month">過去30日間</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* 検索結果数表示 */}
            {searchTerm && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  「{searchTerm}」の検索結果: {filteredOrders.length}件
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* テーブルセクション */}
        <Card className="border border-gray-200">
          <CardContent className="p-0">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">発注書が見つかりません</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 border-b border-gray-200">
                      <TableHead className="font-medium text-gray-700">発注番号</TableHead>
                      <TableHead className="font-medium text-gray-700">現場名</TableHead>
                      <TableHead className="font-medium text-gray-700">納品日</TableHead>
                      <TableHead className="text-right font-medium text-gray-700">合計重量</TableHead>
                      <TableHead className="font-medium text-gray-700">ステータス</TableHead>
                      <TableHead className="font-medium text-gray-700">作成日</TableHead>
                      <TableHead className="text-right font-medium text-gray-700">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-gray-50 border-b border-gray-100">
                        <TableCell className="font-medium text-gray-900">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell className="text-gray-700">{order.customerName}</TableCell>
                        <TableCell className="text-gray-700">
                          {format(new Date(order.deliveryDate), 'yyyy年M月d日', { locale: ja })}
                        </TableCell>
                        <TableCell className="text-right text-gray-700">
                          {order.totalWeight.toFixed(1)}kg
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-gray-700">
                          {format(new Date(order.createdAt), 'yyyy/MM/dd', { locale: ja })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleView(order.id)}
                              className="h-8 w-8 p-0 bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                              title="詳細表示"
                            >
                              <Eye className="h-4 w-4 text-gray-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownload(order.id)}
                              className="h-8 w-8 p-0 bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                              title="発注書出力"
                            >
                              <Printer className="h-4 w-4 text-gray-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}