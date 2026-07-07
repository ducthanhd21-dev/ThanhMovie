/* ============================================================
   ThanhMovie - Movie Streaming SPA
   Complete Application Logic
   ============================================================ */

// ============================================================
// 1. CONFIG
// ============================================================
const CONFIG = {
  API_BASE: window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' ? 'https://phimapi.com' : '/phimapi',
  IMG_CDN: 'https://phimimg.com',

  GENRES: [
    { name: 'Hành Động', slug: 'hanh-dong' },
    { name: 'Tình Cảm', slug: 'tinh-cam' },
    { name: 'Hài Hước', slug: 'hai-huoc' },
    { name: 'Cổ Trang', slug: 'co-trang' },
    { name: 'Tâm Lý', slug: 'tam-ly' },
    { name: 'Hình Sự', slug: 'hinh-su' },
    { name: 'Chiến Tranh', slug: 'chien-tranh' },
    { name: 'Thể Thao', slug: 'the-thao' },
    { name: 'Võ Thuật', slug: 'vo-thuat' },
    { name: 'Viễn Tưởng', slug: 'vien-tuong' },
    { name: 'Phiêu Lưu', slug: 'phieu-luu' },
    { name: 'Khoa Học', slug: 'khoa-hoc' },
    { name: 'Kinh Dị', slug: 'kinh-di' },
    { name: 'Âm Nhạc', slug: 'am-nhac' },
    { name: 'Thần Thoại', slug: 'than-thoai' },
    { name: 'Tài Liệu', slug: 'tai-lieu' },
    { name: 'Gia Đình', slug: 'gia-dinh' },
    { name: 'Chính Kịch', slug: 'chinh-kich' },
    { name: 'Bí Ẩn', slug: 'bi-an' },
    { name: 'Học Đường', slug: 'hoc-duong' },
    { name: 'Phim 18+', slug: 'phim-18' }
  ],

  COUNTRIES: [
    { name: 'Trung Quốc', slug: 'trung-quoc' },
    { name: 'Hàn Quốc', slug: 'han-quoc' },
    { name: 'Nhật Bản', slug: 'nhat-ban' },
    { name: 'Thái Lan', slug: 'thai-lan' },
    { name: 'Âu Mỹ', slug: 'au-my' },
    { name: 'Đài Loan', slug: 'dai-loan' },
    { name: 'Hồng Kông', slug: 'hong-kong' },
    { name: 'Ấn Độ', slug: 'an-do' },
    { name: 'Anh', slug: 'anh' },
    { name: 'Pháp', slug: 'phap' },
    { name: 'Canada', slug: 'canada' },
    { name: 'Đức', slug: 'duc' },
    { name: 'Tây Ban Nha', slug: 'tay-ban-nha' },
    { name: 'Việt Nam', slug: 'viet-nam' },
    { name: 'Quốc gia khác', slug: 'quoc-gia-khac' }
  ],

  CATEGORY_TITLES: {
    'phim-moi-cap-nhat': 'Phim Mới Cập Nhật',
    'phim-bo': 'Phim Bộ',
    'phim-le': 'Phim Lẻ',
    'hoat-hinh': 'Hoạt Hình',
    'tv-shows': 'TV Shows'
  },

  STORAGE_KEYS: {
    FAVORITES: 'thanhmovie_favorites',
    HISTORY: 'thanhmovie_history'
  },

  HERO_INTERVAL: 5000,
  SEARCH_DEBOUNCE: 300,
  TOAST_DURATION: 3000,
  MAX_HISTORY: 50,
  SKELETON_COUNT: 12
};

// ============================================================
// 2. API MODULE
// ============================================================
const API = {
  async fetchApi(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API Error:', url, error);
      throw error;
    }
  },

  getImageUrl(url, cdnBase) {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    let base = cdnBase || CONFIG.IMG_CDN;
    if (base.endsWith('/')) base = base.slice(0, -1);
    if (url.startsWith('/')) url = url.slice(1);
    return `${base}/${url}`;
  },

  async getNewMovies(page = 1) {
    const res = await this.fetchApi(`${CONFIG.API_BASE}/danh-sach/phim-moi-cap-nhat?page=${page}`);
    if (res?.items && res.items.length < 12) {
      const res2 = await this.fetchApi(`${CONFIG.API_BASE}/danh-sach/phim-moi-cap-nhat?page=${page+1}`);
      if (res2?.items) {
        res.items = [...res.items, ...res2.items];
      }
    }
    return res;
  },

  async getSeriesList(page = 1, limit = 12) {
    return this.fetchApi(`${CONFIG.API_BASE}/v1/api/danh-sach/phim-bo?page=${page}&limit=${limit}`);
  },

  async getHotMovies(page = 1, limit = 12) {
    return this.fetchApi(`${CONFIG.API_BASE}/v1/api/danh-sach/phim-chieu-rap?page=${page}&limit=${limit}`);
  },

  async getSingleList(page = 1, limit = 12) {
    return this.fetchApi(`${CONFIG.API_BASE}/v1/api/danh-sach/phim-le?page=${page}&limit=${limit}`);
  },

  async getAnimeList(page = 1, limit = 12) {
    return this.fetchApi(`${CONFIG.API_BASE}/v1/api/danh-sach/hoat-hinh?page=${page}&limit=${limit}`);
  },

  async getTvShows(page = 1) {
    return this.fetchApi(`${CONFIG.API_BASE}/v1/api/danh-sach/tv-shows?page=${page}`);
  },

  async getMovieDetail(slug) {
    return this.fetchApi(`${CONFIG.API_BASE}/phim/${slug}`);
  },

  async searchMovies(keyword, page = 1) {
    return this.fetchApi(`${CONFIG.API_BASE}/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}`);
  },

  async getByGenre(genreSlug, page = 1) {
    return this.fetchApi(`${CONFIG.API_BASE}/v1/api/the-loai/${genreSlug}?page=${page}&limit=12`);
  },

  async getByCountry(countrySlug, page = 1) {
    return this.fetchApi(`${CONFIG.API_BASE}/v1/api/quoc-gia/${countrySlug}?page=${page}&limit=12`);
  },

  async getCategoryList(type, page = 1) {
    const path = type === 'phim-moi-cap-nhat' ? `/danh-sach/${type}` : `/v1/api/danh-sach/${type}`;
    const limitParams = type === 'phim-moi-cap-nhat' ? '' : `&limit=12`;
    return this.fetchApi(`${CONFIG.API_BASE}${path}?page=${page}${limitParams}`);
  }
};

