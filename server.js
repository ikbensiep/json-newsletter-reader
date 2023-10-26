import express from 'express';
import path from 'path';
import {fileURLToPath} from 'url';
import livereload from 'livereload';
import connectLivereload from 'connect-livereload';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, 'public'));

console.log('file name 👉️', __filename)
console.log('directory-name 👉️', __dirname);

const app = express();

app.use(express.static(path.join(__dirname, 'public/')));


console.info("WATCHING: ", path.join(__dirname, 'public/'))

app.use( (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.use( (req, res) => {
  res.status(404);
  res.send('<h1>Error 404: not found</h1>');
})

// open livereload high port and start to watch public directory for changes
app.use(connectLivereload());

// ping browser on Express boot, once browser has reconnected and handshaken
liveReloadServer.server.once("connection", () => {
  console.log('livereload plz')
  setTimeout(() => {
    console.log('reload')
    liveReloadServer.refresh("/");
  }, 100);
});



app.listen(3000, () => {
  console.log('listening on port 3000')
})