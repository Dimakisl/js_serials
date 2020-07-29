const leftMenu = document.querySelector('.left-menu');
const hamburger = document.querySelector('.hamburger');
const tvShowsList = document.querySelector('.tv-shows__list');
const modal = document.querySelector('.modal');
const tvShows = document.querySelector('.tv-shows');
const tvCardImg = document.querySelector('.tv-card__img');
const modalTitle = document.querySelector('.modal__title');
const genresList = document.querySelector('.genres-list');
const rating = document.querySelector('.rating');
const description = document.querySelector('.description');
const modalLink = document.querySelector('.modal__link');
const searchForm = document.querySelector('.search__form');
const searchFormInput = document.querySelector('.search__form-input');
const dropdown = document.querySelectorAll('.dropdown');
const tvShowsHead = document.querySelector('.tv-shows__head');
const preloader = document.querySelector('.preloader');
const posterWrapper = document.querySelector('.poster__wrapper');
const modalContent = document.querySelector('.modal__content');
const pagination = document.querySelector('.pagination');
const page = document.querySelector('pages');
const trailer = document.querySelector('#trailer');
headTrailer = document.querySelector('#head-trailer');


const loading = document.createElement('div');
loading.className = 'loading';



const IMG_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';

const API_KEY = 'c55210558b009b711aea932ddfc6f12a';

const SERVER = 'https://api.themoviedb.org/3';
//https://www.themoviedb.org/settings/api


class  DBService {
	temp;

	getData = async (url) => {
		tvShows.append(loading);
		const res = await fetch(url);
		if(res.ok){
			return res.json();
		} else{
			throw new Error(`Не удалось получить данные по адресу ${url}`);
		}
	}

	getTestData = () => {
		return this.getData('test.json');
		
	}

	getTestCard = () => {
		return this.getData('card.json');
	}

	getSearchResult = (query) => {
		this.temp = `${SERVER}/search/tv?api_key=${API_KEY}&query=${query}&language=ru-RU`;
		return this.getData(this.temp);
	}

	getNextPage = (page) => {
		return this.getData(this.temp + '&page=' + page);
	}

	getTvShow = (id) => {
		return this.getData(`${SERVER}/tv/${id}?api_key=${API_KEY}&language=ru-RU`);
		//https://api.themoviedb.org/3/tv/{tv_id}?api_key=<<api_key>>&language=en-US
	}

	getTopRated = () => {
		return this.getData(`${SERVER}/tv/top_rated?api_key=${API_KEY}&language=ru-RU`);
	}

	getPopular = () => {
		return this.getData(`${SERVER}/tv/popular?api_key=${API_KEY}&language=ru-RU`);
	}

	getToday = () => {
		return this.getData(`${SERVER}/tv/airing_today?api_key=${API_KEY}&language=ru-RU`);
	}

	getWeek = () => {
		return this.getData(`${SERVER}/tv/on_the_air?api_key=${API_KEY}&language=ru-RU`);
	}

	getVideo = (id) => {
		return this.getData(`${SERVER}/tv/${id}/videos?api_key=${API_KEY}&language=ru-RU`);
	}

}

const dbService = new DBService();

const renderCard = (response, target) => {
	tvShowsList.textContent = '';


	if(!response.total_results){
		loading.remove();
		tvShowsHead.textContent = 'К сожалению по вашему запросу ничего не найдено ...';
		tvShowsHead.style.cssText = 'color: red;';
		return;
	}
		tvShowsHead.textContent = target ? target.textContent : 'Результат поиска:';
		tvShowsHead.style.cssText = 'color: green;';

	response.results.forEach((item) => {
		const { backdrop_path: backdrop, name: title, poster_path: poster, vote_average: vote, id } = item;

		const posterIMG = poster ? IMG_URL + poster : 'img/no-poster.jpg';
		const backdropIMG = backdrop ? IMG_URL + backdrop : '';
		const voteElem = vote ? `<span class="tv-card__vote">${vote}</span>` : ''; 
		const card = document.createElement('li');
		card.className = 'tv-shows__item';
		card.innerHTML = `
			<a href="#" id="${id}" class="tv-card">
                        ${voteElem}
                        <img class="tv-card__img"
                             src="${posterIMG}"
                             data-backdrop="${backdropIMG}"
                             alt="${title}">
                        <h4 class="tv-card__head">${title}</h4>
            </a>
		`;

		loading.remove();
		tvShowsList.append(card);
	});

	pagination.textContent ='';

	if(!target && response.total_pages > 1){
		for(let i = 1; i < response.total_pages; i++){

				pagination.innerHTML += `<li><a href="#" class="pages">${i}</a></li>`;
			
			
		}
	}	

}

//смена карточки

const changeImage = (e) => {
	const card = e.target.closest('.tv-shows__item');

	if(card){
		const img = card.querySelector('.tv-card__img');
		const changeImg = img.dataset.backdrop;
		if(changeImg){
			img.dataset.backdrop = img.src;
			img.src = changeImg;
		}
	}
};

const closeDropdown = () => {
	dropdown.forEach((item) => {
		item.classList.remove('active');
	})
}


