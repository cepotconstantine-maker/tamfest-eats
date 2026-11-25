# TAMFEST EATS 🍽️

**Your Food, Your Budget, Your Choice.**
Website untuk mencari makanan, membandingkan harga, dan menemukan lokasi warung di foodcourt Taman Festival (Tamansari Food Fest). Website ini **bukan** layanan pemesanan atau pembayaran.

Dibuat dengan React + Vite. Semua data disimpan di file JSON, jadi website bisa jalan tanpa server/database.

---

## 0. Cara tercepat online (tanpa terminal, ±15 menit)

Cocok kalau cuma ingin website-nya online dulu. Yang dibutuhkan hanya browser di laptop/PC.

1. **Ekstrak** `tamfest-eats-v3.zip`. Hasilnya folder `tamfest-eats`.
2. **Buat repo GitHub:** buka https://github.com/new, beri nama `tamfest-eats`, centang **Add a README file**, lalu klik **Create repository**.
3. **Upload file:** di halaman repo klik **Add file → Upload files**. Buka folder `tamfest-eats`, pilih **semua isinya** (bukan folder luarnya), lalu tarik ke browser. Jangan ikutkan folder `node_modules` atau `dist` kalau ada. Klik **Commit changes**.
   - GitHub membatasi 100 file per upload. Proyek ini ±97 file, jadi masih bisa sekali upload. Kalau nanti foto bertambah dan lewat 100, upload dua kali: pertama semua file kecuali `public/menu-photos`, lalu folder `public` saja.
   - Pastikan `package.json` muncul langsung di halaman utama repo, bukan di dalam subfolder.
   - Kalau README bawaan GitHub bentrok, pilih timpa dengan README dari proyek.
4. **Deploy:** buka https://vercel.com, pilih **Continue with GitHub**, lalu **Add New… → Project → Import** repo `tamfest-eats` → **Deploy**. Pengaturan lain biarkan default (Vercel otomatis mengenali Vite).
5. Sekitar 1 menit kemudian website online, misalnya di `https://tamfest-eats.vercel.app`. Coba buka `/peta` di HP.

**Update data nanti:** buka `src/data/menus.json` di GitHub, klik ikon ✏️ (Edit), ubah, lalu **Commit changes**. Vercel otomatis deploy ulang dalam ±1 menit. Kalau datanya salah format, deploy akan gagal dan versi lama tetap online. Cek pesan error-nya di tab **Deployments** di Vercel.

**Data yang belum ada:** harga yang belum diketahui ditulis `null`, lalu di website tampil "Harga belum tercantum". Warung tanpa menu tetap muncul di peta dan daftar warung dengan keterangan "Menu belum didata". Begitu datanya ada, cukup isi JSON-nya.

---

## 1. Fitur

| Halaman | URL | Isi |
|---|---|---|
| Beranda | `/` | Pencarian, kategori populer, rekomendasi budget, menu pilihan, pintasan ke peta |
| Jelajah Menu | `/jelajah` | Pencarian real-time, filter kategori, jenis, warung, dan rentang harga (bisa digabung), urutan termurah/termahal, reset, jumlah hasil |
| Budget Finder | `/budget` | Masukkan budget min/maks, lalu tampil semua menu yang masuk |
| Detail Menu | `/menu/M0001` | Harga, warung, lokasi, foto menu asli, varian, topping, tombol Find on Map |
| Bandingkan | `/bandingkan` | Bandingkan sampai 3 menu sekaligus |
| Acak | `/acak` | Pilihan menu acak yang tetap mengikuti filter dan budget |
| Peta | `/peta` | Denah interaktif: zoom, geser, klik warung, cari, filter kategori, panel samping (desktop) / bottom sheet (HP), dan mode denah PDF asli |
| Daftar Warung | `/warung` | Semua warung beserta lokasinya |

Contoh *Find on Map*: `/peta?warung=W012&menu=M0100` akan membuka peta, zoom ke warung, menandai warungnya, membuka panel, dan menampilkan menu yang dicari.

---

## 2. Struktur folder

