import React, { Component } from 'react';
import {
    TextInput,
    TouchableOpacity,
    StyleSheet,
    AsyncStorage,
    View,
    Text,
    Alert,
    Platform,
    BackHandler,
    ActivityIndicator,
    Button,
    StatusBar
} from 'react-native';
import Constant from './Constants';
import { Icon, Avatar, Divider } from 'react-native-elements';
import Icons from 'react-native-vector-icons/FontAwesome';
import { HeaderBackButton } from 'react-navigation';
import Stripe from 'react-native-stripe-api';
import Dialog, { DialogTitle, DialogFooter, DialogButton, DialogContent } from 'react-native-popup-dialog';
const paymentRequestUrl = Constant.rootUrl + 'webservices/stripe-pay.php';

export default class BookingConfirmationScreen extends Component {

    static navigationOptions = ({ navigation }) => {
        const item = navigation.state.params.item;
        if (navigation.state.params.firstapp == 1) {
            return {
                title: 'Booking Confirmation',
                headerLeft: <HeaderBackButton onPress={() => navigation.push('AddAnotherPet', { petName: navigation.state.params.pName, petId: navigation.state.params.pId })} />,
                headerLeftContainerStyle: {
                    marginTop: StatusBar.currentHeight
                },
                headerTintColor: '#ffffff',
                headerStyle: {
                    backgroundColor: '#26cccc',
                    color: '#fff'
                },
            }
        } else {
            return {
                title: 'Booking Confirmation',
                //headerLeft: <HeaderBackButton onPress={() => navigation.navigate('Home')} />,
                headerTintColor: '#ffffff',
                headerLeftContainerStyle: {
                    marginTop: StatusBar.currentHeight
                },
                headerStyle: {
                    backgroundColor: '#26cccc',
                    color: '#fff'
                },
            }
        }
    };

    constructor(props) {
        super(props);
        this.state = {
            patientName: 'Patient Name:',
            practiceName: 'Practice Name:',
            species: 'Species:',
            sex: 'Sex',
            date_time: 'Date & Time:',
            total_amount: 'Total Fee:',
            status: 'Status:',
            payment: 'Payment/Video Call:',
            cancel: 'Cancel/Refund',
            appointmentStatus: '',
            pay: true,
            isLoading: true,
            visible: false,
            refundVisible: false,
            paymentVisible: false,
            cancel: false,
            cancelreason: '',
            refundreason: '',
            confrence_url: '',
            cardNumber: '',
            expMonth: '',
            expYear: '',
            cvc: '',
            token: '',
            email: '',
            uid: '',
            bookingId: '',
            paymentButtonShow: true,
            paymentContainer: true,
            paymentSuccessBtnShow: false,
            paymentSuccessMessageShow: false,
            paymentErrorMessageShow: false,
            paymentSuccessMessage: '',
            paymentProcessing: false,
            paymentErrorMessage: '',
            isLoading: true,
            bookingData: {},
            practice_id: '',
            apiKey: '',
            firstapps: '',
            currencySymbol: '',


        }
        this._goBack = this._goBack.bind(this);
    }
    async componentWillMount() {

        BackHandler.addEventListener('hardwareBackPress', this._goBack);


    }
    async componentWillUnmount() {

        BackHandler.removeEventListener('hardwareBackPress', this._goBack);

    }
    _goBack() {

        this.props.navigation.navigate('Home');
        return true;
    }
    componentDidMount() {
        const bookingId = this.props.navigation.state.params.bookingId;
        const firstappointment = this.props.navigation.state.params.firstapp ? this.props.navigation.state.params.firstapp : '';
        this.setState({ bookingId: bookingId, firstapps: firstappointment })
    }
    async componentWillMount() {
        this.props.navigation.setParams({ logout: this._signOutAsync });
        const userToken = await AsyncStorage.getItem('userToken');
        if (userToken) {
            userDetails = JSON.parse(userToken);
            // console.warn(userDetails);
            this.setState({
                uid: userDetails.user.uid,
                practice_id: userDetails.user.practice.practice_id,
                currencySymbol: userDetails.user.practice.currencys_symbol,
            });
        } else {
            this.setState({ uid: false })
        }
        const url = Constant.rootUrl + 'webservices/booking-appointment.php?action=BookingConfirmation&uid=' + this.state.uid + '&bookingId=' + this.state.bookingId;
        console.warn(url);
        fetch(url)
            .then((response) => response.json())
            .then((responseJson) => {
                // console.log("confirmation booking ", responseJson);
                if (responseJson.status === 'ok') {
                    this.setState({
                        bookingData: responseJson.booking_data,
                        isLoading: false
                    })
                    // console.warn(this.state);
                } else {
                    alert(responseJson.status);
                }
            })
            .catch((error) => {
                // alert('Something went wrong  from !');
                console.warn(error);
            })

    }

