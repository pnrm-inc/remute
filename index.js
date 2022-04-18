const { renderToStaticMarkup } = require('react-dom/server');
const { Helmet } = require('react-helmet');
const pretty = require('pretty');
const path = require('path');
const fs = require('fs');
const decache = require('decache');

// require('@babel/register')({
//   presets: [
//     "@babel/preset-env",
//     "@babel/preset-react",
//   ],
//   extensions: ['.jsx'],
//   cache: false
// });

require('ts-node').register({
  compilerOptions: {
    jsx: 'react'
  }
});
require('tsconfig-paths/register');

/*
 * JSX をtemplate文字列に変形する
 */
function renderInLayout(element) {
  const staticMarkup = renderToStaticMarkup(element);
  const helmet = Helmet.renderStatic();
  const ReHelmetAttr = / data-react-helmet="true"/g;

  return `<!doctype html>
    <html ${ helmet.htmlAttributes.toString() }>
      <head>
        ${ helmet.base.toString().replace(ReHelmetAttr, '') }
        ${ helmet.meta.toString().replace(ReHelmetAttr, '') }
        ${ helmet.title.toString().replace(ReHelmetAttr, '') }
        ${ helmet.link.toString().replace(ReHelmetAttr, '') }
        ${ helmet.script.toString().replace(ReHelmetAttr, '') }
        ${ helmet.style.toString().replace(ReHelmetAttr, '') }
        ${ helmet.noscript.toString().replace(ReHelmetAttr, '') }
      </head>
      <body ${helmet.bodyAttributes.toString()}>
        ${staticMarkup}
      </body>
    </html>
  `;
}

exports.renderFile = function ({ filePath, cwd, outputDir }) {
  const module = path.resolve(cwd, filePath);

  decache(module);

  const page = require(module);
  const output = pretty(renderInLayout(page.default()), {
    ocd: true
  });
  const outputPath = path.resolve(outputDir, path.relative(cwd, filePath)).replace(/\.(jsx|tsx)$/, '.html');

  fs.mkdirSync(path.dirname(outputPath), {
    recursive: true
  });
  fs.writeFileSync(outputPath, output);
};
