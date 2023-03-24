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
import { doc, collection, query, getDoc, setDoc, addDoc, deleteDoc, onSnapshot, orderBy, where } from "firebase/firestore";

// use custom style sheet
const styles = require('./Style.js');
// use custom components
import { Title, Footer } from './Components.js'
import { deleteResource } from './Functions.js'

export function ResourcesScreen({ route, navigation }) {

  const insets = useSafeAreaInsets();
  const uid = route.params.uid;
  // const resourcesRef = db.collection("resources");

  const [user, setUser] = useState('');
  const [resources, setResources] = useState([]);
  const [newResourceName, setNewResourceName] = useState('');
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

  // get resources
  useEffect(() => {
    var unsubscribe;
    var resourceObj;
    async function getResources() {
      try {
        unsubscribe = onSnapshot(
          query(
            collection(db, "Resources"), where("creator", "==", uid), orderBy('name')), (querySnapshot) => {
              const retrievedResources = [];
              querySnapshot.forEach((doc) => {
                resourceObj = doc.data();
                resourceObj.id = doc.id;
                retrievedResources.push(resourceObj)
              })
              setResources(retrievedResources)
              setLoading(false);
            })
      } catch (error) {
        console.error(error);
      }
    }
    getResources();
    return function cleanup() {
      unsubscribe();
    };
  }, [])

  // add a resource
  const addResource = async () => {
    // check we have one to add
    console.log(resources)
    if (newResourceName && newResourceName.length > 0) {

      //check if it already exists
      if (resources.some(el => newResourceName == el.name)) {

        Alert.alert("Resource " + newResourceName + " already exists.",
          "Please choose a different name.",
          [{
            text: "Ok"
          }]
        )

        return
      }

      try {
        const timestamp = Math.floor(Date.now()) //serverTimestamp();
        const data = {
          name: newResourceName,
          creator: uid,
          createdDate: timestamp
        }
        addDoc(collection(db, "Resources"), data)
        setNewResourceName('');
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
          Delete Resource
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
            title="Resources"
            name={user.name}
            navigation={navigation}
            enableBack={true} />

          <View style={styles.inputBtnFormContainer}>
            <TextInput
              style={styles.inputShort}
              placeholder="resource quick add"
              onChangeText={(newResourceName) => setNewResourceName(newResourceName)}
              value={newResourceName}
              underlineColorAndroid='transparent'
              autoCapitalize='none'
            />
            <TouchableOpacity
              style={[styles.inputButton, styles.btnSuccess, { opacity: (!newResourceName ? 0.5 : 1.0) }]}
              disabled={!newResourceName}
              onPress={() => {
                Keyboard.dismiss();
                addResource()
              }}
            >
              <Text
                style={styles.buttonText}
              >Add</Text>
            </TouchableOpacity>
          </View>
          {/* show acivity indicator when waiting to return to resources screen */}
          {isLoading ? (
            <ActivityIndicator style={styles.standardText} size="large" />
          ) : (
            // <FlatList style={{ height: "73%", marginBottom: 15 }}
            <FlatList
              data={resources}
              ListEmptyComponent={<Text style={[styles.listText, styles.txtWarning, { alignSelf: "center" }]}>
                No resources! Add some!
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
                    onSwipeableRightOpen={() => deleteResource(item.id)}
                    // onSwipeableLeftOpen={() => completeTask(item, index)}
                    friction={1}
                  >

                    <Pressable
                      style={styles.listContainer}
                      onPress={() => navigation.navigate('ResourceDetail', { uid: uid, resourceId: item.id })}
                    >
                      {/* <FontAwesome
                      style={styles.listDelIcon}
                      name='trash-o'
                      color='lightgrey'
                      onPress={() => deleteResource(item.id)} /> */}
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
