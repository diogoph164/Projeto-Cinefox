// ==============================
// DADOS INICIAIS DO CINEFOX
// ==============================

const movies = [
    {
        id: 1,
        title: "A Última Sessão",
        year: 2026,
        genre: "Drama",
        rating: 8.7,
        description: "Um drama sobre escolhas, memórias e a relação entre pessoas que compartilham uma última sessão de cinema."
    },
    {
        id: 2,
        title: "Horizonte Azul",
        year: 2025,
        genre: "Aventura",
        rating: 8.4,
        description: "Uma aventura em busca de um novo horizonte, passando por lugares e desafios inesperados."
    },
    {
        id: 3,
        title: "Código Perdido",
        year: 2026,
        genre: "Suspense",
        rating: 9.1,
        description: "Um código misterioso coloca um grupo de personagens diante de uma descoberta que pode mudar tudo."
    },
    {
        id: 4,
        title: "Depois da Meia-Noite",
        year: 2025,
        genre: "Terror",
        rating: 8.2,
        description: "Uma história de suspense e terror que começa quando as luzes da cidade se apagam."
    }
];

const series = [
    {
        title: "Cidade Invisível",
        genre: "Fantasia",
        rating: 9.0
    },
    {
        title: "Arquivo 77",
        genre: "Mistério",
        rating: 8.8
    },
    {
        title: "Além do Tempo",
        genre: "Ficção",
        rating: 8.6
    },
    {
        title: "Noite Sem Fim",
        genre: "Suspense",
        rating: 8.5
    },
    {
        title: "Entre Mundos",
        genre: "Aventura",
        rating: 8.3
    }
];

// Dá identificadores às séries para que comentários e avaliações funcionem nelas também.
series.forEach((serie, index) => {
    serie.id = 100 + index;
    serie.year = 2026;
    serie.description = serie.description || `Conheça a história de ${serie.title}, uma série de ${serie.genre.toLowerCase()}.`;
});

// Carrega as obras cadastradas na página própria. O localStorage compartilha os dados
// entre as páginas quando o projeto é aberto pela mesma origem (por exemplo, Live Server).
let submittedWorks = [];
try {
    submittedWorks = JSON.parse(localStorage.getItem("cinefoxSubmittedWorks") || "[]");
} catch (error) {
    console.warn("Não foi possível ler as obras salvas do Cinefox.", error);
}
submittedWorks.forEach(work => {
    if (work.type === "series") {
        if (!series.some(item => item.id === work.id)) series.push(work);
    } else {
        if (!movies.some(item => item.id === work.id)) movies.push(work);
    }
});

// ==============================
// ELEMENTOS DO HTML
// ==============================

const movieGrid = document.getElementById("movieGrid");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const emptyMessage = document.getElementById("emptyMessage");

const moviesTrack = document.getElementById("moviesTrack");
const moviesPrevBtn = document.getElementById("moviesPrevBtn");
const moviesNextBtn = document.getElementById("moviesNextBtn");

const seriesTrack = document.getElementById("seriesTrack");
const seriesPrevBtn = document.getElementById("seriesPrevBtn");
const seriesNextBtn = document.getElementById("seriesNextBtn");

const movieModal = document.getElementById("movieModal");
const modalBody = document.getElementById("modalBody");
const modalClose = document.getElementById("modalClose");

const commentsList = document.getElementById("commentsList");
const commentCount = document.getElementById("commentCount");
const commentInput = document.getElementById("commentInput");
const submitComment = document.getElementById("submitComment");
const starButtons = document.querySelectorAll("#starRating button");
const commentFields = document.getElementById("commentFields");
const loginRequired = document.getElementById("loginRequired");
const loginFromComment = document.getElementById("loginFromComment");

const authModal = document.getElementById("authModal");
const authClose = document.getElementById("authClose");
const authForm = document.getElementById("authForm");
const authTitle = document.getElementById("authTitle");
const authName = document.getElementById("authName");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const authSubmit = document.getElementById("authSubmit");
const authSwitch = document.getElementById("authSwitch");
const authMessage = document.getElementById("authMessage");
const nameLabel = document.getElementById("nameLabel");
const loginHeaderBtn = document.getElementById("loginHeaderBtn");
const userStatus = document.getElementById("userStatus");

let selectedMovieId = null;
let selectedRating = 0;
let authMode = "login";

// Cada carrossel tem sua própria posição
const carouselState = {
    movies: 0,
    series: 0
};

// ==============================
// DADOS
// ==============================

const trendingMovies = [...movies];

const trendingSeries = [...series,
    {
        id: 200,
        title: "Código 404",
        year: 2026,
        genre: "Ficção",
        rating: 8.1,
        description: "Uma investigação tecnológica revela um mistério inesperado."
    },
    {
        id: 201,
        title: "O Último Sinal",
        year: 2026,
        genre: "Drama",
        rating: 8.0,
        description: "Uma mensagem inesperada muda o rumo da vida dos personagens."
    }
];

