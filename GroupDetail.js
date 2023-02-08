import React, { useState, useEffect } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
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
import { doc, collection, query, addDoc, getDoc, getDocs, setDoc, deleteDoc, onSnapshot, where, orderBy, DocumentReference } from "firebase/firestore";

// use custom style sheet
const styles = require('./Style.js');
// use custom components
import { Title, Footer } from './Components.js'
import { useTheme } from 'react-native-paper';

export function GroupDetailScreen({ route, navigation }) {

  const insets = useSafeAreaInsets();
  const uid = route.params.uid;
  const groupId = route.params.groupId;

  const [user, setUser] = useState('');
  const [createdByUser, setCreatedByUser] = useState('');
  const [origGroup, setOrigGroup] = useState({});
  const [group, setGroup] = useState({});
  const [groupUserNames, setGroupUserNames] = useState([]);
  const [emailInvite, setEmailInvite] = useState("");
  const [groupMembersUpdated, setGroupMembersUpdated] = useState(0);

  // invite user modal
  const [inviteUserVisible, setInviteUserVisible] = useState(false);
  const [backgroundOpacity, setBackgroundOpacity] = useState(1.0);



  // get group and related info
  useEffect(() => {
    // console.log("Getting group", uid, groupId);
    async function getGroupInfo() {

      var userSnap = await getUser()
      var groupSnap = await getGroup()

      // Promise Chaining
      var groupUsersSnap = await getGroupUsers()
      var retrievedUserNames = await processGroupUsers(groupUsersSnap)
      // var savedGroupUsers = await saveTaskGroups(retrievedUserNames)

      // get user 
      async function getUser() {
        try {
          const docSnap = await getDoc(doc(db, "Users", uid));
          setUser(docSnap.data());
        } catch (error) {
          console.error(error);
        }
      }

      async function getGroup() {
        try {
          var docSnap = await getDoc(doc(db, "Groups", groupId));
          setOrigGroup(docSnap.data());
          setGroup(docSnap.data());
          // get user info for the user that created this group
          docSnap = await getDoc(doc(db, "Users", docSnap.data().creator));
          setCreatedByUser(docSnap.data().name + " (" + docSnap.data().email + ")")
        } catch (error) {
          console.error(error);
        }
      }

      // get users subcollection for the group
      async function getGroupUsers() {
        // console.log("getGroupUsers", groupId)
        try {
          var querySnapshot = await getDocs(query(collection(db, "Groups", groupId, "GroupUsers")));
          return querySnapshot
        } catch (error) {
          console.error(error);
        }
      }

      // process each user in the group's subcollection
      async function processGroupUsers(querySnapshot) {
        try {
          console.log("processGroupUsers", querySnapshot.docs.length)
          var retrievedUserNames = await getGroupUsersDetails(querySnapshot.docs)
          setGroupUserNames(retrievedUserNames)
          return retrievedUserNames
        } catch (error) {
          console.error(error);
        }
      }

      // for each user in the group's subcollection, retrieve the main user document
      async function getGroupUsersDetails(groupUsersSnaps) {
        try {
          return Promise.all(groupUsersSnaps.map(async (groupUser) => {
            // console.log("docref", groupUser.size)

            // get the groupuser doc from the subcollection
            var docSnap = await getDoc(groupUser.ref);
            var groupUid = docSnap.data().userId

            // get the main user doc
            docSnap = await getDoc(doc(db, "Users", groupUid));

            return {
              "uid": docSnap.id,
              "name": docSnap.data().name,
              "email": docSnap.data().email,
            }



          }))
        } catch (error) {
          console.error(error);
        }
      }
    }

    getGroupInfo();

  }, [groupMembersUpdated])

  // invite a user to the group
  const inviteUser = async () => {
    var alreadyInvitedOrInGroup = false;
    const timestamp = Math.floor(Date.now()) //serverTimestamp();
    var data = {
      groupId: groupId,
      inviter: uid,
      invitee: emailInvite,
      createdDate: timestamp
    }

    try {
      // see if user already in group or already invited
      console.log("Checking if user is already in here:", groupUserNames)
      for (var groupUser of groupUserNames) {
        console.log(groupUser.email)
        if (groupUser.email == emailInvite) {
          Alert.alert("Already in Group", emailInvite + " is already in this group.")
          alreadyInvitedOrInGroup = true;
          break
        }
      }

      // check for existing invite
      const existingInvites = await getDocs(query(collection(db, "GroupInvites"), where("invitee", "==", emailInvite), where("groupId", "==", groupId)))
      if (existingInvites.docs.length > 0) {
        Alert.alert("Already Invited", emailInvite + " already has a pending invitation to this group.")
        alreadyInvitedOrInGroup = true;
        // console.log("OK to add")
      }

      if (!alreadyInvitedOrInGroup) {
        addDoc(collection(db, "GroupInvites"), data)
        Alert.alert("Invitation Sent", emailInvite + " has been invited to the group.")
      }
    } catch (error) {
      console.error(error);
    }

    setInviteUserVisible(false)
    setBackgroundOpacity(1.0)
    setEmailInvite("")
  }

  const confirmDeleteGroupMembership = (userId, userName) => {
    // check if user is group owner, don't allow removal
    if (userId == uid) {
      Alert.alert("Group Owner",
        "You are the group owner and can't remove yourself from the group",
        [
          {
            text: "Ok"
          }]
      )
      return
    }

    Alert.alert("Remove User",
      "Are you sure your want remove " + userName + " from this group?",
      [{
        text: "Remove",
        onPress: () => deleteGroupMembership(userId),

      },
      {
        text: "Cancel"
      }]
    )
    return
  }

  // delete a group membership
  const deleteGroupMembership = async (userId) => {
    // console.log("deleting the group membership", groupId, uid)
    try {
      const querySnapshot = await getDocs(query(collection(db, "Groups", groupId, "GroupUsers"), where('userId', '==', userId)));
      // console.log(typeof querySnapshot)
      querySnapshot.forEach((doc) => {
        // console.log("deleting docref", doc.ref)
        deleteDoc(doc.ref)
        setGroupMembersUpdated(groupMembersUpdated + 1);
      })
    } catch (error) {
      console.error(error);
    }
  }

  const groupChanged = () => {
    const keys1 = Object.keys(group);
    const keys2 = Object.keys(origGroup);
    if (keys1.length !== keys2.length) {
      return true;
    }
    for (let key of keys1) {
      if (group[key] !== origGroup[key]) {
        return true;
      }
    }
    return false;
  }

  const SaveGroup = async () => {
    if (!groupChanged()) {
      // console.log("!groupChanged()")
      return 0
    }
    // console.log("Saving group", uid, groupId)
    try {
      await setDoc(doc(db, "Groups", groupId), group)
    } catch (error) {
      // const errorCode = error.code;
      const errorMessage = error.message;
      alert(errorMessage);
      return 1;
    }
    return 0;
  }
  // console.log("group", group)
  // console.log("origGroup", origGroup)
  // console.log("REFRESHED", Date())

  return (
    <View style={[styles.safeView, {
      marginTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      opacity: backgroundOpacity
    }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View>

            <Title
              title="Group Details"
              name={user.name}
              navigation={navigation} />

            <ScrollView style={{ height: "81%", marginBottom: 15 }}>

              <View style={styles.inputFormContainer}>
                <Text style={styles.inputLabel}>Created by {createdByUser}</Text>
                <Text style={styles.inputLabel}>Created on {new Date(group.createdDate).toString().slice(0, 24)}</Text>

                <Text style={[styles.inputLabel, { paddingTop: 15 }]}>Name</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={(newValue) => { setGroup((prevState) => ({ ...prevState, name: newValue })) }}
                  value={group.name}
                  underlineColorAndroid='transparent'
                  autoCapitalize='none'
                />

                <Text style={styles.inputLabel}>Notes</Text>
                <TextInput
                  style={[styles.input, {
                    paddingTop: 10,
                    height: 120,
                    textAlignVertical: "top" // android fix for centering it at the top-left corner 
                  }]}
                  multiline={true} // ios fix for centering it at the top-left corner 
                  onChangeText={(newValue) => { setGroup((prevState) => ({ ...prevState, notes: newValue })) }}
                  value={group.notes}
                  underlineColorAndroid='transparent'
                  autoCapitalize='none'
                />


                <Text style={styles.inputLabel}>Group Members</Text>
                <View style={styles.tagContainer}>
                  {
                    groupUserNames.map((item) =>
                      <Pressable key={item.uid}
                        onPress={() => confirmDeleteGroupMembership(item.uid, item.name)}
                      >
                        <Text style={styles.tagText}>
                          {item.name}
                        </Text>
                      </Pressable>
                    )
                  }
                  <Pressable
                    onPress={() => {
                      setInviteUserVisible(true)
                      setBackgroundOpacity(.33)
                    }}
                  >
                    <Text style={styles.tagText}>
                      +
                    </Text>
                  </Pressable>

                </View>



                {/* modal for selecting groups  */}
                <Modal
                  animationType="slide"
                  transparent={true}
                  visible={inviteUserVisible}
                  onRequestClose={() => {
                    setInviteUserVisible(false)
                    setBackgroundOpacity(1.0)
                  }}>
                  <View style={styles.modalView}>
                    <Text style={styles.pageTitleText}>Invite User to Group</Text>
                    {/* <View style={{ marginBottom: 15, alignItems: "flex-start", flexWrap: "wrap", flexDirection: "row" }}> */}
                    <View style={styles.inputFormContainer}>


                      <Text style={[styles.inputLabel, { paddingTop: 15 }]}>Email</Text>
                      <TextInput style={[styles.input, { width: 250 }]}
                        onChangeText={(newValue) => { setEmailInvite(newValue) }}
                        value={emailInvite}
                        underlineColorAndroid='transparent'
                        autoCapitalize='none'
                      />

                    </View>
                    {/* </View> */}

                    <View style={{ flexDirection: "row", alignItems: "center" }}>

                      <Pressable
                        style={[styles.mainButton, styles.btnWarning, styles.btnNarrow]}
                        onPress={() => {
                          setInviteUserVisible(false)
                          setBackgroundOpacity(1.0)
                        }}>
                        <Text style={[styles.buttonText]}>
                          <FontAwesome
                            style={[{ fontSize: 35 }]}
                            name='arrow-circle-o-left'
                            color='white'
                          />
                        </Text>
                      </Pressable>

                      <Pressable
                        style={[styles.mainButton, styles.btnSuccess]}
                        onPress={() => inviteUser()}>
                        <Text style={styles.buttonText}>Invite</Text>
                      </Pressable>


                    </View>

                  </View>
                </Modal>




                <View style={{ alignItems: "center" }}>
                  <TouchableOpacity style={[styles.mainButton, styles.btnSuccess, { opacity: (!groupChanged()) ? 0.5 : 1.0 }]}
                    disabled={!groupChanged()}
                    onPress={async () => {
                      await SaveGroup().then(
                        (result) => {
                          if (result == 0) {
                            navigation.goBack();
                          }
                        }
                      )
                    }}
                  >
                    <Text
                      style={[styles.buttonText]}
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
    </View>
  );
}
