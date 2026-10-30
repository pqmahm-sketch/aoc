/**
 * ============================================================
 * AOC 2026 — HP & SCANNER Sheet Processor & Sync ke M.LOOKER
 * ============================================================
 * Sheet HP & SCANNER — kolom (sama):
 *   A (1) = TIMESTAMP       ← input dari scanner / form
 *   B (2) = DATE            ← auto-fill (dd/mm/yyyy)
 *   C (3) = TIME            ← auto-fill (HH.mm)
 *   D (4) = SCANNED DETAILS ← identifier peserta
 *   E (5) = AGENDA          ← auto-fill dari DATE
 *   F (6) = TEMPAT CHECKIN  ← auto-fill dari DATE + TIME
 *
 * Sync ke M.LOOKER:
 *   HP.D / SCANNER.D (SCANNED DETAILS) di-match dengan
 *   M.LOOKER.D (UNIQUE CODE)
 *   → M.LOOKER.L = TIMESTAMP
 *   → M.LOOKER.M = TEMPAT CHECKIN
 *   → M.LOOKER.K = HADIR / BELUM HADIR
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
var SRC_AGENDA    = 5;  // E
var SRC_TEMPAT    = 6;  // F

// M.LOOKER column indices (1-based)
var ML_UNIQUE_CODE = 4;   // D — lookup key
var ML_STATUS      = 11;  // K
var ML_CHECKIN     = 12;  // L
var ML_TEMPAT      = 13;  // M

// ============================================================
// Generic: auto-fill kolom B, C, E, F dari TIMESTAMP (A)
// ============================================================
function _processSheet(sheetName) {
  var ss    = getSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) { Logger.log("Sheet " + sheetName + " tidak ditemukan."); return; }

  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;

  var dataRows = lastRow - 1;
  var rawVals  = sheet.getRange(2, SRC_TIMESTAMP, dataRows, 1).getValues();
  var dispVals = sheet.getRange(2, SRC_TIMESTAMP, dataRows, 1).getDisplayValues();

  var dates   = [];
  var times   = [];
  var agendas = [];
  var tempats = [];

  for (var i = 0; i < rawVals.length; i++) {
    var raw  = rawVals[i][0];
    var disp = (dispVals[i][0] || "").trim();

    var date = null;
    if (raw instanceof Date && !isNaN(raw.getTime())) {
      date = raw;
    } else if (disp) {
      date = parseDateString(disp);
    }

    if (!date || isNaN(date.getTime())) {
      dates.push([""]); times.push([""]); agendas.push([""]); tempats.push([""]);
      continue;
    }

    var day   = date.getDate();
    var month = date.getMonth() + 1;
    var year  = date.getFullYear();
    var hrs   = date.getHours();
    var mins  = date.getMinutes();
    var tMin  = hrs * 60 + mins;

    dates.push([_pad(day) + "/" + _pad(month) + "/" + year]);
    times.push([_pad(hrs) + "." + _pad(mins)]);
    agendas.push([_classifyAgenda(day, month, year)]);
    tempats.push([_classifyTempat(day, month, year, tMin)]);
  }

  sheet.getRange(2, SRC_DATE,   dataRows, 1).setValues(dates);
  sheet.getRange(2, SRC_TIME,   dataRows, 1).setValues(times);
  sheet.getRange(2, SRC_AGENDA, dataRows, 1).setValues(agendas);
  sheet.getRange(2, SRC_TEMPAT, dataRows, 1).setValues(tempats);

  Logger.log(sheetName + " batch selesai: " + dataRows + " baris.");
}

function processHP()      { _processSheet(HP_SHEET_NAME); }
function processScanner() { _processSheet(SCANNER_SHEET_NAME); }
function processAll()     { processHP(); processScanner(); }

// ============================================================
// Generic: baca lookup dari satu sheet sumber
// ============================================================
function _buildLookup(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) { Logger.log("Sheet " + sheetName + " tidak ditemukan."); return {}; }

  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) { Logger.log(sheetName + " kosong."); return {}; }

  var rows = lastRow - 1;
  var data = sheet.getRange(2, 1, rows, 6).getDisplayValues();

  var lookup = {};
  for (var i = 0; i < data.length; i++) {
    var timestamp = (data[i][0] || "").trim();   // A
    var scanned   = (data[i][3] || "").trim();   // D
    var tempat    = (data[i][5] || "").trim();   // F

    if (!scanned || !timestamp) continue;

    var key = scanned.toLowerCase();
    lookup[key] = { timestamp: timestamp, tempat: tempat };
  }

  Logger.log(sheetName + ": " + Object.keys(lookup).length + " entries.");
  return lookup;
}

// ============================================================
// Sync: HP + SCANNER → M.LOOKER  (L, M, K)
// ============================================================
function syncToMLooker() {
  var ss = getSpreadsheet();
  var ml = ss.getSheetByName(SHEET_NAME); // "M.LOOKER" dari tempat_checkin.gs

  if (!ml) { Logger.log("Sheet M.LOOKER tidak ditemukan."); return; }

  // Build combined lookup dari kedua sheet
  var lookupHP      = _buildLookup(ss, HP_SHEET_NAME);
  var lookupScanner = _buildLookup(ss, SCANNER_SHEET_NAME);

  // Gabung: SCANNER menimpa HP jika key sama (baris terakhir menang)
  var lookup = {};
  var k;
  for (k in lookupHP)      { lookup[k] = lookupHP[k]; }
  for (k in lookupScanner) { lookup[k] = lookupScanner[k]; }

  // --- Baca M.LOOKER kolom D (UNIQUE CODE) ---
  var mlLast = ml.getLastRow();
  if (mlLast <= 1) { Logger.log("M.LOOKER kosong."); return; }

  var mlRows      = mlLast - 1;
  var mlCodes     = ml.getRange(2, ML_UNIQUE_CODE, mlRows, 1).getDisplayValues();
  var mlCI        = ml.getRange(2, ML_CHECKIN, mlRows, 1).getDisplayValues();
  var mlTP        = ml.getRange(2, ML_TEMPAT, mlRows, 1).getDisplayValues();

  var newCI  = [];
  var newTP  = [];
  var newST  = [];
  var synced = 0;

  for (var i = 0; i < mlCodes.length; i++) {
    var code = (mlCodes[i][0] || "").trim();
    var key  = code.toLowerCase();

    var ci = (mlCI[i][0] || "").trim();
    var tp = (mlTP[i][0] || "").trim();

    if (lookup[key]) {
      ci = lookup[key].timestamp;
      tp = lookup[key].tempat;
      synced++;
    }

    newCI.push([ci]);
    newTP.push([tp]);
    newST.push([(ci && tp) ? "HADIR" : "BELUM HADIR"]);
  }

  ml.getRange(2, ML_STATUS,  mlRows, 1).setValues(newST);
  ml.getRange(2, ML_CHECKIN, mlRows, 1).setValues(newCI);
  ml.getRange(2, ML_TEMPAT,  mlRows, 1).setValues(newTP);

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
      var raw  = sheet.getRange(row, SRC_TIMESTAMP).getValue();
      var disp = sheet.getRange(row, SRC_TIMESTAMP).getDisplayValue().trim();

      var date = null;
      if (raw instanceof Date && !isNaN(raw.getTime())) {
        date = raw;
      } else if (disp) {
        date = parseDateString(disp);
      }

      if (!date || isNaN(date.getTime())) continue;

      var day   = date.getDate();
      var month = date.getMonth() + 1;
      var year  = date.getFullYear();
      var hrs   = date.getHours();
      var mins  = date.getMinutes();
      var tMin  = hrs * 60 + mins;

      sheet.getRange(row, SRC_DATE).setValue(_pad(day) + "/" + _pad(month) + "/" + year);
      sheet.getRange(row, SRC_TIME).setValue(_pad(hrs) + "." + _pad(mins));
      sheet.getRange(row, SRC_AGENDA).setValue(_classifyAgenda(day, month, year));
      sheet.getRange(row, SRC_TEMPAT).setValue(_classifyTempat(day, month, year, tMin));
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
