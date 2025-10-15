import { OrderDocument } from '@/types/material-order';
import { formatWeight, formatTotalWeight } from '@/lib/utils/format';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

export const generatePDFContent = (data: OrderDocument): string => {

  // アイテムを列に分割する（90個以上の場合は1列あたり35行、未満は30行）
  const ITEMS_PER_COLUMN = data.items.length >= 90 ? 35 : 30;
  const isCompactMode = data.items.length >= 90;
  const columns: typeof data.items[] = [];
  for (let i = 0; i < data.items.length; i += ITEMS_PER_COLUMN) {
    columns.push(data.items.slice(i, i + ITEMS_PER_COLUMN));
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>発注書_${data.ordererName}_${new Date().toISOString().split('T')[0]}</title>
      <style>
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body { margin: 0; }
        }
        body {
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 9px;
          line-height: 1.2;
          color: #000;
          margin: 0;
          padding: 10px;
        }
        .title {
          text-align: center;
          margin-bottom: 8px;
        }
        .title h1 {
          font-size: 18px;
          font-weight: bold;
          margin: 0 0 5px 0;
          border-bottom: 1px solid #333;
          padding-bottom: 5px;
        }
        .info-section {
          margin-bottom: 10px;
          padding: 8px;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
        }
        .info-row {
          margin-bottom: 3px;
          font-size: 10px;
        }
        .info-label {
          font-weight: bold;
          min-width: 60px;
          display: inline-block;
          font-size: 10px;
        }
        .tables-container {
          display: flex;
          gap: 8px;
          margin-bottom: 10px;
        }
        .table-wrapper {
          flex: 1;
          page-break-inside: avoid;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid #333;
          page-break-inside: auto;
        }
        tbody tr {
          page-break-inside: avoid;
        }
        th {
          border: 1px solid #333;
          padding: ${isCompactMode ? '2px 2px' : '4px 3px'};
          background-color: #475569;
          color: white;
          font-weight: bold;
          font-size: ${isCompactMode ? '8px' : '9px'};
        }
        td {
          border: 1px solid #e2e8f0;
          padding: ${isCompactMode ? '2px 2px' : '3px 3px'};
          font-size: ${isCompactMode ? '7px' : '8px'};
        }
        .row-alternate {
          background-color: #f7fafc;
        }
        .total-section {
          margin-top: 10px;
          padding: 8px;
          background-color: #f8fafc;
          border-radius: 4px;
          border: 1px solid #64748b;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .total-label {
          font-size: 11px;
          font-weight: bold;
          color: #1a1a1a;
        }
        .total-value {
          font-size: 12px;
          font-weight: bold;
          color: #1e293b;
        }
        .note-section {
          margin-top: 10px;
          padding: 8px;
          background-color: #f8fafc;
          border-radius: 4px;
          border: 1px solid #64748b;
        }
        .note-label {
          font-size: 10px;
          font-weight: bold;
          color: #333;
          margin-bottom: 4px;
        }
        .note-text {
          font-size: 9px;
          line-height: 1.3;
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
        .watermark-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          pointer-events: none;
          user-select: none;
          overflow: hidden;
        }
        .watermark {
          position: absolute;
          transform: rotate(-45deg);
          font-size: 24px;
          font-weight: bold;
          color: rgba(0, 0, 0, 0.04);
          white-space: nowrap;
        }
      </style>
    </head>
    <body>
      <div class="watermark-container">
        ${Array.from({ length: 20 }, (_, i) => {
          const row = Math.floor(i / 4);
          const col = i % 4;
          const top = row * 20 + 10;
          const left = col * 25 + 5;
          return `<div class="watermark" style="top: ${top}%; left: ${left}%;">株式会社　櫻建</div>`;
        }).join('')}
      </div>
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
                <th style="text-align: left; width: 45%;">資材名</th>
                <th style="text-align: right; width: 15%;">数量</th>
                <th style="text-align: right; width: 20%;">単位重量</th>
                <th style="text-align: right; width: 20%;">合計重量</th>
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
};

export const printToPDF = (data: OrderDocument): void => {
  // 新しいウィンドウを開いてPDF印刷用のHTMLを表示
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('ポップアップがブロックされました。ポップアップを許可してください。');
    return;
  }

  const htmlContent = generatePDFContent(data);
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};