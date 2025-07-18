"use client";
import { FC } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

// Props interface for the main pagination component
interface PaginationProps {
  pageCount: number; // Total number of pages
}

// Props interface for the arrow buttons
interface PaginationArrowProps {
  direction: "left" | "right"; // Direction of the arrow
  href: string; // URL to navigate to
  isDisabled: boolean; // Whether the arrow should be disabled
}

// Arrow button component for navigation
const PaginationArrow: FC<PaginationArrowProps> = ({
  direction,
  href,
  isDisabled,
}) => {
  const router = useRouter();
  const isLeft = direction === "left";

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        // Use Next.js client-side navigation without scroll reset
        router.push(href, { scroll: false });
      }}
      className={`pagination-arrow ${isDisabled ? "disabled" : ""}`}
      aria-disabled={isDisabled}
      disabled={isDisabled}
    >
      {isLeft ? "«" : "»"}
    </button>
  );
};

export function Pagination({ pageCount }: Readonly<PaginationProps>) {
  // Get current URL path and search parameters using Next.js hooks
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Extract current page from URL params, defaulting to 1 if not present
  const currentPage = Number(searchParams.get("page")) || 1;
  console.log("Current Page:", currentPage, "Page Count:", pageCount);

  // Helper function to create URLs for pagination
  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`; // Combines current path with updated page parameter
  };

  return (
    <nav role="navigation" aria-label="Pagination" className="pagination-nav">
      <ul className="pagination-list">
        {/* Left arrow - disabled if on first page */}
        <li>
          <PaginationArrow
            direction="left"
            href={createPageURL(currentPage - 1)}
            isDisabled={currentPage <= 1}
          />
        </li>
        {/* Current page indicator */}
        <li>
          <span className="page-number">Page {currentPage}</span>
        </li>
        {/* Right arrow - disabled if on last page */}
        <li>
          <PaginationArrow
            direction="right"
            href={createPageURL(currentPage + 1)}
            isDisabled={currentPage >= pageCount}
          />
        </li>
      </ul>
    </nav>
  );
}
