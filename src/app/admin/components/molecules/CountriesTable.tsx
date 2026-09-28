"use client";

import type { CountryRow } from "@/shared/lib/analytics-types";
import { countryFlag, countryName } from "@/shared/lib/countries";
import { Panel, PanelEmpty } from "../atoms/Panel";
import { TablePagination, usePaginated } from "./TablePagination";
import { Table, Td, Th } from "../atoms/Table";

export const CountriesTable = ({ rows }: { rows: CountryRow[] }) => {
  const max = Math.max(...rows.map((r) => r.count), 1);
  const { visible, page, pages, setPage, total, pageSize } = usePaginated(rows);

  return (
    <Panel title="Where they search from">
      {rows.length === 0 ? (
        <PanelEmpty>No searches in this period</PanelEmpty>
      ) : (
        <>
          <Table>
            <thead>
              <tr>
                <Th>Country</Th>
                <Th className="text-right">Searches</Th>
                <Th className="text-right">Visitors</Th>
                <Th className="w-28" />
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.country ?? "unknown"}>
                  <Td className="whitespace-nowrap">
                    <span className="mr-2">{countryFlag(row.country)}</span>
                    {countryName(row.country)}
                  </Td>
                  <Td className="text-right tabular-nums">
                    {row.count.toLocaleString()}
                  </Td>
                  <Td className="text-right tabular-nums text-muted-foreground">
                    {row.visitors.toLocaleString()}
                  </Td>
                  <Td>
                    <div
                      className="h-1.5 rounded-full bg-chart-1"
                      style={{ width: `${(row.count / max) * 100}%` }}
                    />
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
