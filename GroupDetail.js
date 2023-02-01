import React, { useState, useEffect } from 'react';
import {
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
import { signOut } from "firebase/auth";
import { doc, collection, query, getDoc, getDocs, setDoc, onSnapshot, where, orderBy } from "firebase/firestore";

// use custom style sheet
const styles = require('./Style.js');
// use custom components
import { Title, Footer } from './Components.js'

export function GroupDetailScreen({ route, navigation }) {

  const uid = route.params.uid;
  const groupId = route.params.groupId;

  const [user, setUser] = useState('');
  const [createdByUser, setCreatedByUser] = useState('');
  const [origGroup, setOrigGroup] = useState({});
  const [group, setGroup] = useState({});
  const [groupUserNames, setGroupUserNames] = useState([]);

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

  // get group and related info
  useEffect(() => {
    // console.log("Getting group", uid, groupId);
    async function getGroup() {
      try {
        var docSnap = await getDoc(doc(db, "Groups", groupId));
        setOrigGroup(docSnap.data());
        setGroup(docSnap.data());
        // get user info for the user that created this group
        docSnap = await getDoc(doc(db, "Users", docSnap.data().creator));
        setCreatedByUser(docSnap.data().name + " (" + docSnap.data().email + ")")




        // Promise Chaining
        var groupUsersSnap = await getGroupUsers()
        var retrievedUserNames = await processGroupUsers(groupUsersSnap)
        // var savedGroupUsers = await saveTaskGroups(retrievedUserNames)


        async function getGroupUsers() {
          // get users subcollection for the group
          // console.log("getGroupUsers", groupId)
          var querySnapshot = await getDocs(query(collection(db, "Groups", groupId, "GroupUsers")));
          // console.log("XX", querySnapshot)
          return querySnapshot
        }

        async function processGroupUsers(querySnapshot) {
          console.log("processGroupUsers", querySnapshot.docs.length)
          var retrievedUserNames = await getGroupUsersParents(querySnapshot.docs)
          setGroupUserNames(retrievedUserNames)
          return retrievedUserNames
        }

        function getGroupUsersParents(groupUsersSnaps) {
          return Promise.all(groupUsersSnaps.map(async (groupUser) => {
            const docRef = groupUser.ref;
            const parentCollectionRef = docRef.parent; // CollectionReference
            const immediateParentDocumentRef = parentCollectionRef.parent; // DocumentReference
            const parentDoc = await getDoc(immediateParentDocumentRef)
console.log("DOCREF", parentDoc.data() )

            return {
              "uid": parentDoc?.id,
              "name": parentDoc?.data().name,
              "email": parentDoc?.data().email,
            }

            

          }))
        }







      } catch (error) {
        console.error(error);
      }
    }
    getGroup();
  }, [])

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
  console.log("REFRESHED", Date())


  return (
    <SafeAreaView style={[styles.safeView]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View>

            <Title
              title="Group Details"
              name={user.name}
              navigation={navigation} />

            <ScrollView style={{ height: "84%", marginBottom: 15 }}>

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
                    height: 120,
                    textAlignVertical: "top" // android fix for centering it at the top-left corner 
                  }]}
                  multiline={true} // ios fix for centering it at the top-left corner 
                  onChangeText={(newValue) => { setGroup((prevState) => ({ ...prevState, notes: newValue })) }}
                  value={group.notes}
                  underlineColorAndroid='transparent'
                  autoCapitalize='none'
                />



<View style={{ marginBottom: 15, alignItems: "flex-start", flexWrap: "wrap", flexDirection: "row" }}>

{
  groupUserNames.map((item) =>
    <Pressable key={item.uid}
      onPress={() => deleteGroupUser(item.id)}
    >
      <Text style={styles.groupText}>
        {item.name}
      </Text>
    </Pressable>
  )
}
</View>




                <View style={{ alignItems: "center" }}>
                  <TouchableOpacity style={[styles.mainButton, { opacity: (!groupChanged()) ? 0.5 : 1.0 }]}
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
