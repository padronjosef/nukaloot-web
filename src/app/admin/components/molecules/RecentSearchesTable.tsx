"use client";

import type { SearchLogRow } from "@/shared/lib/analytics-types";
import { KIND_STYLE } from "@/shared/lib/analytics-types";
import { countryFlag, countryName } from "@/shared/lib/countries";
import { Panel, PanelEmpty } from "../atoms/Panel";
import { TablePagination, usePaginated } from "./TablePagination";
import { Table, Td, Th } from "../atoms/Table";
import { absoluteTime, describeBot, describeUserAgent } from "../../lib/format";

export const RecentSearchesTable = ({ rows }: { rows: SearchLogRow[] }) => {
  const { visible, page, pages, setPage, total, pageSize } = usePaginated(rows);

  return (
    <Panel title="Recent searches">
      {rows.length === 0 ? (
        <PanelEmpty>No searches in this period</PanelEmpty>
      ) : (
        <>
          <div className="max-h-[32rem] overflow-y-auto">
            <Table>
              <thead className="sticky top-0 z-10 bg-card">
                {/* Same column order as Most active visitors: who, where, what. */}
                <tr>
                  <Th>Who</Th>
                  <Th>IP</Th>
                  <Th>Location</Th>
                  <Th>Device</Th>
                  <Th>Search</Th>
                  <Th className="text-right">Results</Th>
                  <Th className="text-right">When</Th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => (
                  <tr key={row.id}>
                    <Td className="max-w-[14rem]">
                      {row.isBot ? (
                        <span
                          className="block truncate font-medium"
                          style={{ color: KIND_STYLE.bots.color }}
                        >
                          {describeBot(row.userAgent)}
                        </span>
                      ) : row.userEmail ? (
                        <>
                          <span className="block truncate">
                            {row.userName || row.userEmail}
                          </span>
                          {row.userName ? (
                            <span className="block truncate text-xs text-muted-foreground">
                              {row.userEmail}
                            </span>
                          ) : null}
                        </>
                      ) : (
                        <span className="text-muted-foreground italic">
                          signed out
                        </span>
                      )}
                    </Td>
                    <Td className="font-mono text-xs whitespace-nowrap">
                      {row.ip ?? "—"}
                    </Td>
                    <Td className="whitespace-nowrap">
                      <span className="mr-2">{countryFlag(row.country)}</span>
                      {row.city ? `${row.city}, ` : ""}
                      {countryName(row.country)}
                    </Td>
                    <Td className="whitespace-nowrap text-muted-foreground">
                      {describeUserAgent(row.userAgent)}
                    </Td>
                    <Td className="max-w-[16rem]">
                      <span className="block truncate">{row.query}</span>
                    </Td>
                    <Td className="text-right tabular-nums">
                      {row.resultCount.toLocaleString()}
                      {row.cacheHit ? (
                        <span className="ml-2 text-xs text-muted-foreground">
                          cached
                        </span>
                      ) : null}
                    </Td>
                    <Td className="text-right whitespace-nowrap text-muted-foreground">
                      {absoluteTime(row.createdAt)}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
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
