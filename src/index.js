import SimpleLightbox from 'simplelightbox';
import axios from 'axios';
import Notiflix from 'notiflix';

const lightbox = new SimpleLightbox('.gallery a');

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

let page = 1;
let searchQuery = '';

async function fetchImages() {
  try {
    const apiKey = '21976397-46e157570f798f4a75039e6aa';
    const perPage = 40;

    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: apiKey,
        q: searchQuery,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: page,
        per_page: perPage,
      },
    });

    const data = response.data;
    const images = data.hits;
    const totalHits = data.totalHits;

    if (page === 1) {
      gallery.innerHTML = '';
      Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
    }

    images.forEach(image => {
      const photoCard = createPhotoCard(image);
      gallery.appendChild(photoCard);
    });

    if (images.length === 0 || page * perPage >= totalHits) {
      loadMoreBtn.style.display = 'none';
      if (page > 1) {
        Notiflix.Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
      }
    } else {
      loadMoreBtn.style.display = 'block';
    }

    lightbox.refresh();

    const { height: cardHeight } =
      gallery.firstElementChild.getBoundingClientRect();
    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  } catch (error) {
    console.error('Error fetching images:', error);
  }
}

function createPhotoCard(image) {
  const {
    webformatURL,
    largeImageURL,
    tags,
    likes,
    views,
    comments,
    downloads,
  } = image;

  const photoCard = document.createElement('div');
  photoCard.className = 'photo-card';

  const imgLink = document.createElement('a');
  imgLink.href = largeImageURL;

  const img = document.createElement('img');
  img.src = webformatURL;
  img.alt = tags;
  img.loading = 'lazy';

  imgLink.appendChild(img);
  photoCard.appendChild(imgLink);

  const info = document.createElement('div');
  info.className = 'info';

  const likesInfo = createInfoItem('Likes', likes);
  const viewsInfo = createInfoItem('Views', views);
  const commentsInfo = createInfoItem('Comments', comments);
  const downloadsInfo = createInfoItem('Downloads', downloads);

  info.appendChild(likesInfo);
  info.appendChild(viewsInfo);
  info.appendChild(commentsInfo);
  info.appendChild(downloadsInfo);

  photoCard.appendChild(info);

  return photoCard;
}

function createInfoItem(label, value) {
  const infoItem = document.createElement('p');
  infoItem.className = 'info-item';
  infoItem.innerHTML = `<b>${label}</b>: ${value}`;
  return infoItem;
}

form.addEventListener('submit', e => {
  e.preventDefault();
  searchQuery = e.target.elements.searchQuery.value;
  page = 1;
  fetchImages();
});

loadMoreBtn.addEventListener('click', () => {
  page++;
  fetchImages();
});
