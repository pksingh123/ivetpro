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

export default class AddFirstPet extends Component {
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
            petname: '',
            isLoading: false,
            cancel: false,
            uid: ''
        }

    }

    updatPet = (text) => {
        this.setState({ petname: text })
    }
    async componentDidMount() {
        const userToken = await AsyncStorage.getItem('userToken');
        if (userToken) {
            userDetails = JSON.parse(userToken);
            this.setState({ uid: userDetails.user.uid });
        } else {
            this.setState({ uid: false })
        }
    }
    addpet = () => {
        if (this.state.petname === '') {
            alert('Please enter pet name!');
        } else {
            this.props.navigation.push('AddFirstPetDetails', { pet_name: this.state.petname });
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
                <Text style={styles.headingstyletop}>now you are registered</Text>
                <Text style={styles.headingstyle}>lets add your first pet</Text>
                <ScrollView style={styles.container}>
                    <TextInput placeholder="What is your pet's name:"
                        returnKeyType="next"
                        underlineColorAndroid="transparent"
                        placeholderTextColor='#555'
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={styles.input}
                        selectionColor={'white'}
                        onChangeText={this.updatPet}
                    />

                    <View style={styles.buttoncontainer}>
                        <TouchableOpacity onPress={() => this.addpet(this.state.petname)} style={styles.button}>
                            <Text style={styles.textcolor}>Continue</Text>
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
    headingstyletop:{
        color: '#ffffff',
        alignSelf: "center",
        marginTop: 10,
        marginBottom: 10,
        fontSize: 20,
    },
    headingstyle: {
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
        fontSize: 20
    }

});