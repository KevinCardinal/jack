const fs = require('fs');

function isValidUrl(string) {
  try {
    new URL(string);
  } catch (_) {
    return false;
  }
  return true;
}

function createIndexes(root, directories, url, _path = '') {
  for (let key of Object.keys(directories)) {
    const path = _path + '/' + key;
    const directory = root + path;
    const redirection = url + '/' + path;
    const content = '<!DOCTYPE HTML>\n'
      + '<html>\n'
      + '    <head>\n'
      + '        <meta charset="UTF-8">\n'
      + '        <meta http-equiv="refresh" content="0; url\'' + redirection + '\'">\n'
      + '        <script type="text/javascript">\n'
      + '            window.location.href = "' + redirection + '"\n'
      + '        </script>\n'
      + '        <title>Page Redirection</title>\n'
      + '    </head>\n'
      + '    <body>\n'
      + '        If you are not redirected automatically, follow this <a href="' + redirection + '">link to example</a>.\n'
      + '    </body>\n'
      + '</html>\n';
    fs.mkdirSync(directory);
    fs.writeFileSync(directory + '/index.html', content);
    createIndexes(root, directories[key], url, path);
  }
}

const args = process.argv.slice(2);

if (args.length !== 1 || !isValidUrl(args[0])) {
  console.log('Need only root URL as parameter !');
} else {
  let url = args[0];
  if (url.charAt(url.length - 1) === '/') {
    url = url.slice(0, -1);
  }
  console.log('Root URL : ' + url);
  const directories = {};
  const constants = fs.readFileSync('src/app/app-routing.constants.ts').toString().split("\n");
  for (let constant of constants) {
    const match = constant.trim().match(/^export\s*const\s*[A-Za-z0-9_]*\s*=\s*'\/?(.*)'\s*;$/);
    if (match && match[1]) {
      let path = match[1];
      let current = directories;
      for (let part of path.split('/')) {
        if (current[part] == null) {
          current[part] = {};
        }
        current = current[part];
      }
    }
  }
  createIndexes('dist/jack', directories, url);
  console.log('Redirections created.');
}
