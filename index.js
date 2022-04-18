const { renderToStaticMarkup } = require('react-dom/server');
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
  const { Helmet } = require('react-helmet');
  const staticMarkup = renderToStaticMarkup(element);
  const helmetData = Helmet.renderStatic();
  const ReHelmetAttr = / data-react-helmet="true"/g;

  return `<!doctype html>
    <html ${ helmetData.htmlAttributes.toString() }>
      <head>
        ${ helmetData.base.toString().replace(ReHelmetAttr, '') }
        ${ helmetData.meta.toString().replace(ReHelmetAttr, '') }
        ${ helmetData.title.toString().replace(ReHelmetAttr, '') }
        ${ helmetData.link.toString().replace(ReHelmetAttr, '') }
        ${ helmetData.script.toString().replace(ReHelmetAttr, '') }
        ${ helmetData.style.toString().replace(ReHelmetAttr, '') }
        ${ helmetData.noscript.toString().replace(ReHelmetAttr, '') }
      </head>
      <body ${helmetData.bodyAttributes.toString()}>
        ${staticMarkup}
      </body>
    </html>
  `;
}

exports.renderFile = function ({ filePath, cwd, outputDir }) {
  const module = path.resolve(cwd, filePath);

  const page = require(module);
  const output = pretty(renderInLayout(page.default()), {
    ocd: true
  });
  const outputPath = path.resolve(outputDir, path.relative(cwd, filePath)).replace(/\.(jsx|tsx)$/, '.html');

  fs.mkdirSync(path.dirname(outputPath), {
    recursive: true
  });
  fs.writeFileSync(outputPath, output);

  decache(module);
};
