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
    Alert,
    Picker,
    ProgressViewIOS,
    ProgressBarAndroid,
    Animated,
    Image,
    Dimensions,
    Modal,
    TouchableHighlight
} from 'react-native';
import Constant from './Constants';
import Autocomplete from 'react-native-autocomplete-input';
import { CheckBox } from 'react-native-elements';
import { WebView } from 'react-native-webview';
import RNPasswordStrengthMeter from 'react-native-password-strength-meter';
import DeviceInfo from 'react-native-device-info';

export default class RegisterScreen extends Component {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props)
        this.state = {
            checked: false,
            isLoading: true,
            firstName: '',
            lastName: '',
            email: '',
            mobile: '',
            Password: '',
            confirmPass: '',
            practiceCode: '',
            practiceCodeId: '',
            postalCode: '',
            registerButton: true,
            emailIsNotValid: false,
            query: '',
            items: [

            ],
            practicecodesDetails: [

            ],
            serverData: [],
            itemSelected: true,
            openPopup: false,
            fcmtoken: '',
            firstNameValidation: true,
            lastNameValidation: true,
            mobileValidation: true,

        }



        //            this.navigation;
    }
    onChange = (password, score, { label, labelColor, activeBarColor }) => {
        this.setState({ password: password })
        console.log(password, score, { label, labelColor, activeBarColor });
    }
    updatePracticeCode = (item) => {
        this.setState({ itemSelected: false, query: item.name, practiceCode: item.name, practiceCodeId: item.id, postalCode: this.state.practicecodesDetails[item.id] });
    }
    updatFirstName = (text) => {
        this.setState({ firstName: text })
    }
    updatLastName = (text) => {
        this.setState({ lastName: text })
    }
    updatEmail = (text) => {
        let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (reg.test(text)) {
            this.setState({ emailIsNotValid: false })
        } else {
            this.setState({ emailIsNotValid: true })
        }
        this.setState({ email: text })

    }
    updatMobile = (text) => {
        let reg = /^[\+\d]?(?:[\d-\s()]*)$/;
        if (reg.test(text) && text.length > 6 && text.length < 14) {
            this.setState({ mobileValidation: true });
        } else {
            this.setState({ mobileValidation: false });
        }
        this.setState({ mobile: text })
    }
    updatPassword = (text) => {
        this.setState({ password: text })
    }
    updatConfirmPass = (text) => {
        this.setState({ confirmPass: text })
    }
    _poenPopup = () => {
        this.setState({ openPopup: true });
    }
    _closePopup = () => {
        this.setState({ openPopup: false });
    }
    async componentDidMount() {
        let fcmToken = await AsyncStorage.getItem('fcmToken');
        this.setState({ fcmtoken: fcmToken });
        console.log(this.state.fcmtoken);
        const { params } = this.props.navigation.state;
        this.setState({
            practiceCodeId: params.practice_id,
            postalCode: params.postalCode,
            practiceCode: params.practiceCode
        });
        const url = Constant.rootUrl + 'webservices/get-practice-code-list.php';
        fetch(url)
            .then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.status === 'ok') {
                    this.setState({
                        isLoading: false
                    })
                    this.setState({
                        items: responseJson.practicecodes,
                        practicecodesDetails: responseJson.practicecodesDetails
                    })
                } else {
                    alert(responseJson.status);
                }
            })
            .catch((error) => {
                alert('Something went wrong!');
                console.warn(error);
            })
    }
    findPractice(query) {
        if (query === '') {
            return [];
        }

        const { items } = this.state;
        //const regex = new RegExp(`${query.trim()}`, 'i');
        //return items.filter(item => items.name.search(regex) >= 0);
        return items.filter(function (item) {
            //console.warn(item);
            const itemData = item.name ? item.name.toUpperCase() : ''.toUpperCase();
            const textData = query.toUpperCase();
            return itemData.indexOf(textData) > -1;
        });
    }

    register = () => {

        if (this.state.firstName == '' || this.state.lastName == '' || this.state.email == '' || this.state.password == '' || this.state.confirmPass == '') {
            alert("Please fill all fields");
            return false;
        }
        if (!this.state.firstNameValidation) {
            alert("Please enter valid first name");
            return false;
        }

        if (!this.state.lastNameValidation) {
            alert("Please enter valid last name");
            return false;
        }
        if (!this.state.mobileValidation) {
            alert("Please enter valid phone number");
            return false;
        }
        var paswd = /^(?=.*[0-9])(?=.*[~!@#$%^&*()_+?><.,:-;])[a-zA-Z0-9~!@#$%^&*()_+?><.,:-;]{10,15}$/;
        if (paswd.test(this.state.password) === false) {
            alert('Password requires 10 to 15 chars, letters, numbers, capital letter and one of these special chars @ _ ; : .');
            return false;
        }
        console.warn(this.state.email + '&' + this.state.password + '&' + this.state.firstName + '&' + this.state.lastName + '&' + this.state.mobile + '&' + this.state.practiceCode + '&' + this.state.practiceCodeId + '&' + this.state.postalCode);
        if (this.state.password != this.state.confirmPass) {
            alert('password and confirm password not match');
        } else if (this.state.emailIsNotValid === true) {
            alert('Please enter a valid email!');
        }
        else {
            this.setState({
                isLoading: true
            })
            const url = Constant.rootUrl + 'webservices/user-register.php';
            fetch(url,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: this.state.email,
                        password: this.state.password,
                        first_name: this.state.firstName,
                        last_name: this.state.lastName,
                        phone_number: this.state.mobile,
                        company_name: this.state.practiceCode,
                        practice_id: this.state.practiceCodeId,
                        postal_code: this.state.postalCode,
                        device_id: DeviceInfo.getUniqueId(),
                        token: this.state.fcmtoken
                    }),
                })
                .then((response) => response.json())
                .then((responseJson) => {
                    console.log(responseJson);
                    this.setState({
                        isLoading: false
                    })
                    if (responseJson.status === 'ok') {

                        this.props.navigation.navigate('Register4', { user_id: responseJson.uid });

                    } else if (responseJson.status === 'exist') {
                        alert(responseJson.msg);
                    } else {
                        console.warn(responseJson.error);
                    }

                })
                .catch((error) => {
                    alert('Something is wrong in getting data');
                    console.warn(error);
                })
        }
    }

    _termAndCondition(text) {

    }
    setModalVisible(visible) {
        this.setState({ openPopup: visible });
    }
    ontouch = (item) => {
        console.log(item);
    }
    renderItems = ({ item }) => {
        if (this.state.itemSelected) {
            return (
                <TouchableOpacity onPress={() => this.updatePracticeCode(item)}>
                    <Text style={styles.itemText}>
                        {item.name}
                    </Text>
                </TouchableOpacity>
            );
        } else {
            return null;
        }


    }
    firstNameValidation = (firstName) => {
        let regex = /^[a-zA-Z]+$/;

        if (regex.test(firstName) && firstName.length < 16) {
            // console.log(" no  special ", firstName)
            this.setState({ firstNameValidation: true });
        } else {
            //console.log("yes special ", firstName);
            this.setState({ firstNameValidation: false });
        }
        this.setState({ firstName: firstName })
    }
    lastNameValidation = (lastName) => {

        let regex = /^[a-zA-Z]+$/;

        if (regex.test(lastName) && lastName.length < 16) {
            //console.log(" no  special ", lastName)
            this.setState({ lastNameValidation: true });
        } else {
            // console.log("yes special ", lastName);
            this.setState({ lastNameValidation: false });
        }
        this.setState({ lastName: lastName });
    }

    termandconditionTexteee = () => {
        return (

            <Text style={styles.textColor}>
                I agree to the  <Text onPress={() => this.setState({ openPopup: true })} style={{
                    color: '#fff', marginLeft: 20, fontSize: 20

                }}>terms and conditions</Text>
            </Text>

        )
    }
    render() {
        const { navigate } = this.props.navigation;
        const { query } = this.state;
        const items = this.findPractice(query);
        const comp = (a, b) => a.toLowerCase().trim() === b.toLowerCase().trim();

        /* var practiceDetailsText = this.state.practiceCodeId ?
            <Text style={styles.searchText}>{this.state.practicecodesDetails[this.state.practiceCodeId].name}, {this.state.practicecodesDetails[this.state.practiceCodeId].address}, {this.state.practicecodesDetails[this.state.practiceCodeId].postal_code}, {this.state.practicecodesDetails[this.state.practiceCodeId].phone_no}</Text>
            : null */
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
                <ScrollView style={styles.container}>
                    <Image
                        style={styles.logoStyle}
                        source={require('./images/logo.png')}
                        resizeMethod="auto"
                    />
                    <Text style={styles.slogon}>Create Account</Text>
                    <Text style={styles.slogonText}>To get you setup, we first register your details. Later we can add your pet(s) and book an appointment.</Text>
                    <View style={styles.innerContainer}>
                        {!this.state.firstNameValidation ?
                            <Text style={styles.validation}>Only alphabets and max 15 character.</Text> : null
                        }
                        <TextInput placeholder="First Name"
                            underlineColorAndroid="transparent"
                            placeholderTextColor='#555'
                            ref={(input) => this.passwordInput = input}
                            style={styles.input}
                            onChangeText={this.firstNameValidation}
                            // onChangeText={(text) => this.setState({ firstName: text })}

                            returnKeyType="next"
                            value={this.state.firstName}

                        />
                        {!this.state.lastNameValidation ?
                            <Text style={styles.validation}>Only alphabets and max 15 character.</Text> : null}
                        <TextInput placeholder="Last Name"
                            underlineColorAndroid="transparent"
                            placeholderTextColor='#555'
                            ref={(input) => this.passwordInput = input}
                            style={styles.input}
                            onChangeText={this.lastNameValidation}
                            // onChangeText={(text) => this.setState({ lastName: text })}
                            returnKeyType="next"
                            value={this.state.lastName}

                        />
                        {this.state.emailIsNotValid ?
                            <Text style={styles.validation}>Enter valid email id </Text> : null}
                        <TextInput placeholder="Email Address"
                            returnKeyType="next"
                            underlineColorAndroid="transparent"
                            placeholderTextColor='#555'
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            style={styles.input}
                            onChangeText={(text) => this.updatEmail(text)}
                            // onChangeText={this.updatEmail}
                            // onChangeText={(text) => this.setState({ email: text })}
                            value={this.state.email}
                        />
                        {!this.state.mobileValidation ?
                            <Text style={styles.validation}>Enter valid phone number </Text> : null}
                        <TextInput placeholder="Mobile"
                            returnKeyType="next"
                            underlineColorAndroid="transparent"
                            placeholderTextColor='#555'
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            style={styles.input}
                            onChangeText={this.updatMobile}
                            // onChangeText={(text) => this.setState({ mobile: text })}
                            value={this.state.mobile}
                        />
                    </View>

                    <RNPasswordStrengthMeter
                        onChangeText={this.onChange}
                        containerWrapperStyle={styles.containerWrapperStyle}
                        imageWrapperStyle={styles.imageWrapperStyle}
                        imageStyle={styles.imageStyle}
                        inputWrapperStyle={styles.inputWrapperStyle}
                        inputStyle={styles.inputStyle}
                        meterType="bar"
                        minLength="10"
                    />
                    <View style={styles.innerContainer}>

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


                        <View style={{ flexDirection: 'column' }}>
                            <View style={{ flexDirection: 'row' }}>
                                <CheckBox
                                    containerStyle={styles.checkBoxContainer}
                                    checkedColor='#26cccc'
                                    uncheckedColor='#ffffff'
                                    size={24}
                                    center={true}
                                    checked={this.state.checked}
                                    onPress={() => this.setState({ checked: !this.state.checked, registerButton: !this.state.checked ? false : true, })}
                                />
                                <Text style={styles.textColor}>
                                    I agree to the
                                     <Text onPress={() => this.setState({ openPopup: true })}
                                        style={styles.subTextColor}> terms and conditions</Text>
                                </Text>
                            </View>
                        </View>

                        <View style={styles.buttoncontainer}>

                            <TouchableOpacity onPress={this.register} disabled={this.state.registerButton} style={styles.button}>
                                <Text style={styles.textcolor}>Create account</Text>
                            </TouchableOpacity>
                            <Text style={styles.Textlink}>Already have an account? <Text style={styles.link} onPress={() => navigate('Login')} >Login</Text></Text>
                        </View>
                    </View>
                </ScrollView>
                <View style={{ padding: 5 }}>
                    <Modal
                        animationType="slide"
                        transparent={false}
                        visible={this.state.openPopup}
                        onRequestClose={() => {
                            this.setState({ openPopup: false });
                        }}>

                        <TouchableHighlight
                            onPress={() => {
                                this.setModalVisible(false);
                            }}>
                            <Text style={styles.closeStyle}>X</Text>
                        </TouchableHighlight>
                        <WebView
                            source={{ uri: Constant.rootUrl + 'terms-conditions/' }}
                            style={{ marginTop: 20 }}
                        />

                    </Modal>
                </View>

            </View>
        );
    }

    _cancelInAsync = async () => {
        this.props.navigation.navigate('Login');
    };

    _webview = () => {

        return (
            <WebView
                source={{ uri: Constant.rootUrl + 'terms-conditions/' }}
                style={{ marginTop: 20 }}
            />
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

    itemText: {
        fontSize: 15,
        margin: 2,
        color: '#555'
    },
    logoStyle: {
        alignSelf: "center",
        width: 100,
        height: 100,
        marginVertical: 20

    },
    closeStyle: {
        marginRight: 15,
        marginTop: 10,
        fontSize: 20,
        textAlign: 'right'
    },
    link: {
        color: '#ffffff',
        fontSize: 20,
        alignSelf: 'center',
        marginBottom: 10,
    },
    containerStyle: {
        paddingHorizontal: 30,

    },
    innerContainer: {
        //  paddingHorizontal: 10,

    },
    slogon: {
        color: '#ffffff',
        alignSelf: "center",
        marginBottom: 10,
        fontSize: 25,
    },
    slogonText: {
        color: '#ffffff',
        alignSelf: "center",
        marginBottom: 10,
        fontSize: 18,
    },

    headingstyle: {
        fontSize: 20,
        color: '#000',
        alignSelf: "center",
        marginBottom: 10,
        padding: 10,
    },
    textInputStyle: {
        padding: 12,
        borderWidth: 2,
        borderColor: '#d2d4d6',
        backgroundColor: '#ffffff',
    },
    itemStyle: {
        padding: 10,
        marginTop: 2,
        backgroundColor: '#ffffff',
    },
    itemTextStyle: {
        color: '#222',
        paddingHorizontal: 20,
    },
    containerWrapperStyle: {
        flex: 1,
        width: '100%',
        alignSelf: 'stretch',
        marginBottom: 25,
        fontSize: 18,
        marginStart: -10,

    },
    validation: {
        color: '#ff0000'
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
    input: {
        height: 50,
        backgroundColor: '#F6F6F6',
        marginBottom: 20,
        paddingHorizontal: 10,
        borderRadius: 0,
    },
    checkBoxContainer: {
        backgroundColor: '#fff',
        width: 26,
        height: 26,
        borderWidth: 0,
        padding: 0,
        margin: 0,
        marginTop: 2

    },
    textColor: {
        color: '#fffccc',
        marginTop: 0,
        fontSize: 18,
    },
    subTextColor: {
        color: '#fff',
        marginLeft: 20,
        fontSize: 18
    },

    picker: {
        height: 50,
        backgroundColor: '#ffffff',
        paddingHorizontal: 10,
        borderRadius: 0,
        marginTop: 20,
        marginBottom: 20,
        //borderColor: '#d2d4d6',
        borderWidth: 0
    },
    pickerItem: {
        height: 44,
        color: "#fff",
        fontSize: 17
    },
    buttoncontainer: {
        marginTop: 30,
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
    activityIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 80
    },
    scrollView: {
        position: "absolute",
        bottom: 30,
        left: 0,
        right: 0,
        paddingVertical: 10,
    },
    searchText: {
        //marginBottom: 5,
        marginLeft: 10,
        marginTop: 35,
        textAlign: 'center',
        paddingHorizontal: 30,
    },
    Textlink: {
        color: '#ffffff',
        fontSize: 18,
        alignSelf: 'center',
        marginTop: 10,
    }
});