```
tamfest-eats/
├── public/
│   ├── menu-photos/        ← foto papan menu (P001-W012.jpg, dst.)
│   ├── map/                ← denah-asli.png + Map-Tamfest.pdf
│   └── favicon.svg
├── src/
│   ├── data/               ← ★ DATABASE (yang kamu edit)
│   │   ├── stalls.json     ← daftar warung
│   │   ├── menus.json      ← daftar menu & harga
│   │   ├── categories.json ← kategori
│   │   ├── map.json        ← koordinat warung di denah
│   │   └── photos.json     ← daftar foto menu
│   ├── lib/
│   │   ├── db.js           ← data layer terpusat (filter, format harga, dll.)
│   │   └── compare.jsx     ← state "Bandingkan"
│   ├── components/         ← Navbar, FilterPanel, FloorPlan, StallPanel, kartu, dll.
│   ├── pages/              ← Home, Explore, Budget, FoodDetail, Compare, RandomPicker, MapPage, Stalls
│   ├── App.jsx, main.jsx
│   └── styles.css          ← semua warna & tampilan
├── scripts/
│   ├── validate-data.mjs   ← cek data sebelum deploy
│   └── export_xlsx.py      ← ekspor JSON → Excel
├── exports/Tamfest_Eats_Database.xlsx
├── DATA_LOG.md             ← log pemrosesan data & daftar yang perlu dicek
├── vercel.json
└── package.json
```

---

## 3. Instalasi (untuk pemula)

1. **Install Node.js** versi 20.19 atau lebih baru (disarankan 22 LTS) dari https://nodejs.org (pilih "LTS").
   Cek di Terminal/Command Prompt: `node -v`
2. **Ekstrak** folder proyek ini, lalu buka Terminal di dalam folder `tamfest-eats`.
   Di VS Code: *File → Open Folder*, lalu *Terminal → New Terminal*.
3. Install dependensi (sekali saja):
   ```bash
   npm install
   ```

## 4. Menjalankan di komputer sendiri

```bash
npm run dev
```
Buka alamat yang muncul, biasanya http://localhost:5173. Setiap kali file disimpan, halaman otomatis ter-update.

Cek versi produksi:
```bash
npm run build      # hasil ada di folder dist/
npm run preview    # buka http://localhost:4173
```

---

## 5. Update data menu

Semua menu ada di **`src/data/menus.json`**. Satu menu formatnya seperti ini:

```json
{
  "menu_id": "M0386",
  "stall_id": "W003",
  "menu_name": "Ayam Kolgo Original",
  "menu_variant": null,
  "price": 18000,
  "category": "ayam",
  "food_type": "Makanan Berat",
  "item_type": "main",
  "description": "Gratis es teh.",
  "image_path": null,
  "availability": "available",
  "source_image": "P031",
  "verification_status": "VERIFIED",
  "notes": null,
  "batch": 3
}
```

- **Ubah harga:** cari menunya (Ctrl+F), lalu ganti angka `price`. Tulis tanpa titik: `18000`. Isi `null` kalau harganya belum diketahui.
- **Tambah menu:** salin satu blok, beri `menu_id` baru (lanjutkan nomor terakhir), lalu isi `stall_id` sesuai `stalls.json`.
- **Varian/ukuran beda harga:** buat satu blok untuk setiap varian, dengan `menu_name` yang sama dan `menu_variant` yang berbeda (mis. "Hot" / "Ice").
- **`category`** harus salah satu `category_id` di `categories.json`: `nasi, ayam, mie, berkuah, daging, seafood, sayur, camilan, roti, dessert, kopi, minuman, jus, tambahan`.
- **`item_type`**: `main` untuk menu biasa, `addon` untuk topping/tambahan. Addon hanya muncul kalau opsi "Tampilkan topping" dicentang.
- **Menu habis/tidak dijual lagi:** ubah `availability`, atau hapus bloknya dan tulis alasannya di `DATA_LOG.md`.
- **Foto makanan (opsional):** taruh file di `public/food-photos/`, lalu isi `"image_path": "/food-photos/nama.jpg"`. Kalau `image_path` kosong, kartu menu memakai ilustrasi kategori.
- **Foto papan menu baru:** taruh di `public/menu-photos/P031-W003.jpg`, lalu tambahkan entri di `photos.json`.

Setelah mengedit, **selalu jalankan** (perintah `npm run build` juga otomatis menjalankan cek ini, jadi Vercel menolak deploy kalau data rusak):
```bash
npm run validate
```
Perintah ini mengecek ID ganda, `stall_id`/kategori yang salah ketik, foto yang hilang, dan duplikat. Kalau muncul ✗, perbaiki dulu.

