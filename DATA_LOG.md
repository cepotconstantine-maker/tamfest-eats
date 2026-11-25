# Log Pemrosesan Data — TAMFEST EATS

Database ini dibuat dari tiga sumber: Excel master warung (`Tamfest_Eats_Master_Database_v1.xlsx`), denah `Map Tamfest.pdf` (halaman 1), dan foto papan menu.

**Status verifikasi menu**
- `VERIFIED`: nama dan harga terbaca jelas di foto.
- `NEEDS_VERIFICATION`: harga atau nama kabur, tertutup, tidak tercantum, atau berbeda antar-board. Ditampilkan di web dengan badge ⚠.
- `USER_PROVIDED`: data diketik langsung oleh pemilik proyek, bukan dari foto.

---

## Batch 1 — 20 Nov 2026 (17 foto + 2 data teks): 248 item

| Warung | Item | Perlu verifikasi | Sumber |
|---|---|---|---|
| W012 Coffee & Milk (Coffee Pakmali) | 64 | 7 | P001 |
| W014 Kedai Pak Mali | 27 | 0 | P002 |
| W029 Teh Poci | 14 | 2 | P003 |
| W011 Bubur Ayam Dio | 20 | 4 | P004 |
| W019 Mix Nyong | 73 | 3 | P005–P012 |
| W028 Tahu Sumedang | 2 | 0 | teks + P013 (foto warung) |
| W030 Warcik Soto Bogor | 4 | 0 | P014 + nama dari pemilik proyek |
| W022 Rakus | 16 | 1 | P015 |
| W026 Sop Buah H. Ade (Juice H Ade) | 14 | 0 | P016 |
| W017 Luthfi Abadi Jaya (Seblak Level Up) | 12 | 0 | P017 |
| W010 Batagor Siomay Motekar | 2 | 0 | teks |

## Batch 2 — 20 Nov 2026 (13 foto): 137 item

| Warung | Item | Perlu verifikasi | Sumber |
|---|---|---|---|
| W002 Ayam Geprek Buncit 65 | 8 | 2 | P018 |
| W005 Bakmi Leugiit Pojokan | 10 | 0 | P019 |
| W025 Siomay Bandung Rezeki | 17 | 13 | P020 |
| **W037 Yoshimitsu (warung baru)** | 6 | 0 | P021 |
| W013 Jawara | 18 | 0 | P022 |
| W001 Ayam di Geprekin | 8 | 7 | P023 |
| W018 Nabox Ma Chic | 8 | 0 | P024 |
| W004 Ayam Penyet Ibu Suwarti | 15 | 0 | P025 |
| W032 Warung Gembul (Si Gembul) | 7 | 0 | P026 |
| W033 Warung Nasi Betawi Bu Darsih | 13 | 1 | P027 |
| W035 Warung Nasi Panghegar | 26 | 20 | P028–P030 |
| W006 Bakso Hareudang | 1 | 1 | P028 |

**Total: 385 item (327 menu utama + 58 topping/tambahan) dari 23 warung.** Tidak ada duplikat (dicek per warung + nama + varian).

## Batch 3 — 23 Nov 2026 (PDF "Foto Tenant Tamansari Food Fest", 25 foto): +83 item, 15 item diperbaiki, 2 item dihapus

| Warung | Perubahan | Sumber |
|---|---|---|
| **W008 Berkah Saluyu** (baru ada menu) | +30 item (ayam, katsu, popcorn, wings, sapi, bandeng, add-on) | P052–P053 |
| **W024 Sate Taichan Bengawan** (baru ada menu) | +21 item (porsi kecil / 10 tusuk + tambahan) | P055 |
| **W034 Warung Nasi Mandiri** (baru ada menu) | +19 item, termasuk kartu Nasi Soto Medan | P033–P034 |
| **W003 Ayam Kolgo** (baru ada menu) | +6 item, semua harga belum terbaca | P049 |
| W002 Geprek Buncit 65 | 2 paket lama dihapus (M0009, M0010) dan diganti stiker baru: Ori Geprek 16K, Bakar Geprek 17K, +es teh 2K | P040 |
| W025 Siomay Bandung Rezeki | Siomay Baso Tahu & Kuah = 15K; 11 harga lain terkonfirmasi → semua VERIFIED | P031–P032 |
| W032 Warung Gembul | +Nasi Ayam Serundeng 19K, +Nasi Omelete Usus 14K | P043 |
| W026 Sop Buah H. Ade | +Es Teller, +Mangga Potong (tanpa harga) | P042 |
| W022 Rakus | Telor Cabe Daun Jeruk 15K → VERIFIED | P045 |
| W033 Bu Darsih | Gado-gado + Lontong: foto lama 15K, foto baru 16K → NEEDS_VERIFICATION | P035 |

Foto lain (P036–P039, P041, P044, P046–P048, P050–P051, P054) adalah tampak depan atau foto ulang papan yang sama; isinya cocok dengan data sebelumnya. Foto tampak depan sekarang dipakai sebagai foto warung di peta dan daftar warung.

**Keputusan pemilik proyek (batch 3)**
1. W027 "Soto Betawi" = W033 Bu Darsih → digabung (`merged_into: W033`).
2. W021 "Nasi Soto Medan" = bagian W034 Warung Nasi Mandiri → digabung (`merged_into: W034`).
3. Geprek Buncit 65 memakai stiker harga baru; paket lama dihapus.

