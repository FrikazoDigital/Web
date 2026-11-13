/* =========================================================
   MI CATÁLOGO - CONFIGURACIÓN GENERAL
   ========================================================= */

window.CATALOGO_CONFIG = {

    // Nombre que aparecerá en la página
    BRAND_NAME: "Frikazo Digital",

    // Iniciales del logo
    BRAND_INITIALS: "FD",

    // Ruta del archivo JSON
    JSON_URL: "https://raw.githubusercontent.com/FrikazoDigital/Web/refs/heads/main/Catalogo.json",

    // Google Drive API Key
    GOOGLE_DRIVE_API_KEY: "AIzaSyAqXzpAygpJBYRd_f_OcLG1KvcdGX6E3sk",

    // ID de la carpeta principal "Posteres"
    POSTERS_ROOT_FOLDER_ID: "1u4u0gRj3mMKFtoDKX7xylt4dwCVkzSZb",

    // Cantidad de películas por página
    PAGE_SIZE: 18,

    // Tamaño máximo de los pósteres
    POSTER_WIDTH: 1000,

    // Mostrar información de depuración en consola
    DEBUG: true,
	
	GENRE_FOLDER_MAP: {
		"DC Comic (Actores)": "DC Comic",
		"DC Comic (Animado)": "DC Comic",
		"Marvel (Actores - MCU)": "Marvel",
		"Marvel (Actores)": "Marvel",
		"Marvel (Animado)": "Marvel"
	},
	
	// CONFIGURACIÓN DE ETIQUETAS NUEVO
	// "days"	Últimos 30 días
	// "count"	Últimos 10 títulos
	// "off"	Desactivar etiqueta
	NEW_BADGE_MODE: "days",
	NEW_BADGE_DAYS: 30,
	NEW_BADGE_COUNT: 10

};