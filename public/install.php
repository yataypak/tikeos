<?php
/**
 * ÖzTike Ciğer – Restaurant OS (Hostinger & cPanel PHP 8.1+ / MySQL Kurulum Sihirbazı)
 * Kullanım: Hostinger public_html dizinine yükledikten sonra https://alanadiniz.com/install.php adresini açın.
 * Kurulum tamamlandığında storage/install.lock dosyası oluşturulur ve kurulum yeniden çalıştırılamaz.
 */

declare(strict_types=1);

$rootDir = __DIR__;
$lockFile = $rootDir . '/storage/install.lock';
$schemaFile = $rootDir . '/database/schema.sql';
$envFile = $rootDir . '/.env';
$dbConfigOut = $rootDir . '/config/db-config.php';

$isInstalled = is_file($lockFile);
$phpVersionOk = version_compare(PHP_VERSION, '8.1.0', '>=');
$pdoMysqlOk = extension_loaded('pdo_mysql');
$mbstringOk = extension_loaded('mbstring');
$jsonOk = extension_loaded('json');
$opensslOk = extension_loaded('openssl');
$writableRoot = is_writable($rootDir);

$status = 'idle';
$message = '';
$stepLogs = [];

if ($isInstalled && ($_GET['action'] ?? '') !== 'status') {
    $status = 'locked';
    $message = 'Kurulum daha önce tamamlanmış ve güvenlik kilidi (storage/install.lock) aktif. Yeniden kurulum yapmak için FTP/Dosya Yöneticisinden storage/install.lock dosyasını silin.';
}

