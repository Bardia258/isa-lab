const fs = require('fs/promises');
const path = require('path');

class FileManager {
    constructor() {
        this.filePath = path.join(process.env.DATA_DIR || path.join(__dirname, '..'), 'file.txt');
    }

    async write(text) {
        await fs.appendFile(this.filePath, `${text}\n`, 'utf8');
    }

    async read() {
        return await fs.readFile(this.filePath, 'utf8');
    }
}

module.exports = FileManager;
