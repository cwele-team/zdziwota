// Shared data and utilities
const STORAGE_KEYS = {
    AUTH_TOKEN: 'filmhaven_auth_token',
    USER_DATA: 'filmhaven_user_data',
    WATCHLIST: 'filmhaven_watchlist'
};

// Utility functions
const storage = {
    get: (key) => JSON.parse(localStorage.getItem(key)),
    set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
    remove: (key) => localStorage.removeItem(key)
};

// Auth utilities
const auth = {
    isAuthenticated: () => !!storage.get(STORAGE_KEYS.AUTH_TOKEN),

    getCurrentUser: () => storage.get(STORAGE_KEYS.USER_DATA),

    login: async (email, password) => {
        // Simulate API call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Real authentication should be implemented here
                // This is a placeholder - connect to your actual backend
                reject(new Error('Authentication not implemented'));
            }, 1000);
        });
    },

    register: async (email, password, fullName) => {
        // Simulate API call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const userData = {
                    id: Math.random().toString(36).substr(2, 9),
                    email,
                    fullName
                };
                // Real token should be returned from backend
                // storage.set(STORAGE_KEYS.AUTH_TOKEN, 'real_token');
                storage.set(STORAGE_KEYS.USER_DATA, userData);
                resolve(userData);
            }, 1000);
        });
    },

    logout: () => {
        storage.remove(STORAGE_KEYS.AUTH_TOKEN);
        storage.remove(STORAGE_KEYS.USER_DATA);
        window.location.href = '/';
    }
};

// Update auth button based on authentication status
function updateAuthButton() {
    const authButton = document.querySelector('.auth-button');
    if (authButton) {
        const isAuthenticated = auth.isAuthenticated();
        authButton.href = isAuthenticated ? '/pages/account.html' : '/pages/auth.html';
        const iconElement = authButton.querySelector('i');
        if (iconElement) {
            iconElement.setAttribute('data-lucide', isAuthenticated ? 'user-circle' : 'log-in');
            lucide.createIcons();
        }
    }
}

// Initialize shared elements
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    lucide.createIcons();

    // Update auth button
    updateAuthButton();

    // Setup mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            mobileMenu.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', !isExpanded);
        });
    }

    // Setup search functionality
    const searchToggle = document.querySelector('.search-toggle');
    if (searchToggle) {
        let searchOpen = false;
        searchToggle.addEventListener('click', () => {
            if (!searchOpen) {
                const searchForm = document.createElement('form');
                searchForm.className = 'search-form';
                searchForm.setAttribute('role', 'search');
                searchForm.setAttribute('aria-label', 'Wyszukiwanie filmów');
                searchForm.innerHTML = `
                    <label for="search-input" class="sr-only">Wyszukaj film</label>
                    <input type="search" id="search-input" placeholder="Wyszukaj film..." class="search-input" aria-label="Wpisz tytuł filmu do wyszukania">
                    <button type="button" class="search-close" aria-label="Zamknij wyszukiwarkę">
                        <i data-lucide="x"></i>
                    </button>
                `;

                document.querySelector('.navbar').appendChild(searchForm);
                lucide.createIcons();
                searchOpen = true;

                const searchInput = searchForm.querySelector('#search-input');
                searchInput.focus();

                // Add search functionality with debouncing
                let searchTimeout;
                searchInput.addEventListener('input', (e) => {
                    clearTimeout(searchTimeout);
                    const searchTerm = e.target.value.trim();
                    searchTimeout = setTimeout(() => {
                        performSearch(searchTerm, true); // Pass true for live search (limit results)
                    }, 300); // Debounce search by 300ms
                });

                // Handle search form submission
                searchForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const searchTerm = searchInput.value.trim();
                    if (searchTerm) {
                        // Redirect to movies page with search results (full search)
                        window.location.href = `Filmy.html?search=${encodeURIComponent(searchTerm)}`;
                    }
                });

                const closeButton = searchForm.querySelector('.search-close');
                closeButton.addEventListener('click', () => {
                    searchForm.remove();
                    searchOpen = false;
                    // Clear any search results
                    clearSearchResults();
                    // Return focus to search toggle
                    searchToggle.focus();
                });

                // Close search on Escape key
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && searchOpen) {
                        searchForm.remove();
                        searchOpen = false;
                        clearSearchResults();
                        // Return focus to search toggle
                        searchToggle.focus();
                    }
                });
            }
        });
    }
});

