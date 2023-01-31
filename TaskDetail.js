import React, { useState, useEffect } from 'react';
import {
  Alert,
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
import { doc, collection, collectionGroup, query, getDoc, getDocs, setDoc, deleteDoc, onSnapshot, where, orderBy } from "firebase/firestore";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import InputSpinner from "react-native-input-spinner";

// use custom style sheet
const styles = require('./Style.js');
// use custom components
import { Title, Footer } from './Components.js'

export function TaskDetailScreen({ route, navigation }) {

  const uid = route.params.uid;
  const taskId = route.params.taskId;

  const [user, setUser] = useState('');
  const [createdByUser, setCreatedByUser] = useState('');
  const [origTask, setOrigTask] = useState({});
  const [task, setTask] = useState({});
  const [userGroupNames, setUserGroupNames] = useState([]);
  const [taskGroupNames, setTaskGroupNames] = useState([]);

  // date picker variables
  const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);

  const handleStartDatePickerConfirm = (date) => {
    setTask((prevState) => ({ ...prevState, startDate: Date.parse(date) }));
    setStartDatePickerVisibility(false);
  }

  const handleEndDatePickerConfirm = (date) => {
    setTask((prevState) => ({ ...prevState, endDate: Date.parse(date) }));
    setEndDatePickerVisibility(false);
  }

  const formatDate = (date) => {
    var formattedDate = date;

    if (date) {
      formattedDate = new Date(date)
    } else {
      formattedDate = new Date(Date.now())
    }

    return formattedDate.toString().slice(0, 10) + " " + formattedDate.toString().slice(16, 21)
  }

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










  // get task and related info
  useEffect(() => {
    var unsubscribe;
    // console.log("Getting task", uid, taskId);
    async function getTask() {
      try {
        var docSnap = await getDoc(doc(db, "Tasks", taskId), where("assignee", "==", uid));
        setOrigTask(docSnap.data());
        setTask(docSnap.data());

        // get user info for the user that created this task
        docSnap = await getDoc(doc(db, "Users", docSnap.data().creator));
        setCreatedByUser(docSnap.data().name + " (" + docSnap.data().email + ")")

        //////////////////////////////////////////////////////////
        function getTaskGroup(taskGroupSnaps) {
          return Promise.all(taskGroupSnaps.map(async (taskGroup) => {

            const groupId = taskGroup.data().groupId;
            const parentDoc = await getDoc(doc(db, "Groups", groupId))


            return {
              "id": parentDoc?.id,
              "name": parentDoc?.data().name,
            }
          }))
          // setUserGroupNames(retrievedGroupNames)
        }

        // get task groups
        unsubscribe = onSnapshot(
          collection(db, "Tasks", taskId, "TaskGroups"), (querySnapshot) => {



            getTaskGroup(querySnapshot.docs)
              .then((retrievedGroupNames) => {
                setTaskGroupNames(retrievedGroupNames)
              })
              .catch((error) => {
                console.log(error)
              })


          });
        //////////////////////////////////////////////////////////



      } catch (error) {
        console.error(error);
      }
    }
    getTask();
    return function cleanup() {
      unsubscribe();
    };
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
  }

  useEffect(() => {
    var unsubscribe;
    async function getGroupUsers() {
      try {
        unsubscribe = onSnapshot(
          query(
            collectionGroup(db, 'GroupUsers'), where('userId', '==', uid)), (querySnapshot) => {
              getGroupUsersParents(querySnapshot.docs)
                .then((retrievedGroupNames) => {
                  setUserGroupNames(retrievedGroupNames)
                })
                .catch((error) => {
                  console.log(error)
                })

            });
      } catch (error) {
        console.error(error);
      }
    }
    getGroupUsers();
    return function cleanup() {
      unsubscribe();
    };
  }, [])


  const taskChanged = () => {
    const keys1 = Object.keys(task);
    const keys2 = Object.keys(origTask);
    if (keys1.length !== keys2.length) {
      return true;
    }
    for (let key of keys1) {
      if (task[key] !== origTask[key]) {
        return true;
      }
    }
    return false;
  }



  const SaveTask = async () => {

    if (!taskChanged()) {
      // console.log("!taskChanged()")
      return 0
    }

    // console.log("Saving task", uid, taskId)

    try {
      await setDoc(doc(db, "Tasks", taskId), task)
    } catch (error) {
      // const errorCode = error.code;
      const errorMessage = error.message;
      alert(errorMessage);
      return 1;
    }

    return 0;
  }
  // console.log("task", task)
  // console.log("origTask", origTask)
  // console.log("REFRESHED", Date())
  // console.log("userGroupNames", userGroupNames)
  // console.log("taskGroupNames", taskGroupNames)


  const confirmDelete = (groupId, groupName) => {
    Alert.alert("Remove task from group " + groupName,
      "Are you sure?",
      [{
        text: "Remove",
        onPress: () => deleteTaskGroup(groupId),

      },
      {
        text: "Cancel"
      }]
    )
    return
  }


  // delete a group membership
  const deleteTaskGroup = async (groupId) => {

    console.log("deleting task group", taskId, groupId)
    try {
      // await deleteDoc(doc(db, "Tasks", taskId, "TaskGroups", groupId));



      const querySnapshot = await getDocs(query(collection(db, "Tasks", taskId, "TaskGroups"), where('groupId', '==', groupId)));
      // console.log(typeof querySnapshot)
      querySnapshot.forEach((doc) => {
          // console.log("deleting docref", doc.ref)
          deleteDoc(doc.ref)
      })


    } catch (error) {
      console.error(error);
    }
  }


  return (
    <SafeAreaView style={[styles.safeView]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View>

            <Title
              title="Task Details"
              name={user.name}
              navigation={navigation} />

            <ScrollView style={{ height: "84%", marginBottom: 15 }}>

              <View style={styles.inputFormContainer}>
                <Text style={styles.inputLabel}>Created by {createdByUser}</Text>
                <Text style={styles.inputLabel}>Created on {new Date(task.createdDate).toString().slice(0, 24)}</Text>

                <Text style={[styles.inputLabel, { paddingTop: 15 }]}>Name</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={(newValue) => { setTask((prevState) => ({ ...prevState, name: newValue })) }}
                  value={task.name}
                  underlineColorAndroid='transparent'
                  autoCapitalize='none'
                />

                {/* <TextInput
                  readOnly={true}
                  style={styles.input}
                  // onChangeText={(newValue) => { setTask((prevState) => ({ ...prevState, creator: newValue })) }}
                  // value={task.creator}
                  value={createdByUser}
                  underlineColorAndroid='transparent'
                  autoCapitalize='none'
                /> */}

                <Text style={styles.inputLabel}>Notes</Text>
                <TextInput
                  style={[styles.input, {
                    height: 120,
                    textAlignVertical: "top" // android fix for centering it at the top-left corner 
                  }]}
                  multiline={true} // ios fix for centering it at the top-left corner 
                  onChangeText={(newValue) => { setTask((prevState) => ({ ...prevState, notes: newValue })) }}
                  value={task.notes}
                  underlineColorAndroid='transparent'
                  autoCapitalize='none'
                />

                <View style={{ flexDirection: "row" }}>

                  <View style={{ flexDirection: "column", flex: 1 }}>
                    <Text style={styles.inputLabel}>Start After</Text>
                    <Pressable
                      onPress={() => setStartDatePickerVisibility(true)}>
                      <Text style={styles.dateText}>
                        {formatDate(task.startDate)}
                      </Text>
                    </Pressable>
                  </View>

                  <View>
                    <TouchableOpacity title="Show Date Picker">
                      <DateTimePickerModal
                        isVisible={isStartDatePickerVisible}
                        mode="datetime"
                        date={new Date(task.startDate)}
                        maximumDate={new Date(task.endDate)}
                        onConfirm={handleStartDatePickerConfirm}
                        onCancel={() => setStartDatePickerVisibility(false)}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={{ flexDirection: "column", flex: 1 }}>
                    <Text style={styles.inputLabel}>Finish by</Text>
                    <Pressable
                      onPress={() => setEndDatePickerVisibility(true)}>
                      <Text style={styles.dateText}>
                        {formatDate(task.endDate)}
                      </Text>
                    </Pressable>
                  </View>

                  <View>
                    <TouchableOpacity title="Show Date Picker">
                      <DateTimePickerModal
                        isVisible={isEndDatePickerVisible}
                        mode="datetime"
                        date={new Date(task.endDate)}
                        minimumDate={new Date(task.startDate)}
                        onConfirm={handleEndDatePickerConfirm}
                        onCancel={() => setEndDatePickerVisibility(false)}
                      />
                    </TouchableOpacity>
                  </View>

                </View>

                <View style={{ flexDirection: "row" }}>
                  <View style={{ flexDirection: "column", flex: 1 }}>
                    <Text style={styles.inputLabel}>Priority</Text>
                    <InputSpinner
                      skin={"clean"}
                      height={48}
                      width={150}
                      style={[styles.input, {
                        borderRadius: 15,
                        shadowColor: "#e5e5e5"
                      }]}
                      shadow={false}
                      max={10}
                      min={0}
                      step={1}
                      // colorMax={"#f04048"}
                      // colorMin={"#40c5f4"}
                      value={task.priority?.toString()}
                      onChange={(newValue) => { setTask((prevState) => ({ ...prevState, priority: +newValue })) }}
                    />
                    {/* <TextInput
                      style={styles.input}
                      onChangeText={(newValue) => { setTask((prevState) => ({ ...prevState, priority: +newValue })) }}
                      value={task.priority?.toString()}
                      underlineColorAndroid='transparent'
                      autoCapitalize='none'
                      keyboardType="numeric"
                    /> */}
                  </View>

                  <View style={{ flexDirection: "column", flex: 1 }}>
                    <Text style={styles.inputLabel}>Effort</Text>
                    <InputSpinner
                      skin={"clean"}
                      height={48}
                      width={150}
                      style={[styles.input, {
                        borderRadius: 15,
                        shadowColor: "#e5e5e5"
                      }]}
                      shadow={false}
                      max={10080}
                      min={10}
                      step={5}
                      longStep={30}
                      speed={4}
                      // colorMax={"#f04048"}
                      // colorMin={"#40c5f4"}
                      value={task.effort?.toString()}
                      // value={formatEffort(task.effort)}
                      onChange={(newValue) => { setTask((prevState) => ({ ...prevState, effort: +newValue })) }}
                    />
                    {/* <TextInput
                      style={[styles.input]}
                      onChangeText={(newValue) => { setTask((prevState) => ({ ...prevState, effort: +newValue })) }}
                      value={task.effort?.toString()}
                      underlineColorAndroid='transparent'
                      autoCapitalize='none'
                      keyboardType="numeric"
                    /> */}
                  </View>
                </View>

                {/* <Text style={styles.inputLabel}>Group</Text>
                <TextInput
                  style={styles.input}
                  value={task.taskGroup}
                  underlineColorAndroid='transparent'
                  autoCapitalize='none'
                /> */}

                <Text style={styles.inputLabel}>Groups</Text>
                {/* <FlatList style={{ height: "5%", marginBottom: 15, marginLeft: "1%" }}
                  data={taskGroupNames}
                  ListEmptyComponent={<Text style={[styles.listText, { alignSelf: "center" }]}>
                    Task has no groups.
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
                    taskGroupNames.map((item) =>
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
                  <Pressable
                    onPress={() => alert("add group membership")}
                  >
                    <Text style={styles.groupText}>
                      +
                    </Text>
                  </Pressable>


                </View>

                <Text style={styles.inputLabel}>Resources</Text>
                <TextInput
                  style={styles.input}
                  value={task.taskResources}
                  underlineColorAndroid='transparent'
                  autoCapitalize='none'
                />

                <View style={{ alignItems: "center" }}>
                  <TouchableOpacity style={[styles.mainButton, { opacity: (!taskChanged()) ? 0.5 : 1.0 }]}
                    disabled={!taskChanged()}
                    onPress={async () => {
                      await SaveTask().then(
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
