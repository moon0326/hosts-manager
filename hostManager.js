const fs = require('fs');
const { execSync } = require('child_process');
const puppeteer = require('puppeteer');

const HOSTS_FILE = '/private/etc/hosts';

const extendHosts = (files, isTemp = false) => {
  let fileContent = fs.readFileSync(HOSTS_FILE, 'utf8');

  files.forEach((filePath) => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const commentStart = `# Start of entries from ${filePath}`;
      const commentEnd = `# End of entries from ${filePath}`;
      const wrappedContent = `\n${commentStart}\n${content}\n${commentEnd}\n`;

      if (fileContent.includes(commentStart) && fileContent.includes(commentEnd)) {
        console.log(`Entries from ${filePath} already exist, skipping extend.`);
      } else {
        fs.appendFileSync(HOSTS_FILE, wrappedContent);
        console.log(`extended entries from ${filePath}`);

        if (isTemp) {
          process.stdin.resume();
          process.on('SIGINT', () => {
            removeHosts([filePath]);
            process.exit();
          });
        }
      }
    }
  });
};

const removeHosts = (files) => {
  let fileContent = fs.readFileSync(HOSTS_FILE, 'utf8');

  files.forEach((filePath) => {
    const commentStart = `# Start of entries from ${filePath}`;
    const commentEnd = `# End of entries from ${filePath}`;
    const regex = new RegExp(`\\n?${commentStart}[\\s\\S]*?${commentEnd}\\n?`, 'g');
    fileContent = fileContent.replace(regex, '');
  });

  fs.writeFileSync(HOSTS_FILE, fileContent, 'utf8');
  console.log(`Removed entries`);
};

const flushDNSCache = () => {
  try {
    execSync('sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder');
    console.log('Flushed macOS DNS cache.');
  } catch (error) {
    console.error('Error flushing DNS cache:', error);
  }
};

const flushChromeSockets = async () => {
  try {
    const browser = await puppeteer.launch({
      headless: true, // Run Chrome in headless mode (no UI)
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', // Path to the installed Chrome
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // Extra args for headless execution
    });
    
    const page = await browser.newPage();
    await page.goto('chrome://net-internals/#sockets');

    // Click the 'Flush socket pools' button
    await page.evaluate(() => {
      const flushButton = document.querySelector('button#sockets-view-flush-button');
      if (flushButton) {
        flushButton.click();
        console.log('Flushed Chrome socket pools.');
      } else {
        console.error('Could not find the Flush button on Chrome internals page.');
      }
    });

    await browser.close();
    console.log("Flushed Chrome socket pools.");
  } catch (error) {
    console.error('Error flushing Chrome socket pools:', error);
  }
};

module.exports = { extendHosts, removeHosts, flushDNSCache, flushChromeSockets };
