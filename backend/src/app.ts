import { createApp } from './createApp'

const port = Number(process.env.PORT || 4000)

const app = createApp()

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`)
})
