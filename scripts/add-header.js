const fs = require('fs');
const path = require('path');

const currentYear = new Date().getFullYear();
const copyrightNotice = `Copyright (c) 2023-${currentYear} Orange. All rights reserved.`;
const mitNotice = 'Based on d3-hypertree by Michael Glatzhofer';

const headerOrange = (ext) => {
  const content = `
 * Copyright (c) 2023-${currentYear} Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.`;

  if (ext === 'html') {
    return `<!--
 * Copyright (c) 2023-${currentYear} Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 -->

`;
  }
  return `/*${content}
 */

`;
};

const headerHypertree = (ext) => {
  const content = `
 * Based on d3-hypertree by Michael Glatzhofer
 * MIT License - Copyright (c) 2018 Michael Glatzhofer
 * https://github.com/glouwa/d3-hypertree
 *
 * Modifications: Copyright (c) 2023-${currentYear} Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.`;

  if (ext === 'html') {
    return `<!--
 * Based on d3-hypertree by Michael Glatzhofer
 * MIT License - Copyright (c) 2018 Michael Glatzhofer
 * https://github.com/glouwa/d3-hypertree
 *
 * Modifications: Copyright (c) 2023-${currentYear} Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 -->

`;
  }
  return `/*${content}
 */

`;
};

const SUPPORTED_EXTENSIONS = ['ts', 'js', 'scss', 'html'];
const HYPERTREE_DIR = path.normalize('src/app/khiops-hypertree');

function headerExists(content) {
  return (
    /Copyright \(c\) \d{4}-\d{4} Orange\./.test(content) ||
    content.includes(mitNotice)
  );
}

function getExt(filePath) {
  return path.extname(filePath).slice(1);
}

function updateYear(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const updated = content.replace(
    /Copyright \(c\) (\d{4})-\d{4} Orange\./g,
    `Copyright (c) $1-${currentYear} Orange.`,
  );
  if (updated !== content) {
    fs.writeFileSync(filePath, updated, 'utf8');
    console.log(`Année mise à jour : ${filePath}`);
  }
  return updated;
}

function addHeaderToFile(filePath, isHypertree) {
  const content = updateYear(filePath); // ← mise à jour d'abord
  const ext = getExt(filePath);

  if (headerExists(content)) {
    return;
  }

  const header = isHypertree ? headerHypertree(ext) : headerOrange(ext);
  fs.writeFileSync(filePath, header + content, 'utf8');
  console.log(
    `Header ajouté (${isHypertree ? 'MIT+Orange' : 'Orange'}) : ${filePath}`,
  );
}

function traverseDirectory(directory) {
  fs.readdirSync(directory).forEach((file) => {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseDirectory(fullPath);
    } else {
      const ext = getExt(fullPath);
      if (SUPPORTED_EXTENSIONS.includes(ext)) {
        const isHypertree = fullPath.includes(HYPERTREE_DIR);
        addHeaderToFile(fullPath, isHypertree);
      }
    }
  });
}

traverseDirectory('./src');
