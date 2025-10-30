const fs = require('fs');

// Read the file
const content = fs.readFileSync('main.md', 'utf8');

// Apply formatting rules
let formatted = content
  // Fix unformatted endpoints
  .replace(/^(\d+\.\d+)\s+(.+)$/gm, '### $1 $2')
  .replace(/^Endpoint:\s*(.+)$/gm, '**Endpoint:** `$1`')
  .replace(/^Description:\s*(.+)$/gm, '**Description:** $1')
  .replace(/^Request Body:$/gm, '**Request Body:**')
  .replace(/^Response \((\d+)\s+(.+)\):$/gm, '**Response ($1 $2):**')
  .replace(/^Error.*\((\d+)\s+(.+)\):$/gm, '**Error ($1 $2):**')
  .replace(/^Query Parameters:$/gm, '**Query Parameters:**')
  .replace(/^Header:$/gm, '**Header:**')
  .replace(/^Example:$/gm, '**Example:**')
  // Fix code blocks
  .replace(/\njson\n/g, '\n```json\n')
  .replace(/\njavascript\n/g, '\n```javascript\n')
  .replace(/\npython\n/g, '\n```python\n')
  .replace(/\nbash\n/g, '\n```bash\n')
  // Fix list items that should be bullets
  .replace(/^([A-Z][a-z]+\s+[a-z]+.*)\s+-\s+(.+)$/gm, '- `$1` - $2')
  // Fix sections
  .replace(/^(\d+)\.\s+(.+)$/gm, '## $1. $2')
  // Fix subsections that aren't formatted
  .replace(/^(\d+\.\d+)\s+(.+)$/gm, '### $1 $2');

// Write back
fs.writeFileSync('main-formatted.md', formatted, 'utf8');
console.log('Formatted document saved to main-formatted.md');
