# FRONTEND COMMANDS :-

> Current home: `docs/operations/COMMANDS.md`
>
> Purpose: quick command reference for builds, local cleanup, verification, and common operational tasks.

## Build APK for Android testers
```
eas build --platform android --profile preview
eas build --platform android --profile preview --clear-cache
```

## For iOS testers
```
eas build --platform ios --profile preview
eas build --platform ios --profile preview --clear-cache
```

## Remove on Windows PowerShell:
```
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm cache clean --force
npm install
```

### Remove On linux / Ububtu 
```
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

## Verify / Check dependency by Expo 
```
npx expo-doctor
npm ls expo
```

## NPM Audit & Fix 
```
npm audit
npm audit fix
npm audit fix --force
```

## Check / Install /Un Install TypeScript Version 
```
npx tsc --version
npm uninstall tsc
npm install -D typescript
npx expo install typescript
```

## Restart VS Code TypeScript server:
```
Ctrl + Shift + P
→ TypeScript: Restart TS Server
```


# BACKEND COMMANDS :-

## SSH into EC2 / Server
```
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@YOUR_ELASTIC_IP
```

## Update server
```
sudo apt update && sudo apt upgrade -y
```

## Install required packages:
```
sudo apt install -y nginx git curl unzip build-essential
```

## Install Node.js LTS:
```
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

## Install PM2:
```
sudo npm install -g pm2
```

## Clone your API project
```
cd /var/www
sudo mkdir matchmate-api
sudo chown -R ubuntu:ubuntu matchmate-api
cd matchmate-api
git clone YOUR_GITHUB_REPO_URL .
```

## Upload files using SCP
```
scp -i your-key.pem -r dist ubuntu@YOUR_ELASTIC_IP:/var/www/matrimonial-api/
scp -i your-key.pem package.json ubuntu@YOUR_ELASTIC_IP:/var/www/matrimonial-api/
scp -i your-key.pem package-lock.json ubuntu@YOUR_ELASTIC_IP:/var/www/matrimonial-api/
scp -i your-key.pem ecosystem.config.js ubuntu@YOUR_ELASTIC_IP:/var/www/matrimonial-api/
```

## Install and build:
```
npm install
npm run build
```

## Run MongoDB migrations before restarting production

Run migrations once per release after the build succeeds. The migration runner
uses a database lease lock, so concurrent deployment attempts cannot apply the
same migration twice.

```bash
# Development/staging source command
npm run migration:status
npm run migration:up

# Production compiled command
npm run migration:status:prod
npm run migration:up:prod

# Build and migrate in one release preparation command
npm run deploy:prepare
```

Do not add migration execution to every PM2 application start. Run it as a
single release step before restarting or replacing API instances.

## Run API with PM2
```
pm2 start dist/main.js --name matchmate-api
pm2 save
pm2 startup
pm2 status
pm2 logs matchmate-api
```

## Restart PM2
```
cd /var/www/matrimonial-api
pm2 restart matrimonial-api
```







## Android Debug Log Commands (Windows PowerShell)

### Basic Commands
```powershell
# Check device connected
adb devices

# Clear logs
adb logcat -c

# All logs live
adb logcat

# Save logs to desktop
adb logcat -d | Out-File "$env:USERPROFILE\Desktop\log.txt"
```

---

### Filter by Severity
```powershell
# Errors only
adb logcat *:E

# Warnings and above
adb logcat *:W

# Info and above
adb logcat *:I
```

---

### Filter for React Native
```powershell
# All RN related
adb logcat | Select-String -Pattern "ReactNative|ReactNativeJS|ReactHost"

# JS errors only
adb logcat | Select-String -Pattern "ReactNativeJS"

# Fatal crashes only
adb logcat | Select-String -Pattern "FATAL|AndroidRuntime"

# Your app only
adb logcat | Select-String -Pattern "com.anilkapoor.matchmatemobileapp"

# Expo updates
adb logcat | Select-String -Pattern "dev.expo.updates"

# Combined most useful
adb logcat | Select-String -Pattern "ReactNativeJS|FATAL|Exception|dev.expo"
```

---

### Filter by Tag
```powershell
# Single tag
adb logcat -s ReactNativeJS

# Multiple tags
adb logcat -s ReactNativeJS:V AndroidRuntime:V

# Your app package tag
adb logcat -s com.anilkapoor.matchmatemobileapp
```

---

### Capture on App Launch (Most Useful)
```powershell
# Step 1 — clear
adb logcat -c

# Step 2 — start capture, open app on phone, wait 15 sec, then Ctrl+C
adb logcat | Select-String -Pattern "ReactNative|FATAL|Error|Exception|dev.expo"

# Step 3 — OR save everything during launch to file
adb logcat -d | Out-File "$env:USERPROFILE\Desktop\launch_log.txt"
```

---

### Useful One-Liners
```powershell
# Show only your app's process logs
adb shell "logcat --pid=$(adb shell pidof com.anilkapoor.matchmatemobileapp)"

# Show logs with timestamps
adb logcat -v time | Select-String -Pattern "ReactNative|FATAL"

# Show last 500 lines only
adb logcat -t 500

# Show logs for specific time period
adb logcat -v time -d | Select-String -Pattern "ReactNative"
```

---

### Quick Reference Table

| Command | Use |
|---------|-----|
| `adb devices` | Verify device connected |
| `adb logcat -c` | Clear old logs |
| `adb logcat *:E` | Errors only |
| `adb logcat -s ReactNativeJS` | JS logs only |
| `adb logcat -t 500` | Last 500 lines |
| `adb logcat -d` | Dump and exit |
| `adb logcat -v time` | Add timestamps |

**Best workflow:** always run `adb logcat -c` first, open app, then filter with `Select-String`.
