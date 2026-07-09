const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        if (file === 'node_modules' || file === 'dist' || file.startsWith('.')) return;
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.html')) results.push(file);
        }
    });
    return results;
}

const htmlFiles = walk(__dirname);

htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace <script src="..."> with <script type="module" src="...">
    let newContent = content.replace(/<script\s+src="([^"]+)"(?!\s+type="module")(?![^>]*type="module")[^>]*><\/script>/g, function(match, src) {
        if (src.startsWith('http')) return match;
        return match.replace('<script', '<script type="module"');
    });
    if (content !== newContent) {
        console.log('Updated ' + file);
        fs.writeFileSync(file, newContent, 'utf8');
    }
});
