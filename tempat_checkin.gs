/**
 * Fungsi utama untuk mengisi kolom TEMPAT CHECK IN (kolom M)
 * berdasarkan waktu CHECK IN (kolom L) pada sheet M.LOOKER.
 *
 * Jalankan fungsi ini untuk memproses semua baris sekaligus,
 * atau gunakan onEdit trigger untuk otomatis mengisi saat data masuk.
 */

var SHEET_NAME = "M.LOOKER";
var CHECK_IN_COL = 12;     // Kolom L (CHECK IN)
var TEMPAT_COL = 13;       // Kolom M (TEMPAT CHECK IN)
var HEADER_ROW = 1;

// ============================================================
// Fungsi batch: proses semua baris sekaligus
// ============================================================
function klasifikasiTempatCheckIn() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    SpreadsheetApp.getUi().alert("Sheet '" + SHEET_NAME + "' tidak ditemukan.");
    return;
  }

  var lastRow = sheet.getLastRow();
  if (lastRow <= HEADER_ROW) return;

  var dataRows = lastRow - HEADER_ROW;
  var checkInValues = sheet.getRange(HEADER_ROW + 1, CHECK_IN_COL, dataRows, 1).getValues();
  var tempatValues = [];

  for (var i = 0; i < checkInValues.length; i++) {
    var raw = checkInValues[i][0];
    tempatValues.push([getTempatCheckIn(raw)]);
  }

  sheet.getRange(HEADER_ROW + 1, TEMPAT_COL, tempatValues.length, 1).setValues(tempatValues);
}

// ============================================================
// Trigger onEdit: otomatis isi saat kolom L diubah
// ============================================================
function onEdit(e) {
  var sheet = e.source.getActiveSheet();
  if (sheet.getName() !== SHEET_NAME) return;

  var range = e.range;
  if (range.getColumn() !== CHECK_IN_COL) return;
  if (range.getRow() <= HEADER_ROW) return;

  var raw = range.getValue();
  var tempat = getTempatCheckIn(raw);
  sheet.getRange(range.getRow(), TEMPAT_COL).setValue(tempat);
}

// ============================================================
// Logika klasifikasi tempat berdasarkan tanggal & waktu
// ============================================================
function getTempatCheckIn(rawValue) {
  if (!rawValue || rawValue === "") return "";

  var date;
  if (rawValue instanceof Date) {
    date = rawValue;
  } else {
    date = parseDateString(String(rawValue));
  }

  if (!date || isNaN(date.getTime())) return "";

  var day = date.getDate();
  var month = date.getMonth() + 1; // getMonth() 0-indexed
  var year = date.getFullYear();
  var timeMin = date.getHours() * 60 + date.getMinutes();

  if (month !== 11 || year !== 2026) return "";
  if (day < 17 || day > 20) return "";

  // --- Aturan spesifik tanggal tertentu (prioritas lebih tinggi) ---

  // 3. BALLROOM: 19/11/2026, 14:30 - 18:30
  if (day === 19 && timeMin >= 870 && timeMin <= 1110) {
    return "BALLROOM";
  }

  // 4. WHOOSH PADALARANG: 20/11/2026, 08:45 - 10:00
  if (day === 20 && timeMin >= 525 && timeMin <= 600) {
    return "WHOOSH PADALARANG";
  }

  // 5. WHEELS DAGO: 20/11/2026, 12:30 - 14:30
  if (day === 20 && timeMin >= 750 && timeMin <= 870) {
    return "WHEELS DAGO";
  }

  // 6. TANG. PRAHU: 20/11/2026, 14:45 - 16:45
  if (day === 20 && timeMin >= 885 && timeMin <= 1005) {
    return "TANG. PRAHU";
  }

  // 7. KARSA LAND: 20/11/2026, 16:50 - 18:15
  if (day === 20 && timeMin >= 1010 && timeMin <= 1095) {
    return "KARSA LAND";
  }

  // 8. WHOOSH KARAWANG: 20/11/2026, 19:00 - 20:00
  if (day === 20 && timeMin >= 1140 && timeMin <= 1200) {
    return "WHOOSH KARAWANG";
  }

  // --- Aturan rentang tanggal ---

  // 1. LOBBY RENSINDA: 17-20/11/2026, 05:45 - 07:30
  if (day >= 17 && day <= 20 && timeMin >= 345 && timeMin <= 450) {
    return "LOBBY RENSINDA";
  }

  // 2. SRTC: 17-18/11/2026 15:00-17:30, 19/11/2026 21:00-22:30
  if ((day >= 17 && day <= 18 && timeMin >= 900 && timeMin <= 1050) ||
      (day === 19 && timeMin >= 1260 && timeMin <= 1350)) {
    return "SRTC";
  }

  return "";
}

// ============================================================
// Parser untuk format tanggal "dd/MM/yyyy HH:mm:ss"
// ============================================================
function parseDateString(str) {
  // Format: "17/11/2026 06:30:00" atau "17/11/2026 6:30"
  var parts = str.split(" ");
  if (parts.length < 2) return null;

  var dateParts = parts[0].split("/");
  if (dateParts.length !== 3) return null;

  var timeParts = parts[1].split(":");
  if (timeParts.length < 2) return null;

  var day = parseInt(dateParts[0], 10);
  var month = parseInt(dateParts[1], 10) - 1; // Date() bulan 0-indexed
  var year = parseInt(dateParts[2], 10);
  var hours = parseInt(timeParts[0], 10);
  var minutes = parseInt(timeParts[1], 10);
  var seconds = timeParts.length >= 3 ? parseInt(timeParts[2], 10) : 0;

  return new Date(year, month, day, hours, minutes, seconds);
}

// ============================================================
// Menu kustom di spreadsheet
// ============================================================
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Otomasi Absensi")
    .addItem("Isi Tempat Check In", "klasifikasiTempatCheckIn")
    .addToUi();
}
