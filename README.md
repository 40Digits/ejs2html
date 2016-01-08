# ejs2html

A simple CLI for making HTML files from EJS templates.

Install:

```bash
npm i ejs2html -g
```

Usage:

```bash
ejs2html [options] <config> [dest]
```

Options:

```
-h, --help                  output usage information
-V, --version               output the version number
-r, --read <variable_name>  Read contents from stdin, if available, and pipe to a given global variable name in the config.
```

## Config

Everything runs off of the config file. It looks something like this.

```json
{
  "files": [
    {
      "dest": "index.html",
      "template": "layout",
      "locals": {
        "title": "Home",
        "message": "Welcome to my app."
      }
    },
    {
      "dest": "about/index.html",
      "template": "layout.ejs",
      "locals": {
        "title": "About",
        "message": "This is the about page."
      }
    }
  ],
  "globals": {
    "app_name": "My App"
  }
}
```

At the root level of the config should be:

- __files__: An array of objects for each file that you want to create.
- __global__: Variables that are available to _all_ files.

Each file object inside of `files` should include:

- __template__: The EJS template to use to create the file (.ejs extension is optional).
- __locals__: (Optional) Variables that are scoped to this page.
- __dest__: The filepath of the output file.
  - __Note__: This is relative to the `dest` param from the command line.
  - Full path will look like this: `[cli-dest]/[file-dest][.html]`.
  - `.html` extension is optional

## Reading stdin

Using the `-r, --read <var_name>` option allows you to receive piped data and set the data to a global variable that can be used in your templates. Without declaring this option, `ejs2html` will not do anything with the piped data.

So this will set a new global variable called `message` to the contents of `hello.txt`:

```bash
cat hello.txt | ejs2html config.json --read message
```

However, the piped data will be ignored in this example:

```bash
cat hello.txt | ejs2html config.json
```

### Example:

```bash
cat hello.txt | ejs2html config.json --read message
```

__"hello.txt"__

```
Hello world!
```

__"layout.js"__

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title><%= title %></title>
</head>
<body>
  <h1><%= title %></h1>
  <p><%- message %></p>
</body>
</html>
```

__"config.json"__

```json
{
  "files": [
    {
      "dest": "index.html",
      "template": "layout",
    }
  ],
  "globals": {
    "title": "My Site",
    "message": ""
  }
}
```

The result would be:

__"index.html"__
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Site</title>
</head>
<body>
  <h1>My Site</h1>
  <p>Hello world!</p>
</body>
</html>
```

## Examples

### One File

__"_src/ejs/config.json"__

```json
{
  "files": [
    {
      "dest": "index.html",
      "template": "layout",
      "locals": {
        "title": "Home",
        "message": "Welcome to my app."
      }
    }
  ],
  "globals": {
    "app_name": "My App"
  }
}
```

__"_src/ejs/layout.ejs"__

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title><%= app_name %></title>
</head>
<body>
  <h1><%= title %></h1>
  <p><%= message %></p>
</body>
</html>
```

Running...

```bash
ejs2html _src/ejs/config.json
```

Yields...

__"index.html"__
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My App</title>
</head>
<body>
  <h1>Home</h1>
  <p>Welcome to my app.</p>
</body>
</html>
```

===

### Partials

- The paths for the partials should be relative to the file in which they are being included.

__"_src/ejs/partials/header.ejs"__

```html
<h1><%= title %></h1>
```

__"_src/ejs/partials/body.ejs"__

```html
<p><%= message %></p>
```

__"_src/ejs/layout.ejs"__

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title><%= app_name %></title>
</head>
<body>
  <%- include('partials/header') %>
  <%- include('partials/body') %>
</body>
</html>
```

Running the following with same config as above would yield the same result as the previous example...

```bash
ejs2html _src/ejs/config.json
```

===

### Multiple Templates

__"_src/ejs/config.json"__

```json
{
  "files": [
    {
      "dest": "index.html",
      "template": "layout",
      "locals": {
        "title": "Home",
        "message": "Welcome to my app."
      }
    },
    {
      "dest": "about/index.html",
      "template": "layout",
      "locals": {
        "title": "About",
        "message": "This is the about page."
      }
    }
  ],
  "globals": {
    "app_name": "My App"
  }
}
```

__"_src/ejs/layout.ejs"__

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title><%= app_name %></title>
</head>
<body>
  <h1><%= title %></h1>
  <p><%= message %></p>
</body>
</html>
```

Running...

```bash
ejs2html _src/ejs/config.json
```

Yields...

__"index.html"__
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My App</title>
</head>
<body>
  <h1>Home</h1>
  <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eum, excepturi.</p>
</body>
</html>
```

__"about/index.html"__
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My App</title>
</head>
<body>
  <h1>About</h1>
  <p>This is the about page.</p>
</body>
</html>
```

## Scripts

### sample

```bash
npm run sample
```

Runs some example stuff inside of `/example`.