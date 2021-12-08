const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());


// object to store the urls
const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

//object to store the users information
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};


//function to generate a unique shortURL and unique userID
function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}

//function to check if the email exists in the users database
const findUserByEmail = function(email,users) {
  for (let userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return false;
};


//function to check password
const authenticateUser = function(email,password,users) {
  const user = findUserByEmail(email,users);
  if (user.password === password) {
    return user;
  }
  return false;
};

//sets ejs as a view engine
app.set('view engine','ejs');

//displays hello
app.get('/', (req,res) => {
  res.send("Hello!");
});

//displays url_index page
app.get('/urls',(req,res) => {
  const userId = req.cookies["user_id"];
  const templateVariable = {urls : urlDatabase,user:users[userId]};
  res.render('urls_index',templateVariable);
});

//displays "Hello World"
app.get('/hello',(req,res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

//displays the form to create a new url
app.get('/urls/new',(req,res) => {
  const userId = req.cookies["user_id"];
  const templateVariable = {user:users[userId]};
  res.render('urls_new',templateVariable);
});

//displays the longurl and shorturl and edit form
app.get('/urls/:shortURL', (req,res) => {
  const userId = req.cookies["user_id"];
  const templateVariable = {
    shortURL: req.params.shortURL,
    longURL:urlDatabase[req.params.shortURL] ,
    user:users[userId]
  };
  res.render('urls_show',templateVariable);
});

//redirects to the website on clicking the shotr url
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  // console.log(req.params);
  res.redirect(longURL);
});

//adding a request handler to show the all urls in table format
app.post('/urls', (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
  let tempShortURL = generateRandomString();
  urlDatabase[tempShortURL] = req.body.longURL;
  // console.log(urlDatabase);
  const templateVariable = {shortURL: tempShortURL, longURL:req.body.longURL };
  res.render('urls_show' , templateVariable);
});

// a request handler for deleting a url
app.post('/urls/:shortURL/delete', (req,res) => {
  const toBeDeletedURL = req.params.shortURL;
  delete urlDatabase[toBeDeletedURL];
  res.redirect('/urls');
});

// a request handler for submitting an updated longURL
app.post('/urls/:shortURL', (req,res) => {
  const longURL = req.body.longURL;
  urlDatabase[req.params.shortURL] = longURL;
  // console.log(req.body);
  // console.log(req.body.longURL);
  res.redirect('/urls');
});

//logsin the user, creates cookie and redirects to urls_index
app.post('/login', (req,res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userExists = findUserByEmail(email,users);
  if (!userExists) {
    res.status(403);
    res.send('User cannot be found');
    return;
  }
  const userAuthenticated = authenticateUser(email,password,users);
  if (!userAuthenticated) {
    res.status(403).send('Invalid email/password');
    return;
  }
  res.cookie('user_id', userAuthenticated.id);
  res.redirect('/urls');
});

//clears cookies after logout and redirects to urls_index
app.post('/logout', (req,res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

//displays registration form when requested
app.get('/register',(req,res) => {
  const templateVariable = {user:null};
  res.render('registration_form',templateVariable);
});

//submits and validates registration form and redirects to url_index page
app.post('/register',(req,res) => {
  const userId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  if (email === "" || password === "") {
    res.status(400);
    res.send('Please enter valid email/password');
    return;
  }
  const userExists = findUserByEmail(email,users);
  if (userExists) {
    res.status(400);
    res.send('User already exists');
    return;
  }
  users[userId] = {};
  users[userId].id = userId;
  users[userId].email = email;
  users[userId].password = password;
  res.cookie('user_id',userId);
  console.log(users);
  res.redirect('/urls');
});

//displays the login form when login form is requested
app.get('/login',(req,res) => {
  const templateVariable = {user:null};
  res.render('login_form',templateVariable);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
