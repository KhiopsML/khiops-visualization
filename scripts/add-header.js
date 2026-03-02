const fs = require('fs');
const path = require('path');

// Chemin du projet Angular
const projectDir = './src';

// Copyright notice
const copyrightNotice = 'Copyright (c) 2023-2025 Orange. All rights reserved.';

// Headers par format de fichier
const headers = {
  ts: `/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

`,
  js: `/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

`,
  scss: `/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

`,
  html: `<!--
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 -->

`
};

function headerExists(fileContent) {
  return fileContent.includes(copyrightNotice);
}

function getFileExtension(filePath) {
  const ext = path.extname(filePath).slice(1);
  return ext;
}

function addHeaderToFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const ext = getFileExtension(filePath);

  if (headerExists(fileContent)) {
    console.log(`Header déjà présent dans : ${filePath}`);
  } else {
    const header = headers[ext];
    if (header) {
      const newContent = header + fileContent;
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Header ajouté à : ${filePath}`);
    }
  }
}

function traverseDirectory(directory) {
  fs.readdirSync(directory).forEach((file) => {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseDirectory(fullPath);
    } else {
      const ext = getFileExtension(fullPath);
      if (headers[ext]) {
        addHeaderToFile(fullPath);
      }
    }
  });
}

traverseDirectory(projectDir);
