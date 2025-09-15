import { fetchJsonData } from './http_fetcher';

describe('fetchJsonData', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should return JSON data when response is ok', async () => {
        const mockJson = { observations: [] };
        global.fetch.mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue(mockJson),
        });

        const result = await fetchJsonData('https://example.com/data');
        expect(result).toEqual(mockJson);
        expect(global.fetch).toHaveBeenCalledWith('https://example.com/data', {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });
    });

    it('should return null and log error when response is not ok', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        global.fetch.mockResolvedValue({
            ok: false,
            status: 404,
            json: jest.fn(),
        });

        const result = await fetchJsonData('https://example.com/data');
        expect(result).toBeNull();
        expect(consoleSpy).toHaveBeenCalledWith('Response status: 404');
        consoleSpy.mockRestore();
    });

    it('should return null and log error when fetch throws', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        global.fetch.mockRejectedValue(new Error('Network error'));

        const result = await fetchJsonData('https://example.com/data');
        expect(result).toBeNull();
        expect(consoleSpy).toHaveBeenCalledWith('Network error');
        consoleSpy.mockRestore();
    });
});