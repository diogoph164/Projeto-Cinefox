const workForm = document.getElementById("workForm");
const formMessage = document.getElementById("formMessage");

function getSubmittedWorks() {
    try {
        return JSON.parse(localStorage.getItem("cinefoxSubmittedWorks") || "[]");
    } catch {
        return [];
    }
}

workForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = document.getElementById("workTitle").value.trim();
    const description = document.getElementById("workDescription").value.trim();
    const image = document.getElementById("workImage").value.trim();
    const type = document.getElementById("workType").value;
    const year = Number(document.getElementById("workYear").value);
    const rating = Number(document.getElementById("workRating").value);

    if (!title || !description) {
        formMessage.style.color = "#b42318";
        formMessage.textContent = "Preencha o título e a sinopse.";
        return;
    }
    if (year < 1888 || year > 2100 || !Number.isFinite(year)) {
        formMessage.style.color = "#b42318";
        formMessage.textContent = "Informe um ano válido entre 1888 e 2100.";
        return;
    }
    if (rating < 0 || rating > 10 || !Number.isFinite(rating)) {
        formMessage.style.color = "#b42318";
        formMessage.textContent = "A nota precisa ficar entre 0 e 10.";
        return;
    }
    if (image && !/^https?:\/\//i.test(image)) {
        formMessage.style.color = "#b42318";
        formMessage.textContent = "O link da imagem precisa começar com http:// ou https://.";
        return;
    }

    const works = getSubmittedWorks();
    const normalizedTitle = title.toLocaleLowerCase("pt-BR");
    if (works.some(work => work.type === type && work.title.toLocaleLowerCase("pt-BR") === normalizedTitle)) {
        formMessage.style.color = "#b42318";
        formMessage.textContent = "Já existe uma obra cadastrada com esse título e tipo.";
        return;
    }

    const work = {
        id: Date.now(),
        type,
        title,
        year,
        genre: document.getElementById("workGenre").value,
        description,
        image,
        director: document.getElementById("workDirector").value.trim(),
        rating: rating || 0
    };

    works.push(work);
    try {
        localStorage.setItem("cinefoxSubmittedWorks", JSON.stringify(works));
    } catch {
        formMessage.style.color = "#b42318";
        formMessage.textContent = "Não foi possível salvar. Verifique o armazenamento do navegador.";
        return;
    }

    formMessage.style.color = "#28784a";
    formMessage.textContent = "Obra cadastrada! Redirecionando para o Cinefox...";
    workForm.reset();
    document.getElementById("workYear").value = new Date().getFullYear();
    document.getElementById("workRating").value = "0";
    setTimeout(() => {
        window.location.href = type === "series" ? "index.html#series-alta" : "index.html#filmes-alta";
    }, 900);
});
