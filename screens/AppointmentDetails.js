
import React, { Component } from 'react';
import {
    ActivityIndicator,
  AsyncStorage,
  Button,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
} from 'react-native';

export default class AppointmentDetails extends Component {
    static navigationOptions = {
        title: 'Lots of features here',
      };
    
      render() {
        return this._signOutAsync;
      }
    
      _signOutAsync = async () => {
        await AsyncStorage.clear();
        this.props.navigation.navigate('Auth');
      };
}
const styles = StyleSheet.create({
    container: {
      
    },
  
  });