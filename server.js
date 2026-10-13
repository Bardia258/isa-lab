const http = require('http');
const DateUtils = require('./modules/utils');
const FileManager = require('./modules/fileManager');
const EnglishMessages = require('./lang/en/en');

class Server {
    constructor() {
        this.dateUtils = new DateUtils();
        this.files = new FileManager();
        this.messages = new EnglishMessages();
        this.port = process.env.PORT || 8080;
    }

    start() {
        const server = http.createServer((req, res) => {
            this.handleRequest(req, res);
        });

        server.listen(this.port, '0.0.0.0', () => {
            console.log(`Server running on port ${this.port}`);
        });
    }

    async handleRequest(req, res) {
        const url = new URL(req.url, 'http://localhost');
        const route = url.pathname.replace(/\/$/, '');

        if (req.method !== 'GET') {
            res.writeHead(405);
            res.end('Method Not Allowed');
            return;
        }


        if (route === '/COMP4537/labs/3/getDate') {
            const name = url.searchParams.get('name');

            if (!name || !/^[a-zA-Z ]+$/.test(name)) {
                res.writeHead(400);
                res.end('Please provide a valid name');
                return;
            }

            const greeting = this.messages.getGreeting(name, this.dateUtils.getDate());
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`<p style="color: blue;">${greeting}</p>`);
            return;
        }


        if (route === '/COMP4537/labs/3/writeFile') {
            const text = url.searchParams.get('text');

            if (text === null) {
                res.writeHead(400);
                res.end('Please provide text using ?text=BCIT');
                return;
            }

            try {
                await this.files.write(text);
                res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('Text added to file.txt');
            } catch (error) {
                res.writeHead(500);
                res.end('Could not write file.txt');
            }
            return;
        }


        const readPrefix = '/COMP4537/labs/3/readFile/';
        if (url.pathname.startsWith(readPrefix)) {
            const fileName = url.pathname.slice(readPrefix.length);


            if (fileName !== 'file.txt') {
                res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end(`404 Not Found: ${fileName || 'file name missing'}`);
                return;
            }

            try {
                const content = await this.files.read();
                res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end(content);
            } catch (error) {
                res.writeHead(error.code === 'ENOENT' ? 404 : 500);
                res.end(error.code === 'ENOENT'
                    ? `404 Not Found: ${fileName}`
                    : 'Could not read file.txt');
            }
            return;
        }

        res.writeHead(404);
        res.end('Page not found');
    }
}


const app = new Server();
app.start();
