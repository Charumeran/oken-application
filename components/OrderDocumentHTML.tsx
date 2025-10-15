import { OrderDocument } from '@/types/material-order';
import { formatWeight, formatTotalWeight } from '@/lib/utils/format';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

export const generatePDFContent = (data: OrderDocument): string => {
  // アイテム数に応じてコンパクトモードを判定
  const isCompactMode = data.items.length >= 90;

  // カラム数を決定（アイテム数に応じて2-4列）
  let columnCount = 2;
  if (data.items.length > 60) columnCount = 3;
  if (data.items.length > 100) columnCount = 4;

  // アイテムをカラムに均等に分割
  const itemsPerColumn = Math.ceil(data.items.length / columnCount);
  const columns: typeof data.items[] = [];
  for (let i = 0; i < columnCount; i++) {
    const start = i * itemsPerColumn;
    const end = Math.min(start + itemsPerColumn, data.items.length);
    columns.push(data.items.slice(start, end));
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>発注書_${data.ordererName}_${new Date().toISOString().split('T')[0]}</title>
      <style>
        * {
          box-sizing: border-box;
        }
        html, body {
          margin: 0;
          padding: 0;
        }
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          html, body {
            height: auto !important;
            overflow: visible !important;
          }
          body {
            margin: 0 !important;
            padding: 8px !important;
            position: relative;
          }
          .print-button {
            display: none;
          }
          .watermark-container {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            height: 100vh !important;
            min-height: 297mm !important;
          }
          .watermark {
            font-size: 20px !important;
          }
        }
        body {
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 9px;
          line-height: 1.2;
          color: #000;
          padding: 10px;
          position: relative;
          min-height: 100vh;
          overflow-x: hidden;
        }
        .print-content {
          display: block;
          max-width: 100%;
          position: relative;
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
          border: 2px solid #000;
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
          gap: 6px;
          margin-bottom: 10px;
          justify-content: space-between;
        }
        .table-column {
          flex: 1;
          min-width: 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          border: 2px solid #000;
          table-layout: fixed;
        }
        th {
          border: 1px solid #000;
          padding: ${isCompactMode ? '3px 2px' : '4px 3px'};
          background-color: #475569;
          color: white;
          font-weight: bold;
          font-size: ${isCompactMode ? '7px' : '8px'};
        }
        td {
          border: 1px solid #000;
          padding: ${isCompactMode ? '3px 2px' : '4px 3px'};
          font-size: ${isCompactMode ? '6px' : '7px'};
          height: ${isCompactMode ? '18px' : '22px'};
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          vertical-align: middle;
        }
        td:first-child {
          white-space: normal;
          word-break: break-word;
          line-height: 1.15;
        }
        .row-alternate {
          background-color: #f7fafc;
        }
        .total-section {
          margin-top: 10px;
          padding: 8px;
          background-color: #f8fafc;
          border-radius: 4px;
          border: 2px solid #000;
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
          border: 2px solid #000;
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
        .watermark-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          width: 100%;
          height: 100vh;
          z-index: -1;
          pointer-events: none;
          user-select: none;
          overflow: visible;
        }
        .watermark {
          position: absolute;
          font-size: 24px;
          font-weight: bold;
          color: rgba(0, 0, 0, 0.12);
          white-space: nowrap;
          transform: translate(-50%, -50%) rotate(-45deg);
        }
        @media screen and (max-width: 767px) {
          .watermark {
            font-size: 16px;
          }
        }
      </style>
    </head>
    <body>
      <div class="watermark-container">
        ${(() => {
          // 透かしをvw単位で等間隔に配置（画面幅に応じて柔軟に対応）
          const watermarks = [];
          const rows = 8; // 縦方向の繰り返し数
          const spacing = 25; // 透かし間の間隔（vw単位）

          for (let row = 0; row < rows; row++) {
            // 横方向は0vwから始めて、spacing間隔で配置
            for (let colVw = 0; colVw <= 100; colVw += spacing) {
              const top = (row * (100 / (rows - 1))) + (Math.floor(colVw / spacing) % 2 === 0 ? 0 : 5);
              watermarks.push(`<div class="watermark" style="top: ${top}%; left: ${colVw}vw;">株式会社　櫻建</div>`);
            }
          }

          return watermarks.join('');
        })()}
      </div>
      <button class="print-button" onclick="window.print()">印刷 / PDFに保存</button>

      <div class="print-content">
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
        <div class="table-column">
          <table>
            <thead>
              <tr>
                <th style="text-align: left; width: 42%;">資材名</th>
                <th style="text-align: right; width: 18%;">数量</th>
                <th style="text-align: right; width: 20%;">単重</th>
                <th style="text-align: right; width: 20%;">合計</th>
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
        </div>`).join('')}
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
      </div>
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