hamburger.addEventListener('click', () => {
	leftMenu.classList.toggle('openMenu');
	hamburger.classList.toggle('open');
	closeDropdown();
})

document.addEventListener('click', (e) => {
	if(!e.target.closest('.left-menu')){
		leftMenu.classList.remove('openMenu');
		hamburger.classList.remove('open');

	}
})

leftMenu.addEventListener('click', (e) => {
	e.preventDefault();
	const target = e.target;
	const dropdown = target.closest('.dropdown');
	if(dropdown){
		dropdown.classList.toggle('active');
		leftMenu.classList.add('openMenu');
		hamburger.classList.add('open');
	}

	if(target.closest('#top-rated')){
		dbService.getTopRated().then((response) => renderCard(response, target));
	}
	if(target.closest('#popular')){
		dbService.getPopular().then((response) => renderCard(response, target))
	}
	if(target.closest('#week')){
		dbService.getWeek().then((response) => renderCard(response, target));
	}
	if(target.closest('#today')){
		dbService.getToday().then((response) => renderCard(response, target));
	}

	if(target.closest('#search')){
		tvShowsList.textContent = '';
		tvShowsHead.textContent = '';
	}
})



tvShowsList.addEventListener('click', (e) => {
	e.preventDefault();
	const target = e.target;
	const card = target.closest('.tv-card');
	if(card){
preloader.style.display='block';
		dbService.getTvShow(card.id)
			.then((response) => {
					if(response.poster_path){
						tvCardImg.src = IMG_URL + response.poster_path;
						modalTitle.textContent = response.name;
						posterWrapper.style.display = '';
						modalContent.style.paddingLeft = '';
					}else{
						posterWrapper.style.display = 'none';
						modalContent.style.paddingLeft = '25px';
					}

				//tvCardImg.src = IMG_URL + response.poster_path;
				modalTitle.textContent = response.name;
				//genresList.textContent = '';
				// genresList.innerHTML =  response.genres.reduce((acc, item) => {
				// 	return `${acc}<li>${item.name}</li>`;
				// }, '');
				genresList.textContent = '';
				//  for(const item of response.genres){
				// 	genresList.innerHTML += `<li>${item.name}</li>`
				// }
				response.genres.forEach((item) => {
					genresList.innerHTML += `<li>${item.name}</li>`;
				});
				
				rating.textContent = response.vote_average;
				description.textContent = response.overview;
				modalLink.href = response.homepage;
					return response.id;
			})
			.then(dbService.getVideo)
			.then((response) => {
				trailer.textContent = '';
				headTrailer.classList.add('hide');
				if(response.results.length){
					headTrailer.classList.remove('hide');
					response.results.forEach((item) => {
						const trailerItem = document.createElement('li');

						trailerItem.innerHTML =`
							<iframe 
							width="530" 
							height="315" 
							src="https://www.youtube.com/embed/${item.key}" 
							frameborder="0" allow="accelerometer; autoplay; 
							encrypted-media; gyroscope; picture-in-picture" 
							allowfullscreen>
							</iframe>
							<h4>${item.name}</h4>
						` 

						trailer.append(trailerItem);
					})
				}
			})

			.finally(() => {
				preloader.style.display='none';
				document.body.style.overflow = 'hidden';
				modal.classList.remove('hide');
	})

		// .tnen(() =>{
		// 	document.body.style.overflow = 'hidden';
		// 	modal.classList.remove('hide');
		// 	//https://image.tmdb.org/t/p/w185_and_h278_bestv2/bHzz0i6Ue7IixhSjFlGs0slzL2m.jpg
			
		// })
		
		// document.body.style.overflow = 'hidden';
		// modal.classList.remove('hide');

	}
})

modal.addEventListener('click', (e) => {
	//e.preventDefault();
	if(e.target.classList.contains('modal')){
		modal.classList.add('hide');
		document.body.style.overflow = '';
	}
	if(e.target.closest('.cross')){
		modal.classList.add('hide');
		document.body.style.overflow = '';
	}
	loading.remove();
})


tvShowsList.addEventListener('mouseover', changeImage);

tvShowsList.addEventListener('mouseout', changeImage);




// console.info(new DBService().getSearchResult('Няня'));    //проверка обращения и получения от API поиска



searchForm.addEventListener('submit', (e) => {
	e.preventDefault();
	const value = searchFormInput.value.trim();
	 
	if(value){
		
		
		dbService.getSearchResult(value).then(renderCard);
	}
	searchFormInput.value = '';

})


init = () => {
	tvShowsHead.textContent = "Популярное";
	dbService.getPopular().then((response) => renderCard(response));
	
	tvShowsList.textContent = '';
}


pagination.addEventListener('click', (e) => {
	e.preventDefault();
	const target = e.target;

	if(target.classList.contains('pages')){
		tvShows.append(loading);
		dbService.getNextPage(target.textContent).then(renderCard);
	}
})

init();


//для тестов
// {
// 	tvShows.append(loading);
// 	new DBService().getTestData().then(renderCard).catch(console.log('Ошибка открытия файла'));
// }


