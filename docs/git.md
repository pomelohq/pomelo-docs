# Git and pull requests

Pomelo commits, pushes and reviews across every repo of a workspace at once.

## The Git panel

The Git panel works on all of the workspace's repos at once, in three tabs:

- **Changes** - the files the branch changed, **Staged** and **Not
  staged**, by repo. Type a message and **Commit** makes one commit per
  repo that has staged files, all with the same message; **Amend** amends
  them. The overflow menu has **Stash All**, **Stash Pop**, **Discard
  Tracked Changes**, the commit options **Amend**, **Signoff** and **Skip
  Hooks**, and **Pull**, **Push** and **Fetch All**; the view options show
  the files **By Repo** or as **One Timeline**, as a tree or a list.
- **Remote** - per repo, what is **Not pushed**, **Not published** or **On
  origin, not pulled**, the files changed on the branch, and the branch's
  pull request: its title, checks, reviews, and **Merge conflict** when it
  has one. **Create Pull Request** opens GitHub's page for a pushed branch.
- **History** - the branch's commits.

The sync button follows the branch: **Publish**, **Push**, **Pull**,
**Sync** or **Up to date**. Right-click a file for **Open Diff**, **Open
File**, **Mark as Reviewed**, **Copy Path**, **Copy Relative Path** and
**Discard Uncommitted Changes**, and a repo's remote for **Fetch**,
**Pull**, **Pull (Rebase)**, **Push** and **Force Push**.

<AppShot :width="360" :height="470" text="The Changes tab: one commit per repo from the staged files. Click a file to stage it."><GitPanel /></AppShot>

**View Diff** opens the branch's whole diff with every hunk expanded. The
two buttons in its tab bar switch between **unified** and **split**
(side-by-side, when the pane has room for it); the choice is kept for every
diff and matches **Split Diff** in the editor's menu.

<AppShot :width="720" :height="345" text="A branch diff, split. The two buttons switch to unified."><DiffView /></AppShot>

## Pull requests

PR data comes from GitHub's API directly, no `gh` CLI needed. Diffs and
changed files are read from your local worktrees. Pomelo reads the token
from `GH_TOKEN` or `GITHUB_TOKEN` in its environment, otherwise from the
project's secret named `github`: add it in the Services panel's **Secrets**
tab, for example with the value of `gh auth token`. The token only needs to
read the repositories' pull requests. After a push, the Git panel offers
**Create Pull Request**, which opens GitHub's page.
