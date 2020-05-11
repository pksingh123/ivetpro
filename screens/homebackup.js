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
  RefreshControl
} from 'react-native';
import Constant from './Constants';
//import { FlatList } from 'react-native-gesture-handler';
import { Icon, ListItem, Avatar, Divider, SearchBar } from 'react-native-elements';
import Icons from 'react-native-vector-icons/FontAwesome';
import { DrawerActions } from 'react-navigation-drawer';
import SwitchToggle from 'react-native-switch-toggle';

import Dialog, { DialogTitle, DialogFooter, DialogButton, DialogContent } from 'react-native-popup-dialog';
import PracticeBarLogo from './PracticeBarLogo';

this.arrayholder = [];
export default class HomeScreen extends Component {
  navOptions
  static navigationOptions = ({ navigation }) => {

    navOptions = navigation;
    const { params = {} } = navigation.state;
    return {
      headerTitle: 'Pet list',
      headerLeft: <PracticeBarLogo />,
      headerRight: (
        <Icon
          name="menu"
          size={50}
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        />
      ),

    };
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.exitFromApp);
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
    this.props.navigation.setParams({
      _onHeaderEventControl: this.onHeaderEventControl,
      _openNav: () => this.openDrawer()
    })

  }

  /* openDrawer() {
    this.props.navigation.navigate('DrawerOpen');
  } */

  constructor(props) {
    super(props);
    this.state = {
      GridViewItems: [

      ],
      GridViewItemsDeceased: [

      ],
      PetDetails: [

      ],
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


    }
    this.signOutAsync;
    this.exitFromApp = this.exitFromApp.bind(this);

  }

  async componentWillMount() {
    this.props.navigation.setParams({ logout: this._signOutAsync });
    BackHandler.addEventListener('hardwareBackPress', this.exitFromApp);
    const userToken = await AsyncStorage.getItem('userToken');

    if (userToken) {
      userDetails = JSON.parse(userToken);
      // console.warn(userDetails.user.practice.practice_logo_url);
      this.setState({ uid: userDetails.user.uid });
    } else {
      this.setState({ uid: false })
    }


    const url = Constant.rootUrl + 'webservices/client-pet.php?action=alive&uid=' + this.state.uid;

    fetch(url)
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson);
        if (responseJson.status === 'ok') {
          this.setState({
            isLoading: false,
            refreshing: false
          })
          this.setState({
            GridViewItems: responseJson.pets,
            GridViewItemsDeceased: responseJson.diedpets,
            countDeceasedPets: responseJson.totalDiedCount
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

  renderItem = ({ item }) => {

    return (
      <ListItem
        title={item.name}
        leftAvatar={{ source: { uri: item.img_url } }}
        rightIcon={{ type: 'font-awesome', name: 'chevron-right', color: '#ccc' }}
        onPress={() => this._petDettsils(item)}
        contentContainerStyle={{ padding: 1 }}
      //onPress={() => this._openPopUp(item)}
      />
    )
  }
  renderSeparator = () => {
    return (
      <View style={styles.separator}></View>
    )
  }
  _openPopUp = (item) => {
    this.setState({
      visible: true,
      title: "Detail's of " + item.name,
      img_url: item.img_url,
      name: item.name,
      species: item.species,
      breed: item.breed,
      sex: item.sex,
      dob: item.dob,
      PetDetails: item,
      search: '',

    })
  }
  _closePopUp = () => {
    this.setState({
      visible: false
    })
  }
  onPressToggle = () => {

    this.setState({ showDeceasedPets: !this.state.showDeceasedPets });
    if (this.state.showDeceasedPets) {
      this.setState({ buttonText: 'Show Deceased Pet' });
    } else {
      this.setState({ buttonText: 'Hide Deceased Pet' });
    }
  };


  _petEdit = (item) => {
    this.setState({
      visible: false
    })
    this.props.navigation.navigate('routePetEdit', { item });
  }
  updateSearch = (text) => {

    //passing the inserted text in textinput
    const newData = this.arrayholder.filter(function (item) {
      //applying filter for the inserted text in search bar
      const itemData = item.name ? item.name.toUpperCase() : ''.toUpperCase();
      const textData = text.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
    this.setState({
      //setting the filtered newData on datasource
      //After setting the data it will automatically re-render the view
      GridViewItems: newData,
      search: text,
    });
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
    this.setState({
      refreshing: true
    })
    this.componentWillMount()
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

      <SafeAreaView style={styles.container}>
        {/* <SearchBar
          round
          searchIcon={{ size: 24 }}
          inputContainerStyle={{ backgroundColor: '#ccc', }}
          containerStyle={{ backgroundColor: 'white' }}
          lightTheme={true}
          placeholder="Type Here..."
          onChangeText={text => this.updateSearch(text)}
          onClear={text => this.updateSearch('')}
          value={this.state.search}
        /> */}
        <Text style={styles.headingstyle}>Your Pets..</Text>
        <ScrollView refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={() => this.checkref()}
            title="Loading..."
          />
        }>


          {/* <FlatList
          data={this.state.GridViewItems}
          renderItem={this.renderItem}
          keyExtractor={(item, index) => index.toString()}
        /> */}
          <View>
            {
              this.state.GridViewItems.map((item, index) => (
                <ListItem

                  title={item.name}
                  leftAvatar={{ source: { uri: item.img_url } }}
                  rightIcon={{ type: 'font-awesome', name: 'chevron-right', color: '#ccc' }}
                  onPress={() => this._petDettsils(item)}
                  containerStyle={{ backgroundColor: index % 2 == 0 ? "#eae6e6" : "#D3D3D3" }}
                />
              ))
            }
          </View>
          {/*this.state.countDeceasedPets > 0 ?
            <View style={styles.fixToText}>
              <SwitchToggle
                buttonText={this.getButtonText()}
                backTextRight={this.getRightText()}
                backTextLeft={this.getLeftText()}
                type={1}
                buttonStyle={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'absolute'
                }}
                rightContainerStyle={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                leftContainerStyle={{ flex: 1, alignItems: 'center', justifyContent: 'flex-start' }}
                buttonTextStyle={{ fontSize: 20 }}
                textRightStyle={{ fontSize: 20 }}
                textLeftStyle={{ fontSize: 20 }}
                containerStyle={{
                  marginTop: 16,
                  width: 160,
                  height: 65,
                  borderRadius: 30,
                  padding: 5,
                }}
                backgroundColorOn='#fff'
                backgroundColorOff='#fff'
                circleStyle={{
                  width: 80,
                  height: 55,
                  borderRadius: 27.5,
                  backgroundColor: 'blue', // rgb(102,134,205)
                }}
                switchOn={this.state.showDeceasedPets}
                onPress={this.onPressToggle}
                circleColorOff='#fe7320'
                circleColorOn='#fe7320'
                duration={500}
              />
            </View>
            : null
              */}
          {this.state.countDeceasedPets > 0 ?
            <View style={styles.fixToText}>
              <Button
                title={this.state.buttonText}
                style={styles.button}
                //onPress={() => this.setState({ showDeceasedPets: true })}
                onPress={this.onPressToggle}
              />
            </View> : null
          }
          {
            this.state.showDeceasedPets ?
              <View>
                {
                  this.state.GridViewItemsDeceased.map((item, index) => (
                    <ListItem
                      title={item.name}
                      leftAvatar={{ source: { uri: item.img_url } }}
                      rightIcon={{ type: 'font-awesome', name: 'chevron-right', color: '#ccc' }}
                      onPress={() => this._petDettsils(item)}
                      containerStyle={{ backgroundColor: index % 2 == 0 ? "#eae6e6" : "#D3D3D3" }}
                    />

                  ))
                }
              </View> : null
          }
        </ScrollView>



      </SafeAreaView>
    );
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

  },
  logo: {
    width: 40,
  },
  fixToText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 15,
    marginTop: 15,
    marginBottom: 15
  },
  activityIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 80
  },
  imgStyle: {
    width: 80,
    height: 60,

  },
  headingstyle: {
    fontSize: 20,
    alignSelf: "center",
    fontWeight: "600",
    marginBottom: 10,
    padding: 10
  },
  separator: {
    height: 1,
    width: '100%',
    backgroundColor: '#ccc'
  },
  textStyle: {
    padding: 10,
    fontSize: 18,
    height: 44,
    color: '#000'
  },
  avtarStyle: {
    flexDirection: "row",
    justifyContent: 'center',
    textAlign: "center"
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
  button: {
    marginTop: 5,
    height: 45,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 30,
    backgroundColor: "#26cccc",
  },
  textcolor: {
    color: '#FFFFFF'
  },
});