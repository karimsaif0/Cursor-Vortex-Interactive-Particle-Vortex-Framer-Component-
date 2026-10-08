/**

 * Made with 💛 by Karim Saif

 */



"use client"



import * as React from "react"

import { useEffect, useRef, type CSSProperties } from "react"

import {

    addPropertyControls,

    ControlType,

    useIsStaticRenderer,

    useReducedMotion,

} from "framer"



type Preset = "Event Horizon" | "Cyber" | "Plasma" | "Solar" | "Mono" | "Custom"



type ParticleShape = "Mixed" | "Glyphs" | "Pixels" | "Dots"



interface Props {

    background: string

    preset: Preset

    primaryColor: string

    secondaryColor: string

    accentColor: string

    particleCount: number

    particleShape: ParticleShape

    particleSize: number

    sizeVariation: number

    fieldRadius: number

    coreRadius: number

    orbitStrength: number

    attraction: number

    swirl: number

    turbulence: number

    drag: number

    holdBoost: number

    holdSpeed: number

    releaseForce: number

    releaseScatter: number

    releaseLift: number

    glow: number

    glowOpacity: number

    coreGlow: boolean

    coreSize: number

    coreRing: boolean

    trails: boolean

    trailLength: number

    trailOpacity: number

    glyphMix: number

    pixelSnap: boolean

    speed: number

    idleDemo: boolean

    demoDelay: number

    borderRadius: number

    allowTouchInteraction: boolean

    adaptiveQuality: boolean

    style?: CSSProperties

}



interface Particle {

    x: number

    y: number

    vx: number

    vy: number

    size: number

    phase: number

    orbitOffset: number

    colorIndex: number

    glyphIndex: number

    shapeSeed: number

    previousX: number

    previousY: number

}



interface PointerState {

    x: number

    y: number

    tx: number

    ty: number

    inside: boolean

    down: boolean

    hold: number

    demo: boolean

}



const MAX_DPR = 2

const MAX_PARTICLES = 220

const TAU = Math.PI * 2



const GLYPHS = ["+", "×", "○", "□", "◇", "·", "✦", "/", "\\", "01"]



const PRESETS: Record<Exclude<Preset, "Custom">, [string, string, string]> = {

    "Event Horizon": ["#FFFFFF", "#9D72FF", "#4B32B8"],

    Cyber: ["#58F6FF", "#815DFF", "#FF4FD8"],

    Plasma: ["#FFFFFF", "#B64CFF", "#FF3D91"],

    Solar: ["#FFF4B5", "#FF9C42", "#FF405E"],

    Mono: ["#FFFFFF", "#B8BDC7", "#626873"],

}



function clamp(value: number, min: number, max: number) {

    return Math.max(min, Math.min(max, value))

}



function lerp(a: number, b: number, amount: number) {

    return a + (b - a) * amount

}



function random(min: number, max: number) {

    return min + Math.random() * (max - min)

}



function hexToRgb(value: string): [number, number, number] {

    if (typeof value !== "string") {

        return [255, 255, 255]

    }



    let hex = value.trim().replace("#", "")



    if (hex.length === 3) {

        hex = hex

            .split("")

            .map((character) => character + character)

            .join("")

    }



    if (!/^[0-9a-f]{6}$/i.test(hex)) {

        return [255, 255, 255]

    }



    return [

        parseInt(hex.slice(0, 2), 16),

        parseInt(hex.slice(2, 4), 16),

        parseInt(hex.slice(4, 6), 16),

    ]

}



