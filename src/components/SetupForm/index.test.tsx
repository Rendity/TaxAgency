import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { toast } from 'react-toastify';
import SetupForm from './index';

vi.mock('next/navigation', () => ({ useParams: () => ({ locale: 'de' }) }));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

beforeEach(() => vi.clearAllMocks());

afterEach(() => vi.unstubAllGlobals());

function fillAndSubmit() {
  render(<SetupForm />);
  fireEvent.change(screen.getByLabelText('ID des Klienten'), { target: { value: '123' } });
  fireEvent.change(screen.getByLabelText('Firmenname'), { target: { value: 'Test GmbH' } });
  fireEvent.click(screen.getByRole('button', { name: 'Link für den neuen Klienten erstellen' }));
}

it('sends valid defaults and shows the server error message', async () => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: false,
    json: async () => ({ message: 'Serverfehler beim Speichern' }),
  });
  vi.stubGlobal('fetch', fetchMock);
  fillAndSubmit();
  await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Serverfehler beim Speichern'));

  expect(JSON.parse(fetchMock.mock.calls[0]![1].body)).toEqual({
    clientId: 123,
    companyName: 'Test GmbH',
    companyType: 'Kapitalgesellschaft',
    doubleEntry: 'true',
  });
  expect(screen.queryByText('Link für den neuen Klienten:')).not.toBeInTheDocument();
});

it('handles network failure and allows another submission', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
  fillAndSubmit();
  await waitFor(() => expect(toast.error).toHaveBeenCalledWith(
    'Der Server ist nicht erreichbar. Bitte versuchen Sie es erneut.',
  ));

  expect(screen.getByRole('button', { name: 'Link für den neuen Klienten erstellen' })).toBeEnabled();
});
