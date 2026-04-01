# Smelt - GitHub Actions for Daml CI/CD

Smelt is a comprehensive suite of GitHub Actions designed to seamlessly integrate Daml smart contract development into your CI/CD pipelines. It simplifies the process of setting up the Daml SDK, building, testing, and deploying your Daml Archive (.dar) files directly from your GitHub workflows.

## 🚀 Available Actions

Currently, Smelt provides the following core actions:

*   **`@smelt/setup`**: Downloads, installs, and configures the Daml SDK on your GitHub runner.
*   **`@smelt/build`**: Compiles your Daml project into a `.dar` (Daml Archive) file.

*(Note: `test` and `deploy` actions are planned for future releases.)*

---

## 🛠️ How to Use Smelt in Your Project

To compile your Daml code on GitHub, you **do not** need to commit the SDK itself or binary dependencies. You only need your `daml.yaml` and your `.daml` source files. Smelt handles the environment setup and compilation for you.

### 1. Basic Workflow Example

Create a new workflow file in your repository (e.g., `.github/workflows/daml-ci.yml`) and add the following configuration:

```yaml
name: Daml CI Pipeline

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
      # 1. Check out your Daml source code
      - name: Checkout Repository
        uses: actions/checkout@v4

      # 2. Setup the Daml SDK using Smelt
      - name: Setup Daml SDK
        uses: Ferhatr10/smelt/packages/setup@main
        with:
          # Required: Specify the Daml SDK version your project uses
          sdk-version: '2.7.0'

      # 3. Build the Daml Project using Smelt
      - name: Build Daml Project
        uses: Ferhatr10/smelt/packages/build@main
        with:
          # Optional: If your daml.yaml is not in the root directory, 
          # specify its path here (e.g., 'my-daml-app/')
          project-dir: '.'
          
      # 4. (Optional) Upload the generated DAR file as an artifact
      - name: Upload DAR Artifact
        uses: actions/upload-artifact@v4
        with:
          name: compiled-daml-model
          # The build action generates the DAR in the .daml/dist/ folder 
          # relative to your project-dir
          path: .daml/dist/*.dar
```

### 2. Monorepo / Subfolder Workflow Example

If your Daml project is located inside a subfolder (e.g., `contracts/`), you can use the `project-dir` input to target it correctly:

```yaml
      - name: Build Daml Contracts
        uses: Ferhatr10/smelt/packages/build@main
        with:
          project-dir: 'contracts'
```

---

## ⚙️ Configuration Inputs

### `@smelt/setup`
| Input | Description | Required | Default |
| :--- | :--- | :---: | :--- |
| `sdk-version` | The version of the Daml SDK to install (e.g., `'2.7.0'`). | **Yes** | - |

### `@smelt/build`
| Input | Description | Required | Default |
| :--- | :--- | :---: | :--- |
| `project-dir` | The relative path to the directory containing your `daml.yaml` file. | No | `'.'` |

---

## 🤝 Contributing to Smelt

Smelt is built as a pnpm workspace monorepo.

### Local Development Setup

1.  **Install dependencies:**
    ```bash
    pnpm install
    ```
2.  **Build all packages:**
    ```bash
    pnpm --filter "*" build
    # or
    pnpm rebuild
    ```
3.  **Run local mock tests:**
    Smelt includes local test runners that mock the GitHub Actions environment without needing to push to GitHub.
    ```bash
    pnpm test:setup
    pnpm test:build
    ```

### License

ISC
