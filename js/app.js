const pokemonList = document.getElementById('pokemon-list');
const loadMoreBtn = document.getElementById('load-more');

let allPokemonData = JSON.parse(localStorage.getItem('allPokemons')) || [];
let offset = allPokemonData.length || 0;
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

function renderPokemon(details) {
  const card = document.createElement('div');
  card.classList.add('pokemon-card');

  const title = document.createElement('h3');
  title.classList.add('pokemon-title');
  title.textContent = details.name.charAt(0).toUpperCase() + details.name.slice(1);
  title.addEventListener('click', () => {
    showPokemonDetails(details);
  });

  card.innerHTML = `
    <img src='${details.sprites.front_default}' alt='${details.name}'>
  `;

  const typesDiv = document.createElement('div');
  typesDiv.classList.add('pokemon-types');
  typesDiv.innerHTML = details.types
    .map(type => `<span class='type ${type.type.name}'>${type.type.name}</span>`)
    .join('');

  card.appendChild(title);
  card.appendChild(typesDiv);
  pokemonList.appendChild(card);
}

async function loadPokemons() {
  const pokemons = await fetchPokemonList(offset, limit);

  for (const pokemon of pokemons) {
    const details = await fetchPokemonDetails(pokemon.url);
    allPokemonData.push(details);
    renderPokemon(details);
  }

  offset += limit;
  localStorage.setItem('allPokemons', JSON.stringify(allPokemonData));
}

function showPokemonDetails(details) {
  const detailsContainer = document.getElementById('pokemon-details');
  detailsContainer.style.display = 'flex';

  detailsContainer.innerHTML = `
    <div class="pokemon-detail-card">
      <h2>${details.name.charAt(0).toUpperCase() + details.name.slice(1)}</h2>
      <img src="${details.sprites.front_default}" alt="${details.name}" />
      <p><strong>Height:</strong> ${details.height}</p>
      <p><strong>Weight:</strong> ${details.weight}</p>
      <p><strong>Types:</strong> ${details.types.map(t => t.type.name).join(', ')}</p>
    </div>
  `;
}

window.addEventListener('DOMContentLoaded', () => {
  allPokemonData.forEach(pokemon => {
    renderPokemon(pokemon);
  });
});

loadMoreBtn.addEventListener('click', loadPokemons);

if (allPokemonData.length === 0) {
  loadPokemons();
}
