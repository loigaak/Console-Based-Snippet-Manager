# Console-Based-Snippet-Manager
Provide a lightweight, terminal-based tool for developers to save, search, and manage code snippets, making it easier to reuse code fragments without relying on external tools like VS Code extensions or web-based platforms.
# Console Snippet Manager
A terminal-based tool for developers to save, search, and manage code snippets.

## Installation
```bash
npm install -g snippet-cli
Usage
Add a snippet: snippet add --title "Fetch API" --code "fetch(url).then(res => res.json())" --tags "javascript,api"
List snippets: snippet list [--tag <tag>]
Search snippets: snippet search <query>
Copy snippet: snippet copy <id>
Delete snippet: snippet delete <id>
Notes
Snippets are saved to a JSON file for persistence.
Use tags to organize snippets by category (e.g., javascript, python).
Support
If you find this tool useful, consider sponsoring me on GitHub Sponsors!
