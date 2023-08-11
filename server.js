/*********************************************************************************
*  WEB322 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: SHEENA VICKY HATHIWALA, Student ID: 127759215, Date: 24 JULY 2023;
*
*  Cyclic Web App URL: https://rich-ruby-binturong-garb.cyclic.app
* 
*  GitHub Repository URL: https://github.com/Sheena1610/web322-app/tree/master
*
********************************************************************************/ 



const express = require('express');
const app = express();
const path = require('path');
const clientSessions = require('client-sessions');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const storeService = require('./store-service');
const authData = require('./auth-service');
const exphbs = require("express-handlebars");


app.engine(
  "handlebars",
  exphbs.engine({
    defaultLayout: "main",
    partialsDir: path.join(__dirname, "views/partials"),
  })
);
app.set("view engine", "handlebars");

app.use(
  clientSessions({
    cookieName: 'session',
    secret: '6b1a101bbb41009b5afce2a4d58ed2aa7e9ab4dac76cc18fda954e01f7c2d93d6e00179d1c1042bababafe8365a8b1fc76894ef7d80769bf4333638e03450cb6', 
    duration: 24 * 60 * 60 * 1000,
    activeDuration: 30 * 60 * 1000 
  })
)


cloudinary.config({
  cloud_name: 'dvaoumcd3',
  api_key: '992298363638223',
  api_secret: '9MIhZsAipwEI0Mel-TguJcOwzIc',
  secure: true
});

const upload = multer();
const navLinkHelper = {
  navLink: function(url, options) {
    return (
      '<li class="nav-item"><a ' +
      (url == this.activeRoute ? 'class="nav-link active"' : 'class="nav-link"') +
      ' href="' +
      url +
      '">' +
      options.fn(this) +
      '</a></li>'
    );
  }
};

const equalHelper = {
  equal: function(lvalue, rvalue, options) {
    if (arguments.length < 3)
      throw new Error('Handlebars Helper equal needs 2 parameters');
    if (lvalue != rvalue) {
      return options.inverse(this);
    } else {
      return options.fn(this);
    }
  }
};

const formatDateHelper = {
  formatDate: function(dateObj) {
    let year = dateObj.getFullYear();
    let month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    let day = dateObj.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
};

const hbs = exphbs.create({
  extname: '.hbs',
  helpers: {
    ...navLinkHelper,
    ...equalHelper,
    ...formatDateHelper
  },
  defaultLayout: 'main', // Your main layout template
  partialsDir: path.join(__dirname, 'views/partials') 
});

app.engine('.hbs', exphbs.engine);
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));


app.get('/', (req, res) => {
  res.redirect('/shop');
});





app.use(function(req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.redirect('/about');
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/shop', async (req, res) => {
 
  let viewData = {};

  try {
    
    let items = [];


    if (req.query.category) {
     
      items = await itemData.getPublishedItemsByCategory(req.query.category);
    } else {
   
      items = await itemData.getPublishedItems();
    }

    items.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    viewData.items = items;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    
    viewData.item = await itemData.getItemById(req.params.id);
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    
    let categories = await itemData.getCategories();

   
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }



  res.render("shop", { data: viewData });
});

app.get('/items', (req, res) => {
  storeService.getAllItems()
    .then((items) => {
      if (items.length > 0) {
        res.render('items', { Items: items });
      } else {
        res.render('items', { message: 'No results' });
      }
    })
    .catch((err) => {
      res.render('items', { message: 'Error retrieving items' });
    });
});

app.get('/categories', (req, res) => {
  storeService.getCategories()
    .then((categories) => {
      if (categories.length > 0) {
        res.render('categories', { Categories: categories });
      } else {
        res.render('categories', { message: 'No results' });
      }
    })
    .catch((err) => {
      res.render('categories', { message: 'Error retrieving categories' });
    });
});

app.get('/items/add', (req, res) => {
  storeService.getCategories()
    .then((categories) => {
      res.render('addItem', { categories: categories });
    })
    .catch((err) => {
      res.render('addItem', { categories: [] });
    });
});


app.get('/item/:id', (req, res) => {
  const itemId = req.params.id;
  storeService
    .getItemById(itemId)
    .then(item => {
      res.json(item);
    })
    .catch(error => {
      res.status(404).json({ message: error });
    });
});

app.get('/categories/add', (req, res) => {
  res.render('addCategories', { title: 'Add Category' });
});

app.post('/categories/add', (req, res) => {
  const categoryData = req.body;
  store.addCategory(categoryData)
    .then(() => {
      res.redirect('/categories');
    })
    .catch(err => {
      res.render('addCategories', { title: 'Add Category', message: 'Unable to add category', category: categoryData });
    });
});

app.get('/categories/delete/:id', (req, res) => {
  const categoryId = req.params.id;
  storeService
    .deleteCategoryById(categoryId)
    .then(() => {
      res.redirect('/categories');
    })
    .catch(err => {
      res.status(500).send('Unable to Remove Category / Category not found');
    });
});

app.get('/Items/delete/:id', (req, res) => {
  const itemId = req.params.id;
  storeService
    .deletePostById(itemId)
    .then(() => {
      res.redirect('/Items');
    })
    .catch((error) => {
      res.status(500).send('Unable to Remove Post / Post not found');
    });
});

app.post('/items/add', upload.single('featureImage'), (req, res) => {
  if (req.file) {
    let streamUpload = req => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    async function upload(req) {
      try {
        let result = await streamUpload(req);
        console.log(result);
        return result;
      } catch (error) {
        throw new Error('Image upload failed');
      }
    }

    upload(req)
      .then(uploaded => {
        processItem(req, res, uploaded.url);
      })
      .catch(error => {
        res.status(500).json({ message: error.message });
      });
  } else {
    processItem(req, res, "");
  }
});

function processItem(req, res, imageUrl) {
  const newItem = {
    title: req.body.title,
    description: req.body.description,
    featureImage: imageUrl
  };

  storeService
    .addItem(newItem)
    .then(() => {
      res.redirect('/items');
    })
    .catch(error => {
      res.status(500).json({ message: error });
    });
}

app.get('*', (req, res) => {
  res.status(404).render('404');
});



function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect('/login');
  } else {
    next();
  }
}

// GET route for rendering the login view
app.get('/login', (req, res) => {
  res.render('login');
});

// GET route for rendering the register view
app.get('/register', (req, res) => {
  res.render('register');
});

// POST route for user registration
app.post('/register', (req, res) => {
  const userData = req.body;
  authData.registerUser(userData)
    .then(() => {
      res.render('register', { successMessage: 'User created' });
    })
    .catch(err => {
      res.render('register', { errorMessage: err, userName: req.body.userName });
    });
});

// POST route for user login
app.post('/login', (req, res) => {
  req.body.userAgent = req.get('User-Agent');
  authData.checkUser(req.body)
    .then(user => {
      req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory
      };
      res.redirect('/items');
    })
    .catch(err => {
      res.render('login', { errorMessage: err, userName: req.body.userName });
    });
});

// GET route for user logout
app.get('/logout', (req, res) => {
  req.session.reset();
  res.redirect('/');
});

// GET route for rendering the userHistory view
app.get('/userHistory', ensureLogin, (req, res) => {
  res.render('userHistory');
});

// ...

// 404 middleware
app.get('*', (req, res) => {
  res.status(404).render('404');
});

// Initialize and start the server
const port = process.env.PORT || 8080;

storeService.initialize()
  .then(authData.initialize)
  .then(() => {
    app.listen(port, () => {
      console.log(`Express http server listening on port ${port}`);
    });
  })
  .catch(error => {
    console.error('Initialization failed:', error);
  });
