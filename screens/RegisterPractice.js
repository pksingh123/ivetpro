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
    Modal
} from 'react-native';
import Constant from './Constants';
import Autocomplete from 'react-native-autocomplete-input';

export default class RegisterPractice extends Component {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props)
        this.state = {
            checked: false,
            isLoading: true,
            practiceCode: '',
            practiceCodeId: '',
            postalCode: '',
            registerButton: true,
            query: '',
            items: [

            ],
            practicecodesDetails: [

            ],
            serverData: [],
            itemSelected: true,
            openPopup: false,

        },
            this.navigation;
    }

    updatePracticeCode = (item) => {
        this.setState({ itemSelected: false, query: item.name, practiceCode: item.name, practiceCodeId: item.id, postalCode: this.state.practicecodesDetails[item.id], registerButton: false });
    }

    componentDidMount() {

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

    nextRegister = () => {

        this.props.navigation.navigate('Register', {
            'practice_id': this.state.practiceCodeId,
            'practiceCode': this.state.practiceCode,
            'postalCode': this.state.postalCode

        });
    }



    renderItems = ({ item }) => {
        if (this.state.itemSelected) {
            return (
                <ScrollView>
                    <TouchableOpacity onPress={() => this.updatePracticeCode(item)}>
                        <Text style={styles.itemText}>
                            {item.name}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            );
        } else {
            return null;
        }


    }
    render() {
        const { navigate } = this.props.navigation;
        const { query } = this.state;
        const items = this.findPractice(query);
        const comp = (a, b) => a.toLowerCase().trim() === b.toLowerCase().trim();

        var practiceDetailsText = this.state.practiceCodeId ?

            <Text style={styles.searchText}>{this.state.practicecodesDetails[this.state.practiceCodeId].name}, {this.state.practicecodesDetails[this.state.practiceCodeId].address}, {this.state.practicecodesDetails[this.state.practiceCodeId].postal_code}, {this.state.practicecodesDetails[this.state.practiceCodeId].phone_no}
            </Text>

            : null
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
                <Image
                    style={styles.logoStyle}
                    source={require('./images/logo.png')}
                    resizeMethod="auto"
                />
                <Text style={styles.slogon}>Choose your veterinary practice</Text>
                <ScrollView style={styles.container}>
                    <View style={styles.autocompleteContainer}>

                        <Autocomplete
                            autoCapitalize="none"
                            autoCorrect={false}
                            //containerStyle={styles.autocompleteContainer}
                            inputContainerStyle={styles.input}
                            listContainerStyle={styles.listContainerStyle}
                            listStyle={styles.listStyle}
                            data={items}
                            defaultValue={query}
                            onChangeText={text => this.setState({ query: text, itemSelected: true })}
                            placeholder="Search practice here"
                            //style={styles.input}
                            renderItem={this.renderItems}
                        />

                    </View>
                    {practiceDetailsText}
                    <View style={styles.buttoncontainer}>
                        <TouchableOpacity onPress={this.nextRegister} disabled={this.state.registerButton} style={styles.button}>
                            <Text style={styles.textcolor}>Next</Text>
                        </TouchableOpacity>
                        <Text style={styles.Textlink}>Already have an account? <Text style={styles.link} onPress={() => navigate('Login')} >Login</Text></Text>

                    </View>
                </ScrollView>
            </View>
        );
    }

    _cancelInAsync = async () => {
        this.props.navigation.navigate('Login');
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
        marginTop: 10,
    },
    autocompleteContainer: {
        // flex: 1,
        // left: 10,
        // position: 'absolute',
        // right: 10,
        // top: 0,
        // zIndex: 1,
        //paddingHorizontal: 30,
        //backgroundColor: '#ffffff',
        //borderColor:"#fff"
        flex: 1,
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: 1
    },
    listContainerStyle: {

    },
    listStyle: {

    },
    input: {
        height: 44,
        backgroundColor: '#F6F6F6',
        //marginBottom: 0,
        //paddingHorizontal: 10,
        //borderRadius: 0,
    },
    itemText: {
        fontSize: 15,
        margin: 8,
        color: '#555'
    },
    logoStyle: {
        alignSelf: "center",
        width: 100,
        height: 100,
        marginVertical: 30

    },
    link: {
        color: '#ffffff',
        fontSize: 20,
        alignSelf: 'center',
        marginBottom: 10,
    },


    slogon: {
        color: '#ffffff',
        alignSelf: "center",
        marginBottom: 10,
        fontSize: 22,
    },
    buttoncontainer: {
        marginTop: 40,
        // flex: 1,
        // alignSelf: 'flex-end',
        // position: 'absolute',
        // bottom: 35
        //flex: 1,
        //justifyContent: 'flex-end'
    },
    button: {
        marginTop: 50,
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
        color: '#ffffff',
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
    link: {
        color: '#ffffff',
        fontSize: 20,
        alignSelf: 'center',
        marginTop: 10
    },
    searchText: {
        //marginBottom: 5,
        marginLeft: 10,
        marginTop: 60,
        textAlign: 'center',
        paddingHorizontal: 10,
        color: '#ffffff',
        fontSize: 18,
    },
    Textlink: {
        color: '#ffffff',
        fontSize: 18,
        alignSelf: 'center',
        marginTop: 10,
    }
});