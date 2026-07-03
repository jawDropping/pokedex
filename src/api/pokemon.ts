export interface Pokemon {
    id: number;
    name: string;
    sprites: {front_default: string};
    abilities: {ability: {name: string}}[];
}

interface PokemonListResult{
    url: string
}
const BASE_URL = 'https://pokeapi.co/api/v2/pokemon';

export async function fetchPokemons(limit = 700): Promise<Pokemon[]>{
    const response = await fetch(`${BASE_URL}?limit=${limit}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch pokemons: ${response.statusText}`);
    }

    const data = await response.json();
    const pokemonDetails = await Promise.all(
        data.results.map(
            async (pokemon: PokemonListResult) => {
                const res = await fetch(pokemon.url);

                if(!res.ok){
                    throw new Error(`Failed to fetch pokemon details: ${res.statusText}`)
                }
                return res.json();
            }
        )
    );

    return pokemonDetails;
}