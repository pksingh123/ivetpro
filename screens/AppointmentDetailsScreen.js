import React, { Component } from 'react';
import {
    TextInput,
    TouchableOpacity,
    StyleSheet,
    View,
    Text,
    Alert,
    Platform,
    BackHandler,
    AsyncStorage,
    Image,
    ActivityIndicator,
    Dimensions,
    StatusBar,
    ImageBackground,
    ScrollView,
    SafeAreaView
} from 'react-native';
import Constant from './Constants';
import { FlatList } from 'react-native-gesture-handler';
import { Icon, Avatar, Divider } from 'react-native-elements';
import Icons from 'react-native-vector-icons/FontAwesome';
import { DrawerActions } from 'react-navigation-drawer';
import { HeaderBackButton } from 'react-navigation';
import { WebView } from 'react-native-webview';
import { EventRegister } from 'react-native-event-listeners';
import Stripe from 'react-native-stripe-api';
import Dialog, { DialogTitle, DialogFooter, DialogButton, DialogContent } from 'react-native-popup-dialog';
const paymentRequestUrl = Constant.rootUrl + 'webservices/stripe-pay.php';
const DEVICE_WIDTH = Dimensions.get('window').width;

export default class AppointmentDetailsScreen extends Component {

    static navigationOptions = ({ navigation }) => {
        const item = navigation.state.params.item;
        return {
            headerTitle: 'Appointment details',
            headerLeft: <HeaderBackButton onPress={() => {
                if (item.status == 5) {
                    // this.props.navigation.navigate('AppointmentHistory');
                    navigation.navigate('AppointmentHistory');
                } else {
                    // this.props.navigation.navigate('AppointmentList');
                    navigation.navigate('AppointmentList');
                }
            }} />,
            // headerLeft: <PracticeBarLogo />,
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

                <Text style={{ flex: 1, height: 50, width: 50 }}></Text>
            ),

            //headerLeft: <HeaderBackButton onPress={() => navigation.navigate('routePetDetails', { item: navigation.state.params.item })} />,

        }
        // console.warn(item.status);

    };
    constructor(props) {
        super(props);
        this.state = {
            name: 'Name:',
            species: 'species',
            sex: 'Sex',
            date: 'Date:',
            time: 'Time:',
            status: 'Status:',
            notes: 'Notes',
            payment: 'Payment/Video Call:',
            cancel: 'Cancel/Refund',
            appointmentStatus: '',

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
            apiKey: '',
            practice_name: '',
            practice_alias_name: '',
            practice_address: '',
            practice_post_code: '',
            practice_email: '',
            practice_phone_number: '',
            prevent_phone_app_calling_agent: 1, // if 1 then hide video call 
        }
        this._goBack = this._goBack.bind(this);

    }
    componentWillMount() {

        BackHandler.addEventListener('hardwareBackPress', this._goBack);
    }
    componentWillUnmount() {
        this._paymentClosePopup();
        BackHandler.removeEventListener('hardwareBackPress', this._goBack);
        this.focusListener.remove()
    }
    _goBack() {
        const item = this.props.navigation.state.params.item;

        if (item.status == 5) {
            this.props.navigation.navigate('AppointmentHistory');
        } else {
            this.props.navigation.navigate('AppointmentList');
        }
        // this.props.navigation.goBack();

        return true;
    }


    headerImage = () => {

    }

    componentDidMount() {
        const item = this.props.navigation.state.params.item;

        this.setState({ appointmentStatus: item.status })

        this.focusListener = this.props.navigation.addListener('didFocus', () => {
            this.onFocusFunction()
        })

    }
    onFocusFunction = async () => {
        let savedValues = await AsyncStorage.getItem('userToken');
        savedValues = JSON.parse(savedValues);
        let prevent_calling = savedValues.user.practice.prevent_phone_app_calling_agent;
        this.setState({ prevent_phone_app_calling_agent: prevent_calling });

        //console.log("onFocusFunction", prevent_calling);
        let isAppLoginExpire = await AsyncStorage.getItem('isLoginExpire')
        if (isAppLoginExpire == 'Yes') {
            EventRegister.emit('appExpire', "")
        }

    }
    _showAlert = (item) => {

        Alert.alert(
            'Cancel Appointment',
            'Are you sure you want to cancel the appointment!',
            [
                { text: 'NO', onPress: () => { this.setState({ cancel: false }) }, style: 'cancel' },
                { text: 'YES', onPress: () => { this._appointmentCancel(item) } },
            ],
            { cancelable: false }
        );
    }
    _startConfrence = (item) => {
        if (Platform.OS !== 'ios') {
            this.props.navigation.navigate('routeConfrence', { item });
        }

    }

    _pay = (item) => {
        // this.props.navigation.navigate('routePayment', { item });
        this.setState({ paymentVisible: true });
    }
    _appointmentCancel = (item) => {
        // console.log("_SiteAppointmentCancel 1", item);
        // console.log("_SiteAppointmentCancel 2 ", item.booking_type);
        if (item.booking_type == 'Vetstoria') {
            this.setState({ visible: true });

        } else if (item.booking_type == 'Site') {
            this._SiteAppointmentCancel(item);
        }
    }
    _VetstoriaAppointmentCancel = (item) => {
        if (this.state.cancelreason == '') {
            alert("Please enter cancel reason details!");
        } else {
            const url = Constant.rootUrl + 'webservices/booking-appointment.php?action=AppointmentCancel';
            this.setState({ isLoading: true });
            fetch(url,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        'booking_type': item.booking_type,
                        'bookingId': item.bookingId,
                        'cancelreason': this.state.cancelreason,
                    }),
                })
                .then((response) => response.json())
                .then((responseJson) => {
                    //console.warn(responseJson);
                    if (responseJson.status === 'ok') {
                        this.setState({ visible: false })
                        this.props.navigation.push('AppointmentList');
                        /*   Alert.alert(
                              'Cancel Appointment',
                              responseJson.response_msg,
                              [
                                  { text: 'OK', onPress: () => { this.setState({ cancel: false }) }, style: 'cancel' },
                              ],
                              { cancelable: false }
                          ); */
                    } else if (responseJson.error) {
                        Alert.alert(
                            'Cancel Appointment',
                            'Somthing is wrong, Please try again!',
                            [
                                { text: 'OK', onPress: () => { this.setState({ cancel: false }) }, style: 'cancel' },
                            ],
                            { cancelable: false }
                        );
                    }
                    this.setState({ isLoading: false });
                })
                .catch((error) => {
                    // alert('Something went wrong!');
                    console.warn(error);
                })
        }


    }
    _SiteAppointmentCancel = (item) => {
        // console.log("_SiteAppointmentCancel", item);
        const url = Constant.rootUrl + 'webservices/booking-appointment.php?action=AppointmentCancel';
        this.setState({ isLoading: true });
        fetch(url,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    'booking_type': item.booking_type,
                    'bookingId': item.bookingId,

                }),
            })
            .then((response) => response.json())
            .then((responseJson) => {
                // console.log("_SiteAppointmentCancel ", responseJson);
                if (responseJson.status === 'ok') {
                    this.setState({ visible: false })
                    this.props.navigation.push('AppointmentList');

                } else {
                    this.setState({ visible: false })
                    Alert.alert(
                        'Cancel Appointment',
                        'Somthing is wrong, Please try again!',
                        [
                            { text: 'OK', onPress: () => { this.setState({ cancel: false }) }, style: 'cancel' },
                        ],
                        { cancelable: false }
                    );
                }
                this.setState({ isLoading: false });
            })
            .catch((error) => {
                // alert('Something went wrong!');
                console.warn(error);
            })
    }
    _appointmentRefundOpenPopup = () => {
        this.setState({ refundVisible: true });
    }
    _appointmentRefundClosePopup = () => {
        this.setState({ refundVisible: false });
    }
    _paymentOpenPopup = () => {
        this.setState({
            paymentButtonShow: true,
            paymentProcessing: false,
            paymentContainer: true,
            paymentErrorMessageShow: false,

        });

        this.setState({ paymentVisible: true });
    }
    _paymentClosePopup = () => {
        this.setState({
            paymentButtonShow: true,
            paymentProcessing: false,
            paymentContainer: true,

        });

        this.setState({ paymentVisible: false });
    }

    _appointmentRefundRequest = (item) => {
        if (this.state.refundreason == '') {
            alert("Please enter refund reason details!");
        } else {
            const url = Constant.rootUrl + 'webservices/booking-appointment.php?action=AppointmentRefundRequest';
            this.setState({ isLoading: true });
            fetch(url,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        'bookingId': item.bookingId,
                        'refundreason': this.state.refundreason,
                    }),
                })
                .then((response) => response.json())
                .then((responseJson) => {
                    // console.warn(responseJson);
                    if (responseJson.status === 'ok') {
                        Alert.alert(
                            'Refund Request',
                            'Process successful!',
                            [
                                { text: 'OK', onPress: () => { this.setState({ refundVisible: false }) } },
                            ],
                            { cancelable: false }
                        );
                        this.setState({ refundVisible: false })
                    } else {
                        alert(responseJson.error);
                    }
                    this.setState({ isLoading: false });
                })
                .catch((error) => {
                    // alert('Something went wrong!');
                    console.warn(error);
                })
        }
    }
    async componentWillMount() {
        this.props.navigation.setParams({ logout: this._signOutAsync });
        const userToken = await AsyncStorage.getItem('userToken');


        if (userToken) {
            userDetails = JSON.parse(userToken);
            console.warn(userDetails);
            this.setState({
                uid: userDetails.user.uid,
                practice_id: userDetails.user.practice.practice_id,
                practice_name: userDetails.user.practice.name,
                practice_alias_name: userDetails.user.practice.alias_name,
                practice_address: userDetails.user.practice.address,
                practice_post_code: userDetails.user.practice.post_code,
                practice_email: userDetails.user.practice.email,
                practice_phone_number: userDetails.user.practice.phone_number,
                currencySymbol: userDetails.user.practice.currencys_symbol,
                // userDetails.user.clientPhone
            });
        }
        const url = Constant.rootUrl + 'webservices/booking-appointment.php?action=GetPubKey&practice_id=' + this.state.practice_id;
        fetch(url)
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState({ isLoading: false, });
                if (responseJson.status === 'ok') {
                    this.setState({ apiKey: responseJson.key.publishable_key })
                } else {
                    alert(responseJson.status);

                }
            })
            .catch((error) => {
                //alert('Something went wrong!');
                console.warn(error);
            })
    }
    _paymentRequest = (item) => {
        if (this.state.cardNumber == '' || this.state.expMonth == '' || this.state.expYear == '' || this.state.cvc == '') {
            alert('Enter correct card details.');
            return;
        }
        this.setState({
            paymentButtonShow: false,
            paymentProcessing: true,
            paymentContainer: false,
            paymentErrorMessageShow: false,

        });
        const client = new Stripe(this.state.apiKey);
        // console.log(this.state.apiKey);
        client.createToken({
            number: this.state.cardNumber,
            exp_month: this.state.expMonth,
            exp_year: this.state.expYear,
            cvc: this.state.cvc,

        }).then((resp) => {

            if (resp.id) {
                this.setState({
                    token: resp.id
                });
                this.setState({ isLoading: true });
                fetch(paymentRequestUrl,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            "email": item.email,
                            "uid": item.uid,
                            "token": resp.id,
                            "amount": item.amount,
                            "currency": "GBP",
                            "description": "Video Consultant",
                            "bookingId": item.bookingId,
                            "practice_id": this.state.practice_id,
                        }),
                    })
                    .then((response) => response.json())
                    .then((responseJson) => {
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
                        //alert('Something went wrong!');
                        console.warn(error);
                        this.setState({
                            paymentButtonShow: true,
                            paymentProcessing: false,
                            paymentContainer: true,

                        });
                    })
            } else {
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


    render() {
        const params = 'platform=' + Platform.OS;
        const item = this.props.navigation.state.params.item;

        // if (this.state.isLoading) {
        //     return (
        //         <View style={{ flex: 1, padding: 20 }}>
        //             <ActivityIndicator
        //                 color='#2ba9bc'
        //                 size="large"
        //                 style={styles.activityIndicator} />
        //         </View>
        //     )
        // }
        // var backButton = item.status == 5 ?
        //     <TouchableOpacity onPress={() => this.props.navigation.navigate('AppointmentHistory')}>
        //         <Image
        //             style={styles.backButtonImageStyle}
        //             source={require('../screens/images/ios-back.jpg')}
        //             resizeMethod="auto"
        //         />
        //     </TouchableOpacity>

        //     :
        //     <TouchableOpacity onPress={() => this.props.navigation.navigate('AppointmentList')}>
        //         <Image
        //             style={styles.backButtonImageStyle}
        //             source={require('../screens/images/ios-back.jpg')}
        //             resizeMethod="auto"
        //         />
        //     </TouchableOpacity>
        var statusHtml_1 = this.state.appointmentStatus == 1 ?
            <View>
                <TouchableOpacity onPress={() => this._paymentOpenPopup()} style={styles.button}>
                    <Text style={styles.textcolor}>Pay ({this.state.currencySymbol} {item.amount})</Text>
                </TouchableOpacity>

                <Text style={styles.link} onPress={() => this._showAlert(item)}>Cancel Appointment</Text>
            </View>
            : null
        var statusHtml_2 = this.state.appointmentStatus == 2 && this.state.prevent_phone_app_calling_agent == 0 ?
            <View>
                {<TouchableOpacity onPress={() => this._startConfrence(item)} style={styles.button}>
                    <Text style={styles.textcolor}>Start Video Call</Text>
                </TouchableOpacity>}
                <Text style={styles.link} onPress={() => this._showAlert(item)}>Cancel Appointment</Text>
            </View>
            : null
        var statusHtml_3 = this.state.appointmentStatus == 3 && item.paid == 1 && item.refund_status == 0 ?
            <View>
                <TouchableOpacity onPress={() => this._appointmentRefundOpenPopup()} style={styles.button}>
                    <Text style={styles.textcolor}>Refund Appointment</Text>
                </TouchableOpacity>
            </View>
            : null
        var refunStatusHtml = item.refund_status_lbl ?
            <Text style={styles.baseStyle}>
                <Text style={styles.labelStyle}>Refund Status</Text>
                <Text style={styles.textStyle}> {item.refund_status_lbl}</Text>
            </Text>
            : null

        return (
            <SafeAreaView style={styles.mainContainer}>
                <ScrollView>
                    <StatusBar translucent backgroundColor="transparent" />
                    <ImageBackground source={{ uri: item.picture }} style={styles.imgStyle}>
                        {/* <View style={styles.backButtonStyle}>
                            {backButton}
                        </View> */}
                        <View style={styles.bgDetails}>
                            <Text style={styles.bgNameStyle}>{item.Name}</Text>
                            <Text style={styles.bgTextStyle}>{item.full_date}</Text>

                        </View>
                    </ImageBackground>
                    <View style={styles.container}>

                        <View style={styles.dtails}>
                            <Text style={styles.nameStyle}>{item.Name}</Text>
                            <Text style={styles.dTextStyle}>{item.Breed}</Text>
                            <Text style={styles.dTextStyle}></Text>
                            <Text style={styles.dTextStyle}>{item.species}</Text>
                            <Text style={styles.dTextStyle}>{item.sex}</Text>
                            <Text style={styles.dTextStyle}>{item.CurrentWeight}kg</Text>
                            <Text style={styles.dTextStyle}>Date of Birth: {item.DateOfBirth}</Text>
                        </View>
                        <View style={styles.clientDetails}>
                            <Text style={styles.cNameStyle}>Practice Details</Text>
                            <Text style={styles.dTextStyle}>{this.state.practice_name}</Text>
                            <Text style={styles.dTextStyle}>{this.state.practice_address}</Text>
                            <Text style={styles.dTextStyle}>{this.state.practice_post_code}</Text>
                            <Text style={styles.dTextStyle}>{this.state.practice_phone_number}</Text>
                            <Text style={styles.dTextStyle}>{this.state.practice_email}</Text>
                        </View>
                        <View style={styles.notesStyle}>
                            <Text style={styles.cNameStyle}>Notes</Text>
                            <Text style={styles.dTextStyle}>{item.notes}</Text>
                        </View>
                        <View style={styles.statusStyle}>
                            <Text style={styles.cNameStyle}>Status</Text>
                            <Text style={styles.dTextStyle}>{item.status1}</Text>
                        </View>
                        <View style={styles.buttoncontainer}>
                            {statusHtml_1}
                            {statusHtml_2}
                            {statusHtml_3}
                        </View>

                        {/* Cancel  Dialog */}
                        <Dialog
                            visible={this.state.visible}
                            useNativeDriver
                            dialogTitle={<DialogTitle title="Cancel Request" />}
                            width={0.9}

                            footer={
                                <DialogFooter>
                                    <DialogButton
                                        text="CANCEL"
                                        onPress={() => {
                                            this.setState({ visible: false, cancel: false });
                                        }}
                                    />
                                    <DialogButton
                                        text="REQUEST"
                                        onPress={() => { this._VetstoriaAppointmentCancel(item) }}
                                    />
                                </DialogFooter>
                            }
                            onTouchOutside={() => {
                                this.setState({ visible: false, cancel: false });
                            }}
                        >
                            <DialogContent>
                                <View style={styles.popupContainer}>
                                    <TextInput placeholder="Cancel Reason"
                                        underlineColorAndroid="transparent"
                                        placeholderTextColor='rgba(255,255,255,0.7)'
                                        style={styles.textArea}
                                        multiline={true}
                                        numberOfLines={5}
                                        onChangeText={(text) => this.setState({ cancelreason: text })}

                                    />

                                </View>
                            </DialogContent>
                        </Dialog>
                        {/* Refund  Dialog */}
                        <Dialog
                            visible={this.state.refundVisible}
                            useNativeDriver
                            dialogTitle={<DialogTitle title="Refund Request" />}
                            width={0.9}
                            footer={
                                <DialogFooter>
                                    <DialogButton
                                        text="CANCEL"
                                        onPress={() => { this._appointmentRefundClosePopup() }}
                                    />
                                    <DialogButton
                                        text="REQUEST"
                                        onPress={() => { this._appointmentRefundRequest(item) }}
                                    />
                                </DialogFooter>
                            }
                            onTouchOutside={() => {
                                this.setState({ refundVisible: false });
                            }}
                        >
                            <DialogContent>
                                <View style={styles.popupContainer}>
                                    <TextInput placeholder="Refund Reason"
                                        underlineColorAndroid="transparent"
                                        placeholderTextColor='rgba(255,255,255,0.7)'
                                        style={styles.textArea}
                                        multiline={true}
                                        numberOfLines={5}
                                        onChangeText={(text) => this.setState({ refundreason: text })}
                                    />
                                </View>
                            </DialogContent>
                        </Dialog>

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
                                                    text="CANCEL"
                                                    textStyle={{ color: '#26cccc' }}
                                                    onPress={() => { this._paymentClosePopup() }}
                                                />
                                                <DialogButton
                                                    text="PAY"
                                                    textStyle={{ color: '#26cccc' }}
                                                    onPress={() => {



                                                        this._paymentRequest(item);

                                                    }}
                                                />
                                            </View> :
                                            <View style={styles.dialogContainer}>
                                                {
                                                    !this.state.paymentProcessing ?

                                                        <DialogButton
                                                            text="OK"
                                                            textStyle={{ color: '#26cccc' }}
                                                            onPress={() => { this._paymentClosePopup() }}
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
                                <View style={styles.containerDialog}>
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
                    </View>
                </ScrollView>
            </SafeAreaView>
        )
    }
}
const styles = StyleSheet.create({
    imgStyle: {
        width: DEVICE_WIDTH,
    },
    backButtonStyle: {
        marginTop: 10,
        color: '#fff'
    },
    bgDetails: {
        flex: 1,
        justifyContent: 'center',
        //paddingHorizontal: 60,
        marginTop: 80,
        // marginBottom: 20,
        paddingLeft: 20,
        paddingBottom: 20,
        // marginTop: 5,
        backgroundColor: '#E5E5E570',
        width: '60%',
        height: 150,
        borderBottomRightRadius: 10,
        borderTopRightRadius: 10,
    },
    bgNameStyle: {
        color: '#000',
        fontSize: 30,
        paddingTop: 10,
        fontWeight: 'bold'
    },
    bgTextStyle: {
        color: '#000',
        fontSize: 20,
        marginTop: 5
    },
    backButtonImageStyle: {
        width: 25,
        height: 25,
        marginVertical: 30
    },
    mainContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        //marginTop: 90,
    },
    container: {
        paddingHorizontal: 60,
        marginTop: 40,
        marginBottom: 40,
    },
    containerDialog: {
        padding: 15,
        textAlign: 'center',

    },
    paymentProcessingStyle: {
        color: 'blue',
        padding: 10,
        fontSize: 18,
        flexDirection: "row",
        justifyContent: 'center',
        textAlign: "center"
    },
    popupContainer: {
        padding: 15,
        textAlign: 'center',
    },
    dtails: {

    },
    nameStyle: {
        color: '#26cccc',
        fontSize: 27,
        paddingTop: 0,
        fontWeight: 'bold'
    },
    dTextStyle: {
        color: '#ccc',
        fontSize: 20,
        marginTop: 5
    },
    cNameStyle: {
        color: '#26cccc',
        fontSize: 25,
        paddingTop: 10,
        //fontWeight: 'bold'
    },
    avtarStyle: {
        flexDirection: "row",
        justifyContent: 'center',
        textAlign: "center"
    },
    dialogContainer: {
        flex: 1,
        flexDirection: "row",
        marginBottom: 10
    },
    paymentSuccessMsgStyle: {
        color: 'green',
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
        color: '#ffffff',
        fontSize: 20
    },
    link: {
        color: '#ccc',
        textAlign: 'center',
        fontSize: 16,
        textDecorationLine: 'underline',
        textDecorationColor: '#ccc',
        textDecorationStyle: 'solid'
    },
    textArea: {
        height: 80,
        backgroundColor: '#2980b9',
        marginBottom: 20,
        paddingHorizontal: 10,
        borderRadius: 10,
        borderColor: '#ccc'
    },
    activityIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 80
    },

});
