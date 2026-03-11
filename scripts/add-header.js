const fs = require('fs');
const path = require('path');

const currentYear = new Date().getFullYear();
const mitNotice = 'Based on d3-hypertree by Michael Glatzhofer';
const mitNoticeTreeview = 'Based on js-treeview by Justin Chmura';

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

const headerTreeview = (ext) => {
  const content = `
 * Based on js-treeview by Justin Chmura
 * MIT License - Copyright (c) 2014 Justin Chmura
 * https://github.com/justinchmura/js-treeview
 *
 * Modifications: Copyright (c) 2023-${currentYear} Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.`;

  if (ext === 'html') {
    return `<!--
 * Based on js-treeview by Justin Chmura
 * MIT License - Copyright (c) 2014 Justin Chmura
 * https://github.com/justinchmura/js-treeview
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
const TREEVIEW_DIR = path.normalize('src/app/khiops-treeview');

function headerExists(content) {
  return (
    /Copyright \(c\) \d{4}-\d{4} Orange\./.test(content) ||
    content.includes(mitNotice) ||
    content.includes(mitNoticeTreeview)
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

function getHeader(filePath, ext) {
  if (filePath.includes(HYPERTREE_DIR)) return headerHypertree(ext);
  if (filePath.includes(TREEVIEW_DIR)) return headerTreeview(ext);
  return headerOrange(ext);
}

function addHeaderToFile(filePath) {
  const content = updateYear(filePath);
  const ext = getExt(filePath);

  if (headerExists(content)) {
    return;
  }

  const header = getHeader(filePath, ext);
  const label = filePath.includes(HYPERTREE_DIR)
    ? 'MIT+Orange (hypertree)'
    : filePath.includes(TREEVIEW_DIR)
      ? 'MIT+Orange (treeview)'
      : 'Orange';

  fs.writeFileSync(filePath, header + content, 'utf8');
  console.log(`Header ajouté (${label}) : ${filePath}`);
}

function traverseDirectory(directory) {
  fs.readdirSync(directory).forEach((file) => {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseDirectory(fullPath);
    } else {
      const ext = getExt(fullPath);
      if (SUPPORTED_EXTENSIONS.includes(ext)) {
        addHeaderToFile(fullPath);
      }
    }
  });
}

traverseDirectory('./src');