// ==============================
// LOGIN
// ==============================

function getCurrentUser() {
    return JSON.parse(localStorage.getItem("cinefoxCurrentUser"));
}

function getUsers() {
    return JSON.parse(localStorage.getItem("cinefoxUsers")) || [];
}

function updateUserStatus() {
    const user = getCurrentUser();

    if (user) {
        userStatus.textContent = `Olá, ${user.name}`;
        loginHeaderBtn.textContent = "Sair";
    } else {
        userStatus.textContent = "";
        loginHeaderBtn.textContent = "Entrar";
    }

    updateCommentArea();
}

function openAuth(mode = "login") {
    authMode = mode;
    authMessage.textContent = "";

    if (authMode === "register") {
        authTitle.textContent = "Criar conta";
        authSubmit.textContent = "Criar conta";
        authSwitch.textContent = "Já tenho uma conta";
        authName.classList.remove("hidden");
        nameLabel.classList.remove("hidden");
        authName.required = true;
    } else {
        authTitle.textContent = "Entrar";
        authSubmit.textContent = "Entrar";
        authSwitch.textContent = "Ainda não tenho conta";
        authName.classList.add("hidden");
        nameLabel.classList.add("hidden");
        authName.required = false;
    }

    authModal.classList.remove("hidden");
}

function closeAuth() {
    authModal.classList.add("hidden");
    authForm.reset();
    authMessage.textContent = "";
}

loginHeaderBtn.addEventListener("click", () => {
    if (getCurrentUser()) {
        localStorage.removeItem("cinefoxCurrentUser");
        updateUserStatus();
    } else {
        openAuth("login");
    }
});

authClose.addEventListener("click", closeAuth);

authSwitch.addEventListener("click", () => {
    openAuth(authMode === "login" ? "register" : "login");
});

authForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = authEmail.value.trim().toLowerCase();
    const password = authPassword.value;

    if (authMode === "register") {
        const name = authName.value.trim();
        const users = getUsers();

        if (!name) {
            authMessage.textContent = "Digite seu nome.";
            return;
        }

        if (users.some(user => user.email === email)) {
            authMessage.textContent = "Esse e-mail já está cadastrado.";
            return;
        }

        users.push({ name, email, password });

        localStorage.setItem("cinefoxUsers", JSON.stringify(users));
        localStorage.setItem(
            "cinefoxCurrentUser",
            JSON.stringify({ name, email })
        );

        closeAuth();
        updateUserStatus();

    } else {
        const users = getUsers();

        const user = users.find(
            user => user.email === email && user.password === password
        );

        if (!user) {
            authMessage.textContent = "E-mail ou senha incorretos.";
            return;
        }

        localStorage.setItem(
            "cinefoxCurrentUser",
            JSON.stringify({
                name: user.name,
                email: user.email
            })
        );

        closeAuth();
        updateUserStatus();
    }
});

loginFromComment.addEventListener("click", () => openAuth("login"));

// ==============================
// FILMES
// ==============================

function renderMovies(list) {
    movieGrid.innerHTML = "";

    if (list.length === 0) {
        emptyMessage.style.display = "block";
        return;
    }

    emptyMessage.style.display = "none";

    list.forEach((movie, index) => {
        const card = document.createElement("article");
        card.classList.add("movie-card");

        card.innerHTML = `
            <div class="poster poster-${(index % 4) + 1}" ${movie.image ? `style="background-image: linear-gradient(0deg, rgba(0,0,0,.58), rgba(0,0,0,.05)), url('${escapeHTML(movie.image)}'); background-size: cover; background-position: center;"` : ""}>
                <span class="poster-title">${escapeHTML(movie.title)}</span>
            </div>

            <div class="card-info">
                <h3>${escapeHTML(movie.title)}</h3>

                <div class="card-meta">
                    <span>${escapeHTML(String(movie.year))} • ${escapeHTML(movie.genre)}</span>
                    <span class="rating">★ ${getMovieRating(movie.id, movie.rating)}</span>
                </div>

                <button class="favorite-btn" data-id="${movie.id}">
                    ♡ Favoritar
                </button>
            </div>
        `;

        card.addEventListener("click", (event) => {
            if (!event.target.classList.contains("favorite-btn")) {
                openMovieModal(movie);
            }
        });

        const favoriteButton = card.querySelector(".favorite-btn");

        if (isFavorite(movie.id)) {
            favoriteButton.classList.add("active");
            favoriteButton.textContent = "♥ Favoritado";
        }

        favoriteButton.addEventListener("click", (event) => {
            event.stopPropagation();
            toggleFavorite(movie.id, favoriteButton);
        });

        movieGrid.appendChild(card);
    });
}

