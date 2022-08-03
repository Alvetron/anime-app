const MAIN_URL = 'https://api.jikan.moe/v4/anime';
const SEARCH_URL = 'https://api.jikan.moe/v4/anime?q=';

const body = document.getElementById('body');
const main = document.getElementById('main');
const form = document.getElementById('form');
const search = document.getElementById('search');

getAnimes(MAIN_URL);

async function getAnimes(url) {
  const resp = await fetch(url);
  const respJson = await resp.json();
  const respData = respJson.data;
  
  createCards(respData);
}

function createCards(data) {

  data.forEach(anime => {
    const div = document.createElement('div');
    div.classList.add('card');

    let episodes = anime.episodes ? anime.episodes : '?';
    let rank = anime.rank ? anime.rank : '?';
    let favs = anime.favorites ? anime.favorites : '?';
    let popularity = anime.popularity ? anime.popularity : '?';

    div.innerHTML = 
    `
    <div class="card__inner">
      <div class="card__info" id="card__info">
        <button class="card__info-btn" data-id="${anime.mal_id}"  type="button">
          <i class="fa-solid fa-circle-info"></i>
        </button>
      </div>
      <img class="card__img" src="${anime.images.jpg.image_url}" alt="">
      <div class="card__main">
        <h3 class="card__title">${anime.title}</h3>
        <p class="card__epis">${episodes} - episodes</p>
      </div>
      <ul class="card__list">
        <li class="card__item">
          <span class="">${rank}</span>
          <i class="fa-solid fa-trophy"></i>
        </li>
        <li class="card__item">
          <span class="">${favs}</span>
          <i class="fa-solid fa-heart"></i>
        </li>
        <li class="card__item">
          <span class="">${popularity}</span>
          <i class="fa-solid fa-arrow-up-right-dots"></i>
        </li>
      </ul>
    </div>
    `

    main.appendChild(div);
  })
}

form.addEventListener('submit', searchAnime);

function searchAnime(e) {
  e.preventDefault();

  const title = search.value;

  if(!title)  getAnimes(MAIN_URL);

  main.innerHTML = '';
  
  getAnimes(SEARCH_URL + title);

  search.value = '';
}


main.addEventListener('click', function(e) {
  const target = e.target;
  const id = target.getAttribute('data-id');

  if(!target.classList.contains('card__info-btn')) return;

  getAnimeInfo(id)
})

async function getAnimeInfo(id) {
  const resp = await fetch(`${MAIN_URL}/${id}`);
  const respJson = await resp.json();
  const respData = respJson.data;

  createAnimeInfo(respData);
  getCharacters(respData.mal_id);
}

function createAnimeInfo(anime) {
  body.style.overflow = 'hidden';

  const div = document.createElement('div');
  div.classList.add('popup-info');

  let genres = getGenres(anime.genres);
  let flags = getFlags(anime);

  const title = anime.title ? anime.title : '(N/A)';
  const year = anime.year ? anime.year : '(N/A)';
  const synopsis = anime.synopsis ? anime.synopsis : '(N/A)';

  div.innerHTML = 
  `
  <div className="col-1">
    <figure class="popup-info__fig">
    <img class="popup-info__img" src="${anime.images.jpg.large_image_url}" alt="">
    </figure>
  </div>
  <div class="popup-info__desc">
    <h3 class="popup-info__title">${title}</h3>
    <small class="popup-info__year">
      ${year}<span class="popup-info__year-text">year</span>
    </small>
    <h4 class="popup-info__subtitle">Genres</h4>
    <ul class="popup-info__genres popup-info__list">
      ${genres}
    </ul>
    <h4 class="popup-info__title">Synopsis</h4>
    <p class="popup-info__synopsis">${synopsis}</p>
    <ul class="popup-info__flags popup-info__list">
      ${flags}
    </ul>
    <h4 class="popup-info__title">Main Characters</h4>
    <ul class="characters-list" id="characters-list"></ul>
  </div>
  <button class="popup-info__close" id="popup-close" type="button">close</button>
  `;
  
  body.appendChild(div);

  const closeBtn = document.getElementById('popup-close');
  closeBtn.addEventListener('click', () => {
    div.remove();
    body.style.overflow = 'auto';
  })

}

function getGenres(genresArr) {
  let genres = '';
  
  genresArr.forEach(genre => {
    genres += `<li class="popup-info__genres-item popup-info__list-item" >${genre.name}</li>`;
  });

  return genres;
}

function getFlags(anime) {
  const flags = ['airing', 'type', 'source', 'episodes', 'duration', 'rank', 'score'];
  let elem = '';
  
  for(let i = 0; i < flags.length; i++) {
    if(anime[flags[i]]) {
      elem += `<li class="popup-info__flags-item popup-info__list-item">${flags[i]} : ${anime[flags[i]]}</li>`;
    }
  }

  return elem;
}

async function getCharacters(id) {
  const resp = await fetch(`${MAIN_URL}/${id}/characters`);
  const respJson = await resp.json();
  const respData = respJson.data;

  createCharactersCard(respData)
}

function createCharactersCard(data) {
  let elem = '';

  for(let i = 0; i < data.length; i++) {
    if(data[i].role === 'Main') {
      const character = data[i].character;

      elem += 
      `<li class="characters-list__item">
        <a class="characters-list__link" href="${character.url}" target="_blanc">
          <img class="characters-list__img" src="${character.images.jpg.image_url}" alt="${character.name}">
          <p class="characters-list__name">${character.name}</p>
        </a>
      </li>
      `
    }
  }
  elem === '' ? elem = 'Not Found' : '';
  document.getElementById('characters-list').innerHTML = elem ;
}
