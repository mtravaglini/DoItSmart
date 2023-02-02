import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Pressable,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { db, auth } from './firebase.config';
import { signOut, updateEmail } from "firebase/auth";
import { doc, collection, collectionGroup, query, getDoc, getDocs, getParent, getRef, setDoc, addDoc, deleteDoc, onSnapshot, where, orderBy } from "firebase/firestore";


// use custom style sheet
const styles = require('./Style.js');
// use custom components
import { Title, Footer } from './Components.js'

export function ProfileScreen({ route, navigation }) {

    const uid = route.params.uid;

    const [user, setUser] = useState({});
    const [origUser, setOrigUser] = useState({});
    const [groupNames, setGroupNames] = useState([]);
    const [invites, setInvites] = useState([]);

    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        var unsubscribe;

        //promise chaining
        async function getProfile() {
            var userSnap = await getUser();
            var groupSnaps = await getGroupUsers(userSnap);
            var retrievedGroupNames = await processGroupUsers(groupSnaps)
            var savedGroupNames = await saveGroupNames(retrievedGroupNames)
        }

        // get user 
        async function getUser() {
            try {
                const docSnap = await getDoc(doc(db, "Users", uid));
                setOrigUser(docSnap.data());
                setUser(docSnap.data());
                setLoading(false);
                console.log("userSnap", docSnap)
                return docSnap;
            } catch (error) {
                console.error(error);
            }
        }

        // get all the groupuser subcollection of the groups collection for the user
        async function getGroupUsers() {
            try {
                unsubscribe = onSnapshot(querySnapshot =
                    query(collectionGroup(db, 'GroupUsers'), where('userId', '==', uid)), () => {
                    });
                console.log("groupSnaps", querySnapshot)
                return querySnapshot
            } catch (error) {
                console.error(error);
            }
        }

        async function processGroupUsers(querySnapshot) {
            var retrievedGroupNames = await getGroupUsersParents(querySnapshot.docs)
            console.log("groupSnaps", retrievedGroupNames)
            return retrievedGroupNames
        }

        // from the groupuser doc, get user's group informtion from the parent group collection
        function getGroupUsersParents(groupUsersSnaps) {
            return Promise.all(groupUsersSnaps.map(async (groupUser) => {

                const docRef = groupUser.ref;
                const parentCollectionRef = docRef.parent; // CollectionReference
                const immediateParentDocumentRef = parentCollectionRef.parent; // DocumentReference
                const parentDoc = await getDoc(immediateParentDocumentRef)

                return {
                    "id": parentDoc?.id,
                    "name": parentDoc?.data().name,
                }
            }))
        }

        async function saveGroupNames(retrievedGroupNames) {
            setGroupNames(retrievedGroupNames)
            return retrievedGroupNames
        }


        // // get all the groupinvites for the user
        // async function getInvites() {
        //     try {
        //         var querySnapshot;
        //         unsubscribe = onSnapshot(querySnapshot =
        //             query(collectionGroup(db, 'GroupInvites'), where('invitee', '==', 'swisssarah@outlook.com')), () => {
        //                 // const retrievedInvites = [];
        //                 // querySnapshot.forEach((doc) => {
        //                 //     groupObj = doc.data();
        //                 //     groupObj.id = doc.id;
        //                 //     retrievedInvites.push(groupObj)
        //                 // })
        //                 // setInvites(retrievedInvites)
        //                 // console.log(invites);
        //             })
        //         console.log("querySnapshot", querySnapshot)
        //         return querySnapshot
        //     } catch (error) {
        //         console.error(error);
        //     }
        // }

        getProfile();

        return function cleanup() {
            unsubscribe();
        };
    }, [])

    const confirmDelete = (groupId, groupName) => {
        Alert.alert("Leave group " + groupName,
            "Are you sure?",
            [{
                text: "Leave",
                onPress: () => deleteGroupMembership(groupId),

            },
            {
                text: "Cancel"
            }]
        )
        return
    }

    // delete a group membership
    const deleteGroupMembership = async (groupId) => {
        // console.log("deleting the group membership", groupId, uid)
        try {
            const querySnapshot = await getDocs(query(collection(db, "Groups", groupId, "GroupUsers"), where('userId', '==', uid)));
            // console.log(typeof querySnapshot)
            querySnapshot.forEach((doc) => {
                // console.log("deleting docref", doc.ref)
                deleteDoc(doc.ref)
            })
        } catch (error) {
            console.error(error);
        }
    }

    const userChanged = () => {
        const keys1 = Object.keys(user);
        const keys2 = Object.keys(origUser);
        if (keys1.length !== keys2.length) {
            return true;
        }
        for (let key of keys1) {
            if (user[key] !== origUser[key]) {
                return true;
            }
        }
        return false;
    }

    const SaveUser = async () => {

        // if (!userChanged()) {
        //     return 0
        // }
        try {
            await setDoc(doc(db, "Users", uid), user)
            console.log(auth.currentUser, user.email)
            updateEmail(auth.currentUser, user.email)
        } catch (error) {
            // const errorCode = error.code;
            const errorMessage = error.message;
            alert(errorMessage);
            // return 1;
            return;
        }
        // return 0;
        return;
    }




    return (
        <SafeAreaView style={styles.safeView}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View>

                        <Title
                            title="Profile"
                            name={user.name}
                            navigation={navigation} />

                        <ScrollView style={{ height: "84%", marginBottom: 15 }}>
                            <View style={styles.inputFormContainer}>

                                {/* show acivity indicator when waiting to return to groups screen */}
                                {isLoading ? (
                                    <ActivityIndicator size="large" color="cornflowerblue" />
                                ) : (

                                    <View>


                                        <Text style={styles.inputLabel}>Email</Text>
                                        <TextInput
                                            style={styles.input}
                                            onChangeText={(newValue) => { setUser((prevState) => ({ ...prevState, email: newValue })) }}
                                            value={user.email}
                                            underlineColorAndroid='transparent'
                                            autoCapitalize='none'
                                        />

                                        <Text style={styles.inputLabel}>Your groups</Text>
                                        <View style={{ marginBottom: 15, alignItems: "flex-start", flexWrap: "wrap", flexDirection: "row" }}>
                                            {
                                                groupNames.map((item) =>
                                                    <Pressable key={item.id}
                                                        onPress={() => navigation.navigate('GroupDetail', { uid: uid, groupId: item.id })}
                                                        onLongPress={() => confirmDelete(item.id, item.name)}
                                                    >
                                                        <Text style={styles.groupText}>
                                                            {item.name}
                                                        </Text>
                                                    </Pressable>
                                                )
                                            }
                                        </View>
                                    </View>
                                )}

                                <View style={{ alignItems: "center" }}>
                                    <TouchableOpacity style={[styles.mainButton, styles.btnSuccess, { opacity: (!userChanged()) ? 0.5 : 1.0 }]}
                                        disabled={!userChanged()}
                                        onPress={async () => {
                                            await SaveUser().then(
                                                (result) => {
                                                    if (result == 0) {
                                                        navigation.goBack();
                                                    }
                                                }
                                            )
                                        }}
                                    >
                                        <Text
                                            style={styles.buttonText}
                                        >Save
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>

                        <Footer auth={auth}
                            navigation={navigation}
                            uid={uid} />

                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
