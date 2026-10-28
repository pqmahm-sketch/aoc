/**
 * ============================================================
 * AOC 2026 — Klasifikasi Tempat Check In & Agenda
 * ============================================================
 * Sheet: M.LOOKER
 *
 * Kolom yang dikelola:
 *   K  (11) = STATUS        → HADIR / BELUM HADIR
 *   L  (12) = CHECK IN      → timestamp
 *   M  (13) = TEMPAT CHECK IN
 *
 * Fungsi _classifyTempat dan _classifyAgenda dipakai bersama
 * oleh el1_processor.gs (shared namespace Apps Script).
 * ============================================================
 */

var SPREADSHEET_ID = "1S3nAnX5ije6prGTwnJ7sZsdYmQtu7q8g";
var SHEET_NAME     = "M.LOOKER";
var STATUS_COL     = 11;  // K
var CHECK_IN_COL   = 12;  // L
var TEMPAT_COL     = 13;  // M
var HEADER_ROW     = 1;

// ============================================================
// Helper: buka spreadsheet
// ============================================================
function getSpreadsheet() {
  try {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (e) {
    Logger.log("openById gagal: " + e.message);
  }
  var active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;
  throw new Error("Spreadsheet tidak ditemukan. Pastikan SPREADSHEET_ID benar: " + SPREADSHEET_ID);
}

function _pad(n) { return n < 10 ? "0" + n : String(n); }

// ============================================================
// CORE: klasifikasi TEMPAT CHECK IN berdasarkan tanggal & waktu
// ============================================================
function _classifyTempat(day, month, year, timeMin) {
  if (month !== 11 || year !== 2026) return "";
  if (day < 17 || day > 20) return "";

  // RESINDA HOTEL: 17-20/11/2026, 06:00 - 07:20
  if (day >= 17 && day <= 20 && timeMin >= 360 && timeMin <= 440)
    return "RESINDA HOTEL";

  // SRTC: 17-18/11 15:00-16:30  |  19/11 21:00-23:00
  if ((day >= 17 && day <= 18 && timeMin >= 900 && timeMin <= 990) ||
      (day === 19 && timeMin >= 1260 && timeMin <= 1380))
    return "SRTC";

  // BALLROOM: 19/11/2026, 15:30 - 18:00
  if (day === 19 && timeMin >= 930 && timeMin <= 1080)
    return "BALLROOM";

  // WHOOSH TEGALLUAR: 20/11/2026, 08:20 - 09:30
  if (day === 20 && timeMin >= 500 && timeMin <= 570)
    return "WHOOSH TEGALLUAR";

  // MUSEUM KAA: 20/11/2026, 10:00 - 11:30
  if (day === 20 && timeMin >= 600 && timeMin <= 690)
    return "MUSEUM KAA";

  // WHEELS DAGO: 20/11/2026, 12:45 - 13:45
  if (day === 20 && timeMin >= 765 && timeMin <= 825)
    return "WHEELS DAGO";

  // TANGKUBAN PERAHU: 20/11/2026, 15:00 - 16:45
  if (day === 20 && timeMin >= 900 && timeMin <= 1005)
    return "TANGKUBAN PERAHU";

  // KARSALAND: 20/11/2026, 17:00 - 18:00
  if (day === 20 && timeMin >= 1020 && timeMin <= 1080)
    return "KARSALAND";

  return "";
}

// ============================================================
// CORE: klasifikasi AGENDA berdasarkan tanggal
// ============================================================
function _classifyAgenda(day, month, year) {
  if (month !== 11 || year !== 2026) return "";
  if (day === 17) return "ORIENTATION";
  if (day === 18) return "OPENING & COM";
  if (day === 19) return "FUN & AWARDING";
  if (day === 20) return "EXP LEARNING";
  return "";
}

// ============================================================
// Wrapper: ambil tempat dari raw value string / Date
// ============================================================
function getTempatCheckIn(rawValue) {
  if (!rawValue || rawValue === "" || String(rawValue).trim() === "") return "";

  var date;
  if (rawValue instanceof Date) {
    date = rawValue;
  } else {
    date = parseDateString(String(rawValue).trim());
  }
  if (!date || isNaN(date.getTime())) return "";

  var day     = date.getDate();
  var month   = date.getMonth() + 1;
  var year    = date.getFullYear();
  var timeMin = date.getHours() * 60 + date.getMinutes();

  return _classifyTempat(day, month, year, timeMin);
}

// ============================================================
// Wrapper: ambil agenda dari raw value string / Date
// ============================================================
function getAgendaFromCheckIn(rawValue) {
  if (!rawValue || rawValue === "" || String(rawValue).trim() === "") return "";

  var date;
  if (rawValue instanceof Date) {
    date = rawValue;
  } else {
    date = parseDateString(String(rawValue).trim());
  }
  if (!date || isNaN(date.getTime())) return "";

  return _classifyAgenda(date.getDate(), date.getMonth() + 1, date.getFullYear());
}

// ============================================================
// Batch: proses kolom M (TEMPAT) dan K (STATUS) di M.LOOKER
// ============================================================
function klasifikasiTempatCheckIn() {
  var ss    = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) { Logger.log("Sheet '" + SHEET_NAME + "' tidak ditemukan."); return; }

  var lastRow = sheet.getLastRow();
  if (lastRow <= HEADER_ROW) return;

  var dataRows     = lastRow - HEADER_ROW;
  var checkInVals  = sheet.getRange(HEADER_ROW + 1, CHECK_IN_COL, dataRows, 1).getDisplayValues();
  var tempatVals   = sheet.getRange(HEADER_ROW + 1, TEMPAT_COL, dataRows, 1).getDisplayValues();

  var newTempat  = [];
  var newStatus  = [];

  for (var i = 0; i < checkInVals.length; i++) {
    var ci = (checkInVals[i][0] || "").trim();
    var tp = (tempatVals[i][0] || "").trim();

    if (ci && !tp) {
      tp = getTempatCheckIn(ci);
    }

    newTempat.push([tp]);
    newStatus.push([(ci && tp) ? "HADIR" : "BELUM HADIR"]);
  }

  sheet.getRange(HEADER_ROW + 1, TEMPAT_COL, dataRows, 1).setValues(newTempat);
  sheet.getRange(HEADER_ROW + 1, STATUS_COL, dataRows, 1).setValues(newStatus);
  Logger.log("Batch selesai: " + dataRows + " baris diproses.");
}

