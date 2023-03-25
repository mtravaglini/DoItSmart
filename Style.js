import {
  Appearance,
  StatusBar,
  StyleSheet,
  Platform
} from 'react-native';

const colorScheme = Appearance.getColorScheme();
// console.log("COLOR SCHEME", colorScheme)

const RoseCelesteScheme = {
  "RoseRed": "#c33c54",
  "IndigoDye": "#254e70",
  "Cerulean": "#37718e",
  "NonPhotoBlue": "#8ee3ef",
  "Celeste": "#aef3e7"
}

const RoseCelesteLight = {

  headerBackgroundColour: RoseCelesteScheme.NonPhotoBlue,
  headerColour: RoseCelesteScheme.Cerulean,

  mainScreenColour: RoseCelesteScheme.Celeste,
  secondaryScreenColour: RoseCelesteScheme.NonPhotoBlue,

  labelColour: RoseCelesteScheme.RoseRed,

  mainTextColour: RoseCelesteScheme.Cerulean,
  secondaryTextColour: RoseCelesteScheme.IndigoDye,

  inputTextColour: RoseCelesteScheme.Cerulean,
  textBackgroundColour: "white",

  listBackgroundColour: "lightgreen",
  listTextColour: "darkgreen",

  footerBackgroundColour: RoseCelesteScheme.Cerulean,
  footerColour: RoseCelesteScheme.Celeste,

  successColour: RoseCelesteScheme.Cerulean,
  warningColour: "#c46913",
  errorColour: RoseCelesteScheme.RoseRed
}

const RoseCelesteDark = {

  headerBackgroundColour: RoseCelesteScheme.Cerulean,
  headerColour: RoseCelesteScheme.NonPhotoBlue,

  mainScreenColour: RoseCelesteScheme.IndigoDye,
  secondaryScreenColour: RoseCelesteScheme.Cerulean,

  labelColour: RoseCelesteScheme.RoseRed,

  mainTextColour: RoseCelesteScheme.NonPhotoBlue,
  secondaryTextColour: RoseCelesteScheme.Celeste,

  inputTextColour: RoseCelesteScheme.IndigoDye,
  textBackgroundColour: RoseCelesteScheme.Celeste,

  listBackgroundColour: "lightgreen",
  listTextColour: "darkgreen",

  footerBackgroundColour: RoseCelesteScheme.Cerulean,
  footerColour: RoseCelesteScheme.NonPhotoBlue,

  successColour: RoseCelesteScheme.NonPhotoBlue,
  warningColour: "#c46913",
  errorColour: RoseCelesteScheme.RoseRed
}

var colourObj = {};

if (colorScheme == "dark") {

  colourObj = RoseCelesteDark


} else {

  colourObj = RoseCelesteLight

}

// console.log("COLOR OBJ", colourObj)



