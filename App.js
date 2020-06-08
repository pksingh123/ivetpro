import React, { Component } from 'react';
import {
  Platform, StyleSheet, View,
  AsyncStorage,
  Button,
  Icon,
  PermissionsAndroid,
  StatusBar,
  Alert,
} from 'react-native';
import Constant from './screens/Constants';
const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});



import Navigation from './navigation/Navigation';
import DrawerNav from './navigation/DrawerNav';
//import StatusBarColor from './screens/components/StatusBarColor';
import DeviceInfo from 'react-native-device-info';
import firebase from 'react-native-firebase';
import DrawerScreen from './navigation/DrawerScreen'
import { EventRegister } from 'react-native-event-listeners'
//import crashlytics from '@react-native-firebase/crashlytics';

export default class App extends React.Component {
  //class App extends React.Component {
  static navigationOptions = ({ navigation }) => {

    return {
      headerLeft: (
        <Button>
          <Icon
            name="menu"
            size={50}
            style={{ fontSize: 30, color: 'black' }}
          />
        </Button>
      ),
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      DeviceID: '',
      Token: '',
      uid: '',
      status: 0,
    }

  }
  getUniqueDeviceID = () => {
    var id = DeviceInfo.getUniqueId();
    this.setState({
      DeviceID: id
    })
  }

  async _requestPermissions() {
    //Checking for the permission just after component loaded
    async function requestCameraPermission() {
      //Calling the permission function
      const granted = await PermissionsAndroid.requestMultiple([PermissionsAndroid.PERMISSIONS.CAMERA, PermissionsAndroid.PERMISSIONS.RECORD_AUDIO]);
      console.log("permissions status: " + JSON.stringify(granted));
    }
    if (Platform.OS === 'android') {
      requestCameraPermission();
    } else {
      console.log('You can use the Camera');
    }
  }






  async getToken() {
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    console.log('fcm: ', fcmToken);
    this.setState({
      Token: fcmToken
    });
    if (!fcmToken) {
      fcmToken = await firebase.messaging().getToken();
      console.log(fcmToken);
      this.setState({
        Token: fcmToken
      });
      if (fcmToken) {
        // this._getToken();
        await AsyncStorage.setItem('fcmToken', fcmToken);
      }
    }
  }

