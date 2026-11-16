/**
 * ============================================================
 * AOC 2026 — HP & SCANNER Sheet Processor & Sync ke M.LOOKER
 * ============================================================
 * Sheet HP & SCANNER — kolom (sama):
 *   A (1) = TIMESTAMP       ← input dari scanner / form
 *   B (2) = DATE            ← auto-fill (dd-mm-yyyy)
 *   C (3) = TIME            ← auto-fill (HH:mm)
 *   D (4) = SCANNED DETAILS ← identifier peserta
 *
 * Sync ke M.LOOKER:
 *   HP.D / SCANNER.D (SCANNED DETAILS) di-match dengan
 *   M.LOOKER.D (UNIQUE CODE)
 *   Timestamp di-classify → tempat, lalu dicocokkan dengan
 *   M.LOOKER.O (pre-filled TEMPAT CHECK IN)
 *   → M.LOOKER.N (14) = TIMESTAMP (jika tempat cocok)
 *   → M.LOOKER.M (13) = HADIR jika N terisi, BELUM HADIR jika kosong
 *
 * Fungsi _classifyTempat, _classifyAgenda, _pad, parseDateString,
 * dan getSpreadsheet didefinisikan di tempat_checkin.gs
 * (shared namespace).
 * ============================================================
 */

var HP_SHEET_NAME      = "HP";
var SCANNER_SHEET_NAME = "SCANNER";

// Column indices (1-based) — sama untuk HP & SCANNER
var SRC_TIMESTAMP = 1;  // A
var SRC_DATE      = 2;  // B
var SRC_TIME      = 3;  // C
var SRC_SCANNED   = 4;  // D

// M.LOOKER column indices (1-based)
var ML_UNIQUE_CODE = 4;   // D — lookup key
var ML_STATUS      = 13;  // M
var ML_CHECKIN     = 14;  // N
var ML_TEMPAT      = 15;  // O

// ============================================================
// Generic: auto-fill kolom B (DATE), C (TIME) dari TIMESTAMP (A)
// ============================================================
function _processSheet(sheetName) {
  var ss    = getSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) { Logger.log("Sheet " + sheetName + " tidak ditemukan."); return; }

  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;

  var dataRows = lastRow - 1;
  var dispVals = sheet.getRange(2, SRC_TIMESTAMP, dataRows, 1).getDisplayValues();

  var dates = [];
  var times = [];

  for (var i = 0; i < dispVals.length; i++) {
    var disp = (dispVals[i][0] || "").trim();
    if (!disp) { dates.push([""]); times.push([""]); continue; }

    var date = parseDateString(disp);
    if (!date || isNaN(date.getTime())) {
      dates.push([""]); times.push([""]);
      continue;
    }

    var hrs   = date.getHours();
    var mins  = date.getMinutes();
    var day   = date.getDate();
    var month = date.getMonth() + 1;
    var year  = date.getFullYear();

    dates.push([_pad(day) + "/" + _pad(month) + "/" + year]);
    times.push([_pad(hrs) + "." + _pad(mins)]);
  }

  sheet.getRange(2, SRC_DATE, dataRows, 1).setValues(dates);
  sheet.getRange(2, SRC_TIME, dataRows, 1).setValues(times);

  Logger.log(sheetName + " batch selesai: " + dataRows + " baris.");
}

function processHP()      { _processSheet(HP_SHEET_NAME); }
function processScanner() { _processSheet(SCANNER_SHEET_NAME); }
function processAll()     { processHP(); processScanner(); }

// ============================================================
// Generic: baca lookup dari satu sheet sumber (kolom A & D)
// Mengembalikan { code: [timestamp1, timestamp2, ...] }
// ============================================================
function _buildLookup(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) { Logger.log("Sheet " + sheetName + " tidak ditemukan."); return {}; }

  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) { Logger.log(sheetName + " kosong."); return {}; }

  var rows = lastRow - 1;
  var data = sheet.getRange(2, 1, rows, 4).getDisplayValues();

  var lookup = {};
  for (var i = 0; i < data.length; i++) {
    var timestamp = (data[i][0] || "").trim();   // A
    var scanned   = (data[i][3] || "").trim();   // D

    if (!scanned || !timestamp) continue;

    var key = scanned.toLowerCase();
    if (!lookup[key]) lookup[key] = [];
    lookup[key].push(timestamp);
  }

  Logger.log(sheetName + ": " + Object.keys(lookup).length + " entries.");
  return lookup;
}

