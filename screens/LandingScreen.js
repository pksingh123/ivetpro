import React, { Component } from 'react';
import {
    ActivityIndicator,
    AsyncStorage,
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    Modal,
    TouchableHighlight
} from 'react-native';
import { WebView } from 'react-native-webview';


export default class LandingScreen extends Component {
    static navigationOptions = ({ navigation }) => {

        return {
            header: null
        }
    };
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            isLoading: false,
            cancel: false,
            openPopup: false,
            
        }

    }
    setModalVisible(visible) {
        this.setState({ openPopup: visible });
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
                <ScrollView style={styles.container}>
                    <Image
                        style={styles.logoStyle}
                        source={require('./images/logo.png')}
                        resizeMethod="auto"
                    />
                    <Text style={styles.welcomeStyle} >Welcome</Text>
                    <Text style={styles.slogon} >Making video consultations</Text>
                    <Text style={styles.slogon} >with your vet easy</Text>

                    <View style={styles.buttoncontainer}>
                        
                        <TouchableOpacity onPress={() => navigate('Login')} style={styles.button}>
                            <Text style={styles.textcolor}>Login</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.props.navigation.push('RegisterPractice')} style={styles.button}>
                            <Text style={styles.textcolor}>Register</Text>
                        </TouchableOpacity>
                        <Text onPress={() => this.setState({ openPopup: true })}
                            style={styles.subTextColor}> How it works</Text>
                    </View>
                </ScrollView>
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
                        source={{ uri: 'https://videowithmyvet.com/how-it-works-2/' }}
                        style={{ marginTop: 20 }}
                    />
                </Modal>
            </View>

        );
    }
    //RegisterPractice
    _signInAsync = async (json) => {
        const value = JSON.stringify(json);
        await AsyncStorage.setItem('userToken', value);
        this.setState({ isLoading: false });
        this.props.navigation.navigate('App');
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
        marginTop: 20,
    },
    logoStyle: {
        alignSelf: "center",
        width: 200,
        height: 200,
        marginVertical: 40,
        
    },
    closeStyle: {
        marginRight: 15,
        marginTop: 10,
        fontSize: 20,
        textAlign: 'right'
    },
    subTextColor: {
        color: '#fff',
        alignSelf: "center",
        fontSize: 18,
        marginBottom: 10,
    },
    welcomeStyle: {
        color: '#ffffff',
        alignSelf: "center",
        fontWeight: "500",
        marginBottom: 10,
        fontSize: 35,
    },
    slogon: {
        color: '#ffffff',
        alignSelf: "center",
        marginBottom: 10,
        fontSize: 20,
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
    textcolor: {
        color: '#ffffff',
        fontSize: 20
    },


});