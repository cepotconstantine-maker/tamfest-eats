"""Batch 3 — 23 Nov 2026 — PDF 'Foto Tenant Tamansari Food Fest' (25 foto).
Update bertahap: memuat JSON yang ada, menambah/mengubah, lalu menyimpan kembali.
ID lama tidak diubah. Jalankan sekali: python scripts/batches/batch3.py <folder foto>
"""
import json, os, sys
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
D = os.path.join(ROOT, 'src', 'data')
SRC = sys.argv[1] if len(sys.argv) > 1 else '.'
load = lambda n: json.load(open(os.path.join(D, n), encoding='utf-8'))
stalls, menus, cats, photos = load('stalls.json'), load('menus.json'), load('categories.json'), load('photos.json')
if any(p['batch'] == 3 for p in photos):
    sys.exit('Batch 3 sudah pernah diproses.')
S = {s['stall_id']: s for s in stalls}
FT = {c['category_id']: c['default_food_type'] for c in cats}
V, NV, B = 'VERIFIED', 'NEEDS_VERIFICATION', 3
NOPRICE = 'Harga tidak tercantum di foto.'
log = []

# ---------------------------------------------------------------- photos
PH = [  # (photo_id, file, stall, desc, storefront?)
    ('P031', 'img-000.jpg', 'W025', 'Tampak depan Siomay Bandung reZeki', True),
    ('P032', 'img-001.jpg', 'W025', 'Banner menu Siomay Bandung reZeki (foto kedua, lebih jelas)', False),
    ('P033', 'img-002.jpg', 'W034', 'Tampak depan Warung Nasi Mandiri', True),
    ('P034', 'img-004.jpg', 'W034', 'Papan menu Warung Nasi Mandiri + kartu Nasi Soto Medan', False),
    ('P035', 'img-003.jpg', 'W033', 'Board Menu Paket Bu Darsih (foto kedua)', False),
    ('P036', 'img-006.jpg', 'W033', 'Tampak depan Warung Nasi Soto Betawi Bu Darsih', True),
    ('P037', 'img-005.jpg', 'W004', 'Papan menu Ayam Penyet Ibu Suwarti (foto kedua)', True),
    ('P038', 'img-007.jpg', 'W018', 'Tampak depan Nabox Ma Chic', True),
    ('P039', 'img-008.jpg', 'W011', 'Tampak depan & daftar menu Bubur Ayam Dio', True),
    ('P040', 'img-009.jpg', 'W002', 'Tampak depan Geprek Buncit 65 + stiker harga baru', True),
    ('P041', 'img-010.jpg', 'W010', 'Area pojok dekat Batagor & Siomay Motekar (ada kios kelontong & banner "Cemasan")', False),
    ('P042', 'img-011.jpg', 'W026', 'Tampak depan Sop Buah H. Ade (sebelah Warung Gembul)', True),
    ('P043', 'img-012.jpg', 'W032', 'Banner menu Warung Gembul', False),
    ('P044', 'img-013.jpg', 'W022', 'Tampak depan Rakus', True),
    ('P045', 'img-016.jpg', 'W022', 'Poster menu Rakus (foto kedua)', False),
    ('P046', 'img-014.jpg', 'W035', 'Tampak depan Warung Nasi Panghegar (sebelah Ayam diGeprekin)', True),
    ('P047', 'img-015.jpg', 'W001', 'Tampak depan Ayam diGeprekin (sebelah Jawara)', True),
    ('P048', 'img-017.jpg', 'W013', 'Papan menu Jawara (foto kedua)', False),
    ('P049', 'img-018.jpg', 'W003', 'Poster menu Ayam Kolgo & Nasi Ayam Sambel Ijo', True),
    ('P050', 'img-019.jpg', 'W037', 'Tampak depan Yoshimitsu (sebelah Berkah Saluyu)', True),
    ('P051', 'img-020.jpg', 'W037', 'Banner menu Yoshimitsu (foto kedua)', False),
    ('P052', 'img-021.jpg', 'W008', 'Tampak depan Berkah Saluyu', True),
    ('P053', 'img-022.jpg', 'W008', 'Kartu menu Berkah Saluyu', False),
    ('P054', 'img-023.jpg', 'W030', 'Tampak depan Warcik Soto Bogor (sebelah Sate Taichan Bengawan)', True),
    ('P055', 'img-024.jpg', 'W024', 'Kartu menu Sate Taichan Bengawan', False),
]
out_dir = os.path.join(ROOT, 'public', 'menu-photos')
for pid, f, sid, desc, front in PH:
    im = ImageOps.exif_transpose(Image.open(os.path.join(SRC, f))).convert('RGB')
    im.thumbnail((1400, 1400))
    fn = f'{pid}-{sid}.jpg'
    im.save(os.path.join(out_dir, fn), quality=80, optimize=True)
    photos.append(dict(photo_id=pid, stall_id=sid, image_path=f'/menu-photos/{fn}', batch=B,
                       original_upload=f'Foto_Tenant_Tamansari_Food_Fest.pdf ({f})', description=desc))
    if front and not S[sid].get('image_path'):
        S[sid]['image_path'] = f'/menu-photos/{fn}'

