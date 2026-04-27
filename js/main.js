// ==============================
// VIBE DATA
// Each vibe has a name, emoji, and playlist embed URL for music
// Movie genres are mapped by vibe name in the TMDB fetch function
// ==============================
const vibes = [
    { name: "Cozy", emoji: "🛋️", color: "#e8a87c", playlist: "https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWSpwq3LiO" },
    { name: "Hype", emoji: "🔥", color: "#ff4d4d", playlist: "https://open.spotify.com/embed/playlist/37i9dQZF1DWUa8ZRTfalHk" },
    { name: "Sad Girl", emoji: "🌧️", color: "#7eb8d4", playlist: "https://open.spotify.com/embed/playlist/37i9dQZF1DX3YSRoSdA634" },
    { name: "Adventurous", emoji: "🌍", color: "#6dbf8b", playlist: "https://open.spotify.com/embed/playlist/37i9dQZF1DXdLEN7aqioXM" },
    { name: "Romantic", emoji: "🌹", color: "#e88ea0", playlist: "https://open.spotify.com/embed/playlist/37i9dQZF1DWThIs101DNtS" },
    { name: "Chill", emoji: "😌", color: "#a78bdb", playlist: "https://open.spotify.com/embed/playlist/37i9dQZF1DX4WYpdgoIcn6" }
];

// Movie genre IDs from TMDB that match each vibe
const vibeToGenre = {
    "Cozy":        35,  // Comedy
    "Hype":        28,  // Action
    "Sad Girl":    18,  // Drama
    "Adventurous": 12,  // Adventure
    "Romantic":    10749, // Romance
    "Chill":       16   // Animation
};

// Your TMDB API key
const TMDB_API_KEY = "7201d2d2d9f4414978a54d3d6ff96061";

// Keeps track of which vibe the user selected
let selectedVibe = null;

// ==============================
// PAGE NAVIGATION
// Hides all pages, then shows the one requested
// ==============================
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });
    document.getElementById('page-' + pageId).classList.remove('hidden');
}

// ==============================
// BUILD THE VIBE GRID ON LOAD
// Creates a button for each vibe and adds it to the page
// ==============================
function buildVibeGrid() {
    const grid = document.getElementById('vibe-grid');

    vibes.forEach(vibe => {
        const btn = document.createElement('button');
        btn.classList.add('vibe-btn');
        btn.textContent = vibe.emoji + ' ' + vibe.name;

        // When clicked, store the selected vibe and show the mode selector
        btn.onclick = () => {
    selectedVibe = vibe;

    // Remove selected class from all buttons
    document.querySelectorAll('.vibe-btn').forEach(b => {
        b.classList.remove('selected');
        b.style.borderColor = '#333';
    });

    // Highlight selected button with vibe color
    btn.classList.add('selected');
    btn.style.borderColor = vibe.color;
    btn.style.color = vibe.color;

    // Apply vibe color to the logo and nav border
    document.querySelector('.logo').style.color = vibe.color;
    document.querySelector('nav').style.borderBottomColor = vibe.color;

    document.getElementById('mode-selector').classList.remove('hidden');
};

        grid.appendChild(btn);
    });
}

// ==============================
// LOAD RESULTS
// Called when user picks Movies or Music
// ==============================
function loadResults(mode) {
    showPage('results');

    if (mode === 'movies') {
        fetchMovies();
    } else {
        showMusic();
    }
}

