/* Capacitor hook (package.json "capacitor:copy:after"): after `npx cap copy`
   / `npx cap sync` has copied www/ into the native project, remove the
   web-only developer tools (www/tools/: voice recorder that uses the
   microphone) from the app bundle. Capacitor has no exclude option for
   webDir. The pages also guard themselves in the app ("Hanya di web"),
   so this is a second layer. Only ever deletes <public>/tools. */
const fs = require("fs");
const path = require("path");

const root = process.env.CAPACITOR_ROOT_DIR || path.join(__dirname, "..");
const platform = process.env.CAPACITOR_PLATFORM_NAME || "ios";
const PUBLIC = {
  ios: "ios/App/App/public",
  android: "android/app/src/main/assets/public",
};
const rel = PUBLIC[platform];
if (!rel) process.exit(0);
const target = path.join(root, rel, "tools");
if (fs.existsSync(target)) {
  fs.rmSync(target, { recursive: true, force: true });
  console.log("[babymo] removed web-only tools from the " + platform + " bundle: " + path.relative(root, target));
}
