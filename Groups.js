import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';

import { db, auth } from './firebase.config';
import { doc, collection, query, getDoc, setDoc, addDoc, deleteDoc, onSnapshot, where, orderBy, getDocs } from "firebase/firestore";

// use custom style sheet
const styles = require('./Style.js');
// use custom components
import { Title, Footer } from './Components.js'
import { deleteGroup } from './Functions.js'

export function GroupsScreen({ route, navigation }) {

  const insets = useSafeAreaInsets();
  const uid = route.params.uid;
  // const groupsRef = db.collection("groups");

  const [user, setUser] = useState('');
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [isLoading, setLoading] = useState(true);

  // get user 
  useEffect(() => {
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

  // get groups
  useEffect(() => {
    var unsubscribe;
    var groupObj;
    async function getGroups() {
      try {
        unsubscribe = onSnapshot(
          query(
            collection(db, "Groups"), orderBy('name'), where("creator", "==", uid)), (querySnapshot) => {
              const retrievedGroups = [];
              querySnapshot.forEach((doc) => {
                groupObj = doc.data();
                groupObj.id = doc.id;
                retrievedGroups.push(groupObj)
              })
              setGroups(retrievedGroups)
              setLoading(false);
            })
      } catch (error) {
        console.error(error);
      }
    }
    getGroups();
    return function cleanup() {
      unsubscribe();
    };
  }, [])

  // add a group
  const addGroup = async () => {
    // check we have one to add
    if (newGroupName && newGroupName.length > 0) {

      //check if it already exists
      if (groups.some(el => newGroupName == el.name)) {

        Alert.alert("Group " + newGroupName + " already exists.",
          "Please choose a different name.",
          [{
            text: "Ok"
          }]
        )

        return
      }

      try {
        var data = {};
        const timestamp = Math.floor(Date.now()) //serverTimestamp();
        // add the group
        data = {
          name: newGroupName,
          creator: uid,
          createdDate: timestamp
        }
        var groupRef = addDoc(collection(db, "Groups"), data)
        setNewGroupName('');
        // add current user to group
        data = {
          userId: uid,
          createdDate: timestamp
        }
        addDoc(collection(db, "Groups", (await groupRef).id, "GroupUsers"), data)
      } catch (error) {
        console.log(error.message);
      }
    }
  }

  /////////////////// Swipeable
  const rightSwipeActions = () => {
    return (
      <View
        style={styles.rightSwipeContainer}
      >
        <Text style={{ color: "white", fontsize: 12, paddingRight: "1%" }}>
          Delete Group
        </Text>
        <Text style={{
          color: "white", fontSize: 30,
        }}>
          <FontAwesome
            style={{ color: "white", fontSize: 24 }}
            name='trash-o'
          />
        </Text>
      </View>
    );
  };
  /////////////////// Swipeable

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
            title="Groups"
            name={user.name}
            navigation={navigation}
            enableBack={true} />

          <View style={styles.inputBtnFormContainer}>
            <TextInput
              style={styles.inputShort}
              placeholder="group quick add"
              onChangeText={(newGroupName) => setNewGroupName(newGroupName)}
              value={newGroupName}
              underlineColorAndroid='transparent'
              autoCapitalize='none'
            />
            <TouchableOpacity
              style={[styles.inputButton, styles.btnSuccess, { opacity: (!newGroupName ? 0.5 : 1.0) }]}
              disabled={!newGroupName}
              onPress={() => {
                Keyboard.dismiss();
                addGroup()
              }}
            >
              <Text
                style={styles.buttonText}
              >Add</Text>
            </TouchableOpacity>
          </View>
          {/* show acivity indicator when waiting to return to groups screen */}
          {isLoading ? (
            <ActivityIndicator style={styles.standardText} size="large" />
          ) : (
            // <FlatList style={{ height: "73%", marginBottom: 15 }}
            <FlatList
              data={groups}
              ListEmptyComponent={<Text style={[styles.listText, styles.txtWarning, { alignSelf: "center" }]}>
                No groups! Add some!
              </Text>}
              ItemSeparatorComponent={() =>
                <View style={{
                  flex: 1,
                  height: 1,
                  // backgroundColor: 'red',
                }} />}
              renderItem={({ item }) => (
                <View>

                  <Swipeable
                    // ref={ref => swipeableRef.current[index] = ref}
                    // renderLeftActions={LeftSwipeActions}
                    renderRightActions={rightSwipeActions}
                    onSwipeableRightOpen={() => deleteGroup(item.id)}
                    // onSwipeableLeftOpen={() => completeTask(item, index)}
                    friction={1}
                  >

                    <Pressable
                      style={styles.listContainer}
                      onPress={() => navigation.navigate('GroupDetail', { uid: uid, groupId: item.id })}
                    >
                      {/* <FontAwesome
                      style={styles.listDelIcon}
                      name='trash-o'
                      color='lightgrey'
                      onPress={() => deleteGroup(item.id)} /> */}
                      {/* <View > */}
                      <Text style={styles.listText} >
                        {item.name}
                      </Text>
                      {/* </View> */}
                    </Pressable>
                  </Swipeable>
                </View>
              )}
            />
          )}

          <Footer auth={auth}
            navigation={navigation}
            uid={uid} />

        </View>
        {/* </TouchableWithoutFeedback> */}
      </KeyboardAvoidingView>
    </View>
  );
}
