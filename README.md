<!-- Logo -->
<p align="center">
  <a href="https://github.com/Tivaiice/FinalProject_AppWakekyWay">
    <img height="128" width="128" src="https://user-images.githubusercontent.com/32460672/114381172-075f3d00-9bb5-11eb-87ac-fb89b320e6b6.png">
  </a>
</p>

<!-- Name -->
<p>
  <h1 align="center">APP WAKEKYWAY</h1>
</p>

<p  align="center">
  <img alt="ReactNative" src="https://img.shields.io/badge/-React-45b8d8?style=flat-square&logo=react&logoColor=white" />
  <img alt="github" src="https://img.shields.io/badge/-Github_Actions-2088FF?style=flat-square&logo=github-actions&logoColor=white" />
  <img alt="Google Cloud Platform" src="https://img.shields.io/badge/-Google_Cloud_Platform-1a73e8?style=flat-square&logo=google-cloud&logoColor=white" />
  <img alt="Styled Components" src="https://img.shields.io/badge/-Styled_Components-db7092?style=flat-square&logo=styled-components&logoColor=white" />
  <img alt="git" src="https://img.shields.io/badge/-Git-F05032?style=flat-square&logo=git&logoColor=white" />
  <img alt="npm" src="https://img.shields.io/badge/-NPM-CB3837?style=flat-square&logo=npm&logoColor=white" />
</p>

<h1>📱 Features 📕</h1>
<li>Login in Google 📲</li>
<li>ListMenu Notification 📍📋</li>
<li>Chat 🗣💬</li>
<li>Notification 📢🔔</li>
<li>Profile 👨🏻‍💻</li>
<li>Add/Delete Friend 👥</li>
<li>History ListMenu Notification 📍💾</li>

<h2>🕐  Login Google 📲 </h2>

  <p align="center">
    <img src="https://media.giphy.com/media/H4RcazAokvAYfmmisB/giphy.gif"/>
  </p>

<h2>🕑  ListMenu Notification 📍📋</h2>

  <li>Menu Notification</li>

- แชร์ข้อมูลสถานที่ให้กับเพื่อนได้
<p align="center">
  <img src="https://media.giphy.com/media/UTh4HR9M0q8yyvhLjk/giphy.gif"/>
</p>

<h2>🕒  Notification 📢🔔</h2>

  <li>Notification แบ่งออกเป็น 2 แบบ</li>

- ผู้ใช้แบบเดี่ยว

  <p align="center">
    <img src="https://media.giphy.com/media/iNPQMlFLIs3JXzcYqD/giphy.gif"/>
  </p>
  <p>

  - ผู้ใช้แบบกลุ่ม

  > แจ้งเตือนผู้ใช้งาน เมื่อถึงเวลาออกเดินทาง

  <p align="center">
    <img src="https://media.giphy.com/media/w3nei8ogdyx4kUzVno/giphy.gif"/>
  </p>

  > แจ้งเตือนผู้ใช้งาน เมื่อใกล้ถึงที่หมาย

  <p align="center">
    <img src="https://media.giphy.com/media/mMLLjSPHQRzuvZcwJ0/giphy.gif"/>
  </p>
  </p>

<h2>🕓  Chat 🗣💬</h2>

  <li>Menu Chat</li>

- แชทแบบเดี่ยว
 <p align="center">
  <img src="https://media.giphy.com/media/HnCnOPXdkrDxDloFFZ/giphy.gif"/>
</p>

- แชทแบบกลุ่ม
<p align="center">
  <img src="https://media.giphy.com/media/A56OG4QmtiGb8PWnzM/giphy.gif"/>
</p>

<h2>🕔  Profile 👨🏻‍💻</h2>

  <li>Menu Profile</li>
<img align="center" width="100" heigh="200" src= ![Profile](https://user-images.githubusercontent.com/32460672/114537099-fe856e80-9c7b-11eb-95f9-9c07eb8f9a68.jpg)>

</p>
<h2>🕕  History ListMenu Notification 📍💾</h2>

  <li>Menu History List Notification </li>
  <p align="center">
    <img src="https://media.giphy.com/media/uPYpzx0UYDcg2p1Ww2/giphy.gif"/>
  </p>

<h2>🔧 Config in code</h2>
<li>Config Key Google Map APIs 📂 config.js</li>

```javascript
export const GMAP_KEY = "XXXXXXXXXXENJOYCODINGXXXXXXXXX";
```

<li>Config Key Google Login 📂 src/containers/LoginContainer</li>

```javascript
const result = await Google.logInAsync({
  androidClientId: "XXXXXXXXXXENJOYCODINGXXXXXXXXX",
  iosClientId: "XXXXXXXXXXENJOYCODINGXXXXXXXXX",
  scopes: ["profile", "email"],
});
```

<li>Config Firebase 📂 src/boot/setup  </li>

```javascript
const firebaseConfig = {
  apiKey: "XXXXXXXXXXENJOYCODINGXXXXXXXXX",
  authDomain: "XXXXXXXXXXENJOYCODINGXXXXXXXXX",
  databaseURL: "XXXXXXXXXXENJOYCODINGXXXXXXXXX",
  projectId: "XXXXXXXXXXENJOYCODINGXXXXXXXXX",
  storageBucket: "XXXXXXXXXXENJOYCODINGXXXXXXXXX",
  messagingSenderId: "XXXXXXXXXXENJOYCODINGXXXXXXXXX",
  appId: "XXXXXXXXXXENJOYCODINGXXXXXXXXX",
  measurementId: "XXXXXXXXXXENJOYCODINGXXXXXXXXX",
};
```

<h2>🚀 Some Tools I Use</h2>
<p align="left">
  <a href="https://reactnative.dev/" target="_blank"> <img src="https://reactnative.dev/img/header_logo.svg" alt="reactnative" width="35" height="35"/> </a>
  <a href="https://firebase.google.com/" target="_blank"> <img src="https://www.vectorlogo.zone/logos/firebase/firebase-icon.svg" alt="firebase" width="35" height="35"/> </a>
  <a href="https://cloud.google.com/" target="_blank"> <img src="https://www.vectorlogo.zone/logos/google_cloud/google_cloud-icon.svg" alt="gcp" width="35" height="35" /> </a>
  <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg" alt="javascript" width="35" height="35"/> </a>
  <a href="https://git-scm.com/" target="_blank"> <img src="https://www.vectorlogo.zone/logos/git-scm/git-scm-icon.svg" alt="git" width="35" height="35"/> </a>
</p>
