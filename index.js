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


// app
//   .route('/books')
//   // GET endpoint
//   .get(getBooks)
//   // POST endpoint
//   .post(addBook)

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/views/login.html')
		console.log(req.action);
});

app.post('/auth', function(request, response) {
  console.log('/auth');

	var id_node = request.body.id;
	console.log(id_node);
  pool.query('SELECT * FROM books WHERE id == $0',[id_node], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
});

// app.get('/inventory', function(req,res) {
//   var query = "select * from inventory where ingredient_quantity > 10;";
//   var query1 = "select * from inventory where ingredient_quantity <= 10";
//   db.task('get-everything', task => {
//     return task.batch([
//       task.any(query),
//       task.any(query1)
//     ]);
//   })
//   .then(data => {
//     res.render('inventory.pug', {
//       my_title: "Inventory Page",
//       inventory_item_Full: data[0],
//       inventory_item_AlmostEmpty: data[1]
//
//     })
//   })
//   .catch(error => {
//     console.log("error");
//     res.render('inventory.pug', {
//       my_title: "Inventory Page",
//       inventory_item_Full: "",
//       inventory_item_AlmostEmpty: ""
//     })
//   })
// });

// Start server
app.listen(process.env.PORT || 3002, () => {
  console.log(`Server listening`)
})
