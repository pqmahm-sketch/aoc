import html

lo_map = {
    ("Maldives", "Sheesha Pvt Ltd"): "Boyke",
    ("Cambodia", "NCX-C"): "Fajar",
    ("Philippines", "HPI"): "Fajar",
    ("Taiwan", "HTW"): "Ricky",
    ("Malaysia", "BSH"): "Jordan",
    ("Singapore", "BSS"): "Jordan",
    ("India", "HMSI"): "Jordan",
    ("Thailand", "ASH"): "No LO",
    ("Thailand", "TH"): "Ricky",
    ("Vietnam", "HVN"): "Salik",
}

# Photo mapping: participant name -> Google Drive file ID
photo_map = {
    # Maldives
    "THAIMOOR ADAM MOOSA": "1BrddxM2Zo6k6_5ZPGkhSVDjloL8g8eQT",
    "AMINATH MAIHA AHMED": "1cKJ9rVVQ65zAwbBcSBkSB2ttbpsXppvE",
    # Cambodia
    "THAIKING SITTICHAI": "1bP_5ZAZXE21PSqYgZnzwLncluzcLl2EN",
    "VORN MAKARA": "1Pjh8RcGGORoaT2n61_YQ2wq-iWrBsYYJ",
    "TUON NAKHA": "1nXinWnny_Z1Pmi0Nxdvti-Wxlj-jG2k5",
    "RY CHETRA": "18g0BAmnJc5SpVtYXNMfwY1xd-kb5spLB",
    "SENG RITHY": "1DHGjpNNVfVfGD7chTnnZ4Xet7OON4QbO",
    "CHHAY RATTANA": "1bMjJ0aL_zl1GCJCuJ9imKaEiwkKJ3TOv",
    "SAN SOKON": "1Orn_ZXPsbLhabyNx0jzRj5Epff-xnZNe",
    "TENG DARA": "18WbS-sZI0oQ5WCzqis1Ah-Vfw-ZSIebP",
    # Philippines
    "JAY M. BERNABE": "16-X2x8so4pTmfA44b_XtdXvxoPJinLPL",
    "CYRUS L. PAGARAN": "112IODJc0k7Gp2qfghVaVfDVScvF0a_yj",
    "PETER JHON M. BARENG": "1KtUCrBBOBop153njp5XRHCNX5yE3IaGQ",
    "ALBERTO M. ALABAR": "1-q-6zuQtH7Nk4x5Nrq2LrEM3m7jP4aSC",
    "MARK JOHN V. BLAS": "1C7pifeuJ7aET0AyrUeFxeTXC8ry9A6FS",
    "JUSTINE B. SUYOM": "117I98ZTZWj7Gf1HtKz45SqqwrgperIEl",
    "AARON GLENN P. AGUILAR": "1OKTbU9baykF-ZFqyfVKPCgfZ440LN6mP",
    # Taiwan
    "LIN HAO PANG": "1A5XK_eXHWg1-TgN38-1TGr6XhAGzJPCS",
    "HUANG KAI LUN": "1hB_sRId7JDmimxAAeJ8pPTRfsBzjiYED",
    "CHEN SHU YUAN": "1IL2YzMEF7D2UixjWBFR8yjSyY7uAJvXK",
    "CHEN CHIEH NING": "17jrKQnWiRmjEjSEJnZViLk0b211ibIw8",
    # Malaysia
    "MUHAMMAD AL AMIN BIN YUSRI": "1I_FpLK5SA7koDW-cD0XD6lOyP5noTc0D",
    "MOHD NAZRI BIN MD YUSOFF": "1sUzTLwAg8xOrQrLmegjCR4owQ_P6F2op",
    "KWANG TECK HING": "1o27aKRfC09Ipd7BsPKpxILejgfZKra-T",
    "HAFIZUL AFIFI BIN RUSMANI": "1A3Rb_iOvkE7_hx2EFAIqSfziymv8mb_M",
    "AIDIL ADHA BIN SAMSUMAR": "1sdiy4-PICuxtt7j377nonAdvmvJr_k-W",
    "MUHAMMAD FAIZAL BIN MD FIKRI": "16ARHuZ4lXvBxBxefI_jfrFhF3LtTK93f",
    # Singapore
    "NICHOLAS GERARD GOMEZ": "1_FOi9JVj5ThhwDC67Q71o1TcBCZUVNQY",
    "MUHAMMAD SYAWAL BIN ABDUL RAZAK": "1-tgwpfFoyZrC1n-St-GglOu9YPsVDmYs",
    # India
    "SAGAR NARAYAN BHALERAO": "1QQ7N3dqV5QlLrcGUhb4dZ54eUHosxsKN",
    "ABDULRAZAK MAQBOOL KHAN": "1xcI2v0e9q3iM4TQQq-Dwti_IHmiVCWZ_",
    "GURURAJ VASANTRAO JOSHI": "1kq-Ifb4wdy0rlvd2HoDPhnnQlYDr69JE",
    "AROMAL P. ROBSON": "14ZLsUg-SBPQKBxXcGwrLrAxRfdlCPquH",
    "AJAY DAHIYA": "1bNI9g6-5_PVErkZXBTQlsHL7YiFPLrQQ",
    "VIVEK SAXENA": "1Mv3EYJlNXePUYoESvJ_8R8wDvH6d1mfH",
    "MANOJ KUMAR": "1-jEKRRULSKVzN8MKwjKG3RFDvvloVrIW",
    "AMIT MAHATA": "16hca0SZSWDcM2Iclv85KxlHLzj0Fv2ND",
    # Thailand TH
    "PRAMOTE INTHISANG": "1knM0COGuz2FN-Ai3SIYMeQ3YN0WBCT9i",
    "NOPPHARAT DIMUN": "1fAxabDz-P3udyXTUMM9oplFHSD05OOXN",
    "NATHAWUT LOISAIOO": "12rK5eTD7NrWy5cikr2isaUoAw0W6QVYb",
    "DUSIT NAMSUE": "1Go-7R6qQXXrJiNKVxdaOk32SB8UshsVS",
    "CHAWADOL REUNTHANAKUL": "1p1I1ckgPcymFSHhSgOikJN0gTF0TJmiW",
    "WANCHAI SRINOTHAI": "1ldAE4AtVdOj_TjidCiOy_8l8zFmBkBau",
    "THAWIN JIENGRAM": "1R6tZNwZcbfzBQ4ivsCdF__9QXG_cNDRf",
    "TAWEE BUNRAT": "1i2LbA-C8KHHYUOW8wRVdFPVfryxBVSzB",
    "TAWATCHAI PRAHA": "1ZAjyRvKIBlfaU-y79s641AFfosBguNPf",
    "TANASATE TANAPORNCHOCKANUN": "1fRdlvr8WOfuLaIRZ0SMV7cRzciigyWv_",
    "SITTICHOK REANSRITONGKAM": "1tDLe_MsujlrXYWAsU1xA6TqolKiAFbwt",
    # Thailand ASH
    "TEERAPONG PROMDEE": "1K42slIH9dApCN7Gka_s5DW_U-zAazfou",
    "SUKRIS KONGPONG": "1YPjgBlWNwP5ZHQj2tXmDwzbYdVNr8zfW",
    "PRASERT VICHITKULSAWAT": "1Ntbv99lm126o1E_io0_pr2v9LSXrBxi-",
    "NAPHATSORN SILWATTA": "15mbImQtA7_GF2rZ3Ln0zW92DY8YVxXpX",
    "TOSHIYA TAKENAGA": "1etDNulUeMQOAsZBHWMwbNM9nKYzVUb96",
    "WISIT SOMWANGSIRI": "14KLONH9dyAkZ5_x21dALXkzRo1w42sKL",
    "SARISA INGKANANTAWAREE": "1Ebj1im4YQzf3Wm5GbYyeVCaoXlzZJHZH",
    "POOHRIN WUTTHIKAIUDOMDAJ": "1Rdt4OZ7_duaZv-ahkxnloAv4G270ZZse",
    "WIMONRAT HIRANWONG": "1p0o6_ChiIMrJCqcAdIO00Yb1ketsR_S6",
    "PICHAYAPORN CHAIYARUNGROJ": "11-jOlaZHb-kFCNXQ5z5xQOaM4B0QHHAa",
    "PONGSATORN PROMWANG": "1yclou-LZuX2kiQGp7fFko2_ZJcnVRiCQ",
    "PHORNTHIP SUNTISUKKASEM": "17LGuvZM4lQGHeqRAlCB3cfo3X9zK1OuJ",
    "CHOMPOONUCH ASAWACHAISUWIKROM": "1HlHqSk_WTjx9Dr4jXJtBO-dPb9kqpibc",
    "KANCHANA PARINYAPORNKUN": "1HgXc_Td4HMk1yPz-iTsPKjnYCUCJibei",
    "PAKORN BOONPIAMSAK": "1oMr5D0HAV1ZPGVf6vG6qHvbZ4E2I4L7-",
    "HIROSHI ISHIDA": "1-ceng2-18L46wK2i7zqaq_kjHwuKxQJT",
    "KANLAYAPHAS BOONYATEERAPAT": "1dAz5HAwBffVejoUuS68ux9SWfop1X-RQ",
    "NUTCHAREE SUKHO": "1eG2EErru6mWECkbuJnpRhmll8MzwLrOi",
    "MANIDA KAEWPHETSUWAN": "1KSwEDeYhw4bNEViRdPYhSn3Hz_8RlCtx",
    "CHANATHIP SARTTAYARAT": "1PBhQb-5W3oibP7wsYjubQIgRd6fqgC2y",
    # Vietnam
    "VU DUY LAM": "1KOE-UV9EQdpbw9r06dRif10X8gPp5k2P",
    "DAU QUANG HIEU": "1-66nQULHklqeMzv-4JmAA8WWniHrrfyl",
    "NGUYEN VAN CHUYEN": "1JevFPoJQWgK-7diD-VnY9YIchLs0z0_x",
    "TRAN VAN PHU": "1xuJJHAxyDolpmv9q710AkJyQ-eFE3yW9",
    "NGUYEN HONG THANH": "1Bm_hCiFXS-AI6QiEQYUOHu10XZMQ4mXJ",
    "NGUYEN VAN LINH": "1Wjf5wDChvR4020LhwpTQDPnt2UoO9f5D",
    "TRAN BAO KHA": "1Yu_doF9YAgwMCHa3FCV0USxVLFhRv2Hp",
    "PHUNG XUAN BIEN": "1YjAAxfMbzExHGMoRZYH25XPMs-SuIYLL",
    "NGUYEN HONG QUANG": "1eVDMQmy9LjCJENfWbcfEZqZ18zEQ3e-4",
    "LE XUAN THANG": "1p0GL7IRcQz1p2qJGiMCRgyYqeqhvre8_",
    "MAC QUOC LONG": "1BrrJJ_OlRmFBIUOS98YGJtGZy866K6Up",
    "LE THANH TUAN": "1U7wjCEKoiiVxdE4xAFYccFhleTsG_3B4",
    "BUI CONG THANH": "1y7W3UfaduZbv2afyPzHSlBflHGxz5dJi",
    "HOANG VAN TUAN SONG": "19q1_MxSvPEMxEnjS6mQVKhuG6T3d4uDh",
}

