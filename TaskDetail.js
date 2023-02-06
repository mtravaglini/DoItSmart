import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
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
import { signOut } from "firebase/auth";
import { doc, collection, collectionGroup, query, getDoc, getDocs, setDoc, addDoc, deleteDoc, onSnapshot, where, orderBy } from "firebase/firestore";
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
  const [taskGroupUpdated, setTaskGroupUpdated] = useState(0);
  // date picker variables
  const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);
  // add task groups modal
  const [taskGroupPickerVisible, setTaskGroupPickerVisible] = useState(false);
  // reassign task modal
  const [reassignVisible, setReassignVisible] = useState(false);
  // opacity
  const [backgroundOpacity, setBackgroundOpacity] = useState(1.0);
  // user pool - all the users from all the groups that current user belongs to
  const [userPool, setUserPool] = useState([]);
  const [isTaskDetailLoading, setIsTaskDetailLoading] = useState(true)


  const handleStartDatePickerConfirm = (date) => {
    setTask((prevState) => ({ ...prevState, startDate: Date.parse(date) }));
    setStartDatePickerVisibility(false);
    setBackgroundOpacity(1.0)
  }

  const handleEndDatePickerConfirm = (date) => {
    setTask((prevState) => ({ ...prevState, endDate: Date.parse(date) }));
    setEndDatePickerVisibility(false);
    setBackgroundOpacity(1.0)
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

  // get task and related info
  useEffect(() => {

    async function getTaskInfo() {

      var userSnap = await getUser()
      var taskSnap = await getTask()

      // Promise Chaining
      var taskGroupsSnap = await getTaskGroups()
      var retrievedTaskGroupNames = await processTaskGroups(taskGroupsSnap)
      setTaskGroupNames(retrievedTaskGroupNames)

      var userGroupsSnap = await getUserGroups(retrievedTaskGroupNames)
      var retrievedUserGroupNames = await processUserGroups(userGroupsSnap)

      var filterGroupsResult = await filterGroups(retrievedTaskGroupNames, retrievedUserGroupNames)
      setUserGroupNames(filterGroupsResult)

      // get info for reassigning tasks
      var userArray = await processGroups(retrievedUserGroupNames)
      var userNameArray = await processUsers(userArray)

      async function getUser() {
        try {
          const docSnap = await getDoc(doc(db, "Users", uid));
          setUser(docSnap.data());
          return docSnap;
        } catch (error) {
          console.error(error);
        }
      }

      async function getTask() {
        try {
          // get the task doc
          var docSnap = await getDoc(doc(db, "Tasks", taskId));
          setOrigTask(docSnap.data());
          setTask(docSnap.data());

          // get user doc for the task creator
          var docSnap2 = await getDoc(doc(db, "Users", docSnap.data().creator));
          setCreatedByUser(docSnap2.data().name + " (" + docSnap2.data().email + ")")
        } catch (error) {
          console.error(error);
        }
      }

      async function getTaskGroups() {
        // console.log("getTaskGroups")
        // unsubscribe = onSnapshot(
        // get groups subcollection for the task
        try {
          var querySnapshot = await getDocs(query(collection(db, "Tasks", taskId, "TaskGroups")));
          return querySnapshot
          // console.log("reached gettaskgroups2")
          // console.log("Setting task groups", retrievedTaskGroupNames)
        } catch (error) {
          console.error(error);
        }
      }

      async function processTaskGroups(querySnapshot) {
        // console.log("processTaskGroups", querySnapshot.docs.length)
        try {
          var retrievedTaskGroupNames = await getTaskGroupParents(querySnapshot.docs)
          return retrievedTaskGroupNames
        } catch (error) {
          console.error(error);
        }
      }



      async function getTaskGroupParents(taskGroupSnaps) {
        try {
          return Promise.all(taskGroupSnaps.map(async (taskGroup) => {

            const groupId = taskGroup.data().groupId;
            const parentDoc = await getDoc(doc(db, "Groups", groupId))

            return {
              "id": parentDoc?.id,
              "name": parentDoc?.data().name,
            }
          }))
        } catch (error) {
          console.error(error);
        }
      }

      async function getUserGroups(savedTaskGroups) {
        try {
          var querySnapshot = await getDocs(query(collectionGroup(db, 'GroupUsers'), where('userId', '==', uid)));
          return querySnapshot
        } catch (error) {
          console.error(error);
        }
      }

      async function processUserGroups(querySnapshot) {
        try {
          var retrievedUserGroupNames = await getGroupUsersParents(querySnapshot.docs)
          return retrievedUserGroupNames
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
              "name": parentDoc?.data().name,
            }
          }))
        } catch (error) {
          console.error(error);
        }
      }

      async function filterGroups(savedTaskGroups, savedUserGroups) {
        // check if task is already in a group, if so don't need to save it

        const newUserGroupNames = [];

        for (var userGroup of savedUserGroups) {
          var alreadyInGroup = false;
          for (var taskGroup of savedTaskGroups) {
            // console.log("checking", taskGroup.name)
            if (userGroup.id == taskGroup.id) {
              // console.log("Task is in group", taskGroup.name)
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

    // get all the users in each groupid 
    async function processGroups(groupArray) {
      // console.log("processGroups", groupArray)
      // use a set to just store unique values
      var userArray = new Set();

      for (var groupId of groupArray) {
        // console.log("Getting users for group", groupId)
        querySnapshot = await getDocs(query(collection(db, "Groups", groupId.id, "GroupUsers")));
        querySnapshot.forEach((doc) => {
          // console.log("xxxxx",groupId, doc.data().userId, uid)
          if (doc.data().userId !== uid) {
            userArray.add(doc.data().userId)
          }
        })
      }
      // console.log(userArray)
      return userArray
    }

    // get user info for the userids retrieved above
    async function processUsers(userArray) {
      // console.log("processUsers", userArray)

      var userNameArray = []

      for (var userId of userArray) {
        // const querySnapshot = await getDocs(query(collection(db, "Users"), where("userId", "==", userId)));
        const userDoc = await getDoc(doc(db, "Users", userId));
        var data = {
          id: userId,
          userName: userDoc.data().name
        }

        userNameArray.push(data)

      }

      // console.log(userNameArray)
      setUserPool(userNameArray)
      return userNameArray
    }

    getTaskInfo();
    // for (var x = 0; x<1000000000; x++){var i=x}

    setIsTaskDetailLoading(false)

  }, [taskGroupUpdated])


  const reassignTask = async (userId, userName) => {
    // add logic to reassign task to selected user
    console.log("reassign task", taskId, "to user", userId)

    var newTask = { ...task, assignee: userId }
    setTask(newTask)
    console.log("newTask", newTask)

    try {
      await setDoc(doc(db, "Tasks", taskId), newTask)
    } catch (error) {
      // const errorCode = error.code;
      const errorMessage = error.message;
      alert(errorMessage);
      return 1;
    }


    setReassignVisible(false);
    setBackgroundOpacity(1.0);
    navigation.goBack();


    Alert.alert("Task Reassigned", "Task has been reassigned to " + userName,
      [
        {
          text: "Ok"
        }])



  }



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




  // add a group membership
  const addTaskGroup = async (groupId) => {
    // console.log("adding task group", taskId, groupId)

    var data = { groupId: groupId }
    try {
      addDoc(collection(db, "Tasks", taskId, "TaskGroups"), data)
      setTaskGroupUpdated(taskGroupUpdated + 1);
      setTaskGroupPickerVisible(false)
      setBackgroundOpacity(1.0)
    } catch (error) {
      console.error(error);
    }


  }

  // confirm delete a group membership
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

    // console.log("deleting task group", taskId, groupId)
    try {
      // await deleteDoc(doc(db, "Tasks", taskId, "TaskGroups", groupId));



      const querySnapshot = await getDocs(query(collection(db, "Tasks", taskId, "TaskGroups"), where('groupId', '==', groupId)));
      // console.log(typeof querySnapshot)
      querySnapshot.forEach((doc) => {
        // console.log("deleting docref", doc.ref)
        deleteDoc(doc.ref)
        setTaskGroupUpdated(taskGroupUpdated + 1);
      })


    } catch (error) {
      console.error(error);
    }
  }


  // console.log("END contents of taskgroupnames", taskGroupNames.length)
  // console.log("END contents of usergroupnames", userGroupNames.length)

  // console.log("============================================= render")

  return (
    <SafeAreaView style={[styles.safeView, { flex: 1, opacity: backgroundOpacity }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* <TouchableWithoutFeedback style={{flex: 1}} onPress={Keyboard.dismiss}> */}
        <View style={{ flex: 1 }}>

          <Title
            title="Task Details"
            name={user.name}
            navigation={navigation} />

          {isTaskDetailLoading ?
            (
              <ActivityIndicator size="large" color="cornflowerblue" />
            )
            :
            (
              <ScrollView style={{ height: "81%", marginBottom: 15 }}>

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
                      paddingTop: 10,
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
                        onPress={() => {
                          setStartDatePickerVisibility(true)
                          setBackgroundOpacity(0.33)
                        }}>
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
                          onCancel={() => {
                            setStartDatePickerVisibility(false)
                            setBackgroundOpacity(1.0)
                          }}
                        />
                      </TouchableOpacity>
                    </View>

                    <View style={{ flexDirection: "column", flex: 1 }}>
                      <Text style={styles.inputLabel}>Finish by</Text>
                      <Pressable
                        onPress={() => {
                          setEndDatePickerVisibility(true)
                          setBackgroundOpacity(0.33)
                        }}>
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
                          onCancel={() => {
                            setEndDatePickerVisibility(false)
                            setBackgroundOpacity(1.0)
                          }}
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
                          shadowColor: "cornflowerblue"
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
                          shadowColor: "cornflowerblue"
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
                      <Text style={styles.groupResourceText}>
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
                          <Text style={styles.groupResourceText}>
                            {item.name}
                          </Text>
                        </Pressable>
                      )
                    }
                    <Pressable
                      onPress={() => {
                        setTaskGroupPickerVisible(true)
                        setBackgroundOpacity(.33)
                      }}
                    >
                      <Text style={styles.groupResourceText}>
                        +
                      </Text>
                    </Pressable>



                    {/* {
                    userGroupNames.map((item) =>
                      <Pressable key={item.id}
                        onPress={() => addTaskGroup(item.id)}
                      >
                        <Text style={styles.groupResourceText}>
                          {item.name}
                        </Text>
                      </Pressable>
                    )
                  } */}





                  </View>


                  {/* modal for selecting groups  */}
                  <Modal
                    animationType="slide"
                    transparent={true}
                    visible={taskGroupPickerVisible}
                    onRequestClose={() => {
                      setTaskGroupPickerVisible(false)
                      setBackgroundOpacity(1.0)
                    }}>
                    <View style={styles.modalView}>
                      <Text style={styles.pageTitleText}>Add Task to Groups</Text>

                      <Text style={[styles.inputLabel, { paddingTop: 15, alignSelf: 'flex-start' }]}>Groups</Text>

                      <View style={{ marginBottom: 15, alignItems: "flex-start", flexWrap: "wrap", flexDirection: "row" }}>

                        {
                          userGroupNames.map((item) =>
                            <Pressable key={item.id}
                              onPress={() => addTaskGroup(item.id)}
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
                          setTaskGroupPickerVisible(false)
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










                  <Text style={styles.inputLabel}>Resources</Text>
                  <TextInput
                    style={styles.input}
                    value={task.taskResources}
                    underlineColorAndroid='transparent'
                    autoCapitalize='none'
                  />



                  <View style={{ alignItems: "center" }}>
                    <Pressable style={[styles.secondaryButton]}
                      onPress={async () => {
                        // await getUserPool()
                        // console.log("USERPOOL at invoke reassign", userPool)
                        setReassignVisible(true)
                        setBackgroundOpacity(.33)
                      }}
                    >
                      <Text style={styles.secondaryButtonText}>
                        Reassign Task
                      </Text>
                    </Pressable>
                  </View>
                  {/* modal for reassigning task  */}
                  <Modal
                    animationType="slide"
                    transparent={true}
                    visible={reassignVisible}
                    onRequestClose={() => {
                      setReassignVisible(false)
                      setBackgroundOpacity(1.0)
                    }}>
                    <View style={styles.modalView}>
                      <Text style={styles.pageTitleText}>Reassign Task</Text>

                      <Text style={[styles.inputLabel, { paddingTop: 15, alignSelf: 'flex-start' }]}>Select user to reassign task</Text>



                      <View style={{ marginBottom: 15, alignItems: "flex-start", flexWrap: "wrap", flexDirection: "row" }}>

                        {
                          userPool.map((item) =>
                            <Pressable key={item.id}
                              onPress={() => {
                                reassignTask(item.id, item.userName)
                              }}
                            >
                              <Text style={styles.groupResourceText}>
                                {item.userName}
                              </Text>
                            </Pressable>
                          )
                        }
                      </View>


                      <Pressable
                        style={[styles.mainButton, styles.btnWarning, styles.btnNarrow]}
                        onPress={() => {
                          setReassignVisible(false)
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
                    <TouchableOpacity style={[styles.mainButton, styles.btnSuccess, { opacity: (!taskChanged()) ? 0.5 : 1.0 }]}
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
                        style={[styles.buttonText]}
                      >Save
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            )}
          <Footer auth={auth}
            navigation={navigation}
            uid={uid} />

        </View>
        {/* </TouchableWithoutFeedback> */}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
