type AuditLog = {
  id: string;
  event_type: string;
  entity_type: string | null;
  entity_id: string | null;
  actor_type: string | null;
  actor_id: string | null;
  context: any;
  created_at: string;
};

export default function AuditTable({
  logs,
}: {
  logs: AuditLog[];
}) {
  if (!logs.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No audit activity yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="p-2 text-left">Time</th>
            <th className="p-2 text-left">Event</th>
            <th className="p-2 text-left">Entity</th>
            <th className="p-2 text-left">Actor</th>
            <th className="p-2 text-left">Context</th>
          </tr>
        </thead>

        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-t">
              <td className="p-2 whitespace-nowrap">
                {new Date(log.created_at).toLocaleString()}
              </td>

              <td className="p-2 font-medium">
                {log.event_type}
              </td>

              <td className="p-2">
                {log.entity_type ?? "-"}
                {log.entity_id ? (
                  <div className="text-xs text-muted-foreground">
                    {log.entity_id}
                  </div>
                ) : null}
              </td>

              <td className="p-2">
                {log.actor_type ?? "system"}
                {log.actor_id ? (
                  <div className="text-xs text-muted-foreground">
                    {log.actor_id}
                  </div>
                ) : null}
              </td>

              <td className="p-2 max-w-xs">
                <details>
                  <summary className="cursor-pointer text-xs text-blue-600">
                    View
                  </summary>
                  <pre className="mt-2 whitespace-pre-wrap text-xs">
                    {JSON.stringify(log.context, null, 2)}
                  </pre>
                </details>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}