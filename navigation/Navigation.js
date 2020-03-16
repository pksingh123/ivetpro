import React, { Component } from 'react';
import {
  Platform, StyleSheet, Text, View,
  ActivityIndicator,
  AsyncStorage,
  Button,
  StatusBar,
  TextInput,
  ScrollView,
} from 'react-native';

import {
  createStackNavigator,
  createSwitchNavigator,
  createAppContainer,
  createDrawerNavigator,
} from 'react-navigation';
import LandingScreen from '../screens/LandingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import RegisterPracticeScreen from '../screens/RegisterPractice';
import RegisterScreen4 from '../screens/RegisterScreen4';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import AuthLoadingScreen from '../screens/AuthLoadingScreen';
import PetEditScreen from '../screens/PetEditScreen';
import PetAddScreen from '../screens/PetAddScreen';
import PetDetailsScreen from '../screens/PetDetailsScreen';
import AppointmentDetailsScreen from '../screens/AppointmentDetailsScreen';
import PaymentScreen from '../screens/PaymentScreen';
import ConfrenceScreen from '../screens/ConfrenceScreen';
import BookAppointmentScreen from '../screens/BookAppointmentScreen';
import FirstBookAppointmentScreen from '../screens/FirstBookAppointmentScreen';
import BookingConfirmationScreen from '../screens/BookingConfirmationScreen';
import AddFirstPetScreen from '../screens/AddFirstPet';
import AddFirstDetailsScreen from '../screens/AddFirstPetDetails';
import FutureAppointmentScreen from '../screens/FutureAppointmentScreen';
import PastAppointmentScreen from '../screens/PastAppointmentScreen';
import AddAnotherPetScreen from '../screens/AddAnotherPet';
import DrawerScreen from './DrawerScreen';
import DrawerNav from './DrawerNav';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import CallScreen from '../screens/IncomingScreen';






const AuthStack = createStackNavigator({
  Landing: LandingScreen,
  Login: LoginScreen,
  ForgotPassword: ForgotPasswordScreen,
  RegisterPractice: RegisterPracticeScreen,
  Register: RegisterScreen,
  Register4: RegisterScreen4,
  AddFirstPet: AddFirstPetScreen,
  AddFirstPetDetails: AddFirstDetailsScreen,
  AddAnotherPet: AddAnotherPetScreen,
  routeFirstBookAppointment: FirstBookAppointmentScreen,
  ChangePassword: ChangePasswordScreen
});

const AppStack = createStackNavigator({
  //AppointmentDetails: AppointmentDetailsScreen,
  PetAdd: PetAddScreen,

});

const AppointmentDetails = createStackNavigator({
  routeAppointmentDetails: AppointmentDetailsScreen,
});
const BookAppointment2 = createStackNavigator({
  routeBookAppointment: BookAppointmentScreen,
});

const BookingConfirmation = createStackNavigator({
  routeBookingConfirmation: BookingConfirmationScreen,
});
const FutureAppointment = createStackNavigator({
  routeFutureAppointment: FutureAppointmentScreen,
});
const PastAppointment = createStackNavigator({
  routePastAppointment: PastAppointmentScreen,
});
const PetDetails = createStackNavigator({
  routePetDetails: PetDetailsScreen
});
const PetEdit = createStackNavigator({
  routePetEdit: PetEditScreen
});
const Confrence = createStackNavigator({
  Confrence: ConfrenceScreen
});

const Payment = createStackNavigator({
  Payment: PaymentScreen
});


const SwitchNavigator = createSwitchNavigator(
  {
    AuthLoading: AuthLoadingScreen,
    App: DrawerNav,
    Auth: AuthStack,
    IncominCall: CallScreen,
    Link: AppStack,
    PetEdit2: PetEdit,
    PetDetails2: PetDetails,
    routeConfrence: Confrence,
    routePayment: Payment,
    AppointmentDetails2: AppointmentDetails,
    BookAppointment3: BookAppointment2,
    BookingConfirmation: BookingConfirmation,
    FutureAppointment: FutureAppointment,
    PastAppointment: PastAppointment,


    //routePetDetails: PetDetailsScreen,
  },

  {
    initialRouteName: 'AuthLoading',
  },
  {
    contentComponent: props => <DrawerScreen {...props} />
  }


)

export default Navigation = createAppContainer(SwitchNavigator);
//export default Navigation = createAppContainer(SwitchNavigator);