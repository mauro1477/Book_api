const express = require('express')
const bodyParser = require('body-parser')
const { pool } = require('./config')
const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))



const isProduction = process.env.NODE_ENV === 'production'
const origin = {
  origin: isProduction ? 'https://safe-waters-27889.herokuapp.com/' : '*',
}

app.use(express.static(__dirname + '/'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/views/login.html')
		console.log(req.action);
});

app.post('/auth', function(request, response) {
  console.log('/auth');
  const {author, title} = request.body//Make sure these name match to the html page
	// var author_name = request.body.author;
	// var title_name = request.body.title;
	// console.log(author_name);
	// console.log(title_name);
  pool.query('SELECT * FROM books WHERE author ==  $1 AND title == $2', [author, title], (error, results) => {
    if(error){
      throw error
    }
    	response.status(200).json(results.rows)
  })
});

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
