"use client";

export function AdminFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-white py-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-7xl px-4 text-center text-sm text-neutral-500 sm:px-6 lg:px-8">
        &copy; {new Date().getFullYear()} Padelix Indonesia Admin Panel.
      </div>
    </footer>
  );
}
