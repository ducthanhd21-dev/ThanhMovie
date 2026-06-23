
const CONFIG = { API_BASE: 'https://phimapi.com', IMG_CDN: 'https://phimimg.com/upload/vod' };
const API = {
  async fetchApi(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error('HTTP ' + response.status);
    return await response.json();
  },
  async getNewMovies(page=1) { return this.fetchApi(CONFIG.API_BASE + '/danh-sach/phim-moi-cap-nhat?page=' + page); },
  async getSeriesList(page=1) { return this.fetchApi(CONFIG.API_BASE + '/v1/api/danh-sach/phim-bo?page=' + page); },
  async getSingleList(page=1) { return this.fetchApi(CONFIG.API_BASE + '/v1/api/danh-sach/phim-le?page=' + page); },
  async getAnimeList(page=1) { return this.fetchApi(CONFIG.API_BASE + '/v1/api/danh-sach/hoat-hinh?page=' + page); }
};

async function test() {
  try {
    console.log("Fetching...");
    const [newRes, seriesRes, singleRes, animeRes] = await Promise.all([
      API.getNewMovies(1),
      API.getSeriesList(1),
      API.getSingleList(1),
      API.getAnimeList(1)
    ]);
    const newItems = newRes?.items || newRes?.data?.items || [];
    const seriesItems = seriesRes?.items || seriesRes?.data?.items || [];
    const singleItems = singleRes?.items || singleRes?.data?.items || [];
    const animeItems = animeRes?.items || animeRes?.data?.items || [];
    console.log('Parsed items:', newItems.length, seriesItems.length, singleItems.length, animeItems.length);
  } catch(e) {
    console.error('Error:', e);
  }
}
test();
