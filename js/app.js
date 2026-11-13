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
	// OBTENER SELECCIONES DE UN FILTRO
	// =====================================================

	function getSelectedFilterValues(filterKey) {

		const filterElements = {
			genre: elements.genreFilter,
			year: elements.yearFilter,
			language: elements.languageFilter,
			quality: elements.qualityFilter
		};

		const filter = filterElements[filterKey];

		if (!filter) return [];

		return Array.from(
			filter.querySelectorAll('input[type="checkbox"]:checked')
		).map(input => input.value);

	}


	// =====================================================
	// CONFIGURACIÓN DE LOS FILTROS
	// =====================================================

	function getFilterDefinitions() {

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
			"Music",
		];

		return [
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

					if (indexA === -1 && indexB === -1) {
						return a.localeCompare(b, "es");
					}

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

					if (indexA === -1 && indexB === -1) {
						return a.localeCompare(b, "es");
					}

					if (indexA === -1) return 1;
					if (indexB === -1) return -1;

					return indexA - indexB;
				}
			}
		];

	}


	// =====================================================
	// OBTENER PELÍCULAS SEGÚN LOS DEMÁS FILTROS
	// =====================================================

	function getMoviesForFilter(excludeFilter = null) {

		const search = normalize(elements.searchInput.value);

		const selected = {
			genre: getSelectedFilterValues("genre"),
			year: getSelectedFilterValues("year"),
			language: getSelectedFilterValues("language"),
			quality: getSelectedFilterValues("quality")
		};

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
				selected.genre.length === 0 ||
				selected.genre.includes(String(movie.Genero || ""));

			const matchesYear = excludeFilter === "year" ||
				selected.year.length === 0 ||
				selected.year.includes(String(movie["Año"] || ""));

			const matchesLanguage = excludeFilter === "language" ||
				selected.language.length === 0 ||
				selected.language.includes(String(movie.Idioma || ""));

			const matchesQuality = excludeFilter === "quality" ||
				selected.quality.length === 0 ||
				selected.quality.includes(String(movie["Calidad Visual"] || ""));

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

	function updateDependentFilters() {

		const filters = getFilterDefinitions();

		// Eliminar selecciones que ya no tienen resultados.
		// Se repite para mantener todos los filtros compatibles.

		let changed = true;

		while (changed) {

			changed = false;

			filters.forEach(filter => {

				const selected = getSelectedFilterValues(filter.key);

				if (selected.length === 0) return;

				const available = getMoviesForFilter(filter.key)
					.map(filter.field)
					.filter(value =>
						value !== null &&
						value !== undefined &&
						String(value).trim() !== ""
					)
					.map(value => String(value));

				selected.forEach(value => {

					if (!available.includes(value)) {

						const checkbox = Array.from(
							filter.element.querySelectorAll(
								'input[type="checkbox"]'
							)
						).find(input => input.value === value);

						if (checkbox) {
							checkbox.checked = false;
							changed = true;
						}

					}

				});

			});

		}


		// Reconstruir las opciones disponibles.

		filters.forEach(filter => {

			const selected = getSelectedFilterValues(filter.key);

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

			const optionsContainer = filter.element.querySelector(
				".multi-filter-options"
			);

			const button = filter.element.querySelector(
				".multi-filter-button"
			);

			optionsContainer.innerHTML = "";

			values.forEach(value => {

				const label = document.createElement("label");

				label.className = "multi-filter-option";

				const checkbox = document.createElement("input");

				checkbox.type = "checkbox";
				checkbox.value = value;
				checkbox.checked = selected.includes(value);

				const text = document.createElement("span");

				text.textContent = value;

				label.appendChild(checkbox);
				label.appendChild(text);

				optionsContainer.appendChild(label);

			});


			// Actualizar el texto del botón.

			if (selected.length === 0) {

				button.textContent = filter.placeholder;

			} else if (selected.length === 1) {

				button.textContent = selected[0];

			} else {

				button.textContent =
					selected.length + " opciones seleccionadas";

			}

		});

	}


    // =====================================================
	// BUSCAR Y FILTRAR PELÍCULAS
	// =====================================================

	function filterMovies(changedFilter = null) {

		// Actualizar las opciones disponibles.
		updateDependentFilters();

		// Obtener las selecciones actuales.
		const search = normalize(elements.searchInput.value);

		const selectedGenre = getSelectedFilterValues("genre");
		const selectedYear = getSelectedFilterValues("year");
		const selectedLanguage = getSelectedFilterValues("language");
		const selectedQuality = getSelectedFilterValues("quality");

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

			const matchesGenre = selectedGenre.length === 0 ||
				selectedGenre.includes(String(movie.Genero || ""));

			const matchesYear = selectedYear.length === 0 ||
				selectedYear.includes(String(movie["Año"] || ""));

			const matchesLanguage = selectedLanguage.length === 0 ||
				selectedLanguage.includes(String(movie.Idioma || ""));

			const matchesQuality = selectedQuality.length === 0 ||
				selectedQuality.includes(String(movie["Calidad Visual"] || ""));

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
			
			const durationA = (Number(a.h) || 0) * 60 + (Number(a.m) || 0);
			const durationB = (Number(b.h) || 0) * 60 + (Number(b.m) || 0);

			const sizeA = Number(a["Tamaño (MB)"]) || 0;
			const sizeB = Number(b["Tamaño (MB)"]) || 0;

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
				
				case "duration-asc":
					return durationA - durationB;

				case "duration-desc":
					return durationB - durationA;

				case "size-asc":
					return sizeA - sizeB;

				case "size-desc":
					return sizeB - sizeA;
								
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

		elements.clearSearch.classList.remove("visible");

		// Desmarcar todas las casillas.

		const filters = [
			elements.genreFilter,
			elements.yearFilter,
			elements.languageFilter,
			elements.qualityFilter
		];

		filters.forEach(filter => {

			filter.querySelectorAll(
				'input[type="checkbox"]'
			).forEach(checkbox => {

				checkbox.checked = false;

			});

		});

		// Restaurar orden predeterminado.

		elements.sortFilter.value = "date-desc";

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


        // =====================================================
		// FILTROS DE SELECCIÓN MÚLTIPLE
		// =====================================================

		const multiFilters = [
			{
				key: "genre",
				element: elements.genreFilter
			},
			{
				key: "year",
				element: elements.yearFilter
			},
			{
				key: "language",
				element: elements.languageFilter
			},
			{
				key: "quality",
				element: elements.qualityFilter
			}
		];

		multiFilters.forEach(filter => {

			// Abrir y cerrar el desplegable.

			const button = filter.element.querySelector(
				".multi-filter-button"
			);

			button.addEventListener("click", event => {

				event.stopPropagation();

				const wasOpen = filter.element.classList.contains("open");

				// Cerrar los demás desplegables.

				multiFilters.forEach(otherFilter => {
					otherFilter.element.classList.remove("open");
				});

				// Alternar el desplegable actual.

				if (!wasOpen) {
					filter.element.classList.add("open");
				}

			});


			// Detectar cambios en las casillas.

			filter.element.addEventListener("change", event => {

				if (
					event.target.matches('input[type="checkbox"]')
				) {

					filterMovies(filter.key);

				}

			});

		});


		// Cerrar desplegables al hacer clic fuera.

		document.addEventListener("click", event => {

			multiFilters.forEach(filter => {

				if (!filter.element.contains(event.target)) {
					filter.element.classList.remove("open");
				}

			});

		});
		
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