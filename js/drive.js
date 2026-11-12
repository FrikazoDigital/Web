/* =========================================================
   MI CATÁLOGO - CONEXIÓN CON GOOGLE DRIVE
   Archivo: drive.js
   ========================================================= */

window.CATALOGO_DRIVE = (() => {

    "use strict";

    const CONFIG = window.CATALOGO_CONFIG;

    // Almacena los pósteres encontrados
    let posterIndex = new Map();

    // =====================================================
    // NORMALIZAR TEXTOS
    // Ignora tildes, espacios, signos y mayúsculas
    // =====================================================

    function normalize(value) {

        return String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "");

    }


    // =====================================================
    // OBTENER NOMBRE SIN EXTENSIÓN
    // =====================================================

    function getFileNameWithoutExtension(filename) {

        return String(filename || "")
            .replace(/\.[^/.]+$/, "");

    }


    // =====================================================
    // CREAR CLAVE DE RELACIÓN
    // Género + Título
    // =====================================================

    function createPosterKey(genre, title) {

        return normalize(genre) + "|" + normalize(title);

    }


    // =====================================================
    // CONSULTAR GOOGLE DRIVE API
    // =====================================================

    async function requestDrive(url) {

        const response = await fetch(url);

        if (!response.ok) {

            let errorDetail = "";

            try {
                const errorData = await response.json();
                errorDetail = errorData.error?.message || "";
            } catch (error) {
                errorDetail = response.statusText;
            }

            throw new Error(
                "Error de Google Drive: " +
                response.status +
                " - " +
                errorDetail
            );

        }

        return await response.json();

    }


    // =====================================================
    // LISTAR ARCHIVOS DE UNA CARPETA
    // Incluye paginación de Drive
    // =====================================================

    async function listFolder(folderId) {

        if (!folderId) {
            throw new Error("No se indicó el ID de una carpeta.");
        }

        const allFiles = [];

        let nextPageToken = null;

        do {

            const params = new URLSearchParams({

                q: `'${folderId}' in parents and trashed = false`,

                key: CONFIG.GOOGLE_DRIVE_API_KEY,

                pageSize: "1000",

                fields:
                    "nextPageToken,files(id,name,mimeType)",

                orderBy: "name"

            });

            if (nextPageToken) {
                params.set("pageToken", nextPageToken);
            }

            const url =
                "https://www.googleapis.com/drive/v3/files?" +
                params.toString();

            const data = await requestDrive(url);

            if (Array.isArray(data.files)) {
                allFiles.push(...data.files);
            }

            nextPageToken = data.nextPageToken || null;

        } while (nextPageToken);

        return allFiles;

    }


    // =====================================================
    // CONSTRUIR URL DEL PÓSTER
    // =====================================================

    function getImageUrl(file) {

        if (!file || !file.id) {
            return "";
        }

        return (
            "https://drive.google.com/thumbnail?id=" +
            encodeURIComponent(file.id) +
            "&sz=w" +
            CONFIG.POSTER_WIDTH
        );

    }


    // =====================================================
    // CARGAR TODAS LAS SUBCARPETAS DE GÉNEROS
    // =====================================================

    async function loadGenreFolders() {

        const rootId = CONFIG.POSTERS_ROOT_FOLDER_ID;

        const folders = await listFolder(rootId);

        return folders.filter(file =>
            file.mimeType === "application/vnd.google-apps.folder"
        );

    }


    // =====================================================
    // CARGAR PÓSTERES DE UNA CARPETA
    // =====================================================

    async function loadPostersFromGenre(folder) {

        const files = await listFolder(folder.id);

        const imageFiles = files.filter(file => {

            return file.mimeType &&
                file.mimeType.startsWith("image/");

        });

        const genreKey = normalize(folder.name);

        imageFiles.forEach(file => {

            const title = getFileNameWithoutExtension(file.name);

            const key = createPosterKey(
                genreKey,
                title
            );

            posterIndex.set(key, {

                id: file.id,

                name: file.name,

                genre: folder.name,

                title: title,

                url: getImageUrl(file)

            });

        });

        return imageFiles.length;

    }


    // =====================================================
    // CARGAR TODOS LOS PÓSTERES
    // =====================================================

    async function loadAllPosters() {

        posterIndex.clear();

        if (
            !CONFIG.GOOGLE_DRIVE_API_KEY ||
            CONFIG.GOOGLE_DRIVE_API_KEY ===
            "REEMPLAZAR_CON_TU_API_KEY"
        ) {

            throw new Error(
                "Debes configurar la API Key de Google Drive en config.js."
            );

        }

        if (
            !CONFIG.POSTERS_ROOT_FOLDER_ID ||
            CONFIG.POSTERS_ROOT_FOLDER_ID ===
            "REEMPLAZAR_CON_ID_DE_POSTERES"
        ) {

            throw new Error(
                "Debes configurar el ID de la carpeta Posteres en config.js."
            );

        }

        if (CONFIG.DEBUG) {
            console.log("Buscando carpetas de géneros en Google Drive...");
        }

        const folders = await loadGenreFolders();

        if (CONFIG.DEBUG) {
            console.log("Carpetas encontradas:", folders.length);
        }

        // Consultar cada carpeta de género
        const results = await Promise.all(

            folders.map(folder =>
                loadPostersFromGenre(folder)
            )

        );

        const total = results.reduce(
            (sum, quantity) => sum + quantity,
            0
        );

        if (CONFIG.DEBUG) {

            console.log(
                "Pósteres encontrados:",
                total
            );

        }

        return {

            folders: folders.length,

            posters: total

        };

    }


    // =====================================================
    // BUSCAR PÓSTER DE UNA PELÍCULA
    // =====================================================

    function findPoster(genre, title) {

		const genreMap = CONFIG.GENRE_FOLDER_MAP || {};

		const folderGenre = genreMap[genre] || genre;

		const key = createPosterKey(folderGenre, title);

		const poster = posterIndex.get(key);

		return poster ? poster.url : null;

	}


    // =====================================================
    // CONSULTAR INFORMACIÓN COMPLETA DEL PÓSTER
    // =====================================================

    function findPosterInfo(genre, title) {

        const key = createPosterKey(
            genre,
            title
        );

        return posterIndex.get(key) || null;

    }


    // =====================================================
    // OBTENER ESTADÍSTICAS
    // =====================================================

    function getStats() {

        return {

            totalPosters: posterIndex.size

        };

    }


    // =====================================================
    // INTERFAZ PÚBLICA
    // =====================================================

    return {

        loadAllPosters,

        findPoster,

        findPosterInfo,

        getStats,

        normalize

    };

})();