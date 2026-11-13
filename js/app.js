/* =========================================================
   MI CATÁLOGO - APLICACIÓN PRINCIPAL
   Archivo: app.js
   ========================================================= */

(() => {

    "use strict";

    // =====================================================
    // CONFIGURACIÓN Y VARIABLES
    // =====================================================

    const CONFIG = window.CATALOGO_CONFIG;

    const PAGE_SIZE = CONFIG.PAGE_SIZE || 24;

    let allMovies = [];
    let filteredMovies = [];

    let currentPage = 1;

    // =====================================================
    // ELEMENTOS HTML
    // =====================================================

    const elements = {

        brandName: document.getElementById("brandName"),
        brandLogo: document.getElementById("brandLogo"),

        totalTitles: document.getElementById("totalTitles"),
        totalPosters: document.getElementById("totalPosters"),

        searchInput: document.getElementById("searchInput"),
        clearSearch: document.getElementById("clearSearch"),

        genreFilter: document.getElementById("genreFilter"),
        yearFilter: document.getElementById("yearFilter"),
        languageFilter: document.getElementById("languageFilter"),
		qualityFilter: document.getElementById("qualityFilter"),
        sortFilter: document.getElementById("sortFilter"),

        clearFilters: document.getElementById("clearFilters"),

        resultsInfo: document.getElementById("resultsInfo"),
        currentPageInfo: document.getElementById("currentPageInfo"),

        loadingMessage: document.getElementById("loadingMessage"),
        errorMessage: document.getElementById("errorMessage"),
        errorText: document.getElementById("errorText"),
        emptyMessage: document.getElementById("emptyMessage"),

        catalogGrid: document.getElementById("catalogGrid"),
        pagination: document.getElementById("pagination"),

        detailModal: document.getElementById("detailModal"),
        modalOverlay: document.getElementById("modalOverlay"),
        closeModal: document.getElementById("closeModal"),

        detailPoster: document.getElementById("detailPoster"),
        detailGenre: document.getElementById("detailGenre"),
        detailTitle: document.getElementById("detailTitle"),
        detailSubtitle: document.getElementById("detailSubtitle"),
        detailFields: document.getElementById("detailFields")

    };


    // =====================================================
    // NORMALIZAR TEXTO
    // =====================================================

    function normalize(value) {

        return String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "");

    }


    // =====================================================
    // ESCAPAR HTML
    // Evita interpretar datos del JSON como HTML
    // =====================================================

    function escapeHTML(value) {

        return String(value ?? "").replace(
            /[&<>"']/g,
            character => ({

                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"

            })[character]
        );

    }


    // =====================================================
    // CONFIGURAR IDENTIDAD DEL CATÁLOGO
    // =====================================================

    function configureBrand() {
		const logo = document.getElementById("brandLogo");
		const name = document.getElementById("brandName");

		// Si el logo es una imagen, no modificar su contenido.
		if (logo && logo.tagName !== "IMG") {
			logo.textContent = CONFIG.BRAND_INITIALS;
		}

		// El nombre es opcional.
		if (name) {
			name.textContent = CONFIG.BRAND_NAME;
		}
	}


    // =====================================================
    // CARGAR ARCHIVO JSON
    // =====================================================

    async function loadCatalog() {

        const response = await fetch(CONFIG.JSON_URL, {
            cache: "no-store"
        });

        if (!response.ok) {

            throw new Error(
                "No se pudo cargar catalogo.json. " +
                "Código HTTP: " +
                response.status
            );

        }

        const data = await response.json();

        if (!Array.isArray(data)) {

            throw new Error(
                "El archivo JSON debe contener un arreglo de películas."
            );

        }
		
        return data;

    }


    // =====================================================
    // VALIDAR Y NORMALIZAR REGISTROS
    // =====================================================

    function validateCatalog(data) {

        return data.filter(movie => {

            if (!movie || typeof movie !== "object") {
                return false;
            }

            if (!movie.Codigo || !movie.Titulo) {
                return false;
            }

            return true;

        });

    }


    // =====================================================
    // CARGAR PÓSTERES
    // =====================================================

    async function loadPosters() {

        try {

            return await window.CATALOGO_DRIVE.loadAllPosters();

        } catch (error) {

            console.error("Error cargando pósteres:", error);

            // El catálogo seguirá funcionando sin pósteres.
            return {
                folders: 0,
                posters: 0,
                error: error.message
            };

        }

    }


    // =====================================================
    // OBTENER PÓSTER DE UNA PELÍCULA
    // =====================================================

    function getMoviePoster(movie) {

        return window.CATALOGO_DRIVE.findPoster(
            movie.Genero,
            movie.Titulo
        );

    }


    // =====================================================
    // ACTUALIZAR ESTADÍSTICAS
    // =====================================================

    function updateStats() {
		const totalTitles = document.getElementById("totalTitles");
		const totalPosters = document.getElementById("totalPosters");

		if (totalTitles) {
			/*totalTitles.textContent = `${catalog.length} títulos`;*/
			totalTitles.textContent = `${allMovies.length} títulos`;
		}

		if (totalPosters) {
			totalPosters.textContent =
				`${CATALOGO_DRIVE.getStats().totalPosters} pósteres`;
		}
	}


    // =====================================================
    // CREAR OPCIONES DE FILTROS
    // =====================================================

    function populateFilters() {

		updateDependentFilters();

	}


	// =====================================================
	// OBTENER PELÍCULAS SEGÚN LOS DEMÁS FILTROS
	// =====================================================

	function getMoviesForFilter(excludeFilter) {

		const search = normalize(elements.searchInput.value);

		const genre = elements.genreFilter.value;
		const year = elements.yearFilter.value;
		const language = elements.languageFilter.value;
		const quality = elements.qualityFilter.value;

		return allMovies.filter(movie => {

			const searchValues = [
				movie.Titulo,
				movie["Titulo Ingles"],
				movie.Saga,
				movie.Genero,
				movie.Idioma,
				movie["Año"],
				movie.Formato,
				movie.Resolucion,
				movie["Calidad Visual"],
				movie.Observaciones
			];

			const matchesSearch = !search ||
				searchValues.some(value =>
					normalize(value).includes(search)
				);

			const matchesGenre = excludeFilter === "genre" ||
				!genre || movie.Genero === genre;

			const matchesYear = excludeFilter === "year" ||
				!year || String(movie["Año"] || "") === year;

			const matchesLanguage = excludeFilter === "language" ||
				!language || movie.Idioma === language;

			const matchesQuality = excludeFilter === "quality" ||
				!quality || movie["Calidad Visual"] === quality;

			return (
				matchesSearch &&
				matchesGenre &&
				matchesYear &&
				matchesLanguage &&
				matchesQuality
			);

		});

	}


	// =====================================================
	// ACTUALIZAR OPCIONES DE LOS FILTROS
	// =====================================================

	function updateDependentFilters(changedFilter = null) {

		const qualityOrder = [
			"Muy Excelente",
			"Excelente",
			"Muy Buena",
			"Buena",
			"Buena Baja",
			"Regular Alta",
			"Regular",
			"Medio Mala",
			"Malisima",
			"Lo Peor"
		];
		
		const languageOrder = [
			"Dual",
			"Latino",
			"Español",
			"Subs",
			"English Sub",
			"Music"
		];

		const filters = [
			{
				key: "genre",
				element: elements.genreFilter,
				placeholder: "Todos los Géneros",
				field: movie => movie.Genero,
				sort: (a, b) => a.localeCompare(b, "es")
			},
			{
				key: "year",
				element: elements.yearFilter,
				placeholder: "Todos los Años",
				field: movie => movie["Año"],
				sort: (a, b) => Number(b) - Number(a)
			},
			{
				key: "language",
				element: elements.languageFilter,
				placeholder: "Todos los Idiomas",
				field: movie => movie.Idioma,
				sort: (a, b) => {
					const indexA = languageOrder.indexOf(a);
					const indexB = languageOrder.indexOf(b);

					if (indexA === -1) return 1;
					if (indexB === -1) return -1;

					return indexA - indexB;
				}
			},
			{
				key: "quality",
				element: elements.qualityFilter,
				placeholder: "Todas las Calidades Visuales",
				field: movie => movie["Calidad Visual"],
				sort: (a, b) => {
					const indexA = qualityOrder.indexOf(a);
					const indexB = qualityOrder.indexOf(b);

					if (indexA === -1) return 1;
					if (indexB === -1) return -1;

					return indexA - indexB;
				}
			}
		];


		// Primero eliminar selecciones que ya no tienen resultados.

		for (let i = 0; i < filters.length; i++) {

			filters.forEach(filter => {

				if (filter.key === changedFilter) return;

				const selected = filter.element.value;

				if (!selected) return;

				const available = getMoviesForFilter(filter.key)
					.map(filter.field)
					.filter(value => value !== null &&
						value !== undefined &&
						String(value).trim() !== ""
					)
					.map(value => String(value));

				if (!available.includes(selected)) {
					filter.element.value = "";
				}

			});

		}


		// Después reconstruir las opciones disponibles.

		filters.forEach(filter => {

			const selected = filter.element.value;

			let values = [
				...new Set(
					getMoviesForFilter(filter.key)
						.map(filter.field)
						.filter(value =>
							value !== null &&
							value !== undefined &&
							String(value).trim() !== ""
						)
						.map(value => String(value))
				)
			];

			values.sort(filter.sort);

			filter.element.innerHTML = "";

			const defaultOption = document.createElement("option");
			defaultOption.value = "";
			defaultOption.textContent = filter.placeholder;

			filter.element.appendChild(defaultOption);

			values.forEach(value => {

				const option = document.createElement("option");
				option.value = value;
				option.textContent = value;

				filter.element.appendChild(option);

			});

			filter.element.value = selected;

		});

    }


    // =====================================================
    // BUSCAR PELÍCULAS
    // =====================================================

    function filterMovies(changedFilter = null) {

		// Actualizar las opciones de los demás filtros.
		updateDependentFilters(changedFilter);

		const search = normalize(elements.searchInput.value);

		const genre = elements.genreFilter.value;
		const year = elements.yearFilter.value;
		const language = elements.languageFilter.value;
		const quality = elements.qualityFilter.value;

		filteredMovies = allMovies.filter(movie => {

			const searchValues = [
				movie.Titulo,
				movie["Titulo Ingles"],
				movie.Saga,
				movie.Genero,
				movie.Idioma,
				movie["Año"],
				movie.Formato,
				movie.Resolucion,
				movie["Calidad Visual"],
				movie.Observaciones
			];

			const matchesSearch = !search ||
				searchValues.some(value =>
					normalize(value).includes(search)
				);

			const matchesGenre = !genre ||
				movie.Genero === genre;

			const matchesYear = !year ||
				String(movie["Año"] || "") === year;

			const matchesLanguage = !language ||
				movie.Idioma === language;

			const matchesQuality = !quality ||
				movie["Calidad Visual"] === quality;

			return (
				matchesSearch &&
				matchesGenre &&
				matchesYear &&
				matchesLanguage &&
				matchesQuality
			);

		});

		sortMovies();

		currentPage = 1;

		renderCatalog();

	}


    // =====================================================
    // ORDENAR RESULTADOS
    // =====================================================
	
	function convertirFecha(fecha) {

		if (!fecha) return 0;

		const partes = String(fecha).trim().split("/");

		if (partes.length !== 3) return 0;

		const [dia, mes, año] = partes;

		return Number(año) * 10000 +
			   Number(mes) * 100 +
			   Number(dia);
	}

    function sortMovies() {

        const sort = elements.sortFilter.value;

        filteredMovies.sort((a, b) => {

            const titleA = String(a.Titulo || "");
            const titleB = String(b.Titulo || "");

            const yearA = Number(a["Año"]) || 0;
            const yearB = Number(b["Año"]) || 0;

            switch (sort) {

                case "title-desc":
                    return titleB.localeCompare(titleA, "es");

                case "year-desc":
                    return yearB - yearA ||
                        titleA.localeCompare(titleB, "es");

                case "year-asc":
                    return yearA - yearB ||
                        titleA.localeCompare(titleB, "es");

                case "title-asc":
                default:
                    return titleA.localeCompare(titleB, "es");
				
				case "date-desc":
					const fechaA = convertirFecha(a["Fecha Ingreso"]);
					const fechaB = convertirFecha(b["Fecha Ingreso"]);

					return fechaB - fechaA;

            }

        });

    }


    // =====================================================
    // CREAR TARJETA DE PELÍCULA
    // =====================================================
	
	const genreColors = new Map();

	const genrePalette = [
		0,    // Rojo
		220,  // Azul
		45,   // Amarillo
		280,  // Violeta
		175,  // Turquesa
		330,  // Rosa
		25,   // Naranja
		120,  // Verde
		200,  // Azul cielo
		90,   // Verde lima
		260,  // Índigo
		300,  // Magenta
		15,   // Rojo naranja
		150,  // Verde menta
		240,  // Azul profundo
		60    // Amarillo verdoso
	];

	function getGenreHue(genre) {

		if (!genreColors.has(genre)) {

			const index = genreColors.size % genrePalette.length;

			genreColors.set(genre, genrePalette[index]);

		}

		return genreColors.get(genre);

	}

    function createMovieCard(movie) {

        const card = document.createElement("article");

        card.className = "movie-card";
        card.tabIndex = 0;
        card.setAttribute("role", "button");
        card.setAttribute(
            "aria-label",
            "Ver detalles de " + movie.Titulo
        );

        const posterUrl = getMoviePoster(movie);

        const posterContainer = document.createElement("div");

        posterContainer.className = "movie-poster";

        if (posterUrl) {

            const image = document.createElement("img");

            image.src = posterUrl;
            image.alt = "Póster de " + movie.Titulo;
            image.loading = "lazy";

            image.addEventListener("error", () => {

                posterContainer.innerHTML = "";

                posterContainer.appendChild(
                    createPosterPlaceholder(movie.Titulo)
                );

            }, { once: true });

            posterContainer.appendChild(image);

        } else {

            posterContainer.appendChild(
                createPosterPlaceholder(movie.Titulo)
            );

        }

        const info = document.createElement("div");

        info.className = "movie-info";

        const title = document.createElement("h4");

        title.className = "movie-title";
        title.textContent = movie.Titulo;

        const meta = document.createElement("div");

        meta.className = "movie-meta";

        [
            movie["Año"],
            movie.Idioma ? "Idioma " + movie.Idioma : ""
        ].filter(Boolean).forEach(value => {

            const span = document.createElement("span");

            span.textContent = value;

            meta.appendChild(span);

        });

        info.appendChild(title);
        info.appendChild(meta);

        if (movie.Genero) {

			const genre = document.createElement("span");

			genre.className = "movie-genre";
			genre.textContent = movie.Genero;

			genre.style.setProperty(
				"--genre-hue",
				getGenreHue(movie.Genero)
			);
			
			info.appendChild(genre);
			/*posterContainer.appendChild(genre);*/

		}

        card.appendChild(posterContainer);
        card.appendChild(info);

        card.addEventListener("click", () => {
            openDetails(movie);
        });

        card.addEventListener("keydown", event => {

            if (event.key === "Enter" || event.key === " ") {

                event.preventDefault();
                openDetails(movie);

            }

        });

        return card;

    }


    // =====================================================
    // CREAR PÓSTER ALTERNATIVO
    // =====================================================

    function createPosterPlaceholder(title) {

        const placeholder = document.createElement("div");

        placeholder.className = "poster-placeholder";

        const icon = document.createElement("span");

        icon.textContent = "🎬";

        const text = document.createElement("strong");

        text.textContent = title;

        placeholder.appendChild(icon);
        placeholder.appendChild(text);

        return placeholder;

    }


    // =====================================================
    // MOSTRAR CATÁLOGO
    // =====================================================

    function renderCatalog() {

        elements.catalogGrid.innerHTML = "";

        const totalResults = filteredMovies.length;

        const totalPages = Math.ceil(totalResults / PAGE_SIZE);

        const startIndex = (currentPage - 1) * PAGE_SIZE;

        const pageMovies = filteredMovies.slice(
            startIndex,
            startIndex + PAGE_SIZE
        );

        elements.resultsInfo.textContent =
            totalResults === 1
                ? "1 resultado encontrado"
                : totalResults + " resultados encontrados";

        elements.currentPageInfo.textContent =
            totalPages > 0
                ? "Página " + currentPage + " de " + totalPages
                : "";


        if (totalResults === 0) {

            elements.emptyMessage.hidden = false;

        } else {

            elements.emptyMessage.hidden = true;

        }

        pageMovies.forEach(movie => {

            elements.catalogGrid.appendChild(
                createMovieCard(movie)
            );

        });

        renderPagination(totalPages);

    }


    // =====================================================
    // CREAR PAGINACIÓN
    // =====================================================

    function renderPagination(totalPages) {

        elements.pagination.innerHTML = "";

        if (totalPages <= 1) {
            return;
        }

        function createButton(label, page, active = false, disabled = false) {

            const button = document.createElement("button");

            button.type = "button";
            button.textContent = label;

            if (active) {
                button.classList.add("active");
                button.setAttribute("aria-current", "page");
            }

            button.disabled = disabled;

            button.addEventListener("click", () => {

                currentPage = page;

                renderCatalog();

                window.scrollTo({
                    top: elements.catalogGrid.offsetTop - 100,
                    behavior: "smooth"
                });

            });

            elements.pagination.appendChild(button);

        }

        createButton(
            "‹",
            currentPage - 1,
            false,
            currentPage === 1
        );

        for (let page = 1; page <= totalPages; page++) {

            // Mostrar páginas cercanas y extremos
            if (
                page === 1 ||
                page === totalPages ||
                Math.abs(page - currentPage) <= 2
            ) {

                createButton(
                    page,
                    page,
                    page === currentPage
                );

            } else if (
                page === currentPage - 3 ||
                page === currentPage + 3
            ) {

                const dots = document.createElement("span");

                dots.textContent = "...";
                dots.style.color = "var(--text-muted)";
                dots.style.padding = "0 4px";

                elements.pagination.appendChild(dots);

            }

        }

        createButton(
            "›",
            currentPage + 1,
            false,
            currentPage === totalPages
        );

    }


    // =====================================================
    // ABRIR FICHA DE DETALLES
    // =====================================================

    function openDetails(movie) {

        elements.detailTitle.textContent = movie.Titulo || "";

        elements.detailGenre.textContent = movie.Genero || "";
		elements.detailGenre.style.setProperty(
			"--genre-hue",
			getGenreHue(movie.Genero)
		);

        elements.detailSubtitle.textContent =
            [
                movie["Año"],
                movie.Idioma ? "Idioma " + movie.Idioma : "",
                movie.Duracion
            ].filter(Boolean).join(" · ");

        const posterUrl = getMoviePoster(movie);

        elements.detailPoster.onerror = () => {

            elements.detailPoster.style.display = "none";

        };

        elements.detailPoster.onload = () => {

            elements.detailPoster.style.display = "block";

        };

        if (posterUrl) {

            elements.detailPoster.style.display = "block";
            elements.detailPoster.src = posterUrl;

        } else {

            elements.detailPoster.style.display = "none";
            elements.detailPoster.removeAttribute("src");

        }

        elements.detailPoster.alt = "Póster de " + movie.Titulo;

        renderDetailFields(movie);

        elements.detailModal.classList.add("open");

        elements.detailModal.setAttribute("aria-hidden", "false");

        document.body.style.overflow = "hidden";

        elements.closeModal.focus();

    }


    // =====================================================
    // MOSTRAR TODOS LOS CAMPOS DISPONIBLES
    // =====================================================

    function renderDetailFields(movie) {

        elements.detailFields.innerHTML = "";

        const ignoredFields = [
			"Codigo",
			"Titulo",
			"Titulo Ingles",
			"Genero",
			"Idioma",
			"Año",
			"h",
			"m",
			"#",
			"Vista"
		];
		
		const fieldOrder = [
			"Titulo Ingles",
			"Imagen",
			"Calidad Visual",
			"Resolucion",
			"Tamaño (MB)",
			"Formato",
			"Capitulos",
			"Fecha Ingreso",
			"Saga",
			"Observaciones"
		];

        fieldOrder.forEach(key => {

			const value = movie[key];

			if (
				value === null ||
				value === undefined ||
				String(value).trim() === "" ||
				ignoredFields.includes(key)
			) {
				return;
			}

			const field = document.createElement("div");

			field.className = "detail-field";

			const label = document.createElement("span");

			label.className = "detail-field-label";
			label.textContent = key;

			const content = document.createElement("span");

			content.className = "detail-field-value";
			if (key === "Tamaño (MB)") {
				content.textContent = Number(value).toLocaleString("es-CO");
			} else {
				content.textContent = value;
			}
			if (key === "Calidad Visual") {
				content.classList.add("quality-" + normalize(value));
			}

			field.appendChild(label);
			field.appendChild(content);

			elements.detailFields.appendChild(field);

		});

    }


    // =====================================================
    // CERRAR FICHA
    // =====================================================

    function closeDetails() {

        elements.detailModal.classList.remove("open");

        elements.detailModal.setAttribute("aria-hidden", "true");

        document.body.style.overflow = "";

    }


    // =====================================================
    // LIMPIAR FILTROS
    // =====================================================

    function clearFilters() {

        elements.searchInput.value = "";

        elements.genreFilter.value = "";
        elements.yearFilter.value = "";
        elements.languageFilter.value = "";
		elements.qualityFilter.value = "";
		
		elements.sortFilter.value = "date-desc";

        elements.clearSearch.classList.remove("visible");

        filterMovies();

    }


    // =====================================================
    // CONECTAR EVENTOS
    // =====================================================

    function connectEvents() {

        // BUSCADOR

        elements.searchInput.addEventListener("input", () => {

            elements.clearSearch.classList.toggle(
                "visible",
                elements.searchInput.value.length > 0
            );

            filterMovies("search");

        });


        // LIMPIAR BÚSQUEDA

        elements.clearSearch.addEventListener("click", () => {

            elements.searchInput.value = "";

            elements.clearSearch.classList.remove("visible");

            filterMovies("search");

            elements.searchInput.focus();

        });


        // FILTROS

		elements.genreFilter.addEventListener(
			"change",
			() => filterMovies("genre")
		);

		elements.yearFilter.addEventListener(
			"change",
			() => filterMovies("year")
		);

		elements.languageFilter.addEventListener(
			"change",
			() => filterMovies("language")
		);

		elements.qualityFilter.addEventListener(
			"change",
			() => filterMovies("quality")
		);
		
		elements.sortFilter.addEventListener(
			"change",
			() => {

				sortMovies();

				currentPage = 1;

				renderCatalog();

			}
		);


        // LIMPIAR TODOS LOS FILTROS

        elements.clearFilters.addEventListener(
            "click",
            clearFilters
        );


        // CERRAR MODAL

        elements.closeModal.addEventListener(
            "click",
            closeDetails
        );

        elements.modalOverlay.addEventListener(
            "click",
            closeDetails
        );


        // CERRAR CON ESCAPE

        document.addEventListener("keydown", event => {

            if (event.key === "Escape") {
                closeDetails();
            }

        });

    }


    // =====================================================
    // MOSTRAR ERROR GENERAL
    // =====================================================

    function showError(message) {

        elements.loadingMessage.hidden = true;

        elements.catalogGrid.innerHTML = "";

        elements.errorMessage.hidden = false;

        elements.errorText.textContent = message;

        elements.resultsInfo.textContent =
            "No se pudo cargar el catálogo.";

    }


    // =====================================================
    // INICIAR APLICACIÓN
    // =====================================================

    async function initialize() {

        configureBrand();

        connectEvents();

        try {

            elements.loadingMessage.hidden = false;

            elements.errorMessage.hidden = true;

            // 1. Cargar JSON

            allMovies = await loadCatalog();

            allMovies = validateCatalog(allMovies);

            if (CONFIG.DEBUG) {

                console.log(
                    "Películas cargadas:",
                    allMovies.length
                );

            }

            // 2. Cargar pósteres de Drive

            await loadPosters();

            // 3. Actualizar estadísticas

            updateStats();

            // 4. Crear filtros

            populateFilters();

            // 5. Preparar resultados
			
			elements.sortFilter.value = "date-desc";
			
            filteredMovies = [...allMovies];

            sortMovies();

            currentPage = 1;

            // 6. Mostrar catálogo

            renderCatalog();

            elements.loadingMessage.hidden = true;

            if (CONFIG.DEBUG) {
                console.log("Catálogo iniciado correctamente.");
            }

        } catch (error) {

            console.error("Error iniciando catálogo:", error);

            showError(error.message);

        }

    }


    // =====================================================
    // EJECUTAR
    // =====================================================

    document.addEventListener(
        "DOMContentLoaded",
        initialize
    );

})();