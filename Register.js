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
import { auth } from './firebase.config';

// use custom style sheet
const styles = require('./Style.js');



export function RegisterScreen({ route, navigation }) {

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConf, setPasswordConf] = useState('');
  const [screenMsg, setScreenMsg] = useState('');

  const RegisterNewUser = async (name, email, password, passwordConf) => {

    if (password != passwordConf) {
      console.log("Passwords don't match");
      return ({
        "code": 1,
        "message": "Passwords don't match."
      })
    }
  
    try {
    await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log("Sign in failed");
      console.log(errorCode);    // ..
      console.log(errorMessage);    // ..
    }
  
    // updateProfile(auth.currentUser, {
    //   displayName: name
    // }).then(() => {
    //   // Profile updated!
    //   // ...
    //   console.log("Profile updated!");
    // }).catch((error) => {
    //   const errorCode = error.code;
    //   const errorMessage = error.message;
    //   console.log("Profile update failed");
    //   console.log(errorCode);    // ..
    //   console.log(errorMessage);    // ..
    //   return ({
    //     "code": 1,
    //     "message": errorMessage
    //   })
    // });
  
    console.log("Registered successfully");
    return ({
      "code": 0,
      "message": "Registered successfully"
    })
  
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
                <TouchableOpacity style={styles.mainButton}
                  onPress={RegisterNewUser}
                  // onPress={() => {
                  //   var result = RegisterNewUser(name, email, password, passwordConf)
                  //   if (result.code == 0) {
                  //     navigation.navigate('Tasks');
                  //   }
                  //   setScreenMsg(result.message)
                  // }
                  // }
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
    </SafeAreaView>
  );
}
