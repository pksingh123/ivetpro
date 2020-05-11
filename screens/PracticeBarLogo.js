import React, { Component } from 'react';
import Constant from './Constants';
import { AsyncStorage, StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { withNavigation } from 'react-navigation';

export default class PracticeBarLogo extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            practice_logo_url: '',
            practice_name: ''
        }

    }

    async componentWillMount() {
        const userToken = await AsyncStorage.getItem('userToken');
        if (userToken) {
            userDetails = JSON.parse(userToken);
            //console.warn(userDetails.user.practice.practice_logo_url);
            this.setState({ practice_logo_url: userDetails.user.practice.practice_logo_url, practice_name: userDetails.user.practice.name });
        } else {
            this.setState({ practice_logo_url: false, practice_name: '' })
        }
    }
    // 'https://raw.githubusercontent.com/AboutReact/sampleresource/master/logosmalltransparen.png',

    render() {
        //const { navigate } = this.props.navigation;


        return (

            <TouchableOpacity >
                <Image
                    source={{ uri: this.state.practice_logo_url }}
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 40 / 2,
                        marginLeft: 10,

                    }}
                />
            </TouchableOpacity>




        );
    }
}