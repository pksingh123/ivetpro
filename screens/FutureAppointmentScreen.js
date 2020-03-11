import React, { Component } from 'react';
import {
    ActivityIndicator,
    AsyncStorage,
    Button,
    TouchableOpacity,
    StyleSheet,
    View,
    ScrollView,
    Image,
    Text,
    BackHandler,
    TextInput,
    Dimensions,
    StatusBar
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { Icon, Avatar, Divider } from 'react-native-elements';
import Icons from 'react-native-vector-icons/FontAwesome';
import { DrawerActions } from 'react-navigation-drawer';
import { HeaderBackButton } from 'react-navigation';
import PracticeBarLogo from '../screens/PracticeBarLogo';
import Stripe from 'react-native-stripe-api';
import Dialog, { DialogTitle, DialogFooter, DialogButton, DialogContent } from 'react-native-popup-dialog';
const paymentRequestUrl = 'https://videowithmyvet.com/webservices/stripe-pay.php';
const SCREEN_HEIGHT = Dimensions.get("window").height;

export default class FutureAppointmentScreen extends Component {

    static navigationOptions = ({ navigation }) => {
        const item = navigation.state.params.item;
        return {
            headerTitle: 'Future Appointment',
            //headerLeft: <PracticeBarLogo />,
            headerLeft: <HeaderBackButton onPress={() => navigation.push('Home')} />,
            headerLeftContainerStyle:{
                marginTop:StatusBar.currentHeight
            },
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
        }
    };
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            petAliveStatus: '',
            startVideoCall: true,
            GridViewItems: [],
            cardNumber: '',
            expMonth: '',
            expYear: '',
            cvc: '',
            token: '',
            email: '',
            uid: '',
            bookingId: '',
            amount: '',
            paymentVisible2: false,
            cancel: false,
            paymentButtonShow: true,
            paymentContainer: true,
            paymentSuccessBtnShow: false,
            paymentSuccessMessageShow: false,
            paymentErrorMessageShow: false,
            paymentSuccessMessage: '',
            paymentErrorMessage: '',
            practice_id: '',
            apiKey: '',
            itme: '',


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
        this.props.navigation.navigate('Home');
        return true;
    }

    _paymentOpenPopup2 = (item) => {
        console.log(item);
        this.setState({
            email: item.email,
            uid: item.uid,
            bookingId: item.bookingId,
            amount: item.amount,
            paymentVisible2: true
        });

        this.setState({ isLoading: true, });
        const url1 = 'https://videowithmyvet.com/webservices/booking-appointment.php?action=GetPubKey&practice_id=' + this.state.practice_id;
        fetch(url1)
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState({ isLoading: false, });
                if (responseJson.status === 'ok') {
                    this.setState({ apiKey: responseJson.key.publishable_key })
                    console.log(this.state.apiKey);
                } else {
                    alert(responseJson.status);
                }
            })
            .catch((error) => {
                alert('Something went wrong!');
                console.warn(error);
            })
        // this.renderDialog(item);
    }
    _paymentClosePopup2 = () => {
        this.setState({ paymentVisible2: false });
    }
    _paymentClosePopup3 = () => {
        const item = this.props.navigation.state.params.item;
        this.setState({ paymentVisible2: false });
        this.props.navigation.push('routeFutureAppointment', { item });
    }

    _paymentRequest2 = () => {

        //const apiKey = 'pk_test_8m4FhXKfFi1sd2GFuWHDyGNh00sSApCudF';
        const client = new Stripe(this.state.apiKey);
        client.createToken({
            number: this.state.cardNumber,
            exp_month: this.state.expMonth,
            exp_year: this.state.expYear,
            cvc: this.state.cvc,

        }).then((resp) => {

            if (resp.id) {


                //this.setState({ isLoading: true });
                fetch(paymentRequestUrl,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            "email": this.state.email,
                            "uid": this.state.uid,
                            "token": resp.id,
                            "amount": this.state.amount,
                            "currency": "GBP",
                            "description": "Video Consultant",
                            "bookingId": this.state.bookingId,
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
    _startConfrence = (item) => {
        this.props.navigation.navigate('routeConfrence', { item });
    }
    async componentWillMount() {
        this.props.navigation.setParams({ logout: this._signOutAsync });
        const item = this.props.navigation.state.params.item;
        const userToken = await AsyncStorage.getItem('userToken');
        if (userToken) {
            userDetails = JSON.parse(userToken);
            // console.warn(userDetails);
            this.setState({
                uid: userDetails.user.uid,
                practice_id: userDetails.user.practice.practice_id,

            });
        } else {
            this.setState({ uid: false })
        }

        this.setState({ petAliveStatus: item.status, name: item.name })
        const url = 'https://videowithmyvet.com/webservices/booking-appointment.php?action=FutureAppointment&patientId=' + item.id;
        fetch(url)
            .then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.totalCount > 0) {
                    console.warn(responseJson);
                    this.setState({
                        isLoading: false
                    })
                    this.setState({
                        GridViewItems: responseJson.data
                    })
                    //this.arrayholder = responseJson.data;
                } else {
                    this.setState({
                        GridViewItems: [],
                        isLoading: false
                    })
                    alert(responseJson.data);
                }
            })
            .catch((error) => {
                alert('Something went wrong!');
                console.warn(error);
            })
    }
    _listEmptyComponent = () => {
        return (
            <View
                style={{
                    justifyContent: "center",
                    alignItems: "center",
                    height: SCREEN_HEIGHT, //responsible for 100% height
                    backgroundColor: "#ddd"
                }}
            >
                <Text
                    style={{
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: 20
                    }}
                >
                    No Record Found
            </Text>
            </View>
        );
    }

    renderItem = ({ item, index }) => {
        return (
            <View style={styles.itemContainer}>
                <View style={{ backgroundColor: index % 2 == 0 ? "#eae6e6" : "#D3D3D3" }}>
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                        <Text style={styles.leftTextStyle}>{item.date} </Text>
                        <Text style={styles.middleTextStyle}>{item.time}</Text>
                    </View>
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                        <Text style={styles.textStyle}>{item.status1}</Text>
                    </View>
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                        <Text style={styles.textStyle}>{item.notes}</Text>
                    </View>
                    {/* <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                        {item.status == 1 ?
                            <TouchableOpacity onPress={() => this._paymentOpenPopup2(item)} style={styles.button}>
                                <Text style={styles.textcolor}>Pay Now {'\u00A3'} {item.amount}</Text>
                            </TouchableOpacity>
                            : <Text style={styles.textButtonStyle}>Paid</Text>
                        }
                        {item.status == 2 ?
                            <TouchableOpacity onPress={() => this._startConfrence(item)} style={styles.button}>
                                <Text style={styles.textcolor}>Start Consult</Text>
                            </TouchableOpacity>
                            : <TouchableOpacity onPress={() => this._startConfrence(item)} style={styles.button} disabled={this.state.startVideoCall}>
                                <Text style={styles.textcolor}>Start Consult</Text>
                            </TouchableOpacity>
                        }
                    </View> */}

                    <View style={styles.buttonContainerWrr}>
                        {item.status == 1 ?
                            <View style={styles.buttoncontainer}>
                            <TouchableOpacity onPress={() => this._paymentOpenPopup2(item)} style={styles.button}>
                                <Text style={styles.textcolor}>Pay Now {'\u00A3'} {item.amount}</Text>
                            </TouchableOpacity>
                            </View>
                            : <View><Text style={styles.textButtonStyle}>Paid</Text></View>
                        }
                        {item.status == 2 ?
                            <View style={styles.buttoncontainer}><TouchableOpacity onPress={() => this._startConfrence(item)} style={styles.button}>
                                <Text style={styles.textcolor}>Start Consult</Text>
                            </TouchableOpacity></View>
                            : <View style={styles.buttoncontainer}><TouchableOpacity onPress={() => this._startConfrence(item)} style={styles.button} disabled={this.state.startVideoCall}>
                                <Text style={styles.textcolor}>Start Consult</Text>
                            </TouchableOpacity></View>
                        }
                    </View>
                </View>
            </View >
        );
    };
    render() {
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
            <View style={styles.container}>
                <View>
                    <Text style={styles.screenTitle}>{this.state.name}</Text>
                </View>
                {this.state.GridViewItems ? <FlatList
                    data={this.state.GridViewItems}
                    renderItem={this.renderItem}
                    ListEmptyComponent={this._listEmptyComponent.bind(this)}
                    keyExtractor={({ id }, index) => id}
                /> : <Text
                    style={{
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: 20
                    }}
                >
                        No Record Found
        </Text>}


                <Dialog
                    visible={this.state.paymentVisible2}
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
                                            onPress={() => { this._paymentClosePopup2() }}
                                        />
                                        <DialogButton
                                            text="PAY"
                                            onPress={() => { this._paymentRequest2() }}
                                        />
                                    </View> :
                                    <View style={styles.dialogContainer}>
                                        <DialogButton
                                            text="OK"
                                            onPress={() => { this._paymentClosePopup3() }}
                                        />
                                    </View>
                            }
                        </DialogFooter>
                    }
                    onTouchOutside={() => {
                        this.setState({ paymentVisible2: false });
                    }}
                >
                    <DialogContent>
                        <View style={styles.dialogContentContainer}>
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
                                            onChangeText={(CardNumber) => this.setState({ cardNumber: CardNumber })}
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
        )
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        textAlign: 'center',
        paddingTop: 22,
    },

    itemContainer: {
        // flex: 1,
        // flexDirection: 'column',
        // justifyContent: 'center',
        // alignItems: 'stretch',
        // paddingLeft: 18,
        // paddingRight: 18,
        // paddingBottom: 22,
        // paddingTop: 22,
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'stretch',
        paddingTop: 10

    },
    buttonContainerWrr:{
        marginTop:10
    },
    buttoncontainer: {
        paddingHorizontal: 20,
    },
    screenTitle: {
        fontSize: 24,
        color: "#26cccc",
        padding: 5,
        textTransform: 'capitalize'
    },
    leftTextStyle: {
        fontSize: 22,
        padding: 5,
        color: "#26cccc",
    },
    middleTextStyle: {
        fontSize: 22,
        marginLeft: 20,
        padding: 5,
        color: "#26cccc",
    },
    rightTextStyle: {
        fontSize: 22,
        marginLeft: 20,
        padding: 5,
        color: "#26cccc",
        fontWeight: "bold",

    },
    textStyle: {
        fontSize: 22,
        padding: 5,
        color: "#26cccc",
    },
    textButtonStyle: {
        fontSize: 22,
        marginTop: 5,
        padding: 5,
        color: "#26cccc",
        fontWeight: "bold",
    },
    activityIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 80
    },
    
    button: {
        /* marginTop: 5,
        height: 40,
        justifyContent: 'center',
        marginBottom: 2,
        backgroundColor: "#26cccc",
        alignItems: 'center',
        borderColor: '#eea236',
        paddingLeft: 18,
        paddingRight: 18,
        paddingBottom: 12,
        paddingTop: 12, */

        marginTop: 5,
        height: 45,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderRadius: 30,
        backgroundColor: "#26cccc",
        alignItems: 'center'

    },
    dialogContentContainer: {
        padding: 15,
        textAlign: 'center',
    },
    dialogContainer: {
        flex: 1,
        flexDirection: "row",
        marginBottom: 10
    },
    textcolor: {
        fontSize: 18,
        fontWeight: "bold",
        color: '#000'
    },
    input: {
        height: 40,
        backgroundColor: '#ffffff',
        marginBottom: 20,
        paddingHorizontal: 10,
        borderRadius: 10,
        borderColor: '#d2d4d6',
        borderWidth:2
    },


});
