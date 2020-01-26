const express = require('express');
const { body, validationResult } = require("express-validator")
const app = express();
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

// connect to mongo db with all this strange options
// so you do not get all these annyoing warnings on connecting
mongoose.connect('mongodb://localhost/users_db', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}, (err) => {
    if (!err) {
        console.log('MongoDB Connection succeeded')
    } else {
        console.log('Error on DB connection: ' + err)
    }
});

// Definde User Schema
var userSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
});

// hide password and version field
userSchema.set("toJSON", {
    transform: (doc, { password, __v, ...publicFields }, options) => publicFields
})

// Create User Model
const User = mongoose.model('User', userSchema);


// parse incoming form data
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Hello World!');
});

// LOGIN FORM
app.get('/login', (req, res) => {
    const strForm = `
    <style>label {display: block; }</style>
    <h1>Login to pizza page</h1>
    <form action="/login" method="POST">
        <label for="title">Email</label>
        <input type="text" name="email" id="email" />
        <br />
        <label for="email">Password</label>
        <input type="password" name="password" id="password" />
        <br />
        <button type="submit">Login</button>
    </form>
    `
    res.send(strForm)
});

// LOGIN MIDDLEWARE FOR VALIDATING INPUTS
app.post('/login',

    body('email').notEmpty().withMessage("Email not present").normalizeEmail(),
    body('password').notEmpty().withMessage("Password not present"),

    (req, res, next) => {

        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            // send the errors as array (and not as object) 
            return res.status(400).send(errors.array())
        }
        next()
    })

// handle incoming LOGIN requests here....
app.post('/login', (req, res, next) => {

    // find user
    User.findOne({ email: req.body.email }).then(user => {
        // user with this email not found? => error
        if (!user) {
            return next(`Authentication failed`)
        }

        // compare passwords using bcrypt.compare() function
        bcrypt.compare(req.body.password, user.password)
            .then(success => {
                // user password does not match password from login form? => error
                if (!success) {
                    return next(`Authentication failed`)
                }
                // create JWT token by signing
                let secret = "jwt-master-secret"
                let token = jwt.sign(
                    { id: user.id, email: user.email }, // WHAT data to sign
                    secret, // signing key
                    { expiresIn: "1h" } // expiry time
                )

                // return token
                res.send({ token }) // => same as: { "token": token }
            })
    })
        .catch(err => next(err))
})


/**
 * Provide a signup form
 */
app.get('/signup', (req, res) => {
    const strForm = `
    <style>label {display: block; }</style>
    <h1>Signup for our pizza store</h1>
    <form action="/signup" method="POST">
        <label for="title">Email</label>
        <input type="text" name="email" id="email" />
        <br />
        <label for="email">Password</label>
        <input type="password" name="password" id="password" />
        <br />
        <label for="email">Password Confirm</label>
        <input type="password" name="password_confirmation" id="password_confirmation" />
        <br />
        <button type="submit">Signup</button>
    </form>
    <p>
        Your incredible signup benefits:<ul>
        <li>Place pizza orders quickly without typing your address</li>
        <li>See all your previous pizza orders to feel gratitude for your healthy diet</li>
        </ul>
    </p>
    `
    res.send(strForm)
})

// SIGNUP MIDDLEWARE FOR VALIDATING INPUTS
app.post('/signup',
    body('email')
        .notEmpty().withMessage("Email not present")
        .bail() // "bail" prevents that further validations are done if the previous failed already
        .isEmail().withMessage("Email has not a valid format")
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage("Password not present")
        .bail()
        .isLength({ min: 4 }).withMessage("Password must have min 4 characters"),
    (req, res, next) => {

        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            // send the errors as array (and not as object) 
            return res.status(400).send(errors.array())
        }
        next()
    })

/**
 * Get incoming user signups: email & password
 * Hash the PW & create a user in the DB
 * Bonus: validate password fields to be equal
 */
app.post('/signup', (req, res) => {
    console.log("POST signup route called")

    let body = req.body

    User.findOne({ email: req.body.email }).then(user => {
        if (!user) {
            User.create({
                email: body.email,
                password: bcrypt.hashSync(body.password, 10)
            })
                .then(userNew => {
                    return res.send(userNew)
                })
        }
    })
        .catch(err => next(err))
});

let port = 3000
app.listen(port, () => {
    console.log(`Server listening on port ${port}!`);
});