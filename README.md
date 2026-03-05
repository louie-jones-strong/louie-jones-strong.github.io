# My Portfolio

## Status
![Page Build](https://github.com/louie-jones-strong/louie-jones-strong.github.io/actions/workflows/Build.yml/badge.svg)



My Portfolio
link: https://louie-jones-strong.github.io/


## Setup
This project now uses Bun as the primary runtime and package manager. Install Bun from https://bun.sh and follow the platform instructions.

From the repository root install dependencies with Bun:

```powershell
bun install
```

### Puppeteer / PDF Generation
The build generates `CV.pdf` using headless Chromium via `puppeteer-core`. You need a local Chrome or Chromium installation:

**Linux (Debian/Ubuntu):**
```
sudo apt-get install chromium-browser
```

**macOS:**
```
brew install --cask google-chrome
```

**Windows:** Install [Google Chrome](https://www.google.com/chrome/) normally.

Alternatively, set the `PUPPETEER_EXECUTABLE_PATH` environment variable to the path of your Chrome/Chromium binary if it is installed in a non-standard location.

### Run Pre Build Tests
```bash
# run tests with Bun
bun run PreTests
```

### Build
```bash
# build the site
bun run build
# or run the runtime directly
bun src/BuildSite.js compress onlyNew
```

### Run Post Build Tests
```bash
bun run PostTests
```