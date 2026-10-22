Screenshots for the docs, rendered headlessly by the app repo's ui_snapshot tool (generic sample data
only, Pomelo Dark, 2x). From pomelo/rust:

  welcome.png       MAINVIEW=welcome cargo run -q -p ui_snapshot -- out.png
  agent-usage.png   USAGEPAGE=1 cargo run -q -p ui_snapshot -- out.png

The design-board scenes render at 1x for comparison with the canvas:
  cargo run -q -p ui_snapshot -- --scene <id> out.png [--theme dark|light] [--size WxH]
(scene ids are listed in rust/crates/ui_snapshot/src/main.rs)

Use in a docs page:
  <Shot src="/shots/welcome.png" text="The welcome page" />
