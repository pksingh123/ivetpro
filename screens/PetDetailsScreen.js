import React, { Component } from 'react';
import {
  ActivityIndicator,
  AsyncStorage,
  Button,
  TouchableOpacity,
  StyleSheet,
  View,
  ScrollView,
  Image,
  Text,
  BackHandler,
  StatusBar
} from 'react-native';
import Constant from './Constants';
import { FlatList } from 'react-native-gesture-handler';
import { Icon, Avatar, Divider } from 'react-native-elements';
import Icons from 'react-native-vector-icons/FontAwesome';
import { DrawerActions } from 'react-navigation-drawer';
import { HeaderBackButton } from 'react-navigation';
import PracticeBarLogo from '../screens/PracticeBarLogo';
import App from '../App'

export default class PetDetailsScreen extends Component {

  static navigationOptions = ({ navigation }) => {
    const item = navigation.state.params.item;
    return {
      headerTitle: 'Pet Details',
      headerLeft: <HeaderBackButton onPress={() => navigation.navigate('Home')} />,
      headerTintColor: '#ffffff',
      headerLeftContainerStyle: {
        marginTop: StatusBar.currentHeight
      },
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
    }
    // if (item.status == 1) {

    //   return {
    //     headerTitle: 'Pet Details',
    //     headerLeft: <HeaderBackButton onPress={() => navigation.navigate('Home')} />,
    //   }
    // } else {

    //   return {
    //     headerTitle: 'Pet Details',
    //     headerLeft: <HeaderBackButton onPress={() => navigation.navigate('DiedPet')} />,

    //   }
    // }

  };
  constructor(props) {
    super(props);
    this.state = {
      name: 'Name:',
      species: 'Species:',
      breed: 'Breed:',
      sex: 'Sex:',
      dob: 'Date Of birth:',
      isLoading: true,
      petAliveStatus: '',
    }
    //this.exitFromApp = this.exitFromApp.bind(this);
    this._goBack = this._goBack.bind(this);

  }
  componentWillMount() {
    BackHandler.addEventListener('hardwareBackPress', this._goBack);
  }
  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this._goBack);
  }
  _goBack() {
    // this.props.navigation.goBack();
    this.props.navigation.navigate('Home');
    return true;
  }
  componentDidMount() {
    const item = this.props.navigation.state.params.item;
    this.setState({ petAliveStatus: item.status })

  }

  _startVideoCall = () => {

  }

  _petEdit = (item) => {
    this.props.navigation.navigate('routePetEdit', { item });
  }
  _bookAppointment = (item) => {
    console.warn(item)
    this.props.navigation.navigate('routeBookAppointment', { item });
  }
  _FutureAppointments = (item) => {
    console.log(item);
    this.props.navigation.navigate('routeFutureAppointment', { item });
  }
  _PastAppointments = (item) => {
    this.props.navigation.navigate('routePastAppointment', { item });
  }

  render() {

    const item = this.props.navigation.state.params.item;
    console.warn(item);
    return (
      <View style={styles.container}>
        <View style={styles.avtarStyle}>
          <Avatar
            size="large"
            rounded
            source={{ uri: item.img_url }}
          />
        </View>
        <Divider style={{ backgroundColor: '#ccc' }} />
        <View style={styles.details}>
          <Text style={styles.baseStyle}>
            <Text style={styles.labelStyle}>{this.state.name}</Text>
            <Text style={styles.textStyle}> {item.name}</Text>
          </Text>
          <Text style={styles.baseStyle}>
            <Text style={styles.labelStyle}>{this.state.species}</Text>
            <Text style={styles.textStyle}> {item.speciesName}</Text>
          </Text>
          <Text style={styles.baseStyle}>
            <Text style={styles.labelStyle}>{this.state.breed}</Text>
            <Text style={styles.textStyle}> {item.breed}</Text>
          </Text>
          <Text style={styles.baseStyle}>
            <Text style={styles.labelStyle}>{this.state.sex}</Text>
            <Text style={styles.textStyle}> {item.sex}</Text>
          </Text>
          <Text style={styles.baseStyle}>
            <Text style={styles.labelStyle}>{this.state.dob}</Text>
            <Text style={styles.textStyle}> {item.dob}</Text>
          </Text>
        </View>
        {
          this.state.petAliveStatus == 1 ?


            <View style={styles.buttoncontainer}>
              <TouchableOpacity onPress={() => this._bookAppointment(item)} style={styles.button}>
                <Text style={styles.textcolor}>Book an appointment</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this._petEdit(item)} style={styles.button}>
                <Text style={styles.textcolor}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this._FutureAppointments(item)} style={styles.button}>
                <Text style={styles.textcolor}>Future Appointments</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this._PastAppointments(item)} style={styles.button}>
                <Text style={styles.textcolor}>Past Appointments</Text>
              </TouchableOpacity>
            </View>
            : null
        }

      </View>
    )
  }
}


const styles = StyleSheet.create({
  container: {
    padding: 15,
    textAlign: 'center',

  },
  avtarStyle: {
    flexDirection: "row",
    justifyContent: 'center',
    textAlign: "center"
  },
  details: {

  },
  imgStyle: {
    width: '100%',
    height: 200,
    borderRadius: 5,
    resizeMode: "cover"
  },
  baseStyle: {
    padding: 10,
    fontSize: 18,
    height: 44,
  },
  labelStyle: {
    fontWeight: "bold"
  },
  textStyle: {
    color: '#000',
    marginLeft: 5

  },
  buttoncontainer: {
    marginTop: 40,
  },
  button: {
    marginTop: 5,
    height: 45,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 30,
    backgroundColor: "#26cccc",
    alignItems: 'center',
    borderColor: '#eea236'
  },
  textcolor: {
    color: '#FFFFFF'
  },


});
