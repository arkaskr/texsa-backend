const admin = require('firebase-admin');

let serviceAccount;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  } else {
    serviceAccount = require('./firebase-service-account.json');
  }

  if (serviceAccount && !admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin initialized successfully');
  }
} catch (error) {
  console.error('Firebase Admin initialization error (Non-Fatal):', error.message);
  console.log('Ensure FIREBASE_SERVICE_ACCOUNT_JSON is set in Vercel settings if you want push notifications.');
}

const sendPushNotification = async (fcmToken, title, body, data = {}) => {
  if (!fcmToken) return false;
  
  const message = {
    notification: {
      title: title,
      body: body,
    },
    data: data,
    token: fcmToken,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent push notification:', response);
    return true;
  } catch (error) {
    if (error.code === 'messaging/registration-token-not-registered' || 
        error.code === 'messaging/invalid-argument') {
      console.error('FCM Token is dead or invalid. Consider wiping it from db.');
    } else {
      console.error('Error sending push notification:', error);
    }
    return false;
  }
};

module.exports = {
  admin,
  sendPushNotification
};
