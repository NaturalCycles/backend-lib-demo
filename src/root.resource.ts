import { getDefaultRouter, okHandler, statusHandler } from '@naturalcycles/backend-lib'
import { HttpError, jsonSchema, pDelay, _inRange } from '@naturalcycles/js-lib'
import { AjvSchema } from '@naturalcycles/nodejs-lib'

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

interface TestOptions {
  statusCode?: number
}

const testOptionsSchema = AjvSchema.create(
  jsonSchema.object<TestOptions>({
    statusCode: jsonSchema.integer().range(100, 599).optional(),
  }),
  { coerceTypes: true, objectName: 'request query' },
)

interface TestBody {
  statusCode?: number
  responseJson?: any
  responseText?: any
  delay?: number
  userFriendly?: boolean
}

const testBodySchema = AjvSchema.create(
  jsonSchema.object<TestBody>({
    statusCode: jsonSchema.integer().range(100, 599).optional(),
    responseJson: jsonSchema.any().optional(),
    responseText: jsonSchema.any().optional(),
    delay: jsonSchema.integer().range(0, 5000).optional(),
    userFriendly: jsonSchema.boolean().optional(),
  }),
  {
    objectName: 'request body',
  },
)

router.all('/test', async (req, res) => {
  const query = testOptionsSchema.validate(req.query)
  // console.log(req.body)
  const body = testBodySchema.validate(req.body)
  // console.log(body)
  const { userFriendly } = body

  const statusCode = query.statusCode || body.statusCode || 200

  if (_inRange(statusCode, 500, 600)) {
    throw new HttpError(body.responseText || `Bad bad 5xx error`, {
      httpStatusCode: statusCode,
      userFriendly,
    })
  }

  if (_inRange(statusCode, 400, 500)) {
    throw new HttpError(body.responseText || `Bad bad 4xx error`, {
      httpStatusCode: statusCode,
      userFriendly,
    })
  }

  if (body.delay) await pDelay(body.delay)

  res.status(statusCode)

  if (body.responseJson) {
    res.json(body.responseJson)
  } else if (body.responseText) {
    res.send(body.responseText)
  } else {
    res.json({ ok: true })
  }
})
