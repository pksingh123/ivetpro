export const sendNotification = ({ regIds, title, body, data }) => {
  const FIREBASE_API_KEY =
    "AAAAsryhzok:APA91bGzHWaeo9z2Le4FQ1HbDv7m67fE3yFIQhG93mu-Zxr1EIFtP7SLDSAl7fBqUwpYvWxxhAdkgcO6kmu_fug-5ATIIOxXYDDAEf1FwgFErtcmFoO3AKxSDHsWiuyqyJ9QhHR-VbRy";
  const message = {
    registration_ids: regIds,
    notification: {
      title,
      body,
      vibrate: 1,
      sound: 1,
      badge: 1,
      show_in_foreground: false,
      priority: "high",
      content_available: true,
      icon:
        "https://videowithmyvet.com/wp-content/uploads/2020/01/2d2bdfe4e2397c1d02e0c13646558c38-32x32.png",
    },
    data,
  };

  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `key=${FIREBASE_API_KEY}`,
    },
    body: JSON.stringify(message),
  };

  return fetch("https://fcm.googleapis.com/fcm/send", requestOptions)
    .then((response) => response.text())
    .then((data) => {
      return data;
    });
};
