require('dotenv').config({ path: '.env' });
const config = require('./config');

const express = require('express');
const app = express();
const fs = require('fs');
const mongoose = require('mongoose');
const cors = require('cors');

app.use(express.json());
app.use(express.static('public'));
app.use(express.static('views'));
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));
app.use(express.raw({ type: '*/*', limit: '900mb' }));
app.use(cors());

app.get('/', (req, res, next) => {
    res.sendFile(__dirname + '/views/index.html');
});

app.use('/api', require('./routes/api'));

app.use('**', (req, res) => {
    // res.sendFile(__dirname + '/view/index.html');
    res.sendStatus(404);
});

app.use((err, req, res, next) => {
    if (!config.production) {
        console.error(err);
        return res.status(500).send(err.stack);
    }

    res.status(500).send('Server error');
});

try {
    if (!process.env.SSL_privkey || !process.env.SSL_fullchain) throw Error('NOT FOUND KEYS\n');

    const options = {
        key: fs.readFileSync(process.env.SSL_privkey),
        cert: fs.readFileSync(process.env.SSL_fullchain)
    };

    const httpsServer = require('https').createServer(options, app);
    createServer(httpsServer);

    const httpServer = express();
    httpServer.get('*', function (req, res) {
        res.redirect('https://' + req.headers.host + req.url);
    })

    httpServer.listen(80);
} catch (err) {
    const httpServer = require('http').createServer(app);
    createServer(httpServer);
}

async function createServer(server) {
    try {
        await mongoose.connect(process.env.MONGOOSE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        });

        console.log('Database connected.');
    } catch(err) {}

    require('./src/io')(server);
    server.listen(config.port, () => console.log(config.domain));
}
