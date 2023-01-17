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
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from './firebase.config';

// use custom style sheet
const styles = require('./Style.js');

export function WelcomeScreen({ route, navigation }) {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [screenMsg, setScreenMsg] = useState('');

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
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
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

                            <View style={{ alignItems: "center" }}>
                                <TouchableOpacity style={[styles.mainButton,
                                { opacity: (!email || !password) ? 0.5 : 1.0 }
                                ]}
                                    onPress={async () => {
                                        await SigninUser().then(
                                            (result) => {
                                                // console.log("return code=", result)
                                                if (result == 0) {
                                                    navigation.navigate('Tasks', { email: email });
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
                                    onPress={() => {navigation.navigate('Register')}}
                                >
                                    <Text
                                        style={styles.secondaryButtonText}
                                    >Register
                                    </Text>
                                </TouchableOpacity>

                                <Text>{screenMsg}</Text>



                                {/* <TouchableOpacity style={styles.mainButton}
                                    onPress={() => { navigation.navigate('Groups'); }}>
                                    <Text style={styles.buttonText}>Groups</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.mainButton}
                                    onPress={() => { navigation.navigate('Resources'); }}>
                                    <Text style={styles.buttonText}>Resources</Text>
                                </TouchableOpacity> */}



                            </View>
                        </View>

                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView >
    );





}
