import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { accounts, connections } from "@/db/schema";
import {
  PageHeader,
  SectionHead,
  Card,
  EmptyState,
  Th,
  Td,
} from "@/app/components/ui";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const conns = await db
    .select({
      id: connections.id,
      institution: connections.institutionName,
      createdAt: connections.createdAt,
      accountCount: sql<number>`count(${accounts.id})`.as("account_count"),
    })
    .from(connections)
    .leftJoin(accounts, eq(accounts.connectionId, connections.id))
    .groupBy(connections.id);

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Connected banks and app configuration."
      />

      <SectionHead title="Connected banks" meta={`${conns.length} linked`} />
      {conns.length === 0 ? (
        <EmptyState>No banks connected yet.</EmptyState>
      ) : (
        <Card className="mb-10">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[rgba(25,25,24,0.02)]">
                  <Th>Institution</Th>
                  <Th className="text-right">Accounts</Th>
                  <Th>Connected</Th>
                </tr>
              </thead>
              <tbody>
                {conns.map((c) => (
                  <tr key={c.id} className="border-t border-ink-faint">
                    <Td className="font-medium">
                      {c.institution ?? "Unknown bank"}
                    </Td>
                    <Td className="text-right font-mono">{c.accountCount}</Td>
                    <Td className="font-mono text-ink-dim">
                      {c.createdAt?.slice(0, 10)}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <SectionHead title="Environment" />
      <Card className="p-6">
        <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="eyebrow mb-1">Plaid environment</dt>
            <dd className="font-mono text-sm">Sandbox</dd>
          </div>
          <div>
            <dt className="eyebrow mb-1">Data refresh</dt>
            <dd className="font-mono text-sm">Manual (Refresh button)</dd>
          </div>
        </dl>
      </Card>
    </>
  );
}
