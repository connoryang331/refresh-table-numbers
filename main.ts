import { Editor, Plugin, Setting, PluginSettingTab } from "obsidian";

interface TableInfo {
  startLine: number;
  endLine: number;
  headerLine: number;
  rows: { line: number; number: number }[];
}

interface PluginSettings {
  columnHeader: string;
  align: "center" | "left" | "right";
}

const DEFAULT_SETTINGS: PluginSettings = {
  columnHeader: "",  // Default: empty header
  align: "center",   // Default: center aligned
};

export default class RefreshTableNumbersPlugin extends Plugin {
  private isProcessing = false;
  private settings: PluginSettings = DEFAULT_SETTINGS;

  async onload() {
    console.log("Refresh Table Numbers: Loading plugin...");
    
    // Load settings
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    console.log("Refresh Table Numbers: Settings loaded:", this.settings);

    // Add settings tab
    this.addSettingTab(new RefreshTableNumbersSettingTab(this.app, this));
    console.log("Refresh Table Numbers: Setting tab added");

    // Add command
    this.addCommand({
      id: "refresh-table-numbers",
      name: "Refresh Table Numbers",
      editorCallback: (editor: Editor) => {
        this.refreshAllTables(editor);
      },
    });

    console.log("Refresh Table Numbers: Plugin loaded successfully!");
  }

