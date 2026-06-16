import { Reveal } from "@/components/general/Reveal";
import { CourtLines } from "@/components/public/CourtLines";
import { siteConfig } from "@/config/site";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan",
  description:
    "Syarat dan ketentuan penggunaan situs web Padelix Indonesia — aturan, hak, dan tanggung jawab pengguna.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: `Syarat & Ketentuan | ${siteConfig.name}`,
    description:
      "Syarat dan ketentuan penggunaan situs web Padelix Indonesia — aturan, hak, dan tanggung jawab pengguna.",
    url: `${siteConfig.url}/terms`,
  },
};

const LAST_UPDATED = "13 Juni 2026";

const SECTIONS = [
  { id: "penerimaan", title: "Penerimaan Syarat" },
  { id: "layanan-kami", title: "Tentang Layanan Kami" },
  { id: "penggunaan-diizinkan", title: "Penggunaan yang Diizinkan" },
  { id: "kekayaan-intelektual", title: "Kekayaan Intelektual" },
  { id: "ketersediaan-harga", title: "Ketersediaan & Harga Produk" },
  { id: "penafian", title: "Penafian & Batasan Tanggung Jawab" },
  { id: "perubahan-layanan", title: "Perubahan Layanan" },
  { id: "hukum-berlaku", title: "Hukum yang Berlaku" },
  { id: "kontak", title: "Kontak" },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-brand-light">
      {/* Hero */}
      <section className="section relative overflow-hidden bg-court-950 py-16 text-white sm:py-20">
        <div className="bg-mesh absolute inset-0" aria-hidden />
        <CourtLines />
        <div className="wrapper relative items-start gap-4">
          <span className="kicker text-brand-green">Legal</span>
          <h1 className="display-1 text-white">Syarat &amp; Ketentuan</h1>
          <p className="max-w-2xl text-lg text-pretty text-white/70 sm:text-xl">
            Dengan menggunakan situs padelix.co.id, Anda menyetujui syarat dan
            ketentuan berikut. Mohon baca dengan seksama sebelum menggunakan
            layanan kami.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="rounded-full bg-brand-green/10 px-3 py-1 text-xs font-bold tracking-wider text-brand-green uppercase">
              Terakhir diperbarui
            </span>
            <time
              dateTime="2026-06-13"
              className="text-xs font-medium text-white/50"
            >
              {LAST_UPDATED}
            </time>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section bg-white">
        <div className="wrapper">
          <div className="mx-auto w-full max-w-3xl">
            {/* Table of contents */}
            <Reveal>
              <nav
                aria-label="Daftar isi"
                className="mb-12 rounded-brand border border-neutral-100 bg-brand-light p-6"
              >
                <p className="mb-3 text-xs font-bold tracking-widest text-neutral-400 uppercase">
                  Daftar Isi
                </p>
                <ol className="flex flex-col gap-1.5">
                  {SECTIONS.map((section, i) => (
                    <li key={section.id}>
                      <Link
                        href={`#${section.id}`}
                        className="group flex items-center gap-3 text-sm text-neutral-600 transition-colors hover:text-brand-dark"
                      >
                        <span className="w-4 text-[10px] font-black text-neutral-300 tabular-nums transition-colors group-hover:text-brand-green">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {section.title}
                      </Link>
                    </li>
                  ))}
                </ol>
              </nav>
            </Reveal>

            <div className="flex flex-col gap-12">
              {/* 1. Penerimaan */}
              <Reveal>
                <section
                  id="penerimaan"
                  className="flex scroll-mt-24 flex-col gap-4"
                >
                  <h2 className="subheading text-neutral-900">
                    01 — Penerimaan Syarat
                  </h2>
                  <p className="leading-relaxed text-neutral-600">
                    Dengan mengakses atau menggunakan situs web padelix.co.id
                    yang dioperasikan oleh Padelix Indonesia, Anda menyatakan
                    telah membaca, memahami, dan menyetujui syarat dan ketentuan
                    ini. Jika Anda tidak menyetujui salah satu ketentuan di
                    sini, mohon hentikan penggunaan situs ini.
                  </p>
                  <p className="leading-relaxed text-neutral-600">
                    Syarat dan ketentuan ini berlaku efektif sejak{" "}
                    {LAST_UPDATED} dan sewaktu-waktu dapat diperbarui.
                  </p>
                </section>
              </Reveal>

              <hr className="border-neutral-100" />

              {/* 2. Layanan */}
              <Reveal>
                <section
                  id="layanan-kami"
                  className="flex scroll-mt-24 flex-col gap-4"
                >
                  <h2 className="subheading text-neutral-900">
                    02 — Tentang Layanan Kami
                  </h2>
                  <p className="leading-relaxed text-neutral-600">
                    Padelix Indonesia menyediakan situs web informasi yang
                    mencakup:
                  </p>
                  <ul className="flex flex-col gap-3 pl-2">
                    {[
                      "Informasi dan portofolio layanan konstruksi lapangan padel.",
                      "Katalog peralatan padel dari brand mitra kami.",
                      "Kontak untuk konsultasi dan pertanyaan bisnis.",
                    ].map((item, i) => (
                      <li key={i} className="flex gap-4">
                        <span
                          className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green"
                          aria-hidden
                        />
                        <p className="text-sm leading-relaxed text-neutral-600">
                          {item}
                        </p>
                      </li>
                    ))}
                  </ul>
                  <p className="rounded-brand border border-neutral-100 bg-brand-light px-4 py-3 text-sm leading-relaxed text-neutral-600">
                    <span className="font-semibold text-neutral-800">
                      Penting:
                    </span>{" "}
                    Situs ini bukan toko online. Tidak ada pemrosesan pembayaran
                    yang terjadi di situs ini. Semua pemesanan, penawaran harga,
                    dan transaksi dilakukan melalui WhatsApp atau komunikasi
                    langsung dengan tim kami.
                  </p>
                </section>
              </Reveal>

              <hr className="border-neutral-100" />

              {/* 3. Penggunaan yang Diizinkan */}
              <Reveal>
                <section
                  id="penggunaan-diizinkan"
                  className="flex scroll-mt-24 flex-col gap-4"
                >
                  <h2 className="subheading text-neutral-900">
                    03 — Penggunaan yang Diizinkan
                  </h2>
                  <p className="leading-relaxed text-neutral-600">
                    Anda diperbolehkan menggunakan situs ini untuk keperluan
                    informasi pribadi atau bisnis yang sah. Anda dilarang:
                  </p>
                  <ul className="flex flex-col gap-3 pl-2">
                    {[
                      "Menggunakan situs ini untuk tujuan yang melanggar hukum yang berlaku di Indonesia.",
                      "Melakukan scraping, crawling otomatis, atau pengumpulan data massal tanpa izin tertulis dari kami.",
                      "Menyamar sebagai Padelix Indonesia atau karyawan kami dalam bentuk apapun.",
                      "Mencoba mengakses bagian sistem yang tidak ditujukan untuk pengguna umum.",
                      "Mengirimkan konten berbahaya, spam, atau menyesatkan melalui formulir kontak kami.",
                    ].map((item, i) => (
                      <li key={i} className="flex gap-4">
                        <span
                          className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-red"
                          aria-hidden
                        />
                        <p className="text-sm leading-relaxed text-neutral-600">
                          {item}
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>
              </Reveal>

              <hr className="border-neutral-100" />

              {/* 4. Kekayaan Intelektual */}
              <Reveal>
                <section
                  id="kekayaan-intelektual"
                  className="flex scroll-mt-24 flex-col gap-4"
                >
                  <h2 className="subheading text-neutral-900">
                    04 — Kekayaan Intelektual
                  </h2>
                  <p className="leading-relaxed text-neutral-600">
                    Seluruh konten yang tersedia di situs ini — termasuk namun
                    tidak terbatas pada teks, foto, video, logo, desain, dan
                    kode — adalah milik Padelix Indonesia atau digunakan
                    berdasarkan izin dari pemiliknya.
                  </p>
                  <p className="leading-relaxed text-neutral-600">
                    Logo dan nama merek mitra (brand partner) ditampilkan dengan
                    izin dan tetap menjadi hak milik masing-masing pemegang
                    merek.
                  </p>
                  <p className="leading-relaxed text-neutral-600">
                    Anda tidak diperkenankan menyalin, mereproduksi,
                    mendistribusikan, atau menggunakan konten dari situs ini
                    untuk tujuan komersial tanpa izin tertulis dari Padelix
                    Indonesia.
                  </p>
                </section>
              </Reveal>

              <hr className="border-neutral-100" />

              {/* 5. Ketersediaan & Harga */}
              <Reveal>
                <section
                  id="ketersediaan-harga"
                  className="flex scroll-mt-24 flex-col gap-4"
                >
                  <h2 className="subheading text-neutral-900">
                    05 — Ketersediaan &amp; Harga Produk
                  </h2>
                  <p className="leading-relaxed text-neutral-600">
                    Informasi produk yang ditampilkan di katalog kami bersifat
                    indikatif dan dapat berubah sewaktu-waktu tanpa
                    pemberitahuan sebelumnya. Hal ini mencakup:
                  </p>
                  <ul className="flex flex-col gap-3 pl-2">
                    {[
                      "Harga produk yang tidak ditampilkan secara publik — dikonfirmasi melalui WhatsApp.",
                      "Ketersediaan stok yang dapat berubah tergantung distribusi brand.",
                      "Foto dan deskripsi produk yang merupakan representasi umum dan mungkin berbeda dari produk aktual.",
                    ].map((item, i) => (
                      <li key={i} className="flex gap-4">
                        <span
                          className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green"
                          aria-hidden
                        />
                        <p className="text-sm leading-relaxed text-neutral-600">
                          {item}
                        </p>
                      </li>
                    ))}
                  </ul>
                  <p className="leading-relaxed text-neutral-600">
                    Harga final dan ketersediaan produk hanya berlaku setelah
                    konfirmasi tertulis dari tim kami.
                  </p>
                </section>
              </Reveal>

              <hr className="border-neutral-100" />

              {/* 6. Penafian */}
              <Reveal>
                <section
                  id="penafian"
                  className="flex scroll-mt-24 flex-col gap-4"
                >
                  <h2 className="subheading text-neutral-900">
                    06 — Penafian &amp; Batasan Tanggung Jawab
                  </h2>
                  <p className="leading-relaxed text-neutral-600">
                    Situs ini disediakan &quot;sebagaimana adanya&quot; (
                    <em>as-is</em>) tanpa jaminan dalam bentuk apapun, baik
                    tersurat maupun tersirat. Kami berupaya menjaga keakuratan
                    informasi, namun tidak menjamin bahwa seluruh konten bebas
                    dari kesalahan atau selalu terbarukan.
                  </p>
                  <p className="leading-relaxed text-neutral-600">
                    Padelix Indonesia tidak bertanggung jawab atas:
                  </p>
                  <ul className="flex flex-col gap-3 pl-2">
                    {[
                      "Kerugian tidak langsung, insidental, atau konsekuensial yang timbul dari penggunaan situs ini.",
                      "Konten atau praktik privasi dari situs web pihak ketiga yang ditautkan dari situs kami (termasuk situs brand mitra).",
                      "Gangguan layanan yang disebabkan oleh faktor di luar kendali kami (pemeliharaan, force majeure, kegagalan pihak ketiga).",
                    ].map((item, i) => (
                      <li key={i} className="flex gap-4">
                        <span
                          className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-red"
                          aria-hidden
                        />
                        <p className="text-sm leading-relaxed text-neutral-600">
                          {item}
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>
              </Reveal>

              <hr className="border-neutral-100" />

              {/* 7. Perubahan Layanan */}
              <Reveal>
                <section
                  id="perubahan-layanan"
                  className="flex scroll-mt-24 flex-col gap-4"
                >
                  <h2 className="subheading text-neutral-900">
                    07 — Perubahan Layanan
                  </h2>
                  <p className="leading-relaxed text-neutral-600">
                    Padelix Indonesia berhak mengubah, menangguhkan, atau
                    menghentikan bagian apapun dari situs ini kapan saja tanpa
                    pemberitahuan sebelumnya. Kami tidak bertanggung jawab
                    terhadap Anda atau pihak ketiga atas perubahan, penangguhan,
                    atau penghentian tersebut.
                  </p>
                </section>
              </Reveal>

              <hr className="border-neutral-100" />

              {/* 8. Hukum yang Berlaku */}
              <Reveal>
                <section
                  id="hukum-berlaku"
                  className="flex scroll-mt-24 flex-col gap-4"
                >
                  <h2 className="subheading text-neutral-900">
                    08 — Hukum yang Berlaku
                  </h2>
                  <p className="leading-relaxed text-neutral-600">
                    Syarat dan ketentuan ini diatur oleh dan ditafsirkan sesuai
                    dengan hukum Republik Indonesia. Setiap sengketa yang timbul
                    dari atau berkaitan dengan syarat ini akan diselesaikan
                    melalui musyawarah mufakat. Jika tidak tercapai kesepakatan,
                    penyelesaian dilakukan melalui pengadilan yang berwenang di
                    Indonesia.
                  </p>
                </section>
              </Reveal>

              <hr className="border-neutral-100" />

              {/* 9. Kontak */}
              <Reveal>
                <section
                  id="kontak"
                  className="flex scroll-mt-24 flex-col gap-4"
                >
                  <h2 className="subheading text-neutral-900">09 — Kontak</h2>
                  <p className="leading-relaxed text-neutral-600">
                    Jika Anda memiliki pertanyaan mengenai syarat dan ketentuan
                    ini, silakan hubungi kami:
                  </p>
                  <div className="flex flex-col gap-2 rounded-brand border border-neutral-100 bg-brand-light px-5 py-4">
                    <p className="font-semibold text-neutral-900">
                      Padelix Indonesia
                    </p>
                    <Link
                      href={`mailto:${siteConfig.contact.email}`}
                      className="text-sm text-neutral-600 underline decoration-neutral-300 underline-offset-2 transition-colors hover:text-brand-dark hover:decoration-brand-green"
                    >
                      {siteConfig.contact.email}
                    </Link>
                    <Link
                      href={siteConfig.links.whatsapp}
                      target="_blank"
                      className="text-sm text-neutral-600 underline decoration-neutral-300 underline-offset-2 transition-colors hover:text-brand-dark hover:decoration-brand-green"
                    >
                      {siteConfig.contact.whatsappDisplay}
                    </Link>
                  </div>
                </section>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
