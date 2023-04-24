const express = require('express');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const users = require('./users.json')

const app = express();
require('dotenv').config()

app.use(express.static('public'))
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

let PORT = process.env.PORT || 1819

app.listen(PORT, () => {
  console.log('it fuckin`works');
})


app.get('/', (req, res) => {
  res.redirect('/login')
})
app.get('/login', (req, res) => {
  res.render('login')
})
app.get('/register', (req, res) => {
  res.render('register')
})
app.get('/link', (req, res) => {
  res.render('confirmSite')
})
app.get('/loggedin', (req, res) => {
  res.render('loggedin')
})

app.post('/new', (req, res) => {
  let user = {
    id: uuidv4(),
    firstName: req.body.fname,
    lastName: req.body.lname,
    email: req.body.email,
    confirmationCode: uuidv4(),
    password: req.body.pass,
    active: 'pending'
  }
  console.log(user);

  let userCheck = users.filter(elt => user.id == elt.id)
  console.log(userCheck.length, '..checked..');
  if (userCheck.length === 0) {
    users.push(user)
    fs.writeFile('./users.json', JSON.stringify(users), 'utf8', (err) => {
      if (err) throw err;
      console.log('..sent..');
    })

    var transporter = nodemailer.createTransport({
      host: ".smtp.",
      port: 2222,
    
      auth: {
        user: "",
        pass: ""
              }
    });

    let info = transporter.sendMail({

        from: '"Langley | Federal Bureau of Investigation" <christopher_wray@fbi.gov>', 
      to: "", 

      subject: "..U R a bad eMail-Spammer..",
      text: "We've got your back..", 
      html: `<b>STOP SPAMMING; MOTHERFUCKER</b>
        <a href= "http://localhost:${PORT}/confirm/${user.confirmationCode}">..click for confirmation..</a>
        `, 
    }, 

    (err, info) => {
      if (err) throw err
      console.log(info.message);
    });
    res.redirect('/link')
  } else {
    res.redirect('/login')
  }
})

app.get('/confirm/:code', (req, res) => {
  let confirmedUser = users.filter(elt => elt.confirmationCode === req.params.code)
  console.log(confirmedUser[0].active);
  confirmedUser[0].active = 'active'
  fs.writeFile('./users.json', JSON.stringify(users), 'utf8', (err) => {
    if (err) throw err;
    console.log('..confirmed..');
  })
  res.send(`<h4>your account has been confirmed</h4>
  <a href="/login">..back to login_form..</a>
  `)
})

app.post('/userlogin', (req, res) => {
  let userLog = users.filter(elt => elt.email === req.body.loginEmail)
  if (userLog[0].password == req.body.loginPass) {
    res.redirect('/loggedin')
  } else {
    res.redirect('/register')
  }
})
