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
app.post('/request_book_node', function(request, response) {
  console.log('/request_book_node');
	var id_node = request.body.id;
  const id_node_INT = parseInt(id_node);
  pool.query('SELECT * FROM books WHERE id = $1',[id_node_INT], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
});
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/views/login.html')
		console.log(req.action);
});


app.post('/auth', function(request, response) {
  console.log('/auth');
	var user_name_node = request.body.user_name_html;
  var user_password_node = request.body.user_password_html;
  pool.query('SELECT * FROM users WHERE user_name = $1 AND user_password = $2',[user_name_node, user_password_node], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
});

app.post('/register', function(req, res) {
  console.log('/register');
  res.sendFile(__dirname + '/views/register.html')
  console.log(req.action);
});

app.post('/create_user', function(req, res) {
  console.log('/create_user');
  var user_name_node = req.body.user_name_html;
  var phone_node = req.body.phone_html;
  var Address_line_1_node = req.body.Address_line_1;
  var Address_line_2_node = req.body.Address_line_2_html;
  var user_password_node = req.body.user_password_html;
  pool.query('INSERT INTO users (user_name, phone, address_line_1, address_line_2, user_password) VALUES ($1, $2, $3, $4, $5)',[user_name_node, phone_node, Address_line_1_node, Address_line_2_node, user_password_node], (error, results) => {
    if (error) {
      throw error
    }
    console.log("user was created");
    res.redirect('/views/home.html');
  })
});


// Start server
app.listen(process.env.PORT || 3002, () => {
  console.log(`Server listening`)
})
