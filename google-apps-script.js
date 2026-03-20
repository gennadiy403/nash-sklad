/**
 * НашСклад — Google Apps Script для записи ответов анкеты в Google Sheets
 *
 * Как настроить:
 * 1. Создайте новую Google Таблицу
 * 2. Откройте Расширения → Apps Script
 * 3. Вставьте этот код, сохраните
 * 4. Нажмите "Развернуть" → "Новое развертывание" → тип "Веб-приложение"
 *    - Запуск от имени: Я
 *    - Доступ: Все
 * 5. Скопируйте URL и добавьте в .env как VITE_SHEETS_WEBHOOK_URL
 */

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Добавить заголовки если таблица пустая
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Дата',
        'Кол-во SKU',
        'Маркетплейсы',
        'Боли',
        'Оценка боли (1-10)',
        'Желания',
        'Имя',
        'Контакт',
        'Готов созвониться',
      ]);
    }

    const data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      new Date().toLocaleString('ru-RU'),
      data.skuCount || '',
      data.platforms || '',
      data.pains || '',
      data.painScore || '',
      data.wishes || '',
      data.name || '',
      data.contact || '',
      data.callReady ? 'Да' : 'Нет',
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Тест — можно запустить вручную из редактора
function testSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.appendRow([new Date(), 'test', 'wb, ozon', 'ui, slow', 8, 'simple_ui', 'Test', '@test', 'Да']);
}