// ============================================================
// 3. STORAGE MODULE
// ============================================================
const Storage = {
  _get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  _set(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Storage error:', e);
    }
  },

  // Favorites
  getFavorites() {
    return this._get(CONFIG.STORAGE_KEYS.FAVORITES);
  },

  addFavorite(movie) {
    const favorites = this.getFavorites();
    if (favorites.some(f => f.slug === movie.slug)) return;
    const item = {
      name: movie.name,
      slug: movie.slug,
      thumb_url: movie.thumb_url,
      poster_url: movie.poster_url,
      year: movie.year,
      origin_name: movie.origin_name,
      quality: movie.quality,
      episode_current: movie.episode_current
    };
    favorites.unshift(item);
    this._set(CONFIG.STORAGE_KEYS.FAVORITES, favorites);
  },

  removeFavorite(slug) {
    const favorites = this.getFavorites().filter(f => f.slug !== slug);
    this._set(CONFIG.STORAGE_KEYS.FAVORITES, favorites);
  },

  toggleFavorite(movie) {
    if (this.isFavorite(movie.slug)) {
      this.removeFavorite(movie.slug);
      return false;
    } else {
      this.addFavorite(movie);
      return true;
    }
  },

  isFavorite(slug) {
    return this.getFavorites().some(f => f.slug === slug);
  },

  // History
  getHistory() {
    return this._get(CONFIG.STORAGE_KEYS.HISTORY);
  },

  addHistory(movie) {
    let history = this.getHistory().filter(h => h.slug !== movie.slug);
    const item = {
      name: movie.name,
      slug: movie.slug,
      thumb_url: movie.thumb_url,
      poster_url: movie.poster_url,
      year: movie.year,
      origin_name: movie.origin_name,
      quality: movie.quality,
      episode_current: movie.episode_current,
      timestamp: Date.now()
    };
    history.unshift(item);
    if (history.length > CONFIG.MAX_HISTORY) {
      history = history.slice(0, CONFIG.MAX_HISTORY);
    }
    this._set(CONFIG.STORAGE_KEYS.HISTORY, history);
  },

  clearHistory() {
    this._set(CONFIG.STORAGE_KEYS.HISTORY, []);
  }
};

