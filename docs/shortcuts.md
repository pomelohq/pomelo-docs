# Keyboard shortcuts

Keys are written the way the keymap file writes them: `cmd-shift-p` is
Command+Shift+P, and `cmd-k cmd-s` means Command+K, then Command+S. The
same list, with what each key is bound to right now, is in
**Settings > Keymap**.

## Window

| Keys | Action |
| --- | --- |
| `cmd-shift-p` | Command Palette |
| `cmd-p` | Go to File |
| `cmd-shift-f` | Find in Project |
| `cmd-,` | Open Settings |
| `cmd-k cmd-s` | Open Keymap (Settings > Keymap) |
| `cmd-o` | Open Project |
| `cmd-shift-n` | New Project |
| `cmd-n` | New Workspace |
| `ctrl-shift-w` | Switch Workspace |
| `cmd-k cmd-t` | Next Theme |
| `cmd-b` | Toggle Left Dock |
| `cmd-r` | Toggle Right Dock |
| `cmd-j` | Toggle Bottom Dock |
| `cmd-shift-e` | Files |
| `ctrl-shift-g` | Git |
| `ctrl-shift-s` | Services |
| `ctrl-shift-d` | Database |
| `ctrl-shift-p` | Pull Requests (the Git panel's pull requests) |
| `cmd-?` | Agent |
| `cmd-shift-u` | Agent Usage |
| `` ctrl-` `` | Terminal |
| `cmd-t` | New Terminal |
| `cmd-w` | Close Tab |
| `cmd-alt-w` | Close All Tabs |
| `cmd-shift-v` | Markdown Preview |
| `cmd-k v` | Markdown Preview to the Side |

These have no default key; run them from the command palette or bind them
yourself: **Open in External Editor**, **Open Project Config**, **Set Up
Project with AI**, **Add Repository**, **Clone Missing Repos into Main**,
**Export Config**, **Import Config**, **Open Jira Ticket**.

## Tabs and splits

| Keys | Action |
| --- | --- |
| `cmd-\` | Split the editor to the right |
| `cmd-k` then an arrow | Split the editor in that direction |
| `cmd-k` then `cmd`-arrow | Move focus to the pane in that direction |
| `cmd-k` then `shift`-arrow | Swap with the pane in that direction |
| `cmd-k shift-enter` | Pin or unpin the tab |
| `shift-escape` | Zoom the pane |
| `cmd-alt-left` / `cmd-alt-right` | Previous / next tab |
| `cmd-shift-[` / `cmd-shift-]` | Previous / next tab |
| `ctrl-1` ... `ctrl-9` | Go to tab 1 to 9 |
| `ctrl-0` | Go to the last tab |

In a terminal, `cmd-d` or `ctrl-alt`-arrow splits the terminal pane.

## Editor

| Keys | Action |
| --- | --- |
| `cmd-s` | Save |
| `cmd-z` / `cmd-shift-z` | Undo / redo |
| `cmd-f` | Find |
| `cmd-shift-h` | Find and replace |
| `cmd-g` / `cmd-shift-g` | Next / previous match |
| `cmd-e` | Use the selection for find |
| `cmd-alt-c` / `cmd-alt-w` / `cmd-alt-x` | Toggle case sensitive / whole word / regex |
| `alt-enter` | Select all matches of the search |
| `cmd-enter` | Replace all |
| `cmd-d` | Add the next occurrence to the selection |
| `cmd-shift-l` | Select all occurrences |
| `cmd-alt-up` / `cmd-alt-down` | Add a cursor above / below |
| `cmd-/` | Toggle comment |
| `cmd-[` / `cmd-]` | Outdent / indent |
| `cmd-shift-k` | Delete the line |
| `alt-up` / `alt-down` | Move the line up / down |
| `alt-shift-up` / `alt-shift-down` | Duplicate the line up / down |
| `ctrl-shift-right` / `ctrl-shift-left` | Expand / shrink the selection by syntax node |
| `ctrl-m` | Jump to the matching bracket |
| `ctrl-j` | Join lines |
| `ctrl-g` | Go to line |
| `ctrl--` / `ctrl-_` | Go back / forward |
| `ctrl-space` | Show completions |
| `f12` | Go to definition |
| `cmd-f12` / `shift-f12` / `ctrl-f12` | Go to type definition / implementation / declaration |
| `f8` / `shift-f8` | Next / previous diagnostic |
| `cmd-f8` / `cmd-shift-f8` | Next / previous changed hunk |
| `cmd-shift-o` | Outline |
| `cmd-k z` | Toggle soft wrap |

In a diff, `cmd-y` stages the hunk and moves to the next, `cmd-shift-y`
unstages it, `cmd-alt-z` restores it, `cmd-'` toggles the selected hunks
and `cmd-"` expands them all.

## Terminal

| Keys | Action |
| --- | --- |
| `cmd-c` / `cmd-v` | Copy / paste |
| `cmd-k` | Clear |
| `cmd-a` | Select all |
| `cmd-f` / `cmd-g` | Find / next match |
| `cmd-left` / `cmd-right` | Start / end of the line |
| `cmd-backspace` | Delete to the start of the line |
| `cmd-up` / `cmd-down` | Scroll a page |
| `cmd-home` / `cmd-end` | Scroll to the top / bottom |

## Your own bindings

Window actions can be rebound in `~/.config/pomelo/keymap.json`. **Settings
> Keymap > Open keymap.json** creates the file if it is missing and opens it
in the editor; saved changes apply right away. Entries are read after the
defaults, so they win, and `null` unbinds a key:

```json
[
  {
    "context": "Workspace",
    "bindings": {
      "cmd-shift-g": "git_panel::ToggleFocus",
      "cmd-r": null
    }
  }
]
```

Each action's name (such as `git_panel::ToggleFocus`) is listed under its
label in **Settings > Keymap**, which also shows any mistakes found in the
file. Only the `Workspace` context is read; editor and terminal keys are
fixed.
