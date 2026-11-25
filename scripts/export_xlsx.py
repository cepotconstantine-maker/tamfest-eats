"""Ekspor database JSON TAMFEST EATS ke spreadsheet Excel.

Pakai:  python scripts/export_xlsx.py
Hasil:  exports/Tamfest_Eats_Database.xlsx

JSON di src/data/ adalah sumber utama. Spreadsheet ini hanya salinan untuk
dibaca/dicek. Kalau mau mengubah data, ubah JSON-nya, lalu jalankan ulang skrip ini.
"""
import json
import os
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, 'src', 'data')
OUT = os.path.join(ROOT, 'exports', 'Tamfest_Eats_Database.xlsx')
load = lambda n: json.load(open(os.path.join(D, n), encoding='utf-8'))

stalls, menus, cats = load('stalls.json'), load('menus.json'), load('categories.json')
mp, photos = load('map.json'), load('photos.json')
sname = {s['stall_id']: s['stall_name'] for s in stalls}
cname = {c['category_id']: c['name'] for c in cats}

F = 'Arial'
HEAD = Font(name=F, bold=True, color='FFFFFF')
HFILL = PatternFill('solid', fgColor='1F4D3A')
BODY = Font(name=F)
WARN = PatternFill('solid', fgColor='FFF1DC')

wb = Workbook()


def sheet(title, headers, rows, widths=None, warn_col=None):
    ws = wb.create_sheet(title)
    ws.append(headers)
    for r in rows:
        ws.append(['' if v is None else v for v in r])
    for c in ws[1]:
        c.font, c.fill = HEAD, HFILL
        c.alignment = Alignment(vertical='center')
    for row in ws.iter_rows(min_row=2):
        for c in row:
            c.font = BODY
        if warn_col is not None and row[warn_col].value == 'NEEDS_VERIFICATION':
            for c in row:
                c.fill = WARN
    for i, h in enumerate(headers, 1):
        w = (widths or {}).get(h) or min(45, max(10, len(h) + 2, *(len(str(r[i - 1] or '')) + 2 for r in rows[:200])) if rows else len(h) + 2)
        ws.column_dimensions[get_column_letter(i)].width = w
    ws.freeze_panes = 'A2'
    ws.auto_filter.ref = ws.dimensions
    return ws


MH = ['menu_id', 'stall_id', 'stall_name', 'menu_name', 'menu_variant', 'price', 'category', 'category_name',
      'food_type', 'item_type', 'description', 'image_path', 'availability', 'source_image', 'verification_status', 'notes', 'batch']
ws_m = sheet('MENUS', MH, [[m['menu_id'], m['stall_id'], sname[m['stall_id']], m['menu_name'], m['menu_variant'], m['price'],
                            m['category'], cname[m['category']], m['food_type'], m['item_type'], m['description'], m['image_path'],
                            m['availability'], m['source_image'], m['verification_status'], m['notes'], m['batch']] for m in menus],
             widths={'description': 45, 'notes': 60}, warn_col=MH.index('verification_status'))
for c in ws_m['F'][1:]:
    c.number_format = '"Rp"#,##0;-"Rp"#,##0;"Gratis"'

SH = ['stall_id', 'stall_name', 'alternative_names', 'description', 'location_zone', 'booth_number', 'map_x', 'map_y',
      'image_path', 'verification_status', 'menu_count', 'notes']
ws_s = sheet('STALLS', SH, [[s['stall_id'], s['stall_name'], ', '.join(s['alternative_names']), s['description'], s['location_zone'],
                             s['booth_number'], s['map_x'], s['map_y'], s['image_path'], s['verification_status'], None, s['notes']]
                            for s in stalls], widths={'description': 45, 'notes': 60}, warn_col=SH.index('verification_status'))
n = len(menus) + 1
for r in range(2, len(stalls) + 2):
    # jumlah menu utama per warung — formula agar ikut berubah kalau sheet MENUS diedit
    ws_s.cell(r, 11, f'=COUNTIFS(MENUS!$B$2:$B${n},A{r},MENUS!$J$2:$J${n},"main")').font = BODY

sheet('CATEGORIES', ['category_id', 'name', 'icon', 'default_food_type', 'menu_count'],
      [[c['category_id'], c['name'], c['icon'], c['default_food_type'], None] for c in cats])