// ============================================================
// 4. UI MODULE
// ============================================================
const UI = {
  showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(pageId);
    if (target) {
      target.classList.add('active');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  showLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.classList.add('active');
  },

  hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.classList.remove('active');
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${message}</span>
      <button onclick="this.parentElement.remove()">&times;</button>
    `;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, CONFIG.TOAST_DURATION);
  },

  renderMovieCard(movie, cdnBase) {
    const thumbUrl = API.getImageUrl(movie.poster_url, cdnBase);
    console.log(`[ThanhMovie] Card ${movie.name}: poster=${movie.poster_url}, cdn=${cdnBase}, thumbUrl=${thumbUrl}`);
    const quality = movie.quality || 'HD';
    const episode = movie.episode_current || '';
    const year = movie.year || '';
    const lang = movie.lang || '';
    const name = movie.name || 'Không rõ';

    return `
      <div class="movie-card" onclick="Router.navigate('#movie/${movie.slug}')">
        <div class="card-poster">
          <img src="${thumbUrl}" alt="${name}" loading="lazy">
          <div class="card-overlay">
            <span class="card-quality">${quality}</span>
            ${episode ? `<span class="card-episode">${episode}</span>` : ''}
            <button class="play-btn" aria-label="Xem phim">
              <svg viewBox="0 0 24 24" fill="currentColor" width="36" height="36"><polygon points="5,3 19,12 5,21"/></svg>
            </button>
          </div>
        </div>
        <div class="card-info">
          <h3 class="card-title">${name}</h3>
          <p class="card-meta">${year}${lang ? ' • ' + lang : ''}</p>
        </div>
      </div>
    `;
  },

  renderSkeletonCards(count = CONFIG.SKELETON_COUNT) {
    let html = '';
    for (let i = 0; i < count; i++) {
      html += `
        <div class="movie-card skeleton">
          <div class="card-poster"><div class="skeleton-img"></div></div>
          <div class="card-info">
            <div class="skeleton-title"></div>
            <div class="skeleton-meta"></div>
          </div>
        </div>
      `;
    }
    return html;
  },

  renderPagination(currentPage, totalPages, baseHash) {
    if (totalPages <= 1) return '';
    let html = '<div class="pagination">';
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    if (endPage - startPage < maxButtons - 1) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    if (currentPage > 1) {
      html += `<button class="page-btn" onclick="Router.navigate('${baseHash}/${currentPage - 1}')">&laquo;</button>`;
    }
    if (startPage > 1) {
      html += `<button class="page-btn" onclick="Router.navigate('${baseHash}/1')">1</button>`;
      if (startPage > 2) html += `<span class="page-dots">...</span>`;
    }
    for (let i = startPage; i <= endPage; i++) {
      const activeClass = i === currentPage ? ' active' : '';
      html += `<button class="page-btn${activeClass}" onclick="Router.navigate('${baseHash}/${i}')">${i}</button>`;
    }
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) html += `<span class="page-dots">...</span>`;
      html += `<button class="page-btn" onclick="Router.navigate('${baseHash}/${totalPages}')">${totalPages}</button>`;
    }
    if (currentPage < totalPages) {
      html += `<button class="page-btn" onclick="Router.navigate('${baseHash}/${currentPage + 1}')">&raquo;</button>`;
    }

    html += '</div>';
    return html;
  },

  renderGrid(movies, cdnBase) {
    if (!movies || movies.length === 0) {
      return '<div class="empty-state"><p>Không tìm thấy phim nào.</p></div>';
    }
    return movies.map(m => this.renderMovieCard(m, cdnBase)).join('');
  },

  handleImageError(img) {
    img.onerror = null;
    img.src = 'data:image/svg+xml,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450"><rect fill="#242430" width="300" height="450"/><text fill="#666" font-size="16" x="50%" y="50%" text-anchor="middle">No Image</text></svg>'
    );
  }
};

// ============================================================
// 5. HERO SLIDER
// ============================================================
const HeroSlider = {
  currentIndex: 0,
  slides: [],
  intervalId: null,
  cdnBase: '',

  init(movies, cdnBase) {
    this.slides = movies.slice(0, 5);
    this.cdnBase = cdnBase;
    this.currentIndex = 0;
    this.render();
    this.startAutoAdvance();
    this.bindEvents();
  },

  render() {
    const slider = document.getElementById('hero-slider');
    const dots = document.getElementById('hero-dots');
    if (!slider || !dots) return;

    slider.innerHTML = this.slides.map((movie, index) => {
      const posterUrl = API.getImageUrl(movie.thumb_url, this.cdnBase);
      const name = movie.name || '';
      const originName = movie.origin_name || '';
      const year = movie.year || '';
      const quality = movie.quality || 'HD';
      const lang = movie.lang || '';
      const episode = movie.episode_current || '';

      return `
        <div class="hero-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
          <div class="hero-slide-bg">
            <img src="${posterUrl}" alt="${name}" onerror="UI.handleImageError(this)">
          </div>
          <div class="hero-slide-content">
            <h1>${name}</h1>
            <p class="hero-desc">${originName}${year ? ' (' + year + ')' : ''}</p>
            <div class="hero-meta">
              <span>${quality}</span>
              ${lang ? `<span>${lang}</span>` : ''}
              ${episode ? `<span>${episode}</span>` : ''}
              ${year ? `<span>${year}</span>` : ''}
            </div>
            <div class="hero-buttons">
              <a href="#watch/${movie.slug}" class="btn-primary">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><polygon points="5,3 19,12 5,21"/></svg>
                Xem Phim
              </a>
              <a href="#movie/${movie.slug}" class="btn-secondary">Chi Tiết</a>
            </div>
          </div>
        </div>
      `;
    }).join('');

    dots.innerHTML = this.slides.map((_, index) =>
      `<button class="hero-dot ${index === 0 ? 'active' : ''}" data-index="${index}" aria-label="Slide ${index + 1}"></button>`
    ).join('');
  },

  goTo(index) {
    if (index < 0) index = this.slides.length - 1;
    if (index >= this.slides.length) index = 0;

    const allSlides = document.querySelectorAll('.hero-slide');
    const allDots = document.querySelectorAll('.hero-dot');

    allSlides.forEach(s => s.classList.remove('active'));
    allDots.forEach(d => d.classList.remove('active'));

    if (allSlides[index]) allSlides[index].classList.add('active');
    if (allDots[index]) allDots[index].classList.add('active');

    this.currentIndex = index;
  },

  next() {
    this.goTo(this.currentIndex + 1);
  },

  prev() {
    this.goTo(this.currentIndex - 1);
  },

  startAutoAdvance() {
    this.stopAutoAdvance();
    this.intervalId = setInterval(() => this.next(), CONFIG.HERO_INTERVAL);
  },

  stopAutoAdvance() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  },

  bindEvents() {
    const prevBtn = document.getElementById('hero-prev');
    const nextBtn = document.getElementById('hero-next');
    const dotsContainer = document.getElementById('hero-dots');

    if (prevBtn) {
      prevBtn.onclick = () => {
        this.prev();
        this.startAutoAdvance();
      };
    }
    if (nextBtn) {
      nextBtn.onclick = () => {
        this.next();
        this.startAutoAdvance();
      };
    }
    if (dotsContainer) {
      dotsContainer.onclick = (e) => {
        const dot = e.target.closest('.hero-dot');
        if (dot) {
          this.goTo(parseInt(dot.dataset.index, 10));
          this.startAutoAdvance();
        }
      };
    }
  },

  destroy() {
    this.stopAutoAdvance();
  }
};

// ============================================================
// 6. PLAYER MODULE
// ============================================================
const Player = {
  hlsInstance: null,

  initHlsPlayer(url, movie = null, episodeName = null) {
    const video = document.getElementById('video-player');
    const iframe = document.getElementById('iframe-player');
    const loading = document.getElementById('player-loading');

    if (!video) return;

    if (iframe) iframe.style.display = 'none';
    video.style.display = 'block';
    if (loading) loading.style.display = 'flex';

    this.destroyPlayer();

    // Time tracking logic
    const savedTime = movie ? History.getProgress(movie.slug, episodeName) : 0;
    video.ontimeupdate = () => {
      if (movie && episodeName) {
        History.saveProgress(movie, episodeName, video.currentTime);
      }
    };

    if (Hls.isSupported()) {
      const hls = new Hls({
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        startLevel: -1
      });
      this.hlsInstance = hls;

      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (loading) loading.style.display = 'none';
        if (savedTime > 0) {
          const m = Math.floor(savedTime / 60);
          const s = Math.floor(savedTime % 60);
          const timeStr = `${m}:${s < 10 ? '0' + s : s}`;
          if (confirm(`Bạn đang xem dở tập này ở phút ${timeStr}. Bạn có muốn tiếp tục xem không?`)) {
            video.currentTime = savedTime;
          }
        }
        video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error('HLS fatal error:', data);
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('Network error, trying to recover...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('Media error, trying to recover...');
              hls.recoverMediaError();
              break;
            default:
              console.log('Unrecoverable error, falling back to iframe');
              this.destroyPlayer();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.addEventListener('loadedmetadata', () => {
        if (loading) loading.style.display = 'none';
        if (savedTime > 0) {
          const m = Math.floor(savedTime / 60);
          const s = Math.floor(savedTime % 60);
          const timeStr = `${m}:${s < 10 ? '0' + s : s}`;
          if (confirm(`Bạn đang xem dở tập này ở phút ${timeStr}. Bạn có muốn tiếp tục xem không?`)) {
            video.currentTime = savedTime;
          }
        }
        video.play().catch(() => {});
      });
    } else {
      if (loading) loading.style.display = 'none';
      return false;
    }
    return true;
  },

  initIframePlayer(url, movie = null, episodeName = null) {
    const video = document.getElementById('video-player');
    const iframe = document.getElementById('iframe-player');
    const loading = document.getElementById('player-loading');

    this.destroyPlayer();

    if (video) video.style.display = 'none';
    if (iframe) {
      iframe.style.display = 'block';
      iframe.src = url;
    }
    if (loading) loading.style.display = 'none';

    // Save minimal history for iframe
    if (movie && episodeName) {
      History.saveProgress(movie, episodeName, 5); // Dummy time 5s to trigger save
    }
  },

  destroyPlayer() {
    if (this.hlsInstance) {
      this.hlsInstance.destroy();
      this.hlsInstance = null;
    }
    const video = document.getElementById('video-player');
    if (video) {
      video.pause();
      video.removeAttribute('src');
      video.load();
    }
    const iframe = document.getElementById('iframe-player');
    if (iframe) {
      iframe.src = 'about:blank';
    }
  },

  toggleCinemaMode() {
    const isCinema = document.body.classList.toggle('cinema-mode');
    const btn = document.getElementById('btn-cinema');
    if (btn) {
      btn.innerHTML = isCinema ? '<i class="fas fa-lightbulb"></i> Bật Đèn' : '<i class="fas fa-lightbulb"></i> Tắt Đèn';
    }
  }
};

// ============================================================
// HISTORY MODULE (Tiếp tục xem)
// ============================================================
const History = {
  getHistory() {
    try {
      const data = localStorage.getItem('thanhMovie_history');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveProgress(movie, episodeName, currentTime) {
    if (!movie || !movie.slug) return;
    
    // Only save if watched at least 5 seconds
    if (currentTime < 5) return;

    let history = this.getHistory();
    const index = history.findIndex(item => item.slug === movie.slug);
    
    const record = {
      slug: movie.slug,
      name: movie.name,
      thumb_url: movie.thumb_url,
      episode: episodeName,
      time: currentTime,
      timestamp: Date.now()
    };

    if (index > -1) {
      history[index] = record;
    } else {
      history.unshift(record);
    }

    // Keep only last 20 movies
    if (history.length > 20) {
      history = history.slice(0, 20);
    }

    // Move to top
    history.sort((a, b) => b.timestamp - a.timestamp);
    localStorage.setItem('thanhMovie_history', JSON.stringify(history));
  },

  getProgress(slug, episodeName) {
    const history = this.getHistory();
    const record = history.find(item => item.slug === slug && item.episode === episodeName);
    return record ? record.time : 0;
  }
};

// ============================================================
// 7. SEARCH MODULE
// ============================================================
const Search = {
  debounceTimer: null,
  isOpen: false,

  init() {
    const searchToggle = document.getElementById('search-toggle');
    const searchBox = document.getElementById('search-box');
    const searchInput = document.getElementById('search-input');
    const searchClear = document.getElementById('search-clear');
    const searchDropdown = document.getElementById('search-dropdown');

    if (searchToggle) {
      searchToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleSearchBox();
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', () => this.onInput());
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.submitSearch();
        }
        if (e.key === 'Escape') {
          this.closeSearchBox();
        }
      });
    }

    if (searchClear) {
      searchClear.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
        }
        if (searchDropdown) searchDropdown.innerHTML = '';
        this.hideDropdown();
      });
    }

    document.addEventListener('click', (e) => {
      const searchBox = document.getElementById('search-box');
      if (searchBox && !searchBox.contains(e.target) && !e.target.closest('#search-toggle')) {
        this.closeSearchBox();
      }
    });
  },

  toggleSearchBox() {
    const searchBox = document.getElementById('search-box');
    const searchInput = document.getElementById('search-input');
    if (!searchBox) return;

    this.isOpen = !this.isOpen;
    searchBox.classList.toggle('active', this.isOpen);
    if (this.isOpen && searchInput) {
      searchInput.focus();
    }
  },

  closeSearchBox() {
    const searchBox = document.getElementById('search-box');
    if (searchBox) searchBox.classList.remove('active');
    this.isOpen = false;
    this.hideDropdown();
  },

  hideDropdown() {
    const dropdown = document.getElementById('search-dropdown');
    if (dropdown) {
      dropdown.innerHTML = '';
      dropdown.style.display = 'none';
    }
  },

  onInput() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    clearTimeout(this.debounceTimer);
    const keyword = searchInput.value.trim();

    if (keyword.length < 2) {
      this.hideDropdown();
      return;
    }

    const dropdown = document.getElementById('search-dropdown');
    if (dropdown) {
      dropdown.innerHTML = '<div class="search-no-result"><i class="fas fa-spinner fa-spin"></i> Đang tìm kiếm...</div>';
      dropdown.style.display = 'block';
    }

    this.debounceTimer = setTimeout(async () => {
      try {
        const result = await API.searchMovies(keyword, 1);
        const items = result?.data?.items || [];
        const cdnBase = result?.data?.APP_DOMAIN_CDN_IMAGE || CONFIG.IMG_CDN;
        this.renderDropdown(items.slice(0, 5), cdnBase);
      } catch {
        this.hideDropdown();
      }
    }, 200);
  },

  renderDropdown(items, cdnBase) {
    const dropdown = document.getElementById('search-dropdown');
    if (!dropdown) return;

    if (items.length === 0) {
      dropdown.innerHTML = '<div class="search-no-result">Không tìm thấy kết quả</div>';
      dropdown.style.display = 'block';
      return;
    }

    dropdown.innerHTML = items.map(movie => {
      const thumbUrl = API.getImageUrl(movie.thumb_url, cdnBase);
      return `
        <div class="search-result-item" onclick="Search.closeSearchBox(); Router.navigate('#movie/${movie.slug}')">
          <div class="search-result-poster">
            <img src="${thumbUrl}" alt="${movie.name}" onerror="UI.handleImageError(this)">
          </div>
          <div class="search-result-info">
            <h4>${movie.name}</h4>
            <p>${movie.origin_name || ''}</p>
            <div class="search-result-meta">
              ${movie.year ? `<span class="badge-year">${movie.year}</span>` : ''}
              ${movie.quality ? `<span class="badge-quality">${movie.quality}</span>` : ''}
              ${movie.lang ? `<span class="badge-lang">${movie.lang}</span>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    const searchInput = document.getElementById('search-input');
    const keyword = searchInput ? searchInput.value.trim() : '';
    if (keyword) {
      dropdown.innerHTML += `
        <div class="search-result-item search-view-all" onclick="Search.submitSearch()">
          <span>Xem tất cả kết quả cho "${keyword}"</span>
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
        </div>
      `;
    }

    dropdown.style.display = 'block';
  },

  submitSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    const keyword = searchInput.value.trim();
    if (keyword) {
      this.closeSearchBox();
      Router.navigate(`#search/${encodeURIComponent(keyword)}`);
    }
  }
};

