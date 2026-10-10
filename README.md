# Nova Striker
เกมยิงยานออฟไลน์ 50 ด่าน พร้อมยาน 4 แบบ อาวุธ 4 แบบ และระบบอัปเกรด

## Android
- Package: `com.sunantongsan.novastriker` (new listing, versionCode 1 / versionName 1.0.0)
- Android 8+, target/compile API 36, Java 17, Gradle 8.13.
- GitHub Actions builds a test APK on pushes to main.
- Release AAB requires repository secrets ANDROID_KEYSTORE_BASE64, ANDROID_KEYSTORE_PASSWORD, ANDROID_KEY_ALIAS, ANDROID_KEY_PASSWORD. Use the new Nova Striker upload key from the private signing backup for every update. Never commit keys/passwords.
- No ads SDK, account, network permission, analytics or purchases in this version. Progress is stored only on the device; uninstalling clears it.

## Play submission remaining
1. Create the new Nova Striker listing. The old com.aistudio.novastriker.rpg listing is being retired at the owner's request. Do not upload this bundle into that old listing.
2. Configure the upload key securely and build a signed release AAB.
3. Test installation, rotation/insets, background/resume, saving, upgrades and all boss types on physical Android devices.
4. Publish a public privacy policy with the developer support contact; provide its URL in Play and in the game before submission.
5. Provide genuine gameplay screenshots, 512px icon and 1024x500 feature graphic.
6. Complete content rating, target audience, ads (No for this version), app access (unrestricted), and Data safety based on the final binary.
7. Follow the account's required test track and apply for production access where required. Google decides approval.

## Draft store text
Name: Nova Striker
Short description: ฝ่ากองทัพอวกาศ 50 ด่าน อัปเกรดยานและอาวุธ ท้าทายบอส เล่นได้ออฟไลน์
Full description: ขับยานฝ่ากองทัพอวกาศใน Nova Striker เกมยิงยานแนวตั้งที่ควบคุมด้วยการลากนิ้วและยิงอัตโนมัติ พบกับ 50 ด่าน บอสทุก 5 ด่าน ยาน 4 แบบ อาวุธ 4 แบบ และไอเท็มเสริมพลัง เก็บเหรียญจากการเล่นเพื่ออัปเกรดยาน พักเกมได้ระหว่างภารกิจ เล่นออฟไลน์โดยไม่ต้องสมัครบัญชี ความคืบหน้าบันทึกอยู่ในเครื่อง

## Signing continuity
The initial signed APK and AAB were built locally using the new private upload key. The key/passwords are deliberately excluded from this repository. Preserve Nova-Striker-Signing-Backup.zip privately; it contains the PKCS12 keystore, credentials and public certificate. GitHub Actions signing secrets still need secure configuration before CI can sign release updates.
