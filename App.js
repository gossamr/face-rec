import React, { Component } from 'react';
import { Platform, StyleSheet, Text, TextInput, View, Image } from 'react-native';
import { ThemeProvider, Card, Button, Icon, Overlay } from 'react-native-elements';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';

const createFormData = (photo, body) => {
  const data = new FormData();

  data.append("photo", {
    name: 'test.jpg',
    type: photo.type,
    uri:
      Platform.OS === "android" ? photo.uri : photo.uri.replace("file://", "")
  });

  console.log(data)

  Object.keys(body).forEach(key => {
    data.append(key, body[key]);
  });

  return data;
};

const removeUnknowns = (matches) => {
  return matches.filter((match) => {
    return match != 'Unknown';
  });
}

export default class App extends Component {
  state = {
    host: "http://localhost:5000",
    photo: null,
    label: "",
    modalVisible: false,
    identified: null,
    noFaceFound: false,
    nothingFound: false,
    tempLabel: ""
  };

  setModalVisible = (visible) => {
    this.setState({ modalVisible: visible });
  };

  _handleUpload = async () => {
    console.log('uploading photo')
    uri = this.state.label == "" ? "/recog" : "/train"
    fetch(this.state.host + uri, {
      method: "POST",
      body: createFormData(this.state.photo, { 'label': this.state.label })
    })
      .then(response => response.json())
      .then(response => {
        console.log("Upload success", response);

        if (response.names !== undefined) {
          // We were recognizing
          if (response.names.length == 0) {
            // Found no faces
            this.setState({ noFaceFound: true })
          } else if (response.names.length == 1 && response.names[0] == 'Unknown') {
            // Didn't recognize only face found
            this.setState({ nothingFound: true })
          } else {
            // Recognized
            this.setState({ identified: removeUnknowns(response.names) })
          }
          // TODO handle case where multiple faces are detected and none are recognized
        } else if (response.result == 'success'){
          // We successfully trained
          this.setState({ nothingFound: false, identified: [ this.state.label ], label: '' })
        } else {
          console.log('We failed training. Error should be caught below.')
        }
      })
      .catch(error => {
        console.log("Upload error", error);
        alert("Upload failed!");
      });
  };

  render() {
    let { photo, label, modalVisible, identified, nothingFound, noFaceFound } = this.state;

    return (
      <ThemeProvider theme={theme}>
        <View style={styles.container}>
          {!photo && (
            <Card
              title="Face Recognition Demo"
            >
              <Text style={{marginBottom: 10}}>
                Select a photo of somebody from your library
              </Text>
              <Button
                icon={<Icon name='image' color='#ffffff' />}
                buttonStyle={{borderRadius: 0, marginLeft: 0, marginRight: 0, marginBottom: 0}}
                title='Select'
                onPress={this._pickImage}
              />
            </Card>
          )}
          {photo && !noFaceFound && !identified && !nothingFound && (
            <Card
              title="Face Recognition Demo"
              image={photo}
              imageStyle={{ width: 200, height: 300 }}
              containerStyle={{width: "90%", height: "auto" }}
            >
              <Text style={{marginBottom: 10}}>
                Tap Identify to see if we can recognize them
              </Text>
              <Button
                icon={<Icon name='person' color='#ffffff' />}
                buttonStyle={{borderRadius: 0, marginLeft: 0, marginRight: 0, marginBottom: 0}}
                title='Identify'
                onPress={this._handleUpload}
              />
            </Card>
          )}
          {photo && identified && (
            <Card
              title="Face Recognition Demo"
              image={photo}
              imageStyle={{ width: 200, height: 300 }}
              containerStyle={{width: "90%", height: "auto" }}
            >
              <Text style={{marginBottom: 10}}>
                We found a match. It looks like {this.state.identified.join(', ')}. How about that!
              </Text>
              <Button
                icon={<Icon name='image' color='#ffffff' />}
                buttonStyle={{borderRadius: 0, marginLeft: 0, marginRight: 0, marginBottom: 0}}
                title='Select New'
                onPress={this._pickImage}
              />
            </Card>
          )}
          {photo && nothingFound && label == "" && (
            <Card
              title="Face Recognition Demo"
              image={photo}
              imageStyle={{ width: 200, height: 300 }}
              containerStyle={{width: "90%", height: "auto" }}
            >
              <Text style={{marginBottom: 10}}>
                We couldn't find a match. Help us learn to recognize this person.
              </Text>
              <Button
                icon={<Icon name='label' color='#ffffff' />}
                buttonStyle={{borderRadius: 0, marginLeft: 0, marginRight: 0, marginBottom: 0}}
                title="Set Label"
                onPress={() => { this.setModalVisible(true); }}
              />
            </Card>
          )}
          {photo && nothingFound && label != "" && (
            <Card
              title="Face Recognition Demo"
              image={photo}
              imageStyle={{ width: 200, height: 300 }}
              containerStyle={{width: "90%", height: "auto" }}
            >
              <Text style={{marginBottom: 10}}>
                Teach us how to recognize {label}
              </Text>
              <Button
                icon={<Icon name='add-to-queue' color='#ffffff' />}
                buttonStyle={{borderRadius: 0, marginLeft: 0, marginRight: 0, marginBottom: 0}}
                title="Train"
                onPress={this._handleUpload}
              />
            </Card>
          )}
          {photo && noFaceFound && (
            <Card
              title="Face Recognition Demo"
              image={photo}
              imageStyle={{ width: 200, height: 300 }}
              containerStyle={{width: "90%", height: "auto" }}
            >
              <Text style={{marginBottom: 10}}>
                We couldn't find any faces in this photo. Try another one.
              </Text>
              <Button
                icon={<Icon name='image' color='#ffffff' />}
                buttonStyle={{borderRadius: 0, marginLeft: 0, marginRight: 0, marginBottom: 0}}
                title="Select New"
                onPress={this._pickImage}
              />
            </Card>
          )}

          {photo && (
            <Overlay
              isVisible={modalVisible}
              onBackdropPress={() => { this.setModalVisible(!modalVisible); }}
              height="auto"
              width="80%"
            >
              <View style={{ marginTop: 0, marginLeft: 20, marginRight: 20 }}>
                <TextInput
                    style={{
                      paddingHorizontal: 10,
                      height: 40,
                      borderColor: 'gray',
                      borderWidth: 1 }}
                    onChangeText={tempLabel => this.setState({ tempLabel })}
                    value={this.state.tempLabel}
                />

                <Button title="Describe"
                  onPress={() => {
                    this.setModalVisible(!modalVisible);
                    this.setState({label: this.state.tempLabel, tempLabel: "" });
                  }}
                />
              </View>
            </Overlay>
          )}
        </View>
      </ThemeProvider>
    )
  }

  componentDidMount() {
    this.getCameraRollPermissionAsync();
  }

  getCameraRollPermissionAsync = async () => {
    if (Constants.platform.ios) {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
      }
    }
  }

  _pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
      base64: false,
      exif: false
    });

    console.log(result);

    if (!result.cancelled) {
      this.setState({ photo: result, identified: null, nothingFound: false, noFaceFound: false });
    }
  };
}

const theme = {}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
