import { OrderDocument } from '@/types/material-order';
import { formatWeight, formatTotalWeight } from '@/lib/utils/format';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

export const generatePDFContent = (data: OrderDocument): string => {
  // 1列に30個固定
  const itemsPerColumn = 30;

  // A4の高さから使用可能な高さを計算
  const a4HeightPx = 1063; // A4縦の高さ（96dpi換算）
  const headerFooterHeight = 300; // ヘッダー・情報・合計・備考の高さ
  const availableHeight = a4HeightPx - headerFooterHeight; // 826px

  // 1列30個で固定行高を計算
  const rowHeight = Math.floor(availableHeight / itemsPerColumn); // 826 ÷ 30 = 27px

  // アイテムを30個ずつ列に分割
  const columns: typeof data.items[] = [];
  for (let i = 0; i < data.items.length; i += itemsPerColumn) {
    columns.push(data.items.slice(i, i + itemsPerColumn));
  }

  // 最小2列を保証
  if (columns.length === 1 && data.items.length > 0) {
    const allItems = columns[0];
    const midPoint = Math.ceil(allItems.length / 2);
    columns[0] = allItems.slice(0, midPoint);
    columns.push(allItems.slice(midPoint));
  }

  // 3列ごとにページを分ける
  const pages: typeof columns[] = [];
  for (let i = 0; i < columns.length; i += 3) {
    pages.push(columns.slice(i, i + 3));
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
            width: 100vw !important;
            height: 100vh !important;
            min-height: 297mm !important;
          }
          .watermark {
            font-size: 20px !important;
          }
          body {
            overflow-x: visible !important;
          }
        }
        body {
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 9px;
          line-height: 1.2;
          color: #000;
          padding: 6px;
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
          margin-bottom: 4px;
        }
        .title h1 {
          font-size: 18px;
          font-weight: bold;
          margin: 0 0 3px 0;
          border-bottom: 1px solid #333;
          padding-bottom: 3px;
        }
        .info-section {
          margin-bottom: 5px;
          padding: 6px;
          background-color: #f8fafc;
          border: 2px solid #000;
          border-radius: 4px;
        }
        .info-row {
          margin-bottom: 2px;
          font-size: 13px;
        }
        .info-label {
          font-weight: bold;
          min-width: 60px;
          display: inline-block;
          font-size: 13px;
        }
        .tables-container {
          display: flex;
          gap: 6px;
          margin-bottom: 5px;
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
          padding: 3px 2px;
          background-color: #475569;
          color: white;
          font-weight: bold;
          font-size: 8px;
        }
        td {
          border: 1px solid #000;
          padding: 3px 2px;
          height: ${rowHeight}px;
          vertical-align: middle;
          line-height: 1.3;
        }
        .row-alternate {
          background-color: #f7fafc;
        }
        .total-section {
          margin-top: 5px;
          padding: 6px;
          background-color: #f8fafc;
          border-radius: 4px;
          border: 2px solid #000;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .total-label {
          font-size: 14px;
          font-weight: bold;
          color: #1a1a1a;
        }
        .total-value {
          font-size: 15px;
          font-weight: bold;
          color: #1e293b;
        }
        .note-section {
          margin-top: 5px;
          padding: 6px;
          background-color: #f8fafc;
          border-radius: 4px;
          border: 2px solid #000;
        }
        .note-label {
          font-size: 13px;
          font-weight: bold;
          color: #333;
          margin-bottom: 3px;
        }
        .note-text {
          font-size: 12px;
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
        .page-break {
          page-break-after: always;
        }
        .watermark-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
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
          // 透かしをvw単位で等間隔に配置（画面幅に対する絶対位置）
          const watermarks = [];
          const rows = 8; // 縦方向の繰り返し数
          const spacingVw = 25; // 透かし間の間隔（vw単位）

          for (let row = 0; row < rows; row++) {
            // 横方向は0vwから始めて、spacingVw間隔で配置
            for (let colVw = 0; colVw <= 100; colVw += spacingVw) {
              const top = (row * (100 / (rows - 1))) + (Math.floor(colVw / spacingVw) % 2 === 0 ? 0 : 5);
              watermarks.push(`<div class="watermark" style="top: ${top}%; left: ${colVw}vw;">建設テックパートナー</div>`);
            }
          }

          return watermarks.join('');
        })()}
      </div>
      <button class="print-button" onclick="window.print()">印刷 / PDFに保存</button>

      ${pages.map((pageColumns, pageIndex) => `
      <div class="print-content ${pageIndex < pages.length - 1 ? 'page-break' : ''}">
        <div class="title">
          <h1>資材発注書${pages.length > 1 ? ` (${pageIndex + 1}/${pages.length})` : ''}</h1>
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
          ${pageColumns.map((columnItems) => `
          <div class="table-column">
            <table>
              <thead>
                <tr>
                  <th style="text-align: left; width: 55%;">資材名</th>
                  <th style="text-align: right; width: 10%;">数量</th>
                  <th style="text-align: right; width: 15%;">単重</th>
                  <th style="text-align: right; width: 20%;">合計</th>
                </tr>
              </thead>
              <tbody>
                ${columnItems.map((item, index) => {
                  // 文字数に応じてフォントサイズを調整（行の高さは固定）
                  const nameLength = item.name.length;
                  const fontSize = nameLength > 15 ? '7px' : '8px';
                  return `
                <tr ${index % 2 === 1 ? 'class="row-alternate"' : ''}>
                  <td style="font-weight: bold; font-size: ${fontSize}; white-space: normal; line-height: 1.3;">${item.name}</td>
                  <td style="text-align: right; font-weight: bold; font-size: 9px;">${item.quantity}</td>
                  <td style="text-align: right; font-size: 8px;">${formatWeight(item.weightPerUnit).replace('kg', '')}</td>
                  <td style="text-align: right; font-weight: bold; font-size: 9px;">${formatWeight(item.totalWeight).replace('kg', '')}</td>
                </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>`).join('')}
        </div>` : ''}

        ${pageIndex === pages.length - 1 ? `
        <div class="total-section">
          <span class="total-label">合計重量:</span>
          <span class="total-value">${formatTotalWeight(data.totalWeight)}</span>
        </div>

        ${data.note ? `
        <div class="note-section">
          <div class="note-label">備考:</div>
          <div class="note-text">${data.note}</div>
        </div>` : ''}` : ''}
      </div>`).join('')}
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