if (!$isInstalled && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $dbHost = trim((string)($_POST['db_host'] ?? 'localhost'));
    $dbPort = trim((string)($_POST['db_port'] ?? '3306'));
    $dbName = trim((string)($_POST['db_name'] ?? ''));
    $dbUser = trim((string)($_POST['db_user'] ?? ''));
    $dbPass = (string)($_POST['db_pass'] ?? '');
    $siteName = trim((string)($_POST['site_name'] ?? 'ÖzTike Ciğer'));
    $siteUrl = rtrim(trim((string)($_POST['site_url'] ?? '')), '/');
    $currency = trim((string)($_POST['currency'] ?? 'TRY'));
    $adminName = trim((string)($_POST['admin_name'] ?? 'Halil Usta (Yönetici)'));
    $adminEmail = trim((string)($_POST['admin_email'] ?? 'admin@oztikeciger.com'));
    $adminPass = (string)($_POST['admin_password'] ?? 'HalilUsta2026!');
    $seedDemo = isset($_POST['seed_demo_content']) && $_POST['seed_demo_content'] === '1';

    if ($dbName === '' || $dbUser === '' || $adminEmail === '' || strlen($adminPass) < 6) {
        $status = 'error';
        $message = 'Lütfen veritabanı adı, kullanıcı adı, yönetici e-posta ve en az 6 karakterli yönetici şifresini girin.';
    } else {
        try {
            $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', $dbHost, $dbPort, $dbName);
            $pdo = new PDO($dsn, $dbUser, $dbPass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
            ]);
            $stepLogs[] = 'MySQL veritabanı bağlantısı doğrulandı.';

            if (is_file($schemaFile)) {
                $rawSql = (string)file_get_contents($schemaFile);
                $statements = preg_split('/;\s*(\r?\n|$)/', $rawSql);
                $executed = 0;
                if (is_array($statements)) {
                    foreach ($statements as $stmt) {
                        $trimmed = trim($stmt);
                        if ($trimmed === '' || str_starts_with($trimmed, '--')) {
                            continue;
                        }
                        $pdo->exec($trimmed);
                        $executed++;
                    }
                }
                $stepLogs[] = "Veritabanı şeması yüklendi ({$executed} SQL komutu çalıştırıldı).";
            } else {
                $stepLogs[] = 'Uyarı: database/schema.sql bulunamadı; yalnızca ayar dosyaları oluşturuldu.';
            }

            // İşletme ve Ana Şube Kaydı
            $stmtBiz = $pdo->prepare(
                "INSERT INTO businesses (id, name, legal_name, currency, timezone) VALUES (1, :name, :legal, :curr, 'Europe/Istanbul')
                 ON DUPLICATE KEY UPDATE name = VALUES(name), currency = VALUES(currency)"
            );
            $stmtBiz->execute([
                ':name' => $siteName,
                ':legal' => $siteName . ' Turizm Gıda Ltd. Şti.',
                ':curr' => $currency,
            ]);

            $pdo->exec(
                "INSERT IGNORE INTO branches (id, business_id, code, name, is_main, is_active)
                 VALUES (1, 1, 'SAHINBEY-01', 'Şahinbey Merkez Şube', 1, 1)"
            );

            // Yönetici Rolü & Admin Kullanıcı
            $pdo->exec(
                "INSERT IGNORE INTO roles (id, slug, name, description, is_system)
                 VALUES (1, 'super_admin', 'Süper Yönetici', 'Tam sistem yetkisi', 1)"
            );
            $passHash = password_hash($adminPass, PASSWORD_BCRYPT);
            $stmtUsr = $pdo->prepare(
                "INSERT INTO users (branch_id, full_name, email, password_hash, is_active)
                 VALUES (1, :fname, :email, :phash, 1)
                 ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), password_hash = VALUES(password_hash), is_active = 1"
            );
            $stmtUsr->execute([
                ':fname' => $adminName,
                ':email' => $adminEmail,
                ':phash' => $passHash,
            ]);
            $adminUserId = (int)$pdo->lastInsertId();
            if ($adminUserId > 0) {
                $pdo->prepare("INSERT IGNORE INTO user_roles (user_id, role_id, branch_id) VALUES (:uid, 1, 1)")
                    ->execute([':uid' => $adminUserId]);
            }
            $stepLogs[] = "Yönetici hesabı oluşturuldu ({$adminEmail}).";

            // İsteğe Bağlı Hazır Demo İçerik
            if ($seedDemo) {
                $pdo->exec("
                    INSERT IGNORE INTO dining_areas (id, branch_id, name, sort_order, is_active) VALUES
                    (1, 1, 'Ana Salon', 1, 1),
                    (2, 1, 'Taş Bahçe', 2, 1),
                    (3, 1, 'Bakır Ocakbaşı', 3, 1),
                    (4, 1, 'VIP Aile Salonu', 4, 1);

                    INSERT IGNORE INTO dining_tables (id, branch_id, area_id, table_number, capacity, status) VALUES
                    (1, 1, 1, 'Masa 01 · Salon 1', 4, 'empty'),
                    (2, 1, 1, 'Masa 02 · Salon 2', 4, 'empty'),
                    (3, 1, 2, 'Masa 03 · Bahçe 1', 6, 'empty'),
                    (4, 1, 3, 'Masa 04 · Ocakbaşı 1', 8, 'empty');

                    INSERT IGNORE INTO categories (id, branch_id, name, slug, sort_order, is_active, is_demo) VALUES
                    (1, 1, 'Ciğer', 'ciger', 1, 1, 1),
                    (2, 1, 'Kebap', 'kebap', 2, 1, 1),
                    (3, 1, 'Tavuk', 'tavuk', 3, 1, 1),
                    (4, 1, 'Döner', 'doner', 4, 1, 1),
                    (5, 1, 'Lahmacun', 'lahmacun', 5, 1, 1),
                    (6, 1, 'Salata', 'salata', 6, 1, 1),
                    (7, 1, 'İçecek', 'icecek', 7, 1, 1);

                    INSERT IGNORE INTO products (id, branch_id, category_id, sku, name, slug, description, price, in_stock, is_active, is_demo) VALUES
                    (1, 1, 1, 'OZT-CGR-01', 'Geleneksel Ciğer Şiş Porsiyon', 'geleneksel-ciger-sis', 'Meşe közünde günlük taze erkek kuzu ciğeri, sıcak tandır lavaşı ve 7 çeşit köz meze ile.', 440.00, 1, 1, 1),
                    (2, 1, 2, 'OZT-KBP-01', 'Zırh Kıyma Adana / Urfa Kebap', 'zirh-kiyma-kebap', 'Zırhta çekilmiş özel kuzu eti, közlenmiş domates ve biber ile.', 460.00, 1, 1, 1),
                    (3, 1, 5, 'OZT-LHM-01', 'Taş Fırın Antep Lahmacun', 'tas-firin-antep-lahmacun', 'İnce hamur üzerine zırh kıyması, taze maydanoz ve limon eşliğinde.', 150.00, 1, 1, 1),
                    (4, 1, 7, 'OZT-ICK-01', 'Bakır Maşrapada Yayık Ayran', 'yayik-ayran', 'Bol köpüklü geleneksel yayık ayran.', 55.00, 1, 1, 1);
                ");
                $stepLogs[] = 'Hazır ÖzTike Ciğer demo kategorileri, ürünleri ve salon masaları eklendi.';
            }

            // .env dosyasını oluştur
            $resolvedUrl = $siteUrl !== '' ? $siteUrl : ('https://' . ($_SERVER['HTTP_HOST'] ?? 'localhost'));
            $envLines = [
                'APP_NAME="' . addslashes($siteName) . '"',
                'APP_ENV=production',
                'APP_URL=' . $resolvedUrl,
                'APP_TIMEZONE=Europe/Istanbul',
                'APP_CURRENCY=' . $currency,
                'DB_HOST=' . $dbHost,
                'DB_PORT=' . $dbPort,
                'DB_DATABASE=' . $dbName,
                'DB_USERNAME=' . $dbUser,
                'DB_PASSWORD="' . addslashes($dbPass) . '"',
                'SEED_DEMO_CONTENT=' . ($seedDemo ? 'true' : 'false'),
            ];
            @file_put_contents($envFile, implode("\n", $envLines) . "\n");

            // config/db-config.php dosyasını oluştur
            if (!is_dir($rootDir . '/config')) {
                @mkdir($rootDir . '/config', 0755, true);
            }
            $phpCfg = "<?php\nreturn [\n"
                . "  'host' => " . var_export($dbHost, true) . ",\n"
                . "  'port' => " . var_export($dbPort, true) . ",\n"
                . "  'database' => " . var_export($dbName, true) . ",\n"
                . "  'username' => " . var_export($dbUser, true) . ",\n"
                . "  'password' => " . var_export($dbPass, true) . ",\n"
                . "  'charset' => 'utf8mb4',\n"
                . "];\n";
            @file_put_contents($dbConfigOut, $phpCfg);

            // storage/install.lock kilidini yaz
            if (!is_dir($rootDir . '/storage')) {
                @mkdir($rootDir . '/storage', 0755, true);
            }
            @file_put_contents($lockFile, "installed_at=" . date('c') . "\nadmin=" . $adminEmail . "\n");
            $stepLogs[] = '.env, config/db-config.php ve storage/install.lock güvenlik kilidi oluşturuldu.';

            $status = 'success';
            $message = 'Hostinger / cPanel kurulumu başarıyla tamamlandı! Güvenliğiniz için install.php artık kilitlendi.';
        } catch (Throwable $e) {
            $status = 'error';
            $message = 'Kurulum hatası: ' . htmlspecialchars($e->getMessage(), ENT_QUOTES, 'UTF-8');
        }
    }
}
?>
<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ÖzTike Ciğer OS – Hostinger &amp; cPanel Kurulum Sihirbazı (install.php)</title>
  <style>
    :root { --bg: #120806; --card: #1A0C09; --border: rgba(212,163,89,0.28); --gold: #D4A359; --copper: #B86B35; --text: #FFF7EB; --muted: #CBB79F; }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 28px 16px; background: var(--bg); color: var(--text); font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; line-height: 1.5; }
    .wrap { max-width: 760px; margin: 0 auto; background: var(--card); border: 1px solid var(--border); border-radius: 18px; padding: 28px; box-shadow: 0 24px 60px rgba(0,0,0,0.6); }
    .top { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; border-bottom: 1px solid var(--border); padding-bottom: 18px; margin-bottom: 20px; }
    .pill { display: inline-block; padding: 4px 10px; border-radius: 8px; background: rgba(212,163,89,0.14); border: 1px solid var(--border); color: var(--gold); font-size: 11px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; }
    h1 { margin: 8px 0 4px; font-size: 22px; color: var(--text); }
    .sub { font-size: 13px; color: var(--muted); margin: 0; }
    .reqs { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 8px; margin-bottom: 20px; }
    .req { padding: 10px 12px; border-radius: 10px; background: #120806; border: 1px solid rgba(255,255,255,0.08); font-size: 12px; }
    .ok { color: #34D399; font-weight: 700; }
    .bad { color: #F87171; font-weight: 700; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px; }
    @media (max-width: 600px) { .grid { grid-template-columns: 1fr; } }
    label { display: block; font-size: 12px; font-weight: 600; color: var(--gold); margin-bottom: 5px; }
    input[type=text], input[type=password], input[type=email], select {
      width: 100%; padding: 10px 12px; border-radius: 10px; border: 1px solid rgba(212,163,89,0.28);
      background: #110705; color: var(--text); font-size: 13px;
    }
    .sec-title { font-size: 13px; font-weight: 700; color: var(--text); margin: 18px 0 10px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.08); }
    .check-box { display: flex; align-items: flex-start; gap: 10px; padding: 14px; border-radius: 12px; background: rgba(184,107,53,0.12); border: 1px solid rgba(212,163,89,0.38); cursor: pointer; margin: 16px 0; }
    .btn { width: 100%; padding: 14px; border: 0; border-radius: 12px; background: linear-gradient(135deg, var(--gold), var(--copper)); color: #1A0B08; font-weight: 800; font-size: 14px; cursor: pointer; }
    .btn:hover { filter: brightness(1.06); }
    .alert { padding: 14px 16px; border-radius: 12px; margin-bottom: 18px; font-size: 13px; }
    .alert-success { background: rgba(16,185,129,0.15); border: 1px solid #10B981; color: #A7F3D0; }
    .alert-error { background: rgba(239,68,68,0.15); border: 1px solid #EF4444; color: #FECACA; }
    .alert-locked { background: rgba(245,158,11,0.15); border: 1px solid #F59E0B; color: #FDE68A; }
    .logs { margin: 10px 0 0; padding-left: 18px; font-size: 12px; color: #D1FAE5; }
    .actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
    .link-btn { display: inline-block; padding: 10px 18px; border-radius: 10px; background: var(--gold); color: #1A0B08; text-decoration: none; font-weight: 700; font-size: 13px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="top">
      <div>
        <span class="pill">Hostinger &amp; cPanel · PHP <?= htmlspecialchars(PHP_VERSION) ?> Web Installer</span>
        <h1>ÖzTike Ciğer – Restaurant OS Kurulumu</h1>
        <p class="sub">Veritabanı bağlantısı, tablo kurulumu, yönetici hesabı ve isteğe bağlı hazır içerik yükleme sihirbazı.</p>
      </div>
    </div>

    <div class="reqs">
      <div class="req">PHP 8.1+: <span class="<?= $phpVersionOk ? 'ok' : 'bad' ?>"><?= $phpVersionOk ? 'Hazır (' . PHP_VERSION . ')' : 'Yükseltin' ?></span></div>
      <div class="req">PDO MySQL: <span class="<?= $pdoMysqlOk ? 'ok' : 'bad' ?>"><?= $pdoMysqlOk ? 'Aktif' : 'Eksik' ?></span></div>
      <div class="req">Mbstring &amp; JSON: <span class="<?= ($mbstringOk && $jsonOk) ? 'ok' : 'bad' ?>"><?= ($mbstringOk && $jsonOk) ? 'Aktif' : 'Eksik' ?></span></div>
      <div class="req">Yazma İzni: <span class="<?= $writableRoot ? 'ok' : 'bad' ?>"><?= $writableRoot ? 'Uygun' : 'Kontrol Edin' ?></span></div>
    </div>

    <?php if ($message !== ''): ?>
      <div class="alert alert-<?= htmlspecialchars($status) ?>">
        <strong><?= $message ?></strong>
        <?php if (!empty($stepLogs)): ?>
          <ul class="logs">
            <?php foreach ($stepLogs as $log): ?>
              <li><?= htmlspecialchars($log, ENT_QUOTES, 'UTF-8') ?></li>
            <?php endforeach; ?>
          </ul>
        <?php endif; ?>
        <?php if ($status === 'success' || $status === 'locked'): ?>
          <div class="actions">
            <a class="link-btn" href="./">Müşteri Menüsünü Aç</a>
            <a class="link-btn" href="./?portal=admin">Yönetim Paneline Git</a>
          </div>
        <?php endif; ?>
      </div>
    <?php endif; ?>

    <?php if (!$isInstalled && $status !== 'success'): ?>
      <form method="post">
        <div class="sec-title">1. Hostinger / MySQL Veritabanı Bilgileri</div>
        <div class="grid">
          <div>
            <label>MySQL Sunucusu (Host)</label>
            <input type="text" name="db_host" value="<?= htmlspecialchars((string)($_POST['db_host'] ?? 'localhost')) ?>" required />
          </div>
          <div>
            <label>Port</label>
            <input type="text" name="db_port" value="<?= htmlspecialchars((string)($_POST['db_port'] ?? '3306')) ?>" required />
          </div>
          <div>
            <label>Veritabanı Adı (DB Name)</label>
            <input type="text" name="db_name" placeholder="u123456789_oztike" value="<?= htmlspecialchars((string)($_POST['db_name'] ?? '')) ?>" required />
          </div>
          <div>
            <label>Veritabanı Kullanıcısı (DB User)</label>
            <input type="text" name="db_user" placeholder="u123456789_admin" value="<?= htmlspecialchars((string)($_POST['db_user'] ?? '')) ?>" required />
          </div>
          <div style="grid-column: 1 / -1;">
            <label>Veritabanı Şifresi</label>
            <input type="password" name="db_pass" placeholder="MySQL şifreniz" />
          </div>
        </div>

        <div class="sec-title">2. İşletme &amp; Süper Yönetici Hesabı</div>
        <div class="grid">
          <div>
            <label>İşletme / Restoran Adı</label>
            <input type="text" name="site_name" value="<?= htmlspecialchars((string)($_POST['site_name'] ?? 'ÖzTike Ciğer · Halil Usta')) ?>" required />
          </div>
          <div>
            <label>Alan Adı (URL)</label>
            <input type="text" name="site_url" value="<?= htmlspecialchars((string)($_POST['site_url'] ?? 'https://' . ($_SERVER['HTTP_HOST'] ?? 'oztikeciger.com.tr'))) ?>" required />
          </div>
          <div>
            <label>Yönetici Adı Soyadı</label>
            <input type="text" name="admin_name" value="<?= htmlspecialchars((string)($_POST['admin_name'] ?? 'Halil Usta (Yönetici)')) ?>" required />
          </div>
          <div>
            <label>Yönetici E-posta</label>
            <input type="email" name="admin_email" value="<?= htmlspecialchars((string)($_POST['admin_email'] ?? 'admin@oztikeciger.com')) ?>" required />
          </div>
          <div>
            <label>Yönetici Şifresi (Min. 6 karakter)</label>
            <input type="password" name="admin_password" value="<?= htmlspecialchars((string)($_POST['admin_password'] ?? 'HalilUsta2026!')) ?>" required />
          </div>
          <div>
            <label>Para Birimi</label>
            <select name="currency">
              <option value="TRY">TRY (₺ - Türk Lirası)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
        </div>

        <label class="check-box">
          <input type="checkbox" name="seed_demo_content" value="1" checked style="margin-top:3px;" />
          <div>
            <strong style="font-size:13px; color:#F5D69B;">Mevcut Hazır İçerikleri Veritabanına Yükle (İsteğe Bağlı)</strong>
            <div style="font-size:12px; color:#CBB79F; margin-top:2px;">
              İşaretlenirse: 7 kategori, ciğer/kebap/lahmacun ürünleri, 4 salon bölgesi ve masa planı hazır olarak kurulur. Boş temiz kurulum için işareti kaldırabilirsiniz.
            </div>
          </div>
        </label>

        <button type="submit" class="btn">Veritabanını Kur &amp; Sistemi Başlat</button>
      </form>
    <?php endif; ?>
  </div>
</body>
</html>