// Utility functions for session management
const SESSION_COOKIE_NAME = 'wfo_session';
const WATCHLIST_COOKIE_NAME = 'wfo_watchlist';

const session = {
    get: () => {
        const cookie = document.cookie
            .split('; ')
            .find(row => row.startsWith(`${SESSION_COOKIE_NAME}=`));

        if (cookie) {
            const cookieValue = cookie.split('=')[1];
            console.log('🍪 Raw cookie value in session.get():', cookieValue);

            // Your cookie is exactly: %7B%22id%22%3A6%2C%22login%22%3A%22Naterek%22...
            // This needs exactly ONE decodeURIComponent to become valid JSON
            try {
                const decodedValue = decodeURIComponent(cookieValue);
                console.log('🔓 Decoded cookie value:', decodedValue);
                const result = JSON.parse(decodedValue);
                console.log('✅ session.get() parse success:', result);
                return result;
            } catch (e) {
                console.log('❌ session.get() failed with single decode:', e.message);

                // Fallback methods if single decode fails
                const decodeMethods = [
                    { name: 'Double decode', fn: () => JSON.parse(decodeURIComponent(decodeURIComponent(cookieValue))) },
                    { name: 'No decode', fn: () => JSON.parse(cookieValue) },
                    { name: 'Unescape', fn: () => JSON.parse(unescape(cookieValue)) }
                ];

                for (let i = 0; i < decodeMethods.length; i++) {
                    try {
                        const result = decodeMethods[i].fn();
                        console.log(`✅ session.get() ${decodeMethods[i].name} success:`, result);
                        return result;
                    } catch (e2) {
                        console.log(`❌ session.get() ${decodeMethods[i].name} failed:`, e2.message);
                    }
                }
            }
        }
        return null;
    },

    set: (data) => {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7);
        document.cookie = `${SESSION_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(data))}; expires=${expiryDate.toUTCString()}; path=/`;
    },

    remove: () => {
        document.cookie = `${SESSION_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    },

    isAuthenticated: () => {
        return !!session.get();
    }
};


const watchlist = {
    get: () => {
        const cookie = document.cookie
            .split('; ')
            .find(row => row.startsWith(`${WATCHLIST_COOKIE_NAME}=`));

        if (cookie) {
            return JSON.parse(decodeURIComponent(cookie.split('=')[1]));
        }
        return [];
    },

    set: (movieIds) => {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 365); // Store for 1 year
        document.cookie = `${WATCHLIST_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(movieIds))}; expires=${expiryDate.toUTCString()}; path=/`;
    },

    add: (movieId) => {
        const currentList = watchlist.get();
        if (!currentList.includes(movieId)) {
            currentList.push(movieId);
            watchlist.set(currentList);
        }
    },

    remove: (movieId) => {
        const currentList = watchlist.get();
        const newList = currentList.filter(id => id !== movieId);
        watchlist.set(newList);
    },

    isInWatchlist: (movieId) => {
        return watchlist.get().includes(movieId);
    }
};

// Update UI based on authentication status
const updateAuthUI = () => {
    const userInfo = document.querySelector('.user-info');
    const loginButton = document.querySelector('.login-button');
    const logoutBtn = document.getElementById('logoutBtn');
    const userLoginSpan = document.querySelector('.user-login');

    if (session.isAuthenticated()) {
        const userData = session.get();
        if (loginButton) {
            loginButton.style.display = 'none';
        }
        if (logoutBtn) {
            logoutBtn.style.display = 'block';
        }
        if (userLoginSpan) {
            userLoginSpan.textContent = userData.login;
        }
    } else {
        if (loginButton) {
            loginButton.style.display = 'block';
        }
        if (logoutBtn) {
            logoutBtn.style.display = 'none';
        }
        if (userLoginSpan) {
            userLoginSpan.textContent = '';
        }
    }
};

// Search functionality
async function performSearch(searchTerm, isLiveSearch = false) {
    if (!searchTerm) {
        clearSearchResults();
        return;
    }

    console.log('Searching for:', searchTerm, 'Live search:', isLiveSearch);

    try {
        let url = `movies_api.php?searchTerm=${encodeURIComponent(searchTerm)}`;
        if (isLiveSearch) {
            url += `&limit=5`; // Limit results for live search dropdown
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.success && data.movies) {
            // Show search results dropdown if we're not on movies page
            if (!window.location.pathname.includes('Filmy.html')) {
                showSearchDropdown(searchTerm, data.movies);
            }
        } else {
            console.error('Search API returned an error:', data.error);
            if (!window.location.pathname.includes('Filmy.html')) {
                showSearchDropdown(searchTerm, []); // Show no results
            }
        }
    } catch (error) {
        console.error('Error during search:', error);
        if (!window.location.pathname.includes('Filmy.html')) {
            showSearchDropdown(searchTerm, []); // Show no results on error
        }
    }
}

function showSearchDropdown(searchTerm, searchResults) {
    // Remove existing search results
    clearSearchResults();

    const searchDropdown = document.createElement('div');
    searchDropdown.className = 'search-dropdown';
    searchDropdown.setAttribute('role', 'listbox');
    searchDropdown.setAttribute('aria-label', 'Wyniki wyszukiwania');

    if (searchResults.length > 0) {
        searchDropdown.innerHTML = `
            <div class="search-results">
                <div class="search-results-header">
                    <span>Wyniki wyszukiwania (${searchResults.length})</span>
                </div>
                ${searchResults.map((movie) => {
                    // Find the original index in the global movies array if it exists
                    // This is important for setupMovieOverlay to work correctly
                    const originalIndex = window.movies ? window.movies.findIndex(m => m.id === movie.id) : -1;
                    return `
                        <div class="search-result-item" data-movie-id="${originalIndex !== -1 ? originalIndex : movie.id}" data-movie-db-id="${movie.id}" role="option" tabindex="0" aria-label="Film ${movie.title}, ${movie.year}, ocena ${movie.rating}">
                            <img src="${movie.imageUrl}" alt="Plakat filmu ${movie.title}" class="search-result-poster">
                            <div class="search-result-info">
                                <h4 class="search-result-title">${movie.title}</h4>
                                <p class="search-result-meta">${movie.year} • ${movie.rating}</p>
                                <p class="search-result-genre">${movie.genre}</p>
                            </div>
                        </div>
                    `;
                }).join('')}
                <div class="search-results-footer">
                    <a href="Filmy.html?search=${encodeURIComponent(searchTerm)}" class="view-all-results">
                        Zobacz wszystkie wyniki
                    </a>
                </div>
            </div>
        `;

        document.querySelector('.navbar').appendChild(searchDropdown);

        // Add click handlers for search results
        searchDropdown.querySelectorAll('.search-result-item').forEach(item => {
            const handleItemActivation = () => {
                const movieId = parseInt(item.dataset.movieId); // This is the index in window.movies
                const movieDbId = parseInt(item.dataset.movieDbId); // This is the actual DB ID

                // Clear search results and form
                clearSearchResults();
                const searchForm = document.querySelector('.search-form');
                if (searchForm) {
                    searchForm.remove();
                }

                // Trigger movie overlay if setupMovieOverlay function exists and we have movies
                // Use the movie object directly from searchResults if window.movies is not fully loaded or doesn't contain it
                const movieData = window.movies && window.movies[movieId] && window.movies[movieId].id === movieDbId ? window.movies[movieId] : searchResults.find(m => m.id === movieDbId);

                if (typeof setupMovieOverlay === 'function' && movieData) {
                    // Remove existing overlay if present
                    const existingOverlay = document.querySelector('.movie-details-overlay');
                    if (existingOverlay) {
                        existingOverlay.remove();
                    }

                    // Create overlay directly
                    const inWatchlist = typeof isInWatchlist === 'function' ? isInWatchlist(movieId) : false; // Use original index for watchlist check

                    const overlay = document.createElement('div');
                    overlay.className = 'movie-details-overlay';
                    overlay.setAttribute('role', 'dialog');
                    overlay.setAttribute('aria-modal', 'true');
                    overlay.setAttribute('aria-labelledby', 'search-movie-details-title');

                    overlay.innerHTML = `
                        <div class="movie-details-content" data-movie-id="${movieId}" data-movie-db-id="${movieDbId}">
                            <button class="movie-details-close" aria-label="Zamknij szczegóły filmu">
                                <i data-lucide="x"></i>
                            </button>
                            <div class="movie-details-header">
                                <img src="${movieData.imageUrl}" alt="Plakat filmu ${movieData.title}" class="movie-details-poster">
                                <div class="movie-details-info">
                                    <h1 id="search-movie-details-title" class="movie-details-title">${movieData.title}</h1>
                                    <div class="movie-details-meta">
                                        <span class="movie-details-genre">${movieData.genre}</span>
                                        <span class="movie-details-rating">
                                            <i data-lucide="star" class="star-icon"></i>
                                            <span>${movieData.rating}</span>
                                        </span>
                                    </div>
                                    <p class="movie-details-description">${movieData.description}</p>
                                    <div class="movie-details-actions">
                                        <a href="player.html?id=${movieId}" class="btn btn-primary play-button" aria-label="Odtwórz film ${movieData.title}">
                                            <i data-lucide="play"></i>
                                            <span>Odtwórz film</span>
                                        </a>
                                        <button class="btn ${inWatchlist ? 'btn-primary' : 'btn-secondary'} watchlist-button" aria-label="${inWatchlist ? 'Usuń z listy do obejrzenia' : 'Dodaj do listy do obejrzenia'}">
                                            <i data-lucide="${inWatchlist ? 'check' : 'plus'}"></i>
                                            <span>${inWatchlist ? 'Usuń z listy' : 'Dodaj do listy'}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;

                    document.body.appendChild(overlay);
                    lucide.createIcons();

                    // Show overlay with animation
                    requestAnimationFrame(() => {
                        overlay.classList.add('active');
                    });

                    // Focus the close button for keyboard users
                    const closeButton = overlay.querySelector('.movie-details-close');
                    closeButton.focus();

                    // Setup close functionality
                    closeButton.addEventListener('click', () => {
                        overlay.classList.remove('active');
                        setTimeout(() => {
                            overlay.remove();
                            // Return focus to search toggle
                            const searchToggle = document.querySelector('.search-toggle');
                            if (searchToggle) searchToggle.focus();
                        }, 300);
                    });

                    // Close on escape or click outside
                    const closeOverlay = () => {
                        overlay.classList.remove('active');
                        setTimeout(() => {
                            overlay.remove();
                            // Return focus to search toggle
                            const searchToggle = document.querySelector('.search-toggle');
                            if (searchToggle) searchToggle.focus();
                        }, 300);
                    };

                    overlay.addEventListener('click', (e) => {
                        if (e.target === overlay) closeOverlay();
                    });

                    document.addEventListener('keydown', function escHandler(e) {
                        if (e.key === 'Escape') {
                            closeOverlay();
                            document.removeEventListener('keydown', escHandler);
                        }
                    });

                    // Setup watchlist button
                    const watchlistButton = overlay.querySelector('.watchlist-button');
                    if (watchlistButton && typeof addToWatchlist === 'function' && typeof removeFromWatchlist === 'function') {
                        watchlistButton.onclick = async (e) => {
                            e.preventDefault();
                            // Use the original index for watchlist functions
                            if (await isInWatchlist(movieId)) {
                                await removeFromWatchlist(movieId);
                            } else {
                                await addToWatchlist(movieId);
                            }
                            // Re-render the button state after action
                            const updatedInWatchlist = await isInWatchlist(movieId);
                            watchlistButton.className = `btn ${updatedInWatchlist ? 'btn-primary' : 'btn-secondary'} watchlist-button`;
                            watchlistButton.setAttribute('aria-label', updatedInWatchlist ? 'Usuń z listy do obejrzenia' : 'Dodaj do listy do obejrzenia');
                            watchlistButton.innerHTML = `
                                <i data-lucide="${updatedInWatchlist ? 'check' : 'plus'}"></i>
                                <span>${updatedInWatchlist ? 'Usuń z listy' : 'Dodaj do listy'}</span>
                            `;
                            lucide.createIcons();
                            // Also update the main watchlist UI if on that page
                            if (window.location.pathname.includes('Lista do obejrzenia.html')) {
                                updateWatchlistUI();
                            }
                        };
                    }
                } else {
                    // Redirect to player page if overlay not available or movieData is missing
                    window.location.href = `player.html?id=${movieId}`;
                }
            };

            // Add both click and keyboard event listeners
            item.addEventListener('click', handleItemActivation);
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleItemActivation();
                }
            });
        });
    } else {
        searchDropdown.innerHTML = `
            <div class="search-results">
                <div class="search-no-results">
                    <p>Nie znaleziono filmów dla: "${searchTerm}"</p>
                </div>
            </div>
        `;
        document.querySelector('.navbar').appendChild(searchDropdown);
    }
}

