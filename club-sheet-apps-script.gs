/**
 * VICO — "Friends of VICO" club signups → Google Sheet
 * ----------------------------------------------------
 * Runs on Google's servers via Apps Script and appends one row per signup.
 * Field-agnostic: it writes whatever keys the website sends and adds a new
 * column automatically the first time it sees a new field.
 *
 * Also enforces, server-side (in addition to the site's own client-side
 * checks):
 *   - Both consent checkboxes (marketingConsent + termsAccepted) must be
 *     true, or the signup is rejected.
 *   - One signup per phone number — a repeat phone doesn't add a new row;
 *     it returns { ok:true, duplicate:true } so the site can show an
 *     "already a member" message instead of silently double-adding.
 *
 * Setup / update:
 *   1. In your Google Sheet: Extensions ▸ Apps Script.
 *   2. Replace everything with THIS file, Save.
 *   3. Deploy ▸ Manage deployments ▸ (edit your Web app) ▸ Version: New version ▸ Deploy.
 *      (Keep Execute as: Me, Who has access: Anyone. The /exec URL stays the same.)
 *
 * Current fields sent by the site:
 *   createdAt · fullName · email · phone · marketingConsent · termsAccepted · source · campaign
 */

function normalizePhone_(v) {
  return String(v || '').replace(/\D/g, '').replace(/^0*/, '');
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Leads') || ss.getSheets()[0];
    var data = JSON.parse(e.postData.contents);

    if (!data.marketingConsent || !data.termsAccepted) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'consent_required' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

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

    // Duplicate check: same normalized phone already in the sheet.
    var phoneCol = headers.indexOf('phone');
    if (phoneCol !== -1 && sheet.getLastRow() > 1) {
      var incoming = normalizePhone_(data.phone);
      var existing = sheet.getRange(2, phoneCol + 1, sheet.getLastRow() - 1, 1).getValues();
      for (var i = 0; i < existing.length; i++) {
        if (incoming && normalizePhone_(existing[i][0]) === incoming) {
          return ContentService.createTextOutput(JSON.stringify({ ok: true, duplicate: true }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
    }

    // Build the row in header order.
    var row = headers.map(function (h) {
      if (h === 'createdAt') return data.createdAt || new Date().toISOString();
      if (h === 'marketingConsent' || h === 'termsAccepted') return data[h] ? 'כן' : 'לא';
      if (h === 'phone') return data.phone ? "'" + data.phone : '';   // keep leading 0 as text
      return data[h] != null ? data[h] : '';
    });
    sheet.appendRow(row);

    return ContentService.createTextOutput(JSON.stringify({ ok: true, duplicate: false }))
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
