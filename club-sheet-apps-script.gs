/**
 * VICO — "Friends of VICO" club signups → Google Sheet
 * ----------------------------------------------------
 * Runs on Google's servers via Apps Script and appends one row per signup.
 * This version is field-agnostic: it writes whatever keys the website sends
 * and adds a new column automatically the first time it sees a new field —
 * so you should never have to touch this again when the form changes.
 *
 * Setup / update:
 *   1. In your Google Sheet: Extensions ▸ Apps Script.
 *   2. Replace everything with THIS file, Save.
 *   3. Deploy ▸ Manage deployments ▸ (edit your Web app) ▸ Version: New version ▸ Deploy.
 *      (Keep Execute as: Me, Who has access: Anyone. The /exec URL stays the same.)
 *
 * Current fields sent by the site:
 *   createdAt · fullName · email · phone · marketingConsent · source · campaign
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Leads') || ss.getSheets()[0];
    var data = JSON.parse(e.postData.contents);

    // Read (or create) the header row.
    var headers = sheet.getLastRow() > 0
      ? sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0].filter(String)
      : [];
    if (headers.length === 0) {
      headers = ['createdAt'];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
    // Add a column for any field we haven't seen before.
    Object.keys(data).forEach(function (k) {
      if (headers.indexOf(k) === -1) {
        headers.push(k);
        sheet.getRange(1, headers.length).setValue(k);
      }
    });

    // Build the row in header order.
    var row = headers.map(function (h) {
      if (h === 'createdAt') return data.createdAt || new Date().toISOString();
      if (h === 'marketingConsent') return data.marketingConsent ? 'כן' : 'לא';
      if (h === 'phone') return data.phone ? "'" + data.phone : '';   // keep leading 0 as text
      return data[h] != null ? data[h] : '';
    });
    sheet.appendRow(row);

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput('VICO club endpoint is live.');
}