function searchMovies() {
    const term = searchInput.value.toLowerCase().trim();

    const filteredMovies = movies.filter(movie =>
        movie.title.toLowerCase().includes(term) ||
        movie.genre.toLowerCase().includes(term)
    );

    renderMovies(filteredMovies);
}

searchBtn.addEventListener("click", searchMovies);
searchInput.addEventListener("input", searchMovies);

// ==============================
// FAVORITOS
// ==============================

function isFavorite(movieId) {
    const favorites =
        JSON.parse(localStorage.getItem("cinefoxFavorites")) || [];

    return favorites.includes(movieId);
}

function toggleFavorite(movieId, button) {
    const favorites =
        JSON.parse(localStorage.getItem("cinefoxFavorites")) || [];

    if (favorites.includes(movieId)) {
        localStorage.setItem(
            "cinefoxFavorites",
            JSON.stringify(favorites.filter(id => id !== movieId))
        );

        button.classList.remove("active");
        button.textContent = "♡ Favoritar";
    } else {
        favorites.push(movieId);

        localStorage.setItem(
            "cinefoxFavorites",
            JSON.stringify(favorites)
        );

        button.classList.add("active");
        button.textContent = "♥ Favoritado";
    }
}

// ==============================
// MODELO DO FILME
// ==============================

function openMovieModal(movie) {
    selectedMovieId = movie.id;
    selectedRating = 0;

    modalBody.innerHTML = `
        <p class="section-label">${escapeHTML(movie.genre || "Sem gênero")}</p>
        <h2>${escapeHTML(movie.title)}</h2>
        <p><strong>Ano:</strong> ${escapeHTML(String(movie.year || "Não informado"))}</p>
        <p><strong>Avaliação da comunidade:</strong>
            ⭐ ${getMovieRating(movie.id, movie.rating)}
        </p>
        <p><strong>Sinopse:</strong> ${escapeHTML(movie.description || "Sinopse não informada.")}</p>
        ${movie.director ? `<p><strong>Direção/criação:</strong> ${escapeHTML(movie.director)}</p>` : ""}
    `;

    resetStars();
    renderComments();
    updateCommentArea();

    movieModal.classList.remove("hidden");
}

function closeMovieModal() {
    movieModal.classList.add("hidden");
    selectedMovieId = null;
}

modalClose.addEventListener("click", closeMovieModal);

movieModal.addEventListener("click", event => {
    if (event.target === movieModal) {
        closeMovieModal();
    }
});

// ==============================
// ESTRELAS
// ==============================

starButtons.forEach(button => {
    button.addEventListener("mouseenter", () => {
        highlightStars(Number(button.dataset.rating));
    });

    button.addEventListener("click", () => {
        selectedRating = Number(button.dataset.rating);
        highlightStars(selectedRating);
    });
});

document.getElementById("starRating").addEventListener("mouseleave", () => {
    highlightStars(selectedRating);
});

function highlightStars(rating) {
    starButtons.forEach(button => {
        button.classList.toggle(
            "selected",
            Number(button.dataset.rating) <= rating
        );
    });
}

function resetStars() {
    selectedRating = 0;
    highlightStars(0);
}

// ==============================
// COMENTÁRIOS
// ==============================

function getComments() {
    return JSON.parse(localStorage.getItem("cinefoxComments")) || {};
}

function renderComments() {
    const comments = getComments();
    const movieComments = comments[selectedMovieId] || [];

    commentsList.innerHTML = "";

    commentCount.textContent =
        `${movieComments.length} comentário${movieComments.length !== 1 ? "s" : ""}`;

    if (movieComments.length === 0) {
        commentsList.innerHTML = `
            <div class="no-comments">
                Ainda não existem comentários para este filme.
                Seja o primeiro a comentar!
            </div>
        `;
        return;
    }

    movieComments.forEach(comment => {
        const element = document.createElement("article");
        element.classList.add("comment");

        element.innerHTML = `
            <div class="comment-top">
                <span class="comment-author">${escapeHTML(comment.name)}</span>
                <span class="comment-date">${comment.date}</span>
            </div>

            <div class="comment-stars">
                ${"★".repeat(comment.rating)}${"☆".repeat(5 - comment.rating)}
            </div>

            <p class="comment-text">${escapeHTML(comment.text)}</p>
        `;

        commentsList.appendChild(element);
    });
}

function updateCommentArea() {
    if (getCurrentUser()) {
        commentFields.classList.remove("hidden");
        loginRequired.classList.add("hidden");
    } else {
        commentFields.classList.add("hidden");
        loginRequired.classList.remove("hidden");
    }
}

