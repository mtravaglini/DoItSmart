import React, { useState, useEffect } from 'react';
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
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from './firebase.config';

// use custom style sheet
const styles = require('./Style.js');
import { SwipeGesture } from './Swipe.js';

export function SigninScreen({ route, navigation }) {

  // TODO CLEANUP: remove next 2 lines
  const [email, setEmail] = useState('marctravaglini@gmail.com');
  const [password, setPassword] = useState('mmmmmm');
  // TODO CLEANUP: uncomment next 2 lines
  // const [email, setEmail] = useState('');
  // const [password, setPassword] = useState('');
  const [screenMsg, setScreenMsg] = useState('');

  // TODO CLEANUP: uncomment next section
  // clear password on screen load 
  // useEffect(() => {
  //     // console.log("page load")
  //     setPassword("")
  // }, [])

  const SigninUser = async () => {

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      // const errorCode = error.code;
      const errorMessage = error.message;
      // console.log("Sign in failed");
      // console.log(errorCode);    // ..
      // console.log(errorMessage);    // ..
      setScreenMsg(errorMessage);
      return 1;
    }

    // console.log("Signed in successfully.");
    // console.log("currentuser=", auth.currentUser);
    // console.log("uid=", auth.currentUser.uid);

    setScreenMsg("");
    return 0;
  }

  return (
    <SafeAreaView style={[styles.safeView]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View>

            <View style={styles.mainTitleContainer}>
              <Text style={styles.titleText}>
                Do It. Smart.
              </Text>
            </View>

            <View style={styles.inputFormContainer}>

              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                // display icon in the textinput box
                // left={<TextInput.Icon name="account" />}
                style={styles.input}
                onChangeText={(newText) => setEmail(newText)}
                defaultValue={email}
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                // display icon in the textinput box
                // left={<TextInput.Icon name="form-textbox-password" />}
                style={styles.input}
                onChangeText={(newText) => setPassword(newText)}
                defaultValue={password}
                autoCapitalize="none"
                secureTextEntry={true}
              />

              <View style={{ alignItems: "center" }}>
                <TouchableOpacity style={[styles.mainButton,
                { opacity: (!email || !password) ? 0.5 : 1.0 }
                ]}
                  onPress={async () => {
                    Keyboard.dismiss();
                    await SigninUser().then(
                      (result) => {
                        // console.log("return code=", result)
                        if (result == 0) {
                          // TODO CLEANUP: uncomment next 1 lines
                          // setPassword("");
                          navigation.navigate('Tasks', { uid: auth.currentUser.uid });
                          // navigation.navigate('Tasks');
                        }
                      }
                    )
                  }}
                  disabled={!email || !password}
                >
                  <Text
                    style={styles.buttonText}
                  >Signin
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton}
                  onPress={() => { navigation.navigate('Register') }}
                >
                  <Text
                    style={styles.secondaryButtonText}
                  >Register
                  </Text>
                </TouchableOpacity>

                <Text style={[styles.standardText, styles.txtError]}>{screenMsg}</Text>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView >
  );





}
