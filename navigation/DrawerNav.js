import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  AsyncStorage,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions
} from 'react-native';


import { DrawerItems, createStackNavigator, createDrawerNavigator, createAppContainer, SafeAreaView } from 'react-navigation';
import HomeScreen from '../screens/HomeScreen';
import PetAddScreen from '../screens/PetAddScreen';
import PetEditScreen from '../screens/PetEditScreen';
import PetDetailsScreen from '../screens/PetDetailsScreen';
import VideoConsultScreen from '../screens/VideoConsultScreen';
import DrawerScreen from './DrawerScreen';
import BookAppointmentScreen from '../screens/BookAppointmentScreen';
import AppointmentListScreen from '../screens/AppointmentListScreen';
import AppointmentHistoryScreen from '../screens/AppointmentHistoryScreen';
import VideoConsultNowScreen from '../screens/VideoConsultScreen';
import EditProfileScreen from '../screens/EditProfileScreen';

const DEVICE_WIDTH = Dimensions.get('window').width;


const customDrawerComponent = (props) => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ height: 150, backgroundColor: 'blue', alignItems: 'center', justifyContent: 'center' }}>
        <Image style={styles.avatar} source={{ uri: 'https://bootdey.com/img/Content/avatar/avatar6.png' }} />
      </View>
      <ScrollView>
        <DrawerItems {...props}
        />
        <TouchableOpacity
          title="Logout"
          onPress={() => {
            AsyncStorage.clear()
            props.navigation.navigate('Auth')
          }}
          style={styles.button}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>

  )
}

const Home = createStackNavigator({
  Home: {
    screen: HomeScreen,
    navigationOptions: {
      headerTitle: 'Home',
      headerTitleStyle: { flex: 1, textAlign: 'center' },
    }
  },
});
const AddPet = createStackNavigator({
  Other: {
    screen: PetAddScreen,
    /*navigationOptions: {
      headerTitle: 'Add Pet',
      headerTitleStyle: { flex: 1, textAlign: 'center'},
    } */
  }
});

const PetDetails = createStackNavigator({
  PetDetails: {
    screen: PetDetailsScreen,
    navigationOptions: {
      headerTitle: 'Pet Details',
      headerTitleStyle: { flex: 1, textAlign: 'center' },
      drawerLabel: () => null
    }
  }
})
const PetEdit = createStackNavigator({
  PetEdit: {
    screen: PetEditScreen,
    // navigationOptions: {
    //   headerTitle: 'Edit Pet',
    //   headerTitleStyle: { flex: 1, textAlign: 'center' },
    // }
  }
})
const Appointment = createStackNavigator({
  Appointment: {
    screen: BookAppointmentScreen,
    /*  navigationOptions: {
       headerTitle: 'Book Appointment',
       headerTitleStyle: { flex: 1, textAlign: 'center'},
     } */
  }
})
const AppointmentList = createStackNavigator({
  AppointmentList: {
    screen: AppointmentListScreen,
    /* navigationOptions: {
      headerTitle: 'Appointment list',
      headerTitleStyle: { flex: 1, textAlign: 'center'},
      
    } */
  }
})
const AppointmentHistory = createStackNavigator({
  AppointmentHistory: {
    screen: AppointmentHistoryScreen,
    /* navigationOptions: {
      headerTitle: 'Completed Appointment',
      headerTitleStyle: { flex: 1, textAlign: 'center'},
    } */
  }
})

const VideoConsultNow = createStackNavigator({
  VideoConsultNow: {
    screen: VideoConsultNowScreen,
    /* navigationOptions: {
      headerTitle: 'Video Consult Now',
      headerTitleStyle: { flex: 1, textAlign: 'center'},
    } */
  }
})

const EditProfile = createStackNavigator({
  EditProfile: {
    screen: EditProfileScreen,
    /*  navigationOptions: {
      headerTitle: 'Edit Profile',
         headerTitleStyle: { flex: 1, textAlign: 'center'},
    }  */
  }
})


const VideoConsult = createStackNavigator({
  VideoConsult: {
    screen: VideoConsultScreen,
  }
});


export default DrawerNav = createDrawerNavigator(
  {
    Home: Home,
    AddPet: AddPet,
    VideoConsult: VideoConsult,
    Appointment: Appointment,
    AppointmentList: AppointmentList,
    AppointmentHistory: AppointmentHistory,
    VideoConsultNow: VideoConsultNow,
    EditProfile: EditProfile,
    PetEdit: PetEdit,
  },
  {
    // hideStatusBar: true,
    drawerWidth: DEVICE_WIDTH,
    contentComponent: DrawerScreen,
    drawerBackgroundColor: '#26cccc',
    overlayColor: '#26cccc',
    contentOptions: {
      activeTintColor: '#fff',
      activeBackgroundColor: '#26cccc',
      style: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 20,
      }
    },
  },



);
const styles = StyleSheet.create({
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 63,
    borderWidth: 4,
    borderColor: "white",
    marginBottom: 10,
    alignSelf: 'center',
    position: 'absolute',
    marginTop: 130
  },
  button: {
    marginLeft: 15,
  },
  logoutText: {
    fontWeight: "600"
  }

})