"use client";

import type { TopQuery } from "@/shared/lib/analytics-types";
import { Panel, PanelEmpty } from "../atoms/Panel";
import { TablePagination, usePaginated } from "./TablePagination";
import { Table, Td, Th } from "../atoms/Table";
import { relativeTime } from "../../lib/format";

export const TopQueriesTable = ({ rows }: { rows: TopQuery[] }) => {
  const { visible, page, pages, setPage, total, pageSize } = usePaginated(rows);

  return (
    <Panel title="Most searched games">
      {rows.length === 0 ? (
        <PanelEmpty>No searches in this period</PanelEmpty>
      ) : (
        <>
          <Table>
            <thead>
              <tr>
                <Th>Game</Th>
                <Th className="text-right">Searches</Th>
                <Th className="text-right">Visitors</Th>
                <Th className="text-right">Last</Th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.normalizedQuery}>
                  <Td className="max-w-[18rem] truncate">{row.query}</Td>
                  <Td className="text-right tabular-nums">
                    {row.count.toLocaleString()}
                  </Td>
                  <Td className="text-right tabular-nums text-muted-foreground">
                    {row.visitors.toLocaleString()}
                  </Td>
                  <Td className="text-right whitespace-nowrap text-muted-foreground">
                    {relativeTime(row.lastSearchedAt)}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <TablePagination
            page={page}
            pages={pages}
            total={total}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </>
      )}
    </Panel>
  );
};