# ---------------------------------------------------------------- helpers
def find(sid, name, var=None):
    r = [m for m in menus if m['stall_id'] == sid and m['menu_name'] == name and (var is None or m['menu_variant'] == var)]
    assert len(r) == 1, (sid, name, var, len(r))
    return r[0]

def upd(sid, name, var=None, **kw):
    m = find(sid, name, var)
    for k, v in kw.items():
        m[k] = v
    log.append(f'UBAH {m["menu_id"]} {S[sid]["stall_name"]} – {name}: ' + ', '.join(f'{k}={v}' for k, v in kw.items() if k != 'notes'))

nxt = max(int(m['menu_id'][1:]) for m in menus) + 1
added = {}
def add(sid, rows):
    global nxt
    for (name, var, price, cat, src, st, nt, desc) in rows:
        key = (sid, name.lower(), (var or '').lower())
        assert not any((m['stall_id'], m['menu_name'].lower(), (m['menu_variant'] or '').lower()) == key for m in menus), key
        menus.append(dict(menu_id=f'M{nxt:04d}', stall_id=sid, menu_name=name, menu_variant=var or None, price=price,
                          category=cat, food_type=FT[cat], item_type='addon' if cat == 'tambahan' else 'main',
                          description=desc or None, image_path=None, availability='available', source_image=src,
                          verification_status=st, notes=nt or None, batch=B))
        nxt += 1
        added[sid] = added.get(sid, 0) + 1

# ---------------------------------------------------------------- W025 Siomay Rezeki — harga terkonfirmasi
OK25 = 'Dikonfirmasi foto P032 (jumlah nama = jumlah harga, urutan sama).'
upd('W025', 'Siomay Baso Tahu', price=15000, verification_status=V, source_image='P032', notes='Harga terbaca di P032.')
upd('W025', 'Siomay Baso Tahu Kuah', price=15000, verification_status=V, source_image='P032', notes='Harga terbaca di P032.')
for m in menus:
    if m['stall_id'] == 'W025' and m['verification_status'] == NV:
        m['verification_status'], m['notes'] = V, OK25
        log.append(f'UBAH {m["menu_id"]} Siomay Bandung Rezeki – {m["menu_name"]}: verification_status=VERIFIED')

# ---------------------------------------------------------------- W022 Rakus
upd('W022', 'Telor Cabe Daun Jeruk', 'Best Deal', verification_status=V, source_image='P045', notes='Harga 15K terlihat jelas di P045.')

# ---------------------------------------------------------------- W033 Bu Darsih
gl = find('W033', 'Gado-gado + Lontong')
upd('W033', 'Gado-gado + Lontong', verification_status=NV,
    notes=f'Harga ditulis tangan. P027 terbaca {gl["price"]//1000}K, P035 terbaca 16.000 — mohon konfirmasi.')

