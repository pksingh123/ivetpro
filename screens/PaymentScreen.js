import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableHighlight,
    ScrollView
} from 'react-native';
import Stripe from 'react-native-stripe-api';
const url = 'https://videowithmyvet.com/webservices/charge.php';

export default class PaymentScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            cardNumber: '4242424242424242',
            expMonth: '09',
            expYear: '19',
            cvc: '111',
            token: '',
            email: '',
            uid: '',
            bookingId:'',

            canPay: false,
        }

    }
    async componentWillMount() {
        this.props.navigation.setParams({ logout: this._signOutAsync });
        const userToken = await AsyncStorage.getItem('userToken');
        if (userToken) {
            userDetails = JSON.parse(userToken);
            // console.warn(userDetails);
            this.setState({
                uid: userDetails.user.uid,
                email: userDetails.user.email,
                /* clientFirstName: userDetails.user.firstname,
                clientLastName: userDetails.user.lastname, */
            });
        } else {
            this.setState({ uid: false })
        }



    }

    payme = () => {
        const apiKey = 'pk_test_8m4FhXKfFi1sd2GFuWHDyGNh00sSApCudF';
        const client = new Stripe(apiKey);
        client.createToken({
            number: this.state.cardNumber,
            exp_month: this.state.expMonth,
            exp_year: this.state.expYear,
            cvc: this.state.cvc,

        }).then((resp) => {
            console.warn(resp.id);
            if (resp.id) {
                this.setState({
                    token: resp.id
                });

                fetch(url,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            "email": this.state.email,
                            "uid": this.state.uid,
                            "token": resp.id,
                            "amount": 50,
                            "currency": "USD",
                            "description": "Test Item",
                            "bookingId": this.state.bookingId,

                        }),
                    })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        console.warn(responseJson);
                        if (responseJson.status === 'ok') {

                            this.setState({ success: 'Your appointment has been booked!', faield: false });

                        } else {
                            this.setState({ success: false, faield: 'Your appointment booking has been faield!' });

                        }
                        this.setState({ isLoading: false });
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
        const item = this.props.navigation.state.params.item;
        alert(item.bookingId);
        console.warn(item);
        this.setState({ bookingId: item.bookingId })

        return (
            <View style={styles.maincontainer}>
                <ScrollView style={styles.container}>

                    <Text style={styles.welcome}>Welcome to React Native!</Text>

                    <TextInput style={styles.inputtext}
                        onChangeText={(CardNumber) => this.setState({ CardNumber: CardNumber })}
                        value={this.state.cardNumber}
                        placeholder={"Card Number"}
                    />
                    <TextInput style={styles.inputtext}
                        onChangeText={(expMonth) => this.setState({ expMonth: expMonth })}
                        placeholder={"Expire Month"}
                    />
                    <TextInput style={styles.inputtext}
                        onChangeText={(expYear) => this.setState({ expYear: expYear })}
                        placeholder={"Expire Year"}
                    />
                    <TextInput style={styles.inputtext}
                        onChangeText={(cvc) => this.setState({ cvc: cvc })}
                        placeholder={"cvc"}
                        secureTextEntry={true}

                    />
                    <TouchableHighlight onPress={this.payme.bind(this)} style={styles.button}>
                        <Text style={styles.textcolor}>Pay</Text>
                    </TouchableHighlight>
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    inputtext: {
        height: 40,
        backgroundColor: '#ffffff',
        marginBottom: 20,
        paddingHorizontal: 10,
        borderRadius: 10,
        borderColor: '#d2d4d6',
        borderWidth:2
    },
    buttoncontainer: {
        marginTop: 40,
    },
    button: {
        marginTop: 5,
        height: 45,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderRadius: 30,
        backgroundColor: "#00BFFF",
        alignItems: 'center'
    },
    textcolor: {
        color: '#FFFFFF'
    }
});
