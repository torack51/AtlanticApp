import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  name: "AtlanticApp",
  slug: "AtlanticApp",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "myapp",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,

  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.evimt.evimt",
    googleServicesFile: "./GoogleService-Info.plist",
    entitlements: {
      "aps-environment": "production"
    },
    infoPlist: {
      UIBackgroundModes: ["remote-notification"]
    }
  },

  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    config: {
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY
      }
    },
    package: "com.evimt.evimt",
    googleServicesFile: "./google-services.json"
  },

  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png"
  },

  plugins: [
    "expo-router",
    "@react-native-firebase/app",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff"
      }
    ],
    [
      "expo-build-properties",
      {
        ios: {
          useFrameworks: "static"
        }
      }
    ]
  ],

  router: {
    lazyLoading: false
  },

  experiments: {
    typedRoutes: true
  },

  extra: {
    router: {
      origin: false
    },
    eas: {
      projectId: "b09fc55c-54fd-4fda-877c-d1681b72180e"
    },
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
  }
});