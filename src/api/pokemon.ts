export interface Pokemon {
    id: number;
    name: string;
    height: number;
    weight: number;
    sprites: { front_default: string };
    abilities: { ability: { name: string } }[];
    types: { slot: number; type: { name: string } }[];
    stats: { base_stat: number; stat: { name: string } }[];
}

interface PokemonListResult {
    name: string;
    url: string;
}

interface PokemonListResponse {
    count: number;
    next: string | null;
    results: PokemonListResult[];
}

export interface PaginatedPokemons {
    pokemons: Pokemon[];
    hasMore: boolean;
}

export async function fetchPokemonById(id: string | number): Promise<Pokemon> {
    return fetchFullPokemonData(id);
}

interface PokemonSpeciesResponse {
    is_legendary: boolean;
}

const BASE_URL = 'https://pokeapi.co/api/v2/pokemon';
const SPECIES_BASE_URL = 'https://pokeapi.co/api/v2/pokemon-species';

// GitHub's raw content host rate-limits aggressively under concurrent load.
// jsDelivr mirrors the same repo as a real CDN and rarely throttles.
const GITHUB_SPRITES_HOST = 'https://raw.githubusercontent.com/PokeAPI/sprites/master';
const JSDELIVR_SPRITES_HOST = 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master';

function remapSpriteUrls<T>(value: T): T {
    if (typeof value === 'string') {
        return value.startsWith(GITHUB_SPRITES_HOST)
            ? (value.replace(GITHUB_SPRITES_HOST, JSDELIVR_SPRITES_HOST) as unknown as T)
            : value;
    }

    if (Array.isArray(value)) {
        return value.map((item) => remapSpriteUrls(item)) as unknown as T;
    }

    if (value !== null && typeof value === 'object') {
        const result: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
            result[key] = remapSpriteUrls(val);
        }
        return result as T;
    }

    return value;
}

// Runs `worker` over `items` with at most `limit` requests in flight at once,
// instead of firing everything simultaneously via Promise.all.
async function mapWithConcurrencyLimit<T, R>(
    items: T[],
    limit: number,
    worker: (item: T) => Promise<R>,
): Promise<R[]> {
    const results: R[] = new Array(items.length);
    let nextIndex = 0;

    async function run(): Promise<void> {
        while (nextIndex < items.length) {
            const currentIndex = nextIndex;
            nextIndex += 1;
            const item = items[currentIndex];
            if (item === undefined) {
                continue;
            }
            results[currentIndex] = await worker(item);
        }
    }

    const workerCount = Math.min(limit, items.length);
    await Promise.all(Array.from({ length: workerCount }, () => run()));
    return results;
}

const pokemonCache = new Map<string, Promise<Pokemon>>();

function fetchFullPokemonData(pokemonIdOrUrl: string | number): Promise<Pokemon> {
    let detailUrl = '';
    let id: string | number = '';

    if (typeof pokemonIdOrUrl === 'string' && pokemonIdOrUrl.startsWith('http')) {
        detailUrl = pokemonIdOrUrl;
        const segments = detailUrl.replace(/\/$/, '').split('/');
        id = segments[segments.length - 1] || '';
    } else {
        id = pokemonIdOrUrl;
        detailUrl = `${BASE_URL}/${id}`;
    }

    const cacheKey = String(id);
    const cached = pokemonCache.get(cacheKey);
    if (cached) {
        return cached;
    }

    const speciesUrl = `${SPECIES_BASE_URL}/${id}`;

    const requestPromise = (async (): Promise<Pokemon> => {
        const [detailRes, speciesRes] = await Promise.all([
            fetch(detailUrl),
            fetch(speciesUrl),
        ]);

        if (!detailRes.ok) throw new Error(`Failed to fetch details for ID ${id}`);

        const details = await detailRes.json();

        let isLegendary = false;
        if (speciesRes.ok) {
            const speciesData: PokemonSpeciesResponse = await speciesRes.json();
            isLegendary = speciesData.is_legendary;
        }

        return {
            ...details,
            sprites: remapSpriteUrls(details.sprites),
            isLegendary,
        };
    })();

    pokemonCache.set(cacheKey, requestPromise);

    // If the request fails, drop it from the cache so a retry is possible
    // instead of permanently caching a rejected promise.
    requestPromise.catch(() => {
        pokemonCache.delete(cacheKey);
    });

    return requestPromise;
}

// Keep concurrent requests modest — enough to feel fast, not enough to trip
// rate limits on pokeapi.co or the sprite CDN.
const FETCH_CONCURRENCY_LIMIT = 6;

export async function fetchPokemons(limit = 20, offset = 0): Promise<PaginatedPokemons> {
    const response = await fetch(`${BASE_URL}?limit=${limit}&offset=${offset}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch pokemons: ${response.statusText}`);
    }

    const data: PokemonListResponse = await response.json();
    const pokemonDetails = await mapWithConcurrencyLimit(
        data.results,
        FETCH_CONCURRENCY_LIMIT,
        (pokemon) => fetchFullPokemonData(pokemon.url),
    );

    return { pokemons: pokemonDetails, hasMore: data.next !== null };
}

export async function fetchAllPokemonNames(): Promise<PokemonListResult[]> {
    const response = await fetch(`${BASE_URL}?limit=2000`);

    if (!response.ok) {
        throw new Error(`Failed to fetch pokemon names: ${response.statusText}`);
    }

    const data: PokemonListResponse = await response.json();
    return data.results;
}

export async function fetchPokemonDetailsByUrls(urls: string[]): Promise<Pokemon[]> {
    return mapWithConcurrencyLimit(urls, FETCH_CONCURRENCY_LIMIT, (url) =>
        fetchFullPokemonData(url),
    );
}