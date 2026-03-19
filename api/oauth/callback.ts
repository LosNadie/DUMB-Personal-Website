import { createVercelCompleteHandler } from 'netlify-cms-oauth-provider-node'

const completeHandler = createVercelCompleteHandler({}, { useEnv: true })

export default completeHandler
