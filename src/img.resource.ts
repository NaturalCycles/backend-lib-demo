import { getDefaultRouter } from '@naturalcycles/backend-lib'
import { jsonSchema, _substringAfterLast } from '@naturalcycles/js-lib'
import { AjvSchema, getGot, _pipeline } from '@naturalcycles/nodejs-lib'
import { RequestHandler } from 'express'
import { OutputInfo } from 'sharp'
import * as sharp from 'sharp'

const router = getDefaultRouter()
export const imgResource = router

router.get('/', imageTransformMiddleware())

export enum FitEnum {
  contain = 'contain',
  cover = 'cover',
  fill = 'fill',
  inside = 'inside',
  outside = 'outside',
}

export enum ImgPosition {
  center = 'center',
  entropy = 'entropy',
  attention = 'attention',
}

/**
 * Options are designed to "fit" into QueryString.
 * E.g it avoids nested objects.
 */
export interface ImageTransformOptions {
  /**
   * Image will be downloaded from there.
   */
  sourceImageUrl: string

  /**
   * If format is omitted - input format is used (taken from sourceImageUrl extension, NOT detected).
   */
  format?: string

  width?: number
  height?: number

  fit?: FitEnum

  /**
   * Defaults to `center`
   */
  position?: ImgPosition

  /**
   * https://sharp.pixelplumbing.com/api-resize#trim
   *
   * Trim "boring" pixels from all edges that contain values similar to the top-left pixel.
   * Images consisting entirely of a single colour will calculate "boring" using the alpha channel, if any.
   *
   * Threshold - the allowed difference from the top-left pixel, a number greater than zero.
   * Defaults to 10.
   */
  trim?: number

  /**
   * 0 to 100
   *
   * Defaults to 100 ("lossless")
   */
  quality?: number

  /**
   * AVIF, WEBP option.
   * Defaults to false.
   */
  lossless?: boolean

  /**
   * AVIF option.
   * CPU effort vs file size, 0 (slowest/smallest) to 8 (fastest/largest).
   * Defaults to 5.
   */
  speed?: number

  /**
   * WEBP option.
   * level of CPU effort to reduce file size, integer 0-6
   * Defaults to 4.
   */
  reductionEffort?: number

  /**
   * PNG option.
   * zlib compression level, 0 (fastest, largest) to 9 (slowest, smallest).
   * Defaults to 6.
   */
  compressionLevel?: number

  /**
   * PNG option.
   * Quantise to a palette-based image with alpha transparency support.
   * Defaults to false.
   */
  palette?: boolean
}

const imageTransformOptionsSchema = AjvSchema.create<ImageTransformOptions>(
  jsonSchema.object<ImageTransformOptions>({
    // sourceImageUrl: jsonSchema.string().url(), // url fails for some weird reasons
    sourceImageUrl: jsonSchema.string(),
    format: jsonSchema.string().optional(),
    width: jsonSchema.integer().min(1).optional(),
    height: jsonSchema.integer().min(1).optional(),
    fit: jsonSchema.enum(Object.values(FitEnum)).optional(),
    position: jsonSchema.enum(Object.values(ImgPosition)).optional(),
    trim: jsonSchema.integer().min(1).optional(),
    quality: jsonSchema.integer().range(1, 100).optional(),
    lossless: jsonSchema.boolean().optional(),
    speed: jsonSchema.integer().range(1, 8).optional(),
    reductionEffort: jsonSchema.integer().range(0, 6).optional(),
    compressionLevel: jsonSchema.integer().range(0, 9).optional(),
    palette: jsonSchema.boolean().optional(),
  }),
  {
    objectName: 'ImageTransformOptions',
    coerceTypes: true,
  },
)

const got = getGot({
  logStart: true,
  logFinished: true,
})

export async function imageTransform(
  opt: ImageTransformOptions,
  acceptsHeader: string = '',
): Promise<[Buffer, OutputInfo]> {
  let {
    sourceImageUrl,
    quality = 100,
    format,
    width,
    height,
    fit,
    position = ImgPosition.center,
    trim,
    lossless,
    speed,
    reductionEffort,
    compressionLevel,
    palette,
  } = opt

  const sharpStream = sharp({ failOnError: false })
  let sharpOutput = sharpStream.clone()

  if (format === 'auto') {
    if (acceptsHeader.includes('image/avif')) {
      format = 'avif'
    } else if (acceptsHeader.includes('image/webp')) {
      format = 'webp'
    } else {
      format = ''
    }
  }

  format ||= _substringAfterLast(sourceImageUrl, '.')

  sharpOutput = sharpOutput.toFormat(format as any, {
    quality,
    lossless,
    speed,
    compressionLevel,
    reductionEffort,
    palette,
  })
  // .jpeg({quality: opt.quality})

  if (width || height) {
    sharpOutput = sharpOutput.resize({
      width,
      height,
      fit,
      position,
    })
  }

  if (trim) {
    sharpOutput = sharpOutput.trim(trim)
  }

  const [{ data, info }] = await Promise.all([
    sharpOutput.toBuffer({ resolveWithObject: true }),
    _pipeline([got.stream.get(sourceImageUrl), sharpStream]),
  ])

  return [data, info]
}

export interface ImageTransformMiddlewareOptions {}

export function imageTransformMiddleware(
  _opt: ImageTransformMiddlewareOptions = {},
): RequestHandler {
  return async function imageTransformRequestHandler(req, res): Promise<void> {
    const opt = imageTransformOptionsSchema.validate(req.query as any)
    console.log(opt)

    const [buf, info] = await imageTransform(opt, req.header('accept'))

    console.log(info)

    const map = {
      heif: 'avif',
    }

    res
      .header('Cache-Control', 'max-age=31536000')
      .contentType(`image/${map[info.format] || info.format || 'jpeg'}`)
      .send(buf)
  }
}