// ==============================
// FETCH MOVIES FROM TMDB
// Uses the vibe's genre ID to get matching movies
// ==============================
async function fetchMovies() {
    document.getElementById('results-title').style.color = selectedVibe.color;
    const genre = vibeToGenre[selectedVibe.name];
    const url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genre}&sort_by=popularity.desc`;

    document.getElementById('results-title').textContent = selectedVibe.emoji + ' ' + selectedVibe.name + ' Movies';
    document.getElementById('results-grid').innerHTML = '<p>Loading...</p>';

    try {
        const response = await fetch(url);
        const data = await response.json();
        displayMovies(data.results);
    } catch (error) {
        document.getElementById('results-grid').innerHTML = '<p>Something went wrong. Please try again.</p>';
    }
}

// ==============================
// DISPLAY MOVIES
// Renders movie cards from TMDB results
// ==============================
function displayMovies(movies) {
    const grid = document.getElementById('results-grid');
    grid.innerHTML = '';

    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(160px, 1fr))';
    grid.style.gap = '20px';

    movies.slice(0, 12).forEach(movie => {
        const card = document.createElement('div');
        card.classList.add('movie-card');

        const img = document.createElement('img');
        img.src = `https://image.tmdb.org/t/p/w300${movie.poster_path}`;
        img.alt = movie.title;

        const title = document.createElement('h3');
        title.textContent = movie.title;

        const year = document.createElement('p');
        year.textContent = movie.release_date.slice(0, 4);

        const btn = document.createElement('button');
        btn.textContent = '+ Watchlist';

        // Attach click handler directly instead of using onclick in HTML
        btn.addEventListener('click', () => {
            saveToWatchlist(movie.id, movie.title, movie.poster_path);
        });

        card.appendChild(img);
        card.appendChild(title);
        card.appendChild(year);
        card.appendChild(btn);
        grid.appendChild(card);
    });
}

// ==============================
// SHOW MUSIC
// Embeds the Spotify playlist for the selected vibe
// ==============================
function showMusic() {
    document.getElementById('results-title').style.color = selectedVibe.color;
    document.getElementById('results-title').textContent = selectedVibe.emoji + ' ' + selectedVibe.name + ' Playlist';

    const grid = document.getElementById('results-grid');
    grid.style.display = 'block';
    grid.style.width = '100%';

    grid.innerHTML = `
        <iframe 
            src="${selectedVibe.playlist}"
            width="100%" 
            height="480" 
            frameborder="0" 
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            style="width: 100%; min-width: 300px; border-radius: 12px;">
        </iframe>
    `;
}

// ==============================
// SAVE TO WATCHLIST
// Stores a movie in localStorage
// ==============================
function saveToWatchlist(id, title, poster) {
    const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

    if (watchlist.find(m => m.id === id)) {
        alert(`${title} is already in your watchlist!`);
        return;
    }

    watchlist.push({ id, title, poster });
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    alert(`${title} added to your watchlist!`);
}

// ==============================
// DISPLAY WATCHLIST
// Reads from localStorage and renders saved movies
// ==============================
function displayWatchlist() {
    const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    const grid = document.getElementById('watchlist-grid');
    grid.innerHTML = '';

    if (watchlist.length === 0) {
        grid.innerHTML = '<p>No movies saved yet. Go find something to watch!</p>';
        return;
    }

    watchlist.forEach(movie => {
        const card = document.createElement('div');
        card.classList.add('movie-card');
        card.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w300${movie.poster}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <button onclick="removeFromWatchlist(${movie.id})">Remove</button>
        `;
        grid.appendChild(card);
    });
}

// ==============================
// REMOVE FROM WATCHLIST
// Deletes a movie from localStorage by ID
// ==============================
function removeFromWatchlist(id) {
    let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    watchlist = watchlist.filter(m => m.id !== id);
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    displayWatchlist();
}

// ==============================
// ON PAGE LOAD
// ==============================
buildVibeGrid();

// Load saved theme preference
if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
    document.getElementById('theme-toggle').textContent = '🌙 Dark Mode';
}

document.querySelector('a[onclick="showPage(\'watchlist\')"]').addEventListener('click', displayWatchlist);

// ==============================
// THEME TOGGLE
// Switches between dark and light mode
// ==============================
function toggleTheme() {
    const body = document.body;
    const btn = document.getElementById('theme-toggle');

    body.classList.toggle('light-mode');

    // Update button label based on current mode
    if (body.classList.contains('light-mode')) {
        btn.textContent = '🌙 Dark Mode';
    } else {
        btn.textContent = '☀️ Light Mode';
    }

    // Save preference to localStorage
    localStorage.setItem('theme', body.classList.contains('light-mode') ? 'light' : 'dark');
}
// ==============================
// GO BACK
// Returns user to home page and resets mode selector
// ==============================
function goBack() {
    showPage('home');
    document.getElementById('mode-selector').classList.add('hidden');
}