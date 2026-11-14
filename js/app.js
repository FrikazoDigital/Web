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
	let isTop10View = false;
	let isRandomMoviesView = false;

	let lastRandomMovie = null;
	
	// =====================================================
	// CARRITO DE COMPRAS
	// =====================================================

	const CART_STORAGE_KEY = "frikazoDigitalCart";

	let cartItems = [];
	let currentDetailMovie = null;

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
		top10Button: document.getElementById("top10Button"),
		resultsTitle: document.getElementById("resultsTitle"),
		// PELÍCULAS ALEATORIAS
		randomMoviesButton: document.getElementById("randomMoviesButton"),
		randomMoviesSection: document.getElementById("randomMoviesSection"),
		randomGenreFilter: document.getElementById("randomGenreFilter"),
		randomYearFilter: document.getElementById("randomYearFilter"),
		chooseRandomMovie: document.getElementById("chooseRandomMovie"),
		backToCatalog: document.getElementById("backToCatalog"),
		randomMovieResult: document.getElementById("randomMovieResult"),
		randomMovieGrid: document.getElementById("randomMovieGrid"),
		randomMovieEmpty: document.getElementById("randomMovieEmpty"),

        resultsInfo: document.getElementById("resultsInfo"),
        currentPageInfo: document.getElementById("currentPageInfo"),

        loadingMessage: document.getElementById("loadingMessage"),
        errorMessage: document.getElementById("errorMessage"),
        errorText: document.getElementById("errorText"),
        emptyMessage: document.getElementById("emptyMessage"),

        catalogGrid: document.getElementById("catalogGrid"),
		pagination: document.getElementById("pagination"),

		filtersContainer: document.querySelector(".filters-container"),
		catalogSection: document.querySelector(".catalog-section"),

        detailModal: document.getElementById("detailModal"),
        modalOverlay: document.getElementById("modalOverlay"),
        closeModal: document.getElementById("closeModal"),

        detailPoster: document.getElementById("detailPoster"),
		// VISOR AMPLIADO DE POSTER
		posterViewer: document.getElementById("posterViewer"),
		closePosterViewer: document.getElementById("closePosterViewer"),
		posterViewerImage: document.getElementById("posterViewerImage"),
		posterViewerArea: document.getElementById("posterViewerArea"),
		zoomIn: document.getElementById("zoomIn"),
		zoomOut: document.getElementById("zoomOut"),
		resetZoom: document.getElementById("resetZoom"),

        detailGenre: document.getElementById("detailGenre"),
        detailTitle: document.getElementById("detailTitle"),
        detailSubtitle: document.getElementById("detailSubtitle"),
        detailFields: document.getElementById("detailFields"),
		
		// CARRITO DE COMPRAS
		cartButton: document.getElementById("cartButton"),
		cartCount: document.getElementById("cartCount"),
		cartSection: document.getElementById("cartSection"),
		cartInfo: document.getElementById("cartInfo"),
		cartList: document.getElementById("cartList"),
		makeOrder: document.getElementById("makeOrder"),
		emptyCart: document.getElementById("emptyCart"),
		clearCart: document.getElementById("clearCart"),
		backFromCart: document.getElementById("backFromCart"),
		addToCart: document.getElementById("addToCart"),
		cartFeedback: document.getElementById("cartFeedback"),
		filtersSection: document.querySelector(".filters-section")

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
	// FUNCIONES DEL CARRITO DE COMPRAS
	// =====================================================

	// Cargar carrito desde localStorage
	function loadCart() {

		try {

			const savedCart = localStorage.getItem(CART_STORAGE_KEY);

			cartItems = savedCart ? JSON.parse(savedCart) : [];

			if (!Array.isArray(cartItems)) {
				cartItems = [];
			}

			cartItems = cartItems.filter(item =>
				item &&
				typeof item.key === "string" &&
				typeof item.title === "string"
			);

		} catch (error) {

			console.error("Error al cargar el carrito:", error);

			cartItems = [];

		}

		updateCartCount();

	}


	// Guardar carrito en localStorage
	function saveCart() {

		try {

			localStorage.setItem(
				CART_STORAGE_KEY,
				JSON.stringify(cartItems)
			);

		} catch (error) {

			console.error("Error al guardar el carrito:", error);

			alert("No fue posible guardar el carrito en este navegador.");

		}

		updateCartCount();

	}


	// Actualizar contador
	function updateCartCount() {

		elements.cartCount.textContent = cartItems.length;

	}


	// Agregar película o serie
	function addMovieToCart() {

		if (!currentDetailMovie) return;

		const movie = currentDetailMovie;

		const title = String(movie.Titulo || "").trim();

		const key = normalize(title);

		if (!key) return;

		const alreadyExists = cartItems.some(item =>
			item.key === key
		);

		if (alreadyExists) {

			elements.cartFeedback.textContent =
				"Esta Película o Serie Ya está en tu Carrito.";

			elements.cartFeedback.hidden = false;

			return;

		}

		cartItems.push({
			key: key,
			title: title
		});

		saveCart();

		elements.cartFeedback.textContent =
			"¡Agregado al Carrito Correctamente!";

		elements.cartFeedback.hidden = false;

		elements.addToCart.textContent = "✓ Agregado al Carrito";
		elements.addToCart.classList.add("added");

	}


	// Buscar película o serie en el catálogo
	function findCartMovie(item) {

		return allMovies.find(movie =>
			normalize(movie.Titulo) === item.key
		);

	}


	// Dibujar el contenido del carrito
	function renderCart() {

		elements.cartList.innerHTML = "";

		elements.cartInfo.textContent =
			cartItems.length === 1
				? "Tienes 1 título en tu carrito."
				: `Tienes ${cartItems.length} Títulos en tu Carrito.`;

		elements.emptyCart.hidden = cartItems.length > 0;
		elements.cartList.hidden = cartItems.length === 0;

		cartItems.forEach(item => {

			const movie = findCartMovie(item);

			const cartItem = document.createElement("article");

			cartItem.className = "cart-item";
			cartItem.dataset.cartKey = item.key;

			// PÓSTER
			const posterContainer = document.createElement("div");

			posterContainer.className = "cart-item-poster";

			if (movie) {

				const poster = getMoviePoster(movie);

				if (poster) {

					const image = document.createElement("img");

					image.src = poster;
					image.alt = movie.Titulo;

					posterContainer.appendChild(image);

				} else {

					posterContainer.textContent = "🎬";

				}

			} else {

				posterContainer.textContent = "🎬";

			}

			// INFORMACIÓN
			const information = document.createElement("div");

			information.className = "cart-item-information";

			const title = document.createElement("h4");

			title.textContent = item.title;

			const genre = document.createElement("p");

			genre.textContent = movie
				? movie.Genero || "Género no disponible"
				: "No disponible en el catálogo";

			const year = document.createElement("p");

			year.textContent = movie
				? movie["Año"] || "Año no disponible"
				: "";

			information.appendChild(title);
			information.appendChild(genre);
			information.appendChild(year);

			// BOTÓN ELIMINAR
			const removeButton = document.createElement("button");

			removeButton.type = "button";

			removeButton.className = "remove-cart-item";

			removeButton.textContent = "🗑";

			removeButton.title = "Eliminar del carrito";

			removeButton.dataset.cartKey = item.key;

			cartItem.appendChild(posterContainer);
			cartItem.appendChild(information);
			cartItem.appendChild(removeButton);

			elements.cartList.appendChild(cartItem);

		});

	}


	// Eliminar un título individual
	function removeCartItem(key) {

		cartItems = cartItems.filter(item =>
			item.key !== key
		);

		saveCart();

		renderCart();

	}


	// Vaciar carrito
	function clearShoppingCart() {

		if (cartItems.length === 0) return;

		cartItems = [];

		saveCart();

		renderCart();

	}

	// Crear pedido y abrir WhatsApp
	function makeWhatsAppOrder() {

		if (cartItems.length === 0) {
			alert("Tu carrito está Vacío. Agrega Películas o Series antes de hacer un Pedido.");
			return;
		}

		const movieList = cartItems
			.map((item, index) => {

				const movie = findCartMovie(item);

				const year = movie
					? movie["Año"] || "No disponible"
					: "No disponible";

				const genre = movie
					? movie.Genero || "No disponible"
					: "No disponible";

				return `${index + 1}. ${item.title}\n   🎭 Género: ${genre}\n   📅 Año: ${year}`;

			})
			.join("\n\n");

		const message =
			`¡Hola, Frikazo Digital! 👋\n\n` +
			`Quiero realizar el siguiente pedido:\n\n` +
			`${movieList}\n\n` +
			`🎬 Títulos Totales: ${cartItems.length}\n\n` +
			`Quedo atento. ¡Muchas gracias!`;

		const whatsappURL =
			`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

		window.open(whatsappURL, "_blank");
	}

	// Abrir sección del carrito
	function openCart() {

		// Salir de películas aleatorias si está activa
		if (isRandomMoviesView) {
			toggleRandomMovies();
		}

		// Salir de TOP 10 si está activo
		if (isTop10View) {
			toggleTop10();
		}

		elements.filtersSection.hidden = true;

		elements.catalogSection.hidden = true;

		elements.cartSection.hidden = false;

		renderCart();

		elements.cartSection.scrollIntoView({
			behavior: "smooth",
			block: "start"
		});

	}


	// Volver al catálogo
	function closeCart() {

		elements.cartSection.hidden = true;

		elements.filtersSection.hidden = false;

		elements.catalogSection.hidden = false;

		elements.filtersSection.scrollIntoView({
			behavior: "smooth",
			block: "start"
		});

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
    // FILTROS INDEPENDIENTES DE PELÍCULAS ALEATORIAS
    // =====================================================

    function getRandomSelectedValues(filterKey) {

        const filter = filterKey === "genre"
            ? elements.randomGenreFilter
            : elements.randomYearFilter;

        return Array.from(
            filter.querySelectorAll(
                'input[type="checkbox"]:checked:not([data-select-all])'
            )
        ).map(input => input.value);

    }


    function getRandomFilterDefinitions() {

        return [
            {
                key: "genre",
                element: elements.randomGenreFilter,
                placeholder: "Todos los Géneros",
                field: movie => movie.Genero,
                sort: (a, b) => a.localeCompare(b, "es")
            },
            {
                key: "year",
                element: elements.randomYearFilter,
                placeholder: "Todos los Años",
                field: movie => movie["Año"],
                sort: (a, b) => Number(b) - Number(a)
            }
        ];

    }


    function getRandomMoviesForFilter(excludeFilter = null) {

        const selectedGenre = getRandomSelectedValues("genre");
        const selectedYear = getRandomSelectedValues("year");

        return allMovies.filter(movie => {

            const matchesGenre =
                excludeFilter === "genre" ||
                selectedGenre.length === 0 ||
                selectedGenre.includes(String(movie.Genero || ""));

            const matchesYear =
                excludeFilter === "year" ||
                selectedYear.length === 0 ||
                selectedYear.includes(String(movie["Año"] || ""));

            return matchesGenre && matchesYear;

        });

    }


    function updateRandomDependentFilters() {

        const filters = getRandomFilterDefinitions();

        filters.forEach(filter => {

            const selected = getRandomSelectedValues(filter.key);

            let values = [
                ...new Set(
                    getRandomMoviesForFilter(filter.key)
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

            // Conservar únicamente las selecciones disponibles.
            const validSelected = selected.filter(value =>
                values.includes(value)
            );

            const optionsContainer = filter.element.querySelector(
                ".multi-filter-options"
            );

            const button = filter.element.querySelector(
                ".multi-filter-button"
            );

            optionsContainer.innerHTML = "";

            // SELECCIONAR TODAS

            const selectAllLabel = document.createElement("label");
            selectAllLabel.className =
                "multi-filter-option multi-filter-select-all";

            const selectAllCheckbox = document.createElement("input");
            selectAllCheckbox.type = "checkbox";
            selectAllCheckbox.setAttribute("data-select-all", "true");

            selectAllCheckbox.checked =
                values.length > 0 &&
                values.every(value => validSelected.includes(value));

            selectAllCheckbox.disabled = values.length === 0;

            const selectAllText = document.createElement("span");
            selectAllText.textContent = "Seleccionar Todas";

            selectAllLabel.appendChild(selectAllCheckbox);
            selectAllLabel.appendChild(selectAllText);

            optionsContainer.appendChild(selectAllLabel);

            // OPCIONES INDIVIDUALES

            values.forEach(value => {

                const label = document.createElement("label");
                label.className = "multi-filter-option";

                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.value = value;
                checkbox.checked = validSelected.includes(value);

                const text = document.createElement("span");
                text.textContent = value;

                label.appendChild(checkbox);
                label.appendChild(text);

                optionsContainer.appendChild(label);

            });

            // TEXTO DEL BOTÓN

            if (validSelected.length === 0) {
                button.textContent = filter.placeholder;
            } else if (validSelected.length === 1) {
                button.textContent = validSelected[0];
            } else {
                button.textContent =
                    validSelected.length + " opciones seleccionadas";
            }

        });

    }


    // =====================================================
    // PREPARAR FILTROS ALEATORIOS
    // =====================================================

    function populateRandomFilters() {

        updateRandomDependentFilters();

    }


    // =====================================================
    // CONECTAR EVENTOS DE LOS FILTROS ALEATORIOS
    // =====================================================

    function connectRandomFilterEvents() {

        const filters = getRandomFilterDefinitions();

        filters.forEach(filter => {

            const button = filter.element.querySelector(
                ".multi-filter-button"
            );

            // ABRIR Y CERRAR DESPLEGABLE

            button.addEventListener("click", event => {

                event.stopPropagation();

                const wasOpen =
                    filter.element.classList.contains("open");

                filters.forEach(other => {
                    other.element.classList.remove("open");
                });

                if (!wasOpen) {
                    filter.element.classList.add("open");
                }

            });

            // CAMBIOS EN LAS CASILLAS

            filter.element.addEventListener("change", event => {

                if (!event.target.matches('input[type="checkbox"]')) {
                    return;
                }

                if (event.target.hasAttribute("data-select-all")) {

                    const selectAll = event.target.checked;

                    filter.element.querySelectorAll(
                        'input[type="checkbox"]:not([data-select-all])'
                    ).forEach(checkbox => {
                        checkbox.checked = selectAll;
                    });

                }

                updateRandomDependentFilters();

            });

        });

    }


    // =====================================================
    // ELEGIR PELÍCULA O SERIE ALEATORIA
    // =====================================================

    function chooseRandomMovie() {

        const availableMovies = getRandomMoviesForFilter();

        elements.randomMovieGrid.innerHTML = "";

        elements.randomMovieEmpty.hidden = true;
        elements.randomMovieResult.hidden = true;

        if (availableMovies.length === 0) {

            elements.randomMovieEmpty.hidden = false;

            lastRandomMovie = null;

            return;

        }

        let candidates = availableMovies;

        // Evitar repetir inmediatamente la misma película.
        if (
            availableMovies.length > 1 &&
            lastRandomMovie
        ) {

            candidates = availableMovies.filter(movie =>
                movie.Codigo !== lastRandomMovie.Codigo
            );

        }

        const randomIndex = Math.floor(
            Math.random() * candidates.length
        );

        const selectedMovie = candidates[randomIndex];

        lastRandomMovie = selectedMovie;

        // Reutilizar la ficha original del catálogo.
        elements.randomMovieGrid.appendChild(
            createMovieCard(selectedMovie)
        );

        elements.randomMovieResult.hidden = false;

        elements.randomMovieResult.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }


    // =====================================================
    // ENTRAR Y SALIR DE PELÍCULAS ALEATORIAS
    // =====================================================

    function toggleRandomMovies() {

        if (isRandomMoviesView) {

            // VOLVER AL CATÁLOGO

            isRandomMoviesView = false;

            elements.randomMoviesSection.hidden = true;
            elements.filtersContainer.hidden = false;
            elements.catalogSection.hidden = false;

            elements.randomMoviesButton.textContent =
                "🎲 ¿Qué veré hoy?";

            elements.randomMoviesButton.classList.remove("active");

            elements.top10Button.hidden = false;
            elements.clearFilters.hidden = false;

            return;

        }

        // Si estamos en TOP 10, regresar primero al catálogo.
        if (isTop10View) {
            toggleTop10();
        }

        isRandomMoviesView = true;

        elements.randomMoviesSection.hidden = false;
        elements.filtersContainer.hidden = true;
        elements.catalogSection.hidden = true;

        elements.randomMoviesButton.textContent =
            "↩ Volver al catálogo";

        elements.randomMoviesButton.classList.add("active");

        elements.top10Button.hidden = true;
        elements.clearFilters.hidden = true;

        elements.randomMovieResult.hidden = true;
        elements.randomMovieEmpty.hidden = true;

        elements.randomMovieGrid.innerHTML = "";

        lastRandomMovie = null;

        updateRandomDependentFilters();

        elements.randomMoviesSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

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
			filter.querySelectorAll(
				'input[type="checkbox"]:checked:not([data-select-all])'
			)
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
			"Sub Español",
			"Sub Ingles",
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

			// =================================================
			// OPCIÓN SELECCIONAR TODAS
			// =================================================

			const selectAllLabel = document.createElement("label");

			selectAllLabel.className =
				"multi-filter-option multi-filter-select-all";

			const selectAllCheckbox = document.createElement("input");

			selectAllCheckbox.type = "checkbox";
			selectAllCheckbox.setAttribute("data-select-all", "true");

			selectAllCheckbox.checked =
				values.length > 0 &&
				values.every(value => selected.includes(value));

			selectAllCheckbox.disabled = values.length === 0;

			const selectAllText = document.createElement("span");

			selectAllText.textContent = "Seleccionar Todas";

			selectAllLabel.appendChild(selectAllCheckbox);
			selectAllLabel.appendChild(selectAllText);

			optionsContainer.appendChild(selectAllLabel);


			// =================================================
			// OPCIONES INDIVIDUALES
			// =================================================

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
		
		if (isTop10View) {
			filteredMovies = getTop10Movies();
			currentPage = 1;
			renderCatalog();
			return;
		}

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
	
	// =====================================================
	// DETERMINAR SI UNA PELÍCULA ES NUEVA
	// =====================================================

	function esNuevo(movie) {

		const mode = CONFIG.NEW_BADGE_MODE || "days";

		if (mode === "off") return false;

		const fechaPelicula = convertirFecha(movie["Fecha Ingreso"]);

		if (!fechaPelicula) return false;

		// Comprobar vigencia de la etiqueta
		const [dia, mes, año] = String(movie["Fecha Ingreso"])
			.trim().split("/").map(Number);

		const fechaIngreso = new Date(año, mes - 1, dia);
		const hoy = new Date();

		hoy.setHours(0, 0, 0, 0);

		const diferencia = Math.floor(
			(hoy - fechaIngreso) / 86400000
		);

		const diasMaximos = CONFIG.NEW_BADGE_DAYS || 30;

		if (diferencia < 0 || diferencia > diasMaximos) {
			return false;
		}

		// Ordenar películas por fecha de ingreso
		const peliculasConFecha = allMovies
			.map(item => ({
				movie: item,
				fecha: convertirFecha(item["Fecha Ingreso"])
			}))
			.filter(item => item.fecha > 0)
			.sort((a, b) => b.fecha - a.fecha);

		// MODO POR DÍAS: solo la película más reciente
		if (mode === "days") {
			return fechaPelicula === peliculasConFecha[0].fecha;
		}

		// MODO POR CANTIDAD: últimas N películas vigentes
		if (mode === "count") {
			const cantidad = CONFIG.NEW_BADGE_COUNT || 10;

			return peliculasConFecha
				.slice(0, cantidad)
				.some(item => item.movie.Codigo === movie.Codigo);
		}

		return false;
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
	
	function getTop10Movies() {

		return [...allMovies]
			.map((movie, index) => ({
				movie: movie,
				value: Number(
					String(movie.TOP ?? "").trim().replace(",", ".")
				),
				originalIndex: index
			}))
			.filter(item => Number.isFinite(item.value) && item.value > 0)
			.sort((a, b) =>
				b.value - a.value || a.originalIndex - b.originalIndex
			)
			.slice(0, 10)
			.map(item => item.movie);
	}

	function getTopPosition(movie) {

		const top10 = getTop10Movies();

		return top10.findIndex(item =>
			item.Codigo === movie.Codigo
		) + 1;
	}
	
	function setTop10ControlsDisabled(disabled) {

		elements.searchInput.disabled = disabled;
		elements.clearSearch.disabled = disabled;
		elements.sortFilter.disabled = disabled;
		elements.clearFilters.disabled = disabled;

		const filters = [
			elements.genreFilter,
			elements.yearFilter,
			elements.languageFilter,
			elements.qualityFilter
		];

		filters.forEach(filter => {

			const button = filter.querySelector(".multi-filter-button");

			if (button) button.disabled = disabled;

			filter.querySelectorAll('input[type="checkbox"]')
				.forEach(checkbox => {
					checkbox.disabled = disabled;
				});

			filter.classList.remove("open");

		});
	}


	function toggleTop10() {

		if (isRandomMoviesView) {
			toggleRandomMovies();
		}

		isTop10View = !isTop10View;

		if (isTop10View) {

			// Limpiar búsquedas y filtros anteriores.
			elements.searchInput.value = "";
			elements.clearSearch.classList.remove("visible");

			const filters = [
				elements.genreFilter,
				elements.yearFilter,
				elements.languageFilter,
				elements.qualityFilter
			];

			filters.forEach(filter => {
				filter.querySelectorAll('input[type="checkbox"]')
					.forEach(checkbox => {
						checkbox.checked = false;
					});
			});

			updateDependentFilters();

			elements.sortFilter.value = "date-desc";

			// Mostrar únicamente el TOP 10.
			filteredMovies = getTop10Movies();

			elements.top10Button.textContent = "↩ Ver catálogo";
			elements.top10Button.classList.add("active");

			setTop10ControlsDisabled(true);

		} else {

			elements.top10Button.textContent = "★ TOP 10";
			elements.top10Button.classList.remove("active");

			setTop10ControlsDisabled(false);

			// Recuperar el catálogo completo.
			clearFilters();

			return;
		}

		currentPage = 1;

		renderCatalog();

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
		
		const topPosition = getTopPosition(movie);

		if (topPosition > 0) {
			const topBadge = document.createElement("span");
			topBadge.className = "top-badge";
			topBadge.textContent = `★ TOP ${topPosition}`;
			posterContainer.appendChild(topBadge);
		}

		// Etiqueta NUEVO

		if (esNuevo(movie)) {

			const newBadge = document.createElement("span");

			newBadge.className =
				"new-badge new-badge-" +
				(CONFIG.NEW_BADGE_STYLE || "ribbon");
			newBadge.textContent = "NUEVO";

			posterContainer.appendChild(newBadge);

		}
		
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

        if (elements.resultsTitle) {
			elements.resultsTitle.textContent = isTop10View
				? "TOP 10 - Películas y Series Más Vistas"
				: "Resultados en el Catálogo";
		}

		elements.resultsInfo.textContent = isTop10View
			? "Las 10 películas y series con mayor TOP"
			: totalResults === 1
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
		
		currentDetailMovie = movie;

		elements.addToCart.textContent = "🛒 Agregar al Carrito";
		elements.addToCart.classList.remove("added");
		elements.cartFeedback.hidden = true;

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
	
	/* =========================================================
	   VISOR AMPLIADO DE POSTER
	   ========================================================= */

	let posterZoom = 1;
	let posterPositionX = 0;
	let posterPositionY = 0;

	let posterPointers = new Map();
	let posterInitialPinchDistance = 0;
	let posterInitialPinchZoom = 1;
	let posterLastPointerX = 0;
	let posterLastPointerY = 0;

	function updatePosterTransform() {

		elements.posterViewerImage.style.transform =
			`translate(${posterPositionX}px, ${posterPositionY}px) scale(${posterZoom})`;

	}

	function resetPosterZoom() {

		posterZoom = 1;
		posterPositionX = 0;
		posterPositionY = 0;

		updatePosterTransform();

	}

	function changePosterZoom(amount) {

		posterZoom = Math.min(
			6,
			Math.max(1, posterZoom + amount)
		);

		if (posterZoom === 1) {
			posterPositionX = 0;
			posterPositionY = 0;
		}

		updatePosterTransform();

	}

	function openPosterViewer() {

		const posterUrl = elements.detailPoster.src;

		if (!posterUrl || elements.detailPoster.style.display === "none") {
			return;
		}

		elements.posterViewerImage.src = posterUrl;
		elements.posterViewerImage.alt = elements.detailPoster.alt;

		resetPosterZoom();

		elements.posterViewer.classList.add("active");

		document.body.style.overflow = "hidden";

	}

	function closePosterViewer() {

		elements.posterViewer.classList.remove("active");

		document.body.style.overflow = "";

		posterPointers.clear();

		resetPosterZoom();

		elements.posterViewerImage.removeAttribute("src");

	}

	/* =========================================================
	   EVENTOS DEL VISOR
	   ========================================================= */

	function connectPosterViewerEvents() {

		// Abrir al hacer clic en el póster de la ficha.
		elements.detailPoster.addEventListener(
			"click",
			openPosterViewer
		);

		// Cerrar visor.
		elements.closePosterViewer.addEventListener(
			"click",
			closePosterViewer
		);

		// Controles de zoom.
		elements.zoomIn.addEventListener("click", () => {
			changePosterZoom(0.5);
		});

		elements.zoomOut.addEventListener("click", () => {
			changePosterZoom(-0.5);
		});

		elements.resetZoom.addEventListener(
			"click",
			resetPosterZoom
		);

		// Cerrar al hacer clic fuera de la imagen.
		elements.posterViewerArea.addEventListener("click", event => {

			if (event.target === elements.posterViewerArea) {
				closePosterViewer();
			}

		});

		// Zoom con rueda del ratón.
		elements.posterViewerArea.addEventListener(
			"wheel",
			event => {

				event.preventDefault();

				changePosterZoom(
					event.deltaY < 0 ? 0.25 : -0.25
				);

			},
			{ passive: false }
		);

		// Inicio del movimiento y del gesto de pellizco.
		elements.posterViewerArea.addEventListener(
			"pointerdown",
			event => {

				event.preventDefault();

				elements.posterViewerArea.setPointerCapture(event.pointerId);

				posterPointers.set(event.pointerId, {
					x: event.clientX,
					y: event.clientY
				});

				if (posterPointers.size === 1) {

					posterLastPointerX = event.clientX;
					posterLastPointerY = event.clientY;

				} else if (posterPointers.size === 2) {

					const points = Array.from(posterPointers.values());

					posterInitialPinchDistance = Math.hypot(
						points[1].x - points[0].x,
						points[1].y - points[0].y
					);

					posterInitialPinchZoom = posterZoom;

				}

			}
		);

		// Movimiento: arrastrar o ampliar con dos dedos.
		elements.posterViewerArea.addEventListener(
			"pointermove",
			event => {

				if (!posterPointers.has(event.pointerId)) return;

				posterPointers.set(event.pointerId, {
					x: event.clientX,
					y: event.clientY
				});

				if (posterPointers.size === 1 && posterZoom > 1) {

					posterPositionX += event.clientX - posterLastPointerX;
					posterPositionY += event.clientY - posterLastPointerY;

					posterLastPointerX = event.clientX;
					posterLastPointerY = event.clientY;

					updatePosterTransform();

				} else if (posterPointers.size === 2) {

					const points = Array.from(posterPointers.values());

					const currentDistance = Math.hypot(
						points[1].x - points[0].x,
						points[1].y - points[0].y
					);

					if (posterInitialPinchDistance > 0) {

						posterZoom = Math.min(
							6,
							Math.max(
								1,
								posterInitialPinchZoom *
								currentDistance / posterInitialPinchDistance
							)
						);

						updatePosterTransform();

					}

				}

			}
		);

		// Finalizar movimiento.
		function releasePosterPointer(event) {

			posterPointers.delete(event.pointerId);

			if (posterPointers.size === 1) {

				const point = Array.from(posterPointers.values())[0];

				posterLastPointerX = point.x;
				posterLastPointerY = point.y;

			}

			if (posterPointers.size < 2) {
				posterInitialPinchDistance = 0;
			}

		}

		elements.posterViewerArea.addEventListener(
			"pointerup",
			releasePosterPointer
		);

		elements.posterViewerArea.addEventListener(
			"pointercancel",
			releasePosterPointer
		);

		// Cerrar con ESC.
		document.addEventListener("keydown", event => {

			if (
				event.key === "Escape" &&
				elements.posterViewer.classList.contains("active")
			) {
				closePosterViewer();
			}

		});

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
		
		connectPosterViewerEvents();
		
		connectRandomFilterEvents();

		elements.randomMoviesButton.addEventListener(
			"click",
			toggleRandomMovies
		);

		elements.chooseRandomMovie.addEventListener(
			"click",
			chooseRandomMovie
		);

		elements.backToCatalog.addEventListener(
			"click",
			toggleRandomMovies
		);
		
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

					// Si se seleccionó o deseleccionó "Seleccionar todas".

					if (event.target.hasAttribute("data-select-all")) {

						const selectAll = event.target.checked;

						filter.element.querySelectorAll(
							'input[type="checkbox"]:not([data-select-all])'
						).forEach(checkbox => {

							checkbox.checked = selectAll;

						});

					}

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

		// Boton TOP 10
		
		elements.top10Button.addEventListener(
			"click",
			toggleTop10
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
		
		// =====================================================
		// EVENTOS DEL CARRITO
		// =====================================================

		elements.cartButton.addEventListener("click", openCart);

		elements.backFromCart.addEventListener("click", closeCart);

		elements.addToCart.addEventListener("click", addMovieToCart);

		elements.clearCart.addEventListener("click", clearShoppingCart);
		
		elements.makeOrder.addEventListener("click", makeWhatsAppOrder);

		// Eliminar títulos individualmente
		elements.cartList.addEventListener("click", event => {

			// Si se presiona el botón de eliminar
			const button = event.target.closest(".remove-cart-item");

			if (button) {
				removeCartItem(button.dataset.cartKey);
				return;
			}

			// Si se presiona cualquier otra parte de la película
			const cartItemElement = event.target.closest(".cart-item");

			if (!cartItemElement) return;

			const key = cartItemElement.dataset.cartKey;

			const item = cartItems.find(item => item.key === key);

			if (!item) return;

			const movie = findCartMovie(item);

			if (movie) {
				openDetails(movie);
			}
		});

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
		
		loadCart();
		
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
			populateRandomFilters();

            // 5. Preparar resultados
			
			elements.sortFilter.value = "date-desc";
			
            filteredMovies = [...allMovies];

            sortMovies();

            currentPage = 1;

            // 6. Mostrar catálogo

            renderCatalog();

            elements.loadingMessage.hidden = true;

            if (CONFIG.DEBUG) {
                console.log("Catálogo Iniciado Correctamente.");
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