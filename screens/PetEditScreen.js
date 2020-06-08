import React, { Component } from 'react';
import {
    Platform,
    DatePickerIOS,
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
    PixelRatio,
    BackHandler
} from 'react-native';
import Constant from './Constants';
import AuthLoadingScreen from './AuthLoadingScreen';
import DatePicker from 'react-native-datepicker';
import RNPickerSelect from 'react-native-picker-select';
import ImagePicker from 'react-native-image-picker';
import RNFetchBlob from 'rn-fetch-blob';
import PracticeBarLogo from './PracticeBarLogo';
import { HeaderBackButton } from 'react-navigation';
import { Icon, ListItem, Avatar, Divider, SearchBar } from 'react-native-elements';
import { DrawerActions } from 'react-navigation-drawer';
import App from '../App'
//import { OTSession, OTPublisher, OTSubscriber } from 'opentok-react-native';

const genderList = [
    {
        label: 'Male',
        value: 'Male'
    },
    {
        label: 'Female',
        value: 'Female'
    },
    {
        label: 'Male Neutered',
        value: 'Male Neutered'
    },
    {
        label: 'Female Neutered',
        value: 'Female Neutered'
    },
    {
        label: 'Unknown',
        value: 'Unknown'
    }
]
export default class PetEditScreen extends Component {
    static navigationOptions = ({ navigation }) => {
        // const item=navigation.getParam('item');
        //  console.warn(item);
        return {
            headerTitle: 'Pet Edit',
            /* headerRight: (
                <Icon 
                  name="menu"
                  onPress={()=>navigation.dispatch(DrawerActions.toggleDrawer())}
                />
            ), */

            headerLeft: <PracticeBarLogo />,
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
            headerLeftContainerStyle: {
                marginTop: StatusBar.currentHeight
            },
            headerRightContainerStyle: {
                marginTop: StatusBar.currentHeight
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
    };
    constructor(props) {
        super(props)

        this.state = {
            ImageSource: null,
            Image_TAG: '',
            data: null,
            petid: '',
            name: '',
            species: '',
            breed: '',
            sex: '',
            dob: '',
            practiceCode: '',
            currentWeight: '',
            dateofRIP: '',
            setDate: '',
            chosenDate: new Date(),
            showDatePicker: false,
            speciesArr: []
        },
            this.setDate = this.setDate.bind(this);
        this._goBack = this._goBack.bind(this);
        this.navigation;
        this.apiKey = '46169832';
        this.sessionId = '1_MX40NjE2OTgzMn5-MTU2MTk4ODUwMzcwOX5SdFhIQ002WGtvWXZwdEVqUWJBbDIzYmN-fg';
        this.token = 'T1==cGFydG5lcl9pZD00NjE2OTgzMiZzaWc9ZjRmNDk0N2I1ZTg3YTRkMTUyZWEyY2Y2MzUyYzI1ZTMxNzIxN2EyZjpzZXNzaW9uX2lkPTFfTVg0ME5qRTJPVGd6TW41LU1UVTJNVGs0T0RVd016Y3dPWDVTZEZoSVEwMDJXR3R2V1had2RFVnFVV0pCYkRJelltTi1mZyZjcmVhdGVfdGltZT0xNTYxOTg4NTQyJm5vbmNlPTAuNzM2Mjg5MzU3ODg0MDcwNiZyb2xlPXN1YnNjcmliZXImZXhwaXJlX3RpbWU9MTU2MTk5MjE0MCZpbml0aWFsX2xheW91dF9jbGFzc19saXN0PQ==';
    }
    async componentWillMount() {

        BackHandler.addEventListener('hardwareBackPress', this._goBack);
        const url = Constant.rootUrl + 'webservices/species.php';
        fetch(url)
            .then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.status == 'ok') {
                    this.setState({ speciesArr: responseJson.species });
                }
            })
    }
    async componentWillUnmount() {
        await AsyncStorage.removeItem('petEditData');
        BackHandler.removeEventListener('hardwareBackPress', this._goBack);
        this.focusListener.remove()
    }
    _goBack() {
        // this.props.navigation.goBack();
        this.props.navigation.navigate('Home');
        return true;
    }
    setDate(newDate) {
        console.warn(this.state.setDate);
        this.setState({ chosenDate: newDate });
    }
    onFocusFunction = async () => {
        this.setData();
    }
    async componentDidMount() {

        this.focusListener = this.props.navigation.addListener('didFocus', () => {
            this.onFocusFunction()
        })

        this.setData();
    }

    async setData() {
        let savedValues = await AsyncStorage.getItem('userToken');
        savedValues = JSON.parse(savedValues);
        this.id = savedValues.user.uid;
        //console.log("fetUserData saved data", savedValues, this.id);
        new App().fetUserData(this.id);


        const userToken = await AsyncStorage.getItem('userToken');
        if (userToken) {
            userDetails = JSON.parse(userToken);
            this.setState({ uid: userDetails.user.uid });
        } else {
            this.setState({ uid: false })
        }

        const petEditData = await AsyncStorage.getItem('petEditData');
        // console.log("pet edit screen ", petEditData);
        let item;
        if (petEditData) {
            item = JSON.parse(petEditData);

        }
        //  const item1 = this.props.navigation.state.params.item;
        // const item = this.props.navigation.getParam('item');
        // console.log("pet edit screen ", item);

        let source = '';
        item.id ?
            this.setState({
                petid: item.id
            }) : null
        item.img_url ?
            source = { uri: item.img_url }
            : null
        item.DateofRIP ?
            this.setState({
                setDate: item.DateofRIP
            }) : null
        item.dob ?
            this.setState({
                dob: item.dob
            })
            : new Date()
        item.sex ?
            this.setState({
                sex: item.sex
            })
            : null
        item.CurrentWeight ?
            this.setState({
                currentWeight: item.CurrentWeight
            })
            : null
        source ?
            this.setState({
                ImageSource: source
            })
            : null
        item.name ?
            this.setState({ name: item.name })
            : null
        item.species ?
            this.setState({ species: item.species })
            : null
        item.breed ?
            this.setState({ breed: item.breed })
            : null
        item.CurrentWeight ?
            this.setState({ currentWeight: item.CurrentWeight })
            : null
        item.practiceCode ?
            this.setState({ practiceCode: item.practiceCode })
            : null

        // console.log("weight ", this.state.currentWeight, item.CurrentWeight, this.state.name);
        // alert("weight2 ", this.state.currentWeight, item.CurrentWeight);
    }
    UpdateName = (text) => {
        this.setState({ name: text })
    }
    UpdateSpecies = (text) => {
        this.setState({ species: text })
    }
    UpdateBreed = (text) => {
        this.setState({ breed: text })
    }
    UpdateSex = (text) => {
        this.setState({ sex: text })
    }
    UpdateCurrentWeight = (text) => {
        this.setState({ currentWeight: text })
    }
    UpdatePracticeCode = (text) => {
        this.setState({ practiceCode: text })
    }
    selectPhotoTapped() {
        const options = {
            quality: 1.0,
            maxWidth: 500,
            maxHeight: 500,
            storageOptions: {
                skipBackup: true
            }
        };

        ImagePicker.showImagePicker(options, (response) => {
            console.log('Response = ', response);

            if (response.didCancel) {
                console.log('User cancelled photo picker');
            }
            else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            }
            else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            }
            else {
                let source = { uri: response.uri };
                this.setState({
                    ImageSource: source,
                    data: response.data
                });
            }
        });
    }
    editPet = () => {

        if (this.state.name == '') {
            alert("Please add your pet name");
        } else if (this.state.species == '' || this.state.species == null) {
            alert("Please select species field");
        } else if (this.state.sex == '' || this.state.sex == null) {
            alert("Please select sex field");
        } else {
            console.warn(this.state.setDate);
            RNFetchBlob.fetch('POST', Constant.rootUrl + 'webservices/add-pet.php?PetID=' + this.state.petid, {
                'Content-Type': 'multipart/form-data',
            }, [
                { name: 'image', filename: 'image.png', type: 'image/png', data: this.state.data },
                { name: 'name', data: this.state.name },
                { name: 'species', data: this.state.species },
                { name: 'breed', data: this.state.breed },
                { name: 'sex', data: this.state.sex },
                { name: 'currentWeight', data: this.state.currentWeight },
                { name: 'dob', data: this.state.dob },
                { name: 'dateofRIP', data: this.state.setDate },
                { name: 'practiceCode', data: this.state.practiceCode },
                { name: 'uid', data: this.state.uid },
                { name: 'action', data: 'edit' }
            ])
                .then((response) => response.json())
                .then((responseJson) => {

                    if (responseJson.status === 'ok') {
                        this.props.navigation.push('Home');
                    } else {
                        alert(responseJson.error);
                    }

                }).catch((err) => {
                    // ...
                })
        }

    }




    render() {
        const placeholder = {
            label: 'Select Sex',
            value: null,
            color: '#9EA0A4',
        };
        const SpeciesPlaceholder = {
            label: 'Select Species',
            value: null,
            color: '#9EA0A4',
        };
        //  const { navigate } = this.props.navigation;

        // const item = this.props.navigation.state.params.item;

        var showDatePicker = this.state.showDatePicker ?
            <DatePickerIOS
                style={styles.datePicker}
                date={this.state.chosenDate}
                onDateChange={(chosenDate) => this.setState({ chosenDate })}
                mode="date" /> : null
        return (
            <View style={styles.maincontainer}>
                <ScrollView style={styles.container}>
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                        {/*  <OTSession apiKey={this.apiKey} sessionId={this.sessionId} token={this.token}>
                            <OTPublisher style={{ width: 100, height: 100 }} />
                            <OTSubscriber style={{ width: 100, height: 100 }} />
                        </OTSession> */}
                    </View>
                    <TextInput placeholder="Name"
                        underlineColorAndroid="transparent"
                        placeholderTextColor='#555'
                        style={styles.input}
                        defaultValue={this.state.name}
                        onChangeText={this.UpdateName}
                    />
                    {/* <TextInput placeholder="Species"
                        underlineColorAndroid="transparent"
                        placeholderTextColor='#555'
                        style={styles.input}
                        defaultValue={item.species}
                        onChangeText={this.UpdateSpecies}
                    /> */}

                    <RNPickerSelect
                        placeholder={SpeciesPlaceholder}
                        items={this.state.speciesArr}
                        placeholderTextColor='#555'
                        useNativeAndroidPickerStyle={false}
                        onValueChange={value => {
                            this.setState({ species: value });
                        }}
                        value={this.state.species}
                        style={pickerSelectStyles}
                    />

                    <TextInput placeholder="Breed"
                        underlineColorAndroid="transparent"
                        placeholderTextColor='#555'
                        style={styles.input}
                        defaultValue={this.state.breed}
                        onChangeText={this.UpdateBreed}
                        onChangeText={this.UpdateBreed}
                    />
                    <RNPickerSelect
                        placeholder={placeholder}
                        items={genderList}
                        useNativeAndroidPickerStyle={false}
                        placeholderTextColor='#555'
                        onValueChange={value => {
                            this.setState({ sex: value });
                        }}
                        value={this.state.sex}
                        style={pickerSelectStyles}
                    />

                    <DatePicker
                        style={styles.datePicker}
                        date={this.state.dob}
                        mode="date"
                        placeholderTextColor='#555'
                        placeholder="select date of birth"
                        format="MM/DD/YYYY"
                        confirmBtnText="Done"
                        cancelBtnText="Cancel"
                        onDateChange={(dob) => { this.setState({ dob: dob }) }}
                        customStyles={{
                            dateInput: {
                                borderWidth: 0,
                                alignItems: 'flex-start',
                            },
                            dateIcon: {
                                width: 0,
                                height: 0,
                            },
                            dateText: {

                            }, placeholderText: {
                                color: '#555'
                            }
                        }}
                    />
                    <TextInput placeholder="Current Weight(Kg)"
                        underlineColorAndroid="transparent"
                        placeholderTextColor='#555'
                        ref={(input) => this.passwordInput = input}
                        style={styles.input}
                        defaultValue={this.state.currentWeight}
                        onChangeText={this.UpdateCurrentWeight}
                    />
                    {/* <TextInput placeholder="Practice Code"
                        underlineColorAndroid="transparent"
                        placeholderTextColor='#555'
                        ref={(input) => this.passwordInput = input}
                        style={styles.input}
                        defaultValue={item.PracticeCode}
                        onChangeText={this.UpdatePracticeCode}
                    /> */}
                    <DatePicker
                        style={styles.datePicker}
                        date={this.state.setDate}
                        mode="date"
                        placeholder="select date of RIP"
                        format="MM/DD/YYYY"
                        placeholderTextColor='#555'
                        confirmBtnText="Done"
                        cancelBtnText="Cancel"
                        onDateChange={(setDate) => { this.setState({ setDate: setDate }) }}
                        customStyles={{
                            dateInput: {
                                borderWidth: 0,
                                alignItems: 'flex-start',
                            },
                            dateIcon: {
                                width: 0,
                                height: 0,
                            },
                            dateText: {

                            }, placeholderText: {
                                color: '#555'
                            }
                        }}
                    />
                    <TouchableOpacity onPress={this.selectPhotoTapped.bind(this)} style={styles.ImageContainer}>
                        <View >
                            {this.state.ImageSource === null ? <Text>Select a Photo</Text> :
                                <Image style={styles.ImageContainer} source={this.state.ImageSource} />
                            }
                        </View>
                    </TouchableOpacity>
                    <View style={styles.buttoncontainer}>
                        <TouchableOpacity onPress={this.editPet} style={styles.button}>
                            <Text style={styles.textcolor}>Update</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        );
    }
    _updatePet = () => {
    };
}
const styles = StyleSheet.create({
    maincontainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        marginTop: 40,

    },
    input: {
        height: 40,
        backgroundColor: '#ffffff',
        marginBottom: 20,
        paddingHorizontal: 10,
        borderRadius: 10,
        borderColor: '#d2d4d6',
        borderWidth: 2
    },
    picker: {
        height: 44,
        backgroundColor: '#ffffff',
        paddingHorizontal: 10,
        borderRadius: 10,
        marginTop: 20,
        borderColor: '#d2d4d6'
    },
    pickerItem: {
        height: 44,
        color: "#fff",
        fontSize: 17
    },
    buttoncontainer: {
        marginTop: 40,
    },
    ImageContainer: {
        borderRadius: 10,
        width: 150,
        height: 150,
        borderColor: '#9B9B9B',
        borderWidth: 1 / PixelRatio.get(),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F6F6F6',

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
        fontSize: 20,
        color: '#FFFFFF'
    },
    progressBar: {
        transform: [{ scaleX: 1.0 }, { scaleY: 6 }],
        marginTop: 8,
        marginBottom: 15,
    },
    scrollView: {
        position: "absolute",
        bottom: 30,
        left: 0,
        right: 0,
        paddingVertical: 10,
    },

    datePicker: {
        width: '100%',
        //color: '#fff',
        height: 40,
        backgroundColor: '#ffffff',
        marginBottom: 20,
        paddingHorizontal: 10,
        borderRadius: 10,
        borderColor: '#d2d4d6',
        alignContent: 'flex-start',
        alignItems: 'flex-start',
        borderWidth: 2
    },
    dateText: {
        color: '#fff',
        justifyContent: 'center',
        marginTop: 5
    }
});
const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 1,
        paddingRight: 30, // to ensure the text is never behind the icon
        height: 40,
        backgroundColor: '#ffffff',
        marginBottom: 20,
        paddingHorizontal: 10,
        borderRadius: 10,
        borderColor: '#d2d4d6',
        borderWidth: 2
    },
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 0.5,
        borderColor: '#d2d4d6',
        paddingRight: 30,
        height: 40,
        backgroundColor: '#ffffff',
        marginBottom: 20,
        paddingHorizontal: 10,
        borderRadius: 10,
        borderWidth: 2,
        color: 'black'
        // to ensure the text is never behind the icon
    },
});