// ============================================================
// Parser: "dd/MM/yyyy HH:mm:ss"
// ============================================================
function parseDateString(str) {
  var parts = str.split(" ");
  if (parts.length < 2) return null;

  var dp = parts[0].split("/");
  if (dp.length !== 3) return null;

  var tp = parts[1].split(":");
  if (tp.length < 2) return null;

  var day   = parseInt(dp[0], 10);
  var month = parseInt(dp[1], 10) - 1;
  var year  = parseInt(dp[2], 10);
  var hrs   = parseInt(tp[0], 10);
  var mins  = parseInt(tp[1], 10);
  var secs  = tp.length >= 3 ? parseInt(tp[2], 10) : 0;

  return new Date(year, month, day, hrs, mins, secs);
}

// ============================================================
// Trigger: onEdit — isi tempat & status saat kolom L diubah
// ============================================================
function onEdit(e) {
  var sheet = e.source.getActiveSheet();
  if (sheet.getName() !== SHEET_NAME) return;

  var range = e.range;
  if (range.getColumn() !== CHECK_IN_COL) return;
  if (range.getRow() <= HEADER_ROW) return;

  var row = range.getRow();
  var ci  = range.getDisplayValue().trim();
  var tp  = sheet.getRange(row, TEMPAT_COL).getDisplayValue().trim();

  if (ci && !tp) {
    tp = getTempatCheckIn(ci);
    sheet.getRange(row, TEMPAT_COL).setValue(tp);
  }

  sheet.getRange(row, STATUS_COL).setValue((ci && tp) ? "HADIR" : "BELUM HADIR");
}