# ---------------------------------------------------------------- W002 Geprek Buncit — ganti paket lama (keputusan pemilik proyek)
for name in ['Paket Nasi Ayam + Es Teh + Lalab + Kriuk', 'Paket Nasi Ayam + Lalab + Kriuk']:
    m = [x for x in menus if x['stall_id'] == 'W002' and x['menu_name'] == name][0]
    menus.remove(m)
    log.append(f'HAPUS {m["menu_id"]} Geprek Buncit 65 – {name} ({m["price"]}): diganti stiker harga baru P040 (keputusan pemilik proyek).')
add('W002', [
    ('Nasi + Ayam Ori Geprek', '', 16000, 'ayam', 'P040', V, 'Stiker harga baru.', 'Pilihan sambal: Kemangi, Matah, Daun Jeruk, Sambel Bawang.'),
    ('Nasi + Ayam Bakar Geprek', '', 17000, 'ayam', 'P040', V, 'Stiker harga baru.',
     'Pilihan: Saos Krispy Bakar, Saos Krispy BBQ, Saos Krispy Black Pepper, Ayam Goreng Presto, Ayam Bakar Presto.'),
    ('Tambah Es Teh (gula asli)', 'Tambahan', 2000, 'tambahan', 'P040', V, 'Tertulis "Minum segar es teh gula asli + Rp2000".', ''),
])

# ---------------------------------------------------------------- W026 Sop Buah H. Ade
add('W026', [('Es Teller', '', None, 'jus', 'P042', NV, 'Tercantum di papan nama warung; ' + NOPRICE, ''),
             ('Mangga Potong', '', None, 'jus', 'P042', NV, 'Ada papan "Mangga Potong / Slice Mango"; ' + NOPRICE, '')])

# ---------------------------------------------------------------- W032 Warung Gembul
upd('W032', 'Nasi Ayam Crispy Gulai', notes='Di banner P043 tertulis "Ayam Kembu (Crispy Gulai)" 18K.')
add('W032', [('Nasi Ayam Serundeng', '', 19000, 'ayam', 'P043', V, '', ''),
             ('Nasi Omelete Usus', '', 14000, 'nasi', 'P043', V, '', '')])

# ---------------------------------------------------------------- W034 Warung Nasi Mandiri (+ Nasi Soto Medan)
SEQ = 'Kolom harga sedikit bergeser karena sudut foto; dipasangkan berurutan (pola konsisten, mis. geprek ijo/merah sama harga). Mohon konfirmasi.'
r = []
for n, p, c in [('Nasi Ayam Geprek Sambel Ijo', 16, 'ayam'), ('Nasi Ayam Geprek Sambel Merah', 16, 'ayam'),
                ('Nasi Ayam Sayur + Tempe + Tahu', 20, 'ayam'), ('Nasi Ayam Sayur', 18, 'ayam'),
                ('Nasi Tongkol Sayur', 14, 'seafood'), ('Nasi Usus Sayur', 14, 'nasi'), ('Nasi Ikan Sayur', 18, 'seafood'),
                ('Nasi Kerang Sayur', 14, 'seafood'), ('Nasi Kikil Sayur', 14, 'nasi'), ('Nasi Ati Ampela Sayur', 14, 'nasi'),
                ('Nasi Udang Sayur', 18, 'seafood'), ('Nasi Ayam Penyet Sambel Ijo', 17, 'ayam'),
                ('Nasi Ayam Penyet Sambel Merah', 17, 'ayam')]:
    r.append((n, '', p * 1000, c, 'P034', NV, SEQ, ''))
HID = 'Harga tertutup gelas di foto.'
r += [('Nasi Cumi Sayur', '', None, 'seafood', 'P034', NV, HID, ''),
      ('Nasi Gule', '', None, 'daging', 'P034', NV, HID, ''),
      ('Nasi Opor', '', None, 'ayam', 'P034', NV, HID, ''),
      ('…m Sihlin (nama terpotong)', '', None, 'nasi', 'P034', NV, 'Dua baris terakhir tertutup gelas; terbaca "…LIN" dan "…M SIHLIN". Mohon cek nama & harga.', ''),
      ('Nasi Soto Ayam', 'Soto Medan', 15000, 'berkuah', 'P034', NV, 'Kartu "Nasi Soto Medan"; stiker harga samar (terbaca 15K).', ''),
      ('Nasi Soto Sapi', 'Soto Medan', 18000, 'berkuah', 'P034', V, 'Kartu "Nasi Soto Medan".', '')]
