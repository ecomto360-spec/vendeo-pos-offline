import { Sale } from '../types';

export interface PrintableTicketData {
  id?: string;
  date: string;
  clientNom: string;
  items: {
    productId?: string;
    nom: string;
    prixUnitaire: number;
    quantite: number;
    total: number;
  }[];
  total: number;
  montantPaye?: number;
  reste?: number;
  methodePaiement?: string;
  session?: string;
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
  storeRc?: string;
  storeNif?: string;
}

/**
 * Robust printing utility for POS receipts that works reliably across:
 * - iframe sandboxes (AI Studio preview)
 * - popups
 * - thermal receipt printers (80mm & 58mm) and standard A4/A5
 * - direct hidden iframe or popup fallback
 */
export function printReceipt(data: PrintableTicketData) {
  const storeName = data.storeName || 'SUPERETTE / MAGASIN';
  const storePhone = data.storePhone || '0550 00 00 00';
  const saleId = data.id || `TKT-${Math.floor(100000 + Math.random() * 900000)}`;

  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 4px 0; font-weight: 600; font-size: 11px; max-width: 140px; word-break: break-word;">
          ${item.nom}
          <div style="font-size: 10px; color: #555; font-weight: normal;">
            ${item.quantite} x ${item.prixUnitaire.toFixed(2)} DA
          </div>
        </td>
        <td style="padding: 4px 0; text-align: right; font-weight: 700; font-size: 11px; white-space: nowrap;">
          ${item.total.toFixed(2)} DA
        </td>
      </tr>
    `
    )
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8" />
      <title>Ticket #${saleId}</title>
      <style>
        @page {
          size: 80mm auto;
          margin: 0;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: 'Courier New', Courier, monospace, -apple-system, BlinkMacSystemFont, sans-serif;
          background: #fff;
          color: #000;
          width: 80mm;
          max-width: 80mm;
          margin: 0 auto;
          padding: 10px 12px;
          font-size: 12px;
          line-height: 1.35;
        }
        .header {
          text-align: center;
          margin-bottom: 10px;
          padding-bottom: 8px;
          border-bottom: 1px dashed #000;
        }
        .header h1 {
          font-size: 15px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 2px;
        }
        .header p {
          font-size: 10px;
          color: #222;
        }
        .meta {
          font-size: 10px;
          margin-bottom: 8px;
          padding-bottom: 6px;
          border-bottom: 1px dashed #000;
        }
        .meta-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 8px;
        }
        th {
          border-bottom: 1px solid #000;
          padding: 4px 0;
          font-size: 10px;
          text-transform: uppercase;
        }
        .totals {
          border-top: 1px dashed #000;
          padding-top: 6px;
          margin-bottom: 10px;
        }
        .totals-row {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          margin-bottom: 3px;
        }
        .totals-row.main {
          font-size: 14px;
          font-weight: 900;
          border-top: 1px solid #000;
          border-bottom: 1px solid #000;
          padding: 5px 0;
          margin: 4px 0;
        }
        .footer {
          text-align: center;
          font-size: 10px;
          padding-top: 6px;
          border-top: 1px dashed #000;
          color: #333;
        }
        .barcode {
          margin: 8px auto 4px auto;
          font-family: 'Libre Barcode 39', monospace, sans-serif;
          font-size: 24px;
          letter-spacing: 3px;
          text-align: center;
        }
        @media print {
          body {
            width: 80mm;
            padding: 4mm;
          }
          .no-print {
            display: none !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${storeName}</h1>
        <p>Tél : ${storePhone}</p>
        <p>Vente & Distribution</p>
      </div>

      <div class="meta">
        <div class="meta-row">
          <span>Ticket N°:</span>
          <strong>#${saleId}</strong>
        </div>
        <div class="meta-row">
          <span>Date :</span>
          <span>${data.date}</span>
        </div>
        <div class="meta-row">
          <span>Client :</span>
          <strong>${data.clientNom || 'Client Comptoir'}</strong>
        </div>
        ${
          data.session
            ? `<div class="meta-row"><span>Caisse :</span><span>${data.session}</span></div>`
            : ''
        }
      </div>

      <table>
        <thead>
          <tr>
            <th style="text-align: left;">Article</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="totals">
        <div class="totals-row main">
          <span>TOTAL DÛ :</span>
          <span>${data.total.toFixed(2)} DA</span>
        </div>
        <div class="totals-row">
          <span>Mode de règlement :</span>
          <span style="text-transform: capitalize;">${data.methodePaiement || 'Espèces'}</span>
        </div>
        ${
          data.montantPaye !== undefined
            ? `<div class="totals-row"><span>Montant Reçu :</span><span>${data.montantPaye.toFixed(2)} DA</span></div>`
            : ''
        }
        ${
          data.reste !== undefined && data.reste > 0
            ? `<div class="totals-row" style="color: #c00; font-weight: bold;"><span>Reste à payer :</span><span>${data.reste.toFixed(2)} DA</span></div>`
            : ''
        }
        ${
          data.montantPaye && data.montantPaye > data.total
            ? `<div class="totals-row"><span>Monnaie Rendue :</span><span>${(data.montantPaye - data.total).toFixed(2)} DA</span></div>`
            : ''
        }
      </div>

      <div class="footer">
        <p>*** MERCI DE VOTRE VISITE ***</p>
        <p style="font-size: 9px; margin-top: 2px;">Conservez ce ticket pour tout échange ou réclamation</p>
        <div class="barcode">||| |||| || |||| |||</div>
      </div>
    </body>
    </html>
  `;

  // Strategy 1: Hidden iframe printing (Works inside embedded iframes and popups smoothly)
  try {
    let printIframe = document.getElementById('receipt-print-iframe') as HTMLIFrameElement | null;
    if (!printIframe) {
      printIframe = document.createElement('iframe');
      printIframe.id = 'receipt-print-iframe';
      printIframe.style.position = 'fixed';
      printIframe.style.right = '0';
      printIframe.style.bottom = '0';
      printIframe.style.width = '0';
      printIframe.style.height = '0';
      printIframe.style.border = '0';
      document.body.appendChild(printIframe);
    }

    const doc = printIframe.contentWindow?.document || printIframe.contentDocument;
    if (doc && printIframe.contentWindow) {
      doc.open();
      doc.write(htmlContent);
      doc.close();

      setTimeout(() => {
        try {
          printIframe?.contentWindow?.focus();
          printIframe?.contentWindow?.print();
        } catch {
          // Fallback to window.print if iframe print is blocked
          window.print();
        }
      }, 300);
      return;
    }
  } catch (err) {
    console.warn('Iframe print failed, falling back to window.print', err);
  }

  // Fallback to standard window.print
  window.print();
}
