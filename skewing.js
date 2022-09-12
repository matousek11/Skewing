const canvasSketch = require('canvas-sketch')
const math = require('canvas-sketch-util/math')
const random = require('canvas-sketch-util/random')
const colors = require('riso-colors')
const colorUtil = require('canvas-sketch-util/color')

const seed = random.getRandomSeed()

const settings = {
  dimensions: [1080, 1080],
  name: seed,
}

const sketch = ({ context, width, height }) => {
  random.setSeed(seed)
  const degrees = -30
  const num = 40

  let x, y, w, h, stroke, fill, blend
  let rects = []

  const rectColors = [random.pick(colors).hex, random.pick(colors).hex]
  const bgColor = random.pick(colors).hex

  const mask = {
    radius: width * 0.4,
    sides: 3,
    x: width * 0.5,
    y: height * 0.5,
  }

  //rect fill
  for (let i = 0; i < num; i++) {
    x = random.range(0, width)
    y = random.range(0, height)
    w = random.range(600, width)
    h = random.range(40, 200)

    stroke = random.pick(rectColors)
    fill = random.pick(rectColors)

    blend = random.value() > 0.5 ? 'overlay' : 'source-over'

    rects.push({ x, y, w, h, stroke, fill, blend })
  }

  return ({ context, width, height }) => {
    //background
    context.fillStyle = bgColor
    context.fillRect(0, 0, width, height)

    //triangle
    context.save()
    context.translate(mask.x, mask.y)

    drawPolygon({ context, radius: mask.radius, sides: mask.sides })

    context.restore()
    context.clip()

    //rect render
    rects.forEach((rect) => {
      context.save()
      const { x, y, w, h, stroke, fill, blend } = rect
      context.strokeStyle = stroke
      context.fillStyle = fill

      context.translate(x, y)
      context.lineWidth = 10

      context.globalCompositeOperation = blend

      drawSkewedRect({ context, w, h, degrees })

      //shadow of rect
      const shadowColor = colorUtil.offsetHSL(fill, 0, 0, -20)
      shadowColor[3] = 0.5
      context.shadowColor = colorUtil.style(shadowColor.rgba)
      context.shadowOffsetX = -10
      context.shadowOffsetY = 20
      context.fill()
      context.shadowColor = null
      context.stroke()

      context.globalCompositeOperation = 'source-over'

      //line over rect
      context.lineWidth = 2
      context.strokeStyle = 'black'
      context.stroke()

      context.restore()
    })

    //polygon outline
    context.save()
    context.translate(mask.x, mask.y)
    context.lineWidth = 20

    drawPolygon({
      context,
      radius: mask.radius,
      sides: mask.sides,
    })

    context.strokeStyle = rectColors[0].hex
    context.stroke()

    context.restore()
  }
}

const drawPolygon = ({ context, radius = 100, sides = 3 }) => {
  const slice = (Math.PI * 2) / sides

  context.beginPath()
  context.moveTo(0, -radius)

  for (let i = 1; i < sides; i++) {
    const theta = i * slice - Math.PI * 0.5
    context.lineTo(Math.cos(theta) * radius, Math.sin(theta) * radius)
  }

  context.closePath()
}

const drawSkewedRect = ({ context, w = 600, h = 200, degrees = -45 }) => {
  let angle, rx, ry
  angle = math.degToRad(degrees)
  rx = Math.cos(angle) * w
  ry = Math.sin(angle) * w

  context.translate(w * -0.5, (ry + h) * -0.5)

  context.beginPath()
  context.moveTo(0, 0)
  context.lineTo(rx, ry)
  context.lineTo(rx, ry + h)
  context.lineTo(0, h)
  context.closePath()
}

canvasSketch(sketch, settings)
