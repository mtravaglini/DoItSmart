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
import { doc, collection, query, addDoc, getDoc, getDocs, setDoc, deleteDoc, onSnapshot, where, orderBy, DocumentReference, collectionGroup, documentId } from "firebase/firestore";

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
  const [userGroupNames, setUserGroupNames] = useState([]);
  const [resourceGroupNames, setResourceGroupNames] = useState([]);
  const [resourceGroupsUpdated, setResourceGroupsUpdated] = useState(0);

  // add task groups modal
  const [resourceGroupPickerVisible, setResourceGroupPickerVisible] = useState(false);
  const [backgroundOpacity, setBackgroundOpacity] = useState(1.0);


  useEffect(() => {

    async function getResoureceInfo() {

      var userSnap = await getUser()
      var resoureceSnap = await getResource()

      // promise chaining
      var resourceGroupsSnap = await getresourcegroups()
      var retrievedGroupNames1 = await processResourceGroups(resourceGroupsSnap)
      var userGroupsSnap = await getusergroups(userSnap)
      var retrievedGroupNames2 = await processUserGroups(userGroupsSnap)

      async function getUser() {
        try {
          const docSnap = await getDoc(doc(db, "Users", uid));
          setUser(docSnap.data());
          return docSnap;
        } catch (error) {
          console.error(error);
        }
      }

      // console.log("Getting group", uid, groupId);
      async function getResource() {
        try {
          var docSnap = await getDoc(doc(db, "Resources", resourceId));
          setOrigResource(docSnap.data());
          setResource(docSnap.data());
          // get user info for the user that created this resource
          docSnap = await getDoc(doc(db, "Users", docSnap.data().creator));
          setCreatedByUser(docSnap.data().name + " (" + docSnap.data().email + ")")
          return docSnap
        } catch (error) {
          console.error(error);
        }
      }

      // get resource groups for this resource
      async function getresourcegroups() {
        // console.log("gettaskgroups")
        // unsubscribe = onSnapshot(
        // get groups subcollection for the task
        var querySnapshot = await getDocs(query(collectionGroup(db, "GroupResources"), where("resourceId", "==", resourceId)));
        return querySnapshot
        // console.log("reached gettaskgroups2")
        // console.log("Setting task groups", retrievedGroupNames)

      }
      async function processResourceGroups(querySnapshot) {
        // console.log("processUserGroups", querySnapshot.docs.length)

        var retrievedGroupNames = await getGroupUsersParents(querySnapshot.docs)
        setResourceGroupNames(retrievedGroupNames)
        return retrievedGroupNames
      }


      async function getusergroups(userSnap) {
        // console.log("getusergroups", savedTaskGroups)
        // console.log("reached getusergroups")
        var querySnapshot = await getDocs(query(collectionGroup(db, 'GroupUsers'), where('userId', '==', uid)));
        return querySnapshot
        // console.log("Setting user groups", retrievedGroupNames2)
      }

      async function processUserGroups(querySnapshot) {
        // console.log("processUserGroups", querySnapshot.docs.length)

        var retrievedGroupNames = await getGroupUsersParents(querySnapshot.docs)
        setUserGroupNames(retrievedGroupNames)
        return retrievedGroupNames
      }

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


    }

    getResoureceInfo();

  }, [resourceGroupsUpdated])





  const confirmDeleteGroupMembership = (groupId, groupName) => {
    Alert.alert("Remove resource from group " + groupName,
      "Are you sure?",
      [{
        text: "Remove",
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
      const querySnapshot = await getDocs(query(collection(db, "Groups", groupId, "GroupResources"), where('resourceId', '==', resourceId)));
      // console.log(typeof querySnapshot)
      querySnapshot.forEach((doc) => {
        // console.log("deleting docref", doc.ref)
        deleteDoc(doc.ref)
        setResourceGroupsUpdated(resourceGroupsUpdated + 1);

      })
    } catch (error) {
      console.error(error);
    }
  }








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
  // console.log("REFRESHED", Date())

  // add a group membership
  const addResourceGroup = async (groupId) => {
    console.log("adding resource group", resourceId, groupId)
    const timestamp = Math.floor(Date.now()) //serverTimestamp();

    var data = {
      resourceId: resourceId,
      createdDate: timestamp
    }
    try {
      addDoc(collection(db, "Groups", groupId, "GroupResources"), data)
      setResourceGroupsUpdated(resourceGroupsUpdated + 1);
      setResourceGroupPickerVisible(false)
      setBackgroundOpacity(1.0)
    } catch (error) {
      console.error(error);
    }


  }

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
                    paddingTop: 10,
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

                <View style={{
                  backgroundColor: "white", padding: "3%", borderRadius: 15, marginHorizontal: "1%",
                  marginBottom: 15, alignItems: "flex-start", flexWrap: "wrap", flexDirection: "row"
                }}>

                  {
                    resourceGroupNames.map((item) =>
                      <Pressable key={item.id}
                      onLongPress={() => confirmDeleteGroupMembership(item.id, item.name)}
                      onPress={() => navigation.navigate('GroupDetail', { uid: uid, groupId: item.id })}
                      >
                        <Text style={styles.groupResourceText}>
                          {item.name}
                        </Text>
                      </Pressable>
                    )
                  }
                  <Pressable
                    onPress={() => {
                      setResourceGroupPickerVisible(true)
                      setBackgroundOpacity(.33)
                    }}
                  >
                    <Text style={styles.groupResourceText}>
                      +
                    </Text>
                  </Pressable>

                </View>





                {/* modal for selecting groups  */}
                <Modal
                  animationType="slide"
                  transparent={true}
                  visible={resourceGroupPickerVisible}
                  onRequestClose={() => {
                    setResourceGroupPickerVisible(false)
                    setBackgroundOpacity(1.0)
                  }}>
                  <View style={styles.modalView}>
                    <Text style={styles.pageTitleText}>Add Resource to Groups</Text>

                    <Text style={[styles.inputLabel, { paddingTop: 15, alignSelf: 'flex-start' }]}>Groups</Text>

                    <View style={{ marginBottom: 15, alignItems: "flex-start", flexWrap: "wrap", flexDirection: "row" }}>

                      {
                        userGroupNames.map((item) =>
                          <Pressable key={item.id}
                            onPress={() => addResourceGroup(item.id)}
                          >
                            <Text style={styles.groupResourceText}>
                              {item.name}
                            </Text>
                          </Pressable>
                        )
                      }
                    </View>

                    <Pressable
                      style={[styles.mainButton, styles.btnWarning, styles.btnNarrow]}
                      onPress={() => {
                        setResourceGroupPickerVisible(false)
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

                  </View>
                </Modal>

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
