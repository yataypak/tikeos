import type { OrderRecord } from '../data/initialStoreData';

export interface ReceiptPrinterConfig {
  companyName?: string;
  legalName?: string;
  address?: string;
  phone?: string;
  taxOfficeAndNo?: string;
  stampTitle?: string;
  stampSubtitle?: string;
  headerNote?: string;
  footerMessage?: string;
  paperWidthMm?: 58 | 80;
  showLogo?: boolean;
  showStampBox?: boolean;
  taxRatePercent?: number;
  logoUrl?: string;
}

function escapeHtml(raw: string): string {
  return String(raw || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildThermalReceiptInnerMarkup(
  order: OrderRecord,
  config: ReceiptPrinterConfig = {}
): string {
  const company = config.companyName || 'ÖZTİKE CİĞER · HALİL USTA';
  const legalName = config.legalName || 'ÖzTike Ciğer Ocakbaşı Turizm Gıda Ltd. Şti.';
  const address = config.address || 'Karagöz Mah. Şahinbey Cad. No: 42 Şahinbey / Gaziantep';
  const phone = config.phone || '0 (555) 123 45 67';
  const taxInfo = config.taxOfficeAndNo || 'Şahinbey V.D. · VKN: 6840912345';
  const stampTitle = config.stampTitle || 'ÖZTİKE CİĞER · KAŞE / İMZA';
  const stampSubtitle = config.stampSubtitle || 'Halil Usta · Şahinbey / Gaziantep · MERSİS: 0684091234500014';
  const headerNote = config.headerNote || '1996’dan Beri Meşe Közünde Taze Kuzu Ciğeri';
  const footerMessage = config.footerMessage || 'Afiyet Olsun · ÖzTike Ciğer · Şahinbey / Gaziantep';
  const taxRate = typeof config.taxRatePercent === 'number' ? config.taxRatePercent : 10;
  const showLogo = config.showLogo !== false;
  const showStampBox = config.showStampBox !== false;
  const deliveryFee = Number(order.deliveryFee || 0);
  const tipAmount = Number(order.tipAmount || 0);
  const receiptNo = order.receiptNumber || `FIS-2026-${order.orderNumber.slice(-4)}`;
  const eInvoiceNo = order.eInvoiceNo || `OZT2026000${order.orderNumber.slice(-4)}`;
  const todayLabel = new Date().toLocaleDateString('tr-TR');

  const itemsHtml = order.items
    .map(
      (it) => `
      <tr>
        <td style="width:28px;font-weight:700;padding:3px 0;vertical-align:top;">${it.quantity}x</td>
        <td style="padding:3px 4px;vertical-align:top;">
          <div style="font-weight:700;">${escapeHtml(it.productName)}</div>
          ${it.options?.length ? `<div style="font-size:9.5px;color:#444;">${it.options.map((o) => escapeHtml(o.value)).join(', ')}</div>` : ''}
          ${it.customerNote ? `<div style="font-size:9.5px;color:#444;">Not: ${escapeHtml(it.customerNote)}</div>` : ''}
        </td>
        <td style="text-align:right;white-space:nowrap;font-weight:600;padding:3px 0;vertical-align:top;">${(it.unitPrice * it.quantity).toFixed(2)} ₺</td>
      </tr>`
    )
    .join('');

  return `
    <div style="text-align:center;">
      ${showLogo && config.logoUrl ? `<img src="${escapeHtml(config.logoUrl)}" alt="${escapeHtml(company)}" style="height:44px;width:auto;margin:0 auto 4px;display:block;object-fit:contain;" />` : ''}
      <div style="font-size:14px;font-weight:800;letter-spacing:0.4px;">${escapeHtml(company)}</div>
      <div style="font-size:9.5px;color:#333;font-weight:600;">${escapeHtml(legalName)}</div>
      ${headerNote ? `<div style="font-size:9.5px;color:#555;margin-top:2px;">${escapeHtml(headerNote)}</div>` : ''}
      <div style="font-size:10px;color:#333;margin-top:3px;">${escapeHtml(address)}</div>
      <div style="font-size:10px;color:#333;">Tel: ${escapeHtml(phone)} · ${escapeHtml(taxInfo)}</div>
    </div>
    <div style="border-top:1px dashed #333;margin:8px 0;"></div>
    <div style="font-size:10.5px;">
      <div style="display:flex;justify-content:space-between;margin:2px 0;"><span>Sipariş No:</span><strong>${escapeHtml(order.orderNumber)}</strong></div>
      <div style="display:flex;justify-content:space-between;margin:2px 0;"><span>Fiş No:</span><span>${escapeHtml(receiptNo)}</span></div>
      <div style="display:flex;justify-content:space-between;margin:2px 0;"><span>e-Arşiv No:</span><span>${escapeHtml(eInvoiceNo)}</span></div>
      <div style="display:flex;justify-content:space-between;margin:2px 0;"><span>Kanal / Masa:</span><span>${escapeHtml(order.channel)} · ${escapeHtml(order.tableName)}</span></div>
      <div style="display:flex;justify-content:space-between;margin:2px 0;"><span>Müşteri:</span><span>${escapeHtml(order.customerName)}</span></div>
      <div style="display:flex;justify-content:space-between;margin:2px 0;"><span>Tarih / Saat:</span><span>${escapeHtml(todayLabel)} ${escapeHtml(order.createdAt)}</span></div>
      ${order.deliveryAddress ? `<div style="font-size:10px;color:#333;margin-top:4px;"><strong>Teslimat:</strong> ${escapeHtml(order.deliveryAddress)}</div>` : ''}
    </div>
    <div style="border-top:1px dashed #333;margin:8px 0;"></div>
    <table style="width:100%;border-collapse:collapse;font-size:11px;">
      <tbody>${itemsHtml}</tbody>
    </table>
    <div style="border-top:1px dashed #333;margin:8px 0;"></div>
    <div style="font-size:11px;">
      <div style="display:flex;justify-content:space-between;margin:2px 0;"><span>Ara Toplam</span><span>${order.subtotal.toFixed(2)} ₺</span></div>
      ${order.discountAmount > 0 ? `<div style="display:flex;justify-content:space-between;margin:2px 0;"><span>Kampanya İndirimi</span><span>-${order.discountAmount.toFixed(2)} ₺</span></div>` : ''}
      <div style="display:flex;justify-content:space-between;margin:2px 0;"><span>KDV (%${taxRate})</span><span>+${order.taxAmount.toFixed(2)} ₺</span></div>
      ${deliveryFee > 0 ? `<div style="display:flex;justify-content:space-between;margin:2px 0;"><span>Kurye Teslimat Ücreti</span><span>+${deliveryFee.toFixed(2)} ₺</span></div>` : ''}
      ${tipAmount > 0 ? `<div style="display:flex;justify-content:space-between;margin:2px 0;"><span>Bahşiş</span><span>+${tipAmount.toFixed(2)} ₺</span></div>` : ''}
      <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:800;border-top:1.5px solid #111;padding-top:5px;margin-top:5px;">
        <span>GENEL TOPLAM</span>
        <span>${order.totalAmount.toFixed(2)} ₺</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:4px;font-size:10px;">
        <span>Ödeme:</span>
        <span>${escapeHtml(order.paymentMethod || 'Nakit / POS')} (${escapeHtml(order.paymentStatus)})</span>
      </div>
    </div>
    ${
      showStampBox
        ? `
      <div style="border:1.5px solid #222;padding:6px 8px;margin-top:10px;text-align:center;border-radius:4px;">
        <div style="font-size:10px;font-weight:800;letter-spacing:0.6px;">${escapeHtml(stampTitle)}</div>
        <div style="font-size:9px;color:#333;margin-top:2px;">${escapeHtml(stampSubtitle)}</div>
      </div>`
        : ''
    }
    <div style="border-top:1px dashed #333;margin:8px 0;"></div>
    <div style="text-align:center;color:#444;font-size:10px;">
      <div>${escapeHtml(footerMessage)}</div>
      <div style="margin-top:2px;">Mali Değeri Olan Bilgi Fişi &amp; GİB e-Arşiv Belgesi</div>
    </div>
  `;
}

export function buildThermalReceiptHtml(
  order: OrderRecord,
  config: ReceiptPrinterConfig = {}
): string {
  const widthMm = config.paperWidthMm === 58 ? 58 : 78;
  const receiptNo = order.receiptNumber || `FIS-2026-${order.orderNumber.slice(-4)}`;
  const inner = buildThermalReceiptInnerMarkup(order, config);

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <title>Fiş ${escapeHtml(receiptNo)} - ${escapeHtml(order.orderNumber)}</title>
  <style>
    @page { size: ${config.paperWidthMm === 58 ? '58mm' : '80mm'} auto; margin: 4mm; }
    * { box-sizing: border-box; }
    body {
      font-family: 'Courier New', Courier, monospace;
      color: #111;
      background: #fff;
      margin: 0 auto;
      padding: 10px 12px;
      width: ${widthMm}mm;
      max-width: 100%;
      font-size: 11px;
      line-height: 1.4;
    }
    @media print { .no-print { display: none !important; } }
  </style>
</head>
<body>
  ${inner}
</body>
</html>`;
}

/**
 * Güvenilir DOM Print-Sheet Yazdırma:
 * Sandbox/iframe kısıtlamalarından etkilenmemek için ana belgede #oztike-thermal-print-sheet oluşturur,
 * görsellerin yüklenmesini bekleyip window.print() tetikler ve yazdırma bitince temizler.
 */
export function printThermalReceipt(
  order: OrderRecord,
  config: ReceiptPrinterConfig = {}
): boolean {
  try {
    const existing = document.getElementById('oztike-thermal-print-sheet');
    if (existing) existing.remove();

    const widthMm = config.paperWidthMm === 58 ? '58mm' : '78mm';
    const sheet = document.createElement('div');
    sheet.id = 'oztike-thermal-print-sheet';
    sheet.style.maxWidth = widthMm;
    sheet.style.width = widthMm;
    sheet.innerHTML = buildThermalReceiptInnerMarkup(order, config);
    document.body.appendChild(sheet);

    const cleanup = () => {
      const node = document.getElementById('oztike-thermal-print-sheet');
      if (node) node.remove();
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);

    const imgs = Array.from(sheet.querySelectorAll('img'));
    const waitImages = Promise.all(
      imgs.map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete) return resolve();
            const timer = setTimeout(() => resolve(), 350);
            img.onload = () => {
              clearTimeout(timer);
              resolve();
            };
            img.onerror = () => {
              clearTimeout(timer);
              resolve();
            };
          })
      )
    );

    void waitImages.then(() => {
      try {
        window.print();
      } catch {
        // Fallback cleanup below
      }
      setTimeout(cleanup, 4000);
    });

    return true;
  } catch {
    return false;
  }
}

export function downloadThermalReceiptHtml(
  order: OrderRecord,
  config: ReceiptPrinterConfig = {}
): void {
  const html = buildThermalReceiptHtml(order, config);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Oztike-Fis-${order.orderNumber}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
