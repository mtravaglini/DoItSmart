import { doc, collection, collectionGroup, query, addDoc, getDoc, getDocs, setDoc, deleteDoc, onSnapshot, where, orderBy, DocumentReference } from "firebase/firestore";
import { db, auth } from './firebase.config';



export async function scheduleTasks(userId) {

  console.log("SCHEDULING TASK Entered Function")
  var retrievedUserGroupNames = await getAllGroupsForUser(userId)
  var retrievedUserNames = await getAllUsers(retrievedUserGroupNames)
  console.log("SCHEDULING TASK retrievedUserNames", retrievedUserNames)
  return;
}


// complete a task
export const completeTask = async (taskObj, index) => {
  // console.log(taskObj)
  // if (index) {
  // swipeableRef[index].close();
  // }

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
    // console.log(querySnapshot)
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



export const getAllGroupsForUser = async (userId) => {

  async function getGroupUsersByUser(userId) {
    try {
      var querySnapshot = await getDocs(query(collectionGroup(db, 'GroupUsers'), where('userId', '==', userId)));
      var retrievedUserGroupNames = await getGroupUsersParents(querySnapshot.docs)
      return retrievedUserGroupNames
      // return querySnapshot
    } catch (error) {
      console.error(error);
    }
  }

  // async function processUserGroups(querySnapshot) {
  //   try {
  //     var retrievedUserGroupNames = await getGroupUsersParents(querySnapshot.docs)
  //     return retrievedUserGroupNames
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

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

  // var userGroupsSnap = await getGroupUsersByUser(userId)
  // var retrievedUserGroupNames = await processUserGroups(userGroupsSnap)

  var retrievedUserGroupNames = await getGroupUsersByUser(userId)



  return retrievedUserGroupNames

}







export const getAllUsers = async (retrievedUserGroupNames, userId) => {

  // get all the users in each groupid 
  async function processGroups(retrievedUserGroupNames) {

    // use a set to just store unique values
    var retrievedUsers = new Set();

    for (var groupId of retrievedUserGroupNames) {
      var querySnapshot = await getDocs(query(collection(db, "Groups", groupId.id, "GroupUsers")));
      querySnapshot.forEach((doc) => {
          retrievedUsers.add(doc.data().userId)
      })
    }
    return retrievedUsers
  }

  // get user info for the userids retrieved above
  async function processUsers(retrievedUsers) {
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

  var retrievedUsers = await processGroups(retrievedUserGroupNames)
  var retrievedUserNames = await processUsers(retrievedUsers)
  return retrievedUserNames

}