// ============================================================
// 8. PAGES - HOME
// ============================================================
const HomePage = {
  async load() {
    UI.showPage('home-page');
    UI.showLoading();

    const gridNew = document.getElementById('grid-new');
    const gridSeries = document.getElementById('grid-series');
    const gridSingle = document.getElementById('grid-single');
    const gridAnime = document.getElementById('grid-anime');

    if (gridNew) gridNew.innerHTML = UI.renderSkeletonCards(12);
    if (gridSeries) gridSeries.innerHTML = UI.renderSkeletonCards(12);
    if (gridSingle) gridSingle.innerHTML = UI.renderSkeletonCards(12);
    if (gridAnime) gridAnime.innerHTML = UI.renderSkeletonCards(12);

    try {
      console.log('[ThanhMovie] Loading home page, API_BASE:', CONFIG.API_BASE);
      const [newRes, seriesRes, singleRes, animeRes, hotRes] = await Promise.all([
        API.getNewMovies(1),
        API.getSeriesList(1),
        API.getSingleList(1),
        API.getAnimeList(1),
        API.getHotMovies(1)
      ]);

      console.log('[ThanhMovie] API responses received:', { newRes: !!newRes, seriesRes: !!seriesRes });
      console.log('[ThanhMovie] newRes keys:', newRes ? Object.keys(newRes) : 'null');
      console.log('[ThanhMovie] newRes.items:', newRes?.items?.length, 'newRes.data?.items:', newRes?.data?.items?.length);

      // phimapi.com list endpoints return flat {items, pagination} - images are full URLs
      const newItems = newRes?.items || newRes?.data?.items || [];
      const seriesItems = seriesRes?.items || seriesRes?.data?.items || [];
      const singleItems = singleRes?.items || singleRes?.data?.items || [];
      const animeItems = animeRes?.items || animeRes?.data?.items || [];
      const hotItems = hotRes?.items || hotRes?.data?.items || [];

      console.log('[ThanhMovie] Parsed items:', newItems.length, seriesItems.length, singleItems.length, animeItems.length, hotItems.length);

      const heroSlugs = ['huyen-thoai-linh-bep-anh-nuoi-thang-cap-thanh-huyen-thoai', 'dem-ngay-xa-me', 'ma-da-han-quoc-ho-nuot-nguoi', 'bai-hoc-dang-doi', 'bu-nhin-bong-dem'];
      try {
        const heroResults = await Promise.all(heroSlugs.map(slug => API.getMovieDetail(slug)));
        const heroItems = heroResults.map(res => res?.movie).filter(m => m);
        if (heroItems.length > 0) {
          HeroSlider.init(heroItems, null);
        } else {
          HeroSlider.init(hotItems, hotRes?.data?.APP_DOMAIN_CDN_IMAGE || null);
        }
      } catch (e) {
        console.error('Failed to load hero banner movies:', e);
        HeroSlider.init(hotItems, hotRes?.data?.APP_DOMAIN_CDN_IMAGE || null);
      }

      if (gridNew) gridNew.innerHTML = UI.renderGrid(newItems.slice(0, 12), null);
      if (gridSeries) gridSeries.innerHTML = UI.renderGrid(seriesItems.slice(0, 12), seriesRes?.data?.APP_DOMAIN_CDN_IMAGE);
      if (gridSingle) gridSingle.innerHTML = UI.renderGrid(singleItems.slice(0, 12), singleRes?.data?.APP_DOMAIN_CDN_IMAGE);
      if (gridAnime) gridAnime.innerHTML = UI.renderGrid(animeItems.slice(0, 12), animeRes?.data?.APP_DOMAIN_CDN_IMAGE);
      
      const gridHot = document.getElementById('grid-hot');
      if (gridHot) gridHot.innerHTML = UI.renderGrid(hotItems.slice(0, 12), hotRes?.data?.APP_DOMAIN_CDN_IMAGE);

      // Render Continue Watching
      const historyItems = History.getHistory();
      const sectionContinue = document.getElementById('section-continue');
      const gridContinue = document.getElementById('grid-continue');
      
      if (historyItems && historyItems.length > 0 && sectionContinue && gridContinue) {
        gridContinue.innerHTML = historyItems.slice(0, 6).map(movie => {
          const thumbUrl = API.getImageUrl(movie.thumb_url, CONFIG.IMG_CDN);
          const progressPercent = Math.min(100, Math.round((movie.time / 3000) * 100)); // Just a visual proxy if duration is unknown
          return `
            <div class="movie-card" onclick="Router.navigate('#watch/${movie.slug}/0/0')">
              <div class="card-poster">
                <img src="${thumbUrl}" alt="${movie.name}" loading="lazy">
                <div class="card-overlay">
                  <span class="card-quality">${movie.episode || 'Đang xem'}</span>
                  <button class="play-btn" aria-label="Tiếp tục xem">
                    <i class="fas fa-play"></i>
                  </button>
                </div>
                <div style="position:absolute; bottom:0; left:0; right:0; height:4px; background:rgba(255,255,255,0.2);">
                  <div style="height:100%; width:${progressPercent}%; background:var(--accent-primary);"></div>
                </div>
              </div>
              <div class="card-info">
                <h3>${movie.name}</h3>
                <p>Tiếp tục xem...</p>
              </div>
            </div>
          `;
        }).join('');
        sectionContinue.style.display = 'block';
      } else if (sectionContinue) {
        sectionContinue.style.display = 'none';
      }
    } catch (error) {
      console.error('[ThanhMovie] HomePage load error:', error);
      UI.showToast('Không thể tải dữ liệu phim. Vui lòng thử lại.', 'error');
    } finally {
      UI.hideLoading();
    }
  }
};