// ============================================================
// Installable trigger: onChange
// ============================================================
function onChangeHandler(e) {
  if (e.changeType !== "EDIT" && e.changeType !== "INSERT_ROW") return;

  var ss    = e.source || getSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) return;

  var lastRow = sheet.getLastRow();
  if (lastRow <= HEADER_ROW) return;

  var dataRows = lastRow - HEADER_ROW;
  var ciVals   = sheet.getRange(HEADER_ROW + 1, CHECK_IN_COL, dataRows, 1).getDisplayValues();
  var tpVals   = sheet.getRange(HEADER_ROW + 1, TEMPAT_COL, dataRows, 1).getDisplayValues();
  var stVals   = sheet.getRange(HEADER_ROW + 1, STATUS_COL, dataRows, 1).getDisplayValues();

  var newTempat = [];
  var newStatus = [];
  var changed   = false;

  for (var i = 0; i < ciVals.length; i++) {
    var ci = (ciVals[i][0] || "").trim();
    var tp = (tpVals[i][0] || "").trim();

    if (ci && !tp) {
      tp = getTempatCheckIn(ci);
    }

    var expectedSt = (ci && tp) ? "HADIR" : "BELUM HADIR";
    if (tp !== (tpVals[i][0] || "").trim() || expectedSt !== (stVals[i][0] || "").trim()) {
      changed = true;
    }

    newTempat.push([tp]);
    newStatus.push([expectedSt]);
  }

  if (changed) {
    sheet.getRange(HEADER_ROW + 1, TEMPAT_COL, dataRows, 1).setValues(newTempat);
    sheet.getRange(HEADER_ROW + 1, STATUS_COL, dataRows, 1).setValues(newStatus);
  }
}

// ============================================================
// Installable onEdit
// ============================================================
function onEditInstallable(e) {
  try {
    var sheet = e.range.getSheet();
    if (sheet.getName() !== SHEET_NAME) return;
    if (e.range.getColumn() !== CHECK_IN_COL) return;
    if (e.range.getRow() <= HEADER_ROW) return;

    var numRows = e.range.getNumRows();
    for (var i = 0; i < numRows; i++) {
      var row = e.range.getRow() + i;
      var ci  = sheet.getRange(row, CHECK_IN_COL).getDisplayValue().trim();
      var tp  = sheet.getRange(row, TEMPAT_COL).getDisplayValue().trim();

      if (ci && !tp) {
        tp = getTempatCheckIn(ci);
        sheet.getRange(row, TEMPAT_COL).setValue(tp);
      }
      sheet.getRange(row, STATUS_COL).setValue((ci && tp) ? "HADIR" : "BELUM HADIR");
    }
  } catch (err) {
    Logger.log("onEditInstallable error: " + err.message);
  }
}

// ============================================================
// Pasang trigger — jalankan SEKALI
// ============================================================
function pasangTrigger() {
  var ss = getSpreadsheet();

  var existing = ScriptApp.getProjectTriggers();
  for (var i = 0; i < existing.length; i++) {
    var h = existing[i].getHandlerFunction();
    if (h === "onChangeHandler" || h === "onEditInstallable") {
      ScriptApp.deleteTrigger(existing[i]);
    }
  }

  ScriptApp.newTrigger("onChangeHandler")
    .forSpreadsheet(ss).onChange().create();
  ScriptApp.newTrigger("onEditInstallable")
    .forSpreadsheet(ss).onEdit().create();

  Logger.log("Trigger M.LOOKER berhasil dipasang.");
}

// ============================================================
// Hapus semua trigger
// ============================================================
function hapusTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
  Logger.log("Semua trigger dihapus. Total: " + triggers.length);
}

