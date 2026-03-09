"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => RefreshTableNumbersPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var DEFAULT_SETTINGS = {
  columnHeader: "",
  // Default: empty header
  align: "center"
  // Default: center aligned
};
var RefreshTableNumbersPlugin = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.isProcessing = false;
    this.settings = DEFAULT_SETTINGS;
  }
  async onload() {
    console.log("Refresh Table Numbers: Loading plugin...");
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    console.log("Refresh Table Numbers: Settings loaded:", this.settings);
    this.addSettingTab(new RefreshTableNumbersSettingTab(this.app, this));
    console.log("Refresh Table Numbers: Setting tab added");
    this.addCommand({
      id: "refresh-table-numbers",
      name: "Refresh Table Numbers",
      editorCallback: (editor) => {
        if (this.isProcessing) {
          console.log("Refresh Table Numbers: Already processing, skipping command execution...");
          return;
        }
        this.refreshAllTables(editor);
      }
    });
    console.log("Refresh Table Numbers: Plugin loaded successfully!");
  }
  refreshAllTables(editor) {
    if (this.isProcessing) {
      console.log("Refresh Table Numbers: Already processing, skipping...");
      return;
    }
    this.isProcessing = true;
    const totalLines = editor.lineCount();
    const lines = [];
    for (let i2 = 0; i2 < totalLines; i2++) {
      lines.push(editor.getLine(i2));
    }
    let tableCount = 0;
    let i = 0;
    while (i < totalLines) {
      const line = lines[i];
      if (line && line.match(/^\|[\s\-:|]+\|$/)) {
        const headerLine = i - 1;
        const sepLine = i;
        let endLine = i;
        let j = i + 1;
        while (j < totalLines) {
          const nextLine = lines[j];
          if (nextLine && nextLine.match(/^\|/)) {
            if (nextLine.match(/^\|[\s\-:|]+\|$/)) {
              break;
            } else {
              endLine = j;
            }
          } else {
            break;
          }
          j++;
        }
        if (headerLine >= 0 && lines[headerLine]) {
          const header = lines[headerLine];
          const sep = lines[sepLine];
          const isFirstColEmpty = /^\|\s*\|/.test(header);
          const firstColMatch = header.match(/^\|\s*(\S.*?)\s*\|/);
          if (isFirstColEmpty) {
            console.log("Case: First column is empty, adding/replacing numbers...");
            console.log(`Separator before: "${lines[sepLine]}"`);
            const align = this.settings.align;
            let firstColSep = ":---:";
            if (align === "left")
              firstColSep = ":---";
            else if (align === "right")
              firstColSep = "---:";
            const sepMatch = lines[sepLine].match(/^(\|\s*)[:-]+(\s*\|.*$)/);
            if (sepMatch) {
              lines[sepLine] = `${sepMatch[1]}${firstColSep}${sepMatch[2]}`;
            } else {
              lines[sepLine] = lines[sepLine].replace(/^(\|\s*)[:-]+(\s*\|)/, `$1${firstColSep}$2`);
            }
            console.log(`Separator after: "${lines[sepLine]}"`);
            let num = 1;
            for (let j2 = sepLine + 1; j2 <= endLine; j2++) {
              if (lines[j2] && lines[j2].startsWith("|")) {
                const row = lines[j2];
                if (/^\|\s*\d+\s*\|/.test(row) || /^\|\s*\d+$/.test(row)) {
                  lines[j2] = row.replace(/^\|\s*\d+/, `| ${num}`);
                } else if (/^\|\s*\|/.test(row)) {
                  lines[j2] = row.replace(/^\|(\s*)\|/, `| ${num}$1|`);
                }
                num++;
              }
            }
          } else if (firstColMatch && firstColMatch[1]) {
            const firstColContent = firstColMatch[1].trim();
            const settingsHeader = this.settings.columnHeader || "";
            if (firstColContent === settingsHeader) {
              const align = this.settings.align;
              let firstColSep = ":---:";
              if (align === "left")
                firstColSep = ":---";
              else if (align === "right")
                firstColSep = "---:";
              const sepMatch = lines[sepLine].match(/^(\|\s*)[:-]+(\s*\|.*$)/);
              if (sepMatch) {
                lines[sepLine] = `${sepMatch[1]}${firstColSep}${sepMatch[2]}`;
              } else {
                lines[sepLine] = lines[sepLine].replace(/^(\|\s*)[:-]+(\s*\|)/, `$1${firstColSep}$2`);
              }
              let num = 1;
              for (let j2 = sepLine + 1; j2 <= endLine; j2++) {
                if (lines[j2] && lines[j2].startsWith("|")) {
                  const row = lines[j2];
                  if (/^\|\s*\d+\s*\|/.test(row)) {
                    lines[j2] = row.replace(/^\|\s*\d+\s*\|/, `| ${num} |`);
                  } else if (/^\|\s*\S+\s*\|/.test(row)) {
                    lines[j2] = row.replace(/^\|\s*\S+\s*\|/, `| ${num} |`);
                  } else if (/^\|\s*\|/.test(row)) {
                    lines[j2] = row.replace(/^\|(\s*)\|/, `| ${num}$1|`);
                  } else {
                    lines[j2] = row.replace(/^\|/, `| ${num} |`);
                  }
                  num++;
                }
              }
            } else {
              const align = this.settings.align;
              let firstColSep = ":---:";
              if (align === "left")
                firstColSep = ":---";
              else if (align === "right")
                firstColSep = "---:";
              const headerText = this.settings.columnHeader || "";
              lines[headerLine] = `| ${headerText} ` + lines[headerLine];
              const sepMatch2 = lines[sepLine].match(/^(\|\s*)[:-]+(\s*\|.*$)/);
              if (sepMatch2) {
                lines[sepLine] = `| ${firstColSep} ` + lines[sepLine];
              } else {
                lines[sepLine] = `| --- ` + lines[sepLine];
              }
              let num = 1;
              for (let j2 = sepLine + 1; j2 <= endLine; j2++) {
                if (lines[j2] && lines[j2].startsWith("|")) {
                  lines[j2] = `| ${num} ` + lines[j2];
                  num++;
                }
              }
            }
            tableCount++;
          }
          i = endLine + 1;
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
  // End of refreshAllTables method
};
var RefreshTableNumbersSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Refresh Table Numbers Settings" });
    new import_obsidian.Setting(containerEl).setName("Column Header").setDesc("The header text for the new sequence column. Leave empty for no header.").addText((text) => {
      text.setPlaceholder("e.g., #, No. , \u5E8F\u53F7 or leave empty").setValue(this.plugin.settings.columnHeader).onChange(async (value) => {
        this.plugin.settings.columnHeader = value;
        await this.plugin.saveData(this.plugin.settings);
      });
    });
    new import_obsidian.Setting(containerEl).setName("Alignment").setDesc("Alignment for the sequence column.").addDropdown((dropdown) => {
      dropdown.addOption("center", "Center");
      dropdown.addOption("left", "Left");
      dropdown.addOption("right", "Right");
      dropdown.setValue(this.plugin.settings.align);
      dropdown.onChange(async (value) => {
        this.plugin.settings.align = value;
        await this.plugin.saveData(this.plugin.settings);
      });
    });
  }
};
