import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section bg-white dark:bg-gray-900 h-svh">
      <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
        <div className="mx-auto max-w-screen-sm text-center">
          <h1 className="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary-600 dark:text-primary-500">
            404
          </h1>
          <p className="mb-4 text-3xl tracking-tight font-bold text-gray-900 md:text-4xl dark:text-white">
            Ada yang Hilang
          </p>
          <p className="mb-4 text-lg font-light text-gray-500 dark:text-gray-400">
            Maaf, kami tidak menemukan halaman tersebut. Kamu dapat menelusuri
            banyak hal di beranda
          </p>
          <Link
            href="/#"
            className="inline-flex text-black bg-lime-400 hover:bg-lime-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-primary-900 my-4"
          >
            Kembali ke Berdanda
          </Link>
        </div>
      </div>
    </section>
  );
}
