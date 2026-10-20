/**
 * ====================================================================
 * VISA C2 CHECK AUTOMATION - Google Apps Script
 * ====================================================================
 * Otomasi pencocokan file PDF Visa C2 di Google Drive
 * dengan daftar peserta di Google Sheets.
 *
 * CARA PAKAI:
 * 1. Buka Google Sheets yang berisi daftar peserta
 * 2. Menu: Extensions > Apps Script
 * 3. Copy-paste seluruh kode ini
 * 4. Isi FOLDER_ID di bagian CONFIG
 * 5. Sesuaikan kolom jika perlu
 * 6. Klik Run > visaCheck
 * ====================================================================
 */

// ===================== KONFIGURASI =====================
const CONFIG = {
  // ID folder Google Drive yang berisi subfolder negara (masing-masing berisi PDF visa)
  // Contoh: https://drive.google.com/drive/folders/1VFZxaDgDhDz8NfQlppEK0V6yXgklVvlH
  //         FOLDER_ID = "1VFZxaDgDhDz8NfQlppEK0V6yXgklVvlH"
  FOLDER_ID: "",

  // Nama sheet yang berisi data peserta
  SHEET_NAME: "Sheet1",

  // Kolom-kolom (1-indexed)
  NAME_COL: 3,       // Kolom C = Full Name
  COUNTRY_COL: 4,    // Kolom D = Country
  KET_COL: 8,        // Kolom H = Ket (akan diisi √)

  // Baris pertama data (setelah header)
  FIRST_DATA_ROW: 2,

  // Threshold pencocokan (0.0 - 1.0)
  MATCH_THRESHOLD: 0.7,
  FUZZY_WORD_THRESHOLD: 0.65,
};

// ===================== FUNGSI UTAMA =====================

function visaCheck() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    SpreadsheetApp.getUi().alert("Sheet '" + CONFIG.SHEET_NAME + "' tidak ditemukan!");
    return;
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < CONFIG.FIRST_DATA_ROW) {
    SpreadsheetApp.getUi().alert("Tidak ada data di sheet!");
    return;
  }

  if (!CONFIG.FOLDER_ID) {
    SpreadsheetApp.getUi().alert(
      "FOLDER_ID belum diisi!\n\n" +
      "Buka Script Editor, isi FOLDER_ID di bagian CONFIG\n" +
      "dengan ID folder Google Drive yang berisi subfolder negara."
    );
    return;
  }

  // 1. Scan folder Drive untuk mendapatkan semua PDF per negara
  SpreadsheetApp.getActiveSpreadsheet().toast("Scanning folder Drive...", "Visa Check", -1);
  const pdfsByCountry = scanDriveFolder(CONFIG.FOLDER_ID);

  const countryCount = Object.keys(pdfsByCountry).length;
  let totalPdfs = 0;
  for (const c in pdfsByCountry) totalPdfs += pdfsByCountry[c].length;
  Logger.log("Ditemukan " + countryCount + " negara, " + totalPdfs + " file PDF");

  // 2. Baca data peserta dari sheet
  const dataRange = sheet.getRange(CONFIG.FIRST_DATA_ROW, 1, lastRow - CONFIG.FIRST_DATA_ROW + 1, Math.max(CONFIG.NAME_COL, CONFIG.COUNTRY_COL, CONFIG.KET_COL));
  const data = dataRange.getValues();

  // 3. Cocokkan setiap peserta
  let matchedCount = 0;
  let unmatchedCount = 0;
  const results = [];

  for (let i = 0; i < data.length; i++) {
    const name = String(data[i][CONFIG.NAME_COL - 1] || "").trim();
    const country = String(data[i][CONFIG.COUNTRY_COL - 1] || "").trim();

    if (!name) continue;

    const countryKey = country.toLowerCase();
    const pdfNames = pdfsByCountry[countryKey] || [];

    if (pdfNames.length === 0) {
      unmatchedCount++;
      results.push({ row: CONFIG.FIRST_DATA_ROW + i, matched: false, reason: "Tidak ada folder/PDF untuk " + country });
      continue;
    }

    const nameWords = getNameWords(name);
    let bestScore = 0;
    let bestMatch = "";

    for (let j = 0; j < pdfNames.length; j++) {
      const pdfNameWords = getNameWords(pdfNames[j]);
      const score = fuzzyWordMatch(nameWords, pdfNameWords);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = pdfNames[j];
      }
    }

    if (bestScore >= CONFIG.MATCH_THRESHOLD) {
      matchedCount++;
      results.push({ row: CONFIG.FIRST_DATA_ROW + i, matched: true, pdfName: bestMatch, score: bestScore });
      sheet.getRange(CONFIG.FIRST_DATA_ROW + i, CONFIG.KET_COL).setValue("√");
    } else {
      unmatchedCount++;
      results.push({ row: CONFIG.FIRST_DATA_ROW + i, matched: false, reason: "Nama tidak cocok (best: " + (bestScore * 100).toFixed(0) + "%)" });
    }
  }

  // 4. Tampilkan hasil
  SpreadsheetApp.getActiveSpreadsheet().toast(
    "Selesai! Cocok: " + matchedCount + ", Tidak cocok: " + unmatchedCount,
    "Visa Check",
    10
  );

  // Log detail
  Logger.log("========== HASIL PENCOCOKAN VISA C2 ==========");
  Logger.log("Total cocok: " + matchedCount);
  Logger.log("Total tidak cocok: " + unmatchedCount);
  Logger.log("");
  for (let r = 0; r < results.length; r++) {
    const res = results[r];
    if (res.matched) {
      Logger.log("Row " + res.row + ": COCOK -> " + res.pdfName + " (" + (res.score * 100).toFixed(0) + "%)");
    } else {
      Logger.log("Row " + res.row + ": TIDAK COCOK - " + res.reason);
    }
  }

  SpreadsheetApp.getUi().alert(
    "Visa Check Selesai!\n\n" +
    "Cocok (√): " + matchedCount + " peserta\n" +
    "Tidak cocok: " + unmatchedCount + " peserta\n\n" +
    "Detail ada di menu View > Logs"
  );
}

