import base64
import json
import openpyxl
from openpyxl.styles import Alignment
import re
import sys

XLSX_B64_FILE = sys.argv[1]
OUTPUT_FILE = sys.argv[2]

# Country folder → PDF filenames (extracted from Google Drive listing)
pdf_files_by_country_folder = {
    "Singapore": [
        "Visa C2 2026  Muhammad Syawal bin Abdul Razak.pdf",
        "Visa C2 2025 Nicholas Gerard Gomez.pdf",
    ],
    "Maldives": [
        "Visa C2 2026 Mohamed Isham.pdf",
        "Visa C2 2026 Thamoor Adam Moosa.pdf",
        "Visa C2 2026 Aminath Maiha Ahmed.pdf",
        "Visa C2 2026 Chandana Dindu Kumara Hetti Arachchige.pdf",
    ],
    "Taiwan": [
        "Visa C2 2026 Chen Ning Chen.pdf",
        "Visa C2 2026 Kai Lun Huang.pdf",
        "Visa C2 2026 Shu Yuan Chen.pdf",
        "Visa C2 20226 Hao Pang Lin.pdf",
    ],
    "Malaysia": [
        "Visa C2 2026 Muhammad Faizal bin MD Fikri.pdf",
        "Visa C2 2026 Hafizul Affi bin Rusmani.pdf",
        "Visa C2 206 Aidil Adha bin Samsumar.pdf",
        "Visa C2 2026 Kwang Teck Hing.pdf",
        "Visa C2 2026 Mohd Nazri bin MD Yusoff.pdf",
        "Visa C2 2026 Muhammad Al Amin bin Yusri.pdf",
    ],
    "India": [
        "Visa C2 2026 Sagar Narayan Bhalerao.pdf",
        "Visa C2 2026 Vivek Saxena.pdf",
        "Visa C2 2026 Manoj Kumar.pdf",
        "Visa C2 2026 Maqbool Khan Abdulrazak.pdf",
        "Visa C2 2026 Amit Mahata.pdf",
        "Visa C2 2026 Gururaj  Vasantrao  Joshi.pdf",
        "Visa C2 2026 Aromal Parayankattuthara Robson.pdf",
        "Visa C2 2026 Ajay Dahiya.pdf",
    ],
    "Cambodia": [
        "Visa C2 2026 Sokon San.pdf",
        "Visa C2 2026 Dara Teng.pdf",
        "Visa C2 2026 Chetra Ry.pdf",
        "Visa C2 2026 Rattana Chhay.pdf",
        "Visa C2 2026 Rithy Seng.pdf",
        "Visa C2 2026 Sittichai Thaiking.pdf",
        "Visa C2 2026 Nakha Tuon.pdf",
        "Visa C2 2026 Makara Vorn.pdf",
    ],
    "Thailand": [
        "Visa C2 2026 Chawadol Reunthanakul.pdf",
        "Visa C2 2026 Tawatchai Praha.pdf",
        "Visa C2 2026 Pramote Inthisang.pdf",
        "Visa C2 2026 Nathawut Loisaioo.pdf",
        "Visa C2 2026 Wanchai Srinothai.pdf",
        "Visa C2 2026 Dusit Namsue.pdf",
        "Visa C2 2026 Tawee Bunrat.pdf",
        "Visa C2 2026 Thawin Jiengram.pdf",
        "Visa C2 2026 Tanasate Tanapornchockanun.pdf",
        "Visa C2 2026 Sitichok Reansritongkam.pdf",
        "Visa C2 2026 Noppharat Dimun.pdf",
    ],
    "Vietnam": [
        "Visa C2 2026 Quoc Long Mac.pdf",
        "Visa C2 2026 Xuan Bien Phung.pdf",
        "Visa C2 2026 Quang Hieu Dau.pdf",
        "Visa C2 2026 Duy Lam Vu.pdf",
        "Visa C2 2026 Van Phu Tran.pdf",
        "Visa C2 2026 Van Nguyen Nguyen.pdf",
        "Visa C2 2026 Thanh Tuan Le.pdf",
        "Visa C2 2026 Van Linh Nguyen.pdf",
        "Visa C2 2026 Cong Thanh Bui.pdf",
        "Visa C2 2026 Hong Quang Nguyen.pdf",
        "Visa C2 2025 Van Phu Tran.pdf",
        "Visa C2 2026 Xuan Thang Le.pdf",
        "Visa C2 2026 Van Tuan Song Hoang.pdf",
    ],
}