// ============================================================
// Sync: HP + SCANNER → M.LOOKER  (M, N)
// Kolom O (TEMPAT) sudah pre-filled di M.LOOKER — tidak ditimpa.
// Timestamp di-classify → tempat, dicocokkan dengan kolom O.
// ============================================================
function syncToMLooker() {
  var ss = getSpreadsheet();
  var ml = ss.getSheetByName(SHEET_NAME);

  if (!ml) { Logger.log("Sheet M.LOOKER tidak ditemukan."); return; }

  var lookupHP      = _buildLookup(ss, HP_SHEET_NAME);
  var lookupScanner = _buildLookup(ss, SCANNER_SHEET_NAME);

  var lookup = {};
  var k;
  for (k in lookupHP) {
    lookup[k] = (lookup[k] || []).concat(lookupHP[k]);
  }
  for (k in lookupScanner) {
    lookup[k] = (lookup[k] || []).concat(lookupScanner[k]);
  }

  var mlLast = ml.getLastRow();
  if (mlLast <= 1) { Logger.log("M.LOOKER kosong."); return; }

  var mlRows  = mlLast - 1;
  var mlCodes = ml.getRange(2, ML_UNIQUE_CODE, mlRows, 1).getDisplayValues();
  var mlTP    = ml.getRange(2, ML_TEMPAT, mlRows, 1).getDisplayValues();

  var newCI  = [];
  var newST  = [];
  var synced = 0;

  for (var i = 0; i < mlCodes.length; i++) {
    var code = (mlCodes[i][0] || "").trim();
    var key  = code.toLowerCase();
    var prefilledTempat = (mlTP[i][0] || "").trim();
    var matchedTS = "";

    if (lookup[key] && prefilledTempat) {
      var timestamps = lookup[key];
      for (var j = 0; j < timestamps.length; j++) {
        var classified = getTempatCheckIn(timestamps[j]);
        if (classified === prefilledTempat) {
          matchedTS = timestamps[j];
          break;
        }
      }
    }

    newCI.push([matchedTS]);
    newST.push([matchedTS ? "HADIR" : "BELUM HADIR"]);
    if (matchedTS) synced++;
  }

  ml.getRange(2, ML_STATUS,  mlRows, 1).setValues(newST);
  ml.getRange(2, ML_CHECKIN, mlRows, 1).setValues(newCI);

  Logger.log("Sync selesai: " + synced + " match dari " + mlRows + " baris M.LOOKER.");
}

// ============================================================
// Convenience: proses semua lalu sync
// ============================================================
function processAndSync() {
  processAll();
  syncToMLooker();
}

// ============================================================
// Generic: onEdit trigger untuk HP & SCANNER
// ============================================================
function _onEditSource(e) {
  try {
    var sheet = e.range.getSheet();
    var name  = sheet.getName();
    if (name !== HP_SHEET_NAME && name !== SCANNER_SHEET_NAME) return;
    if (e.range.getColumn() !== SRC_TIMESTAMP) return;
    if (e.range.getRow() <= 1) return;

    var numRows = e.range.getNumRows();
    for (var i = 0; i < numRows; i++) {
      var row  = e.range.getRow() + i;
      var disp = sheet.getRange(row, SRC_TIMESTAMP).getDisplayValue().trim();
      if (!disp) continue;

      var date = parseDateString(disp);
      if (!date || isNaN(date.getTime())) continue;

      var hrs   = date.getHours();
      var mins  = date.getMinutes();
      var day   = date.getDate();
      var month = date.getMonth() + 1;
      var year  = date.getFullYear();

      sheet.getRange(row, SRC_DATE).setValue(_pad(day) + "/" + _pad(month) + "/" + year);
      sheet.getRange(row, SRC_TIME).setValue(_pad(hrs) + "." + _pad(mins));
    }
  } catch (err) {
    Logger.log("onEditSource error (" + (e.range.getSheet().getName()) + "): " + err.message);
  }
}

// ============================================================
// Pasang trigger — jalankan SEKALI
// ============================================================
function pasangTriggerSources() {
  var ss = getSpreadsheet();

  // Hapus trigger lama (EL1 & source)
  var existing = ScriptApp.getProjectTriggers();
  for (var i = 0; i < existing.length; i++) {
    var fn = existing[i].getHandlerFunction();
    if (fn === "onEditEL1" || fn === "_onEditSource") {
      ScriptApp.deleteTrigger(existing[i]);
    }
  }

  ScriptApp.newTrigger("_onEditSource")
    .forSpreadsheet(ss)
    .onEdit()
    .create();

  Logger.log("Trigger HP & SCANNER berhasil dipasang.");
}
