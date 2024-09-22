const fs = require('fs');
const { extendHosts, removeHosts, flushDNSCache } = require('./hostsManager');

jest.mock('fs');

const mockFileContent = `
# Some initial hosts entries
127.0.0.1 localhost
`;

beforeEach(() => {
  // Reset mocks before each test
  fs.readFileSync.mockClear();
  fs.extendFileSync.mockClear();
  fs.writeFileSync.mockClear();
});

describe('extendHosts', () => {
  it('should extend hosts when not already present', () => {
    // Mock reading the hosts file
    fs.readFileSync.mockReturnValue(mockFileContent);

    // Simulate extending new hosts
    const filePaths = ['/path/to/hosts/file1'];
    const fileContent = '127.0.0.1 example.com';
    fs.readFileSync.mockReturnValueOnce(fileContent); // Simulate file content

    extendHosts(filePaths, false);

    expect(fs.extendFileSync).toHaveBeenCalledWith(
      '/private/etc/hosts',
      '\n# Start of entries from /path/to/hosts/file1\n127.0.0.1 example.com\n# End of entries from /path/to/hosts/file1\n'
    );
  });

  it('should skip extending when entries already exist', () => {
    const existingContent = `
    # Start of entries from /path/to/hosts/file1
    127.0.0.1 example.com
    # End of entries from /path/to/hosts/file1
    `;

    // Mock reading the hosts file with the existing entries
    fs.readFileSync.mockReturnValue(mockFileContent + existingContent);

    const filePaths = ['/path/to/hosts/file1'];
    extendHosts(filePaths, false);

    expect(fs.extendFileSync).not.toHaveBeenCalled(); // No new extend should happen
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