import os, base64

PHOTO_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "photos_compressed")

def get_photo_url(name):
    fid = photo_map.get(name)
    if fid:
        local_path = os.path.join(PHOTO_DIR, f"{fid}.jpg")
        if os.path.exists(local_path):
            return f"file://{local_path}"
    return None

participants = [
    {"no": 1, "country": "Maldives", "company": "Sheesha Pvt Ltd", "role": "Contestant", "contest": "COM1", "title": "Mr.", "name": "CHANDANA DINIDU KUMARA HETTI ARACHCHIGE", "email": "chandana@sheesha.com.mv", "phone": "00960 9412268", "position": "Chief Technician", "language": "English", "food": "Others (No restriction)", "transfer_arr": "No", "transfer_dep": "No", "vehicle": "-"},
    {"no": 2, "country": "Maldives", "company": "Sheesha Pvt Ltd", "role": "Escort", "contest": "-", "title": "Ms.", "name": "AMINATH MAIHA AHMED", "email": "maiha@sheesha.com.mv", "phone": "00960 7909011", "position": "Chief Operating Officer", "language": "English", "food": "Others (No restriction)", "transfer_arr": "No", "transfer_dep": "No", "vehicle": "-"},
    {"no": 3, "country": "Maldives", "company": "Sheesha Pvt Ltd", "role": "Escort", "contest": "-", "title": "Mr.", "name": "THAIMOOR ADAM MOOSA", "email": "thaimoor.adam@sheesha.com.mv", "phone": "00960 9955303", "position": "Division Manager Service", "language": "English", "food": "Others (No restriction)", "transfer_arr": "No", "transfer_dep": "No", "vehicle": "-"},
    {"no": 4, "country": "Maldives", "company": "Sheesha Pvt Ltd", "role": "Escort", "contest": "-", "title": "Mr.", "name": "MOHAMED ISHAM", "email": "isham@sheesha.com.mv", "phone": "00960 7778607", "position": "Division Manager Sales", "language": "English", "food": "Muslim (No Pork, No Alcohol)", "transfer_arr": "No", "transfer_dep": "No", "vehicle": "-"},
    {"no": 5, "country": "Cambodia", "company": "NCX-C", "role": "Contestant", "contest": "COM1", "title": "Mr.", "name": "RY CHETRA", "email": "Pheak68.tra56789@gmail.com", "phone": "+85510228227", "position": "Technician", "language": "Khmer", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace (8 pax)"},
    {"no": 6, "country": "Cambodia", "company": "NCX-C", "role": "Contestant", "contest": "COM1", "title": "Mr.", "name": "SAN SOKON", "email": "sokoun013@gmail.com", "phone": "+85586727243", "position": "Technician", "language": "Khmer", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace (8 pax)"},
    {"no": 7, "country": "Cambodia", "company": "NCX-C", "role": "Contestant", "contest": "COM2", "title": "Mr.", "name": "TUON NAKHA", "email": "gaha9122@gmail.com", "phone": "+85587979596", "position": "Technician", "language": "Khmer", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace (8 pax)"},
    {"no": 8, "country": "Cambodia", "company": "NCX-C", "role": "Contestant", "contest": "COM2", "title": "Mr.", "name": "TENG DARA", "email": "Pheak68.tra56789@gmail.com", "phone": "+85590420092", "position": "Technician", "language": "Khmer", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace (8 pax)"},
    {"no": 9, "country": "Cambodia", "company": "NCX-C", "role": "Escort", "contest": "-", "title": "Mr.", "name": "VORN MAKARA", "email": "makara_v@ncxhonda.com", "phone": "+85586451436", "position": "Instructor", "language": "Khmer / English", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace (8 pax)"},
    {"no": 10, "country": "Cambodia", "company": "NCX-C", "role": "Escort", "contest": "-", "title": "Mr.", "name": "SENG RITHY", "email": "rithy_se@ncxhonda.com", "phone": "+85515940095", "position": "Instructor", "language": "Khmer / English", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace (8 pax)"},
    {"no": 11, "country": "Cambodia", "company": "NCX-C", "role": "Escort", "contest": "-", "title": "Mr.", "name": "CHHAY RATTANA", "email": "rattana_c@ncxhonda.com", "phone": "+85578666893", "position": "Manager", "language": "Khmer / English", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace (8 pax)"},
    {"no": 12, "country": "Cambodia", "company": "NCX-C", "role": "Escort", "contest": "-", "title": "Mr.", "name": "THAIKING SITTICHAI", "email": "sittichai_t@ncxhonda.com", "phone": "+66816324262", "position": "GM", "language": "Thai / English", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "-"},
    {"no": 13, "country": "Philippines", "company": "HPI", "role": "Contestant", "contest": "COM1", "title": "Mr.", "name": "JERALD CHRISTOPHER M. MINIANO", "email": "pbareng@hondaph.com", "phone": "+639178557976", "position": "Mechanic", "language": "English", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Innova"},
    {"no": 14, "country": "Philippines", "company": "HPI", "role": "Contestant", "contest": "COM1", "title": "Mr.", "name": "AARON GLENN P. AGUILAR", "email": "pbareng@hondaph.com", "phone": "+639178557976", "position": "Mechanic", "language": "English", "food": "No Seafood", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Innova"},
    {"no": 15, "country": "Philippines", "company": "HPI", "role": "Contestant", "contest": "COM2", "title": "Mr.", "name": "JAY M. BERNABE", "email": "pbareng@hondaph.com", "phone": "+639178557976", "position": "Mechanic", "language": "English", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Innova"},
    {"no": 16, "country": "Philippines", "company": "HPI", "role": "Contestant", "contest": "COM2", "title": "Mr.", "name": "ALBERTO M. ALABAR", "email": "pbareng@hondaph.com", "phone": "+639178557976", "position": "Mechanic", "language": "English", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Innova"},
    {"no": 17, "country": "Philippines", "company": "HPI", "role": "Contestant", "contest": "FUN", "title": "Mr.", "name": "JUSTINE B. SUYOM", "email": "pbareng@hondaph.com", "phone": "+639178557976", "position": "Mechanic", "language": "English", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Innova"},
    {"no": 18, "country": "Philippines", "company": "HPI", "role": "Contestant", "contest": "FUN", "title": "Mr.", "name": "MARK JOHN V. BLAS", "email": "pbareng@hondaph.com", "phone": "+639178557976", "position": "Mechanic", "language": "English", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Innova"},
    {"no": 19, "country": "Philippines", "company": "HPI", "role": "Genpo/Dist", "contest": "-", "title": "Mr.", "name": "PETER JHON M. BARENG", "email": "pbareng@hondaph.com", "phone": "+639178557976", "position": "Group Head", "language": "English", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Innova"},
    {"no": 20, "country": "Philippines", "company": "HPI", "role": "Genpo/Dist", "contest": "-", "title": "Mr.", "name": "CYRUS L. PAGARAN", "email": "cpagaran@hondaph.com", "phone": "+639178557976", "position": "Manager", "language": "English", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Innova"},
    {"no": 21, "country": "Taiwan", "company": "HTW", "role": "Contestant", "contest": "FUN", "title": "Mr.", "name": "LIN HAO PANG", "email": "suy_chen@honda-htw.com.tw", "phone": "0986982017", "position": "Technician", "language": "Traditional Chinese", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Innova (4 pax)"},
    {"no": 22, "country": "Taiwan", "company": "HTW", "role": "Contestant", "contest": "FUN", "title": "Mr.", "name": "HUANG KAI LUN", "email": "suy_chen@honda-htw.com.tw", "phone": "0424513636", "position": "Technician", "language": "Traditional Chinese", "food": "No Beef, No Alcohol", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Innova (4 pax)"},
    {"no": 23, "country": "Taiwan", "company": "HTW", "role": "Genpo/Dist", "contest": "-", "title": "Ms.", "name": "CHEN CHIEH NING", "email": "jn_chen@honda-htw.com.tw", "phone": "0989915409", "position": "Senior Administrator", "language": "Trad. Chinese / English", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Innova (4 pax)"},
    {"no": 24, "country": "Taiwan", "company": "HTW", "role": "Genpo/Dist", "contest": "-", "title": "Mr.", "name": "CHEN SHU YUAN", "email": "suy_chen@honda-htw.com.tw", "phone": "0932790753", "position": "Supervisor", "language": "Traditional Chinese", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Innova (4 pax)"},
    {"no": 25, "country": "Malaysia", "company": "BSH", "role": "Contestant", "contest": "COM1", "title": "Mr.", "name": "MUHAMMAD AL AMIN BIN YUSRI", "email": "amnysri@gmail.com", "phone": "017-7836653", "position": "Technician", "language": "Malay / English", "food": "Muslim (No Pork, No Alcohol)", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace (8 pax)"},
    {"no": 26, "country": "Malaysia", "company": "BSH", "role": "Contestant", "contest": "COM2", "title": "Mr.", "name": "KWANG TECK HING", "email": "Kwangteckhing90@gmail.com", "phone": "178868056", "position": "Technician", "language": "Malay / English", "food": "No Beef", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace (8 pax)"},
    {"no": 27, "country": "Malaysia", "company": "BSH", "role": "Contestant", "contest": "FUN", "title": "Mr.", "name": "AIDIL ADHA BIN SAMSUMAR", "email": "Adekagsuperbike@gmail.com", "phone": "177500448", "position": "Technician", "language": "Malay / English", "food": "Muslim (No Pork, No Alcohol)", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace (8 pax)"},
    {"no": 28, "country": "Malaysia", "company": "BSH", "role": "Escort", "contest": "-", "title": "Mr.", "name": "MUHAMMAD FAIZAL BIN MD FIKRI", "email": "muhammad_faizal@bswhonda.com.my", "phone": "012-4997353", "position": "Team Lead", "language": "Malay / English", "food": "Muslim (No Pork, No Alcohol)", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace (8 pax)"},
    {"no": 29, "country": "Malaysia", "company": "BSH", "role": "Escort", "contest": "-", "title": "Mr.", "name": "HAFIZUL AFIFI BIN RUSMANI", "email": "hafizul_afifi@bswhonda.com.my", "phone": "124863153", "position": "Team Lead", "language": "Malay / English", "food": "Muslim (No Pork, No Alcohol)", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace (8 pax)"},
    {"no": 30, "country": "Malaysia", "company": "BSH", "role": "Escort", "contest": "-", "title": "Mr.", "name": "MOHD NAZRI BIN MD YUSOFF", "email": "mohd_nazri_a@bswhonda.com.my", "phone": "017-7137957", "position": "Engineer", "language": "Malay / English", "food": "Muslim (No Pork, No Alcohol)", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace (8 pax)"},
    {"no": 31, "country": "Singapore", "company": "BSS", "role": "Escort", "contest": "-", "title": "Mr.", "name": "NICHOLAS GERARD GOMEZ", "email": "nicholasgomez@boonsiewhonda.com.sg", "phone": "6592308340", "position": "Manager", "language": "English", "food": "No Alcohol", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Avanza (1 unit)"},
    {"no": 32, "country": "Singapore", "company": "BSS", "role": "Contestant", "contest": "FUN", "title": "Mr.", "name": "MUHAMMAD SYAWAL BIN ABDUL RAZAK", "email": "syawal814@gmail.com", "phone": "6590264474", "position": "Technician", "language": "English", "food": "Muslim (No Alcohol)", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "-"},
    {"no": 33, "country": "India", "company": "HMSI", "role": "Contestant", "contest": "COM1", "title": "Mr.", "name": "AMIT MAHATA", "email": "amitmahata0201_1993@gmail.com", "phone": "91-7076882340", "position": "Technician", "language": "Bengali / English", "food": "No Beef, No Pork, No Alcohol", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace"},
    {"no": 34, "country": "India", "company": "HMSI", "role": "Contestant", "contest": "COM1", "title": "Mr.", "name": "MANOJ KUMAR", "email": "mkjangra1980@gmail.com", "phone": "91-9896900690", "position": "Technician", "language": "Hindi", "food": "No Beef, No Pork, No Alcohol", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace"},
    {"no": 35, "country": "India", "company": "HMSI", "role": "Contestant", "contest": "FUN", "title": "Mr.", "name": "AROMAL P. ROBSON", "email": "aromalrobson@gmail.com", "phone": "91-8921611509", "position": "Technician", "language": "English", "food": "No Alcohol", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace"},
    {"no": 36, "country": "India", "company": "HMSI", "role": "Contestant", "contest": "FUN", "title": "Mr.", "name": "ABDULRAZAK MAQBOOL KHAN", "email": "maqbool1010@gmail.com", "phone": "91-9591761844", "position": "Technician", "language": "English", "food": "Muslim (No Seafood, No Beef, No Chicken, No Pork, No Alcohol)", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace"},
    {"no": 37, "country": "India", "company": "HMSI", "role": "Genpo/Dist", "contest": "COM1", "title": "Mr.", "name": "GURURAJ VASANTRAO JOSHI", "email": "G.Joshi@honda.hmsi.in", "phone": "91-9958593646", "position": "AGM", "language": "English", "food": "Vegetarian (Alcohol only)", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace"},
    {"no": 38, "country": "India", "company": "HMSI", "role": "Genpo/Dist", "contest": "FUN", "title": "Mr.", "name": "AJAY DAHIYA", "email": "ajay.dahiya@honda.hmsi.in", "phone": "91-9910398483", "position": "Department Manager", "language": "English", "food": "No Beef, No Pork", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace"},
    {"no": 39, "country": "India", "company": "HMSI", "role": "Genpo/Dist", "contest": "COM1", "title": "Mr.", "name": "VIVEK SAXENA", "email": "vivek.saxena@honda.hmsi.in", "phone": "91-7023333192", "position": "Asst. Manager", "language": "English", "food": "No Beef, No Pork, No Alcohol", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace"},
    {"no": 40, "country": "India", "company": "HMSI", "role": "Genpo/Dist", "contest": "FUN", "title": "Mr.", "name": "SAGAR NARAYAN BHALERAO", "email": "Sagar.Bhalerao@honda.hmsi.in", "phone": "91-8600142819", "position": "Manager", "language": "English", "food": "Vegetarian", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace"},
    {"no": 41, "country": "Thailand", "company": "ASH", "role": "ASH Committee", "contest": "-", "title": "Mr.", "name": "KEIZO OTA", "email": "kota@honda.th.com", "phone": "(+66)-92-730-4181", "position": "General Manager", "language": "-", "food": "-", "transfer_arr": "-", "transfer_dep": "-", "vehicle": "-"},
    {"no": 42, "country": "Thailand", "company": "ASH", "role": "ASH Committee", "contest": "-", "title": "Mr.", "name": "PRASERT VICHITKULSAWAT", "email": "praservi@honda.th.com", "phone": "(+66)-89-201-4673", "position": "Senior Manager", "language": "-", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace"},
    {"no": 43, "country": "Thailand", "company": "ASH", "role": "ASH Committee", "contest": "-", "title": "Mr.", "name": "PAKORN BOONPIAMSAK", "email": "pakorboo@honda.th.com", "phone": "(+66)-91-773-1138", "position": "Manager", "language": "-", "food": "No Alcohol", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Innova"},
    {"no": 44, "country": "Thailand", "company": "ASH", "role": "ASH Committee", "contest": "-", "title": "Ms.", "name": "KANCHANA PARINYAPORNKUN", "email": "kanchapa@honda.th.com", "phone": "(+66)-65-729-8395", "position": "Manager", "language": "-", "food": "No Beef", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace"},
    {"no": 45, "country": "Thailand", "company": "ASH", "role": "ASH Committee", "contest": "-", "title": "Mr.", "name": "HIROSHI ISHIDA", "email": "hishida@honda.th.com", "phone": "(+66)-81-132-4570", "position": "Coordinator", "language": "-", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace"},
    {"no": 46, "country": "Thailand", "company": "ASH", "role": "ASH Committee", "contest": "-", "title": "Mr.", "name": "TOSHIYA TAKENAGA", "email": "ttakenaga@honda.th.com", "phone": "(+66)-61-031-9095", "position": "Coordinator", "language": "-", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace"},
    {"no": 47, "country": "Thailand", "company": "ASH", "role": "ASH Committee", "contest": "-", "title": "Mr.", "name": "WISIT SOMWANGSIRI", "email": "wisitsom@honda.th.com", "phone": "(+66)-86-388-2681", "position": "Deputy Manager", "language": "-", "food": "No Alcohol", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace"},
    {"no": 48, "country": "Thailand", "company": "ASH", "role": "ASH Committee", "contest": "-", "title": "Ms.", "name": "KANLAYAPHAS BOONYATEERAPAT", "email": "kanlaboo@honda.th.com", "phone": "(+66)-85-153-5393", "position": "Deputy Manager", "language": "-", "food": "No Beef", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Innova"},
    {"no": 49, "country": "Thailand", "company": "ASH", "role": "ASH Committee", "contest": "-", "title": "Ms.", "name": "SUKRIS KONGPONG", "email": "sukrikon@honda.th.com", "phone": "(+66)-94-451-9693", "position": "Assistant Manager", "language": "-", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Innova"},
    {"no": 50, "country": "Thailand", "company": "ASH", "role": "ASH Committee", "contest": "-", "title": "Ms.", "name": "NUTCHAREE SUKHO", "email": "witchasu@honda.th.com", "phone": "(+66)-94-424-2641", "position": "Assistant Manager", "language": "-", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace"},
    {"no": 51, "country": "Thailand", "company": "ASH", "role": "ASH Committee", "contest": "-", "title": "Ms.", "name": "MANIDA KAEWPHETSUWAN", "email": "manidkae@honda.th.com", "phone": "(+66)-83-697-3555", "position": "Assistant Manager", "language": "-", "food": "No Beef", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace"},
    {"no": 52, "country": "Thailand", "company": "ASH", "role": "ASH Committee", "contest": "-", "title": "Mr.", "name": "WARAH LUANGUDOMCHAI", "email": "warahlua@honda.th.com", "phone": "(+66)-61-625-9652", "position": "Assistant Manager", "language": "-", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Innova"},
    {"no": 53, "country": "Thailand", "company": "ASH", "role": "ASH Committee", "contest": "-", "title": "Ms.", "name": "PHORNTHIP SUNTISUKKASEM", "email": "phornsun@honda.th.com", "phone": "(+66)-83-010-1997", "position": "Senior Officer", "language": "-", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace"},
    {"no": 54, "country": "Thailand", "company": "ASH", "role": "ASH Committee", "contest": "-", "title": "Mr.", "name": "TEERAPONG PROMDEE", "email": "teerapro@honda.th.com", "phone": "(+66)-80-667-7296", "position": "Senior Officer", "language": "-", "food": "No Alcohol", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Innova"},
    {"no": 55, "country": "Thailand", "company": "ASH", "role": "ASH Committee", "contest": "-", "title": "Ms.", "name": "CHOMPOONUCH ASAWACHAISUWIKROM", "email": "chompasa@honda.th.com", "phone": "(+66)-95-569-2426", "position": "Senior Officer", "language": "-", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace"},
    {"no": 56, "country": "Thailand", "company": "ASH", "role": "ASH Committee", "contest": "-", "title": "Ms.", "name": "ATIMA WATCHARINTADA", "email": "atimawat@honda.th.com", "phone": "(+66)-65-547-4941", "position": "Senior Officer", "language": "-", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace"},
    {"no": 57, "country": "Thailand", "company": "ASH", "role": "ASH Committee", "contest": "-", "title": "Mr.", "name": "POOHRIN WUTTHIKAIUDOMDAJ", "email": "poohrwut@honda.th.com", "phone": "(+66)-97-135-7494", "position": "Senior Officer", "language": "-", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace"},
    {"no": 58, "country": "Thailand", "company": "ASH", "role": "ASH Committee", "contest": "-", "title": "Mr.", "name": "CHANATHIP SARTTAYARAT", "email": "chanasar@honda.th.com", "phone": "(+66)-81-354-1063", "position": "Officer", "language": "-", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace"},
    {"no": 59, "country": "Thailand", "company": "ASH", "role": "ASH Committee", "contest": "-", "title": "Ms.", "name": "NAPHATSORN SILWATTA", "email": "naphasil@honda.th.com", "phone": "(+66)-86-811-4299", "position": "Senior Officer", "language": "-", "food": "Allergy: Peanut butter", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace"},
    {"no": 60, "country": "Thailand", "company": "ASH", "role": "ASH Committee", "contest": "-", "title": "Ms.", "name": "WIMONRAT HIRANWONG", "email": "wimonhir@honda.th.com", "phone": "(+66)-84-668-4041", "position": "Assistant Manager", "language": "-", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace"},
    {"no": 61, "country": "Thailand", "company": "ASH", "role": "ASH Committee", "contest": "-", "title": "Mr.", "name": "PONGSATORN PROMWANG", "email": "pongspro@honda.th.com", "phone": "(+66)-92-604-6020", "position": "Assistant Manager", "language": "-", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace"},
    {"no": 62, "country": "Thailand", "company": "ASH", "role": "ASH Committee", "contest": "-", "title": "Ms.", "name": "PICHAYAPORN CHAIYARUNGROJ", "email": "pichacha@honda.th.com", "phone": "(+66)-86-086-5282", "position": "Officer", "language": "-", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace"},
    {"no": 63, "country": "Thailand", "company": "ASH", "role": "ASH Committee", "contest": "-", "title": "Ms.", "name": "SARISA INGKANANTAWAREE", "email": "sarising@honda.th.com", "phone": "(+66)-92-594-4747", "position": "Senior Officer", "language": "-", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace"},
    {"no": 64, "country": "Thailand", "company": "TH", "role": "Genpo/Dist", "contest": "-", "title": "Mr.", "name": "TAWATCHAI PRAHA", "email": "tawatchaip@honda.th.com", "phone": "+66626057315", "position": "Manager, Dealer Training", "language": "Thai / English", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace"},
    {"no": 65, "country": "Thailand", "company": "TH", "role": "Escort", "contest": "-", "title": "Mr.", "name": "DUSIT NAMSUE", "email": "dusit@honda.th.com", "phone": "+66869188549", "position": "Instructor", "language": "Thai / English", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace"},
    {"no": 66, "country": "Thailand", "company": "TH", "role": "Escort", "contest": "-", "title": "Mr.", "name": "CHAWADOL REUNTHANAKUL", "email": "chawadol@honda.th.com", "phone": "+66964266456", "position": "Instructor", "language": "Thai / English", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace"},
    {"no": 67, "country": "Thailand", "company": "TH", "role": "Escort", "contest": "-", "title": "Mr.", "name": "TANASATE TANAPORNCHOCKANUN", "email": "tanasate@honda.th.com", "phone": "+66814884677", "position": "Instructor", "language": "Thai / English", "food": "Vegan (No Seafood, No Beef, No Chicken, No Pork, No Alcohol)", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace"},
    {"no": 68, "country": "Thailand", "company": "TH", "role": "Contestant", "contest": "COM1", "title": "Mr.", "name": "NOPPHARAT DIMUN", "email": "Deemolnopparat@gmail.com", "phone": "+66800086231", "position": "Technician", "language": "Thai / English", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace"},
    {"no": 69, "country": "Thailand", "company": "TH", "role": "Contestant", "contest": "COM1", "title": "Mr.", "name": "TAWEE BUNRAT", "email": "taweebunrat@gmail.com", "phone": "+66625393224", "position": "Technician", "language": "Thai / English", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace"},
    {"no": 70, "country": "Thailand", "company": "TH", "role": "Contestant", "contest": "COM2", "title": "Mr.", "name": "WANCHAI SRINOTHAI", "email": "chaiannwanchai@gmail.com", "phone": "+66899656386", "position": "Technician", "language": "Thai", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace"},
    {"no": 71, "country": "Thailand", "company": "TH", "role": "Contestant", "contest": "COM2", "title": "Mr.", "name": "SITTICHOK REANSRITONGKAM", "email": "boymim2561@gmail.com", "phone": "+66611069073", "position": "Technician", "language": "Thai / English", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace"},
    {"no": 72, "country": "Thailand", "company": "TH", "role": "Contestant", "contest": "FUN", "title": "Mr.", "name": "THAWIN JIENGRAM", "email": "mr.thwin31@gmail.com", "phone": "+66973389423", "position": "Technician", "language": "Thai / English", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace"},
    {"no": 73, "country": "Thailand", "company": "TH", "role": "Contestant", "contest": "FUN", "title": "Mr.", "name": "NATHAWUT LOISAIOO", "email": "nattawut40891@gmail.com", "phone": "+66654844483", "position": "Technician", "language": "Thai", "food": "No Seafood; Allergy: Squid", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace"},
    {"no": 74, "country": "Thailand", "company": "TH", "role": "Dealer", "contest": "-", "title": "Mr.", "name": "PRAMOTE INTHISANG", "email": "pramotekel@gmail.com", "phone": "+66981056617", "position": "Service Manager", "language": "Thai / English", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace"},
    {"no": 75, "country": "Vietnam", "company": "HVN", "role": "Contestant", "contest": "COM1", "title": "Mr.", "name": "HOANG VAN TUAN SONG", "email": "sv_nv_chuyen@honda.com.vn", "phone": "84918152291", "position": "Technician", "language": "Vietnamese", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace (3 unit)"},
    {"no": 76, "country": "Vietnam", "company": "HVN", "role": "Contestant", "contest": "COM1", "title": "Mr.", "name": "LE XUAN THANG", "email": "sv_nv_chuyen@honda.com.vn", "phone": "84918152291", "position": "Technician", "language": "Vietnamese", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace (3 unit)"},
    {"no": 77, "country": "Vietnam", "company": "HVN", "role": "Contestant", "contest": "COM2", "title": "Mr.", "name": "NGUYEN VAN LINH", "email": "sv_nv_chuyen@honda.com.vn", "phone": "84918152291", "position": "Technician", "language": "Vietnamese", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace (3 unit)"},
    {"no": 78, "country": "Vietnam", "company": "HVN", "role": "Contestant", "contest": "COM2", "title": "Mr.", "name": "TRAN VAN PHU", "email": "sv_nv_chuyen@honda.com.vn", "phone": "84918152291", "position": "Technician", "language": "Vietnamese", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace (3 unit)"},
    {"no": 79, "country": "Vietnam", "company": "HVN", "role": "Contestant", "contest": "FUN", "title": "Mr.", "name": "LE THANH TUAN", "email": "sv_nv_chuyen@honda.com.vn", "phone": "84918152291", "position": "Technician", "language": "Vietnamese", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace (3 unit)"},
    {"no": 80, "country": "Vietnam", "company": "HVN", "role": "Contestant", "contest": "FUN", "title": "Mr.", "name": "MAC QUOC LONG", "email": "sv_nv_chuyen@honda.com.vn", "phone": "84918152291", "position": "Technician", "language": "Vietnamese", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace (3 unit)"},
    {"no": 81, "country": "Vietnam", "company": "HVN", "role": "Dealer", "contest": "-", "title": "Mr.", "name": "LE VAN TIENG", "email": "thanhnh@tienthu.vn", "phone": "84964801234", "position": "Owner", "language": "Vietnamese", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace (3 unit)"},
    {"no": 82, "country": "Vietnam", "company": "HVN", "role": "Dealer", "contest": "COM1", "title": "Mr.", "name": "TRAN BAO KHA", "email": "thanhnh@tienthu.vn", "phone": "84964801234", "position": "Director", "language": "Vietnamese", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace (3 unit)"},
    {"no": 83, "country": "Vietnam", "company": "HVN", "role": "Dealer", "contest": "COM2", "title": "Mr.", "name": "BUI CONG THANH", "email": "quang.honda@gmail.com", "phone": "84943153388", "position": "Owner", "language": "Vietnamese / English", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace (3 unit)"},
    {"no": 84, "country": "Vietnam", "company": "HVN", "role": "Dealer", "contest": "COM2", "title": "Mr.", "name": "NGUYEN HONG QUANG", "email": "quang.honda@gmail.com", "phone": "84943153388", "position": "Service Manager", "language": "Vietnamese", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace (3 unit)"},
    {"no": 85, "country": "Vietnam", "company": "HVN", "role": "Dealer", "contest": "FUN", "title": "Mr.", "name": "NGUYEN HONG THANH", "email": "thanhnh@tienthu.vn", "phone": "84964801234", "position": "Service Manager", "language": "Vietnamese", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace (3 unit)"},
    {"no": 86, "country": "Vietnam", "company": "HVN", "role": "Escort", "contest": "COM1", "title": "Mr.", "name": "VU DUY LAM", "email": "sv_nv_chuyen@honda.com.vn", "phone": "84918152291", "position": "Section Manager", "language": "Vietnamese / English", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace (3 unit)"},
    {"no": 87, "country": "Vietnam", "company": "HVN", "role": "Escort", "contest": "COM2", "title": "Mr.", "name": "DAU QUANG HIEU", "email": "sv_nv_chuyen@honda.com.vn", "phone": "84918152291", "position": "Staff", "language": "Vietnamese / English", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace (3 unit)"},
    {"no": 88, "country": "Vietnam", "company": "HVN", "role": "Escort", "contest": "FUN", "title": "Mr.", "name": "NGUYEN VAN CHUYEN", "email": "sv_nv_chuyen@honda.com.vn", "phone": "84918152291", "position": "Team Leader", "language": "Vietnamese / English", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace (3 unit)"},
    {"no": 89, "country": "Vietnam", "company": "HVN", "role": "Genpo/Dist", "contest": "-", "title": "Mr.", "name": "PHUNG XUAN BIEN", "email": "sv_nv_chuyen@honda.com.vn", "phone": "84918152291", "position": "Department Manager", "language": "Vietnamese / English", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace (3 unit)"},
    {"no": 90, "country": "Vietnam", "company": "HVN", "role": "Dealer", "contest": "-", "title": "Ms.", "name": "LE THI THUY TRANG", "email": "thanhnh@tienthu.vn", "phone": "84964801234", "position": "Director", "language": "Vietnamese", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace (3 unit)"},
    {"no": 91, "country": "Vietnam", "company": "HVN", "role": "Dealer", "contest": "COM2", "title": "Ms.", "name": "LE THUY TRAM", "email": "thanhnh@tienthu.vn", "phone": "84964801234", "position": "Director", "language": "Vietnamese", "food": "No restriction", "transfer_arr": "Yes", "transfer_dep": "Yes", "vehicle": "Hiace (3 unit)"},
]

company_full = {
    "Sheesha Pvt Ltd": "Sheesha Pvt Ltd",
    "NCX-C": "N.C.X. Co., Ltd.",
    "HPI": "Honda Philippines, Inc.",
    "HTW": "Honda Taiwan Co., Ltd.",
    "BSH": "Boon Siew Honda Sdn. Bhd.",
    "BSS": "Boon Siew Singapore Pte. Ltd.",
    "HMSI": "Honda Motorcycle & Scooter India Pvt. Ltd.",
    "ASH": "Asian Honda Motor Co., Ltd.",
    "TH": "Thai Honda Co., Ltd.",
    "HVN": "Honda Vietnam Co., Ltd.",
}

lo_groups = {}
for p in participants:
    key = (p["country"], p["company"])
    lo = lo_map.get(key, "Unknown")
    if lo not in lo_groups:
        lo_groups[lo] = {}
    if key not in lo_groups[lo]:
        lo_groups[lo][key] = []
    lo_groups[lo][key].append(p)

lo_order = ["Boyke", "Fajar", "Ricky", "Jordan", "Salik", "No LO"]

def esc(s):
    return html.escape(str(s))

def photo_cell(name):
    url = get_photo_url(name)
    if url:
        return f'<td class="photo-cell"><img src="{url}" alt="{esc(name)}"></td>'
    else:
        return '<td class="photo-cell" style="color:#bbb; font-size:7pt;">No Photo</td>'

lines = []
lines.append("""<html><head><style>
@page { size: A4 landscape; margin: 12mm 15mm; }
body { font-family: Arial, sans-serif; font-size: 9pt; margin: 0; padding: 15px 20px; }
h1 { font-size: 20pt; text-align: center; color: #CC0000; margin-bottom: 5px; }
h2 { font-size: 14pt; color: #CC0000; border-bottom: 2px solid #CC0000; padding-bottom: 4px; margin-top: 30px; }
h3 { font-size: 11pt; color: #333; margin-top: 20px; margin-bottom: 5px; }
.subtitle { text-align: center; font-size: 10pt; color: #555; margin-bottom: 20px; }
table { border-collapse: collapse; width: 100%; margin-bottom: 15px; font-size: 8.5pt; }
th { background-color: #CC0000; color: white; padding: 6px 8px; text-align: left; font-size: 8.5pt; white-space: nowrap; }
td { border: 1px solid #ddd; padding: 5px 7px; vertical-align: middle; }
tr:nth-child(even) { background-color: #f9f9f9; }
.food-note { color: #CC6600; font-weight: bold; }
.pax-count { color: #666; font-style: italic; font-size: 9pt; }
.summary-table th { font-size: 9pt; padding: 6px 8px; }
.summary-table td { font-size: 9pt; padding: 5px 8px; }
.photo-cell { width: 80px; min-width: 80px; max-width: 80px; text-align: center; padding: 4px !important; }
.photo-cell img { width: 72px; height: auto; max-height: 90px; object-fit: contain; border-radius: 4px; display: block; margin: 0 auto; }
</style></head><body>""")

lines.append('<h1>LIAISON OFFICER GUIDEBOOK</h1>')
lines.append('<p class="subtitle">Participant Profile by Country &amp; Company</p>')
lines.append('<p class="subtitle" style="font-size:8pt; color:#999;">Data cutoff: 05 November 2026</p>')

# Summary
lines.append('<h2>RINGKASAN ASSIGNMENT LO</h2>')
lines.append('<table class="summary-table">')
lines.append('<tr><th>Liaison Officer</th><th>Negara</th><th>Company</th><th>Jumlah Pax</th></tr>')
for lo in lo_order:
    if lo not in lo_groups:
        continue
    countries = lo_groups[lo]
    first = True
    for (country, comp), ps in countries.items():
        if first:
            lines.append(f'<tr><td rowspan="{len(countries)}" style="font-weight:bold; vertical-align:middle;">{esc(lo)}</td><td>{esc(country)}</td><td>{esc(comp)} ({esc(company_full.get(comp, comp))})</td><td>{len(ps)} pax</td></tr>')
            first = False
        else:
            lines.append(f'<tr><td>{esc(country)}</td><td>{esc(comp)} ({esc(company_full.get(comp, comp))})</td><td>{len(ps)} pax</td></tr>')
lines.append('</table>')

# Detail per LO
for lo in lo_order:
    if lo not in lo_groups:
        continue
    lines.append(f'<h2>LIAISON OFFICER: {esc(lo.upper())}</h2>')
    for (country, comp), ps in lo_groups[lo].items():
        full_name = company_full.get(comp, comp)
        lines.append(f'<h3>{esc(country.upper())} &mdash; {esc(full_name)} ({esc(comp)})</h3>')
        lines.append(f'<p class="pax-count">Total: {len(ps)} participant(s)</p>')

        lines.append('<table>')
        lines.append('<tr><th style="width:80px">Photo</th><th style="width:3%">No</th><th>Nama</th><th>Role</th><th>Contest</th><th>Email / Telp</th><th>Position</th><th>Language</th><th>Food</th><th>Airport Transfer</th></tr>')

        for i, p in enumerate(ps, 1):
            contest_display = p["contest"] if p["contest"] != "-" else "-"
            food_class = ""
            if "Muslim" in p["food"] or "Vegan" in p["food"] or "Vegetarian" in p["food"] or "Allergy" in p["food"] or ("No " in p["food"] and p["food"] != "No restriction"):
                food_class = ' class="food-note"'

            transfer = ""
            if p["transfer_arr"] == "Yes" and p["transfer_dep"] == "Yes":
                transfer = f'Arr: Yes / Dep: Yes<br>{esc(p["vehicle"])}'
            elif p["transfer_arr"] == "Yes":
                transfer = f'Arr: Yes / Dep: No<br>{esc(p["vehicle"])}'
            elif p["transfer_dep"] == "Yes":
                transfer = f'Arr: No / Dep: Yes<br>{esc(p["vehicle"])}'
            elif p["transfer_arr"] == "-":
                transfer = "TBC"
            else:
                transfer = "No"

            lines.append(f'<tr>'
                f'{photo_cell(p["name"])}'
                f'<td>{i}</td>'
                f'<td><b>{esc(p["title"])} {esc(p["name"])}</b></td>'
                f'<td>{esc(p["role"])}</td>'
                f'<td>{esc(contest_display)}</td>'
                f'<td style="font-size:8pt;">{esc(p["email"])}<br>{esc(p["phone"])}</td>'
                f'<td>{esc(p["position"])}</td>'
                f'<td>{esc(p["language"])}</td>'
                f'<td{food_class}>{esc(p["food"])}</td>'
                f'<td>{transfer}</td>'
                f'</tr>')

        lines.append('</table>')

lines.append('</body></html>')

html_content = "\n".join(lines)
output_path = "/tmp/claude-0/-home-user-aoc/e94605b1-8bf3-56e6-a3db-579a6f98d0a3/scratchpad/guidebook_participant_v2.html"
with open(output_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"Generated HTML: {len(html_content)} chars")
print(f"Total participants: {len(participants)}")

# Stats
has_photo = sum(1 for p in participants if p["name"] in photo_map)
print(f"Photos mapped: {has_photo}/{len(participants)}")
missing = [p["name"] for p in participants if p["name"] not in photo_map]
if missing:
    print(f"Missing photos ({len(missing)}):")
    for m in missing:
        print(f"  - {m}")
