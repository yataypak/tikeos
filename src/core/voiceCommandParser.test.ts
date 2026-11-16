import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePOSVoiceCommand, normalizeTurkishText } from './voiceCommandParser';

test('normalizeTurkishText trims and handles Turkish lowercasing', () => {
  assert.equal(normalizeTurkishText('  Açık Adisyonları Göster!  '), 'açık adisyonları göster');
  assert.equal(normalizeTurkishText('İndirim Yap: %10'), 'indirim yap 10');
});

test('parses SHOW_OPEN_TICKETS voice command', () => {
  const res1 = parsePOSVoiceCommand('Açık adisyonları göster');
  assert.equal(res1.intent, 'SHOW_OPEN_TICKETS');

  const res2 = parsePOSVoiceCommand('Açık masaları listele');
  assert.equal(res2.intent, 'SHOW_OPEN_TICKETS');

  const res3 = parsePOSVoiceCommand('bekleyen siparişleri aç');
  assert.equal(res3.intent, 'SHOW_OPEN_TICKETS');
});

test('parses PRINT_LAST_RECEIPT voice command', () => {
  const res1 = parsePOSVoiceCommand('Son fişi yazdır');
  assert.equal(res1.intent, 'PRINT_LAST_RECEIPT');

  const res2 = parsePOSVoiceCommand('Fatura yazdır lütfen');
  assert.equal(res2.intent, 'PRINT_LAST_RECEIPT');

  const res3 = parsePOSVoiceCommand('adisyon yazdır');
  assert.equal(res3.intent, 'PRINT_LAST_RECEIPT');
});

test('parses SELECT_TABLE voice command with digits and words', () => {
  const res1 = parsePOSVoiceCommand('Masa 3');
  assert.equal(res1.intent, 'SELECT_TABLE');
  assert.equal(res1.tableNumber, 'Masa 03');

  const res2 = parsePOSVoiceCommand('Masa beş');
  assert.equal(res2.intent, 'SELECT_TABLE');
  assert.equal(res2.tableNumber, 'Masa 05');

  const res3 = parsePOSVoiceCommand('Masa on iki');
  assert.equal(res3.intent, 'SELECT_TABLE');
  assert.equal(res3.tableNumber, 'Masa 12');
});

test('parses SELECT_FAST_SALE command', () => {
  const res = parsePOSVoiceCommand('Hızlı satış');
  assert.equal(res.intent, 'SELECT_FAST_SALE');
});

test('parses payment methods', () => {
  assert.equal(parsePOSVoiceCommand('Nakit ödeme').paymentMethod, 'Nakit');
  assert.equal(parsePOSVoiceCommand('Kredi kartı').paymentMethod, 'Fiziksel POS');
  assert.equal(parsePOSVoiceCommand('Multinet yemek kartı').paymentMethod, 'Yemek Kartı');
  assert.equal(parsePOSVoiceCommand('iyzico ile öde').paymentMethod, 'iyzico (Test Modu)');
});

test('parses CONFIRM_PAYMENT and CLEAR_CART', () => {
  assert.equal(parsePOSVoiceCommand('Tahsilatı onayla').intent, 'CONFIRM_PAYMENT');
  assert.equal(parsePOSVoiceCommand('Hesabı kapat').intent, 'CONFIRM_PAYMENT');
  assert.equal(parsePOSVoiceCommand('Sepeti temizle').intent, 'CLEAR_CART');
});

test('parses APPLY_DISCOUNT percentage', () => {
  const res1 = parsePOSVoiceCommand('Yüzde on indirim yap');
  assert.equal(res1.intent, 'APPLY_DISCOUNT');
  assert.equal(res1.discountPercent, 10);

  const res2 = parsePOSVoiceCommand('Yüzde 20 indirim');
  assert.equal(res2.intent, 'APPLY_DISCOUNT');
  assert.equal(res2.discountPercent, 20);
});

test('handles UNKNOWN command gracefully with friendly help message', () => {
  const res = parsePOSVoiceCommand('Rastgele anlamsız bir sözcük öbeği');
  assert.equal(res.intent, 'UNKNOWN');
  assert.match(res.feedbackMessage, /Komut anlaşılamadı/);
});
