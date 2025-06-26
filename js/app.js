window.addEventListener('DOMContentLoaded', () => {
  const pokemonList = document.querySelector('.pokemon-list');
  const loadMoreBtn = document.querySelector('.load-more-button');

  const pokemons = [];
  let offset = 0;
  const limit = 12;

  let isLoading = false;

  async function fetchPokemonList(offset, limit) {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
    const data = await res.json();
    return data.results;
  }

  async function fetchPokemon(url) {
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

    card.addEventListener('click', () => {
      showPokemonDetails(details);
    });

    pokemonList.appendChild(card);
  }

  async function loadPokemons() {
    const spinner = document.querySelector('.spinner');
    spinner.classList.add('active');
    loadMoreBtn.disabled = true;

    const results = await fetchPokemonList(offset, limit);

    const promises = results.map(pokemon => fetchPokemon(pokemon.url));
    const pokemonDetails = await Promise.all(promises);

    for (const details of pokemonDetails) {
      pokemons.push(details);
      renderPokemon(details);
    }

    offset += limit;
    spinner.classList.remove('active');
    loadMoreBtn.disabled = false;
  }

  function showPokemonDetails(details) {
    const detailsContainer = document.querySelector('.pokemon-details');
    detailsContainer.style.display = 'flex';

    detailsContainer.innerHTML = `
      <div class="pokemon-detail-card">
        <img src="${details.sprites.front_default}" alt="${details.name}" />
        <h2>${details.name.charAt(0).toUpperCase() + details.name.slice(1)} #${details.id.toString().padStart(3, '0')}</h2>
        <table class="pokemon-stats-table">
          <tr>
            <td>Type</td>
            <td>${details.types.map(t => t.type.name).join(', ')}</td>
          </tr>
          <tr>
            <td>Attack</td>
            <td>${details.stats.find(stat => stat.stat.name === 'attack').base_stat}</td>
          </tr>
          <tr>
            <td>Defense</td>
            <td>${details.stats.find(stat => stat.stat.name === 'defense').base_stat}</td>
          </tr>
          <tr>
            <td>HP</td>
            <td>${details.stats.find(stat => stat.stat.name === 'hp').base_stat}</td>
          </tr>
          <tr>
            <td>SP Attack</td>
            <td>${details.stats.find(stat => stat.stat.name === 'special-attack').base_stat}</td>
          </tr>
          <tr>
            <td>SP Defense</td>
            <td>${details.stats.find(stat => stat.stat.name === 'special-defense').base_stat}</td>
          </tr>
          <tr>
            <td>Speed</td>
            <td>${details.stats.find(stat => stat.stat.name === 'speed').base_stat}</td>
          </tr>
          <tr>
            <td>Weight</td>
            <td>${details.weight}</td>
          </tr>
          <tr>
            <td>Total moves</td>
            <td>${details.moves.length}</td>
          </tr>
        </table>
      </div>
    `;
  }

  loadMoreBtn.addEventListener('click', loadPokemons);
  loadPokemons();
});
