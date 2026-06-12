# BudgetGuard Release Setup Guide

This guide walks you through setting up signed APK releases for BudgetGuard.

## Prerequisites

- Android Keystore file (.jks or .keystore)
- Keystore password
- Key alias
- Key password

## Step 1: Create a Keystore (if you don't have one)

If you already have a keystore, skip to Step 2.

```bash
keytool -genkey -v -keystore budgetguard-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias budgetguard
```

You'll be prompted for:
- Keystore password
- Key password
- Key alias name
- Your name, organization, etc.

## Step 2: Encode Keystore to Base64

Convert your keystore to Base64 (required for GitHub Secrets):

```bash
# On macOS/Linux
base64 -i budgetguard-release.jks | tr -d '\n' | pbcopy

# On Windows (PowerShell)
[Convert]::ToBase64String([IO.File]::ReadAllBytes("budgetguard-release.jks")) | Set-Clipboard
```

Save the output somewhere safe.

## Step 3: Add GitHub Secrets

Go to your repository → Settings → Secrets and variables → Actions

Add these 4 secrets:

1. **ANDROID_KEYSTORE_BASE64**
   - Value: The Base64-encoded keystore (from Step 2)

2. **ANDROID_KEY_ALIAS**
   - Value: The key alias (from Step 1, default: `budgetguard`)

3. **ANDROID_KEYSTORE_PASSWORD**
   - Value: The keystore password (from Step 1)

4. **ANDROID_KEY_PASSWORD**
   - Value: The key password (from Step 1)

## Step 4: Create Release Tags

To create a release, push a version tag:

```bash
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin v1.2.0
```

Or use GitHub's web interface:
1. Go to Releases
2. Click "Create a new release"
3. Tag version: `v1.2.0`
4. Release title: `BudgetGuard v1.2.0`
5. Click "Publish release"

The workflow will automatically:
- ✅ Build the APK
- ✅ Sign it with your keystore
- ✅ Upload to GitHub Releases
- ✅ Create release notes

## Step 5: Version Management

The release workflow automatically updates the version in your build.gradle. Make sure `android/app/build.gradle` has:

```gradle
defaultConfig {
    ...
    versionName "1.0"
    ...
}
```

The workflow will replace this with the tag version (e.g., `1.2.0`).

## Manual Workflow Dispatch

You can also trigger a release manually without a tag:

1. Go to Actions → Release Android APK
2. Click "Run workflow"
3. Enter version number (e.g., `1.2.0`)

## Troubleshooting

### APK signing fails
- Verify all 4 secrets are set correctly
- Check that the keystore Base64 was copied completely
- Ensure the alias, keystore password, and key password match

### Version not updated in build.gradle
- Verify the sed command syntax for your environment
- Check that `android/app/build.gradle` uses the expected format

### Release notes not generated
- Ensure commits have conventional commit messages (feat:, fix:, etc.)
- GitHub generates notes from these automatically

## Best Practices

1. **Update version before tagging**
   - Update version in `package.json` and create a commit
   - Then tag that commit

2. **Use semantic versioning**
   - v1.0.0 = Major.Minor.Patch
   - v1.2.0 (new feature)
   - v1.2.1 (bug fix)

3. **Keep keystore secure**
   - Never commit the .jks file to git
   - Use `.gitignore` to exclude it
   - Only GitHub Actions can access it via secrets

4. **Test builds first**
   - The debug build workflow runs on every push to main
   - Review test APK before creating a release tag

## Release Checklist

- [ ] All tests passing
- [ ] Version updated in package.json
- [ ] CHANGELOG updated
- [ ] Commit pushed to main
- [ ] Create and push version tag
- [ ] GitHub Release created automatically
- [ ] Download and test signed APK
