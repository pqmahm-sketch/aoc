/**
 * ============================================================
 * AOC 2026 — Dashboard API + Hosted Dashboard
 * ============================================================
 *
 * Web app endpoint yang membaca data dari sheet M.LOOKER
 * dan mengembalikan JSON untuk dashboard attendance tracker.
 *
 * MODE:
 *   ?mode=dashboard  → tampilkan dashboard HTML (versi online)
 *   ?mode=scan&scanned=VALUE → terima data scanner, tulis ke SCANNER sheet
 *   (default)        → return JSON API
 *
 * CARA DEPLOY / UPDATE:
 * 1. Buka project Apps Script (Extensions > Apps Script)
 * 2. Paste kode ini di file dashboard_api.gs
 * 3. Buat file HTML baru: File > New > HTML
 *    beri nama "dashboard_hosted" (tanpa .html)
 *    paste isi dari dashboard_hosted.html
 * 4. Deploy > Manage deployments > Edit (icon pensil)
 *    klik "New version" lalu Deploy
 *
 * URL DASHBOARD ONLINE:
 *   https://script.google.com/macros/s/DEPLOYMENT_ID/exec?mode=dashboard
 *
 * KOLOM YANG DIBACA (sheet M.LOOKER, baris 1 = header):
 *   B  (idx 1)  = Participant Category
 *   E  (idx 4)  = Name
 *   F  (idx 5)  = Country
 *   H  (idx 7)  = Bus Number
 *   I  (idx 8)  = Seat
 *   J  (idx 9)  = Agenda
 *   K  (idx 10) = Status  (HADIR / BELUM HADIR)
 *   L  (idx 11) = Check-in Time  (dd/MM/yyyy HH:mm:ss)
 *   M  (idx 12) = Check-in Point / Tempat Check In
 * ============================================================
 */

function doGet(e) {
  var mode = (e && e.parameter && e.parameter.mode) || '';

  if (mode === 'dashboard') {
    return HtmlService.createHtmlOutputFromFile('dashboard_hosted')
      .setTitle('AOC 2026 Attendance Tracker')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  if (mode === 'scan') {
    try {
      var scanned = (e.parameter.scanned || "").trim();
      if (!scanned) return _json({ error: "Parameter 'scanned' kosong" });
      var result = appendScannerData(scanned);
      return _json(result);
    } catch (err) {
      return _json({ error: err.message });
    }
  }

  try {
    var data = getDashboardData();
    return _json(data);
  } catch (err) {
    return _json({ error: err.message });
  }
}

function getDashboardData() {
  var ss = SpreadsheetApp.openById("1S3nAnX5ije6prGTwnJ7sZsdYmQtu7q8g");
  var sheet = ss.getSheetByName("M.LOOKER");

  if (!sheet) {
    throw new Error("Sheet M.LOOKER tidak ditemukan");
  }

  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return {
      cutoff: _cutoff(),
      uniqueParticipants: 0,
      countryTargets: {},
      agendaTargets: {},
      participants: []
    };
  }

  var maxCol = Math.max(sheet.getLastColumn(), 13);
  var rows = sheet.getRange(2, 1, lastRow - 1, maxCol).getDisplayValues();

  var participants = [];
  var countryTargets = {};
  var agendaTargets = {};
  var seenCountryName = {};

  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];

    var category     = (r[1]  || "").trim();
    var name         = (r[4]  || "").trim();
    var country      = (r[5]  || "").trim();
    var bus          = (r[7]  || "").trim();
    var seat         = (r[8]  || "").trim();
    var agenda       = (r[9]  || "").trim();
    var checkinRaw   = (r[11] || "").trim();
    var checkinPoint = (r[12] || "").trim();

    if (!name && !country && !category) continue;

    if (country && name) {
      var ck = country + "|" + name.toLowerCase();
      if (!seenCountryName[ck]) {
        seenCountryName[ck] = true;
        countryTargets[country] = (countryTargets[country] || 0) + 1;
      }
    }
    if (agenda) agendaTargets[agenda] = (agendaTargets[agenda] || 0) + 1;

    var dateOnly = "";
    if (checkinRaw !== "") {
      var sp = checkinRaw.split(" ");
      if (sp.length >= 1) dateOnly = sp[0];
    }

    var statusRaw = (r[10] || "").trim();
    var status;
    if (statusRaw) {
      status = statusRaw;
    } else {
      status = (checkinRaw !== "" && checkinPoint !== "") ? "HADIR" : "BELUM HADIR";
    }

    participants.push({
      name:         name,
      country:      country,
      category:     category,
      seat:         seat,
      agenda:       agenda,
      bus:          bus,
      checkinPoint: checkinPoint,
      date:         dateOnly,
      checkinTime:  checkinRaw || null,
      status:       status
    });
  }

  var seenNames = {};
  for (var j = 0; j < participants.length; j++) {
    if (participants[j].name) seenNames[participants[j].name.toLowerCase()] = true;
  }

  return {
    cutoff:             _cutoff(),
    uniqueParticipants: Object.keys(seenNames).length,
    countryTargets:     countryTargets,
    agendaTargets:      agendaTargets,
    participants:       participants
  };
}

function _cutoff() {
  return Utilities.formatDate(new Date(), "Asia/Jakarta", "dd MMM yyyy · HH:mm") + " WIB";
}

function appendScannerData(scannedValue) {
  var ss = SpreadsheetApp.openById("1S3nAnX5ije6prGTwnJ7sZsdYmQtu7q8g");

  var scannerSheet = ss.getSheetByName("SCANNER");
  if (!scannerSheet) throw new Error("Sheet SCANNER tidak ditemukan");

  var now = new Date();
  var day   = now.getDate();
  var month = now.getMonth() + 1;
  var year  = now.getFullYear();
  var hrs   = now.getHours();
  var mins  = now.getMinutes();
  var tMin  = hrs * 60 + mins;

  var timestamp = Utilities.formatDate(now, "Asia/Jakarta", "dd/MM/yyyy HH:mm:ss");
  var dateStr   = _pad(day) + "/" + _pad(month) + "/" + year;
  var timeStr   = _pad(hrs) + "." + _pad(mins);
  var agenda    = _classifyAgenda(day, month, year);
  var tempat    = _classifyTempat(day, month, year, tMin);

  scannerSheet.appendRow([timestamp, dateStr, timeStr, scannedValue, agenda, tempat]);

  var ml = ss.getSheetByName("M.LOOKER");
  if (!ml) throw new Error("Sheet M.LOOKER tidak ditemukan");

  var participantName = "";
  var mlLast = ml.getLastRow();
  if (mlLast > 1) {
    var mlRows  = mlLast - 1;
    var mlCodes = ml.getRange(2, 4, mlRows, 1).getDisplayValues();
    var mlNames = ml.getRange(2, 5, mlRows, 1).getDisplayValues();
    var key     = scannedValue.toLowerCase();

    for (var i = 0; i < mlCodes.length; i++) {
      var code = (mlCodes[i][0] || "").trim().toLowerCase();
      if (code === key) {
        ml.getRange(i + 2, 11).setValue("HADIR");
        ml.getRange(i + 2, 12).setValue(timestamp);
        ml.getRange(i + 2, 13).setValue(tempat);
        participantName = (mlNames[i][0] || "").trim();
        break;
      }
    }
  }

  return {
    success: true,
    scanned: scannedValue,
    timestamp: timestamp,
    name: participantName || null,
    tempat: tempat
  };
}

function _json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
