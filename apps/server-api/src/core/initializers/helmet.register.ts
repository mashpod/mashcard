import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { fastifyHelmet } from '@fastify/helmet'

export const helmetRegister = async (app: NestFastifyApplication): Promise<void> => {
  await app.register(fastifyHelmet, {
    /**
     * For Apollo landing page:
     * - apollo-server-landing-page.cdn.apollographql.com
     *
     * For Google Font:
     * - fonts.googleapis.com
     * - fonts.gstatic.com
     */
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`, 'fonts.googleapis.com'],
        fontSrc: [`'self'`, 'fonts.gstatic.com'],
        imgSrc: [`'self'`, 'https:', 'data:', 'blob:'],
        mediaSrc: [`'self'`, 'https:', 'data:', 'blob:'],
        scriptSrc: [`'self'`, `'unsafe-inline'`, `apollo-server-landing-page.cdn.apollographql.com`],
        connectSrc: [`'self'`, 'wss:'],
        manifestSrc: [`'self'`, 'apollo-server-landing-page.cdn.apollographql.com']
      }
    },
    crossOriginEmbedderPolicy: false
  })
}
