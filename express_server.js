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
const authenticateUser = function(email,users) {
  for (let userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return true;
    }
  }
  return false;
};

//set ejs as a view engine
app.set('view engine','ejs');

app.get('/', (req,res) => {
  res.send("Hello!");
});

app.get('/urls',(req,res) => {
  const userId = req.cookies["user_id"];
  const templateVariable = {urls : urlDatabase,user:users[userId]};
  res.render('urls_index',templateVariable);
});

app.get('/hello',(req,res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

//adding a GET route to display the form to enter a new url
app.get('/urls/new',(req,res) => {
  const userId = req.cookies["user_id"];
  const templateVariable = {user:users[userId]};
  res.render('urls_new',templateVariable);
});

//adding a second route using route parameter
app.get('/urls/:shortURL', (req,res) => {
  const userId = req.cookies["user_id"];
  const templateVariable = {
    shortURL: req.params.shortURL,
    longURL:urlDatabase[req.params.shortURL] ,
    user:users[userId]
  };
  res.render('urls_show' , templateVariable);
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  // console.log(req.params);
  res.redirect(longURL);
});

//adding a request handler to show the newly created shortURL
app.post('/urls', (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
  let tempShortURL = generateRandomString();
  urlDatabase[tempShortURL] = req.body.longURL;
  // console.log(urlDatabase);
  const templateVariable = {shortURL: tempShortURL, longURL:req.body.longURL };
  res.render('urls_show' , templateVariable);
});

// a request handler for deleting a resource
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

//a request handler for login
app.post('/login', (req,res) => {
  let username = req.body.username;
  res.cookie('username', username);
  res.redirect('/urls');
});

//a request handler for logout
app.post('/logout', (req,res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

//a request handler to go to the registration form
app.get('/register',(req,res) => {
  const templateVariable = {user:null};
  res.render('registration_form',templateVariable);
});

//a request handler to submit the registration form
app.post('/register',(req,res) => {
  const userId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  if (email === "" || password === "") {
    res.status(400);
    res.send('Please enter valid email/password');
    return;
  }
  const userAuthenticated = authenticateUser(email,users);
  if (userAuthenticated) {
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





app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
