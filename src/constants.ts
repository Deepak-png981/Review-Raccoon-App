export const REVIEW_RACCOON_GITHUB_MARKETPLACE_URL = "https://github.com/marketplace/actions/review-raccoon";

export const REVIEW_RACCOON_WORKFLOW_CONFIG = `name: Review Raccoon

on:
  pull_request:
    types:
      - opened
      - synchronize

permissions: write-all

jobs:
  code_review:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3
      - name: Review Raccoon
        uses: Deepak-png981/AI-Code-Reviewer-Release@latest
        with:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          OPENAI_API_KEY: \${{ secrets.OPENAI_API_KEY }}
          OPENAI_API_MODEL: "gpt-4-1106-preview"
          exclude: "yarn.lock,dist/**"
          USER: "userId"`;

export const REVIEW_RACCOON_WORKFLOW_CONTENT = (userId: string) => `name: Review Raccoon

on:
  pull_request:
    types:
      - opened
      - synchronize

permissions: write-all

jobs:
  code_review:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3
      - name: Review Raccoon
        uses: Deepak-png981/AI-Code-Reviewer-Release@latest
        with:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          OPENAI_API_KEY: \${{ secrets.OPENAI_API_KEY }}
          OPENAI_API_MODEL: "gpt-4-1106-preview"
          exclude: "yarn.lock,dist/**"
          USER: "${userId}"
`;  