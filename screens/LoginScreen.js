import React, { Component } from 'react';
import {
    ActivityIndicator,
    AsyncStorage,
    StyleSheet,
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    Alert,
    Image
} from 'react-native';
import AnimateLoadingButton from 'react-native-animate-loading-button';
import DeviceInfo from 'react-native-device-info';
export default class LoginScreen extends Component {
    static navigationOptions = {
        header: null,
    };
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            isLoading: false,
            cancel: false,
            fcmtoken: '',
        }

    }
    async componentDidMount() {
        let fcmToken = await AsyncStorage.getItem('fcmToken');
        this.setState({ fcmtoken: fcmToken })
        console.log(this.state.fcmtoken);
    }
    updatEmail = (text) => {
        this.setState({ email: text })
    }
    updatePassword = (text) => {
        this.setState({ password: text })
    }
    verifyEmail = (uid) => {
        this.setState({ cancel: false })
        this.props.navigation.navigate('Register4', { user_id: uid });
    }
    login = () => {
        // alert(this.state.password);
        if (this.state.email === '' || this.state.password === '') {
            alert('Please enter email and password!');
        } else {
            //this.loadingButton.showLoading(true);
            const url = 'https://videowithmyvet.com/webservices/user-login.php';
            fetch(url,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: this.state.email,
                        password: this.state.password,
                        device_id: DeviceInfo.getUniqueId(),
                        token: this.state.fcmtoken,
                    }),
                })
                .then((response) => response.json())
                .then((responseJson) => {
                    //console.warn(responseJson.user.temporary_passwrod);
                    console.log(responseJson);
                    //console.warn(responseJson.user.hasPet);
                    //this.loadingButton.showLoading(false);
                    if (responseJson.status === 'ok') {
                        let user_id = responseJson.user.uid;
                        this._signInAsync(responseJson);
                    } else if (responseJson.status === 'not_verified') {

                        // alert(responseJson.msg);
                        Alert.alert(
                            'Email Verification',
                            responseJson.msg,
                            [
                                { text: 'Cancel', onPress: () => { this.setState({ cancel: false }) }, style: 'cancel' },
                                { text: 'OK', onPress: () => this.verifyEmail(responseJson.uid) },
                            ],
                            { cancelable: false }
                        );

                    } else {
                        alert(responseJson.error);
                    }
                })
                .catch((error) => {
                    this.loadingButton.showLoading(false);
                    alert('Something went wrong!');
                    console.warn(error);
                })

        }
    }

    render() {
        const { navigate } = this.props.navigation;
        if (this.state.isLoading) {
            return (
                <View style={{ flex: 1, padding: 20 }}>
                    <ActivityIndicator />
                </View>
            )
        }
        return (
            <View style={styles.maincontainer}>
                <ScrollView style={styles.container}>
                    <Image
                        style={styles.logoStyle}
                        source={require('./images/logo.png')}
                        resizeMethod="auto"
                    />
                    <Text style={styles.welcomeStyle} >Welcome Back</Text>
                    <Text style={styles.slogon} >Making video consultations</Text>
                    <Text style={styles.slogon} >with your vet easy</Text>

                    <TextInput placeholder="Email"
                        returnKeyType="next"
                        underlineColorAndroid="transparent"
                        placeholderTextColor='#555'
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={styles.input}
                        selectionColor={'white'}
                        onChangeText={this.updatEmail}
                    />
                    <TextInput placeholder="Password"
                        secureTextEntry={true}
                        returnKeyType="go"
                        underlineColorAndroid="transparent"
                        placeholderTextColor='#555'
                        ref={(input) => this.passwordInput = input}
                        style={styles.input}
                        onChangeText={this.updatePassword}

                    />
                    <View style={styles.buttoncontainer}>
                        {/* <AnimateLoadingButton
                            ref={c => (this.loadingButton = c)}
                            width={350}
                            height={80}
                            title="Login"
                            titleFontSize={20}
                            titleColor="#FFFFFF"
                            backgroundColor="#09B5B5"
                            borderRadius={40}
                            onPress={() => this.login(this.state.email, this.state.password)}
                        /> */}
                        <TouchableOpacity onPress={() => this.login(this.state.email, this.state.password)} style={styles.button}>
                            <Text style={styles.textcolor}>Login</Text>
                        </TouchableOpacity>
                        <Text style={styles.Textlink}>Don't have an account? <Text style={styles.link} onPress={() => navigate('RegisterPractice')} >Register</Text></Text>
                        <Text style={styles.link} onPress={() => navigate('ForgotPassword')} >Forgot your password?</Text>
                    </View>
                </ScrollView>
            </View>
        );
    }

    _signInAsync = async (json) => {
        const value = JSON.stringify(json);
        // console.log(json);
        await AsyncStorage.setItem('userToken', value);
        await AsyncStorage.setItem('temporary_passwrod', json.user.temporary_passwrod);
        this.setState({ isLoading: false });
        if (json.user.temporary_passwrod == 1) {
            console.log(json);
            this.props.navigation.navigate('ChangePassword');
        }
        else if (json.user.hasPet === 0) {
            this.props.navigation.navigate('AddFirstPet');
        }
        else {

            this.props.navigation.navigate('App');
        }
        //this.props.navigation.navigate('AddFirstPet');

    };

}
const styles = StyleSheet.create({
    maincontainer: {
        flex: 1,
        backgroundColor: '#26cccc',
    },
    container: {
        flex: 1,
        paddingHorizontal: 30,
        marginTop: 10,
    },
    logoStyle: {

        alignSelf: "center",
        width: 100,
        height: 100,
        marginVertical: 30

    },
    welcomeStyle: {
        color: '#ffffff',
        alignSelf: "center",
        fontWeight: "500",
        marginBottom: 10,
        fontSize: 35,
    },
    slogon: {
        color: '#ffffff',
        alignSelf: "center",
        marginBottom: 10,
        fontSize: 20,
    },
    input: {
        height: 50,
        backgroundColor: '#F6F6F6',
        marginBottom: 20,
        paddingHorizontal: 10,
        borderRadius: 0,
        // borderColor: '#F6F6F6',
        //borderWidth:2
    },
    buttoncontainer: {
        marginTop: 20,
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
    pagetitle: {
        justifyContent: 'center',
        fontSize: 20,
        marginBottom: 15,
    },

    link: {
        color: '#ffffff',
        fontSize: 20,
        alignSelf: 'center',
        marginTop: 10
    },
    Textlink: {
        color: '#ffffff',
        fontSize: 18,
        alignSelf: 'center',
        marginTop: 10,
    }

});