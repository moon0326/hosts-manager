
# Hosts Manager CLI

This Node.js CLI tool allows you to manage the `/private/etc/hosts` file on macOS. It supports extending and removing host entries from external files, flushing the macOS DNS cache, and optionally flushing Chrome's socket pools.

## Features

- **Extend**: extend host entries from one or more files to `/private/etc/hosts`.
- **Remove**: Remove host entries that were previously extended.
- **Temporary extending**: Use the `--temp` option to temporarily extend host entries. These entries will be automatically removed when you manually quit the command.
- **Flush DNS Cache**: Automatically flush the macOS DNS cache after making changes to the hosts file.
- **Flush Chrome Socket Pools**: Use the `--flush-chrome` option to flush Chrome's socket pools after extending or removing host entries.

## Prerequisites

- **Node.js**: Make sure you have Node.js installed. You can download it from [here](https://nodejs.org/).
- **Puppeteer**: This tool uses Puppeteer to control Chrome for flushing socket pools. Puppeteer should be installed as part of the dependencies.

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/moon0326/hosts-manager
   cd hosts-manager-cli
   ```

2. Install the necessary dependencies:
   ```bash
   npm install -g
   ```

3. Run it `hosts-manager extend :file`


### Commands

#### Extend Host Entries

To extend host entries from a file:

```bash
sudo hosts-manager extend /path/to/hosts/file1
```

This will extend the entries from `file1` to the `/private/etc/hosts` file and flush the macOS DNS cache. You can also pass multiple files. 


```bash
sudo hosts-manager extend /path/to/hosts/file1 /path/to/hosts/file2
```

#### Extend with Temporary Entries (`--temp`)

To extend entries temporarily, use the `--temp` option. The entries will be automatically removed when you quit the command (using `Ctrl + C`).

```bash
sudo hosts-manager extend /path/to/hosts/file1 --temp
```

#### Remove Host Entries

To remove entries that were previously extended:

```bash
sudo hosts-manager remove /path/to/hosts/file1
```

This will remove the entries from `file1` that were wrapped with the comments (`# Start of entries...` and `# End of entries...`).

#### Flush Chrome Socket Pools (`--flush-chrome`)

To flush Chrome's socket pools after extending or removing host entries, use the `--flush-chrome` option:

```bash
sudo hosts-manager extend /path/to/hosts/file1 --flush-chrome
sudo hosts-manager remove /path/to/hosts/file1 --flush-chrome
```

### Example Usage

- **Extend host entries with temporary mode**:
  ```bash
  sudo hosts-manager extend /path/to/hosts/file1 --temp
  ```

- **Extend host entries and flush Chrome socket pools**:
  ```bash
  sudo hosts-manager extend /path/to/hosts/file1 --flush-chrome
  ```

- **Remove host entries**:
  ```bash
  sudo hosts-manager remove /path/to/hosts/file1
  ```

## How It Works

1. **Extending**: The tool wraps the extended host entries with unique comments:
   ```
   # Start of entries from /path/to/hosts/file1
   127.0.0.1 example.com
   # End of entries from /path/to/hosts/file1
   ```
   This allows the tool to later remove those entries by matching these comments.

2. **Removing**: When you remove host entries, the tool searches for the block of entries wrapped in `# Start of entries...` and `# End of entries...` and removes the entire block.

3. **Temporary Entries**: When using the `--temp` option, the tool extends the entries and waits for you to manually quit the command. Upon quitting (`Ctrl + C`), it automatically removes the entries.

4. **Chrome Socket Pools**: When using `--flush-chrome`, the tool launches Chrome in headless mode and programmatically clicks the "Flush socket pools" button in `chrome://net-internals/#sockets`.

## Contributing

Feel free to open issues or submit pull requests if you find bugs or have suggestions for improvements.

## License

This project is licensed under the MIT License.
