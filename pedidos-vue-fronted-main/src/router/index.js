import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import AdminLayout from '../components/admin/AdminLayout.vue';
import Dashboard from '../views/admin/Dashboard.vue';
import Categorias from '../views/admin/Categorias.vue';
import Usuarios from '../views/admin/Usuarios.vue';
import Descuentos from '../views/admin/Descuentos.vue';
import Tallas from '@/views/admin/Tallas.vue';
import Colores from '@/views/admin/Colores.vue';
import ProductoBase from '@/views/admin/ProductoBase.vue';
import ProductoFinal from '@/views/admin/ProductoFinal.vue';
import { useUserStore } from '@/stores/authstore';
import Pedidos from '../views/Pedidos.vue';
import PedidosAdmin from '@/views/admin/PedidosAdmin.vue';
import Carrusel from '@/views/admin/Carrusel.vue';
import Empresa from '@/views/admin/Empresa.vue';
import ConfiguracionEnvio from '@/views/admin/ConfiguracionEnvio.vue';
import EnviosAdmin from '@/views/admin/EnviosAdmin.vue';
import Consultas from '@/views/admin/Consultas.vue';
import ReporteIngresos from '@/views/admin/Reportes/ReporteIngresos.vue';
import ReporteOrdenes from '@/views/admin/Reportes/ReporteOrdenes.vue';
import ReporteUsuarios from '@/views/admin/Reportes/ReporteUsuarios.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/Login',
      name: 'Login',
      component: () => import('../views/Login.vue'),
    },
    {
      path: '/Registro',
      name: 'Registro',
      component: () => import('../views/Registro.vue'),
    },
    {
      path: '/DetalleProducto/:id',
      name: 'DetalleProducto',
      component: () => import('../views/ProductView.vue'),
      
    },
    {
      path: '/PedidoOrden',
      name: 'PedidoOrden',
      component: () => import('../views/pedidos/PedidoOrden.vue'),
      
    },
    {
      path: '/finalizar-pago',	
      name: 'finalizar-pago',
      component: () => import('@/views/pedidos/FinalizarPago.vue'),
      
    },
    {
      path: '/OlvideContrasena',
      name: 'OlvideContrasena',
      component: () => import('../views/OlvideContrasena.vue'),
    },
    {
      path: '/RestablecerContrasena',
      name: 'RestablecerContrasena',
      component: () => import('../views/RestablecerContrasena.vue'),
    },
    {
      path: '/Pedidos',
      name: 'Pedidos',
      component: () => import('../views/Pedidos.vue'),
    },
    {
      path: '/Carrito',
      name: 'Carrito',
      component: () => import('../views/pedidos/Carrito.vue'),
    },
    {
      path: '/Nosotros',
      name: 'Nosotros',
      component: () => import('./../views/Nosotros.vue'),
    },{
      path: '/Perfil',
      name: 'Perfil',
      component: () => import('./../views/Perfil.vue'),
    },
    {
      path: '/Contactos',
      name: 'Contactos',
      component: () => import('./../views/Contactos.vue'),
    },
    {
      path: '/admin',
      name:AdminLayout,
      component: AdminLayout,  // 'AdminLayout' es ahora un contenedor
      meta: { requiresAdmin: true },
      children: [
        {
          path: '',
          name: 'Dashboard',
          component: Dashboard,  // Ruta por defecto al entrar al admin
        },
        {
          path: 'categorias',  // Rutas hijas de '/admin'
          name: 'Categorias',
          component: Categorias,
        }, {
          path: 'tallas',  // Rutas hijas de '/admin'
          name: 'tallas',
          component: Tallas,
        },
        {
          path: 'colores',
          name: 'colores',
          component: Colores,
        },
        {
          path: 'descuentos',
          name: 'descuentos',
          component: Descuentos,
        },
        {
          path: 'productobase',
          name: 'productobase',
          component: ProductoBase,
        },
        {
          path: 'productofinal',
          name: 'productofinal',
          component: ProductoFinal,
        },
        {
          path: 'usuarios',
          name: 'usuarios',
          component: Usuarios,
        },
        {
          path: 'consultas',
          name: 'consultas',
          component: Consultas,
        },
        {
          path: 'reporteingresos',
          name: 'reporteingresos',
          component: ReporteIngresos,
        },
        {
          path: 'reporteordenes',
          name: 'reporteordenes',
          component: ReporteOrdenes,
        },
        {
          path: 'reporteusuarios',
          name: 'reporteusuarios',
          component: ReporteUsuarios,
        },
        {
          path: 'carrusel',
          name: 'carrusel',
          component: Carrusel,
        }
        ,
        {
          path: 'ConfiguracionEnvio',
          name: 'ConfiguracionEnvio',
          component: ConfiguracionEnvio,
        },
      // {
      //     path: 'ciudades-envio/crear',
      //     name: 'CrearCiudadEnvio',
      //     component: CrearCiudadEnvio,
      //     meta: { requiresAuth: true }
      //   },
         
         {
          path: 'empresa',
          name: 'empresa',
          component: Empresa,
        },
         {
          path: 'envios',
          name: 'envios',
          component: EnviosAdmin,
        },
        {
          path: 'pedidosadmin',
          name: 'pedidosadmin',
          component: PedidosAdmin,
        }
      ],
    },
    {
      path: '/no-autorizado',
      name: 'NotFound',
      component: () => import('../views/NotFound.vue'),
    },
    // Ruta catch-all para cualquier ruta que no exista
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: 'NotFound' }
    }
  ],
});




router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();

  // Verificar autenticación al inicio
  await userStore.checkAuth();

  // Validación para rutas de administrador
  if (to.matched.some(record => record.meta.requiresAdmin)) {
    if (userStore.authenticated && userStore.user?.esadmin) {
      next();
    } else if (userStore.authenticated) {
      // Usuario autenticado pero no es admin
      next({ path: '/no-autorizado' });
    } else {
      // Usuario no autenticado
      next({
        path: '/Login',
        query: { redirect: to.fullPath }
      });
    }
    return;
  }

  // Validación para rutas que requieren autenticación general
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (userStore.authenticated) {
      next();
    } else {
      next({
        path: '/Login',
        query: { redirect: to.fullPath }
      });
    }
    return;
  }

  // Redirigir a la página principal si ya está autenticado
  if (to.path === '/Login' && userStore.authenticated) {
    next({ path: '/' }); // Redirigir al home o dashboard
    return;
  }

  // Continuar para rutas públicas
  next();
});

export default router