// ============================================================
// 9. PAGES - CATEGORY
// ============================================================
const CategoryPage = {
  async load(type, page = 1) {
    UI.showPage('category-page');
    UI.showLoading();

    const titleEl = document.getElementById('category-title');
    const grid = document.getElementById('category-grid');
    const paginationEl = document.getElementById('category-pagination');

    const title = CONFIG.CATEGORY_TITLES[type] || type;
    if (titleEl) titleEl.textContent = title;
    if (grid) grid.innerHTML = UI.renderSkeletonCards(24);
    if (paginationEl) paginationEl.innerHTML = '';

    try {
      const result = await API.getCategoryList(type, page);
      // phimapi.com list endpoints return flat {items, pagination}
      const items = result?.items || result?.data?.items || [];
      const pagination = result?.pagination || result?.data?.params?.pagination;

      if (grid) grid.innerHTML = UI.renderGrid(items, null);

      if (paginationEl && pagination) {
        paginationEl.innerHTML = UI.renderPagination(
          pagination.currentPage,
          pagination.totalPages,
          `#category/${type}`
        );
      }
    } catch (error) {
      UI.showToast('Không thể tải danh sách phim.', 'error');
      if (grid) grid.innerHTML = '<div class="empty-state"><p>Đã xảy ra lỗi. Vui lòng thử lại.</p></div>';
    } finally {
      UI.hideLoading();
    }
  }
};

// ============================================================
// 10. PAGES - GENRE
// ============================================================
const GenrePage = {
  async load(slug, page = 1) {
    UI.showPage('category-page');
    UI.showLoading();

    const titleEl = document.getElementById('category-title');
    const grid = document.getElementById('category-grid');
    const paginationEl = document.getElementById('category-pagination');

    const genre = CONFIG.GENRES.find(g => g.slug === slug);
    const title = genre ? `Thể loại: ${genre.name}` : `Thể loại: ${slug}`;
    if (titleEl) titleEl.textContent = title;
    if (grid) grid.innerHTML = UI.renderSkeletonCards(24);
    if (paginationEl) paginationEl.innerHTML = '';

    try {
      const result = await API.getByGenre(slug, page);
      const items = result?.data?.items || [];
      const cdnBase = result?.data?.APP_DOMAIN_CDN_IMAGE || CONFIG.IMG_CDN;
      const pagination = result?.data?.params?.pagination;

      if (grid) grid.innerHTML = UI.renderGrid(items, cdnBase);

      if (paginationEl && pagination) {
        paginationEl.innerHTML = UI.renderPagination(
          pagination.currentPage,
          pagination.totalPages,
          `#genre/${slug}`
        );
      }
    } catch (error) {
      UI.showToast('Không thể tải danh sách phim theo thể loại.', 'error');
      if (grid) grid.innerHTML = '<div class="empty-state"><p>Đã xảy ra lỗi. Vui lòng thử lại.</p></div>';
    } finally {
      UI.hideLoading();
    }
  }
};