// ============================================================
// Tes klasifikasi — verifikasi aturan baru
// ============================================================
function testKlasifikasi() {
  var cases = [
    { input: "17/11/2026 06:30:00", tempat: "RESINDA HOTEL",    agenda: "ORIENTATION" },
    { input: "18/11/2026 07:00:00", tempat: "RESINDA HOTEL",    agenda: "OPENING & COM" },
    { input: "17/11/2026 15:30:00", tempat: "SRTC",             agenda: "ORIENTATION" },
    { input: "18/11/2026 16:00:00", tempat: "SRTC",             agenda: "OPENING & COM" },
    { input: "19/11/2026 16:00:00", tempat: "BALLROOM",         agenda: "FUN & AWARDING" },
    { input: "19/11/2026 21:30:00", tempat: "SRTC",             agenda: "FUN & AWARDING" },
    { input: "20/11/2026 06:30:00", tempat: "RESINDA HOTEL",    agenda: "EXP LEARNING" },
    { input: "20/11/2026 08:45:00", tempat: "WHOOSH TEGALLUAR", agenda: "EXP LEARNING" },
    { input: "20/11/2026 10:30:00", tempat: "MUSEUM KAA",       agenda: "EXP LEARNING" },
    { input: "20/11/2026 13:00:00", tempat: "WHEELS DAGO",      agenda: "EXP LEARNING" },
    { input: "20/11/2026 15:30:00", tempat: "TANGKUBAN PERAHU", agenda: "EXP LEARNING" },
    { input: "20/11/2026 17:30:00", tempat: "KARSALAND",        agenda: "EXP LEARNING" }
  ];

  var results = [];
  for (var i = 0; i < cases.length; i++) {
    var c  = cases[i];
    var tp = getTempatCheckIn(c.input);
    var ag = getAgendaFromCheckIn(c.input);
    var ok = (tp === c.tempat && ag === c.agenda) ? "OK" : "GAGAL";
    results.push(ok + " | " + c.input +
      " | tempat: " + tp + " (exp: " + c.tempat + ")" +
      " | agenda: " + ag + " (exp: " + c.agenda + ")");
  }
  Logger.log(results.join("\n"));
}

// ============================================================
// Debug rows
// ============================================================
function debugRows() {
  var ss    = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  var lastRow  = sheet.getLastRow();
  var dataRows = lastRow - HEADER_ROW;

  var displayV = sheet.getRange(HEADER_ROW + 1, CHECK_IN_COL, dataRows, 1).getDisplayValues();
  var rawV     = sheet.getRange(HEADER_ROW + 1, CHECK_IN_COL, dataRows, 1).getValues();

  var logs = [];
  for (var i = 0; i < displayV.length; i++) {
    var disp = displayV[i][0];
    var raw  = rawV[i][0];
    if (!disp || !disp.trim()) continue;

    var isDate = raw instanceof Date;
    var parsed = isDate ? raw : parseDateString(disp.trim());
    if (!parsed || isNaN(parsed.getTime())) continue;

    var day     = parsed.getDate();
    var month   = parsed.getMonth() + 1;
    var timeMin = parsed.getHours() * 60 + parsed.getMinutes();

    logs.push(
      "Row " + (i + 2) + " | " + disp +
      " | day=" + day + " month=" + month +
      " | timeMin=" + timeMin +
      " | tempat: " + getTempatCheckIn(disp) +
      " | agenda: " + getAgendaFromCheckIn(disp)
    );
  }
  Logger.log("=== DEBUG ===\n" + logs.join("\n"));
}

// ============================================================
// Menu kustom
// ============================================================
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Otomasi Absensi")
    .addItem("Proses M.LOOKER (Batch)", "klasifikasiTempatCheckIn")
    .addItem("Proses EL1 (Batch)", "processEL1")
    .addItem("Sync EL1 → M.LOOKER", "syncEL1ToMLooker")
    .addItem("Proses + Sync EL1", "processAndSync")
    .addSeparator()
    .addItem("Pasang Trigger M.LOOKER", "pasangTrigger")
    .addItem("Pasang Trigger EL1", "pasangTriggerEL1")
    .addItem("Hapus Semua Trigger", "hapusTrigger")
    .addSeparator()
    .addItem("Tes Klasifikasi", "testKlasifikasi")
    .addItem("Debug Rows", "debugRows")
    .addToUi();
}
