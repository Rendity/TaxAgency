import { NextRequest } from 'next/server';
import { addSetupHash } from './service';
import { POST } from './route';

vi.mock('./service', () => ({ addSetupHash: vi.fn(), getSetupHash: vi.fn() }));
vi.mock('@/libs/Logger', () => ({ logger: { error: vi.fn() } }));

const payload = {
  clientId: 123,
  companyName: 'Test GmbH',
  companyType: 'Kapitalgesellschaft',
  doubleEntry: 'true',
};

function request(body: string) {
  return new NextRequest('http://localhost/api/setup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
}

beforeEach(() => vi.resetAllMocks());

it('creates a link from the form payload', async () => {
  vi.mocked(addSetupHash).mockResolvedValue({ hash: 'abc123' } as any);
  const response = await POST(request(JSON.stringify(payload)));

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ hash: 'abc123' });
  expect(addSetupHash).toHaveBeenCalledWith(payload);
});

it('rejects malformed JSON without accessing the database', async () => {
  const response = await POST(request('{'));

  expect(response.status).toBe(400);
  expect(addSetupHash).not.toHaveBeenCalled();
});

it('returns field errors for invalid input', async () => {
  const response = await POST(request(JSON.stringify({ ...payload, clientId: -1 })));

  expect(response.status).toBe(400);
  expect((await response.json()).errors.clientId).toBeDefined();
  expect(addSetupHash).not.toHaveBeenCalled();
});

it('reports database failures as server errors without exposing internals', async () => {
  vi.mocked(addSetupHash).mockRejectedValue(new Error('Connection terminated unexpectedly'));
  const response = await POST(request(JSON.stringify(payload)));

  expect(response.status).toBe(500);

  const body = await response.json();

  expect(body.message).toContain('Serverfehler');
  expect(body.message).not.toContain('Connection terminated');
});

it('does not report success when no link was saved', async () => {
  vi.mocked(addSetupHash).mockResolvedValue(null);
  const response = await POST(request(JSON.stringify(payload)));

  expect(response.status).toBe(500);
});
