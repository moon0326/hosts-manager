const fs = require('fs');
const { appendHosts, removeHosts, flushDNSCache } = require('./hostsManager');

jest.mock('fs');

const mockFileContent = `
# Some initial hosts entries
127.0.0.1 localhost
`;

beforeEach(() => {
  // Reset mocks before each test
  fs.readFileSync.mockClear();
  fs.appendFileSync.mockClear();
  fs.writeFileSync.mockClear();
});

describe('appendHosts', () => {
  it('should append hosts when not already present', () => {
    // Mock reading the hosts file
    fs.readFileSync.mockReturnValue(mockFileContent);

    // Simulate appending new hosts
    const filePaths = ['/path/to/hosts/file1'];
    const fileContent = '127.0.0.1 example.com';
    fs.readFileSync.mockReturnValueOnce(fileContent); // Simulate file content

    appendHosts(filePaths, false);

    expect(fs.appendFileSync).toHaveBeenCalledWith(
      '/private/etc/hosts',
      '\n# Start of entries from /path/to/hosts/file1\n127.0.0.1 example.com\n# End of entries from /path/to/hosts/file1\n'
    );
  });

  it('should skip appending when entries already exist', () => {
    const existingContent = `
    # Start of entries from /path/to/hosts/file1
    127.0.0.1 example.com
    # End of entries from /path/to/hosts/file1
    `;

    // Mock reading the hosts file with the existing entries
    fs.readFileSync.mockReturnValue(mockFileContent + existingContent);

    const filePaths = ['/path/to/hosts/file1'];
    appendHosts(filePaths, false);

    expect(fs.appendFileSync).not.toHaveBeenCalled(); // No new append should happen
  });
});

describe('removeHosts', () => {
  it('should remove hosts when entries are present', () => {
    const existingContent = `
    # Start of entries from /path/to/hosts/file1
    127.0.0.1 example.com
    # End of entries from /path/to/hosts/file1
    `;

    fs.readFileSync.mockReturnValue(mockFileContent + existingContent);

    removeHosts(['/path/to/hosts/file1']);

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      '/private/etc/hosts',
      mockFileContent.trim() // Make sure only the initial content is left
    );
  });
});

describe('flushDNSCache', () => {
  it('should call the command to flush DNS cache', () => {
    const { execSync } = require('child_process');
    jest.mock('child_process');

    flushDNSCache();

    expect(execSync).toHaveBeenCalledWith('sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder');
  });
});
