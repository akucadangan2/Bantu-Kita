const FAQ_GROUPS = [
  {
    category: "Umum",
    items: [
      { q: "Apa itu platform ini?", a: "Platform galang dana dan donasi online untuk donasi, zakat, wakaf, dan kegiatan sosial." },
      { q: "Apakah harus punya akun untuk berdonasi?", a: "Tidak wajib — kamu bisa donasi sebagai tamu. Tapi dengan akun, kamu bisa lihat riwayat donasi dan ikut kegiatan sosial." },
    ],
  },
  {
    category: "Donasi",
    items: [
      { q: "Bagaimana cara berdonasi?", a: "Buka campaign yang ingin dibantu, isi nominal di form donasi, lalu bayar lewat QRIS dan upload bukti transfer." },
      { q: "Berapa lama donasi saya diverifikasi?", a: "Admin memverifikasi setelah bukti transfer diupload. Biasanya tidak lama, tapi bisa bervariasi tergantung volume donasi masuk." },
      { q: "Kenapa progress campaign belum berubah setelah saya bayar?", a: "Progress baru bertambah setelah admin memverifikasi bukti transfer kamu, bukan otomatis begitu upload." },
    ],
  },
  {
    category: "Zakat & Wakaf",
    items: [
      { q: "Apakah kalkulator zakat di sini akurat?", a: "Kalkulator ini estimasi awal untuk memudahkan perhitungan. Untuk kepastian nisab dan nilai terkini, sebaiknya cek juga ke lembaga zakat resmi seperti BAZNAS." },
      { q: "Apa bedanya wakaf dengan donasi biasa?", a: "Wakaf dihitung per unit (misal per m² tanah), bukan nominal bebas seperti donasi campaign." },
    ],
  },
  {
    category: "Galang Dana",
    items: [
      { q: "Bagaimana cara membuat campaign?", a: "Daftar sebagai Penggalang Dana, lalu buka menu \"Galang Dana\" dan isi detail campaign kamu." },
      { q: "Kenapa campaign saya belum tayang?", a: "Semua campaign baru berstatus \"Menunggu Verifikasi\" dan perlu disetujui admin dulu sebelum tayang publik." },
      { q: "Bagaimana cara mencairkan dana?", a: "Buka dashboard penggalang dana, menu \"Pencairan Dana\", ajukan pencairan sesuai saldo yang tersedia." },
    ],
  },
];

export default function PusatBantuanPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 space-y-10">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-primary">Pusat Bantuan</h1>
        <p className="mt-2 text-sm text-slate-500">Pertanyaan yang sering ditanyakan.</p>
      </div>

      {FAQ_GROUPS.map((group) => (
        <div key={group.category}>
          <h2 className="font-semibold text-slate-800 mb-3">{group.category}</h2>
          <div className="space-y-2">
            {group.items.map((item) => (
              <details key={item.q} className="group rounded-xl border border-slate-100 p-4">
                <summary className="cursor-pointer list-none font-medium text-slate-700 flex items-center justify-between">
                  {item.q}
                  <span className="text-slate-400 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-2 text-sm text-slate-500">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}