Warung yang digabung tetap ada di `stalls.json` sebagai riwayat, tetapi tidak tampil di website.

**Temuan lapangan dari foto (belum ditindaklanjuti)**
- Papan atas Ayam Penyet Ibu Suwarti bertuliskan "PECEL LELE". Mungkin ini W020 "Nasi Pecel"?
- Di posisi Roti Bakar (sebelah kanan Rakus) terlihat banner mie & dimsum, bukan roti bakar.
- Dekat Batagor Motekar terlihat banner "Cemasan" dan sebuah kios kelontong (P041), kemungkinan W015 Kelontong.
- Urutan warung di foto cocok dengan denah: Berkah Saluyu–Yoshimitsu, Jawara–Ayam diGeprekin–Panghegar, Warung Gembul–Sop Buah H. Ade, Warcik–Sate Taichan–Siomay Rezeki.

**Total setelah batch 3: 466 item (397 menu utama + 69 tambahan), 27 dari 35 warung aktif sudah punya menu.**

---

## Keputusan yang dikonfirmasi pemilik proyek (batch 1–2)

1. Coffee & Milk (W012) dan Kedai Pak Mali (W014) adalah **dua warung terpisah**. Board kopi masuk ke W012, menu cemilan masuk ke W014.
2. Banner kuning paket geprek (16K/19K) milik **W002 Ayam Geprek Buncit 65**.
3. Kertas "Nasi Ayam Geprek 18k" milik **W001 Ayam di Geprekin**.
4. Board hitam "Menu Paket" milik **W033 Warung Nasi Betawi Bu Darsih**.
5. Mi Ayam & Bakso Panghegar, Soto Ayam Panghegar, dan poster Ayam Goreng Sambel Dadakan milik **W035 Warung Nasi Panghegar**.
6. Soto Bogor Warcik: 1 = Soto Medan, 2 = Soto Bogor, 3 = Ayam Penyet, 4 = Ayam Geprek.
7. Harga float Mix Nyong mengikuti **board tempelan tangan** (Milo 12K, Beng-beng 12K, Cookies Cream 11K).

## Perubahan pada master warung

- **W037 Yoshimitsu** ditambahkan: ada di denah PDF dan punya foto menu, tetapi tidak ada di Excel v1. ID lama tidak diubah.
- W018 namanya diubah menjadi **Nabox Ma Chic** karena board menu memakai nama itu.
- W005 namanya diubah menjadi **Bakmi Leugiit Pojokan** mengikuti ejaan di board.
- Nama alternatif ditambahkan: Coffee Pakmali (W012), Kedai Pakmali (W014), Lutfi Abadi Jaya / Seblak Level Up (W017), Juice H Ade (W026), Warung Si Gembul (W032).

## Aturan penanganan data

- Item yang **disensor hitam** di foto tidak dimasukkan: 2 di Coffee Pakmali, 2 di Juice H Ade.
- Item yang **tidak punya harga** di foto tetap dicatat dengan `price: null` dan status NEEDS_VERIFICATION. Item ini tidak muncul di Budget Finder maupun Random Picker.
- **Harga Jumbo Bakmi Leugiit** dihitung dari tulisan "JUMBO 2x LIPAT +5K" di board.
- **Mix Nyong Cup Series dan Sundae Series** isinya mirip, tapi tidak digabung karena belum dipastikan barangnya sama. Keduanya diberi catatan.
- **Kode lokasi** (A01–A17, B01–B08, L01–L03, R01–R03) dibuat dari urutan di denah. Ini **bukan nomor booth resmi**.

## Masih perlu dikonfirmasi (per batch 3)

- **Warung Nasi Mandiri:** kolom harga dipasangkan berurutan (13 item). Harga Cumi Sayur, Gule, Opor, dan dua baris terakhir ("…Sihlin") tertutup gelas. Stiker harga Nasi Soto Ayam samar.
- **Ayam Kolgo:** semua stiker harga tidak terbaca (6 item).
- **Sate Taichan:** judul kolom harga pertama (5 tusuk?), dan harga Taichan Bakso 27K.
- **Warung Nasi Panghegar:** harga lauk prasmanan, Soto Ayam, dan Ayam Goreng Sambel Dadakan.
- **Ayam di Geprekin:** harga Ayam Geprek, Indomie Ayam Geprek, Terong Geprek, dan tambahan.
- **Coffee & Milk:** 6 angka yang ditimpa + Upgrade Oatmilk.
- **Bu Darsih:** Gado-gado + Lontong (15K atau 16K?) dan Rawon (sudah termasuk nasi?).
- **Lainnya:** Kol Goreng (Geprek Buncit), harga minuman Bubur Dio, varian Bakso Hareudang, 2 float + topping Milo (Mix Nyong), Milk Iced Tea & Extra Creamy (Teh Poci), Es Teller & Mangga Potong (Sop Buah).
- **Ejaan W017:** "Lutfi" atau "Luthfi"?
- **Belum ada menu (8 warung):** Bebek Stallone, Roti Bakar, Warung Djarum Super, "Warung" (label umum), Berasal, Kelontong, Korean Chicken Spicy BBQ, Nasi Pecel.
- **Belum ada di denah (4 warung):** Berasal, Kelontong, Korean Chicken Spicy BBQ, Nasi Pecel.
