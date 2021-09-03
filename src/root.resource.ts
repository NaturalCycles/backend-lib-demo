import { getDefaultRouter, okHandler, statusHandler } from '@naturalcycles/backend-lib'

const router = getDefaultRouter()
export const rootResource = router

router.get('/', okHandler())

router.get('/status', statusHandler())

router.get('/hello', async (req, res) => {
  res.json({ hello: 'world' })
})

router.get('/_ah/warmup', async (req, res) => {
  res.status(200).end()
})
