import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { db, auth } from './firebase.config';
import { signOut, updateEmail } from "firebase/auth";
import { doc, collection, collectionGroup, query, getDoc, getDocs, getParent, getRef, setDoc, addDoc, deleteDoc, onSnapshot, where, orderBy } from "firebase/firestore";


// use custom style sheet
const styles = require('./Style.js');
// use custom components
import { Title, Footer } from './Components.js'
import { scheduleTasks, getAllGroupsForUser } from './Functions.js'

export function ProfileScreen({ route, navigation }) {

  const insets = useSafeAreaInsets();
  const uid = route.params.uid;

  const [user, setUser] = useState({});
  const [origUser, setOrigUser] = useState({});
  const [groupNames, setGroupNames] = useState([]);
  const [invites, setInvites] = useState([]);

  const [isLoading, setLoading] = useState(true);
  const [profileGroupUpdated, setProfileGroupUpdated] = useState(0);

  useEffect(() => {
    // var unsubscribe;

    //promise chaining
    async function getProfile() {
      var userSnap = await getUser()

      // var groupSnaps = await getGroupUsersByUser()
      // var retrievedUserGroupNames = await processGroupUsers(groupSnaps)
      var retrievedUserGroupNames = await getAllGroupsForUser(uid)
      
      // await saveGroupNames(retrievedUserGroupNames)
      setGroupNames(retrievedUserGroupNames)



      var inviteInfo = await getInvites(userSnap)
      // console.log("inviteinfo", inviteInfo)
      var retrievedInvites = await processInvites(inviteInfo)

      setInvites(retrievedInvites)
      // console.log(retrievedInvites)
      // await saveInvites(retrievedInvites)
    }

    // get user 
    async function getUser() {
      try {
        const docSnap = await getDoc(doc(db, "Users", uid));
        setOrigUser(docSnap.data());
        setUser(docSnap.data());
        setLoading(false);
        // console.log("userSnap", docSnap.data())
        return docSnap;
      } catch (error) {
        console.error(error);
      }
    }

    // // get all the groupuser subcollection of the groups collection for the user
    // async function getGroupUsersByUser() {
    //   try {
    //     // var querySnapshot;
    //     // unsubscribe = onSnapshot(
    //     querySnapshot = await
    //       getDocs(query(collectionGroup(db, 'GroupUsers'), where('userId', '==', uid)))
    //     //     , () => {
    //     //     });
    //     console.log("groupSnaps", typeof querySnapshot)
    //     return querySnapshot
    //   } catch (error) {
    //     console.error(error);
    //   }
    // }

    // // process all the groupuser docs
    // async function processGroupUsers(querySnapshot) {
    //   try {
    //     var retrievedUserGroupNames = await getGroupUsersParents(querySnapshot.docs)
    //     console.log("retreivedGroupNames", retrievedUserGroupNames)
    //     return retrievedUserGroupNames
    //   } catch (error) {
    //     console.error(error);
    //   }
    // }

    // // from the groupuser doc, get user's group informtion from the parent group collection
    // function getGroupUsersParents(groupUsersSnaps) {
    //   return Promise.all(groupUsersSnaps.map(async (groupUser) => {

    //     console.log("groupUsersSnaps IN", groupUsersSnaps.length)
    //     const docRef = groupUser.ref;
    //     const parentCollectionRef = docRef.parent; // CollectionReference
    //     const immediateParentDocumentRef = parentCollectionRef.parent; // DocumentReference
    //     const parentDoc = await getDoc(immediateParentDocumentRef)

    //     return {
    //       "id": parentDoc?.id,
    //       "name": parentDoc?.data().name,
    //     }
    //   }))
    // }

    async function saveGroupNames(retrievedUserGroupNames) {
      setGroupNames(retrievedUserGroupNames)
      return retrievedUserGroupNames
    }

    // get all the groupinvites for the user
    async function getInvites(userSnap) {
      try {
        //     unsubscribe = onSnapshot(
        var querySnapshot = await
          getDocs(query(collectionGroup(db, 'GroupInvites'), where('invitee', '==', userSnap.data().email)))
        // , () => {

        // const retrievedInvites = [];
        // querySnapshot.forEach((doc) => {
        //     groupObj = doc.data();
        //     groupObj.id = doc.id;
        //     retrievedInvites.push(groupObj)
        // })
        // setInvites(retrievedInvites)
        // console.log(invites);
        // })
        // console.log("inviteSnaps", typeof querySnapshot)
        return querySnapshot
      } catch (error) {
        console.error(error);
      }
    }

    // process all the invites for the user
    async function processInvites(querySnapshot) {
      try {
        var retrievedInvite = await getInviteParents(querySnapshot.docs)
        // console.log("retreivedInviteInfo", retrievedInvite)
        return retrievedInvite
      } catch (error) {
        console.error(error);
      }
    }

    // from the grouppinvite doc, get group informtion using group id and inviter user information using the invter id
    function getInviteParents(inviteSnaps) {
      return Promise.all(inviteSnaps.map(async (invite) => {

        // console.log("inviteSnaps IN", inviteSnaps.length)
        const docRef = invite;
        // console.log("invite docref", invite.data())
        const inviterParentDoc = await getDoc(doc(db, "Users", docRef.data().inviter))
        const groupParentDoc = await getDoc(doc(db, "Groups", docRef.data().groupId))

        return {
          "inviteId": docRef.id,
          "inviterName": inviterParentDoc?.data().name,
          "inviterUid": docRef.data().inviter,
          "groupName": groupParentDoc?.data().name,
          "groupId": docRef.data().groupId
        }
      }))
    }


    async function saveInvites(retrievedInvites) {
      setInvites(retrievedInvites)
      return retrievedInvites
    }


















    getProfile();

    return function cleanup() {
      // unsubscribe();
    };
  }, [profileGroupUpdated])

  const confirmDeleteGroupMembership = (groupId, groupName) => {
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
        setProfileGroupUpdated(profileGroupUpdated + 1);

      })
    } catch (error) {
      console.error(error);
    }
  }

  const confirmDeleteGroupInvite = (inviteId, groupName) => {
    Alert.alert("Decline invitation to " + groupName,
      "Are you sure?",
      [{
        text: "Decline",
        onPress: () => deleteGroupInvite(inviteId),

      },
      {
        text: "Cancel"
      }]
    )
    return
  }

  const deleteGroupInvite = async (inviteId) => {
    try {
      await deleteDoc(doc(db, "GroupInvites", inviteId))
      setProfileGroupUpdated(profileGroupUpdated + 1);

    } catch (error) {
      const errorMessage = error.message;
      alert(errorMessage);
    }
    return;
  }

  const acceptInvite = async (groupId, inviteId) => {
    try {
      const timestamp = Math.floor(Date.now()) //serverTimestamp();
      const data = {
        userId: uid,
        createdDate: timestamp
      }
      await addDoc(collection(db, "Groups", groupId, "GroupUsers"), data)
      await deleteDoc(doc(db, "GroupInvites", inviteId))
      setProfileGroupUpdated(profileGroupUpdated + 1);
      scheduleTasks(uid)

    } catch (error) {
      const errorMessage = error.message;
      alert(errorMessage);
    }
    return;
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
      // console.log(auth.currentUser, user.email)
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
        <View style={{ flex: 1 }}>


            <Title
              title="Profile"
              name={user.name}
              navigation={navigation} />

            {/* <ScrollView style={{ height: "81%", marginBottom: 15 }}> */}
            <ScrollView>
              <View style={styles.inputFormContainer}>

                {/* show acivity indicator when waiting to return to groups screen */}
                {isLoading ? (
                  <ActivityIndicator style={styles.standardText} size="large" />
                ) : (

                  <View>


                    <Text style={styles.textLabel}>Email</Text>
                    <TextInput
                      style={styles.input}
                      onChangeText={(newValue) => { setUser((prevState) => ({ ...prevState, email: newValue })) }}
                      value={user.email}
                      underlineColorAndroid='transparent'
                      autoCapitalize='none'
                    />

                    {(groupNames.length > 0) ? <Text style={styles.textLabel}>Your groups</Text> : ''}
                    <View style={(groupNames.length > 0) ? styles.tagContainer : ''}>
                      {
                        groupNames.map((item) =>
                          <Pressable key={item.id} style={styles.tagButton}
                            onPress={() => navigation.navigate('GroupDetail', { uid: uid, groupId: item.id })}
                            onLongPress={() => confirmDeleteGroupMembership(item.id, item.name)}
                          >
                            <Text style={styles.tagText}>
                              {item.name}
                            </Text>
                          </Pressable>
                        )
                      }
                    </View>

                    {(invites.length > 0) ? <Text style={styles.textLabel}>Your group invitations</Text> : ''}
                    {/* <View style={styles.tagContainer}> */}
                    <View style={(invites.length > 0) ? styles.tagContainer : ''}>

                      {
                        invites.map((item) =>
                          <Pressable key={item.groupId}
                            onPress={() => acceptInvite(item.groupId, item.inviteId)}
                            onLongPress={() => confirmDeleteGroupInvite(item.inviteId, item.groupName)}

                          >
                            <Text style={styles.tagText}>
                              {item.groupName} (Invited by {item.inviterName})
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
        {/* </TouchableWithoutFeedback> */}
      </KeyboardAvoidingView>
    </View>
  );
}
