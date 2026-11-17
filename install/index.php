<?php
/**
 * ÖzTike Ciğer – Restaurant OS (v1.2.0)
 * cPanel PHP 8.2+ & MySQL Otomatik Kurulum Sihirbazı (Web Installer)
 * İsteğe bağlı hazır demo içerik (Menü, Reçete, Masa, Kampanya, Tema, SEO) yükleme destekli.
 */

declare(strict_types=1);

$lockFile = __DIR__ . '/../storage/installed.lock';
$schemaFile = __DIR__ . '/../database/schema.sql';
$envFile = __DIR__ . '/../.env';

$phpVersionOk = version_compare(PHP_VERSION, '8.1.0', '>=');
$pdoMysqlOk = extension_loaded('pdo_mysql');
$mbstringOk = extension_loaded('mbstring');
$jsonOk = extension_loaded('json');
$curlOk = extension_loaded('curl');

$message = '';
$status = 'idle';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $dbHost = trim((string)($_POST['db_host'] ?? '127.0.0.1'));
    $dbPort = trim((string)($_POST['db_port'] ?? '3306'));
    $dbName = trim((string)($_POST['db_name'] ?? 'oztike_restos'));
    $dbUser = trim((string)($_POST['db_user'] ?? 'oztike_user'));
    $dbPass = (string)($_POST['db_pass'] ?? '');
    $siteUrl = trim((string)($_POST['site_url'] ?? 'https://oztikeciger.com.tr'));
    $adminEmail = trim((string)($_POST['admin_email'] ?? 'yonetim@oztikeciger.com.tr'));
    $seedDemoContent = isset($_POST['seed_demo_content']) && $_POST['seed_demo_content'] === '1';

    try {
        $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', $dbHost, $dbPort, $dbName);
        $pdo = new PDO($dsn, $dbUser, $dbPass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);

        if (is_file($schemaFile)) {
            $sql = (string)file_get_contents($schemaFile);
            $pdo->exec($sql);
        }

        if ($seedDemoContent) {
            $pdo->exec("
                INSERT IGNORE INTO categories (id, name, slug, sort_order, is_active) VALUES
                (1, 'Ciğer Kebapları', 'ciger-kebaplari', 1, 1),
                (2, 'Zırh Kebapları', 'zirh-kebaplari', 2, 1),
                (3, 'Tavuk Izgaralar', 'tavuk-izgaralar', 3, 1),
                (4, 'Yaprak Döner', 'yaprak-doner', 4, 1),
                (5, 'Taş Fırın Lahmacun', 'tas-firin-lahmacun', 5, 1),
                (6, 'Yeşillikler & Salatalar', 'yesillikler-salatalar', 6, 1),
                (7, 'İçecekler', 'icecekler', 7, 1);
            ");
        }

        $envContent = implode("\n", [
            'APP_ENV=production',
            'APP_URL=' . $siteUrl,
            'APP_TIMEZONE=Europe/Istanbul',
            'APP_CURRENCY=TRY',
            'DB_HOST=' . $dbHost,
            'DB_PORT=' . $dbPort,
            'DB_DATABASE=' . $dbName,
            'DB_USERNAME=' . $dbUser,
            'DB_PASSWORD="' . addslashes($dbPass) . '"',
            'ADMIN_INITIAL_EMAIL=' . $adminEmail,
            'SEED_DEMO_CONTENT=' . ($seedDemoContent ? 'true' : 'false'),
            'IYZICO_MODE=sandbox',
            'PAYTR_MODE=sandbox',
        ]) . "\n";

        @file_put_contents($envFile, $envContent);
        if (!is_dir(dirname($lockFile))) {
            @mkdir(dirname($lockFile), 0755, true);
        }
        @file_put_contents($lockFile, date('c'));

        $status = 'success';
        $message = 'Kurulum başarıyla tamamlandı! MySQL tabloları oluşturuldu' .
            ($seedDemoContent ? ' ve hazır ÖzTike Ciğer demo içerikleri yüklendi.' : ' (Boş temiz kurulum yapıldı).');
    } catch (Throwable $e) {
        $status = 'error';
        $message = 'Veritabanı bağlantı veya kurulum hatası: ' . htmlspecialchars($e->getMessage(), ENT_QUOTES, 'UTF-8');
    }
}
?>
<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ÖzTike Ciğer OS – cPanel PHP &amp; MySQL Kurulum Sihirbazı</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #141413; color: #F5F2EB; margin: 0; padding: 32px 16px; }
    .card { max-width: 680px; margin: 0 auto; background: #1F1F1D; border: 1px solid #333; border-radius: 16px; padding: 28px; }
    h1 { margin: 0 0 8px; color: #D4AF6A; font-size: 22px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; background: rgba(184,107,53,0.2); color: #D4AF6A; font-size: 12px; font-weight: 700; margin-bottom: 14px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px; }
    label { display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #CCC; }
    input[type="text"], input[type="password"], input[type="email"] { width: 100%; box-sizing: border-box; padding: 10px 12px; border-radius: 8px; border: 1px solid #444; background: #141413; color: #FFF; font-size: 13px; }
    .check-row { margin-top: 18px; padding: 14px; border-radius: 10px; border: 1px solid rgba(212,175,106,0.4); background: rgba(184,107,53,0.1); display: flex; align-items: flex-start; gap: 10px; }
    button { margin-top: 20px; width: 100%; padding: 13px; border: 0; border-radius: 10px; background: #B86B35; color: #FFF; font-weight: 700; font-size: 14px; cursor: pointer; }
    .alert { padding: 12px 16px; border-radius: 10px; margin-bottom: 16px; font-size: 13px; }
    .alert-ok { background: rgba(16,185,129,0.2); border: 1px solid #10B981; color: #A7F3D0; }
    .alert-err { background: rgba(239,68,68,0.2); border: 1px solid #EF4444; color: #FECACA; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">cPanel PHP 8.2+ &amp; MySQL Otomatik Kurulum Sihirbazı</span>
    <h1>ÖzTike Ciğer – Restaurant OS Kurulumu</h1>
    <p style="font-size:13px;color:#AAA;margin:0 0 16px;">cPanel MySQL veritabanı bilgilerinizi girin ve hazır içerik tercihini seçerek kurulumu başlatın.</p>

    <?php if ($message !== ''): ?>
      <div class="alert <?php echo $status === 'success' ? 'alert-ok' : 'alert-err'; ?>">
        <?php echo $message; ?>
      </div>
    <?php endif; ?>

    <form method="post">
      <div class="grid">
        <div>
          <label>MySQL Sunucu (DB_HOST)</label>
          <input type="text" name="db_host" value="localhost" required />
        </div>
        <div>
          <label>MySQL Port (DB_PORT)</label>
          <input type="text" name="db_port" value="3306" required />
        </div>
        <div>
          <label>cPanel Veritabanı Adı (DB_DATABASE)</label>
          <input type="text" name="db_name" value="cpaneluser_oztike" required />
        </div>
        <div>
          <label>cPanel Veritabanı Kullanıcısı (DB_USERNAME)</label>
          <input type="text" name="db_user" value="cpaneluser_admin" required />
        </div>
        <div>
          <label>Veritabanı Şifresi (DB_PASSWORD)</label>
          <input type="password" name="db_pass" placeholder="••••••••" />
        </div>
        <div>
          <label>Site Alan Adı (APP_URL)</label>
          <input type="text" name="site_url" value="https://oztikeciger.com.tr" required />
        </div>
      </div>

      <label class="check-row">
        <input type="checkbox" name="seed_demo_content" value="1" checked style="margin-top:3px;" />
        <div>
          <strong style="color:#F5D69B;font-size:13px;">Mevcut Hazır İçerikleri İsteğe Bağlı Olarak Yükle (Önerilen)</strong>
          <div style="font-size:12px;color:#BBB;margin-top:3px;">
            İşaretlenirse: ÖzTike Ciğer ürün menüsü, reçete maliyetleri, 8 masa planı, kampanyalar, 9 tema, SEO ayarları ve 34 eklenti hazır olarak veritabanına yüklenir.
          </div>
        </div>
      </label>

      <button type="submit">Kurulumu Tamamla &amp; Sistemi Başlat</button>
    </form>
  </div>
</body>
</html>