function clearSearchResults() {
    const existingDropdown = document.querySelector('.search-dropdown');
    if (existingDropdown) {
        existingDropdown.remove();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();

    // Handle logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            session.remove();
            window.location.href = 'index.html';
        });
    }
});

// --- Config --- //
var cookiePopupTitle = "Cookies."; // Tytuł okna
var cookiePopupDesc = "Ta strona wykorzystuje pliki cookie do przechowywania listy filmów do obejrzenia i poprawy funkcjonalności serwisu."; // Treść komunikatu
var cookiePopupLink = '<a href="polityka-prywatnosci.html" target="_blank">Dowiedz się więcej</a>'; // Link do polityki prywatności
var cookiePopupButton = "Ok!"; // Tekst przycisku

// --- Demo functions removed --- //

function pureFadeIn(elem, display){
  var el = document.getElementById(elem);
  el.style.opacity = 0;
  el.style.display = display || "block";

  (function fade() {
    var val = parseFloat(el.style.opacity);
    if (!((val += .02) > 1)) {
      el.style.opacity = val;
      requestAnimationFrame(fade);
    }
  })();
};
function pureFadeOut(elem){
  var el = document.getElementById(elem);
  el.style.opacity = 1;

  (function fade() {
    if ((el.style.opacity -= .02) < 0) {
      el.style.display = "none";
    } else {
      requestAnimationFrame(fade);
    }
  })();
};

