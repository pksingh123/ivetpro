import React, { Component } from 'react';
import {
    AsyncStorage,
    StyleSheet,
    WebView,
    PermissionsAndroid,
    View,
    Text,
    Image,
    TextInput,
    Button,
    TouchableOpacity,
    ActivityIndicator,
    BackHandler,
    Platform,
    TouchableHighlight,
    StatusBar
} from 'react-native';
import Constant from './Constants';
import {
    TwilioVideoLocalView,
    TwilioVideoParticipantView,
    TwilioVideo
} from 'react-native-twilio-video-webrtc';
import { HeaderBackButton, NavigationEvents } from 'react-navigation';
import PracticeBarLogo from './PracticeBarLogo';
import { DrawerActions } from 'react-navigation-drawer';
import { Icon, ListItem, SearchBar } from 'react-native-elements';
import Icons from 'react-native-vector-icons/FontAwesome';
import App from '../App';
import { EventRegister } from 'react-native-event-listeners';

export async function requestRecordAudioPermission() {
    try {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            {
                title: 'Cool Photo App record audio Permission',
                message:
                    'Cool Photo App needs access to your record audio ' +
                    'so you can take awesome pictures.',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
            },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.warn('You can use the camera');
        } else {
            console.warn('Camera permission denied');
        }
    } catch (err) {
        console.warn(err);
    }
}


