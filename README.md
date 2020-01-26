# Authentication - Exercise #2 - User login & JWT Token

In this exercise we now want to provide a possibily for our signed up users to login.

They get another form where they provide their email and password and get a so called JWT token back. 

We can think of this token as kind of an identity card to prove to quickly prove that you are you, without having to fill out any login forms again.

This token will be used on every subsequent request to our backend to prove our identity. Then the backend can allow us access to resources only a logged in user is allowed to see, e.g. our individual banking statement.


## Provide a User login

* Setup a login form
    * Create a GET route /login
    * Provide a login form on that route
        * Copy the code from your GET /signup route and adapt it

* Create a POST route /login
    * Validate that user and password are present
    * Query the database to find a user with the given email
    * If the user was found
        * Create its password hash by the password sent over the form
        * Use bcrypt.compare() function for that
    * If the user was NOT found
        * return an error response that authentication failed as JSON
        using the next() function
    * Test your login in the browser


* Install library for handling JWT tokens: `npm i jsonwebtoken`

* On succesful login (=user with this email & password was found)
    * Create a JWT token
        * Use jwt.sign and pass an object with the users id and email 
        * Give the token an expiry time (=lifetime) of 1 hours ("1h")
    * Send the token back to the client

* Test your login in the browser
    * Test if your receive the token string after submitting your form
    * Also test that you get an error if you specify wrong credentials


### Bonus Task - Add password confirm field

* Add another password field with name "password_confirmation" to your form
    * => The user will need to enter the same password twice to assure he has typed it correctly
* Add a custom validator to check if the received password field is equal to the password_confirmation field
    * [Tutorial](https://express-validator.github.io/docs/custom-validators-sanitizers.html)
        * => see second example "password confirmation"


### Bonus Task - Add password strength check with regex

* The password should contain at least one letter and a number and must have minimum 4 characters 
    * The order should not matter, either numbers first or letters
    * Use regex lookahead patterns (?=...)
    * Still don't know lookahead patterns?
        * [Lookahead Tutorial](https://www.rexegg.com/regex-lookarounds.html)
        * [Strong passwords in JS](https://www.thepolyglotdeveloper.com/2015/05/use-regex-to-test-password-strength-in-javascript/)
    * Test out the regex on regexr.com first before you use the regex in code to make your testing easier
