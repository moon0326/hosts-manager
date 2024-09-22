#!/usr/bin/env node
const { appendHosts, removeHosts, flushDNSCache, flushChromeSockets } = require('../hostManager.js');

const main = async (args) => {
  if (args.length === 0) {
    console.log('Usage: node hosts.js [append|remove] [file1 file2 ...] [--flush-chrome] [--temp]');
    return;
  }

  const command = args[0];
  const pathsOrEntries = args.slice(1).filter(arg => arg !== '--flush-chrome' && arg !== '--temp');
  const shouldFlushChrome = args.includes('--flush-chrome');
  const isTemp = args.includes('--temp');

  switch (command) {
    case 'append':
      appendHosts(pathsOrEntries, isTemp);
      flushDNSCache();
      if (shouldFlushChrome) {
        await flushChromeSockets();
      }
      // If --temp, wait for manual quit
      if (isTemp) {
        console.log('Waiting for manual quit...');
        process.stdin.resume();
        process.on('SIGINT', () => {
          console.log('Removing temporary entries...');
          removeHosts(pathsOrEntries);
          process.exit(); // Exit after removal
        });
      }
      break;
    case 'remove':
      removeHosts(pathsOrEntries);
      flushDNSCache();
      if (shouldFlushChrome) {
        await flushChromeSockets();
      }
      break;
    default:
      console.log('Unknown command. Use append or remove.');
  }
};

main(process.argv.slice(2)); // Slice to skip 'node' and 'host-manager.js'