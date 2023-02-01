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
import { Title , Footer} from './Components.js'

export function ProfileScreen({ route, navigation }) {

    const uid = route.params.uid;

    const [groupNames, setGroupNames] = useState([]);
    const [user, setUser] = useState('');
    const [origUser, setOrigUser] = useState({});
    const [isLoading, setLoading] = useState(true);


    // get user 
    useEffect(() => {
        async function getUser() {
            try {
                const docSnap = await getDoc(doc(db, "Users", uid));
                setOrigUser(docSnap.data());
                setUser(docSnap.data());
                setLoading(false);
            } catch (error) {
                console.error(error);
            }
        }
        getUser();
    }, [])

    // get user's groups

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
        // setGroupNames(retrievedGroupNames)
    }

    useEffect(() => {
        var unsubscribe;
        const parentsPromises = [];
        const retrievedGroupNames = [];
        async function getGroupUsers() {
            try {
                // const querySnapshot = await getDocs(query(collectionGroup(db, 'GroupUsers'), where('userId', '==', uid)));
                unsubscribe = onSnapshot(
                    query(
                        collectionGroup(db, 'GroupUsers'), where('userId', '==', uid)), (querySnapshot) => {
                            // const parentsPromises = [];
                            // querySnapshot.forEach((doc) => {
                            //     // console.log(doc.id, '-> ', doc.data())
                            //     console.log("doc.id", doc.id)
                            //     const docRef = doc.ref;
                            //     const parentCollectionRef = docRef.parent; // CollectionReference
                            //     const immediateParentDocumentRef = parentCollectionRef.parent; // DocumentReference
                            // parentsPromises.push(getDoc(immediateParentDocumentRef));
                            getGroupUsersParents(querySnapshot.docs)
                                .then((retrievedGroupNames) => {
                                    setGroupNames(retrievedGroupNames)
                                })
                                .catch((error) => {
                                    console.log(error)
                                })

                        });
                // setGroupNames(retrievedGroupNames)

                // console.log("parentsPromises 1", parentsPromises)


            } catch (error) {
                console.error(error);
            }
        }

        getGroupUsers();



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

        if (!userChanged()) {
            return 0
        }

        try {
            await setDoc(doc(db, "Users", uid), user)
            console.log(auth.currentUser, user.email)
            updateEmail(auth.currentUser, user.email)
        } catch (error) {
            // const errorCode = error.code;
            const errorMessage = error.message;
            alert(errorMessage);
            return 1;
        }

        return 0;
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
                        navigation={navigation}/>

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


                                        {/* <View style={{ alignItems: "center" }}>
                                    <TouchableOpacity style={[styles.mainButton, { opacity: (!userChanged()) ? 0.5 : 1.0 }]}
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
                                </View> */}


                                        <Text style={styles.inputLabel}>Your groups</Text>
                                        {/* <FlatList style={{ height: "63%", marginBottom: 15, marginLeft: "1%" }}
                                    data={groupNames}
                                    ListEmptyComponent={<Text style={[styles.listText, { alignSelf: "center" }]}>
                                        You're not a member of any groups.
                                    </Text>}
                                    numColumns={5}
                                    renderItem={({ item }) => (
                                        <Pressable style={styles.groupButton}
                                            onPress={() => navigation.navigate('GroupDetail', { uid: uid, groupId: item.id })}
                                            onLongPress={() => confirmDelete(item.id, item.name)}
                                        >
                                            <Text style={styles.groupText}>
                                                {item.name}
                                            </Text>
                                        </Pressable>
                                    )}
                                /> */}

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
                                    <TouchableOpacity style={[styles.mainButton, styles.btnSuccess,{ opacity: (!userChanged()) ? 0.5 : 1.0 }]}
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
