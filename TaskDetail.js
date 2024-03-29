import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  Switch,
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
import { doc, collection, query, getDoc, getDocs, setDoc, addDoc, deleteDoc, where } from "firebase/firestore";

import DateTimePickerModal from "react-native-modal-datetime-picker";
import InputSpinner from "react-native-input-spinner";

// use custom style sheet
const styles = require('./Style.js');
// import custom components
import { Title, Footer } from './Components.js'
// import required functions
import { completeTask, unCompleteTask, deleteTask, unDeleteTask, scheduleTasks, getAllGroupsForUser, getAllUsersForGroups } from './Functions.js'

export function TaskDetailScreen({ route, navigation }) {

  const insets = useSafeAreaInsets();
  const uid = route.params.uid;
  const taskId = route.params.taskId;

  const [user, setUser] = useState('');
  const [createdByUser, setCreatedByUser] = useState('');
  const [assigneeUser, setAssigneeUser] = useState('');
  const [origTask, setOrigTask] = useState({});
  const [task, setTask] = useState({});

  const [userGroupNames, setUserGroupNames] = useState([]);
  const [taskGroupNames, setTaskGroupNames] = useState([]);
  const [userResourceNames, setUserResourceNames] = useState([]);
  const [taskResourceNames, setTaskResourceNames] = useState([]);

  // date picker variables
  const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);
  // add task groups modal
  const [taskGroupPickerVisible, setTaskGroupPickerVisible] = useState(false);
  // add task resources modal
  const [taskResourcePickerVisible, setTaskResourcePickerVisible] = useState(false);
  // reassign task modal
  const [reassignVisible, setReassignVisible] = useState(false);
  // opacity
  const [backgroundOpacity, setBackgroundOpacity] = useState(1.0);
  // user pool - all the users from all the groups that current user belongs to
  const [userPool, setUserPool] = useState([]);
  const [isTaskDetailLoading, setIsTaskDetailLoading] = useState(true)

  const [triggerRefresh, setTriggerRefresh] = useState(0);

  const handleStartDatePickerConfirm = (date) => {
    setTask((prevState) => ({ ...prevState, startDate: Date.parse(date) }));
    if (Date.parse(date) + task.effort * 60000 > task.endDate) {
      // console.log("set end time")
      setTask((prevState) => ({ ...prevState, endDate: Date.parse(date) + task.effort * 60000 }));
    }
    setStartDatePickerVisibility(false);
    setBackgroundOpacity(1.0)
  }

  const handleEndDatePickerConfirm = (date) => {
    setTask((prevState) => ({ ...prevState, endDate: Date.parse(date) }));
    if (Date.parse(date) - task.effort * 60000 < task.startDate) {
      setTask((prevState) => ({ ...prevState, startDate: Date.parse(date) - task.effort * 60000 }));
    }
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

      /////////////////////// Promise Chaining //////////////////////

      await getUser()
      await getTask()

      var taskGroupsSnap = await getTaskGroupsByTask()
      var retrievedTaskGroupNames = await processTaskGroups(taskGroupsSnap)
      setTaskGroupNames(retrievedTaskGroupNames)

      var retrievedUserGroupNames = await getAllGroupsForUser(uid)

      var filterGroupsResult = await filterGroups(retrievedTaskGroupNames, retrievedUserGroupNames)
      setUserGroupNames(filterGroupsResult)

      // get info for reassigning tasks

      var retrievedUserNames = await getAllUsersForGroups(retrievedUserGroupNames)
      // setUserPool(userNameArray)
      setUserPool(retrievedUserNames)

      // get resource info
      var taskResourceSnaps = await getTaskResourcesByTask()
      var retrievedTaskResourceNames = await processTaskResources(taskResourceSnaps)
      setTaskResourceNames(retrievedTaskResourceNames)

      var retrievedUserResourceNames = []
      for (var group of retrievedUserGroupNames) {
        var groupResourcesSnaps = await getGroupResourcesByGroup(group)
        var retrievedUserResourceNamesX = await processGroupResources(groupResourcesSnaps)
        retrievedUserResourceNames = retrievedUserResourceNames.concat(retrievedUserResourceNamesX)
        // console.log("GROUP", group.name, retrievedUserResourceNamesX)
      }
      // remove duplicate resources ///////////////////////////////
      const map = new Map()
      for (const groupObj of retrievedUserResourceNames) {
        map.set(groupObj.id, groupObj)
      }
      retrievedUserResourceNames = []
      for (var x of map.values()) {
        retrievedUserResourceNames.push(x)
      }
      // console.log("retrievedUserResourceNames", retrievedUserResourceNames)

      var filterResourcesResult = await filterGroups(retrievedTaskResourceNames, retrievedUserResourceNames)
      setUserResourceNames(filterResourcesResult)
      // console.log("groupResources", filterResourcesResult)
    }

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

        // get user doc for the task assignee
        var docSnap3 = await getDoc(doc(db, "Users", docSnap.data().assignee));
        setAssigneeUser(docSnap3.data().name)

      } catch (error) {
        console.error(error);
      }
    }

    async function getTaskGroupsByTask() {
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
            "name": parentDoc.data()?.name,
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

    // get the resources assigned to this task
    async function getTaskResourcesByTask() {
      try {
        var querySnapshot = await getDocs(query(collection(db, "Tasks", taskId, "TaskResources")));
        return querySnapshot
      } catch (error) {
        console.error(error);
      }
    }

    async function processTaskResources(querySnapshot) {
      // console.log("processTaskGroups", querySnapshot.docs.length)
      try {
        var retrievedTaskResourceNames = await getTaskResourceParents(querySnapshot.docs)
        return retrievedTaskResourceNames
      } catch (error) {
        console.error(error);
      }
    }

    async function getTaskResourceParents(taskResourceSnaps) {
      try {
        return Promise.all(taskResourceSnaps.map(async (taskResource) => {

          const resourceId = taskResource.data().resourceId;
          const parentDoc = await getDoc(doc(db, "Resources", resourceId))

          return {
            "id": parentDoc?.id,
            "name": parentDoc.data()?.name,
          }
        }))
      } catch (error) {
        console.error(error);
      }
    }

    // get the resources available to assign to this task
    async function getGroupResourcesByGroup(group) {
      // console.log("Entered getGroupResourcesByGroup", group)
      try {
        // console.log("Get the all the group resources for", group.id)
        var resourcesSnap = await getDocs(query(collection(db, "Groups", group.id, "GroupResources")))
        return resourcesSnap
      } catch (error) {
        console.error(error);
      }
    }

    async function processGroupResources(querySnapshot) {
      // console.log("processTaskGroups", querySnapshot.docs.length)
      try {
        var retrievedGroupResourceNames = await getGroupResourceParents(querySnapshot.docs)
        return retrievedGroupResourceNames
      } catch (error) {
        console.error(error);
      }
    }

    async function getGroupResourceParents(groupResourcesSnap) {
      // console.log("enter getGroupResourceParents", groupResourcesSnap)

      try {
        return Promise.all(groupResourcesSnap.map(async (groupResource) => {
          // console.log(groupResource.data())
          const resourceId = groupResource.data().resourceId;
          const parentDoc = await getDoc(doc(db, "Resources", resourceId))

          return {
            "id": parentDoc?.id,
            "name": parentDoc.data()?.name,
          }
        }))
      } catch (error) {
        console.error(error);
      }
    }

    getTaskInfo();
    setIsTaskDetailLoading(false)

  }, [triggerRefresh])


  const reassignTask = async (userId, userName) => {

    var newTask = { ...task, assignee: userId, userList: [uid, userId] }
    setTask(newTask)
    // console.log("newTask", newTask)

    try {
      await setDoc(doc(db, "Tasks", taskId), newTask)
    } catch (error) {
      // const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorMessage);
      return 1;
    }

    setReassignVisible(false);
    setBackgroundOpacity(1.0);

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
      if (key != "userList" && task[key] !== origTask[key]) {
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

      // if any task scheduling items changed, reschedule the tasks
      if (
        task.startDate != origTask.startDate ||
        task.endDate != origTask.endDate ||
        task.assignee != origTask.assignee ||
        task.priority != origTask.priority ||
        task.effort != origTask.effort
      ) {
        scheduleTasks(uid)
      }

    } catch (error) {
      // const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorMessage);
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
      setTriggerRefresh(triggerRefresh + 1);
      setTaskGroupPickerVisible(false)
      setBackgroundOpacity(1.0)
      scheduleTasks(uid)
    } catch (error) {
      console.error(error);
    }


  }

  // confirm delete a group membership
  const confirmGroupDelete = (groupId, groupName) => {
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
      const querySnapshot = await getDocs(query(collection(db, "Tasks", taskId, "TaskGroups"), where('groupId', '==', groupId)));
      // console.log(typeof querySnapshot)
      querySnapshot.forEach((doc) => {
        // console.log("deleting docref", doc.ref)
        deleteDoc(doc.ref)
        setTriggerRefresh(triggerRefresh + 1);
      })
    } catch (error) {
      console.error(error);
    }
  }

  // add a resource 
  const addTaskResource = async (resourceId) => {

    var data = { resourceId: resourceId }
    try {
      addDoc(collection(db, "Tasks", taskId, "TaskResources"), data)
      setTriggerRefresh(triggerRefresh + 1);
      setTaskResourcePickerVisible(false)
      setBackgroundOpacity(1.0)
      scheduleTasks(uid)
    } catch (error) {
      console.error(error);
    }
  }

  // confirm delete a resource membership
  const confirmResourceDelete = (resourceId, resourceName) => {
    Alert.alert("Remove resource " + resourceName + " from group.",
      "Are you sure?",
      [{
        text: "Remove",
        onPress: () => deleteTaskResource(resourceId),

      },
      {
        text: "Cancel"
      }]
    )
    return
  }
  // delete a group membership
  const deleteTaskResource = async (resourceId) => {

    // console.log("deleting task group", taskId, groupId)
    try {
      const querySnapshot = await getDocs(query(collection(db, "Tasks", taskId, "TaskResources"), where('resourceId', '==', resourceId)));
      // console.log(typeof querySnapshot)
      querySnapshot.forEach((doc) => {
        // console.log("deleting docref", doc.ref)
        deleteDoc(doc.ref)
        setTriggerRefresh(triggerRefresh + 1);
      })
      scheduleTasks(uid)

    } catch (error) {
      console.error(error);
    }
  }

  // console.log("END contents of taskgroupnames", taskGroupNames.length)
  // console.log("END contents of usergroupnames", userGroupNames.length)

  // console.log("============================================= render")

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
        <View style={{ flex: 1 }}>

          <Title
            title="Task Details"
            name={user.name}
            navigation={navigation}
            enableBack={true} />

          {task.status == 'complete' ? (
            <View style={{ flexDirection: "row" }}>
              <Switch
                trackColor={{ false: 'grey', true: 'white' }}
                thumbColor={'lightgrey'}
                ios_backgroundColor="grey"
                onValueChange={() => {
                  unCompleteTask(task)
                  setTriggerRefresh(triggerRefresh + 1);
                }}
                value={false}
              />
              <Text style={[styles.standardText, styles.txtError, { paddingTop: 10, fontSize: 20 }]}>
                Re-Set to Active
              </Text>
            </View>
          ) : (null)}

          {task.status == 'deleted' ? (
            <View style={{ flexDirection: "row" }}>
              <Switch
                trackColor={{ false: 'grey', true: 'white' }}
                thumbColor={'lightgrey'}
                ios_backgroundColor="grey"
                onValueChange={() => {
                  unDeleteTask(task)
                  setTriggerRefresh(triggerRefresh + 1);
                }}
                value={false}
              />
              <Text style={[styles.standardText, styles.txtError, { paddingTop: 10, fontSize: 20 }]}>
                Un-Delete Task
              </Text>
            </View>
          ) : (null)}

          {task.assignee != uid ? (
            <View style={{ flexDirection: "row" }}>
              <Switch
                trackColor={{ false: 'grey', true: 'white' }}
                thumbColor={'lightgrey'}
                ios_backgroundColor="grey"
                onValueChange={() => {
                  reassignTask(uid, user.name)
                  setTriggerRefresh(triggerRefresh + 1);
                }}
                value={false}
              />
              <View style={{ flexDirection: "column" }}>
                <Text style={[styles.standardText, styles.txtError, { paddingTop: 10, fontSize: 20 }]}>
                  Assign Task Back to Me
                </Text>
                <Text style={[styles.standardTextLight]}>
                  Currently assigned to {assigneeUser}
                </Text>
              </View>
            </View>
          ) : (null)}

          {isTaskDetailLoading ?
            (
              <ActivityIndicator style={styles.standardText} size="large" />
            )
            :
            (
              <ScrollView style={{ opacity: (task.status == 'complete' || task.status == 'deleted' || task.assignee != uid ? .50 : backgroundOpacity) }}>

                <View style={styles.inputFormContainer}>



                  <View style={{ flexDirection: "row" }}>

                    {/* spacer */}
                    <View style={{ flex: 3 }}>
                    </View>

                    {/* delete task button */}
                    <TouchableOpacity style={[styles.mainButton, styles.btnDanger, styles.btnNarrow, { flex: 1 }]}
                      disabled={task.status == 'complete' || task.status == 'deleted' || task.assignee != uid ? (true) : (false)}
                      onPress={() => {
                        deleteTask(task)
                        navigation.goBack()
                      }}
                    >
                      <Text
                        style={[styles.buttonText]}
                      >
                        <FontAwesome
                          style={[styles.buttonText]}
                          name='trash-o'
                        />
                      </Text>
                    </TouchableOpacity>

                    {/* save task button */}
                    <TouchableOpacity style={[styles.mainButton, styles.btnSuccess, { flex: 2 }, { opacity: (!taskChanged()) ? 0.5 : 1.0 }]}
                      disabled={!taskChanged() || task.status == 'complete' || task.status == 'deleted' || task.assignee != uid ? (true) : (false)}
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
                      >
                        <FontAwesome5
                          style={[styles.buttonText]}
                          name='save'
                        /> Save
                      </Text>
                    </TouchableOpacity>

                  </View>

                  <View style={{ flexDirection: "row" }}>

                    {/* reassign button */}
                    <Pressable style={[styles.mainButton, styles.btnSuccess, { flex: 1 }]}
                      disabled={task.status == 'complete' || task.status == 'deleted' || task.assignee != uid ? (true) : (false)}
                      onPress={async () => {
                        setReassignVisible(true)
                        setBackgroundOpacity(.33)
                      }}
                    >
                      <Text style={styles.buttonText}>
                        <FontAwesome
                          style={[styles.buttonText]}
                          name='user'
                        /> Reassign
                      </Text>
                    </Pressable>

                    {/* comlete task button */}
                    <Pressable style={[styles.mainButton, styles.btnSuccess, { flex: 1 }]}
                      disabled={task.status == 'complete' || task.status == 'deleted' || task.assignee != uid ? (true) : (false)}
                      onPress={() => {
                        var taskObj = task;
                        taskObj.id = taskId;
                        completeTask(taskObj);
                        navigation.goBack();
                      }
                      }
                    >
                      <Text style={styles.buttonText}>
                        <FontAwesome
                          style={[styles.buttonText]}
                          name='check'
                        /> Complete
                      </Text>
                    </Pressable>

                  </View>

                  <View style={[styles.input, { height: null }]}>
                    <Text style={styles.standardTextLight}>Created by {createdByUser}</Text>
                    <Text style={styles.standardTextLight}>Created on {new Date(task.createdDate).toString().slice(0, 24)}</Text>
                    {task.status == 'complete' ? (
                      <Text style={styles.standardTextLight}>Completed on {new Date(task.completedDate).toString().slice(0, 24)}</Text>
                    ) : (null)}
                    {task.status == 'deleted' ? (
                      <Text style={styles.standardTextLight}>Deleted on {new Date(task.deletedDate).toString().slice(0, 24)}</Text>
                    ) : (null)}
                  </View>

                  <Text style={[styles.textLabel, { paddingTop: 15 }]}>Name</Text>

                  <TextInput
                    style={styles.input}
                    onChangeText={(newValue) => { setTask((prevState) => ({ ...prevState, name: newValue })) }}
                    value={task.name}
                    underlineColorAndroid='transparent'
                    autoCapitalize='none'
                    editable={task.status == 'complete' || task.status == 'deleted' || task.assignee != uid ? (false) : (true)}
                  />

                  <Text style={styles.textLabel}>Notes</Text>
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
                    editable={task.status == 'complete' || task.status == 'deleted' || task.assignee != uid ? (false) : (true)}
                  />

                  <View style={{ flexDirection: "row" }}>

                    <View style={{ flexDirection: "column", flex: 1 }}>
                      <Text style={styles.textLabel}>Start Anytime After</Text>
                      <Pressable
                        disabled={task.status == 'complete' || task.status == 'deleted' || task.assignee != uid ? (true) : (false)}
                        onPress={() => {
                          setStartDatePickerVisibility(true)
                          setBackgroundOpacity(0.33)
                        }}>
                        <Text style={[styles.input, styles.dateText]}>
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
                          // maximumDate={new Date(task.endDate)}
                          onConfirm={handleStartDatePickerConfirm}
                          onCancel={() => {
                            setStartDatePickerVisibility(false)
                            setBackgroundOpacity(1.0)
                          }}
                        />
                      </TouchableOpacity>
                    </View>

                    <View style={{ flexDirection: "column", flex: 1 }}>
                      <Text style={styles.textLabel}>Finish By</Text>
                      <Pressable
                        disabled={task.status == 'complete' || task.status == 'deleted' || task.assignee != uid ? (true) : (false)}
                        onPress={() => {
                          setEndDatePickerVisibility(true)
                          setBackgroundOpacity(0.33)
                        }}>
                        <Text style={[styles.input, styles.dateText]}>
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
                          // minimumDate={new Date(task.startDate)}
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
                      <Text style={styles.textLabel}>Priority</Text>
                      <InputSpinner
                        disabled={task.status == 'complete' || task.status == 'deleted' || task.assignee != uid ? (true) : (false)}
                        editable={task.status == 'complete' || task.status == 'deleted' || task.assignee != uid ? (false) : (true)}
                        skin={"clean"}
                        height={48}
                        width={140}
                        style={[styles.input,
                        {
                          borderRadius: 15,
                          marginBottom: 15
                        }]}
                        inputStyle={[
                          styles.input,
                          { marginBottom: 0 }
                        ]}
                        shadow={false}
                        max={10}
                        min={0}
                        step={1}
                        value={task.priority?.toString()}
                        onChange={(newValue) => { setTask((prevState) => ({ ...prevState, priority: +newValue })) }}
                      />
                    </View>

                    <View style={{ flexDirection: "column", flex: 1 }}>
                      <Text style={styles.textLabel}>Effort Minutes</Text>
                      <InputSpinner
                        disabled={task.status == 'complete' || task.status == 'deleted' || task.assignee != uid ? (true) : (false)}
                        editable={task.status == 'complete' || task.status == 'deleted' || task.assignee != uid ? (false) : (true)}
                        skin={"clean"}
                        height={48}
                        width={140}
                        style={[styles.input,
                        {
                          borderRadius: 15,
                          marginBottom: 15
                        }]}
                        inputStyle={[
                          styles.input,
                          { marginBottom: 0 }
                        ]}
                        shadow={false}
                        max={10080}
                        min={10}
                        step={5}
                        longStep={30}
                        speed={4}
                        value={task.effort?.toString()}
                        onChange={
                          (newValue) => {
                            setTask((prevState) => ({ ...prevState, effort: +newValue }))
                            // adjust end time if required
                            if (task.endDate - newValue * 60000 < task.startDate) {
                              setTask((prevState) => ({ ...prevState, endDate: task.startDate + newValue * 60000 }));
                            }
                          }

                        }
                      />
                    </View>
                  </View>

                  {/* Groups display */}
                  <Text style={styles.textLabel}>Groups</Text>
                  <View style={styles.tagContainer}>
                    {
                      taskGroupNames.map((item) =>
                        <Pressable key={item.id} style={styles.tagButton}
                          disabled={task.status == 'complete' || task.status == 'deleted' || task.assignee != uid ? (true) : (false)}
                          onPress={() => navigation.navigate('GroupDetail', { uid: uid, groupId: item.id })}
                          onLongPress={() => confirmGroupDelete(item.id, item.name)}
                        >
                          <Text style={styles.tagText}>
                            {item.name}
                          </Text>
                        </Pressable>
                      )
                    }
                    <Pressable style={styles.tagButton}
                      disabled={task.status == 'complete' || task.status == 'deleted' || task.assignee != uid ? (true) : (false)}
                      onPress={() => {
                        setTaskGroupPickerVisible(true)
                        setBackgroundOpacity(.33)
                      }}
                    >
                      <Text style={styles.tagText}>
                        +
                      </Text>
                    </Pressable>
                  </View>

                  {/* Resources display */}
                  <Text style={styles.textLabel}>Resources</Text>
                  <View style={styles.tagContainer}>
                    {
                      taskResourceNames.map((item) =>
                        <Pressable key={item.id} style={styles.tagButton}
                          disabled={task.status == 'complete' || task.status == 'deleted' || task.assignee != uid ? (true) : (false)}
                          onPress={() => navigation.navigate('ResourceDetail', { uid: uid, resourceId: item.id })}
                          onLongPress={() => confirmResourceDelete(item.id, item.name)}
                        >
                          <Text style={styles.tagText}>
                            {item.name}
                          </Text>
                        </Pressable>
                      )
                    }
                    <Pressable style={styles.tagButton}
                      disabled={task.status == 'complete' || task.status == 'deleted' || task.assignee != uid ? (true) : (false)}

                      onPress={() => {
                        setTaskResourcePickerVisible(true)
                        setBackgroundOpacity(.33)
                      }}
                    >
                      <Text style={styles.tagText}>
                        +
                      </Text>
                    </Pressable>
                  </View>
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
                    <Pressable style={{ alignSelf: "flex-start", position: "absolute", left: "3%", marginTop: "1%" }}
                      onPress={() => {
                        setReassignVisible(false)
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
                    <Text style={styles.pageTitleText}>Reassign Task</Text>

                    <Text style={[styles.textLabel, { paddingTop: 15, alignSelf: 'flex-start' }]}>Select User to reassign Task</Text>
                    {userPool.length > 1 ? (
                      <View style={styles.tagContainer}>

                        {
                          userPool.map((item) =>
                            (item.userId != uid) ? (
                              <Pressable key={item.userId} style={styles.tagButton}
                                onPress={() => {
                                  reassignTask(item.userId, item.userName)
                                  navigation.goBack();
                                }}
                              >
                                <Text style={styles.tagText}>
                                  {item.userName}
                                </Text>
                              </Pressable>
                            ) : (null)
                          )
                        }
                      </View>)
                      :
                      (<View style={styles.tagContainer}>
                        <Text style={[styles.standardText, styles.txtError]}>
                          No Users in your Groups!
                        </Text>
                      </View>)}
                  </View>
                </Modal>

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

                    <Pressable style={{ alignSelf: "flex-start", position: "absolute", left: "3%", marginTop: "1%" }}
                      onPress={() => {
                        setTaskGroupPickerVisible(false)
                        setBackgroundOpacity(1.0)
                      }}
                    >
                      <Text style={[styles.pageTitleText]}>
                        <FontAwesome
                          style={styles.headerIcon}
                          name='arrow-circle-o-left'
                        />
                      </Text>
                    </Pressable>

                    <Text style={styles.pageTitleText}>Add Task to Groups</Text>

                    <Text style={[styles.textLabel, { paddingTop: 15, alignSelf: 'flex-start' }]}>Groups</Text>
                    {userGroupNames.length > 0 ? (
                      <View style={styles.tagContainer}>

                        {
                          userGroupNames.map((item) =>
                            <Pressable key={item.id} style={styles.tagButton}
                              onPress={() => addTaskGroup(item.id)}
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

                {/* modal for selecting resources  */}
                <Modal
                  animationType="slide"
                  transparent={true}
                  visible={taskResourcePickerVisible}
                  onRequestClose={() => {
                    setTaskResourcePickerVisible(false)
                    setBackgroundOpacity(1.0)
                  }}>
                  <View style={styles.modalView}>

                    <Pressable style={{ alignSelf: "flex-start", position: "absolute", left: "3%", marginTop: "1%" }}
                      onPress={() => {
                        setTaskResourcePickerVisible(false)
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

                    <Text style={styles.pageTitleText}>Assign Resource to Task</Text>

                    <Text style={[styles.textLabel, { paddingTop: 15, alignSelf: 'flex-start' }]}>Resources</Text>
                    {userResourceNames.length > 0 ? (

                      <View style={styles.tagContainer}>

                        {
                          userResourceNames.map((item) =>
                            <Pressable key={item.id} style={styles.tagButton}
                              onPress={() => addTaskResource(item.id)}
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
                          No more Resources to add!
                        </Text>
                      </View>)}

                  </View>
                </Modal>

              </ScrollView>
            )}
          <Footer auth={auth}
            navigation={navigation}
            uid={uid} />

        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