// ============================================================
// 11. PAGES - COUNTRY
// ============================================================
const CountryPage = {
  async load(slug, page = 1) {
    UI.showPage('category-page');
    UI.showLoading();

    const titleEl = document.getElementById('category-title');
    const grid = document.getElementById('category-grid');
    const paginationEl = document.getElementById('category-pagination');

    const country = CONFIG.COUNTRIES.find(c => c.slug === slug);
    const title = country ? `Quốc gia: ${country.name}` : `Quốc gia: ${slug}`;
    if (titleEl) titleEl.textContent = title;
    if (grid) grid.innerHTML = UI.renderSkeletonCards(24);
    if (paginationEl) paginationEl.innerHTML = '';

    try {
      const result = await API.getByCountry(slug, page);
      const items = result?.data?.items || [];
      const cdnBase = result?.data?.APP_DOMAIN_CDN_IMAGE || CONFIG.IMG_CDN;
      const pagination = result?.data?.params?.pagination;

      if (grid) grid.innerHTML = UI.renderGrid(items, cdnBase);

      if (paginationEl && pagination) {
        paginationEl.innerHTML = UI.renderPagination(
          pagination.currentPage,
          pagination.totalPages,
          `#country/${slug}`
        );
      }
    } catch (error) {
      UI.showToast('Không thể tải danh sách phim theo quốc gia.', 'error');
      if (grid) grid.innerHTML = '<div class="empty-state"><p>Đã xảy ra lỗi. Vui lòng thử lại.</p></div>';
    } finally {
      UI.hideLoading();
    }
  }
};

// ============================================================
// 12. PAGES - DETAIL
// ============================================================
const DetailPage = {
  async load(slug) {
    UI.showPage('detail-page');
    UI.showLoading();

    const contentEl = document.getElementById('detail-content');
    if (!contentEl) return;
    contentEl.innerHTML = '<div class="detail-loading">Đang tải...</div>';

    try {
      const result = await API.getMovieDetail(slug);
      const movie = result?.movie;
      const episodes = result?.episodes || [];

      if (!movie) {
        contentEl.innerHTML = '<div class="empty-state"><p>Không tìm thấy phim.</p></div>';
        UI.hideLoading();
        return;
      }

      const posterUrl = movie.poster_url || '';
      const thumbUrl = movie.thumb_url || '';
      const isFav = Storage.isFavorite(movie.slug);
      const favIcon = isFav ? '❤️' : '🤍';
      const favText = isFav ? 'Bỏ yêu thích' : 'Yêu thích';

      const categories = (movie.category || []).map(c =>
        `<a href="#genre/${c.slug}" class="tag">${c.name}</a>`
      ).join('');

      const countries = (movie.country || []).map(c =>
        `<a href="#country/${c.slug}" class="tag">${c.name}</a>`
      ).join('');

      const actors = (movie.actor || []).filter(a => a && a !== '').join(', ') || 'Đang cập nhật';
      const directors = (movie.director || []).filter(d => d && d !== '').join(', ') || 'Đang cập nhật';

      const description = movie.content
        ? movie.content.replace(/<\/?[^>]+(>|$)/g, '')
        : 'Đang cập nhật nội dung.';

      let episodesHtml = '';
      if (episodes.length > 0 && episodes[0].server_data && episodes[0].server_data.length > 0) {
        episodesHtml = `
          <div class="detail-episodes">
            <h3>Danh sách tập</h3>
            <div class="episode-list">
              ${episodes[0].server_data.map((ep, idx) =>
                `<button class="episode-btn" onclick="Router.navigate('#watch/${movie.slug}/0/${idx}')">${ep.name}</button>`
              ).join('')}
            </div>
          </div>
        `;
      }

      contentEl.innerHTML = `
        <div class="detail-backdrop">
          <img src="${posterUrl}" alt="${movie.name}" onerror="UI.handleImageError(this)">
          <div class="detail-backdrop-overlay"></div>
        </div>
        <div class="detail-container">
          <div class="detail-poster">
            <img src="${thumbUrl}" alt="${movie.name}" onerror="UI.handleImageError(this)">
            <div class="detail-poster-actions">
              <button class="btn-favorite" onclick="DetailPage.toggleFavorite()" id="detail-fav-btn" data-slug="${movie.slug}">
                <span class="fav-icon">${favIcon}</span> <span class="fav-text">${favText}</span>
              </button>
              <a href="#watch/${movie.slug}" class="btn-watch">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><polygon points="5,3 19,12 5,21"/></svg>
                Xem Phim
              </a>
            </div>
          </div>
          <div class="detail-info">
            <h1 class="detail-title">${movie.name}</h1>
            <h2 class="detail-original-title">${movie.origin_name || ''}</h2>
            <div class="detail-meta">
              <span class="meta-item"><strong>Năm:</strong> ${movie.year || 'N/A'}</span>
              <span class="meta-item"><strong>Chất lượng:</strong> ${movie.quality || 'HD'}</span>
              <span class="meta-item"><strong>Ngôn ngữ:</strong> ${movie.lang || 'N/A'}</span>
              <span class="meta-item"><strong>Trạng thái:</strong> ${movie.episode_current || 'N/A'}${movie.episode_total ? ' / ' + movie.episode_total + ' tập' : ''}</span>
              <span class="meta-item"><strong>Thời lượng:</strong> ${movie.time || 'N/A'}</span>
              <span class="meta-item"><strong>Đạo diễn:</strong> ${directors}</span>
              <span class="meta-item"><strong>Diễn viên:</strong> ${actors}</span>
            </div>
            <div class="detail-tags">
              <strong>Thể loại:</strong> ${categories || '<span class="tag">N/A</span>'}
            </div>
            <div class="detail-tags">
              <strong>Quốc gia:</strong> ${countries || '<span class="tag">N/A</span>'}
            </div>
            <div class="detail-description">
              <h3>Nội dung phim</h3>
              <p>${description}</p>
            </div>
            ${episodesHtml}
          </div>
        </div>
      `;

      this._currentMovie = movie;
    } catch (error) {
      contentEl.innerHTML = '<div class="empty-state"><p>Không thể tải thông tin phim. Vui lòng thử lại.</p></div>';
      UI.showToast('Lỗi khi tải thông tin phim.', 'error');
      console.error('DetailPage load error:', error);
    } finally {
      UI.hideLoading();
    }
  },

  _currentMovie: null,

  toggleFavorite() {
    if (!this._currentMovie) return;
    const added = Storage.toggleFavorite(this._currentMovie);
    const btn = document.getElementById('detail-fav-btn');
    if (btn) {
      const iconSpan = btn.querySelector('.fav-icon');
      const textSpan = btn.querySelector('.fav-text');
      if (iconSpan) iconSpan.textContent = added ? '❤️' : '🤍';
      if (textSpan) textSpan.textContent = added ? 'Bỏ yêu thích' : 'Yêu thích';
    }
    UI.showToast(added ? 'Đã thêm vào yêu thích!' : 'Đã xóa khỏi yêu thích.', 'success');
  }
};

