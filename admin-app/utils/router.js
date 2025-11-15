// Sistema de routing para navegación entre pantallas
// Maneja las rutas y la navegación de la aplicación

class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
  }

  /**
   * Registrar una ruta
   * @param {string} path - Ruta (ejemplo: /dashboard, /dog/:id)
   * @param {Function} handler - Función que renderiza la pantalla
   */
  addRoute(path, handler) {
    this.routes[path] = handler;
  }

  /**
   * Navegar a una ruta específica
   * @param {string} path - Ruta de destino
   * @param {object} data - Datos adicionales (opcional)
   */
  navigateTo(path, data = {}) {
    // Actualizar la URL sin recargar la página
    window.history.pushState({ data }, '', path);
    
    // Cargar la pantalla correspondiente
    this.loadRoute(path, data);
  }

  /**
   * Cargar la ruta actual
   * @param {string} path - Ruta a cargar
   * @param {object} data - Datos adicionales
   */
  loadRoute(path, data = {}) {
    this.currentRoute = path;
    
    // Separar el path de los query parameters
    const [pathname] = path.split('?');
    
    // Limpiar el contenedor principal
    this.clearApp();
    
    // Buscar ruta exacta primero
    if (this.routes[pathname]) {
      this.routes[pathname](data);
      return;
    }
    
    // Si no existe ruta exacta, buscar rutas con parámetros
    for (const routePath in this.routes) {
      const params = this.matchRoute(routePath, pathname);
      if (params) {
        // Combinar params con data
        const routeData = { ...data, ...params };
        this.routes[routePath](routeData);
        return;
      }
    }
    
    // Si no existe la ruta, mostrar 404
    this.show404();
  }

  /**
   * Verificar si una ruta coincide con el path actual
   * @param {string} routePath - Ruta registrada
   * @param {string} currentPath - Ruta actual
   * @returns {object|null} - Parámetros extraídos o null
   */
  matchRoute(routePath, currentPath) {
    // Convertir /dog/:id en /dog/([^/]+)
    const routeRegex = new RegExp(
      '^' + routePath.replace(/:\w+/g, '([^/]+)') + '$'
    );
    
    const match = currentPath.match(routeRegex);
    
    if (!match) return null;
    
    // Extraer los nombres de los parámetros
    const paramNames = (routePath.match(/:\w+/g) || []).map(param => param.slice(1));
    
    // Crear objeto con los parámetros
    const params = {};
    paramNames.forEach((name, index) => {
      params[name] = match[index + 1];
    });
    
    return params;
  }

  /**
   * Iniciar el router
   */
  init() {
    // Escuchar cuando el usuario navega con botones del navegador
    window.addEventListener('popstate', (event) => {
      const data = event.state?.data || {};
      this.loadRoute(window.location.pathname, data);
    });

    // Cargar la ruta inicial
    this.loadRoute(window.location.pathname);
  }

  /**
   * Limpiar el contenedor principal
   */
  clearApp() {
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = '';
    }
  }

  /**
   * Mostrar pantalla 404
   */
  show404() {
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = `
        <div class="error-container">
          <h1>404 - Página no encontrada</h1>
          <p>La página que buscas no existe.</p>
          <button onclick="router.navigateTo('/dashboard', {})">Volver al Dashboard</button>
        </div>
      `;
    }
  }

  /**
   * Obtener la ruta actual
   */
  getCurrentRoute() {
    return this.currentRoute;
  }

  /**
   * Volver a la página anterior
   */
  goBack() {
    window.history.back();
  }
}

// Crear una sola instancia del router para toda la aplicación
const router = new Router();

// Hacer el router accesible globalmente
window.router = router;

export default router;

