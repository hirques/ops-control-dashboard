# Fast GitHub publishing guide

## Option A: Publish from PowerShell

1. Create a public, **empty** repository at https://github.com/new named `ops-control-dashboard`. Do not add a README, .gitignore, or license.
2. Extract the ZIP anywhere on Windows.
3. In File Explorer, open the extracted folder containing `README.md`, `package.json`, `src/` and `PUBLISH-WINDOWS.ps1`.
4. Right-click inside that folder, select **Open in Terminal**, and run:

   ```powershell
   powershell -ExecutionPolicy Bypass -File .\PUBLISH-WINDOWS.ps1
   ```

The script always uses its own folder as the Git root to prevent the nested-folder issue. If your Git author identity is unset, set it with `git config --global user.name "Henrique"` and `git config --global user.email "your-own-email"` (use an email you want associated with public commits) and rerun the script.

## Option B: Let ChatGPT populate the repo

Create the public repository **with a README initialized** to establish the first branch. Once that repository exists, a connected GitHub assistant with write permission can commit the project contents in one step. This is different from Option A; do not start both workflows at once.

## Live demo

After the `CI` action is green:

1. **Settings → Pages → Source → GitHub Actions**.
2. **Actions → Deploy demo to GitHub Pages → Run workflow → main**.
3. When the deployment action is green, open https://hirques.github.io/ops-control-dashboard/.

The deploy workflow is manually triggered so it does not fail just because GitHub Pages has not been enabled.

## Important

- Do **not** upload the ZIP itself as a repository file; upload its contents.
- Demo metrics are simulated, not live data.
- Dependencies were not installed in the packaging environment because npm was inaccessible. The GitHub CI workflow verifies typechecking, unit tests, and production build after upload.