// ===================== SCAN DRIVE =====================

function scanDriveFolder(folderId) {
  const pdfsByCountry = {};
  const rootFolder = DriveApp.getFolderById(folderId);
  const subFolders = rootFolder.getFolders();

  while (subFolders.hasNext()) {
    const folder = subFolders.next();
    const countryName = folder.getName().toLowerCase();
    const pdfNames = [];

    const files = folder.getFilesByType(MimeType.PDF);
    while (files.hasNext()) {
      const file = files.next();
      const extractedName = extractNameFromPdf(file.getName());
      if (extractedName) {
        pdfNames.push(extractedName);
      }
    }

    if (pdfNames.length > 0) {
      pdfsByCountry[countryName] = pdfNames;
    }
  }

  // Juga cek PDF langsung di root folder (jika ada)
  const rootFiles = rootFolder.getFilesByType(MimeType.PDF);
  const rootPdfs = [];
  while (rootFiles.hasNext()) {
    const file = rootFiles.next();
    const extractedName = extractNameFromPdf(file.getName());
    if (extractedName) rootPdfs.push(extractedName);
  }
  if (rootPdfs.length > 0) {
    pdfsByCountry["_root"] = rootPdfs;
  }

  return pdfsByCountry;
}

function extractNameFromPdf(filename) {
  // Hapus ekstensi .pdf
  let name = filename.replace(/\.pdf$/i, "");
  // Hapus prefix "Visa C2 YYYY" atau variasi (typo tahun dll)
  name = name.replace(/^Visa\s+C2\s+\d+\s+/i, "");
  return name.trim();
}

// ===================== NAME MATCHING =====================

function getNameWords(name) {
  return name.toLowerCase().trim().replace(/\s+/g, " ").split(" ");
}

function levenshtein(s1, s2) {
  if (s1.length < s2.length) return levenshtein(s2, s1);
  if (s2.length === 0) return s1.length;

  let prevRow = [];
  for (let j = 0; j <= s2.length; j++) prevRow[j] = j;

  for (let i = 0; i < s1.length; i++) {
    const currRow = [i + 1];
    for (let j = 0; j < s2.length; j++) {
      const insertCost = prevRow[j + 1] + 1;
      const deleteCost = currRow[j] + 1;
      const subCost = prevRow[j] + (s1[i] !== s2[j] ? 1 : 0);
      currRow[j + 1] = Math.min(insertCost, deleteCost, subCost);
    }
    prevRow = currRow;
  }
  return prevRow[s2.length];
}

function wordSimilarity(w1, w2) {
  if (w1 === w2) return 1.0;
  if (w1.includes(w2) || w2.includes(w1)) {
    return Math.max(w1.length, w2.length) / (Math.max(w1.length, w2.length) + 1);
  }
  const d = levenshtein(w1, w2);
  const maxLen = Math.max(w1.length, w2.length);
  return maxLen > 0 ? 1.0 - d / maxLen : 0.0;
}

function fuzzyWordMatch(words1, words2) {
  if (words1.length === 0 || words2.length === 0) return 0.0;

  const set1 = new Set(words1);
  const set2 = new Set(words2);

  // Hitung kata yang sama persis
  const common = new Set();
  for (const w of set1) {
    if (set2.has(w)) common.add(w);
  }

  // Jika semua kata sama
  const allWords = new Set([...set1, ...set2]);
  if (common.size === allWords.size) return 1.0;

  // Kata yang belum cocok
  const unmatched1 = [...set1].filter(w => !common.has(w));
  const unmatched2 = [...set2].filter(w => !common.has(w));

  // Fuzzy matching untuk kata yang belum cocok
  let fuzzyMatches = 0;
  const used2 = new Set();

  for (const w1 of unmatched1) {
    let bestScore = 0;
    let bestW2 = null;
    for (const w2 of unmatched2) {
      if (used2.has(w2)) continue;
      const score = wordSimilarity(w1, w2);
      if (score > bestScore) {
        bestScore = score;
        bestW2 = w2;
      }
    }
    if (bestScore >= CONFIG.FUZZY_WORD_THRESHOLD && bestW2 !== null) {
      fuzzyMatches++;
      used2.add(bestW2);
    }
  }

  // Hitung skor total (exact match = 1.0, fuzzy match = 0.7)
  const exactWeight = common.size * 1.0;
  const fuzzyWeight = fuzzyMatches * 0.7;
  const totalWords = Math.max(set1.size, set2.size);
  return totalWords > 0 ? (exactWeight + fuzzyWeight) / totalWords : 0.0;
}

// ===================== MENU =====================

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Visa Check")
    .addItem("Jalankan Pencocokan Visa C2", "visaCheck")
    .addItem("Reset Kolom Ket", "resetKet")
    .addToUi();
}

function resetKet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) return;
  const lastRow = sheet.getLastRow();
  if (lastRow < CONFIG.FIRST_DATA_ROW) return;
  sheet.getRange(CONFIG.FIRST_DATA_ROW, CONFIG.KET_COL, lastRow - CONFIG.FIRST_DATA_ROW + 1, 1).clearContent();
  SpreadsheetApp.getUi().alert("Kolom Ket sudah direset.");
}
