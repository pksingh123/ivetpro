import React, { Component } from 'react';
import {
    Platform,
    DatePickerIOS,
    ActivityIndicator,
    AsyncStorage,
    Button,
    StatusBar,
    StyleSheet,
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    Alert,
    Picker,
    ProgressViewIOS,
    ProgressBarAndroid,
    Animated,
    Image,
    Dimensions,
    PixelRatio,
    BackHandler,
    RefreshControl
} from 'react-native';
import Constant from './Constants';
import AuthLoadingScreen from './AuthLoadingScreen';
import DatePicker from 'react-native-datepicker';
import RNPickerSelect from 'react-native-picker-select';
import ImagePicker from 'react-native-image-picker';
import RNFetchBlob from 'rn-fetch-blob';
import { HeaderBackButton } from 'react-navigation';
import { DrawerActions } from 'react-navigation-drawer';
import { Icon, ListItem, SearchBar } from 'react-native-elements';
import Icons from 'react-native-vector-icons/FontAwesome';
import App from '../App'
import firebase from 'react-native-firebase';
export default class EditProfileScreen extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            headerTitle: 'Edit Profile',
            headerLeft: <HeaderBackButton onPress={() => navigation.push('Home')} />,
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
        }
    };
    constructor(props) {

        super(props)
        this.state = {
            username: '',
            firstname: '',
            lastname: '',
            email: '',
            uid: false,
            ImageSource: null,
            isLoading: true,
            refreshing: false
        }


    }
    selectPhotoTapped() {
        const options = {
            quality: 1.0,
            maxWidth: 500,
            maxHeight: 500,
            storageOptions: {
                skipBackup: true
            }
        };

        ImagePicker.showImagePicker(options, (response) => {
            console.log('Response = ', response);

            if (response.didCancel) {
                console.log('User cancelled photo picker');
            }
            else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            }
            else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            }
            else {
                let source = { uri: response.uri };
                this.setState({
                    ImageSource: source,
                    data: response.data
                });
            }
        });
    }


    editProfile = () => {
        // console.log("divide ", 1/0);

        if (this.state.name == '') {
            alert("Please fill all fields");
        } else {
            console.warn(this.state.setDate);
            this.setState({ isLoading: true })
            RNFetchBlob.fetch('POST', Constant.rootUrl + 'webservices/edit-profile.php', {
                'Content-Type': 'multipart/form-data',
            }, [
                { name: 'image', filename: 'image.png', type: 'image/png', data: this.state.data },
                { name: 'firstname', data: this.state.firstname },
                { name: 'lastname', data: this.state.lastname },
                { name: 'uid', data: this.state.uid },
                { name: 'action', data: 'edit' }
            ])
                .then((response) => response.json())
                .then((responseJson) => {
                    console.warn(responseJson);
                    if (responseJson.status === 'ok') {
                        this.setState({ isLoading: false })
                        alert(responseJson.success_msg);
                        this.props.navigation.push('Home');
                    } else {
                        this.setState({ isLoading: false })
                        alert(responseJson.error_msg);
                    }

                }).catch((err) => {

                })
        }

    }
    checkref() {
        this.setState({
            refreshing: true
        })
        this.componentDidMount()
    }
    async componentDidMount() {
        // firebase.crashlytics().crash();
        // Alert.show.componentDidMount
        let savedValues = await AsyncStorage.getItem('userToken');
        savedValues = JSON.parse(savedValues);
        this.id = savedValues.user.uid;
        //console.log("fetUserData saved data", savedValues, this.id);
        new App().fetUserData(this.id);

        const userToken = await AsyncStorage.getItem('userToken');
        var source = '';
        if (userToken) {
            userDetails = JSON.parse(userToken);
            // console.warn(userDetails.user.practice.practice_logo_url);
            this.setState({ uid: userDetails.user.uid });
            const url = Constant.rootUrl + 'webservices/edit-profile.php';

            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    'uid': userDetails.user.uid,
                    'action': 'get'
                }),
            })
                .then((response) => response.json())
                .then((responseJson) => {
                    console.warn(responseJson);
                    if (responseJson.status === 'ok') {
                        responseJson.user.profile_pic ?
                            source = { uri: responseJson.user.profile_pic }
                            : null
                        this.setState({
                            firstname: responseJson.user.firstname,
                            lastname: responseJson.user.lastname,
                            email: responseJson.user.email,
                            ImageSource: source,
                            isLoading: false,
                            refreshing: false
                        })
                    } else {
                        alert(responseJson.status);
                    }
                })
                .catch((error) => {
                    alert('Somthing went wrong!');
                    this.setState({
                        isLoading: false
                    })
                    console.warn(error);
                })
        } else {
            this.setState({ uid: false, isLoading: false })
        }

    }

    render() {
        console.warn(this.state.uid)
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
                    <TextInput placeholder="Email"
                        underlineColorAndroid="transparent"
                        placeholderTextColor='#555'
                        style={styles.input}
                        defaultValue={this.state.email}
                        editable={false}
                    />
                    <TextInput placeholder="First Name"
                        underlineColorAndroid="transparent"
                        placeholderTextColor='#555'
                        style={styles.input}
                        defaultValue={this.state.firstname}
                        onChangeText={(firstname) => this.setState({ firstname })}
                        value={this.state.firstname}
                    />
                    <TextInput placeholder="Last Name"
                        underlineColorAndroid="transparent"
                        placeholderTextColor='#555'
                        style={styles.input}
                        defaultValue={this.state.lastname}
                        onChangeText={(lastname) => this.setState({ lastname })}
                        value={this.state.lastname}
                    />

                    <TouchableOpacity onPress={this.selectPhotoTapped.bind(this)} style={styles.ImageContainer}>
                        <View >
                            {this.state.ImageSource === null ? <Text>Select a Photo</Text> :
                                <Image style={styles.ImageContainer} source={this.state.ImageSource} />
                            }
                        </View>
                    </TouchableOpacity>
                    <View style={styles.buttoncontainer}>
                        <TouchableOpacity onPress={this.editProfile} style={styles.button}>
                            <Text style={styles.textcolor}>Update</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    maincontainer: {
        flex: 1,
        //backgroundColor: '#FFFFFF',
        padding: 20
    },
    container: {
        flex: 1,
        //paddingHorizontal: 30,
        marginTop: 10,
    },
    input: {
        height: 50,
        backgroundColor: '#F6F6F6',
        marginBottom: 20,
        paddingHorizontal: 10,
        borderRadius: 0,
        borderColor: '#F6F6F6',
        borderWidth: 0
    },
    activityIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 80
    },
    picker: {
        height: 44,
        backgroundColor: '#ffffff',
        paddingHorizontal: 10,
        borderRadius: 10,
        marginTop: 20,
        borderColor: '#d2d4d6'
    },
    pickerItem: {
        height: 44,
        color: "#fff",
        fontSize: 17
    },
    buttoncontainer: {
        marginTop: 40,
    },
    ImageContainer: {
        borderRadius: 10,
        width: 150,
        height: 150,
        //borderColor: '#9B9B9B',
        //borderWidth: 1 / PixelRatio.get(),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F6F6F6',

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
    pagetitle: {
        justifyContent: 'center',
        fontSize: 20,
        marginBottom: 15,
    },
    textcolor: {
        color: '#FFFFFF',
        fontSize: 20
    },
    progressBar: {
        transform: [{ scaleX: 1.0 }, { scaleY: 6 }],
        marginTop: 8,
        marginBottom: 15,
    },
    scrollView: {
        position: "absolute",
        bottom: 30,
        left: 0,
        right: 0,
        paddingVertical: 10,
    },

    datePicker: {
        width: '100%',
        color: '#fff',
        height: 40,
        backgroundColor: '#ffffff',
        marginBottom: 20,
        paddingHorizontal: 0,
        borderRadius: 10,
        borderColor: '#d2d4d6',
        alignContent: 'flex-start',
    },
    dateText: {
        color: '#fff',
        justifyContent: 'center',
        marginTop: 5
    }
});
const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 1,
        paddingRight: 30, // to ensure the text is never behind the icon
        height: 40,
        backgroundColor: '#ffffff',
        marginBottom: 20,
        paddingHorizontal: 10,
        borderRadius: 10,
        borderColor: '#d2d4d6',
        borderWidth: 2
    },
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 0.5,
        borderColor: '#d2d4d6',
        paddingRight: 30,
        height: 40,
        backgroundColor: '#ffffff',
        marginBottom: 20,
        paddingHorizontal: 10,
        borderRadius: 10,
        borderWidth: 2
        // to ensure the text is never behind the icon
    },
});


