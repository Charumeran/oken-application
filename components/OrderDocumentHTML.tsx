import { OrderDocument } from '@/types/material-order';
import { formatWeight, formatTotalWeight } from '@/lib/utils/format';

export const printToPDF = (data: OrderDocument): void => {
  // 新しいウィンドウを開いてPDF印刷用のHTMLを表示
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('ポップアップがブロックされました。ポップアップを許可してください。');
    return;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  // アイテムを列に分割する（1列あたり最大12アイテム）
  const ITEMS_PER_COLUMN = 12;
  const columns: typeof data.items[] = [];
  for (let i = 0; i < data.items.length; i += ITEMS_PER_COLUMN) {
    columns.push(data.items.slice(i, i + ITEMS_PER_COLUMN));
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>発注書_${data.ordererName}_${new Date().toISOString().split('T')[0]}</title>
      <style>
        @media print {
          @page {
            size: A4 landscape;
            margin: 15mm;
          }
          body { margin: 0; }
        }
        body {
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 12px;
          line-height: 1.5;
          color: #000;
          margin: 0;
          padding: 20px;
        }
        .title {
          text-align: center;
          margin-bottom: 25px;
        }
        .title h1 {
          font-size: 28px;
          font-weight: bold;
          margin: 0 0 15px 0;
          border-bottom: 2px solid #333;
          padding-bottom: 10px;
        }
        .info-section {
          margin-bottom: 20px;
          padding: 15px;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }
        .info-row {
          margin-bottom: 8px;
          font-size: 16px;
        }
        .info-label {
          font-weight: bold;
          min-width: 100px;
          display: inline-block;
          font-size: 16px;
        }
        .tables-container {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
        }
        .table-wrapper {
          flex: 1;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid #333;
        }
        th {
          border: 1px solid #333;
          padding: 10px;
          background-color: #475569;
          color: white;
          font-weight: bold;
          font-size: 14px;
        }
        td {
          border: 1px solid #e2e8f0;
          padding: 8px;
          font-size: 13px;
        }
        .row-alternate {
          background-color: #f7fafc;
        }
        .total-section {
          margin-top: 20px;
          padding: 15px;
          background-color: #f8fafc;
          border-radius: 8px;
          border: 1px solid #64748b;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .total-label {
          font-size: 16px;
          font-weight: bold;
          color: #1a1a1a;
        }
        .total-value {
          font-size: 18px;
          font-weight: bold;
          color: #1e293b;
        }
        .note-section {
          margin-top: 20px;
          padding: 15px;
          background-color: #f8fafc;
          border-radius: 8px;
          border: 1px solid #64748b;
        }
        .note-label {
          font-size: 14px;
          font-weight: bold;
          color: #333;
          margin-bottom: 8px;
        }
        .note-text {
          font-size: 11px;
          line-height: 1.5;
          color: #1a1a1a;
          white-space: pre-wrap;
        }
        .print-button {
          background: linear-gradient(to right, #1e293b, #334155);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 20px;
          transition: all 0.2s ease;
        }
        .print-button:hover {
          background: linear-gradient(to right, #0f172a, #1e293b);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        @media print {
          .print-button { display: none; }
        }
        .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 120px;
          font-weight: bold;
          color: rgba(0, 0, 0, 0.05);
          z-index: -1;
          pointer-events: none;
          user-select: none;
          white-space: nowrap;
        }
      </style>
    </head>
    <body>
      <div class="watermark">株式会社　櫻建</div>
      <button class="print-button" onclick="window.print()">印刷 / PDFに保存</button>
      
      <div class="title">
        <h1>資材発注書</h1>
      </div>
      
      <div class="info-section">
        <div class="info-row">
          <span class="info-label">発注日:</span>
          <span>${formatDate(data.orderDate)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">注文者:</span>
          <span>${data.ordererName}</span>
        </div>
        ${data.siteName ? `
        <div class="info-row">
          <span class="info-label">現場名:</span>
          <span>${data.siteName}</span>
        </div>` : ''}
        ${data.contactInfo ? `
        <div class="info-row">
          <span class="info-label">連絡先:</span>
          <span>${data.contactInfo}</span>
        </div>` : ''}
        ${data.loadingDate ? `
        <div class="info-row">
          <span class="info-label">積込日:</span>
          <span>${formatDate(data.loadingDate)}</span>
        </div>` : ''}
      </div>
      
      ${data.items.length > 0 ? `
      <div class="tables-container">
        ${columns.map((columnItems) => `
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th style="text-align: left;">資材名</th>
                <th style="text-align: right;">数量</th>
                <th style="text-align: right;">単位重量</th>
                <th style="text-align: right;">合計重量</th>
              </tr>
            </thead>
            <tbody>
              ${columnItems.map((item, index) => `
              <tr ${index % 2 === 1 ? 'class="row-alternate"' : ''}>
                <td style="font-weight: bold;">${item.name}</td>
                <td style="text-align: right; font-weight: bold;">${item.quantity}</td>
                <td style="text-align: right;">${formatWeight(item.weightPerUnit).replace('kg', '')}</td>
                <td style="text-align: right; font-weight: bold;">${formatWeight(item.totalWeight).replace('kg', '')}</td>
              </tr>`).join('')}
              ${columnItems.length < ITEMS_PER_COLUMN ? 
                Array(ITEMS_PER_COLUMN - columnItems.length).fill(0).map((_, i) => 
                  `<tr ${(columnItems.length + i) % 2 === 1 ? 'class="row-alternate"' : ''}>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                  </tr>`
                ).join('') : ''}
            </tbody>
          </table>
        </div>
        `).join('')}
      </div>` : ''}
      
      <div class="total-section">
        <span class="total-label">合計重量:</span>
        <span class="total-value">${formatTotalWeight(data.totalWeight)}</span>
      </div>
      
      ${data.note ? `
      <div class="note-section">
        <div class="note-label">備考:</div>
        <div class="note-text">${data.note}</div>
      </div>` : ''}
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};