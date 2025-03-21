export const REVIEW_RACCOON_GITHUB_MARKETPLACE_URL = "https://github.com/marketplace/actions/review-raccoon";

export const REVIEW_RACCOON_WORKFLOW_CONFIG = `name: Review Raccoon

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Review Raccoon Action
        uses: review-raccoon/action@v1
        with:
          github-token: \${{ secrets.GITHUB_TOKEN }}
          config-path: '.reviewraccoon.json'`;  