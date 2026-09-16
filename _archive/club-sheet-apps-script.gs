/**
 * VICO — club signups + party RSVPs → Google Sheet
 * -------------------------------------------------
 * Runs on Google's servers via Apps Script and appends one row per
 * submission. Field-agnostic: it writes whatever keys the website sends
 * and adds a new column automatically the first time it sees a new field.
 *
 * One Web App endpoint, two destinations:
 *   - Club signups (index.html, member-club) → the "Leads" sheet (or the
 *     spreadsheet's first sheet if no "Leads" tab exists). Requires both
 *     consent checkboxes server-side.
 *   - Party RSVPs (party-invite) → the "Opening Party" sheet (created
 *     automatically if that tab doesn't exist yet). No consent fields —
 *     the payload is tagged { formType: "partyRsvp" } so the script knows
 *     which sheet to use.
 *
 * Both flows dedupe on phone number (per-sheet): a repeat phone doesn't
 * add a new row — it returns { ok:true, duplicate:true } so the site can
 * show an "already registered" state instead of double-adding.
 *
 * Setup / update:
 *   1. In your Google Sheet: Extensions ▸ Apps Script.
 *   2. Replace everything with THIS file, Save.
 *   3. Deploy ▸ Manage deployments ▸ (edit your Web app) ▸ Version: New version ▸ Deploy.
 *      (Keep Execute as: Me, Who has access: Anyone. The /exec URL stays the same.)
 *
 * Current fields sent by the site:
 *   Club:  createdAt · fullName · email · phone · marketingConsent · termsAccepted · source · campaign
 *   RSVP:  createdAt · formType · name · phone · party · arrival
 */

function normalizePhone_(v) {
  return String(v || '').replace(/\D/g, '').replace(/^0*/, '');
}

// Appends `data` to `sheet`, adding new header columns as needed and
// deduping on phone number within that sheet. Shared by both flows below.
function appendToSheet_(sheet, data) {
  var headers = sheet.getLastRow() > 0
    ? sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0].filter(String)
    : [];
  if (headers.length === 0) {
    headers = ['createdAt'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  // Add a column for any field we haven't seen before ('formType' is just
  // a routing hint, not something worth its own column).
  Object.keys(data).forEach(function (k) {
    if (k === 'formType') return;
    if (headers.indexOf(k) === -1) {
      headers.push(k);
      sheet.getRange(1, headers.length).setValue(k);
    }
  });

  // Duplicate check: same normalized phone already in this sheet.
  var phoneCol = headers.indexOf('phone');
  if (phoneCol !== -1 && sheet.getLastRow() > 1) {
    var incoming = normalizePhone_(data.phone);
    var existing = sheet.getRange(2, phoneCol + 1, sheet.getLastRow() - 1, 1).getValues();
    for (var i = 0; i < existing.length; i++) {
      if (incoming && normalizePhone_(existing[i][0]) === incoming) {
        return { ok: true, duplicate: true };
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

  return { ok: true, duplicate: false };
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var data = JSON.parse(e.postData.contents);
    var result;

    if (data.formType === 'partyRsvp') {
      var rsvpSheet = ss.getSheetByName('Opening Party') || ss.insertSheet('Opening Party');
      result = appendToSheet_(rsvpSheet, data);
    } else {
      if (!data.marketingConsent || !data.termsAccepted) {
        return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'consent_required' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      var leadsSheet = ss.getSheetByName('Leads') || ss.getSheets()[0];
      result = appendToSheet_(leadsSheet, data);
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// Bump this string whenever you deploy, so a plain GET to the /exec URL
// (e.g. in a browser tab) tells you which version is actually live —
// no form submission needed to check.
var SCRIPT_VERSION = 'v4 — party RSVP → "Opening Party" sheet';

function doGet() {
  return ContentService.createTextOutput('VICO club endpoint is live. (' + SCRIPT_VERSION + ')');
}
