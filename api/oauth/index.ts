import { createVercelBeginHandler } from 'netlify-cms-oauth-provider-node'

const beginHandler = createVercelBeginHandler({}, { useEnv: true })

export default beginHandler
