const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1','key2']
}));



// object to store the urls
const urlDatabase = {
  b2xVn2: {
    longURL:'http://www.lighthouselabs.ca',
    userID: 'aJ48lW'
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
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
  const result = bcrypt.compareSync(password,user.password);
  console.log(user.password);
  console.log(password);
  console.log(result);
  if (result === true) {
    return user;
  }
  return false;
};

//function to loop through the database to match userID to user
const urlsForUser = function(id) {
  let urlObject = {};
  for (let url in urlDatabase) {
    let urlInDb = urlDatabase[url];
    if (urlInDb['userID'] === id) {
      urlObject[url] = urlDatabase[url].longURL;
    }
  }
  return urlObject;
};

//sets ejs as a view engine
app.set('view engine','ejs');

//displays hello
app.get('/', (req,res) => {
  res.send("Hello!");
});

//displays url_index page
app.get('/urls',(req,res) => {
  const userId = req.session.user_id;
  const urlObject = urlsForUser(userId);
  const templateVariable = {urls : urlObject,user:users[userId]};
  res.render('urls_index',templateVariable);
});

//displays "Hello World"
app.get('/hello',(req,res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

//displays the form to create a new url
app.get('/urls/new',(req,res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.status(403).redirect('/login');
  }
  const templateVariable = {user:users[userId]};
  res.render('urls_new',templateVariable);
});

//displays the longurl and shorturl and edit form
app.get('/urls/:shortURL', (req,res) => {
  const userId = req.session.user_id;
  let templateVariable = {};
  let usersUrls = urlsForUser(userId);
  let arrayOfURL = Object.keys(usersUrls);
  let arrayOfDbURLS = Object.keys(urlDatabase);
  if (arrayOfURL.includes(req.params.shortURL)) {
    templateVariable = {
      shortURL: req.params.shortURL,
      longURL:urlDatabase[req.params.shortURL].longURL,
      user:users[userId]
    };
  } else {
    templateVariable = {
      shortURL: undefined,
      longURL:undefined,
      user:users[userId]
    };

  }
  if (!arrayOfDbURLS.includes(req.params.shortURL)) {
    templateVariable = {
      shortURL:req.params.shortURL,
      longURL:undefined,
      user:users[userId]
    };
  }
  console.log(templateVariable);
  res.render('urls_show',templateVariable);
  
});

//redirects to the website on clicking the short url
app.get('/u/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL] === undefined) {
    const userId = req.session.user_id;
    const longURL = undefined;
    const templateVariable = {longURL:longURL ,user:users[userId]};
    return res.status(400).render('urls_show',templateVariable);
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//adding a request handler to show the all urls in table format
app.post('/urls', (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
  let userId = req.session.user_id;
  if (!userId) {
    return res.status(400).send('Please register or login');
  }
  let tempShortURL = generateRandomString();
  urlDatabase[tempShortURL] = {};
  urlDatabase[tempShortURL].longURL = req.body.longURL;
  urlDatabase[tempShortURL].userID = userId;
  // console.log(urlDatabase);
  const templateVariable = {shortURL: tempShortURL, longURL:req.body.longURL,user:users[userId]};
  res.render('urls_show' , templateVariable);
});

// a request handler for deleting a url
app.post('/urls/:shortURL/delete', (req,res) => {
  let userId = req.session.user_id;
  let usersURLObj = urlsForUser(userId);
  const toBeDeletedURL = req.params.shortURL;
  let arrayOfURLS = Object.keys(usersURLObj);
  if (arrayOfURLS.includes(toBeDeletedURL)) {
    delete urlDatabase[toBeDeletedURL];
  } else {
    return res.status(403).send('You don\'t have the authorization!');
  }
  res.redirect('/urls');
});

// a request handler for submitting an updated longURL
app.post('/urls/:shortURL', (req,res) => {
  let userId = req.session.user_id;
  let usersURLObj = urlsForUser(userId);
  const toBeEditedURL = req.params.shortURL;
  let arrayOfURLS = Object.keys(usersURLObj);
  if (arrayOfURLS.includes(toBeEditedURL)) {
    const longURL = req.body.longURL;
    urlDatabase[req.params.shortURL].longURL = longURL;
  } else {
    return res.status(403).send(`You do not have authorization!`);
  }
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
    return res.status(403).send('User cannot be found');
  }
  const userAuthenticated = authenticateUser(email,password,users);
  if (!userAuthenticated) {
    return res.status(403).send('Invalid email/password');
  }
  req.session.user_id = userAuthenticated.id;
  res.redirect('/urls');
});

//clears cookies after logout and redirects to urls_index
app.post('/logout', (req,res) => {
  req.session = null;
  res.redirect('/urls');
});

//displays registration form when requested
app.get('/register',(req,res) => {
  if (req.session.user_id) {
    return res.status(307).redirect('/urls');
  }
  const templateVariable = {user:null};
  res.render('registration_form',templateVariable);
});

//submits and validates registration form and redirects to url_index page
app.post('/register',(req,res) => {
  const userId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  if (email === "" || password === "") {
    return res.status(400).send('Please enter valid email/password');
  }
  const userExists = findUserByEmail(email,users);
  if (userExists) {
    return res.status(400).send('User already exists');
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[userId] = {};
  users[userId].id = userId;
  users[userId].email = email;
  users[userId].password = hashedPassword;
  req.session.user_id = userId;
  console.log(users);
  res.redirect('/urls');
});

//displays the login form when login form is requested
app.get('/login',(req,res) => {
  if (req.session.user_id) {
    return res.status(307).redirect('/urls');
  }
  const templateVariable = {user:null};
  res.render('login_form',templateVariable);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
