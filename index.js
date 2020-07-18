const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cookieSession = require('cookie-session');
//app.use basically runs the middleware functions througout the application
const authRouter = require('./routes/admin/auth');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    cookieSession({
        keys: ['sdfaeqrwsdfdfsfqwerds']
    })
);

app.use(express.static('public'));
app.use(authRouter);

app.listen(4000, () => {
    console.log('listening');
});