/**
 * ============================================================
 * AOC 2026 — Dashboard API
 * ============================================================
 *
 * Web app endpoint yang membaca data dari sheet M.LOOKER
 * dan mengembalikan JSON untuk dashboard attendance tracker.
 *
 * CARA DEPLOY:
 * 1. Buka project Apps Script yang sama dengan tempat_checkin.gs
 *    (di spreadsheet: Extensions > Apps Script)
 * 2. Buat file baru (+ > Script) dan paste seluruh kode ini
 * 3. Klik Deploy > New deployment
 *    - Type      : Web app
 *    - Execute as : Me
 *    - Who has access : Anyone
 * 4. Klik Deploy, lalu copy URL web app-nya
 * 5. Paste URL tersebut ke variabel API_URL di dashboard.html
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
  try {
    var ss = SpreadsheetApp.openById("1S3nAnX5ije6prGTwnJ7sZsdYmQtu7q8g");
    var sheet = ss.getSheetByName("M.LOOKER");

    if (!sheet) {
      return _json({ error: "Sheet M.LOOKER tidak ditemukan" });
    }

    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return _json({
        cutoff: _cutoff(),
        uniqueParticipants: 0,
        countryTargets: {},
        agendaTargets: {},
        participants: []
      });
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

    return _json({
      cutoff:             _cutoff(),
      uniqueParticipants: Object.keys(seenNames).length,
      countryTargets:     countryTargets,
      agendaTargets:      agendaTargets,
      participants:       participants
    });

  } catch (err) {
    return _json({ error: err.message });
  }
}

function _cutoff() {
  return Utilities.formatDate(new Date(), "Asia/Jakarta", "dd MMM yyyy · HH:mm") + " WIB";
}

function _json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