add('W034', r)

# ---------------------------------------------------------------- W003 Ayam Kolgo
KG = 'Angka di stiker harga tidak terbaca di foto (poster menulis "Harga mulai dari").'
add('W003', [(n, '', None, 'ayam', 'P049', NV, KG, d) for n, d in [
    ('Nasi Ayam Kolgo', 'Paket pilihan.'), ('Nasi Ayam Kolgo + Telur', 'Paket pilihan.'),
    ('Nasi Ayam Kolgo + Tahu Tempe', 'Paket pilihan.'), ('Nasi Ayam Sambel Ijo (Original)', ''),
    ('Nasi Ayam Sambel Ijo + Tahu Tempe', ''), ('Nasi Ayam Sambel Ijo + Telur', '')]])

# ---------------------------------------------------------------- W008 Berkah Saluyu
BS = 'Free es teh, free flow nasi daun jeruk.'
HW = 'Harga tulisan tangan.'
r = []
for n, p, nt in [('GEA (Ayam) Cabe Garam', 18, HW), ('Ayam Asam Manis', 18, HW), ('Ayam Mercon', 18, HW),
                 ('Ayam Selimut Telur (Selor)', 21, HW + ' Angka pertama sedikit tertimpa (terbaca 21000).'),
                 ('Ayam Kremes', 18, HW), ('Ayam Porokpok Himatika', 18, HW),
                 ('Katsu Cabe Garam', 17, ''), ('Katsu Asam Manis', 17, ''), ('Katsu Mercon', 17, ''),
                 ('Ayam Popcorn Cabe Garam', 18, HW), ('Ayam Popcorn Asam Manis', 18, HW),
                 ('Ayam Popcorn Selor (Selimut Telur)', 23, HW),
                 ('Chicken Wings Cabe Garam', 20, ''), ('Chicken Wings Mercon', 20, ''), ('Chicken Wings Asam Manis', 20, ''),
                 ('Nasi Cobek Ayam Selor (Selimut Telur)', 20, '')]:
    r.append((n, '', p * 1000, 'ayam', 'P053', V, nt, BS))
for n in ['Sapi Mercon', 'Sapi Teriyaki', 'Sapi Cabe Garam']:
    r.append((n, '', 20000, 'daging', 'P053', V, '', BS))
for n in ['Bandeng Cabe Garam', 'Bandeng Asam Manis', 'Bandeng Mercon', 'Bandeng Kremes', 'Bandeng Selor (Selimut Telur)',
          'Nasi Cobek Bandeng Selor (Selimut Telur)']:
    r.append((n, '', 20000, 'seafood', 'P053', V, '', BS))
r.append(('Nasi Gila', '', 20000, 'nasi', 'P053', V, '', BS))
for n, p in [('Telur Dadar', 5000), ('Telur Krispy', 6000), ('Tahu / Tempe', 1000), ('Kremes', 2000)]:
    r.append((n, 'Add-on', p, 'tambahan', 'P053', V, '', ''))
add('W008', r)

# ---------------------------------------------------------------- W024 Sate Taichan Bengawan
SK = 'Judul kolom harga pertama samar (terbaca "? TUSUK", kemungkinan 5 tusuk).'
r = []
for n, a, b in [('Taichan Dada Ayam', 16000, 27000), ('Taichan Kulit', 16000, 27000), ('Taichan Paha', 16000, 27000),
                ('Taichan Pedas Asin', 16000, 27000), ('Taichan Paha Kulit', 16000, 27000), ('Taichan Usus', 13500, 24000)]:
    r.append((n, 'Porsi kecil', a, 'ayam', 'P055', V, SK, ''))
    r.append((n, '10 tusuk', b, 'ayam', 'P055', V, '', ''))
