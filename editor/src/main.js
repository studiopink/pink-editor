import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import api from './providers/api/';
import VueDragResize from 'vue-drag-resize';
import VueSocketIO from 'vue-socket.io';
import vmodal from 'vue-js-modal';
import 'vue-loaders/dist/vue-loaders.css';
import VueLoadersBallBeat from 'vue-loaders/dist/loaders/ball-beat';
import VueLoadersLineScale from 'vue-loaders/dist/loaders/line-scale';
import 'vue-simple-context-menu/dist/vue-simple-context-menu.css'
import VueSimpleContextMenu from 'vue-simple-context-menu';
import VueSweetalert2 from 'vue-sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import VueDragscroll from 'vue-dragscroll';
import 'vue-range-component/dist/vue-range-slider.css';
import VueRangeSlider from 'vue-range-component';

Vue.component('vue-simple-context-menu', VueSimpleContextMenu);
Vue.component('vue-drag-resize', VueDragResize);
Vue.component('vue-range-slider', VueRangeSlider);
Vue.config.productionTip = false;

Vue.directive('click-outside', {
    bind: function (el, binding, vnode) {
        el.eventOnClick = function (event) {
            if (!(el == event.target || el.contains(event.target))) {
                vnode.context[binding.expression](event);
            }
        };
        document.addEventListener('click', el.eventOnClick);
    },
    unbind: function (el) {
        document.removeEventListener('click', el.eventOnClick);
    },
});

Vue.use(VueSweetalert2);
Vue.use(VueDragscroll);
Vue.use(new VueSocketIO({ debug: false, connection: process.env.VUE_APP_SOCKET_API }));
Vue.component('vue-loaders-ball-beat', VueLoadersBallBeat.component);
Vue.component('vue-loaders-line-scale-party', VueLoadersLineScale.component);
Vue.use(vmodal);

Vue.prototype.$api = api;
window.store = store;

window.app = new Vue({ router, store, render: h => h(App) }).$mount('#app');