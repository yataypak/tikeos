# ÖZTİKE CİĞER RESTAURANT OS – KURULUM VE KULLANIM KILAVUZU

**Sürüm:** 1.0.0-stable  
**Dil:** Türkçe  
**Hedef Altyapı:** cPanel Paylaşımlı Hosting (PHP 8.2+ & MySQL 8 / MariaDB) + Canlı Tam Kapsamlı Web Uygulaması (PWA)

---

## 1. Genel Bakış

ÖzTike Ciğer Restaurant OS; QR menüden mutfağa (KDS), garsondan POS kasaya, reçete bazlı otomatik stok düşümünden maliyet/kârlılık analizine, müşteri sadakat programından kurumsal web sitesi ve SEO yönetimine kadar tüm restoran operasyonlarını tek merkezden yöneten modüler bir otomasyon sistemidir.

## 2. cPanel Paylaşımlı Hosting Kurulum Adımları

1. **Veritabanı Oluşturma:**
   - cPanel > **MySQL® Veritabanı Sihirbazı** ekranına girin.
   - `oztike_restaurant_os` adında bir veritabanı ve yetkili kullanıcı oluşturun (`ALL PRIVILEGES`).
2. **Dosyaların Yüklenmesi:**
   - Proje dosyalarını `public_html/` dizinine yükleyin.
   - `.htaccess` dosyası `config/`, `storage/`, `database/` ve `.env` dosyalarına doğrudan dış erişimi otomatik olarak engeller.
3. **Kurulum Sihirbazı (12 Adımlı):**
   - Tarayıcıdan `/install` adresini ziyaret edin veya uygulama içindeki **Kurulum Sihirbazı & cPanel Paketi** modülünü çalıştırın.
   - Sihirbaz; PHP 8.2+, PDO, mbstring, openssl, json, gd eklentilerini ve dizin yazma izinlerini (`storage/logs`, `storage/backups`, `storage/cache`) doğrular.
   - `database/schema.sql` (79 tablo) ve `DEMO` işaretli başlangıç verilerini yükler, kurulum sonunda `storage/install.lock` dosyasını oluşturarak kurulum dizinini kilitler.

## 3. Güvenlik ve Veri Bütünlüğü Kuralları

- **Demo Veriler:** İlk kurulumda oluşturulan örnek ürünler ve fiyatlar açıkça `DEMO` etiketi taşır; doğrulanmadan gerçek besin/kalori verisi olarak yayınlanmaz.
- **Silinmez Stok Hareketleri:** Stok hareketleri (`stock_movements`) asla silinmez; iptal veya sayım farkları ters kayıt (`reversal` / `count_adjust`) ile işlenir.
- **Ayrık İptal ve İade:** Sipariş iptali (`order_cancellations`) ve para iadesi (`order_refunds`) ayrı yetki ve işlem kayıtlarına tabidir.
- **Yapay Zekâ Kısıtları:** Yapay zekâ modülü yalnızca analiz ve öneri üretir; ödemeleri, fiyatları, siparişleri veya stokları kullanıcı onayı olmadan değiştiremez.
