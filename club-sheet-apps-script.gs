/**
 * VICO — "Friends of VICO" club signups → Google Sheet
 * ----------------------------------------------------
 * This is NOT part of the website. It runs on Google's servers via Google
 * Apps Script and appends one row per signup to your Google Sheet.
 *
 * Setup:
 *   1. Create a Google Sheet (https://sheets.new).
 *   2. Extensions ▸ Apps Script. Delete the sample code, paste THIS file, Save.
 *   3. Deploy ▸ New deployment ▸ (gear) Web app
 *        Execute as: Me
 *        Who has access: Anyone
 *      Deploy, then authorize your Google account.
 *   4. Copy the Web app URL (ends with /exec).
 *   5. Put that URL into index.html → CONFIG.signupEndpoint (or send it to me).
 *
 * Columns written: createdAt | firstName | phone | marketingConsent | source | campaign
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000); // avoid two signups writing at once

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Leads') || ss.getSheets()[0];

    // First write? add a header row.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['createdAt', 'firstName', 'phone', 'marketingConsent', 'source', 'campaign']);
    }

    var d = JSON.parse(e.postData.contents);
    sheet.appendRow([
      d.createdAt || new Date().toISOString(),
      d.firstName || '',
      "'" + (d.phone || ''),                    // leading ' keeps the leading 0 as text
      d.marketingConsent ? 'כן' : 'לא',
      d.source || '',
      d.campaign || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// Lets you open the /exec URL in a browser to confirm it's live.
function doGet() {
  return ContentService.createTextOutput('VICO club endpoint is live.');
}
