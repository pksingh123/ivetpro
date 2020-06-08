import React, { Component } from 'react';
import {
    Platform,
    ActivityIndicator,
    AsyncStorage,
    Button,
    StyleSheet,
    View,
    ScrollView,
    Image,
    Text,
    TouchableOpacity,
    RefreshControl,
    StatusBar
} from 'react-native';
import Constant from './Constants';
import { FlatList } from 'react-native-gesture-handler';
import { Icon, ListItem, SearchBar } from 'react-native-elements';
import Icons from 'react-native-vector-icons/FontAwesome';
import { DrawerActions } from 'react-navigation-drawer';
import PracticeBarLogo from '../screens/PracticeBarLogo';
import App from '../App'
import { EventRegister } from 'react-native-event-listeners'
this.arrayholder = [];
export default class AppointmentListScreen extends Component {
    navOptions
    static navigationOptions = ({ navigation }) => {
        navOptions = navigation;
        const { params = {} } = navigation.state;
        return {
            headerTitle: 'Appointment list',
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
    onHeaderEventControl() {
        const { params = {} } = navOptions.state;
        params._openNav()
    }
    onFocusFunction = async () => {
        // alert("Appointment List");
        this.getAppointmentData();
        let isAppLoginExpire = await AsyncStorage.getItem('isLoginExpire')
        if (isAppLoginExpire == 'Yes') {
            EventRegister.emit('appExpire', "")
        }
    }

    componentDidMount() {
        this.props.navigation.setParams({
            _onHeaderEventControl: this.onHeaderEventControl,
            _openNav: () => this.openDrawer()
        })

        this.focusListener = this.props.navigation.addListener('didFocus', () => {
            this.onFocusFunction()
        })
    }
    componentWillUnmount() {
        this.focusListener.remove()
    }

    /* openDrawer() {
      this.props.navigation.navigate('DrawerOpen');
    } */

    constructor(props) {
        super(props);
        this.state = {
            GridViewItems: [

            ],
            isLoading: true,
            uid: '',
            search: '',
            refreshing: false
        }
        this.signOutAsync;

    }

    async componentWillMount() {
        this.props.navigation.setParams({ logout: this._signOutAsync });
        this.getAppointmentData();
    }

    async getAppointmentData() {
        const userToken = await AsyncStorage.getItem('userToken');
        if (userToken) {
            userDetails = JSON.parse(userToken);
            this.setState({ uid: userDetails.user.uid });
        } else {
            this.setState({ uid: false })
        }
        let savedValues = await AsyncStorage.getItem('userToken');
        savedValues = JSON.parse(savedValues);
        this.id = savedValues.user.uid;
        //console.log("fetUserData saved data", savedValues, this.id);
        new App().fetUserData(this.id);


        const url = Constant.rootUrl + 'webservices/booking-appointment.php?action=AppointmentList&uid=' + this.state.uid;

        fetch(url)
            .then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.status === 'ok') {
                    // console.log("appointment list ", responseJson);
                    this.setState({
                        isLoading: false,
                        refreshing: false
                    })
                    this.setState({
                        GridViewItems: responseJson.data
                    })
                    this.arrayholder = responseJson.data;
                } else {
                    alert(responseJson.status);
                }
            })
            .catch((error) => {
                // alert('Something went wrong!');
                console.warn(error);
            })
    }
    updateSearch = (text) => {

        //passing the inserted text in textinput
        const newData = this.arrayholder.filter(function (item) {
            //applying filter for the inserted text in search bar
            const itemData = item.Name ? item.Name.toUpperCase() : ''.toUpperCase();
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


    renderItem = ({ item }) => {

        return (
            <ListItem
                /*  title={`${item.patientName}  ${item.date}  ${item.time}`} */
                title={<View style={styles.subtitleView}>
                    <Text style={styles.textStyle}>{item.Name} </Text>
                    <Text style={styles.ratingText}>{item.date} </Text>
                    <Text style={styles.ratingText}>{item.time}</Text>
                </View>
                }
                /* */
                /* leftIcon={{ name: 'av-timer', color: '#0078d7' }} */
                /*        leftAvatar={{ source: { uri: item.img_url } }} */
                rightIcon={{ type: 'font-awesome', name: 'chevron-right', color: '#ccc' }}
                onPress={() => this._appointmentDetails(item)}
            />
        )
    }
    renderSeparator = () => {
        return (
            <View style={styles.separator}></View>
        )
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

            <View style={styles.maincontainer}>
                <ScrollView refreshControl={
                    <RefreshControl
                        refreshing={this.state.refreshing}
                        onRefresh={() => this.checkref()}
                        title="Loading..."
                    />
                } style={styles.container}>
                    <SearchBar
                        round
                        searchIcon={{ size: 24 }}
                        inputContainerStyle={{ backgroundColor: '#ccc', }}
                        containerStyle={{ backgroundColor: 'white' }}
                        lightTheme={true}
                        placeholder="Type Here..."
                        onChangeText={text => this.updateSearch(text)}
                        onClear={text => this.updateSearch('')}
                        value={this.state.search}
                    />

                    <View>
                        {
                            this.state.GridViewItems ?
                                this.state.GridViewItems.map((item, index) => (
                                    <ListItem
                                        title={<View style={styles.subtitleView}>
                                            <Text style={styles.textStyle}>{item.Name} </Text>
                                            <Text style={styles.ratingText}>{item.date} </Text>
                                            <Text style={styles.ratingText}>{item.time}</Text>
                                        </View>
                                        }
                                        rightIcon={{ type: 'font-awesome', name: 'chevron-right', color: '#ccc' }}
                                        onPress={() => this._appointmentDetails(item)}
                                        containerStyle={{ backgroundColor: index % 2 == 0 ? "#eae6e6" : "#D3D3D3" }}
                                    />
                                ))
                                : null
                        }
                    </View>

                </ScrollView>
            </View>
        );
    }

    _showMoreApp = () => {
        this.props.navigation.navigate('Other');
    };
    _appointmentDetails = (item) => {
        console.warn(item);
        // this.props.navigation.navigate('Other', { item });
        this.props.navigation.navigate('routeAppointmentDetails', { item });
    }
    _signOutAsync = async () => {
        await AsyncStorage.clear();
        this.props.navigation.navigate('Auth');
    };

}
const styles = StyleSheet.create({
    maincontainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    container: {

    },
    SearchBar: {

    },
    imgStyle: {
        width: 80,
        height: 60,

    },
    separator: {
        height: 1,
        width: '100%',
        backgroundColor: '#ccc'
    },
    textStyle: {
        fontSize: 17,
        height: 44,
        color: '#000'
    },
    subtitleView: {
        flexDirection: 'row',
        paddingLeft: 10,

    },

    ratingText: {
        paddingLeft: 10,
        color: 'grey',
        height: 44,
    },
    activityIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 80
    },
});