r += [('Taichan Bakso', 'Porsi kecil', 27000, 'camilan', 'P055', NV, 'Harga dipasangkan berurutan; 27K di kolom porsi kecil tampak janggal. Mohon cek.', ''),
      ('Chicken Swiping', '2 pcs', 27000, 'ayam', 'P055', V, '', ''),
      ('Dimchan', '1 porsi', 22000, 'camilan', 'P055', V, 'Tertulis "Dimchan 1 porsi (2 tusuk?)", keterangan kecil buram.', '')]
for n, p in [('Nasi', 7000), ('Lontong 1 Porsi', 6000), ('Kerupuk', 3000), ('Bumbu Asin', 2500), ('Cheese Melted', 6000),
             ('Sambal Bengawan', 2500)]:
    r.append((n, 'Tambahan', p, 'tambahan', 'P055', V, '', ''))
add('W024', r)

# ---------------------------------------------------------------- stalls
def alt(sid, *names):
    for n in names:
        if n not in S[sid]['alternative_names'] and n != S[sid]['stall_name']:
            S[sid]['alternative_names'].append(n)
    S[sid]['alternative_names'].sort()

def note(sid, t):
    S[sid]['notes'] = (S[sid]['notes'] + ' ' if S[sid]['notes'] else '') + t

alt('W033', 'Soto Betawi', 'Warung Makan Ibu Darsih', 'Warung Nasi Soto Betawi Bu Darsih')
note('W033', 'Batch 3: W027 "Soto Betawi" digabung ke warung ini (dikonfirmasi pemilik proyek).')
alt('W034', 'Nasi Soto Medan')
note('W034', 'Batch 3: W021 "Nasi Soto Medan" digabung ke warung ini (dikonfirmasi pemilik proyek).')
for old, new in [('W027', 'W033'), ('W021', 'W034')]:
    S[old]['merged_into'] = new
    S[old]['verification_status'] = 'MERGED'
    note(old, f'Batch 3: digabung ke {new} ({S[new]["stall_name"]}). ID dipertahankan sebagai riwayat.')
alt('W002', 'Geprek Buncit 65')
DESC = {
    'W003': 'Nasi ayam Kolgo dan nasi ayam sambel ijo, paket dengan telur atau tahu tempe.',
    'W008': 'Ayam, katsu, popcorn, chicken wings, sapi & bandeng dengan saus cabe garam/mercon/asam manis. Free es teh & nasi daun jeruk.',
    'W024': 'Sate taichan dada, kulit, paha, usus, dan bakso. Porsi kecil atau 10 tusuk.',
    'W034': 'Nasi sayur aneka lauk, ayam geprek & penyet sambel ijo/merah, dan Nasi Soto Medan.',
    'W002': 'Nasi + ayam geprek Ori (16K) atau Bakar Geprek (17K).',
}
for k, v in DESC.items():
    S[k]['description'] = v
for sid in ('W003', 'W008', 'W024', 'W034'):
    if S[sid]['verification_status'] == 'MAP_ONLY':
        S[sid]['verification_status'] = 'VERIFIED'
note('W004', 'Batch 3: papan atas warung bertuliskan "PECEL LELE" — belum dipastikan apakah W020 "Nasi Pecel" adalah warung ini.')
note('W023', 'Batch 3: banner di sebelah kanan Rakus menampilkan mie & dimsum (bukan roti bakar). Perlu dicek apakah warung di posisi ini sudah berganti.')
note('W010', 'Batch 3: di dekat warung ini terlihat banner "Cemasan" dan kios kelontong (P041); identitasnya belum dipastikan.')

# ---------------------------------------------------------------- save
for c in cats:
    c['menu_count'] = sum(1 for m in menus if m['category'] == c['category_id'])
def dump(n, o):
    json.dump(o, open(os.path.join(D, n), 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
dump('stalls.json', stalls); dump('menus.json', menus); dump('categories.json', cats); dump('photos.json', photos)
print('Menu ditambah:', sum(added.values()), added)
print('\n'.join(log))
print('Total menu:', len(menus), '| foto:', len(photos))
