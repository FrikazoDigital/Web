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
	
	// CONFIGURACIÓN DE PELÍCULAS RELACIONADAS
	const INCLUIR_PELICULA_ACTUAL_EN_RELACIONES = true;

    let allMovies = [];
    let filteredMovies = [];

    let currentPage = 1;
	let currentCollectionPage = 1;
	
	let isTop10View = false;
	let isRandomMoviesView = false;

	let lastRandomMovie = null;
	
	// PELÍCULAS Y SERIES DEL BANNER
	let bannerMovies = [];
	let qualityPopup = null;
	let qualityPopupEventsConnected = false;
	
	// =====================================================
	// CARRITO DE COMPRAS
	// =====================================================

	const CART_STORAGE_KEY = "frikazoDigitalCart";

	let cartItems = [];
	let currentDetailMovie = null;
	
	// =====================================================
	// MI COLECCIÓN
	// =====================================================

	const COLLECTION_STORAGE_KEY = "frikazoDigitalCollection";

	let collectionItems = {
		favorites: [],
		watched: [],
		obtained: []
	};

	let currentCollectionType = "favorites";
	
	// =====================================================
	// PREFERENCIA DE INFORMACIÓN EN LAS TARJETAS
	// =====================================================

	const MOVIE_META_STORAGE_KEY = "frikazoDigitalMovieMeta";

	const VALID_MOVIE_META_OPTIONS = [
		"Idioma",
		"Duracion",
		"Calidad Visual",
		"Tamaño"
	];

	let currentMovieMeta = "Idioma";
	
	// =====================================================
	// CARGAR PREFERENCIA DE INFORMACIÓN EN LAS TARJETAS
	// =====================================================

	function loadMovieMetaPreference() {

		const savedPreference = localStorage.getItem(
			MOVIE_META_STORAGE_KEY
		);

		currentMovieMeta = VALID_MOVIE_META_OPTIONS.includes(savedPreference)
			? savedPreference
			: "Idioma";

		elements.movieMetaSelector.value = currentMovieMeta;

	}

    // =====================================================
    // ELEMENTOS HTML
    // =====================================================

    const elements = {

        brandName: document.getElementById("brandName"),
        brandLogo: document.getElementById("brandLogo"),

        totalTitles: document.getElementById("totalTitles"),
        totalPosters: document.getElementById("totalPosters"),

        searchInput: document.getElementById("searchInput"),
		heroSection: document.querySelector(".hero"),
        clearSearch: document.getElementById("clearSearch"),
		searchButton: document.getElementById("searchButton"),
		catalogResultsSection: document.getElementById("catalogResultsSection"),

        genreFilter: document.getElementById("genreFilter"),
        yearFilter: document.getElementById("yearFilter"),
        languageFilter: document.getElementById("languageFilter"),
		qualityFilter: document.getElementById("qualityFilter"),
		favoritesFilter: document.getElementById("favoritesFilter"),
		watchedFilter: document.getElementById("watchedFilter"),
		obtainedFilter: document.getElementById("obtainedFilter"),
        sortFilter: document.getElementById("sortFilter"),

        clearFilters: document.getElementById("clearFilters"),
		movieMetaSelector: document.getElementById("movieMetaSelector"),
		top10Button: document.getElementById("top10Button"),
		resultsTitle: document.getElementById("resultsTitle"),
		
		// PELÍCULAS ALEATORIAS
		randomMoviesButton: document.getElementById("randomMoviesButton"),
		randomMoviesSection: document.getElementById("randomMoviesSection"),
		randomGenreFilter: document.getElementById("randomGenreFilter"),
		randomYearFilter: document.getElementById("randomYearFilter"),
		randomFavoritesFilter: document.getElementById("randomFavoritesFilter"),
		randomWatchedFilter: document.getElementById("randomWatchedFilter"),
		randomObtainedFilter: document.getElementById("randomObtainedFilter"),
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
		pricesPdfButton: document.getElementById("pricesPdfButton"),
		emptyCart: document.getElementById("emptyCart"),
		clearCart: document.getElementById("clearCart"),
		backFromCart: document.getElementById("backFromCart"),
		addToCart: document.getElementById("addToCart"),
		cartFeedback: document.getElementById("cartFeedback"),
		filtersSection: document.querySelector(".filters-section"),
		searchTrailer: document.getElementById("searchTrailer"),
		
		// MI COLECCIÓN - FICHA DE DETALLES
        collectionFavoriteButton: document.getElementById("collectionFavoriteButton"),
        collectionWatchedButton: document.getElementById("collectionWatchedButton"),
        collectionObtainedButton: document.getElementById("collectionObtainedButton"),
        collectionFeedback: document.getElementById("collectionFeedback"),
		collectionImportFeedback: document.getElementById("collectionImportFeedback"),
		
		relatedSagas: document.getElementById("relatedSagas"),
		relatedSagasPosters: document.getElementById("relatedSagasPosters"),
		relatedUniverses: document.getElementById("relatedUniverses"),
		relatedUniversesPosters: document.getElementById("relatedUniversesPosters"),
		relatedAdaptations: document.getElementById("relatedAdaptations"),
		relatedAdaptationsPosters: document.getElementById("relatedAdaptationsPosters"),
		
		exportCollectionButton: document.getElementById("exportCollectionButton"),
		importCollectionButton: document.getElementById("importCollectionButton"),
		importCollectionFile: document.getElementById("importCollectionFile"),
		clearCollectionButton: document.getElementById("clearCollectionButton"),
		
		// MI COLECCIÓN
		myCollectionButton: document.getElementById("myCollectionButton"),
		myCollectionSection: document.getElementById("myCollectionSection"),
		collectionInfo: document.getElementById("collectionInfo"),
		collectionTabs: document.querySelector(".collection-tabs"),
		collectionGrid: document.getElementById("collectionGrid"),
		collectionPagination: document.getElementById("collectionPagination"),
		emptyCollection: document.getElementById("emptyCollection"),
		emptyCollectionTitle: document.getElementById("emptyCollectionTitle"),
		emptyCollectionText: document.getElementById("emptyCollectionText"),
		backFromCollection: document.getElementById("backFromCollection"),
		favoritesCount: document.getElementById("favoritesCount"),
		watchedCount: document.getElementById("watchedCount"),
		obtainedCount: document.getElementById("obtainedCount"),

		// BANNER ANIMADO
        movieBanner: document.getElementById("movieBanner"),
        movieBannerTrack: document.getElementById("movieBannerTrack")

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
	
	// =====================================================
	// FUNCIONES DE MI COLECCIÓN
	// =====================================================


	// Cargar Mi Colección desde localStorage
	function loadCollection() {

		try {

			const savedCollection = localStorage.getItem(
				COLLECTION_STORAGE_KEY
			);

			if (savedCollection) {

				const parsedCollection = JSON.parse(savedCollection);

				if (
					parsedCollection &&
					typeof parsedCollection === "object" &&
					!Array.isArray(parsedCollection)
				) {

					collectionItems = {
						favorites: Array.isArray(parsedCollection.favorites)
							? parsedCollection.favorites
							: [],

						watched: Array.isArray(parsedCollection.watched)
							? parsedCollection.watched
							: [],

						obtained: Array.isArray(parsedCollection.obtained)
							? parsedCollection.obtained
							: []
					};

				}

			}

			// Validar los elementos almacenados.
			Object.keys(collectionItems).forEach(type => {

				collectionItems[type] = collectionItems[type].filter(item =>
					item &&
					typeof item.key === "string" &&
					typeof item.title === "string"
				);

			});

		} catch (error) {

			console.error("Error al cargar Mi Colección:", error);

			collectionItems = {
				favorites: [],
				watched: [],
				obtained: []
			};

		}

		updateCollectionCounts();

	}


	// Guardar Mi Colección en localStorage
	function saveCollection() {

		try {

			localStorage.setItem(
				COLLECTION_STORAGE_KEY,
				JSON.stringify(collectionItems)
			);

		} catch (error) {

			console.error("Error al guardar Mi Colección:", error);

			alert("No fue posible guardar Mi Colección en este navegador.");

		}

		updateCollectionCounts();

	}
	
	// =========================================================
	// EXPORTAR MI COLECCIÓN
	// =========================================================

	function exportCollection() {

		const exportData = {
			version: 1,
			exportedAt: new Date().toISOString(),
			favorites: collectionItems.favorites,
			watched: collectionItems.watched,
			obtained: collectionItems.obtained
		};

		const json = JSON.stringify(exportData, null, 4);

		const blob = new Blob([json], {
			type: "application/json"
		});

		const url = URL.createObjectURL(blob);

		const link = document.createElement("a");
		link.href = url;
		link.download = "Frikazo Digital - Mi Coleccion.json";

		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		setTimeout(() => {
			URL.revokeObjectURL(url);
		}, 1000);
		
		// Mostrar mensaje de confirmación.
		elements.collectionImportFeedback.textContent =
			"¡Mi Colección Se Exportó Correctamente!";

		elements.collectionImportFeedback.hidden = false;

	}
	
	// =========================================================
	// IMPORTAR MI COLECCIÓN
	// =========================================================

	function importCollection(file) {

		const reader = new FileReader();

		reader.onload = () => {

			try {

				const importedData = JSON.parse(reader.result);

				const types = [
					"favorites",
					"watched",
					"obtained"
				];

				// Validar la estructura general del archivo.
				if (
					!importedData ||
					typeof importedData !== "object" ||
					!types.every(type => Array.isArray(importedData[type]))
				) {
					throw new Error("El Archivo No tiene una Estructura Válida.");
				}

				// Validar todos los registros antes de modificar la colección.
				for (const type of types) {

					const validItems = importedData[type].every(item =>
						item &&
						typeof item.key === "string" &&
						typeof item.title === "string" &&
						item.key.trim() !== "" &&
						item.title.trim() !== ""
					);

					if (!validItems) {
						throw new Error("El Archivo contiene Registros No Válidos.");
					}

				}

				// Preparar la combinación sin modificar todavía los datos actuales.
				const mergedCollection = {};

				types.forEach(type => {

					const items = new Map();

					// Incorporar los títulos que ya existen.
					collectionItems[type].forEach(item => {

						const title = item.title.trim();
						const key = normalize(title);

						if (key) {
							items.set(key, {
								key: key,
								title: title
							});
						}

					});

					// Incorporar los títulos del archivo importado.
					importedData[type].forEach(item => {

						const title = item.title.trim();
						const key = normalize(title);

						if (key && !items.has(key)) {

							items.set(key, {
								key: key,
								title: title
							});

						}

					});

					mergedCollection[type] = Array.from(items.values());

				});

				// Aplicar la combinación.
				collectionItems = mergedCollection;

				// Guardar y actualizar la interfaz.
				saveCollection();

				filterMovies();

				updateCollectionButtons();

				elements.collectionImportFeedback.textContent =
					"¡Mi Colección se Importó y Combinó Correctamente!";

				elements.collectionImportFeedback.hidden = false;

			} catch (error) {

				console.error("Error al Importar Mi Colección:", error);

				elements.collectionImportFeedback.textContent =
					"No se Pudo Importar el Archivo. Verifica Que Sea Un Archivo JSON Válido de Mi Colección.";

				elements.collectionImportFeedback.hidden = false;

			}

		};

		reader.onerror = () => {

			elements.collectionImportFeedback.textContent =
				"No se Pudo Leer el Archivo Seleccionado.";

			elements.collectionImportFeedback.hidden = false;

		};

		reader.readAsText(file);

	}

	// Actualizar contadores de las categorías
	function updateCollectionCounts() {

		elements.favoritesCount.textContent =
			collectionItems.favorites.length;

		elements.watchedCount.textContent =
			collectionItems.watched.length;

		elements.obtainedCount.textContent =
			collectionItems.obtained.length;

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

					// INDICADOR DE AMPLIACIÓN
					const zoomHint = document.createElement("span");
					zoomHint.className = "poster-zoom-hint";
					zoomHint.innerHTML = `
						<svg viewBox="0 0 24 24" aria-hidden="true">
							<circle cx="10.8" cy="10.8" r="6.8"></circle>
							<path d="m16 16 5 5"></path>
							<path d="M10.8 7.5v6.6"></path>
							<path d="M7.5 10.8h6.6"></path>
						</svg>
					`;

					posterContainer.appendChild(zoomHint);
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

			removeButton.textContent = "×";

			removeButton.title = "Eliminar del Carrito";

			removeButton.setAttribute("aria-label", "Eliminar " + item.title);

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
	
	// Boton PDF Precios Combos Promociones
	function openPricesPDF() {

		const pdfURL = CONFIG.PRICES_PDF_URL;

		if (!pdfURL) {
			alert("No se ha configurado el enlace del PDF de precios.");
			return;
		}

		window.open(pdfURL, "_blank", "noopener,noreferrer");

	}
	
	// Crear pedido y abrir WhatsApp
	function makeWhatsAppOrder() {

		if (cartItems.length === 0) {
			alert("Tu carrito está Vacío. Agrega Películas o Series antes de hacer un Pedido.");
			return;
		}
		
		 // Convertir MB a MB o GB
		function formatSize(sizeMB) {
			const size = Number(
				String(sizeMB ?? "").trim().replace(",", ".")
			);

			if (!Number.isFinite(size) || size < 0) {
				return "No disponible";
			}

			if (size >= 1024) {
				return `${(size / 1024).toFixed(2)} GB`;
			}

			return `${Math.round(size)} MB`;
		}
		
		function formatCurrency(value) {
			return "$" + Number(value).toLocaleString("es-CO", {
				maximumFractionDigits: 0
			});
		}
		
		let totalSizeMB = 0;
		let totalPrice = 0;
		let totalTickets = 0;
		
		let missingSizes = false;
		let missingPrices = false;
		
		const movieList = cartItems
			.map((item, index) => {

				const movie = findCartMovie(item);

				const year = movie
					? movie["Año"] || "No disponible"
					: "No disponible";

				const genre = movie
					? movie.Genero || "No disponible"
					: "No disponible";
				
				// Calcular tamaño
				const sizeMB = movie
					? Number(String(movie["Tamaño (MB)"] ?? "").trim().replace(",", "."))
					: NaN;

				let sizeText;
				
				if (Number.isFinite(sizeMB) && sizeMB >= 0) {
					totalSizeMB += sizeMB;
					sizeText = formatSize(sizeMB);
				} else {
					sizeText = "No disponible";
					missingSizes = true;
				}
				
				// Determinar si es serie
				const isSeries = movie
					? normalize(movie.Genero) === normalize("Series")
					: false;

				// Determinar precio según el género
				let itemPrice = NaN;

				if (movie) {

					itemPrice = Number(
						isSeries
							? CONFIG.SERIES_PRICE
							: CONFIG.MOVIE_PRICE
					);
				}
				
				let priceText;
				let ticketsText;

				if (Number.isFinite(itemPrice) && itemPrice >= 0) {

					totalPrice += itemPrice;
					priceText = formatCurrency(itemPrice);

					const ticketValue = Number(CONFIG.TICKET_VALUE);

					if (Number.isFinite(ticketValue) && ticketValue > 0) {
						const itemTickets = Math.floor(itemPrice / ticketValue);

						totalTickets += itemTickets;
						ticketsText = itemTickets.toLocaleString("es-CO");
					} else {
						ticketsText = "No disponible";
					}

				} else {
					priceText = "No disponible";
					ticketsText = "No disponible";
					missingPrices = true;
				}
				
				const chaptersText = isSeries
					? `   📺 Capítulos: ${movie?.Capitulos || "No disponible"}\n`
					: "";

				return `${index + 1}. ${item.title}\n` +
					`   🎭 Género: ${genre}\n` +
					chaptersText +
					`   📅 Año: ${year}\n` +
					`   💾 Peso: ${sizeText}\n` +
					`   💰 Valor: ${priceText}\n` +
					`   🎟️ Tickets: ${ticketsText}`;

			})
			.join("\n\n");
		
		const totalSizeText = formatSize(totalSizeMB);
		const totalPriceText = missingPrices
			? "No disponible"
			: formatCurrency(totalPrice);
		
		const message =
			`¡Hola, Frikazo Digital! 👋\n\n` +
			`Quiero realizar el siguiente pedido:\n\n` +
			`${movieList}\n\n` +
			`🎬 Títulos Totales: ${cartItems.length}\n` +
			`💾 Peso Total: ${totalSizeText}\n` +
			`💰 Valor Total: ${totalPriceText}\n` +
			`🎟️ Tickets Totales: ${missingPrices ? "No disponible" : totalTickets.toLocaleString("es-CO")}\n\n` +
			`📢 Recuerda Ver los Combos y Promociones Vigentes para Aplicar a Descuentos !!!` +
			(missingSizes
				? `\n⚠️ Algunos Tamaños no están Disponibles en el Catálogo.`
				: "") +
			(missingPrices
				? `\n⚠️ Algunos Precios no están Disponibles.`
				: "") +
			`\n\nQuedo atento. ¡Muchas gracias!`;

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
		
		elements.heroSection.hidden = true;
		
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
		
		elements.heroSection.hidden = false;
		
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
	
	function getRelatedMovies(movie, field) {

		// Obtener los nombres relacionados del registro actual
		const relatedNames = String(movie[field] || "")
			.split(",")
			.map(name => normalize(name.trim()))
			.filter(Boolean);

		if (!relatedNames.length) {
			return [];
		}

		// Buscar películas y series que compartan alguna relación
		return allMovies.filter(candidate => {

			// EXCLUIR LA PELÍCULA ACTUAL SEGÚN LA CONFIGURACIÓN
			if (
				!INCLUIR_PELICULA_ACTUAL_EN_RELACIONES &&
				candidate.Codigo === movie.Codigo
			) {
				return false;
			}

			// Obtener las relaciones del mismo campo
			const candidateNames = String(candidate[field] || "")
				.split(",")
				.map(name => normalize(name.trim()))
				.filter(Boolean);

			// Comprobar si existe alguna coincidencia
			return relatedNames.some(name => candidateNames.includes(name));
		});
	}
	
	function renderRelatedMovies(movie) {

		const sections = [
			{
				field: "Saga",
				section: elements.relatedSagas,
				container: elements.relatedSagasPosters
			},
			{
				field: "Universo",
				section: elements.relatedUniverses,
				container: elements.relatedUniversesPosters
			},
			{
				field: "Adaptaciones",
				section: elements.relatedAdaptations,
				container: elements.relatedAdaptationsPosters
			}
		];

		sections.forEach(item => {

			item.container.innerHTML = "";

			let relatedMovies = getRelatedMovies(movie, item.field);

			// EXCLUIR LA PELÍCULA ACTUAL SI LA CONFIGURACIÓN LO INDICA
			if (!INCLUIR_PELICULA_ACTUAL_EN_RELACIONES) {

				relatedMovies = relatedMovies.filter(relatedMovie =>
					relatedMovie.Codigo !== movie.Codigo
				);

			}

			relatedMovies.forEach(relatedMovie => {

				const posterUrl = getMoviePoster(relatedMovie);

				if (!posterUrl) {
					return;
				}

				// BOTÓN PRINCIPAL
				const button = document.createElement("button");
				button.type = "button";
				button.className = "related-poster-button";
				button.title = relatedMovie.Titulo;

				// CONTENEDOR VISUAL DEL PÓSTER
				const posterContainer = document.createElement("div");
				posterContainer.className = "related-poster-visual";
				
				// IDENTIFICAR PELÍCULA ACTUAL
				if (
					INCLUIR_PELICULA_ACTUAL_EN_RELACIONES &&
					relatedMovie === movie
				) {
					posterContainer.classList.add(
						"related-poster-active",
						item.field.toLowerCase()
					);
				}

				// ETIQUETA NUEVO
				if (esNuevo(relatedMovie)) {

					const newBadge = document.createElement("span");

					newBadge.className =
						"new-badge new-badge-" +
						(CONFIG.NEW_BADGE_STYLE || "ribbon");

					newBadge.textContent = "NUEVO";

					posterContainer.appendChild(newBadge);
				}

				// INDICADORES DE MI COLECCIÓN
				const collectionIcons = document.createElement("div");

				collectionIcons.className = "collection-status-icons";

				if (esNuevo(relatedMovie)) {
					collectionIcons.classList.add("has-new");
				}

				const statusDefinitions = [
					{
						type: "favorites",
						className: "favorite",
						label: "Favorita",
						svg: `
							<svg viewBox="0 0 24 24" aria-hidden="true">
								<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/>
							</svg>
						`
					},
					{
						type: "watched",
						className: "watched",
						label: "Vista",
						svg: `
							<svg viewBox="0 0 24 24" aria-hidden="true">
								<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/>
								<circle cx="12" cy="12" r="3"/>
							</svg>
						`
					},
					{
						type: "obtained",
						className: "obtained",
						label: "Obtenida",
						svg: `
							<svg viewBox="0 0 24 24" aria-hidden="true">
								<path d="M3 7h18v13H3z"/>
								<path d="M3 7l2-4h14l2 4"/>
								<path d="M12 11v6"/>
								<path d="m9 14 3 3 3-3"/>
							</svg>
						`
					}
				];

				statusDefinitions.forEach(status => {

					if (isInCollection(status.type, relatedMovie)) {

						const icon = document.createElement("span");

						icon.className =
							`collection-status-icon ${status.className}`;

						icon.innerHTML = status.svg;
						icon.title = status.label;
						icon.setAttribute("aria-label", status.label);
						icon.setAttribute("role", "img");

						collectionIcons.appendChild(icon);
					}
				});

				if (collectionIcons.children.length > 0) {
					posterContainer.appendChild(collectionIcons);
				}

				// IMAGEN
				const img = document.createElement("img");

				img.className = "related-poster-image";
				img.src = posterUrl;
				img.alt = "Póster de " + relatedMovie.Titulo;
				img.loading = "lazy";

				posterContainer.appendChild(img);

				// AÑO DE ESTRENO
				const year = document.createElement("span");

				year.className = "related-poster-year";
				year.textContent = relatedMovie["Año"] || "";

				// NAVEGACIÓN
				button.addEventListener("click", () => {
					openDetails(relatedMovie);
				});

				button.appendChild(posterContainer);
				button.appendChild(year);

				item.container.appendChild(button);
			});

			item.section.hidden = item.container.children.length === 0;
		});
	}
	
	// =====================================================
    // BANNER ANIMADO DE PELÍCULAS Y SERIES
    // =====================================================

    // Mezclar aleatoriamente un arreglo.
    function shuffleBannerArray(array) {

        const shuffled = [...array];

        for (let i = shuffled.length - 1; i > 0; i--) {

            const j = Math.floor(Math.random() * (i + 1));

            [shuffled[i], shuffled[j]] =
                [shuffled[j], shuffled[i]];

        }

        return shuffled;

    }


    // Seleccionar dos títulos aleatorios por género.
    function getBannerMovies() {

        const genres = new Map();

        allMovies.forEach(movie => {

            const genre = String(movie.Genero || "").trim();

            if (!genre) return;

            const key = normalize(genre);

            if (!genres.has(key)) {

                genres.set(key, {
                    name: genre,
                    movies: []
                });

            }

            genres.get(key).movies.push(movie);

        });

        const selectedMovies = [];

        genres.forEach(group => {

            const shuffled = shuffleBannerArray(group.movies);

            const cantidad = CONFIG.BANNER_MOVIES_PER_CATEGORY || 2;

			selectedMovies.push(...shuffled.slice(0, cantidad));

        });

        // Mezclar también el orden de los géneros.
        return shuffleBannerArray(selectedMovies);

    }


    // Crear una tarjeta del banner.
    function createBannerCard(movie, index) {

        const button = document.createElement("button");

        button.type = "button";
        button.className = "movie-banner-card";

        button.dataset.movieIndex = index;

        button.setAttribute(
            "aria-label",
            "Ver detalles de " + movie.Titulo
        );

        // PÓSTER
        const poster = document.createElement("div");

        poster.className = "movie-banner-poster";

        const posterUrl = getMoviePoster(movie);

        if (posterUrl) {

            const image = document.createElement("img");

            image.src = posterUrl;
            image.alt = "Póster de " + movie.Titulo;

            image.addEventListener("error", () => {

                image.remove();

                const placeholder = document.createElement("span");

                placeholder.className = "movie-banner-placeholder";
                placeholder.textContent = "🎬";

                poster.appendChild(placeholder);

            });

            poster.appendChild(image);

        } else {

            const placeholder = document.createElement("span");

            placeholder.className = "movie-banner-placeholder";
            placeholder.textContent = "🎬";

            poster.appendChild(placeholder);

        }
		
		// ETIQUETA NUEVO

        if (esNuevo(movie)) {

            const newBadge = document.createElement("span");

            newBadge.className =
                "new-badge new-badge-" +
                (CONFIG.NEW_BADGE_STYLE || "ribbon");

            newBadge.textContent = "NUEVO";

            poster.appendChild(newBadge);

        }
		
        // TÍTULO
        const title = document.createElement("span");

        title.className = "movie-banner-title";
        title.textContent = movie.Titulo;

        // GÉNERO
        const genre = document.createElement("span");

        genre.className = "movie-banner-genre";
        genre.textContent = movie.Genero || "";

        button.appendChild(poster);
        button.appendChild(title);
        button.appendChild(genre);

        return button;

    }


    // Crear una secuencia de tarjetas.
    function createBannerGroup(duplicate = false) {

        const group = document.createElement("div");

        group.className = "movie-banner-group";

        if (duplicate) {

            group.setAttribute("aria-hidden", "true");

        }

        bannerMovies.forEach((movie, index) => {

            const card = createBannerCard(movie, index);

            if (duplicate) {

                card.tabIndex = -1;

            }

            group.appendChild(card);

        });

        return group;

    }


    // Construir el banner.
    function initializeMovieBanner() {

        bannerMovies = getBannerMovies();

        elements.movieBannerTrack.innerHTML = "";

        if (bannerMovies.length === 0) {

            elements.movieBanner.hidden = true;

            return;

        }

        // Primera secuencia.
        const firstGroup = createBannerGroup();

        // Segunda secuencia idéntica para el movimiento infinito.
        const secondGroup = createBannerGroup(true);

        elements.movieBannerTrack.appendChild(firstGroup);
        elements.movieBannerTrack.appendChild(secondGroup);

        elements.movieBanner.hidden = false;

    }


    // =====================================================
	// EVENTOS DEL BANNER ANIMADO
	// =====================================================

	function connectMovieBannerEvents() {

		let startX = 0;
		let startTime = 0;
		let bannerAnimation = null;
		let bannerDuration = 0;
		let bannerWidth = 0;
		let isDragging = false;
		let suppressBannerClick = false;

		const track = elements.movieBannerTrack;
		const banner = elements.movieBanner;

		// -------------------------------------------------
		// ABRIR DETALLES AL HACER CLIC EN UNA PELÍCULA
		// -------------------------------------------------

		track.addEventListener("click", event => {

			// Evitar abrir detalles si el usuario estaba arrastrando.
			if (suppressBannerClick) {
				suppressBannerClick = false;
				return;
			}

			const card = event.target.closest(".movie-banner-card");

			if (!card) return;

			const index = Number(card.dataset.movieIndex);
			const movie = bannerMovies[index];

			if (movie) openDetails(movie);
		});

		// -------------------------------------------------
		// COMENZAR ARRASTRE
		// -------------------------------------------------

		track.addEventListener("pointerdown", event => {

			if (event.button !== 0) return;

			bannerAnimation = track.getAnimations()[0];

			if (!bannerAnimation) return;

			const firstGroup = track.querySelector(".movie-banner-group");

			if (!firstGroup) return;

			bannerDuration = bannerAnimation.effect.getTiming().duration;
			bannerWidth = firstGroup.scrollWidth;

			startX = event.clientX;
			startTime = Number(bannerAnimation.currentTime) || 0;

			isDragging = true;
			suppressBannerClick = false;

			// Pausar el movimiento automático.
			banner.classList.add("is-paused", "is-dragging");

			// Capturar el movimiento del mouse o dedo.
			const captureTarget = event.target.closest(".movie-banner-card");

			if (captureTarget) {
				captureTarget.setPointerCapture(event.pointerId);
			}

			//event.preventDefault();

		});

		// -------------------------------------------------
		// MOVER EL BANNER
		// -------------------------------------------------

		track.addEventListener("pointermove", event => {

			if (!isDragging || !bannerAnimation) return;

			const distance = event.clientX - startX;

			if (Math.abs(distance) > 5) {
				suppressBannerClick = true;
			}

			// Convertir el desplazamiento en tiempo
			// de animación para conservar el movimiento infinito.
			let newTime = startTime -
				(distance * bannerDuration / bannerWidth);

			// Mantener el tiempo dentro del ciclo.
			newTime = ((newTime % bannerDuration) + bannerDuration)
				% bannerDuration;

			bannerAnimation.currentTime = newTime;

		});

		// -------------------------------------------------
		// FINALIZAR ARRASTRE
		// -------------------------------------------------

		function finishBannerDrag() {

			if (!isDragging) return;

			isDragging = false;

			// Quitar estados de pausa y arrastre.
			banner.classList.remove("is-paused", "is-dragging");

			// Reanudar inmediatamente la animación.
			if (bannerAnimation) {
				bannerAnimation.play();
			}

		}

		track.addEventListener("pointerup", finishBannerDrag);

		track.addEventListener("pointercancel", finishBannerDrag);

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

		const filterMap = {
			genre: elements.randomGenreFilter,
			year: elements.randomYearFilter,
			favorites: elements.randomFavoritesFilter,
			watched: elements.randomWatchedFilter,
			obtained: elements.randomObtainedFilter
		};

		const filter = filterMap[filterKey];

		if (!filter) return [];

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
			},
			{
				key: "favorites",
				element: elements.randomFavoritesFilter,
				placeholder: "Todas",
				options: [
					{ value: "yes", label: "Favoritas" },
					{ value: "no", label: "No Favoritas" }
				]
			},
			{
				key: "watched",
				element: elements.randomWatchedFilter,
				placeholder: "Todas",
				options: [
					{ value: "yes", label: "Vistas" },
					{ value: "no", label: "No Vistas" }
				]
			},
			{
				key: "obtained",
				element: elements.randomObtainedFilter,
				placeholder: "Todas",
				options: [
					{ value: "yes", label: "Obtenidas" },
					{ value: "no", label: "No Obtenidas" }
				]
			}
		];
	}


    function getRandomMoviesForFilter(excludeFilter = null) {

		// Obtener selecciones de los cinco filtros
		const selectedGenre = getRandomSelectedValues("genre");
		const selectedYear = getRandomSelectedValues("year");

		const selectedFavorites = getRandomSelectedValues("favorites");
		const selectedWatched = getRandomSelectedValues("watched");
		const selectedObtained = getRandomSelectedValues("obtained");

		return allMovies.filter(movie => {

			// FILTRO GÉNERO
			const matchesGenre =
				excludeFilter === "genre" ||
				selectedGenre.length === 0 ||
				selectedGenre.includes(String(movie.Genero || ""));

			// FILTRO AÑO
			const matchesYear =
				excludeFilter === "year" ||
				selectedYear.length === 0 ||
				selectedYear.includes(String(movie["Año"] || ""));

			// FILTRO FAVORITAS
			const matchesFavorites =
				excludeFilter === "favorites" ||
				selectedFavorites.length === 0 ||
				selectedFavorites.length === 2 ||
				selectedFavorites.includes(
					isInCollection("favorites", movie) ? "yes" : "no"
				);

			// FILTRO VISTAS
			const matchesWatched =
				excludeFilter === "watched" ||
				selectedWatched.length === 0 ||
				selectedWatched.length === 2 ||
				selectedWatched.includes(
					isInCollection("watched", movie) ? "yes" : "no"
				);

			// FILTRO OBTENIDAS
			const matchesObtained =
				excludeFilter === "obtained" ||
				selectedObtained.length === 0 ||
				selectedObtained.length === 2 ||
				selectedObtained.includes(
					isInCollection("obtained", movie) ? "yes" : "no"
				);

			return (
				matchesGenre &&
				matchesYear &&
				matchesFavorites &&
				matchesWatched &&
				matchesObtained
			);

		});

	}


    function updateRandomDependentFilters() {

		const filters = getRandomFilterDefinitions();

		filters.forEach(filter => {

			const selected = getRandomSelectedValues(filter.key);

			let optionItems = [];

			// FILTROS DE OPCIONES FIJAS
			if (filter.options) {

				optionItems = filter.options;

			} else {

				// FILTROS DINÁMICOS: GÉNERO Y AÑO
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

				optionItems = values.map(value => ({
					value: value,
					label: value
				}));

			}

			// CONSERVAR SELECCIONES VÁLIDAS
			const validSelected = selected.filter(value =>
				optionItems.some(option => option.value === value)
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
				optionItems.length > 0 &&
				optionItems.every(option =>
					validSelected.includes(option.value)
				);

			selectAllCheckbox.disabled = optionItems.length === 0;

			const selectAllText = document.createElement("span");
			selectAllText.textContent = "Seleccionar Todas";

			selectAllLabel.appendChild(selectAllCheckbox);
			selectAllLabel.appendChild(selectAllText);

			optionsContainer.appendChild(selectAllLabel);

			// OPCIONES INDIVIDUALES

			optionItems.forEach(option => {

				const label = document.createElement("label");
				label.className = "multi-filter-option";

				const checkbox = document.createElement("input");
				checkbox.type = "checkbox";
				checkbox.value = option.value;
				checkbox.checked = validSelected.includes(option.value);

				const text = document.createElement("span");
				text.textContent = option.label;

				label.appendChild(checkbox);
				label.appendChild(text);

				optionsContainer.appendChild(label);

			});

			// TEXTO DEL BOTÓN

			if (
				validSelected.length === 0 ||
				(
					filter.options &&
					validSelected.length === optionItems.length
				)
			) {

				button.textContent = filter.placeholder;

			} else if (validSelected.length === 1) {

				const selectedOption = optionItems.find(option =>
					option.value === validSelected[0]
				);

				button.textContent = selectedOption.label;

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

			// RESTAURAR ELEMENTOS DEL CATÁLOGO

			elements.heroSection.hidden = false;
			elements.myCollectionButton.hidden = false;
			elements.cartButton.hidden = false;
			elements.randomMoviesButton.hidden = false;

			elements.randomMoviesButton.textContent =
				"🎲 ¿Qué Veré Hoy?";

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

		// OCULTAR ELEMENTOS QUE NO SE UTILIZAN EN ESTA VISTA

		elements.heroSection.hidden = true;
		elements.myCollectionButton.hidden = true;
		elements.cartButton.hidden = true;
		elements.randomMoviesButton.hidden = true;

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
			quality: elements.qualityFilter,
			favorites: elements.favoritesFilter,
			watched: elements.watchedFilter,
			obtained: elements.obtainedFilter
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
			"Music"
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
			},
			{
				key: "favorites",
				element: elements.favoritesFilter,
				placeholder: "Todas",
				options: [
					{ value: "yes", label: "Favoritas" },
					{ value: "no", label: "No Favoritas" }
				]
			},
			{
				key: "watched",
				element: elements.watchedFilter,
				placeholder: "Todas",
				options: [
					{ value: "yes", label: "Vistas" },
					{ value: "no", label: "No Vistas" }
				]
			},
			{
				key: "obtained",
				element: elements.obtainedFilter,
				placeholder: "Todas",
				options: [
					{ value: "yes", label: "Obtenidas" },
					{ value: "no", label: "No Obtenidas" }
				]
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
			quality: getSelectedFilterValues("quality"),
			favorites: getSelectedFilterValues("favorites"),
			watched: getSelectedFilterValues("watched"),
			obtained: getSelectedFilterValues("obtained")
		};

		return getMoviesForCurrentView().filter(movie => {

			const searchValues = [
				movie.Titulo,
				movie["Titulo Ingles"],
				movie.Saga,
				movie.Universo,
				movie.Adaptaciones,
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

			const matchesFavorites = excludeFilter === "favorites" ||
				selected.favorites.length === 0 ||
				selected.favorites.includes(
					isInCollection("favorites", movie) ? "yes" : "no"
				);

			const matchesWatched = excludeFilter === "watched" ||
				selected.watched.length === 0 ||
				selected.watched.includes(
					isInCollection("watched", movie) ? "yes" : "no"
				);

			const matchesObtained = excludeFilter === "obtained" ||
				selected.obtained.length === 0 ||
				selected.obtained.includes(
					isInCollection("obtained", movie) ? "yes" : "no"
				);

			return (
				matchesSearch &&
				matchesGenre &&
				matchesYear &&
				matchesLanguage &&
				matchesQuality &&
				matchesFavorites &&
				matchesWatched &&
				matchesObtained
			);

		});

	}


	// =====================================================
	// ACTUALIZAR OPCIONES DE LOS FILTROS
	// =====================================================

	function updateDependentFilters() {

		const filters = getFilterDefinitions();

		// =================================================
		// ELIMINAR SELECCIONES QUE YA NO TIENEN RESULTADOS
		// =================================================

		if (elements.myCollectionSection.hidden) {

			let changed = true;

			while (changed) {

				changed = false;

				filters.forEach(filter => {

					// Los filtros con opciones fijas no necesitan
					// comprobar disponibilidad en el catálogo.
					if (filter.options) return;

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

		}


		// =================================================
		// RECONSTRUIR LAS OPCIONES DISPONIBLES
		// =================================================

		filters.forEach(filter => {

			const selected = getSelectedFilterValues(filter.key);

			let options = [];

			// Los filtros de colección tienen opciones fijas.
			if (filter.options) {

				options = filter.options;

			} else {

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

				// Conservar opciones seleccionadas en Mi Colección.
				if (!elements.myCollectionSection.hidden) {

					values = [
						...new Set([
							...values,
							...selected
						])
					];

				}

				values.sort(filter.sort);

				options = values.map(value => ({
					value: value,
					label: value
				}));

			}


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
				options.length > 0 &&
				options.every(option => selected.includes(option.value));

			selectAllCheckbox.disabled = options.length === 0;

			const selectAllText = document.createElement("span");

			selectAllText.textContent = "Seleccionar Todas";

			selectAllLabel.appendChild(selectAllCheckbox);
			selectAllLabel.appendChild(selectAllText);

			optionsContainer.appendChild(selectAllLabel);


			// =================================================
			// OPCIONES INDIVIDUALES
			// =================================================

			options.forEach(option => {

				const label = document.createElement("label");

				label.className = "multi-filter-option";

				const checkbox = document.createElement("input");

				checkbox.type = "checkbox";
				checkbox.value = option.value;
				checkbox.checked = selected.includes(option.value);

				const text = document.createElement("span");

				text.textContent = option.label;

				label.appendChild(checkbox);
				label.appendChild(text);

				optionsContainer.appendChild(label);

			});


			// =================================================
			// ACTUALIZAR TEXTO DEL BOTÓN
			// =================================================

			const selectedOptions = options.filter(option =>
				selected.includes(option.value)
			);

			if (selectedOptions.length === 0) {

				button.textContent = filter.placeholder;

			} else if (selectedOptions.length === 1) {

				button.textContent = selectedOptions[0].label;

			} else {

				button.textContent =
					selectedOptions.length + " opciones seleccionadas";

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

		const selectedFavorites = getSelectedFilterValues("favorites");
		const selectedWatched = getSelectedFilterValues("watched");
		const selectedObtained = getSelectedFilterValues("obtained");

		filteredMovies = getMoviesForCurrentView().filter(movie => {

			const searchValues = [
				movie.Titulo,
				movie["Titulo Ingles"],
				movie.Saga,
				movie.Universo,
				movie.Adaptaciones,
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

			const matchesFavorites = selectedFavorites.length === 0 ||
				selectedFavorites.includes(
					isInCollection("favorites", movie) ? "yes" : "no"
				);

			const matchesWatched = selectedWatched.length === 0 ||
				selectedWatched.includes(
					isInCollection("watched", movie) ? "yes" : "no"
				);

			const matchesObtained = selectedObtained.length === 0 ||
				selectedObtained.includes(
					isInCollection("obtained", movie) ? "yes" : "no"
				);

			return (
				matchesSearch &&
				matchesGenre &&
				matchesYear &&
				matchesLanguage &&
				matchesQuality &&
				matchesFavorites &&
				matchesWatched &&
				matchesObtained
			);

		});

		sortMovies();

		currentPage = 1;

		if (!elements.myCollectionSection.hidden) {

			// Reiniciar paginación de Mi Colección
			currentCollectionPage = 1;

			renderCollection();

		} else {

			renderCatalog();

		}

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
			elements.qualityFilter,
			elements.favoritesFilter,
			elements.watchedFilter,
			elements.obtainedFilter
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
				elements.qualityFilter,
				elements.favoritesFilter,
				elements.watchedFilter,
				elements.obtainedFilter
			];

			filters.forEach(filter => {
				filter.querySelectorAll('input[type="checkbox"]')
					.forEach(checkbox => {
						checkbox.checked = false;
					});
			});

			updateDependentFilters();

			elements.sortFilter.value = "date-desc";

			// Ocultar buscador y filtros.
			elements.heroSection.hidden = true;
			elements.filtersContainer.hidden = true;

			// Ocultar botones de otras secciones,
			// conservando el botón TOP 10 para poder regresar.
			elements.filtersSection
				.querySelectorAll(".filters-heading button")
				.forEach(button => {
					if (button !== elements.top10Button) {
						button.hidden = true;
					}
				});

			// Mostrar únicamente el TOP 10.
			filteredMovies = getTop10Movies();

			elements.top10Button.textContent = "↩ Volver al Catálogo";
			elements.top10Button.classList.add("active");

			setTop10ControlsDisabled(true);

		} else {

			elements.top10Button.textContent = "🥇 TOP 10";
			elements.top10Button.classList.remove("active");

			// Restaurar buscador y filtros.
			elements.heroSection.hidden = false;
			elements.filtersContainer.hidden = false;

			// Restaurar botones de las demás secciones.
			elements.filtersSection
				.querySelectorAll(".filters-heading button")
				.forEach(button => {
					button.hidden = false;
				});

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
			topBadge.textContent = `🥇 TOP ${topPosition}`;
			posterContainer.appendChild(topBadge);
		}
		
		// ICONOS DE RELACIONES
		const relationIcons = document.createElement("div");

		relationIcons.className = "relation-type-icons";
		
		// Si existe la etiqueta TOP 10, identificarlo para ajustar la posición.
		if (topPosition > 0) {
			relationIcons.classList.add("has-top");
		}

		const relationDefinitions = [
			{
				field: "Saga",
				className: "saga",
				label: "Saga",
				svg: `
					<svg viewBox="0 0 24 24" aria-hidden="true">

						<path d="
							M12 12 L12 2.5
							M12 12 L20.2 7.25
							M12 12 L20.2 16.75
							M12 12 L12 21.5
							M12 12 L3.8 16.75
							M12 12 L3.8 7.25
						"/>

						<circle cx="12" cy="12" r="2.3"/>

						<circle cx="12" cy="2.5" r="1.5"/>
						<circle cx="20.2" cy="7.25" r="1.5"/>
						<circle cx="20.2" cy="16.75" r="1.5"/>
						<circle cx="12" cy="21.5" r="1.5"/>
						<circle cx="3.8" cy="16.75" r="1.5"/>
						<circle cx="3.8" cy="7.25" r="1.5"/>

					</svg>
				`
			},
			{
				field: "Universo",
				className: "universe",
				label: "Universo",
				svg: `
					<svg viewBox="0 0 24 24" aria-hidden="true">

						<!-- Planeta -->
						<circle cx="11.5" cy="12" r="5.5"/>

						<!-- Anillo orbital -->
						<ellipse
							cx="12"
							cy="12"
							rx="11"
							ry="3.2"
							transform="rotate(-30 12 12)"
						/>

						<!-- Detalle superior del planeta -->
						<path d="M15.5 7.2 Q17.5 5.5 19.5 5.2"/>

					</svg>
				`
			},
			{
				field: "Adaptaciones",
				className: "adaptation",
				label: "Adaptaciones",
				svg: `
					<svg viewBox="0 0 24 24" aria-hidden="true">

						<!-- Máscara sonriente frontal -->
						<path
							d="
								M2.5 5
								L11.5 3
								L13.5 13
								Q14.5 19 9 21
								Q3.5 21 3 15
								Z
							"
							fill="#ffffff"
							stroke="none"
						/>

						<!-- Ojos frontales -->
						<path
							d="M4.5 9 Q5.8 8 7 9"
							fill="none"
							stroke="#ed1685"
							stroke-width="1.5"
							stroke-linecap="round"
						/>

						<path
							d="M8.5 8.5 Q9.8 7.5 11 8.5"
							fill="none"
							stroke="#ed1685"
							stroke-width="1.5"
							stroke-linecap="round"
						/>

						<!-- Sonrisa frontal -->
						<path
							d="M5 13 Q7.8 17.5 11 13"
							fill="none"
							stroke="#ed1685"
							stroke-width="1.8"
							stroke-linecap="round"
						/>

						<!-- Máscara triste frontal -->
						<path
							d="
								M12 5
								L21.5 6.5
								L21 15
								Q20.5 20 16.5 20
								Q12 19 11.5 14
								Z
							"
							fill="#ffffff"
							stroke="none"
						/>

						<!-- Ojos frontales -->
						<path
							d="M13.5 10 Q15 9 16 10"
							fill="none"
							stroke="#ed1685"
							stroke-width="1.4"
							stroke-linecap="round"
						/>

						<path
							d="M17.5 10.5 Q19 9.5 20 10.5"
							fill="none"
							stroke="#ed1685"
							stroke-width="1.4"
							stroke-linecap="round"
						/>

						<!-- Boca triste -->
						<path
							d="M14.5 16 Q17 13 19.5 16"
							fill="none"
							stroke="#ed1685"
							stroke-width="1.6"
							stroke-linecap="round"
						/>

					</svg>
				`
			}
		];

		relationDefinitions.forEach(relation => {

			// Comprobar si existen otras películas relacionadas.
			const relatedMovies = getRelatedMovies(movie, relation.field);

			if (relatedMovies.length > 0) {

				const icon = document.createElement("span");

				icon.className =
					`relation-type-icon ${relation.className}`;

				icon.innerHTML = relation.svg;
				icon.title = relation.label;
				icon.setAttribute("aria-label", relation.label);
				icon.setAttribute("role", "img");

				relationIcons.appendChild(icon);
			}
		});

		// Agregar el contenedor solamente si tiene iconos.
		if (relationIcons.children.length > 0) {
			posterContainer.appendChild(relationIcons);
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
		
		// =====================================================
        // INDICADORES DE MI COLECCIÓN
        // =====================================================

        const collectionIcons = document.createElement("div");

        collectionIcons.className = "collection-status-icons";

        // Si existe la etiqueta NUEVO, bajar los indicadores.
        if (esNuevo(movie)) {
            collectionIcons.classList.add("has-new");
        }

        const statusDefinitions = [
			{
				type: "favorites",
				className: "favorite",
				label: "Favorita",
				svg: `
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/>
					</svg>
				`
			},
			{
				type: "watched",
				className: "watched",
				label: "Vista",
				svg: `
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/>
						<circle cx="12" cy="12" r="3"/>
					</svg>
				`
			},
			{
				type: "obtained",
				className: "obtained",
				label: "Obtenida",
				svg: `
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path d="M3 7h18v13H3z"/>
						<path d="M3 7l2-4h14l2 4"/>
						<path d="M12 11v6"/>
						<path d="m9 14 3 3 3-3"/>
					</svg>
				`
			}
		];

		statusDefinitions.forEach(status => {

			if (isInCollection(status.type, movie)) {

				const icon = document.createElement("span");

				icon.className = `collection-status-icon ${status.className}`;
				icon.innerHTML = status.svg;
				icon.title = status.label;
				icon.setAttribute("aria-label", status.label);
				icon.setAttribute("role", "img");

				collectionIcons.appendChild(icon);

			}

		});

        // Agregar el contenedor únicamente si tiene indicadores.
        if (collectionIcons.children.length > 0) {
            posterContainer.appendChild(collectionIcons);
        }
		
        if (posterUrl) {

            const image = document.createElement("img");

            image.src = posterUrl;
            image.alt = "Póster de " + movie.Titulo;
            image.loading = "eager";

            image.addEventListener("error", () => {

				image.remove();

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

		// Año de la película.
		const year = movie["Año"] || "";

		// Obtener el valor según la opción seleccionada.
		let metaValue = "";

		switch (currentMovieMeta) {

			case "Idioma":
				metaValue = "Idioma " + movie.Idioma || "";
				break;

			case "Duracion":
				metaValue = movie.Duracion || "";
				break;

			case "Calidad Visual":
				metaValue = movie["Calidad Visual"] || "";
				break;

			case "Tamaño":

				const sizeMB = Number(movie["Tamaño (MB)"]);

				if (Number.isFinite(sizeMB) && sizeMB > 0) {
					metaValue = sizeMB.toLocaleString("es-CO") + " MB";
				}

				break;

		}

		// Mostrar el año.
		if (year) {

			const yearSpan = document.createElement("span");

			yearSpan.textContent = year;

			meta.appendChild(yearSpan);

		}

		// Separador y valor seleccionado.
		if (metaValue) {

			const metaSpan = document.createElement("span");

			metaSpan.textContent = metaValue;

			// Mantener los colores de Calidad Visual únicamente en su texto.
			if (currentMovieMeta === "Calidad Visual") {
				metaSpan.classList.add("quality-" + normalize(metaValue));
			}

			meta.appendChild(metaSpan);

		}

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
	
	// Buscar tráiler en YouTube
	function searchMovieTrailer() {

		if (!currentDetailMovie) return;

		const title = String(currentDetailMovie.Titulo || "").trim();
		const year = String(currentDetailMovie["Año"] || "").trim();

		const searchText = `${title} ${year} trailer`;

		const youtubeURL =
			`https://www.youtube.com/results?search_query=${encodeURIComponent(searchText)}`;

		window.open(youtubeURL, "_blank");
	}
	
	// =====================================================
	// FUNCIONES DE INTERACCIÓN CON MI COLECCIÓN
	// =====================================================

	// Comprobar si un título pertenece a una categoría
	function isInCollection(type, movie) {

		if (!movie) return false;

		const key = normalize(movie.Titulo);

		return collectionItems[type].some(item =>
			item.key === key
		);

	}
	
	// =====================================================
	// OBTENER PELÍCULAS DE LA VISTA ACTUAL
	// =====================================================

	function getMoviesForCurrentView() {

		// Si Mi Colección está abierta, obtener únicamente
		// las películas de la categoría seleccionada.

		if (!elements.myCollectionSection.hidden) {

			return allMovies.filter(movie =>
				isInCollection(currentCollectionType, movie)
			);

		}

		// Si estamos en el catálogo, devolver todas.

		return allMovies;

	}


	// Actualizar el estado visual de los botones de la ficha
	function updateCollectionButtons() {

		if (!currentDetailMovie) return;

		const buttons = [
			{
				type: "favorites",
				element: elements.collectionFavoriteButton,
				activeLabel: "Quitar de Favoritas",
				inactiveLabel: "Agregar a Favoritas"
			},
			{
				type: "watched",
				element: elements.collectionWatchedButton,
				activeLabel: "Quitar de Vistas",
				inactiveLabel: "Marcar como Vista"
			},
			{
				type: "obtained",
				element: elements.collectionObtainedButton,
				activeLabel: "Quitar de Obtenidas",
				inactiveLabel: "Marcar como Obtenida"
			}
		];

		buttons.forEach(item => {

			const active = isInCollection(
				item.type,
				currentDetailMovie
			);

			item.element.classList.toggle("active", active);

			item.element.setAttribute(
				"aria-pressed",
				String(active)
			);

			item.element.setAttribute(
				"aria-label",
				active ? item.activeLabel : item.inactiveLabel
			);

			item.element.title = active
				? item.activeLabel
				: item.inactiveLabel;

		});

	}


	// Agregar o quitar un título de una categoría
	function toggleCollection(type) {

		if (!currentDetailMovie) return;

		const key = normalize(currentDetailMovie.Titulo);

		const collection = collectionItems[type];

		const index = collection.findIndex(item =>
			item.key === key
		);

		let message = "";

		if (index >= 0) {

			// El título ya existe: quitarlo
			collection.splice(index, 1);

			message = "Se Quitó de Mi Colección.";

		} else {

			// El título no existe: agregarlo
			collection.push({
				key: key,
				title: currentDetailMovie.Titulo
			});

			message = "Se Agregó a Mi Colección.";

		}

		saveCollection();

		updateCollectionButtons();
		
		// Actualizar los indicadores de los pósteres.
		renderCatalog();

		// Si Mi Colección está abierta, recalcular sus resultados.
		if (!elements.myCollectionSection.hidden) {
			filterMovies();
		}
		
		elements.collectionFeedback.textContent = message;

		elements.collectionFeedback.hidden = false;

	}
	
	// =====================================================
	// VACIAR MI COLECCIÓN
	// =====================================================

	function clearCollection() {

		const confirmClear = confirm(
			"¿Estás Seguro de que Deseas Vaciar Mi Colección?\n\n" +
			"Se Eliminarán Todas las Marcas de:\n\n" +
			"- Favoritas\n" +
			"- Vistas\n" +
			"- Obtenidas\n\n" +
			"Esta Acción No se puede Deshacer."
		);

		if (!confirmClear) return;

		// Vaciar las tres categorías.
		collectionItems = {
			favorites: [],
			watched: [],
			obtained: []
		};

		// Guardar los cambios y actualizar los contadores.
		saveCollection();

		// Reiniciar la paginación.
		currentCollectionPage = 1;

		// Actualizar los botones de la ficha de detalles.
		updateCollectionButtons();

		// Actualizar el catálogo o Mi Colección.
		filterMovies();

	}

	// =====================================================
    // MOSTRAR CONTENIDO DE MI COLECCIÓN
    // =====================================================

    function renderCollection() {

		const categories = {
			favorites: {
				name: "Favoritas",
				info: "Películas y Series Favoritas.",
				emptyTitle: "Todavía No Tienes Películas y Series Favoritas",
				emptyText: "Explora el Catálogo y Agrega las Películas y Series que te Interesen."
			},
			watched: {
				name: "Vistas",
				info: "Películas y Series que Ya Has Visto.",
				emptyTitle: "Todavía No Tienes Películas y Series Vistas",
				emptyText: "Cuando Veas una Película o Serie, Agrégala a esta Categoría."
			},
			obtained: {
				name: "Obtenidas",
				info: "Películas y Series que Ya Has Obtenido.",
				emptyTitle: "Todavía No Tienes Películas y Series Obtenidas",
				emptyText: "Agrega Aquí las Películas y Series que Ya Has Obtenido."
			}
		};

		const category = categories[currentCollectionType];

		// Actualizar información de la categoría
		elements.collectionInfo.textContent = category.info;

		// Actualizar pestaña activa
		elements.collectionTabs.querySelectorAll(".collection-tab")
			.forEach(tab => {

				tab.classList.toggle(
					"active",
					tab.dataset.collectionType === currentCollectionType
				);

			});

		// Obtener títulos guardados
		const savedItems = collectionItems[currentCollectionType];

		// Relacionar los títulos guardados con el catálogo
		const savedMovies = savedItems
			.map(item => allMovies.find(movie =>
				normalize(movie.Titulo) === item.key
			))
			.filter(Boolean);

		// Obtener los resultados filtrados de la colección activa
		const movies = filteredMovies.filter(movie =>
			isInCollection(currentCollectionType, movie)
		);

		// Limpiar tarjetas anteriores
		elements.collectionGrid.innerHTML = "";

		// Limpiar paginación anterior
		elements.collectionPagination.innerHTML = "";

		// Determinar si se debe mostrar un mensaje
		if (movies.length === 0) {

			elements.emptyCollection.hidden = false;

			if (savedItems.length === 0) {

				elements.emptyCollectionTitle.textContent =
					category.emptyTitle;

				elements.emptyCollectionText.textContent =
					category.emptyText;

			} else if (savedMovies.length === 0) {

				elements.emptyCollectionTitle.textContent =
					"No Hay Títulos Disponibles";

				elements.emptyCollectionText.textContent =
					"Los Títulos Guardados No Se Encuentran Actualmente en el Catálogo.";

			} else {

				elements.emptyCollectionTitle.textContent =
					"No Encontramos Resultados";

				elements.emptyCollectionText.textContent =
					"Intenta Cambiar la Búsqueda o los Filtros Seleccionados.";

			}

			return;

		}

		elements.emptyCollection.hidden = true;

		// Calcular cantidad de páginas
		const totalPages = Math.ceil(movies.length / PAGE_SIZE);

		// Asegurar que la página actual sea válida
		if (currentCollectionPage > totalPages) {
			currentCollectionPage = totalPages;
		}

		// Determinar los elementos de la página actual
		const startIndex = (currentCollectionPage - 1) * PAGE_SIZE;

		const pageMovies = movies.slice(
			startIndex,
			startIndex + PAGE_SIZE
		);

		// Mostrar las tarjetas de la página actual
		pageMovies.forEach(movie => {

			elements.collectionGrid.appendChild(
				createMovieCard(movie)
			);

		});

		// Generar botones de paginación
		renderCollectionPagination(totalPages);

	}
	
	// =====================================================
	// CREAR PAGINACIÓN DE MI COLECCIÓN
	// =====================================================

	function renderCollectionPagination(totalPages) {

		elements.collectionPagination.innerHTML = "";

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

				currentCollectionPage = page;

				renderCollection();

				window.scrollTo({
					top: elements.collectionGrid.offsetTop - 100,
					behavior: "smooth"
				});

			});

			elements.collectionPagination.appendChild(button);

		}

		createButton(
			"‹",
			currentCollectionPage - 1,
			false,
			currentCollectionPage === 1
		);

		for (let page = 1; page <= totalPages; page++) {

			// Mostrar páginas cercanas y extremos
			if (
				page === 1 ||
				page === totalPages ||
				Math.abs(page - currentCollectionPage) <= 2
			) {

				createButton(
					page,
					page,
					page === currentCollectionPage
				);

			} else if (
				page === currentCollectionPage - 3 ||
				page === currentCollectionPage + 3
			) {

				const dots = document.createElement("span");

				dots.textContent = "...";
				dots.style.color = "var(--text-muted)";
				dots.style.padding = "0 4px";

				elements.collectionPagination.appendChild(dots);

			}

		}

		createButton(
			"›",
			currentCollectionPage + 1,
			false,
			currentCollectionPage === totalPages
		);

	}

    // =====================================================
    // ABRIR MI COLECCIÓN
    // =====================================================

    function openMyCollection() {
		if (isRandomMoviesView) toggleRandomMovies();
		if (isTop10View) toggleTop10();

		elements.filtersSection.hidden = false;
		elements.filtersSection.querySelector(".filters-heading").hidden = true;

		elements.catalogSection.hidden = true;
		elements.myCollectionSection.hidden = false;
		
		currentCollectionType = "favorites";
		filterMovies();

		elements.myCollectionSection.scrollIntoView({
			behavior: "smooth",
			block: "start"
		});
	}


    // =====================================================
    // VOLVER AL CATÁLOGO DESDE MI COLECCIÓN
    // =====================================================

    function closeMyCollection() {
		elements.collectionImportFeedback.hidden = true;
		elements.myCollectionSection.hidden = true;
		elements.filtersSection.hidden = false;
		elements.filtersSection.querySelector(".filters-heading").hidden = false;
		elements.catalogSection.hidden = false;
		
		// Actualizar el catálogo con los datos actuales de Mi Colección.
		filterMovies();
		
		elements.filtersSection.scrollIntoView({
			behavior: "smooth",
			block: "start"
		});
	}
	
    function openDetails(movie) {
		
		currentDetailMovie = movie;
		
		updateCollectionButtons();
		elements.collectionFeedback.hidden = true;

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
		
		renderRelatedMovies(movie);

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
			"Resolucion",
			"Calidad Visual",
			"Tamaño (MB)",
			"Formato",
			"Capitulos",
			"Fecha Ingreso",
			"Observaciones"
		];

		/*const fieldIcons = {
			"Titulo Ingles": "🌎",
			"Imagen": "🖼️",
			"Calidad Visual": "👁️",
			"Resolucion": "🖥️",
			"Tamaño (MB)": "💾",
			"Formato": "🎞️",
			"Capitulos": "📺",
			"Fecha Ingreso": "📅",
			"Observaciones": "📝"
		};*/
		
		const fieldIcons = {

			"Titulo Ingles": `
				<svg viewBox="0 0 24 24">
					<path d="m5 8 6 6"/>
					<path d="m4 14 6-6 2-3"/>
					<path d="M2 5h12"/>
					<path d="M7 2h1"/>
					<path d="m14 19 3-8 3 8"/>
					<path d="M15 17h4"/>
				</svg>
			`,

			"Imagen": `
				<svg viewBox="0 0 24 24">
					<rect x="3" y="3" width="18" height="18" rx="2"/>
					<circle cx="8.5" cy="8.5" r="1.5"/>
					<path d="m21 15-5-5L5 21"/>
				</svg>
			`,

			"Resolucion": `
				<svg viewBox="0 0 24 24">
					<rect x="3" y="3" width="18" height="14" rx="2"/>
					<path d="M8 21h8"/>
					<path d="M12 17v4"/>
				</svg>
			`,

			"Calidad Visual": `
				<svg viewBox="0 0 24 24">
					<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/>
					<circle cx="12" cy="12" r="3"/>
				</svg>
			`,

			"Tamaño (MB)": `
				<svg viewBox="0 0 24 24">
					<rect x="3" y="4" width="18" height="16" rx="2"/>
					<path d="M7 8h10M7 12h10M7 16h6"/>
				</svg>
			`,

			"Formato": `
				<svg viewBox="0 0 24 24">
					<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/>
					<path d="M14 2v6h6"/>
					<path d="m10 11 5 3-5 3z"/>
				</svg>
			`,

			"Capitulos": `
				<svg viewBox="0 0 24 24">
					<path d="M4 5h16M4 10h16M4 15h10"/>
					<path d="M4 20h10"/>
					<path d="m17 14 4 3-4 3z"/>
				</svg>
			`,

			"Fecha Ingreso": `
				<svg viewBox="0 0 24 24">
					<rect x="3" y="5" width="18" height="16" rx="2"/>
					<path d="M16 3v4M8 3v4M3 11h18"/>
					<path d="m9 16 2 2 4-4"/>
				</svg>
			`,

			"Observaciones": `
				<svg viewBox="0 0 24 24">
					<path d="M8 3H5a2 2 0 0 0-2 2v16l4-3h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-3"/>
					<path d="M8 7h8M8 11h8M8 15h5"/>
				</svg>
			`

		};

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

			if (fieldIcons[key]) {

				const icon = document.createElement("span");

				icon.className = "detail-field-icon";
				/*icon.textContent = fieldIcons[key];*/
				icon.innerHTML = fieldIcons[key];

				label.appendChild(icon);

				const labelText = document.createElement("span");
				labelText.textContent = key;

				label.appendChild(labelText);
				

			} else {

				label.textContent = key;

			}

			const content = document.createElement("span");

			content.className = "detail-field-value";

			if (key === "Tamaño (MB)") {
				content.textContent = Number(value).toLocaleString("es-CO");
			} else {
				content.textContent = value;
			}

			if (key === "Calidad Visual") {
				content.classList.add("quality-" + normalize(value));

				field.classList.add("quality-field-trigger");
				field.setAttribute("role", "button");
				field.setAttribute("tabindex", "0");
				field.setAttribute("aria-label", "Ver Todos los Niveles de Calidad Visual");

				// ICONO DE INFORMACIÓN
				const infoIcon = document.createElement("span");
				infoIcon.className = "quality-info-icon";
				infoIcon.innerHTML = `
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<circle cx="12" cy="12" r="9"></circle>
						<path d="M12 11v5"></path>
						<path d="M12 8h.01"></path>
					</svg>
				`;
				infoIcon.title = "Consultar Niveles de Calidad Visual";

				field.appendChild(infoIcon);

				// EVENTOS PARA ABRIR LA VENTANA
				field.addEventListener("click", () => {
					toggleQualityPopup(field, value);
				});

				field.addEventListener("keydown", event => {
					if (event.key === "Enter" || event.key === " ") {
						event.preventDefault();
						toggleQualityPopup(field, value);
					}
				});
			}

			field.appendChild(label);
			field.appendChild(content);

			elements.detailFields.appendChild(field);

		});

		connectQualityPopupEvents();

	}
	
	function toggleQualityPopup(field, currentQuality) {

		if (qualityPopup) {
			closeQualityPopup();
			return;
		}

		const qualityLevels = [
			{
				level: 10,
				quality: "Muy Excelente",
				image: "Blu Ray - Full HD - 1080p"
			},
			{
				level: 9,
				quality: "Excelente",
				image: "Blu Ray - HD - 720p"
			},
			{
				level: 8,
				quality: "Muy Buena",
				image: "DVD - 480p"
			},
			{
				level: 7,
				quality: "Buena",
				image: "VGA"
			},
			{
				level: 6,
				quality: "Buena Baja",
				image: "VGARip"
			},
			{
				level: 5,
				quality: "Regular Alta",
				image: "HVGA"
			},
			{
				level: 4,
				quality: "Regular",
				image: "HVGA"
			},
			{
				level: 3,
				quality: "Medio Mala",
				image: "HVGA"
			},
			{
				level: 2,
				quality: "Malisima",
				image: "HVGA"
			},
			{
				level: 1,
				quality: "Lo Peor",
				image: "HVGA"
			}
		];

		qualityPopup = document.createElement("div");
		qualityPopup.className = "quality-level-popup";

		const heading = document.createElement("div");
		heading.className = "quality-popup-heading";
		heading.textContent = "Niveles de Calidad Visual";

		qualityPopup.appendChild(heading);

		const table = document.createElement("div");
		table.className = "quality-popup-table";

		qualityLevels.forEach(item => {

			const row = document.createElement("div");
			row.className = "quality-popup-row";

			const levelCell = document.createElement("div");
			levelCell.className = "quality-popup-cell";

			const qualityCell = document.createElement("div");
			qualityCell.className = "quality-popup-cell";

			const imageCell = document.createElement("div");
			imageCell.className = "quality-popup-cell";

			const qualityClass = "quality-" + normalize(item.quality);

			[levelCell, qualityCell, imageCell].forEach(cell => {
				cell.classList.add(qualityClass);
			});

			levelCell.textContent = item.level;
			qualityCell.textContent = item.quality;
			imageCell.textContent = item.image;

			if (normalize(item.quality) === normalize(currentQuality)) {
				row.classList.add("quality-current");
			}

			row.appendChild(levelCell);
			row.appendChild(qualityCell);
			row.appendChild(imageCell);

			table.appendChild(row);
			
			// Separar los tres grupos de calidad visual.
			if (item.level === 8 || item.level === 5) {

				const separator = document.createElement("div");
				separator.className = "quality-popup-separator";

				table.appendChild(separator);

			}
			
		});

		qualityPopup.appendChild(table);

		document.body.appendChild(qualityPopup);

		const rect = field.getBoundingClientRect();

		const popupRect = qualityPopup.getBoundingClientRect();

		let left = rect.left;
		let top = rect.bottom + 8;

		if (left + popupRect.width > window.innerWidth - 12) {
			left = window.innerWidth - popupRect.width - 12;
		}

		if (left < 12) {
			left = 12;
		}

		if (top + popupRect.height > window.innerHeight - 12) {
			top = rect.top - popupRect.height - 8;
		}

		if (top < 12) {
			top = 12;
		}

		qualityPopup.style.left = left + "px";
		qualityPopup.style.top = top + "px";

	}

	function closeQualityPopup() {

		if (qualityPopup) {
			qualityPopup.remove();
			qualityPopup = null;
		}

	}

	function connectQualityPopupEvents() {

		if (qualityPopupEventsConnected) {
			return;
		}

		qualityPopupEventsConnected = true;

		document.addEventListener("click", event => {

			if (!qualityPopup) {
				return;
			}

			if (
				qualityPopup.contains(event.target) ||
				event.target.closest(".quality-field-trigger")
			) {
				return;
			}

			closeQualityPopup();

		});

		document.addEventListener("keydown", event => {

			if (event.key === "Escape" && qualityPopup) {
				closeQualityPopup();
			}

		});

	}


    // =====================================================
    // CERRAR FICHA
    // =====================================================

    function closeDetails() {
		
		closeQualityPopup();
		
        elements.detailModal.classList.remove("open");

        elements.detailModal.setAttribute("aria-hidden", "true");

        document.body.style.overflow = "";
		
		// Actualizar Mi Colección si está abierta
		if (!elements.myCollectionSection.hidden) {
			renderCollection();
		}
		
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
			elements.qualityFilter,
			elements.favoritesFilter,
			elements.watchedFilter,
			elements.obtainedFilter
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
		
		connectMovieBannerEvents();

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
		
		// BOTÓN DE BÚSQUEDA

		elements.searchButton.addEventListener("click", () => {

			// Ocultar el teclado del celular
			elements.searchInput.blur();

			// Identificar la sección de resultados visible
			const resultsSection = elements.myCollectionSection.hidden
				? elements.catalogResultsSection
				: elements.myCollectionSection;

			// Desplazarse hasta los resultados
			resultsSection.scrollIntoView({
				behavior: "smooth",
				block: "start"
			});

			// Dar el foco a la sección de resultados
			resultsSection.focus({
				preventScroll: true
			});

		});
		
		// BUSCAR DESDE EL TECLADO DEL CELULAR

		elements.searchInput.addEventListener("keydown", (event) => {

			if (event.key === "Enter") {

				event.preventDefault();

				elements.searchButton.click();

			}

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
			},
			{
				key: "favorites",
				element: elements.favoritesFilter
			},
			{
				key: "watched",
				element: elements.watchedFilter
			},
			{
				key: "obtained",
				element: elements.obtainedFilter
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
		
		elements.sortFilter.addEventListener("change", () => {

			sortMovies();

			currentPage = 1;

			if (!elements.myCollectionSection.hidden) {
				renderCollection();
			} else {
				renderCatalog();
			}

		});
		
		// =====================================================
		// CAMBIAR INFORMACIÓN MOSTRADA EN LAS TARJETAS
		// =====================================================

		elements.movieMetaSelector.addEventListener("change", () => {

			currentMovieMeta = elements.movieMetaSelector.value;

			localStorage.setItem(
				MOVIE_META_STORAGE_KEY,
				currentMovieMeta
			);

			// Actualizar la vista que se encuentra abierta.
			if (!elements.myCollectionSection.hidden) {
				renderCollection();
			} else {
				renderCatalog();
			}

		});

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
		
		elements.searchTrailer.addEventListener("click", searchMovieTrailer);
		
		// =====================================================
        // EVENTOS DE NAVEGACIÓN DE MI COLECCIÓN
        // =====================================================

        // Abrir Mi Colección
        elements.myCollectionButton.addEventListener(
            "click",
            openMyCollection
        );

        // Volver al catálogo
        elements.backFromCollection.addEventListener(
            "click",
            closeMyCollection
        );

        // Cambiar entre categorías
		elements.collectionTabs.addEventListener("click", event => {

			const tab = event.target.closest(".collection-tab");

			if (!tab) return;

			currentCollectionType = tab.dataset.collectionType;

			// Reiniciar paginación de Mi Colección
			currentCollectionPage = 1;

			filterMovies();

		});
		
		// =====================================================
        // EVENTOS DE MI COLECCIÓN - FICHA DE DETALLES
        // =====================================================

        elements.collectionFavoriteButton.addEventListener(
            "click",
            () => toggleCollection("favorites")
        );

        elements.collectionWatchedButton.addEventListener(
            "click",
            () => toggleCollection("watched")
        );

        elements.collectionObtainedButton.addEventListener(
            "click",
            () => toggleCollection("obtained")
        );
		
		// =====================================================
		// EVENTOS DE EXPORTAR E IMPORTAR MI COLECCIÓN
		// =====================================================

		elements.exportCollectionButton.addEventListener(
			"click",
			exportCollection
		);

		// Abrir selector de archivos.
		elements.importCollectionButton.addEventListener(
			"click",
			() => elements.importCollectionFile.click()
		);

		// Procesar archivo seleccionado.
		elements.importCollectionFile.addEventListener(
			"change",
			event => {

				const file = event.target.files[0];

				if (file) {
					importCollection(file);
				}

				// Permitir seleccionar nuevamente el mismo archivo.
				event.target.value = "";

			}
		);
		
		// Vaciar Mi Colección.
		elements.clearCollectionButton.addEventListener(
			"click",
			clearCollection
		);
		
		elements.pricesPdfButton.addEventListener("click", openPricesPDF);

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
		
		loadCollection();
		
        configureBrand();
		
		loadMovieMetaPreference();

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

			// 3. Construir banner animado

			initializeMovieBanner();

			// 4. Actualizar estadísticas

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