Perbarui Excel-nya (opsional, butuh Python + openpyxl):
```bash
python scripts/export_xlsx.py
```

## 6. Update lokasi warung di peta

Koordinat ada di **`src/data/map.json`** → `markers`. Nilai `x` dan `y` antara 0 dan 1:

- `x`: 0 = ujung kiri denah, 1 = ujung kanan
- `y`: 0 = atas, 1 = bawah (JALAN ada di bawah)

```json
{ "stall_id": "W016", "map_label": "Korean Chicken Spicy BBQ", "zone": "Baris Tengah",
  "x": 0.83, "y": 0.5224, "label_width": 0.05, "booth_number": "B09",
  "source": "Survei lapangan", "placement_status": "MANUAL" }
```

- `zone` menentukan baris tempat kotak warung digambar: `Baris Atas`, `Baris Tengah`, `Sisi Kiri`, atau `Sisi Kanan`.
- Isi juga `map_x`, `map_y`, `location_zone`, dan `booth_number` yang sama di `stalls.json`.
- Untuk memperkirakan `x` dari gambar denah: `x = posisi piksel ÷ lebar gambar`. Gambar ada di `public/map/denah-asli.png` dengan lebar 4141 px.
- Warung tanpa marker otomatis masuk daftar **"Belum di denah"** di halaman peta.

---

## 7. Upload ke GitHub

1. Buat akun di https://github.com, lalu klik **New repository**, beri nama `tamfest-eats` (Public atau Private), dan klik **Create**.
2. Di Terminal (folder proyek):
   ```bash
   git init
   git add .
   git commit -m "TAMFEST EATS v1"
   git branch -M main
   git remote add origin https://github.com/USERNAME/tamfest-eats.git
   git push -u origin main
   ```
   Ganti `USERNAME` dengan username GitHub-mu. Folder `node_modules` dan `dist` tidak ikut ter-upload (sudah diatur di `.gitignore`).
3. Setiap selesai update data:
   ```bash
   git add .
   git commit -m "Update harga menu"
   git push
   ```

## 8. Deploy ke Vercel (gratis)

1. Buka https://vercel.com, lalu pilih **Sign up with GitHub**.
2. Klik **Add New… → Project**, pilih repo `tamfest-eats`, lalu **Import**.
3. Vercel otomatis mendeteksi **Vite**. Pastikan:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Klik **Deploy**. Sekitar 1 menit kemudian, website online di alamat seperti `https://tamfest-eats.vercel.app`.
5. Setiap `git push` ke `main` otomatis memicu deploy ulang.

`vercel.json` sudah mengatur agar alamat seperti `/peta?warung=W012` atau `/menu/M0001` bisa dibuka langsung atau di-refresh tanpa error 404.

## 9. Konfigurasi URL publik

- **Ganti nama subdomain Vercel:** Project → Settings → Domains → Edit, misalnya `tamfesteats.vercel.app` (kalau namanya belum dipakai orang).
- **Pakai domain sendiri** (mis. `tamfesteats.my.id`): Settings → Domains → Add, lalu ikuti instruksi DNS (record `A` atau `CNAME`) di penyedia domain.
- **Hosting di subfolder** (mis. GitHub Pages `username.github.io/tamfest-eats/`):
  ```bash
  VITE_BASE=/tamfest-eats/ VITE_HASH_ROUTER=1 npm run build
  ```
  `VITE_HASH_ROUTER=1` membuat URL memakai `#/` sehingga aman di hosting statis yang tidak mendukung rewrite.
- Untuk **QR code di foodcourt**, cukup arahkan ke URL publik. Bisa juga langsung ke peta: `https://…/peta`.

---

## 10. Mengubah tampilan

Warna ada di bagian atas `src/styles.css` (`--green`, `--orange`, `--cream`, …). Font: Plus Jakarta Sans dan Bricolage Grotesque (terpasang lewat npm, tidak butuh internet).

## 11. Catatan data

Lihat **`DATA_LOG.md`** untuk riwayat batch, keputusan, dan daftar item yang masih perlu dicek. Item berstatus `NEEDS_VERIFICATION` tampil dengan badge ⚠ di website.
