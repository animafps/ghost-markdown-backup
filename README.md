# Ghost Markdown Backup

```yaml
name: Backup Ghost

on:
  schedule: # execute every 24 hours
    - cron: "* */24 * * *"
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest
    name: Backup Ghost posts to markdown

    steps:
        uses: animafps/ghost-markdown-backup@v1
        with:
          url:
          key:
          version:

```
