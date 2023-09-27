import * as VueRouter from 'vue-router';
import Layout from '@/views/layout/index.vue';
import { LoginPage, NotFound } from 'cyber-web-ui';
import Logo from '../assets/img/logo/twins.svg';
import defaultRoutes from './modules/default';
import ControlPanel from '@/views/control-panel/index.vue';

const routes = [
  {
    path: '/',
    name: 'Layout',
    component: Layout,
    children: [
      {
        path: '/control-panel',
        name: "ControlPanel",
        component: ControlPanel,
      },
    ],
  },
  import.meta.env.MODE == 'development'
    ? {
        path: '/login',
        component: LoginPage,
        props: {
          logo: Logo,
        },
      }
    : {},
  {
    path: '/:catchAll(.*)',
    name: '404',
    component: NotFound,
  }
];

const router = VueRouter.createRouter({
	history: VueRouter.createWebHashHistory(),
	routes: routes
});

export default router;
