import React, { Component } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    StyleSheet,
    Image,
    Dimensions,
    Alert
} from 'react-native';

// Import the react-native-sound module
var Sound = require('react-native-sound');
// Enable playback in silence mode
Sound.setCategory('Playback');
import Icon from 'react-native-vector-icons/Entypo';
import FontAwesome from 'react-native-vector-icons/FontAwesome'
const { width } = Dimensions.get('window');

export default class CallScreen extends Component {

    constructor(props) {
        super(props);
        this.whoosh = new Sound('ringtone.mp3', Sound.MAIN_BUNDLE, (error) => {
            this.playRing()
            if (error) {
                console.log('failed to load the sound', error);
                return;
            }
        });

        this.state = {
            modalVisible: false,
            userSelected: [],
            User: {
                id: 1,
                name: "Mark Johnson",
                image: "https://bootdey.com/img/Content/avatar/avatar6.png",
            }
        };
    }
    componentWillUnmount() {
        this.whoosh.release();
    }

    playRing() {
        this.whoosh.reset;
        this.whoosh.play((success) => {
            alert(success)
            if (success) {
                console.log('successfully finished playing');
            } else {
                console.log('playback failed due to audio decoding errors');
            }
        });
    }

    stopRing() {
        this.whoosh.pause()
        this.whoosh.stop();
    }
    clickEventListener = () => {
        // if (this.whoosh.isPlaying) {
        //     this.whoosh.setCurrentTime(0)
        // }
        this.playRing()
        Alert.alert('Message', 'button clicked');
    }

    pickPhone() {
        this.stopRing()
        const onPick = this.props.navigation.getParam('onPick', null);

        if (onPick != null) {
            onPick({ data: "Bhagat" });
        }
    }
    cancelPhone() {
        this.stopRing()
        this.props.navigation.navigate('AuthLoading');
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <View style={styles.topBar}>
                    <View style={{ flexDirection: 'row' }}>
                        <Image style={[styles.iconImg, { marginRight: 50 }]} source={{ uri: "https://img.icons8.com/color/48/000000/video-call.png" }} />
                        <Text style={styles.subText}>INCOMING CALL</Text>
                    </View>
                    <Text style={styles.title}>{this.state.User.name}</Text>
                    <Text style={styles.subText}>CALLING</Text>
                </View>

                <Image style={[styles.image]} source={{ uri: this.state.User.image }} />
                <View style={styles.bottomBar}>

                    <TouchableOpacity style={[styles.btnAction, styles.shadow, { backgroundColor: "green" }]} onPress={() => this.pickPhone()}>
                        <FontAwesome name="phone" size={20} color="white" style={{ alignSelf: 'center' }} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.btnAction, styles.shadow, { backgroundColor: "red" }]} onPress={() => this.cancelPhone()}>
                        <Icon name="phone" size={20} color="white" style={{ alignSelf: 'center' }} />
                    </TouchableOpacity>

                </View>
            </View>
        );
    }

}

const styles = StyleSheet.create({
    topBar: {
        backgroundColor: '#075e54',
        height: 140,
        justifyContent: 'center',
        padding: 20,
    },
    image: {
        width,
        height: 400,
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#e20e30',
        marginTop: 250
    },
    bottomBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#075e54',
        flex: 1,
    },
    title: {
        color: '#f0efef',
        fontSize: 36,
    },
    subText: {
        color: '#c8c8c8',
        fontSize: 14,
    },
    iconImg: {
        height: 32,
        width: 32,
        alignSelf: 'center'
    },
    btnStopCall: {
        height: 65,
        width: 65,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 32,
        backgroundColor: "#FF0000",
        position: 'absolute',
        bottom: 160,
        left: '40%',
        zIndex: 1,
    },
    btnAction: {
        height: 60,
        width: 60,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
        backgroundColor: "#fff",
    },
    shadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.34,
        shadowRadius: 6.27,
        elevation: 10,
    }
}); 