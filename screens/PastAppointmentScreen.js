import React, { Component } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    View,
    Text,
    BackHandler
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { Icon, Avatar, Divider } from 'react-native-elements';
import Icons from 'react-native-vector-icons/FontAwesome';
import { DrawerActions } from 'react-navigation-drawer';
import { HeaderBackButton } from 'react-navigation';
import PracticeBarLogo from '../screens/PracticeBarLogo';
import ShowMore from 'react-native-show-more-button';
import { Dimensions } from "react-native";
const SCREEN_HEIGHT = Dimensions.get("window").height;


export default class PastAppointmentScreen extends Component {

    static navigationOptions = ({ navigation }) => {
        const item = navigation.state.params.item;
        return {
            headerTitle: 'Past Appointments',
            headerLeft: <HeaderBackButton onPress={() => navigation.push('Home')} />,
            headerTintColor: '#ffffff',
            headerStyle: {
                backgroundColor: '#26cccc',
                color: '#fff'
            },
        }
    };
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            isLoading: true,
            petAliveStatus: '',
            GridViewItems: []
        }
        //this.exitFromApp = this.exitFromApp.bind(this);
        this._goBack = this._goBack.bind(this);

    }
    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this._goBack);
    }
    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this._goBack);
    }
    _goBack() {
        // this.props.navigation.goBack();
        this.props.navigation.navigate('Home');
        return true;
    }
    componentDidMount() {
        const item = this.props.navigation.state.params.item;
        this.setState({ petAliveStatus: item.status, name: item.name })
        const url = 'https://videowithmyvet.com/webservices/booking-appointment.php?action=PastAppointment&patientId=' + item.id;
        fetch(url)
            .then((response) => response.json())
            .then((responseJson) => {
                console.log(responseJson);
                if (responseJson.totalCount > 0) {
                    console.warn(responseJson);
                    this.setState({
                        isLoading: false
                    })
                    this.setState({
                        GridViewItems: responseJson.data
                    })
                    // this.arrayholder = responseJson.data;
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
    renderItem = ({ item, index }) => {
        return (
            <View style={styles.itemContainer}>
                <View style={{ backgroundColor: index % 2 == 0 ? "#eae6e6" : "#D3D3D3", paddingTop: 10, paddingBottom: 10 }}>
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                        <Text style={styles.leftTextStyle}>{item.date} </Text>
                        <Text style={styles.middleTextStyle}>{item.time}</Text>
                    </View>
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                        <Text style={styles.textStyle}>{item.status1}</Text>
                    </View>
                    <ShowMore height={30} buttonColor={"#26cccc"} showMoreText="More >>" showLessText="Less">
                        <Text style={styles.textStyle} >{item.cliical_notes}</Text>
                    </ShowMore>
                </View>
            </View>
        );
    };

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


            </View>
        )
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        textAlign: 'center',
    },
    screenTitle: {
        fontSize: 24,
        color: "#26cccc",
        padding: 5,
        textTransform: 'capitalize'
    },
    itemContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'stretch',
    },
    leftTextStyle: {
        fontSize: 22,
        padding: 5,
        color: "#666",
    },
    middleTextStyle: {
        fontSize: 22,
        marginLeft: 20,
        padding: 5,
        color: "#666",
    },
    rightTextStyle: {
        fontSize: 22,
        marginLeft: 20,
        padding: 5,
        color: "#26cccc",
        fontWeight: "bold",

    },
    textStyle: {
        fontSize: 20,
        padding: 5,
        color: "#666",
    },
    activityIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 80
    },
    buttoncontainer: {
        marginTop: 40,
    },
    button: {
        marginTop: 5,
        height: 40,
        justifyContent: 'center',
        marginBottom: 2,
        alignItems: 'center',
        //paddingLeft:18,
        padding: 5,
    },
    textcolor: {
        color: '#26cccc',
        fontSize: 22,
        textDecorationLine: "underline",
        textDecorationStyle: "solid",
        textDecorationColor: "#26cccc"
    },


});
