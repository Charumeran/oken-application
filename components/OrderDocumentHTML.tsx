import { OrderDocument } from '@/types/material-order';

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

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>発注書_${data.ordererName}_${new Date().toISOString().split('T')[0]}</title>
      <style>
        @media print {
          @page {
            size: A4;
            margin: 20mm;
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
          margin-bottom: 30px;
        }
        .title h1 {
          font-size: 28px;
          font-weight: bold;
          margin: 0 0 20px 0;
          border-bottom: 2px solid #333;
          padding-bottom: 10px;
        }
        .info-section {
          margin-bottom: 30px;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 5px;
        }
        .info-row {
          margin-bottom: 8px;
        }
        .info-label {
          font-weight: bold;
          min-width: 100px;
          display: inline-block;
        }
        .table-container {
          margin-bottom: 25px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid #333;
        }
        th {
          border: 1px solid #333;
          padding: 12px;
          background-color: #2d3748;
          color: white;
          font-weight: bold;
          font-size: 11px;
        }
        td {
          border: 1px solid #e2e8f0;
          padding: 10px;
          font-size: 10px;
        }
        .row-alternate {
          background-color: #f7fafc;
        }
        .total-section {
          margin-top: 20px;
          padding: 15px;
          background-color: #e6f3ff;
          border-radius: 5px;
          border: 1px solid #2563eb;
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
          color: #2563eb;
        }
        .note-section {
          margin-top: 25px;
          padding: 15px;
          background-color: #fffbeb;
          border-radius: 5px;
          border: 1px solid #f59e0b;
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
          background: #2563eb;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          font-size: 14px;
          cursor: pointer;
          margin-bottom: 20px;
        }
        @media print {
          .print-button { display: none; }
        }
      </style>
    </head>
    <body>
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
          <span class="info-label">発注者:</span>
          <span>${data.ordererName}</span>
        </div>
        ${data.siteName ? `
        <div class="info-row">
          <span class="info-label">現場名:</span>
          <span>${data.siteName}</span>
        </div>` : ''}
      </div>
      
      ${data.items.length > 0 ? `
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th style="width: 40%; text-align: left;">資材名</th>
              <th style="width: 12%; text-align: center;">単位</th>
              <th style="width: 12%; text-align: right;">数量</th>
              <th style="width: 16%; text-align: right;">単位重量(kg)</th>
              <th style="width: 20%; text-align: right;">合計重量(kg)</th>
            </tr>
          </thead>
          <tbody>
            ${data.items.map((item, index) => `
            <tr ${index % 2 === 1 ? 'class="row-alternate"' : ''}>
              <td style="font-weight: bold;">${item.name}</td>
              <td style="text-align: center;">${item.unit}</td>
              <td style="text-align: right; font-weight: bold;">${item.quantity}</td>
              <td style="text-align: right;">${item.weightPerUnit.toFixed(1)}</td>
              <td style="text-align: right; font-weight: bold;">${item.totalWeight.toFixed(1)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>` : ''}
      
      <div class="total-section">
        <span class="total-label">合計重量:</span>
        <span class="total-value">${data.totalWeight.toFixed(1)} kg</span>
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