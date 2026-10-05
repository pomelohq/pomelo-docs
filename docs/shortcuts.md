# Keyboard shortcuts

Keys show as the app draws them: <Keys k="cmd-shift-p"/> is Command+Shift+P,
and <Keys k="cmd-k cmd-s"/> means Command+K, then Command+S. In `keymap.json`
the same keys are written `cmd-shift-p` and `cmd-k cmd-s` (hover a key here
to see how). The same list, with what each key is bound to right now, is in
**Settings > Keymap**.

Pomelo runs on macOS today. Windows and Linux are coming soon; their column
shows the keys they will use, with `ctrl` in place of `cmd`.

## Window

| Action | macOS | Windows / Linux (coming soon) |
| --- | --- | --- |
| Command Palette | <Keys k="cmd-shift-p"/> | <Keys pc k="ctrl-shift-p"/> |
| Go to File | <Keys k="cmd-p"/> | <Keys pc k="ctrl-p"/> |
| Find in Project | <Keys k="cmd-shift-f"/> | <Keys pc k="ctrl-shift-f"/> |
| Project Diagnostics | <Keys k="cmd-shift-m"/> | <Keys pc k="ctrl-shift-m"/> |
| Open Settings | <Keys k="cmd-,"/> | <Keys pc k="ctrl-,"/> |
| Open Keymap (Settings > Keymap) | <Keys k="cmd-k cmd-s"/> | <Keys pc k="ctrl-k ctrl-s"/> |
| Open Project | <Keys k="cmd-o"/> | <Keys pc k="ctrl-o"/> |
| New Project | <Keys k="cmd-shift-n"/> | <Keys pc k="ctrl-shift-n"/> |
| New Workspace | <Keys k="cmd-n"/> | <Keys pc k="ctrl-n"/> |
| Switch Workspace | <Keys k="cmd-alt-o"/> | <Keys pc k="ctrl-alt-o"/> |
| Next Theme | <Keys k="cmd-k cmd-t"/> | <Keys pc k="ctrl-k ctrl-t"/> |
| Toggle Left Dock | <Keys k="cmd-b"/> | <Keys pc k="ctrl-b"/> |
| Toggle Right Dock | <Keys k="cmd-r"/> | <Keys pc k="ctrl-r"/> |
| Toggle Bottom Dock | <Keys k="cmd-j"/> | <Keys pc k="ctrl-j"/> |
| Files | <Keys k="cmd-shift-e"/> | <Keys pc k="ctrl-shift-e"/> |
| Git | <Keys k="cmd-shift-c"/> | <Keys pc k="ctrl-shift-c"/> |
| Services | <Keys k="cmd-shift-s"/> | <Keys pc k="ctrl-shift-s"/> |
| Database | <Keys k="cmd-shift-d"/> | <Keys pc k="ctrl-shift-d"/> |
| Pull Requests (the Git panel's pull requests) | <Keys k="cmd-shift-r"/> | <Keys pc k="ctrl-shift-r"/> |
| Agent | <Keys k="cmd-?"/> | <Keys pc k="ctrl-?"/> |
| Agent Usage | <Keys k="cmd-shift-u"/> | <Keys pc k="ctrl-shift-u"/> |
| Terminal | <Keys k="ctrl-&#96;"/> | <Keys pc k="ctrl-&#96;"/> |
| New Terminal | <Keys k="cmd-t"/> | <Keys pc k="ctrl-t"/> |
| Close Tab | <Keys k="cmd-w"/> | <Keys pc k="ctrl-w"/> |
| Close All Tabs | <Keys k="cmd-alt-w"/> | <Keys pc k="ctrl-alt-w"/> |
| Markdown Preview | <Keys k="cmd-shift-v"/> | <Keys pc k="ctrl-shift-v"/> |
| Markdown Preview to the Side | <Keys k="cmd-k v"/> | <Keys pc k="ctrl-k v"/> |

These have no default key; run them from the command palette or bind them
yourself: **Open in External Editor**, **Open Project Config**, **Set Up
Project with AI**, **Add Repository**, **Clone Missing Repos into Main**,
**Export Config**, **Import Config**, **Open Jira Ticket**.

## Tabs and splits

| Action | macOS | Windows / Linux (coming soon) |
| --- | --- | --- |
| Split the editor to the right | <Keys k="cmd-\"/> | <Keys pc k="ctrl-\"/> |
| Split the editor in that direction | <Keys k="cmd-k"/> then an arrow | <Keys pc k="ctrl-k"/> then an arrow |
| Move focus to the pane in that direction | <Keys k="cmd-k"/> then <Keys k="cmd-left"/> | <Keys pc k="ctrl-k"/> then <Keys pc k="ctrl-left"/> |
| Swap with the pane in that direction | <Keys k="cmd-k"/> then <Keys k="shift-left"/> | <Keys pc k="ctrl-k"/> then <Keys pc k="shift-left"/> |
| Pin or unpin the tab | <Keys k="cmd-k shift-enter"/> | <Keys pc k="ctrl-k shift-enter"/> |
| Zoom the pane | <Keys k="shift-escape"/> | <Keys pc k="shift-escape"/> |
| Previous / next tab | <Keys k="cmd-alt-left"/> / <Keys k="cmd-alt-right"/> | <Keys pc k="ctrl-pageup"/> / <Keys pc k="ctrl-pagedown"/> |
| Previous / next tab | <Keys k="cmd-shift-["/> / <Keys k="cmd-shift-]"/> | <Keys pc k="ctrl-shift-["/> / <Keys pc k="ctrl-shift-]"/> |
| Go to tab 1 to 9 | <Keys k="cmd-1"/> to <Keys k="cmd-9"/> | <Keys pc k="ctrl-1"/> to <Keys pc k="ctrl-9"/> |
| Go to the last tab | <Keys k="cmd-0"/> | <Keys pc k="ctrl-0"/> |

In a terminal, `cmd-d` or `ctrl-alt`-arrow splits the terminal pane.

| Action | macOS | Windows / Linux (coming soon) |
| --- | --- | --- |
| Switch to a recent tab (hold `ctrl`, press again to go further back) | <Keys k="ctrl-tab"/> / <Keys k="ctrl-shift-tab"/> | <Keys pc k="ctrl-tab"/> / <Keys pc k="ctrl-shift-tab"/> |
| Close the tab picked in the switcher | <Keys k="ctrl-backspace"/> | <Keys pc k="ctrl-backspace"/> |
| Close the other tabs | <Keys k="cmd-alt-t"/> | <Keys pc k="ctrl-alt-t"/> |
| Close the tabs to the left / right | <Keys k="cmd-k e"/> / <Keys k="cmd-k t"/> | <Keys pc k="ctrl-k e"/> / <Keys pc k="ctrl-k t"/> |
| Close the saved tabs | <Keys k="cmd-k u"/> | <Keys pc k="ctrl-k u"/> |

Pinned tabs stay when a set of tabs closes.

## Moving around

| Action | macOS | Windows / Linux (coming soon) |
| --- | --- | --- |
| Previous / next workspace in the sidebar | <Keys k="cmd-alt-up"/> / <Keys k="cmd-alt-down"/> | <Keys pc k="ctrl-alt-up"/> / <Keys pc k="ctrl-alt-down"/> |
| Next workspace waiting for you | <Keys k="cmd-alt-a"/> | <Keys pc k="ctrl-alt-a"/> |
| Back to the editor (from a panel, terminal or agent) | <Keys k="cmd-escape"/> | <Keys pc k="ctrl-escape"/> |
| Next / previous region (editor, panels, terminal, agent) | <Keys k="cmd-k tab"/> / <Keys k="cmd-k shift-tab"/> | <Keys pc k="ctrl-k tab"/> / <Keys pc k="ctrl-k shift-tab"/> |

A panel's own key (Files, Git, Services, Database in the Window table) moves
the keyboard into its list; pressed again, or with <Keys k="escape"/>, it goes
back to the editor. Clicking a list does the same. In any list or context
menu, <Keys k="up"/> / <Keys k="down"/>, <Keys k="home"/> / <Keys k="end"/>
move, <Keys k="enter"/> picks and <Keys k="escape"/> closes. Tooltips of
buttons that have a key show it.

## Panel lists

These work only while the list has the keyboard, never in a terminal or an
agent, so single letters are safe there.

**Files**

| Keys | Action |
| --- | --- |
| <Keys k="space"/> | Open |
| <Keys k="enter"/> or <Keys k="f2"/> | Rename |
| <Keys k="cmd-n"/> / <Keys k="cmd-alt-n"/> | New file / folder |
| <Keys k="cmd-x"/> / <Keys k="cmd-c"/> / <Keys k="cmd-v"/> | Cut / copy / paste |
| <Keys k="cmd-d"/> | Duplicate |
| <Keys k="cmd-alt-c"/> / <Keys k="cmd-alt-shift-c"/> | Copy path / relative path |
| <Keys k="backspace"/> or <Keys k="cmd-backspace"/> | Move to Trash |
| <Keys k="cmd-alt-backspace"/> | Delete |
| <Keys k="cmd-alt-r"/> | Reveal in Finder |
| <Keys k="left"/> / <Keys k="right"/> | Collapse / expand |
| <Keys k="cmd-left"/> / <Keys k="cmd-right"/> | Collapse / expand all |

**Git**

| Keys | Action |
| --- | --- |
| <Keys k="enter"/> | Open the diff, commit or pull request |
| <Keys k="space"/> | Stage or unstage |
| <Keys k="cmd-y"/> / <Keys k="cmd-shift-y"/> | Stage / unstage the file |
| <Keys k="cmd-ctrl-y"/> / <Keys k="cmd-ctrl-shift-y"/> | Stage / unstage everything |
| <Keys k="backspace"/> | Discard the file's changes (asks first) |
| <Keys k="cmd-alt-c"/> / <Keys k="cmd-alt-shift-c"/> | Copy path / relative path |
| <Keys k="tab"/> | To the commit message and back |
| <Keys k="left"/> / <Keys k="right"/> | Fold / unfold |
| <Keys k="ctrl-g ctrl-g"/> | Fetch |
| <Keys k="ctrl-g up"/> / <Keys k="ctrl-g down"/> | Push / pull |
| <Keys k="cmd-1"/> / <Keys k="cmd-2"/> / <Keys k="cmd-3"/> | Changes / Remote / History |

**Services**

| Keys | Action |
| --- | --- |
| <Keys k="enter"/> | Open the service's tab |
| <Keys k="s"/> | Start or stop (the whole repo on a repo row) |
| <Keys k="r"/> | Restart |
| <Keys k="o"/> | Open in the browser |
| <Keys k="l"/> | Logs |
| <Keys k="left"/> / <Keys k="right"/> | Fold / unfold |

**Database**

| Keys | Action |
| --- | --- |
| <Keys k="enter"/> | Open the table, console or bucket |
| <Keys k="left"/> / <Keys k="right"/> | Fold / unfold |
| <Keys k="cmd-alt-c"/> | Copy the connection URL |
| <Keys k="cmd-n"/> | New console |

## Agents and notices

| Action | macOS | Windows / Linux (coming soon) |
| --- | --- | --- |
| Start a side agent (pick Ask, Review, Second opinion or Fix) | <Keys k="cmd-k a"/> | <Keys pc k="ctrl-k a"/> |
| Take the agent's session over | <Keys k="cmd-k o"/> | <Keys pc k="ctrl-k o"/> |
| Allow / deny the tool call waiting on you | <Keys k="cmd-k y"/> / <Keys k="cmd-k n"/> | <Keys pc k="ctrl-k y"/> / <Keys pc k="ctrl-k n"/> |
| Stop the agent | <Keys k="cmd-k ."/> | <Keys pc k="ctrl-k ."/> |
| Run the notice's action (for example Restart to Update) | <Keys k="cmd-k enter"/> | <Keys pc k="ctrl-k enter"/> |
| Close the notice | <Keys k="cmd-k escape"/> | <Keys pc k="ctrl-k escape"/> |

The agent keys act on the front tab of the focused group, then the agent
dock's.

## Settings window

<Keys k="up"/> / <Keys k="down"/> open the previous / next page,
<Keys k="home"/> / <Keys k="end"/> the first / last. <Keys k="tab"/> (or
<Keys k="right"/>) steps into the page's controls, <Keys k="shift-tab"/> goes
back, <Keys k="enter"/> or <Keys k="space"/> presses the control, and
<Keys k="left"/> or <Keys k="escape"/> returns to the pages. In an open
dropdown, <Keys k="up"/> / <Keys k="down"/> and <Keys k="enter"/> pick an item.

## Vim mode

Turn it on in **Settings > Keymap > Vim Mode** or with **Toggle Vim Mode** in
the command palette. The editor then starts in Normal mode and the status bar
shows the mode.

| Keys | Action |
| --- | --- |
| `h` `j` `k` `l`, `w` `b` `e` (`W` `B` `E`), `0` `^` `$`, `gg` `G`, `f` `t` `F` `T` `;` `,` | Motions, with counts |
| `i` `a` `I` `A` `o` `O` | Insert mode; <Keys k="escape"/> back to Normal |
| `d` `c` `y` `>` `<` + a motion, or doubled for lines | Delete, change, yank, indent, outdent |
| `x` `X` `s` `S` `D` `C` `Y` `r` `J` | Small edits |
| `p` `P` | Paste the last delete or yank |
| `u` / <Keys k="ctrl-r"/> | Undo / redo |
| `.` | Repeat the last change |
| `v` / `V` | Visual mode by character / line |
| `/` `?` `n` `N` `*` `#` | Search with the find bar |
| <Keys k="ctrl-d"/> / <Keys k="ctrl-u"/> | Scroll a page |

In the panel lists, vim mode adds `j` / `k`, `gg` / `G` and `h` / `l` (the
Services list keeps `l` for logs); the Git list also takes `x` to stage or
unstage, `X` / `U` for everything and `i` for the commit message.

## Editor

| Keys | Action |
| --- | --- |
| <Keys k="cmd-s"/> | Save |
| <Keys k="cmd-z"/> / <Keys k="cmd-shift-z"/> | Undo / redo |
| <Keys k="cmd-f"/> | Find |
| <Keys k="cmd-shift-h"/> | Find and replace |
| <Keys k="cmd-g"/> / <Keys k="cmd-shift-g"/> | Next / previous match |
| <Keys k="cmd-e"/> | Use the selection for find |
| <Keys k="cmd-alt-c"/> / <Keys k="cmd-alt-w"/> / <Keys k="cmd-alt-x"/> | Toggle case sensitive / whole word / regex |
| <Keys k="alt-enter"/> | Select all matches of the search |
| <Keys k="cmd-enter"/> | Replace all |
| <Keys k="cmd-d"/> | Add the next occurrence to the selection |
| <Keys k="cmd-shift-l"/> | Select all occurrences |
| <Keys k="cmd-alt-up"/> / <Keys k="cmd-alt-down"/> | Add a cursor above / below |
| <Keys k="cmd-/"/> | Toggle comment |
| <Keys k="cmd-["/> / <Keys k="cmd-]"/> | Outdent / indent |
| <Keys k="cmd-shift-k"/> | Delete the line |
| <Keys k="alt-up"/> / <Keys k="alt-down"/> | Move the line up / down |
| <Keys k="alt-shift-up"/> / <Keys k="alt-shift-down"/> | Duplicate the line up / down |
| <Keys k="ctrl-shift-right"/> / <Keys k="ctrl-shift-left"/> | Expand / shrink the selection by syntax node |
| <Keys k="ctrl-m"/> | Jump to the matching bracket |
| <Keys k="ctrl-j"/> | Join lines |
| <Keys k="ctrl-g"/> | Go to line |
| <Keys k="ctrl--"/> / <Keys k="ctrl-_"/> | Go back / forward |
| <Keys k="ctrl-space"/> | Show completions |
| <Keys k="f12"/> | Go to definition |
| <Keys k="cmd-f12"/> / <Keys k="shift-f12"/> / <Keys k="ctrl-f12"/> | Go to type definition / implementation / declaration |
| <Keys k="f8"/> / <Keys k="shift-f8"/> | Next / previous diagnostic |
| <Keys k="cmd-f8"/> / <Keys k="cmd-shift-f8"/> | Next / previous changed hunk |
| <Keys k="cmd-shift-o"/> | Outline |
| <Keys k="cmd-k z"/> | Toggle soft wrap |

In a diff, `cmd-y` stages the hunk and moves to the next, `cmd-shift-y`
unstages it, `cmd-alt-z` restores it, `cmd-'` toggles the selected hunks
and `cmd-"` expands them all.

## Terminal

| Keys | Action |
| --- | --- |
| <Keys k="cmd-c"/> / <Keys k="cmd-v"/> | Copy / paste |
| <Keys k="cmd-k"/> | Clear (when no `cmd-k` chord follows) |
| <Keys k="cmd-a"/> | Select all |
| <Keys k="cmd-f"/> / <Keys k="cmd-g"/> | Find / next match |
| <Keys k="cmd-left"/> / <Keys k="cmd-right"/> | Start / end of the line |
| <Keys k="cmd-backspace"/> | Delete to the start of the line |
| <Keys k="cmd-up"/> / <Keys k="cmd-down"/> | Scroll a page |
| <Keys k="cmd-home"/> / <Keys k="cmd-end"/> | Scroll to the top / bottom |

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
      "secondary-shift-t": "workspace::NewTerminal",
      "cmd-alt-1": ["pane::ActivateItem", 0],
      "cmd-r": null
    }
  }
]
```

`secondary` is Command on macOS and Control on Windows and Linux, so one
file works on every platform. Going to a tab takes its position from 0:
`["pane::ActivateItem", 0]` is the first tab.

Each action's name (such as `git_panel::ToggleFocus`) is listed under its
label in **Settings > Keymap**, which also shows any mistakes found in the
file, and in the [key bindings reference](/reference/shortcuts). The contexts
read are `Workspace` and the lists' own `ProjectPanel`, `GitPanel`,
`ServicesPanel`, `DatabasePanel` and `TabSwitcher`, which apply only while
that list has the keyboard; editor and terminal keys, and
the split and pane keys in the tables above, are fixed. The
[menu bar](./app#the-menu-bar) shows the keys currently bound, including
yours.
