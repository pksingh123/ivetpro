import React, { Component } from 'react';
import {
  ActivityIndicator,
  AsyncStorage,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  BackHandler,
  Alert,
  SafeAreaView,
  Button,
  ScrollView,
  FlatList,
  RefreshControl,
  Dimensions,
  Platform,
  Image,
  ImageBackground,
  StatusBar,
  Linking,
} from 'react-native';

import { Icon, ListItem, Avatar, Divider, SearchBar } from 'react-native-elements';
import Icons from 'react-native-vector-icons/FontAwesome';
import { DrawerActions } from 'react-navigation-drawer';
import SwitchToggle from 'react-native-switch-toggle';
import firebase from 'react-native-firebase';

import Dialog, { DialogTitle, DialogFooter, DialogButton, DialogContent } from 'react-native-popup-dialog';
import PracticeBarLogo from './PracticeBarLogo';
import Carousel from 'react-native-snap-carousel';
import DeviceInfo from 'react-native-device-info';
import { getAppstoreAppMetadata } from "react-native-appstore-version-checker";
import App from '../App'
import { EventRegister } from 'react-native-event-listeners'

const DEVICE_WIDTH = Dimensions.get('window').width;

const IS_IOS = Platform.OS === 'ios';
const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');

function wp(percentage) {
  const value = (percentage * viewportWidth) / 100;
  return Math.round(value);
}

const slideHeight = viewportHeight * 0.36;
const slideWidth = wp(75);
const itemHorizontalMargin = wp(2);
const sliderWidth = viewportWidth;
const itemWidth = slideWidth + itemHorizontalMargin * 2;
const entryBorderRadius = 8;
this.arrayholder = [];
export default class HomeScreen extends Component {

