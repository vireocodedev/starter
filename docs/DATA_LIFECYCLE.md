# History and Offline data lifecycle

Vireo History snapshots and Offline replay commands can contain personal,
tenant-scoped, or otherwise sensitive data. Both JVM modules therefore apply an
explicit lifecycle decision before a new row is stored. Applications still own
their legal and product policy; the modules own fail-closed mechanics.

## Safe defaults

- History preserves whether an event was a create, update, or delete but replaces
  each non-null snapshot with an empty JSON object.
- Offline preserves the request fingerprint needed for idempotency but stores no
  request body or request headers.
- New rows expire after 30 days and are capped at 10,000 rows per lifecycle
  partition by default.
- History partitions by neutral actor ID (or `system`); Offline partitions by its
  stable owner key. Applications with tenants must replace the policy and include
  the tenant in the opaque partition key.
- No default legal hold is invented. A custom policy must make that decision.

The corresponding migrations redact legacy payloads immediately because the
framework cannot reconstruct the classification decision that should have been
made when those values were first stored. They retain event/command metadata and
mark legacy rows expired so the next scoped purge may remove them.

## Application policy seams

Implement `HistoryDataLifecyclePolicy` or `OfflineDataLifecyclePolicy` to select:

- an opaque partition key containing every required tenant/owner boundary;
- an expiry instant;
- legal-hold status; and
- the redacted snapshot, body, or headers that may be persisted.

Never return a raw payload merely because it is convenient for diagnostics.
Classify fields, remove secrets and credentials, and retain the minimum necessary
representation. History policies must preserve null/non-null snapshot presence so
create/update/delete semantics remain stable.

## Purge, quota, erasure, and holds

`HistoryDataLifecycleService` and `OfflineDataLifecycleService` expose explicit
partition-scoped purge and erasure operations. Erasure additionally requires the
actor or owner key. Repository queries bind all supplied scopes in one delete, so
an erasure for tenant A cannot affect an identical owner in tenant B.

The services also expose partition-scoped `setLegalHold` operations. History
identifies the held record by audit-row ID; Offline uses the public command ID.
The boolean result is false when that identifier does not exist in the supplied
partition, so callers cannot use the operation to cross a tenant boundary.

Expired and erased rows under legal hold are skipped. If held rows consume the
partition quota and no ordinary row can be removed, the next write is rejected;
the store never silently deletes held data or grows without a bound. Applications
must authorize administrative calls, schedule purge cadence, record their legal
basis, and rehearse data-subject deletion against their tenant model.

Both services publish Spring application events containing only operation and
record counts. These neutral events are safe inputs for metrics, but applications
must avoid adding partition keys, actor IDs, URLs, or payload values as metric
labels.
