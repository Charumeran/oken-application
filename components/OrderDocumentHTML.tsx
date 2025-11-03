import { OrderDocument } from '@/types/material-order';
import { formatWeight, formatTotalWeight } from '@/lib/utils/format';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

export const generatePDFContent = (data: OrderDocument, options?: { hidePrintButton?: boolean }): string => {
  // 1列に30個固定
  const itemsPerColumn = 30;

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
      <meta name="apple-mobile-web-app-capable" content="yes">
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
            margin: 0;
          }
          html, body {
            width: 100% !important;
            height: 100svh !important;
            overflow: visible !important;
          }
          body {
            margin: 0 !important;
            padding: 0 !important;
            position: relative;
          }
          .print-button {
            display: none !important;
          }
          .watermark-container {
            position: fixed !important;
            width: 100% !important;
            height: 100svh !important;
          }
          .watermark {
            font-size: 10pt !important;
          }
          .print-content {
            position: relative !important;
            padding: 8mm 0;
            width: 100% !important;
            max-width: 100% !important;
            overflow: hidden !important;
            transform: scale(0.85);
            transform-origin: center top;
          }
          .tables-container {
            width: 100% !important;
          }
          table {
            font-size: 5pt !important;
            line-height: 1.2 !important;
          }
          th {
            font-size: 6pt !important;
            padding: 2pt !important;
            line-height: 1.2 !important;
          }
          td {
            font-size: 5pt !important;
            padding: 2pt 1.5pt !important;
            height: 17pt !important;
            line-height: 1.2 !important;
          }
          .title h1 {
            font-size: 11pt !important;
            line-height: 1.2 !important;
          }
          .info-row {
            font-size: 8pt !important;
            line-height: 1.3 !important;
          }
          .info-label {
            font-size: 8pt !important;
            line-height: 1.3 !important;
          }
          .total-label {
            font-size: 8.5pt !important;
            line-height: 1.3 !important;
          }
          .total-value {
            font-size: 9pt !important;
            line-height: 1.3 !important;
          }
          .note-label {
            font-size: 8pt !important;
            line-height: 1.3 !important;
          }
          .note-text {
            font-size: 7pt !important;
            line-height: 1.3 !important;
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
          width: 100%;
          overflow: hidden;
        }
        .table-column {
          flex: 1;
          min-width: 0;
          overflow: hidden;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          border: 2px solid #000;
          table-layout: fixed;
          overflow: hidden;
        }
        th {
          border: 1px solid #000;
          padding: 3px 2px;
          background-color: #475569;
          color: white;
          font-weight: bold;
          font-size: 10px;
          word-break: break-word;
          overflow-wrap: break-word;
        }
        td {
          border: 1px solid #000;
          padding: 3px 2px;
          height: auto;
          vertical-align: middle;
          line-height: 1.3;
          word-break: break-word;
          overflow-wrap: break-word;
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
          font-size: 18px;
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
      ${!options?.hidePrintButton ? '<button class="print-button" onclick="window.print()">印刷 / PDFに保存</button>' : ''}

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
                  <th style="text-align: left; width: 50%;">資材名</th>
                  <th style="text-align: right; width: 15%;">数量</th>
                  <th style="text-align: right; width: 15%;">単重</th>
                  <th style="text-align: right; width: 20%;">合計</th>
                </tr>
              </thead>
              <tbody>
                ${columnItems.map((item, index) => {
                  return `
                <tr ${index % 2 === 1 ? 'class="row-alternate"' : ''}>
                  <td style="font-weight: bold; white-space: normal; line-height: 1.3;">${item.name}</td>
                  <td style="text-align: right; font-weight: bold;">${item.quantity}</td>
                  <td style="text-align: right;">${formatWeight(item.weightPerUnit).replace('kg', '')}</td>
                  <td style="text-align: right; font-weight: bold;">${formatWeight(item.totalWeight).replace('kg', '')}</td>
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
  // iframeを使ってポップアップブロックを回避
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.top = '0';
  iframe.style.left = '0';
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  iframe.style.zIndex = '9999';

  document.body.appendChild(iframe);

  const htmlContent = generatePDFContent(data);

  if (iframe.contentDocument) {
    iframe.contentDocument.open();
    iframe.contentDocument.write(htmlContent);
    iframe.contentDocument.close();

    // 印刷ダイアログが閉じられたらiframeを削除
    if (iframe.contentWindow) {
      iframe.contentWindow.onafterprint = () => {
        document.body.removeChild(iframe);
      };

      // 少し待ってから印刷ダイアログを開く（コンテンツの読み込みを待つ）
      setTimeout(() => {
        iframe.contentWindow?.print();
      }, 100);
    }
  }
};