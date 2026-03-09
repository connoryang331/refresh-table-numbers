# Refresh Table Numbers Plugin for Obsidian

A simple Obsidian plugin that refreshes sequence numbers in Markdown tables.

## Features

- **Refresh renumber tables**: Refresh sequence numbers in table rows
- **Add sequence columns**: Insert a new sequence column to tables that don't have one
- **Customizable header**: Configure the header text for the sequence column
- **Alignment options**: Choose between left, center, or right alignment for the sequence column

## Installation

### From Obsidian Community Plugin Browser (Recommended)
1. Open Obsidian
2. Go to Settings → Community plugins
3. Disable Safe mode
4. Click "Browse" and search for "Refresh Table Numbers"
5. Click "Install" and then "Enable"

### Manual Installation
1. Download the latest release from the GitHub repository
2. Extract the files to your Obsidian plugins folder: `VaultFolder/.obsidian/plugins/refresh-table-numbers/`
3. Restart Obsidian
4. Enable the plugin in Settings → Community plugins

## Usage

1. Open a note with Markdown tables
2. Press `Ctrl+P` (or `Cmd+P` on macOS) to open the command palette
3. Type "Refresh Table Numbers" and select the command

![Refresh_table_numbers](https://github.com/user-attachments/assets/69ed3c54-518d-4e7c-8723-b03dbb5e3ff7)


### Keyboard Shortcut
You can assign a keyboard shortcut to the "Refresh Table Numbers" command in Obsidian's keyboard settings.

## Settings

The plugin has the following settings:

### Column Header
- **Description**: The header text for the sequence column
- **Default**: Empty (no header)
- **Example values**: `#`, `No.`, `序号`

### Alignment
- **Description**: Alignment for the sequence column
- **Options**: Left, Center, Right
- **Default**: Center

## How It Works

The plugin processes tables in the following ways:

1. **Tables with empty first column**: Adds or updates sequence numbers in the first column
2. **Tables with matching header**: Updates sequence numbers in the column with the specified header
3. **Tables with different header**: Inserts a new sequence column at the beginning with the specified header

## Examples

### Before
```markdown
| Item | Description |
|------|-------------|
| 1    | First item  |
| 3    | Third item  |
| 2    | Second item |
```

### After (with empty header)
```markdown
| | Item | Description |
|---|------|-------------|
| 1 | 1    | First item  |
| 2 | 3    | Third item  |
| 3 | 2    | Second item |
```

### After (with header "#")
```markdown
| # | Item | Description |
|---|------|-------------|
| 1 | 1    | First item  |
| 2 | 3    | Third item  |
| 3 | 2    | Second item |
```
### Table Format Issues
The plugin works best with standard Markdown tables. If you encounter issues with complex table formats, please report them on the GitHub repository.

## Contributing

Contributions are welcome! If you have ideas for improvements or bug fixes, please:

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## License

This plugin is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Support

If you have any questions or issues, please open an issue on the GitHub repository or contact the developer.

---

**Note**: This plugin is still in development. Please report any bugs or feature requests to help improve it!
