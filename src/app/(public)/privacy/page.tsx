import { Reveal } from "@/components/general/Reveal";
import { CourtLines } from "@/components/public/CourtLines";
import { siteConfig } from "@/config/site";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description:
    "Kebijakan privasi Padelix Indonesia — bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: `Kebijakan Privasi | ${siteConfig.name}`,
    description:
      "Kebijakan privasi Padelix Indonesia — bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda.",
    url: `${siteConfig.url}/privacy`,
  },
};

const LAST_UPDATED = "13 Juni 2026";

const SECTIONS = [
  { id: "pendahuluan", title: "Pendahuluan" },
  { id: "data-yang-kami-kumpulkan", title: "Data yang Kami Kumpulkan" },
  { id: "penggunaan-data", title: "Cara Kami Menggunakan Data" },
  { id: "pihak-ketiga", title: "Layanan Pihak Ketiga" },
  { id: "penyimpanan-keamanan", title: "Penyimpanan & Keamanan" },
  { id: "hak-anda", title: "Hak Anda" },
  { id: "perubahan", title: "Perubahan Kebijakan" },
  { id: "kontak", title: "Kontak" },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-brand-light">
      {/* Hero */}
      <section className="section relative overflow-hidden bg-court-950 py-16 text-white sm:py-20">
        <div className="bg-mesh absolute inset-0" aria-hidden />
        <CourtLines />
        <div className="wrapper relative items-start gap-4">
          <span className="kicker text-brand-green">Legal</span>
          <h1 className="display-1 text-white">Kebijakan Privasi</h1>
          <p className="max-w-2xl text-lg text-pretty text-white/70 sm:text-xl">
            Kami menghargai kepercayaan Anda. Halaman ini menjelaskan data apa
            yang kami kumpulkan, bagaimana kami menggunakannya, dan hak Anda
            atas data tersebut.
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
                        <span className="w-4 text-[10px] font-black tabular-nums text-neutral-300 transition-colors group-hover:text-brand-green">
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
              {/* 1. Pendahuluan */}
              <Reveal>
                <section id="pendahuluan" className="flex flex-col gap-4 scroll-mt-24">
                  <h2 className="subheading text-neutral-900">
                    01 — Pendahuluan
                  </h2>
                  <p className="leading-relaxed text-neutral-600">
                    Padelix Indonesia mengoperasikan situs web{" "}
                    <Link
                      href={siteConfig.url}
                      className="font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-2 hover:decoration-brand-green"
                    >
                      padelix.co.id
                    </Link>{" "}
                    sebagai platform informasi untuk layanan konstruksi lapangan
                    padel dan katalog peralatan padel. Kebijakan Privasi ini
                    berlaku efektif sejak {LAST_UPDATED} dan menjelaskan
                    bagaimana kami mengelola data pribadi Anda sesuai dengan
                    Undang-Undang No. 27 Tahun 2022 tentang Perlindungan Data
                    Pribadi (UU PDP).
                  </p>
                  <p className="leading-relaxed text-neutral-600">
                    Dengan menggunakan situs ini, Anda menyetujui praktik yang
                    dijelaskan dalam kebijakan ini. Jika Anda tidak setuju,
                    mohon hentikan penggunaan situs.
                  </p>
                </section>
              </Reveal>

              <hr className="border-neutral-100" />

              {/* 2. Data yang Dikumpulkan */}
              <Reveal>
                <section
                  id="data-yang-kami-kumpulkan"
                  className="flex flex-col gap-4 scroll-mt-24"
                >
                  <h2 className="subheading text-neutral-900">
                    02 — Data yang Kami Kumpulkan
                  </h2>
                  <p className="leading-relaxed text-neutral-600">
                    Kami hanya mengumpulkan data yang diperlukan untuk
                    menjalankan layanan:
                  </p>
                  <ul className="flex flex-col gap-4 pl-2">
                    <li className="flex gap-4">
                      <span
                        className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green"
                        aria-hidden
                      />
                      <div>
                        <p className="font-semibold text-neutral-800">
                          Formulir kontak
                        </p>
                        <p className="text-sm leading-relaxed text-neutral-600">
                          Saat Anda mengirim pesan melalui formulir kontak kami,
                          kami mengumpulkan nama, alamat email atau nomor
                          WhatsApp, dan isi pesan Anda. Data ini digunakan
                          semata-mata untuk merespons pertanyaan Anda.
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <span
                        className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green"
                        aria-hidden
                      />
                      <div>
                        <p className="font-semibold text-neutral-800">
                          Data teknis (otomatis)
                        </p>
                        <p className="text-sm leading-relaxed text-neutral-600">
                          Seperti kebanyakan situs web, kami menerima data teknis
                          secara otomatis: alamat IP, jenis peramban (browser),
                          halaman yang dikunjungi, dan waktu kunjungan. Data ini
                          dikumpulkan melalui Meta Pixel dan log server kami.
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <span
                        className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green"
                        aria-hidden
                      />
                      <div>
                        <p className="font-semibold text-neutral-800">
                          Data internal (admin)
                        </p>
                        <p className="text-sm leading-relaxed text-neutral-600">
                          Akun administrator internal menyimpan alamat email dan
                          kata sandi terenkripsi (bcrypt). Data ini tidak terkait
                          dengan pengguna publik dan tidak pernah dibagikan.
                        </p>
                      </div>
                    </li>
                  </ul>
                  <p className="rounded-brand border border-neutral-100 bg-brand-light px-4 py-3 text-sm leading-relaxed text-neutral-600">
                    <span className="font-semibold text-neutral-800">Catatan:</span>{" "}
                    Situs ini tidak memiliki sistem akun publik, keranjang belanja,
                    atau pemrosesan pembayaran. Pembelian dan konsultasi dilakukan
                    melalui WhatsApp.
                  </p>
                </section>
              </Reveal>

              <hr className="border-neutral-100" />

              {/* 3. Penggunaan Data */}
              <Reveal>
                <section
                  id="penggunaan-data"
                  className="flex flex-col gap-4 scroll-mt-24"
                >
                  <h2 className="subheading text-neutral-900">
                    03 — Cara Kami Menggunakan Data
                  </h2>
                  <p className="leading-relaxed text-neutral-600">
                    Data yang kami kumpulkan digunakan untuk:
                  </p>
                  <ul className="flex flex-col gap-3 pl-2">
                    {[
                      "Merespons pertanyaan dan permintaan konsultasi yang Anda kirimkan melalui formulir kontak.",
                      "Mengirimkan informasi bisnis yang Anda minta melalui email.",
                      "Menganalisis performa situs web dan memahami cara pengunjung menggunakan situs kami, sehingga kami dapat terus meningkatkan pengalaman pengguna.",
                      "Menampilkan iklan yang relevan di platform Meta (Facebook/Instagram) berdasarkan kunjungan ke situs kami (remarketing).",
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
                    Kami tidak menjual, menyewakan, atau memperdagangkan data
                    pribadi Anda kepada pihak manapun untuk tujuan pemasaran
                    mereka sendiri.
                  </p>
                </section>
              </Reveal>

              <hr className="border-neutral-100" />

              {/* 4. Pihak Ketiga */}
              <Reveal>
                <section
                  id="pihak-ketiga"
                  className="flex flex-col gap-4 scroll-mt-24"
                >
                  <h2 className="subheading text-neutral-900">
                    04 — Layanan Pihak Ketiga
                  </h2>
                  <p className="leading-relaxed text-neutral-600">
                    Kami bekerja sama dengan penyedia layanan terpercaya untuk
                    mengoperasikan situs ini. Masing-masing memiliki kebijakan
                    privasi sendiri:
                  </p>
                  <div className="flex flex-col gap-4">
                    {[
                      {
                        name: "Meta Pixel (Facebook/Instagram)",
                        desc: "Melacak interaksi pengunjung untuk analitik dan remarketing. Data dikirim ke server Meta.",
                        href: "https://www.facebook.com/privacy/policy/",
                      },
                      {
                        name: "Resend",
                        desc: "Layanan pengiriman email transaksional — digunakan untuk meneruskan pesan dari formulir kontak.",
                        href: "https://resend.com/legal/privacy-policy",
                      },
                      {
                        name: "Cloudinary",
                        desc: "Penyimpanan dan pengiriman media (gambar, video, dokumen) untuk konten situs.",
                        href: "https://cloudinary.com/privacy",
                      },
                      {
                        name: "Vercel",
                        desc: "Platform hosting dan CDN tempat situs ini dijalankan.",
                        href: "https://vercel.com/legal/privacy-policy",
                      },
                      {
                        name: "Neon (PostgreSQL)",
                        desc: "Database serverless tempat data operasional situs disimpan di cloud.",
                        href: "https://neon.tech/privacy-policy",
                      },
                    ].map((service) => (
                      <div
                        key={service.name}
                        className="flex flex-col gap-1 rounded-brand border border-neutral-100 px-4 py-3"
                      >
                        <p className="font-semibold text-neutral-800">
                          {service.name}
                        </p>
                        <p className="text-sm leading-relaxed text-neutral-600">
                          {service.desc}
                        </p>
                        <Link
                          href={service.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 text-xs font-medium text-brand-green underline decoration-transparent underline-offset-2 transition-colors hover:decoration-brand-green"
                        >
                          Lihat kebijakan privasi →
                        </Link>
                      </div>
                    ))}
                  </div>
                </section>
              </Reveal>

              <hr className="border-neutral-100" />

              {/* 5. Penyimpanan & Keamanan */}
              <Reveal>
                <section
                  id="penyimpanan-keamanan"
                  className="flex flex-col gap-4 scroll-mt-24"
                >
                  <h2 className="subheading text-neutral-900">
                    05 — Penyimpanan & Keamanan
                  </h2>
                  <p className="leading-relaxed text-neutral-600">
                    Data yang Anda kirimkan melalui formulir kontak disimpan
                    selama diperlukan untuk menyelesaikan permintaan Anda dan
                    dihapus setelahnya. Log teknis disimpan secara otomatis oleh
                    platform hosting dan disimpan sesuai kebijakan masing-masing
                    penyedia.
                  </p>
                  <p className="leading-relaxed text-neutral-600">
                    Kami menerapkan langkah-langkah keamanan yang wajar:
                    transmisi data dienkripsi menggunakan HTTPS, kata sandi admin
                    di-hash menggunakan bcrypt, dan akses ke sistem internal
                    dibatasi berdasarkan peran. Meski demikian, tidak ada sistem
                    online yang sepenuhnya aman — kami mendorong Anda untuk
                    berhati-hati dalam berbagi informasi sensitif secara daring.
                  </p>
                </section>
              </Reveal>

              <hr className="border-neutral-100" />

              {/* 6. Hak Anda */}
              <Reveal>
                <section
                  id="hak-anda"
                  className="flex flex-col gap-4 scroll-mt-24"
                >
                  <h2 className="subheading text-neutral-900">06 — Hak Anda</h2>
                  <p className="leading-relaxed text-neutral-600">
                    Berdasarkan UU No. 27 Tahun 2022 tentang Perlindungan Data
                    Pribadi, Anda memiliki hak untuk:
                  </p>
                  <ul className="flex flex-col gap-3 pl-2">
                    {[
                      "Mengetahui data pribadi apa yang kami miliki tentang Anda.",
                      "Meminta koreksi atas data yang tidak akurat.",
                      "Meminta penghapusan data pribadi Anda, selama tidak bertentangan dengan kewajiban hukum kami.",
                      "Menarik persetujuan Anda kapan saja, tanpa mempengaruhi keabsahan pemrosesan sebelumnya.",
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
                    Untuk mengajukan permintaan terkait hak-hak tersebut, silakan
                    hubungi kami melalui email atau WhatsApp yang tercantum di
                    bawah.
                  </p>
                </section>
              </Reveal>

              <hr className="border-neutral-100" />

              {/* 7. Perubahan */}
              <Reveal>
                <section
                  id="perubahan"
                  className="flex flex-col gap-4 scroll-mt-24"
                >
                  <h2 className="subheading text-neutral-900">
                    07 — Perubahan Kebijakan
                  </h2>
                  <p className="leading-relaxed text-neutral-600">
                    Kami dapat memperbarui kebijakan ini sewaktu-waktu untuk
                    mencerminkan perubahan pada layanan atau peraturan yang
                    berlaku. Tanggal "Terakhir diperbarui" di bagian atas halaman
                    ini akan diubah setiap kali ada pembaruan. Kami menganjurkan
                    Anda untuk meninjau halaman ini secara berkala.
                  </p>
                </section>
              </Reveal>

              <hr className="border-neutral-100" />

              {/* 8. Kontak */}
              <Reveal>
                <section
                  id="kontak"
                  className="flex flex-col gap-4 scroll-mt-24"
                >
                  <h2 className="subheading text-neutral-900">08 — Kontak</h2>
                  <p className="leading-relaxed text-neutral-600">
                    Jika Anda memiliki pertanyaan tentang kebijakan privasi ini
                    atau ingin menggunakan hak Anda, silakan hubungi kami:
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
