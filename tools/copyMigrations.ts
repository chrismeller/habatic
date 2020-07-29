import * as fs from 'fs';
import * as path from 'path';

if (fs.existsSync('./dist/src/migrations') === false) {
  fs.mkdirSync('./dist/src/migrations');
}

for (const migration of fs.readdirSync('./src/migrations')) {
  fs.copyFileSync(path.join('./src/migrations', migration), path.join('./dist/src/migrations/', path.basename(migration)));
}
