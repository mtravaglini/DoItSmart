import React from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useState } from 'react';
// import { SafeAreaView } from 'react-native-safe-area-context';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from './firebase.config';

// use custom style sheet
const styles = require('./Style.js');



export function RegisterScreen({ route, navigation }) {

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConf, setPasswordConf] = useState('');
  const [screenMsg, setScreenMsg] = useState('');

  const RegisterNewUser = async () => {

    if (password != passwordConf) {
      // console.log("Passwords don't match");
      setScreenMsg("Passwords don't match.");
      return 1;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      // const errorCode = error.code;
      const errorMessage = error.message;
      // console.log("Sign in failed");
      // console.log(errorCode);    // ..
      // console.log(errorMessage);    // ..
      setScreenMsg(errorMessage);
      return 1;
    }

    const usersRef = db.collection("users");

    const timestamp = Math.floor(Date.now()) //serverTimestamp();
    const data = {
      uid: auth.currentUser.uid,
      name: name,
      email: email,
      createdAt: timestamp
    }
    usersRef
      .add(data)
      .then(() => {
        // success message
        // alert("Added!");
      })
      .catch(error => {
        alert(error);
      })

    // console.log("Registered successfully.");
    // console.log("currentuser=", auth.currentUser);
    // console.log("uid=", auth.currentUser.uid);

    setScreenMsg("");
    return 0;
  }


  return (
    <SafeAreaView style={[styles.safeView]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View>

            <View style={styles.pageTitleContainer}>
              <Text style={styles.pageTitleText}>
                Register
              </Text>
            </View>

            <View style={styles.inputFormContainer}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                // display icon in the textinput box
                // left={<TextInput.Icon name="account" />}
                style={styles.input}
                placeholder="Name"
                onChangeText={(newText) => setName(newText)}
                // defaultValue={usernameText}
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                // display icon in the textinput box
                // left={<TextInput.Icon name="account" />}
                style={styles.input}
                placeholder="Email"
                onChangeText={(newText) => setEmail(newText)}
                // defaultValue={usernameText}
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                // display icon in the textinput box
                // left={<TextInput.Icon name="form-textbox-password" />}
                style={styles.input}
                placeholder="Password"
                onChangeText={(newText) => setPassword(newText)}
                // defaultValue={pwdText}
                autoCapitalize="none"
                secureTextEntry={true}
              />

              <Text style={styles.inputLabel}>Confirm Password</Text>
              <TextInput
                // display icon in the textinput box
                // left={<TextInput.Icon name="form-textbox-password" />}
                style={styles.input}
                placeholder="Confirm Password"
                onChangeText={(newText) => setPasswordConf(newText)}
                // defaultValue={pwdText}
                autoCapitalize="none"
                secureTextEntry={true}
              />


              <View style={{ alignItems: "center" }}>
                <TouchableOpacity style={[styles.mainButton,
                { opacity: (!name || !email || !password || !passwordConf) ? 0.5 : 1.0 }
                ]}
                  onPress={async () => {
                    await RegisterNewUser().then(
                      (result) => {
                        // console.log("return code=", result)
                        if (result == 0) {
                          navigation.navigate('Tasks', { uid: auth.currentUser.uid });
                          // navigation.navigate('Tasks');
                        }
                      }
                    )
                  }}
                  disabled={!name || !email || !password || !passwordConf}
                >
                  <Text
                    style={styles.buttonText}
                  >Register
                  </Text>
                </TouchableOpacity>

                <Text>{screenMsg}</Text>

              </View>
            </View>

          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView >
  );
}
