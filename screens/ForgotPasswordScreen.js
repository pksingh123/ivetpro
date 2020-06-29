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
    TouchableOpacity,
} from 'react-native';
import Constant from './Constants';
import AnimateLoadingButton from 'react-native-animate-loading-button';
export default class ForgotPasswordScreen extends Component {
    static navigationOptions = {
        title: 'Forgot Password',
        headerTintColor: '#ffffff',
        headerStyle: {
            backgroundColor: '#26cccc',
            color: '#fff'
        },
    };
    constructor(props) {
        super(props)
        this.state = {
            checked: false,
            isLoading: true,
            email: '',
        },
            this.navigation;
    }
    updateEmail = (text) => {
        this.setState({ email: text })
    }
    forgotPassword = () => {
        if (this.state.email == '') {
            alert("Please enter email!");
        }
        else {
            // alert(this.state.email);
            const url = Constant.rootUrl + 'webservices/reset-password.php';
            fetch(url,
                {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: this.state.email,
                    }),
                })
                .then((response) => response.json())
                .then((responseJson) => {
                    console.warn(responseJson);
                    if (responseJson.status === 'ok') {
                        alert(responseJson.success);
                        this.props.navigation.navigate('Login');
                    } else {
                        alert(responseJson.error);
                    }
                })
                .catch((error) => {
                    // alert('Something went wrong!');
                    console.warn(error);
                })
        }
    }

    render() {
        return (
            <View style={styles.maincontainer}>
                <ScrollView style={styles.container}>
                    <Text style={styles.pagetitle}>To reset your password, please enter your email address below:</Text>
                    <TextInput placeholder="Please enter your email"
                        returnKeyType="next"
                        underlineColorAndroid="transparent"
                        placeholderTextColor='#555'
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={styles.input}
                        onChangeText={this.updateEmail}
                    />
                    {/* <AnimateLoadingButton
                        ref={c => (this.loadingButton = c)}
                        width={350}
                        height={80}
                        title="Reset my password"
                        titleFontSize={20}
                        titleColor="#FFFFFF"
                        backgroundColor="#09B5B5"
                        borderRadius={40}
                        onPress={this.forgotPassword}
                    /> */}
                    <TouchableOpacity onPress={this.forgotPassword} style={styles.buttoncontainer}>
                        <Text style={styles.textcolor}>Reset my password</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        );
    }
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
    pagetitle: {
        color: '#ffffff',
        justifyContent: 'center',
        fontSize: 20,
        marginBottom: 15,
    },
    input: {
        height: 50,
        backgroundColor: '#F6F6F6',
        marginBottom: 20,
        paddingHorizontal: 10,
        borderRadius: 0,
    },
    buttoncontainer: {
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
    }

});