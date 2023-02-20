import React, { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from './firebase.config';
import { doc, getDoc, setDoc } from "firebase/firestore";

// use custom style sheet
const styles = require('./Style.js');
// use custom components
import { Title, Footer } from './Components.js'

export function SignupScreen({ route, navigation }) {

  const insets = useSafeAreaInsets();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConf, setPasswordConf] = useState('');
  const [screenMsg, setScreenMsg] = useState('');

  // function to register a new user
  const SignupNewUser = async () => {

    if (password != passwordConf) {
      setScreenMsg("Passwords don't match.");
      return 1;
    }

    // create user 
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      // const errorCode = error.code;
      const errorMessage = error.message;
      setScreenMsg(errorMessage);
      return 1;
    }

    const timestamp = Math.floor(Date.now()) //serverTimestamp();
    const data = {
      name: name,
      email: email,
      createdDate: timestamp
    }

    setDoc(doc(db, "Users", auth.currentUser.uid), data)
      .then(() => {
        Keyboard.dismiss();
        // success message
        // alert("Added!");
      })
      .catch(error => {
        alert(error);
      })





    // console.log("Signuped successfully.");
    // console.log("currentuser=", auth.currentUser);
    // console.log("uid=", auth.currentUser.uid);

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
        {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss}> */}
          <View>

            <Title
              title="Sign up"
              name="Welcome to Do It. Smart."
              navigation={navigation} />

            <View style={styles.inputFormContainer}>
              <Text style={styles.textLabel}>Name</Text>
              <TextInput
                // display icon in the textinput box
                // left={<TextInput.Icon name="account" />}
                style={styles.input}
                onChangeText={(newText) => setName(newText)}
                // defaultValue={usernameText}
                autoCapitalize="none"
              />

              <Text style={styles.textLabel}>Email</Text>
              <TextInput
                // display icon in the textinput box
                // left={<TextInput.Icon name="account" />}
                style={styles.input}
                onChangeText={(newText) => setEmail(newText)}
                // defaultValue={usernameText}
                autoCapitalize="none"
              />

              <Text style={styles.textLabel}>Password</Text>
              <TextInput
                // display icon in the textinput box
                // left={<TextInput.Icon name="form-textbox-password" />}
                style={styles.input}
                onChangeText={(newText) => setPassword(newText)}
                // defaultValue={pwdText}
                autoCapitalize="none"
                secureTextEntry={true}
              />

              <Text style={styles.textLabel}>Confirm Password</Text>
              <TextInput
                // display icon in the textinput box
                // left={<TextInput.Icon name="form-textbox-password" />}
                style={styles.input}
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
                    await SignupNewUser().then(
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
                  >Sign up
                  </Text>
                </TouchableOpacity>

                <Text>{screenMsg}</Text>

              </View>
            </View>

          </View>
        {/* </TouchableWithoutFeedback> */}
      </KeyboardAvoidingView>
    </View >
  );
}
