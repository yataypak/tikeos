<?php
declare(strict_types=1);

/**
 * ÖzTike Ciğer Restaurant OS
 * PDO Güvenli Veritabanı Bağlantı ve İşlem Katmanı (PHP 8.2+ / cPanel Uyumlu)
 * Zorunlu Güvenlik: PDO Prepared Statements, Emulate Prepares Kapalı, Hata Gizleme
 */

namespace App\Core;

use PDO;
use PDOException;
use RuntimeException;

final class Database
{
    private static ?PDO $instance = null;

    public static function connection(): PDO
    {
        if (self::$instance !== null) {
            return self::$instance;
        }

        $host = $_ENV['DB_HOST'] ?? 'localhost';
        $port = $_ENV['DB_PORT'] ?? '3306';
        $dbName = $_ENV['DB_DATABASE'] ?? 'oztike_restaurant_os';
        $user = $_ENV['DB_USERNAME'] ?? 'oztike_user';
        $pass = $_ENV['DB_PASSWORD'] ?? '';

        $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', $host, $port, $dbName);

        try {
            self::$instance = new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci, time_zone = '+03:00'",
            ]);
            return self::$instance;
        } catch (PDOException $e) {
            // Canlı ortamda teknik hata detayları ziyaretçiye gösterilmez (Bölüm 25 & 34)
            error_log('[ÖzTike DB Error] ' . $e->getMessage());
            throw new RuntimeException('Veritabanı bağlantısı şu anda kurulamıyor. Lütfen sistem yöneticisiyle iletişime geçin.');
        }
    }
}