def extract_name_from_pdf(filename):
    """Extract the person's name from a PDF filename like 'Visa C2 2026 John Doe.pdf'"""
    name = filename.replace(".pdf", "")
    # Remove "Visa C2 YYYY " or "Visa C2 YYYYY " prefix (handles typos like 20226, 206)
    name = re.sub(r'^Visa C2\s+\d+\s+', '', name)
    return name.strip()

def normalize_name(name):
    """Normalize a name for comparison: lowercase, remove extra spaces, sort words"""
    name = name.lower().strip()
    name = re.sub(r'\s+', ' ', name)  # collapse multiple spaces
    return name

def name_words(name):
    """Get sorted set of words from a name"""
    n = normalize_name(name)
    # Remove common non-name parts
    words = n.split()
    # Filter out very short connector words for Malay names
    return set(words)

def fuzzy_word_match(name1_words, name2_words):
    """
    Check if two name word-sets match with tolerance for:
    - Different word order
    - Minor spelling differences (Levenshtein distance)
    - Missing/extra middle names
    """
    if not name1_words or not name2_words:
        return 0.0

    # Exact word overlap
    common = name1_words & name2_words
    total = name1_words | name2_words

    if len(common) == len(total):
        return 1.0  # perfect match

    # Try fuzzy matching for remaining words
    unmatched1 = name1_words - common
    unmatched2 = name2_words - common

    fuzzy_matches = 0
    used2 = set()
    for w1 in unmatched1:
        best_score = 0
        best_w2 = None
        for w2 in unmatched2:
            if w2 in used2:
                continue
            score = word_similarity(w1, w2)
            if score > best_score:
                best_score = score
                best_w2 = w2
        if best_score >= 0.7 and best_w2:
            fuzzy_matches += 1
            used2.add(best_w2)

    matched = len(common) + fuzzy_matches
    total_words = max(len(name1_words), len(name2_words))

    return matched / total_words if total_words > 0 else 0.0

def word_similarity(w1, w2):
    """Simple character-level similarity between two words"""
    if w1 == w2:
        return 1.0
    # Check if one contains the other
    if w1 in w2 or w2 in w1:
        return max(len(w1), len(w2)) / (max(len(w1), len(w2)) + 1)
    # Levenshtein-like ratio
    d = levenshtein(w1, w2)
    max_len = max(len(w1), len(w2))
    return 1.0 - d / max_len if max_len > 0 else 0.0

def levenshtein(s1, s2):
    if len(s1) < len(s2):
        return levenshtein(s2, s1)
    if len(s2) == 0:
        return len(s1)
    prev_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        curr_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = prev_row[j + 1] + 1
            deletions = curr_row[j] + 1
            substitutions = prev_row[j] + (c1 != c2)
            curr_row.append(min(insertions, deletions, substitutions))
        prev_row = curr_row
    return prev_row[-1]

# Map spreadsheet country names to folder names
country_mapping = {
    "maldives": "Maldives",
    "cambodia": "Cambodia",
    "taiwan": "Taiwan",
    "malaysia": "Malaysia",
    "singapore": "Singapore",
    "india": "India",
    "thailand": "Thailand",
    "vietnam": "Vietnam",
    "philippines": None,  # No folder for Philippines
}

# Build PDF name index by country
pdf_names_by_country = {}
for folder_country, files in pdf_files_by_country_folder.items():
    names = []
    for f in files:
        name = extract_name_from_pdf(f)
        names.append((name, name_words(name)))
    pdf_names_by_country[folder_country.lower()] = names

# Load xlsx
with open(XLSX_B64_FILE, 'r') as f:
    b64_data = f.read()
xlsx_bytes = base64.b64decode(b64_data)

import io
wb = openpyxl.load_workbook(io.BytesIO(xlsx_bytes))
ws = wb.active

# Find header row
header_row = None
for row in ws.iter_rows(min_row=1, max_row=5):
    for cell in row:
        if cell.value and str(cell.value).strip().lower() == 'no.':
            header_row = cell.row
            break
    if header_row:
        break

