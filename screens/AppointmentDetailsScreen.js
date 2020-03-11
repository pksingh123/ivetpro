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
    Dimensions,
    StatusBar,
    ImageBackground,
    ScrollView,
    SafeAreaView
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { Icon, Avatar, Divider } from 'react-native-elements';
import Icons from 'react-native-vector-icons/FontAwesome';
import { DrawerActions } from 'react-navigation-drawer';
import { HeaderBackButton } from 'react-navigation';
import { WebView } from 'react-native-webview';
import Stripe from 'react-native-stripe-api';
import Dialog, { DialogTitle, DialogFooter, DialogButton, DialogContent } from 'react-native-popup-dialog';
const paymentRequestUrl = 'https://videowithmyvet.com/webservices/stripe-pay.php';
const DEVICE_WIDTH = Dimensions.get('window').width;

export default class AppointmentDetailsScreen extends Component {

    static navigationOptions = ({ navigation }) => {
        const item = navigation.state.params.item;
        if (item.status == 5) {
            return {
                header: null,
                //headerTitle: 'Appointment Details',
                //headerLeft: <HeaderBackButton onPress={() => navigation.navigate('AppointmentHistory')} />,
                //headerTintColor: '#ffffff',
                /* headerStyle: {
                    backgroundColor: '#26cccc',
                    color: '#fff',
                    textAlign: 'center'
                }, */

            }
        } else {
            return {
                header: null,

                //headerLeft: <HeaderBackButton onPress={() => navigation.navigate('AppointmentList')} />,
                //headerTintColor: '#ffffff',
                /* headerStyle: {
                     flex: 1,
                     backgroundColor: '#26cccc',
                     color: '#fff',
                     textAlign: 'center'
                 },*/


            }
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
            paymentErrorMessage: '',
            apiKey: '',

        }
        this._goBack = this._goBack.bind(this);
    }
    componentWillMount() {

        BackHandler.addEventListener('hardwareBackPress', this._goBack);
    }
    componentWillUnmount() {

        BackHandler.removeEventListener('hardwareBackPress', this._goBack);
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
            const url = "https://videowithmyvet.com/webservices/booking-appointment.php?action=AppointmentCancel";
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
                    alert('Something went wrong!');
                    console.warn(error);
                })
        }


    }
    _SiteAppointmentCancel = (item) => {
        const url = "https://videowithmyvet.com/webservices/booking-appointment.php?action=AppointmentCancel";
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
                alert('Something went wrong!');
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
        this.setState({ paymentVisible: true });
    }
    _paymentClosePopup = () => {
        this.setState({ paymentVisible: false });
    }

    _appointmentRefundRequest = (item) => {
        if (this.state.refundreason == '') {
            alert("Please enter refund reason details!");
        } else {
            const url = "https://videowithmyvet.com/webservices/booking-appointment.php?action=AppointmentRefundRequest";
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
                    alert('Something went wrong!');
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
                // userDetails.user.clientPhone
            });
        }
        const url = 'https://videowithmyvet.com/webservices/booking-appointment.php?action=GetPubKey&practice_id=' + this.state.practice_id;
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
                alert('Something went wrong!');
                console.warn(error);
            })
    }
    _paymentRequest = (item) => {
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
                                paymentErrorMessage: responseJson.msg,
                                appointmentStatus: 1,
                            });

                        }

                    })
                    .catch((error) => {
                        alert('Something went wrong!');
                        console.warn(error);
                    })
            }
        }).catch((e) => {
            console.warn(e);
        });

    }

    render() {
        const params = 'platform=' + Platform.OS;
        const item = this.props.navigation.state.params.item;

        var backButton = item.status == 5 ?
            <TouchableOpacity onPress={() => this.props.navigation.navigate('AppointmentHistory')}>
                <Image
                    style={styles.backButtonImageStyle}
                    source={require('../screens/images/ios-back.jpg')}
                    resizeMethod="auto"
                />
            </TouchableOpacity>

            :
            <TouchableOpacity onPress={() => this.props.navigation.navigate('AppointmentList')}>
                <Image
                    style={styles.backButtonImageStyle}
                    source={require('../screens/images/ios-back.jpg')}
                    resizeMethod="auto"
                />
            </TouchableOpacity>
        var statusHtml_1 = this.state.appointmentStatus == 1 ?
            <View>
                <TouchableOpacity onPress={() => this._paymentOpenPopup()} style={styles.button}>
                    <Text style={styles.textcolor}>Pay({'\u00A3'} {item.amount})</Text>
                </TouchableOpacity>

                <Text style={styles.link} onPress={() => this._showAlert(item)}>Cancel Appointment</Text>
            </View>
            : null
        var statusHtml_2 = this.state.appointmentStatus == 2 ?
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
                        <View style={styles.backButtonStyle}>
                            {backButton}
                        </View>
                        <View style={styles.bgDetails}>
                            <Text style={styles.bgNameStyle}>Appointment Details</Text>
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
                            <Text style={styles.dTextStyle}>{item.practice.name}</Text>
                            <Text style={styles.dTextStyle}>{item.practice.address}</Text>
                            <Text style={styles.dTextStyle}>{item.practice.post_code}</Text>
                            <Text style={styles.dTextStyle}>{item.practice.phone_number}</Text>
                            <Text style={styles.dTextStyle}>{item.practice.email}</Text>
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
                                                    onPress={() => { this._paymentClosePopup() }}
                                                />
                                                <DialogButton
                                                    text="PAY"
                                                    onPress={() => { this._paymentRequest(item) }}
                                                />
                                            </View> :
                                            <View style={styles.dialogContainer}>
                                                <DialogButton
                                                    text="OK"
                                                    onPress={() => { this._paymentClosePopup() }}
                                                />
                                            </View>
                                    }
                                </DialogFooter>
                            }
                            onTouchOutside={() => {
                                this.setState({ paymentVisible: false });
                            }}
                        >
                            <DialogContent>
                                <View style={styles.popupContainer}>
                                    {
                                        this.state.paymentSuccessMessageShow ?
                                            <Text style={styles.paymentSuccessMsgStyle}>{this.state.paymentSuccessMessage}</Text>
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
                                                    placeholderTextColor='#555'
                                                    onChangeText={(cardNumber) => this.setState({ cardNumber: cardNumber })}
                                                    value={this.state.cardNumber}
                                                    placeholder={"Card Number"}
                                                    keyboardType={'numeric'}
                                                />
                                                <TextInput style={styles.input}
                                                    placeholderTextColor='#555'
                                                    onChangeText={(expMonth) => this.setState({ expMonth: expMonth })}
                                                    placeholder={"MM"}
                                                    keyboardType={'numeric'}
                                                />
                                                <TextInput style={styles.input}
                                                    placeholderTextColor='#555'
                                                    onChangeText={(expYear) => this.setState({ expYear: expYear })}
                                                    placeholder={"YY"}
                                                    keyboardType={'numeric'}
                                                />
                                                <TextInput style={styles.input}
                                                    placeholderTextColor='#555'
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
        paddingHorizontal: 60,
        paddingTop: 40,
        marginBottom: 20
    },
    bgNameStyle: {
        color: '#ffffff',
        fontSize: 30,
        paddingTop: 10,
        fontWeight: 'bold'
    },
    bgTextStyle: {
        color: '#ffffff',
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
        height: 40,
        backgroundColor: '#ffffff',
        marginBottom: 20,
        paddingHorizontal: 0,
        borderRadius: 0,
        //borderColor: '#d2d4d6',
        borderWidth: 0
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
    }


});
