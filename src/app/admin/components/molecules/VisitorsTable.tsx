"use client";

import type { TopVisitor } from "@/shared/lib/analytics-types";
import { KIND_STYLE } from "@/shared/lib/analytics-types";
import { countryFlag, countryName } from "@/shared/lib/countries";
import { Panel, PanelEmpty } from "../atoms/Panel";
import { TablePagination, usePaginated } from "./TablePagination";
import { Table, Td, Th } from "../atoms/Table";
import {
  describeBot,
  describeUserAgent,
  isBot,
  relativeTime,
} from "../../lib/format";

export const VisitorsTable = ({ rows }: { rows: TopVisitor[] }) => {
  const { visible, page, pages, setPage, total, pageSize } = usePaginated(rows);

  return (
    <Panel title="Most active visitors">
      {rows.length === 0 ? (
        <PanelEmpty>No visitors in this period</PanelEmpty>
      ) : (
        <>
          <Table>
            <thead>
              <tr>
                <Th>Who</Th>
                <Th>IP</Th>
                <Th>Location</Th>
                <Th>Device</Th>
                <Th className="text-right">Searches</Th>
                <Th className="text-right">Last seen</Th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.visitorId}>
                  <Td className="max-w-[14rem]">
                    {isBot(row.userAgent) ? (
                      <span
                        className="block truncate font-medium"
                        style={{ color: KIND_STYLE.bots.color }}
                      >
                        {describeBot(row.userAgent)}
                      </span>
                    ) : row.userEmail ? (
                      <span className="block truncate">
                        {row.userName || row.userEmail}
                      </span>
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
                  <Td className="text-right tabular-nums">
                    {row.count.toLocaleString()}
                  </Td>
                  <Td className="text-right whitespace-nowrap text-muted-foreground">
                    {relativeTime(row.lastSeenAt)}
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
