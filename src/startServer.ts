/* tslint:disable:ordered-imports */

console.log('startServer... ')
import 'tsconfig-paths/register'
// import './bootstrap'
import { createDefaultApp, startServer } from '@naturalcycles/backend-lib'
import { pHang } from '@naturalcycles/js-lib'
import { runScript } from '@naturalcycles/nodejs-lib/dist/script'
import { imgResource } from '@src/img.resource'
import { rootResource } from '@src/root.resource'

runScript(async () => {
  await startServer({
    expressApp: createDefaultApp({
      resources: [
        {
          path: '/',
          handler: rootResource,
        },
        {
          path: '/img',
          handler: imgResource,
        },
      ],
    }),
  })

  await pHang() // keep server running
})
