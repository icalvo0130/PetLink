// Este archivo maneja las RUTAS (navegacion entre pantallas)

class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
  }

  // Registrar una ruta (como agregar una direccion al GPS)
  addRoute(path, handler) {
    this.routes[path] = handler;
  }

  // Navegar a una ruta (ir a una pantalla)
  navigateTo(path) {
    // Cambiar la URL sin recargar la pagina
    window.history.pushState({}, '', path);
    
    // Mostrar la pantalla correcta
    this.loadRoute(path);
  }

  // Cargar la ruta actual
  loadRoute(path) {
    this.currentRoute = path;
    
    // Separar el path de los query parameters
    const [pathname, queryString] = path.split('?');
    
    // Buscar cual pantalla mostrar
    // Primero buscar ruta exacta
    if (this.routes[pathname]) {
      this.routes[pathname]();
      return;
    }
    
    // Si no existe ruta exacta, buscar rutas con parametros
    for (const routePath in this.routes) {
      const params = this.matchRoute(routePath, pathname);
      if (params) {
        this.routes[routePath](params);
        return;
      }
    }
    
    // Si no existe la ruta, ir al home
    this.navigateTo('/');
  }

  // Verificar si una ruta coincide con el path actual
  matchRoute(routePath, currentPath) {
    // Convertir /dog/:id en /dog/([^/]+)
    const routeRegex = new RegExp(
      '^' + routePath.replace(/:\w+/g, '([^/]+)') + '$'
    );
    
    const match = currentPath.match(routeRegex);
    
    if (!match) return null;
    
    // Extraer los nombres de los parametros
    const paramNames = (routePath.match(/:\w+/g) || []).map(param => param.slice(1));
    
    // Crear objeto con los parametros
    const params = {};
    paramNames.forEach((name, index) => {
      params[name] = match[index + 1];
    });
    
    return params;
  }

  // Iniciar el router
  init() {
    // Escuchar cuando el usuario da click en atras/adelante
    window.addEventListener('popstate', () => {
      this.loadRoute(window.location.pathname);
    });

    // Cargar la ruta inicial
    this.loadRoute(window.location.pathname);
  }
}

// Crear una sola instancia del router para toda la app
const router = new Router();

// Hacer el router accesible globalmente
window.router = router;

export default router;