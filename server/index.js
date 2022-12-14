
const express = require("express");
const next = require("next");

const { join } = require('path')
const { parse } = require('url')

const relativePathToEnv = join(__dirname, '../.env');
require('dotenv').config({ path: relativePathToEnv })

const PORT = process.env.PORT || 3000;

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
    const app = express();

    app.set('trust proxy', true)

    // // for images
    // app.use(fileupload({
    //     useTempFiles: true
    // }))

    // for accepting forms
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    // import routes
    const privateRoom = require('./routes/privateRoom');

    // Route middleware
    app.use('/api/room', privateRoom);

    app.get("*", (req, res) => {
        const parsedUrl = parse(req.url, true)
        const { pathname } = parsedUrl

        // handle GET request to /service-worker.js
        if (pathname === '/service-worker.js') {
            // basically finding the service-worker file so going back "../.next" to next folder from Server folder, and then entering the pathname = server worker
            const filePath = join(__dirname, '../.next', pathname);
            res.sendFile(filePath)
        } else {
            handle(req, res, parsedUrl)
        }
    });

    const server = app.listen(PORT, err => {
        if (err) throw err;
        console.log(`> Ready on ${PORT}`);
    });

    require('./socketServer')(server);
})
    .catch(ex => {
        console.error(ex.stack);
        process.exit(1);
    });