  async checkPermission() {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
      this.getToken();
    } else {
      this.requestPermission();
    }
  }

  async requestPermission() {
    try {
      await firebase.messaging().requestPermission();
      this.getToken();
    } catch (error) {
      console.log('permission rejected');
    }
  }

  // async enableCrashlytics() {
  //   await crashlytics()
  //     .setCrashlyticsCollectionEnabled(true)
  //     .then(() => console.log("enabled crashlytics "));
  // }

  async componentDidMount() {
    firebase.crashlytics().enableCrashlyticsCollection();
    //  this.props.navigation.navigate;

    //console.log(Navigation.navigate());
    const userToken = await AsyncStorage.getItem('userToken');
    if (userToken) {
      userDetails = JSON.parse(userToken);
      // console.log(userDetails);
      this.setState({ uid: userDetails.user.uid, status: 1 });
    } else {
      this.setState({ uid: false })
    }
    const channel = new firebase.notifications.Android.Channel('insider', 'insider channel', firebase.notifications.Android.Importance.Max)
    firebase.notifications().android.createChannel(channel);
    this._requestPermissions();
    this.checkPermission();
    // this.createNotificationListeners();
    this.enableCrashlytics();
    crashlytics().crash();

    // let divide = 1/0;
    // console.log("reseult ", divide);
  }
  async componentWillMount() {
    let savedValues = await AsyncStorage.getItem('userToken');
    savedValues = JSON.parse(savedValues);
    this.id = savedValues.user.uid;
    //  console.log("app.js ");
    //  this.checkDeviceState();
  }

  checkDeviceState = () => {

    // console.log("app.js checkDeviceState");
    //this.loadingButton.showLoading(true);
    const url = Constant.rootUrl + 'webservices/check-user-logedin.php';
    fetch(url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          device_id: DeviceInfo.getUniqueId(),
          uid: this.id
        }),
      })
      .then((response) => response.json())
      .then((responseJson) => {
        //console.warn(responseJson.user.temporary_passwrod);
        //console.log("app.js checkDeviceState", responseJson);
        // alert("app.js checkDeviceState");
        if (responseJson.status == 200) {
          if (responseJson.active == 1) {//logout
            //  console.log("app.js checkDeviceState login");
          } else {
            //  console.log("app.js checkDeviceState logout");
            // this._signOut();
          }
        }

      })
      .catch((error) => {
        this.loadingButton.showLoading(false);
        alert('Something went wrong!');
        console.warn(error);
      })


  }

  fetUserData = (id) => {

    // console.log("app.js fetUserData", id);
    //this.loadingButton.showLoading(true);
    const url = Constant.rootUrl + 'webservices/check-app-booking-allowed.php';
    fetch(url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // device_id: DeviceInfo.getUniqueId(),
          uid: id
        }),
      })
      .then((response) => response.json())
      .then((responseJson) => {
        //console.warn(responseJson.user.temporary_passwrod);
        // console.log("app.js fetUserData", responseJson);
        // alert("app.js checkDeviceState");
        if (responseJson != null) {

          this.setData(responseJson);
        }



      })
      .catch((error) => {
        this.loadingButton.showLoading(false);
        alert('Something went wrong!');
        console.warn(error);
      })


  }


  setData = async (responseJson) => {

    let appointment_bookingin_app_allowed = responseJson.practice.appointment_bookingin_app_allowed;
    let allow_video_calls_without_appoinmtent = responseJson.practice.allow_video_calls_without_appoinmtent;
    let prevent_phone_app_calling_agent = responseJson.practice.prevent_phone_app_calling_agent;
    // console.log("fetUserData", prevent_phone_app_calling_agent)
    let userToken = await AsyncStorage.getItem('userToken');
    userToken = JSON.parse(userToken);
    //  console.log("fetUserData data 0", userToken);
    //userToken.user.practice['appointment_bookingin_app_allowed'] = '1';//appointment_bookingin_app_allowed;
    userToken.user.practice['appointment_bookingin_app_allowed'] = appointment_bookingin_app_allowed;
    userToken.user.practice['allow_video_calls_without_appoinmtent'] = allow_video_calls_without_appoinmtent;
    userToken.user.practice['prevent_phone_app_calling_agent'] = prevent_phone_app_calling_agent;
    EventRegister.emit('myCustomEvent', userToken.user.practice.appointment_bookingin_app_allowed)
    EventRegister.emit('VideoAppointmentData', userToken.user.practice.allow_video_calls_without_appoinmtent)
    // console.log("fetUserData data 1", userToken);
    let userData = JSON.stringify(userToken);
    await AsyncStorage.setItem('userToken', userData);


    let activeDeviceId = responseJson.device_id;
    let myDeviceId = DeviceInfo.getUniqueId();
    // console.log("device in app js ", activeDeviceId, myDeviceId);
    if (activeDeviceId != myDeviceId) {//if not equal then logout 
      await AsyncStorage.setItem('isLoginExpire', 'Yes');
      EventRegister.emit('appExpire', "")
    }

  };

  _getToken() {
    const url = Constant.rootUrl + 'webservices/get-token.php';
    fetch(url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'device_id': DeviceInfo.getUniqueId(),
          'token': this.state.Token,
          'uid': this.state.uid,
          'status': this.state.status
        }),
      })
      .then((response) => response.json())
      .then((responseJson) => {
        console.warn(responseJson);
      })
      .catch((error) => {
        alert('Something went wrong!');
        console.warn(error);
      })
  }
  render() {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#26cccc" />
        <Navigation />
      </View>
    )
  }
}

//export default withNavigation(App);
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ccc'
  },
  statusBar: {

  }
});