// ============================================================
// 13. PAGES - WATCH
// ============================================================
const WatchPage = {
  _cachedDetail: null,
  _currentSlug: null,

  async load(slug, serverIndex = 0, episodeIndex = 0) {
    UI.showPage('watch-page');
    UI.showLoading();
    Player.destroyPlayer();

    serverIndex = parseInt(serverIndex, 10) || 0;
    episodeIndex = parseInt(episodeIndex, 10) || 0;

    try {
      let detail;
      if (this._currentSlug === slug && this._cachedDetail) {
        detail = this._cachedDetail;
      } else {
        const result = await API.getMovieDetail(slug);
        detail = result;
        this._cachedDetail = detail;
        this._currentSlug = slug;
      }

      const movie = detail?.movie;
      const episodes = detail?.episodes || [];

      if (!movie) {
        UI.showToast('Không tìm thấy phim.', 'error');
        UI.hideLoading();
        return;
      }

      Storage.addHistory(movie);

      const titleEl = document.getElementById('watch-title');
      const episodeNameEl = document.getElementById('watch-episode-name');
      if (titleEl) titleEl.textContent = movie.name;

      if (episodes.length === 0 || !episodes[serverIndex]) {
        UI.showToast('Không tìm thấy tập phim.', 'error');
        UI.hideLoading();
        return;
      }

      const server = episodes[serverIndex];
      const serverData = server.server_data || [];

      if (serverData.length === 0 || !serverData[episodeIndex]) {
        UI.showToast('Không tìm thấy tập phim.', 'error');
        UI.hideLoading();
        return;
      }

      const episode = serverData[episodeIndex];
      if (episodeNameEl) {
        episodeNameEl.textContent = episode.name || `Tập ${episodeIndex + 1}`;
      }

      // Play video
      const m3u8Url = episode.link_m3u8;
      const embedUrl = episode.link_embed;

      if (m3u8Url && typeof Hls !== 'undefined') {
        const success = Player.initHlsPlayer(m3u8Url, movie, episode.name);
        if (!success && embedUrl) {
          Player.initIframePlayer(embedUrl, movie, episode.name);
        }
      } else if (embedUrl) {
        Player.initIframePlayer(embedUrl, movie, episode.name);
      } else {
        UI.showToast('Không tìm thấy nguồn phát.', 'error');
      }

      // Render server list
      this.renderServerList(episodes, slug, serverIndex, episodeIndex);

      // Render episode list
      this.renderEpisodeList(serverData, slug, serverIndex, episodeIndex);

      // Render movie info
      this.renderWatchInfo(movie);

    } catch (error) {
      UI.showToast('Không thể tải phim. Vui lòng thử lại.', 'error');
      console.error('WatchPage load error:', error);
    } finally {
      UI.hideLoading();
    }
  },

  renderServerList(episodes, slug, activeServer, activeEpisode) {
    const section = document.getElementById('server-section');
    const list = document.getElementById('server-list');
    if (!section || !list) return;

    if (episodes.length <= 1) {
      section.style.display = 'none';
      return;
    }
    section.style.display = 'block';

    list.innerHTML = episodes.map((ep, idx) => {
      const activeClass = idx === activeServer ? ' active' : '';
      return `<button class="server-btn${activeClass}" onclick="Router.navigate('#watch/${slug}/${idx}/${activeEpisode}')">${ep.server_name}</button>`;
    }).join('');
  },

  renderEpisodeList(serverData, slug, serverIndex, activeEpisode) {
    const section = document.getElementById('episode-section');
    const list = document.getElementById('episode-list');
    if (!section || !list) return;

    if (serverData.length <= 1) {
      section.style.display = 'none';
      return;
    }
    section.style.display = 'block';

    const history = Storage.getHistory();
    list.innerHTML = serverData.map((ep, idx) => {
      const activeClass = idx === activeEpisode ? ' active' : '';
      const watchedClass = '';
      return `<button class="episode-btn${activeClass}${watchedClass}" onclick="Router.navigate('#watch/${slug}/${serverIndex}/${idx}')">${ep.name}</button>`;
    }).join('');
  },

  renderWatchInfo(movie) {
    const infoEl = document.getElementById('watch-detail-info');
    if (!infoEl) return;

    const categories = (movie.category || []).map(c => c.name).join(', ') || 'N/A';
    const countries = (movie.country || []).map(c => c.name).join(', ') || 'N/A';

    infoEl.innerHTML = `
      <div class="watch-info-card">
        <div class="watch-info-poster">
          <img src="${movie.thumb_url || ''}" alt="${movie.name}" onerror="UI.handleImageError(this)">
        </div>
        <div class="watch-info-details">
          <h3><a href="#movie/${movie.slug}">${movie.name}</a></h3>
          <p class="watch-info-original">${movie.origin_name || ''}</p>
          <div class="watch-info-meta">
            <span><strong>Năm:</strong> ${movie.year || 'N/A'}</span>
            <span><strong>Chất lượng:</strong> ${movie.quality || 'HD'}</span>
            <span><strong>Ngôn ngữ:</strong> ${movie.lang || 'N/A'}</span>
            <span><strong>Thể loại:</strong> ${categories}</span>
            <span><strong>Quốc gia:</strong> ${countries}</span>
          </div>
          <p class="watch-info-desc">${movie.content ? movie.content.replace(/<\/?[^>]+(>|$)/g, '').substring(0, 300) + '...' : ''}</p>
        </div>
      </div>
    `;
  }
};

// ============================================================
// 14. PAGES - FAVORITES
// ============================================================
const FavoritesPage = {
  load() {
    UI.showPage('favorites-page');

    const emptyEl = document.getElementById('favorites-empty');
    const grid = document.getElementById('favorites-grid');
    if (!grid) return;

    const favorites = Storage.getFavorites();

    if (favorites.length === 0) {
      if (emptyEl) emptyEl.style.display = 'block';
      grid.innerHTML = '';
      return;
    }

    if (emptyEl) emptyEl.style.display = 'none';
    grid.innerHTML = favorites.map(movie => UI.renderMovieCard(movie, null)).join('');
  }
};

// ============================================================
// 15. PAGES - HISTORY
// ============================================================
const HistoryPage = {
  load() {
    UI.showPage('history-page');

    const emptyEl = document.getElementById('history-empty');
    const grid = document.getElementById('history-grid');
    const clearBtn = document.getElementById('clear-history');
    if (!grid) return;

    const history = Storage.getHistory();

    if (history.length === 0) {
      if (emptyEl) emptyEl.style.display = 'block';
      grid.innerHTML = '';
      if (clearBtn) clearBtn.style.display = 'none';
      return;
    }

    if (emptyEl) emptyEl.style.display = 'none';
    if (clearBtn) {
      clearBtn.style.display = 'inline-flex';
      clearBtn.onclick = () => {
        Storage.clearHistory();
        this.load();
        UI.showToast('Đã xóa lịch sử xem phim.', 'success');
      };
    }
    grid.innerHTML = history.map(movie => UI.renderMovieCard(movie, null)).join('');
  }
};

