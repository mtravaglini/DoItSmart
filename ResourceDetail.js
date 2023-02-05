import React, { useState, useEffect } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
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
import { doc, collection, query, addDoc, getDoc, getDocs, setDoc, deleteDoc, onSnapshot, where, orderBy, DocumentReference, collectionGroup } from "firebase/firestore";

// use custom style sheet
const styles = require('./Style.js');
// use custom components
import { Title, Footer } from './Components.js'
import { useTheme } from 'react-native-paper';

export function ResourceDetailScreen({ route, navigation }) {

  const uid = route.params.uid;
  const resourceId = route.params.resourceId;

  const [user, setUser] = useState('');
  const [createdByUser, setCreatedByUser] = useState('');
  const [origResource, setOrigResource] = useState({});
  const [resource, setResource] = useState({});
  // const [groupUserNames, setGroupUserNames] = useState([]);
  // const [emailInvite, setEmailInvite] = useState("");
  // const [groupMembersUpdated, setGroupMembersUpdated] = useState(0);


  // get user 
  useEffect(() => {
    // console.log("Getting user", uid)
    async function getUser() {
      try {
        const docSnap = await getDoc(doc(db, "Users", uid));
        setUser(docSnap.data());
      } catch (error) {
        console.error(error);
      }
    }
    getUser();
  }, [])

  // get resource and related info
  useEffect(() => {
    // console.log("Getting group", uid, groupId);
    async function getResource() {
      try {
        var docSnap = await getDoc(doc(db, "Resources", resourceId));
        setOrigResource(docSnap.data());
        setResource(docSnap.data());
        // get user info for the user that created this resource
        docSnap = await getDoc(doc(db, "Users", docSnap.data().creator));
        setCreatedByUser(docSnap.data().name + " (" + docSnap.data().email + ")")




        // Promise Chaining
        var groupUsersSnap = await getGroupUsers()
        var retrievedUserNames = await processGroupUsers(groupUsersSnap)
        // var savedGroupUsers = await saveTaskGroups(retrievedUserNames)


        // get all groups that the current user belongs to
        async function getGroupUsers() {
          // console.log("getGroupUsers", groupId)
          var querySnapshot = await getDocs(query(collectionGroup(db, "GroupUsers"), where("userId", "==", uid)));
          return querySnapshot
        }

        // process each groupuser
        async function processGroupUsers(querySnapshot) {
          console.log("processGroupUsers", querySnapshot.docs.length)
          var retrievedUserNames = await getGroupUsersDetails(querySnapshot.docs)
          setGroupUserNames(retrievedUserNames)
          return retrievedUserNames
        }

        // for each groupuser, retrieve the main group document
        function getGroupUsersDetails(groupUsersSnaps) {
          return Promise.all(groupUsersSnaps.map(async (groupUser) => {
            // console.log("docref", groupUser.size)

            // get the groupuser doc from the subcollection
            docSnap = await getDoc(groupUser.ref);
            var groupUid = docSnap.data().userId

            // get the main group doc
            docSnap = await getDoc(doc(db, "Groups", groupId));

            return {
              "id": docSnap.id,
              "name": docSnap.data().name
            }



          }))
        }







      } catch (error) {
        console.error(error);
      }
    }
    getResource();
  }, [groupMembersUpdated])







  const resourceChanged = () => {
    const keys1 = Object.keys(resource);
    const keys2 = Object.keys(origResource);
    if (keys1.length !== keys2.length) {
      return true;
    }
    for (let key of keys1) {
      if (resource[key] !== origResource[key]) {
        return true;
      }
    }
    return false;
  }



  const SaveResource = async () => {

    if (!resourceChanged()) {
      // console.log("!groupChanged()")
      return 0
    }

    // console.log("Saving group", uid, groupId)

    try {
      await setDoc(doc(db, "Resources", resourceId), resource)
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
  console.log("REFRESHED", Date())


  return (
    <SafeAreaView style={[styles.safeView, { opacity: backgroundOpacity }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View>

            <Title
              title="Resource Details"
              name={user.name}
              navigation={navigation} />

            <ScrollView style={{ height: "81%", marginBottom: 15 }}>

              <View style={styles.inputFormContainer}>
                <Text style={styles.inputLabel}>Created by {createdByUser}</Text>
                <Text style={styles.inputLabel}>Created on {new Date(resource.createdDate).toString().slice(0, 24)}</Text>

                <Text style={[styles.inputLabel, { paddingTop: 15 }]}>Name</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={(newValue) => { setResource((prevState) => ({ ...prevState, name: newValue })) }}
                  value={resource.name}
                  underlineColorAndroid='transparent'
                  autoCapitalize='none'
                />

                <Text style={styles.inputLabel}>Notes</Text>
                <TextInput
                  style={[styles.input, {
                    height: 120,
                    textAlignVertical: "top" // android fix for centering it at the top-left corner 
                  }]}
                  multiline={true} // ios fix for centering it at the top-left corner 
                  onChangeText={(newValue) => { setResource((prevState) => ({ ...prevState, notes: newValue })) }}
                  value={resource.notes}
                  underlineColorAndroid='transparent'
                  autoCapitalize='none'
                />


                <Text style={styles.inputLabel}>Resource Groups</Text>

                <View style={{ marginBottom: 15, alignItems: "flex-start", flexWrap: "wrap", flexDirection: "row" }}>

                  {/* {
                    resourceUserNames.map((item) =>
                      <Pressable key={item.uid}
                        onPress={() => confirmDeleteResourceMembership(item.uid, item.name)}
                      >
                        <Text style={styles.resourceText}>
                          {item.name}
                        </Text>
                      </Pressable>
                    )
                  } */}
                  <Pressable
                    onPress={() => {
                      setInviteUserVisible(true)
                      setBackgroundOpacity(.33)
                    }}
                  >
                    <Text style={styles.resourceText}>
                      +
                    </Text>
                  </Pressable>

                </View>



                <View style={{ alignItems: "center" }}>
                  <TouchableOpacity style={[styles.mainButton, styles.btnSuccess, { opacity: (!resourceChanged()) ? 0.5 : 1.0 }]}
                    disabled={!resourceChanged()}
                    onPress={async () => {
                      await SaveResource().then(
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
    </SafeAreaView>
  );
}
