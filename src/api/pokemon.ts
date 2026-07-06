export interface Pokemon {
    id: number;
    name: string;
    sprites: { front_default: string };
    abilities: { ability: { name: string } }[];
    isLegendary?: boolean; 
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

// Minimal interface for the species endpoint structure
interface PokemonSpeciesResponse {
    is_legendary: boolean;
}

const BASE_URL = 'https://pokeapi.co/api/v2/pokemon';
const SPECIES_BASE_URL = 'https://pokeapi.co/api/v2/pokemon-species';

/**
 * Helper function to orchestrate fetching details and species flags concurrently
 */
async function fetchFullPokemonData(pokemonIdOrUrl: string | number): Promise<Pokemon> {
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

    const speciesUrl = `${SPECIES_BASE_URL}/${id}`;

    const [detailRes, speciesRes] = await Promise.all([
        fetch(detailUrl),
        fetch(speciesUrl)
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
        isLegendary
    };
}

export async function fetchPokemons(limit = 20, offset = 0): Promise<PaginatedPokemons> {
    const response = await fetch(`${BASE_URL}?limit=${limit}&offset=${offset}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch pokemons: ${response.statusText}`);
    }

    const data: PokemonListResponse = await response.json();

    // Map using our new concurrent details + species wrapper logic
    const pokemonDetails = await Promise.all(
        data.results.map((pokemon) => fetchFullPokemonData(pokemon.url))
    );

    return { pokemons: pokemonDetails, hasMore: data.next !== null };
}

// Lightweight: just names + urls, no detail fetches. Used to power search.
export async function fetchAllPokemonNames(): Promise<PokemonListResult[]> {
    const response = await fetch(`${BASE_URL}?limit=2000`);

    if (!response.ok) {
        throw new Error(`Failed to fetch pokemon names: ${response.statusText}`);
    }

    const data: PokemonListResponse = await response.json();
    return data.results;
}

// Fetch full details for a specific set of pokemon (used for search matches)
export async function fetchPokemonDetailsByUrls(urls: string[]): Promise<Pokemon[]> {
    return Promise.all(
        urls.map((url) => fetchFullPokemonData(url))
    );
}