function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
function eraseCookie(name) {
    document.cookie = name+'=; Max-Age=-99999999;';
}

function cookiePopupBox() {
  if (!getCookie('cookiePopupDismiss')) {
    document.body.innerHTML += '<div class="cookiePopupBoxContainer" id="cookiePopupBoxContainer"><div class="cookieTitle"><a>' + cookiePopupTitle + '</a></div><div class="cookieDesc"><p>' + cookiePopupDesc + ' ' + cookiePopupLink + '</p></div><div class="cookieButton"><a onClick="cookiePopupDismiss();">' + cookiePopupButton + '</a></div></div>';
        pureFadeIn("cookiePopupBoxContainer");
  }
}

function cookiePopupDismiss() {
  setCookie('cookiePopupDismiss','1',7);
  pureFadeOut("cookiePopupBoxContainer");
}

window.onload = function() { cookiePopupBox(); };

// Test function for the specific cookie issue
window.testCookieDecoding = function() {
    const testCookie = "%7B%22id%22%3A6%2C%22login%22%3A%22Naterek%22%2C%22email%22%3A%22bres.maksymilian%40wp.pl%22%7D";
    console.log('🧪 Testing cookie decoding with your exact cookie value:');
    console.log('Raw:', testCookie);

    try {
        const decoded = decodeURIComponent(testCookie);
        console.log('✅ Decoded:', decoded);
        const parsed = JSON.parse(decoded);
        console.log('✅ Parsed:', parsed);
        return parsed;
    } catch (e) {
        console.log('❌ Failed:', e.message);
        return null;
    }
};
