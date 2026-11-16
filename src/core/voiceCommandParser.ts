/**
 * ÖzTike POS Kasa Terminali Sesli Komut Çözümleyici (Web Speech API Parser)
 * Restoran kasa personelinin söylediği Türkçe sesli komutları niyet (intent)
 * ve parametrelere dönüştürür.
 */

export type VoiceIntentType =
  | 'SHOW_OPEN_TICKETS'
  | 'PRINT_LAST_RECEIPT'
  | 'SELECT_TABLE'
  | 'SELECT_FAST_SALE'
  | 'SELECT_PAYMENT_METHOD'
  | 'CONFIRM_PAYMENT'
  | 'CLEAR_CART'
  | 'APPLY_DISCOUNT'
  | 'FILTER_CATEGORY'
  | 'UNKNOWN';

export interface VoiceCommandResult {
  intent: VoiceIntentType;
  rawText: string;
  normalizedText: string;
  tableNumber?: string;
  tableId?: string;
  paymentMethod?: string;
  discountPercent?: number;
  categoryFilter?: string;
  feedbackMessage: string;
}

const TURKISH_NUMBERS: [string, string][] = [
  ['on iki', '12'],
  ['on bir', '11'],
  ['on', '10'],
  ['dokuz', '9'],
  ['sekiz', '8'],
  ['yedi', '7'],
  ['altı', '6'],
  ['beş', '5'],
  ['dört', '4'],
  ['üç', '3'],
  ['iki', '2'],
  ['bir', '1'],
];

