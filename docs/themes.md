# Themes and fonts

Pomelo ships One Dark, One Light, Ayu Mirage and Gruvbox Dark, reads your own
theme files, and lets you set the family, weight, line height, OpenType
features and fallbacks of the interface, editor and terminal fonts.

## Choosing a theme

**Settings > Appearance > Theme** has a **Theme Mode**:

- **Static** - one theme, picked in **Theme Name**.
- **Dynamic** - a **Light Theme** and a **Dark Theme**, and a **Mode**:
  **Light**, **Dark**, or **System** to follow macOS as it switches between
  light and dark.

<Keys k="cmd-k cmd-t"/> steps to the next theme (the one in use now, in
either mode). In `settings.json`:

```json
{
  "theme_selection": "dynamic",
  "theme_mode": "system",
  "theme_light": "One Light",
  "theme_dark": "My Theme"
}
```

## Your own themes

Put theme files in `~/.config/pomelo/themes/` (**Settings > Appearance >
Open Themes Folder** creates it). Pomelo reads every `.json` file there and
reads it again when you save it, so edits show at once. A file is a theme
family, in the same format as other editors' theme families:

```json
{
  "name": "My Themes",
  "author": "you",
  "themes": [
    {
      "name": "My Theme",
      "appearance": "dark",
      "style": {
        "background": "#1e2127ff",
        "editor.background": "#16181cff",
        "text.accent": "#7aa2f7ff",
        "terminal.ansi.red": "#f7768eff",
        "players": [{ "cursor": "#7aa2f7ff", "selection": "#7aa2f73d" }],
        "syntax": {
          "keyword": { "color": "#bb9af7ff" },
          "string": { "color": "#9ece6aff" }
        }
      }
    }
  ]
}
```

- A theme names only the colors it changes. Every other color comes from
  One Dark (`"appearance": "dark"`) or One Light (`"light"`).
- Colors are `#rrggbb` or `#rrggbbaa`.
- `players[0]` sets the caret and the selection.
- `syntax` colors highlighting by capture name (`keyword`, `string`,
  `function`, `type`, `comment`...); a dotted name like `string.special`
  falls back to `string`.
- Tokens Pomelo does not draw are ignored, so a theme written for another
  editor loads as it is. Mistakes (a broken file, a color that is not
  `#rrggbb`) are listed on the Appearance page.

A theme named like a built-in one replaces it.

### Tokens Pomelo draws

`background`, `surface.background`, `elevated_surface.background`, `panel.background`, `border`, `border.variant`, `border.focused`, `border.selected`, `element.background`, `element.hover`, `element.active`, `element.selected`, `ghost_element.hover`, `ghost_element.active`, `text`, `text.muted`, `text.placeholder`, `text.accent`, `text.disabled`, `icon`, `icon.muted`, `icon.accent`, `title_bar.background`, `toolbar.background`, `tab_bar.background`, `tab.active_background`, `tab.inactive_background`, `editor.background`, `editor.foreground`, `editor.active_line.background`, `editor.gutter.background`, `editor.line_number`, `editor.active_line_number`, `editor.indent_guide`, `editor.indent_guide_active`, `editor.invisible`, `editor.highlighted_line.background`, `editor.document_highlight.bracket_background`, `search.match_background`, `search.active_match_background`, `version_control.added`, `version_control.modified`, `version_control.deleted`, `link_text.hover`, `scrollbar.thumb.background`, `scrollbar.thumb.border`, `scrollbar.track.border`, `scrollbar.thumb.hover_background`, `panel.indent_guide`, `panel.focused_border`, `terminal.background`, `terminal.foreground`, `terminal.bright_foreground`, `terminal.dim_foreground`, `terminal.ansi.background`, `terminal.ansi.black` to
`terminal.ansi.white` with their `bright_` and `dim_` variants, and each of
`error`, `warning`, `success`, `info`, `hint`, `ignored` with its `.background` and `.border`.

## Adjusting a theme

`theme_overrides` in `settings.json` lays colors over any theme, built-in or
yours, by name, in the same shape as a theme's `style`:

```json
{
  "theme_overrides": {
    "One Dark": {
      "editor.background": "#1b1d23ff",
      "syntax": { "comment": { "color": "#7f848eff" } }
    }
  }
}
```

## Fonts

Every font is set under **Settings > Appearance**: **Buffer Font** (the
editor), **UI Font**, **Agent Panel Font** (the agent tabs' text size) and
**Terminal Font**. The interface font has a family, size and weight; the
editor and terminal fonts add a line height. The editor's text follows the
buffer font size alone, whatever the UI font size is.

| Setting | UI | Editor | Terminal |
| --- | --- | --- | --- |
| Family | `ui_font` | `buffer_font_family` | `terminal_font_family` |
| Size | `ui_font_size` | `buffer_font_size` | `terminal_font_size` |
| Weight | `ui_font_weight` | `buffer_font_weight` | `terminal_font_weight` |
| Line height | - | `buffer_line_height` | `terminal_line_height` |
| OpenType features | `ui_font_features` | `buffer_font_features` | `terminal_font_features` |
| Fallbacks | `ui_font_fallbacks` | `buffer_font_fallbacks` | `terminal_font_fallbacks` |

- **Family** - any installed family. `.PomeloSans` and `.PomeloMono` are the
  bundled IBM Plex Sans and Lilex.
- **Weight** - 100 to 900; bold text stays bold.
- **Line height** - `"comfortable"` (1.618, the editor's default),
  `"standard"` (1.3, the terminal's default), or `{"custom": 1.5}`.
- **OpenType features** - tags and values: `true` turns a feature on,
  `false` off, a number picks an alternate. Turning off `calt` shows `->`
  and `!=` as plain characters instead of the font's ligatures.
- **Fallbacks** - families tried in order for characters the family lacks,
  before the system's own fallback.

```json
{
  "buffer_font_family": "JetBrains Mono",
  "buffer_font_weight": 450,
  "buffer_line_height": { "custom": 1.5 },
  "buffer_font_features": { "calt": false, "ss01": true },
  "buffer_font_fallbacks": ["Noto Sans CJK JP"],
  "terminal_line_height": "comfortable"
}
```

Features and fallbacks have no controls in Settings yet; their rows open
`settings.json`.
