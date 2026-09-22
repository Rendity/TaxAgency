const mocks = vi.hoisted(() => ({
  pool: vi.fn(),
  on: vi.fn(),
  end: vi.fn().mockResolvedValue(undefined),
  migrate: vi.fn(),
  drizzle: vi.fn(),
  error: vi.fn(),
}));

vi.mock('pg', () => ({
  Pool: class {
    constructor(options: unknown) {
      mocks.pool(options);
    }

    on = mocks.on;
    end = mocks.end;
  },
}));
vi.mock('drizzle-orm/node-postgres', () => ({ drizzle: mocks.drizzle }));
vi.mock('drizzle-orm/node-postgres/migrator', () => ({ migrate: mocks.migrate }));
vi.mock('@/models/schema', () => ({ schemaModules: [] }));
vi.mock('./Env', () => ({ Env: { DATABASE_URL: 'postgres://localhost/test' } }));
vi.mock('./Logger', () => ({ logger: { error: mocks.error } }));

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.stubEnv('SKIP_DB', 'false');
  mocks.drizzle.mockReturnValue({});
  mocks.migrate.mockResolvedValue(undefined);
});

afterEach(() => vi.unstubAllEnvs());

it('shares initialization between concurrent requests', async () => {
  const { getDb } = await import('./DB');
  const [first, second] = await Promise.all([getDb(), getDb()]);

  expect(first).toBe(second);
  expect(mocks.pool).toHaveBeenCalledTimes(1);
  expect(mocks.migrate).toHaveBeenCalledTimes(1);
});

it('closes a failed pool and retries initialization on the next request', async () => {
  mocks.migrate.mockRejectedValueOnce(new Error('Database unavailable'));
  const { getDb } = await import('./DB');

  await expect(getDb()).rejects.toThrow('Database unavailable');
  expect(mocks.end).toHaveBeenCalledTimes(1);
  await expect(getDb()).resolves.toEqual({});
  expect(mocks.pool).toHaveBeenCalledTimes(2);
});

it('handles idle connection errors while leaving replacement to the pool', async () => {
  const { getDb } = await import('./DB');
  await getDb();

  expect(mocks.on).toHaveBeenCalledWith('error', expect.any(Function));

  const error = new Error('Connection terminated');
  mocks.on.mock.calls[0]![1](error);

  expect(mocks.error).toHaveBeenCalledWith(error, 'Idle database connection failed');

  await getDb();

  expect(mocks.pool).toHaveBeenCalledTimes(1);
});