  private refreshAllTables(editor: Editor) {
    if (this.isProcessing) {
      console.log("Refresh Table Numbers: Already processing, skipping...");
      return; // Prevent overlapping executions
    }
    this.isProcessing = true;

    const totalLines = editor.lineCount();
    const lines: string[] = [];
    
    for (let i = 0; i < totalLines; i++) {
      lines.push(editor.getLine(i));
    }

    let tableCount = 0;
    let i = 0;

    while (i < totalLines) {
      const line = lines[i];

      // Find separator line (e.g., |---|---|)
      if (line && line.match(/^\|[\s\-:|]+\|$/)) {
        const headerLine = i - 1; // Header is before separator
        const sepLine = i;
        
        // Find table end - stop when we see a separator line again or non-table line
        let endLine = i;
        let j = i + 1;
        while (j < totalLines) {
          const nextLine = lines[j];
          
          // If this line starts with |, it could be part of the table OR start of next table
          if (nextLine && nextLine.match(/^\|/)) {
            // Check if it's actually a separator line (contains only -,: and |)
            if (nextLine.match(/^\|[\s\-:|]+\|$/)) {
              // This is a separator line, so current table ends at previous line
              break;
            } else {
              // This is a data row, include it in current table
              endLine = j;
            }
          } else {
            // This is not a table line, so current table ends at previous line
            break;
          }
          j++; // Make sure we advance the counter
        }

        if (headerLine >= 0 && lines[headerLine]) {
          const header = lines[headerLine];
          const sep = lines[sepLine];
          
          // Check if first column is empty: |  | or |   |
          const isFirstColEmpty = /^\|\s*\|/.test(header);
          // Check if first column has content (non-empty)
          const firstColMatch = header.match(/^\|\s*(\S.*?)\s*\|/);
          
          if (isFirstColEmpty) {
            // Case: First column is empty - add/replace numbers and update alignment
            // Update separator alignment - match any separator at start
            const align = this.settings.align;
            let firstColSep = ":---:";  // Default: center (both sides)
            if (align === "left") firstColSep = ":---";      // Left: colon left
            else if (align === "right") firstColSep = "---:"; // Right: colon right
            
            // Match various separator formats: | --- |, | ---: |, | :--- |, | :---: |, etc.
            // Replace only the first column's separator part
            const sepMatch = lines[sepLine].match(/^(\|\s*)[:-]+(\s*\|.*$)/);
            if (sepMatch) {
              lines[sepLine] = `${sepMatch[1]}${firstColSep}${sepMatch[2]}`;
            } else {
              // Just try to replace the first column part
              lines[sepLine] = lines[sepLine].replace(/^(\|\s*)[:-]+(\s*\|)/, `$1${firstColSep}$2`);
            }
            
            let num = 1;
            for (let j = sepLine + 1; j <= endLine; j++) {
              if (lines[j] && lines[j].startsWith("|")) {
                const row = lines[j];
                // Check if first column has number: | 1 | or | 1
                if (/^\|\s*\d+\s*\|/.test(row) || /^\|\s*\d+$/.test(row)) {
                  // Has number, replace it
                  lines[j] = row.replace(/^\|\s*\d+/, `| ${num}`);
                } else if (/^\|\s*\|/.test(row)) {
                  // Empty first column, add number
                  lines[j] = row.replace(/^\|(\s*)\|/, `| ${num}$1|`);
                }
                // If first column has other content, do nothing (don't touch it)
                num++;
              }
            }
          } else if (firstColMatch && firstColMatch[1]) {
            // First column has content - compare with settings header
            const firstColContent = firstColMatch[1].trim();
            const settingsHeader = this.settings.columnHeader || "";
            
            if (firstColContent === settingsHeader) {
              // Header matches settings - renumber ALL rows and update alignment
              
              // Update separator alignment - match any separator at start
              const align = this.settings.align;
              let firstColSep = ":---:";  // Default: center (both sides)
              if (align === "left") firstColSep = ":---";      // Left: colon left
              else if (align === "right") firstColSep = "---:"; // Right: colon right
          
            // Match various separator formats: | --- |, | ---: |, | :--- |, | :---: |, etc.
            // Replace only the first column's separator part
            const sepMatch = lines[sepLine].match(/^(\|\s*)[:-]+(\s*\|.*$)/);
            if (sepMatch) {
              lines[sepLine] = `${sepMatch[1]}${firstColSep}${sepMatch[2]}`;
            } else {
              // Just try to replace the first column part
              lines[sepLine] = lines[sepLine].replace(/^(\|\s*)[:-]+(\s*\|)/, `$1${firstColSep}$2`);
            }
            
            let num = 1;
            for (let j = sepLine + 1; j <= endLine; j++) {
              if (lines[j] && lines[j].startsWith("|")) {
                const row = lines[j];
                // Match first column: | xxx | or | xxx
                if (/^\|\s*\d+\s*\|/.test(row)) {
                  // Has number - replace it
                  lines[j] = row.replace(/^\|\s*\d+\s*\|/, `| ${num} |`);
                } else if (/^\|\s*\S+\s*\|/.test(row)) {
                  // Has text - replace it
                  lines[j] = row.replace(/^\|\s*\S+\s*\|/, `| ${num} |`);
                } else if (/^\|\s*\|/.test(row)) {
                  // Empty - add number
                  lines[j] = row.replace(/^\|(\s*)\|/, `| ${num}$1|`);
                } else {
                  // No pipe after first column, add one
                  lines[j] = row.replace(/^\|/, `| ${num} |`);
                }
                num++;
              }
            }
          } else {
            // Header different from settings - INSERT new column at left
            
            // Update alignment for the new first column
            const align = this.settings.align;
            let firstColSep = ":---:";  // Default: center (both sides)
            if (align === "left") firstColSep = ":---";      // Left: colon left
            else if (align === "right") firstColSep = "---:"; // Right: colon right
            
            // Add header text
            const headerText = this.settings.columnHeader || "";
            lines[headerLine] = `| ${headerText} ` + lines[headerLine];
            
            // Update the separator line to add the new column separator
            const sepMatch2 = lines[sepLine].match(/^(\|\s*)[:-]+(\s*\|.*$)/);
            if (sepMatch2) {
              lines[sepLine] = `| ${firstColSep} ` + lines[sepLine];
            } else {
              // If no proper separator format, add a basic one
              lines[sepLine] = `| --- ` + lines[sepLine];
            }
            
            // Add sequence numbers to all data rows
            let num = 1;
            for (let j = sepLine + 1; j <= endLine; j++) {
              if (lines[j] && lines[j].startsWith("|")) {
                lines[j] = `| ${num} ` + lines[j];
                num++;
              }
            }
          }
          tableCount++;
        }
        }

        // Safety: ensure advancement to avoid infinite loops 
        const nextPos = Math.max(i + 1, endLine + 1);
        if (nextPos <= i) {
          i++;
        } else {
          i = nextPos;
        }
      } else {
        i++;
      }
    }

    const doc = editor.getDoc();
    const fullContent = lines.join("\n");
    doc.setValue(fullContent);

    if (tableCount > 0) {
      console.log(`Refreshed ${tableCount} table(s)`);
    }
    
    setTimeout(() => {
      this.isProcessing = false;
    }, 100);
  }
}

class RefreshTableNumbersSettingTab extends PluginSettingTab {
  plugin: RefreshTableNumbersPlugin;

  constructor(app: any, plugin: RefreshTableNumbersPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Refresh Table Numbers Settings" });

    new Setting(containerEl)
      .setName("Column Header")
      .setDesc("The header text for the new sequence column. Leave empty for no header.")
      .addText((text) => {
        text.setPlaceholder("e.g., #, No. , 序号 or leave empty")
          .setValue(this.plugin.settings.columnHeader)
          .onChange(async (value) => {
            this.plugin.settings.columnHeader = value;
            await this.plugin.saveData(this.plugin.settings);
          });
      });

    new Setting(containerEl)
      .setName("Alignment")
      .setDesc("Alignment for the sequence column.")
      .addDropdown((dropdown) => {
        dropdown.addOption("center", "Center");
        dropdown.addOption("left", "Left");
        dropdown.addOption("right", "Right");
        dropdown.setValue(this.plugin.settings.align);
        dropdown.onChange(async (value) => {
          this.plugin.settings.align = value as "center" | "left" | "right";
          await this.plugin.saveData(this.plugin.settings);
        });
      });
  }
}