  static navigationOptions = ({ navigation }) => {

    navOptions = navigation;
    const { params = {} } = navigation.state;
    return {
      headerTitle: 'Home - Pet Profiles',
      headerLeft: <PracticeBarLogo />,
      headerTintColor: '#ffffff',
      headerStyle: {
        backgroundColor: '#26cccc',
        color: '#fff',
        height: 80
      },
      headerTitleStyle: {
        flex: 1,
        textAlign: 'center',
        marginTop: StatusBar.currentHeight
      },
      headerLeftContainerStyle: {
        marginTop: StatusBar.currentHeight
      },
      headerRightContainerStyle: {
        marginTop: StatusBar.currentHeight
      },
      headerRight: (
        <Icon
          name="menu"
          size={50}
          color='#fff'
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        />
      ),
    };
  }
  //###################################################################//
  async createNotificationListeners() {
    /* firebase.notifications().onNotification(notification => {
       console.log(notification);
         notification.android.setChannelId('insider').setSound('default')
         firebase.notifications().displayNotification(notification)
         this.onPressNotificacion(notification)
        
     });*/
    /*
  * Triggered when a particular notification has been received in foreground
  * */
    this.notificationListener = firebase.notifications().onNotification((notification) => {
      console.log("data only 1 ", notification);
      const { title, body } = notification;
      if (notification._data.type === 'calling') {
        this.showAlert(title, body, notification);
      }
      if (notification._data.type === 'logout') {
        EventRegister.emit('appExpire', "");
      }

    });


    /*
    * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
    * */
    this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
      // const { title, body } = notificationOpen.notification._data.message;
      console.log("data only 2 ", notificationOpen);
      if (notificationOpen.notification._data.type === 'logout') {
        EventRegister.emit('appExpire', "");
      }
      if (notificationOpen.notification._data.type === 'calling') {
        this.showAlert(notificationOpen.notification._data.title, notificationOpen.notification._data.body, notificationOpen.notification);
      }

    });

    /*
    * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
    * */
    const notificationOpen = await firebase.notifications().getInitialNotification();
    if (notificationOpen) {

      const { title, body } = notificationOpen.notification;
      this.showAlert(title, body, notificationOpen.notification);
    }
    /*
    * Triggered for data only payload in foreground
    * */
    this.messageListener = firebase.messaging().onMessage((message) => {
      //process data message
      console.log("data only 3 ", JSON.stringify(message));
    });


  }


  showAlert(title, body, notification) {
    console.log("notification", notification);
    this.props.navigation.navigate('IncominCall', {
      data: notification, dialername: notification._data.dialer, onPick: (data) => {

        this._consultation(notification)

      }
    });
    // this.props.navigation.navigate('routeConfrence', {notification});
    // Alert.alert(
    //   title, body,
    //   [
    //     { text: 'Accept', onPress: () => this._consultation(notification) },
    //     { text: 'Cancel', onPress: () => console.log('Cancel') },
    //   ],
    //   { cancelable: false },
    // );
  }
  _consultation = (item) => {

    this.props.navigation.navigate('routeConfrence', { item });
  }

  //########################################################//
  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.exitFromApp);
  }
  setAppLogoutData = async () => {

    EventRegister.emit('appExpire', "");
  }

  exitFromApp = () => {

    // Put your own code here, which you want to exexute on back button press.
    Alert.alert(
      ' Exit From App ',
      ' Do you want to exit From App ?',
      [
        { text: 'Yes', onPress: () => BackHandler.exitApp() },
        { text: 'No', onPress: () => console.log('NO Pressed') }
      ],
      { cancelable: false },
    );
    // Return true to enable back button over ride.
    return true;
  }
  onHeaderEventControl() {
    const { params = {} } = navOptions.state;
    params._openNav()
  }
  componentDidMount() {
    firebase.crashlytics().enableCrashlyticsCollection();

    this.props.navigation.setParams({
      _onHeaderEventControl: this.onHeaderEventControl,
      _openNav: () => this.openDrawer()
    })
    this.createNotificationListeners();
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      this.onFocusFunction()
    })

    getAppstoreAppMetadata("com.videowithmyvet") //put any apps packageId here
      .then(metadata => {
        console.log(
          "clashofclans android app version on playstore",
          metadata.version,
          "published on",
          metadata.currentVersionReleaseDate
        );
        // alert("version " + metadata.version);

        let local = DeviceInfo.getVersion();

        let appStoreVersion = metadata.version;
        // let local = "302.110.102";
        let lastdot = local.lastIndexOf(".");
        let firstdot = local.indexOf(".");
        let cFirst = local.substring(0, firstdot);
        let cMiddle = local.substring(firstdot + 1, lastdot);
        let cLast = local.substring(lastdot + 1, local.length);

        let lastdotx = appStoreVersion.lastIndexOf(".");
        let firstdotx = appStoreVersion.indexOf(".");
        let aFirst = appStoreVersion.substring(0, firstdotx);
        let aMiddle = appStoreVersion.substring(firstdotx + 1, lastdotx);
        let aLast = appStoreVersion.substring(lastdotx + 1, appStoreVersion.length);
        //console.log("current app version ", local, appStoreVersion, cFirst, cMiddle, cLast, aFirst, aMiddle, aLast);
        if (Number(aFirst) > Number(cFirst)) {
          // show alert to donwload;
          this.showAlertToUpdateApp();
          return;
        }
        if (Number(aMiddle) > Number(cMiddle)) {
          // show alert to donwload;
          this.showAlertToUpdateApp();
          return;
        }
        if (Number(aLast) > Number(cLast)) {
          // show alert to donwload;
          this.showAlertToUpdateApp();
          return;
        }

      })
      .catch(err => {
        console.log("error occurred", err);
      });
  }
  constructor(props) {
    super(props);
    this.state = {
      GridViewItems: [],
      GridViewItemsDeceased: [],
      PetDetails: [],
      isLoading: true,
      uid: '',
      visible: false,
      title: '',
      img_url: '',
      lbl_name: 'Name:',
      lbl_species: 'Species:',
      lbl_breed: 'Breed:',
      lbl_sex: 'Sex:',
      lbl_dob: 'Date Of birth:',
      name: '',
      species: '',
      breed: '',
      sex: '',
      dob: '',
      showDeceasedPets: false,
      countDeceasedPets: 0,
      buttonText: 'Show Deceased Pet',
      refreshing: false,
      practice_name: '',
      practice_alias_name: '',
      practice_address: '',
      prevent_phone_app_calling_agent: 1, // if 1 hide video consult 
    }
    this.signOutAsync;
    this.exitFromApp = this.exitFromApp.bind(this);
    this._petEdit = this._petEdit.bind(this);
  }
  onFocusFunction = async () => {
    // do some stuff on every screen focus
    //alert('Home');
    this.setHomeScreenData();
    let savedValues = await AsyncStorage.getItem('userToken');
    savedValues = JSON.parse(savedValues);
    this.id = savedValues.user.uid;
    new App().fetUserData(this.id);
    let isAppLoginExpire = await AsyncStorage.getItem('isLoginExpire')
    if (isAppLoginExpire == 'Yes') {
      EventRegister.emit('appExpire', "")
    }
  }
  showAlertToUpdateApp() {
    Alert.alert(
      'New Update',
      'A new update is available. Update now.',
      [
        { text: 'Ask me later', onPress: () => console.log('Ask me later pressed') },

        { text: 'OK', onPress: () => { console.log('OK Pressed'); this.openAppStore(); } },
      ],
      { cancelable: false },
    );
  }
  openAppStore = async () => {
    await Linking.openURL("market://details?id=com.videowithmyvet");
  }

  componentWillUnmount() {
    this.focusListener.remove()
  }
  async setHomeScreenData() {
    const userToken = await AsyncStorage.getItem('userToken');
    const temporary_passwrod = await AsyncStorage.getItem('temporary_passwrod');

    let savedValues = await AsyncStorage.getItem('userToken');
    savedValues = JSON.parse(savedValues);
    this.id = savedValues.user.uid;
    //console.log("fetUserData saved data", savedValues, this.id);
    new App().fetUserData(this.id);

    // this.id = savedValues.user.uid;

    this.appointment_booking = savedValues.user.practice.appointment_bookingin_app_allowed;
    let prevent_calling = savedValues.user.practice.prevent_phone_app_calling_agent;
    this.setState({ prevent_phone_app_calling_agent: prevent_calling })
    if (userToken) {
      userDetails = JSON.parse(userToken);
      if (temporary_passwrod == 1) {
        console.log(temporary_passwrod);
        //this.props.navigation.navigate('ChangePassword');
      }
      // console.warn(userDetails.user.practice.practice_logo_url);
      this.setState({
        uid: userDetails.user.uid,
        practice_name: userDetails.user.practice.name,
        practice_alias_name: userDetails.user.practice.alias_name,
        practice_address: userDetails.user.practice.address,
      });
    } else {
      this.setState({ uid: false })
    }
    if (this.state.uid) {
      const url = 'https://videowithmyvet.com/webservices/client-pet.php?action=alive&uid=' + this.state.uid;
      fetch(url)
        .then((response) => response.json())
        .then((responseJson) => {
          console.log(responseJson);
          if (responseJson.pets.length > 0) {
            this.setState({
              isLoading: false,
              refreshing: false
            })
            this.setState({
              GridViewItems: responseJson.pets,

            })
            console.log(responseJson.diedpets);
            this.arrayholder = responseJson.pets;
          } else {
            alert(responseJson.status);
          }
        })
        .catch((error) => {
          alert(error);
          console.warn(error);
          this.setState({ refreshing: false })
        })

    }
  }
  async componentWillMount() {
    this.props.navigation.setParams({ logout: this._signOutAsync });
    BackHandler.addEventListener('hardwareBackPress', this.exitFromApp);

    this.setHomeScreenData();


  }
  onPressToggle = () => {
    this.setState({ showDeceasedPets: !this.state.showDeceasedPets });
    if (this.state.showDeceasedPets) {
      this.setState({ buttonText: 'Show Deceased Pet' });
    } else {
      this.setState({ buttonText: 'Hide Deceased Pet' });
    }
  };

  getButtonText() {
    return this.state.showDeceasedPets ? 'Hide Deceased Pet' : 'Show Deceased Pet';
  }
  getRightText() {
    return this.state.showDeceasedPets ? '' : 'Hide Deceased Pet';
  }
  getLeftText() {
    return this.state.showDeceasedPets ? 'Show Deceased Pet' : '';
  }
  checkref() {
    this.setState({ refreshing: true })
    this.componentWillMount()
  }
  _renderItem = ({ item, index }) => {
    return (
      <ScrollView refreshControl={
        <RefreshControl
          refreshing={this.state.refreshing}
          onRefresh={() => this.checkref()}
          title="Loading..."
        />
      }>
        <View style={styles.slide}>
          <StatusBar translucent backgroundColor="transparent" />
          <View style={styles.slideInnerContainer}>
            <ImageBackground style={styles.imgStyle} source={{ uri: item.img_url }} >
              <View style={{
                flex: 1,
                marginTop: StatusBar.currentHeight,
                flexDirection: 'row',
                justifyContent: 'space-between'
              }}>
                {/* <PracticeBarLogo />
                <Text style={{ color: '#fff', fontSize: 17, marginTop: 15, fontWeight: 'bold' }}>Home - Pet Profiles</Text>
                <Icon
                  name="menu"
                  size={50}
                  color="#ffffff"
                  onPress={() => this.props.navigation.dispatch(DrawerActions.toggleDrawer())}
                /> */}
              </View>
              <View style={{
                flex: 1,
                flexDirection: 'row',
                paddingHorizontal: 10,
                marginTop: 20,
                justifyContent: 'space-between'
              }}>
                <Image
                  style={styles.logoStyle}
                  source={require('./images/arrow.png')}
                  resizeMethod="auto"
                />
                <Image
                  style={styles.logoStyleRight}
                  source={require('./images/arrow-right.png')}
                  resizeMethod="auto"
                />
              </View>

              <View style={styles.bgDetails}>
                <Text style={styles.bgNameStyle}>{item.name}</Text>
                {/*<Text style={styles.bgTextStyle}>{item.speciesName}</Text>
                <Text style={styles.bgTextStyle}>{item.breed}</Text>*/}

                <Text style={styles.bgTextStyle}>{item.sex}</Text>
                <Text style={styles.bgTextStyle}>{item.CurrentWeight}kg</Text>
                <View style={{
                  flex: 1,
                  paddingBottom: 10,
                  flexDirection: 'row',
                  justifyContent: 'space-between'
                }}>
                  <Text style={styles.bgTextStyle}>DOB: {item.dob}</Text>

                </View>

              </View>



            </ImageBackground>

            <View style={styles.container}>
              <View style={styles.blockStyle}>
                {/*<Text
                    style={styles.links}
                    onPress={() => this._petEdit(item)}>Edit Pet Details</Text>*/}
                <View style={styles.editbuttoncontainer}>
                  <TouchableOpacity onPress={() => this._petEdit(item)} style={styles.button}>
                    <Text style={styles.textcolor}>Edit Pet Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.blockStyle}>
                <Text style={styles.headingstyle}>Upcoming Appointments</Text>
                {item.isUpcomingApp ?
                  <View style={styles.itemsContentStyle}>
                    <Text style={styles.itemHeadingStyle}>Video consultation appointment.</Text>
                    <Text style={styles.itemStyle}>{item.nextAppointment.date} at {item.nextAppointment.time}</Text>
                    <Text style={styles.itemStyle}>{this.state.practice_name}</Text>
                    {item.nextAppointment.paid == 1 && this.state.prevent_phone_app_calling_agent == 0 ?
                      <View style={styles.buttoncontainer}>
                        <TouchableOpacity onPress={() => this._videoConsultation(item.nextAppointment)} style={styles.button}>
                          <Text style={styles.textcolor}>Video Consultation </Text>
                        </TouchableOpacity>
                      </View>
                      : null

                    }

                  </View>
                  :
                  <View style={styles.itemsContentStyle}>
                    <Text style={styles.itemStyle}>{item.nextAppointment}</Text>
                  </View>
                }
              </View>
              {
                item.status == 1 && this.appointment_booking == 1 ?
                  <View style={styles.buttoncontainer}>
                    <TouchableOpacity onPress={() => this._bookAppointment(item)} style={styles.button}>
                      <Text style={styles.textcolor}>Book an appointment</Text>
                    </TouchableOpacity>
                  </View>
                  : null
              }
              <View style={styles.blockStyle}>
                <View style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'space-between'
                }}>
                  <Text style={styles.headingstyle}>Past Appointments</Text>
                  <TouchableOpacity onPress={() => this._PastAppointments(item)}>
                    <Text style={styles.seeAllStyle}>See all</Text>
                  </TouchableOpacity>
                </View>
                {
                  item.pastAppointment && item.pastAppointment.length ?
                    this.pastAppointment(item)
                    :
                    <View style={styles.itemsContentStyle}>
                      <Text style={styles.itemStyle}>No past appointment.</Text>
                    </View>
                }
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }
  _petEdit = (item) => {
    // alert();
    this.props.navigation.navigate('routePetEdit', { item });
  }
  _bookAppointment = (item) => {
    console.warn(item)
    this.props.navigation.navigate('routeBookAppointment', { item });
  }
  _videoConsultation = (item) => {

    this.props.navigation.navigate('routeConfrence', { item });
  }
  _FutureAppointments = (item) => {
    console.log(item);
    this.props.navigation.navigate('routeFutureAppointment', { item });
  }
  _PastAppointments = (item) => {
    this.props.navigation.navigate('routePastAppointment', { item });
  }

  render() {
    //ItemSeparatorComponent={this.renderSeparator}
    if (this.state.isLoading) {
      return (
        <View style={{ flex: 1, padding: 20 }}>
          <ActivityIndicator
            color='#2ba9bc'
            size="large"
            style={styles.activityIndicator} />
        </View>
      )
    }
    return (
      //<SafeAreaView style={styles.container}>
      <Carousel
        ref={(c) => { this._carousel = c; }}
        data={this.state.GridViewItems}
        renderItem={this._renderItem}
        //sliderWidth={sliderWidth}
        //itemWidth={itemWidth}
        sliderWidth={viewportWidth}
        itemWidth={viewportWidth}
        slideStyle={{ width: viewportWidth }}
        inactiveSlideOpacity={1}
        inactiveSlideScale={1}
      />

      //</SafeAreaView>
    );
  }

  pastAppointment = (item) => {
    return item.pastAppointment.map((data) => {
      // console.log(data.practice.name);
      return (
        <View style={styles.itemsContentStyle}>
          <Text style={styles.itemHeadingStyle}>Video consultation appointment.</Text>
          <Text style={styles.itemStyle}>{data.date} at {data.time}</Text>
          {
            <Text style={styles.itemStyle}>{this.state.practice_name}</Text>
          }
        </View>
      )
    })
  }
  _showMoreApp = () => {
    this.props.navigation.navigate('Other');
  };
  _petDettsils = (item) => {
    this.props.navigation.navigate('routePetDetails', { item });
  }
  _signOutAsync = async () => {
    await AsyncStorage.clear();
    this.props.navigation.navigate('Auth');
  };

}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 60,
    marginTop: 40,
    marginBottom: 40,
  },
  bgDetails: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 60,
    paddingTop: 60
  },
  bgNameStyle: {
    color: '#ffffff',
    fontSize: 30,
    paddingTop: 10,
    fontWeight: 'bold'
  },
  bgTextStyle: {
    color: '#ffffff',
    fontSize: 20,
    marginTop: 1,
    marginBottom: 1
  },
  seeAllStyle: {
    color: '#666',
  },
  imgStyle: {
    width: DEVICE_WIDTH,
    //height: 220
  },
  activityIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 80
  },
  logoStyle: {
    width: '20%',
    width: 25,
    height: 25,
  },
  logoStyleRight: {
    width: '20%',
    width: 25,
    height: 25,
  },
  logo: {
    width: 40,
  },
  slide: {
    flex: 1,
    marginTop: 0,
  },
  blockStyle: {
    marginBottom: 10,
  },
  headingstyle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
    color: '#26cccc'
  },
  itemsContentStyle: {
    paddingVertical: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,

    elevation: 5,
  },
  itemHeadingStyle: {
    color: '#666',
    fontWeight: "600",
    fontSize: 19,
  },
  itemStyle: {
    color: '#666',
    fontSize: 14,
    marginTop: 2
    //textDecorationLine: 'underline'
  },

  slideInnerContainer: {
    width: '100%',
    flex: 1,
    paddingHorizontal: 0
    // other styles for the inner container
  },
  avtarStyle: {
    flexDirection: "row",
    justifyContent: 'center',
    textAlign: "center"
  },

  details: {
    paddingVertical: 10
  },
  editbuttoncontainer: {
    flex: 1,
    textAlign: "center",

  },
  buttoncontainer: {
    flex: 1,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  linkContainer: {
    flex: 1,
    paddingBottom: 0,
    marginBottom: 0,
  },
  nextAppointment: {
    flex: 1,
  },
  links: {
    textAlign: 'center',
    color: '#26cccc',
    fontSize: 18,
    letterSpacing: 0.5,
    padding: 5,

  },

  appointmentDate: {

  },
  fixToText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 15,
    marginTop: 15,
    marginBottom: 15
  },

  avtarStyle: {
    flexDirection: "row",
    justifyContent: 'center',
    textAlign: "center"
  },
  button: {
    marginTop: 5,
    height: 80,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 40,
    backgroundColor: "#09B5B5",
    alignItems: 'center'
  },
  textcolor: {
    color: '#ffffff',
    fontSize: 20
  },

  shadow: {
    position: 'absolute',
    top: 0,
    left: itemHorizontalMargin,
    right: itemHorizontalMargin,
    bottom: 18,
    shadowColor: '#1a1917',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 10,
    borderRadius: entryBorderRadius
  },

  // image's border radius is buggy on iOS; let's hack it!
  radiusMask: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: entryBorderRadius,
    backgroundColor: 'white'
  },
  radiusMaskEven: {
    backgroundColor: '#1a1917',
  },
  textContainer: {
    justifyContent: 'center',
    paddingTop: 20 - entryBorderRadius,
    paddingBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderBottomLeftRadius: entryBorderRadius,
    borderBottomRightRadius: entryBorderRadius
  },

  title: {
    color: '#1a1917',
    fontSize: 18,
    letterSpacing: 0.5,
    //padding: 10,
    paddingBottom: 10
  },



});