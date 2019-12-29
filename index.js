const express = require('express')
const bodyParser = require('body-parser')
const { pool } = require('./config')
const cors = require('cors')
const app = express()
const helmet = require('helmet')
const compression = require('compression')
const rateLimit = require('express-rate-limit')
const { body, check } = require('express-validator')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(compression())
app.use(helmet())

const isProduction = process.env.NODE_ENV === 'production'
const origin = {
  origin: isProduction ? 'https://safe-waters-27889.herokuapp.com/' : '*',
}

app.use(cors(origin))

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5 // 5 requests,
})

app.use(limiter)

const postLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 1
})

app.post('/books', postLimiter, addBook)
app.post(
  '/books',
  [
    check('author')
      .not()
      .isEmpty()
      .isLength({ min: 5, max: 255 })
      .trim(),
    check('title')
      .not()
      .isEmpty()
      .isLength({ min: 5, max: 255 })
      .trim(),
  ],
  postLimiter,
  (request, response) => {
    const errors = validationResult(request)

    if (!errors.isEmpty()) {
      return response.status(422).json({ errors: errors.array() })
    }

    const { author, title } = request.body

    pool.query('INSERT INTO books (author, title) VALUES ($1, $2)', [author, title], error => {
      if (error) {
        throw error
      }
      response.status(201).json({ status: 'success', message: 'Book added.' })
    })
  }
)


const deleteBook = (request, response) => {
  if (!request.header('apiKey') || request.header('apiKey') !== process.env.API_KEY) {
    return response.status(401).json({ status: 'error', message: 'Unauthorized.' })
  }
}

const getBooks = (request, response) => {
  pool.query('SELECT * FROM books', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const addBook = (request, response) => {
  const { author, title } = request.body

  pool.query('INSERT INTO books (author, title) VALUES ($1, $2)', [author, title], error => {
    if (error) {
      throw error
    }
    response.status(201).json({ status: 'success', message: 'Book added.' })
  })
}


// app
//   .route('/books')
//   // GET endpoint
//   .get(getBooks)
//   // POST endpoint
//   .post(addBook)

// Start server
app.listen(process.env.PORT || 3002, () => {
  console.log(`Server listening`)
})
