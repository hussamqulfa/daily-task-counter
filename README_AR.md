# Daily Task Counter — Android و iPhone

التطبيق يسجل لكل تاريخ:
- Retrieval
- Change battery
- Move
- Service

لكل مهمة عداد مستقل وسعر وحدة مستقل ومجموع مالي مستقل (العدد × السعر). يعرض ملخص اليوم وإجمالي عدد المهام وإجمالي قيمتها، ويحفظ البيانات محليًا على الجهاز.

## بناء التطبيق
يتطلب كمبيوترًا واتصالًا بالإنترنت وحساب Expo.
1. فك ضغط المشروع.
2. ثبّت Node.js.
3. افتح الطرفية داخل المجلد وشغّل:
   npm install
   npx eas-cli@latest login
   npx eas-cli@latest build:configure
4. لبناء Android APK للتثبيت المباشر:
   npx eas-cli@latest build --platform android --profile preview
5. لبناء iOS:
   npx eas-cli@latest build --platform ios
   يتطلب توزيع iPhone إعدادات Apple المناسبة؛ قد تحتاج عضوية Apple Developer للتوزيع على أجهزة فعلية أو المتجر.

يمكن تشغيل نسخة تجريبية أولًا بالأمر: npx expo start
