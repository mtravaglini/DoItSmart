import { doc, collection, collectionGroup, query, addDoc, getDoc, getDocs, setDoc, deleteDoc, onSnapshot, where, orderBy, DocumentReference } from "firebase/firestore";
import { db, auth } from './firebase.config';

// complete a task
export const completeTask = async (taskObj) => {

  taskObj.status = 'complete'
  taskObj.completedDate = Math.floor(Date.now()) //serverTimestamp();

  try {
    await setDoc(doc(db, "Tasks", taskObj.id), taskObj)
  } catch (error) {
    // const errorCode = error.code;
    console.log(error.message);
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
    console.log(error.message);
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
  // console.log("SCHEDULING TASK retrievedUserGroupNames", retrievedUserGroupNames)
  var retrievedUserNames = await getAllUsersForGroups(retrievedUserGroupNames)
  // console.log("SCHEDULING TASK retrievedUserNames", retrievedUserNames)

  // get all tasks for the above groups 
  // - this will be all tasks for all users for which current user is a member  
  //   where the task is also assigned to one of the groups 
  // - also retrieves all the resources for all of these tasks
  var result = await getAllTasksForGroups(retrievedUserGroupNames)
  var retrievedTaskNames = result.retrievedTasks
  var retrievedResourceNames = result.retrievedResources
  console.log("SCHEDULING TASK retrievedTaskNames", retrievedTaskNames)
  console.log("SCHEDULING TASK retrievedResourceNames", retrievedResourceNames)

  // get all tasks for the above users 
  // - this will be all tasks for all users in all groups for which current user is a member 
  // - also retrieves all the resources for all of these tasks
  var result = await getAllTasksForUsers(retrievedUserNames)
  var retrievedAllTaskNames = result.retrievedTasks
  var retrievedAllResourceNames = result.retrievedResources
  console.log("SCHEDULING TASK retrievedAllTaskNames", retrievedAllTaskNames)
  console.log("SCHEDULING TASK retrievedAllResourceNames", retrievedAllResourceNames)

  // create array of user load
  var userLoad = calculateUserLoad(retrievedAllTaskNames)
  console.log("SCHEDULING TASK userLoad", userLoad)

  // check for task conflicts
  var taskConflicts = checkTaskConflicts(retrievedAllTaskNames, retrievedTaskNames)
  console.log("SCHEDULING TASK taskConflicts", taskConflicts)

  // check for resource conflicts
  var resourceConflicts = checkResourceConflicts(retrievedAllResourceNames, retrievedResourceNames)
  console.log("SCHEDULING TASK resourceConflicts", resourceConflicts)

  // resolve conflicts
  var resolved = resolveConflicts(taskConflicts, userLoad, retrievedAllTaskNames)
  console.log("RESOLVED>>>>>>>>>>>>>>>>>>>>>>", resolved)













  return;
}

export const getAllGroupsForUser = async (userId) => {
  try {
    var querySnapshot = await getDocs(query(collectionGroup(db, 'GroupUsers'), where('userId', '==', userId)));
    // var retrievedUserGroupNames = await getGroupUsersParents(querySnapshot.docs)
    var retrievedUserGroupNames = await Promise.all(querySnapshot.docs.map(async (groupUser) => {
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
  // use a set to store only unique values
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
  var retrievedResources = []

  // get all the tasks in each groupid 
  for (var group of retrievedUserGroupNames) {
    // console.log("Processing GROUP", group)
    var querySnapshot = await getDocs(query(collectionGroup(db, "TaskGroups"), where("groupId", "==", group.id)));

    var retrievedTaskNames = await Promise.all(querySnapshot.docs.map(async (taskGroup) => {
      const docRef = taskGroup.ref;
      const parentCollectionRef = docRef.parent; // CollectionReference
      const immediateParentDocumentRef = parentCollectionRef.parent; // DocumentReference
      const parentDoc = await getDoc(immediateParentDocumentRef)

      if (parentDoc.data().status != 'complete') {
        // console.log(parentDoc.data().assignee, parentDoc.data().name)
        var retrievedResourcesForTask = await getAllResourcesForTask(parentDoc)
        retrievedResources = retrievedResources.concat(retrievedResourcesForTask)

        return {
          // "keyCheck": parentDoc.data().assignee,
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
  return { retrievedTasks, retrievedResources }
}

export const getAllResourcesForTask = async (taskDoc) => {
  // get all the resources for the task
  var retrievedResources = [];

  // console.log("getAllResourcesForTask getting resources for task", taskDoc.id)
  var querySnapshot2 = await getDocs(query(collection(db, "Tasks", taskDoc.id, "TaskResources")));
  querySnapshot2.forEach((doc2) => {
    retrievedResources.push({
      // "keyCheck": doc2.data().resourceId,
      "resourceId": doc2.data().resourceId,
      "taskId": taskDoc.id,
      "startDate": taskDoc.data().startDate,
      "endDate": taskDoc.data().endDate,
      "assignee": taskDoc.data().assignee,
      "effort": taskDoc.data().effort,
      "priority": taskDoc.data().priority,
      "name": taskDoc.data().name
    })
  })
  return retrievedResources;
}

export const getAllTasksForUsers = async (retrievedUserNames) => {

  var retrievedTasks = []
  var retrievedResources = []

  // get all the tasks for each user 
  for (var user of retrievedUserNames) {


    var result = await getTasksForUser(user.id)
    retrievedTasks = retrievedTasks.concat(result.retrievedTasks)
    retrievedResources = retrievedResources.concat(result.retrievedResources)


  }
  return { retrievedTasks, retrievedResources }
}

export const getTasksForUser = async (userId) => {

  var retrievedTasks = []
  var retrievedResources = []


  var querySnapshot = await getDocs(query(collection(db, "Tasks"), where("assignee", "==", userId), where("status", "!=", 'complete')));
  querySnapshot.forEach(async (doc) => {
    retrievedTasks.push({
      // "keyCheck": doc.data().assignee,
      "taskId": doc.id,
      "name": doc.data().name,
      "assignee": doc.data().assignee,
      "startDate": doc.data().startDate,
      "endDate": doc.data().endDate,
      "priority": doc.data().priority,
      "effort": doc.data().effort
    })

    var retrievedResourcesForTask = await getAllResourcesForTask(doc)
    retrievedResources = retrievedResources.concat(retrievedResourcesForTask)

  })

  return { retrievedTasks, retrievedResources }
}


const calculateUserLoad = (retrievedAllTaskNames) => {

  // sort the array by assignee
  let sortedTasks = retrievedAllTaskNames.sort(
    (t1, t2) =>
      (t1.assignee < t2.assignee) ? -1 :
        (t1.assignee > t2.assignee) ? 1 :
          0
  );

  // console.log(sortedTasks)
  // create array of count of tasks and sum of effort per assignee
  var userLoad = []
  var prevAssignee = null
  var totalTasks = 0
  var totalEffort = 0

  for (const task of sortedTasks) {

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

// TODO : DUPLICATE THIS FOR checkResourcConflicts and add those tasks to taskConflicts[]
const checkTaskConflicts = (retrievedAllTaskNames, retrievedTaskNames) => {

  var taskConflicts = []

  // sort the All Tasks array by assignee, startDate, endDate
  let sortedTasks = retrievedAllTaskNames.sort(
    (t1, t2) =>
      (t1.assignee + t1.startDate + t1.endDate < t2.assignee + t2.startDate + t2.endDate) ? -1 :
        (t1.assignee + t1.startDate + t1.endDate > t2.assignee + t2.startDate + t2.endDate) ? 1 :
          0);

  var prevTask = {};
  prevTask.assignee = null;
  prevTask.startDate = 0;
  prevTask.endDate = 0;

  // var prevAssignee = null
  // var prevStartDate = 0;
  // var prevEndDate = 0;

  // console.log(sortedTasks)
  for (const task of sortedTasks) {
    // for (const task of sortedTasks) {

    console.log(task.assignee, printDate(task.startDate), printDate(task.endDate), task.name)
    // console.log(prevAssignee, prevEndDate)
    if (prevTask.assignee && prevTask.assignee != task.assignee) {
      prevTask = task
      continue
    }

    if (task.startDate < prevTask.endDate) {

      console.log("^^^^^^^ POTENTIAL CONFLICT")

      // user's task is in conflict with previous one, see if it's 
      // eligible for reassignment by checking if it's one of the
      // tasks in the users' groups
      var result = retrievedTaskNames.find(element => {
        return element.taskId === task.taskId
      })
      // task found, add it to conflicts array
      if (result != undefined) {
        console.log("^^^^^^^ CONFLICT 1")
        taskConflicts.push({ ...task, "selfAssign": false })
      } else {
        // not in the list of group tasks, 
        // so add it to the conflicts array with a flag indicating that
        // it can only be reassigned to the same user 
        console.log("^^^^ SELF ASSIGN TRUE")
        taskConflicts.push({ ...task, "selfAssign": true })
      }

      // also check the previous task, see if it's 
      // eligible for reassignment by checking if it's one of the
      // tasks in the users' groups
      var result = retrievedTaskNames.find(element => {
        return element.taskId === prevTask.taskId
      })
      // task found, add it to conflicts array
      if (result != undefined) {
        console.log("^^^^^^^ CONFLICT 2")
        taskConflicts.push({ ...prevTask, "selfAssign": false })
      } else {
        // not in the list of group tasks, 
        // so add it to the conflicts array with a flag indicating that
        // it can only be reassigned to the same user 
        console.log("^^^^ SELF ASSIGN TRUE")
        taskConflicts.push({ ...prevTask, "selfAssign": true })
      }
    }



    prevTask = task
  }


  return taskConflicts

}

const checkResourceConflicts = (retrievedAllResourceNames, retrievedResourceNames) => {

  var taskConflicts = []

  // sort the All Resources array by assignee, startDate, endDate
  let sortedTasks = retrievedAllResourceNames.sort(
    (t1, t2) =>
      (t1.resourceId + t1.startDate + t1.endDate < t2.assignee + t2.startDate + t2.endDate) ? -1 :
        (t1.resourceId + t1.startDate + t1.endDate > t2.assignee + t2.startDate + t2.endDate) ? 1 :
          0);

  var prevTask = {};
  prevTask.resourceId = null;
  prevTask.startDate = 0;
  prevTask.endDate = 0;

  // console.log(sortedTasks)
  for (const task of sortedTasks) {
    // for (const task of sortedTasks) {

    // console.log(task.assignee, printDate(task.startDate), printDate(task.endDate), task.name)
    // console.log(prevAssignee, prevEndDate)
    if (prevTask.resourceId && prevTask.resourceId != task.resourceId) {
      prevTask = task
      continue
    }

    if (task.startDate < prevTask.endDate) {

      // console.log("^^^^^^^ POTENTIAL CONFLICT")

      // // user's task is in conflict with previous one, see if it's 
      // // eligible for reassignment by checking if it's one of the
      // // tasks in the users' groups
      // var result = retrievedResourceNames.find(element => {
      //   return element.taskId === task.taskId
      // })
      // // task found, add it to conflicts array
      // if (result != undefined) {
      // console.log("^^^^^^^ CONFLICT")
      taskConflicts.push(task)
      // } else {
      //   // current task is not in the list of tasks, so check the previous one that is 
      //   // in conflict
      //   var result = retrievedResourceNames.find(element => {
      //     return element.taskId === prevTask.taskId
      //   })
      //   // task found, add it to conflicts array
      //   if (result != undefined) {
      //     // console.log("^^^^^^^ CONFLICT")
      //     taskConflicts.push(prevTask)
      //   }
      // }

    }

    prevTask = task

  }

  return taskConflicts

}


const resolveConflicts = (taskConflicts, userLoad, retrievedAllTaskNames) => {
  // console.log("RES CONFS entered")
  var resolved = false;

  // for each task to resolve a conflict
  for (var taskConflict of taskConflicts) {
    // for (var [index, taskConflict] of taskConflicts.entries()) {

    // console.log("RES CONF resolving", "taskConflict.startDate", "taskConflict.endDate", "taskConflict.effort")
    // console.log("RES CONF resolving", printDate(taskConflict.startDate), printDate(taskConflict.endDate), taskConflict.effort, taskConflict.name)

    // console.log("RES CONF all tasks", retrievedAllTaskNames)
    var checksExhausted = false;
    while (checksExhausted == false) {

      // check users with least load
      for (var user of userLoad) {

        if (resolved) { break }

        // console.log("RES CONF checking user", user.userId)
        // skip user load for current task assignee
        // if (user.userId == taskConflict.assignee) { continue }

        // var prevStartDate = 0;
        var prevEndDate = Date.now() + 24 * 60 * 60 * 1000;

        for (var allTask of retrievedAllTaskNames.filter(element => {
          return element.assignee === user.userId
        })) {

          if (resolved) { break }

          // console.log("RES CONF chk task gap", "allTask.startDate", "allTask.endDate", "prevEndDate")
          // console.log("RES CONF chk task gap", printDate(allTask.startDate), printDate(allTask.endDate), printDate(prevEndDate))

          if (allTask.taskId == taskConflict.taskId) { continue }

          if (
            allTask.startDate - prevEndDate >= taskConflict.effort * 60 * 1000
            &&
            taskConflict.endDate - taskConflict.effort * 60 * 1000 >= prevEndDate
            &&
            taskConflict.startDate + taskConflict.effort * 60 * 1000 <= allTask.startDate
            &&
            (taskConflict.selfAssign == false || taskConflict.assignee == allTask.assignee)) {
            // TODO : add logic to check availability of all taskConflict's resources here

            console.log("RESOLUTION set 1", taskConflict.name, "to user:", allTask.assignee, "start:", printDate(prevEndDate), "end:", printDate(prevEndDate + (taskConflict.endDate - taskConflict.startDate)))
            // console.log(taskConflict)
            autoReassignTask(taskConflict.taskId, allTask.assignee, prevEndDate, prevEndDate + (taskConflict.endDate - taskConflict.startDate))
            // remove resolved task from conflicts array
            // taskConflicts.splice(index)
            resolved = true;
            checksExhausted = true;
          }
          prevEndDate = allTask.endDate;
        }
        // check at end of alltasks for each user if the new task fits
        console.log("END OF USER", user.userId, "-- checking", printDate(prevEndDate), taskConflict.effort, printDate(taskConflict.endDate), taskConflict.name)
        if (prevEndDate + taskConflict.effort * 60 * 1000 <= taskConflict.endDate
          &&
          (taskConflict.selfAssign == false || taskConflict.assignee == allTask.assignee)) {
          // TODO : add logic to check availability of all taskConflict's resources here

          var newStartDate = Math.max(prevEndDate, taskConflict.startDate)
          console.log("RESOLUTION set 2", taskConflict.name, "to user:", allTask.assignee, "start:", printDate(newStartDate), "end:", printDate(newStartDate + (taskConflict.endDate - taskConflict.startDate)))
          // console.log(taskConflict)
          autoReassignTask(taskConflict.taskId, allTask.assignee, newStartDate, newStartDate + (taskConflict.endDate - taskConflict.startDate))
          // remove resolved task from conflicts array
          // taskConflicts.splice(index)
          resolved = true;
          checksExhausted = true;
        }
      }
      checksExhausted = true;
    }
  }
  return resolved;
}

const autoReassignTask = async (taskId, assignee, startDate, endDate) => {

  try {
    var taskDoc = await getDoc(doc(db, "Tasks", taskId))

    var data = { ...taskDoc.data(), "assignee": assignee, "startDate": startDate, "endDate": endDate }
    await setDoc(doc(db, "Tasks", taskId), data)

  } catch (error) {
    console.log(error.message)
  }
}


const printDate = (d) => {
  return "(" + new Date(d).toString().slice(0, 24) + ")"
}