    _paymentRequest = () => {

        if (this.state.cardNumber == '' || this.state.expMonth == '' || this.state.expYear == '' || this.state.cvc == '') {
            alert('Enter correct card details.');
            return;
        }
        //const apiKey = 'pk_test_8m4FhXKfFi1sd2GFuWHDyGNh00sSApCudF';
        this.setState({
            paymentButtonShow: false,
            paymentProcessing: true,
            paymentContainer: false,
            paymentErrorMessageShow: false,

        });
        const client = new Stripe(this.state.apiKey);

        client.createToken({
            number: this.state.cardNumber,
            exp_month: this.state.expMonth,
            exp_year: this.state.expYear,
            cvc: this.state.cvc,
        }).then((resp) => {

            console.log("payment done1 ", resp);

            if (resp.id) {
                this.setState({
                    token: resp.id
                });

                fetch(paymentRequestUrl,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            "email": this.state.bookingData.email,
                            "uid": this.state.bookingData.uid,
                            "token": resp.id,
                            "amount": this.state.bookingData.amount,
                            "currency": "GBP",
                            "description": "Video Consultant",
                            "bookingId": this.state.bookingId,
                            "practice_id": this.state.practice_id,
                        }),
                    })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        console.log("payment done ", responseJson);
                        this.setState({ isLoading: false });
                        if (responseJson.status === 'ok') {
                            this.setState({
                                paymentButtonShow: false,
                                paymentContainer: false,
                                paymentSuccessBtnShow: true,
                                paymentSuccessMessageShow: true,
                                paymentErrorMessageShow: false,
                                paymentProcessing: false,
                                paymentSuccessMessage: responseJson.msg,
                                appointmentStatus: 2,
                            });
                        } else {
                            this.setState({
                                paymentButtonShow: true,
                                paymentContainer: true,
                                paymentSuccessBtnShow: false,
                                paymentSuccessMessageShow: false,
                                paymentErrorMessageShow: true,
                                paymentProcessing: false,
                                paymentErrorMessage: responseJson.msg,
                                appointmentStatus: 1,
                            });
                            alert('We are very sorry that your payment has failed. This is probably due to a connection error but if you get the same error again, please do check your card details.');
                        }
                    })
                    .catch((error) => {
                        // alert('Something went wrong!');
                        console.warn(error);
                        this.setState({
                            paymentButtonShow: true,
                            paymentProcessing: false,
                            paymentContainer: true,

                        });
                    })
            }
            else {
                this.setState({
                    paymentButtonShow: true,
                    paymentContainer: true,
                    paymentSuccessBtnShow: false,
                    paymentSuccessMessageShow: false,
                    paymentErrorMessageShow: true,
                    paymentProcessing: false,
                    paymentErrorMessage: "Card details are wrong.",
                    appointmentStatus: 1,
                });

            }
        }).catch((e) => {
            console.warn(e);
            this.setState({
                paymentButtonShow: true,
                paymentProcessing: false,
                paymentContainer: true,

            });
        });

    }

    _paymentOpenPopup = () => {
        this.setState({ isLoading: true, });
        this.setState({
            paymentButtonShow: true,
            paymentProcessing: false,
            paymentContainer: true,
            paymentErrorMessageShow: false,

        });

        const url1 = Constant.rootUrl + 'webservices/booking-appointment.php?action=GetPubKey&practice_id=' + this.state.practice_id;
        fetch(url1)
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState({ isLoading: false, });
                if (responseJson.status === 'ok') {
                    this.setState({ apiKey: responseJson.key.publishable_key, paymentVisible: true })
                    //  console.log(this.state.apiKey);
                } else {
                    alert(responseJson.status);
                }
            })
            .catch((error) => {
                // alert('Something went wrong!');
                console.warn(error);
            })

    }
    _paymentClosePopup = (paymentDone) => {
        this.setState({
            paymentButtonShow: true,
            paymentProcessing: false,
            paymentContainer: true,

        });
        if (paymentDone == true) {
            this.setState({ paymentVisible: false, pay: false });
        } else {
            this.setState({ paymentVisible: false, pay: true });
        }

        //
        //  this._goBack();
    }



    render() {
        const params = 'platform=' + Platform.OS;
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

                <View style={styles.details}>
                    <Text style={styles.heading}>BOOKING DETAILS</Text>
                    <Text style={styles.baseStyle}>
                        <Text style={styles.labelStyle}>{this.state.patientName}</Text>
                        <Text style={styles.textStyle}> {this.state.bookingData.patientName}</Text>
                    </Text>
                    <Text style={styles.baseStyle}>
                        <Text style={styles.labelStyle}>{this.state.practiceName}</Text>
                        <Text style={styles.textStyle}> {this.state.bookingData.practice}</Text>
                    </Text>
                    <Text style={styles.baseStyle}>
                        <Text style={styles.labelStyle}>{this.state.species}</Text>
                        <Text style={styles.textStyle}> {this.state.bookingData.species}</Text>
                    </Text>
                    <Text style={styles.baseStyle}>
                        <Text style={styles.labelStyle}>{this.state.date_time}</Text>
                        <Text style={styles.textStyle}> {this.state.bookingData.date_time}</Text>
                    </Text>
                    <Text style={styles.baseStyle}>
                        <Text style={styles.labelStyle}>{this.state.total_amount}</Text>
                        <Text style={styles.textStyle}> {this.state.currencySymbol} {this.state.bookingData.amount}</Text>
                    </Text>

                    <Text style={styles.baseStyle}>
                        <Text style={styles.labelStyle}>Email:</Text>
                        <Text style={styles.textStyle}> {this.state.bookingData.email}</Text>
                    </Text>
                    <Text style={styles.baseStyle}>
                        <Text style={styles.labelStyle}>Phone:</Text>
                        <Text style={styles.textStyle}> {this.state.bookingData.phone}</Text>
                    </Text>
                    {this.state.bookingData.amount > 0 && this.state.pay ?
                        <View>
                            <TouchableOpacity onPress={() => this._paymentOpenPopup()} style={styles.button}>
                                <Text style={styles.textcolor}>Pay Now ({this.state.currencySymbol} {this.state.bookingData.amount})</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.state.firstapps == 1 ? this.props.navigation.push('AddAnotherPet', { petName: this.state.bookingData.patientName, petId: this.state.bookingData.patientId }) : this._goBack()} style={styles.button}>
                                <Text style={styles.textcolor}>Pay Later</Text>
                            </TouchableOpacity>
                        </View>
                        :
                        <View>
                            <TouchableOpacity onPress={() => this._goBack()} style={styles.button}>
                                <Text style={styles.textcolor}>Back</Text>
                            </TouchableOpacity>
                        </View>
                    }
                </View>
                {/* Payment  Dialog */}

                <Dialog
                    visible={this.state.paymentVisible}
                    useNativeDriver

                    dialogTitle={<DialogTitle title="Enter card details" />}
                    width={0.9}
                    footer={
                        <DialogFooter>
                            {
                                this.state.paymentButtonShow ?
                                    <View style={styles.dialogContainer}>
                                        <DialogButton
                                            textStyle={{ color: '#26cccc' }}
                                            text="CANCEL"
                                            onPress={() => { this._paymentClosePopup(false) }}
                                        />
                                        <DialogButton
                                            text="PAY"
                                            textStyle={{ color: '#26cccc' }}
                                            onPress={() => {



                                                this._paymentRequest();

                                            }}
                                        />
                                    </View> :
                                    <View style={styles.dialogContainer}>
                                        {
                                            !this.state.paymentProcessing ?

                                                <DialogButton
                                                    text="OK"
                                                    textStyle={{ color: '#26cccc' }}
                                                    onPress={() => { this._paymentClosePopup(true) }}
                                                />
                                                : null

                                        }
                                    </View>
                            }
                        </DialogFooter>
                    }
                    onTouchOutside={() => {
                        this.setState({ paymentVisible: false });
                    }}
                    onHardwareBackPress={() => {
                        this.setState({ paymentVisible: false });
                    }}
                >
                    <DialogContent>
                        <View style={styles.container}>
                            {
                                this.state.paymentSuccessMessageShow ?
                                    <Text style={styles.paymentSuccessMsgStyle}>{this.state.paymentSuccessMessage}</Text>
                                    : null

                            }
                            {
                                this.state.paymentProcessing ?
                                    <Text style={styles.paymentProcessingStyle}>Please wait... payment is under processing</Text>
                                    : null

                            }
                            {
                                this.state.paymentErrorMessageShow ?
                                    <Text style={styles.paymentErrorMsgStyle}>{this.state.paymentErrorMessage}</Text>
                                    : null
                            }
                            {
                                this.state.paymentContainer ?
                                    <View>
                                        <TextInput style={styles.input}
                                            placeholderTextColor='#fff'
                                            onChangeText={(cardNumber) => this.setState({ cardNumber: cardNumber })}
                                            value={this.state.cardNumber}
                                            placeholder={"Card Number"}
                                            keyboardType={'numeric'}
                                        />
                                        <TextInput style={styles.input}
                                            placeholderTextColor='#fff'
                                            onChangeText={(expMonth) => this.setState({ expMonth: expMonth })}
                                            placeholder={"MM"}
                                            keyboardType={'numeric'}
                                        />
                                        <TextInput style={styles.input}
                                            placeholderTextColor='#fff'
                                            onChangeText={(expYear) => this.setState({ expYear: expYear })}
                                            placeholder={"YY"}
                                            keyboardType={'numeric'}
                                        />
                                        <TextInput style={styles.input}
                                            placeholderTextColor='#fff'
                                            onChangeText={(cvc) => this.setState({ cvc: cvc })}
                                            placeholder={"cvc"}
                                            secureTextEntry={true}
                                            keyboardType={'numeric'}

                                        />
                                    </View>
                                    : null
                            }
                        </View>
                    </DialogContent>
                </Dialog>
            </View >
        )
    }
}
const styles = StyleSheet.create({
    maincontainer: {
        flex: 1,
        backgroundColor: '#26cccc',
    },
    container: {
        padding: 15,
        textAlign: 'center',

    },
    dialogContainer: {
        flex: 1,
        flexDirection: "row",
        marginBottom: 10
    },
    avtarStyle: {
        flexDirection: "row",
        justifyContent: 'center',
        textAlign: "center"
    },
    paymentSuccessMsgStyle: {
        color: 'green',
        padding: 10,
        fontSize: 18,
        flexDirection: "row",
        justifyContent: 'center',
        textAlign: "center"
    },
    paymentProcessingStyle: {
        color: 'blue',
        padding: 10,
        fontSize: 18,
        flexDirection: "row",
        justifyContent: 'center',
        textAlign: "center"
    },
    paymentErrorMsgStyle: {
        color: 'red',
        padding: 10,
        fontSize: 18,
        flexDirection: "row",
        justifyContent: 'center',
        textAlign: "center"

    },
    activityIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 80
    },
    details: {

    },
    WebViewStyle: {

    },
    imgStyle: {
        width: '100%',
        height: 200,
        borderRadius: 5,
        resizeMode: "cover"
    },
    heading: {
        padding: 10,
        fontSize: 22,
    },
    baseStyle: {
        padding: 10,
        fontSize: 18,
        height: 44,
    },
    labelStyle: {
        fontWeight: "bold",
        color: '#ffffff'
    },
    textStyle: {
        color: '#ffffff',
        marginLeft: 5,
        fontSize: 17,

    },
    buttoncontainer: {
        marginTop: 40,
    },
    input: {
        height: 55,
        backgroundColor: '#26cccc',
        marginBottom: 20,
        paddingHorizontal: 10,
        borderRadius: 10,
        color: '#ffffff',
        borderColor: '#ccc'
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
        color: '#FFFFFF',
        fontSize: 20
    },
    textArea: {
        height: 80,
        backgroundColor: '#2980b9',
        marginBottom: 20,
        paddingHorizontal: 10,
        borderRadius: 10,
        borderColor: '#ccc'
    }


});
