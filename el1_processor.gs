/**
 * ============================================================
 * AOC 2026 — EL1 Sheet Processor & Sync ke M.LOOKER
 * ============================================================
 * Sheet EL1 — kolom:
 *   A (1) = TIMESTAMP       ← input dari scanner / form
 *   B (2) = DATE            ← auto-fill (dd/mm/yyyy)
 *   C (3) = TIME            ← auto-fill (HH.mm)
 *   D (4) = SCANNED DETAILS ← identifier peserta
 *   E (5) = AGENDA          ← auto-fill dari DATE
 *   F (6) = TEMPAT CHECKIN  ← auto-fill dari DATE + TIME
 *
 * Sync ke M.LOOKER:
 *   EL1.D (SCANNED DETAILS) di-match dengan M.LOOKER.E (Name)
 *   → M.LOOKER.L = EL1.A (TIMESTAMP)
 *   → M.LOOKER.M = EL1.F (TEMPAT CHECKIN)
 *   → M.LOOKER.K = HADIR / BELUM HADIR
 *
 * Fungsi _classifyTempat, _classifyAgenda, _pad, parseDateString,
 * dan getSpreadsheet didefinisikan di tempat_checkin.gs
 * (shared namespace).
 * ============================================================
 */

var EL1_SHEET_NAME = "EL1";

// EL1 column indices (1-based)
var EL1_TIMESTAMP = 1;  // A
var EL1_DATE      = 2;  // B
var EL1_TIME      = 3;  // C
var EL1_SCANNED   = 4;  // D
var EL1_AGENDA    = 5;  // E
var EL1_TEMPAT    = 6;  // F

// M.LOOKER column indices (1-based)
var ML_NAME    = 5;   // E
var ML_STATUS  = 11;  // K
var ML_CHECKIN = 12;  // L
var ML_TEMPAT  = 13;  // M

// ============================================================
// Batch: auto-fill kolom B, C, E, F dari TIMESTAMP (A)
// ============================================================
function processEL1() {
  var ss    = getSpreadsheet();
  var sheet = ss.getSheetByName(EL1_SHEET_NAME);
  if (!sheet) { Logger.log("Sheet EL1 tidak ditemukan."); return; }

  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;

  var dataRows = lastRow - 1;
  var rawVals  = sheet.getRange(2, EL1_TIMESTAMP, dataRows, 1).getValues();
  var dispVals = sheet.getRange(2, EL1_TIMESTAMP, dataRows, 1).getDisplayValues();

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

  sheet.getRange(2, EL1_DATE,   dataRows, 1).setValues(dates);
  sheet.getRange(2, EL1_TIME,   dataRows, 1).setValues(times);
  sheet.getRange(2, EL1_AGENDA, dataRows, 1).setValues(agendas);
  sheet.getRange(2, EL1_TEMPAT, dataRows, 1).setValues(tempats);

  Logger.log("EL1 batch selesai: " + dataRows + " baris.");
}

// ============================================================
// Sync: EL1 → M.LOOKER  (L, M, K)
// ============================================================
function syncEL1ToMLooker() {
  var ss  = getSpreadsheet();
  var el1 = ss.getSheetByName(EL1_SHEET_NAME);
  var ml  = ss.getSheetByName(SHEET_NAME); // "M.LOOKER" dari tempat_checkin.gs

  if (!el1) { Logger.log("Sheet EL1 tidak ditemukan."); return; }
  if (!ml)  { Logger.log("Sheet M.LOOKER tidak ditemukan."); return; }

  // --- Baca EL1 ---
  var el1Last = el1.getLastRow();
  if (el1Last <= 1) { Logger.log("EL1 kosong."); return; }

  var el1Rows = el1Last - 1;
  var el1Data = el1.getRange(2, 1, el1Rows, 6).getDisplayValues();

  // Build lookup: lowercase(SCANNED_DETAILS) → { timestamp, tempat }
  // Jika ada duplikat, ambil yang terbaru (baris terakhir)
  var lookup = {};
  for (var i = 0; i < el1Data.length; i++) {
    var timestamp = (el1Data[i][0] || "").trim();   // A
    var scanned   = (el1Data[i][3] || "").trim();   // D
    var tempat    = (el1Data[i][5] || "").trim();   // F

    if (!scanned || !timestamp) continue;

    var key = scanned.toLowerCase();
    lookup[key] = { timestamp: timestamp, tempat: tempat };
  }

  // --- Baca M.LOOKER ---
  var mlLast = ml.getLastRow();
  if (mlLast <= 1) { Logger.log("M.LOOKER kosong."); return; }

  var mlRows   = mlLast - 1;
  var mlNames  = ml.getRange(2, ML_NAME, mlRows, 1).getDisplayValues();
  var mlCI     = ml.getRange(2, ML_CHECKIN, mlRows, 1).getDisplayValues();
  var mlTP     = ml.getRange(2, ML_TEMPAT, mlRows, 1).getDisplayValues();

  var newCI  = [];
  var newTP  = [];
  var newST  = [];
  var synced = 0;

  for (var i = 0; i < mlNames.length; i++) {
    var name = (mlNames[i][0] || "").trim();
    var key  = name.toLowerCase();

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
// Convenience: proses EL1 lalu sync
// ============================================================
function processAndSync() {
  processEL1();
  syncEL1ToMLooker();
}

// ============================================================
// Trigger onEdit untuk sheet EL1
// ============================================================
function onEditEL1(e) {
  try {
    var sheet = e.range.getSheet();
    if (sheet.getName() !== EL1_SHEET_NAME) return;
    if (e.range.getColumn() !== EL1_TIMESTAMP) return;
    if (e.range.getRow() <= 1) return;

    var numRows = e.range.getNumRows();
    for (var i = 0; i < numRows; i++) {
      var row  = e.range.getRow() + i;
      var raw  = sheet.getRange(row, EL1_TIMESTAMP).getValue();
      var disp = sheet.getRange(row, EL1_TIMESTAMP).getDisplayValue().trim();

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

      sheet.getRange(row, EL1_DATE).setValue(_pad(day) + "/" + _pad(month) + "/" + year);
      sheet.getRange(row, EL1_TIME).setValue(_pad(hrs) + "." + _pad(mins));
      sheet.getRange(row, EL1_AGENDA).setValue(_classifyAgenda(day, month, year));
      sheet.getRange(row, EL1_TEMPAT).setValue(_classifyTempat(day, month, year, tMin));
    }
  } catch (err) {
    Logger.log("onEditEL1 error: " + err.message);
  }
}

// ============================================================
// Pasang trigger EL1 — jalankan SEKALI
// ============================================================
function pasangTriggerEL1() {
  var ss = getSpreadsheet();

  var existing = ScriptApp.getProjectTriggers();
  for (var i = 0; i < existing.length; i++) {
    if (existing[i].getHandlerFunction() === "onEditEL1") {
      ScriptApp.deleteTrigger(existing[i]);
    }
  }

  ScriptApp.newTrigger("onEditEL1")
    .forSpreadsheet(ss)
    .onEdit()
    .create();

  Logger.log("Trigger EL1 berhasil dipasang.");
}
