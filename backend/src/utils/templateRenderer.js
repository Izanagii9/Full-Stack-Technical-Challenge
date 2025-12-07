import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const renderTemplate = (templateName, data = {}) => {
  const templatePath = path.join(__dirname, '../../views', `${templateName}.html`);
  let html = fs.readFileSync(templatePath, 'utf-8');

  // Replace all placeholders with data
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    html = html.replace(regex, data[key]);
  });

  return html;
};
