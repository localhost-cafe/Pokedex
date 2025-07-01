async function fetchPokemons(offset, limit) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
  const data = await res.json();

  return data.results;
}

async function fetchPokemonByUrl(url) {
  const res = await fetch(url);
  const data = await res.json();

  return data;
}

window.addEventListener('DOMContentLoaded', () => {
  const loadMoreBtn = document.querySelector('.pokemon-list-load-more-button');

  const allPokemons = [];
  const limit = 12;

  let offset = 0;

  const renderPokemon = (pokemon) => {
    const card = document.createElement('div');
    card.classList.add('pokemon-card');

    card.innerHTML = `<img src='${pokemon.sprites.front_default}' alt='${pokemon.name}'>`;
    card.addEventListener('click', () => {
      showPokemonDetailed(pokemon);
    });

    const title = document.createElement('h3');
    title.classList.add('pokemon-title');
    title.textContent = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

    const types = document.createElement('div');
    types.classList.add('pokemon-types');
    types.innerHTML = pokemon.types
      .map(type => `<span class='type ${type.type.name}'>${type.type.name}</span>`)
      .join('');

    card.appendChild(title);
    card.appendChild(types);

    return card;
  }

  const toggleLoading = (isLoading) => {
    const spinner = document.querySelector('.pokemon-list-spinner');
    const loadMoreBtn = document.querySelector('.pokemon-list-load-more-button');

    if (isLoading) {
      spinner.classList.add('active');
      loadMoreBtn.classList.add('hidden');
    } else {
      spinner.classList.remove('active');
      loadMoreBtn.classList.remove('hidden');
    }

    loadMoreBtn.disabled = isLoading;
  };

  const renderTypeFilter = () => {
    const allTypes = new Set();
    allPokemons.forEach(pokemon => {
      pokemon.types.forEach(t => allTypes.add(t.type.name));
    });

    const typeSelect = document.getElementById('type-filter');
    typeSelect.querySelectorAll('option:not([value="all"])').forEach(o => o.remove());

    [...allTypes].sort().forEach(type => {
      const option = document.createElement('option');
      option.value = type;
      option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
      typeSelect.appendChild(option);
    });

    typeSelect.addEventListener('change', () => {
      const selectedType = typeSelect.value;
      const pokemonList = document.querySelector('.pokemon-list');
      const cards = pokemonList.querySelectorAll('.pokemon-card');
      cards.forEach(card => card.remove());

      const filtered = selectedType === 'all'
        ? allPokemons
        : allPokemons.filter(pokemon =>
          pokemon.types.some(t => t.type.name === selectedType)
        );

      const fragment = document.createDocumentFragment();
      filtered.forEach(pokemon => {
        const card = renderPokemon(pokemon);
        fragment.appendChild(card);
      });

      const spinner = document.querySelector('.pokemon-list-spinner');
      pokemonList.insertBefore(fragment, spinner);
    });
  }

  const loadPokemons = async () => {
    toggleLoading(true);

    const pokemons = await fetchPokemons(offset, limit); // [] -> 12
    const pokemonsDetailed = await Promise.all(
      pokemons.map(pokemon => fetchPokemonByUrl(pokemon.url))
    );

    const fragment = document.createDocumentFragment();

    for (const pokemonDetailed of pokemonsDetailed) {
      allPokemons.push(pokemonDetailed);

      const card = renderPokemon(pokemonDetailed);
      fragment.appendChild(card);
    }

    const pokemonList = document.querySelector('.pokemon-list');
    const spinner = document.querySelector('.pokemon-list-spinner');
    pokemonList.insertBefore(fragment, spinner);

    offset += limit;
    toggleLoading(false);

    renderTypeFilter();
  }

  function showPokemonDetailed(pokemon) {
    const detailsContainer = document.querySelector('.pokemon-list-item-details');
    detailsContainer.classList.add('show');

    const findPokemonBaseStat = (pokemon, statName) => {
      return pokemon.stats.find(stat => stat.stat.name === statName).base_stat;
    }

    detailsContainer.innerHTML = `
      <div class="pokemon-detail-card">
        <button class="close-button" title="Close">&times;</button>
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" />
        <h2>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} #${pokemon.id.toString().padStart(3, '0')}</h2>
        <table class="pokemon-stats-table">
          <tr><td>Type</td><td>${pokemon.types.map(t => t.type.name).join(', ')}</td></tr>
          <tr><td>Attack</td><td>${findPokemonBaseStat(pokemon, 'attack')}</td></tr>
          <tr><td>Defense</td><td>${findPokemonBaseStat(pokemon, 'defense')}</td></tr>
          <tr><td>HP</td><td>${findPokemonBaseStat(pokemon, 'hp')}</td></tr>
          <tr><td>SP Attack</td><td>${findPokemonBaseStat(pokemon, 'special-attack')}</td></tr>
          <tr><td>SP Defense</td><td>${findPokemonBaseStat(pokemon, 'special-defense')}</td></tr>
          <tr><td>Speed</td><td>${findPokemonBaseStat(pokemon, 'speed')}</td></tr>
          <tr><td>Weight</td><td>${pokemon.weight}</td></tr>
          <tr><td>Total moves</td><td>${pokemon.moves.length}</td></tr>
        </table>
      </div>
    `;

    const closeButton = detailsContainer.querySelector('.close-button');
    closeButton.addEventListener('click', () => {
      detailsContainer.classList.remove('show');
    });
  }

  loadMoreBtn.addEventListener('click', loadPokemons);
  loadPokemons();

  window.addEventListener('resize', () => {
    const detailsContainer = document.querySelector('.pokemon-list-item-details');
    if (detailsContainer && detailsContainer.classList.contains('show')) {
      detailsContainer.classList.remove('show');
    }
  });
});
