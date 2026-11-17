import type { OrderRecord } from '../data/initialStoreData';

export interface ReceiptPrinterConfig {
  companyName?: string;
  legalName?: string;
  address?: string;
  phone?: string;
  taxOfficeAndNo?: string;
  taxRatePercent?: number;
  logoUrl?: string;
  stampTitle?: string;
  stampSubtitle?: string;
  headerNote?: string;
  footerMessage?: string;
  paperWidthMm?: 58 | 80;
  showLogo?: boolean;
  showStampBox?: boolean;
  templatePreset?: 'classic-thermal' | 'modern-minimal' | 'gaziantep-heritage' | 'kurumsal-efatura';
  accentColor?: string;
  fontFamily?: 'mono' | 'sans' | 'serif';
  borderStyle?: 'dashed' | 'solid' | 'double';
  showQrCode?: boolean;
  qrCodeUrl?: string;
  showBarcode?: boolean;
  showTaxBreakdown?: boolean;
  showWaiterAndTable?: boolean;
  showWifiInfo?: boolean;
  wifiSsid?: string;
  wifiPassword?: string;
  socialHandle?: string;
}

function escapeHtml(val: string | undefined): string {
  return String(val || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderSimulatedQrSvg(accentColor: string): string {
  return `<svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:4px auto;">
    <rect x="1" y="1" width="66" height="66" rx="4" fill="#FFFFFF" stroke="${accentColor}" stroke-width="2"/>
    <rect x="6" y="6" width="18" height="18" fill="#141413"/>
    <rect x="9" y="9" width="12" height="12" fill="#FFFFFF"/>
    <rect x="12" y="12" width="6" height="6" fill="#141413"/>
    <rect x="44" y="6" width="18" height="18" fill="#141413"/>
    <rect x="47" y="9" width="12" height="12" fill="#FFFFFF"/>
    <rect x="50" y="12" width="6" height="6" fill="#141413"/>
    <rect x="6" y="44" width="18" height="18" fill="#141413"/>
    <rect x="9" y="47" width="12" height="12" fill="#FFFFFF"/>
    <rect x="12" y="50" width="6" height="6" fill="#141413"/>
    <rect x="28" y="8" width="4" height="4" fill="#141413"/>
    <rect x="36" y="8" width="4" height="8" fill="#141413"/>
    <rect x="28" y="16" width="6" height="6" fill="${accentColor}"/>
    <rect x="28" y="26" width="12" height="12" rx="2" fill="#141413"/>
    <rect x="31" y="29" width="6" height="6" fill="${accentColor}"/>
    <rect x="8" y="28" width="14" height="4" fill="#141413"/>
    <rect x="44" y="28" width="6" height="10" fill="#141413"/>
    <rect x="54" y="30" width="8" height="6" fill="#141413"/>
    <rect x="28" y="44" width="6" height="6" fill="#141413"/>
    <rect x="38" y="44" width="10" height="4" fill="#141413"/>
    <rect x="52" y="44" width="10" height="10" fill="#141413"/>
    <rect x="55" y="47" width="4" height="4" fill="#FFFFFF"/>
    <rect x="28" y="54" width="18" height="6" fill="#141413"/>
  </svg>`;
}

function renderSimulatedBarcodeSvg(codeText: string): string {
  const bars = [2, 1, 3, 1, 2, 2, 1, 4, 1, 2, 1, 3, 2, 1, 1, 3, 2, 1, 2, 3, 1, 2];
  let x = 8;
  const rects = bars
    .map((w, idx) => {
      const el =
        idx % 2 === 0
          ? `<rect x="${x}" y="4" width="${w * 2}" height="26" fill="#141413"/>`
          : '';
      x += w * 2 + 2;
      return el;
    })
    .join('');
  return `<div style="text-align:center;margin-top:6px;">
    <svg width="180" height="34" viewBox="0 0 180 34" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto;">
      ${rects}
    </svg>
    <div style="font-size:9px;letter-spacing:2px;margin-top:1px;">${escapeHtml(codeText)}</div>
  </div>`;
}

export function buildThermalReceiptInnerMarkup(
  order: OrderRecord,
  config?: ReceiptPrinterConfig
): string {
  const companyName = config?.companyName || 'ÖZTİKE CİĞER · HALİL USTA';
  const legalName = config?.legalName || 'ÖzTike Ciğer Ocakbaşı Turizm Gıda Ltd. Şti.';
  const address = config?.address || 'Karagöz Mah. Şahinbey Cad. No: 42 Şahinbey / Gaziantep';
  const phone = config?.phone || '0 (555) 123 45 67';
  const taxOffice = config?.taxOfficeAndNo || 'Şahinbey V.D. · VKN: 6840912345';
  const taxRate = config?.taxRatePercent ?? 10;
  const logoUrl = config?.logoUrl || '/assets/aistudio/oztike-logo-transparent.png';
  const stampTitle = config?.stampTitle || 'ÖZTİKE CİĞER · KAŞE / İMZA';
  const stampSubtitle =
    config?.stampSubtitle || 'Halil Usta · Şahinbey / Gaziantep · e-ARŞİV ONAYLI';
  const headerNote =
    config?.headerNote || '1996’dan Beri Meşe Közünde Taze Kuzu Ciğeri';
  const footerMessage =
    config?.footerMessage || 'Afiyet Olsun · Bizi Tercih Ettiğiniz İçin Teşekkür Ederiz!';
  const showLogo = config?.showLogo !== false;
  const showStampBox = config?.showStampBox !== false;
  const templatePreset = config?.templatePreset || 'gaziantep-heritage';
  const accentColor = config?.accentColor || '#B86B35';
  const borderStyle = config?.borderStyle || 'dashed';
  const fontFamily =
    config?.fontFamily === 'sans'
      ? "'Plus Jakarta Sans', -apple-system, sans-serif"
      : config?.fontFamily === 'serif'
      ? "'Fraunces', Georgia, serif"
      : "'JetBrains Mono', 'Courier New', monospace";
  const showQrCode = config?.showQrCode !== false;
  const showBarcode = config?.showBarcode !== false;
  const showTaxBreakdown = config?.showTaxBreakdown !== false;
  const showWaiterAndTable = config?.showWaiterAndTable !== false;
  const showWifiInfo = config?.showWifiInfo !== false;
  const wifiSsid = config?.wifiSsid || 'OzTike_Misafir_5G';
  const wifiPassword = config?.wifiPassword || 'halilusta1996';
  const socialHandle = config?.socialHandle || '@oztikeciger · oztikeciger.com.tr';

  const presetBadge =
    templatePreset === 'kurumsal-efatura'
      ? 'GİB e-ARŞİV & ÖKC MALİ BELGE'
      : templatePreset === 'gaziantep-heritage'
      ? 'GAZİANTEP OCAKBAŞI GELENEĞİ · 1996'
      : templatePreset === 'modern-minimal'
      ? 'HIZLI ADİSYON & KASA FİŞİ'
      : 'STANDART TERMAL KASA FİŞİ';

  const itemsHtml = order.items
    .map((it) => {
      const ext = it as { selectedOptions?: string[]; customerNote?: string };
      return `
      <tr>
        <td style="padding:3px 0;vertical-align:top;">
          <div style="font-weight:700;">${it.quantity}x ${escapeHtml(it.productName)}</div>
          ${
            ext.selectedOptions && ext.selectedOptions.length > 0
              ? `<div style="font-size:10px;color:#555;">${escapeHtml(ext.selectedOptions.join(', '))}</div>`
              : ''
          }
          ${
            ext.customerNote
              ? `<div style="font-size:10px;color:#666;font-style:italic;">Not: ${escapeHtml(ext.customerNote)}</div>`
              : ''
          }
        </td>
        <td style="padding:3px 0;text-align:right;vertical-align:top;font-weight:700;white-space:nowrap;">
          ${(it.unitPrice * it.quantity).toFixed(2)} ₺
        </td>
      </tr>`;
    })
    .join('');

  const netBeforeTax = Math.max(0, order.totalAmount - order.taxAmount);

  return `
    <div class="receipt-sheet" style="font-family:${fontFamily};color:#141413;">
      <div style="text-align:center;border-bottom:1.5px ${borderStyle} ${accentColor};padding-bottom:8px;margin-bottom:8px;">
        <div style="display:inline-block;padding:2px 8px;border-radius:4px;background:${accentColor};color:#FFF;font-size:9px;font-weight:800;letter-spacing:0.6px;margin-bottom:5px;">
          ${escapeHtml(presetBadge)}
        </div>
        ${
          showLogo
            ? `<img src="${escapeHtml(logoUrl)}" alt="Logo" style="width:48px;height:48px;object-fit:contain;margin:0 auto 4px;display:block;" onerror="this.style.display='none'" />`
            : ''
        }
        <div style="font-size:14px;font-weight:800;letter-spacing:0.4px;color:${accentColor};">${escapeHtml(companyName)}</div>
        <div style="font-size:10px;font-weight:600;margin-top:2px;">${escapeHtml(legalName)}</div>
        <div style="font-size:10px;color:#333;margin-top:2px;">${escapeHtml(headerNote)}</div>
        <div style="font-size:10px;margin-top:3px;">${escapeHtml(address)}</div>
        <div style="font-size:10px;">Tel: ${escapeHtml(phone)}</div>
        <div style="font-size:10px;font-weight:600;">${escapeHtml(taxOffice)}</div>
      </div>

      <div style="font-size:11px;border-bottom:1px ${borderStyle} #666;padding-bottom:6px;margin-bottom:8px;line-height:1.45;">
        <div style="display:flex;justify-content:space-between;"><span>Fiş No:</span><strong>${escapeHtml(order.receiptNumber || 'FIS-2026-001')}</strong></div>
        <div style="display:flex;justify-content:space-between;"><span>e-Arşiv No:</span><strong>${escapeHtml(order.eInvoiceNo || 'OZT202600001')}</strong></div>
        <div style="display:flex;justify-content:space-between;"><span>Sipariş No:</span><strong>${escapeHtml(order.orderNumber)}</strong></div>
        ${
          showWaiterAndTable
            ? `<div style="display:flex;justify-content:space-between;"><span>Kanal / Masa:</span><strong>${escapeHtml(order.channel)} · ${escapeHtml(order.tableName)}</strong></div>
               <div style="display:flex;justify-content:space-between;"><span>Personel / Müşteri:</span><span>${escapeHtml(order.staffName || 'Kasa')} / ${escapeHtml(order.customerName)}</span></div>`
            : `<div style="display:flex;justify-content:space-between;"><span>Müşteri:</span><span>${escapeHtml(order.customerName)}</span></div>`
        }
        <div style="display:flex;justify-content:space-between;"><span>Tarih / Saat:</span><span>${escapeHtml(order.createdAt)}</span></div>
      </div>

      <table style="width:100%;border-collapse:collapse;font-size:11px;border-bottom:1px ${borderStyle} #666;margin-bottom:8px;">
        <thead>
          <tr style="border-bottom:1px solid #888;font-size:10px;text-transform:uppercase;">
            <th style="text-align:left;padding-bottom:3px;">Ürün / Açıklama</th>
            <th style="text-align:right;padding-bottom:3px;">Tutar</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="font-size:11px;line-height:1.5;border-bottom:1px ${borderStyle} #666;padding-bottom:6px;margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;"><span>Ara Toplam</span><span>${order.subtotal.toFixed(2)} ₺</span></div>
        ${
          order.discountAmount > 0
            ? `<div style="display:flex;justify-content:space-between;color:#15803d;font-weight:700;"><span>İndirim / Kampanya</span><span>-${order.discountAmount.toFixed(2)} ₺</span></div>`
            : ''
        }
        ${
          (order.deliveryFee || 0) > 0
            ? `<div style="display:flex;justify-content:space-between;"><span>Kurye Teslimat Ücreti</span><span>+${(order.deliveryFee || 0).toFixed(2)} ₺</span></div>`
            : ''
        }
        ${
          (order.tipAmount || 0) > 0
            ? `<div style="display:flex;justify-content:space-between;"><span>Garson / Servis Bahşişi</span><span>+${(order.tipAmount || 0).toFixed(2)} ₺</span></div>`
            : ''
        }
        <div style="display:flex;justify-content:space-between;"><span>KDV (%${taxRate})</span><span>${order.taxAmount.toFixed(2)} ₺</span></div>
        <div style="display:flex;justify-content:space-between;font-size:14px;font-weight:800;padding-top:4px;border-top:1.5px solid ${accentColor};margin-top:4px;color:${accentColor};">
          <span>GENEL TOPLAM</span>
          <span>${order.totalAmount.toFixed(2)} ₺</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:3px;font-size:10px;">
          <span>Ödeme Yöntemi:</span>
          <strong>${escapeHtml(order.paymentMethod || 'Nakit / POS')} (${escapeHtml(order.paymentStatus)})</strong>
        </div>
      </div>

      ${
        showTaxBreakdown
          ? `<div style="font-size:9px;border:1px solid #ccc;border-radius:4px;padding:4px 6px;margin-bottom:8px;background:#fff;">
              <div style="font-weight:700;margin-bottom:2px;color:#444;">KDV MATRAH DÖKÜMÜ</div>
              <div style="display:flex;justify-content:space-between;"><span>KDV Oranı: %${taxRate}</span><span>Matrah: ${netBeforeTax.toFixed(2)} ₺</span><span>KDV: ${order.taxAmount.toFixed(2)} ₺</span></div>
            </div>`
          : ''
      }

      ${
        showWifiInfo
          ? `<div style="font-size:9.5px;border:1px dashed ${accentColor};border-radius:5px;padding:4px 6px;margin-bottom:8px;text-align:center;background:#fff;">
              <strong>📶 MİSAFİR WI-FI:</strong> ${escapeHtml(wifiSsid)} · <strong>Şifre:</strong> ${escapeHtml(wifiPassword)}
            </div>`
          : ''
      }

      ${
        showStampBox
          ? `<div style="border:1.5px solid ${accentColor};border-radius:6px;padding:6px;text-align:center;margin-bottom:8px;">
              <div style="font-size:10px;font-weight:800;letter-spacing:0.4px;color:${accentColor};">${escapeHtml(stampTitle)}</div>
              <div style="font-size:9px;color:#333;margin-top:2px;">${escapeHtml(stampSubtitle)}</div>
            </div>`
          : ''
      }

      ${
        showQrCode
          ? `<div style="text-align:center;margin-bottom:6px;">
              ${renderSimulatedQrSvg(accentColor)}
              <div style="font-size:9px;color:#444;">e-Arşiv Doğrulama &amp; Dijital QR Menü</div>
            </div>`
          : ''
      }

      ${showBarcode ? renderSimulatedBarcodeSvg(order.receiptNumber || order.orderNumber) : ''}

      <div style="text-align:center;font-size:10px;color:#333;margin-top:6px;">
        <div style="font-weight:700;">${escapeHtml(footerMessage)}</div>
        ${
          socialHandle
            ? `<div style="font-size:9px;color:#555;margin-top:2px;">${escapeHtml(socialHandle)}</div>`
            : ''
        }
        <div style="font-size:9px;margin-top:3px;color:#666;">ÖzTike Restaurant OS · Termal Fiş &amp; e-Arşiv</div>
      </div>
    </div>
  `;
}

export function buildThermalReceiptHtml(
  order: OrderRecord,
  config?: ReceiptPrinterConfig
): string {
  const paperWidthMm = config?.paperWidthMm === 58 ? 58 : 80;
  const bodyMaxPx = paperWidthMm === 58 ? 220 : 302;
  const inner = buildThermalReceiptInnerMarkup(order, config);

  return `<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <title>Fiş #${escapeHtml(order.orderNumber)}</title>
  <style>
    @page { size: ${paperWidthMm}mm auto; margin: 3mm; }
    * { box-sizing: border-box; }
    body {
      font-family: 'Courier New', Courier, monospace;
      width: 100%;
      max-width: ${bodyMaxPx}px;
      margin: 0 auto;
      padding: 8px;
      color: #111;
      background: #fff;
    }
    @media print {
      body { max-width: 100%; padding: 0; }
    }
  </style>
</head>
<body>
  ${inner}
</body>
</html>`;
}

export function printThermalReceipt(
  order: OrderRecord,
  config?: ReceiptPrinterConfig
): boolean {
  if (typeof document === 'undefined' || typeof window === 'undefined') return false;

  const cleanup = () => {
    const oldFrame = document.getElementById('oztike-thermal-print-frame');
    if (oldFrame && oldFrame.parentNode) oldFrame.parentNode.removeChild(oldFrame);
    const oldStyle = document.getElementById('oztike-direct-print-style');
    if (oldStyle && oldStyle.parentNode) oldStyle.parentNode.removeChild(oldStyle);
    const oldHost = document.getElementById('oztike-direct-print-host');
    if (oldHost && oldHost.parentNode) oldHost.parentNode.removeChild(oldHost);
  };

  try {
    cleanup();

    const paperWidthMm = config?.paperWidthMm === 58 ? 58 : 80;
    const bodyMaxPx = paperWidthMm === 58 ? 220 : 302;
    const fontFamilyCss =
      config?.fontFamily === 'sans'
        ? "'Inter', 'Helvetica Neue', Arial, sans-serif"
        : config?.fontFamily === 'serif'
        ? "'Georgia', 'Times New Roman', serif"
        : "'JetBrains Mono', 'Courier New', monospace";

    const styleEl = document.createElement('style');
    styleEl.id = 'oztike-direct-print-style';
    styleEl.textContent = `
      @page { margin: 4mm; }
      @media screen { #oztike-direct-print-host { display: none !important; } }
      @media print {
        html, body { background: #fff !important; color: #111 !important; margin: 0 !important; padding: 0 !important; }
        body > *:not(#oztike-direct-print-host) { display: none !important; }
        #oztike-direct-print-host {
          display: block !important;
          width: 100%;
          max-width: ${bodyMaxPx}px;
          margin: 0 auto;
          padding: 6px;
          background: #fff;
          color: #111;
          font-family: ${fontFamilyCss};
        }
      }
    `;

    const hostEl = document.createElement('div');
    hostEl.id = 'oztike-direct-print-host';
    hostEl.innerHTML = buildThermalReceiptInnerMarkup(order, config);
    document.head.appendChild(styleEl);
    document.body.appendChild(hostEl);

    const onAfterPrint = () => {
      window.removeEventListener('afterprint', onAfterPrint);
      cleanup();
    };
    window.addEventListener('afterprint', onAfterPrint);
    setTimeout(cleanup, 30000);

    window.focus();
    window.print();
    return true;
  } catch {
    cleanup();
    return false;
  }
}

export function downloadThermalReceiptHtml(
  order: OrderRecord,
  config?: ReceiptPrinterConfig
): void {
  if (typeof document === 'undefined') return;
  const html = buildThermalReceiptHtml(order, config);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fis-${order.orderNumber.toLowerCase()}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
