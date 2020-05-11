import React, { Component } from 'react';
import {
    Platform,
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
    ProgressViewIOS,
    ProgressBarAndroid,
    Image,
    Alert
} from 'react-native';
import Constant from './Constants';
export default class RegisterScreen4 extends Component {
    static navigationOptions = {
        title: 'Register',
        headerStyle: {
            backgroundColor: '#26cccc',
        },
        headerTintColor: '#fff',
    };
    constructor(props) {
        super(props)
        this.state = {
            verificationCode: '',
            user_id: this.props.navigation.state.params.user_id

        },
            this.navigation;
    }
    updateVerificationCode = (text) => {
        this.setState({ verificationCode: text })
    }
    resend = () => {
        const url = Constant.rootUrl + `webservices/resend-verification-otp.php?uid=${this.state.user_id}`;
        fetch(url)
            .then((response) => response.json())
            .then((responseJson) => {
                console.warn(responseJson);
                if (responseJson.status === 'ok') {
                    alert("Resend mail has been sent");
                } else {
                    alert("Something went wrong!");
                }
                this.setState({ isLoading: false });
            })
            .catch((error) => {
                alert('Something went wrong!');
                console.warn(error);
            })
    }
    verification = () => {
        if (this.state.verificationCode == '') {
            alert('Please enter verification code!')
        } else {
            const url = Constant.rootUrl + 'webservices/email-verify.php';
            fetch(url,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        verification_code: this.state.verificationCode,
                        user_id: this.state.user_id,
                    }),
                })
                .then((response) => response.json())
                .then((responseJson) => {
                    console.warn(responseJson);
                    if (responseJson.status === 'ok') {
                        Alert.alert('Video With My Vet', 'Registration successfull! Please login');
                        this.props.navigation.navigate('AuthLoading');
                    } else {
                        alert(responseJson.error);
                    }
                    this.setState({ isLoading: false });
                })
                .catch((error) => {
                    alert('Something went wrong!');
                    console.warn(error);
                })
        }
    }


    render() {
        const { navigate } = this.props.navigation;
        //alert(this.state.user_id);
        //const user_id = this.props.navigation.state.params.user_id;
        return (
            <View style={styles.maincontainer}>
                <ScrollView style={styles.container}>
                    <Image
                        style={styles.logoStyle}
                        source={require('./images/logo.png')}
                        resizeMethod="auto"
                    />
                    {/*
                        (Platform.OS === 'android')
                            ?
                            (<ProgressBarAndroid styleAttr="Horizontal" progress={0.0} indeterminate={false} />)
                            :
                            (<ProgressViewIOS
                                style={styles.progressBar}
                                progress={1}
                                progressTintColor={'#3399FF'}
                            />)
                            */ }
                    <Text style={styles.confirmText}>
                        A confirmation code has been sent in an email to the email address you provided.
                        Please enter the confirmation code in the box below and click verify.
                    </Text>
                    <Text style={styles.confirmText}>
                        (If you cannot find the verification email please check your SPAM or Junk folders.)
                    </Text>
                    <TextInput placeholder="Verification Code"
                        secureTextEntry={true}
                        returnKeyType="go"
                        underlineColorAndroid="transparent"
                        placeholderTextColor='#555'
                        ref={(input) => this.passwordInput = input}
                        style={styles.input}
                        onChangeText={this.updateVerificationCode}
                    />
                    <View style={styles.buttoncontainer}>
                        <TouchableOpacity onPress={this.resend} style={styles.button}>
                            <Text style={styles.textcolor}>Resend email verification?</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.verification} style={styles.button}>
                            <Text style={styles.textcolor}>Verify</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this._prevInAsync} style={styles.button}>
                            <Text style={styles.textcolor}>Previous</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </View>
        );
    }

    _prevInAsync = async () => {
        this.props.navigation.navigate('Register');
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
    input: {
        height: 50,
        backgroundColor: '#F6F6F6',
        marginBottom: 20,
        paddingHorizontal: 10,
        borderRadius: 0,
    },
    picker: {
        height: 50,
        width: 100
    },
    buttoncontainer: {
        marginTop: 40,
    },
    logoStyle: {
        alignSelf: "center",
        width: 100,
        height: 100,
        marginVertical: 20

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
        color: '#ffffff',
        fontSize: 20
    },
    confirmText: {
        marginBottom: 10,
        color: '#ffffff',
        //fontSize: 10
    },
    progressBar: {
        transform: [{ scaleX: 1.0 }, { scaleY: 6 }],
        marginTop: 8,
        marginBottom: 15,
    }

});