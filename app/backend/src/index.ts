import express from 'express'
const app = express()

// TODO: Use env variable
const PORT = 3000

// TODO: Remove test endpoint
app.get('/hello', (req, res) => {
  res.status(200).json({
    message: 'Hello World!',
    to: req.ip
  })
})

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
})
