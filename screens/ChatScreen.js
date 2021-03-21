import React from "react";
import { AsyncStorage } from "react-native";
import { firestore } from "react-native-firebase";
import { Actions, Bubble, GiftedChat } from "react-native-gifted-chat";
import ImagePicker from "react-native-image-picker";
import Icons from "react-native-vector-icons/Feather";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import RNFetchBlob from "rn-fetch-blob";
import { sendNotification } from "../utils/notifications";

const reducer = (state, action) => {
  switch (action.type) {
    case "set":
      return action.data;
    case "append":
      // const newState = state;
      // newState.push(action.item);
      return [...state, action.item];
    default:
      return state;
  }
};

export default function ChatScreen({ navigation }) {
  const [user, setUser] = React.useState({
    uid: "",
    firstname: "",
    lastname: "",
  });
  const [messages, dispatch] = React.useReducer(reducer, []);
  // const [messages, setMessages] = React.useState([]);
  const [connectedId, setConnectedId] = React.useState(null);
  const [first, setFirst] = React.useState(true);
  const [users, setUsers] = React.useState({});

  React.useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    const _user = await AsyncStorage.getItem("userToken");
    const json = JSON.parse(_user);
    setUser(json.user);
    let x = {};
    const response = await fetch(
      `http://videowithmyvet.com/webservices/practice-consultant.php?practice_id=${json.user.practice.practice_id}`
    );
    const responseJson = await response.json();
    const regIds = responseJson.users.map(({ data }) => {
      x[data.ID] = data.fcm_token;
    });

    Promise.all(regIds).then(() => {
      console.log("x", x);
      setUsers(x);
    });
  };

  React.useEffect(() => {
    const unsubscribeListener = firestore()
      .collection("chat")
      .doc(navigation.state.params.id)
      .collection("messages")
      .orderBy("createdAt", "desc")
      .onSnapshot(async (querySnapshot) => {
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
          if (messages !== _messages) {
            dispatch({ type: "set", data: _messages });
          }
          console.log("first", first);
          if (first) {
            setFirst(false);
          } else {
            console.log("userId", _messages.slice(-1)[0].user._id);
            setConnectedId(_messages.slice(-1)[0].user._id);
          }
        });
      });
    return () => unsubscribeListener();
  }, []);

  const handleSend = (newMessage = []) => {
    handleSendMessage(newMessage[0]);
  };

  const handleSendMessage = (message) => {
    // dispatch({
    //   type: "append",
    //   item: {
    //     // _id: "consultant",
    //     text: message.text,
    //     createdAt: new Date().getTime(),
    //     user: {
    //       _id: user.uid,
    //       name: user.firstname + user.lastname,
    //     },
    //   },
    // });
    firestore()
      .collection("chat")
      .doc(navigation.state.params.id)
      .collection("messages")
      .add({
        // _id: "consultant",
        _id: Date.now(),
        text: message.text,
        createdAt: new Date().getTime(),
        user: {
          _id: user.uid,
          name: user.firstname + user.lastname,
        },
      });
    handleSendNotifications(message);
  };

  const pickImage = () => {
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
        addImageToServer(response.data, response.fileName, response.type);
      }
    });
  };

  const addImageToServer = async (data, fileName, type) => {
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
        handleSendImage(responseJson.files[0]);
      })
      .catch((err) => {
        // ...
      });
  };

  const handleSendImage = (image) => {
    sendImage(image);
  };

  const sendImage = (image) => {
    firestore()
      .collection("chat")
      .doc(navigation.state.params.id)
      .collection("messages")
      .add({
        // _id: "consultant",
        _id: Date.now(),
        createdAt: new Date().getTime(),
        user: {
          _id: user.uid,
          name: user.firstname + user.lastname,
        },
        image: `https://videowithmyvet.com${image}`,
      });
  };

  const handleSendNotifications = async (message) => {
    let regIds = [];
    console.log("users", users);
    const x = Object.keys(users).map((userId) => {
      console.log("connectedId", connectedId);
      if (connectedId) {
        if (connectedId === userId) {
          regIds.push(users[userId]);
        }
      } else {
        regIds.push(users[userId]);
      }
    });
    console.log("regIds", regIds);
    Promise.all(x).then(() => {
      sendNotification({
        regIds,
        title: user.firstname + user.lastname,
        body: message.text,
        data: {
          userId: user.uid,
          roomId: navigation.state.params.id,
          practiceId: user.practice.practice_id,
          bookingId: navigation.state.params.bookingId,
          type: "chat",
        },
      });
    });
  };

  const renderActions = (props) => (
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
        "Choose From Library": pickImage,
        Cancel: () => {
          console.log("Cancel");
        },
      }}
      optionTintColor="#222B45"
    />
  );

  const renderBubble = (props) => (
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

  return (
    <GiftedChat
      messages={messages}
      onSend={(newMessage) => handleSend(newMessage)}
      renderActions={renderActions}
      renderBubble={renderBubble}
      user={{
        _id: user.uid,
        name: user.firstname + user.lastname,
      }}
    />
  );
}

ChatScreen.navigationOptions = () => {
  return {
    headerTitle: "Chat",
    headerTintColor: "#26cccc",
    headerStyle: {
      backgroundColor: "#fff",
      color: "#fff",
      height: 80,
    },
    headerRight: (
      <Icons
        name="mail"
        color="#26cccc"
        size={20}
        style={{ marginRight: 25 }}
      />
    ),
  };
};
