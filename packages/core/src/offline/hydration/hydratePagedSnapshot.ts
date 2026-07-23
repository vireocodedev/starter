export type PageResult<TRow> = {
  content: TRow[];
  totalPages: number;
};

export type FetchPage<TRow> = (page: number) => Promise<PageResult<TRow>>;

export type MapRow<TRow, TSnapshotRow> = (row: TRow) => TSnapshotRow | null;

export type ReplaceSnapshot<TSnapshotRow> = (rows: TSnapshotRow[]) => Promise<void>;

export async function hydratePagedSnapshot<TRow, TSnapshotRow>(args: {
  fetchPage: FetchPage<TRow>;
  mapRow: MapRow<TRow, TSnapshotRow>;
  replaceSnapshot: ReplaceSnapshot<TSnapshotRow>;
}): Promise<{ rowCount: number }> {
  const rows: TRow[] = [];
  let page = 0;

  while (true) {
    const response = await args.fetchPage(page);
    rows.push(...response.content);

    if (page + 1 >= response.totalPages) {
      break;
    }

    page += 1;
  }

  const snapshotRows = rows.map(args.mapRow).filter((row): row is TSnapshotRow => row != null);
  await args.replaceSnapshot(snapshotRows);

  return { rowCount: snapshotRows.length };
}
