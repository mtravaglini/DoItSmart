import React, { useState, useEffect } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { db, auth } from './firebase.config';
import { doc, collection, query, addDoc, getDoc, getDocs, setDoc, deleteDoc, onSnapshot, where, orderBy, DocumentReference, collectionGroup, documentId } from "firebase/firestore";

// use custom style sheet
const styles = require('./Style.js');
// use custom components
import { Title, Footer } from './Components.js'
import { getAllGroupsForUser, deleteResource } from './Functions.js'

export function ResourceDetailScreen({ route, navigation }) {

  const insets = useSafeAreaInsets();
  const uid = route.params.uid;
  const resourceId = route.params.resourceId;

  const [user, setUser] = useState('');
  const [createdByUser, setCreatedByUser] = useState('');
  const [origResource, setOrigResource] = useState({});
  const [resource, setResource] = useState({});
  const [userGroupNames, setUserGroupNames] = useState([]);
  const [groupResourceNames, setGroupResourceNames] = useState([]);
  const [groupResourcesUpdated, setGroupResourcesUpdated] = useState(0);

  // add task groups modal
  const [groupResourcePickerVisible, setGroupResourcePickerVisible] = useState(false);
  const [backgroundOpacity, setBackgroundOpacity] = useState(1.0);

  // get resource and related info
  useEffect(() => {

    async function getResoureceInfo() {

      var userSnap = await getUser()
      var resoureceSnap = await getResource()

      // promise chaining //////////////////////////////////////////
      var groupResourcesSnap = await getGroupResourcesByResource()
      var retrievedGroupResourceNames = await processGroupSubcollection(groupResourcesSnap)
      setGroupResourceNames(retrievedGroupResourceNames)

      // var userGroupsSnap = await getGroupUsersByUser(userSnap)
      // var retrievedUserGroupNames = await processGroupSubcollection(userGroupsSnap)
      var retrievedUserGroupNames = await getAllGroupsForUser(uid)

      var filterGroupsResult = await filterGroups(retrievedGroupResourceNames, retrievedUserGroupNames)
      setUserGroupNames(filterGroupsResult)

      // get user 
      async function getUser() {
        try {
          const docSnap = await getDoc(doc(db, "Users", uid));
          setUser(docSnap.data());
          return docSnap;
        } catch (error) {
          console.error(error);
        }
      }

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
      async function getGroupResourcesByResource() {
        // get groups subcollection for the resource
        try {
          var querySnapshot = await getDocs(query(collectionGroup(db, "GroupResources"), where("resourceId", "==", resourceId)));
          return querySnapshot
        } catch (error) {
          console.error(error);
        }
      }

      // async function getGroupUsersByUser(userSnap) {
      //   try {
      //     var querySnapshot = await getDocs(query(collectionGroup(db, 'GroupUsers'), where('userId', '==', uid)));
      //     return querySnapshot
      //   } catch (error) {
      //     console.error(error);
      //   }
      // }

      async function processGroupSubcollection(querySnapshot) {
        try {
          var retrievedGroupNames = await getGroupUsersParents(querySnapshot.docs)
          return retrievedGroupNames
        } catch (error) {
          console.error(error);
        }
      }


      async function getGroupUsersParents(groupUsersSnaps) {
        try {
          return Promise.all(groupUsersSnaps.map(async (groupUser) => {
            const docRef = groupUser.ref;
            const parentCollectionRef = docRef.parent; // CollectionReference
            const immediateParentDocumentRef = parentCollectionRef.parent; // DocumentReference
            const parentDoc = await getDoc(immediateParentDocumentRef)

            return {
              "id": parentDoc?.id,
              "name": parentDoc.data()?.name,
            }
          }))
        } catch (error) {
          console.error(error);
        }
      }

      async function filterGroups(savedGroupResources, savedUserGroups) {
        // check if resource is already in a group, if so don't need to save it
        const newUserGroupNames = [];

        for (var userGroup of savedUserGroups) {
          var alreadyInGroup = false;
          for (var groupResource of savedGroupResources) {
            // console.log("checking", groupResource.name)
            if (userGroup.id == groupResource.id) {
              // console.log("Resource is in group", groupResource.name)
              alreadyInGroup = true;
            }
          }

          if (!alreadyInGroup) {
            newUserGroupNames.push(userGroup)
          }
        }

        // console.log("contents of newusergroupnames", newUserGroupNames.length)
        return newUserGroupNames
      }
    }

    getResoureceInfo();

  }, [groupResourcesUpdated])

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
        setGroupResourcesUpdated(groupResourcesUpdated + 1);

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
      console.log(error.message);
      return 1;
    }

    return 0;
  }
  // console.log("group", group)
  // console.log("origGroup", origGroup)
  // console.log("REFRESHED", Date())

  // add a group membership
  const addGroupResource = async (groupId) => {
    console.log("adding resource group", resourceId, groupId)
    const timestamp = Math.floor(Date.now()) //serverTimestamp();

    var data = {
      resourceId: resourceId,
      createdDate: timestamp
    }
    try {
      addDoc(collection(db, "Groups", groupId, "GroupResources"), data)
      setGroupResourcesUpdated(groupResourcesUpdated + 1);
      setGroupResourcePickerVisible(false)
      setBackgroundOpacity(1.0)
    } catch (error) {
      console.error(error);
    }
  }

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
        {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss}> */}
        <View style={{ flex: 1 }}>

          <Title
            title="Resource Details"
            name={user.name}
            navigation={navigation}
            enableBack={true} />

          {/* <ScrollView style={{ height: "81%", marginBottom: 15 }}> */}
          <ScrollView>

            <View style={styles.inputFormContainer}>
              <Text style={styles.textLabel}>Created by {createdByUser}</Text>
              <Text style={styles.textLabel}>Created on {new Date(resource.createdDate).toString().slice(0, 24)}</Text>

              <View style={{ flexDirection: "row" }}>
                <View style={{ flex: 3 }}></View>
                <TouchableOpacity style={[styles.mainButton, styles.btnDanger, styles.btnNarrow, { flex: 1 }]}
                  // disabled={!groupChanged()}
                  onPress={() => {
                    deleteResource(resourceId)
                    navigation.goBack()
                  }}
                >
                  <Text
                    style={[styles.buttonText]}
                  >
                    <FontAwesome
                      style={{ color: "white", fontSize: 24 }}
                      name='trash-o'
                    />
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.mainButton, styles.btnSuccess, { flex: 2 }, { opacity: (!resourceChanged()) ? 0.5 : 1.0 }]}
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
                  >
                    <FontAwesome5
                      style={{ color: "white", fontSize: 24 }}
                      name='save'
                    /> Save
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.textLabel, { paddingTop: 15 }]}>Name</Text>
              <TextInput
                style={styles.input}
                onChangeText={(newValue) => { setResource((prevState) => ({ ...prevState, name: newValue })) }}
                value={resource.name}
                underlineColorAndroid='transparent'
                autoCapitalize='none'
              />

              <Text style={styles.textLabel}>Notes</Text>
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


              <Text style={styles.textLabel}>Resource Groups</Text>
              <View style={styles.tagContainer}>
                {
                  groupResourceNames.map((item) =>
                    <Pressable key={item.id} style={styles.tagButton}
                      onLongPress={() => confirmDeleteGroupMembership(item.id, item.name)}
                      onPress={() => navigation.navigate('GroupDetail', { uid: uid, groupId: item.id })}
                    >
                      <Text style={styles.tagText}>
                        {item.name}
                      </Text>
                    </Pressable>
                  )
                }
                <Pressable style={styles.tagButton}
                  onPress={() => {
                    setGroupResourcePickerVisible(true)
                    setBackgroundOpacity(.33)
                  }}
                >
                  <Text style={styles.tagText}>
                    +
                  </Text>
                </Pressable>

              </View>
            </View>


            {/* modal for selecting groups  */}
            <Modal
              animationType="slide"
              transparent={true}
              visible={groupResourcePickerVisible}
              onRequestClose={() => {
                setGroupResourcePickerVisible(false)
                setBackgroundOpacity(1.0)
              }}>
              <View style={styles.modalView}>

                <Pressable style={{ alignSelf: "flex-start", position: "absolute", left: "3%", marginTop: "1%" }}
                  onPress={() => {
                    setGroupResourcePickerVisible(false)
                    setBackgroundOpacity(1.0)
                  }}
                >
                  <Text style={[styles.pageTitleText]}>
                    <FontAwesome
                      style={styles.headerIcon}
                      name='arrow-circle-o-left'
                    // color='cornflowerblue'
                    />
                  </Text>
                </Pressable>

                <Text style={styles.pageTitleText}>Add Resource to Groups</Text>

                <Text style={[styles.textLabel, { paddingTop: 15, alignSelf: 'flex-start' }]}>Groups</Text>

                {userGroupNames.length > 0 ? (
                  <View style={styles.tagContainer}>

                    {
                      userGroupNames.map((item) =>
                        <Pressable key={item.id} style={styles.tagButton}
                          onPress={() => addGroupResource(item.id)}
                        >
                          <Text style={styles.tagText}>
                            {item.name}
                          </Text>
                        </Pressable>
                      )
                    }
                  </View>)
                  :
                  (<View style={styles.tagContainer}>
                    <Text style={[styles.standardText, styles.txtError]}>
                      No more Groups to add!
                    </Text>
                  </View>)}
              </View>
            </Modal>
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