export function normalizeTurkishText(text: string): string {
  if (!text) return '';
  return text
    .toLocaleLowerCase('tr-TR')
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parsePOSVoiceCommand(rawTranscript: string): VoiceCommandResult {
  const norm = normalizeTurkishText(rawTranscript);

  // 1. Açık Adisyonları Göster
  if (
    norm.includes('açık adisyon') ||
    norm.includes('açık sipariş') ||
    norm.includes('açık masa') ||
    norm.includes('adisyonları göster') ||
    norm.includes('bekleyen sipariş') ||
    norm.includes('tüm adisyon') ||
    norm.includes('adisyon listesi')
  ) {
    return {
      intent: 'SHOW_OPEN_TICKETS',
      rawText: rawTranscript,
      normalizedText: norm,
      feedbackMessage: 'Açık adisyonlar ve aktif masa siparişleri listelendi.',
    };
  }

  // 2. Son Fişi Yazdır / Fatura
  if (
    norm.includes('son fiş') ||
    norm.includes('fişi yazdır') ||
    norm.includes('fiş yazdır') ||
    norm.includes('fatura yazdır') ||
    norm.includes('faturayı yazdır') ||
    norm.includes('adisyon yazdır') ||
    norm.includes('makbuz yazdır') ||
    norm.includes('fiş çıkar')
  ) {
    return {
      intent: 'PRINT_LAST_RECEIPT',
      rawText: rawTranscript,
      normalizedText: norm,
      feedbackMessage: 'Son siparişin fiş ve e-arşiv önizlemesi hazırlanıyor.',
    };
  }

  // 3. Hızlı Satış / Tezgah Satışı
  if (
    norm.includes('hızlı satış') ||
    norm.includes('tezgah') ||
    norm.includes('paket satış') ||
    norm.includes('yeni adisyon') ||
    norm.includes('yeni satış')
  ) {
    return {
      intent: 'SELECT_FAST_SALE',
      rawText: rawTranscript,
      normalizedText: norm,
      feedbackMessage: 'Hızlı satış (Tezgah/Paket) modu seçildi.',
    };
  }

  // 4. Masa Seçimi (Örn: "Masa 3", "Masa üç", "Masa 05", "Üçüncü masa")
  const tableMatch = norm.match(/(?:masa|masaya)\s+([a-z0-9çğıöşü\s]+)/i);
  if (tableMatch && tableMatch[1]) {
    let rawVal = tableMatch[1].trim();
    for (const [word, digit] of TURKISH_NUMBERS) {
      if (rawVal === word || rawVal.startsWith(word + ' ')) {
        rawVal = digit;
        break;
      }
    }
    const cleanNum = rawVal.replace(/\D/g, '');
    if (cleanNum) {
      const formatted = `Masa ${cleanNum.padStart(2, '0')}`;
      return {
        intent: 'SELECT_TABLE',
        rawText: rawTranscript,
        normalizedText: norm,
        tableNumber: formatted,
        feedbackMessage: `${formatted} seçildi ve adisyonu ekrana getirildi.`,
      };
    }
  }

  // 5. Ödeme Yöntemi Seçimi
  if (norm.includes('nakit')) {
    return {
      intent: 'SELECT_PAYMENT_METHOD',
      rawText: rawTranscript,
      normalizedText: norm,
      paymentMethod: 'Nakit',
      feedbackMessage: 'Ödeme yöntemi Nakit olarak ayarlandı.',
    };
  }
  if (
    norm.includes('kredi kart') ||
    norm.includes('fiziksel pos') ||
    norm.includes('kartla') ||
    norm.includes('pos cihazı') ||
    (norm.includes('kart') && !norm.includes('yemek'))
  ) {
    return {
      intent: 'SELECT_PAYMENT_METHOD',
      rawText: rawTranscript,
      normalizedText: norm,
      paymentMethod: 'Fiziksel POS',
      feedbackMessage: 'Ödeme yöntemi Fiziksel POS olarak ayarlandı.',
    };
  }
  if (
    norm.includes('yemek kartı') ||
    norm.includes('multinet') ||
    norm.includes('sodexo') ||
    norm.includes('pluxee') ||
    norm.includes('edenred') ||
    norm.includes('setcard')
  ) {
    return {
      intent: 'SELECT_PAYMENT_METHOD',
      rawText: rawTranscript,
      normalizedText: norm,
      paymentMethod: 'Yemek Kartı',
      feedbackMessage: 'Ödeme yöntemi Yemek Kartı olarak ayarlandı.',
    };
  }
  if (norm.includes('iyzico')) {
    return {
      intent: 'SELECT_PAYMENT_METHOD',
      rawText: rawTranscript,
      normalizedText: norm,
      paymentMethod: 'iyzico (Test Modu)',
      feedbackMessage: 'Ödeme yöntemi iyzico olarak ayarlandı.',
    };
  }
  if (norm.includes('paytr')) {
    return {
      intent: 'SELECT_PAYMENT_METHOD',
      rawText: rawTranscript,
      normalizedText: norm,
      paymentMethod: 'PayTR (Test Modu)',
      feedbackMessage: 'Ödeme yöntemi PayTR olarak ayarlandı.',
    };
  }
  if (norm.includes('havale') || norm.includes('eft')) {
    return {
      intent: 'SELECT_PAYMENT_METHOD',
      rawText: rawTranscript,
      normalizedText: norm,
      paymentMethod: 'Banka Havalesi',
      feedbackMessage: 'Ödeme yöntemi Banka Havalesi olarak ayarlandı.',
    };
  }

  // 6. Tahsilatı Onayla / Hesabı Kapat
  if (
    norm.includes('tahsilatı onayla') ||
    norm.includes('tahsil et') ||
    norm.includes('ödemeyi al') ||
    norm.includes('hesabı kapat') ||
    norm.includes('satışı tamamla') ||
    norm.includes('hesap al')
  ) {
    return {
      intent: 'CONFIRM_PAYMENT',
      rawText: rawTranscript,
      normalizedText: norm,
      feedbackMessage: 'Tahsilat onaylandı ve işlem tamamlandı.',
    };
  }

  // 7. Sepeti / Adisyonu Temizle
  if (
    norm.includes('sepeti temizle') ||
    norm.includes('adisyonu temizle') ||
    norm.includes('sepeti sıfırla') ||
    norm.includes('sepeti boşalt')
  ) {
    return {
      intent: 'CLEAR_CART',
      rawText: rawTranscript,
      normalizedText: norm,
      feedbackMessage: 'POS sepeti ve kalemler temizlendi.',
    };
  }

  // 8. İndirim Uygula (Örn: "Yüzde on indirim", "Yüzde 10 indirim")
  const discountMatch = norm.match(/yüzde\s+(\d+|on|yirmi|otuz|elli|kırk|on beş)/i);
  if (discountMatch && discountMatch[1]) {
    const rawDisc = discountMatch[1].trim();
    let discVal = 10;
    if (rawDisc === 'on') discVal = 10;
    else if (rawDisc === 'on beş') discVal = 15;
    else if (rawDisc === 'yirmi') discVal = 20;
    else if (rawDisc === 'otuz') discVal = 30;
    else if (rawDisc === 'kırk') discVal = 40;
    else if (rawDisc === 'elli') discVal = 50;
    else {
      const parsed = parseInt(rawDisc, 10);
      if (!isNaN(parsed) && parsed > 0 && parsed <= 50) {
        discVal = parsed;
      }
    }
    return {
      intent: 'APPLY_DISCOUNT',
      rawText: rawTranscript,
      normalizedText: norm,
      discountPercent: discVal,
      feedbackMessage: `%${discVal} yetkili iskonto uygulandı.`,
    };
  }

  // 9. Kategori Filtreleme
  if (norm.includes('kebap')) {
    return {
      intent: 'FILTER_CATEGORY',
      rawText: rawTranscript,
      normalizedText: norm,
      categoryFilter: 'CAT-02',
      feedbackMessage: 'Kebaplar kategorisi filtrelendi.',
    };
  }
  if (norm.includes('ciğer')) {
    return {
      intent: 'FILTER_CATEGORY',
      rawText: rawTranscript,
      normalizedText: norm,
      categoryFilter: 'CAT-01',
      feedbackMessage: 'Ciğerler kategorisi filtrelendi.',
    };
  }
  if (norm.includes('içecek')) {
    return {
      intent: 'FILTER_CATEGORY',
      rawText: rawTranscript,
      normalizedText: norm,
      categoryFilter: 'CAT-07',
      feedbackMessage: 'İçecekler kategorisi filtrelendi.',
    };
  }
  if (norm.includes('tüm ürün') || norm.includes('tüm menü')) {
    return {
      intent: 'FILTER_CATEGORY',
      rawText: rawTranscript,
      normalizedText: norm,
      categoryFilter: 'ALL',
      feedbackMessage: 'Tüm menü kategorileri listelendi.',
    };
  }

  return {
    intent: 'UNKNOWN',
    rawText: rawTranscript,
    normalizedText: norm,
    feedbackMessage: `Komut anlaşılamadı ("${rawTranscript}"). 'Açık adisyonları göster', 'Son fişi yazdır', 'Masa 3' veya 'Nakit' diyebilirsiniz.`,
  };
}