export default class VideoConsultScreen extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            headerTitle: 'Video Call Started',
            headerLeft: <PracticeBarLogo />,
            headerLeftContainerStyle: {
                marginTop: StatusBar.currentHeight
            },
            headerRightContainerStyle: {
                marginTop: StatusBar.currentHeight
            },
            headerTintColor: '#ffffff',
            headerTitleStyle: {
                flex: 1,
                textAlign: 'center',
                marginTop: StatusBar.currentHeight
            },
            headerStyle: {
                backgroundColor: '#26cccc',
                color: '#fff',
                height: 80
            },
            headerRight: (
                <Icon
                    name="menu"
                    size={50}
                    color='#fff'
                    onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
                />
            ),
        }
    }
    constructor(props) {
        super(props);
        const { navigation } = this.props;
        this.state = {
            isAudioEnabled: true,
            isVideoEnabled: true,
            status: 'disconnected',
            participants: new Map(),
            videoTracks: new Map(),
            roomName: '',
            trackIdentifier: {},
            token: '',
            trackSid: '',
            isParticipant: false,
            isLoading: false,
            uid: '',
            practice_id: '',
            callStart: false,
            practiceOpenStatusMessages: '',
            practiceError: false,
            clientName: '',
            startButton: true
        }
        this._goBack = this._goBack.bind(this);
    }


    // async componentWillMount() {
    //     BackHandler.addEventListener('hardwareBackPress', this._goBack);

    // }
    async componentDidMount() {
        this.focusListener = this.props.navigation.addListener('didFocus', () => {
            this.onFocusFunction()
        })

        let savedValues = await AsyncStorage.getItem('userToken');
        savedValues = JSON.parse(savedValues);
        this.id = savedValues.user.uid;
        //console.log("fetUserData saved data", savedValues, this.id);
        new App().fetUserData(this.id);


    }
    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this._goBack);
    }
    _goBack() {
        this._updateCall();
        this.refs.twilioVideo.disconnect()
        this.props.navigation.push('Home');
        return true;
    }
    onFocusFunction = async () => {
        //alert("Booking appointment");
        let isAppLoginExpire = await AsyncStorage.getItem('isLoginExpire')
        if (isAppLoginExpire == 'Yes') {
            EventRegister.emit('appExpire', "")
        }
    }

    async componentWillMount() {
        console.warn("yes joined");
        this.props.navigation.setParams({ logout: this._signOutAsync });
        const userToken = await AsyncStorage.getItem('userToken');
        if (userToken) {
            userDetails = JSON.parse(userToken);
            console.warn(userDetails);
            this.setState({ uid: userDetails.user.uid, roomName: userDetails.user.email, practice_id: userDetails.user.practice.practice_id, clientName: userDetails.user.firstname });
        } else {
            this.setState({ uid: false })
        }



    }
    _updateCall = () => {

        const url = Constant.rootUrl + 'webservices/video-consult-now.php?cancelCall=1&userId=' + this.state.uid;
        fetch(url)
            .then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.ststus === 'ok') {

                }
                else {
                }
            })
            .catch((error) => {
                alert('Somthing went wrong!');
                console.warn(error);
            })

    }
    _onConnectButtonPress = () => {
        this._webNotification();
        console.log("start now ", this.state.uid, this.state.practice_id);
        this.setState({ isLoading: true })
        const url = Constant.rootUrl + 'webservices/video-consult-now.php?userId=' + this.state.uid + '&practice_id=' + this.state.practice_id;
        fetch(url)
            .then((response) => response.json())
            .then((responseJson) => {
                console.log(responseJson);
                if (responseJson.status === 'ok') {
                    console.log(this.state.roomName);

                    this.setState({
                        token: responseJson.tokenData.token,
                        isLoading: false,
                        status: 'connecting',
                        callStart: true,
                        practiceError: false,
                        startButton: false,
                    })
                    this.refs.twilioVideo.connect({
                        roomName: this.state.roomName,
                        accessToken: responseJson.tokenData.token
                    })
                } else {
                    this.setState({
                        practiceError: true,
                        isLoading: false,
                        callStart: false,
                        startButton: true,
                        practiceOpenStatusMessages: responseJson.message
                    })
                }
            })
            .catch((error) => {
                alert('Something went wrong!');
                console.warn(error);
            })
        //this.refs.twilioVideo.connect({ roomName: this.state.roomName, accessToken: this.state.token })
        this.setState({ status: 'connecting' })
    }
    _webNotification = () => {

        const url = Constant.rootUrl + 'webservices/mobile-to-web-notification.php';
        // this.setState({ isLoading: true });
        fetch(url,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    'uid': this.state.uid,
                    'practice_id': this.state.practice_id,
                    'notificationType': 'withOutAppointment',
                    // 'bookingId': this.state.cancelreason,
                    //'petId': this.state.cancelreason,
                    'room': this.state.roomName,

                }),
            })
            .then((response) => response.json())
            .then((responseJson) => {
                console.warn("web notification api ", responseJson);
                if (responseJson.status === 'ok') {


                } else if (responseJson.error) {

                }

            })
            .catch((error) => {
                // alert('Something went wrong!');
                console.warn(error);
            })
    }

    _onEndButtonPress = () => {
        this._updateCall();
        this.setState({ startButton: true })
        this.refs.twilioVideo.disconnect()
        // this.props.navigation.push('Home');
    }

    _onMuteButtonPress = () => {
        this.refs.twilioVideo.setLocalAudioEnabled(!this.state.isAudioEnabled)
            .then(isEnabled => this.setState({ isAudioEnabled: isEnabled }))
    }

    _onFlipButtonPress = () => {
        this.refs.twilioVideo.flipCamera()
    }

    _onRoomDidDisconnect = ({ roomName, error }) => {
        console.log("ERROR: ", error)

        this.setState({ status: 'disconnected', startButton: true })
    }

    _onRoomDidFailToConnect = (error) => {
        console.log("ERROR: ", error)

        this.setState({ status: 'disconnected', startButton: true })
    }

    _onParticipantAddedVideoTrack = ({ participant, track }) => {
        //console.warn("onParticipantAddedVideoTrack: ", participant, track)

        this.setState({
            videoTracks: new Map([
                ...this.state.videoTracks,
                [track.trackSid, { participantSid: participant.sid, videoTrackSid: track.trackSid }]
            ]),
        });

        this.setState({
            trackSid: track.trackSid, isParticipant: true,
            trackIdentifier: { participantSid: participant.sid, videoTrackSid: track.trackSid }
        });

        /* Array.from(this.state.videoTracks, ([trackSid, trackIdentifier]) => {
          console.warn(trackSid)
          console.warn(trackIdentifier)
        }) */
        // console.warn(this.state.trackSid)
        // console.warn(this.state.trackIdentifier)

    }

    _onParticipantRemovedVideoTrack = ({ participant, track }) => {
        console.log("onParticipantRemovedVideoTrack: ", participant, track)

        const videoTracks = this.state.videoTracks
        videoTracks.delete(track.trackSid)

        this.setState({ videoTracks: { ...videoTracks } })
    }
    render() {

        var participantScreen = this.state.isParticipant ?
            <View style={styles.remoteGrid}>
                <TwilioVideoParticipantView
                    style={styles.remoteVideo}
                    key={this.state.trackSid}
                    trackIdentifier={this.state.trackIdentifier}
                />
            </View>
            : null
        if (this.state.isLoading) {
            return (
                <View style={{ flex: 1, padding: 20 }}>
                    {<ActivityIndicator
                        color='#2ba9bc'
                        size="large"
                        style={styles.activityIndicator} />}
                </View>
            )
        }
        return (

            <View style={styles.container}>


                {
                    this.state.callStart ?
                        <View style={styles.container}>

                            {
                                //this.state.status === 'disconnected' &&
                                // <View>
                                //     <Text style={styles.welcome}>
                                //         React Native Twilio Video
                                //     </Text>

                                //     <TextInput
                                //         style={styles.input}
                                //         autoCapitalize='none'
                                //         value={this.state.roomName}
                                //         onChangeText={(text) => this.setState({ roomName: text })}>
                                //     </TextInput>
                                //     <TextInput
                                //         style={styles.input}
                                //         autoCapitalize='none'
                                //         value={this.state.token}
                                //         onChangeText={(text) => this.setState({ token: text })}>
                                //     </TextInput>

                                // </View>
                            }

                            {
                                (this.state.status === 'connected' || this.state.status === 'connecting') &&
                                <View style={styles.callContainer}>
                                    {participantScreen}
                                    <View style={styles.remoteGrid} >
                                        <TwilioVideoLocalView
                                            enabled={true}
                                            style={styles.remoteVideo}
                                        />
                                    </View>
                                    <View
                                        style={styles.optionsContainer}>
                                        {/* <TwilioVideoLocalView
                                            enabled={true}
                                            style={styles.localVideo}
                                        /> */}
                                        <TouchableOpacity
                                            style={styles.optionButton}
                                            onPress={this._onEndButtonPress}>
                                            {/* <Text style={{ fontSize: 12 }}>End</Text> */}
                                            <Image style={{
                                                height: 45, width: 45,
                                            }} source={require('./images/end_end.png')} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.optionButton}
                                            onPress={this._onMuteButtonPress}>
                                            {/* <Text style={{ fontSize: 12 }}>{this.state.isAudioEnabled ? "Mute" : "Unmute"}</Text> */}
                                            {this.state.isAudioEnabled ?
                                                <Image style={{
                                                    height: 35, width: 35,
                                                }} source={require('./images/mute_voice.png')} />
                                                : <Image style={{
                                                    height: 35, width: 35,
                                                }} source={require('./images/unmute.png')} />
                                            }
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.optionButton}
                                            onPress={this._onFlipButtonPress}>
                                            {/* <Text style={{ fontSize: 12 }}>Flip</Text> */}
                                            <Image style={{
                                                height: 45, width: 45,
                                            }} source={require('./images/switch_camera.png')} />
                                        </TouchableOpacity>

                                    </View>
                                </View>
                            }
                            <TwilioVideo
                                ref="twilioVideo"
                                onRoomDidConnect={this._onRoomDidConnect}
                                onRoomDidDisconnect={this._onRoomDidDisconnect}
                                onRoomDidFailToConnect={this._onRoomDidFailToConnect}
                                onParticipantAddedVideoTrack={this._onParticipantAddedVideoTrack}
                                onParticipantRemovedVideoTrack={this.onParticipantRemovedVideoTrack}
                            />

                        </View>
                        :
                        <View style={styles.container}>
                            <Text style={styles.welcome}>
                                {this.state.practiceOpenStatusMessages}
                            </Text>
                        </View>
                }
                {
                    this.state.startButton ?
                        <View style={{ flex: 1, padding: 20 }}>
                            <TouchableHighlight

                                style={styles.button}
                                onPress={this._onConnectButtonPress}>
                                <Text style={styles.textColor}>Start Now</Text>
                            </TouchableHighlight>

                        </View>
                        : null
                }

            </View>
        );

    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    callContainer: {
        flex: 1,
        position: "absolute",
        bottom: 0,
        top: 0,
        left: 0,
        right: 0
    },
    welcome: {
        fontSize: 30,
        textAlign: 'center',
        paddingTop: 40
    },
    input: {
        height: 50,
        borderWidth: 1,
        marginRight: 70,
        marginLeft: 70,
        marginTop: 50,
        textAlign: 'center',
        backgroundColor: 'white'
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
    textColor: {
        color: '#FFFFFF',
        fontSize: 20
    },
    localVideo: {
        flex: 1,
        width: 150,
        height: 250,
        position: "absolute",
        right: 10,
        bottom: 90
    },
    remoteGrid: {
        flex: 1,
        //flexDirection: "row",
        //flexWrap: 'wrap'
    },
    remoteVideo: {
        flex: 1,
        //marginTop: 20,

        //alignSelf: 'stretch',


    },
    optionsContainer: {
        position: "absolute",
        left: 0,
        bottom: 0,
        right: 0,
        height: 65,
        backgroundColor: 'blue',
        flexDirection: "row",
        alignItems: "center"
    },
    optionButton: {
        width: 50,
        height: 50,
        marginLeft: 10,
        marginRight: 10,
        borderRadius: 100 / 2,
        backgroundColor: 'grey',
        justifyContent: 'center',
        alignItems: "center"
    },
    activityIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 80
    },
});
