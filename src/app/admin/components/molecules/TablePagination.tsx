"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/UI/Button";

export const PAGE_SIZE = 20;

/**
 * Client-side paging. Every table here is fed a capped list by the API, so a
 * round trip per page would buy nothing.
 */
export const usePaginated = <T,>(rows: T[], pageSize = PAGE_SIZE) => {
  const [requested, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));

  // Clamped as it is read rather than corrected afterwards: a filter can drop
  // the row count while you sit on the last page, and nothing should ever
  // render against a page that no longer exists.
  const page = Math.min(requested, pages);

  const visible = useMemo(
    () => rows.slice((page - 1) * pageSize, page * pageSize),
    [rows, page, pageSize],
  );

  return { visible, page, pages, setPage, total: rows.length, pageSize };
};

type TablePaginationProps = {
  page: number;
  pages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

export const TablePagination = ({
  page,
  pages,
  total,
  pageSize,
  onPageChange,
}: TablePaginationProps) => {
  // One page of results needs no controls; showing them would be noise.
  if (pages <= 1) return null;

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-2.5">
      <span className="text-xs text-muted-foreground tabular-nums">
        {first}–{last} of {total.toLocaleString()}
      </span>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Previous page"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft />
        </Button>
        <span className="px-1 text-xs text-muted-foreground tabular-nums">
          {page} / {pages}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Next page"
          disabled={page === pages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
};