ws_c = wb['CATEGORIES']
for r in range(2, len(cats) + 2):
    ws_c.cell(r, 5, f'=COUNTIF(MENUS!$G$2:$G${n},A{r})').font = BODY

sheet('MAP', ['booth_number', 'stall_id', 'stall_name', 'map_label', 'zone', 'x', 'y', 'label_width', 'source', 'placement_status'],
      [[m['booth_number'], m['stall_id'], sname[m['stall_id']], m['map_label'], m['zone'], m['x'], m['y'], m['label_width'],
        m['source'], m['placement_status']] for m in mp['markers']])
sheet('PHOTOS', ['photo_id', 'stall_id', 'stall_name', 'image_path', 'batch', 'original_upload', 'description'],
      [[p['photo_id'], p['stall_id'], sname[p['stall_id']], p['image_path'], p['batch'], p['original_upload'], p['description']] for p in photos])
nv = [m for m in menus if m['verification_status'] == 'NEEDS_VERIFICATION']
sheet('PERLU_VERIFIKASI', ['menu_id', 'stall_name', 'menu_name', 'menu_variant', 'price', 'source_image', 'notes'],
      [[m['menu_id'], sname[m['stall_id']], m['menu_name'], m['menu_variant'], m['price'], m['source_image'], m['notes']] for m in nv],
      widths={'notes': 80})

# Ringkasan (formula)
ws = wb.active
ws.title = 'RINGKASAN'
rows = [
    ('TAMFEST EATS — Ringkasan Database', None),
    ('Sumber utama data: file JSON di src/data/. Sheet ini dibuat ulang oleh scripts/export_xlsx.py.', None),
    (None, None),
    ('Jumlah warung', f'=COUNTA(STALLS!A2:A{len(stalls)+1})'),
    ('Warung yang sudah punya menu', f'=COUNTIF(STALLS!K2:K{len(stalls)+1},">0")'),
    ('Warung di denah', f'=COUNTA(MAP!A2:A{len(mp["markers"])+1})'),
    ('Total item (menu + tambahan)', f'=COUNTA(MENUS!A2:A{n})'),
    ('Menu utama', f'=COUNTIF(MENUS!J2:J{n},"main")'),
    ('Topping / tambahan', f'=COUNTIF(MENUS!J2:J{n},"addon")'),
    ('Status VERIFIED', f'=COUNTIF(MENUS!O2:O{n},"VERIFIED")'),
    ('Status NEEDS_VERIFICATION', f'=COUNTIF(MENUS!O2:O{n},"NEEDS_VERIFICATION")'),
    ('Status USER_PROVIDED', f'=COUNTIF(MENUS!O2:O{n},"USER_PROVIDED")'),
    ('Item tanpa harga', f'=COUNTBLANK(MENUS!F2:F{n})'),
    ('Harga menu utama termurah', f'=MINIFS(MENUS!F2:F{n},MENUS!J2:J{n},"main",MENUS!F2:F{n},">0")'),
    ('Harga menu utama termahal', f'=MAXIFS(MENUS!F2:F{n},MENUS!J2:J{n},"main")'),
    ('Rata-rata harga menu utama', f'=AVERAGEIFS(MENUS!F2:F{n},MENUS!J2:J{n},"main",MENUS!F2:F{n},">0")'),
]
for i, (a, b) in enumerate(rows, 1):
    if b and ('MINIFS' in b or 'MAXIFS' in b):
        b = b.replace('=MINIFS', '=_xlfn.MINIFS').replace('=MAXIFS', '=_xlfn.MAXIFS')
    ws.cell(i, 1, a).font = Font(name=F, bold=(i == 1), size=14 if i == 1 else 10)
    if b:
        c = ws.cell(i, 2, b)
        c.font = BODY
        if i >= 14:
            c.number_format = '"Rp"#,##0'
ws.cell(2, 1).font = Font(name=F, italic=True, color='6E695E')
ws.column_dimensions['A'].width = 36
ws.column_dimensions['B'].width = 16

os.makedirs(os.path.dirname(OUT), exist_ok=True)
wb.save(OUT)
print('Saved', OUT)
