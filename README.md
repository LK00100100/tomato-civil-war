# tomato-civil-war

This is a Phaser 3 project template that uses Rollup for bundling. It supports hot-reloading for quick development workflow, inclues TypeScript support and scripts to generate production-ready builds.

**[This Template is also available as a JavaScript version.](https://github.com/phaserjs/template-rollup)**

## Requirements

[Node.js](https://nodejs.org) is required to install dependencies and run scripts via `npm`.

## Available Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install project dependencies |
| `npm run dev` | Launch a development web server |
| `npm run build` | Create a production build in the `dist` folder |

## Dev notes

Run once. run `npm install` from root.

Then run & watch (rebuild on changes) with `npm start`.

The local development server runs on `http://localhost:8080`

When you issue the `npm run build` command, all static assets are automatically copied to the `dist/assets` folder.

Started from phaser template CLI.

## Template Project Structure

We have provided a default project structure to get you started. This is as follows:

- `index.html` - A basic HTML page to contain the game.
- `src` - Contains the game source code.
- `src/main.ts` - The main entry point. This contains the game configuration and starts the game.
- `src/global.d.ts` - Global TypeScript declarations, provide types information.
- `src/scenes/` - The Phaser Scenes are in this folder.
- `public/style.css` - Some simple CSS rules to help with page layout.
- `public/assets` - Contains the static assets used by the game.

## Deploying to Production

After you run the `npm run build` command, your code will be built into a single bundle and saved to the `dist` folder, along with any other assets your project imported, or stored in the public assets folder.

In order to deploy your game, you will need to upload *all* of the contents of the `dist` folder to a public facing web server.

## Customizing the Template

### Babel

You can write modern ES6+ JavaScript and Babel will transpile it to a version of JavaScript that you want your project to support. The targeted browsers are set in the `.babelrc` file and the default currently targets all browsers with total usage over "0.25%" but excludes IE11 and Opera Mini.

 ```
"browsers": [
  ">0.25%",
  "not ie 11",
  "not op_mini all"
]
 ```

### Rollup

If you want to customize your build, such as adding plugin (i.e. for loading CSS or fonts), you can modify the `rollup/rollup.config.*.mjs` file for cross-project changes, or you can modify and/or create new configuration files and target them in specific npm tasks inside of `package.json`. Please see the [Rollup documentation](https://rollupjs.org/) for more information.
