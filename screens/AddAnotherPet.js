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
    Alert,
} from 'react-native';
import Constant from './Constants';
export default class AddAnotherPet extends Component {
    static navigationOptions = {
        title: 'Add First Pet',
        headerTintColor: '#ffffff',
        headerStyle: {
            backgroundColor: '#26cccc',
            color: '#fff'
        },
    };

    constructor(props) {
        super(props);
        this.state = {
            petname: this.props.navigation.getParam('petName'),
            isLoading: false,
            cancel: false,
            uid: '',
            petId: this.props.navigation.getParam('petId'),
            GridViewItems: [

            ],
        }

    }

    componentDidMount() {
        const url = Constant.rootUrl + 'webservices/client-pet-by-id.php?action=alive&petid=' + this.state.petId;
        fetch(url)
            .then((response) => response.json())
            .then((responseJson) => {
                console.warn(responseJson);
                if (responseJson.status === 'ok') {
                    this.setState({
                        GridViewItems: responseJson.pets,
                    })
                } else {
                    alert(responseJson.error);
                }
            })
            .catch((error) => {
                alert('Something went wrong!');
                console.warn(error);
            })
    }


    _bookAppointment = (item) => {
        this.props.navigation.push('routeFirstBookAppointment', { item });
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
                <Text style={styles.headingstyle}>great, {this.state.petname} has been added</Text>
                <Text style={styles.headingstyle}>would you like to: </Text>
                <ScrollView style={styles.container}>
                    <View style={styles.buttoncontainer}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('AddFirstPetDetails', { pet_name: '', lastid: '' })} style={styles.button}>
                            <Text style={styles.textcolor}>Add another pet</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this._bookAppointment(this.state.GridViewItems)} style={styles.button}>
                            <Text style={styles.textcolor}>Book an appointment</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.props.navigation.push('Home')} style={styles.button}>
                            <Text style={styles.textcolor}>Go to Home Page</Text>
                        </TouchableOpacity>
                    </View>
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
        paddingHorizontal: 20,
        marginTop: 60,

    },
    headingstyle: {
        fontSize: 20,
        color: '#FFFFFF',
        alignSelf: "center",
        fontWeight: "600",
        marginBottom: 2,
        padding: 5,
    },
    input: {
        height: 40,
        backgroundColor: '#2980b9',
        marginBottom: 20,
        paddingHorizontal: 10,
        borderRadius: 10,
        borderColor: '#ccc'
    },
    buttoncontainer: {
        marginTop: 40,
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
        fontSize: 20,
    }

});