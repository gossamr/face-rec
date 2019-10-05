# Face Recognition Demo using React Native/Expo and Python/Flask

A simple demo of one-shot learning for face recognition in a cross-platform mobile app.

## Setup

### Server

Follow [these instructions](https://gist.github.com/ageitgey/629d75c1baac34dfa5ca2a1928a7aeaf) for installing [dlib](https://github.com/davisking/dlib) and [face_recognition](https://github.com/ageitgey/face_recognition#installation) in the ``server`` folder. You will also need ``numpy`` and ``flask``.

Once installed, perform the following from the project root to run the server in a terminal window:

```
cd server
export FLASK_ENV=development
export FLASK_APP=server.py
flask run
```

### Expo

Follow the instructions [here](https://docs.expo.io/versions/latest/introduction/installation/) for installing Expo.

To test out the app in an Android emulator or iOS simulator, you'll need Android Studio and Xcode respectively. Follow the Expo guide as necessary.

Once installed, you can load the bundle in the Expo app. In another terminal window, from the project root:

```
# with yarn
yarn install
yarn start

# or with npm
npm install
npm start
```

Then press 'a' to run the app in an Android emulator or 'i' for iOS simulator, or follow the prompts in Expo for other options.