submitComment.addEventListener("click", () => {
    const user = getCurrentUser();
    const text = commentInput.value.trim();

    if (!user) {
        openAuth("login");
        return;
    }

    if (selectedRating === 0) {
        alert("Escolha uma nota de 1 a 5 estrelas.");
        return;
    }

    if (!text) {
        alert("Escreva um comentário antes de publicar.");
        return;
    }

    const comments = getComments();

    if (!comments[selectedMovieId]) {
        comments[selectedMovieId] = [];
    }

    comments[selectedMovieId].push({
        name: user.name,
        rating: selectedRating,
        text,
        date: new Date().toLocaleDateString("pt-BR")
    });

    localStorage.setItem("cinefoxComments", JSON.stringify(comments));

    commentInput.value = "";
    resetStars();

    renderComments();
    updateMovieCardsRating();
});

function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function getMovieRating(movieId, defaultRating) {
    const comments = getComments()[movieId] || [];

    if (comments.length === 0) {
        return defaultRating;
    }

    const total = comments.reduce(
        (sum, comment) => sum + comment.rating,
        0
    );

    return (total / comments.length).toFixed(1);
}

function updateMovieCardsRating() {
    searchMovies();
}

// ==============================
// CARROSSEL GENÉRICO
// ==============================

function setupCarousel(track, prevButton, nextButton, totalItems, stateKey) {
    function getVisibleCards() {
        if (window.innerWidth <= 600) return 1;
        if (window.innerWidth <= 900) return 2;
        return 3;
    }

    function update() {
        const visible = getVisibleCards();
        const maxPosition = Math.max(0, totalItems - visible);

        carouselState[stateKey] = Math.min(
            carouselState[stateKey],
            maxPosition
        );

        const cards = track.children;

        if (!cards.length) return;

        const gap = 18;
        const cardWidth = cards[0].getBoundingClientRect().width;
        const move = cardWidth + gap;

        track.style.transform =
            `translateX(-${carouselState[stateKey] * move}px)`;

        prevButton.disabled = carouselState[stateKey] === 0;
        nextButton.disabled =
            carouselState[stateKey] >= maxPosition;
    }

    nextButton.addEventListener("click", () => {
        carouselState[stateKey]++;
        update();
    });

    prevButton.addEventListener("click", () => {
        carouselState[stateKey]--;
        update();
    });

    window.addEventListener("resize", update);

    return update;
}

// ==============================
// CARROSSEL DE FILMES EM ALTA
// ==============================

function renderTrendingMovies() {
    moviesTrack.innerHTML = "";

    trendingMovies.forEach((movie, index) => {
        const card = document.createElement("article");
        card.classList.add("trending-card");

        card.innerHTML = `
            <div class="trending-poster" ${movie.image ? `style="background-image: linear-gradient(0deg, rgba(0,0,0,.35), rgba(0,0,0,.05)), url('${escapeHTML(movie.image)}'); background-size: cover; background-position: center;"` : ""}>
                <span class="trending-rank">#${index + 1}</span>
            </div>

            <div class="trending-info">
                <h3>${escapeHTML(movie.title)}</h3>
                <p>${escapeHTML(movie.genre)} • ⭐ ${getMovieRating(movie.id, movie.rating)}</p>
            </div>
        `;

        card.addEventListener("click", () => openMovieModal(movie));

        moviesTrack.appendChild(card);
    });

    return setupCarousel(
        moviesTrack,
        moviesPrevBtn,
        moviesNextBtn,
        trendingMovies.length,
        "movies"
    );
}

// ==============================
// CARROSSEL DE SÉRIES EM ALTA
// ==============================

function renderTrendingSeries() {
    seriesTrack.innerHTML = "";

    trendingSeries.forEach((serie, index) => {
        const card = document.createElement("article");
        card.classList.add("series-card");

        card.innerHTML = `
            <span class="trending-rank">#${index + 1}</span>
            <h3>${escapeHTML(serie.title)}</h3>
            <p>${escapeHTML(serie.genre)} • ⭐ ${getMovieRating(serie.id, serie.rating)}</p>
        `;

        if (serie.image) {
            card.style.backgroundImage = `linear-gradient(0deg, rgba(0,0,0,.65), rgba(0,0,0,.08)), url("${serie.image.replaceAll('"', '')}")`;
            card.style.backgroundSize = "cover";
            card.style.backgroundPosition = "center";
        }
        card.addEventListener("click", () => openMovieModal(serie));
        seriesTrack.appendChild(card);
    });

    return setupCarousel(
        seriesTrack,
        seriesPrevBtn,
        seriesNextBtn,
        trendingSeries.length,
        "series"
    );
}

// ==============================
// INICIALIZAÇÃO
// ==============================

renderMovies(movies);

const updateMoviesCarousel = renderTrendingMovies();
const updateSeriesCarousel = renderTrendingSeries();

updateMoviesCarousel();
updateSeriesCarousel();
updateUserStatus();
