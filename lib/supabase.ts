type MockRecord = Record<string, unknown>;

type MockResponse<T> = {
  data: T;
  error: null;
};

class MockQueryBuilder {
  private filters: Array<{ column: string; value: unknown }> = [];

  constructor(private readonly rows: MockRecord[]) {}

  select(): this {
    return this;
  }

  eq(column: string, value: unknown): this {
    this.filters.push({ column, value });
    return this;
  }

  single(): MockResponse<MockRecord | null> {
    const data = this.execute()[0] ?? null;
    return { data, error: null };
  }

  maybeSingle(): MockResponse<MockRecord | null> {
    return this.single();
  }

  limit(count: number): MockResponse<MockRecord[]> {
    const data = this.execute().slice(0, count);
    return { data, error: null };
  }

  then<TResult1 = MockResponse<MockRecord[]>, TResult2 = never>(
    onfulfilled?: ((value: MockResponse<MockRecord[]>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return Promise.resolve({ data: this.execute(), error: null }).then(onfulfilled, onrejected);
  }

  private execute(): MockRecord[] {
    if (this.filters.length === 0) {
      return this.rows;
    }

    return this.rows.filter((row) =>
      this.filters.every(({ column, value }) => row[column] === value),
    );
  }
}

class MockSupabaseClient {
  private tables: Record<string, MockRecord[]> = {};

  registerTable(name: string, rows: MockRecord[]) {
    this.tables[name] = rows;
  }

  from(name: string) {
    return new MockQueryBuilder(this.tables[name] ?? []);
  }
}

/**
 * Mock client used while Supabase connectivity/dependencies are disabled.
 * Keep imports pointed to this module so we can swap back to real Supabase later.
 */
export const supabase = new MockSupabaseClient();
