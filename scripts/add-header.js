const fs = require('fs');
const path = require('path');

// Chemin du projet Angular
const projectDir = './src';

// Header à ajouter
const headerComment = `/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

`;

function addHeaderToFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  if (!fileContent.startsWith('/**')) {
    const newContent = headerComment + fileContent;
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Header ajouté à : ${filePath}`);
  } else {
    console.log(`Header déjà présent dans : ${filePath}`);
  }
}

function traverseDirectory(directory) {
  fs.readdirSync(directory).forEach((file) => {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseDirectory(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.ts')) {
      addHeaderToFile(fullPath);
    }
  });
}

traverseDirectory(projectDir);
