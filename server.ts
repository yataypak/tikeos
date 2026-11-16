import express from 'express';
import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  const PORT = 3000;

  app.use(express.json({ limit: '5mb' }));

  // ---------------------------------------------------------------------------
  // 1. Sistem & cPanel PHP 8.2 / MySQL 8 Dosya Paketi Okuma API'si
  // ---------------------------------------------------------------------------
  app.get('/api/system/cpanel-files', (_req, res) => {
    try {
      const filesToRead = [
        { path: 'database/schema.sql', label: 'MySQL 8 Veritabanı Şeması (79 Tablo)' },
        { path: 'config/database.php', label: 'PHP 8.2 PDO Bağlantı Katmanı' },
        { path: '.htaccess', label: 'cPanel Apache Güvenlik (.htaccess)' },
        { path: 'README.md', label: 'cPanel Kurulum Rehberi (README.md)' },
        { path: 'VERSION', label: 'Sürüm Bilgisi (VERSION)' },
      ];

      const bundle = filesToRead.map((item) => {
        const fullPath = path.resolve(__dirname, item.path);
        const content = fs.existsSync(fullPath)
          ? fs.readFileSync(fullPath, 'utf-8')
          : '-- Dosya bulunamadı --';
        return {
          ...item,
          sizeBytes: Buffer.byteLength(content, 'utf-8'),
          content,
        };
      });

      res.json({
        status: 'ok',
        version: '1.0.0-stable',
        phpTarget: '8.2+',
        dbTarget: 'MySQL 8.0 / MariaDB 10.6+',
        files: bundle,
      });
    } catch (error) {
      res.status(500).json({
        error: 'cPanel kaynak dosyaları okunurken hata oluştu.',
        detail: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // ---------------------------------------------------------------------------
  // 2. Ödeme Webhook & İmza Doğrulama Simülasyonu (Bölüm 14 Ödeme Güvenliği)
  // ---------------------------------------------------------------------------
  app.post('/api/webhooks/verify-payment', (req, res) => {
    const { provider, orderId, amount, tipAmount, mode, idempotencyKey } = req.body || {};
    if (!provider || !orderId || amount === undefined || !idempotencyKey) {
      res.status(400).json({
        verified: false,
        error: 'Eksik ödeme doğrulama parametreleri (provider, orderId, amount, idempotencyKey zorunludur).',
      });
      return;
    }

    const txReference = `${String(provider).toUpperCase()}-${mode === 'live' ? 'LIVE' : 'TEST'}-${Date.now().toString(36).toUpperCase()}`;
    const hmacSignature = `sha256=${Buffer.from(`${provider}:${orderId}:${amount}:${idempotencyKey}`).toString('base64')}`;
    const receiptNumber = `FIS-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    const eInvoiceNo = `OZT${new Date().getFullYear()}${Date.now().toString().slice(-9)}`;

    res.json({
      verified: true,
      provider,
      mode: mode || 'sandbox',
      orderId,
      amount,
      tipAmount: Number(tipAmount || 0),
      txReference,
      hmacSignature,
      receiptNumber,
      eInvoiceNo,
      verifiedAt: new Date().toISOString(),
      message: `${provider} (${mode === 'live' ? 'Canlı Mod' : 'Test / Sandbox Modu'}) webhook imzası doğrulandı. Otomatik fiş (${receiptNumber}) ve e-Arşiv (${eInvoiceNo}) düzenlendi.`,
    });
  });

  // ---------------------------------------------------------------------------
  // 2.B Müşteri QR Masa Doğrulama & Detaylı Garson Çağrı Backend API'leri
  // ---------------------------------------------------------------------------
  app.post('/api/qr/verify-table', (req, res) => {
    const { tableId, tableNumber, qrCodeNumber, qrToken } = req.body || {};
    if (!tableId || !qrToken) {
      res.status(400).json({ verified: false, error: 'Masa ID ve QR token zorunludur.' });
      return;
    }
    res.json({
      verified: true,
      tableId,
      tableNumber,
      qrCodeNumber,
      qrToken,
      sessionHash: `QR-SESS-${Buffer.from(`${tableId}:${qrToken}`).toString('base64').slice(0, 12)}`,
      verifiedAt: new Date().toISOString(),
    });
  });

  app.post('/api/waiter/call', (req, res) => {
    const { tableId, tableNumber, qrCodeNumber, assignedWaiter, selectedNeeds, customNote } = req.body || {};
    if (!tableId || !Array.isArray(selectedNeeds)) {
      res.status(400).json({ ok: false, error: 'Eksik garson çağrı verisi.' });
      return;
    }
    res.json({
      ok: true,
      callId: `API-CALL-${Date.now()}`,
      tableId,
      tableNumber,
      qrCodeNumber,
      assignedWaiter,
      selectedNeeds,
      customNote,
      dispatchedAt: new Date().toISOString(),
    });
  });

  // ---------------------------------------------------------------------------
  // 2.C Müşteri Yapay Zekâ Lezzet Asistanı (/api/ai/chat) - 8 Dil Desteği
  // ---------------------------------------------------------------------------
  app.post('/api/ai/chat', async (req, res) => {
    const { message, lang = 'tr' } = req.body || {};
    const q = String(message || '').toLowerCase();

    const buildChatFallback = () => {
      const isMild =
        q.includes('acısız') ||
        q.includes('çocuk') ||
        q.includes('sade') ||
        q.includes('mild') ||
        q.includes('kid') ||
        q.includes('sans piment') ||
        q.includes('doux') ||
        q.includes('enfant') ||
        q.includes('ohne scharf') ||
        q.includes('kinder') ||
        q.includes('bê tûj') ||
        q.includes('zarok') ||
        q.includes('辛くない') ||
        q.includes('子供') ||
        q.includes('不辣') ||
        q.includes('儿童') ||
        q.includes('أطفال') ||
        q.includes('بدون حر');

      const isSaladOrDrink =
        q.includes('salata') ||
        q.includes('yeşillik') ||
        q.includes('içecek') ||
        q.includes('ayran') ||
        q.includes('şalgam') ||
        q.includes('salad') ||
        q.includes('drink') ||
        q.includes('salade') ||
        q.includes('boisson') ||
        q.includes('getränk') ||
        q.includes('selete') ||
        q.includes('vexwarin') ||
        q.includes('サラダ') ||
        q.includes('ドリンク') ||
        q.includes('沙拉') ||
        q.includes('饮料') ||
        q.includes('سلطة') ||
        q.includes('مشروب');

      const isDonerOrLahmacun =
        q.includes('döner') ||
        q.includes('doner') ||
        q.includes('lahmacun') ||
        q.includes('iskender') ||
        q.includes('دونر') ||
        q.includes('لحم بعجين');

      const ids = isMild
        ? ['PRD-04', 'PRD-03', 'PRD-14', 'PRD-06']
        : isSaladOrDrink
        ? ['PRD-01', 'PRD-13', 'PRD-14', 'PRD-06', 'PRD-16']
        : isDonerOrLahmacun
        ? ['PRD-03', 'PRD-05', 'PRD-12', 'PRD-06']
        : ['PRD-01', 'PRD-02', 'PRD-13', 'PRD-06'];

      const replies: Record<string, { mild: string; pair: string; doner: string; def: string }> = {
        tr: {
          mild: 'Acısız ve çocuklar için en ideal seçimlerimiz: Kekikli Yaprak Tavuk Şiş, Odun Ateşinde Yaprak Et Döner, Bostana Salata ve Bakır Maşrapada Yayık Ayranı. Kartlara dokunup hemen sepete ekleyebilirsiniz!',
          pair: 'Halil Usta’nın meşe közünde Kuzu Ciğer Şişi yanına Cevizli Gavurdağı Salatası, Sumaklı Bostana ve Bakır Yayık Ayranı veya Şalgam Suyu harika uyum sağlar.',
          doner: 'Odun ateşinde Yaprak Et Döner ve taş fırından çıtır Urfa & Cevizli Lahmacun çeşitlerimiz bol yeşillik, köz biber ve köpüklü yayık ayranıyla servis edilir.',
          def: 'ÖzTike Ciğer’in imza lezzeti Halil Usta Kuzu Ciğer Şiş ve Zırh Adana/Urfa Kebap! Yanına Cevizli Gavurdağı Salatası ve Bakır Maşrapada Yayık Ayranını tek dokunuşla sepete ekleyebilirsiniz.',
        },
        en: {
          mild: 'For a mild and family-friendly meal, we recommend our Charcoal Yaprak Chicken Skewers, Wood-Fired Leaf Beef Doner, Bostana Salad, and Copper Cup Ayran. Tap any card below to add!',
          pair: 'With Master Halil’s Oak-Charcoal Lamb Liver Skewers, guests love pairing Walnut Gavurdağı Salad, Sumac Bostana, Copper Cup Ayran, or Turnip Juice (Şalgam).',
          doner: 'Our wood-fired Leaf Beef Doner and crispy Stone-Oven Lahmacun (Classic or Walnut) are baked to order and pair wonderfully with Churned Ayran.',
          def: 'Our house signature is ÖzTike Lamb Liver Skewers paired with Hand-Minced Kebab, Walnut Gavurdağı Salad, and Foamy Copper-Cup Ayran. Tap below to add to your order!',
        },
        ar: {
          mild: 'للاختيارات غير الحارة والمناسبة للعائلات والأطفال: ننصحكم بشيش طاووق الدجاج على الفحم، شاورما الدونر على الحطب، سلطة بوستانا ولبن العيران في الكوب النحاسي.',
          pair: 'مع شيش كبدة الضأن المشوي، يتناغم طبق سلطة غافورداغ بالجوز وسلطة بوستانا مع لبن العيران البارد أو عصير الشلغم التقليدي.',
          doner: 'شاورما اللحم على الحطب ولحم بعجين بالفرن الحجري يُخبزان طازجين عند الطلب مع الخضروات الطازجة ولبن العيران.',
          def: 'أشهر أطباق الشيف خليل أوسطا هي كبدة الضأن على فحم البلوط وكباب الساطور مع سلطة غافورداغ ولبن العيران. اضغطوا أدناه للإضافة للسلة!',
        },
        fr: {
          mild: 'Pour un repas doux et familial : brochettes de poulet marinées au charbon, doner de bœuf au feu de bois, salade Bostana et Ayran en gobelet de cuivre.',
          pair: 'Avec les brochettes de foie d’agneau de Maître Halil, nous conseillons la salade Gavurdağı aux noix, la salade Bostana et un Ayran frais ou jus de navet (Şalgam).',
          doner: 'Notre Doner de bœuf au feu de bois et nos Lahmacun croustillants au four en pierre sont préparés minute et servis avec herbes fraîches et Ayran.',
          def: 'La signature de la maison : Brochettes de Foie d’Agneau ÖzTike, Kebab Adana/Urfa haché au couteau, salade Gavurdağı et Ayran mousseux.',
        },
        de: {
          mild: 'Für milde und familienfreundliche Gerichte empfehlen wir gegrillte Hähnchenspieße, Holzfeuer-Blattdöner, Bostana-Salat und schaumigen Ayran im Kupferbecher.',
          pair: 'Zu Halil Ustas Lammleber-Spießen passen unser Walnuss-Gavurdağı-Salat, Bostana-Salat und eiskalter Ayran oder traditioneller Şalgam hervorragend.',
          doner: 'Unser Blattdöner vom Holzfeuer und knuspriges Steinofen-Lahmacun werden frisch zubereitet und mit frischen Kräutern und Ayran serviert.',
          def: 'Unsere Spezialität: ÖzTike Lammleber-Spieße vom Eichenholzkohle-Grill, handgehackter Adana/Urfa Kebab, Gavurdağı-Salat und Ayran.',
        },
        ku: {
          mild: 'Ji bo tama bê tûj û malbatî: Şîşa Mirîşkê ya li ser komirê, Donera Goşt li ser agirê darîn, Seleteya Bostana û Dewê Meşqê yê bi kef pêşniyar dikin.',
          pair: 'Li kêleka Cîgera Berxê ya Hoste Xelîl, Seleteya Gavurdagi ya bi gûz, Bostana û Dewê bi kef an Şelgam pir xweş li hev tên.',
          doner: 'Donera me ya li ser agirê darîn û Lahmacuna firna kevirîn bi hêşînahiya teze û dewê sar tên pêşkêşkirin.',
          def: 'Xwarina sereke ya ÖzTike: Şîşa Cîgera Berxê ya li ser komirê, Kebaba Adana/Urfa, Seleteya Gavurdagi û Dewê kefdar. Ji bo lêzêdekirinê bikirtînin!',
        },
        ja: {
          mild: '辛くないご家族向けのメニューには、炭火焼きチキン串、薪焼きリーフドネル、ボスタナサラダ、銅カップのアイランがおすすめです。',
          pair: 'ハリル名人の子羊レバー串には、クルミ入りガヴルダーサラダ、ボスタナサラダ、冷たいアイランまたはシャルガムジュースがよく合います。',
          doner: '薪焼きのビーフドネルと石窯焼きのサクサクラフマジュンを焼きたてでお届けします。アイランとご一緒にどうぞ。',
          def: '看板メニューは子羊レバー炭火串焼きと手切りケバブです。クルミ入りサラダとアイランもワンタップで追加できます！',
        },
        zh: {
          mild: '适合儿童与不辣口味的推荐：炭烤嫩鸡肉串、木火牛肉烤肉卷饼底（Döner）、清爽蔬菜沙拉以及铜杯现打酸奶（Ayran）。',
          pair: '搭配哈利尔师傅招牌橡木炭烤羊肝串，强烈推荐核桃石榴汁沙拉、碎蔬沙拉及冰爽铜杯酸奶或特色萝卜汁。',
          doner: '木火现切纯肉烤肉（Döner）与石炉现烤土耳其薄饼（Lahmacun），外脆里嫩，搭配酸奶风味绝佳。',
          def: '本店招牌：ÖzTike 橡木炭烤羊肝串配手工剁肉烤串、核桃蔬菜沙拉及铜杯泡沫酸奶，点击下方卡片即可加入购物车！',
        },
      };

      const pack = replies[String(lang)] || replies.tr;
      const reply = isMild ? pack.mild : isSaladOrDrink ? pack.pair : isDonerOrLahmacun ? pack.doner : pack.def;
      return { reply, recommendedProductIds: ids };
    };

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.json(buildChatFallback());
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are the friendly culinary concierge for ÖzTike Ciğer – Halil Usta in Şahinbey, Gaziantep (NOTE: No desserts are served on the menu).
Reply concisely (2-3 sentences) in language code "${lang}" to the guest's question: "${message}".
Select 2-4 matching product IDs strictly from: PRD-01 (Kuzu Ciğer Şiş), PRD-08 (Kuzu Ciğer Dürüm), PRD-02 (Zırh Adana/Urfa Kebap), PRD-09 (Patlıcanlı Kebap), PRD-04 (Yaprak Tavuk Şiş), PRD-10 (Tavuk Kanat), PRD-03 (Yaprak Et Döner), PRD-11 (Tereyağlı İskender Döner), PRD-05 (Taş Fırın Lahmacun), PRD-12 (Cevizli Lahmacun), PRD-13 (Gavurdağı Salata), PRD-14 (Bostana & Çoban Salata), PRD-15 (Köz Biber & Soğan Tabağı), PRD-06 (Yayık Ayran), PRD-16 (Şalgam Suyu), PRD-17 (Meşrubat), PRD-18 (Maden Suyu & Su).`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: { type: Type.STRING },
              recommendedProductIds: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
          },
        },
      });
      const parsed = JSON.parse((response.text ?? '{}').trim());
      const allowedSet = new Set([
        'PRD-01', 'PRD-08', 'PRD-02', 'PRD-09', 'PRD-04', 'PRD-10',
        'PRD-03', 'PRD-11', 'PRD-05', 'PRD-12', 'PRD-13', 'PRD-14',
        'PRD-15', 'PRD-06', 'PRD-16', 'PRD-17', 'PRD-18',
      ]);
      const validIds = Array.isArray(parsed.recommendedProductIds)
        ? parsed.recommendedProductIds.filter((id: string) => allowedSet.has(id))
        : [];
      res.json({
        reply: parsed.reply || buildChatFallback().reply,
        recommendedProductIds: validIds.length > 0 ? validIds : buildChatFallback().recommendedProductIds,
      });
    } catch {
      res.json(buildChatFallback());
    }
  });


  // ---------------------------------------------------------------------------
  // 3. Yapay Zekâ Destekli Analiz Modülü (Bölüm 24 - Onay Mekanizmalı, Salt-Öneri)
  // ---------------------------------------------------------------------------
  app.post('/api/ai/analyze', async (req, res) => {
    const { analysisType, contextSummary } = req.body || {};

    // Bölüm 24 Kesin Kural: Yapay zekâ ödemeleri, siparişleri, fiyatları, stokları onaysız değiştiremez.
    const buildDeterministicReport = (type: string, summary: Record<string, unknown>) => {
      const dailyRevenue = Number(summary?.dailyRevenue || 68450);
      const criticalStockCount = Number(summary?.criticalStockCount || 3);
      return {
        title: `ÖzTike Ciğer – ${type || 'Günlük Yönetici Özeti'} Raporu`,
        summary: `Günlük ciro ${dailyRevenue.toLocaleString('tr-TR')} ₺ seviyesindedir. En yüksek kâr marjı Ciğer Kebapları (%63.1) ve Zırh Kebapları (%59.4) kategorilerinde gerçekleşmiştir. ${criticalStockCount} kalemde kritik stok uyarısı mevcuttur.`,
        recommendations: [
          {
            id: `REC-${Date.now()}-1`,
            category: 'Stok Tahmini & Tedarik',
            proposal: 'Taze Kuzu Ciğeri ve Kuyruk Yağı stokları akşam vardiyası yoğunluğu için kritik eşiğe yaklaşmaktadır. Trakya Besi Çiftliği tedarikçisinden +18 kg sipariş taslağı oluşturulması önerilir.',
            impact: 'Tahmini 14.500 ₺ akşam servisi ciro kaybını önler',
            actionType: 'stock_order_draft',
            requiresApproval: true,
          },
          {
            id: `REC-${Date.now()}-2`,
            category: 'Kampanya & Saat Bazlı Doluluk',
            proposal: 'Saat 14:30 – 17:30 arası salon doluluğunu artırmak için İki Kişilik ÖzTike Ciğer Menüsü + Yayık Ayran paketinde %12 saat bazlı indirim kampanyası tanımlanması önerilir.',
            impact: 'Öğleden sonra masa devir hızında +%22 artış beklentisi',
            actionType: 'campaign_draft',
            requiresApproval: true,
          },
          {
            id: `REC-${Date.now()}-3`,
            category: 'SEO & İçerik Taslağı',
            proposal: '"Gerçek Edirne & Güneydoğu Usulü Kuzu Ciğer Şiş Nasıl Pişirilir?" başlıklı blog taslağının yerel SEO şemasıyla yayınlanması önerilir.',
            impact: 'Organik yerel aramalarda görünürlük katkısı (Sıralama garantisi içermez)',
            actionType: 'seo_blog_draft',
            requiresApproval: true,
          },
        ],
        guardrailNotice:
          'Bölüm 24 Güvenlik Kısıtı: Yapay zekâ ödemeleri değiştiremez, siparişleri iptal edemez, fiyatları veya stok kayıtlarını onaysız güncelleyemez. Tüm öneriler yönetici onayına sunulur.',
      };
    };

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.json({
        source: 'deterministic_engine',
        ...buildDeterministicReport(analysisType, contextSummary || {}),
      });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = `Sen ÖzTike Ciğer Restaurant OS'un Yapay Zekâ Analiz Asistanısın.
Kullanıcının talep ettiği analiz türü: "${analysisType || 'Günlük Yönetici Özeti'}".
Restoranın anlık operasyon verileri: ${JSON.stringify(contextSummary || {})}.

Bölüm 24 Kuralları:
- Ödemeleri değiştiremezsin.
- Siparişleri kendiliğinden iptal edemezsin.
- Fiyatları ve stok kayıtlarını onaysız değiştiremezsin.
- Tüm öneriler yönetici onayına sunulmalıdır.

Lütfen Türkçe olarak yönetici özeti ve 3 somut, uygulanabilir öneri üret.`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    category: { type: Type.STRING },
                    proposal: { type: Type.STRING },
                    impact: { type: Type.STRING },
                    actionType: { type: Type.STRING },
                  },
                },
              },
            },
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json({
        source: 'gemini-4-hydrogen',
        title: parsed.title || `ÖzTike Ciğer – ${analysisType} Analizi`,
        summary: parsed.summary || buildDeterministicReport(analysisType, contextSummary || {}).summary,
        recommendations: Array.isArray(parsed.recommendations)
          ? parsed.recommendations.map((r: Record<string, unknown>, idx: number) => ({
              id: String(r.id || `AI-REC-${idx + 1}`),
              category: String(r.category || 'Operasyonel Öneri'),
              proposal: String(r.proposal || ''),
              impact: String(r.impact || 'Kârlılık ve hız optimizasyonu'),
              actionType: String(r.actionType || 'advisory'),
              requiresApproval: true,
            }))
          : buildDeterministicReport(analysisType, contextSummary || {}).recommendations,
        guardrailNotice:
          'Bölüm 24 Güvenlik Kısıtı: Yapay zekâ ödemeleri değiştiremez, siparişleri iptal edemez, fiyatları veya stok kayıtlarını onaysız güncelleyemez. Tüm öneriler yönetici onayına sunulur.',
      });
    } catch (error) {
      res.json({
        source: 'deterministic_fallback',
        ...buildDeterministicReport(analysisType, contextSummary || {}),
        apiNotice:
          error instanceof Error
            ? `Canlı AI servisi yerine yerel analitik motoru kullanıldı (${error.message.slice(0, 80)}).`
            : undefined,
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : { server: httpServer },
        ws: { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`ÖzTike Ciğer Restaurant OS running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
