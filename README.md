# QuickJots

QuickJots is a web-app to jot down and auto-save any quick notes in your browser, using Markdown or plain-text. No registration is needed, and there is a dark mode available!

Both plain-text and markdown notes are supported (with the help of [Showdown](https://github.com/showdownjs/showdown)).

This repository contains all the source code for the web-app at [quickjots.app](https://quickjots.app).

QuickJots is currently hosted using [Netlify](http://netlify.com), so there is also a `netlify.toml` file in the root to configure Netlify.

## Getting Started

If you want to contribute to QuickJots, or host it yourself, you'll need to fork this repo through GitHub, followed by:

QuickJots uses [Webpack](https://webpack.js.org/) bundles the source code in this repo together into a static site. It uses a Service Worker to provide offline support.

The main Javascript code is in [`./src/js`](./src/js) -- the files all use the base `window.quickjots` object and add any needed functions and variables to this.

1. `git clone git@github.com:[username]/quickjots.git`
2. Ensure you have [Node.JS](https://nodejs.org/en/) installed (to bundle the files with Webpack)
3. Run `yarn install` in the root repo directory to install the dependencies
4. Run `yarn start` to run the webpack dev server on your local port `8080` whilst modifying the code. It will auto-reload on any change
5. Run `yarn build` to run webpack in production mode to generate files in `dist/`. These files contain the static site, for you to host yourself if you want

Note you might want to disable the Service Worker in dev-mode if you are testing many changes locally, otherwise you'll see old code working instead of your new code! There's also a 'update on reload' option in Chrome Dev Tools for Service Workers if you don't want to disable it for dev-mode.

## Contributing

Any contributions like bug reports, feature requests or pull requests are welcome!

There is an ESLint config in [`.eslintrc.json`](./.eslintrc.json), but in short the main code-style is:

- use 2-space indentation
- use spaces for indentation
- use semicolons at the end of statements
- use arrow functions where possible