function rgba(color: string, alpha: number) {

    const [r, g, b] = hexToRgb(color)



    return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1)})`

}



function getColors(props: Props) {

    if (props.preset === "Custom") {

        return [props.primaryColor, props.secondaryColor, props.accentColor]

    }



    return PRESETS[props.preset] || PRESETS["Event Horizon"]

}



function getParticleKind(shape: ParticleShape, seed: number, glyphMix: number) {

    if (shape === "Glyphs") return "glyph"

    if (shape === "Pixels") return "pixel"

    if (shape === "Dots") return "dot"



    if (seed * 100 < glyphMix) {

        return "glyph"

    }



    return seed < 0.72 ? "pixel" : "dot"

}



function createParticles(

    count: number,

    width: number,

    height: number,

    radius: number,

    size: number,

    variation: number

) {

    const particles: Particle[] = []



    const centerX = width * 0.5

    const centerY = height * 0.5



    const variationScale = clamp(variation, 0, 100) / 100



    for (let index = 0; index < count; index++) {

        const angle = Math.random() * TAU



        const distance = Math.sqrt(Math.random()) * Math.max(20, radius)



        const particleSize =

            size *

            random(Math.max(0.3, 1 - variationScale * 0.7), 1 + variationScale)



        const x = centerX + Math.cos(angle) * distance

        const y = centerY + Math.sin(angle) * distance



        particles.push({

            x,

            y,

            vx: random(-0.2, 0.2),

            vy: random(-0.2, 0.2),

            size: particleSize,

            phase: Math.random() * TAU,

            orbitOffset: random(0.75, 1.25),

            colorIndex: Math.floor(Math.random() * 3),

            glyphIndex: Math.floor(Math.random() * GLYPHS.length),

            shapeSeed: Math.random(),

            previousX: x,

            previousY: y,

        })

    }



    return particles

}



function drawCore(

    ctx: CanvasRenderingContext2D,

    x: number,

    y: number,

    radius: number,

    color: string,

    secondary: string,

    glow: number,

    glowOpacity: number,

    ring: boolean,

    intensity: number

) {

    ctx.save()



    const haloRadius = Math.max(radius * 5, 24) * (1 + intensity * 0.2)



    const halo = ctx.createRadialGradient(x, y, 0, x, y, haloRadius)



    halo.addColorStop(0, rgba(color, 0.48 * glowOpacity))



    halo.addColorStop(0.18, rgba(secondary, 0.25 * glowOpacity))



    halo.addColorStop(0.52, rgba(secondary, 0.08 * glowOpacity))



    halo.addColorStop(1, rgba(secondary, 0))



    ctx.fillStyle = halo

    ctx.beginPath()

    ctx.arc(x, y, haloRadius, 0, TAU)

    ctx.fill()



    if (ring) {

        ctx.strokeStyle = rgba(secondary, 0.35 + intensity * 0.25)



        ctx.lineWidth = 1



        ctx.shadowBlur = glow

        ctx.shadowColor = secondary



        ctx.beginPath()



        ctx.ellipse(

            x,

            y,

            radius * (2.8 + intensity * 0.5),

            radius * (0.85 + intensity * 0.15),

            -0.25,

            0,

            TAU

        )



        ctx.stroke()

    }



    ctx.shadowBlur = glow * (1 + intensity * 0.4)

    ctx.shadowColor = rgba(color, glowOpacity)



    const coreGradient = ctx.createRadialGradient(

        x,

        y,

        0,

        x,

        y,

        Math.max(1, radius)

    )



    coreGradient.addColorStop(0, "#000000")

    coreGradient.addColorStop(0.65, "#000000")

    coreGradient.addColorStop(0.82, rgba(secondary, 0.45))

    coreGradient.addColorStop(1, rgba(color, 0.95))



    ctx.fillStyle = coreGradient



    ctx.beginPath()

    ctx.arc(x, y, Math.max(1, radius * (1 + intensity * 0.08)), 0, TAU)

    ctx.fill()



    ctx.restore()

}



function drawStaticPreview(

    ctx: CanvasRenderingContext2D,

    width: number,

    height: number,

    dpr: number,

    props: Props

) {

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)



    ctx.clearRect(0, 0, width, height)



    ctx.fillStyle = props.background

    ctx.fillRect(0, 0, width, height)



    const colors = getColors(props)



    const centerX = width * 0.52

    const centerY = height * 0.48



    const count = Math.min(90, Math.max(28, props.particleCount))



    ctx.save()

    ctx.globalCompositeOperation = "lighter"



    for (let index = 0; index < count; index++) {

        const normalized = index / Math.max(1, count - 1)



        const angle = normalized * Math.PI * 8.5 + Math.sin(index * 1.7) * 0.35



        const radius =

            20 +

            normalized *

                Math.min(props.fieldRadius, Math.min(width, height) * 0.43)



        const x =

            centerX +

            Math.cos(angle) * radius * (0.9 + Math.sin(index * 4.2) * 0.08)



        const y =

            centerY +

            Math.sin(angle) * radius * (0.72 + Math.cos(index * 2.8) * 0.08)



        const alpha = 0.25 + (1 - normalized) * 0.7



        const color = colors[index % 3]



        const seed = ((index * 37) % 100) / 100



        const kind = getParticleKind(props.particleShape, seed, props.glyphMix)



        const variation = props.sizeVariation / 100



        const size =

            props.particleSize *

            (0.65 + ((index * 19) % 50) / 100 + variation * 0.15)



        if (kind === "glyph") {

            ctx.save()



            ctx.fillStyle = rgba(color, alpha)

            ctx.font = `${Math.max(7, size * 3.2)}px monospace`

            ctx.textAlign = "center"

            ctx.textBaseline = "middle"

            ctx.shadowBlur = props.glow

            ctx.shadowColor = rgba(color, props.glowOpacity / 100)



            ctx.fillText(GLYPHS[index % GLYPHS.length], x, y)



            ctx.restore()

        } else if (kind === "dot") {

            ctx.save()



            ctx.fillStyle = rgba(color, alpha)

            ctx.shadowBlur = props.glow

            ctx.shadowColor = rgba(color, props.glowOpacity / 100)



            ctx.beginPath()

            ctx.arc(x, y, Math.max(0.5, size * 0.5), 0, TAU)

            ctx.fill()



            ctx.restore()

        } else {

            ctx.save()



            ctx.fillStyle = rgba(color, alpha)

            ctx.shadowBlur = props.glow

            ctx.shadowColor = rgba(color, props.glowOpacity / 100)



            ctx.fillRect(

                Math.round(x - size / 2),

                Math.round(y - size / 2),

                size,

                size

            )



            ctx.restore()

        }

    }



    ctx.restore()



    if (props.coreGlow) {

        drawCore(

            ctx,

            centerX,

            centerY,

            props.coreSize,

            colors[0],

            colors[1],

            props.glow,

            props.glowOpacity / 100,

            props.coreRing,

            0.35

        )

    }

}



export default function KarimSaifCursorVortex(props: Props) {

    const {

        background = "#050508",

        preset = "Event Horizon",

        primaryColor = "#FFFFFF",

        secondaryColor = "#9D72FF",

        accentColor = "#4B32B8",

        particleCount = 100,

        particleShape = "Mixed",

        particleSize = 2.5,

        sizeVariation = 60,

        fieldRadius = 230,

        coreRadius = 22,

        orbitStrength = 55,

        attraction = 48,

        swirl = 70,

        turbulence = 15,

        drag = 2.8,

        holdBoost = 85,

        holdSpeed = 1.2,

        releaseForce = 90,

        releaseScatter = 35,

        releaseLift = 5,

        glow = 10,

        glowOpacity = 65,

        coreGlow = true,

        coreSize = 10,

        coreRing = true,

        trails = true,

        trailLength = 18,

        trailOpacity = 45,

        glyphMix = 30,

        pixelSnap = false,

        speed = 50,

        idleDemo = true,

        demoDelay = 2,

        borderRadius = 0,

        allowTouchInteraction = false,

        adaptiveQuality = true,

        style,

    } = props



    const isStaticRenderer = useIsStaticRenderer()

    const reducedMotion = useReducedMotion()



    const rootRef = useRef<HTMLDivElement>(null)

    const canvasRef = useRef<HTMLCanvasElement>(null)

    const propsRef = useRef<Props>(props)

    const redrawRef = useRef<(() => void) | null>(null)



    propsRef.current = {

        ...props,

        background,

        preset,

        primaryColor,

        secondaryColor,

        accentColor,

        particleCount,

        particleShape,

        particleSize,

        sizeVariation,

        fieldRadius,

        coreRadius,

        orbitStrength,

        attraction,

        swirl,

        turbulence,

        drag,

        holdBoost,

        holdSpeed,

        releaseForce,

        releaseScatter,

        releaseLift,

        glow,

        glowOpacity,

        coreGlow,

        coreSize,

        coreRing,

        trails,

        trailLength,

        trailOpacity,

        glyphMix,

        pixelSnap,

        speed,

        idleDemo,

        demoDelay,

        borderRadius,

        allowTouchInteraction,

        adaptiveQuality,

        style,

    }



    useEffect(() => {

        const root = rootRef.current

        const canvas = canvasRef.current



        if (!root || !canvas) return



        const ctx = canvas.getContext("2d", {

            alpha: true,

        })



        if (!ctx) return



        let width = 1

        let height = 1

        let dpr = 1



        let particles: Particle[] = []

        let particleKey = ""

        let lastSizeKey = ""

        let lastPointerActivity = 0

        let frameAverage = 0.016

        let quality = 1

        let qualityCounter = 0



        let raf = 0

        let lastTime = -1

        let elapsed = 0

        let idleTime = 0

        let inView = true

        let pageVisible = !document.hidden

        let destroyed = false

        let releaseQueued = false



        const pointer: PointerState = {

            x: 0,

            y: 0,

            tx: 0,

            ty: 0,

            inside: false,

            down: false,

            hold: 0,

            demo: false,

        }



        const rebuildParticles = () => {

            const current = propsRef.current



            const count = Math.round(

                clamp(current.particleCount, 12, MAX_PARTICLES)

            )



            const key = [

                Math.round(width),

                Math.round(height),

                count,

                current.particleSize,

                current.sizeVariation,

                current.fieldRadius,

            ].join("|")



            if (particleKey === key && particles.length === count) {

                return

            }



            particleKey = key



            particles = createParticles(

                count,

                width,

                height,

                current.fieldRadius,

                current.particleSize,

                current.sizeVariation

            )

        }



        const resize = () => {

            const rect = root.getBoundingClientRect()



            width = Math.max(1, rect.width)

            height = Math.max(1, rect.height)



            dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1)



            const pixelWidth = Math.max(1, Math.round(width * dpr))



            const pixelHeight = Math.max(1, Math.round(height * dpr))



            if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {

                canvas.width = pixelWidth

                canvas.height = pixelHeight

            }



            canvas.style.width = `${width}px`

            canvas.style.height = `${height}px`



            if (pointer.x === 0 && pointer.y === 0) {

                pointer.x = width * 0.5

                pointer.y = height * 0.5

                pointer.tx = pointer.x

                pointer.ty = pointer.y

            }



            const sizeKey = `${pixelWidth}|${pixelHeight}`

            if (lastSizeKey !== sizeKey) {

                lastSizeKey = sizeKey

                particleKey = ""

            }

            rebuildParticles()



            if (isStaticRenderer || reducedMotion) {

                drawStaticPreview(ctx, width, height, dpr, propsRef.current)

            }

        }



        const getPointerPosition = (event: PointerEvent) => {

            const rect = canvas.getBoundingClientRect()



            return {

                x: event.clientX - rect.left,

                y: event.clientY - rect.top,

            }

        }



        const onPointerEnter = (event: PointerEvent) => {

            if (

                event.pointerType === "touch" &&

                !propsRef.current.allowTouchInteraction

            )

                return

            const position = getPointerPosition(event)



            pointer.x = position.x

            pointer.y = position.y

            pointer.tx = position.x

            pointer.ty = position.y

            pointer.inside = true

            pointer.demo = false

            idleTime = 0

        }



        const onPointerMove = (event: PointerEvent) => {

            if (

                event.pointerType === "touch" &&

                !propsRef.current.allowTouchInteraction

            )

                return

            const position = getPointerPosition(event)



            if (!pointer.inside) {

                pointer.x = position.x

                pointer.y = position.y

            }



            pointer.tx = position.x

            pointer.ty = position.y

            pointer.inside = true

            pointer.demo = false

            idleTime = 0

        }



        const onPointerLeave = () => {

            pointer.inside = false



            if (pointer.down) {

                pointer.down = false

                releaseQueued = true

            }



            idleTime = 0

        }



        const onPointerDown = (event: PointerEvent) => {

            if (

                reducedMotion ||

                (event.pointerType === "touch" &&

                    !propsRef.current.allowTouchInteraction)

            )

                return



            const position = getPointerPosition(event)



            pointer.x = position.x

            pointer.y = position.y

            pointer.tx = position.x

            pointer.ty = position.y

            pointer.inside = true

            pointer.down = true

            pointer.demo = false

            pointer.hold = 0

            idleTime = 0



            try {

                canvas.setPointerCapture(event.pointerId)

            } catch {}

        }



        const onPointerUp = (event: PointerEvent) => {

            if (!pointer.down) return



            pointer.down = false

            releaseQueued = true



            try {

                if (canvas.hasPointerCapture(event.pointerId)) {

                    canvas.releasePointerCapture(event.pointerId)

                }

            } catch {}

        }



        const resizeObserver =

            typeof ResizeObserver !== "undefined"

                ? new ResizeObserver(resize)

                : null



        resizeObserver?.observe(root)

        window.addEventListener("resize", resize)



        let intersectionObserver: IntersectionObserver | null = null



        const requestFrame = () => {

            if (

                destroyed ||

                isStaticRenderer ||

                reducedMotion ||

                !inView ||

                !pageVisible ||

                raf

            ) {

                return

            }



            raf = requestAnimationFrame(frame)

        }



        if (typeof IntersectionObserver !== "undefined") {

            intersectionObserver = new IntersectionObserver(

                (entries) => {

                    inView = entries[0]?.isIntersecting ?? true



                    if (inView) {

                        lastTime = -1

                        requestFrame()

                    } else if (raf) {

                        cancelAnimationFrame(raf)

                        raf = 0

                    }

                },

                {

                    threshold: 0,

                    rootMargin: "120px",

                }

            )



            intersectionObserver.observe(root)

        }



        const onVisibilityChange = () => {

            pageVisible = !document.hidden



            if (pageVisible) {

                lastTime = -1

                requestFrame()

            } else if (raf) {

                cancelAnimationFrame(raf)

                raf = 0

            }

        }



        document.addEventListener("visibilitychange", onVisibilityChange)



        canvas.addEventListener("pointerenter", onPointerEnter)



        canvas.addEventListener("pointermove", onPointerMove)



        canvas.addEventListener("pointerleave", onPointerLeave)



        canvas.addEventListener("pointerdown", onPointerDown)



        canvas.addEventListener("pointerup", onPointerUp)



        canvas.addEventListener("pointercancel", onPointerUp)



        redrawRef.current = () => {

            if (isStaticRenderer || reducedMotion) {

                drawStaticPreview(ctx, width, height, dpr, propsRef.current)

            }

        }

        resize()



        function frame(now: number) {

            raf = 0



            if (

                destroyed ||

                isStaticRenderer ||

                reducedMotion ||

                !inView ||

                !pageVisible

            ) {

                return

            }



            const current = propsRef.current



            rebuildParticles()



            const dt =

                lastTime < 0 ? 0 : Math.min((now - lastTime) / 1000, 0.033)



            lastTime = now

            if (propsRef.current.adaptiveQuality && dt > 0) {

                frameAverage = frameAverage * 0.96 + dt * 0.04

                qualityCounter++

                if (qualityCounter >= 90) {

                    quality =

                        frameAverage > 0.027

                            ? 0.55

                            : frameAverage > 0.021

                              ? 0.75

                              : 1

                    qualityCounter = 0

                }

            } else {

                quality = 1

            }



            const speedScale = clamp(current.speed, 10, 100) / 50



            const simulationDt = dt * speedScale



            elapsed += simulationDt

            idleTime += dt



            if (

                current.idleDemo &&

                !pointer.inside &&

                idleTime >= Math.max(0, current.demoDelay)

            ) {

                pointer.demo = true



                pointer.tx =

                    width * 0.5 + Math.cos(elapsed * 0.57) * width * 0.18



                pointer.ty =

                    height * 0.5 + Math.sin(elapsed * 0.74) * height * 0.16

            } else if (!pointer.inside) {

                pointer.demo = false

            }



            const active = pointer.inside || pointer.demo



            const follow = 1 - Math.exp(-dt * 16)



            pointer.x = lerp(pointer.x, pointer.tx, follow)



            pointer.y = lerp(pointer.y, pointer.ty, follow)



            if (pointer.down) {

                pointer.hold = clamp(

                    pointer.hold +

                        simulationDt * Math.max(0.1, current.holdSpeed),

                    0,

                    1

                )

            } else {

                pointer.hold = Math.max(0, pointer.hold - simulationDt * 1.8)

            }



            if (releaseQueued) {

                releaseQueued = false



                const releaseMultiplier =

                    1 + pointer.hold * (current.holdBoost / 100)



                for (const particle of particles) {

                    const dx = particle.x - pointer.x



                    const dy = particle.y - pointer.y



                    const distance = Math.max(1, Math.hypot(dx, dy))



                    if (distance > current.fieldRadius * 1.25) {

                        continue

                    }



                    const influence =

                        1 - clamp(distance / (current.fieldRadius * 1.25), 0, 1)



                    const outward =

                        current.releaseForce *

                        0.065 *

                        releaseMultiplier *

                        (0.35 + influence * 0.65)



                    const tangentX = -dy / distance



                    const tangentY = dx / distance



                    const radialX = dx / distance



                    const radialY = dy / distance



                    const scatter =

                        (current.releaseScatter / 100) * random(-2.5, 2.5)



                    particle.vx += radialX * outward + tangentX * scatter



                    particle.vy +=

                        radialY * outward +

                        tangentY * scatter -

                        current.releaseLift * 0.03

                }



                pointer.hold = 0

            }



            for (const particle of particles) {

                particle.previousX = particle.x



                particle.previousY = particle.y



                if (active) {

                    const dx = pointer.x - particle.x



                    const dy = pointer.y - particle.y



                    const distance = Math.max(1, Math.hypot(dx, dy))



                    const normalized = clamp(

                        distance / Math.max(20, current.fieldRadius),

                        0,

                        1.5

                    )



                    const fieldInfluence = clamp(1 - normalized / 1.25, 0, 1)



                    const radialX = dx / distance



                    const radialY = dy / distance



                    const tangentX = -radialY



                    const tangentY = radialX



                    const holdMultiplier =

                        1 + pointer.hold * (current.holdBoost / 100) * 2



                    const attractionForce =

                        current.attraction *

                        0.018 *

                        fieldInfluence *

                        holdMultiplier



                    const swirlForce =

                        current.swirl *

                        0.024 *

                        fieldInfluence *

                        particle.orbitOffset *

                        holdMultiplier



                    particle.vx += radialX * attractionForce * simulationDt * 60



                    particle.vy += radialY * attractionForce * simulationDt * 60



                    particle.vx += tangentX * swirlForce * simulationDt * 60



                    particle.vy += tangentY * swirlForce * simulationDt * 60



                    if (distance < current.coreRadius) {

                        const escape =

                            1 - distance / Math.max(1, current.coreRadius)



                        particle.vx -= radialX * escape * 0.8



                        particle.vy -= radialY * escape * 0.8



                        particle.vx += tangentX * escape * 1.5



                        particle.vy += tangentY * escape * 1.5

                    }



                    const orbitTarget =

                        current.fieldRadius *

                        (0.18 + particle.orbitOffset * 0.2)



                    const orbitError = distance - orbitTarget



                    const orbitCorrection =

                        orbitError *

                        current.orbitStrength *

                        0.00035 *

                        fieldInfluence



                    particle.vx += radialX * orbitCorrection * simulationDt * 60



                    particle.vy += radialY * orbitCorrection * simulationDt * 60

                }



                if (active) {

                    const distToPointer = Math.hypot(

                        particle.x - pointer.x,

                        particle.y - pointer.y

                    )

                    const recoveryRadius = Math.max(

                        100,

                        current.fieldRadius * 2.2

                    )

                    if (distToPointer > recoveryRadius) {

                        const recover = Math.min(0.015, simulationDt * 0.3)

                        particle.vx += (pointer.x - particle.x) * recover

                        particle.vy += (pointer.y - particle.y) * recover

                    }

                }



                const turbulence = current.turbulence / 100



                if (turbulence > 0) {

                    particle.vx +=

                        Math.sin(elapsed * 1.7 + particle.phase) *

                        turbulence *

                        simulationDt



                    particle.vy +=

                        Math.cos(elapsed * 1.31 + particle.phase * 1.41) *

                        turbulence *

                        simulationDt

                }



                const dragAmount = Math.exp(

                    -Math.max(0.1, current.drag) * simulationDt * 0.35

                )



                particle.vx *= dragAmount

                particle.vy *= dragAmount



                particle.x += particle.vx * simulationDt * 60



                particle.y += particle.vy * simulationDt * 60



                if (!active && !current.idleDemo) {

                    const cx = width * 0.5

                    const cy = height * 0.5

                    const distanceFromCenter = Math.hypot(

                        particle.x - cx,

                        particle.y - cy

                    )

                    if (

                        distanceFromCenter >

                        Math.max(

                            current.fieldRadius * 1.5,

                            Math.min(width, height) * 0.55

                        )

                    ) {

                        const pull = Math.min(0.025, simulationDt * 0.5)

                        particle.vx += (cx - particle.x) * pull

                        particle.vy += (cy - particle.y) * pull

                    }

                }



                if (particle.x < -80) {

                    particle.x = width + 80

                    particle.previousX = particle.x

                } else if (particle.x > width + 80) {

                    particle.x = -80

                    particle.previousX = particle.x

                }



                if (particle.y < -80) {

                    particle.y = height + 80

                    particle.previousY = particle.y

                } else if (particle.y > height + 80) {

                    particle.y = -80

                    particle.previousY = particle.y

                }

            }



            const colors = getColors(current)



            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)



            ctx.clearRect(0, 0, width, height)



            ctx.fillStyle = current.background



            ctx.fillRect(0, 0, width, height)



            if (current.trails) {

                ctx.save()



                ctx.globalCompositeOperation = "lighter"



                for (let index = 0; index < particles.length; index++) {

                    if (quality < 1 && index % 20 >= Math.floor(quality * 20))

                        continue

                    const particle = particles[index]

                    const speed = Math.hypot(particle.vx, particle.vy)



                    if (speed < 0.08) {

                        continue

                    }



                    const color = colors[particle.colorIndex]



                    const trailScale = clamp(current.trailLength / 20, 0.1, 4)



                    const dx = particle.x - particle.previousX



                    const dy = particle.y - particle.previousY



                    ctx.strokeStyle = rgba(

                        color,

                        (current.trailOpacity / 100) * clamp(speed / 4, 0.1, 1)

                    )



                    ctx.lineWidth = Math.max(0.4, particle.size * 0.45)



                    ctx.beginPath()



                    ctx.moveTo(particle.x, particle.y)



                    ctx.lineTo(

                        particle.x - dx * trailScale,

                        particle.y - dy * trailScale

                    )



                    ctx.stroke()

                }



                ctx.restore()

            }



            ctx.save()



            ctx.globalCompositeOperation = "lighter"



            for (const particle of particles) {

                const color = colors[particle.colorIndex]



                const kind = getParticleKind(

                    current.particleShape,

                    particle.shapeSeed,

                    current.glyphMix

                )



                const distance = active

                    ? Math.hypot(particle.x - pointer.x, particle.y - pointer.y)

                    : current.fieldRadius



                const proximity = active

                    ? 1 -

                      clamp(distance / Math.max(1, current.fieldRadius), 0, 1)

                    : 0



                const alpha = 0.45 + proximity * 0.55



                let x = particle.x

                let y = particle.y



                if (current.pixelSnap && kind !== "dot") {

                    const snap = Math.max(1, particle.size)



                    x = Math.round(x / snap) * snap



                    y = Math.round(y / snap) * snap

                }



                ctx.save()



                ctx.globalAlpha = alpha



                ctx.fillStyle = color



                ctx.shadowBlur = current.glow * (0.5 + proximity * 0.5)



                ctx.shadowColor = rgba(color, current.glowOpacity / 100)



                if (kind === "glyph") {

                    ctx.font = `${Math.max(7, particle.size * 3.2)}px monospace`



                    ctx.textAlign = "center"



                    ctx.textBaseline = "middle"



                    ctx.fillText(GLYPHS[particle.glyphIndex], x, y)

                } else if (kind === "dot") {

                    ctx.beginPath()



                    ctx.arc(x, y, Math.max(0.5, particle.size * 0.5), 0, TAU)



                    ctx.fill()

                } else {

                    ctx.fillRect(

                        x - particle.size / 2,

                        y - particle.size / 2,

                        particle.size,

                        particle.size

                    )

                }



                ctx.restore()

            }



            ctx.restore()



            if (active && current.coreGlow) {

                drawCore(

                    ctx,

                    pointer.x,

                    pointer.y,

                    current.coreSize,

                    colors[0],

                    colors[1],

                    current.glow,

                    current.glowOpacity / 100,

                    current.coreRing,

                    pointer.hold

                )

            }



            requestFrame()

        }



        if (!isStaticRenderer && !reducedMotion) {

            requestFrame()

        }



        return () => {

            destroyed = true



            if (raf) {

                cancelAnimationFrame(raf)

            }



            redrawRef.current = null

            resizeObserver?.disconnect()

            window.removeEventListener("resize", resize)



            intersectionObserver?.disconnect()



            document.removeEventListener("visibilitychange", onVisibilityChange)



            canvas.removeEventListener("pointerenter", onPointerEnter)



            canvas.removeEventListener("pointermove", onPointerMove)



            canvas.removeEventListener("pointerleave", onPointerLeave)



            canvas.removeEventListener("pointerdown", onPointerDown)



            canvas.removeEventListener("pointerup", onPointerUp)



            canvas.removeEventListener("pointercancel", onPointerUp)

        }

    }, [isStaticRenderer, reducedMotion])



    useEffect(() => {

        redrawRef.current?.()

    }, [

        isStaticRenderer,

        reducedMotion,

        background,

        preset,

        primaryColor,

        secondaryColor,

        accentColor,

        particleCount,

        particleShape,

        particleSize,

        sizeVariation,

        fieldRadius,

        coreRadius,

        orbitStrength,

        attraction,

        swirl,

        turbulence,

        drag,

        holdBoost,

        holdSpeed,

        releaseForce,

        releaseScatter,

        releaseLift,

        glow,

        glowOpacity,

        coreGlow,

        coreSize,

        coreRing,

        trails,

        trailLength,

        trailOpacity,

        glyphMix,

        pixelSnap,

        speed,

        idleDemo,

        demoDelay,

        borderRadius,

        allowTouchInteraction,

        adaptiveQuality,

    ])



    return (

        <div

            ref={rootRef}

            style={{

                ...style,

                position: "relative",

                width: "100%",

                height: "100%",

                overflow: "hidden",

                background,

                borderRadius,

            }}

        >

            <canvas

                ref={canvasRef}

                aria-hidden="true"

                style={{

                    position: "absolute",

                    inset: 0,

                    width: "100%",

                    height: "100%",

                    display: "block",

                    cursor: "none",

                    touchAction: allowTouchInteraction ? "none" : "pan-y",

                }}

            />

        </div>

    )

}



KarimSaifCursorVortex.defaultProps = {

    background: "#050508",

    preset: "Event Horizon",

    primaryColor: "#FFFFFF",

    secondaryColor: "#9D72FF",

    accentColor: "#4B32B8",

    particleCount: 100,

    particleShape: "Mixed",

    particleSize: 2.5,

    sizeVariation: 60,

    fieldRadius: 230,

    coreRadius: 22,

    orbitStrength: 55,

    attraction: 48,

    swirl: 70,

    turbulence: 15,

    drag: 2.8,

    holdBoost: 85,

    holdSpeed: 1.2,

    releaseForce: 90,

    releaseScatter: 35,

    releaseLift: 5,

    glow: 10,

    glowOpacity: 65,

    coreGlow: true,

    coreSize: 10,

    coreRing: true,

    trails: true,

    trailLength: 18,

    trailOpacity: 45,

    glyphMix: 30,

    pixelSnap: false,

    speed: 50,

    idleDemo: true,

    demoDelay: 2,

    borderRadius: 0,

    allowTouchInteraction: false,

    adaptiveQuality: true,

}



addPropertyControls(KarimSaifCursorVortex, {

    background: {

        type: ControlType.Color,

        title: "Background",

        defaultValue: "#050508",

        description:

            "Sets the background color behind the Cursor Vortex effect.",

    },



    preset: {

        type: ControlType.Enum,

        title: "Preset",

        options: [

            "Event Horizon",

            "Cyber",

            "Plasma",

            "Solar",

            "Mono",

            "Custom",

        ],

        optionTitles: [

            "Event Horizon",

            "Cyber",

            "Plasma",

            "Solar",

            "Mono",

            "Custom",

        ],

        defaultValue: "Event Horizon",

        description:

            "Selects a ready-made vortex color palette or Custom for your own colors.",

    },



    primaryColor: {

        type: ControlType.Color,

        title: "Primary",

        defaultValue: "#FFFFFF",

        hidden: (props) => props.preset !== "Custom",

        description:

            "Sets the brightest vortex particle and core color when Custom is selected.",

    },



    secondaryColor: {

        type: ControlType.Color,

        title: "Secondary",

        defaultValue: "#9D72FF",

        hidden: (props) => props.preset !== "Custom",

        description:

            "Sets the secondary color used by orbiting particles, glow, and the core ring.",

    },



    accentColor: {

        type: ControlType.Color,

        title: "Accent",

        defaultValue: "#4B32B8",

        hidden: (props) => props.preset !== "Custom",

        description:

            "Sets the third accent color mixed throughout the vortex particles.",

    },



    particleCount: {

        type: ControlType.Number,

        title: "Particles",

        min: 12,

        max: 220,

        step: 1,

        defaultValue: 100,

        description:

            "Controls the number of particles orbiting and reacting to the cursor vortex.",

    },



    particleShape: {

        type: ControlType.Enum,

        title: "Particle Type",

        options: ["Mixed", "Glyphs", "Pixels", "Dots"],

        optionTitles: ["Mixed", "Glyphs", "Pixels", "Dots"],

        defaultValue: "Mixed",

        description:

            "Chooses whether the vortex uses a mixture of shapes, only glyphs, square pixels, or circular dots.",

    },



    glyphMix: {

        type: ControlType.Number,

        title: "Glyph Mix",

        min: 0,

        max: 100,

        step: 1,

        defaultValue: 30,

        unit: "%",

        hidden: (props) => props.particleShape !== "Mixed",

        description:

            "Controls how many particles become digital symbols when using the Mixed particle type.",

    },



    particleSize: {

        type: ControlType.Number,

        title: "Particle Size",

        min: 0.5,

        max: 10,

        step: 0.5,

        defaultValue: 2.5,

        unit: "px",

        description:

            "Controls the base visual size of vortex particles and glyphs.",

    },



    sizeVariation: {

        type: ControlType.Number,

        title: "Size Variation",

        min: 0,

        max: 100,

        step: 1,

        defaultValue: 60,

        unit: "%",

        description:

            "Controls how much individual particle sizes vary throughout the vortex.",

    },



    fieldRadius: {

        type: ControlType.Number,

        title: "Vortex Radius",

        min: 60,

        max: 600,

        step: 10,

        defaultValue: 230,

        unit: "px",

        description:

            "Controls how far from the cursor the vortex can capture and influence particles.",

    },



    coreRadius: {

        type: ControlType.Number,

        title: "Core Radius",

        min: 5,

        max: 100,

        step: 1,

        defaultValue: 22,

        unit: "px",

        description:

            "Defines the inner orbital zone where particles accelerate around the black-hole core instead of collapsing into it.",

    },



    orbitStrength: {

        type: ControlType.Number,

        title: "Orbit",

        min: 0,

        max: 100,

        step: 1,

        defaultValue: 55,

        unit: "%",

        description:

            "Controls how strongly captured particles try to maintain an orbit around the cursor.",

    },



    attraction: {

        type: ControlType.Number,

        title: "Attraction",

        min: 0,

        max: 100,

        step: 1,

        defaultValue: 48,

        unit: "%",

        description:

            "Controls the inward gravitational pull that draws nearby particles toward the cursor.",

    },



    swirl: {

        type: ControlType.Number,

        title: "Swirl",

        min: -100,

        max: 100,

        step: 1,

        defaultValue: 70,

        unit: "%",

        description:

            "Controls rotational vortex force. Negative values reverse the direction of rotation.",

    },



    turbulence: {

        type: ControlType.Number,

        title: "Turbulence",

        min: 0,

        max: 100,

        step: 1,

        defaultValue: 15,

        unit: "%",

        description:

            "Adds subtle irregular movement so the orbiting particle field feels more organic.",

    },



    drag: {

        type: ControlType.Number,

        title: "Drag",

        min: 0.1,

        max: 10,

        step: 0.1,

        defaultValue: 2.8,

        description:

            "Controls how quickly particle momentum is damped after gravitational or release forces are applied.",

    },



    holdBoost: {

        type: ControlType.Number,

        title: "Hold Power",

        min: 0,

        max: 200,

        step: 5,

        defaultValue: 85,

        unit: "%",

        description:

            "Controls how much stronger attraction and rotation become while the pointer is held down.",

    },



    holdSpeed: {

        type: ControlType.Number,

        title: "Charge Speed",

        min: 0.1,

        max: 4,

        step: 0.1,

        defaultValue: 1.2,

        description:

            "Controls how quickly the vortex reaches maximum strength while the pointer is held down.",

    },



    releaseForce: {

        type: ControlType.Number,

        title: "Release Force",

        min: 0,

        max: 200,

        step: 5,

        defaultValue: 90,

        description:

            "Controls how strongly captured particles are thrown outward when the pointer is released.",

    },



    releaseScatter: {

        type: ControlType.Number,

        title: "Release Scatter",

        min: 0,

        max: 100,

        step: 1,

        defaultValue: 35,

        unit: "%",

        description:

            "Adds tangential variation to released particles so the explosion feels less perfectly radial.",

    },



    releaseLift: {

        type: ControlType.Number,

        title: "Release Lift",

        min: -50,

        max: 50,

        step: 1,

        defaultValue: 5,

        description:

            "Adds vertical force when captured particles are released from the vortex.",

    },



    glow: {

        type: ControlType.Number,

        title: "Glow",

        min: 0,

        max: 40,

        step: 1,

        defaultValue: 10,

        unit: "px",

        description:

            "Controls the neon glow radius around particles, trails, and the vortex core.",

    },



    glowOpacity: {

        type: ControlType.Number,

        title: "Glow Alpha",

        min: 0,

        max: 100,

        step: 1,

        defaultValue: 65,

        unit: "%",

        description:

            "Controls the intensity of the neon glow throughout the Cursor Vortex.",

    },



    coreGlow: {

        type: ControlType.Boolean,

        title: "Core",

        defaultValue: true,

        enabledTitle: "Show",

        disabledTitle: "Hide",

        description:

            "Shows the miniature glowing black-hole core at the cursor position.",

    },



    coreSize: {

        type: ControlType.Number,

        title: "Core Size",

        min: 2,

        max: 40,

        step: 1,

        defaultValue: 10,

        unit: "px",

        hidden: (props) => !props.coreGlow,

        description:

            "Controls the visible size of the black-hole core at the center of the vortex.",

    },



    coreRing: {

        type: ControlType.Boolean,

        title: "Core Ring",

        defaultValue: true,

        enabledTitle: "Show",

        disabledTitle: "Hide",

        hidden: (props) => !props.coreGlow,

        description:

            "Adds a glowing elliptical orbital ring around the miniature vortex core.",

    },



    trails: {

        type: ControlType.Boolean,

        title: "Trails",

        defaultValue: true,

        enabledTitle: "Show",

        disabledTitle: "Hide",

        description:

            "Adds short velocity trails behind moving particles to emphasize their orbital motion.",

    },



    trailLength: {

        type: ControlType.Number,

        title: "Trail Length",

        min: 2,

        max: 60,

        step: 1,

        defaultValue: 18,

        hidden: (props) => !props.trails,

        description:

            "Controls how far particle motion trails extend behind orbiting and released particles.",

    },



    trailOpacity: {

        type: ControlType.Number,

        title: "Trail Alpha",

        min: 0,

        max: 100,

        step: 1,

        defaultValue: 45,

        unit: "%",

        hidden: (props) => !props.trails,

        description:

            "Controls the opacity of velocity trails behind vortex particles.",

    },



    pixelSnap: {

        type: ControlType.Boolean,

        title: "Pixel Snap",

        defaultValue: false,

        enabledTitle: "On",

        disabledTitle: "Off",

        description:

            "Snaps pixel and glyph particles to a subtle grid for a sharper digital style.",

    },



    speed: {

        type: ControlType.Number,

        title: "Speed",

        min: 10,

        max: 100,

        step: 1,

        defaultValue: 50,

        unit: "%",

        description:

            "Controls the overall simulation speed of orbital movement, attraction, release physics, and idle motion.",

    },



    idleDemo: {

        type: ControlType.Boolean,

        title: "Auto Demo",

        defaultValue: true,

        enabledTitle: "On",

        disabledTitle: "Off",

        description:

            "Automatically moves the vortex through the component when no pointer interaction is active.",

    },



    demoDelay: {

        type: ControlType.Number,

        title: "Demo Delay",

        min: 0,

        max: 10,

        step: 0.1,

        defaultValue: 2,

        unit: "s",

        hidden: (props) => !props.idleDemo,

        description:

            "Controls how long the component waits before starting its automatic Cursor Vortex demonstration.",

    },



    allowTouchInteraction: {

        type: ControlType.Boolean,

        title: "Touch Drag",

        defaultValue: false,

        enabledTitle: "On",

        disabledTitle: "Off",

        description:

            "Enables dragging the vortex with a finger. When disabled, vertical page scrolling remains available on mobile.",

    },

    adaptiveQuality: {

        type: ControlType.Boolean,

        title: "Adaptive Quality",

        defaultValue: true,

        enabledTitle: "On",

        disabledTitle: "Off",

        description:

            "Automatically reduces the number of rendered particles on slower devices while preserving the full particle simulation.",

    },

    borderRadius: {

        type: ControlType.Number,

        title: "Radius",

        min: 0,

        max: 200,

        step: 1,

        defaultValue: 0,

        unit: "px",

        description: "Made with 💛 by [@karimsaif](https://x.com/karimsaif0)",

    },

})