if not header_row:
    print("ERROR: Could not find header row")
    sys.exit(1)

print(f"Header row: {header_row}")

# Get column indices
headers = {}
for cell in ws[header_row]:
    if cell.value:
        headers[str(cell.value).strip().lower()] = cell.column

print(f"Headers: {headers}")

col_no = headers.get('no.', headers.get('no', 1))
col_name = headers.get('full name', 3)
col_country = headers.get('country', 4)
col_ket = headers.get('ket', 8)  # Column H = 8

print(f"Using columns: No={col_no}, Name={col_name}, Country={col_country}, Ket={col_ket}")

# Process each participant
results = []
matched_count = 0
unmatched_count = 0

for row_idx in range(header_row + 1, ws.max_row + 1):
    no_val = ws.cell(row=row_idx, column=col_no).value
    name_val = ws.cell(row=row_idx, column=col_name).value
    country_val = ws.cell(row=row_idx, column=col_country).value
    ket_val = ws.cell(row=row_idx, column=col_ket).value

    if not name_val or not country_val:
        continue

    name_str = str(name_val).strip()
    country_str = str(country_val).strip()
    country_key = country_str.lower()

    # Get PDF names for this country
    folder_key = country_mapping.get(country_key, country_key)
    if folder_key is None:
        results.append({
            "row": row_idx,
            "no": no_val,
            "name": name_str,
            "country": country_str,
            "match": None,
            "score": 0,
            "status": "NO_FOLDER",
        })
        unmatched_count += 1
        continue

    pdf_names = pdf_names_by_country.get(folder_key.lower(), [])
    if not pdf_names:
        results.append({
            "row": row_idx,
            "no": no_val,
            "name": name_str,
            "country": country_str,
            "match": None,
            "score": 0,
            "status": "NO_PDFS",
        })
        unmatched_count += 1
        continue

    # Try to match
    spreadsheet_words = name_words(name_str)
    best_score = 0
    best_match = None

    for pdf_name, pdf_words in pdf_names:
        score = fuzzy_word_match(spreadsheet_words, pdf_words)
        if score > best_score:
            best_score = score
            best_match = pdf_name

    if best_score >= 0.6:
        # Mark as matched
        ws.cell(row=row_idx, column=col_ket).value = "√"
        ws.cell(row=row_idx, column=col_ket).alignment = Alignment(horizontal='center')
        matched_count += 1
        results.append({
            "row": row_idx,
            "no": no_val,
            "name": name_str,
            "country": country_str,
            "match": best_match,
            "score": round(best_score, 2),
            "status": "MATCHED",
        })
    else:
        unmatched_count += 1
        results.append({
            "row": row_idx,
            "no": no_val,
            "name": name_str,
            "country": country_str,
            "match": best_match,
            "score": round(best_score, 2),
            "status": "NOT_FOUND",
        })

# Save modified xlsx
wb.save(OUTPUT_FILE)

# Print results
print(f"\n{'='*100}")
print(f"VISA C2 MATCHING RESULTS")
print(f"{'='*100}")
print(f"Total participants: {len(results)}")
print(f"Matched (√): {matched_count}")
print(f"Not matched: {unmatched_count}")
print(f"{'='*100}\n")

print(f"{'No.':<5} {'Status':<12} {'Score':<7} {'Spreadsheet Name':<45} {'Country':<15} {'Matched PDF Name'}")
print(f"{'-'*5} {'-'*12} {'-'*7} {'-'*45} {'-'*15} {'-'*40}")
for r in results:
    status_icon = "✓" if r['status'] == 'MATCHED' else "✗"
    match_str = r['match'] or "---"
    print(f"{r['no']:<5} {status_icon} {r['status']:<10} {r['score']:<7} {r['name']:<45} {r['country']:<15} {match_str}")

print(f"\n{'='*100}")
print(f"UNMATCHED PARTICIPANTS:")
print(f"{'='*100}")
for r in results:
    if r['status'] != 'MATCHED':
        print(f"  Row {r['row']}: No.{r['no']} - {r['name']} ({r['country']}) - Status: {r['status']}, Best match: {r['match']} (score: {r['score']})")
