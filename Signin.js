import React, { useState, useEffect } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from './firebase.config';

// use custom style sheet
const styles = require('./Style.js');

export function SigninScreen({ route, navigation }) {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [screenMsg, setScreenMsg] = useState('');

  // store screen safe area insets
  const insets = useSafeAreaInsets();

  // clear password on screen load 
  useEffect(() => {
    setPassword("")
  }, [])

  // define function to send email to user for password reset
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

  // define function to sign in user
  const SigninUser = async () => {

    try {
      // call Firebase function to authenticate user
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      const errorMessage = error.message;
      setScreenMsg(errorMessage);
      return 1;
    }

    // console.log(new Date(Date.now()).toString().slice(0, 24), auth.currentUser.email, "signed in")

    // clear screen message on sign in
    setScreenMsg("");
    return 0;
  }

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
        <View>

          <View style={styles.mainTitleContainer}>
            <Text style={[styles.titleText, styles.txtSuccess]}>
              Do It. Smart.
            </Text>
          </View>

          <View style={styles.inputFormContainer}>

            <Text style={styles.textLabel}>Email</Text>
            <TextInput
              style={styles.input}
              onChangeText={(newText) => setEmail(newText)}
              defaultValue={email}
              autoCapitalize="none"
            />

            <Text style={styles.textLabel}>Password</Text>
            <TextInput
              style={styles.input}
              onChangeText={(newText) => setPassword(newText)}
              defaultValue={password}
              autoCapitalize="none"
              secureTextEntry={true}
            />

            <View style={{ alignItems: "center" }}>
              <TouchableOpacity style={[styles.mainButton, styles.btnSuccess,
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
                  style={[styles.textLink, styles.txtSuccess]}
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
                  style={[styles.textLink, styles.txtSuccess]}
                > Reset
                </Text>
              </View>

              <Text style={[styles.standardText, styles.txtError]}>{screenMsg}</Text>

            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View >
  );
}
