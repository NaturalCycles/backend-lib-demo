module.exports = {
  title: 'backend-lib-demo',
  base: '/backend-lib-demo/',
  // description: 'La la la description',
  // head: [
  //   ['meta', { name: 'theme-color', content: '#3eaf7c' }],
  //   ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
  //   ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }]
  // ],

  themeConfig: {
    search: false,
    repo: 'NaturalCycles/backend-lib-demo',
    docsDir: 'docs',
    lastUpdated: false,
    smoothScroll: true, // todo: review
    nav: [
      // {
      //   text: 'Guide',
      //   link: '/guide/',
      // },
      // {
      //   text: 'Config',
      //   link: '/config/'
      // },
      // {
      //   text: 'VuePress',
      //   link: 'https://v1.vuepress.vuejs.org'
      // }
    ],
    sidebar: {
      '/': [
        {
          // title: 'Menu',
          collapsable: false,
          children: ['', 'img'],
        },
      ],
    },
  },

  plugins: [
    '@vuepress/plugin-back-to-top',
    '@vuepress/plugin-medium-zoom',
    [
      'vuepress-plugin-typescript',
      {
        tsLoaderOptions: {
          transpileOnly: true,
          // silent: true,
          // ignoreDiagnostics: [],
          // compilerOptions: {
          //   "esModuleInterop": true,
          //   allowJs: true,
          // },
        },
      },
    ],
  ],
  evergreen: true,
}
