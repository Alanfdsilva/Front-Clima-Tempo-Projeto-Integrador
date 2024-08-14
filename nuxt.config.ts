// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: {
    enabled: true
  },
  app: {
    head: {
        htmlAttrs: {
            lang: 'en',
        },
        title: 'title',
        charset: 'utf-8',
        meta: [],
        link: [],
    }
  },
  css: [
    'leaflet/dist/leaflet.css'
  ]
});
