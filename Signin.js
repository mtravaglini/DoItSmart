import React, { useState, useEffect } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from './firebase.config';
import { SwipeGesture } from './Swipe.js';
import { CardStyleInterpolators } from '@react-navigation/stack';

// use custom style sheet
const styles = require('./Style.js');



export function SigninScreen({ route, navigation }) {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [screenMsg, setScreenMsg] = useState('');

  const insets = useSafeAreaInsets();
  // console.log("insets", insets)


  // clear password on screen load 
  useEffect(() => {
      // console.log("page load")
      setPassword("")
  }, [])

  const emailUser = async () => {

    try {
      await sendPasswordResetEmail(auth, email)
      setScreenMsg("Password reset email sent.")

    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(error)
      // ..
    }
  }


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
    console.log(new Date(Date.now()).toString().slice(0, 24), auth.currentUser.email, "signed in")
    setScreenMsg("");
    return 0;
  }

  // console.log('Height on: ', Platform.OS, StatusBar.currentHeight);

  return (
    <View style={[styles.safeView, {
      marginTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss}> */}
        <View>

          <View style={styles.mainTitleContainer}>
            <Text style={styles.titleText}>
              Do It. Smart.
            </Text>
          </View>

          <View style={styles.inputFormContainer}>

            <Text style={styles.textLabel}>Email</Text>
            <TextInput
              // display icon in the textinput box
              // left={<TextInput.Icon name="account" />}
              style={styles.input}
              onChangeText={(newText) => setEmail(newText)}
              defaultValue={email}
              autoCapitalize="none"
            />

            <Text style={styles.textLabel}>Password</Text>
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
                        setPassword("");
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
                >Sign in
                </Text>
              </TouchableOpacity>

              <View style={{ flexDirection: "row", marginTop: "5%" }}>
                <Text style={[styles.textLabel, { fontSize: 20 }]}>
                  Don't have an account?
                </Text>
                <Text onPress={() => { navigation.navigate('Signup') }}
                  style={[styles.textLink]}
                > Sign up
                </Text>
              </View>

              <View style={{ flexDirection: "row" }}>
                <Text style={[styles.textLabel, { fontSize: 20 }]}>
                  Forgot password?
                </Text>
                <Text 
                disabled={!email}
                onPress={() => { emailUser() }}
                  style={[styles.textLink]}
                > Reset
                </Text>
              </View>

              <Text style={[styles.standardText, styles.txtError]}>{screenMsg}</Text>

            </View>
          </View>
        </View>
        {/* </TouchableWithoutFeedback> */}
      </KeyboardAvoidingView>
    </View >
  );





}
