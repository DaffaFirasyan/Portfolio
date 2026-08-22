import { ENDPOINT, sendContact } from './web3forms';

const values = {
  name: 'Rita Halim',
  email: 'rita@example.com',
  message: 'I read your thesis work and would like to talk about a role.',
};

function mockFetch(response: { status: number; body: unknown }) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: response.status >= 200 && response.status < 300,
    status: response.status,
    json: () => Promise.resolve(response.body),
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('sendContact', () => {
  it('posts json to the documented endpoint with the access key and the values', async () => {
    const fetchMock = mockFetch({ status: 200, body: { success: true } });

    await sendContact(values, { accessKey: 'key-123' });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(ENDPOINT);
    expect(init.method).toBe('POST');
    expect(init.headers['Content-Type']).toBe('application/json');

    const body = JSON.parse(init.body);
    expect(body.access_key).toBe('key-123');
    expect(body.name).toBe(values.name);
    expect(body.email).toBe(values.email);
    expect(body.message).toBe(values.message);
    expect(body.botcheck).toBe('');
  });

  it('reports success when the service says so', async () => {
    mockFetch({ status: 200, body: { success: true } });
    expect(await sendContact(values, { accessKey: 'key-123' })).toEqual({ ok: true });
  });

  it('reads the failure message from either documented shape', async () => {
    mockFetch({ status: 400, body: { success: false, message: 'Invalid access key' } });
    expect(await sendContact(values, { accessKey: 'bad' })).toEqual({
      ok: false,
      message: 'Invalid access key',
    });

    mockFetch({ status: 400, body: { success: false, body: { message: 'Nested shape' } } });
    expect(await sendContact(values, { accessKey: 'bad' })).toEqual({
      ok: false,
      message: 'Nested shape',
    });
  });

  it('fails rather than succeeding when the body is not json', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.reject(new Error('not json')),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await sendContact(values, { accessKey: 'key-123' });
    expect(result.ok).toBe(false);
  });

  it('fails with a readable message when the network is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    const result = await sendContact(values, { accessKey: 'key-123' });
    expect(result.ok).toBe(false);
    expect(result).toHaveProperty('message');
  });

  it('sends nothing and fails when no access key is configured', async () => {
    const fetchMock = mockFetch({ status: 200, body: { success: true } });

    const result = await sendContact(values, { accessKey: '' });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.ok).toBe(false);
  });

  it('reports success and sends nothing when the honeypot was filled', async () => {
    const fetchMock = mockFetch({ status: 200, body: { success: true } });

    const result = await sendContact(values, { accessKey: 'key-123', honeypot: 'http://spam' });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result).toEqual({ ok: true });
  });
});
