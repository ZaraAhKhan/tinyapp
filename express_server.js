const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());


//function to generate a unique shortURL
function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}

//set ejs as a view engine
app.set('view engine','ejs');


const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

app.get('/', (req,res) => {
  res.send("Hello!");
});

app.get('/urls',(req,res) => {
  const templateVariable = {urls : urlDatabase,username: req.cookies["username"] };
  res.render('urls_index',templateVariable);
});

app.get('/hello',(req,res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

//adding a GET route to display the form
app.get('/urls/new',(req,res) => {
  const templateVariable = {username: req.cookies["username"]};
  res.render('urls_new',templateVariable);
});

//adding a second route using route parameter
app.get('/urls/:shortURL', (req,res) => {
  const templateVariable = {
    shortURL: req.params.shortURL,
    longURL:urlDatabase[req.params.shortURL] ,
    username: req.cookies["username"]
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
  const usernameCookie = {
    username: req.cookies["username"]
  };
  res.render('urls_show' , templateVariable,usernameCookie);
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





app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