// ============================================================
// 16. PAGES - SEARCH RESULTS
// ============================================================
const SearchPage = {
  async load(keyword, page = 1) {
    UI.showPage('search-page');
    UI.showLoading();

    const titleEl = document.getElementById('search-page-title');
    const grid = document.getElementById('search-grid');
    const paginationEl = document.getElementById('search-pagination');

    const decodedKeyword = decodeURIComponent(keyword);
    if (titleEl) titleEl.textContent = `Kết quả tìm kiếm: "${decodedKeyword}"`;
    if (grid) grid.innerHTML = UI.renderSkeletonCards(24);
    if (paginationEl) paginationEl.innerHTML = '';

    try {
      const result = await API.searchMovies(decodedKeyword, page);
      const items = result?.data?.items || [];
      const cdnBase = result?.data?.APP_DOMAIN_CDN_IMAGE || CONFIG.IMG_CDN;
      const pagination = result?.data?.params?.pagination;

      if (grid) grid.innerHTML = UI.renderGrid(items, cdnBase);

      if (paginationEl && pagination) {
        paginationEl.innerHTML = UI.renderPagination(
          pagination.currentPage,
          pagination.totalPages,
          `#search/${encodeURIComponent(decodedKeyword)}`
        );
      }
    } catch (error) {
      UI.showToast('Lỗi khi tìm kiếm.', 'error');
      if (grid) grid.innerHTML = '<div class="empty-state"><p>Đã xảy ra lỗi khi tìm kiếm.</p></div>';
    } finally {
      UI.hideLoading();
    }
  }
};

// ============================================================
// 17. ROUTER
// ============================================================
const Router = {
  routes: {},

  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();
  },

  navigate(hash) {
    window.location.hash = hash;
  },

  handleRoute() {
    const hash = window.location.hash || '#home';
    const parts = hash.substring(1).split('/');
    const route = parts[0];

    HeroSlider.destroy();
    Search.hideDropdown();
    if (typeof Player !== 'undefined' && Player.destroyPlayer) {
      Player.destroyPlayer();
    }

    this.updateActiveNav(hash);

    switch (route) {
      case 'home':
      case '':
        HomePage.load();
        break;

      case 'category': {
        const type = parts[1] || 'phim-moi-cap-nhat';
        const page = parseInt(parts[2], 10) || 1;
        CategoryPage.load(type, page);
        break;
      }

      case 'movie': {
        const slug = parts[1];
        if (slug) {
          DetailPage.load(slug);
        } else {
          this.navigate('#home');
        }
        break;
      }

      case 'watch': {
        const slug = parts[1];
        const serverIndex = parts[2] || 0;
        const episodeIndex = parts[3] || 0;
        if (slug) {
          WatchPage.load(slug, serverIndex, episodeIndex);
        } else {
          this.navigate('#home');
        }
        break;
      }

      case 'favorites':
        FavoritesPage.load();
        break;

      case 'history':
        HistoryPage.load();
        break;

      case 'search': {
        const keyword = parts[1] || '';
        const page = parseInt(parts[2], 10) || 1;
        if (keyword) {
          SearchPage.load(keyword, page);
        } else {
          this.navigate('#home');
        }
        break;
      }

      case 'genre': {
        const slug = parts[1];
        const page = parseInt(parts[2], 10) || 1;
        if (slug) {
          GenrePage.load(slug, page);
        } else {
          this.navigate('#home');
        }
        break;
      }

      case 'country': {
        const slug = parts[1];
        const page = parseInt(parts[2], 10) || 1;
        if (slug) {
          CountryPage.load(slug, page);
        } else {
          this.navigate('#home');
        }
        break;
      }

      default:
        this.navigate('#home');
        break;
    }
  },

  updateActiveNav(hash) {
    const navLinks = document.querySelectorAll('#main-nav a');
    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href && hash.startsWith(href)) {
        link.classList.add('active');
      }
    });
    if (hash === '#home' || hash === '' || hash === '#') {
      const homeLink = document.querySelector('#main-nav a[href="#home"]');
      if (homeLink) homeLink.classList.add('active');
    }
  }
};

// ============================================================
// 18. DROPDOWN MENUS
// ============================================================
const DropdownMenus = {
  init() {
    this.populateGenres();
    this.populateCountries();
  },

  populateGenres() {
    const dropdown = document.getElementById('genre-dropdown');
    if (!dropdown) return;

    dropdown.innerHTML = CONFIG.GENRES.map(genre =>
      `<li><a href="#genre/${genre.slug}">${genre.name}</a></li>`
    ).join('');
  },

  populateCountries() {
    const dropdown = document.getElementById('country-dropdown');
    if (!dropdown) return;

    dropdown.innerHTML = CONFIG.COUNTRIES.map(country =>
      `<li><a href="#country/${country.slug}">${country.name}</a></li>`
    ).join('');
  }
};

// ============================================================
// 19. UTILITIES
// ============================================================
const Utilities = {
  init() {
    this.initBackToTop();
    this.initHeaderScroll();
    this.initMobileMenu();
    this.initKeyboardShortcuts();
  },

  initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  },

  initHeaderScroll() {
    const header = document.getElementById('main-header');
    if (!header) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  },

  initMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const nav = document.getElementById('main-nav');
    if (!menuBtn || !nav) return;

    menuBtn.addEventListener('click', () => {
      menuBtn.classList.toggle('active');
      nav.classList.toggle('active');
    });

    nav.addEventListener('click', (e) => {
      const toggle = e.target.closest('.dropdown-toggle');
      if (toggle) {
        e.preventDefault();
        const parent = toggle.closest('.nav-dropdown');
        if (parent) parent.classList.toggle('active');
        return;
      }

      if (e.target.tagName === 'A' || e.target.closest('a')) {
        Search.closeSearchBox();
        nav.classList.remove('active');
        menuBtn.classList.remove('active');
      }
    });
  },

  initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        Search.closeSearchBox();
        const nav = document.getElementById('main-nav');
        const menuBtn = document.getElementById('mobile-menu-btn');
        if (nav) nav.classList.remove('active');
        if (menuBtn) menuBtn.classList.remove('active');
      }
    });
  }
};

// ============================================================
// 20. APP INITIALIZATION
// ============================================================
const App = {
  init() {
    DropdownMenus.init();
    Search.init();
    Utilities.init();
    Router.init();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
