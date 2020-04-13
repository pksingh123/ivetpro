import React from 'react';
import { View, Text, StyleSheet, AsyncStorage, TouchableOpacity, Image, Platform } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import Icons from 'react-native-vector-icons/FontAwesome';
import { StackActions, DrawerActions } from 'react-navigation';
import DeviceInfo from 'react-native-device-info';
import App from '../App'
var booking_source = Platform.OS === 'android' ? 'Android' : 'IOS';
import { EventRegister } from 'react-native-event-listeners'
//var VideoConsultNow;
export default class DrawerScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Edit Pet'
    }
  };
  constructor(props) {
    super(props);
    this.state = {
      practice_id: '',
      Settings: [],
      uid: '',
      VideoConsultNow: false,
      uniqueValue: 1,
      videoConsultNowWithoutAppointment: 0,
      appointment_booking: 0

    }
  }


  refresh = async () => {
    // alert(this.state.uniqueValue);
    let savedValues = await AsyncStorage.getItem('userToken');
    savedValues = JSON.parse(savedValues);
    this.id = savedValues.user.uid;
    new App().fetUserData(this.id);
    this.setState({ state: this.state });
    this.forceUpdate();

    let appointmentValue = savedValues.user.practice.appointment_bookingin_app_allowed;
    this.setState({ appointment_booking: appointmentValue });
  }


  _updatefcm() {
    const url = 'https://videowithmyvet.com/webservices/update-token.php';
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        device_id: DeviceInfo.getUniqueId()
      }),
    })
      .then((response) => response.json())
      .then((responseJson) => {
        console.warn(responseJson);
        if (responseJson.status === 'ok') {
          console.log("logout");

        }
      })
      .catch((error) => {
        //alert('Something went wrong!');
        console.warn(error);
      })
  }

  getvideoCall(practice_id) {
    const url = 'https://videowithmyvet.com/webservices/video-consult-now.php?checkIsCall=1&practice_id=' + practice_id;
    fetch(url)
      .then((response) => response.json())
      .then((responseJson) => {
        console.warn(responseJson);
        if (responseJson.status === 'ok') {
          if (responseJson.call_allow == 1) {
            this.setState({ VideoConsultNow: true })
          } else {
            this.setState({ VideoConsultNow: false })
          }

        }
      })
      .catch((error) => {
        alert('Something went wrong!');
        console.warn(error);
      })
  }

  componentWillUnmount() {

    EventRegister.removeEventListener(this.listener)
    EventRegister.removeEventListener(this.listener2)
  }
  componentWillMount() {
    this.listener = EventRegister.addEventListener('myCustomEvent', (data) => {
      this.setState({
        appointment_booking: data,
      });
      //  alert("draw screen" + data);
      this.forceUpdate();
    })
    this.listener2 = EventRegister.addEventListener('VideoAppointmentData', (data) => {
      // alert("data" + data);
      this.setState({ videoConsultNowWithoutAppointment: data });
      this.forceUpdate();
    });
  }

  async componentDidMount() {
    this.props.navigation.setParams({ logout: this._signOutAsync });
    const userToken = await AsyncStorage.getItem('userToken');
    let savedValues = await AsyncStorage.getItem('userToken');
    savedValues = JSON.parse(savedValues);
    let appointmentValue = savedValues.user.practice.appointment_bookingin_app_allowed;
    this.setState({ appointment_booking: appointmentValue });
    let videoConsultNowWoutAppnt = savedValues.user.practice.allow_video_calls_without_appoinmtent
    this.setState({ videoConsultNowWithoutAppointment: videoConsultNowWoutAppnt })
    console.log("appointment", savedValues);

    //  alert("appontment");
    if (userToken) {
      userDetails = JSON.parse(userToken);
      // console.log(userDetails);
      this.setState({ uid: userDetails.user.uid, practice_id: userDetails.user.practice.practice_id });
    } else {
      this.setState({ uid: false })
    }
    //const url = 'https://videowithmyvet.com/webservices/practice-settings.php?practice_id=' + this.state.practice_id;
    this.getvideoCall(this.state.practice_id);

  }


  render() {
    const { navigate } = this.props.navigation;
    //console.warn(this.state.VideoConsultNow);
    return (
      <View style={styles.container}>
        <View style={{
          // paddingVertical: 10,
          paddingHorizontal: 20,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center"
        }}>
          <TouchableOpacity onPress={() => this.props.navigation.dispatch(DrawerActions.toggleDrawer())}>
            <Image
              style={styles.logoStyle}
              source={require('../screens/images/ios-back.jpg')}
              resizeMethod="auto"
            />
          </TouchableOpacity>
          {/* <Icon
            name='close'
            size={30}
            color='#ffffff'

            
          /> */}
          <Text style={styles.menuHeaderStyle} >Menu</Text>

        </View>

        <View style={styles.rowStyle}>
          <Text style={styles.pageName} onPress={() => navigate('Home')}>Home</Text>
          {
            this.state.appointment_booking == 1 ?
              <Text style={styles.pageName} onPress={() => navigate('Appointment')}>Book Appointment</Text> : null
          }

          <Text style={styles.pageName} onPress={() => navigate('AppointmentList')}>Appointment List</Text>
          <Text style={styles.pageName} onPress={() => navigate('AppointmentHistory')}>Completed Appointment </Text>
          <Text style={styles.pageName} onPress={() => navigate('AddPet')}>Add Pet </Text>
          {
            this.state.VideoConsultNow == true && this.state.videoConsultNowWithoutAppointment == 1 ?
              <Text style={styles.pageName} onPress={() => navigate('VideoConsultNow')}>
                Video Consult Now
              </Text>
              : null
          }
          <Text style={styles.pageName} onPress={() => navigate('EditProfile')}>Edit Profile </Text>

          <Text style={styles.pageName} onPress={this._signOut}>
            Logout
          </Text>
          {
            this.state.appointment_booking == 1 ?
              <View style={styles.buttoncontainer}>
                <TouchableOpacity onPress={() => navigate('Appointment')}
                  style={styles.button}>
                  <Text style={styles.textcolor}>Book Appointment</Text>
                </TouchableOpacity>
              </View>
              : null
          }


          {/* <Button
            title='Home'
            onPress={() => navigate('Home')}
            type="clear"
            buttonStyle={styles.ButtonStyle}
          />
          <Button
            title='Book Appointment'
            onPress={() => navigate('Appointment')}
            type="clear"
          />
          <Button
            title='Appointment List'
            onPress={() => navigate('AppointmentList')}
            type="clear"
          />
          <Button
            title='Completed Appointment'
            onPress={() => navigate('AppointmentHistory')}
            type="clear"
          />
          <Button
            title='Add Pet'
            onPress={() => navigate('AddPet')}
            type="clear"
          />
          {
            this.state.VideoConsultNow ?
              <Button
                title='Video Consult Now'
                onPress={() => navigate('VideoConsultNow')}
                type="clear"
              /> : null
          }
          <Button
            title='Edit Profile'
            onPress={() => navigate('EditProfile')}
            type="clear"
          />
         
          <Button
            title='Logout'
            onPress={() => {
              AsyncStorage.clear()
              navigate('Auth')
            }}
            type="clear"
          /> */}
        </View>
      </View>
    );
  }
  _signOut = async () => {

    this._updatefcm();

    await AsyncStorage.removeItem('userToken');
    //AsyncStorage.clear()
    this.props.navigation.navigate('Auth')
    //this.props.navigation.navigate('App');

    //this.props.navigation.navigate('AddFirstPet');

  };
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    //alignItems: 'flex-start',
    backgroundColor: '#26cccc'
  },
  iconRight: {
    alignItems: 'center',
  },
  rowStyle: {
    justifyContent: 'flex-end'
  },
  menuHeaderStyle: {
    paddingBottom: 10,
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    borderBottomColor: '#cccccc',
    width: '100%'
  },
  pageName: {
    padding: 10,
    marginLeft: 10,
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    borderBottomColor: '#cccccc',
    width: '100%'
  },
  buttoncontainer: {
    marginTop: 40,
    paddingHorizontal: 30
  },
  button: {
    marginTop: 5,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 40,
    backgroundColor: "#ffffff",
    alignItems: 'center'
  },
  textcolor: {
    color: '#09B5B5',
    fontSize: 20
  },
  ButtonStyle: {
    color: "#ffffff"

  },
  logoStyle: {
    width: 25,
    height: 25,
    marginVertical: 30

  }

});