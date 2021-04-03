import React, { Component } from "react";
import {
  Alert,
  TouchableWithoutFeedback,
  AsyncStorage,
  View,
} from "react-native";
import { firestore } from "react-native-firebase";
import { Actions, Bubble, GiftedChat } from "react-native-gifted-chat";
import ImagePicker from "react-native-image-picker";
import Icons from "react-native-vector-icons/Feather";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import RNFetchBlob from "rn-fetch-blob";
import { sendNotification } from "../utils/notifications";

export default class ChatScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    navOptions = navigation;
    const { params = {} } = navigation.state;
    return {
      headerTitle: "Chat",
      headerTintColor: "#26cccc",
      headerStyle: {
        backgroundColor: "#fff",
        color: "#fff",
        height: 80,
      },
      headerRight: (
        <TouchableWithoutFeedback onPress={() => alert("button pressed")}>
          <View style={{ marginRight: 25 }}>
            <Icons name="mail" color="#26cccc" size={20} />
          </View>
        </TouchableWithoutFeedback>
      ),
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      user: {
        uid: "",
        firstname: "",
        lastname: "",
      },
      messages: [],
      connectedId: null,
      users: {},
    };
  }

  componentDidMount() {
    this.getData();
    firestore()
      .collection("chat")
      .doc(this.props.navigation.state.params.id)
      .collection("messages")
      .orderBy("createdAt", "desc")
      .onSnapshot(async (querySnapshot) => {
        querySnapshot.docChanges.forEach((change) => {
          if (querySnapshot.metadata.fromCache) {
            const _messages = querySnapshot.docs.map((doc) => {
              const firebaseData = doc.data();
              const data = {
                _id: "",
                text: "",
                createdAt: new Date().getTime(),
                ...firebaseData,
              };
              if (!firebaseData.system) {
                data.user = {
                  ...firebaseData.user,
                  name: firebaseData.user.displayName,
                };
              }
              return data;
            });

            Promise.all(_messages).then(() => {
              // setMessages(_messages);
              if (this.state.messages !== _messages) {
                this.setState({
                  messages: _messages,
                });
                // dispatch({ type: "set", data: _messages });
              }
            });
          } else {
            const item = change.doc.data();
            this.setState({
              messages: [...this.state.messages, item],
            });
            // dispatch({ type: "append", item: change.doc.data() });
            if (this.state.user.uid !== change.doc.data().user._id) {
              this.setState({ connectedId: change.doc.data().user._id });
            }
          }
        });
      });
  }

  getData = async () => {
    const _user = await AsyncStorage.getItem("userToken");
    const json = JSON.parse(_user);
    this.setState({ user: json.user });
    let x = {};
    const response = await fetch(
      `http://videowithmyvet.com/webservices/practice-consultant.php?practice_id=${json.user.practice.practice_id}`
    );
    const responseJson = await response.json();
    const regIds = responseJson.users.map(({ data }) => {
      x[data.ID] = data.fcm_token;
    });

    Promise.all(regIds).then(() => {
      this.setState({ users: x });
    });
  };

  handleSend = (newMessage = []) => {
    this.handleSendMessage(newMessage[0]);
  };

  handleSendMessage = (message) => {
    firestore()
      .collection("chat")
      .doc(this.props.navigation.state.params.id)
      .collection("messages")
      .add({
        // _id: "consultant",
        _id: Date.now(),
        text: message.text,
        createdAt: new Date().getTime(),
        user: {
          _id: this.state.user.uid,
          name: this.state.user.firstname + this.state.user.lastname,
        },
      });
    this.handleSendNotifications(message);
  };

  pickImage = () => {
    const options = {
      quality: 1.0,
      maxWidth: 500,
      maxHeight: 500,
      storageOptions: {
        skipBackup: true,
      },
    };
    ImagePicker.showImagePicker(options, (response) => {
      if (response.didCancel) {
        console.log("User cancelled photo picker");
      } else if (response.error) {
        console.log("ImagePicker Error: ", response.error);
      } else if (response.customButton) {
        console.log("User tapped custom button: ", response.customButton);
      } else {
        this.addImageToServer(response.data, response.fileName, response.type);
      }
    });
  };

  addImageToServer = async (data, fileName, type) => {
    RNFetchBlob.fetch(
      "POST",
      "http://videowithmyvet.com//webservices/chat-file-upload.php",
      {
        "Content-Type": "multipart/form-data",
      },
      [
        {
          name: fileName,
          filename: fileName,
          type,
          data,
        },
      ]
    )
      .then((response) => response.json())
      .then((responseJson) => {
        this.handleSendImage(responseJson.files[0]);
      })
      .catch((err) => {
        // ...
      });
  };

  handleSendImage = (image) => {
    this.sendImage(image);
  };

  sendImage = (image) => {
    firestore()
      .collection("chat")
      .doc(this.props.navigation.state.params.id)
      .collection("messages")
      .add({
        // _id: "consultant",
        _id: Date.now(),
        createdAt: new Date().getTime(),
        user: {
          _id: this.state.user.uid,
          name: this.state.user.firstname + this.state.user.lastname,
        },
        image: `https://videowithmyvet.com${image}`,
      });
  };

  handleSendNotifications = async (message) => {
    let regIds = [];
    console.log("users", this.state.users);
    const x = Object.keys(this.state.users).map((userId) => {
      if (
        this.state.connectedId &&
        this.state.connectedId !== this.state.user.uid
      ) {
        if (this.state.connectedId === userId) {
          regIds.push(this.state.users[userId]);
        }
      } else {
        regIds.push(this.state.users[userId]);
      }
    });
    console.log("regIds", regIds);
    Promise.all(x).then(() => {
      sendNotification({
        regIds,
        title: this.state.user.firstname + this.state.user.lastname,
        body: message.text,
        data: {
          userId: this.state.user.uid,
          roomId: this.props.navigation.state.params.id,
          practiceId: this.state.user.practice.practice_id,
          bookingId: this.props.navigation.state.params.bookingId,
          type: "chat",
        },
      });
    });
  };

  renderActions = (props) => (
    <Actions
      {...props}
      containerStyle={{
        width: 44,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 4,
        marginRight: 4,
        marginBottom: 0,
      }}
      icon={() => <FontAwesome name="image" size={24} color="black" />}
      options={{
        "Choose From Library": this.pickImage,
        Cancel: () => {
          console.log("Cancel");
        },
      }}
      optionTintColor="#222B45"
    />
  );

  renderBubble = (props) => (
    <Bubble
      {...props}
      textStyle={{
        right: {
          color: "white",
        },
      }}
      wrapperStyle={{
        right: {
          backgroundColor: "#26cccc",
        },
      }}
    />
  );

  render() {
    return (
      <GiftedChat
        messages={this.state.messages}
        onSend={(newMessage) => this.handleSend(newMessage)}
        renderActions={this.renderActions}
        renderBubble={this.renderBubble}
        user={{
          _id: this.state.user.uid,
          name: this.state.user.firstname + this.state.user.lastname,
        }}
      />
    );
  }
}
