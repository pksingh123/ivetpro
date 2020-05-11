import React, { Component } from 'react';
import {
    Platform,
    ActivityIndicator,
    AsyncStorage,
    StyleSheet,
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    StatusBar
} from 'react-native';
import Constant from './Constants';
import RNFetchBlob from 'rn-fetch-blob';
import { HeaderBackButton } from 'react-navigation';
import RNPasswordStrengthMeter from 'react-native-password-strength-meter';

export default class ChangePasswordScreen extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            headerTitle: 'Change Password',
            headerLeft: <HeaderBackButton onPress={() => navigation.push('Home')} />,
            headerLeftContainerStyle: {
                marginTop: StatusBar.currentHeight
            },
            headerTintColor: '#ffffff',
            headerStyle: {
                backgroundColor: '#26cccc',
                color: '#fff',
                height: 80
            },
        }
    };
    constructor(props) {
        super(props)
        this.state = {
            uid: false,
            oldPass: '',
            Password: '',
            confirmPass: '',
            isLoading: false,
            refreshing: false
        }
    }
    onChange = (password, score, { label, labelColor, activeBarColor }) => {
        this.setState({ password: password })
        console.log(password, score, { label, labelColor, activeBarColor });
    }

    updatConfirmPass = (text) => {
        this.setState({ confirmPass: text })
    }
    updatOldPass = (text) => {
        this.setState({ oldPass: text })
    }

    changePassword = () => {

        //  var paswd = /^(?=.*[0-9])(?=.*[@_])[a-zA-Z0-9@_]{10,15}$/;
        var paswd = /^(?=.*[0-9])(?=.*[~!@#$%^&*()_+?><.,:-;])[a-zA-Z0-9~!@#$%^&*()_+?><.,:-;]{10,15}$/;
        if (paswd.test(this.state.password) === false) {
            alert("Password must only contains a-z, 0-9, '@', '_' and min 10 chars and max 15");
            return false;
        }
        if (this.state.oldPass == '' || this.state.password == '' || this.state.confirmPass == '') {
            alert("Please fill all fields");
        } else if (this.state.password != this.state.confirmPass) {
            alert('password and confirm password not match');
        } else {
            const url = Constant.rootUrl + 'webservices/change-password.php';
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    'uid': this.state.uid,
                    'newPass': this.state.password,
                    'oldPass': this.state.oldPass
                }),
            })
                .then((response) => response.json())
                .then((responseJson) => {
                    console.warn(responseJson);
                    if (responseJson.status === 'ok') {
                        this._removeTempPwdAsync();
                        this.props.navigation.navigate('App');
                    } else if (responseJson.status === 'error') {
                        alert(responseJson.error);
                    }
                })
                .catch((error) => {
                    alert('Somthing went wrong!');
                    this.setState({
                        isLoading: false
                    })
                    console.warn(error);
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
        const userToken = await AsyncStorage.getItem('userToken');
        if (userToken) {
            userDetails = JSON.parse(userToken);
            this.setState({ uid: userDetails.user.uid, isLoading: false });
        }

    }
    _removeTempPwdAsync = async () => {
        await AsyncStorage.setItem('temporary_passwrod', false);
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
                    <TextInput placeholder="Old Password"
                        secureTextEntry={true}
                        returnKeyType="go"
                        underlineColorAndroid="transparent"
                        placeholderTextColor='#555'
                        ref={(input) => this.passwordInput = input}
                        style={styles.input}
                        /* onChangeText={this.updatConfirmPass} */
                        onChangeText={(text) => this.setState({ oldPass: text })}
                    />
                    <RNPasswordStrengthMeter
                        onChangeText={this.onChange}
                        containerWrapperStyle={styles.containerWrapperStyle}
                        imageWrapperStyle={styles.imageWrapperStyle}
                        imageStyle={styles.imageStyle}
                        inputWrapperStyle={styles.inputWrapperStyle}
                        inputStyle={styles.inputStyle}
                        meterType="bar"
                        // inputProps= { placeholder = 'New Password' }
                        minLength="10"
                    />
                    <TextInput placeholder="Confirm Password"
                        secureTextEntry={true}
                        returnKeyType="go"
                        underlineColorAndroid="transparent"
                        placeholderTextColor='#555'
                        ref={(input) => this.passwordInput = input}
                        style={styles.input}
                        /* onChangeText={this.updatConfirmPass} */
                        onChangeText={(text) => this.setState({ confirmPass: text })}
                    />
                    <View style={styles.buttoncontainer}>
                        <TouchableOpacity onPress={this.changePassword} style={styles.button}>
                            <Text style={styles.textcolor}>Submit</Text>
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
        padding: 20,

    },
    container: {
        flex: 1,
        //paddingHorizontal: 30,
        marginTop: 30,
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
    input: {
        height: 50,
        backgroundColor: '#F6F6F6',
        marginBottom: 20,
        paddingHorizontal: 10,
        borderRadius: 0,
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

    containerWrapperStyle: {
        flex: 1,
        width: '100%',
        alignSelf: 'stretch',
        marginBottom: 25,
        fontSize: 18,
        marginStart: -10,

    },
    imageWrapperStyle: {
        backgroundColor: '#ffffff',
    },
    imageStyle: {
        alignItems: 'flex-end',
        bottom: 9,
        marginEnd: 8
    },
    inputWrapperStyle: {
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: 0,
        flex: 1,
        height: 50,
    },
    inputStyle: {
        height: 50,
        borderColor: '#d2d4d6',
        borderWidth: 0,
        paddingHorizontal: 10,
        paddingVertical: 10,
        backgroundColor: '#ffffff',

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


