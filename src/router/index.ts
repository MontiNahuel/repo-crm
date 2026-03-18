import { createRouter, createWebHistory } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import LoginView from '@/view/LoginView.vue'
import DashboardView from '@/view/DashboardView.vue'
import ClientesView from '@/view/ClientesView.vue'
import panelAdmin from '@/view/admin/panelAdmin.vue'
import TodoView from '@/view/TodoView.vue'

import { useAuthStore } from '@/stores/authStore';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/auth',
      component: AuthLayout,
      children: [
        {
          path: '/login',
          name: 'login',
          component: LoginView,
          meta: { requiresGuest: true, hideSidebar: true }
        }]
    },
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          redirect: '/dashboard'
        },
        {
          path: '/dashboard', // Es la ruta raíz /
          name: 'dashboard',
          component: DashboardView,
          meta: { requiresAuth: true }
        },
        {
          path: '/clientes', // Es /clientes
          name: 'clientes',
          component: ClientesView,
          meta: { requiresAuth: true }
        },
        {
          path: '/todo', // Es /todo
          name: 'todo',
          component: TodoView,
          meta: { requiresAuth: true }
        },
        {
          path: '/admin', // Es /admin
          name: 'admin',
          component: panelAdmin,
          meta: { requiresAuth: true, requiresAdmin: true }
        },
        {
          path: '/clientes/:id', // El :id es dinámico
          name: 'cliente-detalle',
          component: () => import('@/view/ClienteDetalleView.vue'), // Lazy loading para que sea rápido
          meta: { requiresAuth: true }
        }
      ]
    }
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  // Si la ruta NO es el login, y el usuario NO está autenticado...
  // 1. ¿La ruta exige estar logueado, pero el usuario NO lo está?
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' }) // Afuera, al login
  }
  // 2. ¿La ruta es solo para invitados, pero el usuario YA está logueado?
  else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next({ name: 'dashboard' }) // Ya estás adentro, te mando al panel
  }
  else if (to.meta.requiresAdmin && authStore.userRole?.toLowerCase() !== 'admin') {
    next({ name: 'dashboard' }) // No sos admin, te mando al panel
  }
  // 3. Cualquier otro caso (ej: una ruta 100% pública sin etiquetas)
  else {
    next() // Pasá tranquilo
  }
});

export default router
