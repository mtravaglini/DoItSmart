import { PreventRemoveContext } from "@react-navigation/native";
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

  console.log("SCHEDULING TASK Entered Function **************************************")

  // get all users in all groups for which current user is a member
  var retrievedUserGroupNames = await getAllGroupsForUser(userId)
  var retrievedUserNames = await getAllUsersForGroups(retrievedUserGroupNames)
  // console.log("SCHEDULING TASK retrievedUserNames", retrievedUserNames)

  // get all tasks for the above groups 
  // - this will be all tasks for all groups for which current user is a member 
  var retrievedTaskNames = await getAllTasksForGroups(retrievedUserGroupNames)
  // console.log("SCHEDULING TASK retrievedTaskNames", retrievedTaskNames)

  // get all tasks for the above users 
  // - this will be all tasks for all users in all groups for which current user is a member 
  // - also retrieves all the resources for all of these tasks
  var result = await getAllTasksForUsers(retrievedUserNames)
  var retrievedAllTaskNames = result.retrievedTasks
  var retrievedAllResourceNames = result.retrievedResources
  // console.log("SCHEDULING TASK retrievedAllTaskNames", retrievedAllTaskNames)
  // console.log("SCHEDULING TASK retrievedAllResourceNames", retrievedAllResourceNames)

  // create array of user load
  var userLoad = createUserLoad(retrievedAllTaskNames)
  // console.log("SCHEDULING TASK userLoad", userLoad)

  // check for task conflicts
  var taskConflicts = checkTaskConflicts(retrievedAllTaskNames, retrievedTaskNames)

  // resolve conflicts
  resolveConflicts(taskConflicts, userLoad, retrievedAllTaskNames)














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

      if (parentDoc.data().status != 'complete') {
        return {
          "taskId": parentDoc.id,
          "name": parentDoc.data().name,
          "assignee": parentDoc.data().assignee,
          "startDate": parentDoc.data().startDate,
          "endDate": parentDoc.data().endDate,
          "priority": parentDoc.data().priority,
          "effort": parentDoc.data().effort
        }
      } else {
        return {}
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
    var querySnapshot = await getDocs(query(collection(db, "Tasks"), where("assignee", "==", user.id), where("status", "!=", 'complete')));
    querySnapshot.forEach(async (doc) => {
      retrievedTasks.push({
        "taskId": doc.id,
        "name": doc.data().name,
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
          "taskId": doc.id,
          "startDate": doc.data().startDate,
          "endDate": doc.data().endDate,
        })
      })
    })
  }
  return { retrievedTasks, retrievedResources }
}


const createUserLoad = (retrievedAllTaskNames) => {

  // sort the array by assignee
  let sortedTasks = retrievedAllTaskNames.sort(
    (t1, t2) =>
      (t1.assignee < t2.assignee) ? -1 :
        (t1.assignee > t2.assignee) ? 1 :
          0
  );

  // create array of count of tasks and sum of effort per assignee
  var userLoad = []
  var prevAssignee = null
  var totalTasks = 0
  var totalEffort = 0

  for (const task of sortedTasks) {

    // console.log(task.assignee, task.effort)

    if (prevAssignee && task.assignee != prevAssignee) {
      userLoad.push({ "userId": prevAssignee, totalTasks, totalEffort })
      totalTasks = 0
      totalEffort = 0

    }

    totalTasks++
    totalEffort += task.effort

    prevAssignee = task.assignee
  }
  userLoad.push({ "userId": prevAssignee, totalTasks, totalEffort })

  // sort the resulting userLoad by load

  // console.log(userLoad)
  let sortedUserLoad = userLoad.sort(
    (u1, u2) =>
      (u1.totalEffort < u2.totalEffort) ? -1 :
        (u1.totalEffort > u2.totalEffort) ? 1 :
          0
  );
  return sortedUserLoad
}

const checkTaskConflicts = (retrievedAllTaskNames, retrievedTaskNames) => {

  var taskConflicts = []

  // sort the All Tasks array by assignee, startDate, endDate
  let sortedTasks = retrievedAllTaskNames.sort(
    (t1, t2) =>
      (t1.assignee + t1.startDate + t1.endDate < t2.assignee + t2.startDate + t2.endDate) ? -1 :
        (t1.assignee + t1.startDate + t1.endDate > t2.assignee + t2.startDate + t2.endDate) ? 1 :
          0);

  var prevAssignee = null
  var prevStartDate = 0;
  var prevEndDate = 0;

  for (const task of sortedTasks) {

    // console.log(task.assignee, task.startDate, task.endDate, task.taskId)

    if (prevAssignee && prevAssignee != task.assignee) {
      prevAssignee = task.assignee
      prevStartDate = task.startDate
      prevEndDate = task.endDate
      continue
    }

    if (task.startDate < prevEndDate) {

      // console.log("^^^^^^^ POTENTIAL CONFLICT")

      var result = retrievedTaskNames.find(element => {
        return element.taskId === task.taskId
      })
      if (result != undefined) {
        // console.log("^^^^^^^ CONFLICT")
        taskConflicts.push(task)
      }


    }

    prevAssignee = task.assignee
    prevStartDate = task.startDate
    prevEndDate = task.endDate

  }

  return taskConflicts

}


const resolveConflicts = (taskConflicts, userLoad, retrievedAllTaskNames) => {
  // console.log("RESOLVING CONFLICTS")

  // for each task to resolve a conflict
  for (var taskConflict of taskConflicts) {

    // console.log("RESOLVING CONFLICT for", taskConflict)
    // console.log("RESOLVING CONFLICT all tasks", retrievedAllTaskNames)
    var checksExhausted = false;
    while (checksExhausted == false) {

      // check users with least load
      for (var user of userLoad) {

        // console.log("RESOLVING CONFLICT checking user", user)
        // skip user load for current task assignee
        // if (user.userId == taskConflict.assignee) { continue }

        // var prevStartDate = 0;
        var prevEndDate = Date.now() + 24 * 60 * 60 * 1000;
        // console.log("prevEndDate", prevEndDate)

        for (var allTask of retrievedAllTaskNames.filter(element => {
          return element.assignee === user.userId
        })) {
          // console.log("RESOLVING CONFLICT checking task gaps", allTask.startDate, allTask.endDate, taskConflict.startDate, taskConflict.endDate, taskConflict.effort)

          if (
            allTask.startDate - prevEndDate >= taskConflict.effort * 60 * 1000
            &&
            taskConflict.endDate - taskConflict.effort * 60 * 1000 >= prevEndDate
            &&
            taskConflict.startDate + taskConflict.effort * 60 * 1000 <= allTask.startDate
          ) {
            console.log("RESOLUTION set", taskConflict.name, "to user:", allTask.assignee, "start:", new Date(prevEndDate).toString().slice(0, 24), "end:", new Date(allTask.startDate).toString().slice(0, 24))
            // console.log(taskConflict)
            autoReassignTask(taskConflict.taskId, allTask.assignee, prevEndDate, prevEndDate + (taskConflict.endDate - taskConflict.startDate))
            checksExhausted = true;
          }
        }
      }
      checksExhausted = true;
    }
  }
}

const autoReassignTask = async (taskId, assignee, startDate, endDate) => {

  // console.log("updating database", typeof startDate, typeof endDate)
  try {
    taskDoc = await getDoc(doc(db, "Tasks", taskId))

    data = { ...taskDoc.data(), "assignee": assignee, "startDate": startDate, "endDate": endDate }
    await setDoc(doc(db, "Tasks", taskId), data)

  } catch (error) {
    console.log(error.message)
  }
}