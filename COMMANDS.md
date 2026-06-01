# FRONTEND COMMANDS :-

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