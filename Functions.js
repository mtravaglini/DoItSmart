import { doc, collection, collectionGroup, query, addDoc, getDoc, getDocs, setDoc, deleteDoc, onSnapshot, where, orderBy, DocumentReference } from "firebase/firestore";
import { db, auth } from './firebase.config';

// complete a task
export const completeTask = async (taskObj, index) => {

  taskObj.status = 'complete'
  taskObj.completedDate = Math.floor(Date.now()) //serverTimestamp();

  try {
    await setDoc(doc(db, "Tasks", taskObj.id), taskObj)
  } catch (error) {
    // const errorCode = error.code;
    const errorMessage = error.message;
    console.log(errorMessage);
    return 1;
  }

}
// delete a task
export const deleteTask = async (taskId) => {
  try {

    var querySnapshot;

    // delete the tasks's TaskGroups subcollection
    querySnapshot = await getDocs(collection(db, "Tasks", taskId, "TaskGroups"))
    querySnapshot.forEach((doc) => {
      deleteDoc(doc.ref)
    })

    // delete the task's TaskResources subcollection
    querySnapshot = await getDocs(collection(db, "Tasks", taskId, "TaskResources"))
    querySnapshot.forEach((doc) => {
      deleteDoc(doc.ref)
    })

    // delete Tasks doc
    await deleteDoc(doc(db, "Tasks", taskId));
  } catch (error) {
    alert(error);
  }
}

// delete a group
export const deleteGroup = async (groupId) => {
  try {
    var querySnapshot;

    // delete the group's GroupUsers subcollection
    querySnapshot = await getDocs(collection(db, "Groups", groupId, "GroupUsers"))
    querySnapshot.forEach((doc) => {
      deleteDoc(doc.ref)
    })

    // delete the group's GroupResources subcollection
    querySnapshot = await getDocs(collection(db, "Groups", groupId, "GroupResources"))
    querySnapshot.forEach((doc) => {
      deleteDoc(doc.ref)
    })

    // // delete any outstanding invitations to the group
    querySnapshot = await getDocs(query(collection(db, "GroupInvites"), where("groupId", "==", groupId)))
    querySnapshot.forEach((doc) => {
      deleteDoc(doc.ref)
    })

    // delete the Group doc
    await deleteDoc(doc(db, "Groups", groupId));
  } catch (error) {
    console.log(error);
  }
}


// delete a resource
export const deleteResource = async (resourceId) => {
  try {
    await deleteDoc(doc(db, "Resources", resourceId));
  } catch (error) {
    alert(error);
  }
}

export async function scheduleTasks(userId) {

  console.log("SCHEDULING TASK Entered Function")
  var retrievedUserGroupNames = await getAllGroupsForUser(userId)
  var retrievedUserNames = await getAllUsersForGroups(retrievedUserGroupNames)
  var retreivedTaskNames = await getAllTasksForGroups(retrievedUserGroupNames)
  var result = await getAllTasksForUsers(retrievedUserNames)
  var retreivedAllTaskNames = result.retrievedTasks
  var retreivedAllResourceNames = result.retrievedResources
  console.log("SCHEDULING TASK retrievedUserNames", retrievedUserNames)
  console.log("SCHEDULING TASK retreivedTaskNames", retreivedTaskNames)
  console.log("SCHEDULING TASK retreivedAllTaskNames", retreivedAllTaskNames)
  console.log("SCHEDULING TASK retreivedAllResourceNames", retreivedAllResourceNames)


  return;
}

export const getAllGroupsForUser = async (userId) => {
  try {
    var querySnapshot = await getDocs(query(collectionGroup(db, 'GroupUsers'), where('userId', '==', userId)));
    // var retrievedUserGroupNames = await getGroupUsersParents(querySnapshot.docs)
    retrievedUserGroupNames = await Promise.all(querySnapshot.docs.map(async (groupUser) => {
      const docRef = groupUser.ref;
      const parentCollectionRef = docRef.parent; // CollectionReference
      const immediateParentDocumentRef = parentCollectionRef.parent; // DocumentReference
      const parentDoc = await getDoc(immediateParentDocumentRef)

      return {
        "id": parentDoc.id,
        "name": parentDoc.data().name,
      }
    }))


    return retrievedUserGroupNames
    // return querySnapshot
  } catch (error) {
    console.error(error);
  }
}


export const getAllUsersForGroups = async (retrievedUserGroupNames, userId) => {
  // use a set to just store unique values
  var retrievedUsers = new Set();

  // get all the users in each groupid 
  for (var groupId of retrievedUserGroupNames) {
    var querySnapshot = await getDocs(query(collection(db, "Groups", groupId.id, "GroupUsers")));
    querySnapshot.forEach((doc) => {
      retrievedUsers.add(doc.data().userId)
    })
  }
  // return retrievedUsers
  var retrievedUserNames = []
  for (var userId of retrievedUsers) {
    const userDoc = await getDoc(doc(db, "Users", userId));
    var data = {
      id: userId,
      userName: userDoc.data().name
    }
    retrievedUserNames.push(data)
  }
  return retrievedUserNames
}


export const getAllTasksForGroups = async (retrievedUserGroupNames, userId) => {

  var retrievedTasks = []

  // get all the tasks in each groupid 
  for (var group of retrievedUserGroupNames) {
    var querySnapshot = await getDocs(query(collectionGroup(db, "TaskGroups"), where("groupId", "==", group.id)));

    var retrievedTaskNames = await Promise.all(querySnapshot.docs.map(async (taskGroup) => {
      const docRef = taskGroup.ref;
      const parentCollectionRef = docRef.parent; // CollectionReference
      const immediateParentDocumentRef = parentCollectionRef.parent; // DocumentReference
      const parentDoc = await getDoc(immediateParentDocumentRef)

      return {
        "taskId": parentDoc.id,
        "assignee": parentDoc.data().assignee,
        "startDate": parentDoc.data().startDate,
        "endDate": parentDoc.data().endDate,
        "priority": parentDoc.data().priority,
        "effort": parentDoc.data().effort
      }
    }))

    retrievedTasks = retrievedTasks.concat(retrievedTaskNames)
  }
  return retrievedTasks
}


export const getAllTasksForUsers = async (retrievedUserNames) => {

  var retrievedTasks = []
  var retrievedResources = []

  // get all the tasks for each user 
  for (var user of retrievedUserNames) {
    var querySnapshot = await getDocs(query(collection(db, "Tasks"), where("assignee", "==", user.id)));
    querySnapshot.forEach(async (doc) => {
      retrievedTasks.push({
        "taskId": doc.id,
        "assignee": doc.data().assignee,
        "startDate": doc.data().startDate,
        "endDate": doc.data().endDate,
        "priority": doc.data().priority,
        "effort": doc.data().effort
      })

      // GET ALL THE RESOURCES FOR THE TASKS HERE
      // console.log("getting resources for task", doc.id)
      var querySnapshot2 = await getDocs(query(collection(db, "Tasks", doc.id, "TaskResources")));
      querySnapshot2.forEach((doc2) => {
        retrievedResources.push({
          "resourceId": doc2.data().resourceId,
          "tasikId": doc.id,
          "startDate": doc.data().startDate,
          "endDate": doc.data().endDate,
        })
      })
    })
  }
  return {retrievedTasks, retrievedResources}
}