Screenshots for the docs and the landing page, rendered headlessly by the app
repo's ui_snapshot tool (generic sample data only). From pomelo/rust:

  main-window.png       OPENFILES=<a.rs,b.rs,c.rs> MAINVIEW=1 SNAPW=1440 cargo run -q -p ui_snapshot -- out.png
  workspace-create.png  MAINVIEW=wsops cargo run -q -p ui_snapshot -- out.png
  service-env.png       ENVTAB=env cargo run -q -p ui_snapshot -- out.png
  database-table.png    DATABASE=table cargo run -q -p ui_snapshot -- out.png
  pull-request.png      PRTAB=1 cargo run -q -p ui_snapshot -- out.png
  jira-ticket.png       TICKETTAB=1 cargo run -q -p ui_snapshot -- out.png
  project-settings.png  cargo run -q -p ui_snapshot -- out.png 10
  agent-settings.png    LIVE=1 cargo run -q -p ui_snapshot -- out.png 6
  services-panel.png    SERVICES=1 cargo run -q -p ui_snapshot -- out.png
  service-tab.png       SERVICES=api/server cargo run -q -p ui_snapshot -- out.png
  agent-usage.png       USAGEPAGE=1 cargo run -q -p ui_snapshot -- out.png
  usage-card.png        MAINVIEW=usagecard cargo run -q -p ui_snapshot -- out.png
  onboarding.png        ONBOARD=progress cargo run -q -p ui_snapshot -- out.png
  welcome.png           MAINVIEW=welcome cargo run -q -p ui_snapshot -- out.png

Use in a docs page:
  <Shot src="/shots/database-table.png" text="Database browser" />
