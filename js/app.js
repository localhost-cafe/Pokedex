const pokemonList = document.getElementById('pokemon-list');
const loadMoreBtn = document.getElementById('load-more');

let offset = 0;
const limit = 12;

async function fetchPokemonList(offset, limit) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
  const data = await res.json();
  return data.results;
}

async function fetchPokemonDetails(url) {
  const res = await fetch(url);
  const data = await res.json();
  return data;
}

async function loadPokemons() {
  const pokemons = await fetchPokemonList(offset, limit);

  for (const pokemon of pokemons) {
    const details = await fetchPokemonDetails(pokemon.url);

    const card = document.createElement('div');
    card.classList.add('pokemon-card');
    card.innerHTML = `
      <img src='${details.sprites.front_default}' alt='${pokemon.name}'>
      <h3>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
      <div class='pokemon-types'>${details.types.map(type => `<span class='type ${type.type.name}'>${type.type.name}</span>`).join('')}</div>
    `;

    pokemonList.appendChild(card);
  }

  offset += limit;
}

loadMoreBtn.addEventListener('click', loadPokemons);

loadPokemons();