module.exports = StyleSheet.create({
  // most pages will have safeview and container at top level
  safeView: {
    flex: 1,
    backgroundColor: colourObj.mainScreenColour,
  },

  // main title screen text ########################################
  mainTitleContainer: {
    alignItems: 'center',
    paddingTop: "20%",
    paddingBottom: "20%",
    paddingLeft: "10%",
    paddingRight: "10%",
    backgroundColor: colourObj.secondaryScreenColour,
    marginTop: 0,
    marginBottom: "5%",
  },
  titleText: {
    fontSize: 35,
    fontWeight: "bold",
    color: colourObj.labelColour,
  },
  textLink: {
    paddingLeft: 10,
    fontWeight: "bold",
    fontSize: 20,
    color: colourObj.secondaryScreenColour,
  },

  // header ###########################
  header: {
    backgroundColor: colourObj.headerBackgroundColour,
  },

  // page title screen text ########################################
  pageTitleText: {
    // width: 'auto',
    fontSize: 25,
    fontWeight: "bold",
    color: colourObj.headerColour,
    marginTop: 5,
  },
  pageSubTitleText: {
    fontSize: 15,
    fontWeight: "bold",
    color: colourObj.headerColour,
    borderColor: colourObj.headerColour,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
    marginBottom: 10,
    alignSelf: "center"
  },
  headerIcon: {
    fontSize: 30,
    color: colourObj.headerColour,
  },
  headerIconText: {
    textAlign: 'right',
    fontSize: 11,
    marginLeft: "3%",
    marginRight: "5%",
    width: 70,
    color: colourObj.headerColour,
  },

  // standard buttons ########################################
  mainButton: {
    width: "75%",
    height: 50,
    borderRadius: 15,
    marginVertical: 10,
    backgroundColor: colourObj.secondaryScreenColour,
    justifyContent: "center",
    shadowColor: colourObj.mainScreenColour,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    textAlign: "center",
    textAlignVertical: "center",
    color: colourObj.mainScreenColour,
    fontWeight: "bold",
    fontSize: 20
  },
  secondaryButton: {
    width: "75%",
    height: 30,
    borderRadius: 15,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: colourObj.mainScreenColour,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colourObj.secondaryScreenColour,
    shadowColor: colourObj.mainScreenColour,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  secondaryButtonText: {
    textAlign: "center",
    textAlignVertical: "center",
    color: colourObj.headerColour,
    fontSize: 15,
  },
  menuButton: {
    width: "100%",
    alignItems: "flex-start",
    paddingLeft: "5%",
    height: 30,
    marginVertical: "3%",
    borderRadius: 5,
  },
  btnNarrow: {
    width: "25%",
    marginHorizontal: 5,
  },
  btnSuccess: {
    backgroundColor: colourObj.successColour,
    shadowColor: colourObj.successColour,
  },
  btnWarning: {
    backgroundColor: colourObj.warningColour,
    shadowColor: colourObj.warningColour,
  },
  btnDanger: {
    backgroundColor: colourObj.errorColour,
    shadowColor: colourObj.errorColour,
  },

  // input + button form ########################################
  inputBtnFormContainer: {
    flexDirection: 'row',
    marginHorizontal: "5%",
    marginVertical: "2%"
  },
  inputShort: {
    height: 48,
    width: "80%",
    borderRadius: 15,
    overflow: 'hidden',
    paddingLeft: 10,
    marginRight: "2%",
    fontSize: 18,
    backgroundColor: colourObj.textBackgroundColour,
    shadowColor: colourObj.mainScreenColour,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  inputButton: {
    height: 48,
    borderRadius: 15,
    width: "18%",
    alignItems: 'center',
    backgroundColor: colourObj.secondaryScreenColour,
    justifyContent: "center",
    shadowColor: colourObj.mainScreenColour,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,

  },

  // input + title form ########################################
  inputFormContainer: {
    flexDirection: 'column',
    marginLeft: 10,
    marginRight: 10,
  },
  textLabel: {
    paddingLeft: 10,
    fontWeight: "bold",
    color: colourObj.labelColour,
    fontSize: 15,
  },
  input: {
    height: 48,
    marginHorizontal: "1%",
    borderRadius: 15,
    overflow: 'hidden',
    paddingLeft: 10,
    marginLeft: 0,
    marginBottom: 15,
    fontSize: 18,
    fontWeight: "bold",
    color: colourObj.inputTextColour,
    backgroundColor: colourObj.textBackgroundColour,
    alignContent: "center",
    shadowColor: colourObj.mainScreenColour,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  // task list  ########################################
  listContainer: {
    backgroundColor: colourObj.listBackgroundColour,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftSwipeContainer: {
    justifyContent: "flex-start",
    flex: 1,
    backgroundColor: "green",
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightSwipeContainer: {
    justifyContent: "flex-end",
    flex: 1,
    backgroundColor: "red",
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
  },
  listDelIcon: {
    fontSize: 30,
    marginLeft: "3%",
    marginRight: "5%",
    color: colourObj.listTextColour,
  },
  listText: {
    fontWeight: "bold",
    fontSize: 18,
    color: colourObj.listTextColour,
    paddingLeft: "5%",
  },

  // Standard Text
  standardText: {
    fontWeight: "bold",
    fontSize: 18,
    color: colourObj.mainTextColour,
  },
  standardTextLight: {
    fontSize: 16,
    color: colourObj.mainTextColour,
  },
  secondaryText: {
    fontWeight: "bold",
    fontSize: 18,
    color: colourObj.secondaryTextColour,
  },
  txtSuccess: {
    color: colourObj.successColour,
  },
  txtWarning: {
    color: colourObj.warningColour,
  },
  txtError: {
    color: colourObj.errorColour,
  },

  // Date ###################################
  dateText: {
    height: 48,
    lineHeight: 48,
    width: "95%",
    borderRadius: 15,
    paddingLeft: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: colourObj.textBackgroundColour,
    shadowColor: colourObj.mainScreenColour,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  // Groups and Resource Tags ################################ 
  tagContainer: {
    backgroundColor: colourObj.textBackgroundColour,
    padding: "3%",
    borderRadius: 15,
    marginHorizontal: "1%",
    marginBottom: 15,
    alignItems: "flex-start",
    flexWrap: "wrap",
    flexDirection: "row"
  },
  tagText: {
    fontSize: 15,
    color: colourObj.listTextColour,
    backgroundColor: colourObj.listBackgroundColour,
    borderColor: colourObj.listTextColour,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
  },
  tagButton: {
    padding: 2,
  },

  // footer
  footer: {
    flexDirection: "row",
    justifyContent: 'space-evenly',
    backgroundColor: colourObj.footerBackgroundColour,
    paddingVertical: "1%"
  },
  footerIcon: {
    fontSize: 30,
    color: colourObj.footerColour,
    alignSelf: "center"
  },
  footerText: {
    color: colourObj.footerColour,
    alignSelf: "center"
  },

  // OTHER ########################################
  closeBox: {
    position: 'absolute',
    bottom: "2%",
    right: "2%",
    width: "40%",
    height: 40,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: 'center',
    marginTop: 100
  },
  closeText: {
    fontSize: 18,
    color: colourObj.mainTextColour,
    fontWeight: "bold",
  },
  modalView: {
    alignItems: 'center',
    marginHorizontal: "3%",
    marginTop: "20%",
    marginBottom: "60%",
    backgroundColor: colourObj.headerBackgroundColour,
    borderRadius: 15,
    borderColor: colourObj.secondaryScreenColour,
    borderWidth: 1,
    padding: 35,
    alignItems: 'center',
    shadowColor: colourObj.mainScreenColour,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalMenuView: {
    flex: 1,
    alignItems: 'flex-start',
    marginLeft: "35%",
    marginBottom: "60%",
    marginTop: "10%",
    backgroundColor: colourObj.headerBackgroundColour,
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
    borderColor: colourObj.secondaryScreenColour,
    borderWidth: 1,
    padding: 35,
    shadowColor: colourObj.mainScreenColour,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
